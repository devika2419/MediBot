import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { streamText } from "ai";
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    // Generate embedding for the latest message
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    // Query Astra DB for relevant documents
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    const cursor = collection.find(null, {
      sort: {
        $vector: embedding.data[0].embedding,
      },
      limit: 10,
    });
    const documents = await cursor.toArray();

    const cleanDocuments = documents.map((doc) => {
      return doc.text
        .replace(/\t/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    });
    const uniqueDocuments = [...new Set(cleanDocuments)];
    const relevantContext = uniqueDocuments
      .filter((doc) => doc.toLowerCase().includes(latestMessage.toLowerCase()))
      .join("\n");

    const template = {
      role: "system",
      content: `You are a health assistant. Provide accurate, easy-to-understand information about health topics. 
        If asked about symptoms or conditions, remind the user to consult a doctor. 
        Use simple language and avoid medical jargon.

        Context:
        ${relevantContext}

        Question:
        ${latestMessage}
      `,
    };

    // Get the response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [template, ...messages],
    });

    const content = response.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        role: "assistant",
        content,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
