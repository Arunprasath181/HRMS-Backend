# HRMS Backend

Human Resource Management System - Backend API.

## Deployment on Render

This project is configured for easy deployment on [Render](https://render.com/).

### Steps:

1. **Connect GitHub**: Log in to Render and click "New" -> "Blueprint".
2. **Select Repository**: Select your `HRMS-Backend` repository.
3. **Configure Environment Variables**: Render will prompt you for the following variables defined in `render.yaml`:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secret key for signing tokens.
4. **Deploy**: Click "Apply" and Render will build and deploy your API.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on the environment variables needed.
3. Run in development mode:
   ```bash
   npm run dev
   ```
