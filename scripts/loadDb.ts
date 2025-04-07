import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const healthData = [
  "https://www.cdc.gov",
  "https://www.who.int",
  "https://www.nih.gov",
  "https://medlineplus.gov",
  "https://open.fda.gov/",
  "https://clinicaltrials.gov/",
  "https://pubmed.ncbi.nlm.nih.gov",
  "https://disease-ontology.org/",
  "https://go.drugbank.com/",
  "https://healthdata.gov/",
  "https://hpo.jax.org/app/",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async () => {
  try {
    // Get the list of collections
    const collections = await db.listCollections();

    // Extract collection names from the FullCollectionInfo objects
    const collectionNames = collections.map((collection) => collection.name);

    // Check if the collection already exists
    if (collectionNames.includes(ASTRA_DB_COLLECTION)) {
      console.log(
        `Collection '${ASTRA_DB_COLLECTION}' already exists. Skipping creation.`
      );
      return;
    }

    // Create the collection if it doesn't exist
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1536,
        metric: "dot_product",
      },
    });

    console.log("Created collection:", res);
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for await (const url of healthData) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding; //array of numbers should be the output

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });

      console.log(
        "After chunking, embedding and inserting into database:-",
        res
      );
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });

  return (await loader.scrape()).replace(/<[^>]*>/gm, "");
};

createCollection().then(() => loadSampleData());
