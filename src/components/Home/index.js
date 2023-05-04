import { useState } from "react";
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

function GuestFooter() {
  return (
    <Paper
      sx={{
        marginTop: "calc(10% + 60px)",
        width: "100%",
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
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            my: 1,
          }}
        ></Box>

        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            mb: 2,
          }}
        >
          <Typography variant="caption" color="initial">
            Questions, Comments, Feedback?{" "}
            <Tooltip title="Feedback Form">
              <a href="https://forms.gle/Fn42MnUpShvWze2L7">Click here.</a>
            </Tooltip>
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
}

const Home = () => {
  const [word, setWord] = useState("");
  const [switchState, setSwitchState] = useState("Roots");
  const theme = useTheme();
  const history = useHistory();

  // const handleSwitchChange = (event) => {
  //   setSwitchState(event.target.checked ? "Root" : "Noun");
  // };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedWord = word.trim().toLowerCase();
    if (!trimmedWord || trimmedWord.split(" ").length > 1) return;
    history.push(`/search/${trimmedWord}`);
  };
  return (
    <Box sx={{ ...theme.mixins.alignInTheCenter }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: {
            xs: "200px",
            sm: "300px",
            md: "400px",
            lg: "500px",
            xl: "600px",
          },
        }}
      >
        <img src="/assets/book.png" alt="Book" />
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
            placeholder="Search for a root"
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

      {/* <StyledEngineProvider injectFirst>
        <Box sx={{ display: "flex" }}>
          <Box className="mask-box">
            <Box
              className="mask"
              style={{
                transform: `translateX(${
                  switchState === "Roots" ? 0 : "100px"
                })`,
              }}
            />
            <Button
              disableRipple
              variant="text"
              sx={{ color: switchState === "Roots" ? "#ffffff" : "#1623AE" }}
              onClick={() => setSwitchState("Roots")}
            >
              Roots
            </Button>
            <Button
              disableRipple
              variant="text"
              sx={{ color: switchState === "Nouns" ? "#ffffff" : "#0D0579" }}
              onClick={() => setSwitchState("Nouns")}
            >
              Nouns
            </Button>
          </Box>
        </Box>
      </StyledEngineProvider> */}

      {/* <Grid
        component="label"
        container
        alignItems="center"
        spacing={1}
        justifyContent="center"
        marginTop={0}
        marginBottom={2}
      >
        <Grid item>Noun</Grid>
        <Grid item>
          <Switch
            checked={switchState === "Root"} // relevant state for your case
            onChange={handleSwitchChange}
            value="checked" // some value you need
          />
        </Grid>
        <Grid item>Root</Grid>
      </Grid> */}

      <Tooltip title="Bookmarks">
        <IconButton
          to="/bookmarks"
          component={Link}
          sx={{
            borderRadius: 2,
            p: 2,
            color: "#fff",
            background: (theme) => theme.palette.pink,
            boxShadow: "0px 10px 10px rgba(221, 114, 133, 0.2)",
            marginBottom: 20,
          }}
        >
          <BookmarkIcon />
        </IconButton>
      </Tooltip>
      <GuestFooter />
    </Box>
  );
};

export default Home;
