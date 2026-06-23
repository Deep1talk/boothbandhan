import Swal from "sweetalert2";

const baseOptions = {
  confirmButtonColor: "#973c00",
  allowOutsideClick: false,
  allowEscapeKey: false,
  customClass: {
    popup: "rounded-2xl",
    confirmButton: "rounded-lg px-5 py-2",
    cancelButton: "rounded-lg px-5 py-2",
  },
};

export const showSuccessAlert = (title, text, options = {}) =>
  Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text,
    ...options,
  });

export const showErrorAlert = (title, text, options = {}) =>
  Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text,
    ...options,
  });

export const showConfirmAlert = (title, text, options = {}) =>
  Swal.fire({
    ...baseOptions,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    ...options,
  });
