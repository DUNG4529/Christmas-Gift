// Chỉnh các nội dung bên dưới để cá nhân hoá món quà
// Lưu lại và mở file index.html để xem thay đổi

window.GIFT_CONFIG = {
  // Thông tin cá nhân hoá
  recipientName: "Em yêu dấu, người anh trân quý",
  senderName: "Nguyễn Tiến Dũng, rằng người luôn yêu em",

  // Nội dung bức thư (trang mở quà)
  specialMessage: `
    <h2>Thiệp Giáng Sinh gửi em 💌</h2>
    <p>Gửi em,</p>
    <p>
      Giáng Sinh là mùa của yêu thương. Với anh, mỗi ngày bên em đều là một món quà:
      một ánh nhìn dịu dàng, một cái nắm tay ấm áp, một câu chuyện nhỏ khiến tim mình an.
    </p>
    <span class="sep"></span>
    <h3>Những điều anh muốn nói</h3>
    <ul>
      <li>Cảm ơn em đã ở đây — dịu dàng và kiên nhẫn.</li>
      <li>Anh trân trọng từng khoảnh khắc bình yên mình có cùng nhau.</li>
      <li>Mong mình sẽ đi qua mùa đông này thật chậm, nhưng ấm áp.</li>
    </ul>
    <p>
      Nếu có một điều ước cho Giáng Sinh này, anh ước:
      mình sẽ luôn nhớ cách yêu thương nhau giản dị như thế — nói nhẹ, ôm vừa, và nhìn nhau cười.
    </p>
    <span class="sep"></span>
    <h3>Nhỏ nhẹ như thơ</h3>
    <p>
      Anh gửi em một lời thì thầm:<br/>
      tuyết rơi không vội, trái tim mình cũng thế.<br/>
      đèn giăng thắp sáng, có em — là đủ.
    </p>
    <p>Chúc em một mùa lễ thật ấm áp, luôn được bao bọc bởi tình yêu và niềm vui.</p>
    <p>Thương em. 💖</p>
    <p style="text-align:right; color:#c1121f;">
      — từ <strong>Nguyễn Tiến Dũng</strong>
    </p>
  `,

  // Nhạc nền (MP3 cục bộ)
  audio: {
    enabled: true,
    src: "assets/audio/Peaceful_Christmas_Music.mp3", // Đặt file tại đây và đổi tên tuỳ ý
    autoplay: true,                 // Cố gắng tự phát; vẫn có cơ chế unlock nếu trình duyệt chặn
    volume: 0.4,                    // 0.0 - 1.0 (40%)
  },

  // Dòng thời gian kỷ niệm
  timeline: [
    { date: "Lần đầu gặp", text: "Ngày chúng ta tình cờ chạm mắt — và tim rung lên ✨" },
    { date: "Buổi hẹn hò", text: "Ly cacao nóng, câu chuyện dài, và ánh đèn lung linh." },
    { date: "Những ngày bình thường", text: "Tin nhắn chào buổi sáng và những cái ôm vững chãi." },
  ],

  // Kho ảnh
  gallery: [
    // { src: "assets/photos/1.jpg", caption: "Khoảnh khắc dễ thương" },
  ],

  // Lời chúc ngẫu nhiên khi chạm vào quả châu trên cây thông
  ornamentMessages: [
    "Giáng Sinh an lành, em yêu!",
    "Ước gì khoảnh khắc này kéo dài mãi ✨",
    "Nắm tay anh đi qua mùa đông này nhé 💞",
    "Một nụ cười của em = 1000 bông tuyết ❄️",
    "Yêu em nhiều như ánh đèn lấp lánh 🎄",
  ],
  
};
