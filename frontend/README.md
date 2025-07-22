# Anglican Church Grammar School Stage Crew Website

A comprehensive website and admin dashboard for the Stage Crew co-curricular program, featuring dynamic content management, member applications, and administrative tools.

## Features

### Frontend Website
- **Multi-page responsive website** with modern design
- **Dynamic content loading** from API server
- **Interactive galleries** with lightbox functionality
- **Member application forms** with validation
- **Contact forms** with real-time submission
- **Mobile-responsive design** for all devices

### Backend API
- **RESTful API** built with Python Flask
- **Firebase authentication** for admin access
- **MongoDB database** for content and data storage
- **Content management** for all website sections
- **Application management** with status tracking
- **Contact form handling** and admin notifications

### Admin Dashboard
- **Secure login** with Firebase authentication
- **Content management interface** for editing website content
- **Application review system** with approval/rejection workflow
- **Contact message management** 
- **Admin user management**
- **Real-time statistics** and analytics

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Google Fonts (Inter typography)
- Firebase Auth SDK

### Backend
- Python 3.8+
- Flask web framework
- Firebase Admin SDK
- MongoDB with PyMongo
- CORS support
- JWT authentication

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- MongoDB (local installation or cloud service)
- Firebase project with Authentication enabled
- Node.js (for serving static files during development)

### 1. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-super-secret-key-here-change-this-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=stagecrew_db

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:5500

# Server Configuration
PORT=5000
```

#### Setup Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication with Email/Password and Google providers
4. Go to Project Settings > Service Accounts
5. Generate a new private key and download the JSON file
6. Rename the file to `firebase-service-account.json` and place it in the `backend` folder
7. Update `FIREBASE_PROJECT_ID` in your `.env` file

#### Setup MongoDB
1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create the required collections

#### Run the Backend Server
```bash
cd backend
python app.py
```

The API server will be available at `http://localhost:5000`

### 2. Frontend Setup

#### Update Firebase Configuration
1. In your Firebase project, go to Project Settings > General
2. In the "Your apps" section, add a web app
3. Copy the Firebase configuration object
4. Update the `firebaseConfig` in `admin-dashboard.js` and add it to the main website files

#### Update API Configuration
If your backend is running on a different port or domain, update the `API_BASE_URL` in:
- `script.js`
- `admin-dashboard.js`

#### Serve the Frontend
For development, you can use any static file server:

Using Python:
```bash
python -m http.server 8000
```

Using Node.js (if you have http-server installed):
```bash
npx http-server . -p 8000
```

Using VS Code Live Server extension (recommended)

### 3. Initial Admin Setup

#### Create First Admin User
1. Register a user in Firebase Authentication (through the admin dashboard login page)
2. Get the Firebase UID from the Firebase Console > Authentication > Users
3. Use a MongoDB client or the following Python script to add the first admin:

```python
from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client.stagecrew_db

admin_data = {
    'firebase_uid': 'your-firebase-uid-here',
    'name': 'Admin Name',
    'email': 'admin@example.com',
    'role': 'super_admin',
    'created_at': datetime.now()
}

db.admins.insert_one(admin_data)
print("Admin user created successfully!")
```

## File Structure

```
churchiestagecrew.xyz/
├── index.html              # Homepage
├── about.html              # About page
├── activities.html         # Activities page
├── productions.html        # Productions page
├── gallery.html           # Gallery page
├── join.html              # Membership application page
├── contact.html           # Contact page
├── admin-dashboard.html   # Admin dashboard
├── styles.css             # Main stylesheet
├── script.js              # Main JavaScript
├── admin-dashboard.js     # Admin dashboard JavaScript
├── backend/               # Backend API server
│   ├── app.py            # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   ├── .env              # Environment variables
│   └── firebase-service-account.json  # Firebase credentials
└── README.md             # This file
```

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/content/home` - Get home page content
- `GET /api/content/about` - Get about page content
- `POST /api/applications` - Submit membership application
- `POST /api/contact` - Submit contact form

### Admin Endpoints (Require Authentication)
- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/auth/register-admin` - Register new admin
- `PUT /api/content/home` - Update home page content
- `PUT /api/content/about` - Update about page content
- `GET /api/applications` - Get all applications
- `GET /api/applications/{id}` - Get specific application
- `PUT /api/applications/{id}/status` - Update application status
- `GET /api/contacts` - Get all contact messages

## Development

### Running in Development Mode
1. Start the backend server: `cd backend && python app.py`
2. Serve the frontend with live reload
3. Access the website at your local server URL
4. Access the admin dashboard at `/admin-dashboard.html`

### Environment Variables
- Set `FLASK_DEBUG=True` for development
- Use `FLASK_ENV=development` for development mode
- Update `CORS_ORIGINS` to include your development URLs

## Production Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a production WSGI server like Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Use production MongoDB instance

### Frontend Deployment
1. Update API URLs to production endpoints
2. Deploy static files to web server or CDN
3. Configure domain and SSL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
