# Elelem - AI Explainer Application

![Elelem Logo](frontend/elelem/public/elelem-logo.svg)

## 🚀 Live Demo

Try the live version of Elelem at: [https://elelem-umber.vercel.app](https://elelem-umber.vercel.app)

Elelem is a responsive web application that helps users understand complex topics through layered explanations from an AI assistant.

## Features

- **Responsive Chat Interface**: Works on all device sizes
- **Layered Explanations**: Get explanations at different knowledge levels
- **Conversation History**: View and continue past conversations
- **Real-time Streaming**: See responses as they're generated
- **Modern UI**: Clean, intuitive interface with TailwindCSS

## Tech Stack

**Frontend**:

- Next.js 15
- TypeScript
- TailwindCSS
- React Context API

**Backend**:

- FastAPI
- Google Gemini LLM (via LangChain)
- JWT Authentication

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google Gemini API Key

### Frontend Setup

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run development server:

```bash
npm run dev
```

### Backend Setup

1. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Create `.env` file:

```
LLM_API_KEY=your-gemini-api-key
LLM_MODEL=gemini-model
SECRET_KEY=your-secret-key
```

3. Run FastAPI server:

```bash
uvicorn app.main:app --reload
```

## Deployment

**Frontend**: Deploy to Vercel

1. Connect your GitHub repository
2. Set environment variables
3. Deploy!

**Backend**: Deploy to Railway

1. Connect your repository
2. Set environment variables
3. Deploy Python service

## Prompt Documentation

The AI uses carefully engineered prompts to generate explanations:

1. **Title Generation**: Creates concise conversation titles
2. **Core Explanation**: Provides layered explanations at different knowledge levels

See [PROMPTS.md](PROMPTS.md) for detailed prompt documentation.

## License

MIT
