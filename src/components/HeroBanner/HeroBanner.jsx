import "./HeroBanner.css";
import { useEffect, useState } from "react";

const banners = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600",
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="heroBanner">
      <img
        src={banners[current]}
        alt="Banner"
      />
    </div>
  );
}

export default HeroBanner;