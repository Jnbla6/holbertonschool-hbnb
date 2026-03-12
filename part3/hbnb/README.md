
---

````markdown
# HBnB Evolution - Part 3

## Overview
HBnB is an AirBnB clone project designed to practice object-oriented programming, API design, and system architecture. This phase of the project (Part 3) focuses on implementing **Authentication and Authorization** as well as migrating the storage layer from an In-Memory repository to a **Persistent Database Storage** using SQLAlchemy.

The system now secures API endpoints using **JWT authentication**, hashes user passwords using **Bcrypt**, and introduces database-backed repositories that manage entities directly through SQLAlchemy ORM models. Additionally, database initialization scripts are provided to simplify schema creation and initial data population.

## Setup and Installation

### Prerequisites
- Python 3.8 or higher.
- SQLite3 or MySQL depending on environment configuration.

### Installation Instructions
1. Navigate to the project directory:
   ```bash
   cd hbnb
````

2. Set up a Python virtual environment (recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database by running the provided SQL scripts:

   ```bash
   sqlite3 instance/development.db < schema.sql
   sqlite3 instance/development.db < seed.sql
   ```

   These scripts create the database schema and populate initial data such as the **Admin user** and basic **Amenities**.

   *(Adjust the command if using a different SQL database system according to your configuration.)*

### Running the Application

From the root directory (`hbnb/`), execute the script to start the local web server:

```bash
python3 run.py
```

The application will launch, running by default on `http://127.0.0.1:8080/`.
You can browse the interactive Swagger UI and test the secured endpoints by navigating to `http://127.0.0.1:8080/api/v1/`.

---

## Project Structure Explanation

The project builds upon the architecture established in Part 2 and extends it to support **security and persistent storage**.

* **`app/`**: The core application module.

  * **`app/__init__.py`**: Contains the setup for the Flask Application and integrates Flask-RESTx, SQLAlchemy, JWTManager, and Bcrypt.
  * **`app/api/`**: The presentation/routing layer.

    * **`app/api/v1/auth.py`**: Handles user authentication (`/login`) and JWT token generation.
    * **`app/api/v1/users.py`**: Defines HTTP routing and endpoints handling User resources.
    * **`app/api/v1/places.py`**: Defines HTTP routing and endpoints handling Place resources.
    * **`app/api/v1/reviews.py`**: Defines HTTP routing and endpoints handling Review resources.
    * **`app/api/v1/amenities.py`**: Defines HTTP routing and endpoints handling Amenity resources.
  * **`app/models/`**: The Domain Layer.

    * **`app/models/basemodel.py`**: Contains the base class handling UUIDs, timestamps, and SQLAlchemy model inheritance.
    * **`app/models/user.py`**: Defines the `User` class with authentication attributes and database columns.
    * **`app/models/place.py`**: Defines the `Place` class representing listings stored in the database.
    * **`app/models/review.py`**: Defines the `Review` class representing feedback placed by users on listings.
    * **`app/models/amenity.py`**: Defines the `Amenity` class representing available services at a place.
  * **`app/services/`**: The Business Logic layer.

    * **`app/services/facade.py`**: Implements the Facade design pattern (`HBnBFacade`) acting as an intermediate layer connecting API requests to repository operations.
    * **`app/services/repositories/`**: Contains database-backed repositories for each entity.

      * `user_repository.py`
      * `place_repository.py`
      * `review_repository.py`
      * `amenity_repository.py`
  * **`app/persistence/`**: The Storage layer.

    * **`app/persistence/repository.py`**: Defines the base `SQLAlchemyRepository` class along with the legacy `InMemoryRepository`.

* **`schema.sql`**: Defines the database tables and schema.

* **`seed.sql`**: Populates the database with required initial data such as the Admin user and base amenities.

* **`tests/`**: Contains automated test files covering Models creation, validation, and API endpoint testing.

* **`config.py`**: Configuration setups (`DevelopmentConfig`, `ProductionConfig`) managing database URIs and secret keys.

* **`requirements.txt`**: Lists the required external PyPI packages including `flask-jwt-extended`, `flask-bcrypt`, and `flask-sqlalchemy`.

* **`run.py`**: The main execution entry-point script to start the Flask application.

```