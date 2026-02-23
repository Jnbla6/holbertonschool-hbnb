#!/usr/bin/python3
import uuid
from datetime import datetime
import re
from app.models.basemodel import BaseModel

class User(BaseModel):
    
    def __init__(self, email: str, first_name='', last_name='', is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.places = set()

    @property
    def first_name(self):
        return self.__first_name

    @first_name.setter
    def first_name(self, value):
        if len(value) > 50:
            raise ValueError('First name must not exceed 50 characters')
        if not value or not value.strip():
            raise ValueError('First name cannot be empty')
        self.__first_name = value

    @property
    def last_name(self):
        return self.__last_name

    @last_name.setter
    def last_name(self, value):
        if len(value) > 50:
            raise ValueError('Last name must not exceed 50 characters')
        if not value or not value.strip():
            raise ValueError('Last name cannot be empty')
        self.__last_name = value

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, value):
        pattern = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(pattern, value):
            raise ValueError(f"Invalid email format: {value}")
        self.__email = value

    def add_place(self, place):
        from app.models.place import Place
        if not isinstance(place, Place):
            raise TypeError('Value must be an instance of Place')
        self.places.add(place.id)
