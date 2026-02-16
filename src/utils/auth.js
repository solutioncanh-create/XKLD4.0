export const getUserRole = () => {
    // Lấy role từ localStorage
    // Trả về null nếu chưa đăng nhập
    return localStorage.getItem('user_role');
}

export const isSuperAdmin = () => {
    return getUserRole() === 'super_admin';
}

export const Permissions = {
    PRINT_EXPORT: 'print_export',
    MANAGE_USERS: 'manage_users'
}

export const hasPermission = (permission) => {
    const role = getUserRole();
    if (role === 'super_admin') return true;

    // Admin thường hạn chế quyền
    if (role === 'admin') {
        if (permission === Permissions.PRINT_EXPORT) return false;
        return true;
    }

    return false;
}
