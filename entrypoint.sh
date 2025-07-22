#!/bin/bash

# entrypoint.sh - Production entrypoint script

set -e

# Wait for MongoDB to be ready (if using docker-compose)
if [ "$WAIT_FOR_MONGO" = "true" ]; then
    echo "Waiting for MongoDB to be ready..."
    while ! nc -z mongo 27017; do
        sleep 1
    done
    echo "MongoDB is ready!"
fi

# Run database migrations or setup if needed
# python backend/migrations.py

# Start the application
exec "$@"
