/* File:    main.js
By:         Bhuvneet Thakur
Date:       April 7, 2023
Description: This file contains the functionality for event listeners on add, load more posts and update posts. 
It also contains the Dropzone code to add pictures to posts */

// variables for functions
const postsBox      = document.getElementById('posts-box')
const spinnerBox    = document.getElementById('spinner-box')
const loadBtn       = document.getElementById('load-btn')
const endBox        = document.getElementById('end-box')

const postForm      = document.getElementById('post-form')
const title         = document.getElementById('id_title')
const body          = document.getElementById('id_body')
const csrf          = document.getElementsByName('csrfmiddlewaretoken')
const alertBox      = document.getElementById('alert-box')
const url           = window.location.href

const addBtn        = document.getElementById('add-btn')
const closeBtns      = [...document.getElementsByClassName('add-modal-close')]
const dropzone      = document.getElementById('my-dropzone')


/* Function: getCookie
 Parameters: name
 Description:  This function is used to generate the csrftoken
 Return: cookie value */
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// raise alert and display that post has been deleted
const deleted = localStorage.getItem('title')
if(deleted){
    handleAlerts('danger', `deleted "${deleted}"`)
    localStorage.clear()
}

/* Function: likeUnlikePosts
 Parameters: None
 Description:  This function takes is used to update the UI for the liked/unliked posts
 Return: None */
const likeUnlikePosts = () => {
    const likeUnlikeForms = [...document.getElementsByClassName('like-unlike-forms')]
    console.log(likeUnlikeForms)

    likeUnlikeForms.forEach(form=> form.addEventListener('submit', e => {
        e.preventDefault()
        const clickedId = e.target.getAttribute('data-form-id')
        const clickedBtn = document.getElementById(`like-unlike-${clickedId}`)

        $.ajax({
            type: 'POST',
            url: "/like-unlike/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': clickedId,
            },
            success: function(response)
            {
                console.log(response.count)
                
                if(response.count === undefined)
                {
                    handleAlerts('danger', 'Please log in to like posts')
                }
                else
                {
                    clickedBtn.textContent = response.liked ? `Unlike (${response.count})`: `Like (${response.count})`
                }   
                
            },
            error: function(error){
                console.log(error)
            }
        })
    }))
}

let visible = 3

/* Function: getData
 Parameters: None
 Description:  This function calls AJAX to update the UI of the webpage to display the Like / Unlike count
 Return: None */
const getData = () => {
    $.ajax({
        type: 'GET',
        url: `/data/${visible}/`,
        success: function(response){
            const data = response.data
            setTimeout(() => {
                spinnerBox.classList.add('.not-visible')
                console.log(data)
                data.forEach(element => {
                    postsBox.innerHTML += ` 
                        <div class="card mb-2">
                            <div class="card-body">
                                <h5 class="card-title">${element.title}</h5>
                                <p class="card-text">${element.body}</p>
                            </div>
                            <div class="card-footer">
                                <div class="row">
                                    <div class="col-2">
                                        <a href="${url}${element.id}" class="btn btn-primary">Details</a>
                                    </div>
                                    <div class="col-2">
                                        <form class="like-unlike-forms" data-form-id="${element.id}">
                                            <button class="btn btn-primary" id="like-unlike-${element.id}">${element.liked ? `Unlike (${element.count})`: `Like (${element.count})`}</button>   
                                        </form>
                                    </div>
                                </div>
                            </div>   
                        </div>
                    `
                });

                likeUnlikePosts()
            }, 100)
   
            console.log(response.size)  

            if (response.size === 0){
                endBox.textContent = 'No posts added yet...'
            }
            else if (response.size <= visible){
                loadBtn.classList.add('not-visible')
                endBox.textContent = 'No more posts to load'
            }

        },
        error: function(error){
            console.log(error)
        }
    })
}

// event listener to load 3 more posts when load button is clicked
loadBtn.addEventListener('click', () => {
    spinnerBox.classList.remove('not-visible')
    visible += 3
    getData()
})

/* Function: postForm.addEventListener
 Parameters: submit click
 Description:  This function is called when a post is added, the webpage is reset and updated.
 Return: None */
let newPostId = null
postForm.addEventListener('submit', e=> {
    e.preventDefault()

    $.ajax({
        type: 'POST',
        url:   '',
        data: {
            'csrfmiddlewaretoken': csrf[0].value,
            'title': title.value,
            'body': body.value
        },
        success: function(response){
            console.log(response)
            newPostId = response.id
            postsBox.insertAdjacentHTML('afterbegin', `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${response.title}</h5>
                        <p class="card-text">${response.body}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-2">
                                <a href="${url}${response.id}" class="btn btn-primary">Details</a>
                            </div>
                            <div class="col-2">
                                <form class="like-unlike-forms" data-form-id="${response.id}">
                                    <button class="btn btn-primary" id="like-unlike-${response.id}">Like (0)</button>   
                                </form>
                            </div>
                        </div>
                    </div>   
                </div>
            `)
            likeUnlikePosts()
            handleAlerts('success', 'New post added!')
        },
        error: function(error){
            console.log(error)
            handleAlerts('danger', 'Oops.. something went wrong')
        }
    })
})

// when add button is clicked, dropzone is displayed.
addBtn.addEventListener('click', ()=>{
    dropzone.classList.remove('not-visible')
})

// for each method to remove files when close button is clicked, 
// so when new post is added, old images have been removed
closeBtns.forEach(btn=> btn.addEventListener('click', ()=>{
    postForm.reset()
    if(!dropzone.classList.contains('not-visible')){
        dropzone.classList.add('not-visible')
    }
    const myDropzone = Dropzone.forElement('#my-dropzone')
    myDropzone.removeAllFiles(true)
}))

// Dropzone functionality to display the option to drop image files.
Dropzone.autoDiscover = false

// this will load once page has been loaded.
window.onload = function(){
    
    const myDropzone = new Dropzone('#my-dropzone', {
        url: 'upload/',
        init: function() {
            this.on('sending', function(file, xhr, formData){
                formData.append('csrfmiddlewaretoken', csrftoken)
                formData.append('new_post_id', newPostId)
            })
        },
        maxFiles: 5,
        maxFilesize: 4,
        acceptedFiles: '.png, .jpg, .jpeg'
    })
}

getData()