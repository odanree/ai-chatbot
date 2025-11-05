# 💾 Database Configuration Guide

> Database setup for development, testing, and production environments.

---

## 🎯 Quick Start

### Development (SQLite)

```bash
# No setup required - SQLite is file-based
npm run dev

# Database file created at: ./data/app.db
```

### Production (PostgreSQL)

```bash
# 1. Create PostgreSQL database
createdb ai_chatbot

# 2. Set connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/ai_chatbot"

# 3. Run migrations
npm run db:migrate

# 4. Start application
npm start
```

---

## 🗄️ Database Options

### SQLite (Recommended for Development)

**Pros**:
- ✅ No setup required - file-based
- ✅ Perfect for local development
- ✅ No running server needed
- ✅ Easy backups (just copy file)
- ✅ Fast for small datasets

**Cons**:
- ❌ Not suitable for production
- ❌ Limited concurrent connections
- ❌ No built-in replication

**Setup**:

```bash
# 1. Create data directory
mkdir -p data

# 2. Environment variable (.env.local)
DATABASE_URL="file:./data/app.db"

# 3. Database file auto-created on first run
npm run dev

# 4. Verify
ls -lh data/app.db
```

**Backup**:

```bash
# Simple file backup
cp data/app.db data/app.db.backup

# Or with timestamp
cp data/app.db data/app.db.$(date +%Y-%m-%d_%H-%M-%S).backup
```

**Restore**:

```bash
# Restore from backup
cp data/app.db.backup data/app.db
```

### PostgreSQL (Recommended for Production)

**Pros**:
- ✅ Production-grade database
- ✅ Excellent for large datasets
- ✅ Multiple concurrent connections
- ✅ Replication & failover support
- ✅ Built-in backup tools
- ✅ Cloud provider support (AWS RDS, Heroku, etc.)

**Cons**:
- ❌ Requires setup and maintenance
- ❌ Running server needed
- ❌ More complex configuration

#### Local Setup (macOS/Linux)

**Install PostgreSQL**:

```bash
# macOS (using Homebrew)
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Verify installation
psql --version
```

**Start Server**:

```bash
# macOS (background service)
brew services start postgresql

# Linux
sudo service postgresql start

# Verify running
psql -U postgres -c "SELECT version();"
```

**Create Database & User**:

```bash
# Open PostgreSQL shell
psql -U postgres

# Inside psql:
CREATE USER chatbot WITH PASSWORD 'secure_password_here';
CREATE DATABASE ai_chatbot OWNER chatbot;
GRANT ALL PRIVILEGES ON DATABASE ai_chatbot TO chatbot;
\q
```

**Verify Connection**:

```bash
psql -U chatbot -d ai_chatbot -h localhost
```

#### Docker Setup (All Platforms)

```bash
# 1. Create docker-compose.yml
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: chatbot
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: ai_chatbot
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatbot"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF

# 2. Start PostgreSQL container
docker-compose -f docker-compose.dev.yml up -d

# 3. Verify
docker-compose -f docker-compose.dev.yml ps
```

#### Cloud Setup (AWS RDS)

**Create RDS Instance**:

1. Go to AWS Console → RDS
2. Click "Create database"
3. Select "PostgreSQL"
4. Instance class: db.t3.micro (free tier)
5. Storage: 20GB
6. Database name: ai_chatbot
7. Master username: chatbot
8. Auto generate password: Yes
9. Create database (5-10 minutes)

**Get Connection String**:

1. RDS Dashboard → Databases → Your DB
2. Copy "Endpoint" (e.g., `ai-chatbot.xxxx.us-east-1.rds.amazonaws.com`)
3. Get password from AWS Secrets Manager

**Connect**:

```bash
# Connection string format
postgresql://chatbot:password@endpoint:5432/ai_chatbot

# Example
postgresql://chatbot:Ab123456@ai-chatbot.c12345.us-east-1.rds.amazonaws.com:5432/ai_chatbot

# Environment variable
export DATABASE_URL="postgresql://chatbot:Ab123456@ai-chatbot.c12345.us-east-1.rds.amazonaws.com:5432/ai_chatbot"

# Verify
npx prisma db push
```

### MongoDB (Alternative for Production)

**Pros**:
- ✅ NoSQL - flexible schema
- ✅ Easy horizontal scaling
- ✅ Good for document-based data
- ✅ Cloud-native (MongoDB Atlas)

**Cons**:
- ❌ Learning curve (different mindset from SQL)
- ❌ Less familiar to team
- ❌ Harder to ensure data consistency

**Setup (MongoDB Atlas - Cloud)**:

1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Create database user (username/password)
5. Add IP whitelist (or 0.0.0.0/0 for development)
6. Get connection string

```bash
# Connection format
mongodb+srv://username:password@cluster0.mongodb.net/database_name

# Environment variable
export DATABASE_URL="mongodb+srv://chatbot:secure_pwd@cluster0.mongodb.net/ai_chatbot"
```

---

## 🔗 Connection Strings

### Format Reference

```bash
# PostgreSQL
postgresql://username:password@host:port/database

# PostgreSQL with SSL (production)
postgresql://username:password@host:port/database?sslmode=require

# SQLite
file:./data/app.db
sqlite:///path/to/database.db

# MongoDB
mongodb+srv://username:password@cluster.mongodb.net/database_name
mongodb://username:password@host:port/database_name
```

### Environment Variable

```bash
# In .env.local (development)
DATABASE_URL="file:./data/app.db"

# In .env.production (production)
DATABASE_URL="postgresql://chatbot:password@db.example.com:5432/ai_chatbot"

# Verify loaded
echo $DATABASE_URL
```

---

## 🛠️ Database Migrations

### Initialize Migrations

```bash
# Using Prisma (recommended)
npx prisma migrate dev --name init

# Using TypeORM
npm run typeorm migration:generate -- -n init
```

### Create Migration

```bash
# Example: Add new column
npx prisma migrate dev --name add_user_preferences

# Review generated SQL
cat prisma/migrations/*/migration.sql
```

### Apply Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### View Current Schema

```bash
# Using Prisma
npx prisma db push --dry-run

# Using PostgreSQL CLI
psql -U chatbot -d ai_chatbot -c "\d"
```

---

## 💾 Backup & Restore

### PostgreSQL Backup

```bash
# Local backup
pg_dump -U chatbot -d ai_chatbot > backup_$(date +%Y-%m-%d).sql

# Compress
pg_dump -U chatbot -d ai_chatbot | gzip > backup_$(date +%Y-%m-%d).sql.gz

# With password (if needed)
PGPASSWORD=password pg_dump -U chatbot -h localhost -d ai_chatbot > backup.sql
```

### PostgreSQL Restore

```bash
# From SQL file
psql -U chatbot -d ai_chatbot < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -U chatbot -d ai_chatbot

# Into new database
psql -U chatbot -d new_database < backup.sql
```

### Automated Backups

**Daily Backup Script** (`scripts/backup-db.sh`):

```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/ai-chatbot"
DB_NAME="ai_chatbot"
DB_USER="chatbot"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
```

**Schedule with Cron** (daily at 2 AM):

```bash
# Edit crontab
crontab -e

# Add line
0 2 * * * /scripts/backup-db.sh
```

---

## 🧪 Testing Database

### Test Database Setup

```bash
# Create test database
createdb ai_chatbot_test

# Set environment
export DATABASE_URL="postgresql://chatbot:password@localhost:5432/ai_chatbot_test"

# Run tests
npm test
```

### Test Fixtures

```typescript
// tests/fixtures/database.ts

export async function setupTestDatabase(): Promise<void> {
  // Create test tables
  await db.schema.createTable('users').ifNotExists().execute();
  
  // Seed test data
  await db.table('users').insert({
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
  });
}

export async function teardownTestDatabase(): Promise<void> {
  // Clean up after tests
  await db.table('users').deleteWhere({});
}
```

### Mock Database (Unit Tests)

```typescript
// For unit tests, mock database instead of using real connection
import { vi } from 'vitest';

vi.mock('../db', () => ({
  db: {
    users: {
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
```

---

## 🔒 Security Best Practices

### 1. Connection Security

```bash
# ✅ DO: Use SSL for remote connections
postgresql://user:pass@host:5432/db?sslmode=require

# ✅ DO: Use strong passwords (20+ characters, mixed case, numbers, symbols)
password: aB3$xY9&mP2@qL7*wK1

# ❌ DON'T: Use default/simple passwords
password: postgres
password: password
```

### 2. Access Control

```sql
-- ✅ DO: Create limited user for application
CREATE USER chatbot WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ai_chatbot TO chatbot;
GRANT USAGE ON SCHEMA public TO chatbot;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chatbot;

-- ❌ DON'T: Give application database admin rights
GRANT ALL PRIVILEGES ON DATABASE ai_chatbot TO chatbot;
```

### 3. Network Isolation

```bash
# Development: Accept all connections (safe on localhost)
POSTGRES_HOST_AUTH_METHOD=trust

# Production: Accept only from application server IP
# In pg_hba.conf:
# host    ai_chatbot    chatbot    192.168.1.100/32    md5
```

### 4. Environment Variables

```bash
# ✅ DO: Never hardcode credentials
export DATABASE_URL="postgresql://..."

# ✅ DO: Use .env files (with .gitignore)
# ❌ DON'T: Commit .env files with real passwords
# ❌ DON'T: Log connection strings
logger.debug(`Connecting to ${process.env.DATABASE_URL}`);  // NO!
```

---

## 📊 Performance Tuning

### Indexes

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Composite index for common queries
CREATE INDEX idx_messages_user_date ON messages(user_id, created_at);
```

### Query Optimization

```typescript
// ✅ DO: Select only needed columns
const users = await db.table('users')
  .select('id', 'name', 'email')
  .limit(100);

// ❌ DON'T: Select all columns
const users = await db.table('users').limit(100);

// ✅ DO: Use pagination
const page1 = await db.table('users').limit(50).offset(0);
const page2 = await db.table('users').limit(50).offset(50);

// ❌ DON'T: Load entire table
const allUsers = await db.table('users');  // Might be millions of rows
```

---

## 🆘 Troubleshooting

### Error: "Connection refused"

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Check port is open
netstat -an | grep 5432
```

### Error: "Database does not exist"

```bash
# Create database
createdb ai_chatbot

# Or using psql
psql -U postgres -c "CREATE DATABASE ai_chatbot;"
```

### Error: "FATAL: role does not exist"

```bash
# Create user
createuser chatbot

# Or using psql
psql -U postgres -c "CREATE USER chatbot WITH PASSWORD 'password';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_chatbot TO chatbot;"
```

### Error: "SSL connection error"

```bash
# Check SSL certificate on production
# If self-signed:
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=allow"

# Or use proper certificate
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&sslcert=cert.pem"
```

---

## 📚 Related Documentation

- **Environment Configuration**: [docs/ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md)
- **Docker Setup**: [docs/DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
- **Vercel Deployment**: [docs/VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
- **Security Hardening**: [docs/SECURITY_HARDENING.md](SECURITY_HARDENING.md)

---

## 🔗 External Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **MongoDB Atlas**: https://mongodb.com/cloud/atlas
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Prisma ORM**: https://www.prisma.io/
- **Database Design**: https://www.dbdesigner.net/

---

**Last Updated**: November 5, 2025  
**Status**: Production-ready ✅
