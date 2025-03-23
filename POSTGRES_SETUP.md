# PostgreSQL Setup for AltaCoach

This guide provides detailed instructions for setting up PostgreSQL for the AltaCoach platform.

## Local PostgreSQL Setup

### 1. Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14
```

#### Windows
1. Download the installer from [PostgreSQL website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the instructions
3. Remember the password you set for the `postgres` user

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start
```

### 2. Create Database

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create database
CREATE DATABASE altacoach;

# Create a dedicated user (optional but recommended)
CREATE USER altacoach_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE altacoach TO altacoach_user;

# Exit psql
\q
```

### 3. Update Environment Variables

Edit your `.env` file to include the correct PostgreSQL connection string:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/altacoach?schema=public"
```

Or if you created a dedicated user:

```
DATABASE_URL="postgresql://altacoach_user:your_secure_password@localhost:5432/altacoach?schema=public"
```

## Database Migration and Seeding

After setting up PostgreSQL and updating your environment variables:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check that PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo service postgresql status
   
   # Windows
   # Check Services in Task Manager
   ```

2. Verify your connection string in `.env`

3. Make sure the database exists:
   ```bash
   psql -U postgres -c "\l"
   ```

4. Check PostgreSQL is listening on the expected port:
   ```bash
   # macOS/Linux
   sudo netstat -tulpn | grep postgres
   
   # Windows
   netstat -an | findstr 5432
   ```

### Permission Issues

If you encounter permission issues:

1. Check that your user has the correct permissions:
   ```bash
   psql -U postgres
   \du
   ```

2. Grant necessary permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE altacoach TO your_user;
   \c altacoach
   GRANT ALL PRIVILEGES ON SCHEMA public TO your_user;
   ```

## Using Prisma Studio

Prisma Studio provides a visual interface for managing your database:

```bash
npm run prisma:studio
```

This will open a browser window at http://localhost:5555 where you can view and edit your database. 