import React, { useEffect } from "react";
import ProductPageCard from "../components/ProductPageCard";
import Footer from "../components/Footer";

function ProductPage() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
  }, []);

  return (
    <div>
      <ProductPageCard />
      <Footer />
    </div>
  );
}

export default ProductPage;
