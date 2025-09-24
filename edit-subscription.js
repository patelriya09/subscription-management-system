document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Get subscription ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('id');
    
    if (!subscriptionId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Set the hidden subscription ID field
    document.getElementById('subscriptionId').value = subscriptionId;

    // Load subscription data
    loadSubscriptionData(subscriptionId);

    // Set up form submission handler
    const form = document.getElementById('editSubscriptionForm');
    form.addEventListener('submit', handleEditSubmission);

    // Set up delete button handler
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.addEventListener('click', handleDelete);
});

function loadSubscriptionData(subscriptionId) {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);

    if (!subscription) {
        alert('Subscription not found');
        window.location.href = 'dashboard.html';
        return;
    }

    // Populate form fields
    document.getElementById('serviceName').value = subscription.serviceName;
    document.getElementById('amount').value = subscription.amount;
    document.getElementById('billingCycle').value = subscription.billingCycle;
    document.getElementById('startDate').value = subscription.startDate;
    document.getElementById('category').value = subscription.category;
    document.getElementById('notes').value = subscription.notes || '';
}

function handleEditSubmission(event) {
    event.preventDefault();

    // Validate form fields
    if (!validateForm(event.target)) {
        return;
    }

    const subscriptionId = document.getElementById('subscriptionId').value;
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

    if (index === -1) {
        alert('Subscription not found');
        return;
    }

    // Update subscription data
    const updatedSubscription = {
        id: subscriptionId,
        serviceName: document.getElementById('serviceName').value,
        amount: parseFloat(document.getElementById('amount').value),
        billingCycle: document.getElementById('billingCycle').value,
        startDate: document.getElementById('startDate').value,
        category: document.getElementById('category').value,
        notes: document.getElementById('notes').value
    };

    subscriptions[index] = updatedSubscription;
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

    alert('Subscription updated successfully');
    window.location.href = 'dashboard.html';
}

function handleDelete() {
    if (!confirm('Are you sure you want to delete this subscription?')) {
        return;
    }

    const subscriptionId = document.getElementById('subscriptionId').value;
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);

    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
    
    alert('Subscription deleted successfully');
    window.location.href = 'dashboard.html';
}