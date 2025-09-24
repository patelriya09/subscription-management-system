// Keyboard shortcuts and accessibility enhancements

class AccessibilityManager {
    constructor() {
        this.shortcuts = {
            'general': {
                '?': { description: 'Show keyboard shortcuts', action: () => this.showShortcutsModal() },
                'Escape': { description: 'Close modal / Cancel action', action: () => this.handleEscape() }
            },
            'navigation': {
                'g h': { description: 'Go to Home', action: () => this.navigate('index.html') },
                'g d': { description: 'Go to Dashboard', action: () => this.navigate('dashboard.html') },
                'g s': { description: 'Go to Settings', action: () => this.navigate('settings.html') },
                'g b': { description: 'Go to Budget', action: () => this.navigate('budget.html') }
            },
            'actions': {
                'n': { description: 'New subscription', action: () => this.navigate('add-subscription.html') },
                '/': { description: 'Focus search', action: () => this.focusSearch() },
                'f': { description: 'Toggle filters', action: () => this.toggleFilters() }
            }
        };

        this.initializeKeyboardShortcuts();
        this.initializeA11yEnhancements();
        this.addShortcutHints();
    }

    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts() {
        let keys = '';
        let keyTimeout;

        document.addEventListener('keydown', (event) => {
            // Ignore if user is typing in an input
            if (this.isTyping(event.target)) return;

            // Handle single key shortcuts
            const key = event.key;
            if (this.shortcuts.general[key]) {
                event.preventDefault();
                this.shortcuts.general[key].action();
                return;
            }

            // Handle multi-key shortcuts
            clearTimeout(keyTimeout);
            keys += key;
            keyTimeout = setTimeout(() => keys = '', 1000);

            // Check navigation shortcuts
            Object.entries(this.shortcuts.navigation).forEach(([shortcut, data]) => {
                if (keys.endsWith(shortcut.replace(' ', ''))) {
                    event.preventDefault();
                    data.action();
                    keys = '';
                }
            });

            // Check action shortcuts
            Object.entries(this.shortcuts.actions).forEach(([shortcut, data]) => {
                if (key === shortcut) {
                    event.preventDefault();
                    data.action();
                    keys = '';
                }
            });
        });
    }

    // Initialize accessibility enhancements
    initializeA11yEnhancements() {
        // Add ARIA labels
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            const text = button.textContent.trim();
            if (!text && button.querySelector('i')) {
                const iconClass = button.querySelector('i').className;
                button.setAttribute('aria-label', this.getIconDescription(iconClass));
            }
        });

        // Add skip links
        this.addSkipLinks();

        // Enhance focus management
        this.enhanceFocusManagement();
    }

    // Add keyboard shortcut hints to UI
    addShortcutHints() {
        document.querySelectorAll('[data-shortcut]').forEach(element => {
            const shortcut = element.dataset.shortcut;
            const hint = document.createElement('span');
            hint.className = 'shortcut-hint';
            hint.textContent = shortcut;
            element.appendChild(hint);
        });
    }

    // Show keyboard shortcuts modal
    showShortcutsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Keyboard Shortcuts</h2>
                <div class="shortcuts-list">
                    ${this.generateShortcutsList()}
                </div>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Generate shortcuts list HTML
    generateShortcutsList() {
        let html = '';
        for (const [category, shortcuts] of Object.entries(this.shortcuts)) {
            html += `
                <div class="shortcuts-category">
                    <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <dl>
                        ${Object.entries(shortcuts).map(([key, data]) => `
                            <div class="shortcut-item">
                                <dt><kbd>${key}</kbd></dt>
                                <dd>${data.description}</dd>
                            </div>
                        `).join('')}
                    </dl>
                </div>
            `;
        }
        return html;
    }

    // Handle escape key
    handleEscape() {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
            return;
        }

        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
            activeElement.blur();
        }
    }

    // Navigate to page
    navigate(url) {
        window.location.href = url;
    }

    // Focus search input
    focusSearch() {
        const search = document.querySelector('#search, [role="search"] input');
        if (search) {
            search.focus();
        }
    }

    // Toggle filters visibility
    toggleFilters() {
        const filters = document.querySelector('.filters-section');
        if (filters) {
            filters.classList.toggle('active');
        }
    }

    // Check if user is typing in an input
    isTyping(element) {
        return element.tagName === 'INPUT' ||
               element.tagName === 'TEXTAREA' ||
               element.isContentEditable;
    }

    // Get description for icon
    getIconDescription(iconClass) {
        const iconMap = {
            'fa-plus': 'Add',
            'fa-edit': 'Edit',
            'fa-trash': 'Delete',
            'fa-search': 'Search',
            'fa-filter': 'Filter',
            'fa-times': 'Close',
            'fa-check': 'Confirm'
        };

        for (const [icon, description] of Object.entries(iconMap)) {
            if (iconClass.includes(icon)) return description;
        }
        return 'Button';
    }

    // Add skip links for accessibility
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Enhance focus management
    enhanceFocusManagement() {
        // Trap focus in modals
        document.addEventListener('focusin', (event) => {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];

                if (event.target === document.body) {
                    firstFocusable.focus();
                }

                if (!modal.contains(event.target)) {
                    firstFocusable.focus();
                }
            }
        });

        // Add focus indicators
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
}

// Initialize accessibility manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});