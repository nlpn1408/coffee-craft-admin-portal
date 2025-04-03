"use client";

import React, { useState } from "react"; // Import useState
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ProductTab from "./ProductTab/ProductTab";
import ProductImageTab from "./ProductImageTab/ProductImageTab";
import TagTab from "./TagTab/TagTab";
import ProductVariantTab from "./ProductVariantTab/ProductVariantTab"; // Import Variant Tab
import { Product } from "@/types"; // Import Product type

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>("products"); // State for active tab

  // Function to handle selecting a product and switching tab
  const handleSelectProductForVariants = (product: Product) => {
    setSelectedProduct(product);
    setActiveTabKey("variants"); // Switch to variants tab
  };

  const items: TabsProps["items"] = [
    {
      key: "products",
      label: "Products",
      // Pass state and handler to ProductTab
      children: <ProductTab onSelectProductForVariants={handleSelectProductForVariants} />,
    },
    {
      key: "productsImages",
      label: "Product Images",
      // TODO: Pass selectedProduct if needed by ProductImageTab
      children: <ProductImageTab />,
    },
    {
      key: "tags",
      label: "Tags",
      // TODO: Pass selectedProduct if needed by TagTab
      children: <TagTab />,
    },
    // Add the new Variants Tab
    {
      key: "variants",
      label: "Variants",
      // Pass selectedProduct to ProductVariantTab
      children: <ProductVariantTab selectedProduct={selectedProduct} />,
      // Optionally disable if no product is selected
      disabled: !selectedProduct,
    },
  ];

  return (
    <div className="mx-auto pb-5 w-full">
      <Tabs
        activeKey={activeTabKey} // Control active tab
        onChange={setActiveTabKey} // Update state on tab change
        items={items}
        className="mt-6"
      />
    </div>
  );
};

export default Products;
