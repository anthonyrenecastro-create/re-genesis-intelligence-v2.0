<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Re-Genesis Intelligence

🎉 **Now 100% Free and Open Source!** 

This AI interface now uses **Ollama** by default - a completely free, open-source AI engine that runs locally on your machine. No API keys, no subscriptions, no data leaving your computer!

View your app in AI Studio: https://ai.studio/apps/drive/1C84Dnsj0zRehcCSDVGgUUc11yrXfowvM

> **⚡ Quick Setup Guide:** See [QUICKSTART.md](QUICKSTART.md) or run `./setup.sh` (Linux/macOS)

## Quick Start (Recommended - Free!)

**Prerequisites:** Node.js and Ollama

1. **Install Ollama** (if not already installed)
   ```bash
   # Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows: Download from https://ollama.ai/download
   ```

2. **Pull a model** (choose one)
   ```bash
   ollama pull llama3      # Recommended: 4.7GB
   ollama pull mistral     # Alternative: 4.1GB
   ollama pull phi3        # Lightweight: 2.3GB
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

That's it! No API keys needed. 🚀

## What Changed?

- ✅ **Removed Gemini API dependency** - No more API keys required
- ✅ **Ollama is now the default engine** - 100% free and runs locally
- ✅ **Privacy first** - Your data never leaves your machine
- ✅ **No rate limits** - Use as much as you want

## Advanced Setup

### Supported AI Engines

The app utilizes a streamlined dual-engine cognitive architecture:

- **Gemini** (Primary / Default) - Google AI Studio (`gemini-3.8-flash` & `gemini-3.1-flash-lite-image`): Multimodal file processing (PDF, images, spreadsheets), real-time Google Search grounding, image manifestation, and high-speed chat.
- **DeepSeek** - DeepSeek API (`deepseek-reasoner` / R1 & `deepseek-chat`): Deep chain-of-thought reasoning trace, mathematics, and code synthesis.
- **Ollama** (Optional / Offline) - Free, local open-source node running at `http://localhost:11434`.

**Two ways to add API keys:**

#### Option 1: Environment Variables (Recommended for configuration/deployment)
```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env and add your keys
# VITE_GEMINI_API_KEY=your-key-here
# VITE_DEEPSEEK_API_KEY=your-key-here
# etc.

# 3. Restart the dev server
npm run dev
```

#### Option 2: Settings Panel (User-friendly)
1. Click the gear icon (Settings)
2. Scroll to "Neural Keys" section
3. Enter your API keys
4. Keys are saved in browser localStorage

### Customization

Want to use a different Ollama model? Edit `services/modelGate.ts` line ~165 and change `'llama3'` to your preferred model.

## Documentation

- [Ollama Setup Guide](OLLAMA_SETUP.md) - Detailed setup and troubleshooting
- [Available Models](https://ollama.ai/library) - Browse all Ollama models

## Troubleshooting

## Core AI Engine

The application is solely powered by **Google Gemini** (via `@google/genai`):
- **Gemini 3.8 Flash**: High-speed conversational intelligence, deep reasoning, code generation, and long-context processing.
- **Google Search Grounding**: Built-in real-time web fact checking and live world awareness.
- **Gemini 3.8 Flash Lite TTS**: High-fidelity neural voice synthesis (`gemini-3.8-flash-lite-tts`).
- **Gemini Vision & Multimodal**: Native comprehension of images, PDFs, spreadsheets, and technical documents.
- **Gemini Avatar Generation**: Dynamic avatar synthesis with `gemini-3.1-flash-lite-image`.

## Features

- 🧠 Solely powered by Google Gemini (Gemini 3.8 Flash, Google Search Grounding, Gemini TTS, Vision)
- 🎨 Floating cybernetic neural avatar with live reactive physics
- 💬 Advanced multimodal chat with document analysis (PDF, DOCX, XLSX)
- 🌐 Holographic substrate mesh with Google Search Grounded intelligence
- 📊 Real-time telemetry, neural bond metrics, and simulation syntropy
- 🔊 High-fidelity Gemini neural speech synthesis with Web Speech API fallback

## Troubleshooting

**Ollama not responding?**
```bash
# Check if running
ollama serve

# Verify installation
curl http://localhost:11434/api/tags
```

**Model not found?**
```bash
ollama list        # List installed models
ollama pull llama3 # Download a model
```

For more help, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md)

## License

This project is open source and available for free use.
