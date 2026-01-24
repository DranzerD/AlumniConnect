"use client";

import { useState } from "react";
import styles from "./DataTable.module.css";
import Badge from "./Badge";
import Pagination from "./Pagination";

export default function DataTable({
  data = [],
  columns = [],
  pageSize = 10,
  searchable = true,
  sortable = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  emptyMessage = "No data available",
  loading = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter data based on search
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return columns.some((col) => {
      const value = row[col.key];
      return value
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedData.map((row) => row.id));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange?.(Array.from(newSet));
      return newSet;
    });
  };

  const renderCell = (row, col) => {
    const value = row[col.key];

    if (col.render) {
      return col.render(value, row);
    }

    switch (col.type) {
      case "badge":
        return (
          <Badge variant={col.badgeVariant?.(value) || "primary"} size="small">
            {value}
          </Badge>
        );
      case "date":
        return new Date(value).toLocaleDateString();
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "avatar":
        return (
          <div className={styles.avatarCell}>
            <div className={styles.avatar}>
              {row.name?.charAt(0) || value?.charAt(0) || "?"}
            </div>
            <span>{value}</span>
          </div>
        );
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {searchable && (
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {selectedRows.size > 0 && (
            <div className={styles.selectionInfo}>
              {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) => selectedRows.has(row.id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${styles.th} ${sortable ? styles.sortable : ""}`}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={styles.thContent}>
                    {col.header}
                    {sortable && sortConfig.key === col.key && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className={styles.emptyCell}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`${styles.tr} ${
                    selectedRows.has(row.id) ? styles.selected : ""
                  } ${onRowClick ? styles.clickable : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td
                      className={styles.checkboxCell}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.footer}>
          <span className={styles.pageInfo}>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
