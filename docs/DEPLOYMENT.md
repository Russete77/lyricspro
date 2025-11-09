# Deployment Guide

Guia completo para deploy do TranscritorAI Pro em produção.

## 📋 Sumário

- [Requisitos de Sistema](#requisitos-de-sistema)
- [Deploy com Docker](#deploy-com-docker)
- [Deploy em Cloud](#deploy-em-cloud)
- [Configuração de Produção](#configuração-de-produção)
- [Monitoramento](#monitoramento)
- [Backup e Recuperação](#backup-e-recuperação)
- [Segurança](#segurança)
- [Scaling](#scaling)

---

## Requisitos de Sistema

### Mínimo (CPU apenas)

- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 50 GB SSD
- **Rede:** 100 Mbps

**Performance esperada:**
- ~10 minutos de processamento para 1 hora de áudio
- Modelo: base ou small

### Recomendado (GPU)

- **CPU:** 8+ cores
- **RAM:** 16 GB
- **GPU:** NVIDIA com 8+ GB VRAM (ex: RTX 3060)
- **Disco:** 100 GB NVMe SSD
- **Rede:** 1 Gbps

**Performance esperada:**
- ~3-5 minutos de processamento para 1 hora de áudio
- Modelo: large-v3

### Alto Volume (Enterprise)

- **CPU:** 16+ cores
- **RAM:** 32 GB
- **GPU:** NVIDIA A100 ou V100
- **Disco:** 500 GB NVMe SSD
- **Rede:** 10 Gbps

**Performance esperada:**
- ~1-2 minutos de processamento para 1 hora de áudio
- Processamento paralelo de múltiplos jobs

---

## Deploy com Docker

### 1. Preparação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/transcritor-ai-pro.git
cd transcritor-ai-pro

# Configure variáveis de ambiente
cp backend/.env.example backend/.env
nano backend/.env
```

### 2. Configurar .env para Produção

```env
# API
DEBUG=false
API_WORKERS=4

# Database (usar servidor dedicado)
DATABASE_URL=postgresql://user:pass@db-server:5432/transcritor_ai
DATABASE_POOL_SIZE=20

# Redis (usar servidor dedicado)
REDIS_URL=redis://redis-server:6379/0
CELERY_BROKER_URL=redis://redis-server:6379/0
CELERY_RESULT_BACKEND=redis://redis-server:6379/1

# Storage (usar S3 em produção)
STORAGE_TYPE=s3
STORAGE_ENDPOINT=s3.amazonaws.com
STORAGE_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
STORAGE_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_BUCKET=transcritor-ai-prod
STORAGE_SECURE=true

# Whisper
WHISPER_MODEL_SIZE=large-v3
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=int8

# OpenAI
OPENAI_API_KEY=sk-...

# Diarization
PYANNOTE_AUTH_TOKEN=hf_...

# Workers
CELERY_WORKER_CONCURRENCY=4

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
PROMETHEUS_ENABLED=true
```

### 3. Build e Deploy

```bash
# Build das imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Verificar saúde
curl http://localhost:8000/api/health
```

### 4. Configurar Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/transcritor-ai

upstream api {
    server localhost:8000;
}

server {
    listen 80;
    server_name transcritor-ai.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name transcritor-ai.example.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/transcritor-ai.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/transcritor-ai.example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client body size (max upload)
    client_max_body_size 2G;

    # Proxy to API
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts para uploads grandes
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Logs
    access_log /var/log/nginx/transcritor-ai-access.log;
    error_log /var/log/nginx/transcritor-ai-error.log;
}
```

Ativar configuração:
```bash
sudo ln -s /etc/nginx/sites-available/transcritor-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Deploy em Cloud

### AWS EC2

#### 1. Criar Instância

```bash
# Tipo recomendado: g4dn.xlarge (GPU)
# AMI: Deep Learning AMI (Ubuntu)
# Storage: 100 GB gp3
# Security Group: HTTP, HTTPS, SSH
```

#### 2. Conectar e Configurar

```bash
ssh -i key.pem ubuntu@ec2-xx-xxx-xxx-xxx.compute.amazonaws.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar NVIDIA Container Toolkit (para GPU)
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Clone e deploy
git clone https://github.com/seu-usuario/transcritor-ai-pro.git
cd transcritor-ai-pro
# Seguir passos do Docker acima
```

#### 3. Usar RDS e ElastiCache

```env
# .env com serviços AWS
DATABASE_URL=postgresql://admin:pass@mydb.xxx.us-east-1.rds.amazonaws.com:5432/transcritor
REDIS_URL=redis://my-redis.xxx.cache.amazonaws.com:6379/0
```

### Google Cloud Platform

```bash
# Criar VM com GPU
gcloud compute instances create transcritor-ai \
  --zone=us-central1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --metadata=install-nvidia-driver=True

# Conectar
gcloud compute ssh transcritor-ai --zone=us-central1-a

# Instalar Docker e seguir passos acima
```

### Azure

```bash
# Criar VM com GPU
az vm create \
  --resource-group myResourceGroup \
  --name transcritor-ai \
  --size Standard_NC6 \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys

# Conectar e configurar
ssh azureuser@<public-ip>
```

---

## Monitoramento

### Prometheus + Grafana

#### 1. docker-compose.monitoring.yml

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus_data:
  grafana_data:
```

#### 2. Iniciar monitoramento

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Acessar:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### Logs Centralizados (ELK Stack)

```bash
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.5.0
    volumes:
      - ./monitoring/logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: kibana:8.5.0
    ports:
      - "5601:5601"
```

---

## Backup e Recuperação

### Backup do PostgreSQL

```bash
# Backup diário automático
#!/bin/bash
# /usr/local/bin/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="transcritor_ai"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U transcritor $DB_NAME | \
  gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Manter apenas últimos 30 backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Agendar com cron:
```cron
# Executar diariamente às 3h
0 3 * * * /usr/local/bin/backup-db.sh
```

### Restauração

```bash
# Restaurar backup
gunzip < /backups/postgresql/backup_20251108_030000.sql.gz | \
  docker-compose exec -T postgres psql -U transcritor transcritor_ai
```

---

## Segurança

### 1. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. SSL/TLS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d transcritor-ai.example.com

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

### 3. Rate Limiting

Já configurado na aplicação:
- 10 requests/minuto por IP
- 100 requests/hora por IP

### 4. Variáveis Sensíveis

**NUNCA** commitar credenciais no Git.

Usar AWS Secrets Manager / Azure Key Vault:
```python
# app/config.py
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return response['SecretString']
```

---

## Scaling

### Scaling Horizontal (Workers)

```bash
# Aumentar número de workers
docker-compose up -d --scale worker-cpu=5

# Com GPU (múltiplas GPUs)
docker-compose up -d --scale worker-gpu=2
```

### Load Balancer (HAProxy)

```
# /etc/haproxy/haproxy.cfg

frontend http_front
    bind *:80
    default_backend api_backend

backend api_backend
    balance roundrobin
    server api1 10.0.0.1:8000 check
    server api2 10.0.0.2:8000 check
    server api3 10.0.0.3:8000 check
```

### Auto-Scaling (AWS)

```bash
# Criar Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name transcritor-ai-asg \
  --launch-template LaunchTemplateName=transcritor-ai-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

---

## Troubleshooting

### Problema: Workers não processam jobs

```bash
# Verificar logs
docker-compose logs worker-cpu

# Verificar conexão Redis
docker-compose exec worker-cpu redis-cli -h redis ping

# Reiniciar workers
docker-compose restart worker-cpu
```

### Problema: Out of Memory

```bash
# Aumentar swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Problema: GPU não reconhecida

```bash
# Verificar driver NVIDIA
nvidia-smi

# Verificar Docker com GPU
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

---

## Checklist de Produção

- [ ] SSL/TLS configurado
- [ ] Firewall ativo
- [ ] Backups automáticos
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Rate limiting configurado
- [ ] Variáveis sensíveis em Secrets Manager
- [ ] Health checks funcionando
- [ ] Reverse proxy configurado
- [ ] Auto-scaling configurado (se aplicável)
- [ ] Alertas configurados
- [ ] Documentação atualizada

---

## Suporte

Para problemas em produção:
- Email: ops@transcritorai.com
- Slack: #production-support
- On-call: +55 11 9999-9999
