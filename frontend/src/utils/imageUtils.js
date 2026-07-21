/**
 * ย่อขนาดและบีบอัดรูปภาพก่อนนำไปใช้งานหรือบันทึก
 * @param {File} file - รูปภาพที่อัปโหลด (File object)
 * @param {number} maxWidth - ความกว้างสูงสุดที่ต้องการ (px)
 * @param {number} quality - คุณภาพของรูป JPEG (0.0 ถึง 1.0)
 * @returns {Promise<string>} - รูปที่บีบอัดแล้วในรูปแบบ Base64 (Data URL)
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์นี้ไม่ใช่รูปภาพ'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // ถ้ารูปกว้างกว่า maxWidth ให้คำนวณขนาดใหม่
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // วาดรูปใหม่ลงบน Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // ดึงรูปที่บีบอัดเป็น JPEG Base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
};
