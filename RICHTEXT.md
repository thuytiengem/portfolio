# Rich text — các thẻ định dạng chữ

Mọi ô chữ trong `web-config.json` và `Database/` (mô tả, trách nhiệm, tagline, câu chào, About, kinh nghiệm,
tiêu đề/mô tả artwork, nhãn giao diện…) đều dùng được các thẻ dưới đây, cách viết giống Rich Text của Unity.
Gõ thẳng vào Studio hoặc file JSON.

| Thẻ | Tác dụng | Ví dụ | Hiển thị |
|---|---|---|---|
| `<b>…</b>` | In đậm | `<b>Art Direction:</b> định hướng hình ảnh` | **Art Direction:** định hướng hình ảnh |
| `<i>…</i>` | In nghiêng | `<i>casual mobile game</i>` | *casual mobile game* |
| `<u>…</u>` | Gạch chân | `<u>70M+</u> lượt tải` | <u>70M+</u> lượt tải |
| `<s>…</s>` | Gạch ngang | `<s>giá cũ</s>` | ~~giá cũ~~ |
| `<color=…>…</color>` | Đổi màu chữ: mã hex `#rgb` / `#rrggbb` / `#rrggbbaa` hoặc tên màu tiếng Anh | `<color=#ff6ad5>Valentine</color>` | chữ màu hồng |
| `<accent>…</accent>` | Màu tím nhấn của web (giống tiêu đề "Responsibilities") | `<accent>Art Lead</accent>` | chữ màu tím nhạt |
| `<mark>…</mark>` | Tô nền (highlight) màu tím mặc định | `<mark>GDD</mark>` | chữ có nền tím |
| `<mark=…>…</mark>` | Tô nền với màu tự chọn (nên có độ trong suốt) | `<mark=#ffd40066>Fishing Mode</mark>` | chữ có nền vàng nhạt |
| `<size=…>…</size>` | Cỡ chữ: số px, `em`, `rem` hoặc `%` | `<size=120%>to hơn</size>` · `<size=14>nhỏ</size>` | chữ to/nhỏ hơn |
| `<font=title>…</font>` | Dùng font tiêu đề (Qualy) | `<font=title>PORTFOLIO</font>` | font Qualy |
| `<font=body>…</font>` | Dùng font nội dung (Montserrat) | `<font=body>text</font>` | font Montserrat |
| `<sup>…</sup>` | Chỉ số trên | `m<sup>2</sup>` | m² |
| `<sub>…</sub>` | Chỉ số dưới | `H<sub>2</sub>O` | H₂O |
| `<link=URL>…</link>` | Liên kết. Nhận `https://…`, `mailto:…`, `tel:…`, `#muc-trong-trang`; link web mở tab mới | `<link=https://www.behance.net/abc>Behance</link>` | Behance (gạch chân, màu tím) |
| `<br>` | Xuống dòng (không cần thẻ đóng) | `Dòng 1<br>Dòng 2` | 2 dòng |

## Quy tắc

- Thẻ lồng nhau được: `<b><color=#ff6ad5>UI Design:</color></b> thiết kế toàn bộ UI`.
- Giá trị có thể đặt trong ngoặc kép hoặc không: `<color="#fff">` và `<color=#fff>` như nhau.
- Tên thẻ không phân biệt hoa thường (`<B>` = `<b>`).
- Quên thẻ đóng thì định dạng kéo dài tới hết đoạn chữ đó, không ảnh hưởng chỗ khác.
- Thẻ không có trong bảng, hoặc giá trị sai (ví dụ `<color=abc123>`, `<link=javascript:…>`), sẽ **hiện nguyên văn** thành chữ, không bị lỗi.
  Vì vậy viết `<3` hay `a < b` vẫn hiện đúng.
- Mỗi dòng trong danh sách (Description, Responsibilities, About…) tự có dấu chấm đầu dòng (bullet), không cần gõ `-`.
- Tiêu đề tab trình duyệt (`site.pageTitle`) tự bỏ thẻ, chỉ lấy chữ.

## Ví dụ cho mục Responsibilities

```json
"responsibilities": {
  "en": [
    "<b>Art Direction:</b> Defined the project's art direction and visual style.",
    "<b>UI Design:</b> Designed and produced <accent>all</accent> in-game UI."
  ]
}
```
