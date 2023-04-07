from .models import Post
from profiles.models import Profile
from django.http import HttpResponse
from django.shortcuts import redirect

# File:      utils.py
#By:         Bhuvneet Thakur
#Date:       April 7, 2023
#Description: This file contains the action_permission to update, delete posts


# Function: action_permission
# Parameters: func
# Description:  This function defines the permissions for the user
# Return: returns wrapper and the arguments if true, or redirect to 'posts:main-board' if false
def action_permission(func):
    def wrapper(request, **kwargs):
        pk = kwargs.get('pk')
        profile = Profile.objects.get(user=request.user)
        post = Post.objects.get(pk=pk)
        if profile.user == post.author.user:
            print('yes')
            return func(request, **kwargs)
        else:
            print('no')
            return redirect('posts:main-board')
        
    return wrapper