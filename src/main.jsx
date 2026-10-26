import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import CartProvider from "./context/CartContext.jsx";
import WishlistProvider from "./context/WishlistContext.jsx";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WishlistProvider>
      <CartProvider>

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <App />

      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>
);