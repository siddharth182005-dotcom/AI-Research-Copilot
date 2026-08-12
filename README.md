# AI Research Copilot

A RAG-Based Research Paper Intelligence Platform built with Node.js, React, PostgreSQL/pgvector, and Gemini AI.

## Getting Started (Phase 0)

This repository contains the initial scaffold for the AI Research Copilot.

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development outside of Docker)
- A Gemini API Key

### Setup
1. Clone this repository.
2. Create a `.env` file in the root directory based on `.env.example`.
3. Add your `GEMINI_API_KEY` to the `.env` file.
4. Run `docker-compose up --build -d` to start the PostgreSQL database, Backend API, and Frontend application.

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

### Roadmap
This project is being built in phases:
- **Phase 0:** Project setup, Docker Compose, frontend/backend stubs. (Current)
- **Phase 1:** PDF Ingestion Pipeline (text extraction, chunking, embedding generation).
- **Phase 2:** Vector Search & RAG Chat.
- **Phase 3:** Frontend UI (Upload, Chat, Papers list).
- **Phase 4:** Database schema & DevOps polish.
- **Phase 5 & 6:** Advanced features (Literature Review, Gap Detection, Clustering).
