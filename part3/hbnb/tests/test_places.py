import unittest
from app import create_app
from app.services import facade

class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.amenity_repo._storage.clear()

        # Pre-create a user to act as an owner, and an amenity to link to
        user_res = self.client.post('/api/v1/users/', json={
            "first_name": "Owner", "last_name": "User", "email": "owner@hbnb.com"
        })
        self.owner_id = user_res.json['id']

        amenity_res = self.client.post('/api/v1/amenities/', json={"name": "WiFi"})
        self.amenity_id = amenity_res.json['id']


    def test_create_place(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Cozy Cabin",
            "description": "A nice cabin in the woods",
            "price": 100.0,
            "latitude": 34.0,
            "longitude": -118.0,
            "owner_id": self.owner_id,
            "amenities": [self.amenity_id]
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['title'], "Cozy Cabin")
        self.assertEqual(response.json['owner']['id'], self.owner_id)
        self.assertIn(self.amenity_id, response.json['amenities']) # Tests the list of IDs functionality

    def test_create_place_invalid_price(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Cozy Cabin",
            "price": -50.0, # Invalid Negative Price
            "latitude": 34.0,
            "longitude": -118.0,
            "owner_id": self.owner_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_owner_id(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Cozy Cabin",
            "price": 100.0,
            "latitude": 34.0,
            "longitude": -118.0,
            "owner_id": "nonexistent_id"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_place(self):
        res = self.client.post('/api/v1/places/', json={
            "title": "Hotel", "price": 50, "latitude": 0, "longitude": 0, "owner_id": self.owner_id
        })
        place_id = res.json['id']

        get_res = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json['title'], "Hotel")

    def test_update_place(self):
        res = self.client.post('/api/v1/places/', json={
            "title": "Old Title", "price": 50, "latitude": 0, "longitude": 0, "owner_id": self.owner_id
        })
        place_id = res.json['id']

        update_res = self.client.put(f'/api/v1/places/{place_id}', json={
            "title": "New Title", "price": 60
        })
        self.assertEqual(update_res.status_code, 200)

        get_res = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(get_res.json['title'], "New Title")
        self.assertEqual(get_res.json['price'], 60)

if __name__ == '__main__':
    unittest.main()
