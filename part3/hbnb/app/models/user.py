#!/usr/bin/python3
"""User model module for the application."""
import re
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import validates
from flask_bcrypt import generate_password_hash, check_password_hash
from app.models.basemodel import BaseModel, db


class User(BaseModel):
    """Represents a user in the system.

    Attributes:
        email (str): The unique email address of the user.
        first_name (str): The user's first name.
        last_name (str): The user's last name.
        password (str): The hashed password of the user.
        is_admin (bool): Indicates if the user has administrative privileges.
    """

    __tablename__ = 'users'

    email = Column(String(120), nullable=False, unique=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    password = Column(String(128), nullable=False)
    is_admin = Column(Boolean, default=False)

    def __init__(self, **kwargs):
        """Initializes a user with given attributes.

        Args:
            **kwargs: Dictionary of attributes to set.
        """
        if 'password' in kwargs:
            kwargs['password'] = self.hash_password(kwargs['password'])
        super().__init__(**kwargs)

    @validates('email')
    def validate_email(self, key, email):
        """Validates the email format.

        Args:
            key (str): The name of the field being validated.
            email (str): The email address to validate.

        Returns:
            str: The validated email address.

        Raises:
            ValueError: If the email format is invalid.
        """
        pattern = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(pattern, email):
            raise ValueError(f"Invalid email format: {email}")
        return email

    @validates('first_name', 'last_name')
    def validate_name(self, key, name):
        """Validates first and last names.

        Args:
            key (str): The name of the field (first_name or last_name).
            name (str): The value to validate.

        Returns:
            str: The validated name.

        Raises:
            ValueError: If the name is empty or exceeds 50 characters.
        """
        if not name or not name.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty")
        if len(name) > 50:
            raise ValueError(f"{key.replace('_', ' ').capitalize()} must not exceed 50 characters")
        return name

    def hash_password(self, password):
        """Hashes a plaintext password.

        Args:
            password (str): Plaintext password.

        Returns:
            str: Hashed password.
        """
        return generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies a password against the stored hash.

        Args:
            password (str): Plaintext password to check.

        Returns:
            bool: True if password matches, False otherwise.
        """
        return check_password_hash(self.password, password)