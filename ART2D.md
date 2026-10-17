# Trang 2D Artwork — `art2d.html`

Trang tranh 2D của portfolio. Mở từ menu **Portfolio → 2D Artwork**, hoặc nút **Explore** của mục Personal Artworks ở
trang chủ (khi `web-config.json → links.artworks` để trống hoặc `#`).

Bố cục = mẫu 1 "Progression" + banner đầu trang của mẫu 2 (chủ web đã chọn):

- **Banner**: "← Trang chủ", tiêu đề lớn **2D ARTWORK**, đoạn giới thiệu (`intro`), ô đếm "5 MỤC" / "29 TRANH".
  Trang Video Games (`games.html`) dùng chung banner này.
- **Thanh chip** dính trên cùng khi cuộn: bấm để nhảy tới mục, mục đang xem sáng lên.
- **Mỗi mục**: "01 TÊN MỤC · 7 hình" + chữ + dải ảnh cuộn ngang (bấm ảnh để xem to: ← → / vuốt, Esc để đóng).
- **Các bước** (tuỳ chọn): các hàng đánh số trên một đường dọc màu cyan, mỗi bước có tên, chữ và dải ảnh riêng
  (ví dụ: phác thảo → lên màu → bản hoàn chỉnh).

## Sửa trong Studio (dễ nhất)

Chạy `node portfolio-studio/server.mjs`, mở http://localhost:4100/portfolio-studio/ → **2D Artwork**.

- **Giới thiệu**: đoạn chữ trong banner (EN / VI).
- **Thêm mục**: bấm "+ Thêm mục", gõ tên EN → **id** tự tạo (vd. "Concept Art" → `concept-art`). Id = tên thư mục ảnh và là
  "neo" của mục (`art2d.html#concept-art`). Đổi id của mục đã có ảnh → khi Lưu, thư mục ảnh được đổi tên theo (có hỏi lại).
- **↑ ↓** đổi thứ tự mục / bước, **✕** xoá (thư mục ảnh vẫn giữ trên ổ đĩa — xoá tay nếu không cần).
- **Nội dung**: mỗi ô một dòng, cột EN | VI. **1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng.**
- **Ảnh của mục**: "Tải ảnh lên" (chọn nhiều ảnh, hoặc kéo thả vào khung) — ảnh JPG được nén ≤ 2400px, PNG có nền trong suốt
  giữ nguyên PNG. Kéo ảnh (hoặc ← →) để đổi thứ tự, điền chú thích EN / VI (hiện khi xem ảnh to).
  ✕ gỡ ảnh khỏi danh sách; tích "Xoá luôn file" nếu muốn xoá cả file khi Lưu.
- **Quét thư mục**: tự chép ảnh vào `Database/Art2D/images/<id mục>/` rồi bấm nút này → ảnh mới được thêm vào danh sách
  (theo tên file), ảnh trong danh sách mà không còn file thì được đánh dấu "thiếu file".
- **Các bước**: "+ Thêm bước" trong mục → tên bước, nội dung, ảnh riêng. Ảnh của bước nằm **chung thư mục** với mục.
- **Ảnh bìa** (`cover`): chọn một ảnh của mục làm ảnh đại diện. Bố cục hiện tại chưa hiển thị ảnh bìa (lưu sẵn cho sau).
- Bấm **Lưu**, rồi **Commit & Push** ở cuối trang (phạm vi `Database/Art2D`).

Tên trang, nhãn "Bước {n}", "{n} tranh"… nằm trong Studio → **Văn bản giao diện** (các khoá `a2_*`).

## Sửa tay — `Database/Art2D/data.json`

```
Database/Art2D/
├── data.json
└── images/
    ├── character-design/   sketch-seer.jpg … final-lineup.jpg   (ảnh của mục + ảnh của các bước)
    ├── illustration/       …
    └── sketchbook/         …
```

```json
{
  "intro": { "en": "Character designs, illustrations…", "vi": "Thiết kế nhân vật, minh hoạ…" },
  "sections": [
    {
      "id": "character-design",
      "name": { "en": "Character Design", "vi": "Thiết kế nhân vật" },
      "text": { "en": "A character set for a board game.", "vi": "Bộ nhân vật cho board game." },
      "cover": "final-lineup.jpg",
      "images": ["01.jpg", { "src": "02.jpg", "caption": { "en": "Seer", "vi": "Tiên tri" } }],
      "steps": [
        { "title": { "en": "Sketches", "vi": "Phác thảo" }, "text": ["Dòng 1", "Dòng 2"], "images": ["sketch-1.jpg"] }
      ]
    }
  ]
}
```

- **Mọi trường đều không bắt buộc.** Trống → không hiện. Mục không có tên, chữ, ảnh, bước → bị bỏ; số 01, 02… chỉ đếm mục đang hiện.
- `id`: chữ thường không dấu, số, gạch ngang (`a-z 0-9 -`), không trùng. `name` trống → hiện `id`.
- Ô chữ: `"..."` hoặc `{ "en": "...", "vi": "..." }` (vi trống → tiếng Anh), dùng được thẻ rich text ([RICHTEXT.md](RICHTEXT.md)).
- `text` (mục và bước): chuỗi = đoạn văn, danh sách `[...]` = gạch đầu dòng.
- `images`: tên file trong thư mục của mục, hoặc `{ "src", "caption" }`. Link `https://…` cũng được.
- Mục có thể chỉ có ảnh, chỉ có bước, hoặc cả hai (ảnh của mục hiện trước, rồi tới các bước). Số tranh = ảnh của mục + ảnh của các bước.
- Tên file ảnh: chữ không dấu, số, `. _ -` (Studio tự đổi tên khi tải lên). Nên dùng JPG ≤ 1600–2400px, ≤ ~300 KB.

## Font tiếng Việt

Font tiêu đề Qualy thiếu một số chữ tiếng Việt (ă, ơ, ư, ĩ, ũ và các dấu chồng như ả, ạ, ế, ậ…). Tiêu đề nào có các chữ đó
(tên mục, tên bước, tiêu đề banner) tự đổi sang font Montserrat đậm để không bị lẫn font; tiêu đề tiếng Anh giữ nguyên Qualy.

## Nội dung hiện tại

5 mục **demo** (ảnh cắt từ Personal Artworks, chữ có ghi "Demo"): Character Design (3 bước), Illustration, Fanart,
Concept Art, Sketchbook — thay bằng tranh và chữ của bạn.
