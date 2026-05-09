from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import asyncio

from .. import models, schemas, auth, database

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("/", response_model=List[schemas.CandidateResponse])
def list_candidates(
    status: str = None,
    role: str = None,
    skill: str = None,
    page: int = 1,
    page_size: int = Query(20, le=50),
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    # Optimized query: Filter at the DB level, not in Python memory!
    query = db.query(models.Candidate).filter(models.Candidate.is_archived == False)
    
    if status:
        query = query.filter(models.Candidate.status == status)
    if role:
        query = query.filter(models.Candidate.role_applied == role)
    if skill:
        query = query.filter(models.Candidate.skills.contains(skill))

    offset = (page - 1) * page_size
    candidates = query.offset(offset).limit(page_size).all()
    
    # Logic to mask internal_notes for non-admins
    for c in candidates:
        if current_user["role"] != "admin":
            c.internal_notes = None
            
    return candidates

@router.get("/{id}", response_model=schemas.CandidateResponse)
def get_candidate_detail(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == id).first()
    if not candidate or candidate.is_archived:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # --- RBAC Logic for Scores --- [cite: 28, 29, 36]
    if current_user["role"] != "admin":
        # Reviewer: Filter scores to only show their own
        candidate.scores = [s for s in candidate.scores if s.reviewer_id == current_user["id"]]
        # Reviewer: Hide internal notes [cite: 28, 39]
        candidate.internal_notes = None
    
    return candidate

#I have added the Create Candidate endpoint for testing.
@router.post("/", response_model=schemas.CandidateResponse)
def create_candidate(
    candidate: schemas.CandidateCreate,
    db: Session = Depends(database.get_db),
):
    # Check for duplicate email
    existing = db.query(models.Candidate).filter(models.Candidate.email == candidate.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate with this email already exists")
    
    new_candidate = models.Candidate(
        name=candidate.name,
        email=candidate.email,
        role_applied=candidate.role_applied,
        skills=candidate.skills,
        status="new"
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate

@router.post("/{id}/summary")
async def get_ai_summary(id: int, db: Session = Depends(database.get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Simulated 2s async delay
    await asyncio.sleep(2) 
    return {"summary": f"Based on the profile of {candidate.name}, they are a strong fit for {candidate.role_applied} role."}

@router.delete("/{id}")
def soft_delete_candidate(id: int, db: Session = Depends(database.get_db), admin=Depends(auth.check_admin_role)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate.is_archived = True # Never hard-delete 
    candidate.status = "archived"
    db.commit()
    return {"message": "Candidate archived"}



#Score API endpoints
@router.post("/{id}/scores", response_model=schemas.ScoreResponse)
def submit_score(
    id: int, 
    score_data: schemas.ScoreBase, 
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    # Check if candidate exists
    candidate = db.query(models.Candidate).filter(models.Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # In a real app, we'd get reviewer_id from the DB user object. 
    # For this assignment, we'll use the email hash or a mock ID.
    new_score = models.Score(
        candidate_id=id,
        category=score_data.category,
        score=score_data.score,
        note=score_data.note,
        reviewer_id=current_user["id"] # Using email as the reviewer identifier
    )
    
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

