from app.persistence.repository import InMemoryRepository
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.user import User
from app.models.review import Review


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    
    #User Method
    def create_user(self, user_data):
        try:
            user = User(**user_data)
            self.user_repo.add(user)
            return True, user
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_all_users(self):
        return self.user_repo.get_all()
    
    def get_user(self, user_id):
        return self.user_repo.get(user_id)
    

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)
    
    def update_user(self, user_id, user_data):
        try:
            check_user = self.user_repo.get(user_id)
            if not check_user:
                return False, 'User Not Found'
             
            user = self.user_repo.update(user_id, user_data)
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)

    # Amenity Methods
    def create_amenity(self, amenity_data):
        try:
            amenity = Amenity(**amenity_data)
            self.amenity_repo.add(amenity)
            return True, amenity
        except ValueError as e:
            return False, str(e)


    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def get_amenity_by_name(self, amenity_name):
        return self.amenity_repo.get_by_attribute('name', amenity_name)

    def update_amenity(self, amenity_id, amenity_data):
         try:
            check_amenity = self.amenity_repo.get(amenity_id)
            if not check_amenity:
                return False, 'Amenity Not Found'
   
            amenity = self.amenity_repo.update(amenity_id, amenity_data)
            return True, None
         except (ValueError, TypeError) as e:
            return False, str(e)
    
    # Place Methods
    def create_place(self, place_data):
        try:
            amenity_ids = place_data.pop('amenities', [])
            owner_id = place_data.pop('owner_id', None)
            owner_obj = self.user_repo.get(owner_id)
            if not owner_obj:
                return False, "Owner not found. A valid User instance is required."
            place_data['owner'] = owner_obj
            place = Place(**place_data)
            for amenity_id in amenity_ids:
                amenity = self.amenity_repo.get(amenity_id)
                if amenity:
                    place.add_amenity(amenity)
                else:
                    return False, 'Amenity not found'
            self.place_repo.add(place)
            owner_obj.add_place(place) 
            return True, place
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    def get_all_places(self):
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        try:
            place = self.place_repo.get(place_id)
            if not place:
                return False, 'Place Not Found'
            
            if 'owner_id' in place_data:
                new_owner_id = place_data.pop('owner_id')
                new_owner = self.user_repo.get(new_owner_id)
                if not new_owner:
                    return False, "New owner not found"

                old_owner = place.owner
                if place.id in old_owner.places:
                    old_owner.places.remove(place.id)
                new_owner.add_place(place)
                place.owner = new_owner

            amenity_ids = place_data.pop('amenities', None)
            
            place = self.place_repo.update(place_id, place_data)
            
            if amenity_ids is not None:
                place.amenities = [] 
                for amenity_id in amenity_ids:
                    amenity = self.amenity_repo.get(amenity_id)
                    if amenity:
                        place.add_amenity(amenity)
                    else:
                        return False, 'Amenity not found'
            
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)


    # review methods
    def create_review(self, review_data):
        try:
            # 1. Check for required fields and extract them
            user_id = review_data.get('user_id')
            place_id = review_data.get('place_id')

            # 2. Retrieve the related User and Place objects using their repositories
            user_obj = self.user_repo.get(user_id)
            place_obj = self.place_repo.get(place_id)

            if not user_obj:
                return False, "User not found"
            if not place_obj:
                return False, "Place not found"

            # 3. Create the Review instance with the retrieved User and Place objects
            review_params = {
                "text": review_data.get('text'),
                "rating": review_data.get('rating'),
                "user": user_obj,
                "place": place_obj
            }

            review = Review(**review_params)
            if hasattr(place_obj, 'reviews'):
                place_obj.add_review(review)
            self.review_repo.add(review)
            return True, review
        except (ValueError, TypeError) as e:
            return False, str(e)

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        
        place = self.place_repo.get(place_id)
        if not place:
            return None
        return place.reviews if hasattr(place, 'reviews') else []
    
    def update_review(self, review_id, review_data):
        try:
            review = self.review_repo.get(review_id)
            if not review:
                return False, 'Review Not Found'
            
            review_data.pop('user_id', None)
            review_data.pop('place_id', None)
            review_data.pop('user', None)
            review_data.pop('place', None)

            self.review_repo.update(review_id, review_data)
            return True, None
        except (ValueError, TypeError) as e:
            return False, str(e)

    def delete_review(self, review_id):
        review = self.review_repo.get(review_id)
        if not review:
            return False, 'Review Not Found'
        place = self.place_repo.get(review.place)
        if place and hasattr(place, 'reviews'):
            if review in place.reviews:
                place.reviews.remove(review)
        self.review_repo.delete(review_id)
        return True, None
    