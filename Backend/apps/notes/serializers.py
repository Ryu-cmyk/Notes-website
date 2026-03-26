from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Program, Semester, Subject,
    Note, PastYearPaper, PastYearPaperFile, PastYearPaperSolutionFile
)

User = get_user_model()



class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)




class NoteListSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    semester_number = serializers.IntegerField(source='subject.semester.number', read_only=True)
    program_code = serializers.CharField(source='subject.semester.program.code', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'file_type', 'file_size',
            'file_size_display', 'file_url', 'download_count',
            'subject', 'subject_name', 'subject_code',
            'semester_number', 'program_code',
            'uploaded_by_name', 'created_at', 'updated_at'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class NoteDetailSerializer(serializers.ModelSerializer):
    subject_info = serializers.SerializerMethodField()
    semester_info = serializers.SerializerMethodField()
    program_info = serializers.SerializerMethodField()
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'subject', 'subject_info', 'semester_info', 'program_info',
            'title', 'description', 'file', 'file_url', 'download_url',
            'file_type', 'file_size', 'file_size_display',
            'uploaded_by', 'download_count', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'download_count', 'file_size', 'file_type']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/notes/{obj.id}/download/')
        return None

    def get_subject_info(self, obj):
        return {'id': obj.subject.id, 'name': obj.subject.name, 'code': obj.subject.code}

    def get_semester_info(self, obj):
        return {
            'id': obj.subject.semester.id,
            'number': obj.subject.semester.number,
            'name': obj.subject.semester.name
        }

    def get_program_info(self, obj):
        program = obj.subject.semester.program
        return {'id': program.id, 'name': program.name, 'code': program.code}



class PastYearPaperFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PastYearPaperFile
        fields = [
            'id', 'paper', 'page_number', 'file', 'file_url',
            'file_size', 'file_size_display', 'download_url',
            'created_at'
        ]
        read_only_fields = ['file_size']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_size_display(self, obj):
        if not obj.file_size:
            return "0 B"
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/past-year-paper-files/{obj.id}/download/')
        return None


class PastYearPaperSolutionFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PastYearPaperSolutionFile
        fields = [
            'id', 'paper', 'page_number', 'file', 'file_url',
            'file_size', 'file_size_display', 'download_url',
            'created_at'
        ]
        read_only_fields = ['file_size']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_size_display(self, obj):
        if not obj.file_size:
            return "0 B"
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/past-year-paper-solutions/{obj.id}/download/')
        return None
class PastYearPaperListSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    semester_number = serializers.IntegerField(source='subject.semester.number', read_only=True)
    program_code = serializers.CharField(source='subject.semester.program.code', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    pages_count = serializers.IntegerField(read_only=True)
    paper_files = PastYearPaperFileSerializer(many=True, read_only=True)
    solution_files = PastYearPaperSolutionFileSerializer(many=True, read_only=True)

    class Meta:
        model = PastYearPaper
        fields = [
            'id', 'title', 'description', 'year', 'file_type',
            'file_size', 'file_size_display', 'download_count',
            'has_solution', 'pages_count',
            'paper_files', 'solution_files',
            'subject', 'subject_name', 'subject_code',
            'semester_number', 'program_code',
            'uploaded_by_name', 'created_at', 'updated_at'
        ]

class PastYearPaperDetailSerializer(serializers.ModelSerializer):
    subject_info = serializers.SerializerMethodField()
    semester_info = serializers.SerializerMethodField()
    program_info = serializers.SerializerMethodField()
    uploaded_by = UserSerializer(read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    download_url = serializers.SerializerMethodField()

    # Nested files
    paper_files = PastYearPaperFileSerializer(many=True, read_only=True)
    solution_files = PastYearPaperSolutionFileSerializer(many=True, read_only=True)
    pages_count = serializers.IntegerField(read_only=True)
    solution_pages_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = PastYearPaper
        fields = [
            'id', 'subject', 'subject_info', 'semester_info', 'program_info',
            'title', 'description', 'year',
            'file', 'file_type', 'file_size', 'file_size_display',
            'download_url', 'download_count',
            'has_solution', 'pages_count', 'solution_pages_count',
            'paper_files', 'solution_files',
            'uploaded_by', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'download_count', 'file_size', 'file_type', 'has_solution']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/past-year-papers/{obj.id}/download/')
        return None

    def get_subject_info(self, obj):
        return {'id': obj.subject.id, 'name': obj.subject.name, 'code': obj.subject.code}

    def get_semester_info(self, obj):
        return {
            'id': obj.subject.semester.id,
            'number': obj.subject.semester.number,
            'name': obj.subject.semester.name
        }

    def get_program_info(self, obj):
        program = obj.subject.semester.program
        return {'id': program.id, 'name': program.name, 'code': program.code}




class SubjectListSerializer(serializers.ModelSerializer):
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)
    program_code = serializers.CharField(source='semester.program.code', read_only=True)
    notes_count = serializers.IntegerField(read_only=True)
    past_year_papers_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code', 'description',
            'semester', 'semester_name', 'semester_number', 'program_code',
            'notes_count', 'past_year_papers_count',
            'is_active', 'created_at', 'updated_at'
        ]


class SubjectDetailSerializer(serializers.ModelSerializer):
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)
    program_code = serializers.CharField(source='semester.program.code', read_only=True)
    notes_count = serializers.IntegerField(source = 'total_notes',read_only=True)
    past_year_papers_count = serializers.IntegerField(source = 'total_past_year_papers',read_only=True)
    notes = NoteListSerializer(many=True, read_only=True)
    past_year_papers = PastYearPaperListSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = [
            'id', 'semester', 'semester_name', 'semester_number', 'program_code',
            'name', 'code', 'description',
            'notes_count', 'past_year_papers_count',
            'notes', 'past_year_papers',
            'is_active', 'created_at', 'updated_at'
        ]




class SemesterListSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    subjects_count = serializers.IntegerField(source='total_subjects',read_only=True)
    notes_count = serializers.IntegerField(source = 'total_notes',read_only=True)

    class Meta:
        model = Semester
        fields = [
            'id', 'name', 'number', 'description',
            'program', 'program_name', 'program_code',
            'subjects_count', 'notes_count',
            'is_active', 'created_at', 'updated_at'
        ]


class SemesterDetailSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    subjects = SubjectListSerializer(many=True, read_only=True)
    subjects_count = serializers.IntegerField(read_only=True)
    notes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Semester
        fields = [
            'id', 'name', 'number', 'description',
            'program', 'program_name', 'program_code',
            'subjects_count', 'notes_count', 'subjects',
            'is_active', 'created_at', 'updated_at'
        ]



class ProgramListSerializer(serializers.ModelSerializer):
    semesters_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'description',
            'semesters_count', 'is_active',
            'created_at', 'updated_at'
        ]


class ProgramDetailSerializer(serializers.ModelSerializer):
    semesters = SemesterListSerializer(many=True, read_only=True)
    semesters_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'description',
            'semesters_count', 'semesters',
            'is_active', 'created_at', 'updated_at'
        ]