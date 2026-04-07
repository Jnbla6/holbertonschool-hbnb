from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask import request
import os
import uuid
from werkzeug.utils import secure_filename

api = Namespace('places', description='Place operations')

# Define the models for related entities
amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

# Define the user model for output documentation (not used for input validation here)
user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

# Define the review model for output documentation (not used for input validation here)
review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

# Define the place model for input validation and documentation
place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'owner_id': fields.String(required=False, description='ID of the owner'),
    'image_url': fields.String(description='URL of the place image'),
    'amenities': fields.List(fields.String, description="List of amenities ID's"),
    'reviews': fields.List(fields.Nested(review_model), description='List of reviews')
})

@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Register a new place"""
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            place_data = {
                'title': request.form.get('title'),
                'description': request.form.get('description'),
                'owner_id': get_jwt_identity()
            }
            if request.form.get('price'): place_data['price'] = float(request.form.get('price'))
            if request.form.get('latitude'): place_data['latitude'] = float(request.form.get('latitude'))
            if request.form.get('longitude'): place_data['longitude'] = float(request.form.get('longitude'))
            if request.form.get('max_guests'): place_data['max_guests'] = int(request.form.get('max_guests'))
            if request.form.get('number_rooms'): place_data['number_rooms'] = int(request.form.get('number_rooms'))
            if request.form.get('number_bathrooms'): place_data['number_bathrooms'] = int(request.form.get('number_bathrooms'))
            if request.form.get('city'): place_data['city'] = request.form.get('city')
            if request.form.get('country'): place_data['country'] = request.form.get('country')
            
            amenities = request.form.getlist('amenities')
            if amenities:
                place_data['amenities'] = amenities
            
            file = request.files.get('image_file')
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                current_dir = os.path.dirname(os.path.abspath(__file__))
                part4_dir = os.path.abspath(os.path.join(current_dir, '../../../..'))
                save_dir = os.path.join(part4_dir, 'images')
                os.makedirs(save_dir, exist_ok=True)
                file.save(os.path.join(save_dir, unique_filename))
                place_data['image_url'] = f"images/{unique_filename}"
        else:
            place_data = api.payload
            place_data['owner_id'] = get_jwt_identity()
        success, result = facade.create_place(place_data)
        if not success:
            return {'error': result}, 400
        return result.to_dict(), 201


    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places"""
        places = facade.get_all_places()
        return [p.to_dict() for p in places], 200

@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get place details by ID"""
        place = facade.get_place(place_id)
        if place:
            return place.to_dict(), 200
        return {'error': 'Place not found'}, 404

    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(403, 'Unauthorized action')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, place_id):
        """Update a place's information"""
        place = facade.get_place(place_id)

        # Check if the place exists
        if not place:
            return {'error': 'Place not found'}, 404
        
        # Check if the authenticated user is the owner of the place or an admin
        if place.owner_id != get_jwt_identity() and not get_jwt().get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403
    
        # Validate the input data
        place_data = api.payload

        # Update the place using the facade
        success, result = facade.update_place(place_id, place_data)
        if success:
            updated_place = facade.get_place(place_id)
            return updated_place.to_dict(), 200
        
        # else return the error message
        return {'error': result}, 400

    @api.response(200, 'Place deleted successfully')
    @api.response(404, 'Place not found')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def delete(self, place_id):
        """Delete a place (admin only)"""
        if not get_jwt().get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403
        
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        
        success, msg = facade.delete_place(place_id)
        if success:
            return {'message': 'Place deleted successfully'}, 200
        return {'error': msg}, 400
        
@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
            
        reviews = facade.get_reviews_by_place(place_id)
        result = []
        for r in reviews:
            review_data = {
                'id': r.id, 
                'text': r.text, 
                'rating': r.rating,
                'user_id': r.user_id,
                'created_at': r.created_at.isoformat() if r.created_at else ''
            }
            user = facade.get_user(r.user_id)
            if user:
                review_data['user_name'] = f"{user.first_name} {user.last_name}"
                review_data['user_initial'] = user.first_name[0].upper() if user.first_name else '?'
            else:
                review_data['user_name'] = 'Anonymous'
                review_data['user_initial'] = '?'
            result.append(review_data)
        return result, 200
