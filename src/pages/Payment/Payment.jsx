
import "./Payment.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import { CartContext } from "../../context/CartContext";

import toast from "react-hot-toast";

function Payment() {
  const { cartItems, placeOrder, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    try {
      const savedCheckout = localStorage.getItem("checkoutData");

      if (savedCheckout) {
        setCheckoutData(JSON.parse(savedCheckout));
      } else {
        // Checkout.jsx-ல் placeOrder save செய்த order-ஐப் படிக்கிறோம்.
        const savedOrder = localStorage.getItem("currentOrder");

        if (savedOrder) {
          setCheckoutData(JSON.parse(savedOrder));
        }
      }
    } catch (error) {
      console.error("Checkout Data Error:", error);
      toast.error("Unable to load checkout details.");
    }
  }, []);

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const getQuantity = (item) =>
    Math.max(1, Number(item.quantity) || 1);

  const getPrice = (item) =>
    Math.max(0, Number(item.price) || 0);

  const cartTotalItems = safeCartItems.reduce(
    (total, item) => total + getQuantity(item),
    0
  );

  const cartTotalPrice = safeCartItems.reduce(
    (total, item) => total + getPrice(item) * getQuantity(item),
    0
  );

  const totalItems = checkoutData?.totalItems ?? cartTotalItems;

  const itemsSubtotal =
    checkoutData?.subtotal ??
    checkoutData?.itemsSubtotal ??
    cartTotalPrice;

  const couponDiscount = Number(checkoutData?.couponDiscount || 0);

  const totalPrice =
    checkoutData?.totalPrice ??
    Math.max(0, itemsSubtotal - couponDiscount);

  const deliveryCharge =
    checkoutData?.deliveryCharge ??
    (totalPrice >= 500 || totalPrice === 0 ? 0 : 50);

  const gst = checkoutData?.gst ?? totalPrice * 0.18;

  const grandTotal =
    checkoutData?.grandTotal ??
    totalPrice + deliveryCharge + gst;

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const validateUPI = () => {
    const cleanedUPI = upiId.trim();
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

    if (!cleanedUPI) {
      toast.error("Please enter your UPI ID.");
      return false;
    }

    if (!upiPattern.test(cleanedUPI)) {
      toast.error("Enter a valid UPI ID.");
      return false;
    }

    return true;
  };

  const validateCard = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "");

    if (!cleanCardNumber || !cardName.trim() || !expiry.trim() || !cvv.trim()) {
      toast.error("Please fill all card details.");
      return false;
    }

    if (!/^[0-9]{16}$/.test(cleanCardNumber)) {
      toast.error("Enter a valid 16-digit card number.");
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(cardName.trim())) {
      toast.error("Enter a valid card holder name.");
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      toast.error("Enter expiry as MM/YY.");
      return false;
    }

    if (!/^[0-9]{3}$/.test(cvv)) {
      toast.error("Enter a valid 3-digit CVV.");
      return false;
    }

    return true;
  };

  const handlePayment = () => {
    if (loading) return;

    if (safeCartItems.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/");
      return;
    }

    if (!checkoutData) {
      toast.error("Please complete checkout details first.");
      navigate("/checkout");
      return;
    }

    if (method === "upi" && !validateUPI()) return;
    if (method === "card" && !validateCard()) return;

    setLoading(true);

    try {
      const isCOD = method === "cod";

      const finalOrder = {
        ...checkoutData,

        items: safeCartItems.map((item) => ({
          ...item,
          price: getPrice(item),
          quantity: getQuantity(item),
        })),

        totalItems,
        subtotal: itemsSubtotal,
        couponDiscount,
        totalPrice: Number(totalPrice),
        deliveryCharge: Number(deliveryCharge),
        gst: Number(gst),
        grandTotal: Number(grandTotal),

        paymentMethod: method,
        paymentStatus: isCOD ? "Cash on Delivery" : "Payment Submitted",
        status: isCOD ? "Order Placed" : "Payment Submitted",
        orderDate: new Date().toLocaleString("en-IN"),
      };

      // Demo project: this stores the order locally.
      // It does not contact a real payment gateway.
      placeOrder(finalOrder);

      localStorage.removeItem("checkoutData");

      clearCart();

      toast.success(
        isCOD
          ? "Order placed successfully!"
          : "Payment details submitted for demo!"
      );

      navigate("/success");
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Unable to place order. Please try again.");
      setLoading(false);
    }
  };

  if (safeCartItems.length === 0) {
    return (
      <>
        <Navbar search="" setSearch={() => {}} />

        <main className="paymentPage">
          <div className="paymentBox emptyPayment">
            <h1>Your cart is empty</h1>
            <p>Add products before making an order.</p>
            <Link to="/" className="backCheckoutLink">
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

      <main className="paymentPage">
        <section className="paymentBox">
          <h1>Choose your payment method</h1>
          <p className="paymentSubtitle">
            Select how you would like to pay for your order.
          </p>

          <label className={`paymentOption ${method === "cod" ? "selected" : ""}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={method === "cod"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="paymentIcon">💵</span>
            <span className="paymentOptionText">
              <strong>Cash on Delivery</strong>
              <small>Pay when your order arrives.</small>
            </span>
          </label>

          <label className={`paymentOption ${method === "upi" ? "selected" : ""}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={method === "upi"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="paymentIcon">📱</span>
            <span className="paymentOptionText">
              <strong>UPI</strong>
              <small>Use your UPI ID.</small>
            </span>
          </label>

          {method === "upi" && (
            <div className="paymentInputGroup">
              <label htmlFor="upiId">UPI ID</label>
              <input
                id="upiId"
                className="paymentInput"
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}

          <label className={`paymentOption ${method === "card" ? "selected" : ""}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={method === "card"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="paymentIcon">💳</span>
            <span className="paymentOptionText">
              <strong>Credit / Debit Card</strong>
              <small>Enter card details for this demo.</small>
            </span>
          </label>

          {method === "card" && (
            <div className="cardDetails">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                className="paymentInput"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="16-digit card number"
                maxLength={16}
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
              />

              <label htmlFor="cardName">Card Holder Name</label>
              <input
                id="cardName"
                className="paymentInput"
                type="text"
                autoComplete="off"
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />

              <div className="cardRow">
                <div>
                  <label htmlFor="expiry">Expiry Date</label>
                  <input
                    id="expiry"
                    className="paymentInput"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    autoComplete="off"
                    value={expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (value.length > 2) {
                        value = `${value.slice(0, 2)}/${value.slice(2)}`;
                      }
                      setExpiry(value);
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    className="paymentInput"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="CVV"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="paymentSecurityNote">
            <span>🔒</span>
            <span>
              Demo checkout only. No real payment is processed by this page.
            </span>
          </div>

          <Link to="/checkout" className="backCheckoutLink">
            ← Back to Checkout
          </Link>
        </section>

        <aside className="paymentTotal">
          <h2>Order Summary</h2>

          <div className="paymentRow">
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="paymentRow">
            <span>Items Subtotal</span>
            <span>{formatPrice(itemsSubtotal)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="paymentRow discountRow">
              <span>Coupon Discount</span>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}

          <div className="paymentRow">
            <span>Delivery</span>
            <span className={deliveryCharge === 0 ? "freeText" : ""}>
              {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
            </span>
          </div>

          <div className="paymentRow">
            <span>GST (18%)</span>
            <span>{formatPrice(gst)}</span>
          </div>

          <hr />

          <div className="finalAmount">
            <span>Order Total</span>
            <strong>{formatPrice(grandTotal)}</strong>
          </div>

          <button
            type="button"
            className="payBtn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : method === "cod"
              ? "Place Order"
              : "Submit Demo Payment"}
          </button>

          <p className="paymentFootnote">
            Your final amount includes the applicable discounts, delivery and GST.
          </p>
        </aside>
      </main>

      <Footer />
    </>
  );
}

export default Payment;
