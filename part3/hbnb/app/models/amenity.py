#!/usr/bin/python3
import uuid
from datetime import datetime
from app.models.basemodel import BaseModel


class Amenity(BaseModel):
    
    def __init__(self, name: str):
        super().__init__()
        self.name = name
    
    @property
    def name(self):
        return self.__name
    
    @name.setter
    def name(self, value):

        if not value:
            raise ValueError('Enter a Name')
        
        if len(value) > 50:
            raise ValueError('Name cannot exceed 50 characters')
        
        self.__name = value.strip().upper()
