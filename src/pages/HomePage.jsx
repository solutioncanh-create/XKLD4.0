import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConsultationModal from '../components/ConsultationModal'

export default function HomePage() {
    const [isModalOpen, setModalOpen] = useState(false)

    return (
        <div className="font-sans text-secondary-800 bg-white selection:bg-primary-100 selection:text-primary-900">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white min-h-[50vh] flex items-center justify-center pt-10 pb-10 md:pt-20 md:pb-16">
                {/* Background Decoration */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary-200 to-transparent opacity-50"></div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -right-[5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-100/40 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute top-[20%] -left-[10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-sky-50/60 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center w-full max-w-5xl">
                    <div className="space-y-6 md:space-y-8 animate-fade-in-up">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase border border-secondary-200 text-primary-800 shadow-sm mx-auto hover:shadow-md transition-shadow cursor-default">
                            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                            Uy tín - Tận tâm - Chuyên nghiệp
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-5xl md:text-7xl lg:text-7xl font-black leading-[1.1] tracking-tight text-secondary-900">
                            Kiến Tạo Tương Lai<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500 pb-2">Hành trình Japan</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed font-normal px-4">
                            Hệ thống quản lý ứng viên thông minh, kết nối trực tiếp với các đơn vị uy tín hàng đầu Nhật Bản. Mở ra cơ hội nghề nghiệp vững chắc.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 px-4 sm:px-0">
                            <Link to="/dang-ky" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-white transition-all duration-300 bg-primary-700 rounded-xl focus:outline-none hover:bg-primary-800 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5">
                                Khai Form Online
                                <span className="material-icons-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                            <button onClick={() => setModalOpen(true)} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-primary-900 transition-all duration-300 bg-white border border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-200 focus:outline-none hover:shadow-md hover:-translate-y-0.5">
                                Yêu Cầu Tư Vấn
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-10 md:py-16 bg-white relative">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 px-4">
                        <span className="text-primary-600 font-bold tracking-widest uppercase text-[15px] mb-2 block">Giá Trị Cốt Lõi</span>
                        <h2 className="text-4xl font-bold text-secondary-900 mb-3">Tại Sao Chọn Chúng Tôi?</h2>
                        <div className="w-48 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto mb-6"></div>
                        <p className="text-secondary-500 text-lg leading-relaxed">Cam kết đồng hành cùng bạn trên mọi chặng đường với sự minh bạch và tận tâm nhất.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 px-2">
                        <FeatureCard
                            icon="settings_suggest"
                            title="Quy Trình Tối Ưu"
                            desc="Minh bạch, rõ ràng và nhanh chóng trong từng bước xử lý hồ sơ."
                        />
                        <FeatureCard
                            icon="handshake"
                            title="Kết Nối Trực Tiếp"
                            desc="Làm việc trực tiếp với nghiệp đoàn Nhật Bản, không qua trung gian."
                        />
                        <FeatureCard
                            icon="school"
                            title="Đào Tạo Chuẩn"
                            desc="Trang bị kỹ năng & Tiếng Nhật sát thực tế đời sống và công việc."
                        />
                        <FeatureCard
                            icon="shield"
                            title="Cam Kết Hỗ Trợ"
                            desc="Bảo vệ quyền lợi hợp pháp của người lao động trong suốt quá trình."
                        />
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-10 md:py-14 bg-secondary-50 border-y border-secondary-100">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-secondary-100 bg-white rounded-2xl shadow-sm border border-secondary-100">
                        <StatNumber number="500+" label="Đối tác Nhật Bản" icon="business" />
                        <StatNumber number="10K+" label="Hồ sơ thành công" icon="assignment_turned_in" />
                        <StatNumber number="99%" label="Tỷ lệ đỗ Visa" icon="airplane_ticket" />
                        <StatNumber number="100%" label="Hài lòng" icon="sentiment_satisfied_alt" />
                    </div>
                </div>
            </section>

            {/* SIMPLE FOOTER */}
            <footer className="bg-primary-700 text-white py-10 md:py-14 font-light text-sm">
                <div className="container mx-auto px-6 text-center space-y-6">
                    <Link to="/" className="inline-flex items-center gap-3 group justify-center hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-primary-700 shadow-lg shadow-black/20">
                            <span className="material-icons-outlined text-2xl md:text-3xl">public</span>
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">XKLD <span className="inline-block bg-gradient-to-r from-yellow-400 to-red-600 text-transparent bg-clip-text pb-1 pr-1">4.0</span></span>
                    </Link>

                    <p className="text-secondary-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-normal opacity-80">
                        Nền tảng quản lý hồ sơ thực tập sinh Việt Nam đi Nhật Bản.
                    </p>

                    <div className="pt-6 border-t border-white/10 w-full max-w-sm mx-auto space-y-1">
                        <p className="text-xs font-bold text-white/50">© 2026 SolutionCooperative.</p>
                        <p className="text-[10px] text-white/30">Developed for Vietnam-Japan Labor Cooperation</p>
                    </div>
                </div>
            </footer>

            {/* CONSULTATION MODAL */}
            {isModalOpen && <ConsultationModal onClose={() => setModalOpen(false)} />}
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-secondary-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center h-full">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl transition-all duration-300 text-primary-700 bg-primary-50 group-hover:bg-primary-600 group-hover:text-white shadow-sm`}>
                <span className="material-icons-outlined">{icon}</span>
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-700 transition-colors">{title}</h3>
            <p className="text-secondary-500 text-lg leading-relaxed flex-1">
                {desc}
            </p>
        </div>
    )
}

function StatNumber({ number, label, icon }) {
    return (
        <div className="p-8 md:p-10 flex flex-col items-center justify-center group hover:bg-secondary-50 transition-colors duration-300 first:rounded-t-2xl lg:first:rounded-l-2xl lg:first:rounded-tr-none last:rounded-b-2xl lg:last:rounded-r-2xl lg:last:rounded-bl-none">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary-100">
                    <span className="material-icons-outlined text-4xl">{icon}</span>
                </div>
            )}
            <div className="text-4xl md:text-5xl font-black text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{number}</div>
            <div className="text-sm md:text-base font-bold text-secondary-500 uppercase tracking-wider">{label}</div>
        </div>
    )
}
