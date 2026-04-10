# HBnB Evolution - Part 4

## Overview

HBnB is an AirBnB clone project designed to practice object-oriented programming, API design, system architecture, and full-stack integration. This phase of the project (Part 4) focuses on building and linking a **Dynamic Frontend Interface** to our existing RESTful API and persistent database.

The system now features a functional client-side web application built with HTML5, CSS3, and JavaScript. It connects to the secured backend API using the Fetch API, handles JWT-based authentication via cookies, and dynamically renders data (places, user information, and reviews) directly from the database. The frontend also successfully reflects the extended model architectures, such as the `Place` model which now includes dynamic properties like `max_guests`, `number_rooms`, `number_bathrooms`, and `city`.

## Setup and Installation

### Prerequisites

* Python 3.8 or higher.
* SQLite3 or MySQL depending on environment configuration.
* A modern web browser.

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

4. Initialize the database by running the provided SQL scripts:

```bash
sqlite3 instance/development.db < schema.sql
sqlite3 instance/development.db < seed.sql
```

These scripts create the database schema and populate initial data such as the **Admin user** and basic **Amenities**.

*(Adjust the command if using a different SQL database system according to your configuration.)*

### Running the Application

1. **Start the Backend API Server:**
From the `hbnb/` directory, execute the script to start the local web server:

```bash
python3 run.py
```

The API application will launch, running by default on `http://127.0.0.1:8080/`. You can browse the interactive Swagger UI and test the secured endpoints by navigating to `http://127.0.0.1:8080/api/v1/`.

2. **Access the Frontend Application:**
Open the frontend HTML files (e.g., `index.html`) located in the root of the project directly in your browser, or start a simple Python static server in the directory containing the HTML files.

---

## Project Structure Explanation

The project builds upon the architecture established in prior parts and extends it to support a **full-stack application**.

### Backend Structure (`hbnb/`)

* **`app/`**: The core API application module.
  * **`api/v1/`**: The API routing layer handling endpoints (auth, users, places, reviews, amenities).
  * **`models/`**: The Domain Layer. Contains the SQLAlchemy models. Key models like `Place` have been expanded to include comprehensive properties like `max_guests`, `city`, and `image_url`.
  * **`services/`**: The Business Logic layer and Facade design pattern.
  * **`persistence/`**: The Storage layer using SQLAlchemy ORM.
* **`schema.sql`** & **`seed.sql`**: Database initialization scripts mirroring the models.
* **`tests/`**: Automated test files.
* **`run.py`**: The API execution entry-point.

### Frontend Structure

Located primarily outside the `hbnb/` backend folder, the frontend consists of:

* **HTML Views**: `index.html`, `login.html`, `place.html`, `add_review.html`, `admin.html` representing distinct screens and workflows.
* **`styles.css`**: The central CSS file containing design tokens and component styling.
* **`js/`**: Contains modularized JavaScript logic (e.g., `scripts.js`, authentication checks, api wrappers) for dynamic content fetching and interaction.
* **`images/`**: Static assets, including site backgrounds and specific amenity icons.