# TRB Web Application Clone

This project is a trimmed clone of the TRB web application, designed for recording employee hours on specific projects and clients. It features a React + Material-UI frontend and a Node.js + Express + TypeScript + Prisma + PostgreSQL backend.

## Features

-   **Authentication:** Login/Logout with JWT and bcrypt for password hashing.
-   **CRUD Operations:** Hours, Users, Projects, Tasks, Clients.
-   **Role-Based Access Control (RBAC):** Three roles: `user`, `supervisor`, `admin`.
-   **Soft-Delete:** For Clients, Projects, and Users. Hard delete for Hours.
-   **Pagination & Sorting:** On all list endpoints.
-   **Responsive UI:** Desktop-first, responsive for smaller screens.
-   **Spanish UI:** All user-facing text in Spanish (Argentina), with `America/Argentina/Buenos_Aires` timezone.

## Project Structure

-   `server/`: Contains the Node.js, Express, TypeScript, Prisma backend.
-   `client/`: Contains the React, Material-UI frontend.

## Setup Instructions

### Prerequisites

-   Node.js (LTS recommended)
-   npm (comes with Node.js)
-   PostgreSQL database

### 1. Database Setup

Create a new PostgreSQL database. You can name it `trb2_db` or any other name you prefer.

### 2. Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in the `server/` directory with the following content. Replace `your_database_user`, `your_database_password`, and `your_jwt_secret` with your actual values.
    ```env
    DATABASE_URL="postgresql://your_database_user:your_database_password@localhost:5432/trb2_db?schema=public"
    JWT_SECRET="your_jwt_secret_key_here"
    ACCESS_TOKEN_TTL="1h"
    REFRESH_TOKEN_TTL="30m"
    BCRYPT_SALT_ROUNDS="10"
    ```
4.  Run Prisma migrations to create the database tables:
    ```bash
    npx prisma migrate dev --name initial_migration
    ```
    *Note: If you are deploying to a production environment, use `npx prisma migrate deploy`.*

5.  Start the backend development server:
    ```bash
    npm run dev
    ```
    The backend will run on `http://localhost:3001` (default, can be configured).

### 3. Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm start
    ```
    The frontend will run on `http://localhost:3000` (default).

## Running the Application

1.  Ensure your PostgreSQL database is running.
2.  Start the backend server (from `server/` directory): `npm run dev`
3.  Start the frontend application (from `client/` directory): `npm start`

Open your browser and navigate to `http://localhost:3000` to access the application.

## Seed Data (Optional)

This project does not include a seed script. You will need to manually insert an `admin` user into the `User` table in your database to be able to log in and create other users.

Example SQL for an admin user (replace `hashed_password` with a bcrypt hashed password for "adminpassword"):

```sql
INSERT INTO "User" (email, password, role, "isActive", "createdAt", "updatedAt")
VALUES ('admin@example.com', 'hashed_password_here', 'admin', TRUE, NOW(), NOW());
```
You can generate a bcrypt hash using a tool or a simple Node.js script.
