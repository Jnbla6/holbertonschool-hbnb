#!/usr/bin/python3
from app.models.user import User
from app.models.place import Place
from app.models.basemodel import BaseModel
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import validates


class Review(BaseModel):

    __tablename__ = 'reviews'
    text = Column(String(200), nullable=False)
    rating = Column(Integer, nullable=False)
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    

    @validates('text')
    def validate_text(self, key, text):
        if not text or not text.strip():
            raise ValueError('Text cannot be empty')
        if len(text) > 200:
            raise ValueError('Text must be 200 characters or less')
        return text
    
    @validates('rating')
    def validate_rating(self, key, rating):
        if not (1 <= rating <= 5):
            raise ValueError('Rating must be an integer between 1 and 5')
        return rating

    # @place.setter
    # def place(self, value):
    #     if not isinstance(value, Place):
    #         raise TypeError('The place must be a valid Place instance')
    #     else:
    #         self.__place = value.id

    # @user.setter
    # def user(self, value):
    #     if not isinstance(value, User):
    #         raise TypeError('The user must be a valid User instance')
    #     else:
    #         self.__user = value.id