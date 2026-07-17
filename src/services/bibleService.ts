import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { pinecone, PINECONE_INDEX_NAME } from "../config/pinecone.ts";
import { type BibleBook, type ChunkedDocument } from "../models/bible.ts";

const currentDir = import.meta.dirname;

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class BibleService {
  private biblePath = path.join(currentDir, "../data/bible-kjv.json");

  // Chunks the Bible chapter by chapter
  public getChaptersAsChunks(): ChunkedDocument[] {
    // Verify file exists
    if (!fs.existsSync(this.biblePath)) {
      throw new Error(`Bible JSON file not found at: ${this.biblePath}`);
    }

    // Read and strip the UTF-8 BOM
    const rawData = fs.readFileSync(this.biblePath, "utf-8");
    const cleanData = rawData.replace(/^\uFEFF/, "");

    // Parse using our updated interface
    const books: BibleBook[] = JSON.parse(cleanData);
    const chunks: ChunkedDocument[] = [];

    // Loop through each book object safely
    books.forEach((bookObj) => {
      // Safety guard: skip if the object or the 'name' property is missing
      if (!bookObj || !bookObj.name) return;

      bookObj.chapters.forEach((chapterVerses, chapterIndex) => {
        const chapterNumber = chapterIndex + 1;

        // Build the full text by joining the array of verse strings
        const chapterText = chapterVerses
          .map((verseText, verseIndex) => `${verseIndex + 1}. ${verseText}`)
          .join(" ");

        // Safely extract the clean book name for the ID mapping
        const formattedBookName = bookObj.name.replace(/\s+/g, "_");

        chunks.push({
          id: `${formattedBookName}_Ch_${chapterNumber}`, // e.g., "Genesis_Ch_1"
          text: chapterText,
          metadata: {
            book: bookObj.name, // "Genesis"
            chapter: chapterNumber,
            source: "King James Version",
          },
        });
      });
    });

    console.log(`Successfully compiled ${chunks.length} chapter-level chunks.`);
    return chunks;
  }

  // Generates real embeddings and uploads them in batches
  public async uploadToPinecone(
    indexName: string = PINECONE_INDEX_NAME, // <-- Defaults to env variable!
    namespace: string = "bible-verses",
  ) {
    const chunks = this.getChaptersAsChunks();
    const index = pinecone.index(indexName);

    console.log(
      `Starting real embedding generation & upload of ${chunks.length} chunks to Pinecone...`,
    );

    const batchSize = 100; // Chunking uploads and API calls in batches of 100

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      // Extract the raw text strings for the current batch
      const textToEmbed = batch.map((chunk) => chunk.text);

      try {
        // 1. Generate embeddings via OpenAI
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small", // Generates a 1536-dimensional vector
          input: textToEmbed,
        });

        // 2. Pair the vectors up with metadata and IDs
        const upsertRecords = batch.map((chunk, indexInBatch) => {
          const embedding = embeddingResponse.data[indexInBatch];
          if (!embedding) {
            throw new Error(
              `Missing embedding for batch index ${indexInBatch}`,
            );
          }
          const vector = embedding.embedding;

          return {
            id: chunk.id,
            values: vector, // Real vector array
            metadata: {
              ...chunk.metadata,
              text: chunk.text, // Store raw text inside metadata so Pinecone returns it in search results!
            },
          };
        });

        // 3. Upsert to Pinecone index
        await index.namespace(namespace).upsert({
          records: upsertRecords,
        });

        console.log(
          `Successfully processed batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(chunks.length / batchSize)}`,
        );
      } catch (err: any) {
        console.error(`Error on batch starting at index ${i}:`, err.message);
        throw new Error(`Pipeline failed: ${err.message}`);
      }
    }

    return {
      message: `Successfully embedded and uploaded ${chunks.length} records to Pinecone.`,
    };
  }
}
