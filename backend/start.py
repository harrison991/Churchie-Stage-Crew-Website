#!/usr/bin/env python3
"""
Startup script for the Stage Crew API server
This script initializes the database with default content and starts the server
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_database():
    """Initialize the database with default content"""
    try:
        # Connect to MongoDB
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        db_name = os.getenv('DATABASE_NAME', 'stagecrew_db')
        
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        print(f"Connected to MongoDB: {db_name}")
        
        # Check if content already exists
        content_collection = db.content
        
        # Initialize home page content if it doesn't exist
        if not content_collection.find_one({'page': 'home'}):
            home_content = {
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            content_collection.insert_one(home_content)
            print("✓ Home page content initialized")
        
        # Initialize about page content if it doesn't exist
        if not content_collection.find_one({'page': 'about'}):
            about_content = {
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            content_collection.insert_one(about_content)
            print("✓ About page content initialized")
        
        # Create indexes for better performance
        db.applications.create_index("submitted_at")
        db.applications.create_index("status")
        db.contacts.create_index("submitted_at")
        db.contacts.create_index("status")
        db.admins.create_index("firebase_uid", unique=True)
        db.content.create_index("page", unique=True)
        
        print("✓ Database indexes created")
        print("✓ Database initialization complete")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def check_requirements():
    """Check if all requirements are met"""
    print("Checking requirements...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("❌ .env file not found. Please copy .env.example to .env and configure it.")
        return False
    
    # Check if Firebase service account file exists
    if not os.path.exists('firebase-service-account.json'):
        print("⚠️  firebase-service-account.json not found. Firebase authentication will not work.")
        print("   Please download your Firebase service account key and save it as 'firebase-service-account.json'")
    
    # Check environment variables
    required_vars = ['MONGODB_URI', 'DATABASE_NAME', 'SECRET_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✓ Requirements check passed")
    return True

def main():
    """Main startup function"""
    print("🚀 Starting Stage Crew API Server...")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Initialize database
    if not init_database():
        sys.exit(1)
    
    print("=" * 50)
    print("✅ Initialization complete!")
    print(f"🌐 Starting Flask server on port {os.getenv('PORT', 5000)}...")
    print("📱 Admin dashboard: http://localhost:5000/../admin-dashboard.html")
    print("🔧 API documentation: http://localhost:5000/api/health")
    print("=" * 50)
    
    # Import and run the Flask app
    from app import app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(host='0.0.0.0', port=port, debug=debug)

if __name__ == '__main__':
    main()
