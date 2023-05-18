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
import { Search as SearchIcon } from "@material-ui/icons";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InputAdornment from "@mui/material/InputAdornment";
import {
  toastError,
  noResultsAlert,
  processInputToArabic,
} from "../../utils/utils";
import Swal from "sweetalert2";

import { FileCopyOutlined as CopyIcon } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { stripHTMLTags } from "../../utils/utils";

import { logger } from "../../utils/logger";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
logger.debug(`API URL: ${API_URL}`);

// code to handle error dialog
const ReportErrorDialog = ({ open, handleClose, word, errorType }) => {
  const [errorDescription, setErrorDescription] = useState("");
  if (!errorType) {
    errorType = "ENTRY_ERROR";
  }
  const handleErrorReportSubmit = (event) => {
    const feedbackData = {
      type: errorType,
      root: word,
      message: errorDescription,
    };
    const feedbackPostOptions = {
      method: "POST",
      url: API_URL + `/feedback`,
      headers: {
        "content-type": "application/json",
      },
      data: feedbackData,
    };

    axios
      .request(feedbackPostOptions)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        // console.error(error);
        logger.error(
          `feedbackError: Error reporting feedback: ${JSON.stringify(
            feedbackData
          )} ${error.response}`
        );
        // if (error.response) {

        // }
      });

    console.log(`submitted error report for ${word}`);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Report Error for {word}</DialogTitle>
      <DialogContent>
        {/* Add your form components here */}
        {/* Example: */}
        <Typography>
          Please provide a brief description of the error:
        </Typography>
        <FilledInput
          multiline
          maxRows={4}
          disableUnderline
          placeholder="Error description"
          value={errorDescription}
          onChange={(event) => setErrorDescription(event.target.value)}
          fullWidth
          variant="filled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleErrorReportSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
  const [rootInfo, setRootInfo] = useState({});
  const [exist, setExist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [successfullyConnected, setSuccessfullyConnected] = useState(false);
  const [error, setError] = useState(null);
  // const [audio, setAudio] = useState(null);

  const [reportErrorOpen, setReportErrorOpen] = useState(false);

  const isBookmarked = Object.keys(bookmarks).includes(word);

  // const DottedDivider = styled(Divider)({
  //   border: 0,
  //   borderTop: "1px dotted #ccc",
  //   margin: "24px 0",
  // });

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
        {/* <form onSubmit={handleInputSubmit} spacing={0}>
        <form
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
              endAdornment={
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
              } */}

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
    // setDefinitions(data["definition"]);
    // setNouns(data["nouns"]);
    // console.log("New def:" + JSON.stringify(definitions));
    // const phonetics = data[0].phonetics;
    // if (!phonetics.length) return;
    // const url = phonetics[0].audio.replace("//ssl", "https://ssl");
    // setAudio(new Audio(url));
  }

  // handles retrieving data from API and sets state accordingly
  useEffect(() => {
    const fetchDefinition = async () => {
      // console.log("Useeffect Fired");
      try {
        const resp = await axios.get(API_URL + `/root?root=${word}`);
        updateState(resp.data["data"]);

        setExist(resp.data["data"].length !== 0);
        setSuccessfullyConnected(true);
        setLoaded(true);
      } catch (err) {
        // console.error(err);
        setError(err);
        if (!err.response) {
          logger.error(`apiconnection: No response from API`);
          setSuccessfullyConnected(false);
        } else {
          logger.error(`apiconnection: error in api request: ${err.response}`);

          setSuccessfullyConnected(true);
        }
        setExist(false);
        setLoaded(true);
      }
    };

    // handles retreiving definition, either from API or cache
    function getDefinition() {
      if (!isBookmarked) {
        // definition is cached so retrieve from there
        fetchDefinition();
      } else if (
        !bookmarks[word][0] ||
        bookmarks[word][0]["responseVersion"] !== CURRENT_RESPONSE_VERS
      ) {
        // definition needs to be rehydrated from bookmarks
        fetchDefinition();
      } else {
        // retrieve from bookmarks (local storage)
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
    rootInfo.map((rootDefinition, index) => {
      // render each definition
      return (
        <>
          <SingleDefinition
            word={word}
            definition={rootDefinition}
            countString={`${index + 1} of ${rootInfo.length}`}
          />
          ;
          {index != rootInfo.length - 1 ? (
            <Divider light={false} sx={{ display: "block", my: 3 }} />
          ) : null}
        </>
      );
    });
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
      text: `Error connecting to the server. The error has been reported.`,
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
  if (!exist) {
    // alert user that no root was found
    Swal.fire({
      icon: "question",
      title: "No Results",
      text: `No results found for ${word}`,
      showCancelButton: true,
      confirmButtonText: "Report Error",
      cancelButtonText: "Go back",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //  report error
        setReportErrorOpen(true);
        Swal.close();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // go back
        setLoaded(false);
        history.goBack();
        // window.location.reload();
      }
    });
    return (
      <>
        <ReportErrorDialog
          errorType={"MISSING_ENTRY_ERROR"}
          open={reportErrorOpen}
          word={word}
          handleClose={() => {
            setReportErrorOpen(false);
            setLoaded(false);
            history.goBack();
          }}
        />
        <TopBar />
      </>
    );
  }

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

      {/* 
      <Fragment key={123}>
        <Divider sx={{ display: "block", my: 3 }} />
        <b>Definition</b>
        {exist &&
          Object.keys(definitions).forEach((form) => {
            const formNumber = formToInt[form];
            return (
              <Box
                key={Math.random()}
                sx={{
                  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#fff",
                  p: 2,
                  borderRadius: 2,
                  mt: 3,
                }}
              >
                <Typography
                  sx={{ textTransform: "capitalize" }}
                  color="GrayText"
                  variant="subtitle1"
                >
                  {form}
                </Typography>
                <Typography
                  sx={{ my: 1 }}
                  variant="body2"
                  color="GrayText"
                  key={definitions[form]}
                >
                  { {meaning.definitions.length > 1 && `${idx + 1}. `}{" "}}
                  {definitions[form]}
                </Typography>
              </Box>
            );
            console.log("Form: " + form + " Def: " + definitions[form]);
          })}
      </Fragment> */}

      {/* {definitions.map((def, idx) => (
        <Fragment key={idx}>
          <Divider sx={{ display: idx === 0 ? "none" : "block", my: 3 }} />
          {def.meanings.map((meaning) => (
            <Box
              key={Math.random()}
              sx={{
                boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#fff",
                p: 2,
                borderRadius: 2,
                mt: 3,
              }}
            >
              <Typography
                sx={{ textTransform: "capitalize" }}
                color="GrayText"
                variant="subtitle1"
              >
                {meaning.partOfSpeech}
              </Typography>
              {meaning.definitions.map((definition, idx) => (
                <Typography
                  sx={{ my: 1 }}
                  variant="body2"
                  color="GrayText"
                  key={definition.definition}
                >
                  {meaning.definitions.length > 1 && `${idx + 1}. `}{" "}
                  {definition.definition}
                </Typography>
              ))}
            </Box>
          ))}
        </Fragment>
      ))} */}
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
            position: "relative", // add this to make position absolute work
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

          {/* Report Error Icon */}
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

          {/* Report Error Form Dialog */}
          <ReportErrorDialog
            open={reportErrorOpen}
            handleClose={handleCloseReportError}
            word={word}
          />
        </Stack>
        {/* <Stack
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
          }}
        >
          <Typography sx={{ textTransform: "capitalize" }} variant="h5">
            <sup>1</sup> {word}
          </Typography>
          {/* {
            <IconButton>
              <PlayIcon />
            </IconButton>
          } 
        </Stack>  */}
      </Tooltip>

      <Fragment key={1}>
        <Divider varianr="inset" light={true} sx={{ display: "none", my: 3 }} />

        {definition["definitions"].map((formEntry, index) => (
          <DefinitionCard
            formEntry={formEntry}
            i={index}
            countString={countString}
          />
        ))}
      </Fragment>

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
          {/* {
          <IconButton>
            <PlayIcon />
          </IconButton>
        } */}
        </Stack>

        {definition["nouns"] &&
          definition["nouns"].map((nounEntry, i) => (
            <NounCard nounEntry={nounEntry} i={i} countString={countString} />
          ))}
      </Fragment>
    </>
  );
};

export default Definition;
