import { useEffect, useState } from "react";

// Xoá nền xanh khỏi ảnh bằng kỹ thuật chroma-key chạy trên canvas
export default function useTransparentIcon(src) {
    const [dataUrl, setDataUrl] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Điểm ảnh thiên xanh dương rõ rệt (khác logo trắng r≈g≈b) -> coi là nền, xoá
                if (b > r + 25 && b > g + 15) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setDataUrl(canvas.toDataURL("image/png"));
        };
    }, [src]);

    return dataUrl;
}