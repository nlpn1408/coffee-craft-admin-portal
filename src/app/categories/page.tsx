"use client";

import Header from "@/components/Header";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import BrandTab from "./components/BrandTab";
import CategoryTab from "./components/CategoryTab";

const CategoriesPage = () => {
  const items: TabsProps["items"] = [
    {
      key: "categories",
      label: "Categories",
      children: <CategoryTab />,
    },
    {
      key: "brands",
      label: "Brands",
      children: <BrandTab />,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* <Header name="Categories & Brands" /> */}
      <Tabs defaultActiveKey="categories" items={items} className="mt-6" />
    </div>
  );
};

export default CategoriesPage;
