import { useState, useEffect, Fragment } from "react";
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  styled,
  Tooltip,
  FilledInput,
} from "@material-ui/core";
import {
  ArrowBack as BackIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  PlayArrow as PlayIcon,
  HomeOutlined as HomeIcon,
} from "@material-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import logger from "logrock";
import { Search as SearchIcon } from "@material-ui/icons";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InputAdornment from "@mui/material/InputAdornment";
import {
  toastError,
  noResultsAlert,
  processInputToArabic,
} from "../../utils/utils";
import Swal from "sweetalert2";
import { Chip } from "@mui/material";

import { FileCopyOutlined as CopyIcon } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { stripHTMLTags, getSarfAlternates } from "../../utils/utils";
import { retrieveAllWordsWithRoot } from "../../utils/dictionary-db";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const AlignCenterBox = styled(Box)(({ theme }) => ({
  ...theme.mixins.alignInTheCenter,
}));

const LOCAL = process.env.REACT_APP_LOCAL;
var API_URL = "https://api.hanswehr.com";
if (LOCAL === "1") {
  API_URL = "http://localhost:8080";
}
const CURRENT_RESPONSE_VERS = "1.0";
logger.warn(`API URL: ${API_URL}`);

const Definition = ({ bookmarks, addBookmark, removeBookmark }) => {
  const [searchInput, setSearchInput] = useState("");

  // handle submission of the search bar
  const handleInputSubmit = (event) => {
    console.log("SUBMITTED");
    event.preventDefault();
    const trimmedWord = searchInput.trim();
    if (!trimmedWord || trimmedWord.split(" ").length > 1) {
      if (!trimmedWord) {
        toastError("Root to search cannot be empty");
      } else {
        toastError("Please input one root to search with no spaces");
      }

      return;
    }
    const processedWord = processInputToArabic(trimmedWord);
    setLoaded(false);
    history.push(`/search/${processedWord}`);
    setSearchInput("");
    // window.location.reload();
  };

  const { word } = useParams();
  const history = useHistory();
  // const [definitions, setDefinitions] = useState([]);
  // const [nouns, setNouns] = useState([]);
  const [rootInfo, setRootInfo] = useState([]);
  const [exist, setExist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [successfullyConnected, setSuccessfullyConnected] = useState(false);
  const [error, setError] = useState(null);
  const [sarfSuggestions, setSarfSuggestions] = useState([]);

  // const [audio, setAudio] = useState(null);

  const isBookmarked = Object.keys(bookmarks).includes(word);

  const DottedDivider = styled(Divider)({
    border: 0,
    borderTop: "1px dotted #ccc",
    margin: "24px 0",
  });

  // updates state after retrieving root data from API
  function updateState(data) {
    const newRootInfo = [];
    data.forEach((element) => {
      newRootInfo.push({
        definitions: element["definitions"],
        nouns: element["nouns"],
      });
    });

    setRootInfo(newRootInfo);
  }

  // handles retrieving data from API and sets state accordingly
  useEffect(() => {
    const fetchDefinition = async () => {
      console.log("Useeffect Fired");
      try {
        const data = await retrieveAllWordsWithRoot(word);

        if (data.length > 0) {
          // ✅ Root exists, update state as usual
          updateState(data);
          setExist(true);
          setSuccessfullyConnected(true);
          setLoaded(true);
          setSarfSuggestions([]); // Clear any previous suggestions
          return;
        }

        // ❌ No data from DB — try getting sarf alternatives
        const suggestions = await getSarfAlternates(word);

        if (suggestions.length > 0) {
          // ✅ Suggestions found — show alert with links
          const htmlLinks = suggestions
            .map(
              (s) =>
                `<a href="#" class="sarf-link" data-root="${s}" style="margin: 4px; display: inline-block; padding: 6px 12px; background-color: #1976d2; color: white; border-radius: 16px; text-decoration: none;">${s}</a>`
            )
            .join("");

          Swal.fire({
            icon: "question",
            title: `No results for "${word}"`,
            html: `
              <p>Did you mean one of these roots?</p>
              <div style="margin-top: 10px;">${htmlLinks}</div>
            `,
            confirmButtonText: "Go to Homepage",
            didOpen: () => {
              const links = Swal.getPopup().querySelectorAll(".sarf-link");
              links.forEach((el) =>
                el.addEventListener("click", (e) => {
                  e.preventDefault();
                  const root = el.getAttribute("data-root");
                  setLoaded(false);
                  setSarfSuggestions([]); // clear state
                  Swal.close();
                  history.push(`/search/${root}`);
                })
              );
            },
          }).then((result) => {
            if (result.isConfirmed) {
              history.push("/");
            }
          });

          setSarfSuggestions(suggestions); // for safety
          setExist(false);
          setSuccessfullyConnected(true);
          setLoaded(true);
          return;
        }

        // ❌ No suggestions either
        Swal.fire({
          icon: "question",
          title: "No Results",
          text: `No results found for ${word}`,
          confirmButtonText: "Go back",
        }).then((result) => {
          if (result.isConfirmed) {
            history.goBack();
          }
        });

        setExist(false);
        setSuccessfullyConnected(true);
        setLoaded(true);
      } catch (err) {
        console.error(err);
        setError(err);
        setExist(false);
        setLoaded(true);
        setSuccessfullyConnected(false);

        Swal.fire({
          icon: "error",
          title: "API Error",
          text: `Error connecting to API: ${JSON.stringify(err)}`,
          confirmButtonText: "Go back",
        }).then((result) => {
          if (result.isConfirmed) {
            history.goBack();
          }
        });
      }
    };

    // handles retrieving definition, either from API or cache
    function getDefinition() {
      if (!isBookmarked) {
        fetchDefinition();
      } else if (
        !bookmarks[word][0] ||
        bookmarks[word][0]["responseVersion"] !== CURRENT_RESPONSE_VERS
      ) {
        fetchDefinition();
      } else {
        updateState(bookmarks[word]);
        setSuccessfullyConnected(true);
        setExist(true);
        setLoaded(true);
      }
    }

    getDefinition();
  }, [word]);

  // renders all root definitions on the page
  const AllRootDefinitions = () => {
    if (rootInfo.length === 1) {
      return (
        <SingleDefinition
          word={word}
          definition={rootInfo[0]}
          countString={null}
        />
      );
    }

    return rootInfo.map((rootDefinition, index) => (
      <Fragment key={index}>
        <SingleDefinition
          word={word}
          definition={rootDefinition}
          countString={`${index + 1} of ${rootInfo.length}`}
        />
        {index !== rootInfo.length - 1 && (
          <Divider light={false} sx={{ display: "block", my: 3 }} />
        )}
      </Fragment>
    ));
  };

  if (!loaded)
    // show loading sign
    return (
      <AlignCenterBox>
        <CircularProgress />
      </AlignCenterBox>
    );

  if (!successfullyConnected) {
    // inform user of connection error
    Swal.fire({
      icon: "error",
      title: "API Error",
      text: `Error connecting to API: ${JSON.stringify(error)}`,
      confirmButtonText: "Go back",
    }).then((result) => {
      if (result.isConfirmed) {
        // setLoaded(false);
        history.goBack();
        // window.location.reload();
      }
    });
    return <TopBar />;
  }
  // if (!exist) {
  //   // alert user that no root was found
  //   Swal.fire({
  //     icon: "question",
  //     title: "No Results",
  //     text: `No results found for ${word}`,
  //     confirmButtonText: "Go back",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // setLoaded(false);
  //       history.goBack();
  //       // window.location.reload();
  //     }
  //   });
  //   return <TopBar />;
  // }

  const TopBarEndAdornment = () => {
    return (
      <Tooltip title="Search">
        <InputAdornment position="end">
          <ArrowForwardIcon
            aria-label="toggle password visibility"
            onClick={handleInputSubmit}
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
    );
  };

  const TopBar = () => {
    return (
      <Stack direction="row" justifyContent="space-between">
        <IconButton
          onClick={() => {
            setLoaded(false);
            history.goBack();
          }}
        >
          <BackIcon sx={{ color: "black", borderRadius: 0 }} />
        </IconButton>

        <Box sx={{ width: "360px" }}>
          <form onSubmit={handleInputSubmit} spacing={0}>
            <FilledInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
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
              endAdornment={<TopBarEndAdornment />}
            />
          </form>
        </Box>

        <Tooltip title="Return to Homepage">
          <IconButton onClick={() => history.push("/")}>
            <HomeIcon sx={{ color: "black", borderRadius: 0 }}></HomeIcon>
          </IconButton>
        </Tooltip>

        <Tooltip
          title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
        >
          <IconButton
            onClick={() =>
              isBookmarked ? removeBookmark(word) : addBookmark(word, rootInfo)
            }
          >
            {isBookmarked ? (
              <BookmarkedIcon sx={{ color: "black", borderRadius: 0 }} />
            ) : (
              <BookmarkIcon sx={{ color: "black", borderRadius: 0 }} />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <IconButton
          onClick={() => {
            setLoaded(false);
            history.goBack();
          }}
        >
          <BackIcon sx={{ color: "black", borderRadius: 0 }} />
        </IconButton>

        <Box sx={{ width: "360px" }}>
          <form onSubmit={handleInputSubmit} spacing={0}>
            <FilledInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              disableUnderline
              placeholder="Search for a root"
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
                "& .MuiFilledInput-input": {
                  p: 2,
                },
              }}
              startAdornment={<SearchIcon color="disabled" />}
              endAdornment={<TopBarEndAdornment />}
            />
          </form>
        </Box>

        <Tooltip title="Return to Homepage">
          <IconButton onClick={() => history.push("/")}>
            <HomeIcon sx={{ color: "black", borderRadius: 0 }}></HomeIcon>
          </IconButton>
        </Tooltip>

        <Tooltip
          title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
        >
          <IconButton
            onClick={() =>
              isBookmarked ? removeBookmark(word) : addBookmark(word, rootInfo)
            }
          >
            {isBookmarked ? (
              <BookmarkedIcon sx={{ color: "black", borderRadius: 0 }} />
            ) : (
              <BookmarkIcon sx={{ color: "black", borderRadius: 0 }} />
            )}
          </IconButton>
        </Tooltip>
      </Stack>

      {/* <TopBar /> */}

      <AllRootDefinitions />
    </>
  );
};

// renders a single form for the root definition
const DefinitionCard = ({ formEntry, i, countString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const buttonStyles = {
    transition: "opacity 0.5s ease",
    opacity: copied ? 0 : 1,
  };

  return (
    // <Tooltip title={`Verb Form ${form}`}>
    <Box
      key={`FormBox-${i}-${countString}`}
      sx={{
        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#fff",
        p: 2,
        borderRadius: 2,
        mt: 3,
        position: "relative",
      }}
    >
      <CopyToClipboard
        text={`${formEntry.form} - ${formEntry.text}\n${stripHTMLTags(
          formEntry.translation.text
        )}`}
        onCopy={handleCopy}
        key={`CopyButton-${i}-${countString}`}
      >
        <IconButton
          size="small"
          onClick={handleCopy}
          style={buttonStyles}
          disabled={copied}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            p: 1,
            zIndex: 1,
            color: "gray",
            "& svg": {
              fontSize: 14,
            },
          }}
        >
          <CopyIcon />
        </IconButton>
      </CopyToClipboard>

      <Typography
        sx={{ textTransform: "capitalize" }}
        color="GrayText"
        variant="subtitle1"
      >
        {`${formEntry.form} - ${formEntry.text}`}
      </Typography>
      <Typography
        sx={{ my: 0.5 }}
        variant="body2"
        color="GrayText"
        fontWeight={550}
        key={`FormTransliteration-${i}-${countString}`}
      >
        {formEntry.transliteration ? `${formEntry.transliteration}` : null}
      </Typography>
      <Typography
        sx={{ my: 1 }}
        variant="body2"
        color="GrayText"
        key={`FormEntry-${i}`}
        dangerouslySetInnerHTML={{ __html: formEntry.translation.text }}
      >
        {/* { {meaning.definitions.length > 1 && `${idx + 1}. `}{" "}} */}
      </Typography>
    </Box>
    // </Tooltip>
  );
};

// renders a single card for a noun
const NounCard = ({ nounEntry, i, countString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const buttonStyles = {
    transition: "opacity 0.5s ease",
    opacity: copied ? 0 : 1,
  };

  return (
    <Box
      key={`NounBox-${i}-${countString}`}
      sx={{
        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#fff",
        p: 2,
        borderRadius: 2,
        mt: 3,
        position: "relative",
      }}
    >
      <CopyToClipboard
        text={`${nounEntry["text"]} ${
          nounEntry["plural"]["text"]
            ? `pl. ${nounEntry["plural"]["text"]}`
            : ""
        } \n${stripHTMLTags(nounEntry["translation"]["text"])}`}
        onCopy={handleCopy}
        key={`NounCopyButton-${i}-${countString}`}
      >
        <IconButton
          size="small"
          onClick={handleCopy}
          style={buttonStyles}
          disabled={copied}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            p: 1,
            zIndex: 1,
            color: "gray",
            "& svg": {
              fontSize: 14,
            },
          }}
        >
          <CopyIcon />
        </IconButton>
      </CopyToClipboard>
      <Typography color="GrayText" variant="subtitle1">
        {`${nounEntry["text"]} ${
          nounEntry["plural"]["text"]
            ? `pl. ${nounEntry["plural"]["text"]}`
            : ""
        }`}
      </Typography>
      <Typography
        sx={{ my: 0.5 }}
        variant="body2"
        color="GrayText"
        fontWeight={550}
        key={`NounsEntry-${i}-${countString}`}
      >
        {nounEntry.transliteration ? `${nounEntry.transliteration}` : null}
      </Typography>
      <Typography
        sx={{ my: 1 }}
        variant="body2"
        color="GrayText"
        key={`NounsDef-${i}-${countString}`}
        dangerouslySetInnerHTML={{
          __html: nounEntry["translation"]["text"],
        }}
      ></Typography>
    </Box>
  );
};

const SingleDefinition = ({ word, definition, countString }) => {
  const [reportErrorOpen, setReportErrorOpen] = useState(false);

  const handleReportError = () => {
    setReportErrorOpen(true);
  };

  const handleCloseReportError = () => {
    setReportErrorOpen(false);
  };

  return (
    <>
      <Tooltip title="Root">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mt: 3,
            background:
              "linear-gradient(90.17deg, #191E5D 0.14%, #161F75 98.58%)",
            boxShadow: "0px 10px 20px rgba(19, 23, 71, 0.25)",
            px: 4,
            py: 5,
            color: "white",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              fontSize: "14px",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              marginRight: "10px",
              marginTop: "10px",
            }}
          >
            {countString}
          </Box>
          <Typography sx={{ textTransform: "capitalize" }} variant="h5">
            {word}
          </Typography>

          <Tooltip title="Report Error">
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                color: "#FFFFFF",
                "& svg": {
                  fontSize: 14,
                },
              }}
              onClick={handleReportError}
            >
              <ReportProblemIcon />
            </IconButton>
          </Tooltip>

          <Dialog open={reportErrorOpen} onClose={handleCloseReportError}>
            <DialogTitle>Report Error</DialogTitle>
            <DialogContent>
              <Typography>Report error not supported yet! </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReportError}>Cancel</Button>
              <Button onClick={handleCloseReportError} color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Tooltip>

      <Fragment key={`DefinitionsBlock-${countString}`}>
        <Divider variant="inset" light={true} sx={{ display: "none", my: 3 }} />

        {definition["definitions"].map((formEntry) => (
          <DefinitionCard
            key={`DefCard-${uuidv4()}`}
            formEntry={formEntry}
            i={uuidv4()}
            countString={countString}
          />
        ))}
      </Fragment>

      {definition["nouns"] && definition["nouns"].length > 0 && (
        <Fragment key={`NounsBlock-${countString}`}>
          <Divider sx={{ display: "block", my: 3 }} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mt: 3,
              background:
                "linear-gradient(90.17deg, #212BBB 0.14%, #0F133A 98.58%)",
              boxShadow: "0px 10px 20px rgba(19, 23, 71, 0.25)",
              px: 4,
              py: 5,
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ textTransform: "capitalize" }} variant="h6">
              Nouns
            </Typography>
          </Stack>

          {definition["nouns"].map((nounEntry) => (
            <NounCard
              key={`NounCard-${uuidv4()}`}
              nounEntry={nounEntry}
              i={uuidv4()}
              countString={countString}
            />
          ))}
        </Fragment>
      )}
    </>
  );
};

export default Definition;
