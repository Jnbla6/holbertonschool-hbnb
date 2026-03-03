#!/usr/bin/python3
import uuid
from datetime import datetime
from app.models.user import User
from app.models.place import Place
from app.models.basemodel import BaseModel


class Review(BaseModel):

    def __init__(self, text: str, rating: int, place: Place, user: User):
        super().__init__()
        self.text = text
        self.rating = rating
        self.place = place
        self.user = user

    @property
    def text(self):
        return self.__text

    @text.setter
    def text(self, value):
        if not value or not value.strip():
            raise ValueError('Text cannot be empty')
        self.__text = value

    @property
    def rating(self):
        return self.__rating

    @property
    def place(self):
        return self.__place

    @property
    def user(self):
        return self.__user

    @rating.setter
    def rating(self, value):
        if not (1 <= value <= 5):
            raise ValueError('Rating must be an integer between 1 and 5')
        else:
            self.__rating = value

    @place.setter
    def place(self, value):
        if not isinstance(value, Place):
            raise TypeError('The place must be a valid Place instance')
        else:
            self.__place = value.id

    @user.setter
    def user(self, value):
        if not isinstance(value, User):
            raise TypeError('The user must be a valid User instance')
        else:
            self.__user = value.id