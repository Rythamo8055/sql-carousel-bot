#!/usr/bin/env node
/**
 * Regenerate SQL days 9-30 to EXACTLY match days 1-8 design.
 * Uses the exact CSS and slide structure from sql-day01-grid.html.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;

// ============ CSS VERBATIM FROM DAY 01 ============
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #d4cfc7;
    --text: #1a1a1a;
    --grid: #2563eb;
    --accent: #2563eb;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: #1a1a1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 40px;
  }

  .slide {
    width: 1080px;
    height: 1080px;
    background: var(--bg);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Blue Grid Overlay */
  .grid-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }

  .grid-overlay .vline {
    position: absolute;
    top: 0; bottom: 0;
    width: 1px;
    background: var(--grid);
    opacity: 0.25;
  }

  .grid-overlay .hline {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: var(--grid);
    opacity: 0.25;
  }

  /* Vertical 4 columns */
  .grid-overlay .vline:nth-child(1) { left: 270px; }
  .grid-overlay .vline:nth-child(2) { left: 540px; }
  .grid-overlay .vline:nth-child(3) { left: 810px; }

  /* Horizontal 5 rows */
  .grid-overlay .hline:nth-child(4) { top: 216px; }
  .grid-overlay .hline:nth-child(5) { top: 432px; }
  .grid-overlay .hline:nth-child(6) { top: 648px; }
  .grid-overlay .hline:nth-child(7) { top: 864px; }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    padding: 60px;
    display: flex;
    flex-direction: column;
  }

  /* Top bar */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
  }

  .series-tag {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    background: rgba(37, 99, 235, 0.1);
    padding: 8px 16px;
    border: 1px solid var(--accent);
  }

  .logo {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 2px;
    color: var(--text);
    text-transform: uppercase;
  }

  /* Vertical side text */
  .side-text {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--grid);
    opacity: 0.4;
    white-space: nowrap;
    z-index: 3;
  }

  /* Bookmark icon */
  .bookmark {
    position: absolute;
    bottom: 40px;
    right: 60px;
    z-index: 3;
    color: var(--text);
    font-size: 28px;
    opacity: 0.6;
  }

  .bookmark svg {
    width: 28px;
    height: 28px;
    fill: var(--text);
  }

  /* Slide number */
  .slide-number {
    position: absolute;
    bottom: 40px;
    left: 60px;
    z-index: 3;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    opacity: 0.5;
  }

  /* === SLIDE 1: COVER === */
  .slide-cover .main-title {
    font-size: 120px;
    font-weight: 900;
    line-height: 0.95;
    color: var(--text);
    margin-top: 100px;
  }

  .slide-cover .main-title .accent {
    color: var(--accent);
  }

  .slide-cover .subtitle {
    font-size: 28px;
    font-weight: 600;
    color: var(--text);
    margin-top: 40px;
    opacity: 0.7;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .slide-cover .day-block {
    position: absolute;
    bottom: 120px;
    left: 60px;
    background: var(--accent);
    color: white;
    padding: 20px 40px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .slide-cover .grid-accent-block {
    position: absolute;
    top: 80px;
    right: 100px;
    width: 200px;
    height: 200px;
    background: var(--accent);
    opacity: 0.12;
  }

  /* === SLIDE 2: DEFINITION === */
  .slide-def .section-label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 30px;
  }

  .slide-def .big-eq {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-bottom: 50px;
  }

  .slide-def .term {
    font-size: 90px;
    font-weight: 900;
    color: var(--accent);
    line-height: 1;
  }

  .slide-def .eq-sign {
    font-size: 80px;
    font-weight: 300;
    color: var(--text);
    opacity: 0.4;
  }

  .slide-def .meaning {
    font-size: 42px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
  }

  .slide-def .description {
    font-size: 22px;
    line-height: 1.7;
    color: var(--text);
    opacity: 0.65;
    max-width: 700px;
  }

  .slide-def .blue-block {
    position: absolute;
    bottom: 100px;
    right: 60px;
    width: 250px;
    height: 8px;
    background: var(--accent);
  }

  /* === SLIDE 3: WHY === */
  .slide-why .section-label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 30px;
  }

  .slide-why .heading {
    font-size: 64px;
    font-weight: 900;
    color: var(--text);
    margin-bottom: 60px;
    line-height: 1.05;
  }

  .slide-why .reason-list {
    display: flex;
    flex-direction: column;
    gap: 35px;
  }

  .slide-why .reason-item {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  .slide-why .reason-num {
    width: 56px;
    height: 56px;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .slide-why .reason-text h3 {
    font-size: 28px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 6px;
  }

  .slide-why .reason-text p {
    font-size: 18px;
    color: var(--text);
    opacity: 0.6;
    line-height: 1.5;
  }

  .slide-why .bottom-accent {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40%;
    height: 6px;
    background: var(--accent);
  }

  /* === SLIDE 4: CONTENT / TABLE === */
  .slide-db .section-label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 30px;
  }

  .slide-db .heading {
    font-size: 56px;
    font-weight: 900;
    color: var(--text);
    margin-bottom: 50px;
  }

  .slide-db .table-visual {
    width: 100%;
    max-width: 800px;
    border-collapse: collapse;
  }

  .slide-db .table-visual th {
    background: var(--accent);
    color: white;
    padding: 18px 24px;
    font-size: 16px;
    font-weight: 700;
    text-align: left;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .slide-db .table-visual td {
    padding: 16px 24px;
    font-size: 18px;
    color: var(--text);
    border-bottom: 2px solid rgba(37, 99, 235, 0.15);
    font-weight: 500;
  }

  .slide-db .table-visual tr:nth-child(even) td {
    background: rgba(37, 99, 235, 0.05);
  }

  .slide-db .caption {
    font-size: 16px;
    color: var(--text);
    opacity: 0.5;
    margin-top: 30px;
    font-style: italic;
  }

  /* === SLIDE 5: QUERY === */
  .slide-query .section-label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 30px;
  }

  .slide-query .heading {
    font-size: 52px;
    font-weight: 900;
    color: var(--text);
    margin-bottom: 50px;
    line-height: 1.1;
  }

  .slide-query .code-block {
    background: #1a1a1a;
    padding: 50px 60px;
    width: 100%;
    max-width: 820px;
    position: relative;
  }

  .slide-query .code-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--accent);
  }

  .slide-query .code-block code {
    font-family: 'Inter', monospace;
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.6;
  }

  .slide-query .code-block .keyword {
    color: var(--accent);
  }

  .slide-query .code-block .table-name {
    color: #60a5fa;
  }

  .slide-query .annotation {
    margin-top: 30px;
    font-size: 18px;
    color: var(--text);
    opacity: 0.55;
    line-height: 1.6;
  }

  .slide-query .annotation strong {
    color: var(--accent);
    opacity: 1;
  }

  /* === SLIDE 6: CTA === */
  .slide-cta .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .slide-cta .emoji-icon {
    font-size: 60px;
    margin-bottom: 40px;
  }

  .slide-cta .cta-heading {
    font-size: 72px;
    font-weight: 900;
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 30px;
  }

  .slide-cta .cta-heading .accent {
    color: var(--accent);
  }

  .slide-cta .cta-sub {
    font-size: 24px;
    color: var(--text);
    opacity: 0.6;
    margin-bottom: 50px;
    font-weight: 500;
  }

  .slide-cta .follow-btn {
    background: var(--accent);
    color: white;
    padding: 22px 60px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 4px;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
  }

  .slide-cta .grid-corner {
    position: absolute;
    bottom: 80px;
    left: 60px;
    width: 120px;
    height: 120px;
    border: 3px solid var(--accent);
    opacity: 0.2;
  }

  .slide-cta .grid-corner2 {
    position: absolute;
    top: 80px;
    right: 80px;
    width: 80px;
    height: 80px;
    background: var(--accent);
    opacity: 0.1;
  }
`;

// ============ HELPERS ============
const BOOKMARK = `<div class="bookmark"><svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg></div>`;

function overlay() {
  return `<div class="grid-overlay">
    <div class="vline"></div><div class="vline"></div><div class="vline"></div>
    <div class="hline"></div><div class="hline"></div><div class="hline"></div><div class="hline"></div>
  </div>`;
}

function chrome(tag, num, total) {
  return `${overlay()}
  <span class="side-text">SQL Tutorial Series</span>
  <div class="content">
    <div class="top-bar">
      <div class="series-tag">${tag}</div>
      <div class="logo">@yourusername</div>
    </div>`;
}

function codeHTML(lines) {
  return `<div class="code-block">
      <code>${lines.join('<br>')}</code>
    </div>`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============ SLIDE BUILDERS ============
function coverSlide(dayNum, titleHTML, subtitle, slideNum, total) {
  return `<!-- SLIDE 1: COVER -->
<div class="slide slide-cover">
  ${chrome('SQL Series', slideNum, total)}
    <div class="main-title">${titleHTML}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="day-block">Day ${dayNum}</div>
  </div>
  <div class="grid-accent-block"></div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function defSlide(tag, label, term, meaning, description, slideNum, total) {
  return `<!-- SLIDE 2: DEFINITION -->
<div class="slide slide-def">
  ${chrome(tag, slideNum, total)}
    <div class="section-label">${label}</div>
    <div class="big-eq">
      <span class="term">${term}</span>
      <span class="eq-sign">=</span>
      <span class="meaning">${meaning}</span>
    </div>
    <div class="description">${description}</div>
  </div>
  <div class="blue-block"></div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function whySlide(tag, label, heading, reasons, slideNum, total) {
  const items = reasons.map((r, i) => `
      <div class="reason-item">
        <div class="reason-num">${i + 1}</div>
        <div class="reason-text">
          <h3>${r.title}</h3>
          <p>${r.desc}</p>
        </div>
      </div>`).join('\n');
  return `<!-- SLIDE 3: WHY -->
<div class="slide slide-why">
  ${chrome(tag, slideNum, total)}
    <div class="section-label">${label}</div>
    <div class="heading">${heading}</div>
    <div class="reason-list">${items}
    </div>
  </div>
  <div class="bottom-accent"></div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function tableSlide(tag, label, heading, headers, rows, caption, slideNum, total) {
  const headHTML = headers.map(h => `<th>${h}</th>`).join('');
  const rowHTML = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('\n        ');
  return `<!-- SLIDE 4: TABLE -->
<div class="slide slide-db">
  ${chrome(tag, slideNum, total)}
    <div class="section-label">${label}</div>
    <div class="heading">${heading}</div>
    <table class="table-visual">
      <thead>
        <tr>${headHTML}</tr>
      </thead>
      <tbody>
        ${rowHTML}
      </tbody>
    </table>
    <div class="caption">${caption}</div>
  </div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function querySlide(tag, label, heading, codeLines, annotation, slideNum, total) {
  return `<!-- SLIDE 5: QUERY -->
<div class="slide slide-query">
  ${chrome(tag, slideNum, total)}
    <div class="section-label">${label}</div>
    <div class="heading">${heading}</div>
    ${codeHTML(codeLines)}
    <div class="annotation">${annotation}</div>
  </div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function ctaSlide(emoji, heading, sub, btnText, slideNum, total) {
  return `<!-- SLIDE 6: CTA -->
<div class="slide slide-cta">
  ${chrome('Stay Tuned', slideNum, total)}
    <div class="center-content">
      <div class="emoji-icon">${emoji}</div>
      <div class="cta-heading">${heading}</div>
      <div class="cta-sub">${sub}</div>
      <button class="follow-btn">${btnText}</button>
    </div>
  </div>
  <div class="grid-corner"></div>
  <div class="grid-corner2"></div>
  ${BOOKMARK}
  <div class="slide-number">${slideNum} / ${total}</div>
</div>`;
}

function buildDay(dayNum, data) {
  const d = String(dayNum).padStart(2, '0');
  const total = data.totalSlides || 6;
  const slides = [coverSlide(d, data.coverTitle, data.coverSub, '01', total)];
  slides.push(defSlide(data.def.tag, data.def.label, data.def.term, data.def.meaning, data.def.desc, '02', total));
  slides.push(whySlide(data.why.tag, data.why.label, data.why.heading, data.why.reasons, '03', total));
  if (data.table) {
    slides.push(tableSlide(data.table.tag, data.table.label, data.table.heading, data.table.headers, data.table.rows, data.table.caption, '04', total));
  } else {
    slides.push(whySlide(data.extra.tag, data.extra.label, data.extra.heading, data.extra.reasons, '04', total));
  }
  slides.push(querySlide(data.query.tag, data.query.label, data.query.heading, data.query.code, data.query.annotation, '05', total));
  slides.push(ctaSlide(data.cta.emoji, data.cta.heading, data.cta.sub, data.cta.btn, '06', total));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SQL Day ${d} - ${data.title} | Instagram Carousel</title>
<style>${CSS}
</style>
</head>
<body>

${slides.join('\n\n')}

</body>
</html>
`;
  const file = path.join(OUT_DIR, `sql-day${d}-grid.html`);
  fs.writeFileSync(file, html);
  console.log(`✅ sql-day${d}-grid.html (${data.title})`);
}

// ============ CONTENT DATA (DAYS 1-8) ============
const daysFirst = [
  {
    title: 'What is SQL?', coverTitle: 'What is<br><span class="accent">SQL</span>?', coverSub: 'The Language of Databases',
    def: { tag: 'Definition', label: 'What does it stand for?', term: 'SQL', meaning: 'Structured<br>Query Language', desc: 'SQL is the standard programming language used to communicate with, manipulate, and manage data stored in relational databases.' },
    why: { tag: 'Why Learn It', label: 'The case for SQL', heading: 'Why SQL<br>matters', reasons: [
      { title: 'Universal Language', desc: 'Used across PostgreSQL, MySQL, SQL Server, SQLite & more' },
      { title: 'In-Demand Skill', desc: 'Required in 60%+ of data & analyst job postings' },
      { title: 'Powers Everything', desc: 'From apps to analytics — SQL runs the data world' }
    ]},
    query: { tag: 'Your First Query', label: "Let's write some SQL", heading: 'Select everything<br>from a table', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>;'], annotation: '<strong>*</strong> means all columns. This query returns every row and column from the <strong>users</strong> table.' },
    cta: { emoji: '&#128218;', heading: 'Day 1 <span class="accent">Done</span>', sub: 'Day 2: SELECT Basics drops next', btn: 'Follow for Day 2' }
  },
  {
    title: 'SELECT Basics', coverTitle: 'SELECT<br><span class="accent">Basics</span>', coverSub: 'Retrieving Data from Tables',
    def: { tag: 'Definition', label: 'What is SELECT?', term: 'SELECT', meaning: 'Read data<br>from tables', desc: 'SELECT is the most-used SQL command. It reads data from a table — all columns, specific columns, or filtered rows.' },
    why: { tag: 'Why It Matters', label: 'The fundamentals', heading: 'Read like<br>a pro', reasons: [
      { title: 'SELECT *', desc: 'Grab every column — quick, but heavy' },
      { title: 'SELECT columns', desc: 'Pick only what you need — faster queries' },
      { title: 'With WHERE', desc: 'Add conditions to read only matching rows' }
    ]},
    query: { tag: 'In Practice', label: 'Pick your columns', heading: 'Only what<br>you need', code: ['<span class="keyword">SELECT</span> name, email', '<span class="keyword">FROM</span> <span class="table-name">users</span>;'], annotation: 'List column names separated by <strong>commas</strong>. Only those columns are returned — more efficient than <strong>*</strong>.' },
    cta: { emoji: '&#128218;', heading: 'Day 2 <span class="accent">Done</span>', sub: 'Day 3: WHERE Clauses drops next', btn: 'Follow for Day 3' }
  },
  {
    title: 'WHERE Clauses', coverTitle: 'WHERE<br><span class="accent">Clauses</span>', coverSub: 'Filtering Data Like a Pro',
    def: { tag: 'Definition', label: 'What is WHERE?', term: 'WHERE', meaning: 'Filter rows<br>by condition', desc: 'WHERE filters rows before they are returned. Only rows that match the condition appear in the result.' },
    why: { tag: 'Key Concepts', label: 'Comparison operators', heading: 'Filter like<br>a pro', reasons: [
      { title: '= Equal', desc: 'WHERE role = \'Admin\' — exact match' },
      { title: '> < >= <=', desc: 'WHERE age > 25 — numeric comparisons' },
      { title: '<> Not equal', desc: 'WHERE status <> \'banned\' — exclude values' }
    ]},
    query: { tag: 'In Practice', label: 'Filter your data', heading: 'Admins only', code: ['<span class="keyword">SELECT</span> name, role', '<span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> role = <span class="table-name">\'admin\'</span>;'], annotation: '<strong>WHERE</strong> keeps only rows matching the condition. Think of it as a funnel for your data.' },
    cta: { emoji: '&#128269;', heading: 'Day 3 <span class="accent">Done</span>', sub: 'Day 4: ORDER BY drops next', btn: 'Follow for Day 4' }
  },
  {
    title: 'ORDER BY', coverTitle: 'ORDER<br><span class="accent">BY</span>', coverSub: 'Sorting Your Query Results',
    def: { tag: 'Definition', label: 'What is ORDER BY?', term: 'ORDER BY', meaning: 'Sort results<br>by column', desc: 'ORDER BY sorts the result set — ascending (A→Z, 0→9) by default, or descending with DESC.' },
    why: { tag: 'Key Concepts', label: 'Sort directions', heading: 'Sort it<br>your way', reasons: [
      { title: 'ASC', desc: 'Ascending — A to Z, 0 to 9, oldest to newest' },
      { title: 'DESC', desc: 'Descending — Z to A, 9 to 0, newest to oldest' },
      { title: 'Multiple columns', desc: 'ORDER BY role ASC, name DESC — left to right' }
    ]},
    query: { tag: 'In Practice', label: 'Sort your data', heading: 'Newest<br>first', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">ORDER BY</span> id <span class="keyword">DESC</span>;'], annotation: '<strong>DESC</strong> shows the most recent records first — like a news feed or leaderboard.' },
    cta: { emoji: '&#128202;', heading: 'Day 4 <span class="accent">Done</span>', sub: 'Day 5: LIMIT & OFFSET drops next', btn: 'Follow for Day 5' }
  },
  {
    title: 'LIMIT & OFFSET', coverTitle: 'LIMIT &<br><span class="accent">OFFSET</span>', coverSub: 'Control How Many Rows You Get',
    def: { tag: 'Definition', label: 'What are they?', term: 'LIMIT', meaning: 'Cap how many<br>rows return', desc: 'LIMIT caps the number of rows returned. OFFSET skips rows first — together they power pagination everywhere.' },
    why: { tag: 'Key Concepts', label: 'How they work', heading: 'Page your<br>data', reasons: [
      { title: 'LIMIT n', desc: 'Return only the first n rows' },
      { title: 'OFFSET n', desc: 'Skip the first n rows, then return' },
      { title: 'Top N queries', desc: 'LIMIT 10 with ORDER BY = top 10 list' }
    ]},
    query: { tag: 'In Practice', label: 'Page through', heading: 'Page 2 of<br>results', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">ORDER BY</span> id', '<span class="keyword">LIMIT</span> 10 <span class="keyword">OFFSET</span> 10;'], annotation: 'Skips 10 rows, returns the next 10 — exactly how <strong>page 2</strong> of a feed loads.' },
    cta: { emoji: '&#128200;', heading: 'Day 5 <span class="accent">Done</span>', sub: 'Day 6: INSERT INTO drops next', btn: 'Follow for Day 6' }
  },
  {
    title: 'INSERT INTO', coverTitle: 'INSERT<br><span class="accent">INTO</span>', coverSub: 'Adding Data to Your Tables',
    def: { tag: 'Definition', label: 'What is INSERT?', term: 'INSERT', meaning: 'Add rows<br>to a table', desc: 'INSERT adds new rows to a table — one row at a time or many at once. Every signup form runs an INSERT.' },
    why: { tag: 'Key Concepts', label: 'Insert styles', heading: 'Add data<br>your way', reasons: [
      { title: 'Single row', desc: 'INSERT INTO users (name, email) VALUES (\'Alice\', \'a@mail.com\')' },
      { title: 'Multiple rows', desc: 'One statement, several VALUES groups — bulk insert' },
      { title: 'Column list', desc: 'Specify columns so you control exactly what is stored' }
    ]},
    query: { tag: 'In Practice', label: 'Add a user', heading: 'Sign up a<br>new user', code: ['<span class="keyword">INSERT INTO</span> <span class="table-name">users</span> (name, email)', '<span class="keyword">VALUES</span> (<span class="table-name">\'Alice\'</span>, <span class="table-name">\'alice@mail.com\'</span>);'], annotation: 'Column names match the VALUES order. The database assigns id automatically.' },
    cta: { emoji: '&#10133;', heading: 'Day 6 <span class="accent">Done</span>', sub: 'Day 7: UPDATE Statements drops next', btn: 'Follow for Day 7' }
  },
  {
    title: 'UPDATE Statements', coverTitle: 'UPDATE<br><span class="accent">Statements</span>', coverSub: 'Modifying Existing Data',
    def: { tag: 'Definition', label: 'What is UPDATE?', term: 'UPDATE', meaning: 'Change rows<br>in a table', desc: 'UPDATE changes values in existing rows. Always pair it with WHERE — without one, it updates EVERY row.' },
    why: { tag: 'Key Concepts', label: 'Update rules', heading: 'Edit like<br>a pro', reasons: [
      { title: 'SET column = value', desc: 'Define what changes and to what' },
      { title: 'WHERE is critical', desc: 'Without WHERE, every row gets updated!' },
      { title: 'Multiple columns', desc: 'SET a = 1, b = 2 — update several at once' }
    ]},
    query: { tag: 'In Practice', label: 'Update a row', heading: 'Change a<br>user role', code: ['<span class="keyword">UPDATE</span> <span class="table-name">users</span>', '<span class="keyword">SET</span> role = <span class="table-name">\'admin\'</span>', '<span class="keyword">WHERE</span> id = 1;'], annotation: 'Only the row with <strong>id = 1</strong> changes. The WHERE clause makes updates safe.' },
    cta: { emoji: '&#9999;&#65039;', heading: 'Day 7 <span class="accent">Done</span>', sub: 'Day 8: DELETE Statements drops next', btn: 'Follow for Day 8' }
  },
  {
    title: 'DELETE Statements', coverTitle: 'DELETE<br><span class="accent">Statements</span>', coverSub: 'Removing Data Safely',
    def: { tag: 'Definition', label: 'What is DELETE?', term: 'DELETE', meaning: 'Remove rows<br>from a table', desc: 'DELETE removes rows permanently. Like UPDATE, it needs WHERE — without it, you delete the entire table.' },
    why: { tag: 'Key Concepts', label: 'Delete safely', heading: 'Remove with<br>care', reasons: [
      { title: 'Always use WHERE', desc: 'DELETE FROM users WHERE id = 3 — target one row' },
      { title: 'Test with SELECT', desc: 'Run SELECT first to confirm which rows match' },
      { title: 'TRUNCATE vs DELETE', desc: 'TRUNCATE clears all rows instantly; DELETE is row-by-row' }
    ]},
    query: { tag: 'In Practice', label: 'Delete a row', heading: 'Remove a<br>spam account', code: ['<span class="keyword">DELETE FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> id = 3;'], annotation: 'Only row <strong>id = 3</strong> is removed. No WHERE = all rows gone. Always double-check!' },
    cta: { emoji: '&#128465;&#65039;', heading: 'Day 8 <span class="accent">Done</span>', sub: 'Day 9: Data Types drops next', btn: 'Follow for Day 9' }
  }
];

// ============ CONTENT DATA (DAYS 9-30) ============
const days = [
  {
    title: 'Data Types', coverTitle: 'Data<br><span class="accent">Types</span>', coverSub: 'Choosing the right type for every column',
    def: { tag: 'Definition', label: 'What are they?', term: 'DATA<br>TYPES', meaning: 'Column types<br>that define values', desc: 'Every column in a table has a data type — it tells the database what kind of value it can hold: numbers, text, dates, or booleans.' },
    why: { tag: 'The Categories', label: 'Three families', heading: 'Pick the<br>right type', reasons: [
      { title: 'Numeric Types', desc: 'INT, BIGINT, FLOAT, DECIMAL — for whole numbers, decimals & money' },
      { title: 'String Types', desc: 'VARCHAR, CHAR, TEXT — for names, emails, descriptions' },
      { title: 'Date & Time', desc: 'DATE, TIME, TIMESTAMP — for birthdays, logs, deadlines' }
    ]},
    table: { tag: 'Building Blocks', label: 'Common types', heading: 'Types at a glance', headers: ['Type', 'Use for', 'Example'], rows: [['INT', 'Whole numbers', 'id, age, stock'], ['DECIMAL', 'Exact money', 'price 10,2'], ['VARCHAR', 'Variable text', 'name(100)'], ['TIMESTAMP', 'Date & time', 'created_at']], caption: 'Choose the smallest type that fits your data.' },
    query: { tag: 'Your First Query', label: 'In practice', heading: 'Create a table<br>with types', code: ['<span class="keyword">CREATE TABLE</span> <span class="table-name">products</span> (', '&nbsp;&nbsp;id <span class="table-name">INT</span>,', '&nbsp;&nbsp;price <span class="table-name">DECIMAL</span>(10, 2),', '&nbsp;&nbsp;stock <span class="table-name">INT</span>', ');'], annotation: 'Each column declares its type: <strong>INT</strong> for id, <strong>DECIMAL(10,2)</strong> for money, <strong>INT</strong> for stock.' },
    cta: { emoji: '&#128218;', heading: 'Day 9 <span class="accent">Done</span>', sub: 'Day 10: NULL Values drops next', btn: 'Follow for Day 10' }
  },
  {
    title: 'NULL Values', coverTitle: 'NULL<br><span class="accent">Values</span>', coverSub: 'The missing data mystery in SQL',
    def: { tag: 'Definition', label: 'What does it mean?', term: 'NULL', meaning: 'No value —<br>unknown data', desc: 'NULL means "no value" or "unknown." It is NOT zero, NOT an empty string — it is the complete absence of data.' },
    why: { tag: 'Key Concepts', label: 'Handle missing data', heading: 'NULL is<br>special', reasons: [
      { title: 'IS NULL', desc: 'Find rows where a column has no value' },
      { title: 'IS NOT NULL', desc: 'Find rows that DO have a value' },
      { title: 'COALESCE()', desc: 'Return the first non-NULL value from a list' }
    ]},
    query: { tag: 'Handling NULL', label: 'In practice', heading: 'Query rows<br>with no value', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> phone <span class="keyword">IS NULL</span>;'], annotation: 'You cannot use <strong>= NULL</strong> — NULL = NULL evaluates to UNKNOWN. Always use <strong>IS NULL</strong>.' },
    cta: { emoji: '&#10067;', heading: 'Day 10 <span class="accent">Done</span>', sub: 'Day 11: AND / OR / NOT drops next', btn: 'Follow for Day 11' }
  },
  {
    title: 'AND / OR / NOT', coverTitle: 'AND / OR /<br><span class="accent">NOT</span>', coverSub: 'Combine conditions like a pro',
    def: { tag: 'Definition', label: 'What are they?', term: 'LOGIC', meaning: 'Combine<br>conditions', desc: 'Logical operators let you combine multiple conditions in a WHERE clause to build precise filters.' },
    why: { tag: 'Key Concepts', label: 'The three operators', heading: 'Combine<br>conditions', reasons: [
      { title: 'AND', desc: 'All conditions must be true — narrows results' },
      { title: 'OR', desc: 'At least one condition true — widens results' },
      { title: 'NOT', desc: 'Reverses a condition — excludes matches' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Filter users<br>by multiple rules', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> (age >= 18 <span class="keyword">AND</span> country = <span class="table-name">\'IN\'</span>)', '&nbsp;&nbsp;<span class="keyword">OR</span> (role = <span class="table-name">\'admin\'</span> <span class="keyword">AND NOT</span> banned);'], annotation: 'Parentheses control priority — <strong>AND</strong> is evaluated before <strong>OR</strong>. Use them to group logic.' },
    cta: { emoji: '&#128269;', heading: 'Day 11 <span class="accent">Done</span>', sub: 'Day 12: IN & BETWEEN drops next', btn: 'Follow for Day 12' }
  },
  {
    title: 'IN & BETWEEN', coverTitle: 'IN &<br><span class="accent">BETWEEN</span>', coverSub: 'Cleaner filters for multiple values & ranges',
    def: { tag: 'Definition', label: 'What are they?', term: 'RANGE', meaning: 'Match lists<br>and ranges', desc: 'IN matches a value against a list of options. BETWEEN matches a value inside an inclusive range. Both make queries cleaner and faster to read.' },
    why: { tag: 'Key Concepts', label: 'Two clean filters', heading: 'Cleaner<br>filtering', reasons: [
      { title: 'IN', desc: 'WHERE country IN (\'IN\', \'US\', \'UK\') — matches any listed value' },
      { title: 'NOT IN', desc: 'Excludes rows that match any value in the list' },
      { title: 'BETWEEN', desc: 'WHERE total BETWEEN 100 AND 500 — inclusive range' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Replace long<br>OR chains', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">orders</span>', '<span class="keyword">WHERE</span> region <span class="keyword">IN</span> (<span class="table-name">\'APAC\'</span>, <span class="table-name">\'EU\'</span>)', '&nbsp;&nbsp;<span class="keyword">AND</span> amount <span class="keyword">BETWEEN</span> 1000 <span class="keyword">AND</span> 10000;'], annotation: 'One clean query instead of a long chain of <strong>OR</strong> conditions. BETWEEN includes both end values.' },
    cta: { emoji: '&#128202;', heading: 'Day 12 <span class="accent">Done</span>', sub: 'Day 13: LIKE Pattern drops next', btn: 'Follow for Day 13' }
  },
  {
    title: 'LIKE Pattern', coverTitle: 'LIKE<br><span class="accent">Pattern</span>', coverSub: 'Flexible text matching with wildcards',
    def: { tag: 'Definition', label: 'What is it?', term: 'LIKE', meaning: 'Pattern<br>matching', desc: 'LIKE searches text using wildcards — perfect for search bars, filters, and finding partial matches in strings.' },
    why: { tag: 'Key Concepts', label: 'The two wildcards', heading: 'Match any<br>text pattern', reasons: [
      { title: '% Wildcard', desc: 'Matches any number of characters — \'J%\' finds names starting with J' },
      { title: '_ Wildcard', desc: 'Matches exactly ONE character — \'_a_\' finds 3-letter names with a in middle' },
      { title: 'Combined', desc: 'Use both together: \'%son\' finds anything ending with "son"' }
    ]},
    query: { tag: 'In Practice', label: 'Real examples', heading: 'Search like<br>a pro', code: ['<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> email <span class="keyword">LIKE</span> <span class="table-name">\'%@gmail.com\'</span>;', '', '<span class="keyword">WHERE</span> name <span class="keyword">LIKE</span> <span class="table-name">\'%rahul%\'</span>;'], annotation: '<strong>%</strong> = any characters. <strong>_</strong> = exactly one. Use LIKE for flexible text searches.' },
    cta: { emoji: '&#128269;', heading: 'Day 13 <span class="accent">Done</span>', sub: 'Day 14: Aggregate Functions drops next', btn: 'Follow for Day 14' }
  },
  {
    title: 'Aggregate Functions', coverTitle: 'Aggregate<br><span class="accent">Functions</span>', coverSub: 'Summarize data with powerful built-ins',
    def: { tag: 'Definition', label: 'What are they?', term: 'AGGREGATE', meaning: 'Summarize many<br>rows into one', desc: 'Aggregate functions take many rows and return a single summary value — counts, totals, averages, and extremes.' },
    why: { tag: 'Key Concepts', label: 'The five functions', heading: 'Summarize<br>your data', reasons: [
      { title: 'COUNT()', desc: 'Count rows — COUNT(*), COUNT(email), COUNT(DISTINCT country)' },
      { title: 'SUM() & AVG()', desc: 'Add values or find the average across rows' },
      { title: 'MIN() & MAX()', desc: 'Find the smallest or largest value — prices, dates' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Revenue<br>summary', code: ['<span class="keyword">SELECT</span>', '&nbsp;&nbsp;<span class="table-name">SUM</span>(total) <span class="keyword">AS</span> revenue,', '&nbsp;&nbsp;<span class="table-name">AVG</span>(total) <span class="keyword">AS</span> avg_order', '<span class="keyword">FROM</span> <span class="table-name">orders</span>', '<span class="keyword">WHERE</span> status = <span class="table-name">\'completed\'</span>;'], annotation: '<strong>SUM</strong> adds the total column, <strong>AVG</strong> finds the average order. Aggregates ignore NULL values.' },
    cta: { emoji: '&#128202;', heading: 'Day 14 <span class="accent">Done</span>', sub: 'Day 15: GROUP BY drops next', btn: 'Follow for Day 15' }
  },
  {
    title: 'GROUP BY', coverTitle: 'GROUP<br><span class="accent">BY</span>', coverSub: 'Split data into groups, then summarize',
    def: { tag: 'Definition', label: 'What is it?', term: 'GROUP BY', meaning: 'Group rows, then<br>aggregate per group', desc: 'GROUP BY splits your data into groups based on a column, then lets you run aggregate functions on each group separately.' },
    why: { tag: 'Key Concepts', label: 'How it works', heading: 'Group &<br>summarize', reasons: [
      { title: 'GROUP BY + COUNT', desc: 'Count users per country — one row per group' },
      { title: 'HAVING clause', desc: 'Filter groups AFTER aggregation — WHERE filters before' },
      { title: 'Multiple columns', desc: 'GROUP BY country, role — subgroups for deeper analysis' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Users per<br>country', code: ['<span class="keyword">SELECT</span> country, <span class="table-name">COUNT</span>(*) <span class="keyword">AS</span> users', '<span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">GROUP BY</span> country', '<span class="keyword">HAVING</span> <span class="table-name">COUNT</span>(*) > 50;'], annotation: '<strong>GROUP BY</strong> groups rows, <strong>HAVING</strong> filters the groups. Only countries with 50+ users appear.' },
    cta: { emoji: '&#128202;', heading: 'Day 15 <span class="accent">Done</span>', sub: 'Day 16: JOIN Basics drops next', btn: 'Follow for Day 16' }
  },
  {
    title: 'JOIN Basics', coverTitle: 'JOIN<br><span class="accent">Basics</span>', coverSub: 'Combine data from multiple tables',
    def: { tag: 'Definition', label: 'What is a JOIN?', term: 'JOIN', meaning: 'Combine rows from<br>two or more tables', desc: 'A JOIN combines rows from two tables using a related column — usually a primary key matching a foreign key.' },
    why: { tag: 'Key Concepts', label: 'Why JOINs matter', heading: 'Connect<br>your tables', reasons: [
      { title: 'Combine horizontally', desc: 'Add columns from another table — orders + customer names' },
      { title: 'Use key relationships', desc: 'ON orders.customer_id = customers.id — the linking column' },
      { title: 'Essential for real apps', desc: 'Relational databases are built around JOINs' }
    ]},
    query: { tag: 'In Practice', label: 'First JOIN', heading: 'Orders with<br>customer names', code: ['<span class="keyword">SELECT</span> orders.id, customers.name', '<span class="keyword">FROM</span> <span class="table-name">orders</span>', '<span class="keyword">INNER JOIN</span> <span class="table-name">customers</span>', '<span class="keyword">ON</span> orders.customer_id = customers.id;'], annotation: '<strong>INNER JOIN</strong> returns only matching rows. The <strong>ON</strong> clause defines how the tables relate.' },
    cta: { emoji: '&#129309;', heading: 'Day 16 <span class="accent">Done</span>', sub: 'Day 17: LEFT JOIN drops next', btn: 'Follow for Day 17' }
  },
  {
    title: 'LEFT JOIN', coverTitle: 'LEFT<br><span class="accent">JOIN</span>', coverSub: 'Keep all rows from the left table',
    def: { tag: 'Definition', label: 'What is LEFT JOIN?', term: 'LEFT JOIN', meaning: 'All left rows +<br>matching right rows', desc: 'LEFT JOIN returns every row from the left table, plus matching rows from the right table. Unmatched right values become NULL.' },
    why: { tag: 'Key Concepts', label: 'The JOIN family', heading: 'Choose your<br>JOIN', reasons: [
      { title: 'LEFT JOIN', desc: 'All rows from left table, matching rows from right' },
      { title: 'RIGHT JOIN', desc: 'All rows from right table, matching rows from left' },
      { title: 'FULL JOIN', desc: 'All rows from both tables, NULLs where no match' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'All users with<br>their orders', code: ['<span class="keyword">SELECT</span> users.name, orders.total', '<span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">LEFT JOIN</span> <span class="table-name">orders</span>', '<span class="keyword">ON</span> users.id = orders.user_id;'], annotation: 'Every user appears even without orders — <strong>order columns are NULL</strong> for users with no orders.' },
    cta: { emoji: '&#8592;', heading: 'Day 17 <span class="accent">Done</span>', sub: 'Day 18: Multiple JOINs drops next', btn: 'Follow for Day 18' }
  },
  {
    title: 'Multiple JOINs', coverTitle: 'Multiple<br><span class="accent">JOINs</span>', coverSub: 'Chain three or more tables together',
    def: { tag: 'Definition', label: 'What are they?', term: 'MULTI-JOIN', meaning: 'Join 3+ tables<br>in one query', desc: 'Real apps need data from many tables. You chain JOINs one after another to connect three, four, or more tables.' },
    why: { tag: 'Key Concepts', label: 'How to do it', heading: 'Chain your<br>JOINs', reasons: [
      { title: 'Start with the main table', desc: 'The core entity — orders, users, products' },
      { title: 'Add JOINs one by one', desc: 'Each JOIN connects one more related table' },
      { title: 'Use aliases', desc: 'Short names (o, c, p) keep long queries readable' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Orders, customers<br>& products', code: ['<span class="keyword">SELECT</span> o.id, c.name, p.title', '<span class="keyword">FROM</span> <span class="table-name">orders</span> o', '<span class="keyword">JOIN</span> <span class="table-name">customers</span> c <span class="keyword">ON</span> o.customer_id = c.id', '<span class="keyword">JOIN</span> <span class="table-name">products</span> p <span class="keyword">ON</span> o.product_id = p.id;'], annotation: 'Two JOINs, three tables. Aliases <strong>o, c, p</strong> keep the query clean. Star schemas work this way.' },
    cta: { emoji: '&#128279;', heading: 'Day 18 <span class="accent">Done</span>', sub: 'Day 19: Subqueries drops next', btn: 'Follow for Day 19' }
  },
  {
    title: 'Subqueries', coverTitle: 'Sub-<br><span class="accent">queries</span>', coverSub: 'Nest queries inside queries',
    def: { tag: 'Definition', label: 'What is a subquery?', term: 'SUBQUERY', meaning: 'A query inside<br>another query', desc: 'A subquery is a full SELECT statement nested inside another query — usually in WHERE, FROM, or SELECT clauses. It runs first.' },
    why: { tag: 'Key Concepts', label: 'How they work', heading: 'Query the<br>query', reasons: [
      { title: 'Runs first', desc: 'The inner query executes, then the outer query uses its result' },
      { title: 'Returns values', desc: 'Single value, a list, or an entire table' },
      { title: 'Three placements', desc: 'WHERE (filter), FROM (source), SELECT (compute)' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Users who<br>placed orders', code: ['<span class="keyword">SELECT</span> name <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> id <span class="keyword">IN</span> (', '&nbsp;&nbsp;<span class="keyword">SELECT</span> user_id <span class="keyword">FROM</span> <span class="table-name">orders</span>', ');'], annotation: 'The inner query returns all user_ids with orders; the outer query filters users. <strong>IN</strong> checks membership.' },
    cta: { emoji: '&#128640;', heading: 'Day 19 <span class="accent">Done</span>', sub: 'Day 20: UNION & UNION ALL drops next', btn: 'Follow for Day 20' }
  },
  {
    title: 'UNION & UNION ALL', coverTitle: 'UNION &<br><span class="accent">UNION ALL</span>', coverSub: 'Combine result sets vertically',
    def: { tag: 'Definition', label: 'What are they?', term: 'UNION', meaning: 'Stack results<br>from two queries', desc: 'UNION stacks the results of two SELECT statements into one list — vertically. UNION removes duplicates, UNION ALL keeps everything.' },
    why: { tag: 'Key Concepts', label: 'The difference', heading: 'Merge result<br>sets', reasons: [
      { title: 'UNION', desc: 'Combines results and removes duplicate rows' },
      { title: 'UNION ALL', desc: 'Combines results and keeps ALL rows — faster' },
      { title: 'Same columns', desc: 'Both queries must have the same number of columns' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Merge two<br>user lists', code: ['<span class="keyword">SELECT</span> name <span class="keyword">FROM</span> <span class="table-name">customers</span>', '<span class="keyword">UNION ALL</span>', '<span class="keyword">SELECT</span> name <span class="keyword">FROM</span> <span class="table-name">employees</span>;'], annotation: '<strong>UNION ALL</strong> keeps duplicates and is faster. Use <strong>UNION</strong> when you need unique results only.' },
    cta: { emoji: '&#128256;', heading: 'Day 20 <span class="accent">Done</span>', sub: 'Day 21: Aliases drops next', btn: 'Follow for Day 21' }
  },
  {
    title: 'Aliases', coverTitle: 'Alias<br><span class="accent">es</span>', coverSub: 'Rename for cleaner, readable queries',
    def: { tag: 'Definition', label: 'What is an alias?', term: 'ALIAS', meaning: 'A temporary<br>name', desc: 'An alias gives a table or column a temporary new name for that query only — making SQL shorter and results more readable.' },
    why: { tag: 'Key Concepts', label: 'Two kinds', heading: 'Rename<br>anything', reasons: [
      { title: 'Table aliases', desc: 'FROM users u — shortens the name for the whole query' },
      { title: 'Column aliases', desc: 'SELECT name AS full_name — renames output columns' },
      { title: 'Calculated fields', desc: 'AS revenue for SUM(total) — names your computed values' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Clean JOIN<br>with aliases', code: ['<span class="keyword">SELECT</span> u.name <span class="keyword">AS</span> username,', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o.total <span class="keyword">AS</span> order_total', '<span class="keyword">FROM</span> <span class="table-name">users</span> u', '<span class="keyword">JOIN</span> <span class="table-name">orders</span> o <span class="keyword">ON</span> u.id = o.user_id;'], annotation: 'Aliases make results readable: <strong>username</strong> and <strong>order_total</strong> instead of u.name and o.total.' },
    cta: { emoji: '&#127991;', heading: 'Day 21 <span class="accent">Done</span>', sub: 'Day 22: CASE Statements drops next', btn: 'Follow for Day 22' }
  },
  {
    title: 'CASE Statements', coverTitle: 'CASE<br><span class="accent">Statements</span>', coverSub: 'IF-THEN-ELSE logic in SQL',
    def: { tag: 'Definition', label: 'What is CASE?', term: 'CASE', meaning: 'Conditional logic<br>in queries', desc: 'CASE is SQL\'s version of if-else. It evaluates conditions and returns different values depending on the result.' },
    why: { tag: 'Key Concepts', label: 'Three flavors', heading: 'Add logic<br>to data', reasons: [
      { title: 'Simple CASE', desc: 'Compare a column against specific values' },
      { title: 'Searched CASE', desc: 'Evaluate multiple conditions in sequence' },
      { title: 'Nested CASE', desc: 'CASE inside CASE for complex logic' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Grade student<br>scores', code: ['<span class="keyword">SELECT</span> name,', '<span class="keyword">CASE</span>', '&nbsp;&nbsp;<span class="keyword">WHEN</span> score >= 90 <span class="keyword">THEN</span> <span class="table-name">\'A\'</span>', '&nbsp;&nbsp;<span class="keyword">WHEN</span> score >= 75 <span class="keyword">THEN</span> <span class="table-name">\'B\'</span>', '&nbsp;&nbsp;<span class="keyword">ELSE</span> <span class="table-name">\'F\'</span>', '<span class="keyword">END</span> <span class="keyword">AS</span> grade', '<span class="keyword">FROM</span> <span class="table-name">students</span>;'], annotation: '<strong>WHEN</strong> checks each condition in order, <strong>ELSE</strong> is the fallback. Use CASE for labels, tiers & cleaning.' },
    cta: { emoji: '&#129504;', heading: 'Day 22 <span class="accent">Done</span>', sub: 'Day 23: Date Functions drops next', btn: 'Follow for Day 23' }
  },
  {
    title: 'Date Functions', coverTitle: 'Date<br><span class="accent">Functions</span>', coverSub: 'Time-based analysis and reporting',
    def: { tag: 'Definition', label: 'What are they?', term: 'DATES', meaning: 'Work with<br>time data', desc: 'Date functions let you get the current time, format dates, extract parts, and calculate differences — essential for analytics.' },
    why: { tag: 'Key Concepts', label: 'The core functions', heading: 'Master<br>dates', reasons: [
      { title: 'NOW() / CURDATE()', desc: 'Current timestamp or current date' },
      { title: 'DATE_FORMAT()', desc: 'Format dates into readable strings for reports' },
      { title: 'DATEDIFF()', desc: 'Days between two dates — ages, tenure, expiry' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Format &<br>calculate dates', code: ['<span class="keyword">SELECT</span>', '&nbsp;&nbsp;<span class="table-name">DATE_FORMAT</span>(created_at, <span class="table-name">\'%Y-%m\'</span>) <span class="keyword">AS</span> month,', '&nbsp;&nbsp;<span class="table-name">COUNT</span>(*) <span class="keyword">AS</span> orders', '<span class="keyword">FROM</span> <span class="table-name">orders</span>', '<span class="keyword">GROUP BY</span> month;'], annotation: 'Group orders by month for monthly reports. <strong>%Y-%m</strong> formats as 2026-08. Great for analytics.' },
    cta: { emoji: '&#128197;', heading: 'Day 23 <span class="accent">Done</span>', sub: 'Day 24: String Functions drops next', btn: 'Follow for Day 24' }
  },
  {
    title: 'String Functions', coverTitle: 'String<br><span class="accent">Functions</span>', coverSub: 'Transform and manipulate text',
    def: { tag: 'Definition', label: 'What are they?', term: 'STRINGS', meaning: 'Manipulate<br>text data', desc: 'String functions help you merge, extract, clean, and transform text — from building full names to cleaning messy data.' },
    why: { tag: 'Key Concepts', label: 'The core functions', heading: 'Text<br>superpowers', reasons: [
      { title: 'CONCAT()', desc: 'Merge strings — first + last name into full name' },
      { title: 'SUBSTRING()', desc: 'Extract a portion of text — a slice of a string' },
      { title: 'UPPER / LOWER / LENGTH', desc: 'Change case or count characters' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Build a<br>full name', code: ['<span class="keyword">SELECT</span>', '&nbsp;&nbsp;<span class="table-name">CONCAT</span>(first_name, <span class="table-name">\' \'</span>, last_name)', '&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">AS</span> full_name', '<span class="keyword">FROM</span> <span class="table-name">users</span>;'], annotation: '<strong>CONCAT</strong> joins strings with a space. Clean display names from separate columns in one query.' },
    cta: { emoji: '&#9999;&#65039;', heading: 'Day 24 <span class="accent">Done</span>', sub: 'Day 25: Window Functions drops next', btn: 'Follow for Day 25' }
  },
  {
    title: 'Window Functions', coverTitle: 'Window<br><span class="accent">Functions</span>', coverSub: 'Advanced analytics across related rows',
    def: { tag: 'Definition', label: 'What are they?', term: 'WINDOW', meaning: 'Calculate across<br>related rows', desc: 'Window functions compute values across a set of related rows WITHOUT collapsing them — keeping every row visible while adding rankings, running totals and more.' },
    why: { tag: 'Key Concepts', label: 'Why powerful', heading: 'Analytics<br>without collapse', reasons: [
      { title: 'ROW_NUMBER()', desc: 'Assigns sequential numbers to rows' },
      { title: 'RANK() / DENSE_RANK()', desc: 'Rank rows with different tie-breaking behavior' },
      { title: 'OVER() clause', desc: 'PARTITION BY divides groups, ORDER BY sequences them' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Rank users by<br>score', code: ['<span class="keyword">SELECT</span> name, score,', '&nbsp;&nbsp;<span class="table-name">ROW_NUMBER</span>() <span class="keyword">OVER</span>', '&nbsp;&nbsp;&nbsp;&nbsp;(<span class="keyword">ORDER BY</span> score <span class="keyword">DESC</span>) <span class="keyword">AS</span> rank', '<span class="keyword">FROM</span> <span class="table-name">students</span>;'], annotation: 'Each row keeps its data but gets a <strong>rank</strong>. Add PARTITION BY to rank within groups.' },
    cta: { emoji: '&#128202;', heading: 'Day 25 <span class="accent">Done</span>', sub: 'Day 26: CTEs drops next', btn: 'Follow for Day 26' }
  },
  {
    title: 'CTEs', coverTitle: 'CTE<br><span class="accent">s</span>', coverSub: 'Cleaner, more readable SQL',
    def: { tag: 'Definition', label: 'What is a CTE?', term: 'CTE', meaning: 'Named temporary<br>result set', desc: 'A Common Table Expression (CTE) names a subquery so you can reference it like a table — making complex queries readable and reusable.' },
    why: { tag: 'Key Concepts', label: 'Why CTEs win', heading: 'Readable &<br>reusable', reasons: [
      { title: 'WITH clause', desc: 'Define temporary result sets before the main query' },
      { title: 'More readable', desc: 'Break complex logic into named, understandable steps' },
      { title: 'Recursive CTEs', desc: 'Traverse hierarchies — org charts, categories, trees' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Name your<br>steps', code: ['<span class="keyword">WITH</span> top_users <span class="keyword">AS</span> (', '&nbsp;&nbsp;<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '&nbsp;&nbsp;<span class="keyword">WHERE</span> points > 1000', ')', '<span class="keyword">SELECT</span> name <span class="keyword">FROM</span> top_users;'], annotation: '<strong>WITH</strong> defines the CTE, then the main query selects from it as if it were a real table.' },
    cta: { emoji: '&#128220;', heading: 'Day 26 <span class="accent">Done</span>', sub: 'Day 27: Views drops next', btn: 'Follow for Day 27' }
  },
  {
    title: 'Views', coverTitle: 'Views<br><span class="accent">in SQL</span>', coverSub: 'Reusable virtual tables',
    def: { tag: 'Definition', label: 'What is a view?', term: 'VIEW', meaning: 'A saved query<br>you can query', desc: 'A view is a saved query that acts like a table. It stores the query, not the data — so results are always up to date.' },
    why: { tag: 'Key Concepts', label: 'Why views rock', heading: 'Save &<br>reuse', reasons: [
      { title: 'Virtual table', desc: 'Query it like a table — but it runs the saved query' },
      { title: 'Always fresh', desc: 'Data updates automatically when the source changes' },
      { title: 'Security layer', desc: 'Give access to specific columns without exposing tables' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Create a<br>reusable view', code: ['<span class="keyword">CREATE VIEW</span> <span class="table-name">active_users</span> <span class="keyword">AS</span>', '<span class="keyword">SELECT</span> id, name, email', '<span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> active = <span class="table-name">TRUE</span>;', '', '<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">active_users</span>;'], annotation: 'Create once, query forever. <strong>DROP VIEW</strong> removes it. Perfect for reports and dashboards.' },
    cta: { emoji: '&#128065;&#65039;', heading: 'Day 27 <span class="accent">Done</span>', sub: 'Day 28: Indexes drops next', btn: 'Follow for Day 28' }
  },
  {
    title: 'Indexes', coverTitle: 'Index<br><span class="accent">es</span>', coverSub: 'Speed up your queries',
    def: { tag: 'Definition', label: 'What is an index?', term: 'INDEX', meaning: 'A fast-lookup<br>data structure', desc: 'An index is like a book\'s index — it helps the database find rows instantly instead of scanning the whole table.' },
    why: { tag: 'Key Concepts', label: 'How they work', heading: 'Speed<br>boosters', reasons: [
      { title: 'Fast lookups', desc: 'Find rows quickly on indexed columns — WHERE, JOIN, ORDER BY' },
      { title: 'Trade-off', desc: 'Faster reads, slightly slower writes (INSERT/UPDATE)' },
      { title: 'Types', desc: 'B-Tree (default), Hash, Composite, Full-text, Partial' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Index your<br>hot columns', code: ['<span class="keyword">CREATE INDEX</span> idx_users_email', '<span class="keyword">ON</span> <span class="table-name">users</span>(email);', '', '<span class="keyword">SELECT</span> * <span class="keyword">FROM</span> <span class="table-name">users</span>', '<span class="keyword">WHERE</span> email = <span class="table-name">\'a@b.com\'</span>;'], annotation: 'Index columns used in <strong>WHERE</strong>, <strong>JOIN</strong> and <strong>ORDER BY</strong>. Verify usage with EXPLAIN.' },
    cta: { emoji: '&#9889;', heading: 'Day 28 <span class="accent">Done</span>', sub: 'Day 29: Transactions drops next', btn: 'Follow for Day 29' }
  },
  {
    title: 'Transactions', coverTitle: 'Trans-<br><span class="accent">actions</span>', coverSub: 'Ensure data integrity',
    def: { tag: 'Definition', label: 'What is a transaction?', term: 'TXN', meaning: 'All-or-nothing<br>operations', desc: 'A transaction groups operations so they ALL succeed or ALL fail. Think bank transfer — money leaves one account AND arrives in another.' },
    why: { tag: 'Key Concepts', label: 'The ACID rules', heading: 'Safe &<br>consistent', reasons: [
      { title: 'Atomicity', desc: 'All operations succeed, or none do' },
      { title: 'Consistency', desc: 'Data moves between valid states only' },
      { title: 'Isolation & Durability', desc: 'Concurrent transactions don\'t interfere; committed data survives' }
    ]},
    query: { tag: 'In Practice', label: 'Real example', heading: 'Safe money<br>transfer', code: ['<span class="keyword">BEGIN</span>;', '<span class="keyword">UPDATE</span> <span class="table-name">accounts</span> SET balance = balance - 100', '&nbsp;&nbsp;<span class="keyword">WHERE</span> id = <span class="table-name">1</span>;', '<span class="keyword">UPDATE</span> <span class="table-name">accounts</span> SET balance = balance + 100', '&nbsp;&nbsp;<span class="keyword">WHERE</span> id = <span class="table-name">2</span>;', '<span class="keyword">COMMIT</span>;'], annotation: '<strong>BEGIN</strong> starts, <strong>COMMIT</strong> saves. On error, <strong>ROLLBACK</strong> undoes everything. Both updates happen or neither.' },
    cta: { emoji: '&#128274;', heading: 'Day 29 <span class="accent">Done</span>', sub: 'Day 30: Real Project drops next', btn: 'Follow for Day 30' }
  },
  {
    title: 'Real Project', coverTitle: 'Real<br><span class="accent">Project</span>', coverSub: 'Build a complete database from scratch',
    def: { tag: 'Definition', label: 'The final challenge', term: 'PROJECT', meaning: 'E-commerce store<br>database', desc: 'Everything you learned comes together: design the schema, create tables with proper types and constraints, insert data, and run complex queries.' },
    why: { tag: 'Key Concepts', label: 'What we build', heading: 'Put it all<br>together', reasons: [
      { title: 'Schema design', desc: 'Plan tables & relationships before writing code' },
      { title: 'Types & constraints', desc: 'Proper data types, keys, and NOT NULL rules' },
      { title: 'Complex queries', desc: 'JOINs, CTEs, and window functions together' }
    ]},
    query: { tag: 'In Practice', label: 'The build', heading: 'Create the<br>users table', code: ['<span class="keyword">CREATE TABLE</span> <span class="table-name">users</span> (', '&nbsp;&nbsp;id <span class="table-name">INT PRIMARY KEY</span>,', '&nbsp;&nbsp;name <span class="table-name">VARCHAR</span>(100) <span class="keyword">NOT NULL</span>,', '&nbsp;&nbsp;email <span class="table-name">VARCHAR</span>(255) <span class="keyword">UNIQUE</span>,', '&nbsp;&nbsp;created_at <span class="table-name">TIMESTAMP</span> <span class="keyword">DEFAULT NOW()</span>', ');'], annotation: 'Primary keys, NOT NULL, UNIQUE, DEFAULT — constraints you learned across the series, applied.' },
    cta: { emoji: '&#127881;', heading: 'Series <span class="accent">Complete!</span>', sub: 'You learned SQL in 30 days', btn: 'Follow for More Content' }
  }
];

// ============ RUN ============
console.log('Regenerating ALL days to match day 1-8 design...\n');

// Load table data for every day (quality education content)
let tables = {};
try {
  tables = JSON.parse(fs.readFileSync(path.join(__dirname, 'tables.json'), 'utf8'));
} catch (e) {
  console.error('Could not load tables.json:', e.message);
}

// Merge tables for days 1-8
let tablesFirst = {};
try {
  tablesFirst = JSON.parse(fs.readFileSync(path.join(__dirname, 'tables-1-8.json'), 'utf8'));
} catch (e) {
  console.error('Could not load tables-1-8.json:', e.message);
}
Object.assign(tables, tablesFirst);

// Generate days 1-8
const allDays = [...daysFirst, ...days];
allDays.forEach((data, i) => {
  const dayNum = i + 1;
  const key = String(dayNum).padStart(2, '0');
  // Every day gets a real data table (like Day 1's database table)
  if (tables[key]) {
    data.table = tables[key];
  }
  buildDay(dayNum, data);
});
console.log('\n✅ Done! All days 1-30 regenerated.');