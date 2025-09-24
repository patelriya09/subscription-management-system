// Analytics functionality for subscription dashboard

class SubscriptionAnalytics {
    constructor() {
        this.subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        this.charts = {};
    }

    // Initialize all charts and analytics
    async init() {
        await this.loadChartLibrary();
        this.createSpendingByCategoryChart();
        this.createMonthlyTrendChart();
        this.updateTotalSpending();
        this.updateUpcomingPayments();
        this.generateInsights();
    }

    // Load Chart.js library
    async loadChartLibrary() {
        if (window.Chart) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create spending by category pie chart
    createSpendingByCategoryChart() {
        const categoryData = this.calculateCategorySpending();
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Spending by Category'
                    }
                }
            }
        });
    }

    // Create monthly spending trend line chart
    createMonthlyTrendChart() {
        const trendData = this.calculateMonthlyTrend();
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.months,
                datasets: [{
                    label: 'Monthly Spending',
                    data: trendData.amounts,
                    borderColor: '#36A2EB',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Spending Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    }
                }
            }
        });
    }

    // Calculate total spending by category
    calculateCategorySpending() {
        const categoryTotals = {};
        
        this.subscriptions.forEach(sub => {
            const monthlyAmount = this.getMonthlyAmount(sub);
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyAmount;
        });

        return categoryTotals;
    }

    // Calculate monthly spending trend for the last 6 months
    calculateMonthlyTrend() {
        const months = [];
        const amounts = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            let monthlyTotal = 0;
            this.subscriptions.forEach(sub => {
                const startDate = new Date(sub.startDate);
                if (startDate <= date) {
                    monthlyTotal += this.getMonthlyAmount(sub);
                }
            });
            
            amounts.push(monthlyTotal);
        }

        return { months, amounts };
    }

    // Convert different billing cycles to monthly amounts
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

    // Update total spending display
    updateTotalSpending() {
        const totalMonthly = this.subscriptions.reduce((total, sub) => 
            total + this.getMonthlyAmount(sub), 0);
        
        const totalElement = document.getElementById('totalSpending');
        if (totalElement) {
            totalElement.textContent = `₹${totalMonthly.toFixed(2)}`;
        }
    }

    // Update upcoming payments list
    updateUpcomingPayments() {
        const upcomingElement = document.getElementById('upcomingPayments');
        if (!upcomingElement) return;

        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const upcoming = this.subscriptions
            .map(sub => {
                const nextPayment = this.calculateNextPaymentDate(sub);
                return {
                    ...sub,
                    nextPayment
                };
            })
            .filter(sub => sub.nextPayment <= nextMonth)
            .sort((a, b) => a.nextPayment - b.nextPayment);

        upcomingElement.innerHTML = upcoming.length ? 
            upcoming.map(sub => `
                <div class="payment-item">
                    <span class="service-name">${sub.serviceName}</span>
                    <span class="amount">₹${sub.amount}</span>
                    <span class="date">${sub.nextPayment.toLocaleDateString()}</span>
                </div>
            `).join('') :
            '<p>No upcoming payments this month</p>';
    }

    // Calculate next payment date for a subscription
    calculateNextPaymentDate(subscription) {
        const startDate = new Date(subscription.startDate);
        const today = new Date();
        let nextPayment = new Date(startDate);

        while (nextPayment < today) {
            switch (subscription.billingCycle) {
                case 'yearly':
                    nextPayment.setFullYear(nextPayment.getFullYear() + 1);
                    break;
                case 'quarterly':
                    nextPayment.setMonth(nextPayment.getMonth() + 3);
                    break;
                default:
                    nextPayment.setMonth(nextPayment.getMonth() + 1);
            }
        }

        return nextPayment;
    }

    // Generate spending insights and recommendations
    generateInsights() {
        const insightsElement = document.getElementById('spendingInsights');
        if (!insightsElement) return;

        const insights = [];
        const categoryTotals = this.calculateCategorySpending();
        const totalMonthly = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

        // Category distribution insight
        const highestCategory = Object.entries(categoryTotals)
            .reduce((a, b) => a[1] > b[1] ? a : b);
        const categoryPercentage = ((highestCategory[1] / totalMonthly) * 100).toFixed(1);
        
        insights.push(`Your highest spending category is ${highestCategory[0]} at ${categoryPercentage}% of total spending.`);

        // Trend insight
        const trendData = this.calculateMonthlyTrend();
        const lastTwo = trendData.amounts.slice(-2);
        const monthlyChange = ((lastTwo[1] - lastTwo[0]) / lastTwo[0] * 100).toFixed(1);
        
        if (Math.abs(monthlyChange) > 5) {
            insights.push(`Your monthly spending has ${monthlyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(monthlyChange)}% compared to last month.`);
        }

        // Recommendations
        if (categoryPercentage > 40) {
            insights.push(`Consider reviewing your ${highestCategory[0]} subscriptions to optimize spending.`);
        }

        insightsElement.innerHTML = insights.map(insight => 
            `<div class="insight-item"><i class="fas fa-lightbulb"></i> ${insight}</div>`
        ).join('');
    }
}