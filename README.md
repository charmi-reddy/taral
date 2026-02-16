# ✨ Taral

**Taral** is a modern web application built with Next.js, designed to be clean, fast, and thoughtfully structured. It focuses on simplicity in architecture while leaving room for scalability and experimentation.

At its core, Taral is not just a project — it is a foundation. A starting point for building polished, production-ready interfaces using a modern frontend stack.

---

## 🚀 Tech Stack

Taral is built using a contemporary, developer-friendly toolkit:

- **Next.js (App Router)** — Full-stack React framework  
- **TypeScript** — Type safety and maintainability  
- **Tailwind CSS** — Utility-first styling  
- **Vitest** — Fast, modern testing framework  
- **Google Gemini API** — LLM-powered personality quote generation
- Modular architecture with reusable components and hooks  

---

## 🎨 Features

### Doodle Personality Analyzer
Taral includes a fun personality analyzer that generates casual, friendly quotes about your drawing style. The analyzer:

- Examines stroke speed, smoothness, color diversity, brush variety, and more
- Uses LLM (Google Gemini) to generate fresh, personalized quotes
- Falls back to 200+ local quotes if LLM is unavailable
- Shows one unique quote per doodle with a sparkle button

### Setup for LLM Integration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Gemini API key to `.env.local`:
   ```
   GEMINI_API_KEY=your-actual-key-here
   ```

3. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Restart your development server to load the new environment variables

The app will automatically try to use the LLM first, then fall back to local quotes if the API is unavailable or not configured.
