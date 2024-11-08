# models.py
from sqlalchemy import Column, String
from database import Base

class User(Base):
    __tablename__ = 'User'  # Matching sql table

    user_id = Column(String(255), primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
