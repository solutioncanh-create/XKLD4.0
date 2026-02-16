import { Navigate, Outlet } from 'react-router-dom'
import { getUserRole } from '../utils/auth'

const ProtectedAdminRoute = () => {
    const role = getUserRole()

    // Nếu không có role (chưa đăng nhập), chuyển về trang login
    if (!role) {
        return <Navigate to="/admin/login" replace />
    }

    return <Outlet />
}

export default ProtectedAdminRoute
