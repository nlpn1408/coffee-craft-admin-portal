"use client";

import React, { useRef } from 'react';
import { Input, Button, Space, InputRef } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface';
import type { Key } from 'react';
import { SearchOutlined } from '@ant-design/icons';

// Define a generic DataIndex type or import from a shared location if available
type DataIndex = string | number | readonly (string | number)[];

// Define the return type for the hook
// Remove onFilterDropdownOpenChange from the Pick
type ColumnSearchProps<T> = Pick<
    ColumnType<T>,
    'filterDropdown' | 'filterIcon' | 'onFilter' | 'render'
>;

export function useColumnSearch<T extends object>(): (dataIndex: DataIndex) => ColumnSearchProps<T> {

  const searchInput = useRef<InputRef>(null);

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnSearchProps<T> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => {
      // Use the onOpenChange prop available within filterDropdownProps in newer AntD versions
      // This logic might need adjustment based on exact AntD version, but the principle is the same.
      // We'll handle the focus logic inside the dropdown render prop.
      // The `visible` parameter is implicitly handled by AntD when rendering the dropdown.
      // We can use an effect or direct call within the render prop if needed,
      // but often AntD handles focus automatically or the timeout approach works.

      // Add the focus logic here, potentially triggered by the dropdown becoming visible.
      // AntD doesn't directly expose an onOpenChange within FilterDropdownProps in all versions' types,
      // but the logic to focus can be placed here. We rely on the timeout after render.
      setTimeout(() => searchInput.current?.select(), 100);

      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm({ closeDropdown: false })}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm({ closeDropdown: false })}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
             <Button
              type="link"
              size="small"
              onClick={() => { close(); }}
            >
              Close
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value: Key | boolean, record: T) => {
      const stringValue = String(value).toLowerCase();
      const keys = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
      let recordValue = record as any;
      for (const key of keys) {
          if (recordValue === null || typeof recordValue === 'undefined') {
              return false;
          }
          recordValue = recordValue[key];
      }

      return recordValue
        ? recordValue.toString().toLowerCase().includes(stringValue)
        : false;
    },
    render: (text: any) => text,
  });

  return getColumnSearchProps;
}
