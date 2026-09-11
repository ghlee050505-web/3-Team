/* ==========================================================================
   MAIN — 부트스트랩: 콘텐츠 렌더 → 스무스 스크롤 → 히어로 → 스크롤 씬 → 이스터에그
   ========================================================================== */
(function () {
  'use strict';

  const FX = window.KKDFX;
  const $ = (s, r = document) => r.querySelector(s);
  const hasST = () => !!(window.gsap && window.ScrollTrigger);

  /* ---------- 대형 한 줄 타이포 폭 맞춤 ---------- */
  function fitAll() {
    // 글자 분리 후에 측정해야 함 (분리하면 커닝이 사라져 폭이 조금 넓어짐)
    const targets = [
      [$('.title__en'), $('.hero__title')],
      [$('.ending__name'), $('.ending__title')],
      // 팀원 이름은 content.js 에서 바뀔 수 있으므로 칼럼 폭에 맞춤
      ...[...document.querySelectorAll('.member__name .en')].map((el) => [el, el.closest('.member__info')])
    ];
    targets.forEach(([el, box]) => {
      if (!el) return;
      if (window.gsap && !FX.reduce) FX.splitChars(el);
      FX.fitText(el, box);
    });
  }

  /* ---------- Lenis 스무스 스크롤 (+ ScrollTrigger 동기화) ---------- */
  function smoothScroll() {
    if (!window.Lenis || !hasST() || FX.reduce) return null;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true
    });
    window.KKDLenis = lenis; // 디버그/외부 제어용 (예: KKDLenis.scrollTo('#ending'))
    lenis.on('scroll', ScrollTrigger.update);
    // 핀 스페이서가 추가/변경되면 Lenis 의 최대 스크롤 값도 다시 계산
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = $(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.6 });
      });
    });
    return lenis;
  }

  /* ===== EASTER EGG =====  (문구는 js/content.js → easterEgg) */
  function easterEgg() {
    const E = (window.KOKODAN || {}).easterEgg;
    const tbc = $('#tbc'), panel = $('#eggPanel'), yes = $('#eggYes'), no = $('#eggNo');
    const result = $('#eggResult'), ending = $('#ending');
    if (!E || !tbc || !panel) return;

    tbc.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      tbc.setAttribute('aria-expanded', String(open));
      if (open && window.gsap && !FX.reduce) {
        gsap.fromTo(panel, { autoAlpha: 0, y: 14, clipPath: 'inset(0 0 100% 0)' },
          { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: .6, ease: 'expo.out' });
      }
    });

    // "아니요" 버튼은 몇 번 도망갑니다 (마우스일 때만 — 터치에선 바로 누를 수 있음)
    let dodges = 0;
    const last = E.noDodges.length - 1;
    no.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || dodges >= last || no.disabled) return;
      const dx = -40 - Math.random() * 110;
      const dy = (Math.random() - .5) * 46;
      no.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() - .5) * 14}deg)`;
      no.textContent = E.noDodges[dodges++];
      if (dodges === last) {
        setTimeout(() => { no.style.transform = ''; no.textContent = E.noDodges[last]; }, 800);
      }
    });

    const late = () => {
      if (result.dataset.done) return;
      result.dataset.done = '1';
      yes.disabled = no.disabled = true;
      yes.style.opacity = no.style.opacity = .35;
      no.style.transform = '';

      const strong = document.createElement('strong');
      strong.textContent = E.result;
      result.appendChild(strong);
      ending.classList.remove('is-late');
      void ending.offsetWidth;
      ending.classList.add('is-late');
      window.KKDHero && window.KKDHero.glitch();

      if (window.gsap && !FX.reduce) {
        gsap.from(FX.splitChars(strong), { yPercent: 120, autoAlpha: 0, stagger: .06, duration: .5, ease: 'back.out(2)' });
      }
      setTimeout(() => {
        const p = document.createElement('p');
        p.textContent = E.after;
        result.appendChild(p);
        window.gsap && gsap.from(p, { autoAlpha: 0, y: 8, duration: .6 });
      }, 1100);
    };
    yes.addEventListener('click', late);
    no.addEventListener('click', late);
  }

  /* ---------- boot ---------- */
  function boot() {
    // 오프닝 연출은 항상 맨 위에서 시작 (새로고침 시 스크롤 위치 복원 끄기)
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) window.scrollTo(0, 0);

    window.KKDRender && window.KKDRender.all();
    if (hasST()) gsap.registerPlugin(ScrollTrigger);

    FX.hud();
    FX.cursor();
    FX.marquee();
    smoothScroll();
    easterEgg();

    // 폰트가 준비된 뒤에 글자 측정/분리 (최대 2.5초 대기)
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      fitAll();
      window.KKDHero && window.KKDHero.init();
      window.KKDScenes && window.KKDScenes.init();
      hasST() && ScrollTrigger.refresh();
    });

    let rt;
    let lastW = innerWidth;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (innerWidth === lastW) return; // 모바일 주소창 높이 변화는 무시
        lastW = innerWidth;
        fitAll();
        hasST() && ScrollTrigger.refresh();
      }, 200);
    });

    console.log('%c코코단은 오늘도 무언가를 꾸미고 있습니다.', 'font:700 14px sans-serif;color:#FF3B6B');
    console.log('%c소스를 들여다보고 있다면… 당신도 이미 늦었습니다.', 'font:12px monospace;color:#C9FF3B;background:#0F0E0D;padding:2px 6px');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
