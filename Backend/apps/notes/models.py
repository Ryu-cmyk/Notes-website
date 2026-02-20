from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings
import os


ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'jpg', 'jpeg','png']


class TimeStampedModel(models.Model):
    """Abstract base model with timestamp fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Program(TimeStampedModel):
    """Program model - top level of the hierarchy"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Program'
        verbose_name_plural = 'Programs'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def semesters_count(self):
        return self.semesters.filter(is_active=True).count()

    @property
    def subjects_count(self):
        return Subject.objects.filter(
            semester__program=self,
            is_active=True
        ).count()

    @property
    def notes_count(self):
        return Note.objects.filter(
            subject__semester__program=self,
            is_active=True
        ).count()

    @property
    def past_year_papers_count(self):
        return PastYearPaper.objects.filter(
            subject__semester__program=self,
            is_active=True
        ).count()


class Semester(TimeStampedModel):
    """Semester model"""
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='semesters'
    )
    name = models.CharField(max_length=100)
    number = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['number']
        verbose_name = 'Semester'
        verbose_name_plural = 'Semesters'
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'number'],
                name='unique_semester_per_program'
            )
        ]
        indexes = [
            models.Index(fields=['program', 'number']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.program.code} - Semester {self.number} - {self.name}"

    @property
    def subjects_count(self):
        return self.subjects.filter(is_active=True).count()

    @property
    def notes_count(self):
        return Note.objects.filter(
            subject__semester=self,
            is_active=True
        ).count()

    @property
    def past_year_papers_count(self):
        return PastYearPaper.objects.filter(
            subject__semester=self,
            is_active=True
        ).count()


class Subject(TimeStampedModel):
    """Subject model"""
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name='subjects'
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'
        indexes = [
            models.Index(fields=['semester', 'is_active']),
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def notes_count(self):
        return self.notes.filter(is_active=True).count()

    @property
    def past_year_papers_count(self):
        return self.past_year_papers.filter(is_active=True).count()


class FileBaseModel(TimeStampedModel):
    """Abstract base model shared by Note and PastYearPaper"""
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('ppt', 'Presentation'),
        ('image', 'Image'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    file_type = models.CharField(
        max_length=10,
        choices=FILE_TYPE_CHOICES,
        default='other'
    )
    file_size = models.BigIntegerField(
        help_text="File size in bytes",
        blank=True,
        null=True
    )
    download_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True

    def _detect_file_type(self, filename):
        ext = os.path.splitext(filename)[1].lower()
        if ext == '.pdf':
            return 'pdf'
        elif ext in ['.doc', '.docx']:
            return 'doc'
        elif ext in ['.ppt', '.pptx']:
            return 'ppt'
        elif ext in ['.jpg', '.jpeg','.png']:
            return 'image'
        return 'other'

    def get_file_size_display(self):
        """Return human-readable file size"""
        if not self.file_size:
            return "0 B"
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def increment_download_count(self):
        """Increment download count atomically"""
        self.__class__.objects.filter(pk=self.pk).update(
            download_count=models.F('download_count') + 1
        )


class Note(FileBaseModel):
    """Note model"""
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_notes'
    )
    file = models.FileField(
        upload_to='notes/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_EXTENSIONS)]
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['subject', '-created_at']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = self._detect_file_type(self.file.name)
        super().save(*args, **kwargs)


class PastYearPaper(FileBaseModel):
    """
    Past Year Question Paper model.
    A single paper can have multiple files (pages) via PastYearPaperFile.
    Solution files are also supported as multiple files via PastYearPaperSolutionFile.
    """
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='past_year_papers'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_past_year_papers'
    )

    year = models.PositiveIntegerField(
        help_text="Year the exam was held (e.g. 2022)"
    )
    has_solution = models.BooleanField(default=False)

    # file field is not used here since files are stored in PastYearPaperFile
    # but we keep it from FileBaseModel as null for compatibility
    file = models.FileField(
        upload_to='past_year_papers/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_EXTENSIONS)],
        blank=True,
        null=True,
        help_text="Single file upload (use PastYearPaperFile for multiple pages)"
    )

    class Meta:
        ordering = ['-year', '-created_at']
        verbose_name = 'Past Year Paper'
        verbose_name_plural = 'Past Year Papers'
        constraints = [
            models.UniqueConstraint(
                fields=['subject', 'year'],
                name='unique_paper_per_subject_per_year'
            )
        ]
        indexes = [
            models.Index(fields=['subject', '-year']),
            models.Index(fields=['year']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.subject.code} - {self.year} Paper"

    @property
    def pages_count(self):
        return self.paper_files.count()

    @property
    def solution_pages_count(self):
        return self.solution_files.count()

    def save(self, *args, **kwargs):
        # Auto set has_solution if solution files exist
        if self.pk and self.solution_files.exists():
            self.has_solution = True
        super().save(*args, **kwargs)


class PastYearPaperFile(TimeStampedModel):
    """
    Individual file/page for a Past Year Paper.
    Allows uploading multiple files (e.g. scanned jpg pages) per paper.
    """
    paper = models.ForeignKey(
        PastYearPaper,
        on_delete=models.CASCADE,
        related_name='paper_files'
    )
    file = models.FileField(
        upload_to='past_year_papers/pages/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_EXTENSIONS)]
    )
    page_number = models.PositiveIntegerField(
        help_text="Order/page number of this file"
    )
    file_size = models.BigIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['page_number']
        verbose_name = 'Past Year Paper File'
        verbose_name_plural = 'Past Year Paper Files'
        constraints = [
            models.UniqueConstraint(
                fields=['paper', 'page_number'],
                name='unique_page_number_per_paper'
            )
        ]

    def __str__(self):
        return f"{self.paper} - Page {self.page_number}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class PastYearPaperSolutionFile(TimeStampedModel):
    """
    Individual solution file/page for a Past Year Paper.
    Allows uploading multiple solution files per paper.
    """
    paper = models.ForeignKey(
        PastYearPaper,
        on_delete=models.CASCADE,
        related_name='solution_files'
    )
    file = models.FileField(
        upload_to='past_year_papers/solutions/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_EXTENSIONS)]
    )
    page_number = models.PositiveIntegerField(
        help_text="Order/page number of this solution file"
    )
    file_size = models.BigIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['page_number']
        verbose_name = 'Past Year Paper Solution File'
        verbose_name_plural = 'Past Year Paper Solution Files'
        constraints = [
            models.UniqueConstraint(
                fields=['paper', 'page_number'],
                name='unique_solution_page_number_per_paper'
            )
        ]

    def __str__(self):
        return f"{self.paper} - Solution Page {self.page_number}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)