import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
    getAge, mapRelation, mapVision, mapHand, mapMarital,
    mapJapaneseLevel, mapYesNoShort
} from '../../utils/printHelpers'

export default function PrintCandidateList() {
    const { id } = useParams() // Order ID
    const [order, setOrder] = useState(null)
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)

    // Print Info
    const [printInfo, setPrintInfo] = useState({
        companyName: '',
        jobDescription: '',
        supervisingOrg: '',
        interviewDate: ''
    })

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
                setPrintInfo(prev => ({
                    ...prev,
                    interviewDate: orderData.ngay_tuyen_du_kien ? new Date(orderData.ngay_tuyen_du_kien).toISOString().split('T')[0] : ''
                }))

                // Fetch Candidates
                const { data: candidatesData, error: candidatesError } = await supabase
                    .from('lien_ket_don_hang_ho_so')
                    .select(`
                        id, sbd, created_at,
                        ho_so:ho_so_id ( 
                            *,
                            thong_tin_gia_dinh,
                            qua_trinh_hoc_tap,
                            kinh_nghiem_lam_viec
                        )
                    `)
                    .eq('don_hang_id', id)
                    .order('sbd', { ascending: true })

                if (candidatesError) throw candidatesError
                setCandidates(candidatesData || [])

            } catch (error) {
                console.error('Error:', error)
                alert(`Error: ${error.message}`)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    useEffect(() => {
        if (!loading && order) document.title = `List_${order.ten_don_hang}_JP`
    }, [loading, order])

    // --- Helpers using imported utils ---

    const getFamilySummary = (familyArr) => {
        if (!Array.isArray(familyArr) || familyArr.length === 0) return '---'
        const count = familyArr.length
        const relations = familyArr.map(m => mapRelation(m.quan_he)).join(', ')
        return `${count}名 (${relations})`
    }

    const getEducationSummary = (eduArr) => {
        if (!Array.isArray(eduArr) || eduArr.length === 0) return '---'
        // Find highest degree
        const levels = eduArr.map(e => e.bang_cap)
        if (levels.some(l => l.includes('Đại Học'))) return '大卒'
        if (levels.some(l => l.includes('Cao Đẳng'))) return '短大卒'
        if (levels.some(l => l.includes('Trung Cấp'))) return '専門卒'
        if (levels.some(l => l.includes('Cấp 3') || l.includes('THPT'))) return '高卒'
        if (levels.some(l => l.includes('Cấp 2') || l.includes('THCS'))) return '中卒'
        return '---'
    }


    // --- Pagination Logic ---
    const PAGE_SIZE_FIRST = 4 // Trang 1 chứa 4 người (vì có Header)
    const PAGE_SIZE_OTHER = 5 // Trang sau chứa 5 người

    const pages = []
    if (candidates.length > 0) {
        pages.push(candidates.slice(0, PAGE_SIZE_FIRST))
        let current = PAGE_SIZE_FIRST
        while (current < candidates.length) {
            pages.push(candidates.slice(current, current + PAGE_SIZE_OTHER))
            current += PAGE_SIZE_OTHER
        }
    }

    if (loading) return <div className="text-center p-10">読み込み中...</div>
    if (!order) return <div className="text-center p-10 text-red-500">注文が見つかりません!</div>

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 font-sans text-black">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    body { font-family: 'Noto Sans JP', sans-serif !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-page { 
                        break-after: page; 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        border: none !important;
                        
                        /* Fit to page */
                        height: 297mm;
                        overflow: hidden !important;
                        zoom: 0.95;
                        page-break-inside: avoid;
                    }
                    .no-print { display: none !important; }
                }
                
                @media screen {
                    body {
                        min-width: 220mm; /* Desktop layout on mobile */
                        overflow-x: auto;
                    }
                    .print-page {
                        width: 210mm !important;
                        min-width: 210mm !important;
                    }
                }

                .print-page {
                    background: white; width: 210mm; height: 297mm; margin: 0 auto 20px auto; 
                    box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; position: relative;
                }
                .input-underline { border-bottom: 1px dashed #9ca3af; width: 100%; outline: none; background: transparent; padding: 0 4px; font-weight: 500; color: #1f2937; }
                .input-underline:focus { border-bottom: 2px solid #2563eb; }
                
                .info-table td { padding: 5px 6px; border: 1px solid #d1d5db; vertical-align: middle; }
                .label-cell { background-color: #f3f4f6; font-weight: bold; color: #374151; width: 14%; font-size: 10px; }
                .value-cell { font-weight: 500; font-size: 11px; color: #111827; }
            `}</style>

            <div className="fixed top-4 right-4 no-print flex gap-2 z-50">
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold flex items-center gap-2">
                    <span className="material-icons-outlined">print</span> Print
                </button>
            </div>

            {pages.length === 0 && <div className="text-center p-10">候補者がいません。</div>}

            {pages.map((group, pageIndex) => (
                <div key={pageIndex} className="print-page">
                    <div className="h-full flex flex-col box-border px-[12mm] pb-[10mm]" style={{ paddingTop: pageIndex === 0 ? '10mm' : '25mm' }}>

                        {/* HEADER - Only on Page 1 */}
                        {pageIndex === 0 && (
                            <>
                                <div className="text-center mb-4">
                                    <h1 className="text-2xl font-bold uppercase text-gray-800 border-b-2 border-gray-800 inline-block pb-1">面 接 候 補 者 リ ス ト</h1>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm px-2">
                                    <div className="flex items-center">
                                        <span className="min-w-[80px] font-bold text-gray-700">受入企業:</span>
                                        <input className="input-underline" value={printInfo.companyName} onChange={e => setPrintInfo({ ...printInfo, companyName: e.target.value })} />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="min-w-[80px] font-bold text-gray-700">職種:</span>
                                        <input className="input-underline" value={printInfo.jobDescription} onChange={e => setPrintInfo({ ...printInfo, jobDescription: e.target.value })} />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="min-w-[80px] font-bold text-gray-700">監理団体:</span>
                                        <input className="input-underline" value={printInfo.supervisingOrg} onChange={e => setPrintInfo({ ...printInfo, supervisingOrg: e.target.value })} />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="min-w-[80px] font-bold text-gray-700">選考日:</span>
                                        <input type="date" className="input-underline" value={printInfo.interviewDate} onChange={e => setPrintInfo({ ...printInfo, interviewDate: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LIST */}
                        <div className="space-y-5 flex-1">
                            {group.map((item, index) => {
                                const c = item.ho_so || {}
                                const globalIndex = (pageIndex === 0 ? 0 : PAGE_SIZE_FIRST) + (pageIndex > 1 ? (pageIndex - 1) * PAGE_SIZE_OTHER : 0) + index + 1
                                return (
                                    <div key={item.id} className="border border-gray-400 p-1.5 flex gap-2 items-start shadow-sm rounded-sm">
                                        {/* Avatar Col */}
                                        <div className="flex flex-col items-center gap-1 w-[30mm] shrink-0 border-r border-gray-200 pr-1.5">
                                            <div className="text-2xl font-black text-gray-400">{item.sbd ? item.sbd.toString().padStart(2, '0') : globalIndex.toString().padStart(2, '0')}</div>
                                            <div className="w-[28mm] h-[36mm] border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {c.anh_ho_so ? <img src={c.anh_ho_so} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400">写真無</span>}
                                            </div>
                                        </div>
                                        {/* Info Col */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline border-b border-gray-300 pb-0.5 mb-1.5">
                                                <div>
                                                    <span className="text-base font-bold uppercase text-blue-900 mr-2">{c.ho_ten}</span>
                                                    {c.nickname && <span className="text-xs text-gray-400 ml-3">Nickname: <span className="text-sm font-bold text-blue-900">{c.nickname}</span></span>}
                                                </div>
                                                <div className="text-xs font-bold text-gray-700">
                                                    {getAge(c.ngay_sinh)}歳 <span className="font-normal text-gray-500">({c.ngay_sinh ? new Date(c.ngay_sinh).getFullYear() : ''})</span>
                                                </div>
                                            </div>
                                            <table className="w-full info-table border-collapse">
                                                <tbody>
                                                    <tr>
                                                        <td className="label-cell">出身</td><td className="value-cell" colSpan={3}>{c.que_quan}</td>
                                                        <td className="label-cell">婚姻</td><td className="value-cell w-[16%]">{mapMarital(c.hon_nhan)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="label-cell">体格</td>
                                                        <td className="value-cell" colSpan={3}>
                                                            {c.chieu_cao}cm / {c.can_nang}kg <span className="text-gray-300 mx-1">|</span> {c.nhom_mau} <span className="text-gray-300 mx-1">|</span> {mapHand(c.tay_thuan)}
                                                        </td>
                                                        <td className="label-cell">視力</td><td className="value-cell">{mapVision(c.thi_luc_trai)} / {mapVision(c.thi_luc_phai)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="label-cell">学歴</td><td className="value-cell" colSpan={3}>{getEducationSummary(c.qua_trinh_hoc_tap)}</td>
                                                        <td className="label-cell">日本語</td><td className="value-cell">{mapJapaneseLevel(c.trinh_do_tieng_nhat)}</td>
                                                    </tr>
                                                    {/* Row removed: 経歴 */}
                                                    <tr>
                                                        <td className="label-cell">家族</td><td className="value-cell" colSpan={5}>{getFamilySummary(c.thong_tin_gia_dinh)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="label-cell">備考</td>
                                                        <td className="value-cell text-[9px]" colSpan={5}>
                                                            <span className={`mr-4 ${mapYesNoShort(c.xam_hinh) === '有' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                                刺青: {mapYesNoShort(c.xam_hinh)}
                                                            </span>
                                                            <span className={`mr-4 ${mapYesNoShort(c.hut_thuoc) === '有' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                                喫煙: {mapYesNoShort(c.hut_thuoc)}
                                                            </span>
                                                            <span className={`${mapYesNoShort(c.mu_mau) === '有' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                                色盲: {mapYesNoShort(c.mu_mau)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="text-right text-[10px] text-gray-400 mt-2">
                            ページ {pageIndex + 1}/{pages.length}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
