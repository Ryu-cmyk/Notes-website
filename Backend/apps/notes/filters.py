from django_filters import rest_framework as filters
from .models import Note, PastYearPaper


class NoteFilter(filters.FilterSet):
    """Custom filter for Note model"""
    program = filters.NumberFilter(field_name='subject__semester__program__id')
    semester = filters.NumberFilter(field_name='subject__semester__number')
    subject = filters.NumberFilter(field_name='subject__id')
    file_type = filters.ChoiceFilter(choices=Note.FILE_TYPE_CHOICES)
    min_downloads = filters.NumberFilter(field_name='download_count', lookup_expr='gte')

    class Meta:
        model = Note
        fields = ['program', 'semester', 'subject', 'file_type', 'min_downloads']


class PastYearPaperFilter(filters.FilterSet):
    """Custom filter for PastYearPaper model"""
    program = filters.NumberFilter(field_name='subject__semester__program__id')
    semester = filters.NumberFilter(field_name='subject__semester__number')
    subject = filters.NumberFilter(field_name='subject__id')
    year = filters.NumberFilter(field_name='year')
    year_from = filters.NumberFilter(field_name='year', lookup_expr='gte')
    year_to = filters.NumberFilter(field_name='year', lookup_expr='lte')
    has_solution = filters.BooleanFilter(method='filter_has_solution')
    file_type = filters.ChoiceFilter(choices=PastYearPaper.FILE_TYPE_CHOICES)
    min_downloads = filters.NumberFilter(field_name='download_count', lookup_expr='gte')

    class Meta:
        model = PastYearPaper
        fields = [
            'program', 'semester', 'subject',
            'year', 'year_from', 'year_to',
            'has_solution', 'file_type', 'min_downloads'
        ]