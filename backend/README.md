# MVCP-BENIN Cellules - NestJS Backend

This directory contains the NestJS backend for the MVCP-BENIN Cellules application. It provides a complete RESTful API for all frontend functionalities, handles authentication, and interacts with a MongoDB database.

## Features

- **Framework**: Built with [NestJS](https://nestjs.com/).
- **Database**: Uses MongoDB with Mongoose for data persistence.
- **Authentication**: JWT-based authentication with password hashing (bcrypt).
- **Authorization**: Role-Based Access Control (RBAC) to protect routes.
- **Validation**: `class-validator` for incoming request body validation.
- **Configuration**: Manages environment variables using `@nestjs/config`.
- **Database Seeding**: Includes a seeder to populate the database with initial mock data.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (running locally or a cloud instance like MongoDB Atlas)

## Getting Started

### 1. Installation

Navigate to the `backend` directory and install the dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root of the `backend` directory. Copy the contents of `.env.example` and fill in the required values.

```env
# .env

# --- Database ---
# Your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/mvcp-benin

# --- Authentication ---
# A strong, secret string for signing JWT tokens
JWT_SECRET=YOUR_SUPER_SECRET_KEY_CHANGE_ME

# --- Seeder ---
# A secret key to trigger the database seed. Change this to something unique.
SEEDER_KEY=YOUR_UNIQUE_SEEDER_KEY
```

### 3. Running the Application

To run the application in development mode with hot-reloading:

```bash
npm run start:dev
```

The application will be running on `http://localhost:3000`.

### 4. Seeding the Database (Optional but Recommended)

To populate your database with the initial mock data, make a `POST` request to the seeding endpoint with your `SEEDER_KEY`. You can use a tool like Postman, Insomnia, or cURL.

**Endpoint**: `POST http://localhost:3000/seeder/seed`

**Headers**:
- `Content-Type`: `application/json`

**Body**:
```json
{
  "key": "YOUR_UNIQUE_SEEDER_KEY"
}
```

The seeder is designed to prevent accidental re-seeding if data already exists. It will only run if the collections are empty.

## Project Structure

The project is organized into modules for each major feature (e.g., `auth`, `users`, `reports`). Each module contains:
- `*.controller.ts`: Handles incoming requests and routing.
- `*.service.ts`: Contains the business logic and database interactions.
- `*.schema.ts`: Defines the Mongoose schema for the database collection.
- `dto/`: Contains Data Transfer Objects for request validation.
