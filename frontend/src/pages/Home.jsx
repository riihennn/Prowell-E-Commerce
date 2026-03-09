import React, { useState, useEffect } from "react";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import Features from "../components/Features";
import FlipCardGrid from "../components/FlipCard";
import FirstProducts from "../components/FirstProducts";
import SecondProducts from "../components/SecondProducts";
import ThirdProducts from "../components/ThirdProducts";
import OurBrands from "../components/OurBrands";
import { getProducts } from "../services/productService";
import Loader from "../components/Loader";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch enough products so First/Second/Third sections can slice and filter them
    getProducts({ limit: 100 })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <Carousel />
      <ThirdProducts products={products} />
      <SecondProducts products={products} />
      <FirstProducts products={products} />
      <FlipCardGrid />
      
      <OurBrands />
      <Features />
      <Footer />
    </>
  );
}