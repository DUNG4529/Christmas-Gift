// Chỉnh các nội dung bên dưới để cá nhân hoá món quà
// Lưu lại và mở file index.html để xem thay đổi

window.GIFT_CONFIG = {
  recipientName: "Nguyễn Phương Uyên",
  senderName: "Nguyễn Tiến Dũng",
  specialMessage: `
    <p>Gửi em,</p>
    <p>Giáng Sinh là mùa của yêu thương, và với anh, mỗi ngày bên em đều là một món quà. Anh biết ơn vì nụ cười, sự dịu dàng và cả những khoảnh khắc nhỏ xinh mà chúng mình đã đi qua.</p>
    <p>Chúc em một mùa lễ thật ấm áp, luôn được bao bọc bởi tình yêu và niềm vui. Cảm ơn em vì đã đến bên anh.</p>
    <p>Yêu em rất nhiều. 💖</p>
  `,
  audio: {
    enabled: true,
    // Phát từ YouTube bằng Iframe API (khuyến nghị khi bạn có link YouTube)
    youtubeId: "2nzdxWY4IJQ",
    // Tuỳ chọn fallback nếu bạn có file MP3 cá nhân (không cần nếu dùng YouTube)
    src: "assets/audio/music.mp3",
    autoplay: true,
    volume: 0.6,
  },
  timeline: [
    { date: "Lần đầu gặp", text: "Ngày chúng ta tình cờ chạm mắt — và tim rung lên ✨" },
    { date: "Buổi hẹn hò", text: "Ly cacao nóng, câu chuyện dài, và ánh đèn lung linh." },
    { date: "Những ngày bình thường", text: "Tin nhắn chào buổi sáng và những cái ôm vững chãi." },
  ],
  gallery: [
    // Đặt ảnh của bạn vào assets/photos/ và khai báo bên dưới
    // { src: "assets/photos/1.jpg", caption: "Khoảnh khắc dễ thương" },
  ],
};
