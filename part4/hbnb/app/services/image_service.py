import os
import uuid
from PIL import Image, ImageOps
from werkzeug.exceptions import RequestEntityTooLarge

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit for uploaded images to prevent abuse and ensure performance
MAX_IMAGE_DIMENSION = 2048       # Maximum width or height for uploaded images to prevent excessively large files
ABSOLUTE_MAX_DIMENSION = 6000    # Prevent processing of extremely large images that could cause memory issues

class ImageService:
    
    @staticmethod
    def process_and_save(file_storage, folder_name="places", keep_alpha=False):
        """
        Handles image validation, processing, and saving.
         - Validates file size and type.
         - Resizes images to a maximum dimension while maintaining aspect ratio.
         - Converts images to WEBP format for optimized storage.
         - Saves images in a structured directory based on the provided folder name.
         - Returns the relative path to the saved image for database storage.
         - Raises ValueError with descriptive messages for any validation or processing issues.
        """
        
        # 1. setup the save directory
        base_dir = os.getcwd()
        relative_dir = os.path.join('images', folder_name)
        save_dir = os.path.join(base_dir, relative_dir)
        os.makedirs(save_dir, exist_ok=True)

        # 2. check file size
        file_storage.seek(0, os.SEEK_END)
        file_size = file_storage.tell()
        file_storage.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise ValueError("Image file size exceeds the 5MB limit.")

        try:
            # 3. open and process the image
            img = Image.open(file_storage)

            if img.width > ABSOLUTE_MAX_DIMENSION or img.height > ABSOLUTE_MAX_DIMENSION:
                raise ValueError(f"Image dimensions too large. Max allowed is {ABSOLUTE_MAX_DIMENSION}px.")

            img = ImageOps.exif_transpose(img)

            if not keep_alpha:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
            else:
                if img.mode == "P":
                    img = img.convert("RGBA")

            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)

            # 4. save the image in WEBP format
            filename = f"{uuid.uuid4().hex}.webp"
            filepath = os.path.join(save_dir, filename)

            img.save(filepath, format="WEBP", quality=82, optimize=True)

            # return the relative path for database storage
            return f"{relative_dir}/{filename}"

        except IOError:
            raise ValueError("The uploaded file is not a valid image.")

    @staticmethod
    def delete_image(image_relative_path):
        """
        Deletes an image file from storage based on its relative path.
        """
        if not image_relative_path:
            return
            
        try:
            base_dir = os.getcwd()
            full_path = os.path.join(base_dir, image_relative_path)
            
            if os.path.exists(full_path):
                os.remove(full_path)
                print(f"Image deleted from storage: {full_path}")
        except Exception as e:
            print(f"Failed to delete image file: {e}")
