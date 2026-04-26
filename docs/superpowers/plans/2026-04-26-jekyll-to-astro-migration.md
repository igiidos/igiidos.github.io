# Jekyll → Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** igiidos.github.io Jekyll 블로그를 Astro로 완전 교체하고 GitHub Actions 자동 배포를 설정한다.

**Architecture:** 동일 레포에서 Jekyll 파일을 Astro 파일로 in-place 교체. `src/content/posts/` 마크다운을 Content Collections로 관리. `withastro/action@v3`으로 `main` 브랜치 push 시 자동 빌드·배포. 기존 Night Run Data 디자인(dark + electric chartreuse)은 그대로 보존.

**Tech Stack:** Astro (latest 5.x), TypeScript, plain CSS custom properties, GitHub Actions

---

## File Map

| 작업 | 파일 | 역할 |
|------|------|------|
| 생성 | `package.json` | npm 스크립트 및 의존성 |
| 생성 | `astro.config.mjs` | Astro 설정 |
| 생성 | `tsconfig.json` | TypeScript 설정 |
| 생성 | `src/styles/global.css` | CSS 변수, 리셋, 공유 유틸 |
| 생성 | `src/layouts/Base.astro` | HTML shell (head, 폰트) |
| 생성 | `src/layouts/BlogPost.astro` | 포스트 페이지 레이아웃 |
| 생성 | `src/components/Nav.astro` | 고정 네비게이션 |
| 생성 | `src/components/Footer.astro` | 푸터 + 경과 타이머 |
| 생성 | `src/content/config.ts` | Content Collections 스키마 |
| 생성 | `src/content/posts/2026-04-26-sub3-engineering-시작.md` | 샘플 포스트 |
| 생성 | `src/pages/index.astro` | 홈 (Night Run 디자인 포팅) |
| 생성 | `src/pages/[category]/index.astro` | 카테고리 목록 (동적, 5개 커버) |
| 생성 | `src/pages/posts/[...slug].astro` | 개별 포스트 동적 라우트 |
| 생성 | `src/pages/about.astro` | 소개 페이지 |
| 생성 | `.github/workflows/deploy.yml` | GitHub Actions 배포 |
| 수정 | `.gitignore` | Astro 기준으로 교체 |
| 수정 | `CLAUDE.md` | 개발 명령어 업데이트 |
| 삭제 | Jekyll 잔재 일체 | Task 13에서 처리 |

---

## Task 1: Astro 프로젝트 초기화

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro` (빌드 확인용 임시 파일, Task 7에서 교체)

- [ ] **Step 1: package.json 생성**

```json
{
  "name": "sub3-engineering",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: astro.config.mjs 생성**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://igiidos.github.io',
});
```

- [ ] **Step 3: tsconfig.json 생성**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: 임시 index.astro 생성** (npm run build 확인용)

```
mkdir -p src/pages
```

`src/pages/index.astro` 내용:

```astro
---
// placeholder — replaced in Task 7
---
<html lang="ko"><body><h1>sub3 engineering</h1></body></html>
```

- [ ] **Step 5: 의존성 설치**

```bash
npm install
```

Expected: `node_modules/` 생성, `package-lock.json` 생성, 에러 없음

- [ ] **Step 6: 빌드 확인**

```bash
npm run build
```

Expected: `dist/` 생성, 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/
git commit -m "feat: initialize Astro project"
```

---

## Task 2: 글로벌 CSS 생성

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: src/styles/global.css 생성**

```css
/* ── RESET ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── CSS VARIABLES ── */
:root {
  --bg:           #111111;
  --bg-card:      #161614;
  --bg-hover:     #1E1E1B;
  --accent:       #D4FF00;
  --accent-dim:   rgba(212, 255, 0, 0.08);
  --accent-mid:   rgba(212, 255, 0, 0.18);
  --red:          #FF4518;
  --text:         #EDEAE0;
  --text-muted:   #6B6B64;
  --text-ghost:   #2E2E28;
  --border:       #242420;
  --border-hover: #3A3A34;
  --display:      'Barlow Condensed', sans-serif;
  --mono:         'DM Mono', monospace;
  --serif:        'Crimson Pro', Georgia, serif;
}

/* ── BASE ── */
html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--serif);
  overflow-x: hidden;
}

/* Film-grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  background-size: 200px;
  pointer-events: none;
  z-index: 9999;
}

/* ── ANIMATIONS ── */
@keyframes riseIn {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* ── REVEAL SCROLL ── */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible {
  opacity: 1;
  transform: none;
}

/* ── BUTTONS ── */
.btn {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 0.85rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: var(--accent);
  color: #111111;
}
.btn-primary:hover {
  background: #EEFF44;
  transform: translateY(-2px);
}
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.btn-ghost:hover {
  color: var(--text);
  border-color: var(--border-hover);
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/styles/global.css
git commit -m "feat: add global CSS design tokens"
```

---

## Task 3: Base.astro 레이아웃 생성

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: src/layouts/Base.astro 생성**

```astro
---
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'sub3 engineering',
  description = '러닝, 마라톤, 트레일러닝, IT, 여행 — 달리는 기록들',
} = Astro.props;
---
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,600;0,800;0,900;1,300;1,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: index.astro에서 Base.astro 사용 확인** (src/pages/index.astro 임시 교체)

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="sub3 engineering">
  <h1 style="color: #D4FF00; font-size: 4rem; padding: 4rem;">sub3 engineering</h1>
</Base>
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 에러 없음, `dist/index.html`에 Google Fonts link 포함

- [ ] **Step 4: 커밋**

```bash
git add src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: add Base.astro layout"
```

---

## Task 4: Nav.astro 컴포넌트 생성

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: src/components/Nav.astro 생성**

```astro
---
const navLinks = [
  { href: '/running',  label: 'Running'  },
  { href: '/marathon', label: 'Marathon' },
  { href: '/trail',    label: 'Trail'    },
  { href: '/tech',     label: 'Tech'     },
  { href: '/travel',   label: 'Travel'   },
];
---
<nav class="nav" id="main-nav">
  <a href="/" class="nav-logo"><span class="accent">sub3</span> engineering</a>
  <ul class="nav-links">
    {navLinks.map(link => (
      <li><a href={link.href}>{link.label}</a></li>
    ))}
  </ul>
</nav>

<script>
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
</script>

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.6rem 3.5rem;
    background: linear-gradient(to bottom, rgba(17,17,17,0.97) 0%, transparent 100%);
    transition: background 0.3s;
  }
  .nav.scrolled { background: rgba(17,17,17,0.97); }
  .nav-logo {
    font-family: var(--display);
    font-weight: 900;
    font-size: 1.25rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text);
  }
  .nav-logo .accent { color: var(--accent); }
  .nav-links {
    list-style: none;
    display: flex;
    gap: 2.5rem;
  }
  .nav-links a {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--accent); }
  @media (max-width: 900px) {
    .nav { padding: 1.4rem 1.5rem; }
    .nav-links { display: none; }
  }
</style>
```

- [ ] **Step 2: index.astro에서 Nav 추가해 확인**

`src/pages/index.astro` 수정:

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
---
<Base title="sub3 engineering">
  <Nav />
  <div style="padding: 8rem 3rem; color: #D4FF00; font-size: 2rem;">sub3 engineering</div>
</Base>
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/components/Nav.astro src/pages/index.astro
git commit -m "feat: add Nav.astro component"
```

---

## Task 5: Footer.astro 컴포넌트 생성

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: src/components/Footer.astro 생성**

```astro
---
const year = new Date().getFullYear();
---
<footer>
  <div class="footer-logo"><span class="accent">sub3</span> engineering</div>
  <div class="footer-pace">
    <span id="footerTimer">00:00:00</span>
    page load pace
  </div>
  <div class="footer-copy">
    © {year} sub3 engineering<br />
    Keep Running
  </div>
</footer>

<script>
  const timerEl = document.getElementById('footerTimer');
  let elapsed = 0;
  function fmt(s: number): string {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sc}`;
  }
  setInterval(() => {
    elapsed++;
    if (timerEl) timerEl.textContent = fmt(elapsed);
  }, 1000);
</script>

<style>
  footer {
    padding: 3.5rem 3.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-logo {
    font-family: var(--display);
    font-weight: 900;
    font-size: 1.4rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .footer-logo .accent { color: var(--accent); }
  .footer-pace {
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: var(--text-ghost);
    text-align: center;
  }
  .footer-pace span {
    display: block;
    font-size: 1.6rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }
  .footer-copy {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    color: var(--text-ghost);
    text-align: right;
  }
  @media (max-width: 900px) {
    footer {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
      padding: 2.5rem 1.5rem;
    }
    .footer-copy { text-align: center; }
  }
</style>
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer.astro component"
```

---

## Task 6: Content Collections 설정 + 샘플 포스트

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/posts/2026-04-26-sub3-engineering-시작.md`

- [ ] **Step 1: src/content/config.ts 생성**

```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['running', 'marathon', 'trail', 'tech', 'travel']),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: 샘플 포스트 생성**

`src/content/posts/2026-04-26-sub3-engineering-시작.md`:

```markdown
---
title: "sub3 engineering 시작합니다"
date: 2026-04-26
category: running
tags: [소개, 러닝]
excerpt: "서브3 마라톤을 목표로 달리면서, 그 여정을 기록하는 블로그를 시작합니다."
---

서브3 마라톤(2시간 59분 59초 이내 완주)을 목표로 달리면서, 그 과정을 기록하는 블로그를 시작합니다.

## sub3 engineering이란?

달리기는 단순한 운동이 아닙니다. 페이스를 계산하고, 훈련 부하를 관리하고, 레이스 전략을 수립하는 것은 하나의 공학적 과정입니다.

이 블로그는 그 과정을 기록합니다.

- **Running**: 일상 훈련 기록
- **Marathon**: 풀코스 레이스와 서브3 도전기
- **Trail**: 산악 러닝과 트레일 레이스
- **Tech**: 러닝 데이터 분석과 IT 활용
- **Travel**: 러닝 여행과 해외 레이스

함께 달려봅시다.
```

- [ ] **Step 3: 빌드 확인 (스키마 유효성 검증 포함)**

```bash
npm run build
```

Expected: 에러 없음. 스키마 불일치가 있으면 Astro가 빌드 시 오류를 출력함.

- [ ] **Step 4: 커밋**

```bash
git add src/content/
git commit -m "feat: set up Content Collections and sample post"
```

---

## Task 7: 홈 페이지 (index.astro) — Night Run 디자인 포팅

**Files:**
- Modify: `src/pages/index.astro` (Task 1 임시 파일 교체)

- [ ] **Step 1: src/pages/index.astro 전체 교체**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts', ({ data }) => !data.draft);
const posts = allPosts
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 6);
const postCount = allPosts.length;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '.');
}
---
<Base>
  <Nav />

  <!-- HERO -->
  <section class="hero">
    <div class="hero-lanes" aria-hidden="true">
      {Array.from({ length: 12 }).map(() => <span />)}
    </div>
    <div class="bg-timer" id="bgTimer" aria-hidden="true">00:00:00</div>

    <div class="hero-content">
      <p class="hero-eyebrow">Sub-3 Hour Marathon &middot; Engineering Mind</p>
      <h1 class="hero-title">
        <span class="t-accent">sub3</span>
        <span class="t-light">engineering</span>
      </h1>
      <div class="hero-rule">
        <div class="hero-rule-line"></div>
        <span class="hero-tagline">러닝, 마라톤, 트레일 — 달리는 기록들</span>
      </div>
      <div class="hero-actions">
        <a href="#posts" class="btn btn-primary">최근 글 보기 ↓</a>
        <a href="/about" class="btn btn-ghost">About</a>
      </div>
    </div>

    <div class="hero-stats">
      <div class="hero-stat">
        <span class="stat-val">{postCount}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="hero-stat">
        <span class="stat-val">42.195</span>
        <span class="stat-label">km Marathon</span>
      </div>
      <div class="hero-stat">
        <span class="stat-val">sub3</span>
        <span class="stat-label">Target Pace</span>
      </div>
      <div class="hero-stat">
        <span class="stat-val">∞</span>
        <span class="stat-label">Keep Running</span>
      </div>
    </div>
  </section>

  <!-- RECENT POSTS -->
  <section class="section" id="posts">
    <div class="section-head">
      <div>
        <p class="section-label">// latest</p>
        <h2 class="section-title">Recent</h2>
      </div>
      <a href="/running" class="section-more">모든 글 보기 →</a>
    </div>
    <div class="posts-grid">
      {posts.length > 0 ? (
        posts.map(post => (
          <a href={`/posts/${post.slug}`} class="post-card reveal">
            <div class="post-card-meta">
              <span class="post-date">{formatDate(post.data.date)}</span>
              <span class="post-tag">{post.data.category}</span>
            </div>
            <h3 class="post-title">{post.data.title}</h3>
            {post.data.excerpt && (
              <p class="post-excerpt">{post.data.excerpt}</p>
            )}
            <span class="post-arrow">Read →</span>
          </a>
        ))
      ) : (
        <div class="posts-empty">
          <div class="posts-empty-num">0</div>
          <p class="posts-empty-text">첫 번째 글을 작성해보세요</p>
        </div>
      )}
    </div>
  </section>

  <!-- QUOTE STRIP -->
  <div class="quote-strip reveal">
    <div class="quote-mark" aria-hidden="true">"</div>
    <blockquote>
      <p class="quote-text">달리는 것은 단순한 운동이 아니다. 한 걸음씩 쌓이는 공학이다.</p>
      <cite class="quote-source">sub3 engineering</cite>
    </blockquote>
  </div>

  <!-- CATEGORIES -->
  <section class="section">
    <div class="section-head">
      <div>
        <p class="section-label">// explore</p>
        <h2 class="section-title">Categories</h2>
      </div>
    </div>
    <div class="cat-grid">
      <a href="/running" class="cat-card reveal">
        <div class="cat-glyph">RUN</div>
        <div class="cat-name">Running</div>
        <div class="cat-desc">훈련 일지<br />레이스 기록<br />달리기의 모든 것</div>
      </a>
      <a href="/marathon" class="cat-card reveal">
        <div class="cat-glyph">42K</div>
        <div class="cat-name">Marathon</div>
        <div class="cat-desc">42.195km<br />서브3 도전기<br />풀코스 레이스</div>
      </a>
      <a href="/trail" class="cat-card reveal">
        <div class="cat-glyph">MTN</div>
        <div class="cat-name">Trail</div>
        <div class="cat-desc">산악 러닝<br />트레일 레이스<br />자연 속으로</div>
      </a>
      <a href="/tech" class="cat-card reveal">
        <div class="cat-glyph">&lt;/&gt;</div>
        <div class="cat-name">Tech</div>
        <div class="cat-desc">러닝 데이터<br />IT · 개발 기록<br />스마트 트레이닝</div>
      </a>
      <a href="/travel" class="cat-card reveal">
        <div class="cat-glyph">GO!</div>
        <div class="cat-name">Travel</div>
        <div class="cat-desc">러닝 여행<br />해외 레이스<br />세계를 달리다</div>
      </a>
    </div>
  </section>

  <Footer />
</Base>

<script>
  // Background hero timer
  const bgTimer = document.getElementById('bgTimer');
  let elapsed = 0;
  function fmt(s: number): string {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sc}`;
  }
  setInterval(() => {
    elapsed++;
    if (bgTimer) bgTimer.textContent = fmt(elapsed);
  }, 1000);

  // Smooth scroll
  document.querySelector('a[href="#posts"]')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Reveal animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement?.children ?? []);
        const index = siblings.indexOf(entry.target as Element);
        (entry.target as HTMLElement).style.transitionDelay = `${index * 80}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>

<style>
  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    padding: 0 3.5rem;
    position: relative;
    overflow: hidden;
  }
  .hero-lanes {
    position: absolute;
    top: 0; bottom: 0;
    left: 3.5rem; right: 3.5rem;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    pointer-events: none;
    z-index: 0;
  }
  .hero-lanes span { border-right: 1px solid rgba(255,255,255,0.025); }
  .bg-timer {
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-55%);
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(5rem, 14vw, 12rem);
    color: transparent;
    -webkit-text-stroke: 1px rgba(212,255,0,0.07);
    letter-spacing: 0.04em;
    user-select: none;
    white-space: nowrap;
    z-index: 1;
    opacity: 0;
    animation: fadeIn 1.4s ease forwards 1.4s;
  }
  .hero-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 7rem;
    position: relative;
    z-index: 2;
    max-width: 800px;
  }
  .hero-eyebrow {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 2rem;
    opacity: 0;
    transform: translateY(12px);
    animation: riseIn 0.7s ease forwards 0.3s;
  }
  .hero-eyebrow::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: var(--accent);
    vertical-align: middle;
    margin-right: 1rem;
  }
  .hero-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(7rem, 18vw, 15rem);
    line-height: 0.85;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    opacity: 0;
    transform: translateY(24px);
    animation: riseIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.55s;
  }
  .hero-title .t-accent { color: var(--accent); }
  .hero-title .t-light {
    font-weight: 300;
    font-style: italic;
    color: var(--text-muted);
    display: block;
  }
  .hero-rule {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin: 2.5rem 0 2rem;
    opacity: 0;
    animation: riseIn 0.6s ease forwards 0.9s;
  }
  .hero-rule-line { width: 48px; height: 1px; background: linear-gradient(to right, var(--accent), transparent); }
  .hero-tagline {
    font-family: var(--serif);
    font-style: italic;
    font-weight: 300;
    font-size: 1.05rem;
    color: var(--text-muted);
    letter-spacing: 0.03em;
  }
  .hero-actions {
    display: flex;
    gap: 1rem;
    margin-top: 3rem;
    opacity: 0;
    animation: riseIn 0.6s ease forwards 1.1s;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--border);
    padding: 2.5rem 0;
    opacity: 0;
    animation: riseIn 0.6s ease forwards 1.3s;
    position: relative;
    z-index: 2;
  }
  .hero-stat { padding: 0 2rem; border-right: 1px solid var(--border); }
  .hero-stat:first-child { padding-left: 0; }
  .hero-stat:last-child { border-right: none; }
  .stat-val {
    font-family: var(--display);
    font-weight: 800;
    font-size: 2.2rem;
    color: var(--accent);
    line-height: 1;
    display: block;
  }
  .stat-label {
    font-family: var(--mono);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 0.4rem;
    display: block;
  }

  /* ── SECTION ── */
  .section { padding: 6rem 3.5rem; border-top: 1px solid var(--border); }
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 3.5rem;
  }
  .section-label {
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  .section-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: 3rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
  }
  .section-more {
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }
  .section-more:hover { color: var(--accent); }

  /* ── POSTS GRID ── */
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
  }
  .post-card {
    background: var(--bg);
    padding: 2.5rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;
    overflow: hidden;
    transition: background 0.3s;
  }
  .post-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .post-card:hover { background: var(--bg-hover); }
  .post-card:hover::after { transform: scaleX(1); }
  .post-card-meta { display: flex; align-items: center; gap: 0.75rem; }
  .post-date { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--text-muted); }
  .post-tag {
    font-family: var(--mono);
    font-size: 0.58rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 0.15rem 0.55rem;
    border: 1px solid rgba(212,255,0,0.15);
  }
  .post-title {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.55rem;
    line-height: 1.1;
    letter-spacing: 0.01em;
    color: var(--text);
    flex: 1;
    transition: color 0.2s;
  }
  .post-card:hover .post-title { color: var(--accent); }
  .post-excerpt {
    font-family: var(--serif);
    font-size: 0.92rem;
    line-height: 1.65;
    color: var(--text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .post-arrow {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-ghost);
    transition: color 0.2s, letter-spacing 0.2s;
  }
  .post-card:hover .post-arrow { color: var(--accent); letter-spacing: 0.3em; }
  .posts-empty {
    background: var(--bg);
    grid-column: 1 / -1;
    padding: 8rem 3rem;
    text-align: center;
  }
  .posts-empty-num {
    font-family: var(--display);
    font-weight: 900;
    font-size: 10rem;
    color: var(--text-ghost);
    line-height: 1;
  }
  .posts-empty-text {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 1.5rem;
  }

  /* ── QUOTE STRIP ── */
  .quote-strip {
    padding: 5rem 3.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 3rem;
    overflow: hidden;
  }
  .quote-mark {
    font-family: var(--display);
    font-weight: 900;
    font-size: 8rem;
    color: var(--accent);
    line-height: 0.7;
    flex-shrink: 0;
  }
  .quote-text {
    font-family: var(--serif);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(1.5rem, 3vw, 2.4rem);
    line-height: 1.3;
    color: var(--text);
    max-width: 700px;
  }
  .quote-source {
    display: block;
    margin-top: 1rem;
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-style: normal;
  }

  /* ── CATEGORIES ── */
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    background: var(--border);
  }
  .cat-card {
    background: var(--bg);
    padding: 3rem 2rem 2.5rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow: hidden;
    transition: background 0.3s;
  }
  .cat-card:hover { background: var(--bg-hover); }
  .cat-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cat-card:hover::before { transform: scaleX(1); }
  .cat-glyph {
    font-family: var(--display);
    font-weight: 900;
    font-size: 3rem;
    color: var(--text-ghost);
    line-height: 1;
    transition: color 0.3s;
  }
  .cat-card:hover .cat-glyph { color: var(--accent); }
  .cat-name {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text);
  }
  .cat-desc {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    line-height: 1.7;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px) {
    .hero { padding: 0 1.5rem; }
    .hero-title { font-size: clamp(5rem, 20vw, 8rem); }
    .bg-timer { display: none; }
    .hero-stats { grid-template-columns: repeat(2, 1fr); }
    .hero-stat { border-right: none; padding: 0; }
    .hero-stat:nth-child(odd) { padding-right: 1rem; }
    .section { padding: 4rem 1.5rem; }
    .posts-grid { grid-template-columns: 1fr; }
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
    .quote-strip { padding: 3.5rem 1.5rem; gap: 1.5rem; }
    .quote-mark { font-size: 5rem; }
  }
</style>
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: 에러 없음, `dist/index.html` 생성

- [ ] **Step 3: 커밋**

```bash
git add src/pages/index.astro
git commit -m "feat: port Night Run home page design to Astro"
```

---

## Task 8: 카테고리 페이지 ([category]/index.astro)

스펙에서 5개 별도 파일을 제안했지만, 동적 라우트 하나로 DRY하게 처리한다.

**Files:**
- Create: `src/pages/[category]/index.astro`

- [ ] **Step 1: src/pages/[category]/index.astro 생성**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';

type Category = 'running' | 'marathon' | 'trail' | 'tech' | 'travel';

const CATEGORY_META: Record<Category, { name: string; glyph: string; desc: string }> = {
  running:  { name: 'Running',  glyph: 'RUN', desc: '훈련 일지 · 레이스 기록' },
  marathon: { name: 'Marathon', glyph: '42K', desc: '42.195km · 서브3 도전기' },
  trail:    { name: 'Trail',    glyph: 'MTN', desc: '산악 러닝 · 트레일 레이스' },
  tech:     { name: 'Tech',     glyph: '</>', desc: '러닝 데이터 · IT · 개발 기록' },
  travel:   { name: 'Travel',   glyph: 'GO!', desc: '러닝 여행 · 해외 레이스' },
};

export async function getStaticPaths() {
  const categories: Category[] = ['running', 'marathon', 'trail', 'tech', 'travel'];
  return categories.map(category => ({ params: { category } }));
}

const category = Astro.params.category as Category;
const meta = CATEGORY_META[category];

const allPosts = await getCollection('posts', ({ data }) =>
  !data.draft && data.category === category
);
const posts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '.');
}
---
<Base title={`${meta.name} — sub3 engineering`}>
  <Nav />
  <main>
    <header class="cat-header">
      <div class="cat-glyph">{meta.glyph}</div>
      <h1 class="cat-title">{meta.name}</h1>
      <p class="cat-desc">{meta.desc}</p>
    </header>

    <section class="posts-section">
      <div class="posts-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <a href={`/posts/${post.slug}`} class="post-card">
              <div class="post-card-meta">
                <span class="post-date">{formatDate(post.data.date)}</span>
              </div>
              <h3 class="post-title">{post.data.title}</h3>
              {post.data.excerpt && (
                <p class="post-excerpt">{post.data.excerpt}</p>
              )}
              <span class="post-arrow">Read →</span>
            </a>
          ))
        ) : (
          <div class="posts-empty">
            <div class="posts-empty-num">0</div>
            <p class="posts-empty-text">아직 작성된 글이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  </main>
  <Footer />
</Base>

<style>
  .cat-header {
    padding: 10rem 3.5rem 5rem;
    border-bottom: 1px solid var(--border);
  }
  .cat-glyph {
    font-family: var(--display);
    font-weight: 900;
    font-size: 4rem;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 1rem;
  }
  .cat-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(4rem, 10vw, 8rem);
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.9;
    color: var(--text);
    margin-bottom: 1.5rem;
  }
  .cat-desc {
    font-family: var(--mono);
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .posts-section { padding: 4rem 3.5rem 6rem; }
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
  }
  .post-card {
    background: var(--bg);
    padding: 2.5rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;
    overflow: hidden;
    transition: background 0.3s;
  }
  .post-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .post-card:hover { background: var(--bg-hover); }
  .post-card:hover::after { transform: scaleX(1); }
  .post-card-meta { display: flex; align-items: center; gap: 0.75rem; }
  .post-date { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--text-muted); }
  .post-title {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.55rem;
    line-height: 1.1;
    color: var(--text);
    flex: 1;
    transition: color 0.2s;
  }
  .post-card:hover .post-title { color: var(--accent); }
  .post-excerpt {
    font-family: var(--serif);
    font-size: 0.92rem;
    line-height: 1.65;
    color: var(--text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .post-arrow {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-ghost);
    transition: color 0.2s, letter-spacing 0.2s;
  }
  .post-card:hover .post-arrow { color: var(--accent); letter-spacing: 0.3em; }
  .posts-empty {
    background: var(--bg);
    grid-column: 1 / -1;
    padding: 8rem 3rem;
    text-align: center;
  }
  .posts-empty-num {
    font-family: var(--display);
    font-weight: 900;
    font-size: 10rem;
    color: var(--text-ghost);
    line-height: 1;
  }
  .posts-empty-text {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 1.5rem;
  }
  @media (max-width: 900px) {
    .cat-header { padding: 8rem 1.5rem 3rem; }
    .posts-section { padding: 3rem 1.5rem 4rem; }
    .posts-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: 빌드 확인 (5개 카테고리 페이지 생성 확인)**

```bash
npm run build
```

Expected: `dist/running/index.html`, `dist/marathon/index.html`, `dist/trail/index.html`, `dist/tech/index.html`, `dist/travel/index.html` 생성

- [ ] **Step 3: 커밋**

```bash
git add src/pages/
git commit -m "feat: add dynamic category pages"
```

---

## Task 9: BlogPost.astro 레이아웃 생성

**Files:**
- Create: `src/layouts/BlogPost.astro`

- [ ] **Step 1: src/layouts/BlogPost.astro 생성**

```astro
---
import Base from './Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'posts'>;
  prevPost: CollectionEntry<'posts'> | null;
  nextPost: CollectionEntry<'posts'> | null;
}

const { post, prevPost, nextPost } = Astro.props;
const { title, date, category, tags } = post.data;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '.');
}
---
<Base title={`${title} — sub3 engineering`}>
  <Nav />
  <main class="post-main">
    <header class="post-header">
      <div class="post-meta">
        <span class="post-date">{formatDate(date)}</span>
        <a href={`/${category}`} class="post-cat">{category}</a>
      </div>
      <h1 class="post-title">{title}</h1>
      {tags && tags.length > 0 && (
        <div class="post-tags">
          {tags.map(tag => <span class="post-tag-item">#{tag}</span>)}
        </div>
      )}
    </header>

    <article class="post-content">
      <slot />
    </article>

    <nav class="post-nav">
      {prevPost && (
        <a href={`/posts/${prevPost.slug}`} class="post-nav-link post-nav-prev">
          <span class="post-nav-label">← 이전 글</span>
          <span class="post-nav-title">{prevPost.data.title}</span>
        </a>
      )}
      {nextPost && (
        <a href={`/posts/${nextPost.slug}`} class="post-nav-link post-nav-next">
          <span class="post-nav-label">다음 글 →</span>
          <span class="post-nav-title">{nextPost.data.title}</span>
        </a>
      )}
    </nav>
  </main>
  <Footer />
</Base>

<style>
  .post-main {
    max-width: 760px;
    margin: 0 auto;
    padding: 8rem 2rem 6rem;
  }
  .post-header {
    margin-bottom: 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--border);
  }
  .post-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
  .post-date { font-family: var(--mono); font-size: 0.65rem; letter-spacing: 0.15em; color: var(--text-muted); }
  .post-cat {
    font-family: var(--mono);
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 0.15rem 0.55rem;
    border: 1px solid rgba(212,255,0,0.15);
    text-decoration: none;
    transition: background 0.2s;
  }
  .post-cat:hover { background: var(--accent-mid); }
  .post-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    line-height: 0.95;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: var(--text);
    margin-bottom: 1.5rem;
  }
  .post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .post-tag-item { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--text-muted); }

  /* Markdown 콘텐츠 스타일 */
  .post-content {
    font-family: var(--serif);
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text);
  }
  .post-content :global(h2) {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text);
    margin: 3rem 0 1rem;
  }
  .post-content :global(h3) {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.3rem;
    text-transform: uppercase;
    color: var(--text);
    margin: 2rem 0 0.75rem;
  }
  .post-content :global(p) { margin-bottom: 1.5rem; }
  .post-content :global(a) { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
  .post-content :global(ul),
  .post-content :global(ol) { padding-left: 1.5rem; margin-bottom: 1.5rem; }
  .post-content :global(li) { margin-bottom: 0.5rem; }
  .post-content :global(code) {
    font-family: var(--mono);
    font-size: 0.875em;
    background: var(--bg-card);
    padding: 0.1em 0.4em;
    border: 1px solid var(--border);
  }
  .post-content :global(pre) {
    background: var(--bg-card);
    border: 1px solid var(--border);
    padding: 1.5rem;
    overflow-x: auto;
    margin-bottom: 1.5rem;
  }
  .post-content :global(pre code) { background: none; border: none; padding: 0; }
  .post-content :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 1.5rem;
    margin: 2rem 0;
    color: var(--text-muted);
    font-style: italic;
  }
  .post-content :global(hr) { border: none; border-top: 1px solid var(--border); margin: 3rem 0; }

  /* 이전/다음 네비게이션 */
  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border);
    margin-top: 5rem;
    border-top: 1px solid var(--border);
  }
  .post-nav-link {
    background: var(--bg);
    padding: 2rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: background 0.2s;
  }
  .post-nav-link:hover { background: var(--bg-hover); }
  .post-nav-next { text-align: right; }
  .post-nav-label { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); }
  .post-nav-title { font-family: var(--display); font-weight: 700; font-size: 1.1rem; color: var(--text); transition: color 0.2s; }
  .post-nav-link:hover .post-nav-title { color: var(--accent); }
</style>
```

- [ ] **Step 2: 커밋**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: add BlogPost layout with prev/next navigation"
```

---

## Task 10: 포스트 동적 라우트 ([...slug].astro)

**Files:**
- Create: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: src/pages/posts/[...slug].astro 생성**

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('posts', ({ data }) => !data.draft);
  const sorted = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return sorted.map((post, i) => ({
    params: { slug: post.slug },
    props: {
      post,
      prevPost: sorted[i + 1] ?? null,
      nextPost: sorted[i - 1] ?? null,
    },
  }));
}

const { post, prevPost, nextPost } = Astro.props;
const { Content } = await render(post);
---
<BlogPost post={post} prevPost={prevPost} nextPost={nextPost}>
  <Content />
</BlogPost>
```

- [ ] **Step 2: 빌드 확인 (포스트 페이지 생성 확인)**

```bash
npm run build
```

Expected: `dist/posts/2026-04-26-sub3-engineering-시작/index.html` 생성

- [ ] **Step 3: 커밋**

```bash
git add src/pages/posts/
git commit -m "feat: add dynamic post route"
```

---

## Task 11: About 페이지

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: src/pages/about.astro 생성**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---
<Base title="About — sub3 engineering">
  <Nav />
  <main class="about-main">
    <header class="about-header">
      <p class="about-eyebrow">// about</p>
      <h1 class="about-title">About</h1>
    </header>
    <div class="about-content">
      <p>안녕하세요. sub3 engineering 블로그에 오신 걸 환영합니다.</p>
      <p>
        서브3 마라톤을 목표로 달리는 러너이자 엔지니어입니다.<br />
        러닝, 마라톤, 트레일, 기술, 여행에 대한 기록을 이곳에 남깁니다.
      </p>
    </div>
  </main>
  <Footer />
</Base>

<style>
  .about-main {
    max-width: 760px;
    margin: 0 auto;
    padding: 10rem 2rem 6rem;
  }
  .about-eyebrow {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }
  .about-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(4rem, 10vw, 8rem);
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.9;
    color: var(--text);
    margin-bottom: 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--border);
  }
  .about-content {
    font-family: var(--serif);
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-muted);
  }
  .about-content p { margin-bottom: 1.5rem; }
</style>
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: `dist/about/index.html` 생성

- [ ] **Step 3: 커밋**

```bash
git add src/pages/about.astro
git commit -m "feat: add about page"
```

---

## Task 12: GitHub Actions 배포 설정

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: .github/workflows/deploy.yml 생성**

```bash
mkdir -p .github/workflows
```

`.github/workflows/deploy.yml` 내용:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        id: deployment
        uses: withastro/action@v3
        with:
          node-version: 22
```

- [ ] **Step 2: 커밋**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deployment workflow"
```

- [ ] **Step 3: GitHub 저장소 설정 변경 (수동 작업)**

GitHub 저장소 → Settings → Pages → Source → **"GitHub Actions"** 선택 후 저장.

이 변경 없이는 기존 Jekyll 빌더가 계속 실행됨.

---

## Task 13: Jekyll 파일 삭제

**Files:**
- Delete: `_config.yml`, `Gemfile`, `Gemfile.lock`
- Delete: `_layouts/` (전체 디렉토리)
- Delete: `_posts/` (전체 디렉토리)
- Delete: `index.markdown`, `about.markdown`, `404.html`
- Delete: `Python/`, `Django/` (테스트 콘텐츠)
- Delete: `_site/`, `.jekyll-cache/` (빌드 산출물, 이미 .gitignore 처리됨)

- [ ] **Step 1: Jekyll 파일 일괄 삭제**

```bash
git rm -r _config.yml Gemfile Gemfile.lock _layouts/ _posts/ index.markdown about.markdown 404.html Python/ Django/
rm -rf _site/ .jekyll-cache/
```

- [ ] **Step 2: 삭제 확인**

```bash
ls -la
```

Expected: Jekyll 관련 파일 없음, `src/`, `public/`, `astro.config.mjs`, `package.json`, `.github/` 등만 남음

- [ ] **Step 3: Astro 최종 빌드 확인**

```bash
npm run build
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: remove Jekyll files, complete Astro migration"
```

---

## Task 14: .gitignore 및 CLAUDE.md 업데이트

**Files:**
- Modify: `.gitignore`
- Modify: `CLAUDE.md`

- [ ] **Step 1: .gitignore 교체**

`.gitignore` 전체 내용:

```
# Astro build output
dist/

# Astro cache
.astro/

# Dependencies
node_modules/

# macOS
.DS_Store

# IDE
.vscode/
```

- [ ] **Step 2: CLAUDE.md 커맨드 섹션 업데이트**

`CLAUDE.md`의 `## Commands` 섹션을 다음으로 교체:

```markdown
## Commands

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 (http://localhost:4321)
npm run dev

# 프로덕션 빌드 (dist/ 생성)
npm run build

# 빌드 결과물 미리보기
npm run preview

# TypeScript 타입 체크
npm run check
```

- [ ] **Step 3: 최종 빌드 + 타입 체크**

```bash
npm run check && npm run build
```

Expected: 타입 에러 없음, 빌드 성공

- [ ] **Step 4: 최종 커밋**

```bash
git add .gitignore CLAUDE.md
git commit -m "chore: update .gitignore and CLAUDE.md for Astro"
```

---

## 완료 후 확인 사항

1. **로컬 확인**: `npm run dev` → `http://localhost:4321` 에서 홈 페이지, 카테고리 페이지, 포스트 페이지 확인
2. **GitHub 배포**: `git push origin main` → GitHub Actions 탭에서 배포 워크플로우 성공 확인
3. **GitHub Pages 설정**: Settings → Pages → Source 가 "GitHub Actions" 인지 확인
4. **라이브 사이트**: `https://igiidos.github.io` 접속 확인
