import os

from app.persistence.repository import SQLAlchemyRepository
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.user import User
from app.models.review import Review
from app.services.repositories.user_repository import UserRepository
from app.services.repositories.review_repository import ReviewRepository
from app.services.repositories.amenity_repository import AmenityRepository
from app.services.repositories.place_repository import PlaceRepository
from app.services.image_service import ImageService

    


class HBnBFacade:
    def __init__(self):
        self.user_repository = UserRepository()
        self.place_repository = PlaceRepository()
        self.review_repository = ReviewRepository()
        self.amenity_repository = AmenityRepository()

    
    #User Method
    def create_user(self, user_data):
        try:
            user = User(**user_data)
            self.user_repository.add(user)
            return True, user
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_all_users(self):
        return self.user_repository.get_all()
    
    def get_user(self, user_id):
        return self.user_repository.get(user_id)
    

    def get_user_by_email(self, email):
        return self.user_repository.get_user_by_email(email)
    
    def update_user(self, user_id, user_data):
        try:
            check_user = self.user_repository.get(user_id)
            if not check_user:
                return False, 'User Not Found'

            user = self.user_repository.update(user_id, user_data)
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)

    # Amenity Methods
    def create_amenity(self, amenity_data, image_file=None):
        try:
            if image_file:
                try:
                    relative_path = ImageService.process_and_save(image_file, folder_name="amenities", keep_alpha=True)
                    amenity_data['icon'] = relative_path
                except ValueError as e:
                    return False, f"Icon processing failed: {str(e)}"

            amenity = Amenity(**amenity_data)
            self.amenity_repository.add(amenity)
            return True, amenity
        except ValueError as e:
            return False, str(e)


    def get_amenity(self, amenity_id):
        return self.amenity_repository.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repository.get_all()

    def get_amenity_by_name(self, amenity_name):
        return self.amenity_repository.get_amenity_by_name(amenity_name)

    def update_amenity(self, amenity_id, amenity_data):
        try:
            check_amenity = self.amenity_repository.get(amenity_id)
            if not check_amenity:
                return False, 'Amenity Not Found'

            amenity = self.amenity_repository.update(amenity_id, amenity_data)
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)
        
    def delete_amenity(self, amenity_id):
        amenity = self.amenity_repository.get(amenity_id)
        if not amenity:
            return False, 'Amenity Not Found'

        icon_relative_path = getattr(amenity, 'icon', None)

        self.amenity_repository.delete(amenity_id)

        if icon_relative_path and icon_relative_path != 'images/amenities/default_icon.webp':
            ImageService.delete_image(icon_relative_path)

        return True, None
    
    # Place Methods
    def create_place(self, place_data, image_file=None):
        try:
            amenity_ids = place_data.pop('amenities', [])
            owner_id = place_data.pop('owner_id', None)
            owner_obj = self.user_repository.get(owner_id)
            if not owner_obj:
                return False, "Owner not found. A valid User instance is required."
            place_data['owner_id'] = owner_obj.id

            if image_file:
                try:
                    relative_path = ImageService.process_and_save(image_file, folder_name="places", keep_alpha=False)
                    place_data['image_url'] = relative_path
                except ValueError as e:
                    return False, f"Image processing failed: {str(e)}"

            place = Place(**place_data)
            for amenity_id in amenity_ids:
                amenity = self.amenity_repository.get(amenity_id)
                if amenity:
                    place.add_amenity(amenity)
                else:
                    return False, 'Amenity not found'
            self.place_repository.add(place)
            return True, place
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_place(self, place_id):
        return self.place_repository.get(place_id)

    def get_all_places(self):
        return self.place_repository.get_all()

    def update_place(self, place_id, place_data):
        try:
            place = self.place_repository.get(place_id)
            if not place:
                return False, 'Place Not Found'
            
            if 'owner_id' in place_data:
                new_owner_id = place_data.pop('owner_id')
                new_owner = self.user_repository.get(new_owner_id)
                if not new_owner:
                    return False, "New owner not found"

                place.owner_id = new_owner.id

            amenity_ids = place_data.pop('amenities', None)
            
            place = self.place_repository.update(place_id, place_data)
            
            if amenity_ids is not None:
                place.amenities = [] 
                for amenity_id in amenity_ids:
                    amenity = self.amenity_repository.get(amenity_id)
                    if amenity:
                        place.add_amenity(amenity)
                    else:
                        return False, 'Amenity not found'
            
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)
        
    def delete_place(self, place_id):
        place = self.place_repository.get(place_id)
        if not place:
            return False, 'Place Not Found'
        
        image_relative_path = getattr(place, 'image_url', None)

        self.place_repository.delete(place_id)

        if image_relative_path:
            ImageService.delete_image(image_relative_path)

        return True, None


    # review methods
    def create_review(self, review_data):
        try:
            # 1. Check for required fields and extract them
            user_id = review_data.get('user_id')
            place_id = review_data.get('place_id')

            # 2. Retrieve the related User and Place objects using their repositories
            user_obj = self.user_repository.get(user_id)
            place_obj = self.place_repository.get(place_id)

            if not user_obj:
                return False, "User not found"
            if not place_obj:
                return False, "Place not found"

            # 3. Create the Review instance with user_id and place_id
            review_params = {
                "text": review_data.get('text'),
                "rating": review_data.get('rating'),
                "user_id": user_id,
                "place_id": place_id
            }

            review = Review(**review_params)
            if hasattr(place_obj, 'reviews'):
                place_obj.add_review(review)
            self.review_repository.add(review)
            return True, review
        except (ValueError, TypeError) as e:
            return False, str(e)

    def get_review(self, review_id):
        return self.review_repository.get(review_id)

    def get_all_reviews(self):
        return self.review_repository.get_all()

    def get_reviews_by_place(self, place_id):
        return self.review_repository.get_reviews_by_place_id(place_id)

    # Helper method to check if a user has already reviewed a place
    def has_user_reviewed_place(self, user_id, place_id):
        reviews = self.get_reviews_by_place(place_id)
        if not reviews:
            return False
        
        for review in reviews:
            if review.user_id == user_id:
                return True
        return False

    def update_review(self, review_id, review_data):
        try:
            review = self.review_repository.get(review_id)
            if not review:
                return False, 'Review Not Found'
            
            review_data.pop('user_id', None)
            review_data.pop('place_id', None)
            review_data.pop('user', None)
            review_data.pop('place', None)

            self.review_repository.update(review_id, review_data)
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)

    def delete_review(self, review_id):
        review = self.review_repository.get(review_id)
        if not review:
            return False, 'Review Not Found'
        place = self.place_repository.get(review.place_id)
        if place and hasattr(place, 'reviews'):
            if review in place.reviews:
                place.reviews.remove(review)
        self.review_repository.delete(review_id)
        return True, None

    def delete_user(self, user_id):
        user = self.user_repository.get(user_id)
        if not user:
            return False, 'User Not Found'
        self.user_repository.delete(user_id)
        return True, None
    