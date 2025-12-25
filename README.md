# 🎄 Noel V2 - Interactive 3D Christmas Tree

---

## ✨ **_They say home is where the heart is._**

**_So even though I am here and you are there, my home is still with you._**  
**_Merry Christmas to the one I'm waiting for_ 🥰**

---

## ✨ Tính năng

### 🎨 Hiệu ứng 3D nâng cao

- **Cây thông Noel 3D** với 1200+ hạt trang trí (bi vàng, hộp quà, kẹo mía)
- **1800+ hạt bụi lấp lánh** tạo không khí lung linh
- **Ánh sáng động** với bloom effects và tone mapping chuyên nghiệp
- **Môi trường realistic** sử dụng PBR materials (metalness, roughness, clearcoat)

### 🖐️ Điều khiển bằng cử chỉ tay (MediaPipe)

Sử dụng camera để nhận diện cử chỉ tay trong thời gian thực:

- **🌲 Chế độ Cây thông (TREE)**
  - Nắm tay (4 ngón gần cổ tay)
  - Cây xoay chậm, các hạt sắp xếp hình nón
- **💫 Chế độ Phân tán (SCATTER)**
  - Xòe tay rộng (4 ngón xa cổ tay)
  - Các hạt bay ra thành hình cầu 3D, xoay lộn đều
  - Kéo tay di chuyển để xoay toàn bộ cảnh
- **🖼️ Chế độ Xem ảnh (FOCUS)**
  - Chụm ngón tay cái + ngón trỏ (pinch gesture)
  - Phóng to ngẫu nhiên 1 ảnh đã tải lên

### 📸 Tải ảnh cá nhân hóa

- Tải nhiều ảnh cùng lúc
- Ảnh hiển thị trong khung vàng kim loại sang trọng
- Tự động chuyển đổi giữa các chế độ xem

### ⚡ Tối ưu hiệu năng tự động

- **Adaptive Quality System**: tự động điều chỉnh chất lượng dựa trên FPS
  - **Tier 2 (High)**: Full quality, bloom mạnh, tất cả bụi hiển thị
  - **Tier 1 (Medium)**: Giảm pixelRatio, giảm bloom, ẩn 50% bụi
  - **Tier 0 (Low)**: pixelRatio = 1, bloom nhẹ, chỉ hiển thị 20% bụi
- **Smooth gesture filtering**: lọc tọa độ tay và hysteresis chống nháy mode
- **Zero-allocation rendering**: giảm GC pause bằng cách tái sử dụng objects

## 🚀 Cách sử dụng

### Phương pháp 1: Mở trực tiếp

```bash
# Mở file trong trình duyệt hiện đại (Chrome/Edge khuyên dùng)
# Double-click vào noel_v2.html
```

### Phương pháp 2: Live Server (VS Code)

```bash
# 1. Cài extension "Live Server" trong VS Code
# 2. Chuột phải vào noel_v2.html → "Open with Live Server"
# 3. Tự động mở browser tại http://localhost:5500
```

### Phương pháp 3: Python HTTP Server

```powershell
# Trong thư mục project
python -m http.server 8000

# Mở trình duyệt tại: http://localhost:8000/noel_v2.html
```

## 🎮 Điều khiển

### Cử chỉ tay

| Cử chỉ      | Chế độ  | Mô tả                                    |
| ----------- | ------- | ---------------------------------------- |
| 👐 Xòe rộng | SCATTER | 4 ngón xa cổ tay (>0.4 distance)         |
| ✊ Nắm tay  | TREE    | 4 ngón gần cổ tay (<0.25 distance)       |
| 🤏 Chụm     | FOCUS   | Ngón cái + trỏ sát nhau (<0.05 distance) |

### Bàn phím

- **H**: Ẩn/hiện nút điều khiển (giữ lại tiêu đề)

### Chuột/Touch

- Upload ảnh: Click nút "Thêm ảnh"

## 📋 Yêu cầu hệ thống

### Tối thiểu

- **Trình duyệt**: Chrome 90+, Edge 90+, Safari 15+, Firefox 88+
- **Camera**: Webcam hoặc camera tích hợp
- **GPU**: Hỗ trợ WebGL 2.0
- **RAM**: 2GB available
- **CPU**: Dual-core 2.0GHz+

### Khuyên dùng

- Chrome/Edge mới nhất (tối ưu WebGL)
- GPU rời hoặc GPU tích hợp từ 2018+
- Camera 720p+
- 4GB+ RAM

## 🛠️ Công nghệ sử dụng

- **Three.js v0.160**: 3D rendering engine
- **MediaPipe Hand Landmarker v0.10.3**: AI hand tracking
- **Post-processing**: Bloom, tone mapping (Reinhard)
- **PBR Materials**: Realistic lighting & reflections
- **Adaptive Performance**: Dynamic quality scaling

## 🎯 Tối ưu hiệu năng

### Nếu gặp giật lag

1. **Đóng các tab khác** để giải phóng GPU/CPU
2. **Giảm độ phân giải màn hình** (nếu màn hình 4K)
3. **Tắt hardware acceleration trong các app khác**
4. **Chuyển sang chế độ TREE** (ít tính toán hơn SCATTER)
5. **Không tải quá 10-15 ảnh** (mỗi ảnh tốn VRAM)

### Kiểm tra FPS

- Hệ thống tự động đo FPS mỗi 0.5s
- Khi FPS < 45: tự động hạ tier
- Khi FPS > 58: tự động nâng tier

### Tùy chỉnh thủ công (nâng cao)

Chỉnh trong code `noel_v2.html`:

```javascript
// Giảm số lượng particles
count: 800,        // default: 1200
dustCount: 1000,   // default: 1800

// Tắt bloom (nhanh hơn nhiều)
// Comment dòng: composer.addPass(bloomPass);

// Giảm bloom
bloomPass.strength = 0.2;  // default: 0.35
```

## 📂 Cấu trúc thư mục

```
Christmat Gift Individual/
├── noel_v2.html                          # File chính (optimized)
├── Pine_Tree_Ver_12.2.1_FinalPart.html  # Phiên bản khác
└── README.md                             # File này
```

## 🐛 Khắc phục sự cố

### Camera không hoạt động

1. **Cấp quyền camera** khi trình duyệt hỏi
2. **HTTPS required**: dùng Live Server hoặc localhost (không mở file:// trực tiếp)
3. **Kiểm tra camera** đang dùng bởi app khác
4. Chrome settings → Privacy → Camera → Allow

### Màn hình đen

1. **Chờ 3-5s** (đang load models)
2. **Kiểm tra console** (F12) xem lỗi WebGL
3. **Update GPU driver**
4. **Thử trình duyệt khác**

### Cử chỉ không nhận

1. **Đủ ánh sáng** (camera cần thấy rõ tay)
2. **Tay trong khung hình** (camera nhỏ góc dưới phải - vô hình)
3. **1 tay duy nhất** (hệ thống chỉ track 1 tay)
4. **Làm cử chỉ rõ ràng** (giữ 150-200ms)

### Giật lag

1. Hệ thống sẽ **tự động giảm chất lượng**
2. **Đợi 2-3s** để adaptive quality kick in
3. **Giảm zoom browser** (Ctrl + "-")
4. **Đóng ảnh/video nền** đang chạy

## 📝 Ghi chú phát triển

### Tối ưu đã áp dụng

- ✅ RequestAnimationFrame (không dùng setInterval)
- ✅ Object pooling & zero-allocation trong animation loop
- ✅ CSS transform + will-change
- ✅ Exponential smoothing cho lerp (ổn định hơn)
- ✅ Gesture low-pass filter + hysteresis
- ✅ Precomputed transforms (tính 1 lần/frame)
- ✅ Adaptive bloom & pixel ratio
- ✅ Conditional dust rendering

### Cải tiến tiềm năng

- [ ] InstancedMesh cho dust (giảm draw calls 10-20x)
- [ ] Spatial hashing cho collision/interaction
- [ ] Web Worker cho MediaPipe (không block main thread)
- [ ] Texture atlas cho materials
- [ ] Level-of-detail (LOD) system

## 🎄 Chúc mừng Giáng sinh!

Dự án được tạo với ❤️ sử dụng Three.js và MediaPipe.

---

**Version**: 2.2.7  
**Last Updated**: December 25, 2025  
**License**: Personal Use  
**Author**: Nguyễn Tiến Dũng  
**Contact**: Happy Holiday Season! 🎅  
**Special Message**: _This project is dedicated to someone special_ 🎁
