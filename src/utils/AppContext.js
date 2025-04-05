import React, { createContext, useContext, useState, useEffect } from "react";
import Papa from "papaparse";
import Swal from "sweetalert2";
import axios from "axios";

// Create a context for addCollection and other functions
const AppContext = createContext();

// Create a context provider
export const AppContextProvider = ({ children }) => {
  const LOCAL = process.env.REACT_APP_LOCAL;
  var API_URL = "https://api.hanswehr.com";
  if (LOCAL === "1") {
    API_URL = "http://localhost:8080";
  }

  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || {}
  );

  const addBookmark = (word, definitions) =>
    setBookmarks((oldBookmarks) => ({
      ...oldBookmarks,
      [word]: definitions,
    }));

  const removeBookmark = (word) =>
    setBookmarks((oldBookmarks) => {
      const temp = { ...oldBookmarks };
      delete temp[word];
      return temp;
    });

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  //   flashcards logic

  const [flashcards, setFlashcards] = useState(
    JSON.parse(localStorage.getItem("flashcards")) || {}
  );

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const updateDBFlashcards = (newFlashcards = flashcards) => {
    console.log("updating DB flashcards");
    if (userData) {
      const token = localStorage.getItem("jwtToken");

      const flashcardUpdateRequest = {
        method: "POST",
        url: API_URL + `/flashcards/insert`,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          username: userData.username,
          flashcards: newFlashcards,
        },
      };

      axios
        .request(flashcardUpdateRequest)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const refreshFlashcards = (
    username = userData ? userData.username : null
  ) => {
    if (!userData) {
      return;
    }
    // Get the JWT token from localStorage
    const token = localStorage.getItem("jwtToken");

    const flashcardPullRequest = {
      method: "GET",
      url: API_URL + `/flashcards/get`,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        username: username,
      },
    };

    axios
      .request(flashcardPullRequest)
      .then((response) => {
        console.log(
          "successfully requested flashcards",
          response.data.flashcards
        );
        setFlashcards(response.data.flashcards);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const CURRENT_FLASHCARDS_VERSION = "1.1";
  const flashcards_version = localStorage.getItem("flashcards_version");
  if (
    !flashcards_version ||
    flashcards_version !== CURRENT_FLASHCARDS_VERSION
  ) {
    console.log("wrong flashcard version");
    setFlashcards({});
    localStorage.setItem("flashcards_version", CURRENT_FLASHCARDS_VERSION);
    localStorage.setItem("flashcards", JSON.stringify({}));
    // TODO: implement logic to update flashcard version
  }

  const [lastUsedCollection, setLastUsedCollection] = useState(null);

  const addCollection = (collectionName = lastUsedCollection) => {
    console.log("Added new collection: ", collectionName);
    setFlashcards((oldFlashcards) => {
      const newFlashcards = {
        ...oldFlashcards,
        [collectionName]: [],
      };
      updateDBFlashcards(newFlashcards);
      return newFlashcards;
    });
  };

  const addCollectionWithFlashcard = (
    word,
    form,
    definition,
    root,
    wordID,
    collectionName
  ) => {
    const parsedWord = form ? `${form} - ${word}` : word;
    const newFlashcard = {
      word: parsedWord,
      wordID: wordID,
      root: root,
      definition: definition,
    };
    setFlashcards((oldFlashcards) => {
      const newFlashcards = {
        ...oldFlashcards,
        [collectionName]: [newFlashcard],
      };
      updateDBFlashcards(newFlashcards);
      return newFlashcards;
    });
    setLastUsedCollection(collectionName);
  };

  const renameCollection = (oldName, newName) => {
    if (flashcards.hasOwnProperty(oldName)) {
      const updatedFlashcards = { ...flashcards };
      updatedFlashcards[newName] = updatedFlashcards[oldName];
      delete updatedFlashcards[oldName];
      //   console.log("Updated flashcards:", updatedFlashcards);
      setFlashcards(updatedFlashcards);
      updateDBFlashcards(updatedFlashcards);
    }
    return newName;
  };

  const deleteCollection = (collectionName) => {
    if (flashcards.hasOwnProperty(collectionName)) {
      const updatedFlashcards = { ...flashcards };
      delete updatedFlashcards[collectionName];
      setFlashcards(updatedFlashcards);
      updateDBFlashcards(updatedFlashcards);
      return Object.keys(updatedFlashcards).length
        ? Object.keys(updatedFlashcards)[0]
        : "";
    }
  };

  const getCollectionNames = () => {
    return Object.keys(flashcards);
  };

  const addFlashcard = (
    word,
    form,
    definition,
    root,
    wordID,
    selectedCollection = lastUsedCollection
  ) => {
    if (!selectedCollection) {
      selectedCollection = getCollectionNames()[0];
      console.log(selectedCollection, flashcards[selectedCollection]);
    }
    const parsedWord = form ? `${form} - ${word}` : word;
    const newFlashcards = { ...flashcards };
    const newFlashcard = {
      word: parsedWord,
      wordID: wordID,
      root: root,
      definition: definition,
    };
    console.log(
      "newflashcards selectedcollection:",
      newFlashcards[selectedCollection]
    );
    newFlashcards[selectedCollection].push(newFlashcard);
    // console.log(parsedWord, newFlashcard, newFlashcards);

    setFlashcards(newFlashcards);
    updateDBFlashcards(newFlashcards);

    setLastUsedCollection(selectedCollection);
    return selectedCollection;
  };

  const removeFlashcard = (wordID, selectedCollection = lastUsedCollection) => {
    // Make a copy of the current flashcards in the selected collection
    const flashcardsInCollection = [...flashcards[selectedCollection]];

    // Find the index of the flashcard with the matching wordID
    const indexToRemove = flashcardsInCollection.findIndex(
      (flashcard) => flashcard.wordID === wordID
    );

    // If the flashcard with the specified wordID is found, remove it
    if (indexToRemove !== -1) {
      flashcardsInCollection.splice(indexToRemove, 1);

      // Update the flashcards state with the modified collection
      setFlashcards((prevFlashcards) => {
        const newFlashcards = {
          ...prevFlashcards,
          [selectedCollection]: flashcardsInCollection,
        };
        updateDBFlashcards(newFlashcards);

        return newFlashcards;
      });
    }
  };

  const handleExportCSV = (selectedCollection) => {
    // Extract and format data for export
    const csvData = flashcards[selectedCollection].map((flashcard) => ({
      word: flashcard.word,
      definition: flashcard.definition,
    }));

    Swal.fire({
      title: "Enter filename for CSV export",
      input: "text",
      inputValue: `${selectedCollection}_flashcards.csv`, // Prefill with selectedCollection
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Filename is required";
        }
        // Create a CSV string from the data
        const csvString = Papa.unparse(csvData);

        // Create a Blob with the CSV data
        const blob = new Blob(["\uFEFF", csvString], {
          type: "text/csv;charset=utf-8;",
        });

        // Create a download link and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = value; // Use the entered filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
    });

    // console.log(csvData);

    // Create a CSV string from the data
    // const csvString = Papa.unparse(csvData);

    // // Create a Blob with the CSV data
    // const blob = new Blob(["\uFEFF", csvString], {
    //   type: "text/csv;charset=utf-8;",
    // });

    // // Create a download link and trigger the download
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.style.display = "none";
    // a.href = url;
    // a.download = "flashcards.csv";
    // document.body.appendChild(a);
    // a.click();
    // window.URL.revokeObjectURL(url);
    // document.body.removeChild(a);
  };

  const handleExportJSON = () => {
    // Generate a timestamp
    const timestamp = new Date().toLocaleString().replace(/,|:|\//g, "_");

    // Generate the JSON content
    const jsonContent = JSON.stringify(flashcards);

    // Create a Blob with the JSON content
    const blob = new Blob([jsonContent], { type: "application/json" });

    // Create a download URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element for download
    const a = document.createElement("a");
    a.href = url;

    // Set the download attribute with the timestamped file name
    a.download = `flashcards_${timestamp}.json`;

    // Append the anchor element to the document
    document.body.appendChild(a);

    // Trigger a click on the anchor to start the download
    a.click();

    // Remove the anchor element from the document
    document.body.removeChild(a);

    // Revoke the URL to release resources
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event) => {
    const fileInput = event.target;

    // Check if files property is defined and contains at least one file
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (jsonData.flashcards) {
            setFlashcards(jsonData.flashcards);
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
      fileInput.value = "";
    }
  };

  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData")) || null
  );

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  const handleLogin = async () => {
    const { value: username } = await Swal.fire({
      title: "Enter your username",
      input: "text",
      inputPlaceholder: "Username",
      inputAttributes: {
        required: "true",
      },
    });

    const { value: password } = await Swal.fire({
      title: "Enter your password",
      input: "password",
      inputPlaceholder: "Password",
      inputAttributes: {
        required: "true",
      },
    });

    if (username && password) {
      // Perform login action here
      const loginRequest = {
        method: "POST",
        url: API_URL + `/auth/login`,
        headers: {
          "content-type": "application/json",
        },
        data: {
          username: username,
          password: password,
        },
      };

      axios
        .request(loginRequest)
        .then((response) => {
          console.log(response);

          if (response.data.token) {
            setUserData({
              username: username,
            });
            localStorage.setItem("jwtToken", response.data.token);
            setFlashcards(response.data.flashcards);
            // refreshFlashcards(username);
          } else {
            Swal.fire({
              icon: "error",
              title: "Authentication Failed",
              text: "Invalid username or password",
            });
          }
        })
        .catch((error) => {
          console.log(error, error.response); // Log the error and response for debugging

          if (error.response && error.response.status === 401) {
            // Handle invalid username or password
            Swal.fire({
              icon: "error",
              title: "Authentication Failed",
              text: "Invalid username or password",
            });
          } else {
            // Handle other errors (e.g., unable to connect to API)
            Swal.fire({
              icon: "error",
              title: "Authentication Failed",
              text: "Unable to connect to API",
            });
          }
        });
    }
  };

  const handleRegister = async () => {
    // let usernameAvailable = false;

    // while (!usernameAvailable) {
    Swal.fire({
      title: "Enter your desired username",
      input: "text",
      inputPlaceholder: "Username",
      inputAttributes: {
        // required: "true",
      },
      preConfirm: async (username) => {
        if (!username) {
          Swal.showValidationMessage("Please enter a username");
          return;
        }
        const checkUsernameRequest = {
          method: "POST",
          url: API_URL + `/auth/check-username`,
          headers: {
            "content-type": "application/json",
          },
          data: {
            username: username,
          },
        };

        return axios
          .request(checkUsernameRequest)
          .then((response) => {
            console.log(response);
            if (
              response.status === 200 &&
              "status" in response.data &&
              response.data["status"] === "Successful"
            ) {
              // Username is available, prompt for password
              return Swal.fire({
                title: "Enter your password",
                input: "password",
                inputAttributes: {},
                preConfirm: async (password) => {
                  if (!password) {
                    Swal.showValidationMessage("Please enter a password");
                    return;
                  }

                  // Perform registration with username and password
                  const registerRequest = {
                    method: "POST",
                    url: API_URL + `/auth/register`,
                    headers: {
                      "content-type": "application/json",
                    },
                    data: {
                      username: username,
                      password: password,
                      flashcards: flashcards ? flashcards : {},
                    },
                  };

                  try {
                    const registerResponse = await axios.request(
                      registerRequest
                    );
                    console.log(registerResponse);

                    if (registerResponse.status === 200) {
                      console.log("Successfully registered");
                      setUserData({
                        username: username,
                      });
                      localStorage.setItem(
                        "jwtToken",
                        registerResponse.data.token
                      );

                      return { username: username, isConfirmed: true };
                    } else {
                      console.log("Registration failed");
                      Swal.showValidationMessage(
                        `Error registering: ${registerResponse.data.message}`
                      );
                    }
                  } catch (error) {
                    console.log("Encountered an error", error.toJSON());
                    throw new Error(`Error Registering`);
                  }
                },
              });
            } else {
              console.log("username taken");
              Swal.showValidationMessage(`Username ${username} is taken`);
            }
          })
          .catch(function (error) {
            console.log("encountered an error", error.toJSON());
            throw new Error(`Error Registering`);
            // Swal.showValidationMessage(`Error registering`);
          });
      },
    });
  };

  const handleLogout = () => {
    setUserData(null);
    setFlashcards({});
    localStorage.setItem("jwtToken", null);
  };

  return (
    <AppContext.Provider
      value={{
        bookmarks,
        setBookmarks,
        addBookmark,
        removeBookmark,
        flashcards,
        setFlashcards,
        addCollection,
        removeFlashcard,
        addFlashcard,
        deleteCollection,
        renameCollection,
        getCollectionNames,
        handleExportCSV,
        addCollectionWithFlashcard,
        userData,
        handleLogin,
        handleLogout,
        refreshFlashcards,
        handleRegister,
        updateDBFlashcards,
        handleExportJSON,
        handleImportJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
