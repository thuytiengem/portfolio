# Trang chi tiết dự án — `project.html?id=<thư-mục>`

Mỗi dự án trong `Database/Projects/<thư-mục>/` có một trang riêng: `project.html?id=<thư-mục>`
(ví dụ `project.html?id=jelly-master-project`). Nút **Explore** của mỗi dự án ở mục Featured Projects trang chủ
mở trang này; nếu điền `exploreUrl` thì nút Explore đi tới link đó thay vì trang chi tiết.

Bố cục = mẫu 3 "HUD" (chủ web đã chọn), với **My Roles** dạng thẻ đánh số (từ mẫu 1) và **Product Progression**
dạng các giai đoạn xếp dọc, mỗi giai đoạn một dải ảnh cuộn ngang + phóng to ảnh (từ mẫu 2).

## Nguyên tắc

- Trang đọc thẳng file `data.json` của dự án. Các trường cũ (`title`, `tagline`, `tags`, `video`, `description`,
  `responsibilities`, `stores`, `exploreUrl`) giữ nguyên, trang chủ không đổi.
- **Mọi trường đều không bắt buộc.** Trống / không có → phần đó **không hiện**. Một mục không có nội dung → cả mục và
  tiêu đề của nó ẩn, số thứ tự (01, 02 …) chỉ đếm các mục đang hiện.
- Ô chữ có thể là `"..."` hoặc `{ "en": "...", "vi": "..." }` (ô `vi` trống → hiện tiếng Anh), dùng được thẻ rich text
  trong [RICHTEXT.md](RICHTEXT.md).
- Ô "chữ dài" (`roles[].text`, `progression[].text`, `problem`, `solution`) nhận **một đoạn văn** (chuỗi) **hoặc một
  danh sách** (mảng → có chấm tròn đầu dòng).
- `id` sai / thư mục không tồn tại → trang "Không tìm thấy dự án" có link quay lại.

## Các trường

| Trường | Kiểu | Hiện ở đâu |
|---|---|---|
| `logo` | đường dẫn ảnh (tính từ thư mục dự án, hoặc link `https://…`) | Icon vuông bo góc cạnh tên game. |
| `cover` | đường dẫn ảnh | Nền mờ của phần đầu trang. Không có → ảnh thumbnail YouTube → logo. |
| `studio` | chữ | Dòng nhỏ dưới tên game. |
| `period` | chữ | Cạnh studio, ví dụ `"2023 – 2024"`. |
| `downloads` | chữ | Ô số liệu "Downloads", ví dụ `"70M+"`. |
| `members` | số hoặc chữ | Ô "Team". Số `7` → "7 members" / "7 thành viên"; chữ thì hiện nguyên văn. |
| `genre` | chữ | Ô "Genre". |
| `roles` | `[{ "title", "text" }]` | **My Roles** — mỗi vai trò một thẻ đánh số. |
| `progression` | `[{ "id", "name", "text", "images" }]` | **Product Progression** — xem bên dưới. |
| `challenges` | `[{ "problem", "solution" }]` | **Challenges & Solutions** — thẻ chia đôi Vấn đề │ Giải pháp. |
| `learned` | danh sách | **What I learned** — mỗi mục là một câu, hoặc `{ "title", "text" }`. Cũng có thể `{ "en": [...], "vi": [...] }`. |
| `thumbnail` | đường dẫn ảnh | Ảnh của thẻ ở trang **Video Games** (`games.html`). Không có → `cover` → ảnh YouTube → `logo` → ô "no signal" có chữ cái đầu tên game. |
| `featured` | `false` | `false` = **không** hiện dự án ở Featured Projects trang chủ. Không ghi = hiện. Trang Video Games luôn hiện tất cả. |

Hai trường `thumbnail` và `featured` không dùng ở trang chi tiết. Trong Studio: mục "Trang chủ & trang Video Games" khi sửa
một dự án (ô "Hiện ở trang chủ" + "Ảnh thẻ", lưu thành `images/thumbnail.jpg`).

- Chưa có `roles` (hoặc trống) mà có `responsibilities` → trang lấy `responsibilities` làm **một thẻ vai trò không tên**,
  để dự án cũ vẫn có nội dung.
- Thứ tự ô số liệu cố định: Downloads → Team → Genre; thiếu ô nào ẩn ô đó.
- `title`, `tagline`, `tags`, `video` (YouTube, tự phát khi cuộn tới) và `stores` (nút Google Play / App Store / APK)
  hiện ở phần đầu trang giống trang chủ. `description` chỉ dùng ở trang chủ.

## Product Progression — thư mục ảnh

Mỗi giai đoạn có `id` (chữ thường không dấu, số, gạch ngang: `a-z 0-9 -`, không trùng trong cùng dự án). Ảnh của giai
đoạn nằm trong thư mục riêng theo `id`, và `images` chỉ ghi **tên file**:

```
Database/Projects/jelly-master-project/
├── data.json
└── images/
    └── product-progression/
        ├── research/      01.jpg 02.jpg 03.jpg
        ├── sketches/      01.jpg … 12.jpg
        └── ui-design/     01.jpg …
```

```json
"progression": [
  {
    "id": "research",
    "name": { "en": "Research", "vi": "Nghiên cứu" },
    "text": { "en": "Moodboards and colour studies.", "vi": "Moodboard và nghiên cứu màu." },
    "images": [ { "src": "01.jpg", "caption": { "en": "Moodboard", "vi": "Moodboard" } }, "02.jpg", "03.jpg" ]
  },
  { "id": "polish", "name": "Polish & Launch", "text": "One event every month.", "images": [] }
]
```

- `name` trống → hiện `id`. Số ảnh: 0 đến bao nhiêu cũng được (0 ảnh → chỉ có tiêu đề + chữ).
- Mỗi ảnh là `"tên-file.jpg"` hoặc `{ "src": "tên-file.jpg", "caption": "chú thích" }` (chú thích hiện khi phóng to).
  Link đầy đủ `https://…` cũng được.
- Bấm ảnh → xem to: mũi tên / phím ← →, vuốt trên điện thoại, Esc hoặc bấm nền để đóng.
- Nên dùng ảnh JPG ≤ 1600px, ≤ ~300 KB để trang tải nhanh.

Dự án `jelly-master-project` đang có **6 giai đoạn demo** (ảnh giả lập, chữ "Demo — thay bằng nội dung của bạn.") —
thay ảnh trong các thư mục trên và sửa chữ trong Studio hoặc `data.json`.

## Ví dụ đầy đủ (rút gọn)

```json
{
  "title": "Jelly Master: Mukbang ASMR",
  "studio": "Champion Game Studio",
  "period": "2023 – 2024",
  "logo": "images/logo.png",
  "cover": "images/cover.jpg",
  "downloads": "70M+",
  "members": 7,
  "genre": { "en": "Casual simulation", "vi": "Mô phỏng casual" },
  "roles": [
    { "title": "Art Director", "text": { "en": ["Defined the <b>art direction</b>."], "vi": ["Xác định <b>định hướng nghệ thuật</b>."] } },
    { "title": "Event Game Designer", "text": "Wrote the GDD for the Valentine's Day event." }
  ],
  "challenges": [
    { "problem": "Jellies looked flat on low-end phones.", "solution": "Painted the gloss into the sprites — no shader cost." }
  ],
  "learned": [
    { "title": "Readability first", "text": "Silhouette matters more than detail on a 6-inch screen." },
    "Writing a GDD made me a better artist."
  ]
}
```

## Nhãn giao diện

Tiêu đề mục và nhãn nhỏ nằm trong `web-config.json → i18n.en / i18n.vi` (sửa trong Studio → "Văn bản giao diện"):
`pd_back`, `pd_roles`, `pd_progression`, `pd_challenges`, `pd_learned`, `pd_downloads`, `pd_team`, `pd_members` (`{n}` = số người),
`pd_genre`, `pd_problem`, `pd_solution`, `pd_images` / `pd_image` (`{n}` = số ảnh, nhiều / 1 ảnh), `pd_prev`, `pd_next`, `pd_close`,
`pd_not_found`, `pd_not_found_text`. Trang Video Games: `games_*`; trang 2D Artwork: `a2_*` (xem [ART2D.md](ART2D.md)); menu Portfolio: `pm_*`.

## Code

`project.html` + `assets/css/project.css` + `assets/js/project/`:
`main.js` (tải dữ liệu, tiêu đề tab, topbar, mưa chữ, footer) · `model.js` (chuẩn hoá dữ liệu, đường dẫn ảnh, bỏ mục trống)
· `render.js` (bố cục) · `parts.js` (khối nhỏ) · `gallery.js` (dải ảnh) · `lightbox.js` (xem ảnh to).
