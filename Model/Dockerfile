# Use official Python runtime as base image
FROM python:3.10-slim

# Set working directory in container
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ModelAPI.py .
COPY *.h5 ./
COPY *.pkl ./

# Expose port 5000 for Flask
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=ModelAPI.py
ENV FLASK_ENV=production

# Command to run the Flask app
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
