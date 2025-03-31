"use client";

import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ProductTab from "./ProductTab/ProductTab";
import ProductImageTab from "./ProductImageTab/ProductImageTab";
// Removed useState, Header, Shadcn Tabs imports

const Products = () => {
  // Removed activeTab state

  const items: TabsProps["items"] = [
    {
      key: "products",
      label: "Products",
      children: <ProductTab />,
    },
    {
      key: "productsImages",
      label: "Product Images",
      children: <ProductImageTab />,
    },
  ];

  return (
    <div className="mx-auto pb-5 w-full">
      {/* Header is likely part of a layout component now, removed from here */}
      <Tabs defaultActiveKey="products" items={items} className="mt-6" />
    </div>
  );
};

export default Products;
