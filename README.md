# Bible Chunk & Indexer Service

A modular Node.js, Express, and TypeScript microservice designed to parse a King James Version (KJV) Bible database, generate dense semantic vector embeddings using OpenAI, and upsert them into a Pinecone vector database for high-performance semantic search pipelines.

## Project Structure

This project follows a clean, modular Service-Controller-Route architecture:

````text
├── src/
│   ├── config/          # Client initializations (Pinecone, OpenAI)
│   ├── controllers/     # HTTP Request/Response handlers
│   ├── data/            # Local source data (bible-kjv.json)
│   ├── models/          # TypeScript interfaces and data schemas
│   ├── routes/          # Express API endpoints
│   ├── services/        # Core business logic (chunking & embeddings)
│   └── index.ts         # Server entry point
├── .env.example         # Template for environment variables
├── .gitignore           # Git ignore configurations
├── package.json
└── tsconfig.json

Prerequisites
Before running this project locally, ensure you have the following installed on your machine:

Node.js (v18 or higher recommended)

npm

You will also need to sign up and generate API credentials for:

OpenAI API Key (to use the text-embedding-3-small model)

Pinecone API Key (and an index pre-configured for 1536 dimensions using cosine similarity)

Installation & Setup
Clone or Navigate to the Project Folder:

Bash
cd bible-chunk
Install Dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory of the project:

Bash
touch .env
Open the .env file and configure your credentials exactly as shown below:

Code snippet
PORT=3000
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_pinecone_index_name_here
OPENAI_API_KEY=your_openai_api_key_here
How to Run Locally
Development Mode
To start the application locally with automated live-reloading (hot reloading) via tsx watch, run:

Bash
npm run dev
The server will boot up and listen for requests at http://localhost:3000.

API Endpoints
1. Healthcheck
URL: /health

Method: GET

Description: Verifies that the Express server is up and performs a read metadata check against Pinecone to confirm your API key is authentic.

2. View Generated Chunks
URL: /api/bible/chunks

Method: GET

Description: Parses the local database, groups verses into chapter-level chunks, and displays the structured payload arrays before uploading.

3. Build & Upload Embeddings
URL: /api/bible/upload

Method: POST

Description: Triggers the pipeline. It reads the local file, aggregates chapters, batch-requests 1536-dimensional semantic vectors from OpenAI, and stores the records securely inside your target Pinecone index.


## License

This project is licensed under the [MIT License](LICENSE).

---

### 💡 Pro Tip
It is a great practice to also create a file named `.env.example` right next to your real `.env`. Put just the empty keys inside it:
```env
PORT=3000
PINECONE_API_KEY=
PINECONE_INDEX=
OPENAI_API_KEY=
````
