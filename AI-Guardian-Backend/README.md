# AI Guardian Backend

This is the backend for the AI Guardian application, built with FastAPI, SQLAlchemy (Async), and Alembic.

## Environment Setup

The backend requires a virtual environment with the dependencies listed in `requirements.txt`.

### 1. Initialize Virtual Environment
If you haven't already created the environment:
```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

### 2. Running the Application
To run the FastAPI server:
```bash
./venv/bin/uvicorn app.main:app --reload
```
Or activate the environment first:
```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

## Database Migrations (Alembic)

We use Alembic to manage database schema changes.

### Running Migrations
To upgrade the database to the latest version:
```bash
./venv/bin/alembic upgrade head
```

### Creating a New Migration
To create a new migration after changing models:
```bash
./venv/bin/alembic revision --autogenerate -m "description of changes"
```

> [!IMPORTANT]
> Always ensure you are running these commands through the virtual environment. If you see `ModuleNotFoundError: No module named 'sqlalchemy.ext.asyncio'`, it means you are likely using the system Python instead of the project's environment.