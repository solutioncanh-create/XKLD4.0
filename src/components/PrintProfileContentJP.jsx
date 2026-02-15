
import {
    mapSex, mapMarital, mapReligion, mapYesNo, mapHand, mapRelation,
    formatDateJP, getAge, mapLicense, mapPurpose, mapJob, mapStrength,
    mapWeakness, mapEducation, mapVision, mapWork, mapSmoke, mapDrink,
    mapTattoo, formatTimeRange
} from '../utils/printHelpers'

function SectionTitle({ children }) {
    return <h2 className="uppercase font-bold text-xs bg-blue-100 px-2 py-1 mb-2 border border-blue-900 border-l-4 border-l-blue-900 text-blue-900">{children}</h2>
}

export default function PrintProfileContentJP({ hoSo, showSBD = false }) {
    if (!hoSo) return null;

    return (
        <div className="print-container w-[210mm] mx-auto bg-white shadow-sm px-[10mm] py-[5mm] min-h-[297mm] text-blue-900 leading-snug relative flex flex-col" style={{ boxSizing: 'border-box' }}>
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-2 border-b-2 border-blue-900 pb-2">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold uppercase mb-1">技能実習生履歴書</h1>
                    <p className="text-xs font-semibold italic text-gray-600">JAPAN LABOR SUPPLY APPLICATION FORM</p>
                    <div className="mt-3 flex flex-col gap-2 text-xs">
                        <p className="text-gray-500"><strong>作成年月日 (Date):</strong> {formatDateJP(new Date())}</p>

                        {showSBD && (
                            <div className="mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-900 text-sm">受験番号 (SBD):</span>
                                    <span className="text-3xl font-black text-red-600 tracking-widest">
                                        {hoSo.sbd ? String(hoSo.sbd).padStart(2, '0') : (hoSo.ma_ho_so || '---')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-[2.4cm] h-[3.2cm] border border-blue-300 overflow-hidden flex items-center justify-center bg-blue-50 ml-4 relative">
                    {hoSo.anh_ho_so ? (
                        <img src={hoSo.anh_ho_so} className="w-full h-full object-cover absolute inset-0" alt="Avatar" />
                    ) : (
                        <span className="text-xs text-center text-gray-400 z-10">4x3 Photo</span>
                    )}
                </div>
            </div>

            {/* --- I. THÔNG TIN CÁ NHÂN --- */}
            <div className="mb-2">
                <SectionTitle>I. 基本情報 (Basic Information)</SectionTitle>
                <table className="w-full border-collapse border border-blue-300 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-blue-300 p-1 font-bold w-32 bg-blue-50">氏 名 (Full Name)</td>
                            <td className="border border-blue-300 p-1 uppercase font-bold text-base" colSpan="3">{hoSo.ho_ten}</td>
                        </tr>
                        <tr>
                            <td className="border border-blue-300 p-1 font-bold bg-blue-50">生年月日 (DOB)</td>
                            <td className="border border-blue-300 p-1">{formatDateJP(hoSo.ngay_sinh)} ({getAge(hoSo.ngay_sinh)}歳)</td>
                            <td className="border border-blue-300 p-1 font-bold bg-blue-50 w-36">性 別 (Sex)</td>
                            <td className="border border-blue-300 p-1">{mapSex(hoSo.gioi_tinh)}</td>
                        </tr>
                        <tr>
                            <td className="border border-blue-300 p-1 font-bold bg-blue-50">出身地 (Place of Birth)</td>
                            <td className="border border-blue-300 p-1" colSpan="3">{hoSo.que_quan}</td>
                        </tr>

                        <tr>
                            <td className="border border-blue-300 p-1 font-bold bg-blue-50">宗 教 (Religion)</td>
                            <td className="border border-blue-300 p-1">{mapReligion(hoSo.ton_giao)}</td>
                            <td className="border border-blue-300 p-1 font-bold bg-blue-50">婚姻状況</td>
                            <td className="border border-blue-300 p-1">{mapMarital(hoSo.hon_nhan)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- II. SỨC KHỎE --- */}
            <div className="mb-2">
                <SectionTitle>II. 健康状態 (Health Condition)</SectionTitle>
                <table className="w-full border-collapse border border-blue-300 text-xs text-center">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-blue-300 p-1">身 長 (Height)</th>
                            <th className="border border-blue-300 p-1">体 重 (Weight)</th>
                            <th className="border border-blue-300 p-1">血液型 (Blood)</th>
                            <th className="border border-blue-300 p-1">視 力 (Vision)</th>
                            <th className="border border-blue-300 p-1">利き手 (Hand)</th>
                            <th className="border border-blue-300 p-1">色 覚 (Color)</th>
                            <th className="border border-blue-300 p-1">喫 煙 (Smoke)</th>
                            <th className="border border-blue-300 p-1">飲 酒 (Drink)</th>
                            <th className="border border-blue-300 p-1">刺 青 (Tattoo)</th>
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
            <div className="mb-2">
                <SectionTitle>III. 技能・希望 (Skills & Expected)</SectionTitle>
                <div className="border border-blue-300 p-2 text-xs flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>希望職種 (Desired Job):</strong> {mapJob(hoSo.nganh_nghe_mong_muon)}</p>
                        <p><strong>日本語 (Japanese):</strong> {hoSo.trinh_do_tieng_nhat}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-1"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>長 所 (Strong Point):</strong> {mapStrength(hoSo.diem_manh)}</p>
                        <p><strong>短 所 (Weak Point):</strong> {mapWeakness(hoSo.diem_yeu)}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-1"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>運転免許 (License):</strong> {mapLicense(hoSo.bang_lai_xe)}</p>
                        <p><strong>訪日目的 (Purpose):</strong> {mapPurpose(hoSo.muc_dich_di_nhat)}</p>
                    </div>
                </div>
            </div>

            {/* --- IV. GIA ĐÌNH --- */}
            <div className="mb-2">
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
                                    <td className="border border-blue-300 p-1 uppercase">{gd?.ho_ten || ''}</td>
                                    <td className="border border-blue-300 p-1 text-center">{gd?.nam_sinh || ''}</td>
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
            <div className="mb-2">
                <SectionTitle>V. 学 歴 (Education History)</SectionTitle>
                <table className="w-full border-collapse border border-blue-300 text-xs">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-blue-300 p-1 w-44">期 間 (Period)</th>
                            <th className="border border-blue-300 p-1">学校名 (Name of School)</th>
                            <th className="border border-blue-300 p-1 w-40">学位 (Certificate)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(hoSo.qua_trinh_hoc_tap) && hoSo.qua_trinh_hoc_tap.length > 0 ? (
                            hoSo.qua_trinh_hoc_tap.map((h, i) => (
                                <tr key={i}>
                                    <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(h?.thoi_gian)}</td>
                                    <td className="border border-blue-300 p-1 uppercase">{h?.ten_truong || ''}</td>
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
            <div className="mb-2">
                <SectionTitle>VI. 職 歴 (Working Experience)</SectionTitle>
                <table className="w-full border-collapse border border-blue-300 text-xs">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-blue-300 p-1 w-44">期 間 (Period)</th>
                            <th className="border border-blue-300 p-1">会社名 (Name of Company)</th>
                            <th className="border border-blue-300 p-1 w-40">職 種 (Occupation)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(hoSo.kinh_nghiem_lam_viec) && hoSo.kinh_nghiem_lam_viec.length > 0 ? (
                            hoSo.kinh_nghiem_lam_viec.map((k, i) => (
                                <tr key={i}>
                                    <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(k?.thoi_gian)}</td>
                                    <td className="border border-blue-300 p-1 uppercase">{k?.cong_ty || ''}</td>
                                    <td className="border border-blue-300 p-1 text-center">{mapWork(k?.cong_viec)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="border border-blue-300 p-1 text-center text-gray-400 italic">空欄 (Empty)</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- RECRUITER NOTES --- */}
            <div className="mt-4 border border-gray-300 rounded-sm relative flex-1 min-h-[100px]">
                <span className="absolute -top-2 left-3 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    採 用 担 当 者 の メ モ (Recruiter Notes)
                </span>
            </div>

        </div>
    )
}
