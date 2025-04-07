"use client";

import Header from "@/components/Header";
import { Tabs, Breadcrumb } from "antd"; // Import Breadcrumb
import { HomeOutlined } from "@ant-design/icons"; // Import Home icon
import type { TabsProps } from "antd";
import BrandTab from "./BrandTab/BrandTab";
import CategoryTab from "./CategoryTab/CategoryTab";

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
    <div className="space-y-6 pb-4"> {/* Use space-y like other pages */}
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: 'Categories & Brands' }, // Current page
        ]}
      />
      {/* <Header name="Categories & Brands" /> */}
      <Tabs defaultActiveKey="categories" items={items}  />
    </div>
  );
};

export default CategoriesPage;
