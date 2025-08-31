// Enhanced Table component compatible with both Tremor and shadcn patterns

import React from "react"
import { cx } from "@/lib/utils"

// TableRoot for backward compatibility
const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    className={cx("relative w-full overflow-auto", className)}
    {...props}
  >
    {children}
  </div>
))

TableRoot.displayName = "TableRoot"

// Main Table component with enhanced styling
const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, forwardedRef) => (
  <table
    ref={forwardedRef}
    data-slot="table"
    className={cx(
      "w-full caption-bottom text-sm border-b border-gray-200",
      className,
    )}
    {...props}
  />
))

Table.displayName = "Table"

// TableHead (section) - shadcn compatible
const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <thead
    ref={forwardedRef}
    data-slot="table-header"
    className={cx("[&_tr]:border-b border-gray-200", className)}
    {...props}
  />
))

TableHead.displayName = "TableHead"

// TableHeader (cell) - backward compatibility alias
const TableHeader = TableHead

// TableHeaderCell - backward compatibility
const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <th
    ref={forwardedRef}
    data-slot="table-head"
    className={cx(
      "h-12 px-4 text-left align-middle font-medium text-gray-900 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
))

TableHeaderCell.displayName = "TableHeaderCell"

// TableBody - shadcn compatible
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    data-slot="table-body"
    className={cx("divide-y divide-gray-200 [&_tr:last-child]:border-0", className)}
    {...props}
  />
))

TableBody.displayName = "TableBody"

// TableRow - shadcn compatible
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    data-slot="table-row"
    className={cx(
      "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
      "[&_td:last-child]:pr-4 [&_th:last-child]:pr-4",
      "[&_td:first-child]:pl-4 [&_th:first-child]:pl-4",
      className,
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

// TableCell - shadcn compatible
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <td
    ref={forwardedRef}
    data-slot="table-cell"
    className={cx("p-4 align-middle text-gray-600 [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))

TableCell.displayName = "TableCell"

// TableFoot - backward compatibility
const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tfoot
    ref={forwardedRef}
    data-slot="table-footer"
    className={cx(
      "border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0 border-gray-200 text-gray-900",
      className,
    )}
    {...props}
  />
))

TableFoot.displayName = "TableFoot"

// TableFooter - shadcn compatible alias
const TableFooter = TableFoot

// TableCaption - shadcn compatible
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    data-slot="table-caption"
    className={cx("mt-4 text-sm text-gray-500", className)}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableFooter, // shadcn alias
  TableHead,
  TableHeader, // shadcn alias
  TableHeaderCell,
  TableRoot,
  TableRow,
}
