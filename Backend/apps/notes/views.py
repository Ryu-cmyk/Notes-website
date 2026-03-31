from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse
from django.shortcuts import redirect
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
        program = self.get_object()
        semesters = program.semesters.filter(is_active=True)
        serializer = SemesterListSerializer(semesters, many=True, context={'request': request})
        return Response(serializer.data)


# Semester

class SemesterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program']
    search_fields = ['name', 'number', 'description']
    ordering_fields = ['number', 'created_at']
    ordering = ['number']

    def get_queryset(self):
        return Semester.objects.filter(is_active=True).select_related('program').annotate(
            total_subjects_count=Count('subjects', filter=Q(subjects__is_active=True)),
            total_notes_count=Count(
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
        semester = self.get_object()
        subjects = semester.subjects.filter(is_active=True)
        serializer = SubjectListSerializer(subjects, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        semester = self.get_object()
        notes = Note.objects.filter(
            subject__semester=semester, is_active=True
        ).select_related('subject', 'uploaded_by')
        serializer = NoteListSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def past_year_papers(self, request, pk=None):
        semester = self.get_object()
        papers = PastYearPaper.objects.filter(
            subject__semester=semester, is_active=True
        ).select_related('subject', 'uploaded_by')
        serializer = PastYearPaperListSerializer(papers, many=True, context={'request': request})
        return Response(serializer.data)


# Subject

class SubjectViewSet(viewsets.ModelViewSet):
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
            total_notes_count=Count('notes', filter=Q(notes__is_active=True)),
            total_past_year_papers_count=Count('past_year_papers', filter=Q(past_year_papers__is_active=True))
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SubjectDetailSerializer
        return SubjectListSerializer

    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        subject = self.get_object()
        notes = subject.notes.filter(is_active=True).select_related('uploaded_by')
        serializer = NoteListSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def past_year_papers(self, request, pk=None):
        subject = self.get_object()
        papers = subject.past_year_papers.filter(is_active=True).select_related('uploaded_by')
        serializer = PastYearPaperListSerializer(papers, many=True, context={'request': request})
        return Response(serializer.data)


# Note

class NoteViewSet(viewsets.ModelViewSet):
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

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """View note file - public, redirects to Cloudinary URL"""
        try:
            note = self.get_object()
            if not note.file:
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            return redirect(note.file.url)
        except Exception as e:
            logger.error(f"Error viewing note {pk}: {str(e)}")
            return Response({'error': 'Failed to load file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download note file - requires authentication"""
        try:
            note = self.get_object()
            if not note.file:
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            note.increment_download_count()
            logger.info(f"User {request.user.email} downloaded note {note.id}")
            return redirect(note.file.url)
        except Exception as e:
            logger.error(f"Error downloading note {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        limit = int(request.query_params.get('limit', 10))
        notes = self.get_queryset().order_by('-download_count')[:limit]
        return Response(self.get_serializer(notes, many=True).data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        limit = int(request.query_params.get('limit', 10))
        notes = self.get_queryset().order_by('-created_at')[:limit]
        return Response(self.get_serializer(notes, many=True).data)


# Past Year Paper

class PastYearPaperViewSet(viewsets.ModelViewSet):
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

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """View paper file - public, redirects to Cloudinary URL"""
        try:
            paper = self.get_object()
            if paper.file:
                return redirect(paper.file.url)
            first_file = paper.paper_files.first()
            if not first_file:
                return Response({'error': 'No file found'}, status=status.HTTP_404_NOT_FOUND)
            return redirect(first_file.file.url)
        except Exception as e:
            logger.error(f"Error viewing past year paper {pk}: {str(e)}")
            return Response({'error': 'Failed to load file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download paper - requires authentication, redirects to Cloudinary URL"""
        try:
            paper = self.get_object()
            paper_files = paper.paper_files.all().order_by('page_number')
            if not paper_files.exists() and not paper.file:
                return Response({'error': 'No files found'}, status=status.HTTP_404_NOT_FOUND)
            paper.increment_download_count()
            logger.info(f"User {request.user.email} downloaded past year paper {paper.id}")
            if paper.file:
                return redirect(paper.file.url)
            return redirect(paper_files.first().file.url)
        except Exception as e:
            logger.error(f"Error downloading past year paper {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        limit = int(request.query_params.get('limit', 10))
        papers = self.get_queryset().order_by('-download_count')[:limit]
        return Response(self.get_serializer(papers, many=True).data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        limit = int(request.query_params.get('limit', 10))
        papers = self.get_queryset().order_by('-created_at')[:limit]
        return Response(self.get_serializer(papers, many=True).data)


# Past Year Paper File

class PastYearPaperFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paper']
    ordering_fields = ['page_number']
    ordering = ['page_number']
    serializer_class = PastYearPaperFileSerializer

    def get_queryset(self):
        return PastYearPaperFile.objects.select_related('paper').all()

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """View a single page file - public, redirects to Cloudinary URL"""
        try:
            paper_file = self.get_object()
            return redirect(paper_file.file.url)
        except Exception as e:
            logger.error(f"Error viewing paper file {pk}: {str(e)}")
            return Response({'error': 'Failed to load file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download a single page file - requires authentication"""
        try:
            paper_file = self.get_object()
            return redirect(paper_file.file.url)
        except Exception as e:
            logger.error(f"Error downloading paper file {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Past Year Paper Solution File

class PastYearPaperSolutionFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedForDownload]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paper']
    ordering_fields = ['page_number']
    ordering = ['page_number']
    serializer_class = PastYearPaperSolutionFileSerializer

    def get_queryset(self):
        return PastYearPaperSolutionFile.objects.select_related('paper').all()

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """View a single solution file - public, redirects to Cloudinary URL"""
        try:
            solution_file = self.get_object()
            return redirect(solution_file.file.url)
        except Exception as e:
            logger.error(f"Error viewing solution file {pk}: {str(e)}")
            return Response({'error': 'Failed to load file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """Download a single solution file - requires authentication"""
        try:
            solution_file = self.get_object()
            return redirect(solution_file.file.url)
        except Exception as e:
            logger.error(f"Error downloading solution file {pk}: {str(e)}")
            return Response({'error': 'Failed to download file'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_stats(request):
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