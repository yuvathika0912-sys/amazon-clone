
import "./ProductCard.css";
import { Link } from "react-router-dom";
import { useContext } from "react";

import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";

import {
  FaHeart,
  FaRegHeart,
  FaCartShopping,
} from "react-icons/fa6";

function ProductCard({
  id,
  name,
  price,
  image,
  rating = 4.5,
}) {
  const { addToCart } = useContext(CartContext);

  const {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useContext(WishlistContext);

  // Home.jsx already passes the final selling price.
  // Do NOT multiply the price again here.
  const priceInINR = Math.max(0, Number(price) || 0);

  // Show 20% discount based on the selling price.
  const discountPercentage = 20;

  const originalPrice = Number(
    (priceInINR / (1 - discountPercentage / 100)).toFixed(2)
  );

  const discountAmount = Number(
    (originalPrice - priceInINR).toFixed(2)
  );

  // Product object shared with cart and wishlist.
  const product = {
    id,
    name,
    title: name,
    price: priceInINR,
    originalPrice,
    discountPercentage,
    discountAmount,
    discountApplied: true,
    priceAdjusted: true,
    image,
    thumbnail: image,
    rating,
  };

  const isWishlisted = wishlistItems.some(
    (item) => item.id === id
  );

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="productCard">
      <button
        type="button"
        className={`wishlistBtn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlist}
        aria-label={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      <Link to={`/product/${id}`} className="productLink">
        <img src={image} alt={name} />
      </Link>

      <span className="discountBadge">
        {discountPercentage}% OFF
      </span>

      <h3>{name}</h3>

      <div className="rating">
        ⭐ {Number(rating || 4.5).toFixed(1)}
      </div>

      <div className="priceBox">
        <span className="oldPrice">
          {formatPrice(originalPrice)}
        </span>

        <span className="price">
          {formatPrice(priceInINR)}
        </span>
      </div>

      <p className="discountSaving">
        You save {formatPrice(discountAmount)}
      </p>

      <p className="delivery">🚚 FREE Delivery</p>

      <button
        type="button"
        className="cartBtn"
        onClick={handleAddToCart}
      >
        <FaCartShopping />
        <span>Add to Cart</span>
      </button>
    </div>
  );
}

export default ProductCard;
