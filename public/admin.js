document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('table tbody');
    const addUserBtn = document.getElementById('addUserBtn');
    const userFormPopup = document.getElementById('userFormPopup');
    const closePopup = document.getElementById('closePopup');
    const userForm = document.getElementById('userForm');
    const confirmDeletePopup = document.getElementById('confirmDeletePopup');
    const closeConfirmPopup = document.getElementById('closeConfirmPopup');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmMessage = document.getElementById('confirmMessage');
    const apiUrl = '/users'; 
    let userIdToDelete = null;

    async function displayUsers() {
        try {
            const response = await fetch(apiUrl);
            const userData = await response.json();
            tableBody.innerHTML = ''; 
            userData.forEach((user, index) => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', user.id);
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.password}</td>
                    <td>
                        <button class="btn btn-edit">Edit</button>
                        <button class="btn btn-delete" data-id="${user.id}" data-name="${user.username}">Delete</button>
                        <button class="btn btn-save" style="display:none" data-id="${user.id}">Save</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function showPopup() {
        userFormPopup.style.display = 'block';
    }

    function hidePopup() {
        userFormPopup.style.display = 'none';
    }

    function showDeletePopup(name, id) {
        confirmMessage.textContent = `Deleting: ${name}`;
        confirmDeletePopup.style.display = 'block';
        userIdToDelete = id;
    }

    function hideDeletePopup() {
        confirmDeletePopup.style.display = 'none';
        userIdToDelete = null;
    }

    async function addUser(event) {
        event.preventDefault();
        const newUser = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (response.ok) {
                displayUsers(); 
                hidePopup(); 
                userForm.reset(); 
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    }

    async function deleteUser(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                displayUsers(); 
                hideDeletePopup(); 
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    function enterEditMode(row) {
        const cells = row.querySelectorAll('td');
        const userId = row.getAttribute('data-id');
        const username = cells[1].textContent;
        const password = cells[2].textContent;

        cells[1].innerHTML = `<input type="text" value="${username}">`;
        cells[2].innerHTML = `<input type="password" value="${password}">`;
        cells[3].querySelector('.btn-save').style.display = 'inline-block'; 

        row.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                saveChanges(row);
            }
        });
    }

    async function saveChanges(row) {
        const cells = row.querySelectorAll('td');
        const userId = row.getAttribute('data-id');
        const updatedUser = {
            username: cells[1].querySelector('input').value,
            password : cells[2].querySelector('input').value
        };

        try {
            const response = await fetch(`${apiUrl}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                displayUsers(); 
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    tableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (event.target.classList.contains('btn-edit')) {
            enterEditMode(row);
        }

        if (event.target.classList.contains('btn-save')) {
            saveChanges(row);
        }

        if (event.target.classList.contains('btn-delete')) {
            const id = event.target.getAttribute('data-id');
            const name = event.target.getAttribute('data-name');
            showDeletePopup(name, id);
        }
    });

    addUserBtn.addEventListener('click', showPopup);
    closePopup.addEventListener('click', hidePopup);
    closeConfirmPopup.addEventListener('click', hideDeletePopup);
    cancelDeleteBtn.addEventListener('click', hideDeletePopup);
    confirmDeleteBtn.addEventListener('click', function() {
        if (userIdToDelete) {
            deleteUser(userIdToDelete);
        }
    });

    window.addEventListener('click', function(event) {
        if (event.target === userFormPopup) {
            hidePopup();
        }
        if (event.target === confirmDeletePopup) {
            hideDeletePopup();
        }
    });

    userForm.addEventListener('submit', addUser);

    displayUsers(); 
    const notificationBell = document.getElementById('notificationBell');
    const notificationsPopup = document.getElementById('notificationsPopup');
    const closeNotificationsPopup = document.getElementById('closeNotificationsPopup');
    const requestsList = document.getElementById('requestsList');
    const requestUrl = '/subscription-requests';

    const actionNotificationPopup = document.getElementById('actionNotificationPopup');
    const closeActionNotificationPopup = document.getElementById('closeActionNotificationPopup');
    const notificationMessage = document.getElementById('notificationMessage');

    function showNotificationPopup(message) {
        notificationMessage.textContent = message;
        actionNotificationPopup.style.display = 'block';
    }
    function hideNotificationPopup() {
        actionNotificationPopup.style.display = 'none';
    }

    function fetchRequests() {
        fetch(requestUrl)
            .then(response => response.json())
            .then(data => {
                displayRequests(data);
                updateNotificationCount(data.length); 
            })
            .catch(error => console.error('Error fetching requests:', error));
    }

    function updateNotificationCount(count) {
        const notificationCount = document.getElementById('notificationCount');
        if (count > 0) {
            notificationCount.textContent = count;
            notificationCount.style.display = 'inline-block';
        } else {
            notificationCount.style.display = 'none';
        }
    }


    function displayRequests(requests) {
        requestsList.innerHTML = '';
        requests.forEach(request => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>User: ${request.username} - ${request.subscription_type}</span>
                <button class="accept-btn" data-id="${request.id}">Accept</button>
                <button class="decline-btn" data-id="${request.id}">Decline</button>
            `;
            requestsList.appendChild(listItem);
        });
    }

    function togglePopup() {
        notificationsPopup.style.display = notificationsPopup.style.display === 'block' ? 'none' : 'block';
    }

    function handleRequestAction(event) {
        const requestId = event.target.getAttribute('data-id');
        const action = event.target.classList.contains('accept-btn') ? 'accept' : 'decline';
        
        fetch(`/subscription-requests/${requestId}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        })
        .then(response => {
            if (response.ok) {
                fetchRequests(); 
                const message = action === 'accept' ? 'Subscription accepted.' : 'Subscription declined.';
                showNotificationPopup(message);
            } else {
                console.error('Error processing request');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    notificationBell.addEventListener('click', togglePopup);
    closeNotificationsPopup.addEventListener('click', togglePopup);
    requestsList.addEventListener('click', handleRequestAction);
    closeActionNotificationPopup.addEventListener('click', hideNotificationPopup);

    fetchRequests();
});
