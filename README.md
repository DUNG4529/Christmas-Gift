# Christmas Gift

Một trang web Giáng Sinh nhỏ xinh để tặng người thương. Không cần cài đặt, chỉ mở file là chạy.

## Cách dùng

1. Mở file `config.js` và chỉnh các phần:
   - `recipientName`: tên người nhận
   - `senderName`: tên bạn
   - `specialMessage`: nội dung bức thư trong trang mở quà
   - `timeline`: các kỷ niệm muốn hiển thị
   - `audio`: đường dẫn nhạc và âm lượng (ví dụ `assets/audio/music.mp3`)
   - `gallery`: danh sách ảnh với `src` và `caption`
2. Mở `index.html` để xem trang chủ, bấm "Mở món quà" để sang trang quà.

## Chạy trên Windows (PowerShell)

Có thể mở trực tiếp (double-click) hoặc dùng PowerShell:

```powershell
Start-Process "$PWD/index.html"
```

Nếu muốn chạy bằng trình duyệt Edge:

```powershell
Start-Process "msedge.exe" "$PWD/index.html"
```

## Tuỳ biến

- Màu sắc, hiệu ứng tuyết và tim có thể chỉnh trong `styles.css`.
- Logic đếm ngược, hiển thị kỷ niệm, hiệu ứng tim ở `script.js`.
- Thanh nhạc: nút phát/tạm dừng và kéo âm lượng ở góc dưới bên phải.
- Slideshow ảnh: thêm ảnh vào `assets/photos/` và khai báo trong `config.js`.

### Nhạc: ưu tiên file cục bộ, fallback YouTube

- Nếu `audio.src` trỏ tới một file MP3 trong `assets/audio/`, trang sẽ phát file đó.
- Nếu file không tồn tại/không phát được và bạn cấu hình `audio.youtubeId`, trang sẽ tự fallback sang phát từ YouTube (ẩn).
- Để dùng YouTube, đặt `audio.youtubeId` là mã video (ví dụ `2nzdxWY4IJQ`).
- Autoplay có thể bị chặn cho đến khi bạn bấm nút “Phát”.

## Gợi ý mở rộng

- Thêm nhạc Giáng Sinh (nút bật/tắt) — chỉ dùng nội dung miễn phí.
- Thêm slideshow ảnh (tự chụp) của hai bạn.
- Đưa lên miễn phí trên GitHub Pages để em có thể xem ở bất kỳ đâu.

## Thêm tài nguyên cá nhân

- Ảnh: đặt file JPG/PNG vào `assets/photos/` rồi cấu hình:

```js
gallery: [
  { src: "assets/photos/1.jpg", caption: "Khoảnh khắc dễ thương" },
  { src: "assets/photos/2.jpg", caption: "Buổi hẹn hò đầu tiên" },
];
```

- Nhạc: đặt file MP3 vào `assets/audio/` (ví dụ `music.mp3`) rồi cấu hình:

```js
audio: { enabled: true, src: "assets/audio/music.mp3", autoplay: false, volume: 0.6 }
```

Lưu ý bản quyền: chỉ dùng ảnh/nhạc bạn tự chụp/tạo hoặc miễn phí bản quyền.

## Deploy lên GitHub Pages

1. Tạo repo GitHub mới và commit toàn bộ thư mục.
2. Push lên nhánh `main`.
3. Vào Settings → Pages → Source: chọn `Deploy from a branch`, Branch: `main` và Folder: `/root`.
4. Đợi vài phút, link sẽ xuất hiện. Chia sẻ link cho người thương ❤️

Hoặc mở cục bộ bằng Edge:

```powershell
Start-Process "msedge.exe" "$PWD/index.html"
```
