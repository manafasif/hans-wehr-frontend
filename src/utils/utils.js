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

export { toastError, noResultsAlert };
