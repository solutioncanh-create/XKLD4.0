import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function DanhSachThiTuyenPrint() {
    const { id } = useParams() // Order ID
    const [order, setOrder] = useState(null)
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)

    // Temporary print fields
    const [companyName, setCompanyName] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [supervisingOrg, setSupervisingOrg] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Order Info
                const { data: orderData, error: orderError } = await supabase
                    .from('don_hang')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (orderError) throw orderError
                setOrder(orderData)

                // Fetch Candidates
                const { data: candidatesData, error: candidatesError } = await supabase
                    .from('lien_ket_don_hang_ho_so')
                    .select(`
                        id, sbd, created_at,
                        ho_so:ho_so_id ( id, ho_ten, nickname, ngay_sinh, que_quan, anh_ho_so, hon_nhan, chieu_cao, can_nang, hut_thuoc )
                    `)
                    .eq('don_hang_id', id)
                    .order('sbd', { ascending: true })

                if (candidatesError) throw candidatesError
                setCandidates(candidatesData || [])

            } catch (error) {
                console.error('Lỗi tải dữ liệu in:', error)
                alert(`Không thể tải dữ liệu! Lỗi: ${error.message || JSON.stringify(error)}`)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    useEffect(() => {
        if (!loading && order) {
            document.title = `Menseitsu_List_${order.ten_don_hang}`
        }
    }, [loading, order])

    if (loading) return <div className="text-center p-10">Đang tải dữ liệu...</div>
    if (!order) return <div className="text-center p-10 text-red-500">Không tìm thấy đơn hàng!</div>

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white font-sans text-black">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm; /* Narrow margin for maximum space */
                    }
                    body {
                        font-family: 'Noto Sans JP', sans-serif !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        width: 210mm;
                    }
                    .print-container {
                        width: 210mm !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none;
                        box-shadow: none;
                    }
                    .no-print { display: none !important; }
                }
                .print-container {
                    background: white;
                    width: 210mm; 
                    min-height: 297mm; /* A4 Portrait Height */
                    margin: 0 auto;
                    padding: 10mm;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }
            `}</style>

            {/* Toolbar */}
            <div className="fixed top-4 right-4 no-print flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    <span className="material-icons-outlined">print</span> 印刷 (Print)
                </button>
            </div>

            <div className="print-container">
                {/* Header */}
                <div className="relative mb-6 pt-2 border-b-2 border-blue-600 pb-2">
                    <h1 className="text-2xl font-bold uppercase text-center text-blue-800">面 接 リ ス ト</h1>
                    <div className="absolute top-0 right-0 text-xs font-medium text-blue-900">
                        <span>選考日: {order.ngay_tuyen_du_kien ? new Date(order.ngay_tuyen_du_kien).toLocaleDateString('ja-JP') : '...'}</span>
                    </div>
                </div>

                {/* Editable Fields - Compact Grid */}
                <div className="mb-6 grid grid-cols-1 gap-2 border border-blue-200 p-3 rounded bg-blue-50 print:bg-blue-50 print:border-blue-200">
                    <div className="flex items-center">
                        <span className="font-bold w-32 shrink-0 text-blue-800">受け入れ企業名 :</span>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent print:border-none px-2 h-6 font-medium text-blue-900"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold w-32 shrink-0 text-blue-800">仕事内容 :</span>
                        <input
                            type="text"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent print:border-none px-2 h-6 font-medium text-blue-900"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold w-32 shrink-0 text-blue-800">支援監理団体 :</span>
                        <input
                            type="text"
                            value={supervisingOrg}
                            onChange={(e) => setSupervisingOrg(e.target.value)}
                            className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 bg-transparent print:border-none px-2 h-6 font-medium text-blue-900"
                        />
                    </div>
                </div>

                {/* Table - Compact & Optimized */}
                <table className="w-full border-collapse border border-blue-300 text-[11px]">
                    <thead>
                        <tr className="bg-blue-600 text-white uppercase text-[10px] tracking-tight print:bg-blue-600 print:text-white">
                            <th className="border border-blue-400 p-1 w-10 text-center">No.</th>
                            <th className="border border-blue-400 p-1 w-[30mm] text-center">写真</th>
                            <th className="border border-blue-400 p-1 text-left pl-3">氏名</th>
                            <th className="border border-blue-400 p-1 text-left pl-3 w-[65mm]">詳細情報</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr><td colSpan="10" className="border border-gray-400 p-4 text-center italic">参加候補者がいません。</td></tr>
                        ) : candidates.map((item, index) => {
                            const candidate = item.ho_so || {}
                            const tuoi = candidate.ngay_sinh ? (new Date().getFullYear() - new Date(candidate.ngay_sinh).getFullYear()) : ''

                            const transMarital = (s) => {
                                if (!s) return ''
                                const v = s.toLowerCase()
                                if (v.includes('độc') || v.includes('chưa')) return '未婚'
                                if (v.includes('kết') || v.includes('có')) return '既婚'
                                if (v.includes('ly')) return '離婚'
                                return s
                            }
                            const transSmoking = (s) => {
                                if (!s) return ''
                                const v = s.toLowerCase()
                                if (v.includes('có') || v.includes('hút')) return '有'
                                if (v.includes('không')) return '無'
                                return s
                            }
                            const transEducation = (edu) => {
                                if (!edu) return ''
                                const e = edu.toLowerCase()
                                if (e.includes('đại học')) return '大卒'
                                if (e.includes('cao đẳng')) return '短大卒'
                                if (e.includes('trung cấp')) return '専門卒'
                                if (e.includes('cấp 3') || e.includes('thpt') || e.includes('12/12')) return '高卒'
                                if (e.includes('cấp 2') || e.includes('thcs') || e.includes('9/12')) return '中卒'
                                return edu
                            }

                            return (
                                <tr key={item.id} className="bg-white">
                                    <td className="border border-blue-300 p-1 text-center font-bold text-lg align-middle text-blue-900">{item.sbd}</td>

                                    <td className="border border-blue-300 p-2 text-center align-middle bg-white">
                                        <div className="w-[30mm] h-[40mm] mx-auto border border-blue-100 overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                            {candidate.anh_ho_so ? (
                                                <img src={candidate.anh_ho_so} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-300 text-[10px]">写真</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="border border-blue-300 p-3 align-middle">
                                        <div className="font-bold text-xl uppercase text-blue-900 leading-tight">
                                            {candidate.ho_ten}
                                        </div>
                                        {candidate.nickname && <div className="text-sm text-gray-600 mt-1">({candidate.nickname})</div>}
                                    </td>

                                    <td className="border border-blue-300 p-2 align-middle">
                                        <div className="flex flex-col gap-1">
                                            {/* Row 1: Basic Stats (Age, Marital, Height, Weight) */}
                                            <div className="grid grid-cols-4 gap-2 border-b border-blue-200 pb-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">年齢</span>
                                                    <span className="font-bold text-sm text-gray-800">{tuoi}歳</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">婚姻</span>
                                                    <span className="font-bold text-sm text-gray-800">{transMarital(candidate.hon_nhan)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">身長</span>
                                                    <span className="font-bold text-sm text-gray-800">{candidate.chieu_cao ? `${candidate.chieu_cao}cm` : ''}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">体重</span>
                                                    <span className="font-bold text-sm text-gray-800">{candidate.can_nang ? `${candidate.can_nang}kg` : ''}</span>
                                                </div>
                                            </div>

                                            {/* Row 2: Status (Smoking, Hometown) */}
                                            <div className="grid grid-cols-[auto_1fr] gap-4 pt-1">
                                                <div className="flex flex-col min-w-[50px]">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">喫煙</span>
                                                    <span className="font-bold text-sm text-gray-800">{transSmoking(candidate.hut_thuoc)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">出身地</span>
                                                    <span className="font-bold text-sm text-gray-800 leading-tight">{candidate.que_quan}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>


            </div>
        </div>
    )
}
