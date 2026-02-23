import unittest
from app.models.basemodel import BaseModel
import time

class TestBaseModel(unittest.TestCase):
    def test_create_basemodel(self):
        obj1 = BaseModel()
        obj2 = BaseModel()
        
        # UUID Usage
        self.assertIsInstance(obj1.id, str)
        self.assertNotEqual(obj1.id, obj2.id)
        
        # Timestamp Management
        self.assertIsNotNone(obj1.created_at)
        self.assertIsNotNone(obj1.updated_at)
        
    def test_save_updates_timestamp(self):
        obj = BaseModel()
        old_updated_at = obj.updated_at
        time.sleep(0.01)
        obj.save()
        self.assertNotEqual(obj.updated_at, old_updated_at)
        self.assertTrue(obj.updated_at > old_updated_at)
        
    def test_update_method(self):
        class DummyModel(BaseModel):
            def __init__(self):
                super().__init__()
                self.name = "Dummy"
                
        obj = DummyModel()
        old_updated_at = obj.updated_at
        time.sleep(0.01)
        obj.update({"name": "New Dummy"})
        self.assertEqual(obj.name, "New Dummy")
        self.assertTrue(obj.updated_at > old_updated_at)
        
    def test_update_protected_attributes(self):
        obj = BaseModel()
        with self.assertRaises(ValueError):
            obj.update({"id": "123"})
        with self.assertRaises(ValueError):
            obj.update({"created_at": "now"})
        with self.assertRaises(ValueError):
            obj.update({"updated_at": "now"})

if __name__ == '__main__':
    unittest.main()
