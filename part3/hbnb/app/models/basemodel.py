import uuid
from datetime import datetime

class BaseModel:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

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
