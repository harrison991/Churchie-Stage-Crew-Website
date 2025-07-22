// Firebase Configuration
const firebaseConfig = {
    // You'll need to replace these with your actual Firebase config
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let currentAdmin = null;
let authToken = null;
let currentApplicationId = null;
let currentContentPage = 'home';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebaseAuth();
    setupEventListeners();
    
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });
                
                const data = await response.json();
                
                if (data.valid && data.is_admin) {
                    currentUser = user;
                    currentAdmin = data.admin_info;
                    authToken = token;
                    showDashboard();
                    loadDashboardData();
                } else {
                    showAlert('You do not have admin access.', 'error');
                    auth.signOut();
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                showAlert('Authentication verification failed.', 'error');
            }
        } else {
            showLoginScreen();
        }
    });
});

// Firebase Auth UI
function initializeFirebaseAuth() {
    const ui = new firebaseui.auth.AuthUI(auth);
    
    const uiConfig = {
        signInOptions: [
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: false
            },
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        signInFlow: 'popup',
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                // Handle successful sign in
                return false; // Don't redirect
            },
            uiShown: function() {
                // Hide loading spinner
                document.getElementById('loading-spinner')?.remove();
            }
        }
    };
    
    // Check if the UI is already rendered
    if (!document.querySelector('#firebase-auth-container .firebaseui-container')) {
        ui.start('#firebase-auth-container', uiConfig);
    }
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleSidebar);
    
    // Navigation items
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = e.target.closest('.nav-item').dataset.section;
            showSection(section);
        });
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Content page selector
    document.getElementById('content-page-select').addEventListener('change', (e) => {
        currentContentPage = e.target.value;
        loadContentPreview();
    });
    
    // Search and filter inputs
    setupSearchAndFilters();
}

function setupSearchAndFilters() {
    // Application search and filter
    document.getElementById('application-search').addEventListener('input', debounce(filterApplications, 300));
    document.getElementById('application-status-filter').addEventListener('change', filterApplications);
    
    // Contact search and filter
    document.getElementById('contact-search').addEventListener('input', debounce(filterContacts, 300));
    document.getElementById('contact-status-filter').addEventListener('change', filterContacts);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const contentArea = document.querySelector('.content-area');
    contentArea.insertBefore(alertDiv, contentArea.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function makeAPIRequest(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

// Authentication Functions
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    
    // Update user info in header
    if (currentAdmin) {
        document.getElementById('user-name').textContent = currentAdmin.name;
        document.getElementById('user-avatar').textContent = currentAdmin.name.charAt(0).toUpperCase();
    }
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        currentAdmin = null;
        authToken = null;
        showLoginScreen();
    });
}

// Navigation Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('expanded');
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        content: 'Content Management',
        applications: 'Applications',
        contacts: 'Contact Messages',
        admins: 'Admin Management'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || sectionName;
    
    // Show correct section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Load section data
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'content':
            loadContentPreview();
            break;
        case 'applications':
            loadApplications();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'admins':
            loadAdmins();
            break;
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show');
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load statistics
        const [applicationsRes, contactsRes] = await Promise.all([
            makeAPIRequest('/applications?limit=1'),
            makeAPIRequest('/contacts?limit=1')
        ]);
        
        const applicationsData = await applicationsRes.json();
        const contactsData = await contactsRes.json();
        
        // Update stat cards
        document.getElementById('total-applications').textContent = applicationsData.total || 0;
        document.getElementById('total-contacts').textContent = contactsData.total || 0;
        
        // Get pending applications count
        const pendingRes = await makeAPIRequest('/applications?status=pending&limit=1');
        const pendingData = await pendingRes.json();
        document.getElementById('pending-applications').textContent = pendingData.total || 0;
        
        // Load recent applications
        loadRecentApplications();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

async function loadRecentApplications() {
    try {
        const response = await makeAPIRequest('/applications?limit=5');
        const data = await response.json();
        
        const tableContainer = document.getElementById('recent-applications-table');
        
        if (data.applications && data.applications.length > 0) {
            const tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Year Level</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.applications.map(app => `
                            <tr>
                                <td>${app.first_name} ${app.last_name}</td>
                                <td>Year ${app.year_level}</td>
                                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                                <td>${formatDate(app.submitted_at)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="viewApplication('${app._id}')">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHTML;
        } else {
            tableContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">No applications found</p>';
        }
    } catch (error) {
        console.error('Error loading recent applications:', error);
        document.getElementById('recent-applications-table').innerHTML = '<p style="padding: 2rem; text-align: center; color: #dc2626;">Error loading applications</p>';
    }
}

// Content Management Functions
async function loadContentPreview() {
    try {
        const response = await makeAPIRequest(`/content/${currentContentPage}`);
        const data = await response.json();
        
        const previewContainer = document.getElementById('content-preview');
        
        if (currentContentPage === 'home') {
            previewContainer.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4>Hero Section</h4>
                    <p><strong>Title:</strong> ${data.hero?.title || 'N/A'}</p>
                    <p><strong>Subtitle:</strong> ${data.hero?.subtitle || 'N/A'}</p>
                    <p><strong>Description:</strong> ${data.hero?.description || 'N/A'}</p>
                    
                    <h4 style="margin-top: 2rem;">Features</h4>
                    <p>${data.features?.length || 0} features configured</p>
                    
                    <h4 style="margin-top: 2rem;">Statistics</h4>
                    <p>${data.stats?.length || 0} statistics configured</p>
                    
                    <h4 style="margin-top: 2rem;">Upcoming Events</h4>
                    <p>${data.upcoming_events?.length || 0} events configured</p>
                    
                    <p style="margin-top: 2rem; font-size: 0.875rem; color: #64748b;">
                        Last updated: ${data.updated_at ? formatDate(data.updated_at) : 'Never'}
                    </p>
                </div>
            `;
        } else if (currentContentPage === 'about') {
            previewContainer.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4>Mission Statement</h4>
                    <p>${data.mission || 'N/A'}</p>
                    
                    <h4 style="margin-top: 2rem;">Values</h4>
                    <p>${data.values?.length || 0} values configured</p>
                    
                    <h4 style="margin-top: 2rem;">Staff</h4>
                    <p>${data.staff?.length || 0} staff members configured</p>
                    
                    <h4 style="margin-top: 2rem;">Student Leaders</h4>
                    <p>${data.student_leaders?.length || 0} student leaders configured</p>
                    
                    <p style="margin-top: 2rem; font-size: 0.875rem; color: #64748b;">
                        Last updated: ${data.updated_at ? formatDate(data.updated_at) : 'Never'}
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading content preview:', error);
        document.getElementById('content-preview').innerHTML = '<p style="padding: 2rem; text-align: center; color: #dc2626;">Error loading content preview</p>';
    }
}

function editContent() {
    showModal('content-modal');
    loadContentEditor();
}

async function loadContentEditor() {
    try {
        const response = await makeAPIRequest(`/content/${currentContentPage}`);
        const data = await response.json();
        
        const editorContainer = document.getElementById('content-editor');
        
        // Create a form for editing the content
        editorContainer.innerHTML = `
            <div class="form-group">
                <label>Content Data (JSON)</label>
                <textarea id="content-json" class="form-input" rows="15">${JSON.stringify(data, null, 2)}</textarea>
                <small>Edit the JSON data directly. Be careful with the format.</small>
            </div>
        `;
    } catch (error) {
        console.error('Error loading content editor:', error);
        showAlert('Error loading content editor', 'error');
    }
}

async function saveContent() {
    try {
        const contentJson = document.getElementById('content-json').value;
        const contentData = JSON.parse(contentJson);
        
        // Remove internal fields that shouldn't be updated
        delete contentData._id;
        delete contentData.updated_at;
        delete contentData.updated_by;
        
        const response = await makeAPIRequest(`/content/${currentContentPage}`, {
            method: 'PUT',
            body: JSON.stringify(contentData)
        });
        
        if (response.ok) {
            showAlert('Content updated successfully!', 'success');
            closeModal('content-modal');
            loadContentPreview();
        } else {
            const error = await response.json();
            showAlert(`Error updating content: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error saving content:', error);
        showAlert('Error saving content. Please check JSON format.', 'error');
    }
}

// Applications Management Functions
async function loadApplications() {
    try {
        const response = await makeAPIRequest('/applications');
        const data = await response.json();
        
        const tableContainer = document.getElementById('applications-table');
        
        if (data.applications && data.applications.length > 0) {
            const tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Year Level</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.applications.map(app => `
                            <tr>
                                <td>${app.first_name} ${app.last_name}</td>
                                <td>Year ${app.year_level}</td>
                                <td>${app.email}</td>
                                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                                <td>${formatDate(app.submitted_at)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="viewApplication('${app._id}')">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHTML;
        } else {
            tableContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">No applications found</p>';
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('applications-table').innerHTML = '<p style="padding: 2rem; text-align: center; color: #dc2626;">Error loading applications</p>';
    }
}

async function viewApplication(applicationId) {
    currentApplicationId = applicationId;
    
    try {
        const response = await makeAPIRequest(`/applications/${applicationId}`);
        const app = await response.json();
        
        document.getElementById('application-details').innerHTML = `
            <div class="form-group">
                <label>Personal Information</label>
                <p><strong>Name:</strong> ${app.first_name} ${app.last_name}</p>
                <p><strong>Year Level:</strong> Year ${app.year_level}</p>
                <p><strong>Student ID:</strong> ${app.student_id}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Phone:</strong> ${app.phone || 'Not provided'}</p>
            </div>
            
            <div class="form-group">
                <label>Interests & Experience</label>
                <p><strong>Interests:</strong> ${Array.isArray(app.interests) ? app.interests.join(', ') : app.interests}</p>
                <p><strong>Previous Experience:</strong> ${app.previous_experience || 'None specified'}</p>
                <p><strong>Other Activities:</strong> ${app.other_activities || 'None specified'}</p>
            </div>
            
            <div class="form-group">
                <label>Motivation</label>
                <p>${app.motivation}</p>
            </div>
            
            <div class="form-group">
                <label>Availability</label>
                <p>${Array.isArray(app.availability) ? app.availability.join(', ') : app.availability}</p>
            </div>
            
            <div class="form-group">
                <label>Parent/Guardian Information</label>
                <p><strong>Name:</strong> ${app.parent_name}</p>
                <p><strong>Email:</strong> ${app.parent_email}</p>
                <p><strong>Phone:</strong> ${app.parent_phone}</p>
                <p><strong>Consent:</strong> ${app.parent_consent ? 'Given' : 'Not given'}</p>
            </div>
            
            <div class="form-group">
                <label>Application Status</label>
                <p><span class="status-badge status-${app.status}">${app.status}</span></p>
                <p><strong>Submitted:</strong> ${formatDate(app.submitted_at)}</p>
                ${app.reviewed_at ? `<p><strong>Reviewed:</strong> ${formatDate(app.reviewed_at)}</p>` : ''}
                ${app.admin_notes ? `<p><strong>Admin Notes:</strong> ${app.admin_notes}</p>` : ''}
            </div>
        `;
        
        showModal('application-modal');
    } catch (error) {
        console.error('Error loading application details:', error);
        showAlert('Error loading application details', 'error');
    }
}

async function updateApplicationStatus(status) {
    if (!currentApplicationId) return;
    
    const notes = prompt('Enter admin notes (optional):');
    
    try {
        const response = await makeAPIRequest(`/applications/${currentApplicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes: notes || '' })
        });
        
        if (response.ok) {
            showAlert(`Application ${status} successfully!`, 'success');
            closeModal('application-modal');
            loadApplications();
            loadDashboardData(); // Refresh dashboard stats
        } else {
            const error = await response.json();
            showAlert(`Error updating application: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        showAlert('Error updating application status', 'error');
    }
}

function filterApplications() {
    // Implementation for filtering applications
    // This would filter the displayed table based on search and status filter
    console.log('Filtering applications...');
}

function refreshApplications() {
    loadApplications();
}

// Contact Management Functions
async function loadContacts() {
    try {
        const response = await makeAPIRequest('/contacts');
        const data = await response.json();
        
        const tableContainer = document.getElementById('contacts-table');
        
        if (data.contacts && data.contacts.length > 0) {
            const tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.contacts.map(contact => `
                            <tr>
                                <td>${contact.name}</td>
                                <td>${contact.email}</td>
                                <td>${contact.type}</td>
                                <td>${contact.subject}</td>
                                <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
                                <td>${formatDate(contact.submitted_at)}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="viewContact('${contact._id}')">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHTML;
        } else {
            tableContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">No contact messages found</p>';
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        document.getElementById('contacts-table').innerHTML = '<p style="padding: 2rem; text-align: center; color: #dc2626;">Error loading contacts</p>';
    }
}

function viewContact(contactId) {
    // Implementation for viewing contact details
    console.log('Viewing contact:', contactId);
}

function filterContacts() {
    // Implementation for filtering contacts
    console.log('Filtering contacts...');
}

function refreshContacts() {
    loadContacts();
}

// Admin Management Functions
async function loadAdmins() {
    // Implementation for loading admin list
    const tableContainer = document.getElementById('admins-table');
    tableContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">Admin management functionality coming soon</p>';
}

function showAddAdminModal() {
    showModal('add-admin-modal');
}

async function addAdmin() {
    const name = document.getElementById('admin-name').value;
    const email = document.getElementById('admin-email').value;
    const firebaseUid = document.getElementById('admin-firebase-uid').value;
    const role = document.getElementById('admin-role').value;
    
    if (!name || !email || !firebaseUid) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const response = await makeAPIRequest('/auth/register-admin', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                firebase_uid: firebaseUid,
                role
            })
        });
        
        if (response.ok) {
            showAlert('Admin added successfully!', 'success');
            closeModal('add-admin-modal');
            document.getElementById('add-admin-form').reset();
            loadAdmins();
        } else {
            const error = await response.json();
            showAlert(`Error adding admin: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error adding admin:', error);
        showAlert('Error adding admin', 'error');
    }
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Note: You'll need to include Firebase UI library
// Add this script tag to your HTML: <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
// Add this CSS link to your HTML: <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
