from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="reviewer") # 'admin' or 'reviewer'

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role_applied = Column(String, index=True)
    status = Column(String, default="new")  # new, reviewed, hired, rejected, archived
    skills = Column(JSON, default=list) 
    internal_notes = Column(String, nullable=True) 
   created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Soft delete flag
    is_archived = Column(Boolean, default=False) 

    scores = relationship("Score", back_populates="candidate")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    category = Column(String, nullable=False)
    score = Column(Integer, nullable=False) # 1-5
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    note = Column(String, nullable=True)
   created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewer = relationship("User")

    candidate = relationship("Candidate", back_populates="scores")