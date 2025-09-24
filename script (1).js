// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = input.parentNode.querySelector('.error');
        
        if (!input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        } else {
            clearError(input);
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Password validation
        if (input.type === 'password' && input.value) {
            if (input.value.length < 6) {
                showError(input, 'Password must be at least 6 characters long');
                isValid = false;
            }
        }
    });

    return isValid;
}

function showError(input, message) {
    clearError(input);
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    input.parentNode.appendChild(errorElement);
    input.style.borderColor = '#ef4444';
}

function clearError(input) {
    const errorElement = input.parentNode.querySelector('.error');
    if (errorElement) {
        errorElement.remove();
    }
    input.style.borderColor = '#e5e7eb';
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Subscription Management Functions
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];

function saveSubscriptions() {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
}

function addSubscription(subscription) {
    subscription.id = Date.now();
    subscriptions.push(subscription);
    saveSubscriptions();
    return subscription;
}

function updateSubscription(id, updatedSubscription) {
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
        subscriptions[index] = { ...subscriptions[index], ...updatedSubscription };
        saveSubscriptions();
        return true;
    }
    return false;
}

function deleteSubscription(id) {
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
        subscriptions.splice(index, 1);
        saveSubscriptions();
        return true;
    }
    return false;
}

function getSubscriptionById(id) {
    return subscriptions.find(sub => sub.id === id);
}

// Dashboard Functions
function loadDashboard() {
    if (typeof window !== 'undefined' && window.location.pathname.includes('dashboard.html')) {
        updateStats();
        renderSubscriptionsTable();
    }
}

function updateStats() {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active').length;
    const totalAmount = subscriptions.reduce((sum, sub) => {
        return sub.status === 'Active' ? sum + parseFloat(sub.amount) : sum;
    }, 0);
    
    const upcomingPayments = subscriptions.filter(sub => {
        if (sub.status !== 'Active') return false;
        const today = new Date();
        const billingDate = new Date(sub.billingDate);
        const daysUntilBilling = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilBilling <= 7 && daysUntilBilling >= 0;
    }).length;

    document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('upcomingPayments').textContent = upcomingPayments;
}

function renderSubscriptionsTable() {
    const tbody = document.querySelector('#subscriptionsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    subscriptions.forEach(subscription => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subscription.serviceName}</td>
            <td>$${subscription.amount}</td>
            <td>${formatDate(subscription.billingDate)}</td>
            <td><span class="status-badge status-${subscription.status.toLowerCase()}">${subscription.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="editSubscription(${subscription.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteSubscriptionConfirm(${subscription.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function editSubscription(id) {
    const subscription = getSubscriptionById(id);
    if (!subscription) return;

    // Populate form with existing data
    document.getElementById('editServiceName').value = subscription.serviceName;
    document.getElementById('editAmount').value = subscription.amount;
    document.getElementById('editBillingDate').value = subscription.billingDate;
    document.getElementById('editStatus').value = subscription.status;

    // Store the ID for the update
    document.getElementById('editSubscriptionForm').dataset.subscriptionId = id;

    openModal('editSubscriptionModal');
}

function deleteSubscriptionConfirm(id) {
    if (confirm('Are you sure you want to delete this subscription?')) {
        if (deleteSubscription(id)) {
            renderSubscriptionsTable();
            updateStats();
            showNotification('Subscription deleted successfully', 'success');
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Search and Filter Functions
function searchSubscriptions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredSubscriptions = subscriptions.filter(sub => 
        sub.serviceName.toLowerCase().includes(searchTerm)
    );
    renderFilteredSubscriptions(filteredSubscriptions);
}

function filterByStatus() {
    const status = document.getElementById('statusFilter').value;
    let filteredSubscriptions = subscriptions;

    if (status !== 'all') {
        filteredSubscriptions = subscriptions.filter(sub => sub.status === status);
    }

    renderFilteredSubscriptions(filteredSubscriptions);
}

function renderFilteredSubscriptions(filteredSubscriptions) {
    const tbody = document.querySelector('#subscriptionsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    filteredSubscriptions.forEach(subscription => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subscription.serviceName}</td>
            <td>$${subscription.amount}</td>
            <td>${formatDate(subscription.billingDate)}</td>
            <td><span class="status-badge status-${subscription.status.toLowerCase()}">${subscription.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="editSubscription(${subscription.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteSubscriptionConfirm(${subscription.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
