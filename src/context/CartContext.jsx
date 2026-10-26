
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

// Keep the selling price unchanged if it has already been adjusted.
// ProductCard.jsx and Product.jsx pass priceAdjusted: true.
const normalizeProduct = (product) => {
  const price = Math.max(0, Number(product.price) || 0);

  return {
    ...product,
    originalPrice: Number(product.originalPrice ?? price) || price,
    price,
    priceAdjusted: Boolean(product.priceAdjusted),
    discountApplied: Boolean(product.discountApplied),
  };
};

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cartItems") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("appliedCoupon") || "null");
    } catch {
      return null;
    }
  });

  // Supported coupon codes
  const coupons = {
    SAVE10: { type: "percent", value: 10 },
    SAVE20: { type: "percent", value: 20 },
    FLAT100: { type: "flat", value: 100 },
    WELCOME100: { type: "flat", value: 100 },
    AMAZON50: { type: "flat", value: 50 },
  };

  // Add product to cart
  const addToCart = (product) => {
    const cartProduct = normalizeProduct(product);

    setCartItems((previousItems) => {
      const existing = previousItems.find(
        (item) => item.id === cartProduct.id
      );

      if (existing) {
        return previousItems.map((item) =>
          item.id === cartProduct.id
            ? {
                ...item,
                quantity: (Number(item.quantity) || 1) + 1,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          ...cartProduct,
          quantity: 1,
        },
      ];
    });

    toast.success(
      `${product.name || product.title || "Product"} added to cart!`
    );
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: (Number(item.quantity) || 1) + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                (Number(item.quantity) || 1) - 1
              ),
            }
          : item
      )
    );
  };

  // Remove product
  const removeFromCart = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from cart!");
  };

  // Clear cart and coupon
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
  };

  // Subtotal before coupon
  const subtotal = Number(
    cartItems
      .reduce(
        (total, item) =>
          total +
          (Number(item.price) || 0) *
            Math.max(1, Number(item.quantity) || 1),
        0
      )
      .toFixed(2)
  );

  // Apply coupon
  const applyCoupon = (code) => {
    const normalizedCode = String(code || "").trim().toUpperCase();
    const coupon = coupons[normalizedCode];

    if (!coupon) {
      toast.error("Invalid coupon code!");
      return false;
    }

    if (cartItems.length === 0 || subtotal <= 0) {
      toast.error("Add products to your cart first.");
      return false;
    }

    const couponData = {
      code: normalizedCode,
      type: coupon.type,
      value: coupon.value,
    };

    setAppliedCoupon(couponData);
    localStorage.setItem("appliedCoupon", JSON.stringify(couponData));

    toast.success(`Coupon ${normalizedCode} applied!`);
    return true;
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
    toast.success("Coupon removed!");
  };

  // Calculate coupon discount
  let calculatedDiscount = 0;

  if (appliedCoupon?.type === "percent") {
    calculatedDiscount =
      subtotal * (Number(appliedCoupon.value) / 100);
  } else if (appliedCoupon?.type === "flat") {
    calculatedDiscount = Number(appliedCoupon.value) || 0;
  }

  const couponDiscount = Number(
    Math.min(subtotal, Math.max(0, calculatedDiscount)).toFixed(2)
  );

  const discountedSubtotal = Number(
    Math.max(0, subtotal - couponDiscount).toFixed(2)
  );

  // Save order
  const placeOrder = (orderDetails) => {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      const address = {
        name: orderDetails.name,
        mobile: orderDetails.mobile,
        address: orderDetails.address,
        city: orderDetails.city,
        pincode: orderDetails.pincode,
      };

      const items = Array.isArray(orderDetails.items)
        ? orderDetails.items
        : cartItems;

      const newOrder = {
        ...orderDetails,
        id: Date.now(),
        date: new Date().toLocaleString("en-IN"),
        items,
        address,
        subtotal: Number(orderDetails.subtotal ?? subtotal),
        coupon: orderDetails.coupon ?? appliedCoupon,
        couponDiscount: Number(
          orderDetails.couponDiscount ?? couponDiscount
        ),
        total: Number(
          orderDetails.grandTotal ??
            orderDetails.total ??
            discountedSubtotal
        ),
        status: "Order Placed",
      };

      localStorage.setItem(
        "orders",
        JSON.stringify([newOrder, ...savedOrders])
      );

      localStorage.setItem("currentOrder", JSON.stringify(newOrder));

      setCartItems([]);
      setAppliedCoupon(null);
      localStorage.removeItem("appliedCoupon");

      return newOrder;
    } catch (error) {
      console.error("Unable to save order:", error);
      throw error;
    }
  };

  // Persist cart
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist coupon
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

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        couponDiscount,
        discountedSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
