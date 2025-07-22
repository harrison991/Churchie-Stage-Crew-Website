from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv
import pymongo
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGINS', '').split(','))

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# MongoDB connection
mongo_client = MongoClient(os.getenv('MONGODB_URI'))
db = mongo_client[os.getenv('DATABASE_NAME')]

# Firebase Admin SDK initialization
# Note: You'll need to download your Firebase service account key
# and place it in the backend folder as 'firebase-service-account.json'
try:
    cred = credentials.Certificate('firebase-service-account.json')
    firebase_admin.initialize_app(cred, {
        'projectId': os.getenv('FIREBASE_PROJECT_ID'),
    })
except Exception as e:
    print(f"Firebase initialization error: {e}")
    print("Please add your Firebase service account key file")

# Helper function to convert ObjectId to string
def json_serial(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# Authentication middleware
def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None

def require_auth(f):
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        decoded_token = verify_firebase_token(token)
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Check if user is admin
        admin_collection = db.admins
        admin = admin_collection.find_one({'firebase_uid': decoded_token['uid']})
        if not admin:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        request.current_user = decoded_token
        request.current_admin = admin
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Authentication Routes
@app.route('/api/auth/verify', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token required'}), 400
    
    decoded_token = verify_firebase_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    
    # Check if user is admin
    admin_collection = db.admins
    admin = admin_collection.find_one({'firebase_uid': decoded_token['uid']})
    
    return jsonify({
        'valid': True,
        'user': decoded_token,
        'is_admin': admin is not None,
        'admin_info': json.loads(json.dumps(admin, default=json_serial)) if admin else None
    })

@app.route('/api/auth/register-admin', methods=['POST'])
@require_auth
def register_admin():
    data = request.get_json()
    firebase_uid = data.get('firebase_uid')
    name = data.get('name')
    email = data.get('email')
    role = data.get('role', 'admin')
    
    if not all([firebase_uid, name, email]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    admin_collection = db.admins
    
    # Check if admin already exists
    existing_admin = admin_collection.find_one({'firebase_uid': firebase_uid})
    if existing_admin:
        return jsonify({'error': 'Admin already exists'}), 409
    
    admin_data = {
        'firebase_uid': firebase_uid,
        'name': name,
        'email': email,
        'role': role,
        'created_at': datetime.now(),
        'created_by': request.current_admin['_id']
    }
    
    result = admin_collection.insert_one(admin_data)
    admin_data['_id'] = result.inserted_id
    
    return jsonify({
        'message': 'Admin registered successfully',
        'admin': json.loads(json.dumps(admin_data, default=json_serial))
    }), 201

# Content Management Routes

@app.route('/api/content/home', methods=['GET'])
def get_home_content():
    content_collection = db.content
    home_content = content_collection.find_one({'page': 'home'})
    
    if not home_content:
        # Create default home content
        default_content = {
            'page': 'home',
            'hero': {
                'title': 'Anglican Church Grammar School',
                'subtitle': 'Stage Crew Co-curricular',
                'description': 'Behind every great performance is an exceptional crew. Join us in bringing productions to life through technical excellence and creative collaboration.',
                'buttons': [
                    {'text': 'Join Stage Crew', 'link': 'join.html', 'type': 'primary'},
                    {'text': 'Learn More', 'link': 'about.html', 'type': 'secondary'}
                ]
            },
            'features': [
                {
                    'icon': 'fas fa-lightbulb',
                    'title': 'Lighting Design',
                    'description': 'Master the art of theatrical lighting, from basic spotlights to complex moving light systems and LED technology.'
                },
                {
                    'icon': 'fas fa-volume-up',
                    'title': 'Sound Engineering',
                    'description': 'Learn professional audio mixing, microphone techniques, and sound system operation for live performances.'
                },
                {
                    'icon': 'fas fa-theater-masks',
                    'title': 'Set Construction',
                    'description': 'Build and design stage sets, props, and backdrops that bring theatrical visions to reality.'
                },
                {
                    'icon': 'fas fa-camera',
                    'title': 'Video Production',
                    'description': 'Operate cameras, edit footage, and create multimedia content for school productions and events.'
                }
            ],
            'stats': [
                {'number': 150, 'label': 'Active Members'},
                {'number': 25, 'label': 'Productions Per Year'},
                {'number': 8, 'label': 'Years Running'},
                {'number': 500, 'label': 'Hours of Training'}
            ],
            'upcoming_events': [
                {
                    'date': {'day': '15', 'month': 'Aug'},
                    'title': 'Technical Training Workshop',
                    'description': 'Learn the basics of stage lighting and sound systems',
                    'time': '3:30 PM - 5:30 PM'
                },
                {
                    'date': {'day': '22', 'month': 'Aug'},
                    'title': 'School Musical Setup',
                    'description': 'Preparing for the annual school musical production',
                    'time': 'All Day'
                },
                {
                    'date': {'day': '5', 'month': 'Sep'},
                    'title': 'New Member Orientation',
                    'description': 'Welcome session for new Stage Crew members',
                    'time': '3:30 PM - 4:30 PM'
                }
            ],
            'updated_at': datetime.now()
        }
        
        result = content_collection.insert_one(default_content)
        home_content = default_content
        home_content['_id'] = result.inserted_id
    
    return jsonify(json.loads(json.dumps(home_content, default=json_serial)))

@app.route('/api/content/home', methods=['PUT'])
@require_auth
def update_home_content():
    data = request.get_json()
    content_collection = db.content
    
    # Update the home content
    update_data = data.copy()
    update_data['updated_at'] = datetime.now()
    update_data['updated_by'] = request.current_admin['_id']
    
    result = content_collection.update_one(
        {'page': 'home'},
        {'$set': update_data},
        upsert=True
    )
    
    return jsonify({'message': 'Home content updated successfully'})

@app.route('/api/content/about', methods=['GET'])
def get_about_content():
    content_collection = db.content
    about_content = content_collection.find_one({'page': 'about'})
    
    if not about_content:
        # Create default about content
        default_content = {
            'page': 'about',
            'mission': 'To provide students with hands-on experience in technical theatre, fostering creativity, teamwork, and professional skills that extend far beyond the stage.',
            'vision': 'To be the premier technical theatre program in Brisbane, developing the next generation of creative professionals and instilling a lifelong appreciation for the arts and technical innovation.',
            'values': [
                {'name': 'Excellence', 'description': 'Striving for the highest standards in all we do'},
                {'name': 'Collaboration', 'description': 'Working together to achieve common goals'},
                {'name': 'Innovation', 'description': 'Embracing new technologies and creative solutions'},
                {'name': 'Respect', 'description': 'Valuing each team member\'s contribution'},
                {'name': 'Growth', 'description': 'Continuously learning and developing our skills'}
            ],
            'history': [
                {'year': 2017, 'title': 'Foundation', 'description': 'Stage Crew was established as a formal co-curricular activity with just 15 enthusiastic students and basic equipment.'},
                {'year': 2018, 'title': 'First Major Production', 'description': 'Successfully managed technical aspects of the school\'s first major musical production, "Grease," showcasing our growing capabilities.'},
                {'year': 2020, 'title': 'Digital Innovation', 'description': 'Adapted to virtual productions during COVID-19, pioneering livestream technologies and digital stage design.'},
                {'year': 2022, 'title': 'Equipment Upgrade', 'description': 'Invested in state-of-the-art lighting systems, digital mixing consoles, and professional-grade video equipment.'},
                {'year': 2025, 'title': 'Present Day', 'description': 'Now boasting 150+ active members and supporting 25+ productions annually, we continue to grow and innovate.'}
            ],
            'staff': [
                {
                    'name': 'Mr. Brian Bowen',
                    'role': 'Events Production Manager',
                    'description': 'A graduate of Queensland Conservatorium, Mr. Bowen specializes in live sound mixing and audio system design for theatrical productions.'
                },
                {
                    'name': 'Mr. Jack Franklin',
                    'role': 'Sound Engineer Coordinator',
                    'description': 'A graduate of Queensland Conservatorium, Mr. Franklin specializes in live sound mixing and audio system design for theatrical productions.'
                }
            ],
            'student_leaders': [
                {
                    'title': 'Stage Crew Captain',
                    'name': 'Noah Oxenford',
                    'year': 'Year 12',
                    'description': 'Leads overall operations and coordinates with school administration on major productions.',
                    'icon': 'fas fa-crown'
                },
                {
                    'title': 'Lighting Director',
                    'name': 'Sophie Chen',
                    'year': 'Year 11',
                    'description': 'Oversees all lighting design and operation for school productions and events.',
                    'icon': 'fas fa-lightbulb'
                },
                {
                    'title': 'Head of Audio',
                    'name': 'Arjun Pabari',
                    'year': 'Year 9',
                    'description': 'Manages sound systems, mixing, and audio recording for all events.',
                    'icon': 'fas fa-volume-up'
                },
                {
                    'title': 'Technical Director',
                    'name': 'Jessica Park',
                    'year': 'Year 12',
                    'description': 'Coordinates set construction, props, and backstage technical operations.',
                    'icon': 'fas fa-tools'
                }
            ],
            'awards': [
                {
                    'title': 'Best Technical Production',
                    'year': 2024,
                    'description': 'Queensland School Drama Festival - Awarded for outstanding technical excellence in "Les Misérables"',
                    'icon': 'fas fa-trophy'
                },
                {
                    'title': 'Innovation in Education',
                    'year': 2023,
                    'description': 'Brisbane Education Excellence Awards - Recognized for innovative use of technology in arts education',
                    'icon': 'fas fa-medal'
                },
                {
                    'title': 'Community Service Award',
                    'year': 2023,
                    'description': 'Local Council Recognition - For providing technical support to community theatre groups',
                    'icon': 'fas fa-star'
                },
                {
                    'title': 'Student Excellence',
                    'year': 2022,
                    'description': 'National Arts Education Awards - Outstanding student leadership and participation',
                    'icon': 'fas fa-award'
                }
            ],
            'updated_at': datetime.now()
        }
        
        result = content_collection.insert_one(default_content)
        about_content = default_content
        about_content['_id'] = result.inserted_id
    
    return jsonify(json.loads(json.dumps(about_content, default=json_serial)))

@app.route('/api/content/about', methods=['PUT'])
@require_auth
def update_about_content():
    data = request.get_json()
    content_collection = db.content
    
    update_data = data.copy()
    update_data['updated_at'] = datetime.now()
    update_data['updated_by'] = request.current_admin['_id']
    
    result = content_collection.update_one(
        {'page': 'about'},
        {'$set': update_data},
        upsert=True
    )
    
    return jsonify({'message': 'About content updated successfully'})

# Applications Management
@app.route('/api/applications', methods=['GET'])
@require_auth
def get_applications():
    applications_collection = db.applications
    
    # Get query parameters for filtering
    status = request.args.get('status')
    year_level = request.args.get('year_level')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    # Build query
    query = {}
    if status:
        query['status'] = status
    if year_level:
        query['year_level'] = year_level
    
    # Get total count
    total = applications_collection.count_documents(query)
    
    # Get applications with pagination
    applications = list(applications_collection.find(query)
                       .sort('submitted_at', -1)
                       .skip((page - 1) * limit)
                       .limit(limit))
    
    return jsonify({
        'applications': json.loads(json.dumps(applications, default=json_serial)),
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    })

@app.route('/api/applications/<application_id>', methods=['GET'])
@require_auth
def get_application(application_id):
    applications_collection = db.applications
    
    try:
        application = applications_collection.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        return jsonify(json.loads(json.dumps(application, default=json_serial)))
    except:
        return jsonify({'error': 'Invalid application ID'}), 400

@app.route('/api/applications/<application_id>/status', methods=['PUT'])
@require_auth
def update_application_status():
    data = request.get_json()
    application_id = request.view_args['application_id']
    new_status = data.get('status')
    notes = data.get('notes', '')
    
    if new_status not in ['pending', 'approved', 'rejected', 'reviewed']:
        return jsonify({'error': 'Invalid status'}), 400
    
    applications_collection = db.applications
    
    try:
        result = applications_collection.update_one(
            {'_id': ObjectId(application_id)},
            {
                '$set': {
                    'status': new_status,
                    'admin_notes': notes,
                    'reviewed_at': datetime.now(),
                    'reviewed_by': request.current_admin['_id']
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Application not found'}), 404
        
        return jsonify({'message': 'Application status updated successfully'})
    except:
        return jsonify({'error': 'Invalid application ID'}), 400

@app.route('/api/applications', methods=['POST'])
def submit_application():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'year_level', 'student_id', 'email', 
                      'interests', 'availability', 'motivation', 'parent_name', 
                      'parent_email', 'parent_phone']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create application document
    application_data = {
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'year_level': data['year_level'],
        'student_id': data['student_id'],
        'email': data['email'],
        'phone': data.get('phone', ''),
        'interests': data['interests'],
        'previous_experience': data.get('previous_experience', ''),
        'other_activities': data.get('other_activities', ''),
        'skills_interests': data.get('skills_interests', ''),
        'availability': data['availability'],
        'motivation': data['motivation'],
        'commitments': data.get('commitments', []),
        'parent_name': data['parent_name'],
        'parent_email': data['parent_email'],
        'parent_phone': data['parent_phone'],
        'parent_consent': data.get('parent_consent', False),
        'status': 'pending',
        'submitted_at': datetime.now(),
        'ip_address': request.remote_addr
    }
    
    applications_collection = db.applications
    result = applications_collection.insert_one(application_data)
    
    return jsonify({
        'message': 'Application submitted successfully',
        'application_id': str(result.inserted_id)
    }), 201

# Contact form submissions
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.get_json()
    
    required_fields = ['name', 'email', 'type', 'subject', 'message']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    contact_data = {
        'name': data['name'],
        'email': data['email'],
        'phone': data.get('phone', ''),
        'type': data['type'],
        'subject': data['subject'],
        'message': data['message'],
        'newsletter': data.get('newsletter', False),
        'status': 'new',
        'submitted_at': datetime.now(),
        'ip_address': request.remote_addr
    }
    
    contacts_collection = db.contacts
    result = contacts_collection.insert_one(contact_data)
    
    return jsonify({
        'message': 'Message sent successfully',
        'contact_id': str(result.inserted_id)
    }), 201

@app.route('/api/contacts', methods=['GET'])
@require_auth
def get_contacts():
    contacts_collection = db.contacts
    
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    query = {}
    if status:
        query['status'] = status
    
    total = contacts_collection.count_documents(query)
    contacts = list(contacts_collection.find(query)
                   .sort('submitted_at', -1)
                   .skip((page - 1) * limit)
                   .limit(limit))
    
    return jsonify({
        'contacts': json.loads(json.dumps(contacts, default=json_serial)),
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', False))
