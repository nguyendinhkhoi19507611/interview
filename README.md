# interview

# process-with-delay-cli 

Nhập mảng số từ bàn phím.
Nhập độ trễ (ms) giữa mỗi số (mặc định 1000 ms nếu không nhập).
In ra console từng số theo trình tự, kèm theo tiến độ tính bằng phần trăm.
Xử lý mảng trống “graceful”.
Kiểm tra dữ liệu đầu vào:
Ném lỗi InvalidInputError nếu không phải mảng số hợp lệ.
Cancel quá trình:
Gõ ký tự c rồi nhấn Enter để dừng.

# Cách Cài Đặt & Chạy:

npm install
npm start

# users-table

tạo types/TUser.ts để định nghĩa kiểu dữ liệu người dùng
data/mockUsers.ts để tạo dữ liệu ảo ngẫu nhiên
context/ThemeContext.tsx và theme.css để cấu hình darkmode quản lý giao diện sáng và tối
components/Pagination.tsx cấu hình phân trang
components/UsersTable.tsx phần giao diện chính xử lý các chức năng như:
Hiển thị dữ liệu	    Danh sách người dùng từ props.users
Lọc	                    Theo tên, email, trạng thái (active/inactive), ngày đăng ký
Sắp xếp 	            Theo cột: tên, email, balance, ngày đăng ký, trạng thái
Phân trang 	            Chỉ hiển thị một số dòng mỗi trang
Virtualized mode	    Chế độ hiệu suất cao cho bảng lớn (dùng react-window)
Dark mode	            Chuyển đổi giao diện sáng/tối

# Cách Cài Đặt & Chạy:

npm install
npm run dev





