from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})

@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'You cannot review your own place.')
    @api.response(400, 'You have already reviewed this place.')
    @api.response(404, 'Place not found.')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Register a new review"""
        review_data = api.payload
        current_user_id = get_jwt_identity()
        review_data['user_id'] = current_user_id  # Set user_id to the authenticated user's ID
        
        # Check if the place exists and is not owned by the user
        place = facade.get_place(review_data['place_id'])
        if not place:
            return {'error': 'Place not found.'}, 400
        if place.owner.id == current_user_id:
            return {'error': 'You cannot review your own place.'}, 400
        
        # Check if the user has already reviewed this place
        if facade.has_user_reviewed_place(current_user_id, review_data['place_id']):
            return {'error': 'You have already reviewed this place.'}, 400

        success, result = facade.create_review(review_data)
        if not success:
            return {'error': result}, 400
        return {
            'id': result.id, 
            'text': result.text, 
            'rating': result.rating, 
            'user_id': result.user, 
            'place_id': result.place
        }, 201

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        return [{
            'id': r.id, 
            'text': r.text, 
            'rating': r.rating
        } for r in reviews], 200

@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if review:
            return {
                'id': review.id, 
                'text': review.text, 
                'rating': review.rating, 
                'user_id': review.user, 
                'place_id': review.place
            }, 200
        return {'error': 'Review not found'}, 404

    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(403, 'Unauthorized action.')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, review_id):
        """Update a review's information"""
        review_data = api.payload
        current_user_id = get_jwt_identity()
        review_data['user_id'] = current_user_id  # Ensure user_id is set to the authenticated user's ID

        # Check if the review exists and belongs to the authenticated user
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        if review.user.id != current_user_id:
            return {'error': 'Unauthorized action.'}, 403
        success, msg = facade.update_review(review_id, review_data)
        if not success:
            if msg == 'Review Not Found':
                return {'error': msg}, 404
            return {'error': msg}, 400
        return {'message': 'Review updated successfully'}, 200

    @api.response(200, 'Review deleted successfully')
    @api.response(403, 'Unauthorized action.')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        """Delete a review"""
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)

        if not review:
            return {'error': 'Review not found'}, 404
        if review.user.id != current_user_id:
            return {'error': 'Unauthorized action.'}, 403

        success, msg = facade.delete_review(review_id)
        if not success:
            return {'error': msg}, 404
        return {'message': 'Review deleted successfully'}, 200