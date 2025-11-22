---
description: Production Deployment
---

# Workflow: Production Deployment

## 1. Environment Variables konfigurieren

Erstelle eine `.env` Datei mit Production-Werten:

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Datenbank (Production)
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=rentacar_prod
DB_USERNAME=rentacar_prod_user
DB_PASSWORD=SECURE_PASSWORD_HERE

# JWT & Verschlüsselung
JWT_SECRET=SECURE_SECRET_KEY_MIN_256_BITS
JWT_EXPIRATION=86400000
ENCRYPTION_KEY=SECURE_ENCRYPTION_KEY_32_CHARS

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@rentacar.com
MAIL_PASSWORD=APP_PASSWORD_HERE
MAIL_FROM=noreply@rentacar.com
MAIL_FROM_NAME=RentACar

# AWS S3
STORAGE_TYPE=s3
S3_BUCKET_NAME=rentacar-production-images
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
```

## 2. Production Build erstellen

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn clean package -DskipTests
```

## 3. Docker Image erstellen (Optional)

**Dockerfile erstellen:**
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/RentACar-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Image bauen:**
```bash
docker build -t rentacar-backend:latest .
```

**Container starten:**
```bash
docker run -d \
  --name rentacar-api \
  -p 8080:8080 \
  --env-file .env \
  rentacar-backend:latest
```

## 4. Direkt mit JAR deployen

```bash
# Environment Variables laden
source .env

# Anwendung starten
nohup java -jar target/RentACar-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

## 5. Health Check

```bash
curl https://your-domain.com/actuator/health
```

## 6. Logs überwachen

```bash
# Docker Logs
docker logs -f rentacar-api

# JAR Logs
tail -f app.log
```

## 7. Datenbank Backup (Empfohlen)

```bash
# PostgreSQL Backup
pg_dump -h your-db-host.com -U rentacar_prod_user rentacar_prod > backup.sql

# Restore
psql -h your-db-host.com -U rentacar_prod_user rentacar_prod < backup.sql
```

## 8. SSL/HTTPS konfigurieren

Verwende einen Reverse Proxy (z.B. Nginx):

```nginx
server {
    listen 443 ssl;
    server_name api.rentacar.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Wichtige Hinweise

- ✅ Sichere Passwörter verwenden
- ✅ HTTPS aktivieren
- ✅ Regelmäßige Backups
- ✅ Monitoring einrichten (Prometheus/Grafana)
- ✅ Log Rotation konfigurieren
- ✅ Firewall-Regeln setzen
