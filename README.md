# 🎓 Intellica – AI College Document Assistant

> **Ask questions from your college documents using AI.**
> Upload syllabus, placement rules, academic regulations, timetables, and more — get instant, accurate, sourced answers powered by Google Gemini + RAG.

---

## 📌 Problem Statement

Students struggle to find specific information scattered across dozens of college PDFs. CollegeGPT solves this by creating a conversational AI that reads your documents and answers questions accurately, citing the exact source page.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **PDF Upload** | Multi-file upload with drag-and-drop |
| 🔍 **RAG Pipeline** | Retrieval-Augmented Generation using ChromaDB |
| 🤖 **Gemini AI** | Google Gemini 1.5 Flash for response generation |
| 📖 **Source Citations** | Every answer cites the source document and page |
| 💬 **Chat Interface** | Modern AI chatbot with markdown rendering |
| 📚 **Document Management** | List, search, sort, and delete uploaded documents |
| 📊 **Dashboard** | Stats overview with system health |
| 🔒 **No Hallucination** | Strictly grounded responses from your documents |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     COLLEGEGPT ARCHITECTURE                      │
├──────────────────────┬──────────────────────────────────────────┤
│     FRONTEND (React) │           BACKEND (FastAPI)               │
│  ┌────────────────┐  │  ┌──────────────────────────────────────┐ │
│  │   Dashboard    │  │  │         FastAPI Application           │ │
│  │   Chat UI      │◄─┼─►│  /api/documents  /api/chat  /health  │ │
│  │   Documents    │  │  └────────────────┬─────────────────────┘ │
│  │   Upload Zone  │  │                   │                        │
│  └────────────────┘  │    ┌──────────────▼──────────────────┐   │
│                       │    │           Services               │   │
│   Axios HTTP Client   │    │  ┌──────────────────────────┐   │   │
│   React Context       │    │  │  PDF Service             │   │   │
│   React Router        │    │  │  • Validate + Extract    │   │   │
│   Tailwind CSS        │    │  │  • Clean + Chunk         │   │   │
│                       │    │  └────────────┬─────────────┘   │   │
└──────────────────────┘    │               │                  │   │
                             │  ┌────────────▼─────────────┐   │   │
                             │  │  Embedding Service        │   │   │
                             │  │  • Gemini Embeddings      │   │   │
                             │  │  • models/embedding-001   │   │   │
                             │  └────────────┬─────────────┘   │   │
                             │               │                  │   │
                             │  ┌────────────▼─────────────┐   │   │
                             │  │  Vector Service (ChromaDB)│   │   │
                             │  │  • Store/Search/Delete    │   │   │
                             │  └────────────┬─────────────┘   │   │
                             │               │                  │   │
                             │  ┌────────────▼─────────────┐   │   │
                             │  │  RAG Service              │   │   │
                             │  │  • Similarity Search      │   │   │
                             │  │  • Context Building       │   │   │
                             │  └────────────┬─────────────┘   │   │
                             │               │                  │   │
                             │  ┌────────────▼─────────────┐   │   │
                             │  │  LLM Service (Gemini)     │   │   │
                             │  │  • Grounded Prompting     │   │   │
                             │  │  • Source Citations       │   │   │
                             │  └──────────────────────────┘   │   │
                             └────────────────────────────────────┘
```

---

## 🔄 RAG Workflow

```
PDF Upload
    │
    ▼
Text Extraction (PyPDF)
    │  page-by-page extraction
    ▼
Text Cleaning
    │  remove nulls, normalize whitespace
    ▼
Chunking (RecursiveCharacterTextSplitter)
    │  chunk_size=1000, overlap=200
    ▼
Embedding Generation (Gemini models/embedding-001)
    │  task_type: retrieval_document
    ▼
ChromaDB Storage
    │  with metadata: doc_id, page_num, chunk_index
    ▼
════════════════════════
At Query Time:
════════════════════════
User Question
    │
    ▼
Question Embedding (task_type: retrieval_query)
    │
    ▼
ChromaDB Similarity Search (Top-K=5)
    │
    ▼
Context Building
    │  deduplicated chunks sorted by relevance
    ▼
Gemini Prompt (grounded)
    │  "Answer ONLY from the context..."
    ▼
AI Response + Source Citations
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **LangChain** | RAG orchestration |
| **ChromaDB** | Vector database |
| **PyPDF** | PDF text extraction |
| **Google Gemini** | Embeddings + LLM |
| **Pydantic** | Data validation |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Axios** | HTTP client |
| **React Router** | Navigation |
| **React Markdown** | Markdown rendering |
| **React Dropzone** | File upload |
| **Lucide React** | Icons |

---

## 📁 Folder Structure

```
collegegpt/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings from .env
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── documents.py     # Document endpoints
│   │   │   ├── chat.py          # Chat endpoints
│   │   │   └── health.py        # Health check
│   │   ├── services/
│   │   │   ├── pdf_service.py        # PDF extraction + chunking
│   │   │   ├── embedding_service.py  # Gemini embeddings
│   │   │   ├── vector_service.py     # ChromaDB operations
│   │   │   ├── rag_service.py        # RAG pipeline
│   │   │   ├── llm_service.py        # Gemini LLM
│   │   │   ├── document_store.py     # Metadata persistence
│   │   │   └── chat_history_service.py
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── utils/
│   │       └── helpers.py
│   ├── tests/
│   │   └── test_collegegpt.py
│   ├── uploads/                 # Uploaded PDF files
│   ├── chroma_db/               # ChromaDB persistence
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── run.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Documents.jsx
│   │   │   └── Upload.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── ChatContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Google Gemini API Key → [Get it here](https://makersuite.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collegegpt.git
cd collegegpt
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Open .env and set your API key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Required variables:**
| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | **Required** - Your Gemini API key | None |
| `CHROMA_PERSIST_DIRECTORY` | ChromaDB storage path | `./chroma_db` |
| `UPLOAD_DIRECTORY` | PDF upload path | `./uploads` |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` |
| `CHUNK_SIZE` | Text chunk size | `1000` |
| `TOP_K_RESULTS` | Chunks to retrieve per query | `5` |

---

### 4. Run the Backend

```bash
# From the backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

---

### 5. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

---

### 6. Run the Frontend

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🐳 Docker Deployment

The easiest way to run CollegeGPT is with Docker:

### 1. Create `.env` file in the `collegegpt/` root

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Build and Start

```bash
docker compose up --build
```

The app will be available at: **http://localhost**

### 3. Stop

```bash
docker compose down
```

### 4. Remove all data (volumes)

```bash
docker compose down -v
```

---

## 📡 API Documentation

### Documents

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload and process a PDF |
| `GET` | `/api/documents` | List all uploaded documents |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `GET` | `/api/documents/stats/summary` | Get system statistics |

### Chat

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Ask a question (RAG) |
| `GET` | `/api/chat/history/{session_id}` | Get chat history |
| `DELETE` | `/api/chat/history/{session_id}` | Clear chat history |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check |
| `GET` | `/docs` | Swagger UI |

### Example: Upload a Document

```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "accept: application/json" \
  -F "file=@placement_rules.pdf"
```

### Example: Ask a Question

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the minimum CGPA for placement?",
    "session_id": "my-session-001"
  }'
```

---

## 💬 Example Questions to Test

After uploading relevant documents, try:

1. "What is the minimum CGPA required for placement eligibility?"
2. "How many backlogs are allowed to sit for campus placements?"
3. "What is the attendance percentage required to appear in exams?"
4. "What are the rules for internal assessment marks?"
5. "How is the CGPA calculated?"
6. "What is the duration of the lab sessions?"
7. "What programming languages are covered in the syllabus?"
8. "What are the library rules?"

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=app --cov-report=html
```

---

## 🐛 Troubleshooting

### ❌ `GEMINI_API_KEY not set`

Set your key in `backend/.env`:
```
GEMINI_API_KEY=AIza...your_key_here
```

### ❌ PDF text extraction fails

The PDF may be scanned (image-based). CollegeGPT requires text-based PDFs. For scanned PDFs, use OCR tools like Adobe Acrobat or Tesseract first.

### ❌ ChromaDB initialization error

```bash
# Delete the old database and restart
rm -rf backend/chroma_db/
```

### ❌ Frontend can't connect to backend

Ensure the backend is running on port 8000. The Vite dev server proxies `/api` calls to `http://localhost:8000`.

### ❌ Gemini API quota exceeded

Wait a few minutes or upgrade your Gemini API plan. The free tier has rate limits.

### ❌ `No relevant chunks found`

Upload relevant documents first, then ask questions. CollegeGPT only answers from uploaded documents.

---

## 🎤 Interview Explanation

> "CollegeGPT is a Retrieval-Augmented Generation (RAG) system built for college students. The core idea is: instead of training a model on college data (which would be expensive and static), we let students upload their own PDF documents, which get processed and stored as vector embeddings in ChromaDB.
>
> When a student asks a question, we embed the question using the same model, run a cosine similarity search to find the most relevant text chunks, feed those chunks as context to Google Gemini with a strict prompt that says 'answer only from this context,' and return the answer along with page-level source citations.
>
> The key technical decisions were: using RecursiveCharacterTextSplitter for semantically meaningful chunks, using Gemini's `retrieval_query` vs `retrieval_document` task types for better embedding alignment, and persisting ChromaDB to disk so data survives server restarts. The frontend is React with Tailwind CSS, communicating via Axios to a FastAPI backend with full CORS, file validation, and error handling."

---

---

## 🚀 Deployment to Render

This repository includes a `render.yaml` Blueprint for automated deployment of both the FastAPI Backend and the React Frontend.

### Option A: 1-Click Blueprint Deployment (Recommended)
1. Push this repository to GitHub.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect this `RagProject` repository.
5. Render reads `render.yaml` and creates both services:
   - **intellica-backend** (FastAPI Web Service)
   - **intellica-frontend** (React Vite Static Site)
6. Set your `GEMINI_API_KEY` in the environment variables prompt.
7. Click **Apply** and wait 2-3 minutes for the build to finish!

### Option B: Manual Setup on Render

#### 1. Deploy Backend (Web Service):
- **Name**: `intellica-backend`
- **Runtime**: `Python 3`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `GEMINI_API_KEY`: `your_gemini_api_key`
  - `ALLOWED_ORIGINS`: `*`

#### 2. Deploy Frontend (Static Site):
- **Name**: `intellica-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://intellica-backend.onrender.com` (your backend URL)
- **Rewrite Rules**:
  - Source: `/*` → Destination: `/index.html` (Action: `Rewrite`)

---

## 📄 License

MIT License - See LICENSE file for details.

---

*Built with ❤️ using Google Gemini, LangChain, ChromaDB, FastAPI, and React.*
