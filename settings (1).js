// Settings management functionality

class SettingsManager {
    constructor() {
        this.defaultSettings = {
            currency: {
                code: 'INR',
                symbol: '₹',
                display: 'symbolFirst'
            },
            notifications: {
                email: false,
                browser: true,
                reminderDays: 3
            },
            display: {
                theme: 'system',
                dateFormat: 'DD/MM/YYYY'
            },
            lastBackup: null
        };
        this.settings = this.loadSettings();
        this.initializeEventListeners();
    }

    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('userSettings');
        return savedSettings ? JSON.parse(savedSettings) : this.defaultSettings;
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('userSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Currency settings
        const currencySelect = document.getElementById('defaultCurrency');
        const currencyDisplayInputs = document.querySelectorAll('input[name="currencyDisplay"]');
        
        currencySelect.value = this.settings.currency.code;
        document.querySelector(`input[value="${this.settings.currency.display}"]`).checked = true;

        currencySelect.addEventListener('change', (e) => {
            this.settings.currency.code = e.target.value;
            this.settings.currency.symbol = this.getCurrencySymbol(e.target.value);
            this.saveSettings();
        });

        currencyDisplayInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.currency.display = e.target.value;
                this.saveSettings();
            });
        });

        // Notification settings
        const emailNotif = document.getElementById('emailNotifications');
        const browserNotif = document.getElementById('browserNotifications');
        const reminderDays = document.getElementById('reminderDays');

        emailNotif.checked = this.settings.notifications.email;
        browserNotif.checked = this.settings.notifications.browser;
        reminderDays.value = this.settings.notifications.reminderDays;

        emailNotif.addEventListener('change', (e) => {
            this.settings.notifications.email = e.target.checked;
            this.saveSettings();
        });

        browserNotif.addEventListener('change', (e) => {
            this.settings.notifications.browser = e.target.checked;
            if (e.target.checked) {
                this.requestNotificationPermission();
            }
            this.saveSettings();
        });

        reminderDays.addEventListener('change', (e) => {
            this.settings.notifications.reminderDays = parseInt(e.target.value);
            this.saveSettings();
        });

        // Display settings
        const themeSelect = document.getElementById('theme');
        const dateFormatSelect = document.getElementById('dateFormat');

        themeSelect.value = this.settings.display.theme;
        dateFormatSelect.value = this.settings.display.dateFormat;

        themeSelect.addEventListener('change', (e) => {
            this.settings.display.theme = e.target.value;
            this.saveSettings();
        });

        dateFormatSelect.addEventListener('change', (e) => {
            this.settings.display.dateFormat = e.target.value;
            this.saveSettings();
        });

        // Data management
        const exportBtn = document.getElementById('exportData');
        const importBtn = document.getElementById('importData');
        const importFile = document.getElementById('importFile');

        exportBtn.addEventListener('click', () => this.exportData());
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => this.importData(e));

        // Update data info
        this.updateDataInfo();
    }

    // Apply current settings
    applySettings() {
        // Apply theme
        document.body.dataset.theme = this.settings.display.theme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.settings.display.theme;

        // Update data info
        this.updateDataInfo();

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: this.settings }));
    }

    // Get currency symbol
    getCurrencySymbol(currencyCode) {
        const symbols = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };
        return symbols[currencyCode] || currencyCode;
    }

    // Format currency amount
    formatCurrency(amount) {
        const { code, symbol, display } = this.settings.currency;
        return display === 'symbolFirst' 
            ? `${symbol}${amount.toFixed(2)}`
            : `${amount.toFixed(2)}${symbol}`;
    }

    // Format date according to settings
    formatDate(date) {
        const d = new Date(date);
        const format = this.settings.display.dateFormat;
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();

        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return d.toLocaleDateString();
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('We need notification permission to send payment reminders');
            this.settings.notifications.browser = false;
            document.getElementById('browserNotifications').checked = false;
            this.saveSettings();
        }
    }

    // Export data
    exportData() {
        const data = {
            settings: this.settings,
            subscriptions: JSON.parse(localStorage.getItem('subscriptions') || '[]'),
            user: JSON.parse(localStorage.getItem('user') || 'null')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscription-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.settings.lastBackup = new Date().toISOString();
        this.saveSettings();
    }

    // Import data
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.settings || !data.subscriptions) {
                    throw new Error('Invalid backup file format');
                }

                // Import data
                localStorage.setItem('userSettings', JSON.stringify(data.settings));
                localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                this.settings = this.loadSettings();
                this.applySettings();
                
                alert('Data imported successfully');
                location.reload();
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Update data info display
    updateDataInfo() {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const lastBackupElement = document.getElementById('lastBackup');
        const subscriptionCountElement = document.getElementById('subscriptionCount');

        if (lastBackupElement) {
            lastBackupElement.textContent = this.settings.lastBackup 
                ? this.formatDate(this.settings.lastBackup)
                : 'Never';
        }

        if (subscriptionCountElement) {
            subscriptionCountElement.textContent = subscriptions.length;
        }
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize settings manager
    const settingsManager = new SettingsManager();
});