#!/usr/bin/python3
import uuid
from datetime import datetime
from app.models.basemodel import BaseModel


class Place(BaseModel):

    def __init__(self, title: str, price: float, latitude: float, longitude: float, owner, description=''):
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []
        self.amenities = []

    @property
    def title(self):
        return self.__title

    @title.setter
    def title(self, value):
        if len(value) > 100:
            raise ValueError('Title must be 100 characters or less')
        if not value or not value.strip():
            raise ValueError('Title cannot be empty')
        self.__title = value

    @property
    def price(self):
        return self.__price

    @price.setter
    def price(self, value):
        if value <= 0:
            raise ValueError('Price must be a positive value')
        else:
            self.__price = float(value)

    @property
    def latitude(self):
        return self.__latitude

    @latitude.setter
    def latitude(self, value):
        if value < -90 or value > 90:
            raise ValueError('Latitude must be between -90.0 and 90.0')
        else:
            self.__latitude = value

    @property
    def longitude(self):
        return self.__longitude

    @longitude.setter
    def longitude(self, value):
        if value < -180 or value > 180:
            raise ValueError('Longitude must be between -180.0 and 180.0')
        else:
            self.__longitude = value

    @property
    def owner(self):
        return self.__owner

    @owner.setter
    def owner(self, value):
        from app.models.user import User
        if not isinstance(value, User):
            raise TypeError('Owner must be an instance of User')
        else:
            self.__owner = value

    # This property is added to facilitate access to owner_id for API input validation and documentation
    @property
    def owner_id(self):
        return self.owner.id


    def add_review(self, value):
        from app.models.review import Review
        if not isinstance(value, Review):
            raise TypeError('Value must be an instance of Review')
        if value not in self.reviews:
            self.reviews.append(value)


    def add_amenity(self, value):
        from app.models.amenity import Amenity
        if not isinstance(value, Amenity):
            raise TypeError('Value must be an instance of Amenity')
        if value.id not in self.amenities:
            self.amenities.append(value.id)
            if not hasattr(self, 'amenities_objects'):
                self.amenities_objects = []
            self.amenities_objects.append(value)
            
    def to_dict(self):
        if not hasattr(self, 'amenities_objects'):
            self.amenities_objects = []
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner': {
                'id': self.owner.id,
                'first_name': self.owner.first_name,
                'last_name': self.owner.last_name,
                'email': self.owner.email
            },
            'amenities': [{'id': a.id, 'name': a.name} for a in self.amenities_objects],
            'reviews': [{'id': r.id, 'text': r.text, 'rating': r.rating, 'user_id': r.user} for r in self.reviews]
        }
