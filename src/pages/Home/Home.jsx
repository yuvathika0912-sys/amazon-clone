
import "./Home.css";
import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar/Navbar";
import SecondaryNavbar from "../../components/SecondaryNavbar/SecondaryNavbar";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import Category from "../../components/Category/Category";
import ProductCard from "../../components/ProductCard/ProductCard";
import Footer from "../../components/Footer/Footer";

import api from "../../services/api";
import { getSellingPrice } from "../../utils/currency";

// Map Navbar categories to actual API categories
const categoryGroups = {
  electronics: [
    "electronics",
    "smartphones",
    "laptops",
    "tablets",
    "mobile-accessories",
  ],
  fashion: [
    "fashion",
    "tops",
    "womens-dresses",
    "womens-shoes",
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
    "womens-watches",
    "womens-bags",
    "womens-jewellery",
    "sunglasses",
  ],
  beauty: [
    "beauty",
    "fragrances",
    "skin-care",
    "skincare",
  ],
  mobiles: ["smartphones"],
  groceries: ["groceries"],
  books: ["books"],
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        if (isMounted) {
          setProducts(productList);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);

        if (isMounted) {
          setProducts([]);
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const searchText = normalize(search);

      const title = normalize(product.title || product.name);
      const category = normalize(product.category);
      const brand = normalize(product.brand);

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        category.includes(searchText) ||
        brand.includes(searchText);

      const selected = normalize(selectedCategory);
      const allowedCategories = categoryGroups[selected] || [];

      const matchesCategory =
        selected === "all" ||
        category === selected ||
        allowedCategories.includes(category);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort using the final selling price
      const priceA = getSellingPrice(a.price);
      const priceB = getSellingPrice(b.price);

      switch (sortBy) {
        case "low":
          return priceA - priceB;

        case "high":
          return priceB - priceA;

        case "rating":
          return Number(b.rating || 0) - Number(a.rating || 0);

        case "name":
          return String(a.title || a.name || "").localeCompare(
            String(b.title || b.name || "")
          );

        default:
          return 0;
      }
    });

  // Shared Navbar props
  const navbarProps = {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
  };

  // Loading screen
  if (loading) {
    return (
      <>
        <Navbar {...navbarProps} />

        <div className="loadingContainer">
          <h2 className="loading">Loading Products...</h2>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar {...navbarProps} />

      <SecondaryNavbar />

      <HeroBanner />

      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Sort bar */}
      <div className="sortBar">
        <h3>{filteredProducts.length} Products</h3>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort products"
        >
          <option value="default">Sort By</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="name">Name A → Z</option>
        </select>
      </div>

      {/* Active filters */}
      {(search.trim() || normalize(selectedCategory) !== "all") && (
        <div className="activeFilters">
          {search.trim() && (
            <span>
              Search: <strong>{search}</strong>
            </span>
          )}

          {normalize(selectedCategory) !== "all" && (
            <span>
              Category: <strong>{selectedCategory}</strong>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSortBy("default");
            }}
          >
            Clear Filters ✕
          </button>
        </div>
      )}

      {/* Products */}
      <div className="homeProducts">
        {error ? (
          <div className="noProducts">
            <h2>{error}</h2>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <h2 className="noProducts">
            😔 No Products Found
          </h2>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.title || product.name}
              price={getSellingPrice(product.price)}
              image={product.thumbnail || product.image}
              rating={product.rating || 4.5}
            />
          ))
        )}
      </div>

      <Footer />
    </>
  );
}

export default Home;
