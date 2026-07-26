# Purplexity AI

Purplexity AI is a full-stack clone of the Perplexity AI chat interface. It allows users to ask questions, chat with multiple advanced AI models (Mistral, Gemini, Grok), and features a sleek, responsive UI.

## Features

- **Multi-Model Support**: Switch between top-tier AI models seamlessly:
  - Mistral Medium
  - Google Gemini Pro/Flash
  - Grok (via Groq API `llama-3.3-70b-versatile`)
- **Authentication**: JWT-based login and registration.
- **Chat Management**: Create new threads, delete old threads, and view chat history.
- **Responsive UI**: A beautifully crafted frontend built with React, Vite, and Tailwind CSS.
- **Focus Modes**: Quick options for Web Search, Quick Answer, Academic, and Code.

## Tech Stack

### Frontend
- React.js
- Vite
- Redux Toolkit
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yeulsanket/Purplexity-Ai.git
cd Purplexity-Ai
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with the following keys:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MISTRAL_API_KEY=your_mistral_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:
```bash
cd Frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

### 4. Usage

- Visit `http://localhost:5173` in your browser.
- Create an account or use the seed user.
- Start chatting!

## Acknowledgements

Built for educational purposes and inspired by Perplexity AI.
