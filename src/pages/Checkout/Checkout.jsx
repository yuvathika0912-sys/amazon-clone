
import "./Checkout.css";

import { useContext, useState } from "react";
import {
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";

import { CartContext } from "../../context/CartContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import toast from "react-hot-toast";

function Checkout() {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isBuyNow = searchParams.get("mode") === "buy-now";

  const getBuyNowProduct = () => {
    try {
      return JSON.parse(
        localStorage.getItem("buyNowCheckout") || "null"
      );
    } catch {
      return null;
    }
  };

  const [buyNowProduct] = useState(getBuyNowProduct);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Buy Now: selected product only.
  // Normal checkout: all existing cart items.
  const checkoutItems = isBuyNow
    ? buyNowProduct
      ? [buyNowProduct]
      : []
    : safeCartItems;

  const getQuantity = (item) =>
    Math.max(1, Number(item.quantity) || 1);

  // Prices are already final INR values.
  const getPrice = (item) =>
    Math.max(0, Number(item.price) || 0);

  const getOriginalPrice = (item) =>
    Math.max(
      getPrice(item),
      Number(item.originalPrice) || getPrice(item)
    );

  const totalItems = checkoutItems.reduce(
    (total, item) => total + getQuantity(item),
    0
  );

  const originalTotal = Number(
    checkoutItems
      .reduce(
        (total, item) =>
          total + getOriginalPrice(item) * getQuantity(item),
        0
      )
      .toFixed(2)
  );

  const getAppliedCoupon = () => {
    try {
      return JSON.parse(
        localStorage.getItem("appliedCoupon") || "null"
      );
    } catch {
      return null;
    }
  };

  const appliedCoupon = getAppliedCoupon();

  const itemsSubtotal = Number(
    checkoutItems
      .reduce(
        (total, item) =>
          total + getPrice(item) * getQuantity(item),
        0
      )
      .toFixed(2)
  );

  let couponDiscount = 0;

  if (appliedCoupon?.code === "SAVE10") {
    couponDiscount = itemsSubtotal * 0.1;
  } else if (appliedCoupon?.code === "WELCOME100") {
    couponDiscount = Math.min(100, itemsSubtotal);
  } else if (appliedCoupon?.code === "AMAZON50") {
    couponDiscount = Math.min(50, itemsSubtotal);
  } else if (appliedCoupon?.code === "SAVE20") {
    couponDiscount = itemsSubtotal * 0.2;
  } else if (appliedCoupon?.code === "FLAT100") {
    couponDiscount = Math.min(100, itemsSubtotal);
  }

  couponDiscount = Number(
    Math.min(itemsSubtotal, couponDiscount).toFixed(2)
  );

  const totalPrice = Number(
    Math.max(0, itemsSubtotal - couponDiscount).toFixed(2)
  );

  const productDiscount = Number(
    Math.max(0, originalTotal - itemsSubtotal).toFixed(2)
  );

  const deliveryCharge =
    totalPrice >= 500 || totalPrice === 0 ? 0 : 50;

  const gst = Number((totalPrice * 0.18).toFixed(2));

  const grandTotal = Number(
    (totalPrice + deliveryCharge + gst).toFixed(2)
  );

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handlePlaceOrder = () => {
    if (loading) return;

    if (checkoutItems.length === 0) {
      toast.error(
        isBuyNow
          ? "Unable to load the selected product."
          : "Your cart is empty!"
      );
      navigate("/");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter your address.");
      return;
    }

    if (!city.trim()) {
      toast.error("Please enter your city.");
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);

    try {
      const checkoutData = {
        name: name.trim(),
        mobile,
        address: address.trim(),
        city: city.trim(),
        pincode,

        items: checkoutItems.map((item) => ({
          ...item,
          originalPrice: getOriginalPrice(item),
          price: getPrice(item),
          quantity: getQuantity(item),
        })),

        checkoutMode: isBuyNow ? "buy-now" : "cart",

        totalItems,
        originalTotal,
        productDiscount,
        subtotal: itemsSubtotal,
        itemsSubtotal,
        coupon: appliedCoupon,
        couponDiscount,
        totalPrice,
        deliveryCharge,
        gst,
        grandTotal,

        paymentStatus: "Pending",
        paymentMethod: "Not Selected",
        orderDate: new Date().toLocaleString("en-IN"),
      };

      localStorage.setItem(
        "checkoutData",
        JSON.stringify(checkoutData)
      );

      toast.success("Address saved! Choose your payment method.");

      navigate("/payment");
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <>
        <Navbar search="" setSearch={() => {}} />

        <main className="checkoutPage">
          <div className="summaryBox">
            <h1>
              {isBuyNow
                ? "Selected product unavailable"
                : "Your cart is empty"}
            </h1>

            <p>
              {isBuyNow
                ? "Please return to the product page and try Buy Now again."
                : "Add products before proceeding to checkout."}
            </p>

            <Link to="/" className="backShoppingLink">
              Continue Shopping
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <main className="checkoutPage">
        <div className="addressBox">
          <h1>Checkout</h1>

          {isBuyNow && (
            <p className="checkoutModeNote">
              Buy Now: checkout contains only your selected product.
            </p>
          )}

          <h2>Shipping Address</h2>

          <label htmlFor="checkoutName">Full Name</label>
          <input
            id="checkoutName"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />

          <label htmlFor="checkoutMobile">Mobile Number</label>
          <input
            id="checkoutMobile"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            onChange={(e) =>
              setMobile(
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
          />

          <label htmlFor="checkoutAddress">Address</label>
          <textarea
            id="checkoutAddress"
            rows={4}
            placeholder="House No, Street, Area"
            value={address}
            autoComplete="street-address"
            onChange={(e) => setAddress(e.target.value)}
          />

          <label htmlFor="checkoutCity">City</label>
          <input
            id="checkoutCity"
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
          />

          <label htmlFor="checkoutPincode">Pincode</label>
          <input
            id="checkoutPincode"
            type="text"
            placeholder="Enter 6-digit pincode"
            value={pincode}
            maxLength={6}
            inputMode="numeric"
            autoComplete="postal-code"
            onChange={(e) =>
              setPincode(
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
          />

          <Link to="/" className="backShoppingLink">
            ← Continue Shopping
          </Link>
        </div>

        <div className="summaryBox">
          <h2>Order Summary</h2>

          <div className="summaryRow">
            <span>Total Products</span>
            <span>{totalItems}</span>
          </div>

          <div className="summaryRow">
            <span>Original Price</span>
            <span>{formatPrice(originalTotal)}</span>
          </div>

          {productDiscount > 0 && (
            <div className="summaryRow">
              <span>Product Discount</span>
              <span className="freeText">
                -{formatPrice(productDiscount)}
              </span>
            </div>
          )}

          <div className="summaryRow">
            <span>Items Subtotal</span>
            <span>{formatPrice(itemsSubtotal)}</span>
          </div>

          <div className="summaryRow">
            <span>
              Coupon Discount
              {appliedCoupon?.code
                ? ` (${appliedCoupon.code})`
                : ""}
            </span>
            <span className="freeText">
              -{formatPrice(couponDiscount)}
            </span>
          </div>

          <div className="summaryRow">
            <span>Price After Discounts</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <div className="summaryRow">
            <span>Delivery Charge</span>
            <span className={deliveryCharge === 0 ? "freeText" : ""}>
              {deliveryCharge === 0
                ? "FREE"
                : formatPrice(deliveryCharge)}
            </span>
          </div>

          <div className="summaryRow">
            <span>GST (18%)</span>
            <span>{formatPrice(gst)}</span>
          </div>

          <hr />

          <div className="grandTotal">
            <span>Grand Total</span>
            <strong>{formatPrice(grandTotal)}</strong>
          </div>

          <button
            type="button"
            className="paymentBtn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue to Payment →"}
          </button>

          <p className="checkoutNote">
            Your coupon discount has been included in this total.
            Select your payment method on the next page.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
