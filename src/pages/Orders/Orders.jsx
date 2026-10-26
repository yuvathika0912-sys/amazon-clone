
import "./Orders.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function Orders() {
  let orders = [];

  try {
    const savedOrders = JSON.parse(
      localStorage.getItem("orders") || "[]"
    );

    orders = Array.isArray(savedOrders) ? savedOrders : [];
  } catch (error) {
    console.error("Unable to load orders:", error);
  }

  // Display amounts in Indian Rupees without multiplying again.
  const formatINR = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Support both the current order structure and checkout order structure.
  const getOrderTotal = (order) => {
    return Number(
      order.grandTotal ??
      order.total ??
      order.totalPrice ??
      0
    );
  };

  const getOrderDate = (order) => {
    return (
      order.date ||
      order.orderDate ||
      "Date unavailable"
    );
  };

  const getProductName = (item) => {
    return item.name || item.title || "Product";
  };

  const getProductKey = (item, index) => {
    return item.id ?? item.productId ?? index;
  };

  const getDeliveryAddress = (order) => {
    if (!order.address) return null;

    // Support address saved as an object or as checkout text.
    if (typeof order.address === "object") {
      return order.address;
    }

    return {
      name: order.name,
      address: order.address,
      city: order.city,
      pincode: order.pincode,
      mobile: order.mobile,
    };
  };

  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <main className="ordersPage">
        <div className="ordersHeader">
          <h1>Your Orders</h1>

          <Link to="/" className="continueShoppingBtn">
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="noOrders">
            <div className="noOrdersIcon">📦</div>

            <h2>No Orders Yet</h2>

            <p>You haven't placed any orders yet.</p>

            <Link to="/" className="shopNowBtn">
              Go to Shopping
            </Link>
          </div>
        ) : (
          <div className="ordersList">
            {[...orders].reverse().map((order, orderIndex) => {
              const deliveryAddress = getDeliveryAddress(order);

              return (
                <div
                  className="orderCard"
                  key={order.id ?? `${getOrderDate(order)}-${orderIndex}`}
                >
                  <div className="orderTop">
                    <div>
                      <span>ORDER PLACED</span>
                      <strong>{getOrderDate(order)}</strong>
                    </div>

                    <div>
                      <span>ORDER ID</span>
                      <strong>#{order.id ?? orderIndex + 1}</strong>
                    </div>

                    <div>
                      <span>ORDER TOTAL</span>
                      <strong>{formatINR(getOrderTotal(order))}</strong>
                    </div>
                  </div>

                  <div className="orderBody">
                    <div className="orderStatus">
                      <span className="statusDot"></span>
                      {order.status || "Order Placed"}
                    </div>

                    {order.paymentMethod && (
                      <p className="paymentInfo">
                        Payment Method:{" "}
                        {String(order.paymentMethod).toUpperCase() === "COD"
                          ? "Cash on Delivery"
                          : String(order.paymentMethod).toUpperCase() === "UPI"
                            ? "UPI"
                            : String(order.paymentMethod).toUpperCase() === "CARD"
                              ? "Card"
                              : order.paymentMethod}
                      </p>
                    )}

                    {order.paymentStatus && (
                      <p className="paymentInfo">
                        Payment Status: {order.paymentStatus}
                      </p>
                    )}

                    <div className="orderProducts">
                      {(Array.isArray(order.items) ? order.items : []).map(
                        (item, index) => (
                          <div
                            className="orderProduct"
                            key={getProductKey(item, index)}
                          >
                            <img
                              src={item.image || item.thumbnail || ""}
                              alt={getProductName(item)}
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />

                            <div className="orderProductDetails">
                              <h3>{getProductName(item)}</h3>

                              <p>
                                Quantity: {Number(item.quantity) || 1}
                              </p>

                              <p>
                                Price: {formatINR(item.price)}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {deliveryAddress && (
                      <div className="deliveryAddress">
                        <h3>Delivery Address</h3>

                        {deliveryAddress.name && (
                          <p>
                            <strong>{deliveryAddress.name}</strong>
                          </p>
                        )}

                        {deliveryAddress.address && (
                          <p>{deliveryAddress.address}</p>
                        )}

                        {(deliveryAddress.city || deliveryAddress.pincode) && (
                          <p>
                            {deliveryAddress.city || ""}
                            {deliveryAddress.city && deliveryAddress.pincode
                              ? " - "
                              : ""}
                            {deliveryAddress.pincode || ""}
                          </p>
                        )}

                        {deliveryAddress.mobile && (
                          <p>Mobile: {deliveryAddress.mobile}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Orders;
