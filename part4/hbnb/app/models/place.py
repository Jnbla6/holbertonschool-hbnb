#!/usr/bin/python3
from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import validates, relationship
from app.models.basemodel import BaseModel, db

place_amenity = db.Table('place_amenity',
    Column('place_id', String(36), ForeignKey('places.id'), primary_key=True),
    Column('amenity_id', String(36), ForeignKey('amenities.id'), primary_key=True)
)


class Place(BaseModel):
    __tablename__ = 'places'
    
    title = Column(String(100), nullable=False)
    description = Column(String(200), default='')
    price = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_guests = Column(db.Integer, default=1)
    number_rooms = Column(db.Integer, default=1)
    number_bathrooms = Column(db.Integer, default=1)
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    image_url = Column(String(255), nullable=True)
    city = Column(String(100), default='')
    country = Column(String(100), default='')
    
    reviews = relationship('Review', backref='place', lazy=True, cascade="all, delete-orphan")
    amenities = relationship('Amenity', secondary=place_amenity, backref='place_amenities', lazy='subquery')

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
        if price > 100000:
            raise ValueError(f'{key} exceeds maximum limit of 100000')
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
        if value not in self.amenities:
            self.amenities.append(value)

    def to_dict(self):
        obj_dict = super().to_dict()
        obj_dict['amenities'] = [{'id': a.id, 'name': a.name, 'icon': a.icon} for a in self.amenities]
        
        if hasattr(self, 'reviews') and self.reviews:
            valid_reviews = [r for r in self.reviews if getattr(r, 'rating', None) is not None]
            if valid_reviews:
                avg = sum(r.rating for r in valid_reviews) / len(valid_reviews)
                obj_dict['rating'] = round(avg, 1)
            else:
                obj_dict['rating'] = 0
            obj_dict['reviews'] = len(self.reviews)
        else:
            obj_dict['rating'] = 0
            obj_dict['reviews'] = 0
            
        return obj_dict
    
    @validates('number_rooms', 'number_bathrooms', 'max_guests')
    def validate_integers(self, key, value):
        """
        Validates that the given value is a non-negative integer and within reasonable limits.
        """
        if value is None:
            return value
        
        try:
            val = int(value)
        except ValueError:
            raise ValueError(f"{key} must be a valid integer.")
        
        if val < 0:
            raise ValueError(f"{key} cannot be negative.")
            
        if val > 1000:
            raise ValueError(f"{key} exceeds the maximum allowed limit of 1000.")
            
        return val
