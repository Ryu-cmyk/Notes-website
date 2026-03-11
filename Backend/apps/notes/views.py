from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse
from django.db.models import Count, Q, Sum

from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Program, Semester, Subject,
    Note, PastYearPaper, PastYearPaperFile, PastYearPaperSolutionFile
)
from .serializers import (
    ProgramListSerializer, ProgramDetailSerializer,
    SemesterListSerializer, SemesterDetailSerializer,
    SubjectListSerializer, SubjectDetailSerializer,
    NoteListSerializer, NoteDetailSerializer,
    PastYearPaperListSerializer, PastYearPaperDetailSerializer,
    PastYearPaperFileSerializer, PastYearPaperSolutionFileSerializer,
    UserSerializer, UserRegistrationSerializer
)
from .permissions import IsAdminOrReadOnly, IsAuthenticatedForDownload
from .filters import NoteFilter, PastYearPaperFilter

import logging

logger = logging.getLogger(__name__)



# Program


class ProgramViewSet(viewsets.ModelViewSet):
    """
    list:     Get all programs (public)
    retrieve: Get a specific program with its semesters (public)
    create:   Admin only
    update:   Admin only
    destroy:  Admin only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Program.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProgramDetailSerializer
        return ProgramListSerializer

    @action(detail=True, methods=['get'])
    def semesters(self, request, pk=None):
        """Get all semesters for a program"""
        program = self.get_object()
        semesters = program.semesters.filter(is_active=True)
        serializer = SemesterListSerializer(semesters, many=True, context={'request': request})
        return Response(serializer.data)



# Semester


class SemesterViewSet(viewsets.ModelViewSet):
    """
    list:     Get all semesters (public)
    retrieve: Get a specific semester with its subjects (public)
    create:   Admin only
    update:   Admin only
    destroy:  Admin only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program']
    search_fields = ['name', 'number', 'description']
    ordering_fields = ['number', 'created_at']
    ordering = ['number']

    def get_queryset(self):
        return Semester.objects.filter(is_active=True).select_related('program').annotate(
            subjects_count=Count('subjects', filter=Q(subjects__is_active=True)),
            notes_count=Count(
                'subjects__notes',
                filter=Q(subjects__is_active=True, subjects__notes__is_active=True)
            )
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SemesterDetailSerializer
        return SemesterListSerializer

    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get all subjects for a semester"""
        semester = self.get_object()
        subjects = semester.subjects.filter(is_active=True)
        serializer = SubjectListSerializer(subjects, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get all notes for a semester"""
        semester = self.get_object()
        notes = Note.objects.filter(
            subject__semester=semester, is_active=True
        ).select_related('subject', 'uploaded_by')
        serializer = NoteListSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def past_year_papers(self, request, pk=None):
        """Get all past year papers for a semester"""
        semester = self.get_object()
        papers = PastYearPaper.objects.filter(
            subject__semester=semester, is_active=True
        ).select_related('subject', 'uploaded_by')
        serializer = PastYearPaperListSerializer(papers, many=True, context={'request': request})
        return Response(serializer.data)



# Subject


class SubjectViewSet(viewsets.ModelViewSet):
    """
    list:     Get all subjects (public)
    retrieve: Get a specific subject (public)
    create:   Admin only
    update:   Admin only
    destroy:  Admin only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['semester', 'semester__program']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Subject.objects.filter(is_active=True).select_related(
            'semester', 'semester__program'
        ).annotate(
            notes_count=Count('notes', filter=Q(notes__is_active=True)),
            past_year_papers_count=Count('past_year_papers', filter=Q(past_year_papers__is_active=True))
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SubjectDetailSerializer
        return SubjectListSerializer

    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get all notes for a subject"""
        subject = self.get_object()
        notes = subject.notes.filter(is_active=True).select_related('uploaded_by')
        serializer = NoteListSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def past_year_papers(self, request, pk=None):
        """Get all past year papers for a subject"""
        subject = self.get_object()
        papers = subject.past_year_papers.filter(is_active=True).select_related('uploaded_by')
        serializer = PastYearPaperListSerializer(papers, many=True, context={'request': request})
        return Response(serializer.data)



# Note


class NoteViewSet(viewsets.ModelViewSet):
    """
    list:     Get all notes (public)
    retrieve: Get a specific note (public)
    create:   Admin only
    update:   Admin only
    destroy:  Admin only
    download: Login required
    """
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = NoteFilter
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    ordering_fields = ['created_at', 'download_count', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return Note.objects.filter(is_active=True).select_related(
            'subject', 'subject__semester', 'subject__semester__program', 'uploaded_by'
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NoteDetailSerializer
        return NoteListSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download note file - requires authentication"""
        try:
            note = self.get_object()
            if not note.file:
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

            note.increment_download_count()
            logger.info(f"User {request.user.email} downloaded note {note.id}")

            file_handle = note.file.open('rb')
            response = FileResponse(file_handle, as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{note.file.name.split("/")[-1]}"'
            return response

        except Exception as e:
            logger.error(f"Error downloading note {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most downloaded notes"""
        limit = int(request.query_params.get('limit', 10))
        notes = self.get_queryset().order_by('-download_count')[:limit]
        return Response(self.get_serializer(notes, many=True).data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently uploaded notes"""
        limit = int(request.query_params.get('limit', 10))
        notes = self.get_queryset().order_by('-created_at')[:limit]
        return Response(self.get_serializer(notes, many=True).data)


# Past Year Paper


class PastYearPaperViewSet(viewsets.ModelViewSet):
    """
    list:     Get all past year papers (public)
    retrieve: Get a specific paper with all its pages (public)
    create:   Admin only
    update:   Admin only
    destroy:  Admin only
    download: Login required
    """
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PastYearPaperFilter
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    ordering_fields = ['year', 'created_at', 'download_count']
    ordering = ['-year']

    def get_queryset(self):
        return PastYearPaper.objects.filter(is_active=True).select_related(
            'subject', 'subject__semester', 'subject__semester__program', 'uploaded_by'
        ).prefetch_related('paper_files', 'solution_files')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PastYearPaperDetailSerializer
        return PastYearPaperListSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download all paper files as a zip or first file - requires authentication"""
        try:
            paper = self.get_object()
            paper_files = paper.paper_files.all().order_by('page_number')

            if not paper_files.exists() and not paper.file:
                return Response({'error': 'No files found for this paper'}, status=status.HTTP_404_NOT_FOUND)

            paper.increment_download_count()
            logger.info(f"User {request.user.email} downloaded past year paper {paper.id}")

            # If single file on the paper itself, serve that
            if paper.file:
                file_handle = paper.file.open('rb')
                response = FileResponse(file_handle, as_attachment=True)
                response['Content-Disposition'] = f'attachment; filename="{paper.file.name.split("/")[-1]}"'
                return response

            # Otherwise serve first page (frontend should handle individual page downloads)
            first_file = paper_files.first()
            file_handle = first_file.file.open('rb')
            response = FileResponse(file_handle, as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{first_file.file.name.split("/")[-1]}"'
            return response

        except Exception as e:
            logger.error(f"Error downloading past year paper {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most downloaded papers"""
        limit = int(request.query_params.get('limit', 10))
        papers = self.get_queryset().order_by('-download_count')[:limit]
        return Response(self.get_serializer(papers, many=True).data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently uploaded papers"""
        limit = int(request.query_params.get('limit', 10))
        papers = self.get_queryset().order_by('-created_at')[:limit]
        return Response(self.get_serializer(papers, many=True).data)



# Past Year Paper File (individual pages)


class PastYearPaperFileViewSet(viewsets.ModelViewSet):
    """
    Manages individual page files for a Past Year Paper.
    Admin: full CRUD
    Authenticated: download
    Public: list/retrieve
    """
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paper']
    ordering_fields = ['page_number']
    ordering = ['page_number']
    serializer_class = PastYearPaperFileSerializer

    def get_queryset(self):
        return PastYearPaperFile.objects.select_related('paper').all()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download a single page file - requires authentication"""
        try:
            paper_file = self.get_object()
            file_handle = paper_file.file.open('rb')
            response = FileResponse(file_handle, as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{paper_file.file.name.split("/")[-1]}"'
            return response
        except Exception as e:
            logger.error(f"Error downloading paper file {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Past Year Paper Solution File


class PastYearPaperSolutionFileViewSet(viewsets.ModelViewSet):
    """
    Manages individual solution page files for a Past Year Paper.
    Admin: full CRUD
    Authenticated: download
    Public: list/retrieve
    """
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paper']
    ordering_fields = ['page_number']
    ordering = ['page_number']
    serializer_class = PastYearPaperSolutionFileSerializer

    def get_queryset(self):
        return PastYearPaperSolutionFile.objects.select_related('paper').all()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download a single solution page file - requires authentication"""
        try:
            solution_file = self.get_object()
            file_handle = solution_file.file.open('rb')
            response = FileResponse(file_handle, as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{solution_file.file.name.split("/")[-1]}"'
            return response
        except Exception as e:
            logger.error(f"Error downloading solution file {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([AllowAny])
def api_stats(request):
    from django.db.models import Sum
    stats = {
        'total_programs': Program.objects.filter(is_active=True).count(),
        'total_semesters': Semester.objects.filter(is_active=True).count(),
        'total_subjects': Subject.objects.filter(is_active=True).count(),
        'total_notes': Note.objects.filter(is_active=True).count(),
        'total_past_year_papers': PastYearPaper.objects.filter(is_active=True).count(),
        'total_downloads': (
            Note.objects.filter(is_active=True).aggregate(total=Sum('download_count'))['total'] or 0
        ) + (
            PastYearPaper.objects.filter(is_active=True).aggregate(total=Sum('download_count'))['total'] or 0
        ),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'healthy', 'message': 'Notes Backend API is running'})
