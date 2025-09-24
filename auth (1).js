// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for form validation events
        document.addEventListener('formValidated', (e) => this.handleFormSubmission(e));
        
        // Check for existing session
        this.checkSession();
    }

    handleFormSubmission(event) {
        const { formId, data } = event.detail;

        switch(formId) {
            case 'loginForm':
                this.login(data);
                break;
            case 'registerForm':
                this.register(data);
                break;
        }
    }

    async login(credentials) {
        try {
            // For demonstration, we'll use localStorage as a mock database
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === credentials.email);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.password !== credentials.password) { // In real app, use proper password hashing
                throw new Error('Invalid password');
            }

            // Set session
            const sessionUser = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                timestamp: new Date().getTime()
            };

            localStorage.setItem('session', JSON.stringify(sessionUser));
            this.currentUser = sessionUser;

            // Redirect to dashboard
            window.location.href = '/pages/dashboard.html';

        } catch (error) {
            this.showError(error.message);
        }
    }

    async register(userData) {
        try {
            // For demonstration, we'll use localStorage as a mock database
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // Check if user already exists
            if (users.some(user => user.email === userData.email)) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password, // In real app, hash the password
                createdAt: new Date().toISOString()
            };

            // Save user
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Auto login after registration
            await this.login({
                email: userData.email,
                password: userData.password
            });

        } catch (error) {
            this.showError(error.message);
        }
    }

    checkSession() {
        const session = localStorage.getItem('session');
        if (session) {
            const sessionData = JSON.parse(session);
            const currentTime = new Date().getTime();
            const sessionAge = currentTime - sessionData.timestamp;

            // Session expires after 24 hours
            if (sessionAge < 24 * 60 * 60 * 1000) {
                this.currentUser = sessionData;
                this.updateUI();
                return true;
            } else {
                this.logout();
            }
        }
        return false;
    }

    logout() {
        localStorage.removeItem('session');
        this.currentUser = null;
        window.location.href = '/pages/login.html';
    }

    updateUI() {
        // Update navigation based on auth state
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons && this.currentUser) {
            authButtons.innerHTML = `
                <span class="user-name">${this.currentUser.fullName}</span>
                <button onclick="authManager.logout()" class="btn">Logout</button>
            `;
        }
    }

    showError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.querySelector('.auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error';
            document.querySelector('.auth-card').insertBefore(
                errorElement,
                document.querySelector('.auth-form')
            );
        }

        // Show error message
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Add logout functionality to window for access from HTML
window.authManager = authManager;