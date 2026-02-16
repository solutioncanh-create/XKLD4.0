import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PrintProfileContentJP from '../components/PrintProfileContentJP'

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
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white print:min-h-0 font-sans text-blue-900 leading-snug">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body {
                        height: 297mm;
                        overflow: hidden;
                    }
                    .print-container {
                        height: 297mm;
                        width: 210mm !important;
                        overflow: hidden !important;
                        zoom: 0.95;
                        padding: 10mm !important;
                        margin: 0 auto !important;
                    }
                    /* Override font/colors */
                    body {
                        font-family: 'Noto Sans JP', sans-serif !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: #1e3a8a;
                    }
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
            `}</style>

            {/* Toolbar - Ẩn khi in */}
            <div className="fixed top-4 right-4 print:hidden flex gap-2 z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 font-sans font-bold flex items-center gap-2 text-sm"
                >
                    <span className="material-icons-outlined text-base">print</span> 印刷 (Print JP)
                </button>
            </div>

            <PrintProfileContentJP hoSo={hoSo} />
        </div>
    )
}
