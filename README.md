# AI Placement Preparation Platform

A full-stack platform for job placement preparation with AI-powered mock interviews, resume reviews, and coding practice assistance.

## Tech Stack

### Client
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- react-hot-toast
- @dnd-kit/core (drag and drop)
- @dnd-kit/sortable
- react-dropzone (file uploads)
- @uiw/react-md-editor (markdown editor)
- lucide-react (icons)

### Server
- Node.js
- Express
- MongoDB (Mongoose)
- Passport.js (Google OAuth + Local)
- JWT Authentication
- OpenAI SDK (for AI features)
- Multer (file uploads)
- PDF Parse (resume parsing)
- Helmet (security)
- Morgan (logging)
- Express Rate Limiting

## Project Structure

```
pp_platform/
├── client/          # React frontend
├── server/          # Node.js/Express backend (includes AI features)
├── package.json     # Root package.json with dev scripts
└── README.md        # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pp_platform
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

   Or install individually:
   ```bash
   # Root dependencies
   npm install
   
   # Client dependencies
   cd client
   npm install
   cd ..
   
   # Server dependencies
   cd server
   npm install
   ```

### Configuration

3. **Configure Server Environment Variables**
   
   Copy `server/.env.example` to `server/.env` and fill in your values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/prepai
   JWT_SECRET=your-jwt-secret-change-in-production
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
   
   Required environment variables:
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT token signing
   - `OPENAI_API_KEY` - OpenAI API key for AI features
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)

4. **Configure Client Environment Variables**
   
   Copy `client/.env.example` to `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

5. **Start all services concurrently**
   ```bash
   npm run dev
   ```

   This will start:
   - Client on http://localhost:5173
   - Server on http://localhost:5000

   Or run services individually:
   ```bash
   # Client
   cd client
   npm run dev
   
   # Server
   cd server
   npm run dev
   ```

## Features

- **Mock Interviews**: AI-powered interview practice with real-time feedback
- **Resume Review**: Upload and get AI feedback on your resume (PDF parsing supported)
- **Coding Practice**: Solve coding problems with AI assistance
- **Google OAuth**: Sign in with Google (optional)
- **Local Authentication**: Email/password authentication
- **JWT Authentication**: Secure user authentication
- **Rate Limiting**: API rate limiting for security
- **File Uploads**: Support for PDF resume uploads

## API Endpoints

### Server (http://localhost:5000)

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

#### Users
- `GET /api/users/profile` - Get user profile

#### Interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/user/:userId` - Get user interviews
- `POST /api/interviews/:id/submit` - Submit interview for AI feedback

#### Resume
- `POST /api/resume/upload` - Upload and parse resume (PDF)

#### AI Features
- `POST /api/ai/interview/feedback` - Get interview feedback
- `POST /api/ai/resume/review` - Get resume review
- `POST /api/ai/coding/help` - Get coding assistance

#### Health
- `GET /health` - Server health check

## Development

### Client Development
```bash
cd client
npm run dev
```

### Server Development
```bash
cd server
npm run dev
```

## Production Build

### Build Client for Production
```bash
cd client
npm run build
```

This creates an optimized production build in the `client/dist` directory.

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Configure environment variables** in `docker-compose.yml` or use a `.env` file

2. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

This will start:
- MongoDB on port 27017
- Server on port 5000

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

### Building Server Docker Image
```bash
cd server
docker build -t prepai-server .
```

### Running Server Container
```bash
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/prepai \
  -e JWT_SECRET=your-secret \
  -e OPENAI_API_KEY=your-key \
  prepai-server
```

## Environment Variables Reference

### Server (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | No |
| PORT | Server port | No (default: 5000) |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| OPENAI_API_KEY | OpenAI API key for AI features | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | No |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | No |
| GOOGLE_CALLBACK_URL | Google OAuth callback URL | No |

### Client (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running on the specified port
- Check your MONGO_URI format
- For MongoDB Atlas, whitelist your IP address

### OpenAI API Errors
- Verify your API key is valid
- Check you have sufficient credits
- Ensure the key has the correct permissions

### Google OAuth Not Working
- Verify callback URL matches your Google OAuth settings
- Ensure your OAuth app is in production mode if using HTTPS
- Check client ID and secret are correct

## License

ISC
