import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HoSoPrintTemplateJP() {
    const { id } = useParams()
    const [hoSo, setHoSo] = useState(null)
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        const fetchChiTiet = async () => {
            try {
                const { data, error } = await supabase
                    .from('ho_so')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setHoSo(data)
            } catch (error) {
                console.error('Lỗi tải hồ sơ in:', error)
                alert('Không thể tải dữ liệu để in!')
            } finally {
                setLoading(false)
            }
        }
        fetchChiTiet()
    }, [id])

    useEffect(() => {
        if (!loading && hoSo) {
            document.title = `HoSo_JP_${hoSo.ho_ten || id}`
        }
    }, [loading, hoSo])

    if (loading) return <div className="text-center p-10">Waiting...</div>
    if (!hoSo) return <div className="text-center p-10 text-red-500">Not Found!</div>

    return (

        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white font-sans text-blue-900 leading-snug">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
                @media print {
                    @page {
                        size: A4;
                        margin: 0mm; /* Viền trắng do padding của div container */
                    }
                    body {
                        font-family: 'Noto Sans JP', sans-serif !important;
                        font-size: 10pt;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: #1e3a8a; /* blue-900 */
                    }
                    .print-container {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        padding-top: 5mm; /* Lề trên nhỏ nhất */
                        margin: 0 auto;
                        border: 1px solid #e5e7eb;
                    }
                    @media screen {
                        .print-container {
                            border: 1px solid #e5e7eb;
                        }
                    }
                    /* Override tailwind text sizes for fixed print sizes */
                    .text-xs { font-size: 9pt !important; }
                    .text-sm { font-size: 10pt !important; }
                    .text-base { font-size: 11pt !important; }
                    .text-lg { font-size: 12pt !important; }
                    .text-xl { font-size: 14pt !important; }
                    .text-2xl { font-size: 18pt !important; }
                }
            `}</style>

            {/* Toolbar - Ẩn khi in */}
            <div className="fixed top-4 right-4 print:hidden flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 font-sans font-bold flex items-center gap-2 text-sm"
                >
                    <span className="material-icons-outlined text-base">print</span> 印刷 (Print JP)
                </button>
            </div>

            {/* A4 Page Container */}
            <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none p-[15mm] print:p-[15mm] min-h-[297mm]">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-start mb-4 border-b-2 border-blue-900 pb-3">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold uppercase mb-1">技能実習生履歴書</h1>
                        <p className="text-xs font-semibold italic text-gray-600">JAPAN LABOR SUPPLY APPLICATION FORM</p>
                        <div className="mt-3 flex flex-col gap-2 text-xs">
                            <p className="text-gray-500"><strong>作成日 (Date):</strong> {formatDateJP(new Date())}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-900 text-sm">管理番号 (ID):</span>
                                <span className="text-2xl font-black text-blue-900 border-2 border-blue-900 px-3 py-1 rounded bg-white shadow-sm tracking-wider">
                                    {hoSo.ma_ho_so || (hoSo.id ? String(hoSo.id).substring(0, 8).toUpperCase() : '---')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-[3cm] h-[4cm] border border-blue-300 overflow-hidden flex items-center justify-center bg-blue-50 ml-4 relative">
                        {hoSo.anh_ho_so ? (
                            <img src={hoSo.anh_ho_so} className="w-full h-full object-cover absolute inset-0" alt="Avatar" />
                        ) : (
                            <span className="text-xs text-center text-gray-400 z-10">4x3 Photo</span>
                        )}
                    </div>
                </div>

                {/* --- I. THÔNG TIN CÁ NHÂN --- */}
                <div className="mb-4">
                    <SectionTitle>I. 本人の情報 (Personal Info)</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <tbody>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold w-32 bg-blue-50">氏名 (Name)</td>
                                <td className="border border-blue-300 p-1 uppercase font-bold text-base" colSpan="3">{hoSo.ho_ten}</td>
                            </tr>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">生年月日 (DOB)</td>
                                <td className="border border-blue-300 p-1">{formatDateJP(hoSo.ngay_sinh)} ({getAge(hoSo.ngay_sinh)}歳)</td>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50 w-36">性別 (Sex)</td>
                                <td className="border border-blue-300 p-1">{mapSex(hoSo.gioi_tinh)}</td>
                            </tr>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">本籍地 (Hometown)</td>
                                <td className="border border-blue-300 p-1" colSpan="3">{hoSo.que_quan}</td>
                            </tr>

                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">宗教 (Religion)</td>
                                <td className="border border-blue-300 p-1">{mapReligion(hoSo.ton_giao)}</td>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50 w-36">婚姻 (Marital)</td>
                                <td className="border border-blue-300 p-1">{mapMarital(hoSo.hon_nhan)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- II. SỨC KHỎE --- */}
                <div className="mb-4">
                    <SectionTitle>II. 健康状態 (Health)</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs text-center">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1">身長 (Height)</th>
                                <th className="border border-blue-300 p-1">体重 (Weight)</th>
                                <th className="border border-blue-300 p-1">血液型 (Blood)</th>
                                <th className="border border-blue-300 p-1">視力 (Vision)</th>
                                <th className="border border-blue-300 p-1">利き手 (Hand)</th>
                                <th className="border border-blue-300 p-1">色盲 (Color)</th>
                                <th className="border border-blue-300 p-1">喫煙 (Smoke)</th>
                                <th className="border border-blue-300 p-1">飲酒 (Drink)</th>
                                <th className="border border-blue-300 p-1">刺青 (Tattoo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold">{hoSo.chieu_cao} cm</td>
                                <td className="border border-blue-300 p-1 font-bold">{hoSo.can_nang} kg</td>
                                <td className="border border-blue-300 p-1">{hoSo.nhom_mau}</td>
                                <td className="border border-blue-300 p-1">{mapVision(hoSo.thi_luc_trai)}/{mapVision(hoSo.thi_luc_phai)}</td>
                                <td className="border border-blue-300 p-1">{mapHand(hoSo.tay_thuan)}</td>
                                <td className="border border-blue-300 p-1">{mapYesNo(hoSo.mu_mau)}</td>
                                <td className="border border-blue-300 p-1">{mapSmoke(hoSo.hut_thuoc)}</td>
                                <td className="border border-blue-300 p-1">{mapDrink(hoSo.uong_ruou)}</td>
                                <td className="border border-blue-300 p-1">{mapTattoo(hoSo.xam_hinh)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- III. KỸ NĂNG & NGUYỆN VỌNG --- */}
                <div className="mb-4">
                    <SectionTitle>III. 技能・希望 (Skills & Wish)</SectionTitle>
                    <div className="border border-blue-300 p-2 text-xs flex flex-col gap-1.5">
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>希望職種 (Job Wish):</strong> {mapJob(hoSo.nganh_nghe_mong_muon)}</p>
                            <p><strong>日本語 (Japanese):</strong> {hoSo.trinh_do_tieng_nhat}</p>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>長所 (Strong):</strong> {mapStrength(hoSo.diem_manh)}</p>
                            <p><strong>短所 (Weak):</strong> {mapWeakness(hoSo.diem_yeu)}</p>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>運転免許 (License):</strong> {mapLicense(hoSo.bang_lai_xe)}</p>
                            <p><strong>訪日目的 (Purpose):</strong> {mapPurpose(hoSo.muc_dich_di_nhat)}</p>
                        </div>
                    </div>
                </div>

                {/* --- IV. GIA ĐÌNH --- */}
                <div className="mb-4">
                    <SectionTitle>IV. 家族構成 (Family)</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs mb-2">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-44">続柄 (Rel)</th>
                                <th className="border border-blue-300 p-1">氏名 (Name)</th>
                                <th className="border border-blue-300 p-1 w-24">生年 (Year)</th>
                                <th className="border border-blue-300 p-1 w-40">職業 (Job)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.thong_tin_gia_dinh) && hoSo.thong_tin_gia_dinh.length > 0 ? (
                                hoSo.thong_tin_gia_dinh.map((gd, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{mapRelation(gd?.quan_he)}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{gd?.ho_ten}</td>
                                        <td className="border border-blue-300 p-1 text-center">{gd?.nam_sinh}</td>
                                        <td className="border border-blue-300 p-1">{mapWork(gd?.nghe_nghiep || gd?.cong_viec)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="border border-blue-300 p-1 text-center text-gray-400 italic">空欄 (Empty)</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- V. HỌC VẤN --- */}
                <div className="mb-4">
                    <SectionTitle>V. 学歴 (Education)</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-44">期間 (Period)</th>
                                <th className="border border-blue-300 p-1">学校名 (School Name)</th>
                                <th className="border border-blue-300 p-1 w-40">学位 (Degree)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.qua_trinh_hoc_tap) && hoSo.qua_trinh_hoc_tap.length > 0 ? (
                                hoSo.qua_trinh_hoc_tap.map((h, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(h?.thoi_gian)}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{h?.ten_truong}</td>
                                        <td className="border border-blue-300 p-1 text-center">{mapEducation(h?.bang_cap)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="border border-blue-300 p-1 text-center text-gray-400 italic">空欄 (Empty)</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- VI. KINH NGHIỆM LÀM VIỆC --- */}
                <div className="mb-4">
                    <SectionTitle>VI. 職歴 (Work Experience)</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-44">期間 (Period)</th>
                                <th className="border border-blue-300 p-1">会社名 (Company Name)</th>
                                <th className="border border-blue-300 p-1 w-40">職種 (Job)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.kinh_nghiem_lam_viec) && hoSo.kinh_nghiem_lam_viec.length > 0 ? (
                                hoSo.kinh_nghiem_lam_viec.map((k, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(k?.thoi_gian)}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{k?.cong_ty}</td>
                                        <td className="border border-blue-300 p-1 text-center">{mapWork(k?.cong_viec)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="border border-blue-300 p-1 text-center text-gray-400 italic">空欄 (Empty)</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

// --- HELPER COMPONENTS ---
function SectionTitle({ children }) {
    return <h2 className="uppercase font-bold text-xs bg-blue-100 px-2 py-1 mb-2 border border-blue-900 border-l-4 border-l-blue-900 text-blue-900">{children}</h2>
}

// --- HELPERS TIẾNG NHẬT ---

function mapSex(val) {
    if (!val) return '';
    if (val === 'Nam') return '男';
    if (val === 'Nữ') return '女';
    return val;
}

function mapMarital(val) {
    if (!val) return '';
    if (val.includes('Độc thân')) return '独身';
    if (val.includes('kết hôn')) return '既婚';
    if (val.includes('Ly hôn')) return '離婚';
    return val;
}

function mapReligion(val) {
    if (!val || val === 'Không') return 'なし';
    if (val.includes('Phật')) return '仏教';
    if (val.includes('Thiên Chúa') || val.includes('Công giáo')) return 'キリスト教';
    return val;
}

function mapYesNo(val) {
    if (val === true || val === 'Có') return 'あり';
    if (val === false || val === 'Không') return 'なし';
    return val || 'なし';
}

function mapHand(val) {
    if (val === 'Phải') return '右';
    if (val === 'Trái') return '左';
    if (val === 'Hai tay') return '両手';
    return val;
}

function mapRelation(val) {
    if (!val) return '';
    const map = {
        'Bố': '父',
        'Mẹ': '母',
        'Ông bà': '祖父母',
        'Anh chị': '兄弟姉妹',
        'Vợ': '妻',
        'Chồng': '夫',
        'Con': '子供'
    };
    // Ưu tiên khớp chính xác trước
    if (map[val]) return map[val];

    // Khớp tương đối cho dữ liệu cũ
    for (const k in map) {
        if (val.includes(k)) return map[k];
    }
    return val;
}

function formatDateJP(dStr) {
    if (!dStr) return '';
    try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return dStr;
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } catch { return dStr; }
}

function getAge(dStr) {
    if (!dStr) return '';
    try {
        const today = new Date();
        const birthDate = new Date(dStr);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch { return ''; }
}

function mapLicense(val) {
    if (!val || val === 'Chưa có' || val === 'Không') return 'なし';
    if (val.toLowerCase().includes('xe máy')) return 'バイク免許';
    if (val.toLowerCase().includes('ô tô') || val.toLowerCase().includes('oto')) return '車免許';
    return val;
}

function mapPurpose(val) {
    if (!val) return '...';
    if (val.includes('Kiếm thu nhập')) return '家族を支えるため、資金を稼ぐ';
    if (val.includes('Học hỏi kỹ năng')) return '日本の技術と働き方を学ぶため';
    if (val.includes('Trải nghiệm văn hóa')) return '日本の文化と生活を体験するため';
    if (val.includes('Phát triển bản thân')) return '自己成長と将来のチャンスを探すため';
    if (val.includes('Nâng cao trình độ')) return '日本語能力を向上させるため';
    return val;
}

function mapJob(val) {
    if (!val) return '...';
    if (val.includes('Thực phẩm')) return '食品製造';
    if (val.includes('Cơ khí')) return '機械加工';
    if (val.includes('Xây dựng')) return '建設';
    if (val.includes('May mặc')) return '縫製';
    if (val.includes('Nông nghiệp')) return '農業';
    if (val.includes('Điện tử')) return '電子機器';
    return val;
}

function mapStrength(val) {
    if (!val) return '...';
    let res = val;
    const map = {
        "Sức khỏe tốt, dẻo dai": "健康で体力に自信がある",
        "Chăm chỉ, chịu khó": "真面目で勤勉",
        "Đúng giờ, chấp hành tốt": "時間を守り、ルールを遵守する",
        "Trung thực, thật thà": "正直で誠実",
        "Cẩn thận, tỉ mỉ": "注意深く、几帳面",
        "Tinh thần trách nhiệm cao": "責任感が強い",
        "Hòa đồng, giao tiếp tốt": "社交的でコミュニケーションが得意",
        "Gọn gàng, ngăn nắp": "整理整頓が得意"
    };
    Object.keys(map).forEach(k => {
        res = res.replaceAll(k, map[k]);
    });
    return res;
}

function mapWeakness(val) {
    if (!val) return '...';
    let res = val;
    const map = {
        "Giao tiếp chưa khéo": "コミュニケーションが少し苦手",
        "Cẩn thận quá mức": "慎重すぎる",
        "Hay hồi hộp, lo lắng": "緊張しやすい、心配性",
        "Vội vàng, hấp tấp": "せっかち",
        "Tính cách thẳng thắn": "率直すぎる性格",
        "Không chịu được áp lực": "プレッシャーに弱い",
        "Dễ nổi nóng, mất bình tĩnh": "短気"
    };
    Object.keys(map).forEach(k => {
        res = res.replaceAll(k, map[k]);
    });
    return res;
}

function mapEducation(val) {
    if (!val) return '';
    if (val.includes('Cấp 2') || val.includes('THCS')) return '中学校';
    if (val.includes('Cấp 3') || val.includes('THPT')) return '高等学校';
    if (val.includes('Trung Cấp')) return '専門学校';
    if (val.includes('Cao Đẳng')) return '短期大学';
    if (val.includes('Đại Học')) return '大学';
    return val;
}

function mapVision(val) {
    if (!val) return '';
    if (val === 'Tốt') return '良';
    if (val === 'Trung bình') return '普通';
    if (val === 'Kém') return '不可';
    return val;
}

function mapWork(val) {
    if (!val) return '';
    if (val === 'Nông nghiệp') return '農業';
    if (val === 'Công nhân') return '工員';
    if (val === 'Viên chức') return '公務員';
    if (val === 'Hộ kinh doanh') return '自営業';
    if (val === 'Học sinh') return '学生';
    return val;
}

function mapSmoke(val) {
    if (!val || val === 'Không') return '吸わない';
    if (val === 'Có ít') return '時々吸う';
    if (val === 'Thường xuyên') return '吸う';
    return val;
}

function mapDrink(val) {
    if (!val || val === 'Không') return '飲まない';
    if (val === 'Xã giao') return '付き合い程度';
    if (val === 'Uống tốt') return 'よく飲む';
    return val;
}

function mapTattoo(val) {
    if (!val || val === 'Không') return 'なし';
    if (val.includes('Kín')) return 'あり（隠れている）';
    if (val.includes('Lộ')) return 'あり（見える）';
    if (val.includes('Đã xóa')) return '除去済み';
    return val;
}

function formatTimeRange(rangeString) {
    if (!rangeString) return '---';
    if (!rangeString.includes(' - ')) return rangeString;
    const [startStr, endStr] = rangeString.split(' - ');

    const fmt = (s) => {
        if (!s) return '...';
        try {
            const d = new Date(s);
            if (isNaN(d.getTime())) return s;
            // Format: YYYY/MM
            return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        } catch { return s; }
    }

    return `${fmt(startStr)} ～ ${fmt(endStr)}`;
}

