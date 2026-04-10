# HBnB Evolution

**HBnB Evolution** is a comprehensive software engineering project designed to replicate the core functionality of an AirBnB-like application. This project serves as a practical implementation of full-stack architecture, focusing on clean code principles, modular design, robust data management, and a dynamic user interface.

## Project Overview

The goal of this project is to design and build a scalable full-stack application that manages the lifecycle of:
- **Users:** Registration, JWT authentication (Bcrypt), profile management, and secure client-side session handling.
- **Places:** Listing properties, dynamic client-side filtering, and interactive mapping.
- **Reviews:** User-generated feedback and ratings with authenticated submission.
- **Amenities:** Tagging system for property features.

## Architecture

The system is designed using a **Layered Architecture** pattern to ensure strict separation of concerns:

1.  **Presentation Layer (Frontend & API):** A responsive, framework-less Web Client (HTML5/CSS3/Vanilla JS) communicating with a RESTful API built with Flask.
2.  **Business Logic Layer:** Encapsulates the core domain models and strict application rules.
3.  **Persistence Layer:** Manages data storage and retrieval securely using SQLAlchemy.

Communication between the backend layers is streamlined using the **Facade Design Pattern**, while the frontend interacts seamlessly via asynchronous AJAX/Fetch API requests.

## Project Phases

The project evolved through four main phases, culminating in a complete full-stack application:

* **[Part 1: Technical Documentation](./part1/):** Architectural design, UML diagrams (Class, Package, Sequence), and the comprehensive technical blueprint.
* **[Part 2: Business Logic & API](./part2/):** Core domain models implementation, RESTful API endpoints setup, and In-Memory storage integration.
* **[Part 3: Authentication & Database](./part3/):** Security implementation (JWT, Bcrypt) and migration to a persistent database (SQLite/MySQL) using SQLAlchemy.
* **[Part 4: Dynamic Web Client](./part4/):** Frontend development using modern HTML5, CSS3, and Vanilla JavaScript (ES6). Features dynamic DOM manipulation, seamless client-side filtering, secure JWT session management via Cookies/Headers, and a responsive UI (including Dark Mode).

## Authors

* **Mohammed Saeed Aldosari** - [GitHub Profile](https://github.com/m7md-d)
* **Badr Mohammed Alshaya** - [GitHub Profile](https://github.com/Jnbla6)
* **Yazeed Mostafa Aljohani** - [GitHub Profile](https://github.com/yazeed-aljihane)

---
*Holberton School - Software Engineering Track*
