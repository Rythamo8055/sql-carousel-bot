# 📁 Modular Carousel Template System

## Structure

```
content/templets/
├── shared/
│   ├── base.css          # All shared styles (components, typography, layout)
│   └── themes.css        # Theme variables (morning, afternoon, evening)
├── morning-news-carousel.html
├── afternoon-problem-solving-carousel.html
├── evening-devops-series-day1.html
└── README.md             # This file
```

---

## How It Works

### 1. Shared Styles (`shared/base.css`)
Contains all reusable components:
- Typography (h1, h2, subtitle)
- Badges (tag, badge-primary, badge-series, day-badge, difficulty)
- Content boxes (content-box, highlight-box)
- Lists (content-list, solution-steps)
- Code blocks with syntax highlighting
- CTA slides
- Progress bars
- Logo placement

### 2. Theme Variables (`shared/themes.css`)
Defines color schemes for each time slot:
- **Morning** (News): Blue/Cyan (#00d2ff, #3a7bd5)
- **Afternoon** (Problems): Light Blue (#4facfe, #00f2fe)
- **Evening** (Series): Pink/Purple (#f093fb, #f5576c)

### 3. Individual Carousels
Each carousel imports the shared styles and applies a theme:

```html
<link rel="stylesheet" href="shared/base.css">
<link rel="stylesheet" href="shared/themes.css">
<body class="morning">  <!-- or afternoon, evening -->
```

---

## Adding New Carousels

### Step 1: Choose a Theme
```html
<body class="morning">    <!-- Blue/Cyan theme -->
<body class="afternoon">  <!-- Light Blue theme -->
<body class="evening">    <!-- Pink/Purple theme -->
```

### Step 2: Use Available Components
```html
<!-- Badge -->
<span class="badge-primary">📰 CATEGORY</span>
<span class="badge-series">🔥 SERIES NAME</span>

<!-- Difficulty -->
<span class="difficulty easy">🟢 EASY</span>
<span class="difficulty medium">🟡 MEDIUM</span>
<span class="difficulty hard">🔴 HARD</span>

<!-- Content Box -->
<div class="content-box">
    <h3>📋 Title</h3>
    <p>Content here</p>
</div>

<!-- Highlight Box -->
<div class="highlight-box">
    <h3>💡 Title</h3>
    <p>Content here</p>
</div>

<!-- Content List -->
<ul class="content-list">
    <li>
        <span class="number">01</span>
        <span class="text"><strong>Bold text</strong> normal text</span>
    </li>
</ul>

<!-- Code Block -->
<div class="code-block"><span class="cm">// Comment</span>
<span class="kw">function</span> <span class="fn">name</span>() {}
</div>

<!-- CTA Slide -->
<div class="slide cta-slide">
    <h1>Call to <span>Action</span></h1>
    <div class="cta-button">BUTTON TEXT</div>
</div>
```

---

## Customization

### Change Accent Color
Edit `shared/themes.css`:
```css
:root.morning {
    --accent-1: #00d2ff;      /* Primary accent */
    --accent-2: #3a7bd5;      /* Secondary accent */
    --gradient-accent: linear-gradient(90deg, #00d2ff, #3a7bd5);
}
```

### Add New Theme
Add to `shared/themes.css`:
```css
:root.custom {
    --gradient-bg: linear-gradient(135deg, #...);
    --accent-1: #...;
    --accent-2: #...;
    --gradient-accent: linear-gradient(90deg, #..., #...);
    --glow-color: rgba(..., 0.15);
    --border-color: rgba(..., 0.3);
}
```

Then add overrides in the same file.

---

## Image Export

To export slides as PNG:
1. Open HTML file in browser
2. Use browser screenshot tool or Puppeteer
3. Each slide is 1080x1350px (4:5 ratio)

```bash
# Using Puppeteer
node export.js morning-news-carousel.html
```

---

## Consistency Checklist

- [ ] All carousels use shared styles
- [ ] Same fonts (Space Grotesk, Inter, Fira Code)
- [ ] Same slide dimensions (1080x1350px)
- [ ] Same border radius (20px)
- [ ] Same padding (80px)
- [ ] Same logo placement (bottom-left)
- [ ] Same slide number format (01 / 06)
