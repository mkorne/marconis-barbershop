// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.API_BASE = `${window.AppConfig?.api?.baseUrl || 'http://localhost:5000'}/api/admin`;
        this.token = localStorage.getItem('adminToken');
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLoginStatus();
    }

    bindEvents() {
        // Login form submission
        const loginBtn = document.getElementById('admin-login-btn');
        const loginForm = document.getElementById('admin-login');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Handle enter key press in login form
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');
        
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin();
                    }
                });
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    async checkLoginStatus() {
        if (this.token) {
            try {
                const response = await fetch(`${this.API_BASE}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.isLoggedIn = true;
                    this.showDashboard(data.admin);
                    this.loadDashboardData();
                } else {
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                this.handleLogout();
            }
        }
    }

    async handleLogin() {
        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value;

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        const loginBtn = document.getElementById('admin-login-btn');
        const originalText = loginBtn.textContent;
        
        try {
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                this.isLoggedIn = true;
                
                this.showSuccess('Login successful!');
                this.showDashboard(data.admin);
                this.loadDashboardData();
                
                // Clear form
                document.getElementById('admin-username').value = '';
                document.getElementById('admin-password').value = '';
            } else {
                this.showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }

    handleLogout() {
        this.token = null;
        this.isLoggedIn = false;
        localStorage.removeItem('adminToken');
        
        // Show login form, hide dashboard
        const loginSection = document.getElementById('admin-login');
        const dashboardSection = document.getElementById('admin-dashboard');
        
        if (loginSection) loginSection.style.display = 'block';
        if (dashboardSection) dashboardSection.classList.add('hidden');
        
        this.showSuccess('Logged out successfully');
    }

    showDashboard(adminData) {
        const loginSection = document.getElementById('admin-login');
        const dashboardSection = document.getElementById('admin-dashboard');
        
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        
        // Update admin info if available
        if (adminData) {
            console.log('Logged in as:', adminData.name, `(${adminData.role})`);
        }
    }

    async loadDashboardData() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.API_BASE}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardUI(data.data);
            } else {
                console.error('Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardUI(dashboardData) {
        // Update stats
        const stats = dashboardData.stats;
        
        const todayAppointmentsEl = document.getElementById('today-appointments');
        const todayRevenueEl = document.getElementById('today-revenue');
        const unreadMessagesEl = document.getElementById('unread-messages');
        
        if (todayAppointmentsEl) todayAppointmentsEl.textContent = stats.todayBookings;
        if (todayRevenueEl) todayRevenueEl.textContent = `₵${stats.todayRevenue.toFixed(2)}`;
        if (unreadMessagesEl) unreadMessagesEl.textContent = stats.unreadMessages;

        // Update bookings table
        this.updateBookingsTable(dashboardData.recentBookings);
        
        // Update payments table
        this.updatePaymentsTable(dashboardData.recentPayments);
        
        // Update messages table
        this.updateMessagesTable(dashboardData.recentMessages);
    }

    updateBookingsTable(bookings) {
        const tableBody = document.getElementById('bookings-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-50');
            
            const statusColor = this.getStatusColor(booking.status);
            const formattedDate = new Date(booking.date).toLocaleDateString();
            
            row.innerHTML = `
                <td class="py-3 px-4 text-sm">${booking.id.substring(0, 8)}...</td>
                <td class="py-3 px-4 text-sm">${booking.customer}</td>
                <td class="py-3 px-4 text-sm">${booking.service}</td>
                <td class="py-3 px-4 text-sm">${formattedDate} ${booking.startTime}</td>
                <td class="py-3 px-4 text-sm">${booking.barber}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">
                        ${booking.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-sm">
                    <button class="text-blue-600 hover:text-blue-800 mr-2">View</button>
                    <button class="text-green-600 hover:text-green-800">Edit</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updatePaymentsTable(payments) {
        const tableBody = document.getElementById('payments-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-50');
            
            const statusColor = this.getPaymentStatusColor(payment.status);
            const formattedDate = new Date(payment.date).toLocaleDateString();
            
            row.innerHTML = `
                <td class="py-3 px-4 text-sm">${payment.id.substring(0, 8)}...</td>
                <td class="py-3 px-4 text-sm">${payment.customer}</td>
                <td class="py-3 px-4 text-sm font-semibold">₵${payment.amount.toFixed(2)}</td>
                <td class="py-3 px-4 text-sm">${payment.method}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">
                        ${payment.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-sm">${formattedDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updateMessagesTable(messages) {
        const tableBody = document.getElementById('messages-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        messages.forEach(message => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-50');
            
            const statusColor = this.getMessageStatusColor(message.status);
            const formattedDate = new Date(message.sentAt).toLocaleDateString();
            
            row.innerHTML = `
                <td class="py-3 px-4 text-sm">${message.id.substring(0, 8)}...</td>
                <td class="py-3 px-4 text-sm">${message.customer} (${message.phone})</td>
                <td class="py-3 px-4 text-sm max-w-xs truncate">${message.content}</td>
                <td class="py-3 px-4 text-sm">${formattedDate}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">
                        ${message.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-sm">
                    <button class="text-blue-600 hover:text-blue-800 mr-2">Reply</button>
                    <button class="text-green-600 hover:text-green-800">Mark Read</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    switchTab(tabId) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('border-black');
            button.classList.add('border-transparent', 'hover:border-gray-300');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabId}-tab`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Activate selected tab button
        const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('border-transparent', 'hover:border-gray-300');
            selectedButton.classList.add('border-black');
        }
    }

    getStatusColor(status) {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'NO_SHOW': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getPaymentStatusColor(status) {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PAID': 'bg-green-100 text-green-800',
            'FAILED': 'bg-red-100 text-red-800',
            'REFUNDED': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getMessageStatusColor(status) {
        const colors = {
            'UNREAD': 'bg-red-100 text-red-800',
            'READ': 'bg-blue-100 text-blue-800',
            'REPLIED': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
