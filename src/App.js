import { useState, useEffect } from "react";
import theme from "./theme";
import { ThemeProvider, CssBaseline, Grid } from "@material-ui/core";
import { BrowserRouter as Router, Route } from "react-router-dom";
//
import Home from "./components/Home";
import Bookmarks from "./components/Bookmarks";
import Definition from "./components/Definition";
import { Analytics } from "@vercel/analytics/react";
import Flashcards from "./components/Flashcards";

const App = () => {
  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || {}
  );

  const [flashcards, setFlashcards] = useState(
    JSON.parse(localStorage.getItem("flashcards")) || {}
  );

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [bookmarks, flashcards]);

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

  const DEFAULT_COLLECTION = "default_collection";

  const addCollection = (collectionName) => {
    console.log("Added new collection: ", collectionName);
    setFlashcards((oldFlashcards) => ({
      ...oldFlashcards,
      [collectionName]: [],
    }));
  };

  const addFlashcard = (
    word,
    form,
    definition,
    root,
    wordID,
    selectedCollection = DEFAULT_COLLECTION
  ) => {
    const parsedWord = form
      ? JSON.stringify([word, form])
      : JSON.stringify([word]);
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
    // setFlashcards((oldFlashcards) => ({
    //   ...oldFlashcards,
    //   [key]: definition,
    // }));
  };

  const removeFlashcard = (wordID, selectedCollection = DEFAULT_COLLECTION) => {
    // console.log(flashcards);

    // const parsedWord = form ? JSON.stringify([word, form]) : JSON.stringify([word]);
    const newFlashcards = { ...flashcards };

    // TODO: implement logic to find the matching ID and remove it and update the flashcards
  };

  console.log(process.env.REACT_APP_LOCAL === "1");

  const CURRENT_FLASHCARDS_VERSION = "1.1";
  const flashcards_version = localStorage.getItem("flashcards_version");
  if (
    !flashcards_version ||
    flashcards_version !== CURRENT_FLASHCARDS_VERSION
  ) {
    console.log("wrong flashcard version");

    // TODO: implement logic to update flashcard version
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid
          container
          sx={{ p: 2, mt: { xs: 0, sm: 2 } }}
          justifyContent="center"
        >
          <Grid item xs={12} sm={8} md={5} lg={3}>
            <Router>
              <Route exact path="/">
                <Home />
              </Route>
              <Route path="/bookmarks">
                <Bookmarks bookmarks={bookmarks} />
              </Route>
              <Route path="/flashcards">
                <Flashcards
                  flashcards={bookmarks}
                  removeFlashcard={removeFlashcard}
                />
              </Route>
              <Route path="/search/:word">
                <Definition
                  bookmarks={bookmarks}
                  addBookmark={addBookmark}
                  removeBookmark={removeBookmark}
                  addFlashcard={addFlashcard}
                  removeFlashcard={removeFlashcard}
                  flashcards={flashcards}
                />
              </Route>
            </Router>
          </Grid>
        </Grid>
      </ThemeProvider>
      <Analytics />
    </>
  );
};

export default App;
