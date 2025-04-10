let accessToken = null;
let tokenClient = null;

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

export const initGapiClient = () =>
  new Promise((resolve, reject) => {
    window.gapi.load("client", async () => {
      try {
        await window.gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });
        resolve();
      } catch (err) {
        console.error("GAPI client init failed", err);
        reject(err);
      }
    });
  });

export const initTokenClient = () => {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error("Token error", tokenResponse);
        return;
      }
      accessToken = tokenResponse.access_token;
      sessionStorage.setItem("accessToken", accessToken);
    },
  });
};

export const signInWithGoogle = async (onSuccess) => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) initTokenClient();

    tokenClient.callback = async (tokenResponse) => {
      if (tokenResponse.error || !tokenResponse.access_token) {
        reject(new Error("Access token not received"));
        return;
      }

      const accessToken = tokenResponse.access_token;
      sessionStorage.setItem("accessToken", accessToken);

      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const userInfo = await userInfoRes.json();
      const fullUser = { ...userInfo, accessToken };

      if (onSuccess) onSuccess(fullUser); // 🔁 optional callback
      resolve(fullUser); // ✅ always resolve with data
    };

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

export const getAccessToken = () => {
  const token = accessToken || sessionStorage.getItem("accessToken");
  if (!token) {
    console.warn("Access token is missing — make sure user is signed in");
  }
  return token;
};

export const signOutGoogle = () => {
  accessToken = null;
  sessionStorage.removeItem("accessToken");
  window.google?.accounts.id?.disableAutoSelect();
};
