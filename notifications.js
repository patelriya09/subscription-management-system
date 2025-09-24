// Notification and Email Reminder System
class NotificationManager {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.emailQueue = JSON.parse(localStorage.getItem('emailQueue')) || [];
        this.reminderSettings = JSON.parse(localStorage.getItem('reminderSettings')) || {
            enabled: true,
            daysBefore: 7,
            emailAddress: '',
            lastCheck: null
        };
        
        this.init();
    }
    
    init() {
        // Check for reminders every time the app loads
        this.checkUpcomingPayments();
        
        // Set up periodic checking (every hour)
        setInterval(() => {
            this.checkUpcomingPayments();
        }, 60 * 60 * 1000); // 1 hour
    }
    
    // Check for upcoming payments and send reminders
    checkUpcomingPayments() {
        if (!this.reminderSettings.enabled) return;
        
        const today = new Date();
        const reminderDate = new Date(today.getTime() + (this.reminderSettings.daysBefore * 24 * 60 * 60 * 1000));
        
        const upcomingSubscriptions = subscriptions.filter(sub => {
            if (sub.status !== 'Active') return false;
            
            const billingDate = new Date(sub.billingDate);
            const daysUntilBilling = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
            
            return daysUntilBilling <= this.reminderSettings.daysBefore && daysUntilBilling >= 0;
        });
        
        upcomingSubscriptions.forEach(subscription => {
            this.sendPaymentReminder(subscription);
        });
        
        // Update last check time
        this.reminderSettings.lastCheck = new Date().toISOString();
        localStorage.setItem('reminderSettings', JSON.stringify(this.reminderSettings));
    }
    
    // Send payment reminder (simulated email)
    sendPaymentReminder(subscription) {
        const reminderId = `reminder_${subscription.id}_${subscription.billingDate}`;
        
        // Check if we already sent a reminder for this subscription and date
        if (this.notifications.some(n => n.id === reminderId)) {
            return;
        }
        
        const billingDate = new Date(subscription.billingDate);
        const daysUntilBilling = Math.ceil((billingDate - new Date()) / (1000 * 60 * 60 * 24));
        
        const notification = {
            id: reminderId,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `Your ${subscription.serviceName} subscription ($${subscription.amount}) is due in ${daysUntilBilling} day${daysUntilBilling !== 1 ? 's' : ''} on ${billingDate.toLocaleDateString()}.`,
            subscriptionId: subscription.id,
            date: new Date().toISOString(),
            read: false,
            priority: daysUntilBilling <= 3 ? 'high' : 'medium'
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        
        // Add to email queue (simulated)
        this.addToEmailQueue(notification);
        
        // Show in-app notification
        this.showInAppNotification(notification);
    }
    
    // Add notification to email queue
    addToEmailQueue(notification) {
        const email = {
            id: `email_${Date.now()}`,
            to: this.reminderSettings.emailAddress || 'user@example.com',
            subject: `Payment Reminder: ${notification.message.split(' ')[2]} Subscription`,
            body: this.generateEmailBody(notification),
            status: 'pending',
            createdAt: new Date().toISOString(),
            scheduledFor: new Date().toISOString()
        };
        
        this.emailQueue.push(email);
        localStorage.setItem('emailQueue', JSON.stringify(this.emailQueue));
        
        // Simulate email sending
        this.simulateEmailSending(email);
    }
    
    // Generate email body
    generateEmailBody(notification) {
        const subscription = subscriptions.find(s => s.id === notification.subscriptionId);
        if (!subscription) return '';
        
        return `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #3b82f6;">Payment Reminder</h2>
                        <p>Hello,</p>
                        <p>This is a friendly reminder that your subscription payment is coming up:</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">${subscription.serviceName}</h3>
                            <p><strong>Amount:</strong> $${subscription.amount}</p>
                            <p><strong>Due Date:</strong> ${new Date(subscription.billingDate).toLocaleDateString()}</p>
                        </div>
                        
                        <p>Please ensure your payment method is up to date to avoid any service interruptions.</p>
                        
                        <p>Best regards,<br>Subscription Manager Team</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 12px; color: #64748b;">
                            This is an automated reminder from your Subscription Manager. 
                            You can manage your notification preferences in the settings.
                        </p>
                    </div>
                </body>
            </html>
        `;
    }
    
    // Simulate email sending
    simulateEmailSending(email) {
        setTimeout(() => {
            email.status = 'sent';
            email.sentAt = new Date().toISOString();
            localStorage.setItem('emailQueue', JSON.stringify(this.emailQueue));
            
            console.log(`📧 Email sent: ${email.subject}`);
        }, 2000); // Simulate 2-second delay
    }
    
    // Show in-app notification
    showInAppNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.priority}`;
        notificationElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-bell" style="color: #f59e0b;"></i>
                <div>
                    <strong>${notification.title}</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">${notification.message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #64748b; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notificationElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        if (notification.priority === 'high') {
            notificationElement.style.backgroundColor = '#ef4444';
        } else {
            notificationElement.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(notificationElement);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, 10000);
    }
    
    // Get all notifications
    getNotifications() {
        return this.notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }
    
    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
    }
    
    // Update reminder settings
    updateReminderSettings(settings) {
        this.reminderSettings = { ...this.reminderSettings, ...settings };
        localStorage.setItem('reminderSettings', JSON.stringify(this.reminderSettings));
    }
    
    // Get email queue (for admin/debugging)
    getEmailQueue() {
        return this.emailQueue;
    }
    
    // Save notifications to localStorage
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
    
    // Check for overdue payments
    checkOverduePayments() {
        const today = new Date();
        const overdueSubscriptions = subscriptions.filter(sub => {
            if (sub.status !== 'Active') return false;
            
            const billingDate = new Date(sub.billingDate);
            return billingDate < today;
        });
        
        overdueSubscriptions.forEach(subscription => {
            this.sendOverdueReminder(subscription);
        });
    }
    
    // Send overdue payment reminder
    sendOverdueReminder(subscription) {
        const reminderId = `overdue_${subscription.id}_${subscription.billingDate}`;
        
        if (this.notifications.some(n => n.id === reminderId)) {
            return;
        }
        
        const billingDate = new Date(subscription.billingDate);
        const daysOverdue = Math.ceil((today - billingDate) / (1000 * 60 * 60 * 24));
        
        const notification = {
            id: reminderId,
            type: 'overdue_reminder',
            title: 'Payment Overdue',
            message: `Your ${subscription.serviceName} subscription ($${subscription.amount}) is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue. Please update your payment immediately.`,
            subscriptionId: subscription.id,
            date: new Date().toISOString(),
            read: false,
            priority: 'high'
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.showInAppNotification(notification);
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Export functions for use in other files
window.NotificationManager = NotificationManager;
window.notificationManager = notificationManager;
