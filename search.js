// Search and filter functionality

class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('#search');
        this.filterInputs = document.querySelectorAll('.filter-input');
        this.subscriptionsList = document.querySelector('#subscriptionsList');
        this.debounceTimeout = null;
        
        if (this.searchInput) {
            this.initializeSearch();
        }
        
        if (this.filterInputs.length) {
            this.initializeFilters();
        }
    }

    // Initialize search functionality
    initializeSearch() {
        this.searchInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        });

        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear';
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.setAttribute('aria-label', 'Clear search');
        clearButton.style.display = 'none';
        this.searchInput.parentNode.appendChild(clearButton);

        clearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            clearButton.style.display = 'none';
            this.performSearch();
        });

        this.searchInput.addEventListener('input', () => {
            clearButton.style.display = this.searchInput.value ? 'block' : 'none';
        });
    }

    // Initialize filter functionality
    initializeFilters() {
        this.filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.performSearch();
            });
        });

        // Add filter toggle button for mobile
        const filterToggle = document.createElement('button');
        filterToggle.className = 'filter-toggle btn btn-secondary';
        filterToggle.innerHTML = '<i class="fas fa-filter"></i> Filters';
        document.querySelector('.filters-section').prepend(filterToggle);

        filterToggle.addEventListener('click', () => {
            document.querySelector('.filters-section').classList.toggle('active');
        });
    }

    // Perform search with current filters
    performSearch() {
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const filters = this.getActiveFilters();
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        
        const filteredSubscriptions = subscriptions.filter(subscription => {
            // Search term matching
            const matchesSearch = !searchTerm || 
                subscription.serviceName.toLowerCase().includes(searchTerm) ||
                subscription.category.toLowerCase().includes(searchTerm) ||
                (subscription.notes && subscription.notes.toLowerCase().includes(searchTerm));

            // Filter matching
            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value || value === 'all') return true;
                
                switch (key) {
                    case 'category':
                        return subscription.category === value;
                    case 'billingCycle':
                        return subscription.billingCycle === value;
                    case 'priceRange':
                        const amount = this.getMonthlyAmount(subscription);
                        const [min, max] = value.split('-').map(Number);
                        return amount >= min && (!max || amount <= max);
                    default:
                        return true;
                }
            });

            return matchesSearch && matchesFilters;
        });

        this.updateResults(filteredSubscriptions);
    }

    // Get active filters
    getActiveFilters() {
        const filters = {};
        this.filterInputs.forEach(input => {
            if (input.type === 'checkbox') {
                filters[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    filters[input.name] = input.value;
                }
            } else {
                filters[input.name] = input.value;
            }
        });
        return filters;
    }

    // Update results display
    updateResults(results) {
        if (!this.subscriptionsList) return;

        if (results.length === 0) {
            this.subscriptionsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No subscriptions found</p>
                </div>
            `;
            return;
        }

        this.subscriptionsList.innerHTML = results.map(subscription => `
            <div class="subscription-card" data-id="${subscription.id}">
                <h3>${subscription.serviceName}</h3>
                <div class="subscription-info">
                    <p><i class="fas fa-tag"></i> ${subscription.category}</p>
                    <p><i class="fas fa-money-bill"></i> ${this.formatAmount(subscription.amount)}</p>
                    <p><i class="fas fa-clock"></i> ${subscription.billingCycle}</p>
                </div>
                <div class="subscription-actions">
                    <button class="btn btn-secondary" onclick="editSubscription('${subscription.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');
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

    // Format amount using settings
    formatAmount(amount) {
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        const currency = settings.currency || { code: 'INR', symbol: '₹', display: 'symbolFirst' };
        
        return currency.display === 'symbolFirst'
            ? `${currency.symbol}${amount.toFixed(2)}`
            : `${amount.toFixed(2)}${currency.symbol}`;
    }
}

// Initialize search manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});