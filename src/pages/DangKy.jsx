import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { scanIdCard } from '../utils/aiScanner'
import { compressImage } from '../utils/compressImage'
import { useParams, useNavigate, Link } from 'react-router-dom'

export default function DangKy({ adminMode = false }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)
    const [validationErrors, setValidationErrors] = useState([])

    const steps = [
        { num: 1, label: 'Cá nhân & Giấy tờ', icon: 'person_outline' },
        { num: 2, label: 'Gia đình', icon: 'people_outline' },
        { num: 3, label: 'Sức khỏe', icon: 'medical_services' },
        { num: 4, label: 'Học vấn & Kinh nghiệm', icon: 'school' },
        { num: 5, label: 'Nguyện vọng & Kỹ năng', icon: 'work_outline' }
    ]

    const [formData, setFormData] = useState({
        // --- BƯỚC 1: CÁ NHÂN & GIẤY TỜ ---
        nguon: '', // Nguồn hồ sơ (thay thế mã hồ sơ)
        ho_ten: '',
        nickname: '', // Biệt danh (không bắt buộc)
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
        thong_tin_gia_dinh: [
            { quan_he: 'Bố', ho_ten: '', nam_sinh: '', nghe_nghiep: '' },
            { quan_he: 'Mẹ', ho_ten: '', nam_sinh: '', nghe_nghiep: '' }
        ],
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
        qua_trinh_hoc_tap: [
            { thoi_gian: '', ten_truong: '', bang_cap: '' }
        ],
        kinh_nghiem_lam_viec: [
            { thoi_gian: '', cong_ty: '', cong_viec: '' },
            { thoi_gian: '', cong_ty: '', cong_viec: '' }
        ],

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

    // Hàm chuyển đổi Tiếng Việt có dấu -> Không dấu In Hoa
    const toUpperNoAccent = (str) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toUpperCase();
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        let finalValue = type === 'checkbox' ? checked : value

        // Tự động format cho các trường cần thiết
        if (name === 'ho_ten' || name === 'que_quan' || name === 'noi_o_hien_tai' || name === 'noi_cap_cccd') {
            finalValue = toUpperNoAccent(finalValue)
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }))
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
            que_quan: 'Quê quán',
            ton_giao: 'Tôn giáo',
            hon_nhan: 'Tình trạng hôn nhân',
            so_cccd: 'Số CCCD',
            ngay_cap_cccd: 'Ngày cấp CCCD',
            noi_cap_cccd: 'Nơi cấp CCCD',
            anh_ho_so: 'Ảnh chân dung',
            anh_cccd_mat_truoc: 'Ảnh mặt trước CCCD/CMT',
            // anh_cccd_mat_sau: 'Ảnh mặt sau CCCD', // Không bắt buộc
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
            } else if (typeof val === 'string' && (val.includes('--') || val.startsWith('-') || val.endsWith('-'))) {
                missing.push(label + ' (Ngày tháng chưa đầy đủ)')
            }
        })

        // Validate Gia Đình (Bố, Mẹ là quan trọng) - Nếu đã khai thì phải đủ
        formData.thong_tin_gia_dinh.forEach(mem => {
            if ((mem.quan_he === 'Bố' || mem.quan_he === 'Mẹ') && (!mem.ho_ten || !mem.nam_sinh)) {
                missing.push(`Thông tin ${mem.quan_he} (Họ tên, Năm sinh)`);
            }
        });

        // Validate Học Vấn (Bắt buộc ít nhất 1 dòng)
        if (formData.qua_trinh_hoc_tap.length === 0) {
            missing.push('Quá trình học tập (Vui lòng thêm ít nhất 1 cấp học)');
        } else {
            // Check dòng đầu tiên
            const h1 = formData.qua_trinh_hoc_tap[0];
            if (!h1.thoi_gian || !h1.ten_truong || !h1.bang_cap) missing.push('Học vấn (Dòng 1 chưa đủ thông tin)');
        }

        // Validate Kinh Nghiệm (Dòng 1 bắt buộc theo yêu cầu)
        if (formData.kinh_nghiem_lam_viec.length > 0) {
            const k1 = formData.kinh_nghiem_lam_viec[0];
            if (!k1.thoi_gian || !k1.cong_ty || !k1.cong_viec) missing.push('Kinh nghiệm làm việc (Dòng 1 bắt buộc)');
        }

        if (missing.length > 0) {
            setValidationErrors(missing)
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
                if (adminMode) {
                    navigate('/admin/ho-so')
                } else {
                    setShowSuccess(true)
                }
            }
        } catch (error) { alert('Lỗi: ' + error.message) }
        finally { setLoading(false) }
    }

    // --- Upload Ảnh & AI OCR ---
    const [uploading, setUploading] = useState(false)
    const [isScanning, setIsScanning] = useState(false) // Trạng thái quét AI

    // Hàm gọi AI Gemini (Flash Model) - Tối ưu cho CCCD
    const analyzeCCCD = async (fileInput) => {
        setIsScanning(true)
        console.log('Bắt đầu phân tích ảnh với Gemini JSON Mode...')

        try {
            // Gọi hàm scanIdCard mới
            const extractedData = await scanIdCard(fileInput)

            if (!extractedData) {
                alert('Không đọc được thông tin. Vui lòng thử lại với ảnh rõ nét hơn.')
                return
            }

            console.log('Gemini Extracted (JSON):', extractedData)

            // Map dữ liệu từ JSON trả về vào Form (Logic Smart Fill: Chỉ điền ô trống)
            const cleanData = {}
            let hasNewData = false

            // Helper format: UPPERCASE NO ACCENT
            const fmt = (val) => toUpperNoAccent(val)

            // List các trường cần map
            const fieldsToMap = [
                { formKey: 'so_cccd', jsonKey: 'so_cccd', format: false }, // Số giữ nguyên
                { formKey: 'ho_ten', jsonKey: 'ho_ten', format: true },
                { formKey: 'ngay_sinh', jsonKey: 'ngay_sinh', format: false },
                { formKey: 'ngay_cap_cccd', jsonKey: 'ngay_cap_cccd', format: false },
                { formKey: 'gioi_tinh', jsonKey: 'gioi_tinh', format: false },
                { formKey: 'que_quan', jsonKey: 'que_quan', format: true },
                { formKey: 'noi_o_hien_tai', jsonKey: 'noi_o_hien_tai', format: true },
                { formKey: 'noi_cap_cccd', jsonKey: 'noi_cap_cccd', format: true },
            ]

            fieldsToMap.forEach(({ formKey, jsonKey, format }) => {
                let aiValue = extractedData[jsonKey]
                if (aiValue) {
                    if (format) aiValue = fmt(aiValue)

                    // CHỈ ĐIỀN NẾU FORM ĐANG TRỐNG
                    if (!formData[formKey] || formData[formKey].trim() === '') {
                        cleanData[formKey] = aiValue
                        hasNewData = true
                    }
                }
            })


            if (hasNewData) {
                setFormData(prev => ({
                    ...prev,
                    ...cleanData
                }))
                alert('✅ AI Scan thành công!')
            } else {
                // Nếu không có dữ liệu mới điền vào (do đã có đủ hoặc AI ko đọc được gì mới)
                // Không làm gì hoặc thông báo nhẹ
                console.log('Không có thông tin mới cần bổ sung (Dữ liệu đã có sẵn).')
            }

        } catch (error) {
            console.error('AI Error:', error)
            alert('Lỗi xử lý ảnh: ' + error.message)
        } finally {
            setIsScanning(false)
        }
    }

    const handleUploadImage = async (event, fieldName) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                setUploading(false)
                return
            }

            const file = event.target.files[0]
            let fileToUpload = file

            // --- TỰ ĐỘNG NÉN ẢNH CHO STORAGE (< 200KB) ---
            try {
                if (file.type.startsWith('image/')) {
                    const compressed = await compressImage(file, 200)
                    if (compressed) {
                        fileToUpload = compressed
                        console.log(`Đã nén ảnh upload: ${(fileToUpload.size / 1024).toFixed(1)} KB (Gốc: ${(file.size / 1024).toFixed(1)} KB)`)
                    }
                }
            } catch (e) {
                console.warn("Lỗi nén ảnh (bỏ qua):", e)
            }
            // ----------------------------------

            const fileExt = fileToUpload.name.split('.').pop()
            const fileName = `${fieldName}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload ảnh NÉN lên bucket 'avatars' (Tiết kiệm dung lượng)
            let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, fileToUpload)

            if (uploadError) {
                throw uploadError
            }

            // Lấy URL công khai
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // Cập nhật vào form
            setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }))

            // Nếu là ảnh mặt trước HOẶC mặt sau -> Kích hoạt AI Scan (Dùng FILE GỐC để AI đọc rõ nét nhất)
            if (fieldName === 'anh_cccd_mat_truoc' || fieldName === 'anh_cccd_mat_sau') {
                analyzeCCCD(file) // Dùng file gốc chất lượng cao
            }

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
            {/* I. SỐ HÓA GIẤY TỜ - Ẩn trong chế độ Admin */}
            {!adminMode && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="section-title !mb-0 !pb-0 !border-b-0 text-emerald-900 flex items-center gap-2">
                            <span className="material-icons-outlined">document_scanner</span>
                            I. SỐ HÓA GIẤY TỜ
                        </h3>
                        <span className="text-xs font-bold text-orange-700 bg-white px-3 py-1.5 rounded-full border border-orange-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            AI Scan
                        </span>
                    </div>

                    {/* Ảnh CCCD 2 mặt */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mặt trước */}
                        <div>
                            <label className="label mb-2 text-emerald-700 font-semibold text-xs">Ảnh mặt trước CCCD/CMT <span className="text-red-500">*</span></label>
                            <div className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center text-gray-500 hover:bg-white/80 bg-white relative overflow-hidden cursor-pointer group transition-all
                            ${isScanning ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                                onClick={() => document.getElementById('file-upload-cccd-truoc').click()}>

                                {uploading && !formData.anh_cccd_mat_truoc ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                ) : isScanning ? (
                                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                                        <p className="text-emerald-700 font-bold text-sm animate-pulse">AI đang phân tích dữ liệu...</p>
                                    </div>
                                ) : formData.anh_cccd_mat_truoc ? (
                                    <img src={formData.anh_cccd_mat_truoc} alt="CCCD Trước" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-emerald-300 group-hover:text-emerald-500 transition-colors mb-2">add_a_photo</span>
                                        <span className="text-sm font-medium text-gray-500">Tải ảnh mặt trước</span>
                                    </>
                                )}
                                <input type="file" id="file-upload-cccd-truoc" accept="image/*" className="hidden"
                                    onChange={(e) => handleUploadImage(e, 'anh_cccd_mat_truoc')} disabled={uploading || isScanning} />
                            </div>
                        </div>

                        {/* Mặt sau */}
                        <div>
                            <label className="label mb-2 text-emerald-700 font-semibold text-xs">Ảnh mặt sau</label>
                            <div className="border-2 border-dashed border-gray-200 hover:border-emerald-300 rounded-xl h-40 flex flex-col items-center justify-center text-gray-500 hover:bg-white/80 bg-white relative overflow-hidden cursor-pointer group transition-all"
                                onClick={() => document.getElementById('file-upload-cccd-sau').click()}>
                                {uploading && !formData.anh_cccd_mat_sau ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                ) : formData.anh_cccd_mat_sau ? (
                                    <img src={formData.anh_cccd_mat_sau} alt="CCCD Sau" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <>
                                        <span className="material-icons-outlined text-4xl text-gray-400 mb-2">add_a_photo</span>
                                        <span className="text-sm font-medium text-gray-500">Tải ảnh mặt sau</span>
                                    </>
                                )}
                                <input type="file" id="file-upload-cccd-sau" accept="image/*" className="hidden"
                                    onChange={(e) => handleUploadImage(e, 'anh_cccd_mat_sau')} disabled={uploading} />
                            </div>
                        </div>
                    </div>

                    {/* Các trường thông tin trích xuất ID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-100/50">
                        <div><label className="label">Số CCCD / CMND <span className="text-red-500 ml-1">*</span></label><input name="so_cccd" value={formData.so_cccd} onChange={handleChange} className={vCls(formData.so_cccd)} placeholder="AI sẽ tự điền..." /></div>
                        <div className="z-0 relative">
                            <label className="label">Ngày cấp <span className="text-red-500 ml-1">*</span></label>
                            <FullDateSelect name="ngay_cap_cccd" value={formData.ngay_cap_cccd} onChange={handleChange} startYear={2000} endYear={new Date().getFullYear()} />
                        </div>
                        <div><label className="label">Nơi cấp <span className="text-red-500 ml-1">*</span></label><input name="noi_cap_cccd" value={formData.noi_cap_cccd} onChange={handleChange} className={vCls(formData.noi_cap_cccd)} placeholder="Cục CS QLHC..." /></div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 py-2 mt-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="section-title !mb-0 !pb-0 !border-b-0 text-slate-700 text-sm">
                    {adminMode ? 'I. THÔNG TIN CƠ BẢN' : 'II. XÁC THỰC THÔNG TIN ỨNG VIÊN'}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Ảnh & Thông tin chính - Reorganized for better balance */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
                {/* Cột 1: Ảnh chân dung - Compacted & Centered on mobile */}
                <div className="w-40 flex-shrink-0">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 bg-white relative overflow-hidden cursor-pointer group transition-all"
                        onClick={() => document.getElementById('file-upload').click()}>

                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        ) : formData.anh_ho_so ? (
                            <img src={formData.anh_ho_so} alt="Ảnh hồ sơ" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <span className="material-icons-outlined text-4xl text-gray-300 group-hover:text-primary-500 transition-colors">account_circle</span>
                                <span className="text-[10px] mt-2 font-bold text-gray-400 group-hover:text-primary-600 uppercase tracking-tighter text-center px-2">Ảnh chân dung 4x6</span>
                            </>
                        )}
                        <input type="file" id="file-upload" accept="image/*" className="hidden"
                            onChange={(e) => handleUploadImage(e, 'anh_ho_so')} disabled={uploading} />

                        {formData.anh_ho_so && !uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full">Thay đổi</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột chính: Thông tin chi tiết */}
                <div className="w-full space-y-4">
                    {/* Hàng 1: Họ tên & Furigana */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Họ và Tên <span className="text-red-500 ml-1">*</span></label>
                            <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} className={vCls(formData.ho_ten) + " uppercase font-bold text-teal-900"} placeholder="NGUYÊN VĂN A" />
                        </div>
                        <div>
                            <label className="label">Tên gọi theo フリガナ</label>
                            <input name="nickname" value={formData.nickname || ''} onChange={handleChange} className={vCls(formData.nickname)} placeholder="VD: ヌグイエン ヴァン ア" />
                        </div>
                    </div>

                    {/* Hàng 2: Ngày sinh, Giới tính, Tôn giáo, Hôn nhân */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 z-20 relative">
                            <label className="label">Ngày sinh <span className="text-red-500 ml-1">*</span></label>
                            <FullDateSelect name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} startYear={1970} endYear={2010} />
                        </div>
                        <div className="md:col-span-3 pb-2">
                            <label className="label">Giới tính <span className="text-red-500 ml-1">*</span></label>
                            <div className="flex gap-4">
                                {['Nam', 'Nữ'].map(g => (
                                    <label key={g} className="flex items-center cursor-pointer group">
                                        <input type="radio" name="gioi_tinh" value={g} checked={formData.gioi_tinh === g} onChange={handleChange} className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500" />
                                        <span className={`ml-2 text-sm font-medium ${formData.gioi_tinh === g ? 'text-teal-700' : 'text-gray-500'}`}>{g}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label">Tôn giáo <span className="text-red-500 ml-1">*</span></label>
                            <select name="ton_giao" value={formData.ton_giao} onChange={handleChange} className={vCls(formData.ton_giao, true)}>
                                <option value="" disabled>Chọn</option>
                                {['Không', 'Phật giáo', 'Thiên Chúa giáo', 'Tin Lành', 'Hòa Hảo', 'Cao Đài', 'Khác'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="label">Hôn nhân <span className="text-red-500 ml-1">*</span></label>
                            <select name="hon_nhan" value={formData.hon_nhan} onChange={handleChange} className={vCls(formData.hon_nhan, true)}>
                                <option value="" disabled>Chọn</option>
                                {['Độc thân', 'Đã kết hôn', 'Ly hôn'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Hàng 3: Quê quán & Nơi ở hiện tại (Nếu không phải admin) */}
                    <div className="space-y-4">
                        <div>
                            <label className="label">Quê quán (Nguyên quán) <span className="text-red-500 ml-1">*</span></label>
                            <input name="que_quan" value={formData.que_quan} onChange={handleChange} className={vCls(formData.que_quan) + " uppercase"} placeholder="XÃ, HUYỆN, TỈNH..." />
                        </div>

                        {!adminMode && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="label">Số điện thoại</label><input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} className={vCls(formData.so_dien_thoai)} placeholder="09xx..." /></div>
                                <div><label className="label">Email</label><input name="email" value={formData.email} onChange={handleChange} className={vCls(formData.email)} placeholder="example@gmail.com" /></div>
                            </div>
                        )}

                        {!adminMode && (
                            <div>
                                <label className="label">Nơi ở hiện tại (Để liên hệ) <span className="text-red-500 ml-1">*</span></label>
                                <input name="noi_o_hien_tai" value={formData.noi_o_hien_tai} onChange={handleChange} className={vCls(formData.noi_o_hien_tai) + " uppercase"} placeholder="SỐ NHÀ, ĐƯỜNG..." />
                            </div>
                        )}

                        {!adminMode && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="label">Size Áo <span className="text-red-500 ml-1">*</span></label>
                                    <select name="size_ao" value={formData.size_ao} onChange={handleChange} className={vCls(formData.size_ao, true)}>
                                        <option value="" disabled>Size</option>
                                        {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Size Giày <span className="text-red-500 ml-1">*</span></label>
                                    <select name="size_giay" value={formData.size_giay} onChange={handleChange} className={vCls(formData.size_giay, true)}>
                                        <option value="" disabled>Size</option>
                                        {Array.from({ length: 17 }, (_, i) => 22 + i * 0.5).map(s => <option key={s} value={s}>{s} cm</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    const Step2_GiaDinh = () => (
        <div className="space-y-4 animate-fade-in">
            <h3 className="section-title text-base">{adminMode ? 'III' : 'IV'}. THÔNG TIN GIA ĐÌNH</h3>
            <p className="text-[11px] text-gray-500 italic -mt-2">(*) Khai đầy đủ thông tin: Bố, Mẹ, Vợ/Chồng, Con cái (Bắt buộc để xin Visa).</p>

            {formData.thong_tin_gia_dinh.map((mem, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative mb-2 shadow-sm">
                    {mem.quan_he !== 'Bố' && mem.quan_he !== 'Mẹ' && (
                        <button type="button" onClick={() => removeItem('thong_tin_gia_dinh', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold bg-white rounded-full p-1" title="Xóa dòng này">
                            <span className="material-icons-outlined text-lg">close</span>
                        </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Quan hệ <span className="text-red-500">*</span></label>
                            <select className={`input-sm w-full font-medium ${!mem.quan_he ? 'text-gray-400' : '!bg-white'}`} value={mem.quan_he} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'quan_he', e.target.value)}>
                                <option value="" disabled>-- Chọn --</option>
                                {['Bố', 'Mẹ', 'Chồng', 'Vợ', 'Con', 'Anh chị', 'Ông bà'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-xs text-gray-500 block mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                            <input placeholder="NGUYEN VAN A" value={mem.ho_ten} onChange={(e) => handleArrayChange('thong_tin_gia_dinh', idx, 'ho_ten', toUpperNoAccent(e.target.value))} className={`input-sm uppercase ${!mem.ho_ten ? '' : '!bg-white'}`} />
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

            <button type="button" onClick={() => addItem('thong_tin_gia_dinh', { quan_he: '', ho_ten: '', nam_sinh: '', nghe_nghiep: '' })}
                className="w-full md:w-auto px-6 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl border-2 border-dashed border-emerald-300 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-wide">
                <span className="material-icons-outlined text-base">person_add</span>
                Thêm thành viên khác
            </button>

            {!adminMode && (
                <div className="mt-8 pt-4 border-t">
                    <h4 className="font-bold text-gray-700 mb-3">Người bảo lãnh (Liên hệ khẩn cấp)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Họ tên người bảo lãnh <span className="text-red-500 ml-1">*</span></label><input name="nguoi_bao_lanh" value={formData.nguoi_bao_lanh} onChange={handleChange} className={vCls(formData.nguoi_bao_lanh)} /></div>
                        <div><label className="label">Số điện thoại liên hệ <span className="text-red-500 ml-1">*</span></label><input name="sdt_nguoi_bao_lanh" value={formData.sdt_nguoi_bao_lanh} onChange={handleChange} className={vCls(formData.sdt_nguoi_bao_lanh)} /></div>
                    </div>
                </div>
            )}
        </div>
    )
    const Step3_SucKhoe = () => (
        <div className="space-y-4 animate-fade-in">
            <h3 className="section-title text-base">{adminMode ? 'II' : 'III'}. SỨC KHỎE & THỂ CHẤT</h3>
            {/* Chỉ số cơ bản */}
            <div className="bg-primary-50 p-2 rounded text-center mb-2">
                <span className="text-base font-bold text-primary-800">BMI: {bmi || '--'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Hidden: Dị ứng & Tiền sử bệnh */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Dị ứng (Thuốc, Thức ăn...)</label><textarea rows={2} name="di_ung" value={formData.di_ung} onChange={handleChange} className={vCls(formData.di_ung, true)} placeholder="Nếu không có ghi 'Không'" /></div>
                <div><label className="label">Tiền sử Bệnh / Phẫu thuật</label><textarea rows={2} name="benh_an_phau_thuat" value={formData.benh_an_phau_thuat} onChange={handleChange} className={vCls(formData.benh_an_phau_thuat, true)} placeholder="Đã từng mổ ruột thừa..." /></div>
            </div> */}
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

        return (
            <div className="grid grid-cols-2 gap-2 min-w-[140px]">
                <select
                    className={`input-sm appearance-none ${month ? '!bg-white' : 'text-gray-500'}`}
                    value={month}
                    onChange={(e) => handleMonthYearChange(arrayName, index, point, 'month', e.target.value)}
                >
                    <option value="">Tháng</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m < 10 ? `0${m}` : m}>{m}</option>
                    ))}
                </select>
                <select
                    className={`input-sm appearance-none ${year ? '!bg-white' : 'text-gray-500'}`}
                    value={year}
                    onChange={(e) => handleMonthYearChange(arrayName, index, point, 'year', e.target.value)}
                >
                    <option value="">Năm</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        )
    }

    // Component chọn Ngày/Tháng/Năm đầy đủ (Cho Ngày sinh, Ngày cấp...)
    const FullDateSelect = ({ name, value, onChange, startYear = 1960, endYear = 2015 }) => {
        // Value format: YYYY-MM-DD (might be partial like 1990--05)
        const [yStr, mStr, dStr] = (value || '--').split('-')

        const clean = (v) => v ? parseInt(v).toString() : ''

        const y = clean(yStr)
        const m = clean(mStr)
        const d = clean(dStr)

        const days = Array.from({ length: 31 }, (_, i) => i + 1)
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)

        const handleChangePart = (part, val) => {
            let newY = part === 'y' ? val : yStr
            let newM = part === 'm' ? (val ? val.padStart(2, '0') : '') : mStr
            let newD = part === 'd' ? (val ? val.padStart(2, '0') : '') : dStr

            // Auto-fix invalid days (e.g. Feb 31)
            if (newY && newM && newD) {
                const maxDay = new Date(parseInt(newY), parseInt(newM), 0).getDate()
                if (parseInt(newD) > maxDay) newD = maxDay.toString().padStart(2, '0')
            }

            // Construct new value (allow partial)
            const finalVal = `${newY || ''}-${newM || ''}-${newD || ''}`

            // If completely empty
            if (finalVal === '--') onChange({ target: { name, value: '' } })
            else onChange({ target: { name, value: finalVal } })
        }

        return (
            <div className="grid grid-cols-3 gap-2">
                <select
                    className={`input-sm appearance-none ${d ? '!bg-white' : 'text-gray-500'}`}
                    value={d}
                    onChange={(e) => handleChangePart('d', e.target.value)}
                >
                    <option value="">Ngày</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                    className={`input-sm appearance-none ${m ? '!bg-white' : 'text-gray-500'}`}
                    value={m}
                    onChange={(e) => handleChangePart('m', e.target.value)}
                >
                    <option value="">Tháng</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                    className={`input-sm appearance-none ${y ? '!bg-white' : 'text-gray-500'}`}
                    value={y}
                    onChange={(e) => handleChangePart('y', e.target.value)}
                >
                    <option value="">Năm</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        )
    }

    const Step4_HocVan = () => {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* QUÁ TRÌNH HỌC TẬP */}
                <div>
                    <h3 className="section-title text-primary-700">{adminMode ? 'IV' : 'V'}. QUÁ TRÌNH HỌC TẬP</h3>
                    <p className="text-xs text-gray-500 mb-2">(*) Khai cấp học cao nhất đã học.</p>

                    {formData.qua_trinh_hoc_tap.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative mb-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                {/* Thời gian */}
                                <div className="w-full md:w-auto flex flex-col items-start">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian <span className="text-red-500 ml-1">*</span></label>
                                    <div className="flex flex-col md:flex-row gap-2 w-full md:items-center bg-gray-50 md:bg-transparent rounded md:rounded-none p-2 md:p-0">
                                        <MonthYearSelect arrayName="qua_trinh_hoc_tap" index={0} point="start" />
                                        <div className="text-gray-400 text-xs text-center md:hidden">đến</div>
                                        <span className="text-gray-400 font-bold hidden md:block">➔</span>
                                        <MonthYearSelect arrayName="qua_trinh_hoc_tap" index={0} point="end" />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500 block mb-1">Tên trường <span className="text-red-500 ml-1">*</span></label>
                                        <input placeholder="THPT NGUYEN TRAI" className={`input-sm font-medium uppercase w-full ${!formData.qua_trinh_hoc_tap[0].ten_truong ? '' : '!bg-white'}`}
                                            value={formData.qua_trinh_hoc_tap[0].ten_truong}
                                            onChange={(e) => handleArrayChange('qua_trinh_hoc_tap', 0, 'ten_truong', toUpperNoAccent(e.target.value))}
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
                <div className="mt-10">
                    <h3 className="section-title text-emerald-700">{adminMode ? 'V' : 'VI'}. KINH NGHIỆM LÀM VIỆC</h3>
                    <p className="text-xs text-red-500 italic mb-2 font-medium">(*) Khai 3 công việc gần nhất (nếu có).</p>

                    {formData.kinh_nghiem_lam_viec.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative mb-4 shadow-sm">
                            {idx > 1 && (
                                <button type="button" onClick={() => removeItem('kinh_nghiem_lam_viec', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold bg-white rounded-full p-1" title="Xóa dòng này">
                                    <span className="material-icons-outlined text-lg">close</span>
                                </button>
                            )}
                            <div className="flex flex-col md:flex-row gap-4 items-start pt-2">
                                {/* Thời gian */}
                                <div className="w-full md:w-auto flex flex-col items-start pb-2 border-b md:border-b-0 border-gray-200 mb-2 md:mb-0">
                                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Thời gian {idx === 0 && <span className="text-red-500 ml-1">*</span>}</label>
                                    <div className="flex flex-col md:flex-row gap-2 w-full md:items-center bg-gray-50 md:bg-transparent rounded md:rounded-none p-2 md:p-0">
                                        <MonthYearSelect arrayName="kinh_nghiem_lam_viec" index={idx} point="start" />
                                        <div className="text-gray-400 text-xs text-center md:hidden">đến</div>
                                        <span className="text-gray-400 font-bold hidden md:block">➔</span>
                                        <MonthYearSelect arrayName="kinh_nghiem_lam_viec" index={idx} point="end" />
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Tên công ty {idx === 0 && <span className="text-red-500 ml-1">*</span>}</label>
                                        <input placeholder={idx === 0 ? "BẮT BUỘC NHẬP" : "CÔNG TY ABC"} className={`input-sm font-medium w-full uppercase ${!item.cong_ty ? '' : '!bg-white'}`}
                                            value={item.cong_ty}
                                            onChange={(e) => handleArrayChange('kinh_nghiem_lam_viec', idx, 'cong_ty', toUpperNoAccent(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Công việc {idx === 0 && <span className="text-red-500 ml-1">*</span>}</label>
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
                    <button type="button" onClick={() => addItem('kinh_nghiem_lam_viec', { thoi_gian: '', cong_ty: '', cong_viec: '' })}
                        className="mt-4 w-full md:w-auto px-6 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border-2 border-dashed border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-wide">
                        <span className="material-icons-outlined">add_circle</span>
                        Thêm công việc
                    </button>
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
                <h3 className="section-title">{adminMode ? 'VI' : 'VII'}. NGUYỆN VỌNG ĐĂNG KÝ</h3>
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
                <h3 className="section-title mt-6">{adminMode ? 'VII' : 'VIII'}. KỸ NĂNG & TÍNH CÁCH</h3>
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
            <div className={`${adminMode ? 'bg-orange-50 border-orange-500' : 'bg-emerald-50 border-emerald-500'} border-l-4 p-4 mb-8 mt-6 rounded-xl transition-all`}>
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-orange-100">
                        <span className={`material-icons-outlined ${adminMode ? 'text-orange-500' : 'text-emerald-500'} text-2xl`}>info</span>
                    </div>
                    <div className="flex-1">
                        {adminMode ? (
                            <p className="text-sm text-orange-900 font-extrabold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                                Giao diện nhập liệu nội bộ — KHAI FORM NHANH
                            </p>
                        ) : (
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                <strong className="font-black text-emerald-900">HỒ SƠ ĐĂNG KÝ CHÍNH THỨC</strong> (Dành cho ứng viên nộp hồ sơ đầy đủ).<br />
                                <span className="text-xs opacity-80">Nếu bạn chỉ muốn nhận tư vấn sơ bộ, vui lòng </span>
                                <Link to="/yeu-cau-tu-van" className="font-bold underline hover:text-emerald-900 decoration-emerald-300 underline-offset-4">bấm vào đây để đăng ký tư vấn nhanh</Link>.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Content - Unified Vertical Layout */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <form className="p-3 md:p-6 space-y-6 md:space-y-8">
                    <section id="step1">
                        {Step1_CaNhan()}
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    <section id="step3">
                        {Step3_SucKhoe()}
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    <section id="step2">
                        {Step2_GiaDinh()}
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    <section id="step4">
                        {Step4_HocVan()}
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    <section id="step5">
                        {Step5_NguyenVong()}
                    </section>

                    {/* Action Buttons (Sticky at Bottom or at End) */}
                    <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-4">
                        <button type="button" onClick={() => navigate(adminMode ? '/admin/ho-so' : '/')}
                            className="w-full md:w-auto px-10 py-3.5 rounded-xl border-2 border-gray-100 font-bold text-gray-400 hover:text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-all uppercase text-sm min-w-[180px]">
                            Hủy bỏ
                        </button>

                        <button type="button" onClick={handleSubmit}
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-sm min-w-[250px] flex items-center justify-center gap-3">
                            {loading ? (
                                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ĐANG XỬ LÝ...</>
                            ) : (
                                <><span className="material-icons-outlined">check_circle</span> HOÀN TẤT & LƯU HỒ SƠ</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* VALIDATION ERROR MODAL */}
            {validationErrors.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-slide-up">
                        <button onClick={() => setValidationErrors([])} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="material-icons-outlined">close</span>
                        </button>

                        <div className="flex flex-col items-center mb-5">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <span className="material-icons-outlined text-4xl text-red-500">priority_high</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 text-center">Thông Tin Chưa Đầy Đủ</h3>
                            <p className="text-sm text-gray-500 text-center mt-1">Vui lòng bổ sung các thông tin bắt buộc sau:</p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar border border-red-100">
                            <ul className="space-y-2.5">
                                {validationErrors.map((err, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-800">
                                        <span className="material-icons-outlined text-red-500 text-lg mt-0.5 shrink-0">error</span>
                                        <span className="font-medium leading-tight">{err}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => setValidationErrors([])}
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            <span>KIỂM TRA LẠI</span>
                        </button>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center relative overflow-hidden animate-slide-up">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <span className="material-icons-outlined text-5xl text-emerald-600">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng Ký Thành Công!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed text-sm px-4">
                            Hồ sơ của bạn đã được gửi an toàn lên hệ thống.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all text-base uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            <span>Về Trang Chủ</span>
                            <span className="material-icons-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CSS Utility Classes embedded for this component */}
            <style>{`
        .label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.2rem; }
        .input { 
            display: block; width: 100%; max-width: 100%; box-sizing: border-box;
            border-radius: 0.6rem; border: 1px solid #e2e8f0; 
            padding: 0.5rem 0.85rem; font-size: 16px; line-height: 1.4; /* iOS zoom prevention */
            background-color: #f8fafc; transition: all 0.2s;
            min-height: 42px; 
        }
        .input:focus { outline: none; border-color: #0d9488; background-color: #ffffff; ring: 2px solid rgba(13, 148, 136, 0.1); box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1); }
        
        .input-sm { 
            display: block; width: 100%; border-radius: 0.4rem; border: 1px solid #e2e8f0; 
            padding: 0.35rem 0.65rem; font-size: 16px; 
            background-color: #f8fafc; min-height: 38px;
        }
        .input-sm:focus { outline: none; border-color: #0d9488; background-color: #ffffff; }

        .section-title { font-size: 1rem; font-weight: 800; color: #115e59; text-transform: uppercase; letter-spacing: -0.01em; padding-bottom: 0.6rem; border-bottom: 2px dashed #ccfbf1; margin-bottom: 1.2rem; }
        @media (min-width: 768px) {
            .section-title { font-size: 1.25rem; }
        }
        .btn-add { margin-top: 0.75rem; padding: 0.5rem 1rem; background-color: #f0fdfa; border-radius: 0.5rem; color: #0d9488; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .btn-add:active { background-color: #ccfbf1; transform: scale(0.98); }

        /* Safe area for iPhone X+ */
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>
        </div>
    )
}
