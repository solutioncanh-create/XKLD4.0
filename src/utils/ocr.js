
const API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

// Helper: Chuyển File/Blob/URL thành định dạng Base64 thuần túy
async function fileToBase64(fileInput) {
    if (typeof fileInput === 'string') {
        const response = await fetch(fileInput);
        const blob = await response.blob();
        return await blobToData(blob);
    }
    return await blobToData(fileInput);
}

function blobToData(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
}

export async function callGeminiAPI(fileInput) {
    if (!API_KEY) throw new Error("Chưa có API Key");

    try {
        const base64Image = await fileToBase64(fileInput);

        // API Endpoint trực tiếp
        // Sử dụng model có sẵn trong danh sách của user: gemini-2.0-flash
        const modelName = "gemini-2.0-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [{
                parts: [
                    { text: "Extract information from this Vietnamese ID card (CCCD). Return JSON: {\"ho_ten\": \"UPPERCASE NAME\", \"so_cccd\": \"...\", \"que_quan\": \"...\", \"noi_o_hien_tai\": \"...\", \"ngay_sinh\": \"YYYY-MM-DD\", \"gioi_tinh\": \"Nam/Nu\", \"ngay_cap_cccd\": \"...\", \"noi_cap_cccd\": \"...\"}. If back side, only date/place of issue. No markdown." },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);

            // ==========================================
            // DEBUG: TỰ ĐỘNG LẤY DANH SÁCH MODEL NẾU LỖI
            // ==========================================
            if (data.error?.code === 404 || data.error?.status === "NOT_FOUND") {
                try {
                    console.log("Đang lấy danh sách model khả dụng...");
                    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
                    const listData = await listRes.json();

                    if (listData.models) {
                        const modelNames = listData.models.map(m => m.name.replace("models/", "")).join("\n- ");
                        const msg = `Model '${modelName}' không dùng được. Các model khả dụng:\n- ${modelNames}`;
                        console.warn(msg);
                        throw new Error(msg);
                    } else {
                        throw new Error(`Lỗi 404 và không lấy được danh sách model. (Chi tiết: ${JSON.stringify(listData.error || listData)})`);
                    }
                } catch (listErr) {
                    throw new Error(`${data.error.message} (Không thể lấy danh sách model: ${listErr.message})`);
                }
            }

            throw new Error(data.error?.message || "Lỗi API không xác định");
        }

        // Parse result
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Không có dữ liệu text trả về");

        console.log("Raw Text:", text);

        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Lỗi gọi Gemini (REST):", error);
        throw error;
    }
}

export const parseCCCD = () => ({});
