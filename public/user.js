document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('subscriptionTableBody');
    const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
    const subscriptionFormPopup = document.getElementById('subscriptionFormPopup');
    const closeSubscriptionPopup = document.getElementById('closeSubscriptionPopup');
    const subscriptionForm = document.getElementById('subscriptionForm');
    const apiUrl = '/subscriptions';
    const requestUrl = '/subscription-requests'; 
    const subscriptionMessagePopup = document.getElementById('subscriptionMessagePopup');
    const subscriptionMessageText = document.getElementById('subscriptionMessageText');
    const closeMessagePopup = document.getElementById('closeMessagePopup');
    let subscriptions = [];

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
    
        return `${year}-${month}-${day}`;
    }
    

    function fetchSubscriptions() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('No userId found in localStorage.');
            return;
        }

        fetch(`${apiUrl}/${userId}`)
            .then(response => response.json())
            .then(data => {
                subscriptions = data;
                displaySubscriptions();
            })
            .catch(error => console.error('Error fetching subscriptions:', error));
    }

    function displaySubscriptions() {
        tableBody.innerHTML = '';
        subscriptions.forEach(subscription => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', subscription.id);
            row.innerHTML = `
                <td>${subscription.id}</td>
                <td>${subscription.subscription_type}</td>
                <td>${formatDate(subscription.subscription_start_date)}</td>
                <td>${formatDate(subscription.subscription_end_date)}</td>
                <td>${subscription.payment_status}</td>
                <td>${formatDate(subscription.last_payment_date)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function showPopup() {
        subscriptionFormPopup.style.display = 'block';
    }

    function hidePopup() {
        subscriptionFormPopup.style.display = 'none';
    }

    function showMessagePopup(message) {
        subscriptionMessageText.textContent = message;
        subscriptionMessagePopup.style.display = 'flex';  
    }

    function hideMessagePopup() {
        subscriptionMessagePopup.style.display = 'none';
    }

    function requestSubscription(event) {
        event.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('No userId found in localStorage.');
            return;
        }

        const subscriptionRequest = {
            user_id: userId,
            subscription_type: document.getElementById('subscriptionType').value,
            subscription_start_date: document.getElementById('subscriptionStartDate').value,
            subscription_end_date: document.getElementById('subscriptionEndDate').value,
            payment_status: document.getElementById('paymentStatus').value,
            last_payment_date: document.getElementById('lastPaymentDate').value,
            status: 'pending' 
        };

        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionRequest)
        })
        .then(response => {
            if (response.ok) {
                hidePopup();  
                subscriptionForm.reset();
                showMessagePopup('Your request has been sent to the admin for approval.');
            } else {
                response.json().then(err => {
                    console.error('Error sending subscription request:', err);
                    showMessagePopup('Error sending subscription request.');
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessagePopup('An error occurred. Please try again.');
        });
    }

   
    addSubscriptionBtn.addEventListener('click', showPopup);
    closeSubscriptionPopup.addEventListener('click', hidePopup);
    closeMessagePopup.addEventListener('click', hideMessagePopup);
    subscriptionForm.addEventListener('submit', requestSubscription);

   
    fetchSubscriptions();
});
