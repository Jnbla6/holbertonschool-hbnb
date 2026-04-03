import unittest
from app import create_app
from app.services import facade

class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        # Create a clean facade or clear repos to ensure tests don't interfere with each other
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.amenity_repo._storage.clear()
        facade.review_repo._storage.clear()

    def test_create_user(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)
        self.assertEqual(response.json['first_name'], 'Jane')

    def test_create_user_invalid_email(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_duplicate_email(self):
        self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        # Try creating the same user again
        response2 = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Smith",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response2.status_code, 400)

    def test_get_user(self):
        # Create a user first
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "Ali",
            "last_name": "Ahmad",
            "email": "ali@example.com"
        })
        user_id = create_response.json['id']

        # Retrieve the user
        response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['email'], "ali@example.com")

    def test_get_user_not_found(self):
        response = self.client.get('/api/v1/users/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_get_all_users(self):
        self.client.post('/api/v1/users/', json={"first_name": "U1", "last_name": "L1", "email": "1@e.com"})
        self.client.post('/api/v1/users/', json={"first_name": "U2", "last_name": "L2", "email": "2@e.com"})
        
        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)

if __name__ == '__main__':
    unittest.main()
