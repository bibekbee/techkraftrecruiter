from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Score Schemas ---
class ScoreBase(BaseModel):
    category: str
    score: int = Field(..., ge=1, le=5) # Constraint: 1-5 [cite: 18]
    note: Optional[str] = None

class ScoreCreate(ScoreBase):
    candidate_id: int

class ScoreResponse(ScoreBase):
    id: int
    reviewer_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Candidate Schemas ---
class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    role_applied: str
    skills: List[str] = []

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    status: Optional[str] = None # new, reviewed, hired, rejected, archived [cite: 22]
    internal_notes: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: int
    status: str
    internal_notes: Optional[str] = None # Logic will mask this for non-admins 
    created_at: datetime
    scores: List[ScoreResponse] = []

    class Config:
        from_attributes = True

# --- Utility ---
class AISummaryResponse(BaseModel):
    summary: str