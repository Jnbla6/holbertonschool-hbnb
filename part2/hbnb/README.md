# HBnB Evolution - Part 2

## Overview
HBnB is an AirBnB clone project designed to practice object-oriented programming, API design, and system architecture. This phase of the project (Part 2) focuses on building the core business logic and RESTful API endpoints. It defines the central entities (`User`, `Place`, `Review`, `Amenity`), manages them through an In-Memory storage repository, and utilizes a Facade pattern to orchestrate operations between the endpoints and storage components. The API is powered by Flask and Flask-RESTx.

## Setup and Installation

### Prerequisites
- Python 3.8 or higher.

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

### Running the Application
From the root directory (`hbnb/`), execute the specific script to start the web local server:
```bash
python3 run.py
```
The application will launch, running by default on `http://127.0.0.1:5000/`. You can browse the interactive Swagger UI by navigating to `http://127.0.0.1:5000/api/v1/`.

---

## Project Structure Explanation

The project uses a structured, modular layering pattern organized around Domain-Driven Design principles:

- **`app/`**: The core application module.
  - **`app/__init__.py`**: Contains the setup for the Flask Application and integrates the Flask-RESTx extensions.
  - **`app/api/`**: The presentation/presentation routing layer.
    - **`app/api/v1/__init__.py`**: Integrates and registers all namespaces to version 1 of the REST API.
    - **`app/api/v1/users.py`**: Defines HTTP routing and endpoints handling User resources.
    - **`app/api/v1/places.py`**: Defines HTTP routing and endpoints handling Place resources.
    - **`app/api/v1/reviews.py`**: Defines HTTP routing and endpoints handling Review resources.
    - **`app/api/v1/amenities.py`**: Defines HTTP routing and endpoints handling Amenity resources.
  - **`app/models/`**: The Domain Layer.
    - **`app/models/basemodel.py`**: Contains the Base class handles UUIDs and timestamps for entity inheritance.
    - **`app/models/user.py`**: Defines the `User` class for hosting logic and attributes.
    - **`app/models/place.py`**: Defines the `Place` class representing listings in the API.
    - **`app/models/review.py`**: Defines the `Review` class representing feedback placed by users on listings.
    - **`app/models/amenity.py`**: Defines the `Amenity` class representing available comforts/services at a place.
  - **`app/services/`**: The Business Logic layer.
    - **`app/services/facade.py`**: Implements the Facade design pattern (`HBnBFacade`), acting as an intermediate layer connecting the API requests safely to the persistence (storage) tier.
  - **`app/persistence/`**: The Storage layer.
    - **`app/persistence/repository.py`**: Houses the Abstract blueprint for Repositories and provides the `InMemoryRepository` functionality to manage data inside active memory.

- **`tests/`**: Contains the automated test files covering Models creation, validation, and Endpoints validation via `unittest`.
- **`config.py`**: Configurations setups (`DevelopmentConfig`, `ProductionConfig`) to easily toggle modes when launching the Flask APP.
- **`requirements.txt`**: Enumerates the list of required external PyPI packages (like `flask`, `flask-restx`).
- **`run.py`**: The main execution entry-point script to fire up the application.
