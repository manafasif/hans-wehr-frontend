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
import { AppContextProvider } from "./utils/AppContext";

const App = () => {
  console.log(process.env.REACT_APP_LOCAL === "1");

  return (
    <AppContextProvider>
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
              <Route path="/flashcards">
                <Flashcards />
              </Route>
              <Route path="/search/:word">
                <Definition />
              </Route>
            </Router>
          </Grid>
        </Grid>
      </ThemeProvider>
      <Analytics />
    </AppContextProvider>
  );
};

export default App;
