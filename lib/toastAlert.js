import React from "react";
import { Bounce, toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 2200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

const renderToastContent = (title, text) =>
  React.createElement(
    "div",
    { className: "space-y-1" },
    React.createElement("p", { className: "font-semibold" }, title),
    text ? React.createElement("p", { className: "text-sm" }, text) : null
  );

export const toastAlert = (type, title, text = "", options = {}) => {
  const content = renderToastContent(title, text);
  const toastOptions = {
    ...baseOptions,
    ...options,
  };

  switch (type) {
    case "info":
      return toast.info(content, toastOptions);
    case "success":
      return toast.success(content, toastOptions);
    case "warning":
      return toast.warning(content, toastOptions);
    case "error":
      return toast.error(content, toastOptions);
    default:
      return toast(content, toastOptions);
  }
};