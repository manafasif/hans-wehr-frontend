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
import { useAppContext } from "../../utils/AppContext";
import { toastSuccess } from "../../utils/utils";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";

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

const CardButtons = ({
  shortNotifText,
  textToCopy,
  word,
  form,
  definition,
  wordID,
  root,
  displayShort,
  setDisplayShort,
}) => {
  // pull the flashcard functions from the context
  const { addFlashcard, getCollectionNames, addCollectionWithFlashcard } =
    useAppContext();

  // state used to manage if this card has been added to flashcards
  const [addedToFlashcards, setAddedToFlashcards] = useState(false);

  // states used to manage push animation of button
  const [flashcardButtonPressed, setFlashcardButtonPressed] = useState(false);
  const [copyButtonPressed, setCopyButtonPressed] = useState(false);

  const handleCopy = () => {
    setCopyButtonPressed(true);
    toastSuccess(`Successfully Copied ${shortNotifText} to Clipboard`);
    // setTimeout(() => {
    //   setCopyButtonPressed(false);
    // }, 1000);
  };

  const buttonStyles = {
    transition: "opacity 0.5s ease",
    opacity: copyButtonPressed ? 0.1 : 1,
  };

  const handleAddToFlashcards = (collection) => {
    // if (addedToFlashcards) {
    //   setAddedToFlashcards(false);
    //   removeFlashcard(word, form);
    //   toastSuccess(`Successfully Removed ${shortNotifText} From Flashcards`);
    // } else {
    //   setAddedToFlashcards(true);

    let addedTo;
    if (collection) {
      addedTo = addFlashcard(word, form, definition, root, wordID, collection);
    } else {
      addedTo = addFlashcard(word, form, definition, root, wordID);
    }
    toastSuccess(`Successfully Added ${shortNotifText} to ${addedTo}`);

    // console.log("Added to flashcards", addedToFlashcards);
    // button animation
    setFlashcardButtonPressed(true);
    setTimeout(() => {
      setFlashcardButtonPressed(false);
    }, 1000);
  };

  const flashCardButtonStyles = {
    transition: "opacity 0.5s ease",
    opacity: flashcardButtonPressed ? 0.1 : 1,
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleCollectionClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCollectionClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (collectionName) => {
    // setSelectedCollection(collectionName);
    handleAddToFlashcards(collectionName);
    handleCollectionClose();
  };

  const handleAddNewCollection = () => {
    handleCollectionClose();
    Swal.fire({
      title: "Add New Collection",
      input: "text",
      inputPlaceholder: "Enter collection name",
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Collection name cannot be empty";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newCollectionName = result.value;
        // You can perform the action to add the new collection here.
        // console.log("Adding new collection:", newCollectionName);
        addCollectionWithFlashcard(
          word,
          form,
          definition,
          root,
          wordID,
          newCollectionName
        );
        toastSuccess(
          `Successfully added ${shortNotifText} to new collection: ${newCollectionName}`
        );
        handleAddToFlashcards(newCollectionName);
      }
    });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        right: 0,
        p: 0,
        zIndex: 1,
      }}
    >
      {/* button to add to flashcards collection */}

      <Tooltip title={displayShort ? "Show Long Def" : "Show Short Def"}>
        <IconButton
          size="small"
          onClick={(event) => {
            setDisplayShort(!displayShort);
          }}
          style={flashCardButtonStyles}
          // disabled={flashcardButtonPressed}
          sx={{
            p: 1,
            color: displayShort ? "green" : "gray",
            "& svg": {
              fontSize: 14,
            },
          }}
        >
          {displayShort ? (
            <AddCircleOutlineOutlinedIcon />
          ) : (
            <RemoveCircleOutlineOutlinedIcon />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip title="Quick Add">
        <IconButton
          size="small"
          onClick={() => {
            if (getCollectionNames().length) {
              handleAddToFlashcards();
            } else {
              handleAddNewCollection();
            }
          }}
          style={flashCardButtonStyles}
          disabled={flashcardButtonPressed}
          sx={{
            p: 1,
            color: addedToFlashcards ? "green" : "gray",
            "& svg": {
              fontSize: 14,
            },
          }}
        >
          <LibraryAddOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add to Collection">
        <IconButton
          size="small"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          style={flashCardButtonStyles}
          disabled={flashcardButtonPressed}
          sx={{
            p: 1,
            color: addedToFlashcards ? "green" : "gray",
            "& svg": {
              fontSize: 14,
            },
          }}
        >
          <StyleOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCollectionClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuList>
          {getCollectionNames().map((collectionName) => {
            return (
              <MenuItem onClick={() => handleMenuItemClick(collectionName)}>
                {collectionName}
              </MenuItem>
            );
          })}
          <MenuItem onClick={handleAddNewCollection}>
            Add New Collection
          </MenuItem>
        </MenuList>
      </Popover>

      <CopyToClipboard text={`${textToCopy}`} onCopy={handleCopy}>
        <Tooltip title="Copy to Clipboard">
          <IconButton
            size="small"
            style={buttonStyles}
            disabled={copyButtonPressed}
            sx={{
              zIndex: 1,
              color: "gray",
              "& svg": {
                fontSize: 14,
              },
            }}
          >
            <CopyIcon />
          </IconButton>
        </Tooltip>
      </CopyToClipboard>
    </Box>
  );
};

const Definition = () => {
  const [searchInput, setSearchInput] = useState("");

  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    addFlashcard,
    removeFlashcard,
    addCollection,
    flashcards,
  } = useAppContext();

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
const DefinitionCard = ({ formEntry, i, countString, root }) => {
  const [displayShort, setDisplayShort] = useState(false);

  return (
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
      {/* render the box for holding buttons in bottom 
      right of form/noun card */}
      <CardButtons
        shortNotifText={`${formEntry.form} - ${formEntry.text}`}
        textToCopy={`${formEntry.form} - ${formEntry.text}\n${stripHTMLTags(
          formEntry.translation.text
        )}`}
        word={formEntry.text}
        form={formEntry.form}
        definition={
          displayShort
            ? formEntry.translation.short
            : formEntry.translation.text
        }
        wordID={formEntry.id}
        root={root}
        displayShort={displayShort}
        setDisplayShort={setDisplayShort}
      ></CardButtons>

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
        dangerouslySetInnerHTML={{
          __html: displayShort
            ? formEntry.translation.short
            : formEntry.translation.text,
        }}
      >
        {/* { {meaning.definitions.length > 1 && `${idx + 1}. `}{" "}} */}
      </Typography>
    </Box>
  );
};

// renders a single card for a noun
const NounCard = ({ nounEntry, i, countString, root }) => {
  const [displayShort, setDisplayShort] = useState(false);

  let transliterations = nounEntry.transliteration
    ? `${nounEntry.transliteration}`
    : null;
  if (transliterations && nounEntry.plural.transliteration) {
    transliterations = `${transliterations} pl. ${nounEntry.plural.transliteration}`;
  }

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
      <CardButtons
        shortNotifText={`${nounEntry["text"]} ${
          nounEntry["plural"]["text"]
            ? `pl. ${nounEntry["plural"]["text"]}`
            : ""
        }`}
        textToCopy={`${nounEntry["text"]} ${
          nounEntry["plural"]["text"]
            ? `pl. ${nounEntry["plural"]["text"]}`
            : ""
        } \n${stripHTMLTags(nounEntry["translation"]["text"])}`}
        word={nounEntry.text}
        definition={
          displayShort
            ? nounEntry.translation.short
            : nounEntry.translation.text
        }
        wordID={nounEntry.id}
        root={root}
        displayShort={displayShort}
        setDisplayShort={setDisplayShort}
      />

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
        {transliterations}
        {/* {nounEntry.transliteration ? `${nounEntry.transliteration}` : null} */}
      </Typography>
      <Typography
        sx={{ my: 1 }}
        variant="body2"
        color="GrayText"
        key={`NounsDef-${i}-${countString}`}
        dangerouslySetInnerHTML={{
          __html: displayShort
            ? nounEntry["translation"]["short"]
            : nounEntry["translation"]["text"],
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
          {/* TODO */}
          {/* <ReportErrorDialog
            open={reportErrorOpen}
            handleClose={handleCloseReportError}
            word={word}
          /> */}
        </Stack>
      </Tooltip>

      <Fragment key={1}>
        <Divider varianr="inset" light={true} sx={{ display: "none", my: 3 }} />

        {definition["definitions"].map((formEntry, index) => (
          <DefinitionCard
            formEntry={formEntry}
            i={index}
            key={`DefinitionCard-${countString}-${index}`}
            countString={countString}
            root={word}
          />
        ))}
      </Fragment>

      {definition["nouns"].length ? (
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
            <Typography
              sx={{ textTransform: "capitalize" }}
              variant="h6"
              key={`NounsCard-${countString}`}
            >
              Nouns
            </Typography>
          </Stack>

          {definition["nouns"] &&
            definition["nouns"].map((nounEntry, i) => (
              <NounCard
                nounEntry={nounEntry}
                i={i}
                key={`NounCard-${countString}-${i}`}
                countString={countString}
                root={word}
              />
            ))}
        </Fragment>
      ) : null}
    </>
  );
};

export default Definition;
