# TeraLeads AI Service

Python microservice for generating AI responses to patient messages.

## Setup

1. Create virtual environment:h
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate2. Install dependencies:
pip install -r requirements.txt
3. Copy `.env.example` to `.env` and configure:
cp .env.example .env4. (Optional) Add `OPENAI_API_KEY` to `.env` for real AI responses

## Running

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
Or use the convenience script:
./run.sh## Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate AI response
  - Body: `{ "message": "...", "patientContext": {...} }`
  - Returns: `{ "response": "..." }`

## Configuration

- `PORT` - Service port (default: 8000)
- `OPENAI_API_KEY` - OpenAI API key (optional, falls back to mock if not set)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-3.5-turbo)
