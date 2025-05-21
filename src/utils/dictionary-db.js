import { openDB } from "idb";

const DB_NAME = "hanswehr";
const STORE_NAME = "entries";
const DB_VERSION = 1;
const RESPONSE_VERS = "1.0";

let dbPromise = null;
let initPromise = null; // Holds the single init call

/**
 * Initializes the IndexedDB database only once.
 */
export async function initDictionaryDB(jsonURL = "/data/hans_wehr_data.json") {
  if (initPromise) {
    return initPromise; // Return ongoing or completed init
  }

  console.log("This is a test log message");

  console.log("📦 Initializing IndexedDB..");
  initPromise = (async () => {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "word_ID",
          });
          store.createIndex("root", "root");
          store.createIndex("searchableRoots", "searchableRoots", {
            multiEntry: true,
          });
          console.log("🛠️ Store and indexes created");
        } else {
          const store = db
            .transaction(STORE_NAME, "versionchange")
            .objectStore(STORE_NAME);
          if (!store.indexNames.contains("searchableRoots")) {
            store.createIndex("searchableRoots", "searchableRoots", {
              multiEntry: true,
            });
            console.log("🧩 Added missing 'searchableRoots' index");
          }
        }
      },
    });

    const db = await dbPromise;
    const count = await db.count(STORE_NAME);
    console.log(`📊 Dictionary entries in DB: ${count}`);

    if (count > 0) {
      console.log("✅ Dictionary already loaded");
      return dbPromise;
    }

    console.log("⬇️ Fetching dictionary JSON...");
    const response = await fetch(jsonURL);
    const data = await response.json();
    console.log(`📥 Loaded ${data.length} entries from JSON`);

    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const entry of data) {
      tx.store.put(entry);
    }
    await tx.done;
    console.log("✅ Dictionary data written to IndexedDB");

    return dbPromise;
  })();

  return initPromise;
}

/**
 * Retrieves and formats all words that have the given root.
 */
export async function retrieveAllWordsWithRoot(root) {
  console.log(`🔍 Searching IndexedDB for root: "${root}" via searchableRoots`);

  // ✅ Ensure DB is initialized before querying
  await initDictionaryDB();

  const db = await dbPromise;

  const results = await db.getAllFromIndex(STORE_NAME, "searchableRoots", root);
  console.log(`📑 Found ${results.length} entries for root "${root}"`);

  const response = results.map((doc) => {
    const form_definitions = (doc.forms || []).map((word) => ({
      id: word.id,
      text: word.text,
      form: word.form,
      transliteration: word.transliteration,
      translation: {
        id: word.translation.id,
        text: word.translation.text,
        short: word.translation.short,
      },
    }));

    const noun_definitions = (doc.nouns || []).map((word) => ({
      id: word.id,
      text: word.text,
      transliteration: word.transliteration,
      plural: word.plural,
      translation: {
        id: word.translation.id,
        text: word.translation.text,
        short: word.translation.short,
      },
    }));

    return {
      word: root,
      rootInfo: doc.forms?.[0]?.root || null,
      definitions: form_definitions,
      nouns: noun_definitions,
      responseVersion: RESPONSE_VERS,
    };
  });

  console.log(`🧾 Structured response count: ${response.length}`);
  return response;
}

/**
 * Returns a list of unique searchable roots that match the input prefix.
 * Used for autocomplete.
 */
export async function getMatchingRoots(query) {
  await initDictionaryDB();
  const db = await dbPromise;
  const all = await db.getAll(STORE_NAME);

  const matchingRoots = new Set();

  for (const entry of all) {
    const roots = entry.searchableRoots || [];
    for (const root of roots) {
      if (root.startsWith(query)) {
        matchingRoots.add(root);
      }
    }
  }

  return Array.from(matchingRoots).sort();
}
