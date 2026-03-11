-- Insert Administrator User
-- The password below is the bcrypt hash for 'admin1234'
INSERT INTO users (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1', 
    'Admin', 
    'HBnB', 
    'admin@hbnb.io', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
    TRUE
);

-- Insert Initial Amenities with randomly generated UUIDv4 strings
INSERT INTO amenities (id, name) VALUES ('06689d70-0a81-4993-8686-2bb6730722cc', 'WiFi');
INSERT INTO amenities (id, name) VALUES ('f85bb667-bb89-4b68-80f0-c5fc6bc68846', 'Swimming Pool');
INSERT INTO amenities (id, name) VALUES ('4274ed4a-0a73-45be-b430-b3e1cd095e7b', 'Air Conditioning');