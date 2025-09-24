// Notifications page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    loadNotifications();
    updateNotificationStats();
});

function loadNotifications() {
    const notifications = notificationManager.getNotifications();
    const notificationsList = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3>No notifications yet</h3>
                <p>You'll receive notifications for upcoming payments and important updates here.</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notification => {
        const date = new Date(notification.date);
        const timeAgo = getTimeAgo(date);
        const priorityIcon = notification.priority === 'high' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        const priorityColor = notification.priority === 'high' ? '#ef4444' : '#3b82f6';
        
        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon" style="color: ${priorityColor};">
                    <i class="${priorityIcon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-actions">
                        ${!notification.read ? `<button class="btn btn-sm btn-secondary" onclick="markAsRead('${notification.id}')">Mark as Read</button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateNotificationStats() {
    const notifications = notificationManager.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
    
    document.getElementById('totalNotifications').textContent = notifications.length;
    document.getElementById('unreadNotifications').textContent = unreadCount;
    document.getElementById('highPriorityNotifications').textContent = highPriorityCount;
}

function markAsRead(notificationId) {
    notificationManager.markAsRead(notificationId);
    loadNotifications();
    updateNotificationStats();
    showNotification('Notification marked as read', 'success');
}

function markAllAsRead() {
    const notifications = notificationManager.getNotifications();
    notifications.forEach(notification => {
        notification.read = true;
    });
    notificationManager.saveNotifications();
    loadNotifications();
    updateNotificationStats();
    showNotification('All notifications marked as read', 'success');
}

function deleteNotification(notificationId) {
    if (confirm('Are you sure you want to delete this notification?')) {
        const notifications = notificationManager.getNotifications();
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications.splice(index, 1);
            notificationManager.saveNotifications();
            loadNotifications();
            updateNotificationStats();
            showNotification('Notification deleted', 'success');
        }
    }
}

function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
        notificationManager.clearAllNotifications();
        loadNotifications();
        updateNotificationStats();
        showNotification('All notifications cleared', 'success');
    }
}

function filterNotifications() {
    const filter = document.getElementById('notificationFilter').value;
    const notifications = notificationManager.getNotifications();
    let filteredNotifications = notifications;
    
    switch (filter) {
        case 'unread':
            filteredNotifications = notifications.filter(n => !n.read);
            break;
        case 'payment_reminder':
            filteredNotifications = notifications.filter(n => n.type === 'payment_reminder');
            break;
        case 'overdue_reminder':
            filteredNotifications = notifications.filter(n => n.type === 'overdue_reminder');
            break;
        default:
            filteredNotifications = notifications;
    }
    
    const notificationsList = document.getElementById('notificationsList');
    
    if (filteredNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3>No notifications match your filter</h3>
                <p>Try adjusting your filter criteria.</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = filteredNotifications.map(notification => {
        const date = new Date(notification.date);
        const timeAgo = getTimeAgo(date);
        const priorityIcon = notification.priority === 'high' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        const priorityColor = notification.priority === 'high' ? '#ef4444' : '#3b82f6';
        
        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon" style="color: ${priorityColor};">
                    <i class="${priorityIcon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-actions">
                        ${!notification.read ? `<button class="btn btn-sm btn-secondary" onclick="markAsRead('${notification.id}')">Mark as Read</button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Test notification function (for development)
function testNotification() {
    const testNotification = {
        id: `test_${Date.now()}`,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working correctly.',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium'
    };
    
    notificationManager.notifications.unshift(testNotification);
    notificationManager.saveNotifications();
    loadNotifications();
    updateNotificationStats();
    showNotification('Test notification added', 'success');
}
