

### 🧪 1. `process-with-delay-cli`

#### Mô tả:
- Nhập **mảng số** từ bàn phím.
- Nhập **độ trễ (ms)** giữa mỗi số (mặc định là `1000ms` nếu không nhập).
- In ra console từng số theo trình tự, **kèm theo tiến độ (%)**.
- Xử lý **mảng trống** một cách graceful.
- **Kiểm tra dữ liệu đầu vào**:
  - Ném lỗi `InvalidInputError` nếu không phải mảng số hợp lệ.
- **Huỷ quá trình đang chạy**:
  - Gõ `c` rồi nhấn `Enter` để dừng chương trình.

#### ▶️ Cách Cài Đặt & Chạy:
```bash
npm install
npm start
```

---

### 👥 2. `users-table`

#### Cấu trúc chức năng:

| File/Thư mục | Mô tả |
|--------------|--------|
| `types/TUser.ts` | Định nghĩa kiểu dữ liệu người dùng |
| `data/mockUsers.ts` | Tạo dữ liệu người dùng giả lập |
| `context/ThemeContext.tsx` & `theme.css` | Quản lý dark mode (giao diện sáng/tối) |
| `components/Pagination.tsx` | Chức năng phân trang |
| `components/UsersTable.tsx` | Phần hiển thị chính và xử lý chức năng bảng người dùng |

#### Chức năng chính:
- **Hiển thị dữ liệu:** Từ `props.users`.
- **Lọc:** Theo tên, email, trạng thái (active/inactive), ngày đăng ký.
- **Sắp xếp:** Theo các cột: tên, email, số dư (`balance`), ngày đăng ký, trạng thái.
- **Phân trang:** Hiển thị giới hạn số dòng mỗi trang.
- **Virtualized mode:** Tối ưu hiệu suất với bảng lớn (sử dụng `react-window`).
- **Dark mode:** Chuyển đổi giữa chế độ sáng và tối.

#### ▶️ Cách Cài Đặt & Chạy:
```bash
npm install
npm run dev
```

