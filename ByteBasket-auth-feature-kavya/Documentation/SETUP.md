# ByteBasket Project Setup

This document provides instructions for setting up the ByteBasket development environment.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend

2. Install dependencies:
    ```bash
    npm install

3. Create a .env file based on .env.example:
    ```bash
    cp .env.example .env

4. Start the development server:
    ```bash
    npm run dev

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend

2. Install dependencies:
    ```bash
    npm install

3. Create a .env file based on .env.example:
    ```bash
    cp .env.example .env

4. Start the development server:
    ```bash
    npm start

## Running Both Services

You can run both frontend and backend concurrently (you'll need to have two terminal windows open):

1. In one terminal, start the backend:
    ```bash
    cd backend && npm run dev

2. In another terminal, start the frontend:
    ```bash
    cd frontend && npm start

## Code Quality Tools

We use ESLint and Prettier for code quality and formatting:

- To lint the code:
    ```bash
    npm run lint

- To automatically fix linting issues:
    ```bash
    npm run lint:fix
    
## CI/CD Pipeline

Our GitHub repository is configured with GitHub Actions for continuous integration. The CI pipeline will run automatically when:

- A pull request is opened against the main or development branches
- Code is pushed to the main or development branches

The pipeline checks:

1. Code linting
2. Tests
3. Build process