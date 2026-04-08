import os
import uuid
from PIL import Image, ImageOps
from werkzeug.exceptions import RequestEntityTooLarge

# ثوابت الأمان والضغط
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 ميجابايت
MAX_IMAGE_DIMENSION = 2048       # أقصى عرض أو طول مسموح للحفظ (Airbnb تستخدم مقاسات مقاربة)
ABSOLUTE_MAX_DIMENSION = 6000    # أقصى بُعد نقبله لفك الضغط (لمنع الـ Decompression Bombs)

class ImageService:
    
    @staticmethod
    def process_and_save(file_storage, save_dir):
        """
        تقوم بفحص، تنظيف (إزالة الميتا داتا)، ضغط، وحفظ الصورة.
        ترجع اسم الملف الجديد إذا نجحت، أو ترمي Exception إذا فشلت.
        """
        
        # 1. التحقق من حجم الملف في الذاكرة (قبل حتى أن نحاول فتحه كصورة)
        file_storage.seek(0, os.SEEK_END) # الذهاب لآخر الملف
        file_size = file_storage.tell()   # قراءة المؤشر لمعرفة الحجم
        file_storage.seek(0)              # إعادة المؤشر للبداية لنتمكن من قراءته لاحقاً
        
        if file_size > MAX_FILE_SIZE:
            raise ValueError("Image file size exceeds the 5MB limit.")

        try:
            # 2. فتح الصورة (هنا يتم فحص الـ Magic Bytes تلقائياً، لو كان سكربت سيفشل)
            img = Image.open(file_storage)
            
            # 3. الحماية من الـ Decompression Bomb (التحقق من الأبعاد قبل المعالجة)
            if img.width > ABSOLUTE_MAX_DIMENSION or img.height > ABSOLUTE_MAX_DIMENSION:
                raise ValueError(f"Image dimensions too large. Max allowed is {ABSOLUTE_MAX_DIMENSION}px.")

            # 4. إصلاح دوران الصورة (بعض صور الجوالات تعتمد على الـ EXIF للدوران، هذه الدالة تعدل الصورة وتحذف هذا الـ EXIF)
            img = ImageOps.exif_transpose(img)

            # 5. إزالة الشفافية (Alpha Channel) وتحويلها لـ RGB (مهم لتصغير الحجم وتجنب أخطاء حفظ JPEG/WebP)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # 6. تصغير الصورة مع الحفاظ على الأبعاد (Aspect Ratio) إذا كانت أكبر من 2048px
            # نستخدم LANCZOS لأنه أفضل خوارزمية للحفاظ على التفاصيل أثناء التصغير
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)

            # 7. توليد اسم ملف آمن وفريد بصيغة WebP
            filename = f"{uuid.uuid4().hex}.webp"
            filepath = os.path.join(save_dir, filename)

            # 8. حفظ الصورة
            # ملاحظة: عدم تمرير معامل `exif` لدالة save يعني أن Pillow ستسقط كل الميتا داتا تلقائياً!
            # نستخدم جودة 82 وهي نقطة التوازن المثالية بين الحجم والوضوح
            img.save(filepath, format="WEBP", quality=82, optimize=True)

            return filename

        except IOError:
            raise ValueError("The uploaded file is not a valid image.")

    @staticmethod
    def delete_image(image_relative_path):
        """Deletes an image file from storage given its relative path."""
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
