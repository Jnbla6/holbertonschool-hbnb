erDiagram
    users {
        CHAR(36) id PK
        VARCHAR(255) first_name
        VARCHAR(255) last_name
        VARCHAR(255) email UK
        VARCHAR(255) password
        BOOLEAN is_admin
    }
    
    places {
        CHAR(36) id PK
        VARCHAR(255) title
        TEXT description
        DECIMAL(10_2) price
        FLOAT latitude
        FLOAT longitude
        CHAR(36) owner_id FK
    }
    
    reviews {
        CHAR(36) id PK
        TEXT text
        INT rating
        CHAR(36) user_id FK
        CHAR(36) place_id FK
    }
    
    amenities {
        CHAR(36) id PK
        VARCHAR(255) name UK
    }
    
    place_amenity {
        CHAR(36) place_id PK, FK
        CHAR(36) amenity_id PK, FK
    }
    
    %% Relationships
    users ||--o{ places : "owns (1:N)"
    users ||--o{ reviews : "writes (1:N)"
    places ||--o{ reviews : "receives (1:N)"
    
    %% Many-to-Many Relationship handled by association table
    places ||--o{ place_amenity : "has (1:N)"
    amenities ||--o{ place_amenity : "belongs to (1:N)"