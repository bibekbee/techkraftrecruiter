# TechKraft Recruiter

A full-stack recruitment management system for managing candidates, conducting interviews, and tracking hiring progress. Built with FastAPI (backend) and React (frontend).

## Overview

TechKraft Recruiter is a web application designed to streamline the recruitment process. It allows teams to:
- Manage candidate information and application tracking
- Conduct evaluations and scoring (reviewers see only their scores; admins see all)
- Filter and search candidates with advanced filters
- Generate AI-powered candidate summaries (mock async call with loading states)
- Control access with role-based permissions (Admin/Reviewer)

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT-based auth with role-based access control (RBAC)
- **API Documentation**: Auto-generated Swagger UI at `/docs`

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios with React Query
- **Styling**: Tailwind CSS

## Project Structure

```
techKraftRecruiter/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── models.py            # SQLAlchemy models (User, Candidate, Score)
│   │   ├── schemas.py           # Pydantic schemas for validation
│   │   ├── database.py          # Database configuration
│   │   ├── auth.py              # Authentication & authorization
│   │   └── routers/
│   │       ├── auth.py          # Auth endpoints
│   │       └── candidates.py    # Candidate CRUD endpoints
│   ├── tests/
│   │   └── test_api.py          # API & auth enforcement tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route pages
│   │   ├── components/          # Reusable React components
│   │   ├── services/            # API service clients
│   │   ├── hooks/               # Custom React hooks
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── types/               # TypeScript interfaces
│   │   └── lib/                 # Utilities
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)

### Local Development

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs on `http://localhost:8000`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Docker Setup
```bash
docker-compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user (role hardcoded to `reviewer`)
- `POST /auth/login` - Login and get JWT token

### Candidates
- `GET /candidates` - List candidates with filters (status, role_applied, skill, keyword) + pagination
- `GET /candidates/{id}` - Get candidate details with scores and AI summary
- `POST /candidates/{id}/scores` - Add a score for a category (1-5, category name, optional note)
- `POST /candidates/{id}/summary` - Trigger mock AI summary generation (2s delay)

### Query Parameters
- `status` - Filter by candidate status (new, reviewed, hired, rejected, archived)
- `role_applied` - Filter by role
- `skill` - Filter by skill
- `keyword` - Free-text search in name/email
- `page` - Pagination offset (default 1)
- `page_size` - Results per page (default 20, max 50)

## Example API Calls

### Register and Login
```bash
# Register as reviewer
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"reviewer@techkraft.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer@techkraft.com","password":"password123"}'
# Response includes access_token
```

### List Candidates with Filters
```bash
# List all candidates
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/candidates

# List with filters and pagination
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/candidates?status=new&role_applied=Engineer&page=1&page_size=20"
```

### Get Candidate Detail
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/candidates/1
```

### Submit Score
```bash
curl -X POST http://localhost:8000/candidates/1/scores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technical Skills",
    "score": 4,
    "note": "Strong problem-solving ability"
  }'
```

### Generate AI Summary
```bash
curl -X POST http://localhost:8000/candidates/1/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
# Returns mock summary after ~2s delay
```

## Features

### Candidate Management
- Create, read, update candidates
- Track candidate status through workflow (new → reviewed → hired/rejected)
- Soft delete with archive functionality (never hard-delete)
- Optimized filtering at the database level

### Scoring System
- Add evaluations with category, score (1-5), and notes
- Reviewers see only their own scores
- Admins see all scores from all reviewers
- Multiple reviewers can score same candidate

### Role-Based Access Control (RBAC)
- **Admin**: Full access to all features and candidate data
- **Reviewer**: Can view candidates, add scores, but cannot edit candidate info or view internal notes
- Role is hardcoded at registration (never accepted from client)

### AI Integration
- Mock AI-powered summaries with 2-second delay (simulating LLM call)
- Frontend shows loading state during generation
- Error handling for failed requests

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your_super_secret_key_for_dev_only
```

See `.env.example` for reference. **Never commit real credentials.**

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Development

### Running Tests
```bash
# Backend
cd backend
pytest tests/
```

Tests cover:
- API endpoint functionality (creating/fetching candidates)
- Auth enforcement (reviewers cannot see other reviewers' scores)
- RBAC validation (admins only for sensitive operations)

### Building for Production
```bash
# Backend
cd backend
# Run with gunicorn: gunicorn -w 4 app.main:app

# Frontend
cd frontend
npm run build
# Outputs to dist/ for static serving
```

### Linting
```bash
# Frontend
cd frontend
npm run lint
```

---

## Security Checklist

- ✅ Credentials NOT committed (`.env.example` provided with dummy values)
- ✅ Role cannot be spoofed at registration (hardcoded to `reviewer`)
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens signed with SECRET_KEY
- ✅ Internal notes visible only to admins
- ✅ Soft deletes prevent data loss
- ✅ SQL queries use parameterized inputs (no SQL injection)

---

## Database Models

### User
- `id` (PK), `email` (unique), `hashed_password`, `role` (admin/reviewer)

### Candidate
- `id` (PK), `name`, `email` (unique), `role_applied` (indexed)
- `status` (indexed: new/reviewed/hired/rejected/archived)
- `skills` (array/JSON), `internal_notes` (admin-only)
- `created_at`, `is_archived` (soft delete flag)
- Relationships: `scores` (one-to-many)

### Score
- `id` (PK), `candidate_id` (FK, indexed), `category`, `score` (1-5)
- `reviewer_id` (FK), `note`, `created_at`
- Relationships: `candidate`, `reviewer`

## Debugging: Query Pattern Issue

**Problem:** The hypothetical code below loads all candidates into Python memory before filtering and pagination:

```python
def search_candidates(status: str, keyword: str, page: int, page_size: int):
    all_candidates = db.execute("SELECT * FROM candidates").fetchall()
    filtered = [c for c in all_candidates if c["status"] == status]
    # ... also filter by keyword in Python ...
    offset = (page - 1) * page_size
    return filtered[offset : offset + page_size]
```

**Why it matters:**
- **Memory explosion**: With 1M candidates, you load 1M rows into RAM on every request
- **No index usage**: Database indexes on `status` are ignored
- **Poor scalability**: Response time grows linearly with dataset size
- **Inconsistent pagination**: Results can shift between requests if data changes

**Correct approach:**
- **Push filtering to the database**: Let SQL WHERE clauses and indexes do the work
- **Apply pagination at DB level**: Use LIMIT/OFFSET on filtered results
- **Indexes on filter columns**: Index `status`, `role_applied`, and any searchable fields

**Our implementation** (in `routers/candidates.py`):
```python
query = db.query(models.Candidate).filter(models.Candidate.is_archived == False)
if status:
    query = query.filter(models.Candidate.status == status)
if role:
    query = query.filter(models.Candidate.role_applied == role)
# Pagination applied at DB level
offset = (page - 1) * page_size
candidates = query.offset(offset).limit(page_size).all()
```

This leverages database indexes and only fetches the requested page.

---

## Architecture Decision Records (ADR)

### ADR-1: FastAPI + SQLAlchemy for Backend

**Context:**
FastAPI is lightweight and built for async Python APIs; SQLAlchemy provides robust ORM with query optimization and relationship handling.

**Decision:**
Use FastAPI with SQLAlchemy ORM and SQLite for development (easily portable to PostgreSQL in production).

**Trade-off:**
- ✅ Fast development, automatic OpenAPI docs, strong type hints
- ❌ SQLite is single-writer (acceptable for internal tool; scale to PostgreSQL later)

---

### ADR-2: JWT-based RBAC with Hardcoded Roles at Registration

**Context:**
Role-based access is critical for distinguishing admin vs. reviewer capabilities. Accepting role from client is a security vulnerability.

**Decision:**
All new registrations are hardcoded to `reviewer` role. Only database or admin can assign `admin` role.

**Trade-off:**
- ✅ Prevents role escalation attacks, simple enforcement
- ❌ Requires manual DB intervention to promote users (acceptable for internal tool)

---

### ADR-3: React Query + Zod Validation for Frontend Data Flow

**Context:**
Managing API state, caching, and form validation consistently reduces bugs and improves UX.

**Decision:**
Use React Query for server state and Zod for client-side validation. Reviewers see filtered data (own scores); admins see all.

**Trade-off:**
- ✅ Automatic refetching, error handling, form type safety
- ❌ Slightly heavier bundle (acceptable for internal tool with controlled audience)

---

### ADR-4: Soft Deletes for Candidate Archival

**Context:**
Historical audit trails and soft deletes preserve data integrity. Hard deletes lose context and can break referential integrity.

**Decision:**
Mark candidates as archived (`is_archived = true` or `status = "archived"`) instead of removing rows. All queries filter archived candidates by default.

**Trade-off:**
- ✅ Preserves audit trail, safe referential integrity, easy undo
- ❌ Slightly larger database; requires discipline in queries to filter archived rows

---

## Learning Reflection

**Tried for the first time:** Building a complete RBAC system with JWT auth from scratch. The key insight was understanding how to enforce role checks at both the API route level (decorators) and the data level (filtering scores by reviewer_id). Initially, I considered using FastAPI dependencies for auth, which worked well and provided clean separation of concerns.

**Given more time:** I'd explore Server-Sent Events (SSE) for the stretch goal of real-time score updates (`GET /candidates/{id}/stream`). This would involve streaming new scores to the frontend as they're submitted, giving reviewers live visibility into scoring progress. Additionally, I'd add pagination and caching optimizations for large datasets.

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details
