// Authentication Functions
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
}

// Registration Handler
function handleRegister(event) {
    event.preventDefault();
    
    if (!validateForm('registerForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        terms: formData.get('terms')
    };
    
    // Check if passwords match
    if (userData.password !== userData.confirmPassword) {
        showError(document.getElementById('confirmPassword'), 'Passwords do not match');
        return;
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
        showError(document.getElementById('email'), 'An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // In a real app, this would be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    // Auto-login after registration
    currentUser = newUser;
    saveCurrentUser();
    
    showNotification('Account created successfully! Welcome!', 'success');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    if (!validateForm('loginForm')) {
        return;
    }
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError(document.getElementById('email'), 'No account found with this email address');
        return;
    }
    
    if (user.password !== password) {
        showError(document.getElementById('password'), 'Incorrect password');
        return;
    }
    
    // Login successful
    currentUser = user;
    saveCurrentUser();
    
    showNotification('Welcome back!', 'success');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Logout Handler
function handleLogout() {
    clearCurrentUser();
    showNotification('You have been logged out successfully', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Check if user is logged in
function checkAuth() {
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Update navigation based on auth status
    updateNavigation();
});

function updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    if (currentUser) {
        // User is logged in
        navMenu.innerHTML = `
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="dashboard.html" class="nav-link">Dashboard</a></li>
            <li><a href="notifications.html" class="nav-link">Notifications</a></li>
            <li><a href="settings.html" class="nav-link">Settings</a></li>
            <li><a href="#" class="nav-link" onclick="handleLogout()">Logout</a></li>
        `;
    } else {
        // User is not logged in
        navMenu.innerHTML = `
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="dashboard.html" class="nav-link">Dashboard</a></li>
            <li><a href="login.html" class="nav-link">Login</a></li>
            <li><a href="register.html" class="nav-link">Register</a></li>
        `;
    }
}

// Get current user info
function getCurrentUser() {
    return currentUser;
}

// Update user profile
function updateUserProfile(updatedData) {
    if (!currentUser) return false;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        currentUser = users[userIndex];
        saveUsers();
        saveCurrentUser();
        return true;
    }
    return false;
}
