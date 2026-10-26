import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const WishlistContext = createContext();

function WishlistProvider({ children }) {

  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem("wishlistItems");
    return saved ? JSON.parse(saved) : [];
  });

  // ===========================
  // ADD TO WISHLIST
  // ===========================

  const addToWishlist = (product) => {

    const exist = wishlistItems.find(
      (item) => item.id === product.id
    );

    if (exist) {
      toast("❤️ Already in Wishlist");
      return;
    }

    setWishlistItems([
      ...wishlistItems,
      product,
    ]);

    toast.success("❤️ Added to Wishlist");

  };

  // ===========================
  // REMOVE FROM WISHLIST
  // ===========================

  const removeFromWishlist = (id) => {

    setWishlistItems(
      wishlistItems.filter(
        (item) => item.id !== id
      )
    );

    toast.error("❌ Removed from Wishlist");

  };

  // ===========================
  // LOCAL STORAGE
  // ===========================

  useEffect(() => {

    localStorage.setItem(
      "wishlistItems",
      JSON.stringify(wishlistItems)
    );

  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );

}

export default WishlistProvider;