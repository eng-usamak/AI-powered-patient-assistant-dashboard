# TeraLeads - Patient Assistant Dashboard

A full-stack AI-powered patient assistant dashboard for a dental clinic. Built with React, Node.js (Express), PostgreSQL, and an optional Python AI microservice.

## 🚀 Live Deployment URLs

- **Frontend**: [Your Vercel/Netlify URL here]
- **Backend API**: [Your Render/Railway/Fly.io URL here]
- **Database**: [Your Neon/Supabase URL here]
- **AI Service**: [Your AI service URL here, if deployed]

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Run Instructions](#setup--run-instructions)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [Design Document](#design-document)

## 🛠 Tech Stack

### Backend
- **Node.js** + **TypeScript** - Runtime and type safety
- **Express.js** - Web framework
- **PostgreSQL** - Database (via Prisma ORM)
- **Prisma** - Database ORM and migrations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management (auth)

### AI Service (Optional)
- **Python** + **FastAPI** - Microservice framework
- **OpenAI API** (optional) - AI model integration
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
TeraLeads/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── app.ts          # Express app configuration
│   │   ├── server.ts       # Server entry point
│   │   ├── config/         # Configuration (env, etc.)
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # Route definitions
│   │   ├── middleware/     # Auth, error handling
│   │   └── db/             # Prisma client
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── api/            # API client functions
│   │   ├── context/        # React contexts (Auth)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── ai-service/              # Python AI microservice (optional)
│   ├── app/
│   │   └── main.py        # FastAPI application
│   ├── requirements.txt
│   └── README.md
│
└── docs/
    └── DESIGN.md           # Design document
```

## 🏃 Setup & Run Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (local or hosted - Neon/Supabase recommended)
- **Python 3.9+** (only if running AI service)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

### AI Service Setup (Optional)

1. **Navigate to ai-service directory:**
   ```bash
   cd ai-service
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Optionally add OPENAI_API_KEY for real AI responses
   ```

5. **Start AI service:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   
   AI service will run on `http://localhost:8000`

### Running All Services

For local development, you'll need **3 terminal windows**:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Terminal 3 - AI Service (optional):**
   ```bash
   cd ai-service && uvicorn app.main:app --reload
   ```

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgres://user:password@host:port/database
AI_SERVICE_URL=http://localhost:8000
```

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWT tokens (use strong random string in production)

**Optional:**
- `PORT` - Backend port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `AI_SERVICE_URL` - URL of AI microservice (default: http://localhost:8000)

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:4000
```

**Required:**
- `VITE_API_BASE_URL` - Backend API base URL

### AI Service (`ai-service/.env`)

```env
PORT=8000
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Optional:**
- `PORT` - AI service port (default: 8000)
- `OPENAI_API_KEY` - OpenAI API key (if not set, uses mock responses)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-3.5-turbo)

## 🏗 Architecture Overview

### High-Level Architecture

```
┌─────────────┐
│   Browser   │
│  (React SPA)│
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────────────────┐
│   Backend (Express)     │
│  - Auth (JWT)           │
│  - Patient CRUD         │
│  - Chat endpoints       │
└──────┬──────────┬───────┘
       │          │
       │          │ HTTP
       │          │
       ▼          ▼
┌──────────┐  ┌──────────────┐
│PostgreSQL│  │ AI Service   │
│ (Prisma) │  │  (FastAPI)   │
└──────────┘  └──────────────┘
```

### Component Breakdown

1. **Frontend (React SPA)**
   - Handles all UI and user interactions
   - Manages authentication state (JWT in localStorage)
   - Makes API calls to backend
   - Protected routes require valid JWT

2. **Backend (Express + TypeScript)**
   - RESTful API server
   - JWT-based authentication
   - Patient CRUD operations
   - Chat message persistence
   - Calls AI service for responses

3. **Database (PostgreSQL)**
   - Stores users, patients, and chat messages
   - Managed via Prisma ORM
   - Indexed for performance

4. **AI Service (Python FastAPI)**
   - Separate microservice for AI responses
   - Can use OpenAI API or mock responses
   - Stateless and horizontally scalable

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

### Patients (Protected - requires JWT)

- `GET /api/patients?page=1&limit=10` - List patients (paginated)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Chat (Protected - requires JWT)

- `GET /api/chat/:patientId` - Get chat history for patient
- `POST /api/chat` - Send message and get AI response
  - Body: `{ patientId, message }`
  - Returns: `{ userMessage, aiMessage }`

### Health Check

- `GET /api/health` - Health check endpoint

## 🤖 AI Usage Disclosure

### AI-Assisted Development

This project was developed with the assistance of AI tools (specifically, an AI coding assistant) for:

- **Planning and Architecture**: Initial project structure and technology choices were discussed with AI assistance
- **Code Guidance**: Implementation patterns, best practices, and explanations were provided by AI
- **Documentation**: This README and design document were drafted with AI assistance

**Important Notes:**
- All code was written and reviewed by the developer
- The developer understands every line of code and can explain the implementation
- AI was used as a learning and productivity tool, not to generate code without understanding
- The final implementation reflects the developer's understanding and engineering decisions

### AI Service Implementation

The AI service (`ai-service/`) can operate in two modes:

1. **Mock Mode** (default): Returns predefined responses for testing
2. **OpenAI Mode**: Uses OpenAI API for real AI-generated responses (requires API key)

The backend gracefully falls back to mock responses if the AI service is unavailable.

## 📚 Design Document

For detailed design decisions, see [docs/DESIGN.md](./docs/DESIGN.md), which covers:

- Database schema design and indexing
- Authentication and security architecture
- AI service architecture
- Scaling considerations and trade-offs

## 🚢 Deployment

### Backend Deployment

Recommended platforms: **Render**, **Railway**, or **Fly.io**

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`
5. Ensure `DATABASE_URL` points to your hosted PostgreSQL

### Frontend Deployment

Recommended platform: **Vercel** or **Netlify**

1. Connect your GitHub repository
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/dist`
4. Set environment variable: `VITE_API_BASE_URL` (your backend URL)

### Database

Recommended: **Neon**, **Supabase**, or **Railway PostgreSQL**

1. Create a new PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy` (in production)

### AI Service (Optional)

Can be deployed to:
- **Render** (Python service)
- **Railway** (Python service)
- **Fly.io** (Python service)
- Or keep it as an optional local service

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] JWT token persistence (refresh page, still logged in)
- [ ] Create, read, update, delete patients
- [ ] Patient list pagination
- [ ] Send chat message and receive AI response
- [ ] Chat history persistence
- [ ] Protected routes redirect to login when not authenticated

## 📝 License

This project was created as part of a technical assessment for TeraLeads.

## 👤 Author

[Your Name]

---

**Note**: This project was built as a take-home assessment. All code, architecture decisions, and documentation reflect the developer's understanding and implementation choices.
