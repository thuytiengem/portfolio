# Trang Graphic Design — `graphic-design.html`

Trang các dự án thiết kế đồ hoạ (logo, poster, bộ ảnh mạng xã hội, bao bì, icon…). Mở từ menu **Portfolio → Graphic Design**.

Bố cục = mẫu 1 "Poster grid + đường ray" (chủ web đã chọn). Một trang, hai chế độ, **cùng một nguồn dữ liệu**:

- **Danh sách** — `graphic-design.html`
  - **Banner**: "← Trang chủ", tiêu đề lớn **THIẾT KẾ ĐỒ HOẠ** / GRAPHIC DESIGN, đoạn giới thiệu (`intro`), ô đếm "5 DỰ ÁN" / "31 HÌNH".
  - **Thẻ poster** giống trang Video Games (3 cột → 2 → 1 trên điện thoại): ảnh bìa, tên, dòng "khách hàng · năm", công cụ (tag),
    mô tả 3 dòng, "Xem dự án →". Rê chuột: thẻ nhấc lên + góc HUD cyan. Bấm thẻ → trang chi tiết.
- **Chi tiết** — `graphic-design.html?id=<id dự án>` (vd. `graphic-design.html?id=gem-brand-identity`)
  - "← Tất cả dự án đồ hoạ": quay về danh sách và cuộn tới đúng thẻ vừa xem.
  - **Banner HUD**: "THIẾT KẾ ĐỒ HOẠ 01 / 05", tên dự án, khách hàng · năm, mô tả, **CÔNG CỤ**, "4 BƯỚC" / "8 HÌNH" và **ảnh bìa** bên phải
    (hiện nguyên ảnh, không bị cắt; bấm để xem to).
  - **Quá trình thực hiện**: các bước đánh số trên đường dọc cyan — tên bước, chữ, dải ảnh cuộn ngang (bấm để xem to: ← → / vuốt, Esc để đóng).
  - Cuối trang: **Dự án trước · Tất cả dự án · Dự án tiếp**.
  - Link tới một bước: `graphic-design.html?id=gem-brand-identity#step-3`. Id sai → "Dự án này không tồn tại" + link về danh sách.

## Sửa trong Studio (dễ nhất)

Chạy `node portfolio-studio/server.mjs`, mở http://localhost:4100/portfolio-studio/ → **Graphic Design**.

- **Giới thiệu**: đoạn chữ trong banner trang danh sách (EN / VI).
- **Thêm dự án**: bấm "+ Thêm dự án", gõ tên EN → **id** tự tạo (vd. "Gem Brand Identity" → `gem-brand-identity`). Id = tên thư mục ảnh và
  là địa chỉ trang chi tiết (`graphic-design.html?id=gem-brand-identity`). Đổi id của dự án đã có ảnh → khi Lưu, thư mục ảnh được đổi tên
  theo (có hỏi lại). Lưu ý: link cũ `?id=<id cũ>` sẽ không còn mở được.
- **↑ ↓** đổi thứ tự dự án / bước (thứ tự thẻ = thứ tự nút dự án trước / tiếp), **✕** xoá (thư mục ảnh vẫn giữ trên ổ đĩa — xoá tay nếu không cần).
- **Khách hàng** (EN / VI, vd. "Dự án cá nhân", tên công ty) và **Năm** (vd. 2025): hiện thành dòng "khách hàng · năm". Để trống = ẩn.
- **Công cụ**: gõ tên rồi Enter (kéo chip để đổi thứ tự, ✕ để bỏ). Hiện thành tag trên thẻ và chip CÔNG CỤ ở trang chi tiết.
- **Mô tả**: mỗi ô một dòng, cột EN | VI. **1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng.** Thẻ chỉ hiện tối đa 3 dòng
  (mô tả dạng danh sách → thẻ lấy dòng đầu); trang chi tiết hiện đầy đủ.
- **Ảnh bìa** (`cover`): chọn một ảnh trong các bước. Dùng cho ảnh thẻ, ảnh lớn ở trang chi tiết và ảnh nhỏ ở nút dự án trước / tiếp.
  Để mặc định = ảnh đầu tiên của các bước. Ảnh bìa có nhãn vàng "ảnh bìa" trong danh sách ảnh.
- **Các bước** ("+ Thêm bước"): tên bước EN / VI, nội dung (như mô tả), ảnh của bước.
- **Ảnh**: "Tải ảnh lên" (chọn nhiều ảnh, hoặc kéo thả vào khung) — ảnh JPG được nén ≤ 2400px, PNG có nền trong suốt giữ nguyên PNG.
  Kéo ảnh (hoặc ← →) để đổi thứ tự, điền chú thích EN / VI (hiện khi xem ảnh to). ✕ gỡ ảnh khỏi danh sách; tích "Xoá luôn file"
  nếu muốn xoá cả file khi Lưu.
- **Quét thư mục**: tự chép ảnh vào `Database/GraphicDesign/images/<id dự án>/` rồi bấm nút này ở bước muốn thêm → ảnh mới (chưa có ở bước
  nào) được thêm vào bước đó (theo tên file); ảnh trong danh sách mà không còn file thì được đánh dấu "thiếu file". Mọi bước của một dự án
  dùng **chung một thư mục**.
- Bấm **Lưu**, rồi **Commit & Push** ở cuối trang (phạm vi `Database/GraphicDesign`, nội dung mặc định "Update graphic design").
- **Xem trước** (góc trên phải) hiện trang danh sách bên cạnh; nút "Xem trang ↗" mở trang trong tab mới.

Tên trang, "← Tất cả dự án đồ hoạ", "Quá trình thực hiện", "Công cụ", "Dự án trước / tiếp", "{n} bước"… nằm trong Studio →
**Văn bản giao diện** (các khoá `gd_*`). Chữ "Xem dự án" trên thẻ dùng chung khoá `games_view` với trang Video Games.

## Sửa tay — `Database/GraphicDesign/data.json`

```
Database/GraphicDesign/
├── data.json
└── images/
    ├── gem-brand-identity/   moodboard-1.jpg, sketch-1.jpg, logo-final.jpg, …   (ảnh của mọi bước, chung 1 thư mục)
    ├── neon-poster-series/   …
    └── …
```

```json
{
  "intro": { "en": "Logos, posters, social media kits…", "vi": "Logo, poster, bộ ảnh mạng xã hội…" },
  "projects": [
    {
      "id": "gem-brand-identity",
      "name": { "en": "Gem Brand Identity", "vi": "Nhận diện thương hiệu Gem" },
      "text": { "en": "A personal brand…", "vi": "Thương hiệu cá nhân…" },
      "cover": "logo-final.jpg",
      "client": { "en": "Personal project", "vi": "Dự án cá nhân" },
      "year": "2025",
      "tools": ["Illustrator", "Photoshop", "Figma"],
      "steps": [
        { "title": { "en": "Research & moodboard", "vi": "Nghiên cứu & moodboard" },
          "text": { "en": ["Line 1", "Line 2"], "vi": ["Dòng 1", "Dòng 2"] },
          "images": [ { "src": "moodboard-1.jpg", "caption": { "en": "Moodboard", "vi": "Moodboard" } }, "moodboard-2.jpg" ] }
      ]
    }
  ]
}
```

| Trường | Dùng ở | Ghi chú |
|---|---|---|
| `id` | `?id=` của trang chi tiết, tên thư mục ảnh | chữ thường không dấu, số, gạch ngang (`a-z 0-9 -`), không trùng |
| `name` | tên thẻ + tên trang chi tiết + tiêu đề tab | trống → hiện `id` |
| `text` | mô tả thẻ (cắt 3 dòng) + đoạn mở đầu trang chi tiết | chuỗi = đoạn văn, danh sách `[...]` = gạch đầu dòng |
| `cover` | ảnh thẻ + ảnh lớn trang chi tiết + nút dự án trước / tiếp | trống → ảnh đầu tiên của các bước |
| `client`, `year` | dòng "khách hàng · năm" | tuỳ chọn |
| `tools` | tag trên thẻ, chip CÔNG CỤ | danh sách tên công cụ |
| `steps[]` | các bước của "Quá trình thực hiện" | `title`, `text`, `images`; bước không có ảnh → chỉ chữ; bước trống bị bỏ |

- **Mọi trường đều không bắt buộc.** Trống → không hiện. Dự án không có tên, chữ, bước → bị bỏ; số 01 / 05 chỉ đếm những dự án đang hiện.
- Ô chữ: `"..."` hoặc `{ "en": "...", "vi": "..." }` (vi trống → tiếng Anh), dùng được thẻ rich text ([RICHTEXT.md](RICHTEXT.md)).
- `images`: tên file trong `images/<id>/`, hoặc `{ "src", "caption" }`; link `https://…` cũng được.
- Thứ tự trong `projects` = thứ tự thẻ = thứ tự dự án trước / tiếp.
- Tên file ảnh: chữ không dấu, số, `. _ -` (Studio tự đổi tên khi tải lên). Nên dùng JPG ≤ 1600–2400px, ≤ ~300 KB.

## Font tiếng Việt

Như trang 2D / 3D: tên có chữ tiếng Việt mà font Qualy thiếu (ă, ơ, ư, ĩ, ũ, các dấu chồng như ả, ạ, ế, ậ…) tự đổi sang
Montserrat đậm; tên tiếng Anh giữ nguyên Qualy.

## Nội dung hiện tại

5 dự án **demo** (chữ có ghi "Demo", ảnh giữ chỗ có chữ "DEMO · PLACEHOLDER"): **Gem Brand Identity**, **Neon Poster Series**,
**Social Media Kit** (không có ảnh bìa → dùng ảnh đầu tiên), **Jelly Candy Packaging**, **HUD Icon Set** (bước cuối chỉ có chữ).
Thay bằng dự án đồ hoạ thật của bạn.
