/**
 * Hàm gọi Google AI (Gemini) để đọc CCCD
 * Bắt buộc trả về JSON chuẩn
 */
export async function scanIdCard(file) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Chưa cấu hình API Key (VITE_GOOGLE_API_KEY)");
    }
    console.log("AI Scanner using Key:", apiKey.substring(0, 8) + "...");

    // Convert file to Base64
    const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Lấy phần data sau dấu phẩy
        reader.onerror = error => reject(error);
    });

    const mimeType = file.type;

    // Model target
    // Model 2.5 Flash Lite theo yêu cầu
    let targetModel = 'gemini-2.5-flash-lite';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const systemPrompt = `Bạn là hệ thống OCR chuyên nghiệp đọc thẻ Căn cước công dân (CCCD) Việt Nam. 
    Tuyệt đối chỉ trả về JSON thuần túy, không markdown, không giải thích thêm.
    Cấu trúc JSON bắt buộc:
    {
        "so_cccd": "Số thẻ / Số định danh",
        "ho_ten": "Họ và tên (VIẾT HOA)",
        "ngay_sinh": "YYYY-MM-DD (Nếu không rõ ngày/tháng thì để 01)",
        "gioi_tinh": "Nam/Nữ",
        "que_quan": "Nguyên quán / Quê quán",
        "noi_o_hien_tai": "Nơi thường trú",
        "ngay_cap_cccd": "YYYY-MM-DD",
        "noi_cap_cccd": "Nơi cấp (thường là Cục Cảnh sát quản lý hành chính về trật tự xã hội)"
    }
    Nếu ảnh mờ hoặc không đọc được trường nào, để giá trị là chuỗi rỗng "".`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { inlineData: { mimeType: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1 // Giảm sáng tạo để OCR chính xác hơn
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("🔥 Gemini Error:", errorText);
            throw new Error(`Lỗi kết nối AI: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Safety check
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("AI không trả về kết quả hợp lệ.");
        }

        const jsonString = data.candidates[0].content.parts[0].text;
        console.log("AI Raw Response:", jsonString);

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Scan Error:", error);
        throw error;
    }
}
