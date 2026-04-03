import unittest
from app import create_app
from app.services import facade

class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()

        # Create a user to act as the reviewer
        u_res = self.client.post('/api/v1/users/', json={"first_name": "Reviewer", "last_name": "Smith", "email": "rev@s.com"})
        self.user_id = u_res.json['id']

        # Create a place to be reviewed
        p_res = self.client.post('/api/v1/places/', json={
            "title": "Test Place", "price": 50, "latitude": 0, "longitude": 0, "owner_id": self.user_id
        })
        self.place_id = p_res.json['id']

    def test_create_review(self):
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Great stay!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['text'], "Great stay!")
        self.assertEqual(response.json['rating'], 5)

    def test_create_review_invalid_rating(self):
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Amazing!",
            "rating": 10, # Invalid Rating
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_get_review(self):
        res = self.client.post('/api/v1/reviews/', json={
            "text": "Good", "rating": 4, "user_id": self.user_id, "place_id": self.place_id
        })
        r_id = res.json['id']

        get_res = self.client.get(f'/api/v1/reviews/{r_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json['text'], "Good")

    def test_update_review(self):
        res = self.client.post('/api/v1/reviews/', json={
            "text": "Bad", "rating": 2, "user_id": self.user_id, "place_id": self.place_id
        })
        r_id = res.json['id']

        update_res = self.client.put(f'/api/v1/reviews/{r_id}', json={"text": "Actually it was OK", "rating": 3})
        self.assertEqual(update_res.status_code, 200)

        get_res = self.client.get(f'/api/v1/reviews/{r_id}')
        self.assertEqual(get_res.json['text'], "Actually it was OK")
        self.assertEqual(get_res.json['rating'], 3)

    def test_delete_review(self):
        res = self.client.post('/api/v1/reviews/', json={
            "text": "To be deleted", "rating": 1, "user_id": self.user_id, "place_id": self.place_id
        })
        r_id = res.json['id']

        del_res = self.client.delete(f'/api/v1/reviews/{r_id}')
        self.assertEqual(del_res.status_code, 200)

        get_res = self.client.get(f'/api/v1/reviews/{r_id}')
        self.assertEqual(get_res.status_code, 404)

if __name__ == '__main__':
    unittest.main()
