"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Bounce, ToastContainer } from "react-toastify";
import { persistor, store } from "@/store/store";
import { LanguageProvider } from "@/components/shared/providers/LanguageProvider";

const GlobalProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LanguageProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={2200}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
};

export default GlobalProvider;
