import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

function getPagesArray(current: number, total: number): (number | string)[] {
  const page = Math.max(1, Math.min(current, total));

  if (total <= 7) {
    const pagesAll: number[] = [];
    for (let i = 1; i <= total; i++) {
      pagesAll.push(i);
    }
    return pagesAll;
  }
  if (page === 1) {
    return [1, 2, 3, 4, "...", total];
  } else if (page === 2) {
    return [1, 2, 3, 4, 5, "...", total];
  } else if (page === 3) {
    return [1, 2, 3, 4, 5, 6, "...", total];
  } else if (page === total) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  } else if (page === total - 1) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  } else if (page === total - 2) {
    return [
      1,
      "...",
      total - 5,
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  } else {
    return [1, "...", page - 1, page, page + 1, "...", total];
  }
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
}) => {
  if (totalPages < 2) {
    return (
      <div
        className="pagination-container"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div>{totalResults} results</div>
      </div>
    );
  }

  const pagesArray = getPagesArray(currentPage, totalPages);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className="pagination-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1rem",
        padding: "0.5rem",
        borderRadius: "4px",
      }}
    >
      <div style={{ fontSize: "0.9rem" }}>{totalResults} results</div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          className="pagination-button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          style={{
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            opacity: currentPage <= 1 ? 0.5 : 1,
            padding: "4px 10px",
            borderRadius: "4px",
          }}
        >
          &lt;
        </button>

        {pagesArray.map((item, idx) => {
          if (typeof item === "string") {
            return (
              <span key={`ellipsis-${idx}`} style={{ padding: "0 6px" }}>
                ...
              </span>
            );
          }
          return (
            <button
              key={`page-${item}`}
              className={`pagination-button ${
                item === currentPage ? "active" : ""
              }`}
              onClick={() => onPageChange(item)}
              style={{
                fontWeight: item === currentPage ? "bold" : "normal",
                padding: "4px 8px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          );
        })}

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          style={{
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            opacity: currentPage >= totalPages ? 0.5 : 1,
            padding: "4px 10px",
            borderRadius: "4px",
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
