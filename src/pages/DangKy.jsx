import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, useNavigate } from 'react-router-dom'

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
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: 'Nam',
        hon_nhan: 'Độc thân', // Đổi tên cho ngắn gọn
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

        ton_giao: 'Không',    // Thêm Tôn giáo
        size_ao: 'M',         // Thêm Size
        size_giay: '40',
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
        nhom_mau: 'A',
        thi_luc_trai: '',
        thi_luc_phai: '',
        tay_thuan: 'Phải',

        xam_hinh: 'Không',
        mu_mau: 'Không',
        hut_thuoc: 'Không',
        uong_ruou: 'Không',

        di_ung: '',           // Thêm Dị ứng
        benh_an_phau_thuat: '', // Thêm Tiền sử bệnh

        // --- BƯỚC 4: HỌC VẤN & KINH NGHIỆM (JSON Array) ---
        qua_trinh_hoc_tap: [],
        kinh_nghiem_lam_viec: [],

        // --- BƯỚC 5: KỸ NĂNG & NGUYỆN VỌNG & SÀNG LỌC ---
        trinh_do_tieng_nhat: 'Chưa biết',
        bang_lai_xe: 'Chưa có',
        diem_manh: '',
        diem_yeu: '',

        nganh_nghe_mong_muon: '',
        thoi_gian_du_kien: '3 năm',
        muc_dich_di_nhat: '',

        da_tung_di_nuoc_ngoai: 'Chưa', // Thêm Sàng lọc
        co_nguoi_than_o_nhat: 'Không',
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

    // --- Logic BMI ---
    const bmi = (formData.chieu_cao && formData.can_nang) ? (formData.can_nang / ((formData.chieu_cao / 100) ** 2)).toFixed(1) : ''

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (id) {
                const { error } = await supabase.from('ho_so').update(formData).eq('id', id)
                if (error) throw error
                alert('Cập nhật hồ sơ thành công!')
            } else {
                const { error } = await supabase.from('ho_so').insert([formData])
                if (error) throw error
                alert('Đăng ký mới thành công!')
            }
            navigate('/')
        } catch (error) { alert('Lỗi: ' + error.message) }
        finally { setLoading(false) }
    }

    // --- Upload Ảnh ---
    const [uploading, setUploading] = useState(false)

    const handleUploadImage = async (event, fieldName) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                // throw new Error('Bạn chưa chọn ảnh nào.')
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
                    <div className="md:col-span-2">
                        <label className="label">Họ và Tên (In hoa)</label>
                        <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} className="input uppercase" placeholder="NGUYỄN VĂN A" />
                    </div>
                    <div><label className="label">Ngày sinh</label><input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className="input" /></div>
                    <div>
                        <label className="label">Giới tính</label>
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
                <div><label className="label">Số điện thoại</label><input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} className="input" placeholder="09xx..." /></div>

                <div><label className="label">Email (Nếu có)</label><input name="email" value={formData.email} onChange={handleChange} className="input" placeholder="example@gmail.com" /></div>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-3">
                <div><label className="label">Quê quán (Nguyên quán)</label><input name="que_quan" value={formData.que_quan} onChange={handleChange} className="input" placeholder="Xã, Huyện, Tỉnh..." /></div>
                <div><label className="label">Nơi ở hiện tại (Để liên hệ)</label><input name="noi_o_hien_tai" value={formData.noi_o_hien_tai} onChange={handleChange} className="input" placeholder="Số nhà, đường..." /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100">
                <div><label className="label">Tôn giáo</label><input name="ton_giao" value={formData.ton_giao} onChange={handleChange} className="input" /></div>
                <div><label className="label">Tình trạng hôn nhân</label>
                    <select name="hon_nhan" value={formData.hon_nhan} onChange={handleChange} className="input">
                        <option>Độc thân</option><option>Đã kết hôn</option><option>Ly hôn</option>
                    </select>
                </div>
                <div><label className="label">Size Quần áo</label><input name="size_ao" value={formData.size_ao} onChange={handleChange} className="input" placeholder="S, M, L..." /></div>
                <div><label className="label">Size Giày</label><input name="size_giay" value={formData.size_giay} onChange={handleChange} className="input" placeholder="39, 40..." /></div>
            </div>

            <h3 className="section-title pt-4">II. GIẤY TỜ TÙY THÂN</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Số CCCD / CMND</label><input name="so_cccd" value={formData.so_cccd} onChange={handleChange} className="input" /></div>
                <div><label className="label">Ngày cấp</label><input type="date" name="ngay_cap_cccd" value={formData.ngay_cap_cccd} onChange={handleChange} className="input" /></div>
                <div><label className="label">Nơi cấp</label><input name="noi_cap_cccd" value={formData.noi_cap_cccd} onChange={handleChange} className="input" placeholder="Cục CS QLHC..." /></div>
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
                        {uploading ? ( // Cần tách state uploading riêng nếu muốn loading từng cái, nhưng tạm dùng chung cho đơn giản
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
                        <div><label className="text-xs text-gray-500 block mb-1">Quan hệ</label><input placeholder="Bố/Mẹ/Vợ..." value={mem.quan_he} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'quan_he', e.target.value)} className="input-sm font-medium" /></div>
                        <div className="md:col-span-1"><label className="text-xs text-gray-500 block mb-1">Họ và Tên</label><input placeholder="NGUYỄN VĂN A" value={mem.ho_ten} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'ho_ten', e.target.value)} className="input-sm uppercase" /></div>
                        <div><label className="text-xs text-gray-500 block mb-1">Năm sinh</label><input type="number" placeholder="19xx" value={mem.nam_sinh} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'nam_sinh', e.target.value)} className="input-sm" /></div>
                        <div><label className="text-xs text-gray-500 block mb-1">Nghề nghiệp</label><input placeholder="Làm ruộng..." value={mem.nghe_nghiep} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'nghe_nghiep', e.target.value)} className="input-sm" /></div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={() => addItem('thong_tin_gia_dinh', { quan_he: '', ho_ten: '', nam_sinh: '', nghe_nghiep: '' })} className="btn-add">
                + Thêm thành viên khác
            </button>

            <div className="mt-8 pt-4 border-t">
                <h4 className="font-bold text-gray-700 mb-3">Người bảo lãnh (Liên hệ khẩn cấp)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Họ tên người bảo lãnh</label><input name="nguoi_bao_lanh" value={formData.nguoi_bao_lanh} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Số điện thoại liên hệ</label><input name="sdt_nguoi_bao_lanh" value={formData.sdt_nguoi_bao_lanh} onChange={handleChange} className="input" /></div>
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
                <div><label className="label">Chiều cao (cm)</label><input type="number" name="chieu_cao" value={formData.chieu_cao} onChange={handleChange} className="input text-center font-bold" /></div>
                <div><label className="label">Cân nặng (kg)</label><input type="number" name="can_nang" value={formData.can_nang} onChange={handleChange} className="input text-center font-bold" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="label">Nhóm máu</label><select name="nhom_mau" value={formData.nhom_mau} onChange={handleChange} className="input"><option>A</option><option>B</option><option>O</option><option>AB</option></select></div>
                <div><label className="label">Tay thuận</label><select name="tay_thuan" value={formData.tay_thuan} onChange={handleChange} className="input"><option>Phải</option><option>Trái</option><option>Hai tay</option></select></div>
                <div><label className="label">Thị lực (Trái)</label><input name="thi_luc_trai" value={formData.thi_luc_trai} onChange={handleChange} className="input" placeholder="10/10" /></div>
                <div><label className="label">Thị lực (Phải)</label><input name="thi_luc_phai" value={formData.thi_luc_phai} onChange={handleChange} className="input" placeholder="10/10" /></div>
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
                        <label className="label">{item.text}</label>
                        <select name={item.key} value={formData[item.key] === true ? item.opt[1] : (formData[item.key] === false ? 'Không' : formData[item.key])} onChange={handleChange} className="input">
                            {item.opt.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Dị ứng (Thuốc, Thức ăn...)</label><textarea rows={2} name="di_ung" value={formData.di_ung} onChange={handleChange} className="input" placeholder="Nếu không có ghi 'Không'" /></div>
                <div><label className="label">Tiền sử Bệnh / Phẫu thuật</label><textarea rows={2} name="benh_an_phau_thuat" value={formData.benh_an_phau_thuat} onChange={handleChange} className="input" placeholder="Đã từng mổ ruột thừa..." /></div>
            </div>
        </div>
    )

    // --- Helper xử lý tách/gộp thời gian (Dạng Date) ---
    const handleDateChange = (arrayName, index, part, value) => {
        // Format lưu trữ: "YYYY-MM-DD - YYYY-MM-DD"
        const currentString = formData[arrayName][index].thoi_gian || ' - '
        const [startStr, endStr] = currentString.includes(' - ') ? currentString.split(' - ') : ['', '']

        let newStart = startStr
        let newEnd = endStr

        if (part === 'start') newStart = value
        if (part === 'end') newEnd = value

        const newVal = `${newStart} - ${newEnd}`
        handleArrayChange(arrayName, index, 'thoi_gian', newVal)
    }

    const getDatePart = (arrayName, index, part) => {
        const val = formData[arrayName][index].thoi_gian || ' - '
        const [start, end] = val.includes(' - ') ? val.split(' - ') : ['', '']
        return part === 'start' ? start : end
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
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                {/* Thời gian - Compact Date Input */}
                                <div className="w-full md:w-auto">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian</label>
                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                                        <input type="date" className="text-sm outline-none w-32 cursor-pointer border-none p-0 focus:ring-0"
                                            value={getDatePart('qua_trinh_hoc_tap', 0, 'start')}
                                            onChange={(e) => handleDateChange('qua_trinh_hoc_tap', 0, 'start', e.target.value)}
                                        />
                                        <span className="text-gray-400">➔</span>
                                        <input type="date" className="text-sm outline-none w-32 cursor-pointer border-none p-0 focus:ring-0"
                                            value={getDatePart('qua_trinh_hoc_tap', 0, 'end')}
                                            onChange={(e) => handleDateChange('qua_trinh_hoc_tap', 0, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500 block mb-1">Tên trường</label>
                                        <input placeholder="THPT NGUYỄN TRÃI" className="input-sm font-medium uppercase w-full"
                                            value={formData.qua_trinh_hoc_tap[0].ten_truong}
                                            onChange={(e) => handleArrayChange('qua_trinh_hoc_tap', 0, 'ten_truong', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500 block mb-1">Cấp học</label>
                                        <select className="input-sm w-full" value={formData.qua_trinh_hoc_tap[0].bang_cap} onChange={(e) => handleArrayChange('qua_trinh_hoc_tap', 0, 'bang_cap', e.target.value)}>
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
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                {/* Thời gian - Compact Date Input */}
                                <div className="w-full md:w-auto">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian</label>
                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                                        <input type="date" className="text-sm outline-none w-32 cursor-pointer border-none p-0 focus:ring-0"
                                            value={getDatePart('kinh_nghiem_lam_viec', idx, 'start')}
                                            onChange={(e) => handleDateChange('kinh_nghiem_lam_viec', idx, 'start', e.target.value)}
                                        />
                                        <span className="text-gray-400">➔</span>
                                        <input type="date" className="text-sm outline-none w-32 cursor-pointer border-none p-0 focus:ring-0"
                                            value={getDatePart('kinh_nghiem_lam_viec', idx, 'end')}
                                            onChange={(e) => handleDateChange('kinh_nghiem_lam_viec', idx, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Tên công ty</label>
                                        <input placeholder="Công ty ABC" className="input-sm font-medium w-full"
                                            value={item.cong_ty}
                                            onChange={(e) => handleArrayChange('kinh_nghiem_lam_viec', idx, 'cong_ty', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Công việc</label>
                                        <input placeholder="Công nhân may..." className="input-sm w-full"
                                            value={item.cong_viec}
                                            onChange={(e) => handleArrayChange('kinh_nghiem_lam_viec', idx, 'cong_viec', e.target.value)}
                                        />
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
            "Sức khỏe tốt, dẻo dai", "Chăm chỉ, chịu khó", "Đúng giờ, chấp hành tốt",
            "Trung thực, thật thà", "Cẩn thận, tỉ mỉ", "Tinh thần trách nhiệm cao",
            "Hòa đồng, giao tiếp tốt", "Gọn gàng, ngăn nắp"
        ]
        const goi_y_diem_yeu = [
            "Giao tiếp chưa khéo", "Cẩn thận quá mức", "Hay hồi hộp, lo lắng",
            "Vội vàng, hấp tấp", "Tính cách thẳng thắn", "Không chịu được áp lực",
            "Dễ nổi nóng, mất bình tĩnh"
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
                <h3 className="section-title">VII. KỸ NĂNG & SÀNG LỌC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Tiếng Nhật</label><select name="trinh_do_tieng_nhat" value={formData.trinh_do_tieng_nhat} onChange={handleChange} className="input"><option>Chưa biết</option><option>Giới thiệu cơ bản</option><option>N5</option><option>N4</option><option>N3</option></select></div>
                    <div><label className="label">Bằng lái xe</label><select name="bang_lai_xe" value={formData.bang_lai_xe} onChange={handleChange} className="input"><option>Chưa có</option><option>Xe máy</option><option>Ô tô</option></select></div>
                    <div><label className="label">Đã từng đi Nhật chưa?</label><select name="da_tung_di_nuoc_ngoai" value={formData.da_tung_di_nuoc_ngoai} onChange={handleChange} className="input"><option>Chưa</option><option>Rồi</option></select></div>
                    <div><label className="label">Có người thân ở Nhật?</label><select name="co_nguoi_than_o_nhat" value={formData.co_nguoi_than_o_nhat} onChange={handleChange} className="input"><option>Không</option><option>Có</option></select></div>
                </div>

                {/* Điểm mạnh / Điểm yếu có gợi ý */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Sở trường / Điểm mạnh</label>
                        <textarea rows={3} name="diem_manh" value={formData.diem_manh} onChange={handleChange} className="input mb-2" placeholder="Nhập hoặc chọn gợi ý bên dưới..." />
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
                        <label className="label">Sở đoản / Điểm yếu</label>
                        <textarea rows={3} name="diem_yeu" value={formData.diem_yeu} onChange={handleChange} className="input mb-2" placeholder="Nhập hoặc chọn gợi ý bên dưới..." />
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

                <h3 className="section-title mt-6">VIII. NGUYỆN VỌNG ĐĂNG KÝ</h3>
                <div>
                    <label className="label mb-2 block">Ngành nghề mong muốn</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Thực phẩm', 'Cơ khí', 'Xây dựng', 'May mặc', 'Nông nghiệp', 'Điện tử'].map(job => (
                            <label key={job} className={`cursor-pointer border p-3 rounded text-center ${formData.nganh_nghe_mong_muon.includes(job) ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="nganh_nghe_mong_muon" value={job} checked={formData.nganh_nghe_mong_muon === job} onChange={handleChange} className="sr-only" />{job}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Dự định ở Nhật mấy năm?</label><select name="thoi_gian_du_kien" value={formData.thoi_gian_du_kien} onChange={handleChange} className="input"><option>1 năm</option><option>3 năm</option><option>5 năm</option><option>8 năm</option><option>10 năm</option></select></div>
                    <div><label className="label">Mục đích đi Nhật</label><input name="muc_dich_di_nhat" value={formData.muc_dich_di_nhat} onChange={handleChange} className="input" placeholder="Kiếm tiền, học nghề..." /></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32"> {/* pb-32 để tránh nút che nội dung cuối */}

            {/* Progress Stepper 1-5 */}
            <div className="sticky top-0 bg-white z-30 pt-4 pb-4 mb-6 border-b shadow-sm -mx-4 px-4 md:mx-0 md:px-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10"></div>
                        <div className="absolute left-0 top-4 h-0.5 bg-teal-600 -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                        {/* Steps */}
                        {[
                            { num: 1, label: 'Cá nhân' },
                            { num: 2, label: 'Gia đình' },
                            { num: 3, label: 'Sức khỏe' },
                            { num: 4, label: 'Học vấn' },
                            { num: 5, label: 'Nguyện vọng' }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center group cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-200
                                    ${step > s.num ? 'bg-teal-50 border-teal-600 text-teal-700' : ''} 
                                    ${step === s.num ? 'bg-teal-600 border-teal-600 text-white ring-4 ring-teal-100' : ''}
                                    ${step < s.num ? 'bg-white border-gray-300 text-gray-400' : ''}
                                `}>
                                    {s.num}
                                </div>
                                <span className={`text-[10px] md:text-xs mt-1 font-medium bg-white px-1 whitespace-nowrap 
                                    ${step === s.num ? 'text-teal-700 font-bold' : 'text-gray-500'}`}>
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
                    className="px-8 py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg min-w-[150px]">
                    {step === 5 ? (loading ? 'ĐANG GỬI...' : 'HOÀN THÀNH') : 'TIẾP THEO →'}
                </button>
            </div>

            {/* CSS Utility Classes embedded for this component */}
            <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { display: block; width: 100%; border-radius: 0.5rem; border: 1px solid #d1d5db; padding: 0.75rem; font-size: 0.95rem; }
        .input:focus { outline: 2px solid #0d9488; border-color: transparent; }
        .input-sm { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #e5e7eb; padding: 0.5rem; font-size: 0.875rem; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: #115e59; text-transform: uppercase; border-bottom: 2px solid #ccfbf1; padding-bottom: 0.5rem; margin-bottom: 1rem; }
        .btn-add { margin-top: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0d9488; display: flex; align-items: center; gap: 0.25rem; }
        .btn-add:hover { text-decoration: underline; }
      `}</style>
        </div>
    )
}
