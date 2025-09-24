// Subscription form handling with AJAX

function validateForm(form) {
    let isValid = true;
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.textContent = '');

    // Service Name validation
    const serviceName = form.querySelector('#serviceName');
    if (!serviceName.value.trim()) {
        showFieldError(serviceName, 'Service name is required');
        isValid = false;
    }

    // Amount validation
    const amount = form.querySelector('#amount');
    if (!amount.value || amount.value <= 0) {
        showFieldError(amount, 'Please enter a valid amount');
        isValid = false;
    }

    // Billing Cycle validation
    const billingCycle = form.querySelector('#billingCycle');
    if (!billingCycle.value) {
        showFieldError(billingCycle, 'Please select a billing cycle');
        isValid = false;
    }

    // Start Date validation
    const startDate = form.querySelector('#startDate');
    if (!startDate.value) {
        showFieldError(startDate, 'Start date is required');
        isValid = false;
    }

    // Category validation
    const category = form.querySelector('#category');
    if (!category.value) {
        showFieldError(category, 'Please select a category');
        isValid = false;
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
    }
}

async function handleAddSubscription(event) {
    event.preventDefault();
    
    if (!validateForm(event.target)) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        showLoading(submitButton);

        const subscriptionData = {
            serviceName: document.getElementById('serviceName').value,
            amount: parseFloat(document.getElementById('amount').value),
            billingCycle: document.getElementById('billingCycle').value,
            startDate: document.getElementById('startDate').value,
            category: document.getElementById('category').value,
            notes: document.getElementById('notes').value
        };

        await AjaxUtils.makeRequest('/subscriptions', 'POST', subscriptionData);
        
        alert('Subscription added successfully');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message, submitButton);
    } finally {
        hideLoading(submitButton, originalText);
    }
}

async function handleUpdateSubscription(event) {
    event.preventDefault();
    
    if (!validateForm(event.target)) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    const subscriptionId = document.getElementById('subscriptionId').value;
    
    try {
        showLoading(submitButton);

        const subscriptionData = {
            serviceName: document.getElementById('serviceName').value,
            amount: parseFloat(document.getElementById('amount').value),
            billingCycle: document.getElementById('billingCycle').value,
            startDate: document.getElementById('startDate').value,
            category: document.getElementById('category').value,
            notes: document.getElementById('notes').value
        };

        await AjaxUtils.makeRequest(`/subscriptions/${subscriptionId}`, 'PUT', subscriptionData);
        
        alert('Subscription updated successfully');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message, submitButton);
    } finally {
        hideLoading(submitButton, originalText);
    }
}

async function handleDeleteSubscription(subscriptionId) {
    if (!confirm('Are you sure you want to delete this subscription?')) {
        return;
    }

    const deleteButton = document.getElementById('deleteBtn');
    const originalText = deleteButton.innerHTML;
    
    try {
        showLoading(deleteButton);
        await AjaxUtils.makeRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
        
        alert('Subscription deleted successfully');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message, deleteButton);
    } finally {
        hideLoading(deleteButton, originalText);
    }
}