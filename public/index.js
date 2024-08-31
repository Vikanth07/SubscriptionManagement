let popup = document.getElementById("popup");
function openpopup() {
    popup.classList.add("openpopup");
}
function closepopup() {
    popup.classList.remove("openpopup");
}

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginBtn = document.getElementById('adminLoginBtn');

    adminLoginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            openpopup();
            return;
        }
        fetch('/adminlogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "/admin.html"; 
            } else {
                document.querySelector('.h2').innerHTML = 'Invalid Username or Password';
                openpopup();
                return;
            }
        })
        .catch(error => {
            document.querySelector('.h2').innerHTML = 'An error occured during Login';
            openpopup();
            return;
        });
    });

    const userLoginBtn = document.getElementById('userLoginBtn');
    userLoginBtn.addEventListener('click',()=>{
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            openpopup();
            return;
        }

        fetch('/userlogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('userId', data.userId); 
                window.location.href = "/users.html"; 
            } else {
                document.querySelector('.h2').innerHTML = 'Invalid Username or Password';
                openpopup();
                return;
            }
        })
        .catch(error => {
            document.querySelector('.h2').innerHTML = 'An error occured during Login';
            openpopup();
            return;
        });
    });
});
