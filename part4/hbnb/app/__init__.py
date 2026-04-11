from flask import Flask, app
from flask_cors import CORS
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


jwt = JWTManager()
bcrypt = Bcrypt()
db = SQLAlchemy()

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    CORS(app, resources={r"/api/v1/*": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)
    app.config.from_object(config_class)

    # JWT configuration to allow tokens in cookies and disable CSRF for simplicity (not recommended for production)
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False 
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    
    jwt.init_app(app)
    bcrypt.init_app(app)
    db.init_app(app)

    from app.api.v1.amenities import api as amenity_ns
    from app.api.v1.users import api as users_ns
    from app.api.v1.reviews import api as reviews_ns
    from app.api.v1.places import api as place_ns
    from app.api.v1.auth import api as auth_ns

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/api/v1/')
    
    api.add_namespace(amenity_ns, path='/api/v1/amenities')
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(place_ns, path='/api/v1/places')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    
    with app.app_context():
        db.create_all()

    return app
