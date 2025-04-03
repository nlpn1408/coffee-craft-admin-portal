"use client";

import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ProductTab from "./ProductTab/ProductTab";
import ProductImageTab from "./ProductImageTab/ProductImageTab";
import TagTab from "./TagTab/TagTab"; // Import the new TagTab component
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
    {
      key: "tags",
      label: "Tags",
      children: <TagTab />, // Add the TagTab component here
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
