// FastSewa Authentication System - Backend Integrated
// Using REST API calls to backend

// Backend API Configuration
// Use relative '/api' so the frontend works when served by the backend in production.
const API_CONFIG = {
    BASE_URL: '/api',
    ENDPOINTS: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        GET_ME: '/auth/me',
        UPDATE_PROFILE: '/auth/update',
        CHANGE_PASSWORD: '/auth/change-password',
        SERVICES: '/services',
        DASHBOARD_STATS: '/services/dashboard/stats'
    }
};

// User Model (Frontend only)
class User {
    constructor(data) {
        this.id = data._id || data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.fullName = data.fullName || `${data.firstName} ${data.lastName}`;
        this.email = data.email;
        this.phone = data.phone;
        this.userType = data.userType || 'customer';
        this.profilePic = data.profilePic;
        this.walletBalance = data.walletBalance || 0;
        this.totalServices = data.totalServices || 0;
        this.rating = data.rating || 0;
        this.activeBookings = data.activeBookings || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

// Main Auth Class with Backend Integration
class FastSewaAuth {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('fastsewa_token') || null;
        this.init();
    }

    async init() {
        if (this.token) {
            await this.getCurrentUser();
        }
    }

    // API Helper Methods
    async apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        // Add Authorization header if token exists
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method,
            headers,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json();

            if (!response.ok) {
                // If token is invalid, clear it
                if (response.status === 401) {
                    this.clearAuth();
                }
                throw new Error(responseData.message || 'API request failed');
            }

            return responseData;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Save token to localStorage
    saveToken(token) {
        this.token = token;
        localStorage.setItem('fastsewa_token', token);
    }

    // Clear authentication data
    clearAuth() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('fastsewa_token');
        localStorage.removeItem('fastsewa_current_user');
    }

    // Register function
    async signup(firstName, lastName, email, phone, password, userType) {
        try {
            const response = await this.apiRequest(
                API_CONFIG.ENDPOINTS.REGISTER,
                'POST',
                { firstName, lastName, email, phone, password, userType }
            );

            if (response.success) {
                this.saveToken(response.token);
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed. Please try again.' };
        }
    }

    // Login function
    async login(email, password) {
        try {
            const response = await this.apiRequest(
                API_CONFIG.ENDPOINTS.LOGIN,
                'POST',
                { email, password }
            );

            if (response.success) {
                this.saveToken(response.token);
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Login failed. Please check your credentials.' };
        }
    }

    // Logout function
    async logout() {
        try {
            await this.apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, 'POST');
            this.clearAuth();
            return { success: true };
        } catch (error) {
            // Even if API fails, clear local auth
            this.clearAuth();
            return { success: true };
        }
    }

    // Get current user from backend
    async getCurrentUser() {
        if (!this.token) return null;

        try {
            const response = await this.apiRequest(API_CONFIG.ENDPOINTS.GET_ME);

            if (response.success) {
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return this.currentUser;
            } else {
                this.clearAuth();
                return null;
            }
        } catch (error) {
            this.clearAuth();
            return null;
        }
    }

    // Update user profile
    async updateProfile(data) {
        try {
            const response = await this.apiRequest(
                API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
                'PUT',
                data
            );

            if (response.success) {
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Profile update failed' };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.apiRequest(
                API_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
                'PUT',
                { currentPassword, newPassword }
            );

            return response;
        } catch (error) {
            return { success: false, message: error.message || 'Password change failed' };
        }
    }

    // Create service request
    async createServiceRequest(serviceType, description, address) {
        try {
            const response = await this.apiRequest(
                API_CONFIG.ENDPOINTS.SERVICES,
                'POST',
                { serviceType, description, address }
            );

            return response;
        } catch (error) {
            return { success: false, message: error.message || 'Service request failed' };
        }
    }

    // Get user's service requests
    async getUserServices() {
        try {
            const response = await this.apiRequest(API_CONFIG.ENDPOINTS.SERVICES);
            return response.success ? response.services : [];
        } catch (error) {
            return [];
        }
    }

    // Get dashboard stats
    async getDashboardStats() {
        try {
            const response = await this.apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
            return response.success ? response.stats : null;
        } catch (error) {
            return null;
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.token !== null && this.currentUser !== null;
    }
}

async function performLogout() {
    try {
        await fastsewaAuth.logout();
    } finally {
        window.location.replace('login.html');
    }
}

// Initialize FastSewa Auth System
const fastsewaAuth = new FastSewaAuth();

// Utility Functions
function showToast(message, type = 'success') {
    // Remove existing toast if any
    let toast = document.getElementById('fastsewa-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fastsewa-toast';
        toast.className = 'toast hidden';
        document.body.appendChild(toast);
    }

    // Create toast content
    const icon = type === 'error' ? 'exclamation-circle' :
        type === 'warning' ? 'exclamation-triangle' : 'check-circle';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${icon} toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
    `;

    // Set color based on type
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12'
    };
    toast.style.background = colors[type] || colors.success;

    // Show toast
    toast.classList.remove('hidden');

    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-msg');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

function togglePasswordVisibility(inputId, toggleBtnId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);

    if (!passwordInput || !toggleBtn) return;

    // Set initial icon (eye = show, eye-slash = hide)
    const setIcon = () => {
        const currentType = passwordInput.getAttribute('type');
        toggleBtn.innerHTML = currentType === 'password' ?
            '<i class="fas fa-eye"></i>' :
            '<i class="fas fa-eye-slash"></i>';
        toggleBtn.setAttribute(
            'aria-label',
            currentType === 'password' ? 'Show password' : 'Hide password'
        );
    };

    setIcon();

    toggleBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        setIcon();
    });
}

// Form Validation Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone);
}

function getPasswordStrength(password) {
    const value = (password || '').trim();

    const rules = {
        length: value.length >= 8,
        lower: /[a-z]/.test(value),
        upper: /[A-Z]/.test(value),
        number: /\d/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
        noSpaces: !/\s/.test(value)
    };

    // score: 0..5 (ignore noSpaces for score but for validity)
    const score = [rules.length, rules.lower, rules.upper, rules.number, rules.special].filter(Boolean).length;

    let label = 'Weak';
    if (score >= 5) label = 'Strong';
    else if (score >= 3) label = 'Medium';

    const isStrong = rules.length && rules.lower && rules.upper && rules.number && rules.special && rules.noSpaces;

    const missing = [];
    if (!rules.length) missing.push('at least 8 characters');
    if (!rules.upper) missing.push('an uppercase letter');
    if (!rules.lower) missing.push('a lowercase letter');
    if (!rules.number) missing.push('a number');
    if (!rules.special) missing.push('a special character');
    if (!rules.noSpaces) missing.push('no spaces');

    return { score, label, isStrong, missing };
}

function validatePassword(password) {
    // Strong password requirement
    return getPasswordStrength(password).isStrong;
}

// Login Page Functions
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');

    if (!loginForm) return;

    // Ensure all inputs are enabled and focusable
    const inputs = loginForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.disabled = false;
        input.readOnly = false;
        input.style.pointerEvents = 'auto';
        input.style.cursor = 'text';
    });

    // Toggle password visibility
    togglePasswordVisibility('loginPassword', 'togglePassword');

    // Forgot password handler
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function (e) {
            e.preventDefault();
            const email = prompt('Please enter your email to reset password:');
            if (email && validateEmail(email)) {
                // In a real app, call backend API
                showToast('Password reset instructions sent to your email', 'success');
            } else if (email) {
                showToast('Please enter a valid email', 'error');
            }
        });
    }

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            showToast('Social login coming soon!', 'info');
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Get form values
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Validation
        let isValid = true;

        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            showError('passwordError', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        if (loginBtn && loginText && loginSpinner) {
            loginText.textContent = 'Signing In...';
            loginSpinner.classList.remove('hidden');
            loginBtn.disabled = true;
        }

        try {
            // Attempt login
            const result = await fastsewaAuth.login(email, password);

            if (result.success) {
                showToast('Login successful! Redirecting...', 'success');

                // Remember me
                if (rememberMe) {
                    localStorage.setItem('fastsewa_remember_email', email);
                }

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError('passwordError', result.message || 'Invalid credentials');
                showToast(result.message || 'Login failed', 'error');

                // Reset button state and re-enable inputs
                if (loginBtn && loginText && loginSpinner) {
                    loginText.textContent = 'Sign In';
                    loginSpinner.classList.add('hidden');
                    loginBtn.disabled = false;
                }
                // Re-enable all inputs
                const inputs = loginForm.querySelectorAll('input, select');
                inputs.forEach(input => {
                    input.disabled = false;
                    input.readOnly = false;
                });
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');

            // Reset button state and re-enable inputs
            if (loginBtn && loginText && loginSpinner) {
                loginText.textContent = 'Sign In';
                loginSpinner.classList.add('hidden');
                loginBtn.disabled = false;
            }
            // Re-enable all inputs
            const inputs = loginForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = false;
                input.readOnly = false;
            });
        }
    });

    // Pre-fill remembered email
    const rememberedEmail = localStorage.getItem('fastsewa_remember_email');
    if (rememberedEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Signup Page Functions
function initSignup() {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupText = document.getElementById('signupText');
    const signupSpinner = document.getElementById('signupSpinner');

    if (!signupForm) return;

    // Ensure all inputs are enabled and focusable
    const inputs = signupForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.disabled = false;
        input.readOnly = false;
        input.style.pointerEvents = 'auto';
        input.style.cursor = 'text';
    });

    // Toggle password visibility
    togglePasswordVisibility('signupPassword', 'toggleSignupPassword');
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');

    // Real-time password validation
    const passwordInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('confirmPassword');

    const strengthWrap = document.getElementById('passwordStrength');
    const strengthBarFill = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');

    function updateStrengthUI() {
        if (!passwordInput || !strengthWrap || !strengthBarFill || !strengthText) return;
        const value = passwordInput.value;
        if (!value) {
            strengthWrap.style.display = 'none';
            strengthText.textContent = '';
            strengthBarFill.style.width = '0%';
            strengthBarFill.className = 'strength-bar-fill';
            return;
        }

        const strength = getPasswordStrength(value);
        strengthWrap.style.display = 'block';

        // 0..5 => 0..100
        const pct = Math.min(100, Math.max(0, (strength.score / 5) * 100));
        strengthBarFill.style.width = `${pct}%`;

        strengthBarFill.className = `strength-bar-fill ${strength.label.toLowerCase()}`;
        strengthText.textContent = strength.isStrong
            ? 'Password strength: Strong'
            : `Password strength: ${strength.label}`;
    }

    if (passwordInput && confirmInput) {
        function validatePasswords() {
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (password && confirm && password !== confirm) {
                showError('confirmPasswordError', 'Passwords do not match');
                return false;
            } else {
                const errorElement = document.getElementById('confirmPasswordError');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
                return true;
            }
        }

        passwordInput.addEventListener('input', function () {
            updateStrengthUI();

            // Clear password error live when strong
            if (validatePassword(passwordInput.value)) {
                const pwdErr = document.getElementById('signupPasswordError');
                if (pwdErr) pwdErr.style.display = 'none';
            }
            validatePasswords();
        });
        confirmInput.addEventListener('input', validatePasswords);

        // Initialize strength UI
        updateStrengthUI();
    }

    // Terms link handlers
    document.querySelectorAll('.terms-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            showToast('Terms and Privacy policy will open in new tab', 'info');
        });
    });

    // Signup form submission
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const userType = document.getElementById('userType').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        let isValid = true;

        // First name
        if (!firstName) {
            showError('firstNameError', 'First name is required');
            isValid = false;
        } else if (firstName.length < 2) {
            showError('firstNameError', 'First name must be at least 2 characters');
            isValid = false;
        }

        // Last name
        if (!lastName) {
            showError('lastNameError', 'Last name is required');
            isValid = false;
        } else if (lastName.length < 2) {
            showError('lastNameError', 'Last name must be at least 2 characters');
            isValid = false;
        }

        // Email
        if (!email) {
            showError('signupEmailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('signupEmailError', 'Please enter a valid email');
            isValid = false;
        }

        // Phone
        if (!phone) {
            showError('phoneError', 'Phone number is required');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError('phoneError', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        // User type
        if (!userType) {
            showError('userTypeError', 'Please select account type');
            isValid = false;
        }

        // Password
        if (!password) {
            showError('signupPasswordError', 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            const strength = getPasswordStrength(password);
            const msg = strength.missing.length
                ? `Password must contain ${strength.missing.join(', ')}`
                : 'Password is too weak';
            showError('signupPasswordError', msg);
            isValid = false;
        }

        // Confirm password
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Please confirm password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        // Terms
        if (!terms) {
            showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        if (signupBtn && signupText && signupSpinner) {
            signupText.textContent = 'Creating Account...';
            signupSpinner.classList.remove('hidden');
            signupBtn.disabled = true;
        }

        try {
            // Attempt signup
            const result = await fastsewaAuth.signup(
                firstName,
                lastName,
                email,
                phone,
                password,
                userType
            );

            if (result.success) {
                showToast('Account created successfully! Redirecting...', 'success');

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast(result.message || 'Signup failed', 'error');

                // Show specific error if available
                if (result.message.includes('Email') || result.message.includes('email')) {
                    showError('signupEmailError', result.message);
                } else if (result.message.includes('Phone') || result.message.includes('phone')) {
                    showError('phoneError', result.message);
                } else if (result.message.includes('Password') || result.message.includes('password')) {
                    showError('signupPasswordError', result.message);
                }

                // Reset button state and re-enable inputs
                if (signupBtn && signupText && signupSpinner) {
                    signupText.textContent = 'Create Account';
                    signupSpinner.classList.add('hidden');
                    signupBtn.disabled = false;
                }
                // Re-enable all inputs
                const inputs = signupForm.querySelectorAll('input, select');
                inputs.forEach(input => {
                    input.disabled = false;
                    input.readOnly = false;
                });
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');

            // Reset button state and re-enable inputs
            if (signupBtn && signupText && signupSpinner) {
                signupText.textContent = 'Create Account';
                signupSpinner.classList.add('hidden');
                signupBtn.disabled = false;
            }
            // Re-enable all inputs
            const inputs = signupForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = false;
                input.readOnly = false;
            });
        }
    });
}

// Dashboard Functions
async function checkAuth() {
    if (!fastsewaAuth.isLoggedIn()) {
        // Try to get user from token
        const user = await fastsewaAuth.getCurrentUser();
        if (!user) {
            window.location.replace('login.html');
            return false;
        }
    }
    return true;
}

async function loadUserData() {
    const user = fastsewaAuth.currentUser;
    if (!user) return;

    // Update user name in navbar
    const userNameElements = document.querySelectorAll('#userName, #dashboardUserName');
    userNameElements.forEach(element => {
        if (element) element.textContent = user.fullName;
    });

    // Update user email
    const userEmailElements = document.querySelectorAll('#dashboardUserEmail');
    userEmailElements.forEach(element => {
        if (element) element.textContent = user.email;
    });

    // Update user type badge
    const userTypeBadge = document.getElementById('userTypeBadge');
    if (userTypeBadge) {
        userTypeBadge.textContent = user.userType.charAt(0).toUpperCase() + user.userType.slice(1);
        userTypeBadge.style.background = user.userType === 'customer' ? '#667eea' :
            user.userType === 'service_provider' ? '#4CAF50' : '#FF9800';
    }

    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        welcomeMessage.textContent = `${greeting}, ${user.firstName}!`;
    }
}

async function updateDashboardStats() {
    try {
        const stats = await fastsewaAuth.getDashboardStats();
        if (!stats) return;

        // Update stats cards
        document.getElementById('activeBookings').textContent = stats.activeBookings || 0;
        document.getElementById('totalServices').textContent = stats.totalServices || 0;
        document.getElementById('rating').textContent = fastsewaAuth.currentUser.rating?.toFixed(1) || '0.0';
        document.getElementById('walletBalance').textContent = `₹${fastsewaAuth.currentUser.walletBalance || 0}`;

        // Load recent services
        await loadRecentServices();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentServices() {
    try {
        const services = await fastsewaAuth.getUserServices();
        const recentServicesContainer = document.getElementById('recentServices');

        if (!recentServicesContainer) return;

        // Clear existing content
        recentServicesContainer.innerHTML = '';

        // Get latest 5 services
        const recentServices = services
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentServices.length === 0) {
            recentServicesContainer.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-calendar-times" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <p>No service requests yet</p>
                        <a href="index.html#services" class="btn btn-primary" style="margin-top: 1rem;">Book Your First Service</a>
                    </td>
                </tr>
            `;
            return;
        }

        // Add services to table
        recentServices.forEach(service => {
            const row = document.createElement('tr');

            // Status badge
            let statusBadge = '';
            let statusClass = '';
            switch (service.status) {
                case 'pending':
                    statusBadge = 'Pending';
                    statusClass = 'pending';
                    break;
                case 'in-progress':
                    statusBadge = 'In Progress';
                    statusClass = 'in-progress';
                    break;
                case 'completed':
                    statusBadge = 'Completed';
                    statusClass = 'completed';
                    break;
                case 'cancelled':
                    statusBadge = 'Cancelled';
                    statusClass = 'cancelled';
                    break;
            }

            row.innerHTML = `
                <td>${service.serviceType}</td>
                <td>${new Date(service.createdAt).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${statusBadge}</span></td>
                <td>${service.professional || 'Not assigned'}</td>
                <td>
                    <button class="btn-small" onclick="viewService('${service._id}')">View</button>
                </td>
            `;

            recentServicesContainer.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading recent services:', error);
    }
}

function initDashboard() {
    // Load user data
    loadUserData();

    // Update dashboard stats
    updateDashboardStats();

    // Load profile data
    loadProfileData();

    // Logout buttons (dropdown + sidebar)
    const bindLogout = (buttonEl) => {
        if (!buttonEl) return;
        buttonEl.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            await performLogout();
        });
    };

    bindLogout(document.getElementById('logoutBtn'));
    bindLogout(document.getElementById('sidebarLogoutBtn'));

    // User dropdown toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdown.style.display = 'none';
        });

        userDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // Sidebar/top navigation (exclude logout item)
    const navItems = document.querySelectorAll('.nav-item:not(.logout-item), .nav-link[href^="#"]');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                showSection(sectionId);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Update profile button
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            await updateUserProfile();
        });
    }

    // Messages functionality
    const newMessageBtn = document.getElementById('newMessageBtn');
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', newMessage);
    }

    const backToMessages = document.getElementById('backToMessages');
    if (backToMessages) {
        backToMessages.addEventListener('click', function () {
            document.getElementById('messagesList').style.display = 'block';
            document.getElementById('messageThread').style.display = 'none';
        });
    }

    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Payments functionality
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', addPaymentMethod);
    }

    // Settings functionality
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const twoFactorBtn = document.getElementById('twoFactorBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
    if (twoFactorBtn) {
        twoFactorBtn.addEventListener('click', enableTwoFactor);
    }
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }

    // Initial section (supports direct links like dashboard.html#payments)
    const initialSectionId = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
    showSection(initialSectionId);

    const initialActive = document.querySelector(`.nav-item[href="#${initialSectionId}"], .nav-link[href="#${initialSectionId}"]`);
    if (initialActive) {
        navItems.forEach(nav => nav.classList.remove('active'));
        initialActive.classList.add('active');
    }
}

function showSection(sectionId) {
    const dashboardHome = document.getElementById('dashboard');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    // Default to dashboard home if unknown/empty
    const normalizedSectionId = sectionId || 'dashboard';

    // Hide all dashboard sections
    dashboardSections.forEach(section => {
        section.style.display = 'none';
    });

    // Toggle home view
    if (dashboardHome) {
        dashboardHome.style.display = normalizedSectionId === 'dashboard' ? 'block' : 'none';
    }

    // Show selected dashboard section if applicable
    const section = document.getElementById(normalizedSectionId);
    if (section && section.classList.contains('dashboard-section')) {
        section.style.display = 'block';

        // Load data for specific sections
        if (normalizedSectionId === 'profile') {
            loadProfileData();
        } else if (normalizedSectionId === 'bookings' || normalizedSectionId === 'services') {
            loadAllServices();
        } else if (normalizedSectionId === 'messages') {
            loadMessages();
        } else if (normalizedSectionId === 'payments') {
            loadPayments();
        } else if (normalizedSectionId === 'settings') {
            loadSettings();
        }
    }
}

async function loadProfileData() {
    const user = fastsewaAuth.currentUser;
    if (!user) return;

    // Populate profile form
    const firstNameInput = document.getElementById('profileFirstName');
    const lastNameInput = document.getElementById('profileLastName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');

    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
}

async function loadAllServices() {
    try {
        const services = await fastsewaAuth.getUserServices();
        const bookingsContainer = document.getElementById('allBookings');
        const servicesContainer = document.getElementById('allServices');

        if (bookingsContainer) {
            bookingsContainer.innerHTML = services.map(service => `
                <tr>
                    <td>${service.serviceType}</td>
                    <td>${new Date(service.createdAt).toLocaleDateString()}</td>
                    <td><span class="status-${service.status}">${service.status}</span></td>
                    <td>${service.professional || 'Not assigned'}</td>
                    <td>
                        <button onclick="viewService('${service._id}')" class="btn btn-sm">View</button>
                    </td>
                </tr>
            `).join('');
        }

        if (servicesContainer) {
            servicesContainer.innerHTML = services.map(service => `
                <tr>
                    <td>${service.serviceType}</td>
                    <td>${service.description}</td>
                    <td><span class="status-${service.status}">${service.status}</span></td>
                    <td>${new Date(service.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button onclick="viewService('${service._id}')" class="btn btn-sm">View</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function updateUserProfile() {
    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();

    if (!firstName || !lastName) {
        showToast('First name and last name are required', 'error');
        return;
    }

    try {
        const result = await fastsewaAuth.updateProfile({
            firstName,
            lastName,
            phone
        });

        if (result.success) {
            showToast('Profile updated successfully', 'success');
            // Update current user data
            fastsewaAuth.currentUser.firstName = firstName;
            fastsewaAuth.currentUser.lastName = lastName;
            fastsewaAuth.currentUser.phone = phone;
            fastsewaAuth.currentUser.fullName = `${firstName} ${lastName}`;
            localStorage.setItem('fastsewa_current_user', JSON.stringify(fastsewaAuth.currentUser));
            // Update navbar
            loadUserData();
        } else {
            showToast(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showToast('Error updating profile', 'error');
    }
}

function viewService(serviceId) {
    // In a real application, this would show service details
    alert(`Viewing service ${serviceId}\nThis feature would show detailed service information in a modal or new page.`);
}

// Messages Functions
async function loadMessages() {
    try {
        // For now, show sample messages. In a real app, this would call an API
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            const sampleMessages = [
                { id: 1, sender: 'FastSewa Support', preview: 'Your service request has been confirmed...', time: '2 hours ago', unread: true },
                { id: 2, sender: 'John Professional', preview: 'I will arrive at your location in 30 minutes...', time: '1 day ago', unread: false },
                { id: 3, sender: 'FastSewa Team', preview: 'Thank you for using our services...', time: '3 days ago', unread: false }
            ];

            messagesList.innerHTML = sampleMessages.map(msg => `
                <div class="message-item ${msg.unread ? 'unread' : ''}" onclick="openMessageThread(${msg.id})">
                    <div class="message-header">
                        <span class="message-sender">${msg.sender}</span>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <div class="message-preview">${msg.preview}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function openMessageThread(messageId) {
    const messagesList = document.getElementById('messagesList');
    const messageThread = document.getElementById('messageThread');
    const threadTitle = document.getElementById('threadTitle');

    if (messagesList && messageThread) {
        messagesList.style.display = 'none';
        messageThread.style.display = 'flex';

        // Update thread title based on message
        threadTitle.textContent = `Conversation with ${messageId === 1 ? 'FastSewa Support' : messageId === 2 ? 'John Professional' : 'FastSewa Team'}`;

        // Load thread messages (sample data)
        loadMessageThread(messageId);
    }
}

function loadMessageThread(messageId) {
    const threadMessages = document.getElementById('threadMessages');
    if (threadMessages) {
        const sampleThreads = {
            1: [
                { type: 'received', message: 'Hello! Your service request has been confirmed.', time: '2 hours ago' },
                { type: 'sent', message: 'Thank you! When can I expect the professional?', time: '2 hours ago' },
                { type: 'received', message: 'The professional will arrive within the next hour.', time: '1 hour ago' }
            ],
            2: [
                { type: 'received', message: 'I will arrive at your location in 30 minutes.', time: '1 day ago' },
                { type: 'sent', message: 'Great! I will be waiting.', time: '1 day ago' }
            ],
            3: [
                { type: 'received', message: 'Thank you for using our services!', time: '3 days ago' }
            ]
        };

        const messages = sampleThreads[messageId] || [];
        threadMessages.innerHTML = messages.map(msg => `
            <div class="message-bubble ${msg.type}">
                ${msg.message}
                <div class="message-time">${msg.time}</div>
            </div>
        `).join('');
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const threadMessages = document.getElementById('threadMessages');

    if (messageInput && threadMessages && messageInput.value.trim()) {
        const message = messageInput.value.trim();
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble sent';
        messageBubble.innerHTML = `${message}<div class="message-time">Just now</div>`;
        threadMessages.appendChild(messageBubble);
        messageInput.value = '';
        threadMessages.scrollTop = threadMessages.scrollHeight;
    }
}

function newMessage() {
    alert('New message feature would open a compose message modal.');
}

// Payments Functions
async function loadPayments() {
    try {
        // Load payment methods
        const paymentsGrid = document.getElementById('paymentsGrid');
        if (paymentsGrid) {
            const samplePayments = [
                { id: 1, type: 'credit-card', name: '**** **** **** 1234', default: true },
                { id: 2, type: 'debit-card', name: '**** **** **** 5678', default: false }
            ];

            paymentsGrid.innerHTML = samplePayments.map(payment => `
                <div class="payment-card ${payment.default ? 'default' : ''}">
                    <div class="payment-type">
                        <i class="fas fa-credit-card"></i>
                        <span>${payment.type === 'credit-card' ? 'Credit Card' : 'Debit Card'}</span>
                    </div>
                    <div class="payment-details">
                        <h4>${payment.name}</h4>
                        <p>${payment.default ? 'Default payment method' : 'Secondary payment method'}</p>
                    </div>
                    <div class="payment-actions">
                        <button class="btn btn-sm" onclick="editPayment(${payment.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        // Load payment history
        const paymentHistory = document.getElementById('paymentHistory');
        if (paymentHistory) {
            const sampleHistory = [
                { date: '2024-01-15', service: 'Home Cleaning', amount: '₹500', status: 'Completed' },
                { date: '2024-01-10', service: 'Plumbing Repair', amount: '₹800', status: 'Completed' },
                { date: '2024-01-05', service: 'Electrical Work', amount: '₹1200', status: 'Refunded' }
            ];

            paymentHistory.innerHTML = sampleHistory.map(payment => `
                <tr>
                    <td>${payment.date}</td>
                    <td>${payment.service}</td>
                    <td>${payment.amount}</td>
                    <td><span class="status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                    <td><button class="btn btn-sm" onclick="viewPayment('${payment.date}')">View</button></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

function addPaymentMethod() {
    alert('Add payment method feature would open a payment form modal.');
}

function editPayment(paymentId) {
    alert(`Edit payment method ${paymentId}`);
}

function deletePayment(paymentId) {
    if (confirm('Are you sure you want to delete this payment method?')) {
        alert(`Payment method ${paymentId} deleted`);
        loadPayments(); // Reload payments
    }
}

function viewPayment(date) {
    alert(`Viewing payment details for ${date}`);
}

// Settings Functions
async function loadSettings() {
    try {
        // Load current settings (in a real app, this would come from API)
        const settings = {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            profileVisibility: true,
            showPhone: false
        };

        // Apply settings to form
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.checked = settings[key];
            }
        });
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked,
            profileVisibility: document.getElementById('profileVisibility').checked,
            showPhone: document.getElementById('showPhone').checked
        };

        // In a real app, this would save to backend
        console.log('Saving settings:', settings);
        showToast('Settings saved successfully', 'success');
    } catch (error) {
        showToast('Error saving settings', 'error');
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        // Reset to defaults
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('smsNotifications').checked = false;
        document.getElementById('pushNotifications').checked = true;
        document.getElementById('profileVisibility').checked = true;
        document.getElementById('showPhone').checked = false;
        showToast('Settings reset to default', 'success');
    }
}

function changePassword() {
    alert('Change password feature would open a password change modal.');
}

function enableTwoFactor() {
    alert('Two-factor authentication setup would be initiated.');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
            alert('Account deletion would be processed. In a real app, this would require additional verification.');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // Always bind logout via event delegation as a fallback
    document.addEventListener('click', function (e) {
        const logoutLink = e.target.closest('#logoutBtn, #sidebarLogoutBtn');
        if (!logoutLink) return;
        e.preventDefault();
        e.stopPropagation();
        performLogout();
    });

    // Add toast styles if not present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: #4CAF50;
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .toast-icon {
                font-size: 1.2rem;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .hidden {
                display: none !important;
            }
            
            .status-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .status-badge.pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .status-badge.in-progress {
                background: #cce5ff;
                color: #004085;
            }
            
            .status-badge.completed {
                background: #d4edda;
                color: #155724;
            }
            
            .status-badge.cancelled {
                background: #f8d7da;
                color: #721c24;
            }
            
            .btn-small {
                padding: 0.25rem 0.75rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
            }
            
            .btn-small:hover {
                background: #5a67d8;
            }
        `;
        document.head.appendChild(style);
    }

    // Check which page we're on and initialize accordingly
    if (document.querySelector('.auth-page')) {
        if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('login.html')) {
            initLogin();
        } else if (window.location.pathname.includes('signup.html') || window.location.pathname.endsWith('signup.html')) {
            initSignup();
        }
    } else if (window.location.pathname.includes('dashboard.html') || window.location.pathname.endsWith('dashboard.html')) {
        // Check auth on dashboard page
        checkAuth().then(isAuthenticated => {
            if (isAuthenticated) {
                initDashboard();
            }
        });
    }
});

// Export for use in other scripts
window.fastsewaAuth = fastsewaAuth;