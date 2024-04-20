

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    axios.post('http://13.239.36.38:3000/user/login', { email, password })
        .then((response) => {
            console.log(response.data.token);
            console.log('Response headers:', response.headers);
            // const token = response.headers['authorization'];
            const token = response.data.token;
            // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzA5Mjc0NDYzfQ.i9TakdkAn4H85_b3Sz0607qwUxOIZ1Z0lrDnr54is00";
            console.log(token);
            if (token) {
                localStorage.setItem('token', token);
                console.log('Login successful');
                window.location.href = '../expense/expense.html';
            } else {
                console.error('Authorization token not found in response');
            }
        })
        .catch((error) => {
            console.error('Login failed:', error);
        });
});


document.getElementById('signupLink').addEventListener('click', function () {
    console.log('Redirecting to sign up page');
  
    window.location.href = '../signup/signup.html';
});


const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

forgotPasswordBtn.addEventListener('click', () => {
   
    forgotPasswordForm.style.display = 'block';
});




forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();


    const email = document.getElementById('passwordemail').value;
    console.log('Email:', email);

    try {
        // Make an Axios POST request to the backend API route
        const response = await axios.post('http://13.239.36.38:3000/password/forgotpassword', { email });
        console.log('Response:', response.data); // Add this console log to check the response
    } catch (error) {
        // Handle errors, maybe display an error message to the user
        console.error('Error:', error);
    }
});
