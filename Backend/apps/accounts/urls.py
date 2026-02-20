from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('profile/', views.user_profile, name='profile'),
    path('change-password/', views.change_password, name='change-password'),
]