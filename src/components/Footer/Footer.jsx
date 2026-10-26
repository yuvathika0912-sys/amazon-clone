import "./Footer.css";

function Footer() {

  // =========================
  // Back To Top
  // =========================
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">

      {/* =========================
          BACK TO TOP
      ========================= */}
      <button
        className="backToTop"
        onClick={handleBackToTop}
      >
        ↑ Back to Top
      </button>


      {/* =========================
          FOOTER TOP
      ========================= */}
      <div className="footerTop">

        {/* Column 1 */}
        <div className="footerBox">
          <h3>Get to Know Us</h3>

          <p>About Us</p>
          <p>Careers</p>
          <p>Press Releases</p>
          <p>Amazon Science</p>
        </div>


        {/* Column 2 */}
        <div className="footerBox">
          <h3>Connect with Us</h3>

          <p>Facebook</p>
          <p>Instagram</p>
          <p>Twitter</p>
          <p>LinkedIn</p>
        </div>


        {/* Column 3 */}
        <div className="footerBox">
          <h3>Make Money with Us</h3>

          <p>Sell on Amazon</p>
          <p>Affiliate Program</p>
          <p>Advertise Products</p>
          <p>Amazon Pay</p>
        </div>


        {/* Column 4 */}
        <div className="footerBox">
          <h3>Let Us Help You</h3>

          <p>Your Account</p>
          <p>Returns Centre</p>
          <p>Shipping Rates</p>
          <p>Help</p>
        </div>

      </div>


      {/* =========================
          DIVIDER
      ========================= */}
      <hr />


      {/* =========================
          LOGO
      ========================= */}
      <div className="footerLogo">
        <h2>Amazon Clone</h2>
      </div>


      {/* =========================
          BOTTOM
      ========================= */}
      <div className="footerBottom">

        <p>
          © 2026 Amazon Clone. All Rights Reserved.
        </p>

        <p>
          Built with React • Vite • CSS
        </p>

      </div>

    </footer>
  );
}

export default Footer;