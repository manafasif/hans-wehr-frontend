import { useState, useEffect } from "react";
import theme from "./theme";
import { ThemeProvider, CssBaseline, Grid } from "@material-ui/core";
import { BrowserRouter as Router, Route } from "react-router-dom";
//
import Home from "./components/Home";
import Bookmarks from "./components/Bookmarks";
import Definition from "./components/Definition";
import logger, { LoggerContainer, useLoggerApi } from "logrock";
import { Analytics } from "@vercel/analytics/react";
import { initDictionaryDB } from "./utils/dictionary-db";

const App = () => {
  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || {}
  );

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    // Initialize dictionary DB on app start
    initDictionaryDB().catch((err) =>
      console.error("Failed to initialize dictionary DB:", err)
    );
  }, []);

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

  console.log(process.env.REACT_APP_LOCAL === "1");

  return (
    <LoggerContainer
      sessionID={window.sessionID}
      active={process.env.REACT_APP_LOCAL === "1"}
    >
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
              <Route path="/search/:word">
                <Definition
                  bookmarks={bookmarks}
                  addBookmark={addBookmark}
                  removeBookmark={removeBookmark}
                />
              </Route>
            </Router>
          </Grid>
        </Grid>
      </ThemeProvider>
      <Analytics />
    </LoggerContainer>
  );
};

export default App;
