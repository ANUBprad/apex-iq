# APEXiq Environment Variables

## Backend

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://apexiq:apexiq_pass@localhost:5432/apexiq` | PostgreSQL connection string |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Redis broker for Celery tasks |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Redis backend for Celery results |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:80` | Comma-separated allowed origins |
| `LOG_LEVEL` | `info` | Logging level: debug, info, warning, error |
| `API_KEY` | (empty) | API key for authenticated endpoints |
| `GROQ_API_KEY` | (empty) | Groq API key for AI features |
| `ENVIRONMENT` | `development` | Environment name: development, staging, production |
| `WEIGHT_SIMULATION` | `0.25` | Intelligence weight for simulation |
| `WEIGHT_HISTORY` | `0.20` | Intelligence weight for historical data |
| `WEIGHT_MEMORY` | `0.20` | Intelligence weight for memory |
| `WEIGHT_ML` | `0.35` | Intelligence weight for ML models |

## Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Backend API URL for development |
| `VITE_API_KEY` | (empty) | API key to include in requests |

## Docker Compose

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `apexiq` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `apexiq_pass` | PostgreSQL password |
| `POSTGRES_DB` | `apexiq` | PostgreSQL database name |
| `POSTGRES_PORT` | `5432` | PostgreSQL exposed port |
| `REDIS_PORT` | `6379` | Redis exposed port |
| `API_PORT` | `8000` | Backend API exposed port |
| `FRONTEND_PORT` | `3000` | Frontend exposed port |
| `NGINX_PORT` | `80` | Nginx exposed port |
| `NODE_ENV` | `production` | Node.js environment |
| `HOST` | `0.0.0.0` | Bind host |
| `PORT` | `3000` | Frontend port |

## Production Environment File

Create a `.env` file in the project root:

```bash
# Database
POSTGRES_USER=apexiq
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=apexiq

# CORS (comma-separated origins)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Keys
API_KEY=<your-api-key>
GROQ_API_KEY=<your-groq-key>

# Logging
LOG_LEVEL=info
ENVIRONMENT=production

# Ports
API_PORT=8000
FRONTEND_PORT=3000
NGINX_PORT=80
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for production databases
- Rotate API keys regularly
- Use HTTPS in production (configure via reverse proxy)
- Set `CORS_ORIGINS` to your actual domain in production
