# Design Document

## Table of Contents

1. [Database Schema Design & Indexing](#database-schema-design--indexing)
2. [Authentication & Security Design](#authentication--security-design)
3. [AI Service Architecture](#ai-service-architecture)
4. [Scaling Considerations & Trade-offs](#scaling-considerations--trade-offs)

---

## Database Schema Design & Indexing

### Schema Overview

The database consists of three main entities: `User`, `Patient`, and `ChatMessage`.

#### User Model

```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  patients     Patient[]
}
```

**Design Decisions:**
- **`id`**: Auto-incrementing integer primary key. Simple and efficient for this use case.
- **`email`**: Unique constraint ensures one account per email. Used as the login identifier.
- **`passwordHash`**: Stores bcrypt-hashed passwords. Never store plaintext passwords.
- **`createdAt` / `updatedAt`**: Automatic timestamps for audit trails.
- **`patients`**: One-to-many relationship (one user can create many patients).

**Indexing:**
- **Primary key on `id`**: Automatically indexed by PostgreSQL.
- **Unique index on `email`**: Automatically created by `@unique`. Critical for fast login lookups.

#### Patient Model

```prisma
model Patient {
  id           Int           @id @default(autoincrement())
  name         String
  email        String?
  phone        String?
  dob          DateTime?
  medicalNotes String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  createdById  Int?
  messages     ChatMessage[]
  createdBy    User?         @relation(fields: [createdById], references: [id])
}
```

**Design Decisions:**
- **`id`**: Primary key for patient identification.
- **`name`**: Required field (non-nullable) - every patient must have a name.
- **`email`, `phone`, `dob`, `medicalNotes`**: Optional fields (nullable) - flexibility for incomplete data.
- **`createdById`**: Optional foreign key to track which user created the patient. Useful for multi-user scenarios.
- **`messages`**: One-to-many relationship (one patient has many chat messages).

**Indexing:**
- **Primary key on `id`**: Automatically indexed.
- **Foreign key on `createdById`**: Indexed by PostgreSQL for join performance.
- **No additional indexes**: For this MVP, patient lookups are primarily by ID. If we needed to search by name/email frequently, we'd add indexes there.

#### ChatMessage Model

```prisma
model ChatMessage {
  id        Int      @id @default(autoincrement())
  patientId Int
  sender    Sender
  content   String
  createdAt DateTime @default(now())
  patient   Patient  @relation(fields: [patientId], references: [id])

  @@index([patientId, createdAt])
}

enum Sender {
  USER
  AI
}
```

**Design Decisions:**
- **`id`**: Primary key for message identification.
- **`patientId`**: Foreign key linking message to patient.
- **`sender`**: Enum (`USER` or `AI`) - type-safe way to distinguish message origin.
- **`content`**: Text content of the message. Using `String` (TEXT in PostgreSQL) to support long messages.
- **`createdAt`**: Timestamp for chronological ordering.

**Indexing:**
- **Composite index `@@index([patientId, createdAt])`**: 
  - **Why this index?** The most common query pattern is: "Get all messages for a patient, ordered by time."
  - **How it helps**: PostgreSQL can use this index to:
    1. Quickly filter by `patientId` (leftmost column)
    2. Then retrieve rows already sorted by `createdAt` (rightmost column)
  - **Performance impact**: Without this index, fetching chat history would require a full table scan + sort. With it, the query is O(log n) + sequential read.

### Indexing Strategy Summary

| Index | Type | Purpose | Query Pattern |
|-------|------|---------|---------------|
| `User.id` | Primary Key | Fast user lookups | `WHERE id = ?` |
| `User.email` | Unique | Fast login lookups | `WHERE email = ?` |
| `Patient.id` | Primary Key | Fast patient lookups | `WHERE id = ?` |
| `ChatMessage.patientId, createdAt` | Composite | Fast chat history retrieval | `WHERE patientId = ? ORDER BY createdAt` |

### Future Indexing Considerations

If the application scales, consider:

1. **Full-text search on `Patient.name`**: If users need to search patients by name frequently.
2. **Index on `Patient.createdAt`**: If sorting/filtering patients by creation date becomes common.
3. **Partial index on `ChatMessage`**: If we need to query only recent messages (e.g., last 30 days).

---

## Authentication & Security Design

### JWT-Based Authentication

**Why JWT?**
- **Stateless**: No server-side session storage required. Each request is self-contained.
- **Scalable**: Works well with horizontal scaling (multiple backend instances).
- **Simple**: Token contains user info, reducing database lookups.

**Token Structure:**
```typescript
{
  userId: number,
  email: string,
  iat: number,  // Issued at
  exp: number   // Expiration (7 days)
}
```

**Security Measures:**

1. **Password Hashing**
   - **Algorithm**: bcrypt with 10 salt rounds
   - **Why bcrypt?**: Designed to be slow (resistant to brute force), includes salt automatically
   - **Storage**: Only hashed passwords stored in database, never plaintext

2. **JWT Secret**
   - **Storage**: Environment variable (`JWT_SECRET`)
   - **Production**: Must be a strong, random string (not committed to git)
   - **Expiration**: 7 days (balance between security and UX)

3. **Token Transmission**
   - **Method**: `Authorization: Bearer <token>` header
   - **Why not cookies?**: Simpler for SPA, no CSRF concerns (though cookies with `httpOnly` + `sameSite` are also secure)

4. **Route Protection**
   - **Middleware**: `authMiddleware` verifies JWT on protected routes
   - **Protected routes**: All `/api/patients/*` and `/api/chat/*` endpoints
   - **Public routes**: `/api/auth/*` (register/login)

### Frontend Security

1. **Token Storage**
   - **Location**: `localStorage`
   - **Trade-off**: Accessible to JavaScript (XSS risk), but simpler than httpOnly cookies
   - **Mitigation**: Sanitize user input, use React's built-in XSS protection

2. **Automatic Token Injection**
   - API client automatically adds `Authorization` header if token exists
   - No manual header management in components

3. **Protected Routes**
   - React Router checks for token before rendering protected pages
   - Redirects to `/login` if no token

### Security Considerations & Trade-offs

| Aspect | Current Approach | Trade-off |
|-------|------------------|-----------|
| Token Storage | localStorage | Simpler, but vulnerable to XSS. httpOnly cookies would be more secure but require CORS configuration. |
| Token Expiration | 7 days | Longer = better UX, shorter = better security. Could add refresh tokens for better balance. |
| Password Hashing | bcrypt (10 rounds) | Good balance. Could increase rounds for more security (slower hashing). |
| CORS | Allow all origins in dev | Production should restrict to frontend domain only. |

### Future Security Enhancements

1. **Refresh Tokens**: Short-lived access tokens + long-lived refresh tokens
2. **Rate Limiting**: Prevent brute force attacks on login endpoint
3. **HTTPS Only**: Enforce HTTPS in production (no HTTP)
4. **Input Validation**: Add more robust validation (e.g., email format, password strength)
5. **Audit Logging**: Log authentication events for security monitoring

---

## AI Service Architecture

### Microservice Design

**Why Separate Service?**
- **Language Flexibility**: Python ecosystem is better for AI/ML
- **Independent Scaling**: Scale AI service separately from backend
- **Isolation**: AI service failures don't crash the main backend
- **Technology Choice**: Can swap AI providers/models without touching backend

### Architecture Flow

```
User sends message
    ↓
Frontend → Backend (POST /api/chat)
    ↓
Backend stores user message in DB
    ↓
Backend calls AI Service (POST /generate)
    ↓
AI Service generates response
    ↓
Backend stores AI response in DB
    ↓
Backend returns both messages to Frontend
```

### AI Service Implementation

**Framework**: FastAPI (Python)
- **Why FastAPI?**: Modern, fast, automatic API documentation, type hints

**Endpoints:**
- `GET /health`: Health check for monitoring
- `POST /generate`: Generate AI response
  - Input: `{ message: string, patientContext?: object }`
  - Output: `{ response: string }`

**Two Modes of Operation:**

1. **Mock Mode** (Default)
   - Returns predefined responses
   - No external API calls
   - Useful for development/testing
   - No cost

2. **OpenAI Mode** (Optional)
   - Requires `OPENAI_API_KEY` environment variable
   - Calls OpenAI API (e.g., GPT-3.5-turbo)
   - Real AI-generated responses
   - Cost per API call

**Fallback Strategy:**
- If AI service is unavailable → Backend falls back to mock response
- If OpenAI API fails → AI service falls back to mock response
- **Result**: System always responds, even if AI is down

### Error Handling

```typescript
// Backend chat service
try {
  const aiResponse = await callAiService(message, context);
} catch (err) {
  // Fallback to mock
  return mockResponse(message);
}
```

**Why this approach?**
- **Resilience**: Chat functionality never breaks due to AI service issues
- **User Experience**: Users always get a response (even if it's a mock)
- **Debugging**: Errors are logged but don't crash the system

### Configuration

**Environment Variables:**
- `OPENAI_API_KEY`: Optional, enables real AI
- `OPENAI_MODEL`: Model to use (default: `gpt-3.5-turbo`)
- `PORT`: Service port (default: 8000)

**Prompt Engineering:**
- System prompt: "You are a helpful dental assistant..."
- User prompt: Includes patient question + optional context (name)
- Temperature: 0.7 (balanced creativity/consistency)

### Future AI Enhancements

1. **Multiple AI Providers**: Support OpenAI, Anthropic, local LLMs
2. **Context Window**: Include more patient history in prompts
3. **Streaming Responses**: Stream AI responses for better UX
4. **Fine-tuning**: Train model on dental-specific data
5. **Caching**: Cache common responses to reduce API costs

---

## Scaling Considerations & Trade-offs

### Current Architecture (MVP)

**Single-instance, monolithic backend:**
- One Express server
- One PostgreSQL database
- One AI service (optional)

**Limitations:**
- Single point of failure
- Limited horizontal scaling
- Database becomes bottleneck at high load

### Scaling Strategy

#### 1. Database Scaling

**Current**: Single PostgreSQL instance

**Options:**

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Vertical Scaling** | Simple, no code changes | Hardware limits, expensive | Small to medium scale |
| **Read Replicas** | Distribute read load | Write still single point | Read-heavy workloads |
| **Sharding** | Horizontal scaling | Complex, data migration | Very large scale |
| **Connection Pooling** | Better resource usage | Still single DB | Always recommended |

**Recommendation for this app:**
1. **Start**: Connection pooling (PgBouncer or Prisma's built-in pooling)
2. **Scale**: Add read replicas for patient list queries
3. **Future**: Consider sharding if patient data grows to millions

#### 2. Backend Scaling

**Current**: Single Express server

**Horizontal Scaling Approach:**
```
Load Balancer
    ↓
[Backend 1] [Backend 2] [Backend 3]
    ↓           ↓           ↓
    └───────────┴───────────┘
            Database
```

**Requirements:**
- **Stateless Backend**: ✅ Already stateless (JWT, no sessions)
- **Shared Database**: ✅ All instances connect to same PostgreSQL
- **Load Balancer**: Required (e.g., AWS ALB, Nginx, Cloudflare)

**Scaling Considerations:**
- **Database Connections**: Each backend instance needs DB connection pool
  - **Limit**: Total connections = instances × pool size
  - **Solution**: Use connection pooling service (PgBouncer)
- **File Uploads**: If added, use object storage (S3) instead of local filesystem

#### 3. Frontend Scaling

**Current**: Static React SPA

**Scaling Approach:**
- **CDN**: Deploy to Vercel/Netlify (automatic CDN)
- **Caching**: Static assets cached by CDN
- **No Backend Scaling Needed**: Frontend is just static files

**Considerations:**
- **API Rate Limiting**: If frontend makes many requests, consider caching or request batching
- **Real-time Updates**: If needed, add WebSockets or Server-Sent Events (requires backend changes)

#### 4. AI Service Scaling

**Current**: Single Python service

**Scaling Approach:**
- **Stateless**: ✅ No state stored in service
- **Horizontal Scaling**: Deploy multiple instances behind load balancer
- **Async Processing**: For expensive AI calls, consider:
  - **Queue System**: RabbitMQ, Redis Queue
  - **Background Workers**: Process AI requests asynchronously
  - **Webhook Callbacks**: Notify backend when AI response is ready

**Trade-offs:**

| Approach | Latency | Complexity | Cost |
|----------|---------|------------|------|
| **Synchronous** (current) | Low | Simple | Higher (blocking) |
| **Async Queue** | Higher | Complex | Lower (non-blocking) |

**Recommendation**: Start synchronous, move to async if AI calls become slow/expensive.

### Caching Strategy

**Current**: No caching

**Where to Add Caching:**

1. **Patient List** (Redis)
   - Cache paginated patient lists
   - Invalidate on create/update/delete
   - **Benefit**: Reduce database load for frequent list queries

2. **Chat History** (Redis)
   - Cache recent chat messages per patient
   - **Benefit**: Fast retrieval of chat history

3. **AI Responses** (Optional)
   - Cache common AI responses
   - **Benefit**: Reduce API costs, faster responses
   - **Trade-off**: May return stale responses

**Implementation:**
```typescript
// Example: Cache patient list
const cacheKey = `patients:page:${page}:limit:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const patients = await fetchFromDB();
await redis.setex(cacheKey, 60, JSON.stringify(patients)); // 60s TTL
```

### Database Optimization

**Current Indexes**: Minimal (as designed)

**Future Optimizations:**

1. **Query Optimization**
   - Use `EXPLAIN ANALYZE` to identify slow queries
   - Add indexes based on actual query patterns
   - Consider materialized views for complex aggregations

2. **Connection Pooling**
   - Use Prisma's connection pooling or PgBouncer
   - **Recommended**: 10-20 connections per instance

3. **Partitioning** (Future)
   - Partition `ChatMessage` table by date if it grows large
   - **Benefit**: Faster queries on recent messages

### Monitoring & Observability

**What to Monitor:**

1. **Application Metrics**
   - Request rate, latency, error rate
   - **Tools**: Prometheus, Datadog, New Relic

2. **Database Metrics**
   - Query performance, connection pool usage
   - **Tools**: PostgreSQL's `pg_stat_statements`, Prisma metrics

3. **AI Service Metrics**
   - Response time, API costs, error rate
   - **Tools**: Custom logging + monitoring

4. **User Experience**
   - Frontend error tracking (Sentry)
   - Real User Monitoring (RUM)

### Cost Considerations

**Current Costs (MVP):**
- Database: Free tier (Neon/Supabase) or ~$10-20/month
- Backend: Free tier (Render/Railway) or ~$7-25/month
- Frontend: Free (Vercel/Netlify)
- AI Service: Free (mock) or ~$0.002 per request (OpenAI)

**Scaling Costs:**
- **Database**: $20-100/month (managed PostgreSQL)
- **Backend**: $25-100/month (multiple instances)
- **AI Service**: Variable based on usage (could be $50-500/month)

**Cost Optimization:**
- Use connection pooling to reduce database instances
- Cache AI responses to reduce API calls
- Use read replicas instead of scaling primary database
- Monitor and optimize slow queries

### Trade-offs Summary

| Decision | Pros | Cons | Alternative |
|----------|------|------|-------------|
| **JWT (stateless)** | Scalable, simple | Harder to revoke | Session-based (requires Redis) |
| **PostgreSQL** | ACID, reliable | Vertical scaling limits | NoSQL (MongoDB) - faster but less reliable |
| **Separate AI Service** | Flexible, isolated | More complexity | In-process AI (simpler but less flexible) |
| **localStorage for tokens** | Simple | XSS risk | httpOnly cookies (more secure, more complex) |
| **Synchronous AI calls** | Low latency | Blocks requests | Async queue (non-blocking but more complex) |

---

## Conclusion

This architecture is designed for:

1. **MVP/Assessment**: Simple, functional, demonstrates full-stack skills
2. **Small to Medium Scale**: Can handle hundreds of concurrent users
3. **Easy Deployment**: Minimal infrastructure requirements
4. **Future Growth**: Clear path to scale horizontally when needed

**Key Strengths:**
- Clean separation of concerns
- Type-safe codebase (TypeScript)
- Database schema optimized for common queries
- Resilient AI integration (fallbacks)

**Areas for Future Enhancement:**
- Add caching layer (Redis)
- Implement refresh tokens
- Add rate limiting
- Move to async AI processing
- Add comprehensive monitoring

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Author**: [Your Name]
