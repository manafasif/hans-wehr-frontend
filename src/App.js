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
import { AppContextProvider } from "./utils/AppContext";
import Flashcards from "./components/Flashcards";

const App = () => {
  useEffect(() => {
    // Initialize dictionary DB on app start
    initDictionaryDB().catch((err) =>
      console.error("Failed to initialize dictionary DB:", err)
    );
  }, []);

  return (
    <AppContextProvider>
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
                  <Bookmarks />
                </Route>
                <Route path="/search/:word">
                  <Definition />
                </Route>
                <Route path="/flashcards">
                  <Flashcards />
                </Route>
              </Router>
            </Grid>
          </Grid>
        </ThemeProvider>
        <Analytics />
      </LoggerContainer>
    </AppContextProvider>
  );
};

export default App;
