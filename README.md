AI Research Copilot
A full-stack project for exploring how Retrieval-Augmented Generation (RAG) can help users ask questions about academic research papers. The project is being developed in phases using React, Node.js, PostgreSQL with pgvector, Docker Compose, and Google's Gemini API.
Project status: Initial scaffold / phased development. Features listed under the roadmap are planned until they are implemented, tested, and moved to the completed section below. This README intentionally distinguishes configured infrastructure from verified RAG functionality.

Overview
AI Research Copilot aims to let users work with research papers and ask questions grounded in their contents. The planned workflow is:
1. Upload a research paper in PDF format.
2. Extract its text and split it into manageable chunks.
3. Generate an embedding for each chunk.
4. Store chunks, metadata, and embeddings in PostgreSQL with pgvector.
5. Embed a user's question and retrieve relevant chunks using vector similarity.
6. Send the question and retrieved context to Gemini to generate a grounded answer.
7. Show the answer and, where implemented, the source passages used to produce it.
Technology Stack
- Frontend: React, Vite
- Backend: Node.js
- Database / vector search: PostgreSQL, pgvector
- LLM integration: Google Gemini API (planned until verified end-to-end)
- Local development: Docker, Docker Compose
Repository Structure
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
The structure above describes the repository scaffold. The exact files and capabilities inside src/ may change as development progresses.
Prerequisites
- Git
- Docker Desktop with Docker Compose
- Node.js (if running services outside Docker)
- A Google Gemini API key for the planned LLM integration
Setup
1. Clone the repository:
   git clone https://github.com/siddharth182005-dotcom/AI-Research-Copilot.git
   cd AI-Research-Copilot
2. Create a .env file in the project root. Use .env.example if one is present; otherwise add the variables expected by docker-compose.yml:
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=change-this-local-password
   POSTGRES_DB=ai_copilot
   GEMINI_API_KEY=your_gemini_api_key
3. Start the services:
   docker compose up --build
4. When the containers start successfully, open:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - PostgreSQL: localhost:5432 (database connection only; not a web page)
5. Stop the services:
   docker compose down
   To also delete the local database volume and its data, use docker compose down -v. This permanently removes the data stored in that local volume.
Security note: Do not commit .env, API keys, database passwords, or other secrets. Use a strong local password and keep .env excluded from version control.

Development Roadmap
The items below are a plan, not a claim that every feature is already implemented.
Phase 0 — Project scaffold
- [x] React/Vite frontend scaffold
- [x] Node.js backend scaffold
- [x] Docker Compose configuration for frontend, backend, and PostgreSQL/pgvector
- [ ] Verify clean startup from a fresh clone and document any required environment variables
Phase 1 — PDF ingestion
- [ ] Accept PDF uploads with file-type and size validation
- [ ] Extract text from uploaded PDFs
- [ ] Split extracted text into chunks with configurable chunk size and overlap
- [ ] Store paper metadata and chunk metadata
- [ ] Generate embeddings using a documented embedding model/API
- [ ] Add ingestion error handling and tests
Phase 2 — Vector retrieval and RAG
- [ ] Store embeddings in pgvector with an appropriate vector column and index
- [ ] Embed user questions using the same embedding model
- [ ] Retrieve the top-k most relevant chunks using a documented similarity metric
- [ ] Build the prompt from the question and retrieved context
- [ ] Integrate Gemini for context-grounded answers
- [ ] Handle questions with insufficient evidence and avoid unsupported answers
- [ ] Return source-paper/chunk references when available
Phase 3 — Frontend workflow
- [ ] PDF upload UI with progress and error states
- [ ] List and manage ingested papers
- [ ] Chat interface for asking questions about papers
- [ ] Display answer sources/citations when returned by the backend
- [ ] Add loading, empty, and failure states
Phase 4 — Reliability and deployment
- [ ] Add automated tests for ingestion, retrieval, and API endpoints
- [ ] Validate input and handle API/database failures
- [ ] Add structured logging and configuration validation
- [ ] Document deployment and environment configuration
- [ ] Review database credentials and secret handling
Phase 5 — Evaluation and optimization
- [ ] Build a small, labelled question-and-relevant-chunks evaluation set
- [ ] Calculate Precision@K and Recall@K for retrieval
- [ ] Measure retrieval latency separately from end-to-end answer latency
- [ ] Record test conditions and report real measured results
- [ ] Compare chunking, top-k, or retrieval settings using the same evaluation set
Future extensions
- [ ] Literature review summaries
- [ ] Research gap exploration
- [ ] Paper clustering and topic discovery
RAG Evaluation Plan
Evaluation metrics should only be reported after they are calculated on a documented test set.
- Precision@K: relevant retrieved chunks among the top K results divided by K.
- Recall@K: relevant retrieved chunks among the top K results divided by all known relevant chunks for that query.
- Retrieval latency: time spent retrieving relevant chunks.
- End-to-end latency: total time from receiving a question to returning the generated answer.
When reporting results, document the dataset size, number of queries, value of K, embedding model, retrieval configuration, and measurement method. Do not publish placeholder or invented performance numbers.
API and Feature Status
Document each endpoint here once it exists and has been tested. For each endpoint, include its HTTP method, path, request format, response format, and error cases. Do not list planned endpoints as working APIs.
Capability	Status
Frontend/backend/database containers	Configured in Docker Compose; verify locally
PDF ingestion	Planned / not verified
Embedding generation	Planned / not verified
pgvector similarity retrieval	Planned / not verified
Gemini-grounded RAG responses	Planned / not verified
Precision@K / Recall@K evaluation	Planned / not verified
Latency benchmarking	Planned / not verified


Update this table as each capability is implemented and tested.
Troubleshooting
- Port already in use: stop the process using port 5173, 3000, or 5432, or change the corresponding port mapping in docker-compose.yml.
- Database connection errors: confirm the PostgreSQL container is healthy and that the backend uses the Compose service name postgres as the hostname when running inside Docker.
- Gemini errors: verify that the API key is set in the backend environment and is valid. Never expose the key in frontend code or commit it to Git.
- Container changes not appearing: rebuild the relevant image with docker compose up --build.
Contributing
1. Create a feature branch.
2. Keep changes focused and add tests where applicable.
3. Update this README when a feature becomes implemented and verified.
4. Never commit secrets or private research documents.
License
No license is specified yet. Add a LICENSE file before presenting the project as open source for reuse.
