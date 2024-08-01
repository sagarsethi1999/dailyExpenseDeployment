

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    axios.post('http://localhost:3000/user/login', { email, password })
        .then((response) => {
            console.log(response.data.token);
            console.log('Response headers:', response.headers);
            const token = response.data.token;
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
    
        const response = await axios.post('http://localhost:3000/password/forgotpassword', { email });
        console.log('Response:', response.data); 
    } catch (error) {
        console.error('Error:', error);
    }
});
