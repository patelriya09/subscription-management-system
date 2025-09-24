// Form validation rules
const validationRules = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
    },
    fullName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]{2,}$/,
        message: 'Please enter your full name (minimum 2 characters)'
    },
    confirmPassword: {
        required: true,
        match: 'password',
        message: 'Passwords do not match'
    },
    terms: {
        required: true,
        message: 'You must accept the terms and conditions'
    }
};

// Form validation helper functions
class FormValidator {
    constructor(form, rules) {
        this.form = form;
        this.rules = rules;
        this.init();
    }

    init() {
        // Add input event listeners
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Add form submit listener
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Initialize password toggles
        this.initPasswordToggles();
    }

    validateField(field) {
        const fieldName = field.name;
        const rules = this.rules[fieldName];
        
        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Required check
        if (rules.required && !field.value.trim()) {
            isValid = false;
            errorMessage = `This field is required`;
        }

        // Min length check
        else if (rules.minLength && field.value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Minimum ${rules.minLength} characters required`;
        }

        // Pattern check
        else if (rules.pattern && !rules.pattern.test(field.value)) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Match check (for password confirmation)
        else if (rules.match) {
            const matchField = this.form.querySelector(`[name="${rules.match}"]`);
            if (field.value !== matchField.value) {
                isValid = false;
                errorMessage = rules.message;
            }
        }

        // Update UI
        this.updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldStatus(field, isValid, errorMessage = '') {
        const inputGroup = field.closest('.input-group');
        const errorElement = field.closest('.form-group').querySelector('.error-message');

        if (inputGroup) {
            inputGroup.classList.remove('success', 'error');
            inputGroup.classList.add(isValid ? 'success' : 'error');
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }

    validateForm() {
        let isValid = true;
        this.form.querySelectorAll('input').forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateForm()) {
            // Form is valid - collect form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Emit a custom event with the form data
            const event = new CustomEvent('formValidated', { 
                detail: { 
                    formId: this.form.id, 
                    data: data 
                } 
            });
            document.dispatchEvent(event);
        }
    }

    initPasswordToggles() {
        this.form.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const input = button.previousElementSibling;
                const icon = button.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }
}

// Initialize form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        new FormValidator(loginForm, {
            email: validationRules.email,
            password: validationRules.password
        });
    }

    if (registerForm) {
        new FormValidator(registerForm, validationRules);
    }
});