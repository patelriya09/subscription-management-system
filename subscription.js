// Subscription Types
const SubscriptionFrequency = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    QUARTERLY: 'quarterly'
};

const SubscriptionStatus = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELED: 'canceled',
    PENDING: 'pending'
};

class SubscriptionManager {
    constructor() {
        this.subscriptions = [];
        this.loadSubscriptions();
    }

    loadSubscriptions() {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        const userSubscriptions = localStorage.getItem(`subscriptions_${userId}`);
        this.subscriptions = userSubscriptions ? JSON.parse(userSubscriptions) : [];
    }

    saveSubscriptions() {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        localStorage.setItem(`subscriptions_${userId}`, JSON.stringify(this.subscriptions));
    }

    getCurrentUserId() {
        const session = localStorage.getItem('session');
        if (!session) return null;

        const sessionData = JSON.parse(session);
        return sessionData.id;
    }

    addSubscription(subscriptionData) {
        const newSubscription = {
            id: Date.now().toString(),
            userId: this.getCurrentUserId(),
            createdAt: new Date().toISOString(),
            status: SubscriptionStatus.ACTIVE,
            ...subscriptionData
        };

        this.subscriptions.push(newSubscription);
        this.saveSubscriptions();
        return newSubscription;
    }

    updateSubscription(id, updates) {
        const index = this.subscriptions.findIndex(sub => sub.id === id);
        if (index === -1) return null;

        this.subscriptions[index] = {
            ...this.subscriptions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveSubscriptions();
        return this.subscriptions[index];
    }

    deleteSubscription(id) {
        const index = this.subscriptions.findIndex(sub => sub.id === id);
        if (index === -1) return false;

        this.subscriptions.splice(index, 1);
        this.saveSubscriptions();
        return true;
    }

    getSubscription(id) {
        return this.subscriptions.find(sub => sub.id === id);
    }

    getAllSubscriptions() {
        return [...this.subscriptions];
    }

    getActiveSubscriptions() {
        return this.subscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE);
    }

    getSubscriptionsByStatus(status) {
        return this.subscriptions.filter(sub => sub.status === status);
    }

    getTotalMonthlySpend() {
        return this.getActiveSubscriptions().reduce((total, sub) => {
            if (sub.frequency === SubscriptionFrequency.MONTHLY) {
                return total + parseFloat(sub.amount);
            }
            if (sub.frequency === SubscriptionFrequency.YEARLY) {
                return total + (parseFloat(sub.amount) / 12);
            }
            if (sub.frequency === SubscriptionFrequency.QUARTERLY) {
                return total + (parseFloat(sub.amount) / 3);
            }
            return total;
        }, 0);
    }

    getUpcomingPayments(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return this.getActiveSubscriptions()
            .map(sub => {
                const nextBilling = new Date(sub.nextBillingDate);
                if (nextBilling <= futureDate && nextBilling >= today) {
                    return {
                        ...sub,
                        daysUntilBilling: Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24))
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.daysUntilBilling - b.daysUntilBilling);
    }

    calculateNextBillingDate(subscription) {
        const currentBilling = new Date(subscription.nextBillingDate);
        const newBilling = new Date(currentBilling);

        switch (subscription.frequency) {
            case SubscriptionFrequency.MONTHLY:
                newBilling.setMonth(currentBilling.getMonth() + 1);
                break;
            case SubscriptionFrequency.YEARLY:
                newBilling.setFullYear(currentBilling.getFullYear() + 1);
                break;
            case SubscriptionFrequency.QUARTERLY:
                newBilling.setMonth(currentBilling.getMonth() + 3);
                break;
        }

        return newBilling.toISOString();
    }

    getSubscriptionStats() {
        const active = this.getActiveSubscriptions();
        const monthlySpend = this.getTotalMonthlySpend();
        const upcomingPayments = this.getUpcomingPayments();
        const nextPayment = upcomingPayments[0];

        return {
            totalActive: active.length,
            monthlySpend,
            nextPaymentDue: nextPayment ? nextPayment.daysUntilBilling : null,
            nextPaymentAmount: nextPayment ? nextPayment.amount : null,
            totalSubscriptions: this.subscriptions.length,
            upcomingPaymentsCount: upcomingPayments.length
        };
    }
}

// Initialize and export subscription manager
const subscriptionManager = new SubscriptionManager();

// Add demo data for testing
if (!localStorage.getItem('demo_data_added')) {
    const demoSubscriptions = [
        {
            name: 'Netflix',
            amount: '14.99',
            frequency: SubscriptionFrequency.MONTHLY,
            category: 'Entertainment',
            nextBillingDate: '2025-10-01',
            description: 'Standard HD streaming plan'
        },
        {
            name: 'Spotify',
            amount: '9.99',
            frequency: SubscriptionFrequency.MONTHLY,
            category: 'Music',
            nextBillingDate: '2025-09-28',
            description: 'Premium individual plan'
        },
        {
            name: 'Adobe Creative Cloud',
            amount: '52.99',
            frequency: SubscriptionFrequency.MONTHLY,
            category: 'Software',
            nextBillingDate: '2025-10-15',
            description: 'All apps plan'
        }
    ];

    demoSubscriptions.forEach(sub => subscriptionManager.addSubscription(sub));
    localStorage.setItem('demo_data_added', 'true');
}