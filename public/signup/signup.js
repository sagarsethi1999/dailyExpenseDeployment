document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();


    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    
    const userData = {
        name: name,
        email: email,
        password: password
    };

    axios.post('http://54.252.187.194:3000/user/signup', userData)
        .then(response => {
          console.log( response.status === 200);
          window.location.href = '../login/login.html';  
        })
        .catch(error => {
            console.error('Error:', error);
            
        });
});

document.getElementById('login-btn').addEventListener('click', function() {
    window.location.href = '../login/login.html';
});