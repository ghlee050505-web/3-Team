/* ==========================================================================
   FX — 공용 효과 유틸 (글자 분리, 텍스트 맞춤, 커서, HUD, 마퀴, 카운터)
   ========================================================================== */
(function () {
  'use strict';

  const mq = (q) => window.matchMedia(q).matches;

  const FX = {
    // ===== MOTION POLICY =====
    // reduce : 완전 정적 모드 — 주소 뒤에 ?motion=off 를 붙였을 때만.
    // gentle : 기기의 '동작 줄이기' 설정이 켜져 있을 때. 스크롤 연출은 그대로 보여주고
    //          멀미를 줄 수 있는 큰 움직임(흔들림·패럴랙스·확대 전환)만 약하게 합니다.
    //          (?motion=full 을 붙이면 설정과 상관없이 전체 모션)
    reduce: /[?&]motion=off\b/.test(location.search),
    gentle: mq('(prefers-reduced-motion: reduce)') && !/[?&]motion=full\b/.test(location.search),
    isDesktop: () => mq('(min-width: 900px)'),
    finePointer: () => mq('(hover: hover) and (pointer: fine)'),
    hasGSAP: () => !!window.gsap,

    /* ---------- 글자 단위 분리 (자식 요소 <b>, <em> 등은 유지) ---------- */
    splitChars(el) {
      if (!el || el.dataset.split) return el ? [...el.querySelectorAll('.char')] : [];
      el.dataset.split = '1';
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      const walk = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            [...child.textContent].forEach((ch) => {
              const s = document.createElement('span');
              s.className = 'char';
              s.setAttribute('aria-hidden', 'true');
              s.textContent = ch === ' ' ? ' ' : ch;
              frag.appendChild(s);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            walk(child);
          }
        });
      };
      walk(el);
      // 글자는 aria-hidden 이므로, 라벨이 없는 곳엔 스크린리더용 원문을 남김
      if (!el.hasAttribute('aria-label') &&
          !el.closest('[aria-hidden="true"], h1[aria-label], h2[aria-label], h3[aria-label]')) {
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = text;
        el.appendChild(sr);
      }
      return [...el.querySelectorAll('.char')];
    },

    /* ---------- 한 줄 대형 타이포를 컨테이너 폭에 맞춤 (CSS 크기보다 커지진 않음) ---------- */
    fitText(el, container) {
      if (!el) return;
      // 애니메이션 중간값(자간/폭)이 아닌 "최종 상태"로 측정
      const props = ['letter-spacing', '--wdth', '--ls'];
      const saved = props.map((p) => el.style.getPropertyValue(p));
      props.forEach((p) => el.style.removeProperty(p));
      el.style.fontSize = '';
      const avail = (container || el.parentElement).clientWidth;
      const w = el.scrollWidth;
      props.forEach((p, i) => { if (saved[i]) el.style.setProperty(p, saved[i]); });
      if (w > avail && avail > 0) {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${Math.floor(fs * (avail / w) * 0.985)}px`;
      }
    },

    /* ---------- 인라인 값을 무시한 CSS 변수의 기본값 (애니메이션 최종값으로 사용) ----------
       대형 타이포의 자간은 CSS 에서 letter-spacing: calc(var(--ls) * 1em) 로 정의되어 있어
       --ls 숫자만 트윈하면 글자 크기가 바뀌어도 비율이 그대로 유지됩니다. */
    restVar(el, name) {
      const s = el.style.getPropertyValue(name);
      el.style.removeProperty(name);
      const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
      if (s) el.style.setProperty(name, s);
      return Number.isFinite(v) ? v : 0;
    },

    /* ---------- 텍스트 스크램블 (HUD 섹션명) ---------- */
    scramble(el, text) {
      if (!el) return;
      if (FX.reduce) { el.textContent = text; return; }
      const glyphs = '▒░█#%&$@*+/<>';
      const from = el.textContent;
      const len = Math.max(from.length, text.length);
      const t0 = performance.now();
      const dur = 420;
      cancelAnimationFrame(el._scr);
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        let out = '';
        for (let i = 0; i < len; i++) {
          const reveal = i / len < p;
          out += reveal ? (text[i] || '') : (text[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0]);
        }
        el.textContent = out;
        if (p < 1) el._scr = requestAnimationFrame(tick);
      };
      el._scr = requestAnimationFrame(tick);
    },

    /* ---------- 커스텀 커서 (데스크톱 · 정밀 포인터 전용) ---------- */
    cursor() {
      if (FX.reduce || !FX.finePointer()) return;
      const cur = document.querySelector('.cursor');
      const label = cur && cur.querySelector('.cursor__label');
      if (!cur) return;
      document.documentElement.classList.add('has-cursor');

      let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
      addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.remove('is-hidden'); }, { passive: true });
      document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
      const loop = () => {
        cx += (x - cx) * 0.22;
        cy += (y - cy) * 0.22;
        cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        requestAnimationFrame(loop);
      };
      loop();

      document.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-cursor], a, button');
        if (!t) return;
        label.textContent = t.dataset.cursor || (t.tagName === 'A' ? 'GO' : 'CLICK');
        cur.classList.add('is-active');
      });
      document.addEventListener('pointerout', (e) => {
        const t = e.target.closest('[data-cursor], a, button');
        if (t && !t.contains(e.relatedTarget)) cur.classList.remove('is-active');
      });
    },

    /* ---------- HUD: 스크롤 진행도 + 현재 섹션 이름 + 밝은 섹션에서 색 반전 ---------- */
    hud() {
      const hud = document.getElementById('hud');
      const bar = document.getElementById('hudProgress');
      const label = document.getElementById('hudSection');
      if (!hud) return;

      let ticking = false;
      const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        ticking = false;
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();

      // 화면 정중앙 선을 지나는 섹션을 현재 섹션으로 판단
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          if (label.textContent !== el.dataset.section) FX.scramble(label, el.dataset.section);
          hud.classList.toggle('is-light', el.dataset.hud === 'light');
        });
      }, { rootMargin: '-50% 0px -50% 0px' });
      document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
    },

    /* ---------- 경고 테이프: 스크롤 속도에 따라 빨라지고 방향도 바뀜 ---------- */
    marquee() {
      if (FX.reduce || !('getAnimations' in Element.prototype)) return;
      const anims = [...document.querySelectorAll('.tape__track')]
        .map((t) => t.getAnimations()[0]).filter(Boolean);
      if (!anims.length) return;
      let last = scrollY, lastT = performance.now(), rate = 1;
      const loop = (now) => {
        const dy = scrollY - last;
        const dt = Math.max(16, now - lastT);
        last = scrollY; lastT = now;
        const target = Math.max(-5, Math.min(6, 1 + (dy / dt) * 2.2));
        rate += (target - rate) * 0.08;
        anims.forEach((a) => { a.playbackRate = rate; });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },

    /* ---------- 숫자 카운트업 ---------- */
    countUp(el, duration = 1.4) {
      const to = Number(el.dataset.to) || 0;
      if (FX.reduce) { el.textContent = to; return; }
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / (duration * 1000));
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = 0;
      requestAnimationFrame(tick);
    },

    /* 뷰포트에 들어오면 한 번 실행 (GSAP 없이도 동작하는 트리거) */
    onEnter(el, fn, threshold = 0.35) {
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); } });
      }, { threshold });
      io.observe(el);
    }
  };

  window.KKDFX = FX;
  if (FX.reduce) document.documentElement.classList.add('motion-off'); // CSS 배경 애니메이션도 정지
})();
