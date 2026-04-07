#!/usr/bin/python3
from sqlalchemy import Column, String
from sqlalchemy.orm import validates
from app.models.basemodel import BaseModel


class Amenity(BaseModel):
    __tablename__ = 'amenities'
    name = Column(String(50), nullable=False)
    icon = Column(String(255), default='✓')
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError('Enter a Name')
        
        if len(name) > 50:
            raise ValueError('Name cannot exceed 50 characters')
        
        return name.strip().upper()
