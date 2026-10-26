
 // src/utils/currency.js

export const PRICE_MULTIPLIER = 3;

// Increase the existing INR price
export const getSellingPrice = (price) => {
  const amount = Number(price) || 0;
  return Math.round(amount * PRICE_MULTIPLIER);
};

// Format price directly in INR
export const formatINR = (price) => {
  return `₹${(Number(price) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};
