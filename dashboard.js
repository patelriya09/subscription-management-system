// Dashboard-specific functions
function handleAddSubscription(event) {
    event.preventDefault();
    
    if (!validateForm('addSubscriptionForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const subscription = {
        serviceName: formData.get('serviceName'),
        amount: parseFloat(formData.get('amount')),
        billingDate: formData.get('billingDate'),
        status: formData.get('status')
    };
    
    addSubscription(subscription);
    renderSubscriptionsTable();
    updateStats();
    closeModal('addSubscriptionModal');
    
    // Reset form
    event.target.reset();
    
    showNotification('Subscription added successfully!', 'success');
}

function handleEditSubscription(event) {
    event.preventDefault();
    
    if (!validateForm('editSubscriptionForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const subscriptionId = parseInt(event.target.dataset.subscriptionId);
    
    const updatedSubscription = {
        serviceName: formData.get('serviceName'),
        amount: parseFloat(formData.get('amount')),
        billingDate: formData.get('billingDate'),
        status: formData.get('status')
    };
    
    if (updateSubscription(subscriptionId, updatedSubscription)) {
        renderSubscriptionsTable();
        updateStats();
        closeModal('editSubscriptionModal');
        showNotification('Subscription updated successfully!', 'success');
    } else {
        showNotification('Failed to update subscription', 'error');
    }
}

// Enhanced dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Load dashboard data
    loadDashboard();
    
    // Set default billing date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('billingDate').value = today;
    
    // Add some sample data if no subscriptions exist
    if (subscriptions.length === 0) {
        addSampleData();
    }
});

function addSampleData() {
    const sampleSubscriptions = [
        {
            serviceName: 'Netflix',
            amount: 15.99,
            billingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
            status: 'Active'
        },
        {
            serviceName: 'Spotify Premium',
            amount: 9.99,
            billingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
            status: 'Active'
        },
        {
            serviceName: 'Adobe Creative Cloud',
            amount: 52.99,
            billingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
            status: 'Active'
        },
        {
            serviceName: 'Microsoft Office 365',
            amount: 6.99,
            billingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
            status: 'Expired'
        }
    ];
    
    sampleSubscriptions.forEach(sub => {
        addSubscription(sub);
    });
    
    renderSubscriptionsTable();
    updateStats();
}

// Enhanced search functionality
function searchSubscriptions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredSubscriptions = subscriptions;
    
    // Apply search filter
    if (searchTerm) {
        filteredSubscriptions = filteredSubscriptions.filter(sub => 
            sub.serviceName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === statusFilter);
    }
    
    renderFilteredSubscriptions(filteredSubscriptions);
}

// Enhanced filter functionality
function filterByStatus() {
    searchSubscriptions(); // This will apply both search and status filters
}

// Calculate days until billing
function getDaysUntilBilling(billingDate) {
    const today = new Date();
    const billing = new Date(billingDate);
    const diffTime = billing - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Enhanced table rendering with billing information
function renderSubscriptionsTable() {
    const tbody = document.querySelector('#subscriptionsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (subscriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No subscriptions found. <a href="#" onclick="openModal('addSubscriptionModal')" style="color: #3b82f6;">Add your first subscription</a>
                </td>
            </tr>
        `;
        return;
    }

    subscriptions.forEach(subscription => {
        const row = document.createElement('tr');
        const daysUntilBilling = getDaysUntilBilling(subscription.billingDate);
        
        let billingInfo = formatDate(subscription.billingDate);
        if (subscription.status === 'Active') {
            if (daysUntilBilling < 0) {
                billingInfo += ` <span style="color: #ef4444; font-size: 0.875rem;">(Overdue by ${Math.abs(daysUntilBilling)} days)</span>`;
            } else if (daysUntilBilling <= 7) {
                billingInfo += ` <span style="color: #f59e0b; font-size: 0.875rem;">(${daysUntilBilling} days left)</span>`;
            }
        }
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-${getServiceIcon(subscription.serviceName)}" style="color: #3b82f6;"></i>
                    ${subscription.serviceName}
                </div>
            </td>
            <td><strong>$${subscription.amount.toFixed(2)}</strong></td>
            <td>${billingInfo}</td>
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

// Get appropriate icon for service
function getServiceIcon(serviceName) {
    const name = serviceName.toLowerCase();
    if (name.includes('netflix')) return 'tv';
    if (name.includes('spotify') || name.includes('music')) return 'music';
    if (name.includes('adobe')) return 'paint-brush';
    if (name.includes('microsoft') || name.includes('office')) return 'file-word';
    if (name.includes('google')) return 'google';
    if (name.includes('amazon')) return 'amazon';
    if (name.includes('apple')) return 'apple';
    if (name.includes('youtube')) return 'youtube';
    if (name.includes('dropbox')) return 'dropbox';
    if (name.includes('slack')) return 'slack';
    return 'credit-card';
}

// Enhanced stats calculation
function updateStats() {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active').length;
    const totalAmount = subscriptions.reduce((sum, sub) => {
        return sub.status === 'Active' ? sum + parseFloat(sub.amount) : sum;
    }, 0);
    
    const upcomingPayments = subscriptions.filter(sub => {
        if (sub.status !== 'Active') return false;
        const daysUntilBilling = getDaysUntilBilling(sub.billingDate);
        return daysUntilBilling <= 7 && daysUntilBilling >= 0;
    }).length;

    // Update DOM elements
    const activeEl = document.getElementById('activeSubscriptions');
    const totalEl = document.getElementById('totalAmount');
    const upcomingEl = document.getElementById('upcomingPayments');
    
    if (activeEl) activeEl.textContent = activeSubscriptions;
    if (totalEl) totalEl.textContent = `$${totalAmount.toFixed(2)}`;
    if (upcomingEl) upcomingEl.textContent = upcomingPayments;
}

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(subscriptions, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscriptions-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// Import data functionality
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                subscriptions = importedData;
                saveSubscriptions();
                renderSubscriptionsTable();
                updateStats();
                showNotification('Data imported successfully!', 'success');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            showNotification('Error reading file', 'error');
        }
    };
    reader.readAsText(file);
}
