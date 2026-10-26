
import "./Cart.css";

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CartContext } from "../../context/CartContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useContext(CartContext);

  const [coupon, setCoupon] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("appliedCoupon")) || null;
    } catch {
      return null;
    }
  });

  // Save applied coupon
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(
        "appliedCoupon",
        JSON.stringify(appliedCoupon)
      );
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [appliedCoupon]);

  // Quantity helper
  const getQuantity = (item) =>
    Math.max(1, Number(item.quantity) || 1);

  // Total quantity
  const totalItems = cartItems.reduce(
    (total, item) => total + getQuantity(item),
    0
  );

  // Products subtotal
  const totalPrice = Number(
    cartItems
      .reduce(
        (total, item) =>
          total + (Number(item.price) || 0) * getQuantity(item),
        0
      )
      .toFixed(2)
  );

  // Coupon discount
  let discount = 0;

  if (appliedCoupon?.code === "SAVE10") {
    discount = totalPrice * 0.1;
  } else if (appliedCoupon?.code === "WELCOME100") {
    discount = Math.min(100, totalPrice);
  } else if (appliedCoupon?.code === "AMAZON50") {
    discount = Math.min(50, totalPrice);
  }

  discount = Number(discount.toFixed(2));

  const discountedTotal = Number(
    Math.max(0, totalPrice - discount).toFixed(2)
  );

  // Delivery charge
  const deliveryCharge =
    totalPrice === 0 || totalPrice >= 500 ? 0 : 50;

  // Keeping your existing GST calculation
  const gst = Number((totalPrice * 0.18).toFixed(2));

  // Final amount
  const grandTotal = Number(
    Math.max(
      0,
      totalPrice + deliveryCharge + gst - discount
    ).toFixed(2)
  );

  // Apply coupon
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      alert("Please enter a coupon code.");
      return;
    }

    if (totalPrice <= 0) {
      alert("Add products to your cart first.");
      return;
    }

    const validCoupons = ["SAVE10", "WELCOME100", "AMAZON50"];

    if (!validCoupons.includes(code)) {
      alert("Invalid coupon code.");
      return;
    }

    setAppliedCoupon({ code });
    setCoupon("");

    if (code === "SAVE10") {
      alert("Coupon applied! You saved 10%.");
    } else if (code === "WELCOME100") {
      alert("Coupon applied! You saved ₹100.");
    } else {
      alert("Coupon applied! You saved ₹50.");
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
    localStorage.removeItem("appliedCoupon");
    alert("Coupon removed successfully.");
  };

  // Remove product
  const handleRemove = (id) => {
    removeFromCart(id);
  };

  // Back to top
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <main className="cartPage">
        {/* Cart heading */}
        <div className="cartHeader">
          <div>
            <h1>Shopping Cart</h1>
            <p>
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link to="/" className="cartContinueLink">
            Continue shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <section className="emptyCart">
            <div className="emptyCartIcon">🛒</div>

            <h2>Your Amazon Clone Cart is Empty</h2>

            <p>
              Your shopping cart is waiting for your next favourite item.
            </p>

            <Link to="/" className="shopBtn">
              Continue Shopping
            </Link>
          </section>
        ) : (
          <>
            <div className="cartLayout">
              {/* Cart products */}
              <section className="cartItems">
                <div className="cartSectionHeading">
                  <h2>Your Items</h2>
                  <span>Price</span>
                </div>

                {cartItems.map((item) => {
                  const quantity = getQuantity(item);
                  const price = Number(item.price) || 0;
                  const image = item.image || item.thumbnail;
                  const name = item.name || item.title || "Product";

                  return (
                    <article className="cartItem" key={item.id}>
                      <Link
                        to={`/product/${item.id}`}
                        className="cartImage"
                      >
                        <img src={image} alt={name} />
                      </Link>

                      <div className="cartInfo">
                        <Link
                          to={`/product/${item.id}`}
                          className="cartProductName"
                        >
                          {name}
                        </Link>

                        <p className="cartStock">
                          In stock
                        </p>

                        <p className="cartDelivery">
                          FREE delivery on eligible orders
                        </p>

                        <div className="quantity">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={quantity <= 1}
                            aria-label={`Decrease quantity of ${name}`}
                          >
                            −
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            aria-label={`Increase quantity of ${name}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="removeBtn"
                          onClick={() => handleRemove(item.id)}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="itemTotal">
                        <strong>
                          ₹{(price * quantity).toFixed(2)}
                        </strong>
                        {quantity > 1 && (
                          <span>₹{price.toFixed(2)} each</span>
                        )}
                      </div>
                    </article>
                  );
                })}

                <div className="cartSubtotal">
                  Subtotal ({totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"}):{" "}
                  <strong>₹{totalPrice.toFixed(2)}</strong>
                </div>
              </section>

              {/* Order summary */}
              <aside className="cartTotal">
                <div className="freeDeliveryMessage">
                  {totalPrice >= 500 ? (
                    <p>✓ Your order qualifies for FREE delivery.</p>
                  ) : (
                    <p>
                      Add ₹{(500 - totalPrice).toFixed(2)} more for FREE
                      delivery.
                    </p>
                  )}
                </div>

                <h2>Order Summary</h2>

                <div className="priceRow">
                  <span>Items subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                {/* Coupon */}
                <div className="couponBox">
                  <h3>Apply a coupon</h3>

                  {!appliedCoupon ? (
                    <>
                      <div className="couponInputRow">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={coupon}
                          onChange={(e) =>
                            setCoupon(e.target.value.toUpperCase())
                          }
                          aria-label="Coupon code"
                        />

                        <button type="button" onClick={applyCoupon}>
                          Apply
                        </button>
                      </div>

                      <p className="couponHint">
                        Try: <strong>SAVE10</strong>,{" "}
                        <strong>WELCOME100</strong>,{" "}
                        <strong>AMAZON50</strong>
                      </p>
                    </>
                  ) : (
                    <div className="appliedCoupon">
                      <span>✓ {appliedCoupon.code} applied</span>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="priceRow">
                  <span>Coupon discount</span>
                  <span className="discountText">
                    −₹{discount.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="priceRow">
                    <span>After discount</span>
                    <span>₹{discountedTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="priceRow">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "freeText" : ""}>
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>

                <div className="priceRow">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>

                <hr />

                <div className="grandTotal">
                  <span>Order total</span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>

                <Link to="/checkout" className="checkoutLink">
                  <button type="button" className="checkoutBtn">
                    Proceed to Checkout
                  </button>
                </Link>

                <p className="secureCheckout">
                  🔒 Secure checkout experience
                </p>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer onBackToTop={handleBackToTop} />
    </>
  );
}

export default Cart;
