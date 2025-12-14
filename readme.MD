# 📚 Polyglot Goodreads Clone

## Project Overview

This project implements a Goodreads-like application using a **Polyglot Persistence** architecture. It leverages the strengths of multiple specialized databases (Postgres, MongoDB, Neo4j, Redis) managed by a central FastAPI backend. This approach ensures optimal performance and flexibility for different data types.

### 🌐 Architecture Overview

The system is structured into a local React frontend and a Dockerized backend suite. The FastAPI API serves as the central orchestration layer.

| Component | Technology | Role & Data Store |
| :--- | :--- | :--- |
| **Relational/Transactional** | PostgreSQL (Asyncpg) | Stores core user accounts, static review records, and transactional follow history. |
| **Graph/Social** | Neo4j | Manages the social graph (`:FOLLOWS`) and rating relationships (`:RATED`) for generating complex, social-based recommendations. |
| **Document/Catalog** | MongoDB | Stores the flexible and media-rich book catalog data (Title, Author, Description, ISBN, etc.). |
| **Cache/Session** | Redis | Used for storing and validating high-speed JWT session tokens, offloading this burden from Postgres. |
| **API Backend** | FastAPI (Python) | The central gateway, handling authentication, routing, rate limiting, and coordinating **Polyglot Write** operations. |
| **Frontend** | React (Vite/TypeScript) | The client application consuming the secure FastAPI endpoints. |

## 🚀 Getting Started (Setup Guide)

This guide assumes you have **Docker**, **Docker Compose**, and **Node.js/npm** installed.

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/polyglot-goodreads-app.git
cd polyglot-goodreads-app
```

### Step 2: Configure Environment

You must set the JWT secret key for signing and verification. This key is crucial for authentication across the FastAPI security files.

Create a file named `.env` in the project root directory (`polyglot-goodreads-app/`) and add a long, secure secret key:

```bash
# .env file

# JWT Configuration: MUST be set to a long, secure string.
JWT_SECRET_KEY="A_VERY_LONG_AND_UNIQUE_SECRET_FOR_JWT_SIGNING"

# Database credentials are set inside docker-compose.yml
```

### Step 3: Start the Backend Stack (Dockerized)

This single command builds your custom FastAPI image and starts all backend services defined in `docker-compose.yml`.

```bash
docker compose up --build -d
```

Note: Wait for all services to initialize (Postgres and Neo4j can take a few seconds). You can monitor the logs with:

```bash
docker compose logs -f
```

### Step 4: Start the Frontend Application (Local Development)

The client runs locally and automatically connects to the Dockerized FastAPI service on port `8000`.

Navigate to the frontend directory and install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be accessible at: http://localhost:5173 (Vite default)

## 🧪 Key Features and Manual Tests

After the application is running, test the core polyglot operations:

| Feature | Action | Backend Operation |
| --- | --- | --- |
| API Docs | Access `http://localhost:8000/docs` | Verify FastAPI is running. |
| User Sign Up | Use the frontend `/signup` route. | Writes to Postgres (`users` table). |
| Session | Log in successfully. | Writes JWT token/ID to Redis (session cache). |
| Book Catalog | Navigate to the homepage or Book Details. | Reads from MongoDB. |
| Polyglot Write: Review | Post a review on a book page. | Writes review record to Postgres (`reviews`) and creates a `:RATED` relationship in Neo4j. |
| Polyglot Write: Follow | Click the 'Follow' button next to a reviewer. | Writes follow record to Postgres (`follows`) and creates a `:FOLLOWS` relationship in Neo4j. |
| Recommendations | Visit the `/dashboard` page. | Reads complex social and rating recommendations from Neo4j. |

## Notes & Next Steps

- The repository contains a React + Vite client and a Python FastAPI backend that uses multiple databases. See `docker-compose.yml` for service definitions and ports.
- If you want live reloading of backend code during development, consider mounting the server directory into the FastAPI container and using `uvicorn --reload` in development compose profiles.
