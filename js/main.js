/* ==========================================================================
   Team 3 Landing Page - main.js
   README.md 의 내용을 데이터로 옮겨 렌더링하고, 간단한 인터랙션을 담당합니다.
   ========================================================================== */

// ---------- 데이터 (README 기준) ----------
const REPO = { owner: "ghlee050505-web", name: "3-Team" };

const MEMBERS = [
  {
    name: "김동규",
    role: "팀 리드 · 개발",
    duty: "저장소/보드 운영, 프론트엔드",
    tags: ["GitHub", "Frontend", "Agile"],
    github: "ygrcap1234-byte",
  },
  {
    name: "이가현",
    role: "기획 · 디자인",
    duty: "문제 정의, 사용자 조사, UI",
    tags: ["Research", "UX", "Design"],
    github: "ghlee050505-web",
  },
  {
    name: "임아메드알리프",
    role: "개발 · 리서치",
    duty: "기술 조사, 프로토타입",
    tags: ["Prototype", "AI", "Backend"],
    github: "LimAhmadarif",
  },
];

const CANDIDATES = [
  { key: "A", text: "대학생 일상 문제 해결형 AI 서비스" },
  { key: "B", text: "소상공인 업무 자동화 도우미" },
  { key: "C", text: "팀 자체 아이디어 (브레인스토밍 예정)" },
];

const MILESTONES = [
  {
    title: "M1. 팀 셋업 & 주제 선정",
    start: "2026-09-08",
    due: "2026-09-15",
    desc: "저장소, 랜딩 페이지, 칸반 보드 구축 · 주제 확정",
  },
  {
    title: "M2. 문제 정의 & 사용자 검증",
    start: "2026-09-15",
    due: "2026-10-13",
    desc: "사용자 인터뷰, 문제 가설 검증, 솔루션 스케치",
  },
  {
    title: "M3. MVP 제작",
    start: "2026-10-13",
    due: "2026-11-17",
    desc: "핵심 기능 1개를 동작하는 형태로 구현",
  },
  {
    title: "M4. 최종 발표",
    start: "2026-11-17",
    due: "2026-12-08",
    desc: "데모, 회고, 다음 단계 정리",
  },
];

const SPRINT_START = new Date("2026-09-08T00:00:00+09:00");
const TOPIC_DEADLINE = new Date("2026-09-15T09:00:00+09:00");

// ---------- 유틸 ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
}

function daysBetween(a, b) {
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

// ---------- 렌더링 ----------
function renderMembers() {
  const grid = $("#team-grid");
  if (!grid) return;
  MEMBERS.forEach((m, i) => {
    const card = el("article", { class: "member reveal", style: `transition-delay:${i * 80}ms` });
    card.appendChild(el("div", { class: "avatar", text: m.name.charAt(0), "aria-hidden": "true" }));
    card.appendChild(el("h3", { text: m.name }));
    card.appendChild(el("p", { class: "role", text: m.role }));
    card.appendChild(el("p", { class: "duty", text: m.duty }));
    card.appendChild(el("div", { class: "tags" }, m.tags.map((t) => el("span", { text: t }))));
    if (m.github) {
      card.appendChild(
        el("a", { class: "gh", href: `https://github.com/${m.github}`, target: "_blank", rel: "noopener", text: `@${m.github}` })
      );
    }
    grid.appendChild(card);
  });
  const count = $("#member-count");
  if (count) count.textContent = String(MEMBERS.length);
}

function renderCandidates() {
  const list = $("#candidate-list");
  if (!list) return;
  CANDIDATES.forEach((c) => {
    list.appendChild(el("li", {}, [el("span", { class: "candidate-key", text: c.key }), el("span", { text: c.text })]));
  });
}

function renderTimeline() {
  const ol = $("#timeline");
  if (!ol) return;
  const today = new Date();

  MILESTONES.forEach((ms, i) => {
    const start = new Date(ms.start + "T00:00:00+09:00");
    const due = new Date(ms.due + "T23:59:59+09:00");
    let status = "예정";
    let cls = "";
    let progress = 0;

    if (today > due) {
      status = "완료";
      cls = "is-done";
      progress = 100;
    } else if (today >= start) {
      status = "진행 중";
      cls = "is-current";
      progress = Math.round(((today - start) / (due - start)) * 100);
    }

    const item = el("li", { class: `tl-item reveal ${cls}`, style: `transition-delay:${i * 80}ms` });
    item.appendChild(
      el("div", { class: "tl-head" }, [
        el("h3", { text: ms.title }),
        el("span", { class: "tl-status", text: status }),
        el("span", { class: "tl-date", text: `${ms.start} → ${ms.due}` }),
      ])
    );
    item.appendChild(el("p", { text: ms.desc }));
    const bar = el("div", { class: "tl-progress", "aria-label": `${ms.title} 진행률 ${progress}%` }, [el("span")]);
    item.appendChild(bar);
    ol.appendChild(item);

    // 화면에 들어오면 진행률 바를 채웁니다.
    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.firstChild.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }, 300);
    });
  });
}

function renderStats() {
  const dday = $("#dday");
  const sprint = $("#sprint");
  const now = new Date();

  if (dday) {
    const d = daysBetween(now, TOPIC_DEADLINE);
    dday.textContent = d > 0 ? `D-${d}` : d === 0 ? "D-Day" : "확정";
  }
  if (sprint) {
    const weeks = Math.max(1, Math.floor(daysBetween(SPRINT_START, now) / 7) + 1);
    sprint.textContent = `Sprint ${weeks}`;
  }
}

// GitHub 공개 API 로 열린 이슈 수를 가져옵니다. 실패해도 페이지는 정상 동작합니다.
async function loadGitHubStats() {
  const target = $("#open-issues");
  if (!target) return;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    target.textContent = String(data.open_issues_count ?? "–");
  } catch (_) {
    target.textContent = "–";
  }
}

// ---------- 인터랙션 ----------
function setupNav() {
  const toggle = $(".nav-toggle");
  const list = $("#nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", () => {
      const open = list.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    $$("a", list).forEach((a) =>
      a.addEventListener("click", () => {
        list.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // 스크롤 위치에 따라 현재 섹션 메뉴를 강조합니다.
  const links = $$('.nav-list a[href^="#"]');
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }
}

function setupReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((i) => io.observe(i));
}

function setupTheme() {
  const root = document.documentElement;
  const btn = $(".theme-toggle");
  const icon = $(".theme-icon");
  const KEY = "team3-theme";

  const apply = (theme) => {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  apply(saved || (prefersLight ? "light" : "dark"));

  if (btn) {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (_) {}
    });
  }
}

// ---------- 초기화 ----------
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  renderMembers();
  renderCandidates();
  renderTimeline();
  renderStats();
  setupNav();
  setupReveal();
  loadGitHubStats();
});
