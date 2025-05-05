import React from "react";
import { Container, Typography, Box, Paper, Link } from "@material-ui/core";

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: 40, marginBottom: 40 }}>
      <Paper elevation={3} style={{ padding: 24 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          Last updated: April 9, 2025
        </Typography>

        <Box my={3}>
          <Typography variant="body1" paragraph>
            This app uses Google Sign-In to authenticate users and access Google
            Drive AppData for syncing flashcards.
          </Typography>
        </Box>

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            What information we collect
          </Typography>
          <Typography variant="body1" paragraph>
            - <strong>Email address</strong> (for identification and sync)
          </Typography>
          <Typography variant="body1" paragraph>
            - <strong>Flashcard data</strong> (stored securely in your own
            Google Drive AppData folder)
          </Typography>
        </Box>

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            How we use your information
          </Typography>
          <Typography variant="body1" paragraph>
            - To authenticate you using Google OAuth
          </Typography>
          <Typography variant="body1" paragraph>
            - To store your flashcards to your Google Drive AppData folder
          </Typography>
          <Typography variant="body1" paragraph>
            - We do <strong>not</strong> sell or share your personal information
            with any third parties
          </Typography>
        </Box>

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            Data security
          </Typography>
          <Typography variant="body1" paragraph>
            - Flashcards are stored in your{" "}
            <strong>private Google Drive AppData folder</strong>, inaccessible
            to others
          </Typography>
          <Typography variant="body1" paragraph>
            - No data is stored on external servers
          </Typography>
        </Box>

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            Contact
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
