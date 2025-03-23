import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
}

export function Table({ className = '', ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export function TableHeader({ className = '', ...props }: TableHeaderProps) {
  return (
    <thead className={`border-b border-gray-200 dark:border-gray-700 ${className}`} {...props} />
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export function TableBody({ className = '', ...props }: TableBodyProps) {
  return <tbody className={`${className}`} {...props} />;
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export function TableFooter({ className = '', ...props }: TableFooterProps) {
  return (
    <tfoot
      className={`border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 font-medium text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    />
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export function TableRow({ className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={`border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`}
      {...props}
    />
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function TableHead({ className = '', ...props }: TableHeadProps) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function TableCell({ className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  className?: string;
}

export function TableCaption({ className = '', ...props }: TableCaptionProps) {
  return (
    <caption
      className={`mt-4 text-sm text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    />
  );
} 