const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const redisClient = require("../redisClient");

let vectorStore = null;

// Parse a single PDF and chunk it
async function loadPdf(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text?.trim() || "";

    if (!text) {
      console.warn(`⚠️ Skipped empty PDF: ${pdfPath}`);
      return [];
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const chunks = await splitter.splitText(text);

    return chunks.map((chunk) => ({
      pageContent: chunk,
      metadata: { source: path.basename(pdfPath) },
    }));
  } catch (err) {
    console.warn(`⚠️ Skipped PDF ${pdfPath}: ${err.message}`);
    return [];
  }
}

// Load all PDFs into memory vector store
async function loadAllPdfsToVectorStore(folderPath) {
  try {
    const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".pdf"));

    if (files.length === 0) {
      console.warn("⚠️ No PDF files found.");
      return;
    }

    const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

    let allDocs = [];
    for (const file of files) {
      const docs = await loadPdf(path.join(folderPath, file));
      allDocs.push(...docs);
    }

    if (allDocs.length === 0) {
      console.warn("⚠️ No valid PDF content to build vector store.");
      return;
    }

    vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddings);
    console.log(`✅ Vector store created with ${allDocs.length} chunks from ${files.length} PDFs.`);
  } catch (error) {
    console.error("❌ Error loading PDFs into vector store:", error.message);
    vectorStore = null; // fallback handling
  }
}

// Query the vector store with Redis caching
async function queryPdf(question) {
  try {
    if (!vectorStore) {
      console.warn("⚠️ No vector store available, skipping PDF query.");
      return null;
    }

    const normalizedKey = `pdf:${question.toLowerCase()}`;

    // 1. Check Redis cache
    const cached = await redisClient.get(normalizedKey);
    if (cached) {
      console.log(`✅ Cache hit for: "${question}"`);
      return cached;
    }

    // 2. Perform similarity search
    const results = await vectorStore.similaritySearch(question, 3);
    if (!results || results.length === 0) {
      console.warn(`⚠️ No results found in vector store for: "${question}"`);
      return null;
    }

    const answer = results.map(r => r.pageContent).join("\n\n");


    // 3. Save in Redis cache for 10 minutes
    await redisClient.set(normalizedKey, answer, { EX: 600 });

    return answer;
  } catch (error) {
    console.error("❌ Error in queryPdf:", error.message);
    return null; // allow fallback
  }
}

module.exports = { loadAllPdfsToVectorStore, queryPdf };
