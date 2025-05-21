// Modified Home.jsx with root autocomplete support, keyboard navigation, and sarf-based root suggestions
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  FilledInput,
  IconButton,
  useTheme,
  Paper,
  Container,
  Tooltip,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
} from "@material-ui/icons";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useHistory, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toastError, processInputToArabic } from "../../utils/utils";
import {
  getMatchingRoots,
  initDictionaryDB,
  retrieveAllWordsWithRoot,
} from "../../utils/dictionary-db";
import TypingAnimation from "./typingAnimation";
import StyleIcon from "@mui/icons-material/Style";

import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "@mui/material";
import { useAppContext } from "../../utils/AppContext"; // adjust path as needed

import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

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

function GuestFooter() {
  return (
    <Paper
      sx={{
        marginTop: "calc(10% + 60px)",
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "transparent",
      }}
      component="footer"
      square
    >
      <Container maxWidth="lg">
        <Box
          sx={{ flexGrow: 1, justifyContent: "center", display: "flex", my: 1 }}
        ></Box>
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            mb: 2,
            gap: 1,
          }}
        >
          <Typography variant="caption" color="initial">
            Questions, Comments, Feedback?{" "}
            <Tooltip title="Feedback Form">
              <a href="https://forms.gle/Fn42MnUpShvWze2L7">Click here.</a>
            </Tooltip>
            {" | "}
            <Link
              to="/privacy-policy"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
}

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 10000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const Home = () => {
  const [word, setWord] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sarfSuggestions, setSarfSuggestions] = useState([]);
  const theme = useTheme();
  const history = useHistory();
  const inputRef = useRef(null);
  const placeholder = TypingAnimation();

  const { userData, setUserData, handleLogin, handleLogout } = useAppContext();

  // install as pwa prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    initDictionaryDB();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      Toast.fire({
        icon: "info",
        title:
          '<span style="margin-right: 10px;">📲</span>Install this app for faster, offline access!',
        html: `<button id="installBtn" style="
          margin-top: 8px;
          background: #1976d2;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Install</button>`,
        didOpen: () => {
          document
            .getElementById("installBtn")
            .addEventListener("click", async () => {
              e.prompt();
              const result = await e.userChoice;
              if (result.outcome === "accepted") {
                console.log("User accepted the install prompt");
              }
            });
        },
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleChange = async (e) => {
    const input = e.target.value;
    setWord(input);
    setHighlightedIndex(-1);

    if (input.trim() === "") {
      setSuggestions([]);
      return;
    }

    const processed = processInputToArabic(input);
    const matches = await getMatchingRoots(processed);
    setSuggestions(matches.slice(0, 10));
  };

  const handleSelectSuggestion = (selected) => {
    setSarfSuggestions([]);
    setSuggestions([]);
    history.push(`/search/${selected}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      toastError("Root to search cannot be empty.");
      return;
    }

    const processed = processInputToArabic(trimmedWord);
    setSarfSuggestions([]);
    setSuggestions([]);

    // Always navigate to definition page, let it handle the fallback
    history.push(`/search/${processed}`);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        ...theme.mixins.alignInTheCenter,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          display: { xs: "flex", md: "flex" },
        }}
      >
        {userData ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {userData.picture && (
              <img
                src={userData.picture}
                alt="Profile"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
            <Typography variant="body2" color="textPrimary">
              {userData.name || userData.username}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                ml: 1,
                textTransform: "none",
                borderColor: "#ccc",
                color: "#333",
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              backgroundColor: "#4285F4",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3367D6",
              },
            }}
          >
            Sign in with Google
          </Button>
        )}
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

      <Typography color="primary" sx={{ mt: 3, mb: 1 }} variant="h4">
        Hans Wehr
      </Typography>
      <Typography color="GrayText">Find meanings of arabic roots</Typography>

      <Box sx={{ width: "360px", position: "relative" }}>
        <form onSubmit={handleSubmit} spacing={0} autoComplete="off">
          <FilledInput
            inputRef={inputRef}
            value={word}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disableUnderline
            placeholder={placeholder}
            sx={{
              my: 4,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
              height: 48, // explicitly control height
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              "& .MuiFilledInput-input": {
                p: "12px 14px",
                lineHeight: 1.5,
                fontFamily: /[\u0600-\u06FF]/.test(word)
                  ? "'Noto Naskh Arabic', 'Scheherazade', serif"
                  : "inherit",
              },
            }}
            startAdornment={<SearchIcon color="disabled" />}
            endAdornment={
              <Tooltip title="Search">
                <InputAdornment position="end">
                  <ArrowForwardIcon
                    onClick={handleSubmit}
                    sx={{
                      "&:hover": {
                        color: "black",
                        backgroundColor: "#BABABA",
                        borderRadius: "50%",
                      },
                    }}
                  />
                </InputAdornment>
              </Tooltip>
            }
            fullWidth
          />
        </form>

        {suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              zIndex: 10,
              width: "100%",
              maxHeight: 220,
              overflowY: "auto",
              mt: 1,
              borderRadius: 2,
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: 10,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
            }}
          >
            <List disablePadding>
              {suggestions.map((s, i) => (
                <ListItem
                  disablePadding
                  key={i}
                  selected={i === highlightedIndex}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleSelectSuggestion(s)}
                    sx={{
                      px: 2,
                      py: 1,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <ListItemText
                      primary={s}
                      primaryTypographyProps={{
                        fontSize: 18,
                        fontFamily: /[\u0600-\u06FF]/.test(s)
                          ? "'Noto Naskh Arabic', 'Scheherazade', serif"
                          : "inherit",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {sarfSuggestions.length > 0 && (
          <Paper elevation={2} sx={{ p: 2, mt: -2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Did you mean:
            </Typography>
            <List dense>
              {sarfSuggestions.map((root, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => handleSelectSuggestion(root)}
                >
                  <ListItemText primary={root} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <ButtonsBox />

      {/* <Tooltip title="Bookmarks">
        <IconButton
          to="/bookmarks"
          component={Link}
          sx={{
            borderRadius: 2,
            p: 2,
            color: "#fff",
            background: theme.palette.pink,
            boxShadow: "0px 10px 10px rgba(221, 114, 133, 0.2)",
            marginBottom: 20,
          }}
        >
          <BookmarkIcon />
        </IconButton>
      </Tooltip> */}

      {/* render info footer if not native */}
      {!isNative && <GuestFooter />}
    </Box>
  );
};

export default Home;
