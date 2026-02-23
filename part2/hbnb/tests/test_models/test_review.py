import unittest
from app.models.review import Review
from app.models.user import User
from app.models.place import Place

class TestReview(unittest.TestCase):
    def setUp(self):
        self.user = User(email="reviewer@example.com", first_name="Jane", last_name="Doe")
        self.owner = User(email="owner@example.com", first_name="John", last_name="Doe")
        self.place = Place(title="House", price=100.0, latitude=10.0, longitude=20.0, owner=self.owner)

    def test_create_review_valid(self):
        review = Review(text="Excellent!", rating=5, place=self.place, user=self.user)
        self.assertEqual(review.text, "Excellent!")
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.place, self.place.id)
        self.assertEqual(review.user, self.user.id)
        self.assertTrue(hasattr(review, 'id'))

    def test_create_review_invalid_text(self):
        with self.assertRaises(ValueError):
            Review(text="", rating=5, place=self.place, user=self.user)
        with self.assertRaises(ValueError):
            Review(text="   ", rating=5, place=self.place, user=self.user)

    def test_create_review_invalid_rating(self):
        with self.assertRaises(ValueError):
            Review(text="Good", rating=0, place=self.place, user=self.user)
        with self.assertRaises(ValueError):
            Review(text="Good", rating=6, place=self.place, user=self.user)

    def test_create_review_invalid_place(self):
        with self.assertRaises(TypeError):
            Review(text="Good", rating=4, place="Not a place", user=self.user)

    def test_create_review_invalid_user(self):
        with self.assertRaises(TypeError):
            Review(text="Good", rating=4, place=self.place, user="Not a user")

if __name__ == '__main__':
    unittest.main()
