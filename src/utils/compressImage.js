/**
 * Utility để nén ảnh client-side xuống kích thước mục tiêu
 * @param {File} file - File gốc
 * @param {number} targetSizeKB - Kích thước mục tiêu (KB)
 * @returns {Promise<File>} - File đã nén (định dạng JPEG)
 */
export const compressImage = async (file, targetSizeKB = 200) => {
    // 1. Kiểm tra đầu vào
    if (!file || !file.type.startsWith('image/')) return file

    // Nếu file đã nhỏ hơn target, trả về luôn
    if (file.size <= targetSizeKB * 1024) return file

    console.log(`Bắt đầu nén ảnh: ${(file.size / 1024).toFixed(2)} KB -> Mục tiêu: ${targetSizeKB} KB`)

    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })

    try {
        // 2. Đọc file
        const reader = new FileReader()
        reader.readAsDataURL(file)
        const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = (e) => reject(e)
        })

        // 3. Load vào thẻ Img
        const img = await loadImage(dataUrl)
        const canvas = document.createElement('canvas')

        // 4. Resize ban đầu (Max dimension 1600px để đảm bảo chi tiết nhưng giảm size)
        const MAX_DIMENSION = 1600
        let { width, height } = img

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        // 5. Vẽ ảnh lên Canvas (Fill nền trắng để xử lý PNG trong suốt)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // 6. Nén dần dần (Quality Reduction Loop)
        let quality = 0.9
        let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))

        // Loop giảm quality nếu vẫn lớn hơn target (Limit tới 0.3 để tránh quá mờ)
        while (blob.size > targetSizeKB * 1024 && quality > 0.3) {
            quality -= 0.1
            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
        }

        // Nếu vẫn quá lớn sau khi giảm quality, Scale Down tiếp (Emergency Resize)
        if (blob.size > targetSizeKB * 1024) {
            const scale = 0.7 // Giảm 30% kích thước
            canvas.width = width * scale
            canvas.height = height * scale
            const ctx2 = canvas.getContext('2d')
            ctx2.fillStyle = '#FFFFFF'
            ctx2.fillRect(0, 0, canvas.width, canvas.height)
            ctx2.drawImage(img, 0, 0, canvas.width, canvas.height)
            // Nén lại ở mức trung bình
            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7))
        }

        console.log(`Kết quả nén: ${(blob.size / 1024).toFixed(2)} KB`)

        // 7. Tạo File mới
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg"
        return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })

    } catch (error) {
        console.error("Lỗi nén ảnh (Compress Error):", error)
        return file // Trả về file gốc nếu lỗi
    }
}
