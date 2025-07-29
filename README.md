# Travel Document Query Application

A full-stack application that uses LLMs to provide accurate information about travel document requirements for international travelers.

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── app/           # Application code
│   │   ├── api/       # API endpoints
│   │   ├── core/      # Core functionality
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── utils/     # Utility functions
│   ├── alembic/       # Database migrations
│   └── Dockerfile     # Backend container definition
└── docker-compose.yml # Docker compose configuration
```

## Features

- User authentication with JWT tokens
- LLM-powered travel document requirement queries
- Support for multiple LLM providers (OpenAI, DeepSeek, Gemini, Claude)
- Structured response formatting for travel documents
- Query history tracking
- PostgreSQL database for data persistence

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, Alembic
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with OAuth2
- **LLM Integration**: OpenAI, DeepSeek, Gemini, Claude
- **Containerization**: Docker, Docker Compose

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- LLM API key (OpenAI, DeepSeek, Gemini, or Claude)

### Environment Configuration

1. Copy the example environment file and update with your settings:

```bash
cp backend/.env.example backend/.env
```

2. Update the `.env` file with your database credentials and LLM API key.

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head
```

The API will be available at http://localhost:8000

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running Locally

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv env
source env/bin/activate  # On Windows: .\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn app.main:app --reload
```

### Database Migrations

```bash
# Generate a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## License

MIT