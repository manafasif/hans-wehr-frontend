import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const toastSuccess = (root) => {
  Toast.fire({
    icon: "success",
    title: "Success!",
    text: `Root entry for ${root} has been updated.`,
  });
};

export const toastError = (message) => {
  Toast.fire({
    icon: "error",
    title: "Error!",
    text: message,
  });
};

// export const noResultsAlert = (word, callback) => {};

export function processInputToArabic(input) {
  const transliterationMap = {
    a: "ا",
    b: "ب",
    t: "ت",
    th: "ث",
    j: "ج",
    H: "ح",
    7: "ح",
    kh: "خ",
    5: "خ",
    d: "د",
    dh: "ذ",
    r: "ر",
    z: "ز",
    s: "س",
    sh: "ش",
    S: "ص",
    9: "ص",
    D: "ض",
    T: "ط",
    6: "ط",
    Z: "ظ",
    gh: "غ",
    3: "ع",
    f: "ف",
    q: "ق",
    8: "ق",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    h: "ه",
    w: "و",
    y: "ي",
    2: "ء",
  };

  const convertToken = (token) => {
    let result = "";
    let i = 0;
    while (i < token.length) {
      const rawTwoChar = token.slice(i, i + 2);
      const rawOneChar = token[i];

      const twoChar = transliterationMap[rawTwoChar]
        ? rawTwoChar
        : rawTwoChar.toLowerCase();
      const oneChar = transliterationMap[rawOneChar]
        ? rawOneChar
        : rawOneChar.toLowerCase();

      if (transliterationMap[twoChar]) {
        result += transliterationMap[twoChar];
        i += 2;
      } else if (transliterationMap[oneChar]) {
        result += transliterationMap[oneChar];
        i += 1;
      } else {
        result += rawOneChar; // unknown, pass through
        i += 1;
      }
    }
    return result;
  };

  return input.split(" ").map(convertToken).join("");
}

export function stripHTMLTags(str) {
  return str.replace(/<[^>]+>/g, "");
}

export const getSarfAlternates = async (input) => {
  if (input.length !== 3) {
    console.warn("[getSarfAlternates] Input must be 3 letters:", input);
    return [];
  }

  const dbRequest = window.indexedDB.open("hanswehr");

  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction("entries", "readonly");
      const store = tx.objectStore("entries");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const entries = getAllRequest.result;
        const existingRoots = new Set();

        entries.forEach((entry) => {
          (entry.searchableRoots || []).forEach((r) => existingRoots.add(r));
        });

        const [f, a, l] = input;
        const candidates = new Set();

        // Apply transformation rules
        if (a === "ا") {
          candidates.add(f + "و" + l);
          candidates.add(f + "ي" + l);
        } else {
          candidates.add(f + a + "و");
          candidates.add(f + a + "ي");
          candidates.add("و" + a + l);
          candidates.add("ي" + a + l);
        }

        const candidateArray = Array.from(candidates);
        const matched = candidateArray.filter((root) =>
          existingRoots.has(root)
        );

        // 🔍 Debug logs
        console.log("[getSarfAlternates] Input:", input);
        console.log("[getSarfAlternates] Candidates:", candidateArray);
        console.log(
          "[getSarfAlternates] Sample of existing roots:",
          Array.from(existingRoots).slice(0, 10)
        );
        console.log("[getSarfAlternates] Matches:", matched);

        resolve(matched);
      };

      getAllRequest.onerror = (e) => {
        console.error("[getSarfAlternates] getAllRequest error:", e);
        reject(e);
      };
    };

    dbRequest.onerror = (e) => {
      console.error("[getSarfAlternates] DB open error:", e);
      reject(e);
    };
  });
};
