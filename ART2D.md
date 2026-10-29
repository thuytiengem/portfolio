# Trang 2D Artwork — `art2d.html`

Trang tranh 2D của portfolio. Mở từ menu **Portfolio → 2D Artwork**, hoặc các nút **Explore** / thẻ của section **2D ARTWORK**
ở trang chủ.

Cấu trúc: **tab → dự án** (không còn các bước).

- **Tab 1 = Personal Artworks**: các dự án của tab này cũng là carousel **01 PERSONAL ARTWORKS** ở trang chủ (mỗi slide = ảnh bìa,
  tên dự án và dòng đầu của nội dung). Nút Explore của carousel mở đúng dự án đang xem.
- **Tab 2–4** = 3 thẻ **02 OTHER 2D PROJECTS** ở trang chủ (tên tab, ảnh bìa của dự án đầu tiên trong tab, số dự án); bấm thẻ mở
  đúng tab. Từ tab thứ 5 trở đi chỉ hiện ở trang 2D.

Bố cục (chủ web đã chọn phương án "Tab scroll"):

- **Banner**: "← Trang chủ", tiêu đề lớn **2D ARTWORK**, đoạn giới thiệu (`intro`), ô đếm "4 TAB" / "15 DỰ ÁN" / "31 TRANH".
- **Thanh tab** dính trên cùng khi cuộn: "01 Personal Artworks 9" … Bấm tab → phần bên dưới đổi sang tab đó. **Mỗi lần chỉ hiện
  một tab.**
- **Tab đang chọn**: "TÊN TAB · 9 dự án" (không có số) + đoạn giới thiệu tab, rồi các dự án xếp dọc, mỗi dự án trong một khung HUD:
  số thứ tự (ô cyan), tên, số hình, nội dung, dải ảnh (bấm để xem to: ← → / vuốt, Esc để đóng).
- Link: `art2d.html#<id tab>` mở tab đó; `art2d.html#<id dự án>` mở tab của dự án và cuộn tới dự án; không có `#` → tab 1.

## Sửa trong Studio (dễ nhất)

Chạy `node portfolio-studio/server.mjs`, mở http://localhost:4100/portfolio-studio/ → **2D Artwork**.

- **Giới thiệu**: đoạn chữ trong banner (EN / VI).
- **Các tab**: tên EN / VI (hiện trên thanh tab, tiêu đề tab và thẻ trang chủ), **id** (neo `art2d.html#id`; để trống thì tự tạo từ
  tên EN khi Lưu), giới thiệu tab. **↑ ↓** đổi thứ tự tab, "+ Thêm tab", **✕** xoá tab (chỉ khi tab đã trống).
  "Xem tab trên web ↗" mở tab đó trên trang đã lưu.
- **Các dự án** được gom theo tab. Trong mỗi tab: "+ Thêm dự án vào tab này", **↑ ↓** đổi thứ tự trong tab, **✕** xoá dự án
  (thư mục ảnh vẫn giữ trên ổ đĩa — xoá tay nếu không cần). Mỗi dự án:
  - **Tên** EN / VI và **id** — tự tạo từ tên EN (vd. "Ghost Bride" → `ghost-bride`). Id = tên thư mục ảnh và là neo
    `art2d.html#ghost-bride`. Đổi id của dự án đã có ảnh → khi Lưu, thư mục ảnh được đổi tên theo (có hỏi lại).
  - **Tab**: chọn tab khác để chuyển dự án (dự án xuống cuối tab mới).
  - **Nội dung**: mỗi ô một dòng, cột EN | VI. **1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng.**
  - **Ảnh bìa** (`cover`): ảnh của dự án trong carousel trang chủ (tab 1) / ảnh thẻ tab ở trang chủ (dự án đầu tiên của tab 2–4).
    Để mặc định = ảnh đầu tiên.
  - **Hiện ảnh bìa trong trang chi tiết**: bỏ tích thì ảnh bìa không nằm trong dải ảnh của dự án ở trang 2D (ghi
    `"showCover": false`), nhưng vẫn dùng ở trang chủ. Mặc định: có tích.
  - **Ảnh của dự án**: "Tải ảnh lên" (chọn nhiều ảnh, hoặc kéo thả vào khung) — ảnh JPG được nén ≤ 2400px, PNG có nền trong suốt
    giữ nguyên PNG. Kéo ảnh (hoặc ← →) để đổi thứ tự, điền chú thích EN / VI (hiện khi xem ảnh to).
    ✕ gỡ ảnh khỏi danh sách; tích "Xoá luôn file" nếu muốn xoá cả file khi Lưu.
  - **Quét thư mục**: tự chép ảnh vào `Database/Art2D/images/<id dự án>/` rồi bấm nút này → ảnh mới được thêm vào danh sách
    (theo tên file), ảnh trong danh sách mà không còn file thì được đánh dấu "thiếu file".
  - "Xem dự án trên web ↗" mở dự án trên trang đã lưu.
- Ô có **(H)** = nội dung đó cũng hiện ở trang chủ.
- Bấm **Lưu**, rồi **Commit & Push** ở cuối trang (phạm vi `Database/Art2D`).

Tên trang, nhãn "{n} tranh", "{n} dự án"… nằm trong Studio → **Văn bản giao diện** (các khoá `a2_*`).

## Sửa tay — `Database/Art2D/data.json`

```
Database/Art2D/
├── data.json
└── images/
    ├── cast-spell/            cast-spell.jpg
    ├── werewolf-board-game/   sketch-seer.jpg … colour-hunter.jpg
    └── …
```

```json
{
  "intro": { "en": "Character designs, illustrations…", "vi": "Thiết kế nhân vật, minh hoạ…" },
  "categories": [
    { "id": "personal-artworks", "name": "Personal Artworks", "text": "Tranh và nhân vật của riêng mình." },
    { "id": "character-design", "name": { "en": "Character Design", "vi": "Thiết kế nhân vật" }, "text": "…" }
  ],
  "projects": [
    {
      "id": "werewolf-board-game",
      "category": "character-design",
      "name": { "en": "Werewolf Board Game", "vi": "Board game Ma Sói" },
      "text": { "en": "A character set for a board game.", "vi": "Bộ nhân vật cho board game." },
      "cover": "colour-wolf.jpg",
      "showCover": false,
      "images": ["colour-wolf.jpg", "01.jpg", { "src": "02.jpg", "caption": { "en": "Seer", "vi": "Tiên tri" } }]
    }
  ]
}
```

- **Mọi trường đều không bắt buộc.** Trống → không hiện. Dự án không có tên, chữ, ảnh → bị bỏ.
- `categories`: các tab theo thứ tự; tab đầu tiên = Personal Artworks (carousel trang chủ), tab 2–4 = thẻ "Other 2D Projects".
- `projects[].category` = `id` của tab. Dự án có `category` không khớp tab nào thì **không hiện**. Thứ tự dự án trong tab = thứ tự trong danh sách.
- `id` (tab và dự án): chữ thường không dấu, số, gạch ngang (`a-z 0-9 -`), không trùng — **id tab cũng không được trùng id dự án**
  (cùng dùng làm neo `#id`). Id dự án = tên thư mục ảnh `images/<id>/`.
- Ô chữ: `"..."` hoặc `{ "en": "...", "vi": "..." }` (vi trống → tiếng Anh), dùng được thẻ rich text ([RICHTEXT.md](RICHTEXT.md)).
- `cover` = ảnh trang chủ (phải là một ảnh trong `images`); `"showCover": false` = ẩn ảnh đó khỏi trang 2D (không ghi = hiện).
- `text` (tab, dự án): chuỗi = đoạn văn, danh sách `[...]` = gạch đầu dòng.
- `images`: tên file trong thư mục của dự án, hoặc `{ "src", "caption" }`. Link `https://…` cũng được.
- Số tranh = số ảnh hiện trên trang 2D (không tính ảnh bìa đã ẩn).
- Tên file ảnh: chữ không dấu, số, `. _ -` (Studio tự đổi tên khi tải lên). Nên dùng JPG ≤ 1600–2400px, ≤ ~300 KB.

## Font tiếng Việt

Font tiêu đề Qualy thiếu một số chữ tiếng Việt (ă, ơ, ư, ĩ, ũ và các dấu chồng như ả, ạ, ế, ậ…) và dấu "—". Tiêu đề nào có các chữ
tiếng Việt đó (tên tab, tên dự án, tiêu đề banner) tự đổi sang font Montserrat đậm; tiêu đề tiếng Anh giữ nguyên Qualy.

## Nội dung hiện tại

4 tab **demo**: **Personal Artworks** (9 dự án = 9 tranh gốc của carousel trang chủ, ảnh các bước cũ đã gộp vào ảnh của dự án),
**Character Design**, **Fanart**, **Sketchbook** (mỗi tab 2 dự án, ảnh cắt từ tranh gốc). Chữ bổ sung có ghi "Demo" — thay bằng
tranh và chữ của bạn.
