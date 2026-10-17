# Trang 3D Artwork — `art3d.html`

Trang các dự án 3D của portfolio. Mở từ menu **Portfolio → 3D Artwork**, hoặc nút **Explore** của mục **3D Blender** ở trang chủ
(khi `exploreUrl` của video đó để trống hoặc `#`). Link thẳng tới một dự án: `art3d.html#<id dự án>` (vd. `art3d.html#blossom-fairy`).

Bố cục = mẫu 1 "Progression" (chủ web đã chọn), cùng nhịp với trang 2D Artwork:

- **Banner**: "← Trang chủ", tiêu đề lớn **3D ARTWORK**, đoạn giới thiệu (`intro`), ô đếm "3 DỰ ÁN" / "3 VIDEO" / "30 HÌNH".
- **Thanh chip** dính trên cùng khi cuộn: bấm để nhảy tới dự án, dự án đang xem sáng lên; dấu **▶** = dự án có video thành phẩm.
- **Mỗi dự án**: "01 TÊN DỰ ÁN", dòng đếm "4 bước · 11 hình · 2 video", hàng **CÔNG CỤ** (Blender, Substance…) và đoạn chữ.
- **Thành phẩm**: video YouTube lớn trong khung HUD cyan (tự phát, tắt tiếng khi cuộn tới — giống trang chủ). Video **dọc / Shorts**
  nằm cạnh phần chữ. Ảnh thành phẩm là dải ảnh cuộn ngang (bấm để xem to: ← → / vuốt, Esc để đóng); dự án **không có video**
  thì ảnh thành phẩm hiện to hơn.
- **Quá trình thực hiện**: các bước đánh số trên đường dọc cyan, mỗi bước có tên, chữ, 1 video (tuỳ chọn) và dải ảnh riêng
  (ví dụ: ý tưởng → dựng hình → vẽ chất liệu → ánh sáng & diễn hoạt).

## Sửa trong Studio (dễ nhất)

Chạy `node portfolio-studio/server.mjs`, mở http://localhost:4100/portfolio-studio/ → **3D Artwork**.

- **Giới thiệu**: đoạn chữ trong banner (EN / VI).
- **Thêm dự án**: bấm "+ Thêm dự án", gõ tên EN → **id** tự tạo (vd. "Blossom Fairy" → `blossom-fairy`). Id = tên thư mục ảnh và là
  "neo" của dự án (`art3d.html#blossom-fairy`). Đổi id của dự án đã có ảnh → khi Lưu, thư mục ảnh được đổi tên theo (có hỏi lại).
- **↑ ↓** đổi thứ tự dự án / video / bước, **✕** xoá (thư mục ảnh vẫn giữ trên ổ đĩa — xoá tay nếu không cần).
- **Công cụ**: gõ tên rồi Enter (kéo chip để đổi thứ tự, ✕ để bỏ).
- **Nội dung**: mỗi ô một dòng, cột EN | VI. **1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng.**
- **Video** ("+ Thêm video" trong phần Thành phẩm, hoặc ô video của từng bước): dán **link YouTube** (`youtube.com/watch?v=…`,
  `youtu.be/…`, `youtube.com/shorts/…`, `/embed/…`, `/live/…`) hoặc **id** 11 ký tự → Studio tự đổi thành id và hiện ảnh xem trước.
  Link sai → ô đỏ + báo lỗi, không Lưu được cho tới khi sửa hoặc xoá video đó. Chọn **Ngang 16:9** / **Dọc 9:16 (Shorts)** — link
  `/shorts/` tự chọn Dọc. Chú thích EN / VI (không bắt buộc) hiện dưới video. Ô video của bước để trống = bước không có video.
- **Ảnh** (ảnh thành phẩm và ảnh của từng bước): "Tải ảnh lên" (chọn nhiều ảnh, hoặc kéo thả vào khung) — ảnh JPG được nén
  ≤ 2400px, PNG có nền trong suốt giữ nguyên PNG. Kéo ảnh (hoặc ← →) để đổi thứ tự, điền chú thích EN / VI (hiện khi xem ảnh to).
  ✕ gỡ ảnh khỏi danh sách; tích "Xoá luôn file" nếu muốn xoá cả file khi Lưu.
- **Quét thư mục**: tự chép ảnh vào `Database/Art3D/images/<id dự án>/` rồi bấm nút này → ảnh mới được thêm vào danh sách
  (theo tên file), ảnh trong danh sách mà không còn file thì được đánh dấu "thiếu file". Ảnh của các bước nằm **chung thư mục** với dự án.
- **Ảnh bìa** (`cover`): chọn một ảnh của dự án làm ảnh đại diện. Bố cục hiện tại **chưa hiển thị** ảnh bìa (lưu sẵn cho sau).
- Bấm **Lưu**, rồi **Commit & Push** ở cuối trang (phạm vi `Database/Art3D`, nội dung mặc định "Update 3D artwork").

Tên trang, nhãn "Thành phẩm", "Quá trình thực hiện", "Công cụ", "{n} video"… nằm trong Studio → **Văn bản giao diện** (các khoá `a3_*`).

## Sửa tay — `Database/Art3D/data.json`

```
Database/Art3D/
├── data.json
└── images/
    ├── blossom-fairy/    render-01.jpg … concept-01.jpg, modeling-01.jpg …   (ảnh thành phẩm + ảnh các bước, chung 1 thư mục)
    ├── crystal-shrine/   …
    └── moon-garden/      …
```

```json
{
  "intro": { "en": "3D scenes and characters made in Blender…", "vi": "Các cảnh và nhân vật 3D làm bằng Blender…" },
  "projects": [
    {
      "id": "blossom-fairy",
      "name": { "en": "Blossom Fairy", "vi": "Tiên hoa" },
      "tools": ["Blender", "Substance Painter"],
      "text": { "en": "Final project of the Basic Blender course…", "vi": "Dự án cuối khoá Blender cơ bản…" },
      "final": {
        "videos": [ { "youtube": "LhaYfT7kzbg", "orientation": "landscape",
                      "caption": { "en": "Final animation", "vi": "Bản hoàn chỉnh" } } ],
        "images": [ "render-01.jpg", { "src": "render-02.jpg", "caption": { "en": "Close-up", "vi": "Cận cảnh" } } ]
      },
      "steps": [
        { "title": { "en": "Modeling", "vi": "Dựng hình" }, "text": ["Dòng 1", "Dòng 2"],
          "images": ["modeling-01.jpg"], "video": { "youtube": "FMr91afriiI" } }
      ]
    }
  ]
}
```

- **Mọi trường đều không bắt buộc.** Trống → không hiện. Dự án không có tên, chữ, thành phẩm, bước → bị bỏ; số 01, 02… chỉ đếm
  những gì đang hiện.
- `id`: chữ thường không dấu, số, gạch ngang (`a-z 0-9 -`), không trùng. `name` trống → hiện `id`.
- Ô chữ: `"..."` hoặc `{ "en": "...", "vi": "..." }` (vi trống → tiếng Anh), dùng được thẻ rich text ([RICHTEXT.md](RICHTEXT.md)).
- `text` (dự án và bước): chuỗi = đoạn văn, danh sách `[...]` = gạch đầu dòng.
- `tools`: danh sách tên công cụ.
- `final.videos`: mỗi video `{ "youtube", "orientation"?, "caption"? }`. `youtube` nhận **id** hoặc **link đầy đủ** (watch, youtu.be,
  shorts, embed, live). Link `/shorts/` mặc định là **dọc**; ghi `"orientation": "portrait"` hoặc `"landscape"` để chắc chắn.
  Link không phải YouTube → bị bỏ qua (không hiện khung đen).
- `steps[].video` (tuỳ chọn): một video cho bước đó (cùng dạng như trên).
- `final.images` và `steps[].images`: tên file trong `images/<id>/`, hoặc `{ "src", "caption" }`; link `https://…` cũng được.
- Số hình = ảnh thành phẩm + ảnh của các bước; số video = video thành phẩm + video của các bước.
- Tên file ảnh: chữ không dấu, số, `. _ -` (Studio tự đổi tên khi tải lên). Nên dùng JPG ≤ 1600–2400px, ≤ ~300 KB.

## Font tiếng Việt

Như trang 2D: tiêu đề có chữ tiếng Việt mà font Qualy thiếu (ă, ơ, ư, ĩ, ũ, các dấu chồng như ả, ạ, ế, ậ…) tự đổi sang
Montserrat đậm; tiêu đề tiếng Anh giữ nguyên Qualy.

## Nội dung hiện tại

3 dự án **demo** (chữ có ghi "Demo", ảnh giữ chỗ có chữ "DEMO · PLACEHOLDER"): **Blossom Fairy** (video thật của mục 3D Blender,
2 ảnh, 4 bước; bước cuối có video mượn từ một dự án game), **Crystal Shrine** (video dọc — id mượn từ dự án khác, thật ra là video
ngang, chỉ đánh dấu Shorts để thử bố cục dọc), **Moon Garden** (chỉ ảnh, không video). Thay bằng dự án 3D thật của bạn.
