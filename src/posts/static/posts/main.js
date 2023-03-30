console.log('hello world')

const helloWorldBox = document.getElementById('hello-world')
const postsBox = document.getElementById('posts-box')
const spinnerBox = document.getElementById('spinner-box')

//helloWorldBox.innerHTML = 'hello <b>world</b>'

$.ajax({
    type: 'GET',
    url: '/hello-world/',
    success: function(response){
        console.log('success', response.text)
        helloWorldBox.textContent = response.text
    },
    error: function(error){
        console.log('error', error)
    }
})

$.ajax({
    type: 'GET',
    url: '/data/',
    success: function(response){
        console.log(response)
        const data = response.data
        //const data = JSON.parse(response.data)  // convert to JSON object
        setTimeout(() => {
            spinnerBox.classList.add('.not-visible')
            console.log(data)
            data.forEach(element => {
                postsBox.innerHTML += `
                    ${element.title} - <b>${element.body}</b><br>
                `
            });
        }, 100);  
    },
    error: function(error){
        console.log(error)
    }
})