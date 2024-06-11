import { Stack, IconButton, Typography, Box, Divider } from "@material-ui/core";
import {
  ArrowBack as BackIcon,
  ConstructionOutlined,
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { Card, CardContent, Menu } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { FlashcardArray } from "react-quizlet-flashcard";
import TextField from "@mui/material/TextField";
// import MUIRichTextEditor from "mui-rte";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";

import { $createTextNode, $getRoot, $getSelection } from "lexical";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useRef } from "react";
import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes } from "lexical";
import { $createParagraphNode } from "lexical";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { Select, MenuItem, Tooltip } from "@material-ui/core";
import { memo } from "react";
import { useAppContext } from "../../utils/AppContext";
import CollectionList from "./CollectionList";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import { toastSuccess } from "../../utils/utils";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
const testHTML =
  "(<i>katb</i>, كتبة‎ <i>kitba</i>, كتابة‎ <i>kitāba</i>) to write, pen, write down, put down in writing, note down, inscribe, enter, record, book, register (ھـ‎ s. th.); to compose, draw up, indite, draft (ھـ‎ s. th.); to bequeath, make over by will (ھـ‎ ل‎ s. th. to s. o.); to prescribe (ھـ‎ على‎ s. th. to s. o.); to foreordain, destine (ل‎ or ھـ‎ على‎ s. th. to s. o., of God); pass. <i>kutiba </i>to be rated, be foreordained, be destined (ل‎ to s. o.) ; ان‎ نفسه‎ على‎ كتب‎ to be firmly resolved to ..., make it one’s duty to ...; عنه‎ كتب‎ to write from s. o.’s dictation;كتابه‎ كتب‎ (<i>kitābahū</i>) to draw up the marriage contract for s. o., marry s. o. (على‎ to)";

/**
  flashcard data layout:

  {
    collection name: {
      index: {
        word: ...
        form: ... 
        definition: ... 
        root?
      }
    },

    
  }

  ex:

{
  "default_collection": [
    {
      "word": "IV - أَكْتَبَ",
      "definition": "to dictate (ه‎ ھـ‎ to s. o. s. th.), make (ه‎ s. o.) write (ھـ‎ s. th.)"
    },
    {
      "word": "I - كَتَبَ",
      "definition": "(<i>katb</i>, كتبة‎ <i>kitba</i>, كتابة‎ <i>kitāba</i>) to write, pen, write down, put down in writing, note down, inscribe, enter, record, book, register (ھـ‎ s. th.); to compose, draw up, indite, draft (ھـ‎ s. th.); to bequeath, make over by will (ھـ‎ ل‎ s. th. to s. o.); to prescribe (ھـ‎ على‎ s. th. to s. o.); to foreordain, destine (ل‎ or ھـ‎ على‎ s. th. to s. o., of God); pass. <i>kutiba </i>to be rated, be foreordained, be destined (ل‎ to s. o.) ; ان‎ نفسه‎ على‎ كتب‎ to be firmly resolved to ..., make it one’s duty to ...; عنه‎ كتب‎ to write from s. o.’s dictation;كتابه‎ كتب‎ (<i>kitābahū</i>) to draw up the marriage contract for s. o., marry s. o. (على‎ to)"
    }
  ],
  "test_collection" : [
    {
      "word": "IV - أَكْتَبَ",
      "definition": "to dictate (ه‎ ھـ‎ to s. o. s. th.), make (ه‎ s. o.) write (ھـ‎ s. th.)"
    }
  ]
}

 */

function removeConsecutiveWhitespaceTags(htmlString) {
  return htmlString.replace(/<p><br><\/p>/g, "");
}

function StaticDescription({ htmlDefinition }) {
  return (
    <Typography
      sx={{ my: 1 }}
      style={{
        flex: "3",
        padding: "10px",
      }}
      variant="body2"
      color="GrayText"
      dangerouslySetInnerHTML={{ __html: htmlDefinition }}
    ></Typography>
  );
}

function LoadContentPlugin({ initialDefinition }) {
  const [editor] = useLexicalComposerContext();

  // editor.registerRootListener((root) => {
  //   if (!root) return;
  //   const style = root.style;
  //   style.wordBreak = "break-all";
  // });

  useEffect(() => {
    editor.update(() => {
      // Select the root
      const root = $getRoot();

      // if (!root.isEmpty()) {
      //   root.clear
      // }

      const parser = new DOMParser();
      const dom = parser.parseFromString(initialDefinition, "text/html");

      // Once you have the DOM instance it's easy to generate LexicalNodes.
      const nodes = $generateNodesFromDOM(editor, dom);

      // console.log("Generated nodes:");
      // console.log(nodes);

      const paragraphNode = $createParagraphNode();

      nodes.forEach((n) => paragraphNode.append(n));

      root.clear();
      root.append(paragraphNode);
    });
  }, []); // Empty dependency array to run the code once
}

const CustomContent = (
  <ContentEditable
    style={{
      position: "relative",
      borderColor: "rgba(255,211,2,0.68)",
      border: "1px solid gray",
      borderRadius: "5px",
      maxWidth: "100%",
      padding: "10px",
    }}
    // value={editorState} // Use value prop to set the content
    // onChange={onChange} // Handle content changes
  />
);

const lexicalConfig = {
  namespace: "test",
  onError: (e) => {
    console.log("ERROR:", e);
  },
};

const Flashcards = () => {
  const {
    flashcards,
    setFlashcards,
    removeFlashcard,
    handleExportCSV,
    getCollectionNames,
    refreshFlashcards,
    userData,
    updateDBFlashcards,
    handleExportJSON,
  } = useAppContext();

  const [selectedCollection, setSelectedCollection] = useState(
    getCollectionNames().length ? getCollectionNames()[0] : ""
  );

  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    // console.log("Edited edit mode");
  };

  const [edited, setEdited] = useState(false);

  useEffect(() => {
    // console.log("Edit mode changed");
    // console.log("New Flashcards: ", flashcards);
    if (edited && !editMode) {
      for (const index in flashcards[selectedCollection]) {
        if (flashcards[selectedCollection].hasOwnProperty(index)) {
          const card = flashcards[selectedCollection][index];
          if (card.definition) {
            // Apply the function to the definition property
            card.definition = removeConsecutiveWhitespaceTags(card.definition);
          }
        }
      }
      updateDBFlashcards(flashcards);
    } else if (editMode) {
      // set flag to show that it's been edited
      setEdited(true);
    }
  }, [editMode]);

  useEffect(() => {
    console.log("refreshflashcards ran");
    if (userData) {
      refreshFlashcards();
    }
  }, []);

  const handleDefinitionChange = (index, newDef) => {
    // console.log("reciveded newDef", newDef, flashcards);
    const newFlashcards = { ...flashcards };
    // console.log(newFlashcards, newFlashcards[selectedCollection]);
    newFlashcards[selectedCollection][index].definition = newDef;
    setFlashcards(newFlashcards);
    // updateDBFlashcards(newFlashcards);
  };

  const handleWordChange = (index, newWord) => {
    const newFlashcards = [...flashcards];
    newFlashcards[selectedCollection][index].word = newWord;
    setFlashcards(newFlashcards);
    // updateDBFlashcards(newFlashcards);
  };

  // const flashCardButtonStyles = {
  //   transition: "opacity 0.5s ease",
  //   opacity: flashcardButtonPressed ? 0.1 : 1,
  // };

  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fileInputRef = useRef(null);

  const handleImportJSON = () => {
    // Trigger a click on the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleMenuClose();
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (jsonData) {
            setFlashcards(jsonData);
            updateDBFlashcards(jsonData);
            // Additional processing or updating state as needed
            console.log(
              "Flashcards imported successfully:",
              jsonData.flashcards
            );
          } else {
            console.error('Invalid JSON format: Missing "flashcards" key');
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file);
      // Clear the file input value to allow re-uploading the same file
      event.target.value = "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "pink",
      }}
    >
      <Stack
        sx={{ mb: 2, backgroundColor: "blue" }}
        direction="row"
        justifyContent="space-between"
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton to="/" component={Link} sx={{ color: "black", mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6">Flashcards</Typography>
        </div>

        <Button onClick={toggleEditMode} color={editMode ? "success" : "error"}>
          {/* Edit */}
          {editMode ? "Save" : "Edit"}
        </Button>

        {/* <Button
          onClick={() => {
            handleExportCSV(selectedCollection);
          }}
        >
          Export CSV
        </Button> */}

        <Button onClick={handleMenuOpen}>Export</Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleExportCSV(selectedCollection)}>
            Export CSV
          </MenuItem>
          <MenuItem onClick={handleExportJSON}>Export JSON</MenuItem>
          <MenuItem onClick={(e) => handleImportJSON(e)}>Import JSON</MenuItem>
        </Menu>
        {/* Hidden file input */}
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
      </Stack>

      {flashcards.hasOwnProperty(selectedCollection) ? (
        <FlashcardArray
          cards={Object.keys(flashcards[selectedCollection]).map((index) => {
            const wordInfo = flashcards[selectedCollection][index];
            // const parsedKey = JSON.parse(key);
            // console.log(flashcards[selectedCollection][index]);

            const frontHTML = <h2 style={{}}>{wordInfo.word}</h2>;

            const backHTML = (
              <p
                dangerouslySetInnerHTML={{ __html: wordInfo.definition }}
                style={{
                  padding: "15px",
                  height: "100%", // Ensure the container takes the full height
                  alignContent: "center",
                }}
              ></p>
            );

            return {
              id: index,
              frontHTML: frontHTML,
              frontCardStyle: {
                overflowY: "auto",
              },
              backCardStyle: {
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },

              frontContentStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              backHTML: backHTML,
              backContentStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            };
          })}
        />
      ) : null}

      <CollectionList
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
      />

      {flashcards.hasOwnProperty(selectedCollection) &&
      !!Object.keys(flashcards[selectedCollection]).length ? (
        <Grid container spacing={2} style={{ width: "100%" }}>
          {Object.keys(flashcards[selectedCollection]).map((index) => {
            const wordInfo = flashcards[selectedCollection][index];
            // console.log("Index: ", index, " Wordifo: ", wordInfo);
            // const parsedKey = JSON.parse(key);
            const word = wordInfo.word;
            const definition = wordInfo.definition;

            return (
              <Grid item xs={12} key={index}>
                <>
                  <Box
                    key={index}
                    sx={{
                      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
                      backgroundColor: "#fff",
                      p: 2,
                      borderRadius: 2,
                      mt: 3,
                      position: "relative",
                      display: "flex",
                      // marginLeft: "auto", // To center-align
                      // marginRight: "auto", // To center-align
                      // width: "100%", // To match the width of flashcards
                      // maxWidth: "600px", // Adjust the maximum width as needed
                    }}
                  >
                    {/* word field */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {editMode ? (
                        <TextField
                          // id="outlined-multiline-flexible"
                          id="standard"
                          variant={editMode ? "outlined" : "standard"}
                          multiline
                          style={{
                            flex: "1 0 25%",
                            padding: "10px",
                          }}
                          value={word}
                          InputProps={{
                            disableUnderline: true,
                            style: { fontSize: 16, fontWeight: 800 },
                          }}
                          InputLabelProps={{
                            style: { fontSize: 16, fontWeight: 800 },
                          }}
                          disabled={!editMode}
                        />
                      ) : (
                        <Typography color="GrayText" variant="subtitle1">
                          {word}
                        </Typography>
                      )}
                    </div>

                    {/* definition field */}

                    {editMode ? (
                      <div style={{ padding: "10px", flex: "1 0 75%" }}>
                        <LexicalComposer initialConfig={lexicalConfig}>
                          <RichTextPlugin
                            contentEditable={CustomContent}
                            ErrorBoundary={LexicalErrorBoundary}
                          />
                          <OnChangePlugin
                            onChange={(currentEditorState, editor) => {
                              editor.update(() => {
                                const newEditedHTMLDefinition =
                                  $generateHtmlFromNodes(editor, null);
                                // console.log("Editor state:");
                                // console.log(currentEditorState);
                                // console.log(
                                //   "\nEdited HTML: ",
                                //   newEditedHTMLDefinition
                                // );
                                handleDefinitionChange(
                                  index,
                                  newEditedHTMLDefinition
                                );
                              });
                            }}
                          />
                          <HistoryPlugin />
                          <LoadContentPlugin initialDefinition={definition} />
                        </LexicalComposer>
                      </div>
                    ) : (
                      <div style={{ flex: "1 0 75%" }}>
                        <StaticDescription htmlDefinition={definition} />

                        {/* card buttons in bottom right */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            p: 0,
                            zIndex: 1,
                          }}
                        >
                          {/* button to go to def page */}
                          <Tooltip title="View Original Definition">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                history.push(`/search/${wordInfo.root}`);
                              }}
                              // style={flashCardButtonStyles}
                              // disabled={flashcardButtonPressed}
                              sx={{
                                p: 1,
                                color: "gray",
                                "& svg": {
                                  fontSize: 14,
                                },
                              }}
                            >
                              <SearchOutlinedIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Flashcard">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                removeFlashcard(
                                  wordInfo.wordID,
                                  selectedCollection
                                );
                                toastSuccess(
                                  `Successfully deleted flashcard for ${word}`
                                );
                              }}
                              // style={flashCardButtonStyles}
                              // disabled={flashcardButtonPressed}
                              sx={{
                                p: 1,
                                color: "gray",
                                "& svg": {
                                  fontSize: 14,
                                },
                              }}
                            >
                              <RemoveCircleOutlineOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </div>
                    )}
                  </Box>
                </>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography sx={{ mt: 5 }} align="center">
          No Flashcards
        </Typography>
      )}
    </div>
  );
};

export default Flashcards;
