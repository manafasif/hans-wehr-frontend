import { useState, useEffect, Fragment } from "react";
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  Button,
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

import { FileCopyOutlined as CopyIcon } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { stripHTMLTags } from "../../utils/utils";

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
    history.push(`/search/${processedWord}`);
    window.location.reload();
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

  const isBookmarked = Object.keys(bookmarks).includes(word);

  const DottedDivider = styled(Divider)({
    border: 0,
    borderTop: "1px dotted #ccc",
    margin: "24px 0",
  });

  function updateState(data) {
    // console.log("update state Data: " + JSON.stringify(data));
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
  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        const resp = await axios.get(API_URL + `/root?root=${word}`);
        // console.log(JSON.stringify(resp.data));
        // console.log("RESPONSE: ", resp.data["data"]);
        updateState(resp.data["data"]);

        setExist(resp.data["data"].length !== 0);

        // updateState()
        setSuccessfullyConnected(true);
        setLoaded(true);
        // console.log("Set to true");
      } catch (err) {
        console.error(err);
        setError(err);
        if (!err.response) {
          setSuccessfullyConnected(false);
        } else {
          setSuccessfullyConnected(true);
        }
        setExist(false);
        setLoaded(true);
        // console.log("Set to false");
      }
    };

    function getDefinition() {
      // fetchDefinition();
      if (!isBookmarked) {
        fetchDefinition();
      } else if (
        !bookmarks[word][0] ||
        bookmarks[word][0]["responseVersion"] !== CURRENT_RESPONSE_VERS
      ) {
        // cached entry is expired, fetch again
        // console.log("ReFetching word");
        fetchDefinition();
      } else {
        // console.log("Bookmarked word: " + JSON.stringify(bookmarks[word]));
        updateState(bookmarks[word]);
        setSuccessfullyConnected(true);
        setExist(true);
        setLoaded(true);
      }
    }

    getDefinition();
  }, []);

  function renderAllRootInfo() {
    if (rootInfo.length === 1) {
      return renderDefinition(word, rootInfo[0], null);
    } else {
      const out = [];
      rootInfo.forEach((rootDefinition, index) => {
        out.push(
          renderDefinition(
            word,
            rootDefinition,
            `${index + 1} of ${rootInfo.length}`
          )
        );

        if (index != rootInfo.length - 1) {
          out.push(<Divider light={false} sx={{ display: "block", my: 3 }} />);
        }
      });
      return out;
    }
  }

  if (!loaded)
    return (
      <AlignCenterBox>
        <CircularProgress />
      </AlignCenterBox>
    );

  if (!successfullyConnected) {
    Swal.fire({
      icon: "error",
      title: "API Error",
      text: `Error connecting to API: ${JSON.stringify(error)}`,
      confirmButtonText: "Go back",
    }).then((result) => {
      if (result.isConfirmed) {
        history.goBack();
      }
    });
    return renderTopBar();
    // return (
    //   <AlignCenterBox>
    //     <Typography>
    //       Error connecting to API
    //       {JSON.stringify(error)}
    //     </Typography>
    //     <Button
    //       variant="contained"
    //       sx={{ textTransform: "capitalize", mt: 2 }}
    //       onClick={history.goBack}
    //     >
    //       <b>Go back</b>
    //     </Button>
    //   </AlignCenterBox>
    // );
  }
  if (!exist) {
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
    return renderTopBar();
    // <AlignCenterBox>
    //   <Typography>Word not found</Typography>
    //   <Button
    //     variant="contained"
    //     sx={{ textTransform: "capitalize", mt: 2 }}
    //     onClick={history.goBack}
    //   >
    //     Go back
    //   </Button>
    // </AlignCenterBox>
  }

  function renderTopBar() {
    return (
      <Stack direction="row" justifyContent="space-between">
        <IconButton onClick={history.goBack}>
          <BackIcon sx={{ color: "black", borderRadius: 0 }} />
        </IconButton>
        <form onSubmit={handleInputSubmit} spacing={0}></form>
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
          }
        />
        <form />

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
  }

  return (
    <>
      {renderTopBar()}

      {renderAllRootInfo()}

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

function renderDefinition(word, definition, countString) {
  const copied = false;
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
}

export default Definition;
