from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.contrib.admin.sites import NotRegistered
from .models import (
    Program, Semester, Subject,
    Note, PastYearPaper, PastYearPaperFile, PastYearPaperSolutionFile
)


PROTECTED_EMAIL = 'ryu@example.com'


class ProtectedUserAdmin(UserAdmin):

    def has_delete_permission(self, request, obj=None):
        if obj is not None and obj.email == PROTECTED_EMAIL:
            return False
        if obj is not None and obj.is_superuser:
            return request.user.is_superuser
        return super().has_delete_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        if obj is not None and obj.email == PROTECTED_EMAIL:
            return request.user.email == PROTECTED_EMAIL
        return super().has_change_permission(request, obj)

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            original = actions['delete_selected']

            def safe_delete(modeladmin, req, queryset):
                queryset = queryset.exclude(email=PROTECTED_EMAIL)
                return original[0](modeladmin, req, queryset)

            safe_delete.short_description = original[1]
            actions['delete_selected'] = (safe_delete, original[1], original[2])
        return actions


try:
    admin.site.unregister(User)
except NotRegistered:
    pass
admin.site.register(User, ProtectedUserAdmin)


class StaffFullAccessMixin:

    def has_module_perms(self, request):
        return request.user.is_active and (request.user.is_staff or request.user.is_superuser)

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and (request.user.is_staff or request.user.is_superuser)

    def has_add_permission(self, request):
        return request.user.is_active and (request.user.is_staff or request.user.is_superuser)

    def has_change_permission(self, request, obj=None):
        return request.user.is_active and (request.user.is_staff or request.user.is_superuser)

    def has_delete_permission(self, request, obj=None):
        return request.user.is_active and (request.user.is_staff or request.user.is_superuser)


@admin.register(Program)
class ProgramAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['code', 'name', 'semesters_count', 'subjects_count', 'notes_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['name']

    def semesters_count(self, obj):
        return obj.semesters.filter(is_active=True).count()
    semesters_count.short_description = 'Semesters'

    def subjects_count(self, obj):
        return Subject.objects.filter(semester__program=obj, is_active=True).count()
    subjects_count.short_description = 'Subjects'

    def notes_count(self, obj):
        return Note.objects.filter(subject__semester__program=obj, is_active=True).count()
    notes_count.short_description = 'Notes'


@admin.register(Semester)
class SemesterAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['number', 'name', 'program', 'subjects_count', 'notes_count', 'is_active', 'created_at']
    list_filter = ['program', 'is_active', 'created_at']
    search_fields = ['name', 'number', 'description', 'program__name', 'program__code']
    ordering = ['program__name', 'number']

    def subjects_count(self, obj):
        return obj.subjects.filter(is_active=True).count()
    subjects_count.short_description = 'Subjects'

    def notes_count(self, obj):
        return Note.objects.filter(subject__semester=obj, is_active=True).count()
    notes_count.short_description = 'Notes'


@admin.register(Subject)
class SubjectAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['code', 'name', 'semester', 'program', 'notes_count', 'past_year_papers_count', 'is_active', 'created_at']
    list_filter = ['semester__program', 'semester', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['semester__program__name', 'semester__number', 'name']

    def program(self, obj):
        return obj.semester.program
    program.short_description = 'Program'

    def notes_count(self, obj):
        return obj.notes.filter(is_active=True).count()
    notes_count.short_description = 'Notes'

    def past_year_papers_count(self, obj):
        return obj.past_year_papers.filter(is_active=True).count()
    past_year_papers_count.short_description = 'Past Papers'


@admin.register(Note)
class NoteAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['title', 'subject', 'file_type', 'file_size_display', 'download_count', 'uploaded_by', 'is_active', 'created_at']
    list_filter = ['subject__semester__program', 'subject__semester', 'subject', 'file_type', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    readonly_fields = ['download_count', 'file_size', 'file_type', 'created_at', 'updated_at', 'file_preview']
    ordering = ['-created_at']

    fieldsets = (
        ('Basic Information', {'fields': ('title', 'description', 'subject')}),
        ('File Information', {'fields': ('file', 'file_preview', 'file_type', 'file_size')}),
        ('Metadata', {'fields': ('uploaded_by', 'download_count', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def file_size_display(self, obj):
        return obj.get_file_size_display()
    file_size_display.short_description = 'File Size'

    def file_preview(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Download File</a>', obj.file.url)
        return "No file"
    file_preview.short_description = 'File Preview'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


class PastYearPaperFileInline(admin.TabularInline):
    model = PastYearPaperFile
    extra = 1
    fields = ['page_number', 'file', 'file_size']
    readonly_fields = ['file_size']
    ordering = ['page_number']


class PastYearPaperSolutionFileInline(admin.TabularInline):
    model = PastYearPaperSolutionFile
    extra = 1
    fields = ['page_number', 'file', 'file_size']
    readonly_fields = ['file_size']
    ordering = ['page_number']


@admin.register(PastYearPaper)
class PastYearPaperAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = [
        'title', 'subject', 'year', 'pages_count',
        'has_solution', 'solution_pages_count',
        'download_count', 'uploaded_by', 'is_active', 'created_at'
    ]
    list_filter = ['subject__semester__program', 'subject__semester', 'subject', 'year', 'has_solution', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    readonly_fields = ['download_count', 'file_size', 'file_type', 'has_solution', 'created_at', 'updated_at', 'file_preview']
    ordering = ['-year', '-created_at']
    inlines = [PastYearPaperFileInline, PastYearPaperSolutionFileInline]

    fieldsets = (
        ('Basic Information', {'fields': ('title', 'description', 'subject', 'year')}),
        ('Single File Upload', {
            'fields': ('file', 'file_preview', 'file_type', 'file_size'),
            'description': 'For multiple pages use the Page Files section below.'
        }),
        ('Solution', {'fields': ('has_solution',)}),
        ('Metadata', {'fields': ('uploaded_by', 'download_count', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def pages_count(self, obj):
        return obj.paper_files.count()
    pages_count.short_description = 'Pages'

    def solution_pages_count(self, obj):
        return obj.solution_files.count()
    solution_pages_count.short_description = 'Solution Pages'

    def file_preview(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Download File</a>', obj.file.url)
        return "No file"
    file_preview.short_description = 'File Preview'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(PastYearPaperFile)
class PastYearPaperFileAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['paper', 'page_number', 'file_size_display', 'created_at']
    list_filter = ['paper__subject__semester__program', 'paper__subject__semester', 'created_at']
    search_fields = ['paper__title', 'paper__subject__name']
    ordering = ['paper', 'page_number']
    readonly_fields = ['file_size']

    def file_size_display(self, obj):
        if not obj.file_size:
            return "0 B"
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    file_size_display.short_description = 'File Size'


@admin.register(PastYearPaperSolutionFile)
class PastYearPaperSolutionFileAdmin(StaffFullAccessMixin, admin.ModelAdmin):
    list_display = ['paper', 'page_number', 'file_size_display', 'created_at']
    list_filter = ['paper__subject__semester__program', 'paper__subject__semester', 'created_at']
    search_fields = ['paper__title', 'paper__subject__name']
    ordering = ['paper', 'page_number']
    readonly_fields = ['file_size']

    def file_size_display(self, obj):
        if not obj.file_size:
            return "0 B"
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    file_size_display.short_description = 'File Size'