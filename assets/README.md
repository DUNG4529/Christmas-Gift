# Assets

Đặt các tệp cá nhân của bạn tại đây:

- Thư mục `photos/`: ảnh JPG/PNG dùng cho slideshow.
- Thư mục `audio/`: một tệp nhạc (MP3) mà bạn có quyền sử dụng.

Ví dụ cấu hình trong `config.js`:

```js
window.GIFT_CONFIG = {
  audio: { src: "assets/audio/music.mp3", autoplay: false, volume: 0.6 },
  gallery: [
    { src: "assets/photos/1.jpg", caption: "Khoảnh khắc dễ thương" },
    { src: "assets/photos/2.jpg", caption: "Buổi hẹn hò đầu tiên" },
  ],
};
```

Lưu ý pháp lý: chỉ sử dụng nhạc/ảnh do bạn sở hữu hoặc thuộc phạm vi miễn phí bản quyền.
