import React, { createContext, useContext, useState } from "react";

// Create a context for addCollection and other functions
const AppContext = createContext();

// Create a context provider
export const AppContextProvider = ({ children }) => {
  const [flashcards, setFlashcards] = useState(
    JSON.parse(localStorage.getItem("flashcards")) || {}
  );

  const addCollection = (collectionName) => {
    console.log("Added new collection: ", collectionName);
    setFlashcards((oldFlashcards) => ({
      ...oldFlashcards,
      [collectionName]: [],
    }));
  };

  const removeFlashcard = (wordID, selectedCollection = DEFAULT_COLLECTION) => {
    // Implement logic to remove flashcards
  };

  // Define other functions here if needed

  return (
    <AppContext.Provider value={{ addCollection, removeFlashcard }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
