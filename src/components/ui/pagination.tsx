import React from 'react';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Pagination({ className = '', ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`mx-auto flex w-full justify-center ${className}`}
      {...props}
    />
  );
}

export function PaginationContent({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={`flex flex-row items-center gap-1 ${className}`} {...props} />
  );
}

export function PaginationItem({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={className} {...props} />;
}

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  className?: string;
}

export function PaginationLink({
  className = '',
  isActive = false,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={`flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm ${
        isActive
          ? 'bg-blue-600 text-white dark:bg-blue-700 border-blue-600 dark:border-blue-700'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 mr-2"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      <span>Previous</span>
    </button>
  );
}

export function PaginationNext({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <span>Next</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 ml-2"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  );
} 