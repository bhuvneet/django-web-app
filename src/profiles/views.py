from django.shortcuts import render
from .models import Profile
from .forms import ProfileForm
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

# File:      views.py
#By:         Bhuvneet Thakur
#Date:       April 7, 2023
#Description: This file contains the view for the profile

# Function: my_profile_view
# Parameters: request
# Description:  This function takes in the request from the user and generated an AJAX call to display the profile page
# Return: renders request and context data structure
@login_required
def my_profile_view(request):
    obj = Profile.objects.get(user=request.user)
    form = ProfileForm(request.POST or None, request.FILES or None, instance=obj)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if form.is_valid():
            instance = form.save()
            return JsonResponse({
                'bio': instance.bio,
                'avatar': instance.avatar.url,
                'user': instance.user.username
            })
    context = {
        'obj': obj,
        'form': form,
    }

    return render(request, 'profiles/main.html', context)