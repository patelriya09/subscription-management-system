// AJAX utility functions for subscription manager

const API_BASE_URL = 'https://api.subscriptionmanager.com'; // Replace with your actual API endpoint

class AjaxUtils {
    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            // Simulate API delay for demo purposes
            await new Promise(resolve => setTimeout(resolve, 500));

            // For demo purposes, we'll continue using localStorage
            // In production, this would be replaced with actual API calls
            return await this.simulateApiCall(endpoint, method, data);

        } catch (error) {
            console.error('API Error:', error);
            throw new Error(error.message || 'An error occurred while processing your request');
        }
    }

    static async simulateApiCall(endpoint, method, data) {
        // Simulate API responses using localStorage
        switch (method) {
            case 'GET':
                return this.handleGet(endpoint);
            case 'POST':
                return this.handlePost(endpoint, data);
            case 'PUT':
                return this.handlePut(endpoint, data);
            case 'DELETE':
                return this.handleDelete(endpoint);
            default:
                throw new Error('Invalid method');
        }
    }

    static handleGet(endpoint) {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        if (endpoint.includes('/subscriptions/')) {
            const id = endpoint.split('/').pop();
            const subscription = subscriptions.find(sub => sub.id === id);
            if (!subscription) throw new Error('Subscription not found');
            return subscription;
        }
        return subscriptions;
    }

    static handlePost(endpoint, data) {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const newSubscription = {
            ...data,
            id: Date.now().toString()
        };
        subscriptions.push(newSubscription);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return newSubscription;
    }

    static handlePut(endpoint, data) {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const id = endpoint.split('/').pop();
        const index = subscriptions.findIndex(sub => sub.id === id);
        if (index === -1) throw new Error('Subscription not found');
        
        subscriptions[index] = { ...data, id };
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return subscriptions[index];
    }

    static handleDelete(endpoint) {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const id = endpoint.split('/').pop();
        const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
        localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
        return { success: true };
    }
}

// Helper function to show loading state
function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
}

// Helper function to hide loading state
function hideLoading(element, originalText) {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

// Helper function to show error message
function showError(message, element) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (element) {
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}