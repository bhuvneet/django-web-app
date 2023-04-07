from django.urls import path
from .views import my_profile_view
app_name = 'profiles'

# File:      urls.py
# By:         Bhuvneet Thakur
# Date:       April 7, 2023
# Description: This file contains the URL to access a profile

urlpatterns = [
    path('my/', my_profile_view, name='my-profile'),
]