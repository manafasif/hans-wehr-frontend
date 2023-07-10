import { Stack, IconButton, Typography, Box } from "@material-ui/core";
import { ArrowBack as BackIcon } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { useState, useEffect } from "react";

// const Flashcards = ({ flashcards }) => {
//   return (
//     <>
//       <Stack sx={{ mb: 2 }} direction="row" alignItems="center">
//         <IconButton to="/" component={Link} sx={{ color: "black", mr: 1 }}>
//           <BackIcon />
//         </IconButton>
//         <Typography variant="h6">Flashcards</Typography>
//       </Stack>
//       {!!Object.keys(flashcards).length ? (
//         Object.keys(flashcards).map((b) => (
//           <Box
//             key={b}
//             to={`/search/${b}`}
//             component={Link}
//             sx={{
//               p: 2,
//               cursor: "pointer",
//               backgroundColor: "white",
//               borderRadius: 1,
//               textTransform: "capitalize",
//               mb: 2,
//               fontWeight: 800,
//               display: "block",
//               color: "black",
//               textDecoration: "none",
//             }}
//           >
//             {b}
//           </Box>
//         ))
//       ) : (
//         <Typography sx={{ mt: 5 }} align="center">
//           No Bookmarks
//         </Typography>
//       )}
//     </>
//   );
// };

function Flashcard({ flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card onClick={handleFlip}>
      <CardContent>
        <Typography variant="h5" component="div">
          {isFlipped ? flashcard.answer : flashcard.question}
        </Typography>
      </CardContent>
    </Card>
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
    <div>
      <Button variant="contained" onClick={handleShuffle}>
        Shuffle
      </Button>
      <Grid container spacing={2}>
        {!!Object.keys(flashcards).length ? (
          Object.keys(flashcards).map((flashcard, index) => (
            <Grid item key={index}>
              <Flashcard
                flashcard={{ answer: flashcard, question: flashcard }}
              />
            </Grid>
          ))
        ) : (
          <Typography sx={{ mt: 5 }} align="center">
            No Bookmarks
          </Typography>
        )}
        {/* //   {flashcards.map((flashcard, index) => (
        //     <Grid item key={index}>
        //       <Flashcard flashcard={flashcard} />
        //     </Grid>
        //   ))} */}
      </Grid>
    </div>
  );
}

export default Flashcards;
