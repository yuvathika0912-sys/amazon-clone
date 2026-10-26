
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";

import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";

import {
  FaLocationDot,
  FaHeart,
  FaCartShopping,
  FaUser,
} from "react-icons/fa6";

import { IoSearch } from "react-icons/io5";

const categoryOptions = [
  { label: "All", value: "All" },
  { label: "Electronics", value: "Electronics" },
  { label: "Fashion", value: "Fashion" },
  { label: "Beauty", value: "Beauty" },
  { label: "Mobiles", value: "Mobiles" },
  { label: "Groceries", value: "Groceries" },
  { label: "Books", value: "Books" },
];

function Navbar({
  search = "",
  setSearch = () => {},
  selectedCategory = "All",
  setSelectedCategory = () => {},
}) {
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);

  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("EN");

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  const handleCountryChange = (e) => {
    const value = e.target.value;

    if (value !== "India") {
      window.alert(`${value} delivery is Coming Soon!`);
      setCountry("India");
      return;
    }

    setCountry(value);
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;

    if (value !== "EN") {
      window.alert(`${value} language support is Coming Soon!`);
      setLanguage("EN");
      return;
    }

    setLanguage(value);
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar__logo">
        <h2>amazon</h2>
      </Link>

      {/* Delivery Country */}
      <div className="navbar__location">
        <FaLocationDot className="navIcon" />

        <div className="locationText">
          <small>Deliver to</small>

          <select
            className="countrySelect"
            value={country}
            onChange={handleCountryChange}
            aria-label="Select delivery country"
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="UK">UK</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>

      {/* Search and Category */}
      <div className="navbar__search">
        <select
          className="categorySelect"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Select product category"
        >
          {categoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Amazon"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />

        <button
          type="button"
          aria-label="Search products"
          onClick={() => {
            if (!search.trim()) {
              window.alert("Please enter a product name to search.");
            }
          }}
        >
          <IoSearch />
        </button>
      </div>

      {/* Language */}
      <div className="menuItem">
        <select
          className="languageSelect"
          value={language}
          onChange={handleLanguageChange}
          aria-label="Select language"
        >
          <option value="EN">EN</option>
          <option value="தமிழ்">தமிழ்</option>
          <option value="Hindi">Hindi</option>
        </select>
      </div>

      {/* Login */}
      <Link to="/login" className="menuLink">
        <div className="menuItem">
          <FaUser className="userIcon" />
          <h4>Sign In</h4>
        </div>
      </Link>

      {/* Register */}
      <Link to="/register" className="menuLink">
        <div className="menuItem">
          <span className="registerText">New User? Register</span>
        </div>
      </Link>

      {/* Orders */}
      <Link to="/orders" className="menuLink">
        <div className="menuItem">
          <span>Returns</span>
          <h4>&amp; Orders</h4>
        </div>
      </Link>

      {/* Wishlist */}
      <Link to="/wishlist" className="wishlistLink">
        <div className="wishlist">
          <FaHeart />
          <span className="wishlistCount">
            {wishlistItems.length}
          </span>
        </div>
      </Link>

      {/* Cart */}
      <Link to="/cart" className="cartLink">
        <div className="cart">
          <FaCartShopping />
          <span>Cart</span>
          <span className="cartCount">{cartCount}</span>
        </div>
      </Link>
    </header>
  );
}

export default Navbar;
