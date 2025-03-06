"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { setIsSidebarCollapsed } from "@/state";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import {
  Gem,
  Layers2,
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isRoot?: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  isRoot = false,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  const content = (
    <div
      className={`cursor-pointer flex items-center ${
        isCollapsed
          ? "justify-center py-4"
          : isRoot
          ? "justify-start py-4"
          : "justify-start px-8 py-4"
      }
  hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
    isActive && !isRoot ? "bg-blue-200 text-white" : ""
  }
}`}
    >
      <Icon className="w-6 h-6 !text-gray-700" />

      <span
        className={`${
          isCollapsed ? "hidden" : "block"
        } font-medium text-gray-700`}
      >
        {label}
      </span>
    </div>
  );

  return isRoot ? content : <Link href={href}>{content}</Link>;
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
          {/* <Image
            src="https://s3-coffee-craft.s3.ap-southeast-1.amazonaws.com/logo.png"
            alt="COFFEE CRAFT-logo"
            width={27}
            height={27}
            className="rounded w-8"
          /> */}
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl`}
        >
          COFFEE CRAFT
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />

        <SimpleTreeView multiSelect>
          <TreeItem
            itemId="grid"
            label={
              <SidebarLink
                href="/"
                icon={Archive}
                label="Categories"
                isCollapsed={isSidebarCollapsed}
                isRoot={true}
              />
            }
          >
            <SidebarLink
              href="/category"
              icon={Archive}
              label="Categories"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href="/brand"
              icon={Gem}
              label="Brands"
              isCollapsed={isSidebarCollapsed}
            />
          </TreeItem>
        </SimpleTreeView>
        <SidebarLink
          href="/products"
          icon={Clipboard}
          label="Products"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/users"
          icon={User}
          label="Users"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/expenses"
          icon={CircleDollarSign}
          label="Expenses"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 COFFEE CRAFT
        </p>
      </div>
    </div>
  );
};

export default Sidebar; 