import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import PrintProfileContentJP from '../../components/PrintProfileContentJP'

export default function PrintBatchProfile() {
    const { id } = useParams() // Order ID
    const [candidates, setCandidates] = useState([])
    const [orderName, setOrderName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('don_hang')
                    .select(`
                        ten_don_hang,
                        lien_ket_don_hang_ho_so (
                            id, sbd, 
                            ho_so:ho_so_id (*)
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    setOrderName(data.ten_don_hang)
                    // Extract ho_so objects and merge SBD, sort by SBD (client-side sort since nested order is tricky)
                    const list = (data.lien_ket_don_hang_ho_so || [])
                        .map(item => ({ ...item.ho_so, sbd: item.sbd }))
                        .filter(h => h.id)
                        .sort((a, b) => (a.sbd || 0) - (b.sbd || 0))

                    setCandidates(list)
                }

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
        if (!loading) document.title = `BatchPrint_JP_${orderName}`
    }, [loading, orderName])

    if (loading) return <div className="text-center p-10">読み込み中...</div>
    if (candidates.length === 0) return <div className="text-center p-10 text-red-500">候補者がいません (No Candidates)</div>

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white print:min-h-0 font-sans text-blue-900 leading-snug">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
                @media print {
                    @page { size: A4; margin: 0; }
                    body {
                        font-family: 'Noto Sans JP', sans-serif !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: #1e3a8a;
                    }
                    .page-break { page-break-after: always; break-after: page; }
                    
                    /* Force each profile container to fit exactly one A4 page */
                    .print-container { 
                        height: 297mm;
                        overflow: hidden !important;
                        zoom: 0.95;
                        margin: 0 !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        page-break-inside: avoid;
                    }
                    .no-print { display: none !important; }
                }
                
                @media screen {
                    body {
                        min-width: 220mm;
                        overflow-x: auto;
                    }
                    .print-container {
                        width: 210mm !important;
                        min-width: 210mm !important;
                    }
                }

                .print-wrapper {
                    margin-bottom: 2rem;
                }
            `}</style>

            <div className="fixed top-4 right-4 no-print flex gap-2 z-50">
                <div className="bg-white px-3 py-2 rounded shadow text-sm font-bold text-gray-700">
                    {candidates.length} 候補者 (Candidates)
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 font-sans font-bold flex items-center gap-2 text-sm"
                >
                    <span className="material-icons-outlined text-base">print</span> Print Batch
                </button>
            </div>

            {candidates.map((hoSo, index) => (
                <div key={hoSo.id || index} className={`print-wrapper ${index < candidates.length - 1 ? 'page-break' : ''}`}>
                    <PrintProfileContentJP hoSo={hoSo} showSBD={true} />
                </div>
            ))}
        </div>
    )
}
