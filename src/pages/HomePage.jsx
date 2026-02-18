import { Link } from 'react-router-dom'
import {
    FileText,
    Search,
    Cloud,
    MessageCircle,
    GraduationCap,
    ShieldCheck,
    Scan,
    Cpu,
    Plane,
    Globe,
    ArrowRight,
    CheckCircle
} from 'lucide-react'

export default function HomePage() {
    return (
        <div className="font-sans text-slate-900 bg-white selection:bg-emerald-100 selection:text-emerald-900 pt-20">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white py-20 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-5xl">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-slate-200 text-emerald-700 shadow-sm mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Uy tín - Tận tâm - Chuyên nghiệp
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-in-up delay-100">
                        Hệ sinh thái Số kết nối <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Nhân lực Việt - Nhật</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-fade-in-up delay-200">
                        Nền tảng đầu tiên minh bạch hóa quy trình XKLĐ bằng công nghệ. Kết nối trực tiếp Ứng viên - Công ty XKLĐ - Nghiệp đoàn Nhật Bản trên một giao diện duy nhất.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                        <Link to="/dang-ky" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-emerald-600 rounded-full hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1">
                            <FileText size={20} />
                            Tạo Hồ Sơ Số (E-Resume)
                        </Link>
                        <Link to="/viec-lam" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 transition-all duration-300 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md hover:-translate-y-1">
                            <Search size={20} />
                            Tra cứu Đơn hàng AI
                        </Link>
                    </div>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-teal-50/60 rounded-full blur-3xl opacity-60"></div>
                </div>
            </section>

            {/* VALUE PROPOSITION GRID */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Giá Trị Cốt Lõi</h2>
                        <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon={<Cloud size={32} />}
                            title="Hồ sơ Số hóa"
                            desc="Loại bỏ giấy tờ thủ tục. Quản lý thông tin trên Cloud 24/7."
                        />
                        <ValueCard
                            icon={<MessageCircle size={32} />}
                            title="Kết nối Real-time"
                            desc="Tương tác trực tiếp với Nghiệp đoàn, phỏng vấn online."
                        />
                        <ValueCard
                            icon={<GraduationCap size={32} />}
                            title="Học tập Chủ động"
                            desc="E-learning tiếng Nhật và kỹ năng chuẩn công nghiệp."
                        />
                        <ValueCard
                            icon={<ShieldCheck size={32} />}
                            title="Tracking Minh bạch"
                            desc="Theo dõi tài chính và trạng thái Visa theo thời gian thực."
                        />
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-slate-800/50">
                        <StatItem number="500+" label="Đối tác Nghiệp đoàn" />
                        <StatItem number="10K+" label="Profile số đã kích hoạt" />
                        <StatItem number="99%" label="Tỷ lệ xử lý chuẩn xác" />
                        <StatItem number="24/7" label="Hỗ trợ kỹ thuật số" />
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Quy trình 3 bước trên App/Web</h2>
                        <p className="text-slate-600 max-w-xl mx-auto">Đơn giản hóa hành trình của bạn chỉ với 3 bước được tối ưu hóa bằng công nghệ.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

                        <StepCard
                            step="01"
                            icon={<Scan size={28} className="text-white" />}
                            title="Quét & Tạo"
                            desc="Scan giấy tờ, AI tự động điền Form."
                            color="bg-emerald-500"
                        />
                        <StepCard
                            step="02"
                            icon={<Cpu size={28} className="text-white" />}
                            title="Matching"
                            desc="Hệ thống tự gợi ý đơn hàng phù hợp."
                            color="bg-teal-500"
                        />
                        <StepCard
                            step="03"
                            icon={<Plane size={28} className="text-white" />}
                            title="Flying"
                            desc="Theo dõi lịch bay và hỗ trợ tại Nhật qua App."
                            color="bg-sky-500"
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Globe className="text-emerald-600" size={24} />
                        <span className="text-xl font-bold text-slate-900">XKLD <span className="text-emerald-600">4.0</span></span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">Nền tảng công nghệ kết nối nhân lực toàn cầu.</p>
                    <div className="text-sm font-medium text-slate-400">
                        © 2026 XKLD 4.0 Technology JSC. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

function ValueCard({ icon, title, desc }) {
    return (
        <div className="bg-slate-50 p-8 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-emerald-100 text-center">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    )
}

function StatItem({ number, label }) {
    return (
        <div className="flex flex-col items-center p-4">
            <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">{number}</div>
            <div className="text-sm md:text-base font-medium text-slate-300">{label}</div>
        </div>
    )
}

function StepCard({ step, icon, title, desc, color }) {
    return (
        <div className="flex flex-col items-center text-center group bg-white p-6 rounded-2xl md:bg-transparent md:p-0">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-6 relative z-10 transition-transform group-hover:scale-110 ${color}`}>
                {icon}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    {step}
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600">{desc}</p>
        </div>
    )
}
