# 🔬 AI Research Copilot
### Turn research papers into answers you can explore.

**AI Research Copilot** is a full-stack project exploring how Retrieval-Augmented Generation (RAG) can make academic research easier to navigate. The goal is to help users ask questions about research papers and receive answers grounded in relevant paper content.

Built with **React, Node.js, PostgreSQL + pgvector, Docker Compose, and Google's Gemini API**, the project is being developed in phases. This README distinguishes the current project scaffold from features that still need implementation and end-to-end verification.

> **Project status:** Initial scaffold / phased development  
> PDF ingestion, embeddings, vector retrieval, grounded responses, and evaluation should be treated as planned until they are implemented and tested in the running application.

---

## ✨ The Vision

Research papers can be long, technical, and difficult to search. AI Research Copilot aims to create a more direct way to explore them:

- **Ask questions in natural language** instead of searching manually through every page.
- **Retrieve relevant passages** to give the language model useful context.
- **Generate context-grounded answers** with traceable source passages where supported.
- **Build on a modular full-stack foundation** that can evolve as features are implemented.

The workflow below describes the intended experience—not a claim that every step is already available.

## 🔄 Planned RAG Workflow

```text
Research PDF
    ↓
Text Extraction & Chunking
    ↓
Embedding Generation
    ↓
PostgreSQL + pgvector
    ↓
Semantic Retrieval
    ↓
Retrieved Context + User Question
    ↓
Gemini API
    ↓
Grounded Answer + Relevant Sources
```

## 🧰 Technology Stack

| Area | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js |
| Database / vector search | PostgreSQL, pgvector |
| LLM integration | Google Gemini API |
| Local development | Docker, Docker Compose |
| Version control | Git, GitHub |

*The stack identifies the technologies used or planned in the project scaffold; it does not imply that every integration is complete.*

## 🗂️ Repository Structure

```text
AI-Research-Copilot/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

This is the repository scaffold. Files and implementation details may evolve during development.

## 🚀 Getting Started

### Prerequisites

Install the following before starting:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- A Google Gemini API key, if the current configuration requires it

### 1. Clone the repository

```bash
git clone https://github.com/siddharth182005-dotcom/AI-Research-Copilot.git
cd AI-Research-Copilot
```

### 2. Configure environment variables

Check `docker-compose.yml` and the backend configuration for the exact variables required by the current code. If the project uses a root `.env` file, create it locally and add the required values, for example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-a-local-password
POSTGRES_DB=ai_copilot
GEMINI_API_KEY=your_gemini_api_key
```

Use the variable names expected by the repository. **Do not commit `.env` files, API keys, or real passwords to GitHub.** If an `.env.example` file is available, use it as the template.

### 3. Build and start the services

```bash
docker compose up --build
```

If the services start successfully, check the ports and URLs defined in `docker-compose.yml`. The expected local addresses in the current setup may be:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

These addresses depend on the actual Compose configuration. A running container does not by itself confirm that the complete RAG workflow works.

### 4. Stop the services

```bash
docker compose down
```

To remove database volumes as well, inspect the Compose configuration first: removing volumes can permanently delete local database data.

## 🧭 Development Roadmap

| Phase | Goal | Status |
|---|---|---|
| 0 | Establish repository and service scaffold | Initial scaffold |
| 1 | Upload PDFs, extract text, chunk documents, and generate embeddings | Planned / verify implementation |
| 2 | Store embeddings and metadata; retrieve relevant chunks with vector similarity | Planned / verify implementation |
| 3 | Connect retrieved context to Gemini and return grounded answers | Planned / verify implementation |
| 4 | Build the upload and chat experience in the frontend | Planned / verify implementation |
| 5 | Evaluate retrieval quality, answer grounding, and latency | Planned / verify implementation |

Update each status only after the corresponding feature has been implemented and tested.

## 🧪 Testing & Evaluation

Once the RAG pipeline is implemented, useful evaluation measures include:

- **Precision@K:** How many of the top retrieved passages are relevant?
- **Recall@K:** How many of the relevant passages are retrieved?
- **Answer grounding:** Does the answer stay supported by the retrieved content?
- **Source relevance:** Do the cited passages actually support the response?
- **Query latency:** How long does retrieval and answer generation take?

These are proposed evaluation criteria; results should be added only after experiments have been run.

## 🔐 Security & Configuration

- Keep API keys and credentials in environment variables.
- Keep `.env` and other secret-bearing files out of version control.
- Use a unique local database password rather than a shared or production password.
- Validate uploaded files and enforce sensible file-size limits when PDF upload is implemented.
- Avoid logging secrets or sensitive document content.
- Review database exposure and service ports before deploying beyond a local environment.

## 🛠️ Troubleshooting

**Docker command fails**
- Confirm Docker Desktop is running.
- Run `docker compose config` to validate the Compose configuration.
- Review service logs with `docker compose logs`.

**A service does not start**
- Check for port conflicts and inspect the relevant container logs.
- Confirm required environment variables are set.

**Gemini requests fail**
- Verify that the API key is valid and available to the backend.
- Check the backend's expected environment-variable name and the API's current quota or access settings.

**The application opens but RAG answers do not work**
- The initial scaffold may not yet include the complete ingestion and retrieval pipeline. Check the roadmap and verify each component before treating it as implemented.

## 🤝 Contributing

Contributions and thoughtful suggestions are welcome.

1. Fork the repository.
2. Create a focused branch: `git checkout -b feature/your-feature`.
3. Make and test your changes.
4. Commit with a clear message.
5. Open a pull request describing the change and how it was tested.

## 📌 Current Limitations

AI Research Copilot is under active phased development. The repository scaffold and technology choices are not proof of a complete, production-ready RAG system. Confirm each feature in code and test it end to end before describing it as completed.

## 📄 License

No license is specified here. Add a `LICENSE` file and update this section before inviting reuse under a particular license.

---

<div align="center">

**AI Research Copilot**  
*Making research easier to explore—one question at a time.*

</div>
