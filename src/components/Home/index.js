import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FilledInput,
  IconButton,
  useTheme,
  Paper,
  Container,
  Tooltip,
  Grid,
  Switch,
  ToggleButton,
  Button,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
} from "@material-ui/icons";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useHistory, Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import { padding } from "@material-ui/system";
import { StyledEngineProvider } from "@mui/material/styles";
import "./styles.css";
import { toastError, processInputToArabic } from "../../utils/utils";
import Swal from "sweetalert2";

// flashcards icon
import StyleIcon from "@mui/icons-material/Style";
import TypingAnimation from "./typingAnimation";
import { useAppContext } from "../../utils/AppContext";
const ButtonsBox = () => {
  return (
    <Box>
      <Tooltip title="Bookmarks">
        <IconButton
          to="/bookmarks"
          component={Link}
          sx={{
            borderRadius: 2,
            p: 2,
            marginRight: 2,
            color: "#fff",
            background: (theme) => theme.palette.blue,
            boxShadow: "0px 10px 10px rgba(221, 114, 133, 0.2)",
            marginBottom: 20,
            transition: "transform 0.3s ease-in-out",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <BookmarkIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Flashcards">
        <IconButton
          to="/flashcards"
          component={Link}
          sx={{
            borderRadius: 2,
            p: 2,
            color: "#fff",
            background: (theme) => theme.palette.blueAlternative,
            boxShadow: "0px 10px 10px rgba(221, 114, 133, 0.2)",
            marginBottom: 20,
            transition: "transform 0.3s ease-in-out",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <StyleIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const Home = () => {
  const [word, setWord] = useState("");
  const theme = useTheme();
  const history = useHistory();

  // const showTransliterations = () => {
  //   Swal.fire({
  //     title: "Transliterations",
  //     html: "<img src='../../../public/assets/transliterations.jpeg' style='width:150px;'>",
  //   });
  // };

  const placeholder = TypingAnimation();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedWord = word.trim();
    if (!trimmedWord || trimmedWord.split(" ").length > 1) {
      if (!trimmedWord) {
        toastError("Root to search cannot be empty");
      } else {
        toastError("Please input one root to search with no spaces");
      }

      return;
    }
    const processedWord = processInputToArabic(trimmedWord);
    history.push(`/search/${processedWord}`);
  };

  const { userData, handleLogout, handleLogin, handleRegister } =
    useAppContext();

  return (
    <Box sx={{ ...theme.mixins.alignInTheCenter }}>
      <Box
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        {userData ? null : (
          <Button
            onClick={handleRegister}
            variant="contained"
            sx={{
              margin: "5px",
            }}
          >
            Register
          </Button>
        )}

        <Button
          onClick={userData ? handleLogout : handleLogin}
          variant="outlined"
          sx={{
            margin: "5px",
          }}
        >
          {userData ? userData.username : "Login"}
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: {
            xs: "400px",
            sm: "400px",
            md: "500px",
            lg: "600px",
            xl: "700px",
          },
        }}
      >
        <img
          src="/assets/book.png"
          alt="Book"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Box>

      <Typography
        color="primary"
        sx={{
          mt: 3,
          mb: 1,
        }}
        variant="h4"
      >
        Hans Wehr
      </Typography>
      <Typography color="GrayText">Find meanings of arabic roots</Typography>
      {/* <b>{switchState}</b> */}
      <Box sx={{ width: "360px" }}>
        <form onSubmit={handleSubmit} spacing={0}>
          <FilledInput
            value={word}
            onChange={(event) => setWord(event.target.value)}
            disableUnderline
            placeholder={placeholder}
            sx={{
              my: 4,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
              "& .MuiFilledInput-input": {
                p: 2,
              },
            }}
            startAdornment={<SearchIcon color="disabled" />}
            endAdornment={
              <Tooltip title="Search">
                <InputAdornment position="end">
                  <ArrowForwardIcon
                    aria-label="toggle password visibility"
                    onClick={handleSubmit}
                    edge="end"
                    transition="background-color 0.2s ease-in-out"
                    sx={{
                      "&:hover": {
                        color: "black",
                        backgroundColor: "#BABABA",
                        borderRadius: "50%",
                        transition: "background-color 0.2s ease-in-out",
                      },
                    }}
                  ></ArrowForwardIcon>
                </InputAdornment>
              </Tooltip>
            }
            fullWidth
          />
        </form>
      </Box>
      {/* <Tooltip title="Type input as English Characters">
        <Typography
          color="GrayText"
          sx={{
            mb: 2,
          }}
          onClick={showTransliterations}
        >
          View Transliterations
        </Typography>
      </Tooltip> */}

      <ButtonsBox />
    </Box>
  );
};

export default Home;
