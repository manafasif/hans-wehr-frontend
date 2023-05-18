import axios from "axios";

const isDevelopment = process.env.REACT_APP_LOCAL === "1";

let API_URL = "https://logger.hanswehr.com/log";
if (isDevelopment) {
  API_URL = "http://localhost:80/log";
}

const logToConsole = (message) => {
  console.log(message);
};

const logToApi = (level, message) => {
  // Make an API request to log the message
  const body = {
    origin: "frontend",
    level: level,
    message: message,
  };
  axios
    .post(API_URL, body)
    .then((response) => {
      // Handle the response if needed
    })
    .catch((error) => {
      console.error("Failed to log to API:", error);
    });
};

export const logger = {
  debug: (message) => {
    if (isDevelopment) {
      logToConsole(`[DEBUG] ${message}`);
    }
  },
  info: (message) => {
    logToConsole(`[INFO] ${message}`);
    logToApi("info", message);
  },
  error: (message) => {
    logToConsole(`[ERROR] ${message}`);
    logToApi("error", message);
  },
};
