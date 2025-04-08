import React, { useState, useEffect, useRef, useMemo } from "react";
import { TUser } from "../types/TUser";
import Pagination from "./Pagination";
import { useTheme } from "../context/ThemeContext";
import { FixedSizeList } from "react-window";

const COLUMN_WIDTHS = {
  name: "150px",
  balance: "100px",
  email: "200px",
  registration: "120px",
  status: "100px",
  action: "120px",
};

function formatBalance(balance: number): string {
  return `$${balance.toLocaleString()}`;
}

function formatShortDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const RegistrationCell: React.FC<{ date: Date }> = ({ date }) => {
  const [hovered, setHovered] = useState(false);

  const shortDate = formatShortDate(date);
  const fullDate = formatFullDateTime(date);

  const tooltipStyle: React.CSSProperties = {
    display: hovered ? "block" : "none",
    position: "absolute",
    top: "100%",
    left: 0,
    padding: "6px 8px",
    borderRadius: "4px",
    backgroundColor: "var(--tooltip-bg)",
    color: "var(--tooltip-color)",
    whiteSpace: "nowrap",
    zIndex: 9999,
    marginTop: "4px",
    fontSize: "0.9rem",
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    cursor: "default",
  };

  return (
    <td
      style={{ padding: "8px", width: COLUMN_WIDTHS.registration }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={containerStyle}>
        {shortDate}
        <div style={tooltipStyle}>{fullDate}</div>
      </div>
    </td>
  );
};

type SortField = "name" | "balance" | "email" | "registerAt" | "active";
type SortDirection = "asc" | "desc";
type SortConfig = {
  field: SortField;
  direction: SortDirection;
} | null;

type FilterConfig = {
  name: string;
  email: string;
  status: "all" | "active" | "inactive";
  dateFrom: string;
  dateTo: string;
};

const TableHeader: React.FC<{
  field: SortField;
  label: string;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  style?: React.CSSProperties;
}> = ({ field, label, sortConfig, onSort, style }) => {
  const getSortIcon = () => {
    if (sortConfig?.field !== field) return "⇵";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <th
      style={{
        padding: "8px",
        cursor: "pointer",
        userSelect: "none",
        ...style,
      }}
      onClick={() => onSort(field)}
    >
      {label} {getSortIcon()}
    </th>
  );
};

interface UserRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    users: TUser[];
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    columns: {
      name: { width: string };
      balance: { width: string };
      email: { width: string };
      registration: { width: string };
      status: { width: string };
      action: { width: string };
    };
  };
}

const UserRow: React.FC<UserRowProps> = ({ index, style, data }) => {
  const { users, handleEdit, handleDelete, columns } = data;
  const user = users[index];
  const dateObj = new Date(user.registerAt);

  return (
    <tr
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--border-color)",
        width: "100%",
      }}
      className="virtualized-row"
    >
      <td style={{ padding: "8px", width: columns.name.width }}>{user.name}</td>
      <td style={{ padding: "8px", width: columns.balance.width }}>
        {formatBalance(user.balance)}
      </td>
      <td style={{ padding: "8px", width: columns.email.width }}>
        <a href={`mailto:${user.email}`} style={{ color: "var(--text-color)" }}>
          {user.email}
        </a>
      </td>
      <td style={{ padding: "8px", width: columns.registration.width }}>
        {formatShortDate(dateObj)}
      </td>
      <td style={{ padding: "8px", width: columns.status.width }}>
        <span
          className={user.active ? "status-active" : "status-inactive"}
          style={{
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: user.active
              ? "rgba(0, 128, 0, 0.1)"
              : "rgba(255, 0, 0, 0.1)",
            color: user.active ? "green" : "red",
          }}
        >
          {user.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td
        style={{
          padding: "8px",
          width: columns.action.width,
          textAlign: "center",
        }}
      >
        <button
          className="action-button"
          style={{
            marginRight: "8px",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            background: "transparent",
            border: "none",
          }}
          onClick={() => handleEdit(user.id)}
          title="Edit user"
        >
          ✏️
        </button>
        <button
          className="action-button"
          style={{
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            background: "transparent",
            border: "none",
          }}
          onClick={() => handleDelete(user.id)}
          title="Delete user"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

interface UsersTableProps {
  users: TUser[];
  defaultPageSize?: number;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  defaultPageSize = 10,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<FilterConfig>({
    name: "",
    email: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [isVirtualized, setIsVirtualized] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>(400);

  const columns = {
    name: { width: COLUMN_WIDTHS.name },
    balance: { width: COLUMN_WIDTHS.balance },
    email: { width: COLUMN_WIDTHS.email },
    registration: { width: COLUMN_WIDTHS.registration },
    status: { width: COLUMN_WIDTHS.status },
    action: { width: COLUMN_WIDTHS.action },
  };

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableRef.current) {
        const availableHeight =
          window.innerHeight -
          tableRef.current.getBoundingClientRect().top -
          100;
        setTableHeight(Math.max(300, availableHeight));
      }
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);
    return () => window.removeEventListener("resize", updateTableHeight);
  }, []);

  const handleSort = (field: SortField) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig?.field === field) {
        return prevSortConfig.direction === "asc"
          ? { field, direction: "desc" }
          : null;
      }
      return { field, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (
        filters.name &&
        !user.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.email &&
        !user.email.toLowerCase().includes(filters.email.toLowerCase())
      ) {
        return false;
      }

      if (filters.status !== "all") {
        const isActive = filters.status === "active";
        if (user.active !== isActive) {
          return false;
        }
      }

      const registerDate = new Date(user.registerAt);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (registerDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (registerDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      switch (sortConfig.field) {
        case "name":
          return sortConfig.direction === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "email":
          return sortConfig.direction === "asc"
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        case "balance":
          return sortConfig.direction === "asc"
            ? a.balance - b.balance
            : b.balance - a.balance;
        case "registerAt":
          return sortConfig.direction === "asc"
            ? new Date(a.registerAt).getTime() -
                new Date(b.registerAt).getTime()
            : new Date(b.registerAt).getTime() -
                new Date(a.registerAt).getTime();
        case "active":
          return sortConfig.direction === "asc"
            ? Number(a.active) - Number(b.active)
            : Number(b.active) - Number(a.active);
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortConfig]);

  const currentData = useMemo(() => {
    if (isVirtualized) {
      return sortedUsers;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, currentPage, pageSize, isVirtualized]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const toggleVirtualized = () => {
    setIsVirtualized((prev) => !prev);
    if (!isVirtualized) {
      setCurrentPage(1);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit user:", id);
  };
  const handleDelete = (id: string) => {
    console.log("Delete user:", id);
  };

  return (
    <div
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
      ref={tableRef}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <button
            onClick={toggleVirtualized}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: isVirtualized
                ? "var(--button-active-bg)"
                : "var(--button-bg)",
            }}
          >
            {isVirtualized ? "Normal Mode" : "Virtualized Mode"}
          </button>

          <button
            onClick={toggleTheme}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        <div>
          <label htmlFor="pageSize" style={{ marginRight: "0.5rem" }}>
            Rows per page:{" "}
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={isVirtualized}
            style={{
              padding: "0.3rem",
              borderRadius: "4px",
              opacity: isVirtualized ? 0.5 : 1,
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="filter-panel"
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <div>
              <label
                htmlFor="name"
                style={{ display: "block", marginBottom: "0.3rem" }}
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  width: "150px",
                }}
                placeholder="Filter by name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                style={{ display: "block", marginBottom: "0.3rem" }}
              >
                Email:
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  width: "150px",
                }}
                placeholder="Filter by email"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                style={{ display: "block", marginBottom: "0.3rem" }}
              >
                Status:
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  width: "150px",
                }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dateFrom"
                style={{ display: "block", marginBottom: "0.3rem" }}
              >
                From Date:
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  width: "150px",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="dateTo"
                style={{ display: "block", marginBottom: "0.3rem" }}
              >
                To Date:
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  width: "150px",
                }}
              />
            </div>

            <div style={{ alignSelf: "flex-end" }}>
              <button
                onClick={resetFilters}
                style={{
                  padding: "0.3rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            <strong>Found:</strong> {sortedUsers.length} results
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          overflow: "auto",
          height: isVirtualized ? `${tableHeight}px` : "auto",
        }}
      >
        {isVirtualized ? (
          <div className="virtualized-table-container">
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: "var(--background-color)",
                position: "sticky",
                top: 0,
                zIndex: 1,
                width: "100%",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  width: columns.name.width,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig?.field === "name"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "⇵"}
              </div>
              <div
                style={{
                  padding: "8px",
                  width: columns.balance.width,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("balance")}
              >
                Balance($){" "}
                {sortConfig?.field === "balance"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "⇵"}
              </div>
              <div
                style={{
                  padding: "8px",
                  width: columns.email.width,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig?.field === "email"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "⇵"}
              </div>
              <div
                style={{
                  padding: "8px",
                  width: columns.registration.width,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("registerAt")}
              >
                Registration{" "}
                {sortConfig?.field === "registerAt"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "⇵"}
              </div>
              <div
                style={{
                  padding: "8px",
                  width: columns.status.width,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("active")}
              >
                STATUS{" "}
                {sortConfig?.field === "active"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "⇵"}
              </div>
              <div
                style={{
                  padding: "8px",
                  width: columns.action.width,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                ACTION
              </div>
            </div>

            <FixedSizeList
              height={tableHeight - 40}
              itemCount={sortedUsers.length}
              itemSize={50}
              width="100%"
              itemData={{
                users: sortedUsers,
                handleEdit,
                handleDelete,
                columns,
              }}
            >
              {UserRow}
            </FixedSizeList>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              backgroundColor: "var(--background-color)",
              color: "var(--text-color)",
            }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <TableHeader
                  field="name"
                  label="Name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  style={{ width: COLUMN_WIDTHS.name }}
                />
                <TableHeader
                  field="balance"
                  label="Balance($)"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  style={{ width: COLUMN_WIDTHS.balance }}
                />
                <TableHeader
                  field="email"
                  label="Email"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  style={{ width: COLUMN_WIDTHS.email }}
                />
                <TableHeader
                  field="registerAt"
                  label="Registration"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  style={{ width: COLUMN_WIDTHS.registration }}
                />
                <TableHeader
                  field="active"
                  label="STATUS"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  style={{ width: COLUMN_WIDTHS.status }}
                />
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    width: COLUMN_WIDTHS.action,
                  }}
                >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((user) => {
                const dateObj = new Date(user.registerAt);
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "8px", width: COLUMN_WIDTHS.name }}>
                      {user.name}
                    </td>
                    <td
                      style={{ padding: "8px", width: COLUMN_WIDTHS.balance }}
                    >
                      {formatBalance(user.balance)}
                    </td>
                    <td style={{ padding: "8px", width: COLUMN_WIDTHS.email }}>
                      <a
                        href={`mailto:${user.email}`}
                        style={{ color: "var(--text-color)" }}
                      >
                        {user.email}
                      </a>
                    </td>
                    <RegistrationCell date={dateObj} />
                    <td style={{ padding: "8px", width: COLUMN_WIDTHS.status }}>
                      <span
                        className={
                          user.active ? "status-active" : "status-inactive"
                        }
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: user.active
                            ? "rgba(0, 128, 0, 0.1)"
                            : "rgba(255, 0, 0, 0.1)",
                          color: user.active ? "green" : "red",
                        }}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        width: COLUMN_WIDTHS.action,
                      }}
                    >
                      <button
                        className="action-button"
                        style={{
                          marginRight: "8px",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background: "transparent",
                          border: "none",
                        }}
                        onClick={() => handleEdit(user.id)}
                        title="Edit user"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-button"
                        style={{
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background: "transparent",
                          border: "none",
                        }}
                        onClick={() => handleDelete(user.id)}
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!isVirtualized && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={sortedUsers.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default UsersTable;
