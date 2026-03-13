# HBnB Evolution

**HBnB Evolution** is a comprehensive software engineering project designed to replicate the core functionality of an AirBnB-like application. This project serves as a practical implementation of full-stack architecture, focusing on clean code principles, modular design, and robust data management.

## Project Overview

The goal of this project is to design and build a scalable application that manages the lifecycle of:
- **Users:** Registration, JWT authentication (Bcrypt), profile management, and property creation/management.
- **Places:** Listing properties and descriptions.
- **Reviews:** User-generated feedback and ratings.
- **Amenities:** Tagging system for property features.

## Architecture

The system is designed using a **Layered Architecture** pattern to ensure separation of concerns:

1.  **Presentation Layer:** Handles API services and user interaction.
2.  **Business Logic Layer:** Encapsulates the core models and application rules.
3.  **Persistence Layer:** Manages data storage and retrieval.

Communication between these layers is streamlined using the **Facade Design Pattern**.

## Project Phases

The project evolved through three main phases, each with its own detailed documentation:

* **[Part 1: Technical Documentation](./part1/):** Architectural design, UML diagrams (Class, Package, Sequence), and the comprehensive technical blueprint.
* **[Part 2: Business Logic & API](./part2/):** Core domain models implementation, RESTful API endpoints setup, and In-Memory storage integration.
* **[Part 3: Authentication & Database](./part3/):** Security implementation (JWT, Bcrypt) and migration to a persistent database (SQLite/MySQL) using SQLAlchemy.

## Authors

* **Mohammed Saeed Aldosari** - [GitHub Profile](https://github.com/m7md-d)
* **Badr Mohammed Alshaya** - [GitHub Profile](https://github.com/Jnbla6)
* **Yazeed Mostafa Aljohani** - [GitHub Profile](https://github.com/yazeed-aljihane)

---
*Holberton School - Software Engineering Track*
