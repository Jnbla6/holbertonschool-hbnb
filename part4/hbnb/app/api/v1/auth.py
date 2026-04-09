from flask import jsonify, make_response
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import (
    create_access_token, 
    set_access_cookies, 
    unset_jwt_cookies,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from app.services import facade

api = Namespace('auth', description='Authentication operations')

# Model for input validation
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return a JWT token"""
        credentials = api.payload  # Get the email and password from the request payload
        
        # Step 1: Retrieve the user based on the provided email
        user = facade.get_user_by_email(credentials['email'])
        
        # Step 2: Check if the user exists and the password is correct
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid credentials'}, 401

        # Step 3: Create a JWT token with the user's id and is_admin flag
        access_token = create_access_token(
        identity=str(user.id),   # only user ID goes here
        additional_claims={"is_admin": user.is_admin}  # extra info here
        )
        
        # Step 4: Set the JWT token in a cookie and return a response
        response = make_response({
            'message': 'Login successful', 
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'is_admin': user.is_admin
            }
        })
        
        set_access_cookies(response, access_token)
        
        return response

@api.route('/me')
class CurrentUser(Resource):
    @jwt_required()
    def get(self):
        """Verify session and return current user info"""
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        return {
            'user_id': user_id,
            'is_admin': claims.get('is_admin', False)
        }, 200

@api.route('/logout')
class Logout(Resource):
    def post(self):
        """Clear the secure cookies to log the user out"""
        response = jsonify({'message': 'Logged out successfully'})
        unset_jwt_cookies(response)
        return response

@api.route('/protected')
class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
         """A protected endpoint that requires a valid JWT token"""
         print("jwt------")
         print(get_jwt_identity())
         current_user = get_jwt_identity() # Retrieve the user's identity from the token
         #if you need to see if the user is an admin or not, you can access additional claims using get_jwt() :
         # addtional claims = get_jwt()
         #additional claims["is_admin"] -> True or False
         return {'message': f'Hello, user {current_user}'}, 200
