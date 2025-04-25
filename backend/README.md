# Chat Application Backend

This is the backend server for the chat application, configured to run both locally and on Render.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB database
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5001
RENDER_PORT=10000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_uri_here

# Client Configuration
CLIENT_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Cloudinary Configuration (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

The server will run on port 5001 by default.

## Production Deployment on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm run prod`
   - Environment Variables: Add all required environment variables from `.env`

4. Deploy the service

The server will run on both the local port (5001) and the Render port (10000).

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/messages` - Message routes
- `/api/groups` - Group routes

## Socket.IO

The server uses Socket.IO for real-time communication. It's configured to work on both local and Render deployments.

## Error Handling

The server includes comprehensive error handling and will return appropriate error messages based on the environment (development/production). 