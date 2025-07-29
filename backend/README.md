# Travel Document Query API

A FastAPI backend for a travel document query application that uses LLM integration to provide information about travel requirements.

## Features

- User authentication with JWT tokens
- LLM integration with multiple provider options (OpenAI, DeepSeek, Gemini, Claude)
- PostgreSQL database integration with SQLAlchemy ORM
- Query history tracking
- Structured responses for travel document queries

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **LLM Integration**: OpenAI/DeepSeek/Gemini/Claude

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL database (or Neon account)
- LLM API key (OpenAI, DeepSeek, Gemini, or Claude)

### Installation

1. Clone the repository

2. Create a virtual environment and activate it:
   ```bash
   cd backend
   python -m venv env
   source env/bin/activate  # On Windows: .\env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and fill in your configuration

5. Initialize the database:
   ```bash
   alembic init alembic
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

6. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

7. Access the API documentation at http://localhost:8000/docs

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token

### Users

- `GET /api/v1/users/me` - Get current user information

### Queries

- `POST /api/v1/queries/` - Create a new query and get LLM response
- `GET /api/v1/queries/history` - Get query history for current user
- `GET /api/v1/queries/{query_id}` - Get a specific query by ID

## Docker Deployment

Build and run the Docker container:

```bash
docker build -t travel-query-api .
docker run -p 8000:8000 --env-file .env travel-query-api
```

## Environment Variables

See `.env.example` for required environment variables.