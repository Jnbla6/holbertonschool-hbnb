from flask_jwt_extended import get_jwt, jwt_required
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('amenities', description='Amenity operations')

# Define the amenity model for input validation and documentation
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity'),
    'icon': fields.String(description='Icon/emoji for the amenity')
})

@api.route('/')
class AmenityList(Resource):
    @api.expect(amenity_model)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Register a new amenity"""
        amenity_data = api.payload
        
        if not get_jwt().get('is_admin'):
            return {'error': 'Admin privileges required'}, 403
        
        existing_amenity = facade.get_amenity_by_name(amenity_data['name'])
        if existing_amenity:
            return {'error': 'Invalid input data'}, 400
        success, result = facade.create_amenity(amenity_data)
        if success:
            return {'id': result.id, 'name': result.name, 'icon': result.icon or '✓'}, 201
        else:
            return {'error': result}, 400

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Retrieve a list of all amenities"""
        amenities = facade.get_all_amenities()
        return [{'id': a.id, 'name': a.name, 'icon': a.icon or '✓'} for a in amenities], 200

@api.route('/<amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        amenity = facade.get_amenity(amenity_id)
        if amenity:
            return {'id': amenity.id, 'name': amenity.name, 'icon': amenity.icon or '✓'}, 200
        else:
            return {'error': 'Amenity not found'}, 404

    @api.expect(amenity_model)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def put(self, amenity_id):
        """Update an amenity's information"""
        amenity_data = api.payload

        if not get_jwt().get('is_admin'):
            return {'error': 'Admin privileges required'}, 403
        
        success, msg = facade.update_amenity(amenity_id, amenity_data)
        if not success:
            if msg == 'Amenity Not Found':
                return {'error': msg}, 404
            return {'error': msg}, 400
            
        updated_amenity = facade.get_amenity(amenity_id)
        return {'id': updated_amenity.id, 'name': updated_amenity.name, 'icon': updated_amenity.icon or '✓'}, 200

    @api.response(200, 'Amenity deleted successfully')
    @api.response(404, 'Amenity not found')
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def delete(self, amenity_id):
        """Delete an amenity (admin only)"""
        if not get_jwt().get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404

        from app import db
        db.session.delete(amenity)
        db.session.commit()
        return {'message': 'Amenity deleted successfully'}, 200
