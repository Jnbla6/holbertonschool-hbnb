import unittest
from app import create_app
from app.services import facade

class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.amenity_repo._storage.clear()

    def test_create_amenity(self):
        response = self.client.post('/api/v1/amenities/', json={
            "name": "Wi-Fi"
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)
        self.assertEqual(response.json['name'], 'WI-FI')

    def test_create_amenity_invalid_name(self):
        response = self.client.post('/api/v1/amenities/', json={
            "name": ""
        })
        self.assertEqual(response.status_code, 400) # Assuming the API correctly catches empty string

    def test_get_amenity(self):
        # Create an amenity first
        create_res = self.client.post('/api/v1/amenities/', json={"name": "Pool"})
        amenity_id = create_res.json['id']

        response = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['name'], "POOL")

    def test_get_all_amenities(self):
        self.client.post('/api/v1/amenities/', json={"name": "A1"})
        self.client.post('/api/v1/amenities/', json={"name": "A2"})
        
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)

    def test_update_amenity(self):
        create_res = self.client.post('/api/v1/amenities/', json={"name": "Old Name"})
        amenity_id = create_res.json['id']

        update_res = self.client.put(f'/api/v1/amenities/{amenity_id}', json={"name": "New Name"})
        self.assertEqual(update_res.status_code, 200)

        get_res = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(get_res.json['name'], 'NEW NAME')

if __name__ == '__main__':
    unittest.main()
