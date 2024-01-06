import { Stack, IconButton, Typography, Box, Divider } from "@material-ui/core";
import {
  ArrowBack as BackIcon,
  ConstructionOutlined,
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import { FlashcardArray } from "react-quizlet-flashcard";
import TextField from "@mui/material/TextField";
// import MUIRichTextEditor from "mui-rte";
// import { createTheme, ThemeProvider } from "@mui/material/styles";

import { $getRoot, $getSelection } from "lexical";
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

import { memo } from "react";

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
  "default_collection": {
    "1": {
      "word": "IV - أَكْتَبَ",
      "definition": "to dictate (ه‎ ھـ‎ to s. o. s. th.), make (ه‎ s. o.) write (ھـ‎ s. th.)"
    },
    "2": {
      "word": "I - كَتَبَ",
      "definition": "(<i>katb</i>, كتبة‎ <i>kitba</i>, كتابة‎ <i>kitāba</i>) to write, pen, write down, put down in writing, note down, inscribe, enter, record, book, register (ھـ‎ s. th.); to compose, draw up, indite, draft (ھـ‎ s. th.); to bequeath, make over by will (ھـ‎ ل‎ s. th. to s. o.); to prescribe (ھـ‎ على‎ s. th. to s. o.); to foreordain, destine (ل‎ or ھـ‎ على‎ s. th. to s. o., of God); pass. <i>kutiba </i>to be rated, be foreordained, be destined (ل‎ to s. o.) ; ان‎ نفسه‎ على‎ كتب‎ to be firmly resolved to ..., make it one’s duty to ...; عنه‎ كتب‎ to write from s. o.’s dictation;كتابه‎ كتب‎ (<i>kitābahū</i>) to draw up the marriage contract for s. o., marry s. o. (على‎ to)"
    }
  },
  "test_collection" : {
    "1": {
      "word": "IV - أَكْتَبَ",
      "definition": "to dictate (ه‎ ھـ‎ to s. o. s. th.), make (ه‎ s. o.) write (ھـ‎ s. th.)"
    }
  }
}

 */

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

function Flashcards() {
  const { collectionName } = useParams();

  // Set a default value of "default_collection" if collectionName is not provided
  const selectedCollection = collectionName
    ? collectionName
    : "default_collection";

  const [flashcards, setFlashcards] = useState(
    localStorage.getItem("flashcards")
      ? JSON.parse(localStorage.getItem("flashcards"))
      : []
  );

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    console.log("Edited edit mode");
  };

  const handleDefinitionChange = (index, newDef) => {
    const newFlashcards = [...flashcards];
    newFlashcards[selectedCollection][index].definition = newDef;
    setFlashcards(newFlashcards);
  };

  const handleWordChange = (index, newWord) => {
    const newFlashcards = [...flashcards];
    newFlashcards[selectedCollection][index].word = newWord;
    setFlashcards(newFlashcards);
  };

  const EditableDescription = memo(
    ({ htmlDefinition, setHTMLDefinition = () => {}, word }) => {
      const [editorState, setEditorState] = useState();
      const [editedHTMLDefinition, setEditedHTMLDefinition] = useState(null);
      const editedHTMLRef = useRef(null);
      const [descriptionBox, setDescriptionBox] = useState(
        <StaticDescription htmlDefinition={htmlDefinition} />
      );

      useEffect(() => {
        console.log("editedHTMLDefinition changed: ", editedHTMLDefinition);
        console.log("useEffectHTMLRef val: ", editedHTMLRef);
      }, [editedHTMLDefinition]);

      console.log("component re-rendered");

      // const editorStateRef = useRef(null);

      // const onChange = (newEditorState, editor) => {
      //   setEditorState(newEditorState);
      //   editor.current = newEditorState;
      //   editedHTMLRef.current = $generateHtmlFromNodes(editor, null);
      // };

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
          value={editorState} // Use value prop to set the content
          // onChange={onChange} // Handle content changes
        />
      );

      function RetrieveEditedHTMLPlugin() {
        const [editor] = useLexicalComposerContext();

        useEffect(() => {
          console.log("editMode changes in plugin");
          editor.setEditable(editMode);
        }, [editMode]);

        // useEffect(() => {
        //   console.log("retrieve edited html plugin ran for ", htmlDefinition);
        //   if (!editMode) {
        //     // handle save
        //     console.log(
        //       "internal edited desc: ",
        //       $generateHtmlFromNodes(editor, null)
        //     );
        //     console.log("ref state: ", editedHTMLRef);
        //     setHTMLDefinition(editedHTMLDefinition);
        //     setDescriptionBox(
        //       <StaticDescription htmlDefinition={htmlDefinition} />
        //     );
        //   } else {
        //     // switch to edit mode
        //     setDescriptionBox(editableDescription);
        //   }
        // }, [editMode]);
      }

      useEffect(() => {
        console.log("retrieve edited html plugin ran for ", htmlDefinition);
        if (!editMode) {
          // handle save
          console.log("internal edited desc: ", editedHTMLDefinition);
          console.log("ref state: ", editedHTMLRef);
          setHTMLDefinition(editedHTMLDefinition);
          // setDescriptionBox(
          //   <StaticDescription htmlDefinition={htmlDefinition} />
          // );
        } else {
          // switch to edit mode
          setDescriptionBox(editableDescription);
        }
      }, [editMode]);

      function LoadContentPlugin() {
        const [editor] = useLexicalComposerContext();

        useEffect(() => {
          editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(htmlDefinition, "text/html");

            // Once you have the DOM instance it's easy to generate LexicalNodes.
            const nodes = $generateNodesFromDOM(editor, dom);
            // Select the root
            const root = $getRoot();
            const paragraphNode = $createParagraphNode();

            nodes.forEach((n) => paragraphNode.append(n));

            root.append(paragraphNode);
          });
        }, []); // Empty dependency array to run the code once
      }

      const lexicalConfig = {
        namespace: word,
        onError: (e) => {
          console.log("ERROR:", e);
        },
      };

      const editableDescription = (
        <div style={{ padding: "20px" }}>
          <LexicalComposer initialConfig={lexicalConfig}>
            <RichTextPlugin
              contentEditable={CustomContent}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin
              onChange={(editorState, editor) => {
                editor.update(() => {
                  setEditedHTMLDefinition((prevEditedHTMLDefinition) => {
                    const newEditedHTMLDefinition = String(
                      $generateHtmlFromNodes(editor, null)
                    );
                    console.log(
                      "EDITOR STATE: ",
                      JSON.stringify(editorState),
                      "\nHTML: ",
                      $generateHtmlFromNodes(editor, null),
                      "\nEdited HTML: ",
                      newEditedHTMLDefinition,
                      "\nprevEditedHTMLDefinition",
                      prevEditedHTMLDefinition
                    );
                    return newEditedHTMLDefinition;
                  });
                  editedHTMLRef.current = $generateHtmlFromNodes(editor, null);
                  // console.log(editedHTMLRef.current);
                });
              }}
            />
            <HistoryPlugin />
            <LoadContentPlugin />
            <RetrieveEditedHTMLPlugin />
          </LexicalComposer>
        </div>
      );

      return descriptionBox;

      // return editMode ? (
      //   editableDescription
      // ) : (
      //   <StaticDescription htmlDefinition={htmlDefinition} />
      // );
    }
  );

  EditableDescription.propTypes = {
    setHTMLDefinition: PropTypes.func.isRequired, // Ensure it's defined as a function prop
  };

  function Flashcard({ index, word, definition }) {
    const wordField = (
      <TextField
        id="outlined-multiline-flexible"
        multiline
        style={{
          flex: "1",
          padding: "10px",
        }}
        value={word}
        disabled={!editMode}
      />
    );

    return (
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
          }}
        >
          {wordField}

          <EditableDescription
            htmlDefinition={definition}
            setHTMLDefinition={(newDef) => {
              console.log("NEW DEFINITION", newDef);
            }}
          />
        </Box>
      </>
    );
  }

  return (
    <>
      <Stack
        sx={{ mb: 2 }}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton to="/" component={Link} sx={{ color: "black", mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6">Flashcards</Typography>
        <Button onClick={toggleEditMode} color={editMode ? "success" : "error"}>
          Edit
        </Button>
      </Stack>

      {!!Object.keys(flashcards[selectedCollection]).length ? (
        <Grid container spacing={2}>
          {Object.keys(flashcards[selectedCollection]).map((index) => {
            const wordInfo = flashcards[selectedCollection][index];
            console.log("Index: ", index, " Wordifo: ", wordInfo);
            // const parsedKey = JSON.parse(key);
            const word = wordInfo.word;
            const definition = wordInfo.definition;

            return (
              <Grid item xs={12} key={index}>
                <Flashcard
                  index={index}
                  word={
                    // parsedKey.length === 1
                    //   ? parsedKey[0]
                    //   : `${parsedKey[1]} - ${parsedKey[0]}`
                    word
                  }
                  definition={definition}
                />
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

{
  /*
      <FlashcardArray
        cards={Object.keys(flashcards[selectedCollection]).map(
          (index, wordInfo) => {
            // const parsedKey = JSON.parse(key);
            console.log(flashcards[selectedCollection][index]);

            // const frontHTML = (
            //   <h2 style={{}}>
            //     {parsedKey.length === 1
            //       ? parsedKey[0]
            //       : `${parsedKey[1]} - ${parsedKey[0]}`}
            //   </h2>
            // );

            // const backHTML = (
            //   <p
            //     dangerouslySetInnerHTML={{ __html: flashcards[key] }}
            //     style={{
            //       padding: "15px",
            //       height: "100%", // Ensure the container takes the full height
            //       alignContent: "center",
            //     }}
            //   ></p>
            // );

            // return {
            //   id: index,
            //   frontHTML: frontHTML,
            //   frontContentStyle: {
            //     display: "flex",
            //     justifyContent: "center",
            //     alignItems: "center",
            //   },
            //   backHTML: backHTML,
            //   rearContentStyle: {
            //     display: "flex",
            //     justifyContent: "center",
            //     alignItems: "center",
            //   },
            // };
          }
        )}
      />

        */
}

{
  /* <EditableDescription /> */
}
