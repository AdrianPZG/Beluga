# Use the official Python slim image for a smaller footprint
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Create and activate virtual environment, then install dependencies
RUN python -m venv /app/venv && \
    . /app/venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH="/app/venv/bin:$PATH"

# Expose the port FastAPI will run on
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]