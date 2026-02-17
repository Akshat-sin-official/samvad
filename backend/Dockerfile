FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements from current directory (backend/) to /app/backend/
COPY requirements.txt /app/backend/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the rest of the backend code
COPY . /app/backend/

# Expose port
EXPOSE 8080

# Command to run the application
# We run from /app, targeting backend.main:app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
