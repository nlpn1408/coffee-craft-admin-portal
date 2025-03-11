"use client";

import Header from "@/components/Header";
import BrandTab from "./BrandTab";

const Brands = () => {
  return (
    <div className="mx-auto pb-5 w-full">
      <div className="flex justify-between items-center mb-6">
        <Header name="Brands" />
      </div>
      <BrandTab />
    </div>
  );
};

export default Brands; 