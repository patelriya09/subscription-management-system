// Dashboard initialization and management
function initializeDashboard() {
    updateDashboardStats();
    updateSubscriptionsList();
    initializeCharts();
}

// Update dashboard statistics
function updateDashboardStats() {
    const stats = subscriptionManager.getSubscriptionStats();
    
    // Update stats display
    document.getElementById('activeSubscriptions').textContent = stats.totalActive;
    document.getElementById('monthlySpend').textContent = formatCurrency(stats.monthlySpend);
    
    if (stats.nextPaymentDue !== null) {
        document.getElementById('nextPayment').textContent = `${stats.nextPaymentDue} days`;
        document.getElementById('nextPaymentAmount').textContent = formatCurrency(stats.nextPaymentAmount);
    } else {
        document.getElementById('nextPayment').textContent = 'No payments due';
        document.getElementById('nextPaymentAmount').textContent = '';
    }
    
    document.getElementById('upcomingPayments').textContent = stats.upcomingPaymentsCount;
}

// Update subscriptions list
function updateSubscriptionsList() {
    const subscriptionItems = document.getElementById('subscriptionItems');
    const subscriptions = subscriptionManager.getActiveSubscriptions();

    if (subscriptions.length === 0) {
        subscriptionItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No active subscriptions found</p>
                <a href="add-subscription.html" class="btn btn-primary">Add Your First Subscription</a>
            </div>
        `;
        return;
    }

    subscriptionItems.innerHTML = subscriptions
        .map(sub => createSubscriptionItemHTML(sub))
        .join('');
}

// Create HTML for a subscription item
function createSubscriptionItemHTML(subscription) {
    const dueDate = new Date(subscription.nextBillingDate);
    const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <div class="subscription-item" data-id="${subscription.id}">
            <div class="subscription-info">
                <h3>${subscription.name}</h3>
                <div class="subscription-meta">
                    Next payment: ${formatDate(subscription.nextBillingDate)}
                    ${subscription.description ? `<br><span class="description">${subscription.description}</span>` : ''}
                </div>
            </div>
            <div class="subscription-details">
                <div class="subscription-price">
                    ${formatCurrency(subscription.amount)}/${subscription.frequency}
                </div>
                <span class="status-badge ${daysUntilDue <= 7 ? 'status-upcoming' : 'status-active'}">
                    ${daysUntilDue <= 7 ? 'Due Soon' : 'Active'}
                </span>
            </div>
            <div class="subscription-actions">
                <button class="btn-icon" onclick="editSubscription('${subscription.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteSubscription('${subscription.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Initialize charts
function initializeCharts() {
    initializeExpenseChart();
    initializeCategoryChart();
}

// Initialize expense trend chart
function initializeExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const subscriptions = subscriptionManager.getAllSubscriptions();
    
    // Group subscriptions by month
    const monthlyData = subscriptions.reduce((acc, sub) => {
        const date = new Date(sub.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + parseFloat(sub.amount);
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Monthly Expenses',
                data: Object.values(monthlyData),
                borderColor: '#3498db',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Expense Trend'
                }
            }
        }
    });
}

// Initialize category distribution chart
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const subscriptions = subscriptionManager.getAllSubscriptions();
    
    // Group subscriptions by category
    const categoryData = subscriptions.reduce((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + parseFloat(sub.amount);
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#3498db',
                    '#e74c3c',
                    '#2ecc71',
                    '#f1c40f',
                    '#9b59b6',
                    '#e67e22'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        }
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(dateString));
}

// Subscription actions
function editSubscription(id) {
    window.location.href = `edit-subscription.html?id=${id}`;
}

function deleteSubscription(id) {
    if (confirm('Are you sure you want to delete this subscription?')) {
        subscriptionManager.deleteSubscription(id);
        updateDashboardStats();
        updateSubscriptionsList();
        initializeCharts();
    }
}