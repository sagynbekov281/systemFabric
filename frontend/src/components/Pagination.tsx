import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-icon border border-ink-100 disabled:opacity-30"
        aria-label="Артка"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-ink-500 font-medium px-2 tabular-nums">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-icon border border-ink-100 disabled:opacity-30"
        aria-label="Алдыга"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;