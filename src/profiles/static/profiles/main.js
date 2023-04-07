/* File:    main.js
By:         Bhuvneet Thakur
Date:       April 7, 2023
Description: This file contains the code to update the BIO of a user */

// variables for functions
const avatarBox         = document.getElementById('avatar-box')
const alertBox          = document.getElementById('alert-box')
const profileForm       = document.getElementById('profile-form')
const csrf              = document.getElementsByName('csrfmiddlewaretoken')
const bioInput          = document.getElementById('id_bio')
const avatarInput       = document.getElementById('id_avatar')

/* Function: profileForm.addEventListener
 Parameters: submit
 Description:  This function is called when user clicks on SAVE button in profiles URL to update the BIO
 Return: None */
profileForm.addEventListener('submit', e=>{
    e.preventDefault()

    const formData = new FormData()
    formData.append('csrfmiddlewaretoken', csrf[0].value)
    formData.append('bio', bioInput.value)
    formData.append('avatar', avatarInput.files[0])

    $.ajax({
        type: 'POST',
        url: '',
        enctype: 'multipart/form-data',
        data: formData,
        success: function(response){
            console.log(response)
            avatarBox.innerHTML = `
                <img src="${response.avatar}" class="rounded" height="200px" width="auto" alt="${response.user.username}">
            `
            bioInput.value = response.bio
            handleAlerts('success', 'Your profile has been updated!')
        },
        error: function(error){
            console.log(error)
        },
        processData: false,
        contentType: false,
        cache: false,
    })

})