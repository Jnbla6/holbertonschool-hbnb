import unittest
from app.models.user import User
from app.models.place import Place

class TestUser(unittest.TestCase):
    def test_create_user_valid(self):
        user = User(email="test@example.com", first_name="John", last_name="Doe")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertFalse(user.is_admin)
        self.assertTrue(hasattr(user, 'id'))
        self.assertTrue(hasattr(user, 'created_at'))
        self.assertTrue(hasattr(user, 'updated_at'))

    def test_create_user_invalid_email(self):
        with self.assertRaises(ValueError):
            User(email="invalid_email", first_name="John", last_name="Doe")

    def test_create_user_empty_first_name(self):
        with self.assertRaises(ValueError):
            User(email="test@example.com", first_name=" ", last_name="Doe")

    def test_create_user_long_first_name(self):
        with self.assertRaises(ValueError):
            User(email="test@example.com", first_name="A" * 51, last_name="Doe")

    def test_create_user_empty_last_name(self):
        with self.assertRaises(ValueError):
            User(email="test@example.com", first_name="John", last_name=" ")

    def test_create_user_long_last_name(self):
        with self.assertRaises(ValueError):
            User(email="test@example.com", first_name="John", last_name="A" * 51)
            
    def test_add_place(self):
        user = User(email="test@example.com", first_name="John", last_name="Doe")
        place = Place(title="A Place", price=100.0, latitude=10.0, longitude=10.0, owner=user)
        user.add_place(place)
        self.assertIn(place.id, user.places)
        
    def test_add_invalid_place(self):
        user = User(email="test@example.com", first_name="John", last_name="Doe")
        with self.assertRaises(TypeError):
            user.add_place("Not a Place object")

if __name__ == '__main__':
    unittest.main()
