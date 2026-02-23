import unittest
from app.models.amenity import Amenity

class TestAmenity(unittest.TestCase):
    def test_create_amenity_valid(self):
        amenity = Amenity(name="Pool")
        self.assertEqual(amenity.name, "POOL")
        self.assertTrue(hasattr(amenity, 'id'))

    def test_create_amenity_invalid_name(self):
        with self.assertRaises(ValueError):
            Amenity(name="")
        with self.assertRaises(ValueError):
            Amenity(name="A" * 51)

if __name__ == '__main__':
    unittest.main()
