import unittest
from app.models.place import Place
from app.models.user import User
from app.models.review import Review
from app.models.amenity import Amenity

class TestPlace(unittest.TestCase):
    def setUp(self):
        self.owner = User(email="owner@example.com", first_name="John", last_name="Doe")

    def test_create_place_valid(self):
        place = Place(title="Nice House", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        self.assertEqual(place.title, "Nice House")
        self.assertEqual(place.price, 150.0)
        self.assertEqual(place.latitude, 30.0)
        self.assertEqual(place.longitude, 50.0)
        self.assertEqual(place.owner, self.owner)
        self.assertTrue(hasattr(place, 'id'))

    def test_create_place_invalid_title(self):
        with self.assertRaises(ValueError):
            Place(title="", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        with self.assertRaises(ValueError):
            Place(title="A" * 101, price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)

    def test_create_place_invalid_price(self):
        with self.assertRaises(ValueError):
            Place(title="House", price=0, latitude=30.0, longitude=50.0, owner=self.owner)
        with self.assertRaises(ValueError):
            Place(title="House", price=-10.0, latitude=30.0, longitude=50.0, owner=self.owner)

    def test_create_place_invalid_latitude(self):
        with self.assertRaises(ValueError):
            Place(title="House", price=150.0, latitude=-91.0, longitude=50.0, owner=self.owner)
        with self.assertRaises(ValueError):
            Place(title="House", price=150.0, latitude=91.0, longitude=50.0, owner=self.owner)

    def test_create_place_invalid_longitude(self):
        with self.assertRaises(ValueError):
            Place(title="House", price=150.0, latitude=30.0, longitude=-181.0, owner=self.owner)
        with self.assertRaises(ValueError):
            Place(title="House", price=150.0, latitude=30.0, longitude=181.0, owner=self.owner)

    def test_create_place_invalid_owner(self):
        with self.assertRaises(TypeError):
            Place(title="House", price=150.0, latitude=30.0, longitude=50.0, owner="Not a user")

    def test_add_review(self):
        place = Place(title="House", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        reviewer = User(email="reviewer@ex.com", first_name="Alice", last_name="Smith")
        review = Review(text="Great place!", rating=5, place=place, user=reviewer)
        place.add_review(review)
        self.assertIn(review, place.reviews)

    def test_add_invalid_review(self):
        place = Place(title="House", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        with self.assertRaises(TypeError):
            place.add_review("Not a review")

    def test_add_amenity(self):
        place = Place(title="House", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        amenity = Amenity(name="WiFi")
        place.add_amenity(amenity)
        self.assertIn(amenity.id, place.amenities)
        
    def test_add_invalid_amenity(self):
        place = Place(title="House", price=150.0, latitude=30.0, longitude=50.0, owner=self.owner)
        with self.assertRaises(TypeError):
            place.add_amenity("Not an amenity")

if __name__ == '__main__':
    unittest.main()
