// Budget management functionality

class BudgetManager {
    constructor() {
        this.settingsManager = new SettingsManager();
        this.currentBudget = this.loadBudget();
        this.subscriptions = this.loadSubscriptions();
        this.initializeEventListeners();
        this.updateDisplay();
    }

    // Load budget data from localStorage
    loadBudget() {
        const defaultBudget = {
            monthly: 0,
            categories: {},
            alerts: {
                thresholds: [75, 90, 100],
                method: 'browser'
            }
        };
        return JSON.parse(localStorage.getItem('budget')) || defaultBudget;
    }

    // Load subscriptions from localStorage
    loadSubscriptions() {
        return JSON.parse(localStorage.getItem('subscriptions')) || [];
    }

    // Save budget data to localStorage
    saveBudget() {
        localStorage.setItem('budget', JSON.stringify(this.currentBudget));
        this.updateDisplay();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Forecast period change
        document.getElementById('forecastPeriod').addEventListener('change', () => {
            this.updateForecastChart();
        });

        // Alert settings
        document.getElementById('alertMethod').addEventListener('change', (e) => {
            this.currentBudget.alerts.method = e.target.value;
            this.saveBudget();
        });

        // Threshold checkboxes
        ['75', '90', '100'].forEach(threshold => {
            document.getElementById(`threshold${threshold}`).addEventListener('change', (e) => {
                const value = parseInt(threshold);
                const thresholds = this.currentBudget.alerts.thresholds;
                
                if (e.target.checked && !thresholds.includes(value)) {
                    thresholds.push(value);
                } else if (!e.target.checked) {
                    const index = thresholds.indexOf(value);
                    if (index > -1) thresholds.splice(index, 1);
                }
                
                thresholds.sort((a, b) => a - b);
                this.saveBudget();
            });
        });
    }

    // Update all displays
    updateDisplay() {
        this.updateBudgetSummary();
        this.updateCategoryBudgets();
        this.updateForecastChart();
        this.checkBudgetAlerts();
    }

    // Update budget summary section
    updateBudgetSummary() {
        const monthlyBudget = this.currentBudget.monthly;
        const currentSpending = this.calculateCurrentSpending();
        const remainingBudget = monthlyBudget - currentSpending;
        const percentageUsed = monthlyBudget > 0 ? (currentSpending / monthlyBudget) * 100 : 0;

        // Update displays
        document.getElementById('monthlyBudgetDisplay').textContent = 
            this.settingsManager.formatCurrency(monthlyBudget);
        document.getElementById('currentSpending').textContent = 
            this.settingsManager.formatCurrency(currentSpending);
        document.getElementById('remainingBudget').textContent = 
            this.settingsManager.formatCurrency(remainingBudget);

        // Update progress bar
        const progressBar = document.getElementById('budgetProgress');
        progressBar.style.width = `${Math.min(percentageUsed, 100)}%`;
        progressBar.className = 'progress' + this.getProgressClass(percentageUsed);
    }

    // Calculate current monthly spending
    calculateCurrentSpending() {
        return this.subscriptions.reduce((total, sub) => {
            return total + this.getMonthlyAmount(sub);
        }, 0);
    }

    // Get monthly amount for a subscription
    getMonthlyAmount(subscription) {
        const amount = parseFloat(subscription.amount);
        switch (subscription.billingCycle) {
            case 'yearly':
                return amount / 12;
            case 'quarterly':
                return amount / 3;
            default:
                return amount;
        }
    }

    // Get progress bar class based on percentage
    getProgressClass(percentage) {
        if (percentage >= 90) return ' danger';
        if (percentage >= 75) return ' warning';
        return '';
    }

    // Update category budgets section
    updateCategoryBudgets() {
        const categoryList = document.getElementById('categoryBudgetsList');
        const categories = this.getCategoryTotals();
        
        categoryList.innerHTML = Object.entries(categories).map(([category, amount]) => {
            const budget = this.currentBudget.categories[category] || 0;
            const percentage = budget > 0 ? (amount / budget) * 100 : 0;
            
            return `
                <div class="category-item">
                    <div class="category-header">
                        <span class="category-name">${category}</span>
                        <span class="category-amount">
                            ${this.settingsManager.formatCurrency(amount)} / 
                            ${this.settingsManager.formatCurrency(budget)}
                        </span>
                    </div>
                    <div class="progress-bar category-progress">
                        <div class="progress${this.getProgressClass(percentage)}" 
                             style="width: ${Math.min(percentage, 100)}%">
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Calculate total spending by category
    getCategoryTotals() {
        const totals = {};
        this.subscriptions.forEach(sub => {
            const monthlyAmount = this.getMonthlyAmount(sub);
            totals[sub.category] = (totals[sub.category] || 0) + monthlyAmount;
        });
        return totals;
    }

    // Update forecast chart
    updateForecastChart() {
        const months = this.getForecastMonths();
        const forecasts = this.calculateForecast(months);
        
        if (this.forecastChart) {
            this.forecastChart.destroy();
        }

        const ctx = document.getElementById('forecastChart').getContext('2d');
        this.forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Projected Spending',
                    data: forecasts,
                    borderColor: '#3498db',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount'
                        }
                    }
                }
            }
        });
    }

    // Get forecast months
    getForecastMonths() {
        const months = [];
        const period = parseInt(document.getElementById('forecastPeriod').value);
        const date = new Date();
        
        for (let i = 0; i < period; i++) {
            months.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
            date.setMonth(date.getMonth() + 1);
        }
        
        return months;
    }

    // Calculate forecast amounts
    calculateForecast(months) {
        const forecasts = [];
        const baseAmount = this.calculateCurrentSpending();
        
        months.forEach((_, index) => {
            // Add some variation for demonstration
            const variation = 1 + (Math.random() * 0.1 - 0.05); // ±5% variation
            forecasts.push(baseAmount * variation);
        });
        
        return forecasts;
    }

    // Check and show budget alerts
    checkBudgetAlerts() {
        const currentSpending = this.calculateCurrentSpending();
        const monthlyBudget = this.currentBudget.monthly;
        
        if (monthlyBudget <= 0) return;

        const percentage = (currentSpending / monthlyBudget) * 100;
        const thresholds = this.currentBudget.alerts.thresholds;
        
        thresholds.forEach(threshold => {
            if (percentage >= threshold) {
                this.showBudgetAlert(threshold, percentage);
            }
        });
    }

    // Show budget alert
    showBudgetAlert(threshold, percentage) {
        const message = `You've used ${percentage.toFixed(1)}% of your monthly budget`;
        
        if (this.currentBudget.alerts.method === 'browser' || 
            this.currentBudget.alerts.method === 'both') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Budget Alert', { body: message });
            }
        }
        
        if (this.currentBudget.alerts.method === 'email' || 
            this.currentBudget.alerts.method === 'both') {
            // In a real application, implement email notification here
            console.log('Email alert:', message);
        }
    }

    // Edit budget amount
    editBudget(type) {
        const modal = document.getElementById('budgetModal');
        const input = document.getElementById('budgetAmount');
        
        if (type === 'monthly') {
            input.value = this.currentBudget.monthly;
        }
        
        modal.classList.add('active');
    }

    // Save budget changes
    saveBudgetChanges() {
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        if (isNaN(amount) || amount < 0) return;
        
        this.currentBudget.monthly = amount;
        this.saveBudget();
        this.closeModal();
    }

    // Close modal
    closeModal() {
        document.getElementById('budgetModal').classList.remove('active');
    }

    // Add category budget
    addCategoryBudget() {
        // Implementation for adding new category budget
    }
}

// Initialize budget manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize budget manager
    window.budgetManager = new BudgetManager();
});

// Global functions for HTML event handlers
function editBudget(type) {
    window.budgetManager.editBudget(type);
}

function saveBudget() {
    window.budgetManager.saveBudgetChanges();
}

function closeModal() {
    window.budgetManager.closeModal();
}

function addCategoryBudget() {
    window.budgetManager.addCategoryBudget();
}