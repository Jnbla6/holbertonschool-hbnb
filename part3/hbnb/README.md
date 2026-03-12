```markdown
# HBnB Evolution - Part 3

## Overview
HBnB is an AirBnB clone project designed to practice object-oriented programming, API design, and system architecture. This phase of the project (Part 3) focuses on **Authentication & Authorization** and migrating from In-Memory storage to a **Persistent Database Storage** utilizing the Repository pattern.

Key updates in Part 3 include:
- **Database Integration:** Replaced the in-memory repository with a database-backed repository utilizing SQL (`schema.sql`, `seed.sql`).
- **Authentication & Security:** Added authentication (`auth.py`, `login` endpoints) to secure the API and restrict access to specific resources.
- **Advanced Repository Pattern:** Introduced dedicated repository classes for each entity (`user_repository.py`, `place_repository.py`, etc.) connecting the application's business logic to the database.

## Setup and Installation

### Prerequisites
- Python 3.8 or higher.
- SQLite / MySQL (depending on the configured database).

### Installation Instructions
1. Navigate to the project directory:
   ```bash
   cd hbnb

```

2. Set up a Python virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate

```


3. Install the required dependencies:
```bash
pip install -r requirements.txt

```


4. **Initialize the Database:**
Run the provided SQL scripts to set up the schema and seed initial data:
```bash
sqlite3 hbnb.db < schema.sql
sqlite3 hbnb.db < seed.sql

```


*(Adjust the database command if using a different SQL database system).*

### Running the Application

From the root directory (`hbnb/`), execute the specific script to start the web local server:

```bash
python3 run.py

```

The application will launch, running by default on `http://127.0.0.1:5000/`. You can browse the interactive Swagger UI by navigating to `http://127.0.0.1:5000/api/v1/`.

---

## Project Structure Explanation

The project uses a structured, modular layering pattern organized around Domain-Driven Design principles, expanded to accommodate the new security and persistence layers:

* **`app/`**: The core application module.
* **`app/__init__.py`**: Contains the setup for the Flask Application and integrates the Flask-RESTx extensions.
* **`app/api/`**: The presentation/routing layer.
* **`app/api/v1/auth.py` & `login**`: **[NEW]** Handles user authentication and token generation.
* **`app/api/v1/users.py`, `places.py`, `reviews.py`, `amenities.py**`: Defines HTTP routing and endpoints handling REST resources (secured where applicable).


* **`app/models/`**: The Domain Layer.
* Defines the application's central classes (`User`, `Place`, `Review`, `Amenity`, `BaseModel`).


* **`app/services/`**: The Business Logic layer.
* **`app/services/facade.py`**: Implements the Facade design pattern (`HBnBFacade`), acting as an intermediate layer connecting the API requests safely to the persistence tier.
* **`app/services/repositories/`**: **[NEW]** Contains specific database-backed repositories (`user_repository.py`, `place_repository.py`, `review_repository.py`, `amenity_repository.py`).


* **`app/persistence/`**: The Storage layer blueprint.


* **`schema.sql` & `seed.sql**`: **[NEW]** SQL scripts to define database tables and populate the database with mock data.
* **`tests/`**: Contains the automated test files covering Models creation, validation, and Endpoints.
* **`config.py`**: Configurations setups (`DevelopmentConfig`, `ProductionConfig`).
* **`requirements.txt`**: Enumerates the list of required external PyPI packages (including new auth and database dependencies).
* **`run.py`**: The main execution entry-point script to fire up the application.

```

```