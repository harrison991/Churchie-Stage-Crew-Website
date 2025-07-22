# Churchie Stage Crew Website - Docker Setup

This repository contains a Flask web application with frontend pages that can be run using Docker.

## Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Churchie-Stage-Crew-Website
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Add Firebase credentials**
   - Download your Firebase service account key JSON file
   - Place it in the `backend/` directory as `firebase-service-account.json`

4. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:5000
   - API endpoints: http://localhost:5000/api/*
   - MongoDB: localhost:27017

## Docker Commands

### Build the Docker image
```bash
docker build -t churchie-stage-crew .
```

### Run the container
```bash
docker run -p 5000:5000 --env-file .env churchie-stage-crew
```

### Run with external MongoDB
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI="your-mongodb-connection-string" \
  -e SECRET_KEY="your-secret-key" \
  -e FIREBASE_PROJECT_ID="your-firebase-project-id" \
  churchie-stage-crew
```

## Production Deployment

### Using Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml stagecrew
```

### Using Kubernetes
Create Kubernetes manifests based on the Docker setup.

### Environment Variables

Required environment variables:
- `SECRET_KEY`: Flask secret key
- `MONGODB_URI`: MongoDB connection string
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `DATABASE_NAME`: MongoDB database name

Optional:
- `PORT`: Application port (default: 5000)
- `FLASK_ENV`: Flask environment (development/production)
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## Frontend Pages Served

The Flask app now serves all frontend pages:
- `/` - Home page (index.html)
- `/about` - About page
- `/activities` - Activities page
- `/contact` - Contact page
- `/gallery` - Gallery page
- `/join` - Join page
- `/productions` - Productions page
- `/admin` - Admin dashboard

## API Endpoints

All API endpoints are available under `/api/`:
- `GET /api/health` - Health check
- `POST /api/auth/verify` - Token verification
- `GET /api/content/home` - Home page content
- `POST /api/applications` - Submit application
- And more...

## Development

To run in development mode with hot reload:
```bash
# Uncomment the volumes section in docker-compose.yml
docker-compose up
```

This will mount your local source code into the container for live development.

## Troubleshooting

1. **MongoDB connection issues**: Ensure MongoDB is running and accessible
2. **Firebase errors**: Check that `firebase-service-account.json` is in the backend directory
3. **Port conflicts**: Change the port mapping in docker-compose.yml if needed
4. **CORS errors**: Update `CORS_ORIGINS` in your .env file

## File Structure
```
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── .env.example            # Environment variables template
├── .dockerignore           # Docker ignore file
├── entrypoint.sh           # Container entrypoint script
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── firebase-service-account.json  # Firebase credentials (add this)
└── frontend/
    ├── index.html          # Frontend HTML files
    ├── styles.css          # Stylesheets
    ├── script.js           # JavaScript files
    └── ...                 # Other frontend assets
```
