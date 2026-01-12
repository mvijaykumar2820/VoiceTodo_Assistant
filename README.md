# Voice Todo Assistant

A modern, voice-controlled todo list application with a stunning animated UI. Built with vanilla JavaScript and powered by AI for natural language processing.

![Voice Todo Assistant](https://img.shields.io/badge/Status-Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

-  **Voice Commands**: Add, complete, and remove todos using natural speech
-  **Beautiful Animations**: Stunning 3D animated microphone button with gradient effects
-  **AI-Powered**: Uses GROQ API for intelligent command parsing
-  **Local Storage**: Your todos persist across sessions
-  **Dark Theme**: Easy on the eyes with a sleek black design
-  **Responsive**: Works on desktop and mobile devices

##  Voice Commands

- **Add todos**: "Add buy groceries to my list"
- **Complete todos**: "Mark buy groceries as done"
- **Remove todos**: "Delete buy groceries"
- **List todos**: "What's on my list?"

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **AI**: GROQ API (Llama 3.3 70B)
- **Speech**: Web Speech API
- **Deployment**: Vercel

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/voice-todo-assistant.git
cd voice-todo-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your GROQ API key to `.env`:
```
GROQ_API_KEY=your_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com)

5. Start the server:
```bash
node server.js
```

6. Open http://localhost:3000 in your browser

## UI Features

- **Animated Microphone Button**: Expands into a beautiful orb with rotating gradients when listening
- **3D Ring Effects**: Dynamic rotating rings with colorful gradients
- **Wave Animations**: Pulsing wave effects during voice input
- **Glass Morphism**: Modern frosted glass effects
- **Smooth Transitions**: Buttery smooth CSS animations

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Add `GROQ_API_KEY` environment variable
4. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | GROQ API key for AI processing | Yes |
| `OPENAI_API_KEY` | Alternative to GROQ (optional) | No |

## 📝 Rate Limiting

20 requests per 15 minutes per IP address to prevent API abuse.

## 📄 License

MIT License - feel free to use this project for learning or personal use.

---

Star this repo if you found it helpful!
