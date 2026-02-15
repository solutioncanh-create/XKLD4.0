import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, useNavigate, Link } from 'react-router-dom'

export default function DangKy() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Tổng số bước: 5
    // 1: Cá nhân & Giấy tờ
    // 2: Gia đình
    // 3: Sức khỏe
    // 4: Học vấn & Kinh nghiệm
    // 5: Kỹ năng & Nguyện vọng

    const [formData, setFormData] = useState({
        // --- BƯỚC 1: CÁ NHÂN & GIẤY TỜ ---
        ma_ho_so: '', // Mã hồ sơ tùy chỉnh
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: 'Nam',
        hon_nhan: '', // Đổi tên cho ngắn gọn
        que_quan: '',         // Nguyên quán
        dia_chi: '',          // Hộ khẩu thường trú
        noi_o_hien_tai: '',   // Chỗ ở hiện nay
        so_dien_thoai: '',
        email: '',            // Thêm Email
        facebook_zalo: '',    // Thêm Zalo/FB

        so_cccd: '',          // Thêm CCCD
        ngay_cap_cccd: '',
        noi_cap_cccd: '',

        so_ho_chieu: '',      // Thêm Hộ chiếu
        ngay_cap_ho_chieu: '',
        ngay_het_han_ho_chieu: '',

        ton_giao: '',    // Thêm Tôn giáo
        size_ao: '',         // Thêm Size
        size_giay: '',
        anh_ho_so: '',
        anh_cccd_mat_truoc: '', // Thêm ảnh CCCD mặt trước
        anh_cccd_mat_sau: '',   // Thêm ảnh CCCD mặt sau

        // --- BƯỚC 2: GIA ĐÌNH (JSON Array) ---
        // [ { quan_he: 'Bố', ho_ten: '', nam_sinh: '', nghe_nghiep: '', noi_o: '' } ]
        thong_tin_gia_dinh: [],
        nguoi_bao_lanh: '',     // Người bảo lãnh chính
        sdt_nguoi_bao_lanh: '',

        // --- BƯỚC 3: SỨC KHỎE ---
        chieu_cao: '',
        can_nang: '',
        nhom_mau: '',
        thi_luc_trai: '',
        thi_luc_phai: '',
        tay_thuan: '',
        xam_hinh: '',
        mu_mau: '',
        hut_thuoc: '',
        uong_ruou: '',

        di_ung: '',           // Thêm Dị ứng
        benh_an_phau_thuat: '', // Thêm Tiền sử bệnh

        // --- BƯỚC 4: HỌC VẤN & KINH NGHIỆM (JSON Array) ---
        qua_trinh_hoc_tap: [],
        kinh_nghiem_lam_viec: [],

        // --- BƯỚC 5: KỸ NĂNG & NGUYỆN VỌNG & SÀNG LỌC ---
        trinh_do_tieng_nhat: '',
        bang_lai_xe: '',
        diem_manh: '',
        diem_yeu: '',

        nganh_nghe_mong_muon: '',
        thoi_gian_du_kien: '',
        muc_dich_di_nhat: '',

        da_tung_di_nuoc_ngoai: '', // Thêm Sàng lọc
        co_nguoi_than_o_nhat: '',
    })

    // Load data khi sửa
    useEffect(() => {
        if (id) {
            const fetchHoSo = async () => {
                try {
                    const { data, error } = await supabase.from('ho_so').select('*').eq('id', id).single()
                    if (error) throw error
                    if (data) {
                        setFormData({
                            ...data,
                            thong_tin_gia_dinh: data.thong_tin_gia_dinh || [],
                            qua_trinh_hoc_tap: data.qua_trinh_hoc_tap || [],
                            kinh_nghiem_lam_viec: data.kinh_nghiem_lam_viec || []
                        })
                    }
                } catch (error) { console.error(error) }
            }
            fetchHoSo()
        }
    }, [id])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    // Tự động thêm sẵn 1 dòng nhập liệu cho các bảng nếu chưa có (khi tạo mới)
    useEffect(() => {
        if (!id) {
            setFormData(prev => ({
                ...prev,
                thong_tin_gia_dinh: prev.thong_tin_gia_dinh.length === 0
                    ? [{ quan_he: '', ho_ten: '', nam_sinh: '', nghe_nghiep: '' }]
                    : prev.thong_tin_gia_dinh,
                qua_trinh_hoc_tap: prev.qua_trinh_hoc_tap.length === 0
                    ? [{ thoi_gian: '', ten_truong: '', bang_cap: '' }]
                    : prev.qua_trinh_hoc_tap,
                kinh_nghiem_lam_viec: prev.kinh_nghiem_lam_viec.length === 0
                    ? [{ thoi_gian: '', cong_ty: '', cong_viec: '' }]
                    : prev.kinh_nghiem_lam_viec
            }))
        }
    }, [id])

    // --- Helpers cho Mảng dữ liệu ---
    const handleArrayChange = (arrayName, index, field, value) => {
        const newArray = [...formData[arrayName]]
        newArray[index][field] = value
        setFormData(prev => ({ ...prev, [arrayName]: newArray }))
    }
    const addItem = (arrayName, emptyItem) => {
        setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], emptyItem] }))
    }
    const removeItem = (arrayName, index) => {
        const newArray = formData[arrayName].filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, [arrayName]: newArray }))
    }

    // --- Helper Validation Styles ---
    const vCls = (val, isSelect = false) => {
        // Kiểm tra xem có giá trị không
        const hasValue = val !== null && val !== undefined && String(val).trim() !== '';

        if (!hasValue) return 'input'; // Class mặc định (nền xanh, viền xám)

        // Nếu đã nhập: Nền trắng (Bỏ viền xanh theo yêu cầu)
        let base = 'input !bg-white transition-all';

        if (!isSelect) {
            // Với input text: Thêm icon tick xanh bên phải
            // Sử dụng Inline SVG đã được encode URL làm background image
            base += ` pr-10 bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2310b981'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E")] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.25rem]`;
        }

        return base;
    }

    // --- Logic BMI ---
    const bmi = (formData.chieu_cao && formData.can_nang) ? (formData.can_nang / ((formData.chieu_cao / 100) ** 2)).toFixed(1) : ''

    // --- Submit ---
    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault()

        // --- Validate Required Fields ---
        const requiredFields = {
            ho_ten: 'Họ và Tên',
            ngay_sinh: 'Ngày sinh',
            gioi_tinh: 'Giới tính',
            so_dien_thoai: 'Số điện thoại',
            email: 'Email',
            que_quan: 'Quê quán',
            noi_o_hien_tai: 'Nơi ở hiện tại',
            ton_giao: 'Tôn giáo',
            hon_nhan: 'Tình trạng hôn nhân',
            size_ao: 'Size Quần áo',
            size_giay: 'Size Giày',
            so_cccd: 'Số CCCD',
            ngay_cap_cccd: 'Ngày cấp CCCD',
            noi_cap_cccd: 'Nơi cấp CCCD',
            anh_ho_so: 'Ảnh chân dung',
            anh_cccd_mat_truoc: 'Ảnh mặt trước CCCD',
            anh_cccd_mat_sau: 'Ảnh mặt sau CCCD',
            nguoi_bao_lanh: 'Họ tên người bảo lãnh',
            sdt_nguoi_bao_lanh: 'SĐT người bảo lãnh',
            chieu_cao: 'Chiều cao',
            can_nang: 'Cân nặng',
            nhom_mau: 'Nhóm máu',
            tay_thuan: 'Tay thuận',
            thi_luc_trai: 'Thị lực (Trái)',
            thi_luc_phai: 'Thị lực (Phải)',
            thoi_gian_du_kien: 'Dự định ở Nhật (Năm)',
            muc_dich_di_nhat: 'Mục đích đi Nhật',
            trinh_do_tieng_nhat: 'Trình độ Tiếng Nhật',
            bang_lai_xe: 'Bằng lái xe',
            da_tung_di_nuoc_ngoai: 'Đã từng đi Nhật chưa',
            co_nguoi_than_o_nhat: 'Có người thân ở Nhật không',
            diem_manh: 'Sở trường / Điểm mạnh',
            diem_yeu: 'Sở đoản / Điểm yếu',
            // qua_trinh_hoc_tap: Check riêng mảng nếu cần
        }

        const missing = []
        Object.entries(requiredFields).forEach(([key, label]) => {
            const val = formData[key]
            if (val === null || val === undefined || String(val).trim() === '') {
                missing.push(label)
            }
        })

        // Check mảng Gia Đình (nếu nhập dòng nào thì phải full dòng đó - logic hiện tại mảng có thể rỗng nếu user xóa hết)
        // Check mảng Học vấn / Kinh nghiệm (ít nhất 1 dòng?) -> Tạm thời bỏ qua check mảng rỗng, chỉ check field simple

        if (missing.length > 0) {
            alert('Vui lòng nhập đầy đủ các thông tin bắt buộc sau:\n- ' + missing.join('\n- '))
            return
        }

        setLoading(true)

        // Chuyển chuỗi rỗng thành null để tránh lỗi database
        const cleanData = (data) => {
            const cleaned = { ...data }
            Object.keys(cleaned).forEach(key => {
                if (cleaned[key] === '') {
                    cleaned[key] = null
                }
            })
            // Xử lý riêng cho mảng JSON nếu cần
            return cleaned
        }

        const payload = cleanData(formData)
        // Đã update DB, cho phép lưu nickname bình thường



        try {
            if (id) {
                const { error } = await supabase.from('ho_so').update(payload).eq('id', id)
                if (error) throw error
                navigate('/admin')
            } else {
                const { error } = await supabase.from('ho_so').insert([payload])
                if (error) throw error
                alert('Đăng ký mới thành công!')
                navigate('/')
            }
        } catch (error) { alert('Lỗi: ' + error.message) }
        finally { setLoading(false) }
    }

    // --- Upload Ảnh ---
    const [uploading, setUploading] = useState(false)

    const handleUploadImage = async (event, fieldName) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                setUploading(false)
                return
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${fieldName}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload ảnh lên bucket 'avatars' (Cần tạo bucket này trên Supabase Dashboard và set policy Public)
            let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Lấy URL công khai
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // Cập nhật vào form
            setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }))

        } catch (error) {
            alert('Lỗi tải ảnh: ' + error.message)
        } finally {
            setUploading(false)
        }
    }


    // ==========================================
    // UI CÁC BƯỚC
    // ==========================================

    const Step1_CaNhan = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="section-title">I. THÔNG TIN CÁ NHÂN & LIÊN HỆ</h3>

            {/* Ảnh & Tên */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 bg-white relative overflow-hidden cursor-pointer group transition-colors"
                    onClick={() => document.getElementById('file-upload').click()}>

                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    ) : formData.anh_ho_so ? (
                        <img src={formData.anh_ho_so} alt="Ảnh hồ sơ" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <span className="material-icons-outlined text-4xl text-gray-400 group-hover:text-primary-500 transition-colors">cloud_upload</span>
                            <span className="text-xs mt-2 font-medium text-gray-500 group-hover:text-primary-600">Chọn ảnh 4x6</span>
                        </>
                    )}

                    {/* Input ẩn */}
                    <input type="file" id="file-upload" accept="image/*" className="hidden"
                        onChange={(e) => handleUploadImage(e, 'anh_ho_so')} disabled={uploading} />

                    {/* Overlay hướng dẫn khi hover vào ảnh đã có */}
                    {formData.anh_ho_so && !uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded">Thay ảnh khác</span>
                        </div>
                    )}
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <label className="label">Họ và Tên <span className="text-red-500 ml-1">*</span> <span className="text-[10px] text-red-500">(Viết hoa không dấu)</span></label>
                            <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} className={vCls(formData.ho_ten) + " uppercase"} placeholder="NGUYEN VAN A" />
                        </div>
                        <div className="col-span-1">
                            <label className="label">Nickname <span className="text-[10px] text-gray-400 font-normal">(Nếu có)</span></label>
                            <input name="nickname" value={formData.nickname || ''} onChange={handleChange} className={vCls(formData.nickname)} placeholder="Tên thường gọi" />
                        </div>
                    </div>
                    <div><label className="label">Ngày sinh <span className="text-red-500 ml-1">*</span></label><input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className={vCls(formData.ngay_sinh)} /></div>
                    <div>
                        <label className="label">Giới tính <span className="text-red-500 ml-1">*</span></label>
                        <div className="flex gap-4 mt-1">
                            {['Nam', 'Nữ'].map(g => (
                                <label key={g} className="flex items-center"><input type="radio" name="gioi_tinh" value={g} checked={formData.gioi_tinh === g} onChange={handleChange} className="mr-2" />{g}</label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Liên hệ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Số điện thoại <span className="text-red-500 ml-1">*</span></label><input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} className={vCls(formData.so_dien_thoai)} placeholder="09xx..." /></div>

                <div><label className="label">Email <span className="text-red-500 ml-1">*</span></label><input name="email" value={formData.email} onChange={handleChange} className={vCls(formData.email)} placeholder="example@gmail.com" /></div>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-3">
                <div><label className="label">Quê quán (Nguyên quán) <span className="text-red-500 ml-1">*</span></label><input name="que_quan" value={formData.que_quan} onChange={handleChange} className={vCls(formData.que_quan)} placeholder="Xã, Huyện, Tỉnh..." /></div>
                <div><label className="label">Nơi ở hiện tại (Để liên hệ) <span className="text-red-500 ml-1">*</span></label><input name="noi_o_hien_tai" value={formData.noi_o_hien_tai} onChange={handleChange} className={vCls(formData.noi_o_hien_tai)} placeholder="Số nhà, đường..." /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100">
                <div><label className="label">Tôn giáo <span className="text-red-500 ml-1">*</span></label>
                    <select name="ton_giao" value={formData.ton_giao} onChange={handleChange} className={vCls(formData.ton_giao, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Không">Không</option>
                        <option value="Phật giáo">Phật giáo</option>
                        <option value="Thiên Chúa giáo">Thiên Chúa giáo</option>
                        <option value="Tin Lành">Tin Lành</option>
                        <option value="Hòa Hảo">Hòa Hảo</option>
                        <option value="Cao Đài">Cao Đài</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div><label className="label">Tình trạng hôn nhân <span className="text-red-500 ml-1">*</span></label>
                    <select name="hon_nhan" value={formData.hon_nhan} onChange={handleChange} className={vCls(formData.hon_nhan, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Độc thân">Độc thân</option><option value="Đã kết hôn">Đã kết hôn</option><option value="Ly hôn">Ly hôn</option>
                    </select>
                </div>
                <div><label className="label">Size Quần áo <span className="text-red-500 ml-1">*</span></label>
                    <select name="size_ao" value={formData.size_ao} onChange={handleChange} className={vCls(formData.size_ao, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="3XL">3XL</option>
                    </select>
                </div>
                <div><label className="label">Size Giày (cm) <span className="text-red-500 ml-1">*</span></label>
                    <select name="size_giay" value={formData.size_giay} onChange={handleChange} className={vCls(formData.size_giay, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        {Array.from({ length: 17 }, (_, i) => 22 + i * 0.5).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-gray-500 italic mt-1">*Đo độ dài bàn chân (Ví dụ: 25.5)</p>
                </div>
            </div>

            <h3 className="section-title pt-4">II. GIẤY TỜ TÙY THÂN</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Số CCCD / CMND <span className="text-red-500 ml-1">*</span></label><input name="so_cccd" value={formData.so_cccd} onChange={handleChange} className={vCls(formData.so_cccd)} /></div>
                <div><label className="label">Ngày cấp <span className="text-red-500 ml-1">*</span></label><input type="date" name="ngay_cap_cccd" value={formData.ngay_cap_cccd} onChange={handleChange} className={vCls(formData.ngay_cap_cccd)} /></div>
                <div><label className="label">Nơi cấp <span className="text-red-500 ml-1">*</span></label><input name="noi_cap_cccd" value={formData.noi_cap_cccd} onChange={handleChange} className={vCls(formData.noi_cap_cccd)} placeholder="Cục CS QLHC..." /></div>
            </div>

            {/* Ảnh CCCD 2 mặt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mặt trước */}
                <div>
                    <label className="label mb-2">Ảnh mặt trước CCCD</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 bg-white relative overflow-hidden cursor-pointer group transition-colors"
                        onClick={() => document.getElementById('file-upload-cccd-truoc').click()}>
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        ) : formData.anh_cccd_mat_truoc ? (
                            <img src={formData.anh_cccd_mat_truoc} alt="CCCD Trước" className="w-full h-full object-contain" />
                        ) : (
                            <>
                                <span className="material-icons-outlined text-3xl text-gray-400">badge</span>
                                <span className="text-xs mt-1">Chọn ảnh mặt trước</span>
                            </>
                        )}
                        <input type="file" id="file-upload-cccd-truoc" accept="image/*" className="hidden"
                            onChange={(e) => handleUploadImage(e, 'anh_cccd_mat_truoc')} disabled={uploading} />
                    </div>
                </div>

                {/* Mặt sau */}
                <div>
                    <label className="label mb-2">Ảnh mặt sau CCCD</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 bg-white relative overflow-hidden cursor-pointer group transition-colors"
                        onClick={() => document.getElementById('file-upload-cccd-sau').click()}>
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        ) : formData.anh_cccd_mat_sau ? (
                            <img src={formData.anh_cccd_mat_sau} alt="CCCD Sau" className="w-full h-full object-contain" />
                        ) : (
                            <>
                                <span className="material-icons-outlined text-3xl text-gray-400">badge</span>
                                <span className="text-xs mt-1">Chọn ảnh mặt sau</span>
                            </>
                        )}
                        <input type="file" id="file-upload-cccd-sau" accept="image/*" className="hidden"
                            onChange={(e) => handleUploadImage(e, 'anh_cccd_mat_sau')} disabled={uploading} />
                    </div>
                </div>
            </div>


        </div>
    )

    const Step2_GiaDinh = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="section-title">III. THÔNG TIN GIA ĐÌNH</h3>
            <p className="text-sm text-gray-500 italic mb-2">(*) Khai đầy đủ thông tin: Bố, Mẹ, Vợ/Chồng, Con cái (Bắt buộc để xin Visa).</p>

            {formData.thong_tin_gia_dinh.map((mem, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative mb-3">
                    <button type="button" onClick={() => removeItem('thong_tin_gia_dinh', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold" title="Xóa dòng này">✕</button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Quan hệ <span className="text-red-500">*</span></label>
                            <select className={`input-sm w-full font-medium ${!mem.quan_he ? 'text-gray-400' : '!bg-white'}`} value={mem.quan_he} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'quan_he', e.target.value)}>
                                <option value="" disabled>-- Chọn --</option>
                                {['Bố', 'Mẹ', 'Ông bà', 'Anh chị', 'Vợ', 'Con'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-xs text-gray-500 block mb-1">Họ và Tên <span className="text-red-500">*</span> <span className="text-[10px] text-red-500">(Viết hoa không dấu)</span></label>
                            <input placeholder="NGUYEN VAN A" value={mem.ho_ten} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'ho_ten', e.target.value)} className={`input-sm uppercase ${!mem.ho_ten ? '' : '!bg-white'}`} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Năm sinh <span className="text-red-500">*</span></label>
                            <select className={`input-sm w-full ${!mem.nam_sinh ? 'text-gray-400' : '!bg-white'}`} value={mem.nam_sinh} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'nam_sinh', e.target.value)}>
                                <option value="" disabled>-- Chọn --</option>
                                {Array.from({ length: 95 }, (_, i) => 2024 - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Nghề nghiệp <span className="text-red-500">*</span></label>
                            <select className={`input-sm w-full ${!mem.nghe_nghiep ? 'text-gray-400' : '!bg-white'}`} value={mem.nghe_nghiep} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'nghe_nghiep', e.target.value)}>
                                <option value="" disabled>-- Chọn --</option>
                                {['Nông nghiệp', 'Công nhân', 'Viên chức', 'Hộ kinh doanh', 'Học sinh'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={() => addItem('thong_tin_gia_dinh', { quan_he: '', ho_ten: '', nam_sinh: '', nghe_nghiep: '' })} className="btn-add">
                + Thêm thành viên khác
            </button>

            <div className="mt-8 pt-4 border-t">
                <h4 className="font-bold text-gray-700 mb-3">Người bảo lãnh (Liên hệ khẩn cấp)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Họ tên người bảo lãnh <span className="text-red-500 ml-1">*</span></label><input name="nguoi_bao_lanh" value={formData.nguoi_bao_lanh} onChange={handleChange} className={vCls(formData.nguoi_bao_lanh)} /></div>
                    <div><label className="label">Số điện thoại liên hệ <span className="text-red-500 ml-1">*</span></label><input name="sdt_nguoi_bao_lanh" value={formData.sdt_nguoi_bao_lanh} onChange={handleChange} className={vCls(formData.sdt_nguoi_bao_lanh)} /></div>
                </div>
            </div>
        </div>
    )
    const Step3_SucKhoe = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="section-title">IV. SỨC KHỎE & THỂ CHẤT</h3>
            {/* Chỉ số cơ bản */}
            <div className="bg-primary-50 p-4 rounded text-center mb-4">
                <span className="text-lg font-bold text-primary-800">BMI: {bmi || '--'}</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="label">Chiều cao (cm) <span className="text-red-500 ml-1">*</span></label>
                    <select name="chieu_cao" value={formData.chieu_cao} onChange={handleChange} className={vCls(formData.chieu_cao, true) + " text-center font-bold"}>
                        <option value="" disabled>-- Chọn --</option>
                        {Array.from({ length: 51 }, (_, i) => 140 + i).map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Cân nặng (kg) <span className="text-red-500 ml-1">*</span></label>
                    <select name="can_nang" value={formData.can_nang} onChange={handleChange} className={vCls(formData.can_nang, true) + " text-center font-bold"}>
                        <option value="" disabled>-- Chọn --</option>
                        {Array.from({ length: 61 }, (_, i) => 40 + i).map(w => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="label">Nhóm máu <span className="text-red-500 ml-1">*</span></label><select name="nhom_mau" value={formData.nhom_mau} onChange={handleChange} className={vCls(formData.nhom_mau, true)}><option value="" disabled>-- Chọn --</option><option>A</option><option>B</option><option>O</option><option>AB</option></select></div>
                <div><label className="label">Tay thuận <span className="text-red-500 ml-1">*</span></label><select name="tay_thuan" value={formData.tay_thuan} onChange={handleChange} className={vCls(formData.tay_thuan, true)}><option value="" disabled>-- Chọn --</option><option>Phải</option><option>Trái</option><option>Hai tay</option></select></div>
                <div><label className="label">Thị lực (Trái) <span className="text-red-500 ml-1">*</span></label>
                    <select name="thi_luc_trai" value={formData.thi_luc_trai} onChange={handleChange} className={vCls(formData.thi_luc_trai, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Tốt">Tốt</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Kém">Kém</option>
                    </select>
                </div>
                <div><label className="label">Thị lực (Phải) <span className="text-red-500 ml-1">*</span></label>
                    <select name="thi_luc_phai" value={formData.thi_luc_phai} onChange={handleChange} className={vCls(formData.thi_luc_phai, true)}>
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Tốt">Tốt</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Kém">Kém</option>
                    </select>
                </div>
            </div>

            <h4 className="font-bold text-gray-700 mt-4">Thói quen & Bệnh lý</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { text: 'Xăm hình', key: 'xam_hinh', opt: ['Không', 'Có - Kín', 'Có - Lộ', 'Đã xóa'] },
                    { text: 'Mù màu', key: 'mu_mau', opt: ['Không', 'Mù màu Đỏ/Lục', 'Mù màu toàn phần'] },
                    { text: 'Hút thuốc', key: 'hut_thuoc', opt: ['Không', 'Có ít', 'Thường xuyên'] },
                    { text: 'Uống rượu', key: 'uong_ruou', opt: ['Không', 'Xã giao', 'Uống tốt'] },
                ].map(item => (
                    <div key={item.key}>
                        <label className="label">{item.text} <span className="text-red-500 ml-1">*</span></label>
                        <select name={item.key} value={formData[item.key]} onChange={handleChange} className={vCls(formData[item.key], true)}>
                            <option value="" disabled>-- Chọn --</option>
                            {item.opt.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Dị ứng (Thuốc, Thức ăn...)</label><textarea rows={2} name="di_ung" value={formData.di_ung} onChange={handleChange} className={vCls(formData.di_ung, true)} placeholder="Nếu không có ghi 'Không'" /></div>
                <div><label className="label">Tiền sử Bệnh / Phẫu thuật</label><textarea rows={2} name="benh_an_phau_thuat" value={formData.benh_an_phau_thuat} onChange={handleChange} className={vCls(formData.benh_an_phau_thuat, true)} placeholder="Đã từng mổ ruột thừa..." /></div>
            </div>
        </div>
    )

    // --- Helper xử lý tách/gộp thời gian (Dạng Tháng/Năm) ---
    const handleMonthYearChange = (arrayName, index, point, field, value) => {
        // Format: "MM/YYYY - MM/YYYY"
        const currentString = formData[arrayName][index].thoi_gian || ' - '
        const parts = currentString.includes(' - ') ? currentString.split(' - ') : ['/', '/']

        let start = parts[0] || '/'
        let end = parts[1] || '/'

        // Helper parse "MM/YYYY" -> {m, y}
        const parse = (str) => {
            const [m, y] = str.includes('/') ? str.split('/') : ['', '']
            return { m: m || '', y: y || '' }
        }

        let sObj = parse(start)
        let eObj = parse(end)

        if (point === 'start') {
            if (field === 'month') sObj.m = value
            if (field === 'year') sObj.y = value
        } else {
            if (field === 'month') eObj.m = value
            if (field === 'year') eObj.y = value
        }

        // Auto-fix: nếu chưa chọn gì thì để trống, nhưng nếu chọn 1 trong 2 thì giữ dấu /
        const newStart = `${sObj.m}/${sObj.y}`
        const newEnd = `${eObj.m}/${eObj.y}`

        const newVal = `${newStart} - ${newEnd}`
        handleArrayChange(arrayName, index, 'thoi_gian', newVal)
    }

    const getMonthYear = (arrayName, index, point) => {
        const val = formData[arrayName][index].thoi_gian || ' - '
        const parts = val.includes(' - ') ? val.split(' - ') : ['/', '/']
        const str = point === 'start' ? parts[0] : parts[1] // "MM/YYYY"
        const [m, y] = (str || '').split('/')
        return { month: m || '', year: y || '' }
    }

    // Component chọn Tháng/Năm
    const MonthYearSelect = ({ arrayName, index, point }) => {
        const { month, year } = getMonthYear(arrayName, index, point)
        const years = Array.from({ length: 45 }, (_, i) => 2030 - i) // 2030 -> 1986

        // Helper style riêng cho component nhỏ này
        const style = (val) => `input-sm px-1 py-1 text-center text-sm ${val && String(val).trim() !== '' ? '!bg-white' : 'text-gray-500'}`

        return (
            <div className="flex gap-1">
                <select
                    className={`${style(month)} w-[55px]`}
                    value={month}
                    onChange={(e) => handleMonthYearChange(arrayName, index, point, 'month', e.target.value)}
                >
                    <option value="" className="text-gray-500">Tháng</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m < 10 ? `0${m}` : m}>{m}</option>
                    ))}
                </select>
                <span className="text-gray-400 self-center">/</span>
                <select
                    className={`${style(year)} w-[70px]`}
                    value={year}
                    onChange={(e) => handleMonthYearChange(arrayName, index, point, 'year', e.target.value)}
                >
                    <option value="" className="text-gray-500">Năm</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        )
    }

    const Step4_HocVan = () => {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* QUÁ TRÌNH HỌC TẬP */}
                <div>
                    <h3 className="section-title">V. QUÁ TRÌNH HỌC TẬP</h3>
                    <p className="text-xs text-gray-500 mb-2">(*) Khai cấp học cao nhất đã học.</p>

                    {formData.qua_trinh_hoc_tap.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative mb-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                {/* Thời gian */}
                                <div className="w-full md:w-auto flex flex-col items-start">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian</label>
                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                                        <MonthYearSelect arrayName="qua_trinh_hoc_tap" index={0} point="start" />
                                        <span className="text-gray-400 font-bold">➔</span>
                                        <MonthYearSelect arrayName="qua_trinh_hoc_tap" index={0} point="end" />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500 block mb-1">Tên trường <span className="text-red-500 ml-1">*</span> <span className="text-[10px] text-red-500">(Viết hoa không dấu)</span></label>
                                        <input placeholder="THPT NGUYEN TRAI" className={`input-sm font-medium uppercase w-full ${!formData.qua_trinh_hoc_tap[0].ten_truong ? '' : '!bg-white'}`}
                                            value={formData.qua_trinh_hoc_tap[0].ten_truong}
                                            onChange={(e) => handleArrayChange('qua_trinh_hoc_tap', 0, 'ten_truong', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500 block mb-1">Cấp học <span className="text-red-500 ml-1">*</span></label>
                                        <select className={`input-sm w-full ${!formData.qua_trinh_hoc_tap[0].bang_cap ? 'text-gray-400' : '!bg-white'}`} value={formData.qua_trinh_hoc_tap[0].bang_cap} onChange={(e) => handleArrayChange('qua_trinh_hoc_tap', 0, 'bang_cap', e.target.value)}>
                                            <option value="">-- Chọn --</option>
                                            <option>Cấp 2 (THCS)</option>
                                            <option>Cấp 3 (THPT)</option>
                                            <option>Trung Cấp</option>
                                            <option>Cao Đẳng</option>
                                            <option>Đại Học</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* KINH NGHIỆM LÀM VIỆC */}
                <div>
                    <h3 className="section-title mt-8">VI. KINH NGHIỆM LÀM VIỆC</h3>
                    <p className="text-xs text-gray-500 mb-2">(*) Khai 3 công việc gần nhất (nếu có).</p>

                    {formData.kinh_nghiem_lam_viec.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative mb-3">
                            <button type="button" onClick={() => removeItem('kinh_nghiem_lam_viec', idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-sm hover:bg-red-200">✕</button>
                            <div className="flex flex-col md:flex-row gap-3 items-center">
                                {/* Thời gian */}
                                <div className="w-full md:w-auto flex flex-col items-start">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian</label>
                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                                        <MonthYearSelect arrayName="kinh_nghiem_lam_viec" index={idx} point="start" />
                                        <span className="text-gray-400 font-bold">➔</span>
                                        <MonthYearSelect arrayName="kinh_nghiem_lam_viec" index={idx} point="end" />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Tên công ty <span className="text-red-500 ml-1">*</span> <span className="text-[10px] text-red-500">(Viết hoa không dấu)</span></label>
                                        <input placeholder="CONG TY ABC" className={`input-sm font-medium w-full uppercase ${!item.cong_ty ? '' : '!bg-white'}`}
                                            value={item.cong_ty}
                                            onChange={(e) => handleArrayChange('kinh_nghiem_lam_viec', idx, 'cong_ty', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Công việc <span className="text-red-500 ml-1">*</span></label>
                                        <select className={`input-sm w-full ${!item.cong_viec ? 'text-gray-400' : '!bg-white'}`} value={item.cong_viec} onChange={(e) => handleArrayChange('kinh_nghiem_lam_viec', idx, 'cong_viec', e.target.value)}>
                                            <option value="">-- Chọn --</option>
                                            {[
                                                'Nông nghiệp',
                                                'Công nhân nhà máy',
                                                'Xây dựng',
                                                'Cơ khí',
                                                'May mặc',
                                                'Thực phẩm',
                                                'Điện tử',
                                                'Lái xe',
                                                'Kinh doanh tự do',
                                                'Nhân viên văn phòng',
                                                'Khác'
                                            ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addItem('kinh_nghiem_lam_viec', { thoi_gian: '', cong_ty: '', cong_viec: '' })} className="btn-add">+ Thêm công việc</button>
                </div>
            </div>
        )
    }

    const Step5_NguyenVong = () => {
        const goi_y_diem_manh = [
            'Sức khỏe tốt, dẻo dai', 'Chăm chỉ, chịu khó', 'Đúng giờ, chấp hành tốt',
            'Trung thực, thật thà', 'Cẩn thận, tỉ mỉ', 'Tinh thần trách nhiệm cao',
            'Hòa đồng, giao tiếp tốt', 'Gọn gàng, ngăn nắp', 'Nấu ăn giỏi'
        ]
        const goi_y_diem_yeu = [
            'Giao tiếp chưa khéo', 'Cẩn thận quá mức', 'Hay hồi hộp, lo lắng',
            'Vội vàng, hấp tấp', 'Tính cách thẳng thắn', 'Không chịu được áp lực',
            'Dễ nổi nóng, mất bình tĩnh', 'Nấu ăn không giỏi'
        ]

        const addSuggestion = (field, text) => {
            setFormData(prev => {
                const current = prev[field] || ''
                if (current.includes(text)) return prev
                return { ...prev, [field]: current ? `${current}, ${text}` : text }
            })
        }

        return (
            <div className="space-y-6 animate-fade-in">

                {/* --- VII. NGUYỆN VỌNG ĐĂNG KÝ (Moved Up) --- */}
                <h3 className="section-title">VII. NGUYỆN VỌNG ĐĂNG KÝ</h3>
                <div>
                    <label className="label mb-2 block">Ngành nghề mong muốn</label>
                    <select name="nganh_nghe_mong_muon" value={formData.nganh_nghe_mong_muon} onChange={handleChange} className={vCls(formData.nganh_nghe_mong_muon, true)}>
                        <option value="" disabled>-- Chọn ngành nghề --</option>
                        <option value="Thực phẩm">Chế biến thực phẩm (Cơm hộp, Thủy sản...)</option>
                        <option value="Cơ khí">Cơ khí (Hàn, Tiện, Phay, Dập...)</option>
                        <option value="Xây dựng">Xây dựng (Xây dựng hạ tầng, kiến trúc, lắp đặt thiết bị...)</option>
                        <option value="May mặc">May mặc</option>
                        <option value="Nông nghiệp">Nông nghiệp (Trồng trọt, Chăn nuôi)</option>
                        <option value="Điện tử">Lắp ráp điện tử</option>
                        <option value="Đóng gói">Đóng gói công nghiệp</option>
                        <option value="Vệ sinh tòa nhà">Vệ sinh tòa nhà</option>
                        <option value="Kaigo">Hộ lý (Kaigo)</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Dự định ở Nhật mấy năm? <span className="text-red-500 ml-1">*</span></label><select name="thoi_gian_du_kien" value={formData.thoi_gian_du_kien} onChange={handleChange} className={vCls(formData.thoi_gian_du_kien, true)}><option value="" disabled>-- Chọn --</option><option>1 năm</option><option>3 năm</option><option>5 năm</option><option>8 năm</option><option>10 năm</option></select></div>
                    <div>
                        <label className="label">Mục đích đi Nhật <span className="text-red-500 ml-1">*</span></label>
                        <select name="muc_dich_di_nhat" value={formData.muc_dich_di_nhat} onChange={handleChange} className={vCls(formData.muc_dich_di_nhat, true)}>
                            <option value="">-- Chọn mục đích --</option>
                            <option value="Kiếm thu nhập giúp gia đình & tích lũy vốn">Kiếm thu nhập giúp gia đình & tích lũy vốn</option>
                            <option value="Học hỏi kỹ năng, tác phong làm việc Nhật Bản">Học hỏi kỹ năng, tác phong làm việc Nhật Bản</option>
                            <option value="Trải nghiệm văn hóa và đất nước Nhật Bản">Trải nghiệm văn hóa và đất nước Nhật Bản</option>
                            <option value="Phát triển bản thân và tìm kiếm cơ hội tương lai">Phát triển bản thân và tìm kiếm cơ hội tương lai</option>
                            <option value="Nâng cao trình độ tiếng Nhật">Nâng cao trình độ tiếng Nhật</option>
                        </select>
                    </div>
                </div>

                {/* --- VIII. KỸ NĂNG & SÀNG LỌC (Moved Down) --- */}
                <h3 className="section-title mt-6">VIII. KỸ NĂNG & TÍNH CÁCH</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Tiếng Nhật <span className="text-red-500 ml-1">*</span></label><select name="trinh_do_tieng_nhat" value={formData.trinh_do_tieng_nhat} onChange={handleChange} className={vCls(formData.trinh_do_tieng_nhat, true)}><option value="" disabled>-- Chọn --</option><option>Chưa biết</option><option>Giới thiệu cơ bản</option><option>N5</option><option>N4</option><option>N3</option></select></div>
                    <div><label className="label">Bằng lái xe <span className="text-red-500 ml-1">*</span></label><select name="bang_lai_xe" value={formData.bang_lai_xe} onChange={handleChange} className={vCls(formData.bang_lai_xe, true)}><option value="" disabled>-- Chọn --</option><option>Chưa có</option><option>Xe máy</option><option>Ô tô</option></select></div>
                    <div><label className="label">Đã từng đi Nhật chưa? <span className="text-red-500 ml-1">*</span></label><select name="da_tung_di_nuoc_ngoai" value={formData.da_tung_di_nuoc_ngoai} onChange={handleChange} className={vCls(formData.da_tung_di_nuoc_ngoai, true)}><option value="" disabled>-- Chọn --</option><option>Chưa</option><option>Rồi</option></select></div>
                    <div><label className="label">Có người thân ở Nhật? <span className="text-red-500 ml-1">*</span></label><select name="co_nguoi_than_o_nhat" value={formData.co_nguoi_than_o_nhat} onChange={handleChange} className={vCls(formData.co_nguoi_than_o_nhat, true)}><option value="" disabled>-- Chọn --</option><option>Không</option><option>Có</option></select></div>
                </div>

                {/* Điểm mạnh / Điểm yếu có gợi ý */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Sở trường / Điểm mạnh <span className="text-red-500 ml-1">*</span></label>
                        <textarea rows={3} name="diem_manh" value={formData.diem_manh} onChange={handleChange} className={vCls(formData.diem_manh, true)} placeholder="Nhập hoặc chọn gợi ý bên dưới..." />
                        <div className="flex flex-wrap gap-2">
                            {goi_y_diem_manh.map(tag => (
                                <span key={tag} onClick={() => addSuggestion('diem_manh', tag)}
                                    className="cursor-pointer px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100 transition-colors">
                                    + {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label">Sở đoản / Điểm yếu <span className="text-red-500 ml-1">*</span></label>
                        <textarea rows={3} name="diem_yeu" value={formData.diem_yeu} onChange={handleChange} className={vCls(formData.diem_yeu, true)} placeholder="Nhập hoặc chọn gợi ý bên dưới..." />
                        <div className="flex flex-wrap gap-2">
                            {goi_y_diem_yeu.map(tag => (
                                <span key={tag} onClick={() => addSuggestion('diem_yeu', tag)}
                                    className="cursor-pointer px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200 hover:bg-yellow-100 transition-colors">
                                    + {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32"> {/* pb-32 để tránh nút che nội dung cuối */}

            {/* Header Difference Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="material-icons-outlined text-blue-400">info</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>HỒ SƠ ĐĂNG KÝ CHÍNH THỨC</strong> (Dành cho ứng viên nộp hồ sơ đầy đủ).<br />
                            Nếu bạn chỉ muốn nhận tư vấn sơ bộ, vui lòng <Link to="/yeu-cau-tu-van" className="font-bold underline hover:text-blue-800">bấm vào đây để đăng ký tư vấn nhanh</Link>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Stepper 1-5 */}
            <div className="sticky top-0 bg-white z-30 pt-4 pb-4 mb-6 border-b shadow-sm -mx-4 px-4 md:mx-0 md:px-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10"></div>
                        <div className="absolute left-0 top-4 h-0.5 bg-teal-600 -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                        {/* Steps */}
                        {[
                            { num: 1, label: 'Cá nhân', icon: 'person_outline' },
                            { num: 2, label: 'Gia đình', icon: 'people_outline' },
                            { num: 3, label: 'Sức khỏe', icon: 'medical_services' },
                            { num: 4, label: 'Học vấn', icon: 'school' },
                            { num: 5, label: 'Nguyện vọng', icon: 'work_outline' }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center group cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                    ${step > s.num ? 'bg-teal-50 border-teal-600 text-teal-700' : ''} 
                                    ${step === s.num ? 'bg-teal-600 border-teal-600 text-white shadow-lg scale-110' : ''}
                                    ${step < s.num ? 'bg-white border-gray-300 text-gray-400' : ''}
                                `}>
                                    <span className="material-icons-outlined text-lg">{s.icon}</span>
                                </div>
                                <span className={`text-[10px] md:text-xs mt-2 font-medium bg-white px-2 py-0.5 rounded-full transition-colors duration-200
                                    ${step === s.num ? 'text-teal-700 font-bold shadow-sm' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden min-h-[500px]">
                <form className="p-6 md:p-8">
                    {step === 1 && Step1_CaNhan()}
                    {step === 2 && Step2_GiaDinh()}
                    {step === 3 && Step3_SucKhoe()}
                    {step === 4 && Step4_HocVan()}
                    {step === 5 && Step5_NguyenVong()}
                </form>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex justify-center gap-4 z-20">
                <button type="button" onClick={() => { if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0) } else navigate('/') }}
                    className="px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 text-gray-700 min-w-[120px]">
                    {step === 1 ? 'Hủy bỏ' : 'Quay lại'}
                </button>

                <button type="button" onClick={(e) => { if (step < 5) { setStep(s => s + 1); window.scrollTo(0, 0) } else handleSubmit(e) }}
                    className="px-8 py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg min-w-[150px] flex items-center justify-center">
                    {step === 5 ? (loading ? 'ĐANG GỬI...' : <><span className="material-icons-outlined mr-2">send</span> Gửi hồ sơ</>) : 'TIẾP THEO →'}
                </button>
            </div>

            {/* CSS Utility Classes embedded for this component */}
            <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { display: block; width: 100%; border-radius: 0.5rem; border: 1px solid #e5e7eb; padding: 0.75rem; font-size: 0.95rem; background-color: #f0fdfa; box-shadow: none; }
        .input:focus { outline: 2px solid #0d9488; border-color: transparent; background-color: #ffffff; }
        .input-sm { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #e5e7eb; padding: 0.5rem; font-size: 0.875rem; background-color: #f0fdfa; box-shadow: none; }
        .input-sm:focus { outline: 2px solid #0d9488; border-color: transparent; background-color: #ffffff; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: #115e59; text-transform: uppercase; border-bottom: 2px solid #ccfbf1; padding-bottom: 0.5rem; margin-bottom: 1rem; }
        .btn-add { margin-top: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0d9488; display: flex; align-items: center; gap: 0.25rem; }
        .btn-add:hover { text-decoration: underline; }
      `}</style>
        </div>
    )
}
