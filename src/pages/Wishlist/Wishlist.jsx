
import "./Wishlist.css";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../context/WishlistContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } =
    useContext(WishlistContext);

  const formatINR = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <div className="wishlistPage">
        <div className="wishlistHeader">
          <h1>❤️ My Wishlist</h1>

          <Link to="/" className="backHomeBtn">
            ← Back to Home
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="emptyWishlist">
            <div className="emptyWishlistIcon">🤍</div>

            <h2>Your Wishlist is Empty</h2>

            <p>Save your favourite products here for later!</p>

            <Link to="/" className="backHomeBtn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlistGrid">
            {wishlistItems.map((item) => (
              <div className="wishlistCard" key={item.id}>
                <div className="wishlistImage">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.name || item.title || "Product"}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </div>

                <div className="wishlistDetails">
                  <h3>{item.name || item.title || "Product"}</h3>

                  <p className="wishlistPrice">
                    {formatINR(item.price)}
                  </p>

                  <button
                    className="removeWishlistBtn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Wishlist;
