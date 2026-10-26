import "./Success.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function Success() {
  return (
    <>
      <Navbar search="" setSearch={() => {}} />

      <div className="successPage">
        <div className="successBox">

          <h1>🎉 Order Placed Successfully!</h1>

          <p>
            Thank you for shopping with us.
          </p>

          <p>
            Your order has been confirmed.
          </p>

          <Link to="/">
            <button>
              Continue Shopping
            </button>
          </Link>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Success;