# TransitOps Smart Transport Operations Platform

Backend service for TransitOps built with Spring Boot and PostgreSQL.

## Requirements

- Java 17
- Maven 3.9+ or the included Maven wrapper
- Docker and Docker Compose for the database

## Environment

The app reads these values from environment variables:

- `POSTGRES_DB` default: `transitops`
- `POSTGRES_USER` default: `transitops`
- `POSTGRES_PASSWORD` default: `transitops`
- `POSTGRES_PORT` default: `5432`
- `DB_HOST` default: `localhost`

Copy `.env.example` to `.env` if you want to override the defaults.

## Setup on Linux

1. Start PostgreSQL from the project root:

   ```bash
   docker compose up -d
   ```

2. Start the backend:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

## Setup on Windows

1. Start PostgreSQL from the project root:

   ```powershell
   docker compose up -d
   ```

2. Start the backend:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

## Test

Run tests from the `backend` folder:

```bash
./mvnw test
```

On Windows use:

```powershell
.\mvnw.cmd test
```