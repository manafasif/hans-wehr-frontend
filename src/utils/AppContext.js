import React, { createContext, useContext, useState, useEffect } from "react";
import Papa from "papaparse";

// Create a context for addCollection and other functions
const AppContext = createContext();

// Create a context provider
export const AppContextProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || {}
  );

  const addBookmark = (word, definitions) =>
    setBookmarks((oldBookmarks) => ({
      ...oldBookmarks,
      [word]: definitions,
    }));

  const removeBookmark = (word) =>
    setBookmarks((oldBookmarks) => {
      const temp = { ...oldBookmarks };
      delete temp[word];
      return temp;
    });

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  //   flashcards logic

  const [flashcards, setFlashcards] = useState(
    JSON.parse(localStorage.getItem("flashcards")) || {}
  );

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const CURRENT_FLASHCARDS_VERSION = "1.1";
  const flashcards_version = localStorage.getItem("flashcards_version");
  if (
    !flashcards_version ||
    flashcards_version !== CURRENT_FLASHCARDS_VERSION
  ) {
    console.log("wrong flashcard version");
    setFlashcards({});
    localStorage.setItem("flashcards_version", CURRENT_FLASHCARDS_VERSION);
    localStorage.setItem("flashcards", JSON.stringify({}));
    // TODO: implement logic to update flashcard version
  }

  //   const DEFAULT_COLLECTION = "default_collection";

  const [lastUsedCollection, setLastUsedCollection] = useState(null);

  const addCollection = (collectionName = lastUsedCollection) => {
    console.log("Added new collection: ", collectionName);
    setFlashcards((oldFlashcards) => ({
      ...oldFlashcards,
      [collectionName]: [],
    }));
  };

  const addCollectionWithFlashcard = (
    word,
    form,
    definition,
    root,
    wordID,
    collectionName
  ) => {
    const parsedWord = form ? `${form} - ${word}` : word;
    const newFlashcard = {
      word: parsedWord,
      wordID: wordID,
      root: root,
      definition: definition,
    };
    setFlashcards((oldFlashcards) => ({
      ...oldFlashcards,
      [collectionName]: [newFlashcard],
    }));
    setLastUsedCollection(collectionName);
  };

  const renameCollection = (oldName, newName) => {
    if (flashcards.hasOwnProperty(oldName)) {
      const updatedFlashcards = { ...flashcards };
      updatedFlashcards[newName] = updatedFlashcards[oldName];
      delete updatedFlashcards[oldName];
      console.log("Updated flashcards:", updatedFlashcards);
      setFlashcards(updatedFlashcards);
    }
    return newName;
  };

  const deleteCollection = (collectionName) => {
    if (flashcards.hasOwnProperty(collectionName)) {
      const updatedFlashcards = { ...flashcards };
      delete updatedFlashcards[collectionName];
      setFlashcards(updatedFlashcards);
      return Object.keys(updatedFlashcards).length
        ? Object.keys(updatedFlashcards)[0]
        : "";
    }
  };

  const getCollectionNames = () => {
    return Object.keys(flashcards);
  };

  const addFlashcard = (
    word,
    form,
    definition,
    root,
    wordID,
    selectedCollection = lastUsedCollection
  ) => {
    if (!selectedCollection) {
      selectedCollection = getCollectionNames()[0];
      console.log(selectedCollection, flashcards[selectedCollection]);
    }
    const parsedWord = form ? `${form} - ${word}` : word;
    const newFlashcards = { ...flashcards };
    const newFlashcard = {
      word: parsedWord,
      wordID: wordID,
      root: root,
      definition: definition,
    };
    console.log(
      "newflashcards selectedcollection:",
      newFlashcards[selectedCollection]
    );
    newFlashcards[selectedCollection].push(newFlashcard);
    console.log(parsedWord, newFlashcard, newFlashcards);

    setFlashcards(newFlashcards);
    setLastUsedCollection(selectedCollection);
    return selectedCollection;
    // setFlashcards((oldFlashcards) => ({
    //   ...oldFlashcards,
    //   [key]: definition,
    // }));
  };

  const removeFlashcard = (wordID, selectedCollection = lastUsedCollection) => {
    // Make a copy of the current flashcards in the selected collection
    const flashcardsInCollection = [...flashcards[selectedCollection]];

    // Find the index of the flashcard with the matching wordID
    const indexToRemove = flashcardsInCollection.findIndex(
      (flashcard) => flashcard.wordID === wordID
    );

    // If the flashcard with the specified wordID is found, remove it
    if (indexToRemove !== -1) {
      flashcardsInCollection.splice(indexToRemove, 1);

      // Update the flashcards state with the modified collection
      setFlashcards((prevFlashcards) => ({
        ...prevFlashcards,
        [selectedCollection]: flashcardsInCollection,
      }));
    }
  };

  const handleExportCSV = (selectedCollection) => {
    // Extract and format data for export
    const csvData = flashcards[selectedCollection].map((flashcard) => ({
      word: flashcard.word,
      definition: flashcard.definition,
    }));

    console.log(csvData);

    // Create a CSV string from the data
    const csvString = Papa.unparse(csvData);

    // Create a Blob with the CSV data
    const blob = new Blob(["\uFEFF", csvString], {
      type: "text/csv;charset=utf-8;",
    });

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "flashcards.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <AppContext.Provider
      value={{
        bookmarks,
        setBookmarks,
        addBookmark,
        removeBookmark,
        flashcards,
        setFlashcards,
        addCollection,
        removeFlashcard,
        addFlashcard,
        deleteCollection,
        renameCollection,
        getCollectionNames,
        handleExportCSV,
        addCollectionWithFlashcard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
