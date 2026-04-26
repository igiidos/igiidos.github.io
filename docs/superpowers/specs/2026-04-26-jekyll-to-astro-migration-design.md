# Jekyll → Astro 마이그레이션 설계

**날짜:** 2026-04-26  
**블로그:** sub3 engineering (igiidos.github.io)  
**목표:** Ruby/Jekyll 기반 블로그를 Astro로 전면 교체

---

## 배경

- 기존 Jekyll 블로그는 Ruby 2.6 (EOL), gem 미설치로 로컬 빌드 불가 상태
- 실질적 콘텐츠 없음 (테스트 파일 몇 개뿐) — 이전보다 새 시작에 가까움
- 이번 세션에서 제작한 커스텀 홈 디자인(Night Run Data 컨셉) 보존 필요
- 블로그 주제: 러닝, 마라톤, 트레일러닝, IT기술, 러닝여행

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| Astro 시작 방식 | 백지에서 직접 구축 (템플릿 X) |
| CSS 방식 | 기존 CSS 변수 방식 유지 (Tailwind X) |
| 배포 | GitHub Actions (`withastro/action@v3`) |
| 콘텐츠 관리 | Astro Content Collections v2 |
| 언어 | TypeScript |
| 패키지 매니저 | npm |
| 마이그레이션 방식 | In-place 교체 (같은 레포, git 히스토리 유지) |

---

## 프로젝트 구조

```
igiidos.github.io/
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   └── Footer.astro
│   ├── content/
│   │   ├── config.ts
│   │   └── posts/
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── BlogPost.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── running/index.astro
│   │   ├── marathon/index.astro
│   │   ├── trail/index.astro
│   │   ├── tech/index.astro
│   │   ├── travel/index.astro
│   │   └── posts/[...slug].astro
│   └── styles/
│       └── global.css
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### 삭제 대상 (Jekyll 잔재)

- `_config.yml`, `Gemfile`, `Gemfile.lock`
- `_layouts/`, `_posts/`
- `index.markdown`, `about.markdown`, `404.html`
- `Python/`, `Django/` (테스트 콘텐츠)
- `_site/`, `.jekyll-cache/` (빌드 산출물)

---

## Content Collections 스키마

```ts
// src/content/config.ts
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
```

### 마크다운 파일 위치

```
src/content/posts/
  YYYY-MM-DD-slug.md
```

### frontmatter 예시

```yaml
---
title: "첫 풀마라톤 완주기"
date: 2026-05-01
category: marathon
tags: [마라톤, 레이스리포트]
---
```

---

## 라우팅

| URL | 파일 | 역할 |
|-----|------|------|
| `/` | `pages/index.astro` | 홈 (Night Run 디자인) |
| `/about` | `pages/about.astro` | 소개 |
| `/running` | `pages/running/index.astro` | running 카테고리 목록 |
| `/marathon` | `pages/marathon/index.astro` | marathon 카테고리 목록 |
| `/trail` | `pages/trail/index.astro` | trail 카테고리 목록 |
| `/tech` | `pages/tech/index.astro` | tech 카테고리 목록 |
| `/travel` | `pages/travel/index.astro` | travel 카테고리 목록 |
| `/posts/[slug]` | `pages/posts/[...slug].astro` | 개별 포스트 |

카테고리 페이지는 동일한 구조 — `getCollection('posts')`로 해당 카테고리만 필터링.

---

## 컴포넌트 설계

### Base.astro
- `<html>`, `<head>` (메타태그, 폰트, global.css), `<slot />`
- 폰트: Barlow Condensed 900 + DM Mono + Crimson Pro (Google Fonts)

### Nav.astro
- 고정(fixed) 상단 바
- 로고 "sub3 engineering" + 카테고리 링크 5개
- 스크롤 시 배경 불투명도 전환 (JS)

### Footer.astro
- 경과 시간 타이머 (클라이언트 JS)
- 로고, 저작권

### index.astro (홈)
- 기존 `_layouts/splash.html` 디자인을 Astro 컴포넌트로 포팅
- 최근 포스트 6개: `getCollection('posts')`로 가져와 날짜 역순 정렬
- 배경 타이머 애니메이션, reveal 스크롤 효과 유지

### BlogPost.astro
- 포스트 헤더: 제목, 날짜, 카테고리 태그
- 본문: Astro의 `<Content />` 컴포넌트
- 이전/다음 포스트 네비게이션

---

## GitHub Actions 배포

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 22
```

**GitHub 저장소 설정 변경 필요:**
Settings → Pages → Source → **"GitHub Actions"** 로 변경

---

## CSS 전략

기존 `_layouts/splash.html`의 CSS를 분리:

- `src/styles/global.css` — CSS 변수, 폰트, 리셋, 공통 유틸리티
- 각 컴포넌트 `<style>` 태그 — 컴포넌트별 스코프 스타일

핵심 CSS 변수:
```css
--bg: #111111;
--accent: #D4FF00;      /* Electric Chartreuse */
--text: #EDEAE0;
--display: 'Barlow Condensed', sans-serif;
--mono: 'DM Mono', monospace;
--serif: 'Crimson Pro', serif;
```

---

## 범위 외 (이번 마이그레이션 포함 안 함)

- RSS 피드 (나중에 `@astrojs/rss`로 추가 가능)
- 검색 기능
- 댓글 시스템
- 이미지 최적화 설정
- 다크/라이트 모드 토글 (현재 다크 고정)
