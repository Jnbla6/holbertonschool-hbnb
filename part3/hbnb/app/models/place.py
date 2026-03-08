#!/usr/bin/python3
from sqlalchemy import Column, String, Boolean, Float
from sqlalchemy.orm import validates
from app.models.basemodel import BaseModel


class Place(BaseModel):
    __tablename__ = 'places'
    
    title = Column(String(100), nullable=False)
    description = Column(String(200), default='')
    price = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # self.owner = owner
    # self.reviews = []
    # self.amenities = []
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @validates('title')
    def validate_title(self, key, title):
        if len(title) > 100:
            raise ValueError(f'{key} must be 100 characters or less')
        if not title or not title.strip():
            raise ValueError(f'{key} cannot be empty')
        return title


    @validates('price')
    def validate_price(self, key, price):
        if price <= 0:
            raise ValueError(f'{key} must be a positive value')
        return price

    @validates('latitude')
    def validate_latitude(self, key, latitude):
        if latitude < -90 or latitude > 90:
            raise ValueError('Latitude must be between -90.0 and 90.0')
        return latitude

    @validates('longitude')
    def validate_longitude(self, key, longitude):
        if longitude < -180 or longitude > 180:
            raise ValueError('Longitude must be between -180.0 and 180.0')
        return longitude

    # @owner.setter
    # def owner(self, value):
    #     from app.models.user import User
    #     if not isinstance(value, User):
    #         raise TypeError('Owner must be an instance of User')
    #     else:
    #         self.__owner = value


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