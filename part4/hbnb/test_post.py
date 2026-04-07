
from flask_jwt_extended import create_access_token
from app import create_app
import io

app = create_app()

with app.app_context():
    # First, get a real user from DB
    from app.services import facade
    users = facade.get_all_users()
    if len(users) == 0:
        facade.create_user({'first_name': 'test', 'last_name': 'test', 'email': 'test@example.com', 'password': 'pass'})
        users = facade.get_all_users()
    
    test_user = users[0]
    token = create_access_token(identity=str(test_user.id), additional_claims={"is_admin": test_user.is_admin})

    # Test the POST request
    client = app.test_client()
    
    # 1. Test multipart without file
    data_no_file = {
        'title': 'Test Place',
        'description': 'A description',
        'price': '100.0',
        'latitude': '10.0',
        'longitude': '10.0'
    }
    
    response = client.post('/api/v1/places/', 
        headers={'Authorization': f'Bearer {token}'},
        data=data_no_file,
        content_type='multipart/form-data'
    )
    print("NO FILE RESPONSE:", response.status_code, response.json)

    # 2. Test multipart with file
    data_with_file = data_no_file.copy()
    data_with_file['image_file'] = (io.BytesIO(b"fake image data"), 'test.jpg')
    
    response2 = client.post('/api/v1/places/', 
        headers={'Authorization': f'Bearer {token}'},
        data=data_with_file,
        content_type='multipart/form-data'
    )
    print("WITH FILE RESPONSE:", response2.status_code, response2.json)
