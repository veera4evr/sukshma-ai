# SUKSHMA-AI Backend (FastAPI)

This is the Python/FastAPI backend for SUKSHMA-AI, providing the core API services required by the frontend application. It connects to the PostGIS database and interfaces with the PyTorch/ML pipeline (to be implemented).

## Architecture
The backend is structured as a standard FastAPI application:
- `app/api/`: Routing and endpoints
- `app/core/`: Configuration and system settings
- `app/models/`: SQLAlchemy ORM definitions (coming soon)
- `app/schemas/`: Pydantic validation models (coming soon)
- `app/services/`: Business logic and external API integrations
- `app/db/`: Database connection and session management

## Requirements
- Python 3.10+
- PostgreSQL + PostGIS (for spatial queries)

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables (create a `.env` file):
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/sukshma_ai
DEMO_MODE=True
```

## Running the Server

Run the application with `uvicorn`:
```bash
uvicorn app.main:app --reload --port 8000
```

The API documentation (Swagger) will be available at `http://localhost:8000/docs`.

## Integration with Frontend
Currently, the frontend uses mock demo data (`src/routes/api/$.ts`). Once this backend is fully integrated with the database, the frontend `api.ts` service should be updated to point to `http://localhost:8000/api/v1`.
