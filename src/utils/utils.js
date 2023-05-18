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

const toastSuccess = (root) => {
  Toast.fire({
    icon: "success",
    title: "Success!",
    text: `Root entry for ${root} has been updated.`,
  });
};

const toastError = (message) => {
  Toast.fire({
    icon: "error",
    title: "Error!",
    text: message,
  });
};

const noResultsAlert = (word, callback) => {};

function processInputToArabic(str) {
  str = str.replace(/v/g, "ث");
  str = str.replace(/[gG]/g, "غ");
  str = str.replace(/x/g, "خ");
  str = str.replace(/\$/g, "ش");
  str = str.replace(/\*/g, "ذ");
  // Hmm, make the following case insensitive and assign different letters to different cases:
  str = str.replace(/d/g, "د");
  str = str.replace(/D/g, "ض");
  str = str.replace(/z/g, "ز");
  str = str.replace(/Z/g, "ظ");
  str = str.replace(/s/g, "س");
  str = str.replace(/S/g, "ص");
  str = str.replace(/t/g, "ت");
  str = str.replace(/T/g, "ط");
  str = str.replace(/h/g, "ه");
  str = str.replace(/H/g, "ح");
  // Include chat arabic?
  str = str.replace(/[7]/g, "ح");
  str = str.replace(/[3]/g, "ع");
  // Not much iktilaaf over these I guess:
  str = str.replace(/[xX]/g, "خ");
  str = str.replace(/[vV]/g, "ث");
  str = str.replace(/[aA]/g, "ا");
  str = str.replace(/[bB]/g, "ب");
  str = str.replace(/[jJ]/g, "ج");
  str = str.replace(/[rR]/g, "ر");
  str = str.replace(/[eE]/g, "ع");
  str = str.replace(/[fF]/g, "ف");
  str = str.replace(/[qQ]/g, "ق");
  str = str.replace(/[kK]/g, "ك");
  str = str.replace(/[lL]/g, "ل");
  str = str.replace(/[mM]/g, "م");
  str = str.replace(/[nN]/g, "ن");
  str = str.replace(/[wW]/g, "و");
  str = str.replace(/[yY]/g, "ي");

  return str;
}

function stripHTMLTags(str) {
  return str.replace(/<[^>]+>/g, "");
}

export { toastError, noResultsAlert, processInputToArabic, stripHTMLTags };
