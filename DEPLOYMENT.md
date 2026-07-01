# APEXiq Production Deployment Checklist

## Pre-Deployment

- [ ] All tests passing (`pytest tests/ -v`)
- [ ] Frontend lint clean (`cd frontend && npm run lint`)
- [ ] Frontend build successful (`cd frontend && npm run build`)
- [ ] Backend import verified (`python -c "from backend.main import app"`)
- [ ] Environment variables configured in `.env`
- [ ] Strong database password set
- [ ] CORS origins configured for production domain
- [ ] API keys generated and secured

## Docker Deployment

```bash
# 1. Clone repository
git clone <repo-url>
cd APEXiq

# 2. Create environment file
cp .env.example .env
# Edit .env with production values

# 3. Build and start services
docker compose build
docker compose up -d

# 4. Verify health
docker compose ps
curl http://localhost/health

# 5. Check logs
docker compose logs -f api
docker compose logs -f frontend
```

## Cloud Deployment

### Option A: Docker Compose (VPS/EC2)

1. Provision Ubuntu 22.04+ server
2. Install Docker and Docker Compose
3. Clone repository and configure `.env`
4. Run `docker compose up -d`
5. Configure DNS to point to server IP
6. Set up SSL with Certbot (see below)

### Option B: Railway

1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Railway auto-deploys on push

### Option C: Vercel (Frontend) + Railway (Backend)

1. Frontend: Import `frontend/` directory to Vercel
2. Backend: Deploy to Railway
3. Set `VITE_API_URL` to Railway backend URL

## SSL/HTTPS Setup

### With Certbot (Docker)

```bash
# Install Certbot
sudo apt install certbot

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf with SSL config
# Mount certificates in docker-compose.yml

# Restart
docker compose up -d nginx
```

### With Cloudflare

1. Add domain to Cloudflare
2. Enable proxy (orange cloud)
3. SSL/TLS mode: Full (Strict)
4. No nginx SSL config needed

## Post-Deployment Verification

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Backend API responds at `https://yourdomain.com/health`
- [ ] Mission Control page loads with live data
- [ ] Strategy Lab simulation runs successfully
- [ ] AI Engineer chat responds
- [ ] Telemetry data streams
- [ ] No console errors in browser
- [ ] No 5xx errors in nginx logs
- [ ] Response times < 500ms for API calls

## Monitoring

### Health Check Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Full health status with uptime |
| `GET /status` | API status and version |
| `GET /metrics` | Detailed metrics and endpoints |

### Log Monitoring

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f api
docker compose logs -f frontend

# View last 100 lines
docker compose logs --tail=100 api
```

## Rollback Procedure

```bash
# Stop current deployment
docker compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and restart
docker compose build
docker compose up -d
```

## Troubleshooting

### API won't start
- Check database connection: `docker compose exec api python -c "import psycopg2; psycopg2.connect('${DATABASE_URL}')"`
- Check Redis connection: `docker compose exec redis redis-cli ping`

### Frontend can't reach API
- Verify CORS_ORIGINS includes frontend URL
- Check nginx configuration
- Verify API health: `curl http://localhost:8000/health`

### High memory usage
- Reduce Celery workers: `--concurrency=1`
- Check for memory leaks in logs
- Scale horizontally with multiple replicas
