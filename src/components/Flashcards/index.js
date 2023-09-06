import { Stack, IconButton, Typography, Box } from "@material-ui/core";
import { ArrowBack as BackIcon } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { useState, useEffect } from "react";

function Flashcard({ flashcard, index }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((current) => !current);
  };

  return (
    <Box
      onClick={handleFlip}
      key={index}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#fff",
        p: 2,
        borderRadius: 2,
        mt: 3,
        transition: "height 0.6s",
        ".front, .back": {
          width: "100%",
          transition: "opacity 0.6s",
          opacity: isFlipped ? 0 : 1,
        },
        ".back": {
          opacity: isFlipped ? 1 : 0,
        },
      }}
    >
      <div className="front">
        <Typography color="GrayText" variant="subtitle1">
          {flashcard.answer}
        </Typography>
      </div>
      <div className="back">
        <Typography
          sx={{ my: 1 }}
          variant="body2"
          color="GrayText"
          dangerouslySetInnerHTML={{
            __html: flashcard.question,
          }}
        ></Typography>
      </div>
    </Box>
  );
}

function Flashcards() {
  const [flashcards, setFlashcards] = useState(
    JSON.parse(localStorage.getItem("flashcards")) || []
  );

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const handleShuffle = () => {
    const shuffled = flashcards.sort(() => Math.random() - 0.5);
    setFlashcards([...shuffled]);
  };

  return (
    <>
      <Stack sx={{ mb: 2 }} direction="row" alignItems="center">
        <IconButton to="/" component={Link} sx={{ color: "black", mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6">Flashcards</Typography>
      </Stack>
      {/* <Button variant="contained" onClick={handleShuffle}>
        Shuffle
      </Button> */}
      {!!Object.keys(flashcards).length ? (
        <Grid container spacing={2}>
          {Object.keys(flashcards).map((key, index) => {
            const parsedKey = JSON.parse(key);
            const flashcard = {
              answer:
                parsedKey.length === 1
                  ? parsedKey[0]
                  : `${parsedKey[1]} - ${parsedKey[0]}`,
              question: flashcards[key],
            };

            return (
              <Grid item xs={12} key={index}>
                <Flashcard flashcard={flashcard} index={index} />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography sx={{ mt: 5 }} align="center">
          No Flashcards
        </Typography>
      )}
    </>
  );
}

export default Flashcards;
