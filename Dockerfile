# Compatibility gateway image for the legacy Render Docker service.
# Render builds this Dockerfile with callpilot/backend as its build context.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY proxy_requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY proxy_app.py ./proxy_app.py

EXPOSE 8000
CMD ["sh", "-c", "uvicorn proxy_app:app --host 0.0.0.0 --port ${PORT:-8000}"]
