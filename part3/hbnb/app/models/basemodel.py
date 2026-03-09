from app import db
import uuid
from datetime import datetime

class BaseModel(db.Model):
    __abstract__ = True  # This ensures SQLAlchemy does not create a table for BaseModel

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()

    def update(self, data):
        protected_fields = ['id', 'created_at', 'updated_at']

        for key, value in data.items():
            if key in protected_fields:
                raise ValueError(f"Attribute '{key}' is protected and cannot be modified")
            
            if hasattr(self, key):
                setattr(self, key, value)
            else:
                raise ValueError(f"Attribute '{key}' does not exist in {self.__class__.__name__}")
        self.save()
