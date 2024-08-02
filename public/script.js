// // Get modal elements
// const modal = document.getElementById('signupModal');
// const signupButton = document.getElementById('signupButton');
// const closeButton = document.getElementsByClassName('close')[0];

// // Open the modal
// signupButton.onclick = function() {
//     modal.style.display = 'block';
// }

// // Close the modal
// closeButton.onclick = function() {
//     modal.style.display = 'none';
// }

// // Close the modal if the user clicks outside of it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = 'none';
//     }
// }

// // Handle login
// document.getElementById('loginForm').addEventListener('submit', async function (e) {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     const response = await fetch('http://localhost:3000/api/v1/auth/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, password })
//     });

//     const data = await response.json();
//     if (data.status === 'success') {
//         alert('Login successful!');
//         // Redirect to a dashboard or home page
//     } else {
//         alert(data.message || 'Login failed');
//     }
// });

// // Handle signup
// document.getElementById('signupForm').addEventListener('submit', async function(e) {
//     e.preventDefault();
    
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const confirmPassword = document.getElementById('confirmPassword').value;

//     try {
//         const response = await fetch('/api/v1/auth/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 email: email,
//                 password: password,
//                 confirmPassword: confirmPassword
//             })
//         });

//         const data = await response.json();

//         if (data.status === 'success') {
//             alert('Signup successful!');
//             window.location.href = '/dashboard'; // Redirect to dashboard or another page
//         } else {
//             alert('Error: ' + data.message);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred. Please try again.');
//     }
// });

// // Handle reset password
// document.getElementById('resetPasswordForm').addEventListener('submit', async function (e) {
//     e.preventDefault();
//     const email = document.getElementById('email').value;

//     const response = await fetch('http://localhost:3000/api/v1/auth/forgotPassword', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email })
//     });

//     const data = await response.json();
//     if (data.status === 'success') {
//         alert('Password reset link sent!');
//         // Redirect or inform the user
//     } else {
//         alert(data.message || 'Password reset failed');
//     }
// });
// Get modal elements
const modal = document.getElementById('signupModal');
const signupButton = document.getElementById('signupButton');
const closeButton = document.getElementsByClassName('close')[0];
const landingPage = document.getElementById('landingPage');
const homeSection = document.getElementById('home');

// Open the modal
signupButton.onclick = function() {
    modal.style.display = 'block';
}

// Close the modal
closeButton.onclick = function() {
    modal.style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Handle signup
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            alert('Signup successful!');
            modal.style.display = 'none';
            homeSection.style.display = 'none';
            landingPage.style.display = 'block'; // Show landing page
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
