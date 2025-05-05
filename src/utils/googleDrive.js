import { getAccessToken, initGapiClient } from "./googleAuth";

export const uploadFlashcardsToDrive = async (flashcards) => {
  const token = getAccessToken();
  if (!token) throw new Error("No access token found");

  // ✅ Ensure gapi.client is initialized
  if (!window.gapi?.client?.drive) {
    await initGapiClient(); // this safely re-inits if not already done
  }

  const metadata = {
    name: "flashcards.json",
    parents: ["appDataFolder"],
    mimeType: "application/json",
  };

  const fileContent = JSON.stringify(flashcards);
  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    fileContent +
    closeDelimiter;

  const response = await window.gapi.client.request({
    path: "/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  return response;
};

export const fetchFlashcardsFromDrive = async () => {
  // await initGapiClient(); // ✅ Make sure Drive is ready

  const listRes = await window.gapi.client.drive.files.list({
    spaces: "appDataFolder",
    fields: "files(id, name)",
    q: "name='flashcards.json'",
  });

  if (listRes.result.files.length === 0) return null;

  const fileId = listRes.result.files[0].id;
  const fileRes = await window.gapi.client.drive.files.get({
    fileId,
    alt: "media",
  });

  return JSON.parse(fileRes.body);
};
