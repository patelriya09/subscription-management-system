// Settings page functionality
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {
    emailReminders: true,
    reminderDays: 7
};

function saveUserSettings() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    loadUserProfile();
    loadNotificationSettings();
});

function loadUserProfile() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('profileFirstName').value = currentUser.firstName || '';
        document.getElementById('profileLastName').value = currentUser.lastName || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
    }
}

function loadNotificationSettings() {
    document.getElementById('emailReminders').checked = userSettings.emailReminders;
    document.getElementById('reminderDays').value = userSettings.reminderDays;
}

// Profile update handler
function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (!validateForm('profileForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email')
    };
    
    if (updateUserProfile(updatedData)) {
        showNotification('Profile updated successfully!', 'success');
    } else {
        showNotification('Failed to update profile', 'error');
    }
}

// Password update handler
function handlePasswordUpdate(event) {
    event.preventDefault();
    
    if (!validateForm('passwordForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Check current password
    if (currentUser.password !== currentPassword) {
        showError(document.getElementById('currentPassword'), 'Current password is incorrect');
        return;
    }
    
    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
        showError(document.getElementById('confirmNewPassword'), 'New passwords do not match');
        return;
    }
    
    // Update password
    if (updateUserProfile({ password: newPassword })) {
        showNotification('Password updated successfully!', 'success');
        event.target.reset();
    } else {
        showNotification('Failed to update password', 'error');
    }
}

// Notification settings handler
function handleNotificationUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    userSettings.emailReminders = formData.get('emailReminders') === 'on';
    userSettings.reminderDays = parseInt(formData.get('reminderDays'));
    
    saveUserSettings();
    showNotification('Notification settings saved!', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all subscription data? This action cannot be undone.')) {
        subscriptions = [];
        saveSubscriptions();
        showNotification('All subscription data has been cleared', 'success');
        
        // Redirect to dashboard to see empty state
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

// Delete account
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.')) {
        if (confirm('This is your final warning. Click OK to permanently delete your account.')) {
            // Remove user from users array
            const currentUser = getCurrentUser();
            if (currentUser) {
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users.splice(userIndex, 1);
                    saveUsers();
                }
            }
            
            // Clear all user data
            clearCurrentUser();
            subscriptions = [];
            saveSubscriptions();
            userSettings = {
                emailReminders: true,
                reminderDays: 7
            };
            saveUserSettings();
            
            showNotification('Account deleted successfully', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

// Enhanced export functionality
function exportData() {
    const exportData = {
        subscriptions: subscriptions,
        userSettings: userSettings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// Enhanced import functionality
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Handle different export formats
            if (importedData.subscriptions && Array.isArray(importedData.subscriptions)) {
                // New format with metadata
                subscriptions = importedData.subscriptions;
                if (importedData.userSettings) {
                    userSettings = { ...userSettings, ...importedData.userSettings };
                    saveUserSettings();
                    loadNotificationSettings();
                }
            } else if (Array.isArray(importedData)) {
                // Old format - just subscriptions array
                subscriptions = importedData;
            } else {
                showNotification('Invalid file format', 'error');
                return;
            }
            
            saveSubscriptions();
            showNotification('Data imported successfully!', 'success');
            
            // Redirect to dashboard to see imported data
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            showNotification('Error reading file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Get user statistics
function getUserStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const userCreatedDate = new Date(currentUser.createdAt);
    const daysSinceJoined = Math.floor((new Date() - userCreatedDate) / (1000 * 60 * 60 * 24));
    
    return {
        daysSinceJoined,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(sub => sub.status === 'Active').length,
        totalMonthlyCost: subscriptions.reduce((sum, sub) => {
            return sub.status === 'Active' ? sum + parseFloat(sub.amount) : sum;
        }, 0)
    };
}

// Show user statistics in a modal
function showUserStats() {
    const stats = getUserStats();
    if (!stats) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Your Statistics</h2>
            <div class="stats-grid" style="margin-top: 1rem;">
                <div class="stat-card">
                    <h3>Days Since Joined</h3>
                    <div class="value">${stats.daysSinceJoined}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Subscriptions</h3>
                    <div class="value">${stats.totalSubscriptions}</div>
                </div>
                <div class="stat-card">
                    <h3>Active Subscriptions</h3>
                    <div class="value">${stats.activeSubscriptions}</div>
                </div>
                <div class="stat-card">
                    <h3>Monthly Cost</h3>
                    <div class="value">$${stats.totalMonthlyCost.toFixed(2)}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
