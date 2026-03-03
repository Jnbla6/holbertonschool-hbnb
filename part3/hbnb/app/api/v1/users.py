from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('users', description='Users operations')

user_model = api.model('User', {
    'first_name': fields.String(required=True, description='first name of the user'),
    'last_name': fields.String(required=True, description='last name of the user'),
    'email': fields.String(required=True, description='Email address of the user'),
    'password': fields.String(required=True, description='Password of the User')
})

@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""
        user_data = api.payload

        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400

        success, result = facade.create_user(user_data)
        if not success:
            return {'error': result}, 400
        return {'id': result.id, 'first_name': result.first_name, 'last_name': result.last_name, 'email': result.email}, 201
        
    
    @api.response(200, 'users is fetched')
    def get(self):
        """Retrieve a list of all users"""
        users = facade.get_all_users()
        return [{'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email} for user in users], 200
    
@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200
    
    @api.expect(user_model)
    @api.response(200, 'User is updated')
    @api.response(404, 'not found')
    @api.response(400, 'invild input')
    def put(self, user_id):
        """update user"""
        user_data = api.payload
        if "email" in user_data:
            existing_user = facade.get_user_by_email(user_data['email'])
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email already registered'}, 400
        
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        success, msg = facade.update_user(user_id, user_data)
        if success:
            updated_user = facade.get_user(user_id)
            return {
                'id': updated_user.id, 
                'first_name': updated_user.first_name, 
                'last_name': updated_user.last_name, 
                'email': updated_user.email
            }, 200
        else:
            if msg == 'User Not Found':
                return {'error': msg}, 404
            return {'error': msg}, 400
