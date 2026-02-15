
// --- HELPER FUNCTIONS FOR PRINT TEMPLATES (JAPANESE) ---

export function mapSex(val) {
    if (!val) return '';
    if (val === 'Nam') return '男';
    if (val === 'Nữ') return '女';
    return val;
}

export function mapMarital(val) {
    if (!val) return '';
    const v = val.toLowerCase();
    if (v.includes('độc') || v.includes('chưa')) return '未婚';
    if (v.includes('kết') || v.includes('có')) return '既婚';
    if (v.includes('ly')) return '離婚';
    return val;
}

export function mapReligion(val) {
    if (!val || val === 'Không') return 'なし';
    if (val.includes('Phật')) return '仏教';
    if (val.includes('Thiên Chúa') || val.includes('Công giáo')) return 'キリスト教';
    return val;
}

export function mapYesNo(val) {
    if (val === true || val === 'Có') return 'あり';
    if (val === false || val === 'Không') return 'なし';
    if (typeof val === 'string' && val.toLowerCase().includes('có')) return 'あり';
    if (typeof val === 'string' && val.toLowerCase().includes('không')) return 'なし';
    return val || 'なし';
}

export function mapHand(val) {
    if (val === 'Phải') return '右';
    if (val === 'Trái') return '左';
    if (val === 'Hai tay') return '両手';
    return val;
}

export function mapRelation(val) {
    if (!val) return '';
    const map = {
        'Bố': '父',
        'Mẹ': '母',
        'Ông': '祖父', 'Bà': '祖母', 'Ông bà': '祖父母',
        'Anh': '兄', 'Chị': '姉', 'Em': '弟/妹', 'Anh chị': '兄弟姉妹',
        'Vợ': '妻', 'Chồng': '夫',
        'Con': '子供'
    };
    if (map[val]) return map[val];
    for (const k in map) {
        if (val.includes(k)) return map[k];
    }
    return val;
}

export function formatDateJP(dStr) {
    if (!dStr) return '';
    try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return dStr;
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } catch { return dStr; }
}

export function getAge(dStr) {
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

export function mapLicense(val) {
    if (!val || val === 'Chưa có' || val === 'Không') return 'なし';
    if (val.toLowerCase().includes('xe máy')) return 'バイク免許';
    if (val.toLowerCase().includes('ô tô') || val.toLowerCase().includes('oto')) return '車免許';
    return val;
}

export function mapPurpose(val) {
    if (!val) return '...';
    if (val.includes('Kiếm thu nhập')) return '家族を支えるため、資金を稼ぐ';
    if (val.includes('Học hỏi kỹ năng')) return '日本の技術と働き方を学ぶため';
    if (val.includes('Trải nghiệm văn hóa')) return '日本の文化と生活を体験するため';
    if (val.includes('Phát triển bản thân')) return '自己成長と将来のチャンスを探すため';
    if (val.includes('Nâng cao trình độ')) return '日本語能力を向上させるため';
    return val;
}

export function mapJob(val) {
    if (!val) return '...';
    if (val.includes('Thực phẩm')) return '食品製造';
    if (val.includes('Cơ khí')) return '機械加工';
    if (val.includes('Xây dựng')) return '建設';
    if (val.includes('May mặc')) return '縫製';
    if (val.includes('Nông nghiệp')) return '農業';
    if (val.includes('Điện tử')) return '電子機器';
    return val;
}

export function mapStrength(val) {
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

export function mapWeakness(val) {
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

export function mapEducation(val) {
    if (!val) return '';
    if (val.includes('Cấp 2') || val.includes('THCS')) return '中学校';
    if (val.includes('Cấp 3') || val.includes('THPT')) return '高等学校'; // Or 高卒
    if (val.includes('Trung Cấp')) return '専門学校';
    if (val.includes('Cao Đẳng')) return '短期大学'; // Or 短大卒
    if (val.includes('Đại Học')) return '大学'; // Or 大卒
    return val;
}

// Helper short version for List
export function mapEducationShort(val) {
    if (!val) return '---';
    if (val.includes('Đại Học')) return '大卒';
    if (val.includes('Cao Đẳng')) return '短大卒';
    if (val.includes('Trung Cấp')) return '専門卒';
    if (val.includes('Cấp 3') || val.includes('THPT')) return '高卒';
    if (val.includes('Cấp 2') || val.includes('THCS')) return '中卒';
    return '---';
}

export function mapVision(val) {
    if (!val) return '';
    const s = String(val).toLowerCase().trim();
    if (s === '10/10' || s === '10') return '1.0';
    if (s.includes('tốt') || s.includes('tot')) return '1.0'; // 良
    if (s.includes('khá') || s.includes('kha')) return '0.8';

    // Parse x/10
    const match = s.match(/^(\d+)\/10$/);
    if (match) return (parseInt(match[1]) / 10).toFixed(1);

    // Old mappings
    if (val === 'Tốt') return '良';
    if (val === 'Trung bình') return '普通';
    if (val === 'Kém') return '不可';

    return val;
}

export function mapWork(val) {
    if (!val) return '';
    const v = String(val).toLowerCase();

    // Construction / Tech
    if (v.includes('xây dựng') || v.includes('nề') || v.includes('phụ hồ')) return '建設作業員';
    if (v.includes('hàn')) return '溶接工';
    if (v.includes('cơ khí') || v.includes('tiện') || v.includes('phay')) return '機械加工';
    if (v.includes('điện')) return '電気工事士';
    if (v.includes('mộc') || v.includes('gỗ')) return '大工';
    if (v.includes('sơn')) return '塗装工';
    if (v.includes('lắp ráp') || v.includes('linh kiện')) return '組立工';

    // Manufacturing / Factory
    if (v.includes('may')) return '縫製工';
    if (v.includes('thực phẩm') || v.includes('chế biến') || v.includes('nấu ăn')) return '食品加工';
    if (v.includes('đóng gói')) return '梱包作業員';
    if (v.includes('kho') || v.includes('bốc xếp')) return '倉庫作業員';
    if (v.includes('công nhân')) return '工員'; // General Factory Worker

    // Agriculture
    if (v.includes('nông nghiệp') || v.includes('làm ruộng') || v.includes('trồng trọt') || v.includes('chăn nuôi')) return '農業';

    // Services / Others
    if (v.includes('lái xe') || v.includes('tài xế')) return '運転手';
    if (v.includes('bán hàng') || v.includes('sale')) return '販売員';
    if (v.includes('nhân viên') || v.includes('văn phòng') || v.includes('kế toán')) return '会社員';
    if (v.includes('viên chức') || v.includes('cán bộ')) return '公務員';
    if (v.includes('giáo viên') || v.includes('dạy học')) return '教師';
    if (v.includes('y tá') || v.includes('điều dưỡng')) return '看護師';
    if (v.includes('bộ đội') || v.includes('quân nhân') || v.includes('nghia vu')) return '軍人';

    // Status
    if (v.includes('học sinh') || v.includes('sinh viên')) return '学生';
    if (v.includes('buôn bán') || v.includes('kinh doanh') || v.includes('tự do') || v.includes('hộ kd')) return '自営業';
    if (v.includes('nội trợ')) return '主婦';
    if (v.includes('thất nghiệp') || v.includes('ở nhà') || v.includes('chưa')) return '無職';

    return val;
}

export function mapSmoke(val) {
    if (!val || val === 'Không') return '吸わない'; // No
    if (val === 'Có ít') return '時々吸う';
    if (val === 'Thường xuyên') return '吸う';
    return val;
}

export function mapDrink(val) {
    if (!val || val === 'Không') return '飲まない';
    if (val === 'Xã giao') return '付き合い程度';
    if (val === 'Uống tốt') return 'よく飲む';
    return val;
}

export function mapTattoo(val) {
    if (!val || val === 'Không') return 'なし';
    if (val.includes('Kín')) return 'あり（隠れている）';
    if (val.includes('Lộ')) return 'あり（見える）';
    if (val.includes('Đã xóa')) return '除去済み';
    // Generic 'Có' -> 'あり'
    if (val === 'Có' || val === true) return 'あり';
    return val;
}

export function formatTimeRange(rangeString) {
    if (!rangeString) return '---';
    // If MM/YYYY - MM/YYYY
    if (rangeString.includes('/')) return rangeString; // Keep as is if already formatted? Or reformat?

    // If YYYY-MM-DD - YYYY-MM-DD
    if (rangeString.includes(' - ')) {
        const [startStr, endStr] = rangeString.split(' - ');
        const fmt = (s) => {
            if (!s) return '...';
            try {
                const d = new Date(s);
                if (isNaN(d.getTime())) return s;
                return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            } catch { return s; }
        }
        return `${fmt(startStr)} ～ ${fmt(endStr)}`;
    }
    return rangeString;
}

export function mapJapaneseLevel(l) {
    if (!l) return '';
    const s = String(l).trim();
    const lower = s.toLowerCase();

    if (lower.startsWith('bai') || lower.startsWith('bài')) {
        const num = s.match(/\d+/);
        if (num) return `第${num[0]}課`;
    }

    if (lower.includes('sơ cấp') || lower.includes('so cap')) return '初級';
    if (lower.includes('trung cấp') || lower.includes('trung cap')) return '中級';
    if (lower.includes('cao cấp') || lower.includes('cao cap')) return '上級';
    if (lower.includes('nhập môn') || lower.includes('nhap mon')) return '入門';
    if (lower.includes('hội thoại') || lower.includes('hoi thoai')) return '会話';
    if (lower.includes('chưa biết') || lower.includes('chua biet')) return '未学習';

    return s;
}

export function mapYesNoShort(val) {
    if (!val) return '---';
    const v = String(val).toLowerCase();
    if (v.includes('có') || v === 'true') return '有';
    if (v.includes('không') || v === 'false') return '無';
    return '---';
}
