# bead-pattern-maker
# Bead Pattern Maker｜拼豆图纸生成器

A clean, responsive web app that converts uploaded images into pixel-style bead patterns.  
一个简约、响应式的网页应用，可以将上传的图片转换成像素风拼豆图纸。

Built with pure HTML, CSS, and JavaScript. No backend required. Ready to deploy on GitHub Pages.  
使用纯 HTML、CSS 和 JavaScript 构建，无需后端，可直接部署到 GitHub Pages。

---

## Preview｜项目预览

Upload an image, choose a pattern size, generate a bead pattern, view it online, and export it as PNG or PDF.  
上传图片，选择图纸尺寸，生成拼豆图纸，支持在线查看，并可导出 PNG 或 PDF。

Main visual style: white and blue, clean card layout, Instagram-inspired minimal UI.  
主视觉风格：白色与蓝色为主，卡片式布局，偏 Instagram 风的简约高级感 UI。

---

## Features｜功能特点

### Image Upload｜图片上传

- Supports PNG, JPG, and PDF upload.
- 支持上传 PNG、JPG 和 PDF 文件。

- PDF files are rendered from the first page.
- PDF 文件默认读取第一页进行转换。

- Uploaded files are previewed before generating the pattern.
- 上传后会先显示图片预览。

### Pattern Size Options｜图纸尺寸选择

Users can choose from the following pattern sizes:  
用户可以选择以下拼豆图纸尺寸：

- 32 × 32
- 64 × 64
- 96 × 96
- 128 × 128

Larger sizes preserve more image details but require more beads.  
尺寸越大，图片细节越丰富，但需要的拼豆数量也越多。

### Pattern Generation｜图纸生成

- Converts images into a pixel-grid bead pattern.
- 将图片转换成像素网格拼豆图纸。

- Automatically maps image colors to a predefined bead color palette.
- 自动将图片颜色匹配到预设拼豆色号。

- Shows color code inside each grid cell.
- 每个格子内显示对应颜色色号。

- Calculates the number of beads needed for each color.
- 自动统计每种颜色需要多少颗拼豆。

### Online Pattern Viewer｜在线查看图纸

The online viewer supports:  
在线查看页面支持：

- Zoom in and zoom out.
- 自由放大和缩小图纸。

- Reset zoom.
- 重置缩放比例。

- Flip pattern horizontally.
- 水平翻转图纸。

- Toggle grid visibility.
- 显示或隐藏网格。

- Toggle color code visibility.
- 显示或隐藏颜色色号。

- Hover over each grid cell to see color name and color code.
- 鼠标悬停在格子上时显示颜色名称和色号。

### Download｜下载图纸

Users can export the generated pattern as:  
用户可以将生成的图纸导出为：

- PNG image
- PNG 图片

- PDF file
- PDF 文件

The downloaded pattern includes:  
下载版本包含：

- Grid lines
- 网格线

- Axis numbers around the grid
- 网格周围的数字标注

- Color codes
- 颜色色号

- Color statistics
- 每个颜色色号所需数量统计

### Responsive Design｜响应式设计

- Works on desktop, tablet, and mobile devices.
- 适配电脑、平板和手机端。

- Mobile-friendly layout and controls.
- 针对移动端优化布局和按钮操作体验。

---

## Tech Stack｜技术栈

This project uses only frontend technologies:  
本项目仅使用前端技术：

- HTML5
- CSS3
- JavaScript ES6+
- Canvas API
- PDF.js
- jsPDF

No framework, no backend, no database.  
无需框架、无需后端、无需数据库。

---

## Project Structure｜项目结构

```text
bead-pattern-maker/
├── index.html
├── styles.css
├── app.js
└── README.md
