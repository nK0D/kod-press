'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
}

export interface BulkAction {
  value: string;
  label: string;
  action: (ids: number[]) => void;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  
  // Sorting
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string, dir: 'asc' | 'desc') => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;

  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  // Bulk actions
  bulkActions?: BulkAction[];
}

export default function DataTable({
  columns,
  data,
  isLoading = false,
  sortKey,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  searchQuery,
  onSearchChange,
  bulkActions,
}: DataTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState('');

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle single row select
  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleApplyBulkAction = () => {
    if (!selectedAction || selectedIds.length === 0) return;
    const actionObj = bulkActions?.find((act) => act.value === selectedAction);
    if (actionObj) {
      actionObj.action(selectedIds);
      setSelectedIds([]);
      setSelectedAction('');
    }
  };

  const handleSortClick = (colKey: string) => {
    if (!onSort) return;
    let newDir: 'asc' | 'desc' = 'asc';
    if (sortKey === colKey && sortDir === 'asc') {
      newDir = 'desc';
    }
    onSort(colKey, newDir);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Filters bar: Search & Bulk Action */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Bulk Action Controls */}
        {bulkActions && bulkActions.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl focus:outline-none focus:border-[var(--admin-accent)] text-[var(--admin-text-primary)]"
            >
              <option value="">Bulk Actions</option>
              {bulkActions.map((act) => (
                <option key={act.value} value={act.value}>
                  {act.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleApplyBulkAction}
              disabled={!selectedAction || selectedIds.length === 0}
              className="px-3.5 py-2 text-xs font-bold text-[var(--admin-text-secondary)] border border-[var(--admin-border)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Apply
            </button>
            {selectedIds.length > 0 && (
              <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider">
                {selectedIds.length} Selected
              </span>
            )}
          </div>
        )}

        {/* Search Input */}
        {onSearchChange !== undefined && (
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items..."
              className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl focus:outline-none focus:border-[var(--admin-accent)] placeholder-slate-500 text-[var(--admin-text-primary)] transition-all"
            />
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl shadow-sm">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="No records found"
            message="No matching results were found. Try adjusting your query or filter."
          />
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-slate-50/40 dark:bg-slate-900/10">
                {/* Header checkbox */}
                {bulkActions && (
                  <th className="px-6 py-4.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="h-4.5 w-4.5 rounded border-slate-800 focus:ring-indigo-500"
                    />
                  </th>
                )}
                
                {/* Regular headers */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSortClick(col.key)}
                    className={`px-6 py-4.5 font-bold uppercase tracking-wider text-[var(--admin-text-secondary)] text-[10px] select-none
                      ${col.sortable ? 'cursor-pointer hover:text-[var(--admin-text-primary)]' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[var(--admin-border)] text-[var(--admin-text-primary)]">
              {data.map((row, index) => {
                const checked = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id || index}
                    className={`hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors
                      ${checked ? 'bg-indigo-50/5 dark:bg-indigo-950/5' : ''}`}
                  >
                    {/* Row checkbox */}
                    {bulkActions && (
                      <td className="px-6 py-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-slate-800 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    
                    {/* Columns renders */}
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4.5 text-slate-700 dark:text-slate-350 font-medium">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
          {/* Per Page Select */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Rows per page:</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="text-xs font-semibold px-2.5 py-1.5 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:border-[var(--admin-accent)] text-[var(--admin-text-primary)] cursor-pointer"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold pr-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 border border-[var(--admin-border)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--admin-text-secondary)]" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 border border-[var(--admin-border)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-[var(--admin-text-secondary)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
