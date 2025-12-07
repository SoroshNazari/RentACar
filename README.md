# RentACar Project

This project is a monorepo containing a Java backend and a React frontend.

## Prerequisites

- Java 17
- Node.js (v18 or higher)
- npm (v9 or higher)

## Development Setup

All commands should be run from the project's root directory.

1.  **Install Dependencies:**
    This command installs all dependencies for both the frontend and backend workspaces.
    ```bash
    npm install
    ```

2.  **Run the Development Servers:**
    This command starts the backend server and the frontend development server concurrently.
    ```bash
    npm run dev
    ```
    - The backend will be available at `http://localhost:8080`.
    - The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Individual Scripts

If you need to run the frontend or backend separately, you can use the following commands from the root directory:

- **Start Backend Only:**
  ```bash
  npm run dev:backend
  ```
  (This is an alias for `./gradlew -p backend bootRun`)

- **Start Frontend Only:**
  ```bash
  npm run dev:frontend
  ```

- **Build Backend:**
  ```bash
  npm run build:backend
  ```
  (This is an alias for `./gradlew -p backend clean build`)

- **Build Frontend:**
  ```bash
  npm run build:frontend
  ```
