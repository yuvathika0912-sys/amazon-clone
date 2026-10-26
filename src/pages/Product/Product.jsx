
import "./Product.css";

import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import { CartContext } from "../../context/CartContext";

import { getSellingPrice, formatINR } from "../../utils/currency";

import toast from "react-hot-toast";

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await api.get(`/products/${id}`);
        const productData = response.data;

        if (!isMounted) return;

        setProduct(productData);

        const firstImage =
          productData.images?.[0] ||
          productData.thumbnail ||
          productData.image ||
          "";

        setSelectedImage(firstImage);
      } catch (err) {
        console.error("Product Fetch Error:", err);

        if (isMounted) {
          setError(true);
          toast.error("Unable to load product");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <Navbar search="" setSearch={() => {}} />

        <div className="productLoading">
          <button
            type="button"
            className="backHomeBtn"
            onClick={handleBackToHome}
          >
            ← Back to Home
          </button>

          <div className="loadingSpinner"></div>
          <h2>Loading Product...</h2>
        </div>

        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar search="" setSearch={() => {}} />

        <div className="productError">
          <button
            type="button"
            className="backHomeBtn"
            onClick={handleBackToHome}
          >
            ← Back to Home
          </button>

          <h2>Product Not Found</h2>

          <Link to="/" className="continueShoppingBtn">
            Continue Shopping
          </Link>
        </div>

        <Footer />
      </>
    );
  }

  // Apply the existing selling-price logic only once.
  const basePrice = Number(product.price) || 0;
  const priceINR = getSellingPrice(basePrice);

  const discountPercentage = 20;

  const oldPriceINR = Number(
    (priceINR / (1 - discountPercentage / 100)).toFixed(2)
  );

  const savings = Number(
    (oldPriceINR - priceINR).toFixed(2)
  );

  const inStock = Number(product.stock) > 0;

  const productName = product.title || product.name || "Product";

  const productImage =
    product.thumbnail ||
    product.image ||
    selectedImage ||
    "";

  // Product object with final INR price.
  const getCartProduct = () => ({
    id: product.id,
    name: productName,
    title: productName,
    price: priceINR,
    originalPrice: basePrice,
    priceAdjusted: true,
    discountPercentage,
    discountAmount: savings,
    discountApplied: true,
    image: productImage,
    thumbnail: productImage,
    rating: Number(product.rating || 0),
  });

  // Add to Cart only affects the normal cart.
  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Product is out of stock!");
      return;
    }

    addToCart(getCartProduct());

    toast.success("Product added to cart!", {
      duration: 2000,
    });
  };

  // Buy Now uses a separate checkout item.
  // It does NOT add the product to the cart.
  const handleBuyNow = () => {
    if (!inStock) {
      toast.error("Product is out of stock!");
      return;
    }

    try {
      const selectedProduct = {
        ...getCartProduct(),
        quantity: 1,
      };

      localStorage.setItem(
        "buyNowCheckout",
        JSON.stringify(selectedProduct)
      );

      navigate("/checkout?mode=buy-now");
    } catch (err) {
      console.error("Buy Now Error:", err);
      toast.error("Unable to proceed to checkout.");
    }
  };

  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <main className="productPage">
        <div className="productBackNavigation">
          <button
            type="button"
            className="backHomeBtn"
            onClick={handleBackToHome}
          >
            <span className="backArrow">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        <section className="productImage">
          <div className="mainImageCard">
            <img
              src={selectedImage || productImage}
              alt={productName}
              className="mainImage"
            />
          </div>

          <div className="imageGallery">
            {product.images?.length > 0 ? (
              product.images.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  className={
                    selectedImage === img
                      ? "galleryButton active"
                      : "galleryButton"
                  }
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${productName} ${index + 1}`}
                    className="galleryImage"
                  />
                </button>
              ))
            ) : (
              <button
                type="button"
                className="galleryButton active"
                onClick={() => setSelectedImage(productImage)}
              >
                <img
                  src={productImage}
                  alt={productName}
                  className="galleryImage"
                />
              </button>
            )}
          </div>
        </section>

        <section className="productDetails">
          <h1 className="productTitle">{productName}</h1>

          <p className="brand">
            <strong>Brand:</strong> {product.brand || "Amazon"}
          </p>

          <div className="category">
            <strong>Category:</strong>
            <span>{product.category || "General"}</span>
          </div>

          <div className="priceSection">
            <span className="productPrice">
              {formatINR(priceINR)}
            </span>

            <span className="oldProductPrice">
              {formatINR(oldPriceINR)}
            </span>

            <span className="priceDiscount">
              {discountPercentage}% OFF
            </span>
          </div>

          <div className="discountBox">
            You Save <strong>{formatINR(savings)}</strong>
          </div>

          <div className="stockBox">
            {inStock ? (
              <span className="inStock">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="outStock">Out of Stock</span>
            )}
          </div>

          <div className="shippingBox">
            Free Delivery Available
          </div>

          <div className="ratingBox">
            <div className="ratingTop">
              <span className="ratingStar">⭐</span>

              <span className="ratingNumber">
                {Number(product.rating || 0).toFixed(1)}
                <span> / 5</span>
              </span>
            </div>

            <p>Customer Rating</p>
          </div>

          <div className="descriptionSection">
            <h3>Product Description</h3>
            <p className="description">{product.description}</p>
          </div>

          <div className="productActions">
            <button
              type="button"
              className="addToCartBtn"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {inStock ? "Add To Cart" : "Out of Stock"}
            </button>

            <button
              type="button"
              className="buyNowBtn"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </button>

            <Link to="/" className="continueShoppingBtn">
              Continue Shopping
            </Link>
          </div>

          <div className="reviewSection">
            <h2>Customer Reviews</h2>

            {product.reviews?.length > 0 ? (
              product.reviews.map((review, index) => (
                <div className="reviewCard" key={index}>
                  <h4>{review.reviewerName}</h4>

                  <p className="reviewRating">
                    ⭐ {Number(review.rating || 0).toFixed(1)} / 5
                  </p>

                  <p>{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="noReviews">No Reviews Available</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Product;
