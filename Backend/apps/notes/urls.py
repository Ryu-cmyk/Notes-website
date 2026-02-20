from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'programs', views.ProgramViewSet, basename='program')
router.register(r'semesters', views.SemesterViewSet, basename='semester')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'past-year-papers', views.PastYearPaperViewSet, basename='past-year-paper')
router.register(r'past-year-paper-files', views.PastYearPaperFileViewSet, basename='past-year-paper-file')
router.register(r'past-year-paper-solutions', views.PastYearPaperSolutionFileViewSet, basename='past-year-paper-solution')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', views.api_stats, name='stats'),
    path('health/', views.health_check, name='health'),
]
