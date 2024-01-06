import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import IconButton from "@mui/material/IconButton";
import styled from "@emotion/styled";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRightRounded";
import Chip from "@mui/material/Chip";
import { useAppContext } from "../../utils/AppContext";
import { Grid, Card, CardContent, Typography, Tab } from "@material-ui/core";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Import MoreVertIcon
import { useState } from "react";
import { toastSuccess } from "../../utils/utils";
import Swal from "sweetalert2";

import TextField from "@mui/material/TextField";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
const StyledChip = styled(Chip)`
  border-radius: 16px;
  text-transform: capitalize;
  color: ${(props) => (props.selected ? "#FFFFFF" : "#6877AE")};
  background-color: ${(props) => (props.selected ? "#03194F" : "#FFFFFF")};
  border: 4px solid ${"#03194F"};
  border-color: ${(props) =>
    props.selected ? "#03194F" : "rgba(0, 83, 229, 0.12)"};

  .MuiChip-root&:hover {
    background-color: ${(props) => (props.selected ? "#03194F" : "")};
  }
`;

const StyledIconButton = styled(IconButton)`
  left: ${(props) => (props.isLeft ? "0" : "none")};
  right: ${(props) => (props.isLeft ? "none" : "0")};

  height: 32px;
  width: 32px;
  position: absolute;
  border-radius: 16px;
  border: 1px solid gray;
  background-color: white;
  color: rgba(0, 83, 229, 1);
  border-color: rgba(0, 83, 229, 0.12);

  z-index: 1;
  opacity: 1;
  margin: 20px;

  :hover {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
      0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12);
    border-color: white;
    background-color: inherit;
  }
`;

function OldCollectionList() {
  const [chipData, setChipData] = React.useState([
    { key: 0, label: "Angular" },
    { key: 1, label: "jQuery" },
    { key: 2, label: "Polymer" },
    { key: 3, label: "React" },
    { key: 4, label: "Vue" },
    { key: 5, label: "Knockout" },
    { key: 6, label: "Ember" },
    { key: 7, label: "D3" },
    { key: 8, label: "Google Charts" },
    { key: 9, label: "C+" },
    { key: 10, label: "C++" },
    { key: 11, label: "NodeJS" },
  ]);

  const [selectedIndustryFilter, setSelectedIndustryFilter] =
    React.useState("Angular");

  return (
    <Box>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        width="600px"
        ScrollButtonComponent={(props) => {
          if (props.direction === "left") {
            return (
              <StyledIconButton isLeft {...props}>
                <ChevronLeftIcon />
              </StyledIconButton>
            );
          } else if (props.direction === "right") {
            return (
              <StyledIconButton {...props}>
                <ChevronRightIcon />
              </StyledIconButton>
            );
          } else {
            return null;
          }
        }}
      >
        {chipData.map((data) => {
          return (
            <StyledChip
              label={data.label}
              onClick={() => {
                setSelectedIndustryFilter(data.label);
                console.log(data.label);
              }}
              selected={data.label === selectedIndustryFilter}
              key={data.key}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}

const CollectionList = ({ selectedCollection, setSelectedCollection }) => {
  const { flashcards, deleteCollection, renameCollection } = useAppContext(); // Access the collections from the context
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const handleRenameCollection = (selectedCollection) => {
    handleClosePopover();
    Swal.fire({
      title: `Rename Collection: ${selectedCollection}`,
      input: "text",
      inputPlaceholder: "Enter new collection name",
      showCancelButton: true,
      confirmButtonText: "Rename",
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
        console.log("Renaming collection:", newCollectionName);

        setSelectedCollection(
          renameCollection(selectedCollection, newCollectionName)
        );

        toastSuccess(
          `Successfully renamed collection "${selectedCollection}" to "${newCollectionName}"`
        );
      }
    });
  };

  const handleDeleteCollection = (selectedCollection) => {
    handleClosePopover();
    Swal.fire({
      title: `Delete Collection: ${selectedCollection}`,
      text: "Are you sure you want to delete this collection? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF5733", // You can customize the color
    }).then((result) => {
      if (result.isConfirmed) {
        // You can perform the action to delete the collection here.
        console.log("Deleting collection:", selectedCollection);

        setSelectedCollection(deleteCollection(selectedCollection));

        Swal.fire(
          "Deleted!",
          `Collection "${selectedCollection}" has been deleted.`,
          "success"
        );
      }
    });
  };

  return (
    <Box maxWidth="600px">
      <Tabs
        value={selectedCollection}
        onChange={(e, value) => {
          setSelectedCollection(value);
        }}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {Object.keys(flashcards).map((collectionName) => {
          return (
            <Tab
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>{collectionName}</span>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    aria-label="edit"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </div>
              }
              value={collectionName}
            />
          );
        })}
      </Tabs>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
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
          <MenuItem onClick={() => handleRenameCollection(selectedCollection)}>
            Rename Collection
          </MenuItem>
          <MenuItem onClick={() => handleDeleteCollection(selectedCollection)}>
            Delete Collection
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
    // <div
    //   style={{
    //     maxHeight: "200px",
    //     overflowX: "auto",
    //     whiteSpace: "nowrap",
    //     width: "100%",
    //   }}
    // >
    //   <Grid container spacing={2}>
    //     {Object.keys(flashcards).map((collectionName) => (
    //       <Grid item key={collectionName}>
    //         <Card style={{ minWidth: 200 }}>
    //           <CardContent>
    //             <Typography variant="h6">{collectionName}</Typography>
    //           </CardContent>
    //         </Card>
    //       </Grid>
    //     ))}
    //   </Grid>
    // </div>
  );
};

export default CollectionList;
