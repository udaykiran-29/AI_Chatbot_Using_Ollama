# 🤖 AI_Chatbot_Using_Ollama

A full-stack AI-powered support assistant built using **React, Node.js, Redis, LangChain, MySQL, and Ollama (Llama3 model)**.  
This chatbot analyzes user queries, checks previous issue history, fetches relevant responses from vectorized PDFs using embeddings, and responds quickly using **Redis caching** for performance optimization.

---

## 🚀 Features

- 💬 Interactive AI Chatbot with **Ollama (Llama3 model)**
- ⚡ **Redis caching** to speed up repeated queries
- 📄 **PDF Vector Search** using LangChain & Embeddings (**nomic-embed-text**)
- 🧠 Context-based AI responses using **prompt engineering**
- 🗃 MySQL database to store unresolved issues
- 📨 EmailJS used for feedback and issue escalation UI
- 🔐 LocalStorage-based session tracking
- 📌 Issue tracking and status update system (pending/taken/done)
- 🎨 Clean animated frontend chat UI

---

## 🧠 Tech Stack

| Layer       | Technologies Used |
|-------------|------------------|
| **Frontend** | React.js, LocalStorage, EmailJS, Vanilla CSS (Animated UI) |
| **Backend** | Node.js, Express, LangChain, Redis, Ollama API, MySQL |
| **AI Models** | `llama3` for chat, `nomic-embed-text` for embeddings |
| **Vector Search** | LangChain + PDF Embedding for semantic search |
| **Database** | MySQL (issue logging) + Redis (caching) |
| **Deployment Ready** | Modular structure for future Docker & Cloud setup |

---
## 📁 Folder Structure


AI_Chatbot_Using_Ollama/
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/ # Chat UI, feedback popup, email alert UI
│ │ ├── App.js
│ │ ├── index.js
│ │ └── styles/
│ └── package.json
│
├── backend/
│ ├── data/ # Folder to store PDF knowledge base
│ ├── vector_store/ # Vector DB stored here (auto-created)
│ ├── routes/
│ ├── controllers/
│ ├── db.js # MySQL connection
│ ├── redisClient.js # Redis setup
│ ├── index.js # Main server file
│ └── package.json
│
└── README.md



---

## ⚙️ Setup Instructions

1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/AI_Chatbot_Using_Ollama.git
cd AI_Chatbot_Using_Ollama
```
2️⃣Install Backend Dependencies
```
cd backend
npm install

```
3️⃣ Install Frontend Dependencies

```
cd ../frontend
npm install

```

📌 Backend Environment Setup (.env)
Create a .env file in backend/ with the following:


MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=chatbot_db

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

🗄 MySQL Table Setup (Run this)

CREATE DATABASE chatbot_db;
USE chatbot_db;

CREATE TABLE issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  query TEXT,
  status VARCHAR(50) DEFAULT 'pending'
);

💾 Redis Setup

Make sure Redis is installed and running:
```
redis-server
```
Verify:

```
redis-cli PING
# Output: PONG
```

🤖 Ollama Setup

Install Ollama (from https://ollama.ai)


```

ollama pull llama3
ollama pull nomic-embed-text

```

📚 PDF Embedding Setup

Place your knowledge base PDFs inside:

backend/data/

On backend start, LangChain will automatically vectorize PDFs and store them in:

backend/vector_store/


▶️ Run the Project

Start Backend

```
cd backend
node index.js

```

Start Frontend

```
cd frontend
npm start

```

📡 API Endpoints
Method	Endpoint	Description
POST	/api/chat	Send prompt to AI chatbot
POST	/api/feedback	Store user feedback and trigger email via EmailJS
POST	/api/issues	Log unresolved issue in MySQL
GET	/api/issues	Fetch unresolved issues


