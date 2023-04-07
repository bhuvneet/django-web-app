from django.shortcuts import render
from .models import Post
from .models import Photo
from django.http import JsonResponse
from django.http import HttpResponse
from .forms import PostForm
from profiles.models import Profile
from .utils import action_permission
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

# File:      views.py
#By:         Bhuvneet Thakur
#Date:       April 7, 2023
#Description: This file contains the Views to create posts, update posts, delete posts, like/unlike posts, post detail, image uploading

# Function: post_list_and_create
# Parameters: request
# Description:  This function takes in the request from the user and generated an AJAX call to display the posts
# Return: renders request and context data structure
def post_list_and_create(request):
    form = PostForm(request.POST or None)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if form.is_valid():
            author = Profile.objects.get(user=request.user)
            instance = form.save(commit=False)
            instance.author = author
            instance.save()
            return JsonResponse({
                'title': instance.title,
                'body': instance.body,
                'author': instance.author.user.username,
                'id': instance.id,
            })

    context = {
        'form' : form,
    }

    return render(request, 'posts/main.html', context)

# Function: post_detail
# Parameters: request, pk
# Description:  This function takes in the request and pk and generated an object and form variables
# Return: renders request and context data structure
def post_detail(request, pk):
    obj = Post.objects.get(pk=pk)
    form = PostForm()

    context = {
        'obj' : obj,
        'form' : form,
    }

    return render(request, 'posts/detail.html', context)

# Function: load_post_data_view
# Parameters: request, num_posts
# Description:  This function takes in the request and pk and generates an item data structure to hold the information about the post
# Return: JSON response of true, else returns to main post
def load_post_data_view(request, num_posts):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        visible = 3
        upper = num_posts
        lower = upper - visible
        size = Post.objects.all().count()

        qs = Post.objects.all()
        data = []
        for obj in qs:
            item = {
                'id': obj.id,
                'title': obj.title,
                'body': obj.body,
                'liked': True if request.user in obj.liked.all() else False,
                'count': obj.like_count,
                'author': obj.author.user.username
            }
            data.append(item)
        return JsonResponse({'data': data[lower:upper], 'size': size})
    return redirect('posts:main-board')

# Function: post_detail_data_view
# Parameters: request, pk
# Description:  This function takes in the request and pk and generates an data data structure to hold the information about the post
# Return: JSON response containing the data
def post_detail_data_view(request, pk):
    obj = Post.objects.get(pk=pk)
    data = {
        'id': obj.id,
        'title': obj.title,
        'body': obj.body,
        'author': obj.author.user.username,
        'logged_in': request.user.username,
    }
    return JsonResponse({'data': data})


# Function: like_unlike_post
# Parameters: request
# Description:  This function takes in the request and returns the JSONResponse for liked bool and like count
# Return: JSON response containing the data if true, else returns to post:main-board
@login_required
def like_unlike_post(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        pk = request.POST.get('pk')
        obj = Post.objects.get(pk=pk)
        if request.user in obj.liked.all():
            liked = False
            obj.liked.remove(request.user)
        else:
            liked = True
            obj.liked.add(request.user)
        return JsonResponse({'liked' : liked, 'count' : obj.like_count})
    return redirect('posts:main-board')


# Function: update_post
# Parameters: request , pk
# Description:  This function takes in the request and pk and checks if an AJAX call to update the post
# Return: JSON response containing the title and body of new post
@login_required
@action_permission
def update_post(request, pk):
    obj = Post.objects.get(pk=pk)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        new_title = request.POST.get('title')
        new_body = request.POST.get('body')
        obj.title = new_title
        obj.body = new_body
        obj.save()
    return JsonResponse({
        'title': new_title,
        'body': new_body,
    })

# Function: delete_post
# Parameters: request , pk
# Description:  This function takes in the request and pk and checks if an AJAX call to delete the post
# Return: JSON response
@login_required
@action_permission
def delete_post(request, pk):
    obj = Post.objects.get(pk=pk)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        obj.delete()
    return JsonResponse({})


# Function: image_upload_view
# Parameters: request , pk
# Description:  This function takes in the request and checks if the method is POST, to upload images to the post being added
# Return: HTTP respone if true, else redirect('posts:main-board') 
@login_required
def image_upload_view(request):
    if request.method == 'POST':
        img = request.FILES.get('file')
        new_post_id = request.POST.get('new_post_id')
        post = Post.objects.get(id=new_post_id)
        Photo.objects.create(image=img, post=post)
        return HttpResponse()
    return redirect('posts:main-board')


