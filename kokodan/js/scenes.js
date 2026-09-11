/* ==========================================================================
   SCENES — 스크롤 애니메이션 (GSAP + ScrollTrigger)
   섹션별 함수로 나눠 두었습니다. 각 함수의 desktop 인자가 false 면 가벼운 버전.
   ========================================================================== */
(function () {
  'use strict';

  const FX = window.KKDFX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- GSAP 없음 / 모션 감소: 정적 레이아웃 + 최소 상태 변화만 ---------- */
  function fallback() {
    const il = $('.interlude');
    il && il.classList.add('is-static');
    $$('.op').forEach((op) => FX.onEnter(op, (el) => el.classList.add('is-done'), .5));
    $$('.count').forEach((c) => FX.onEnter(c, (el) => FX.countUp(el)));
  }

  /* ===== HERO: 스크롤로 빠져나갈 때 살짝 밀려나는 깊이감 ===== */
  function heroExit() {
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__video, .hero__placeholder', { scale: 1.1, yPercent: 10, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__title', { yPercent: -18, ease: 'none', scrollTrigger: st });
  }

  /* ===== INTERLUDE: "근데 얘네가 누구냐고?" → MEET THE CREW (핀 고정 타임라인) ===== */
  function interlude(desktop) {
    const sec = $('.interlude');
    if (!sec) return;
    const words = $$('.interlude__q .w > span');
    const sub = $('.interlude__sub');
    const meet = $('.interlude__meet');
    const meetParts = $$('.interlude__meet > span');
    const count = $('.interlude__count');

    if (!desktop) {
      sec.classList.add('is-static');
      gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 70%', once: true } })
        .from(words, { yPercent: 110, stagger: .1, duration: .8, ease: 'expo.out' })
        .from(sub, { autoAlpha: 0, y: 12, duration: .6 }, '-=.4')
        .from(meetParts, { autoAlpha: 0, y: 40, stagger: .1, duration: .8, ease: 'expo.out' }, '-=.2')
        .from(count, { autoAlpha: 0, duration: .5 }, '-=.3');
      return () => sec.classList.remove('is-static');
    }

    sec.classList.remove('is-static');
    gsap.set([meet, count], { autoAlpha: 0 });
    gsap.timeline({
      scrollTrigger: { trigger: '.interlude__pin', start: 'top top', end: '+=240%', pin: true, scrub: .8, anticipatePin: 1 }
    })
      .from(words, { yPercent: 115, rotate: 5, stagger: .14, duration: .5, ease: 'power3.out' })
      .from(sub, { autoAlpha: 0, y: 20, duration: .35 }, '-=.15')
      .to({}, { duration: .4 })
      .to('.interlude__ask', { yPercent: -25, autoAlpha: 0, filter: 'blur(12px)', duration: .5, ease: 'power2.in' })
      .set(meet, { autoAlpha: 1 })
      .fromTo(meetParts,
        { autoAlpha: 0, scale: .35, filter: 'blur(18px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', stagger: .12, duration: .6, ease: 'power3.out' }, '<')
      .fromTo(meet, { '--ls': .4 }, { '--ls': FX.restVar(meet, '--ls'), duration: .8, ease: 'power3.out' }, '<')
      .to(count, { autoAlpha: 1, duration: .3 }, '-=.2')
      .to({}, { duration: .45 })
      // 카메라가 글자를 뚫고 지나가듯 → 첫 멤버로
      .to(meet, { scale: 7, autoAlpha: 0, duration: .8, ease: 'power2.in' })
      .to(count, { autoAlpha: 0, duration: .3 }, '<');
  }

  /* ===== MEMBERS ===== */
  // 공통 정보 리빌 (kicker → 한글 이름 태그 → 스펙 → 한 줄 → 스탯)
  function infoIn(m, rowsFx) {
    const rows = $$('.member__spec .row', m);
    const tl = gsap.timeline();
    tl.from($('.member__kicker', m), { autoAlpha: 0, y: 12, duration: .5, ease: 'power3.out' })
      .from($('.member__name .ko', m), { scale: 0, rotate: -24, duration: .6, ease: 'back.out(2.6)' }, .25);
    if (rowsFx === 'clip') {
      tl.fromTo(rows, { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', stagger: .14, duration: .7, ease: 'power2.inOut' }, .2);
    } else {
      tl.from(rows, { autoAlpha: 0, y: 16, stagger: .07, duration: .55, ease: 'power3.out' }, .2);
    }
    tl.from($('.member__quote', m), { autoAlpha: 0, y: 20, duration: .6, ease: 'power3.out' }, .45)
      .from($$('.member__stats .bar i', m), { scaleX: 0, stagger: .09, duration: 1, ease: 'expo.out' }, .55);
    return tl;
  }

  // 01 · slide — 화면 밖에서 빠르게 슬라이드 (속도선 + 모션블러)
  function enterSlide(m, desktop) {
    const lines = $$('.speedlines i', m);
    const chars = FX.splitChars($('.member__name .en', m));
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 62%', once: true } });
    if (desktop) {
      tl.fromTo(lines, { scaleX: 0, autoAlpha: .9, xPercent: 0 },
        { scaleX: 1, duration: .3, stagger: { each: .02, from: 'random' }, ease: 'power2.out' }, 0)
        .to(lines, { xPercent: -260, autoAlpha: 0, duration: .5, stagger: { each: .02, from: 'random' }, ease: 'power2.in' }, .25);
    }
    tl.from($('.member__portrait', m), { xPercent: desktop ? 130 : 60, skewX: desktop ? -14 : 0, duration: .9, ease: 'expo.out' }, .05)
      .fromTo($('.member__photo', m), { filter: `blur(${desktop ? 12 : 4}px)` }, { filter: 'blur(0px)', duration: .6 }, .1)
      .from($('.member__slab', m), { scaleY: 0, transformOrigin: '50% 100%', duration: .7, ease: 'expo.out' }, .3)
      .from(chars, { xPercent: 80, autoAlpha: 0, stagger: .035, duration: .6, ease: 'expo.out' }, .3)
      .add(infoIn(m), .4);
  }

  // 02 · zoom — 카메라 줌 인 + 초점 맞추기 (스크롤과 함께 천천히)
  function enterZoom(m, desktop) {
    const readout = $('.vf-readout em', m);
    const chars = FX.splitChars($('.member__name .en', m));
    gsap.timeline({
      scrollTrigger: {
        trigger: m, start: 'top 90%', end: desktop ? 'center 55%' : 'top 25%', scrub: 1,
        onUpdate: (self) => {
          if (readout) readout.textContent = self.progress >= .99 ? 'LOCKED' : self.progress.toFixed(2);
        }
      }
    })
      .fromTo($('.member__portrait', m), { scale: 1.25 }, { scale: 1, ease: 'power2.out' }, 0)
      .fromTo([$('.member__slab', m), $('.member__photo', m)],
        { clipPath: 'inset(34% 28% 34% 28%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut' }, 0)
      .fromTo($('.member__photo', m), { filter: 'blur(14px)' }, { filter: 'blur(0px)', ease: 'power2.out' }, 0)
      .fromTo($('.viewfinder', m), { scale: 1.3, autoAlpha: .2 }, { scale: 1, autoAlpha: 1, ease: 'power2.out' }, 0);

    gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 40%', once: true } })
      .from(chars, { autoAlpha: 0, duration: .01, stagger: .07, ease: 'none' }) // 계산하듯 한 글자씩
      .add(infoIn(m, 'clip'), .1);
  }

  // 03 · impact — 마지막 멤버: 플래시 → 낙하 → 충격파 → 화면 흔들림 → 도장
  function enterImpact(m, desktop) {
    const inner = $('.member__inner', m);
    const chars = FX.splitChars($('.member__name .en', m));
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 55%', once: true } });
    tl.fromTo($('.member__portrait', m),
      { autoAlpha: 0, scale: desktop ? 1.6 : 1.25, y: desktop ? -90 : -30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: .42, ease: 'expo.in' }, 0)
      .fromTo($('.impact .flash', m), { autoAlpha: 0 }, { autoAlpha: .85, duration: .06, ease: 'none' }, .4)
      .to($('.impact .flash', m), { autoAlpha: 0, duration: .5, ease: 'power2.out' }, .46)
      .fromTo($('.impact .burst', m), { scale: .2, autoAlpha: 1 }, { scale: 1.3, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, .42);
    if (desktop) {
      tl.to(inner, { keyframes: { x: [-16, 13, -9, 6, -3, 0], y: [9, -11, 6, -4, 2, 0] }, duration: .45, ease: 'none' }, .42);
    }
    tl.from(chars, { yPercent: -140, autoAlpha: 0, stagger: .05, duration: .55, ease: 'back.out(3)' }, .55)
      .fromTo($('.member__stamp', m), { scale: 3, autoAlpha: 0, rotate: -32 },
        { scale: 1, autoAlpha: 1, rotate: -9, duration: .38, ease: 'expo.in' }, 1)
      .add(infoIn(m), .75);
  }

  function members(desktop) {
    $$('.member').forEach((m) => {
      const num = $('.member__num', m);
      const base = desktop ? -50 : 0;
      // 거대한 번호 — 느린 패럴랙스
      gsap.fromTo(num, { yPercent: base, y: desktop ? 90 : 30 }, {
        yPercent: base, y: desktop ? -90 : -30, ease: 'none',
        scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      // 다음 장면으로 넘어갈 때 살짝 물러나는 깊이감
      if (desktop) {
        gsap.fromTo($('.member__inner', m), { scale: 1, autoAlpha: 1 }, {
          scale: .94, autoAlpha: .3, ease: 'none',
          scrollTrigger: { trigger: m, start: 'bottom 70%', end: 'bottom top', scrub: true }
        });
      }
      const fx = { slide: enterSlide, zoom: enterZoom, impact: enterImpact }[m.dataset.entrance] || enterSlide;
      fx(m, desktop);
    });
  }

  /* ===== MISSION FILE ===== */
  function missions(desktop) {
    const sec = $('.missions');
    if (!sec) return;
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 65%', once: true } })
      .from('.dossier__bar > *', { autoAlpha: 0, y: -8, stagger: .08, duration: .5 })
      .from('.missions__title .line > span', { yPercent: 110, stagger: .12, duration: 1, ease: 'expo.out' }, .1)
      .fromTo('.stamp', { scale: 2.8, autoAlpha: 0, rotate: -28 },
        { scale: 1, autoAlpha: 1, rotate: -8, duration: .35, ease: 'expo.in' }, .7)
      .to('.dossier', desktop ? { keyframes: { x: [-5, 4, -2, 0] }, duration: .22 } : { duration: 0 }, 1.05);

    $$('.op').forEach((op) => {
      gsap.timeline({ scrollTrigger: { trigger: op, start: 'top 80%', once: true } })
        .from(op.children, { autoAlpha: 0, y: 30, stagger: .08, duration: .7, ease: 'expo.out' })
        .add(() => op.classList.add('is-done'), .35); // CSS 가 줄긋기/납치/형광펜 연출 담당
    });
  }

  /* ===== CHEMISTRY ===== */
  function chem(desktop) {
    const stage = $('#chemStage');
    if (!stage) return;
    const photo = $('#chemPhoto');
    const doodles = $$('.doodle__in', stage);

    gsap.from('.chem__title', { yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.chem', start: 'top 65%', once: true } });

    gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 70%', once: true } })
      .fromTo(photo,
        { clipPath: 'inset(48% 48% 48% 48%)', rotate: -9 },
        { clipPath: 'inset(-20% -20% -20% -20%)', rotate: -1.8, duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from(doodles, { scale: 0, autoAlpha: 0, stagger: .08, duration: .6, ease: 'back.out(2.6)' }, '-=.35');

    gsap.timeline({ scrollTrigger: { trigger: '.chem__formula', start: 'top 85%', once: true } })
      .from('.chem__formula > *', { autoAlpha: 0, y: 26, stagger: .08, duration: .6, ease: 'expo.out' })
      .from('.chem__result', { scale: 0, rotate: -12, duration: .6, ease: 'back.out(2.4)' }, '-=.2');

    $$('.count').forEach((c) => FX.onEnter(c, (el) => FX.countUp(el)));

    // 마우스 패럴랙스 — depth 가 클수록 더 많이 움직임 (데스크톱 전용)
    if (!desktop || !FX.finePointer()) return;
    const layers = $$('[data-depth]', stage).map((el) => ({
      d: parseFloat(el.dataset.depth) || 1,
      x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3.out' })
    }));
    const onMove = (e) => {
      const nx = e.clientX / innerWidth - .5;
      const ny = e.clientY / innerHeight - .5;
      layers.forEach((l) => { l.x(nx * l.d * 34); l.y(ny * l.d * 24); });
    };
    ScrollTrigger.create({
      trigger: '.chem', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => self.isActive ? addEventListener('pointermove', onMove) : removeEventListener('pointermove', onMove)
    });
    return () => removeEventListener('pointermove', onMove);
  }

  /* ===== ENDING: WE ARE / KOKODAN. ===== */
  function ending(desktop) {
    const pin = $('.ending__pin');
    if (!pin) return;
    const we = FX.splitChars($('.ending__we'));
    const name = FX.splitChars($('.ending__name'));
    const dot = name[name.length - 1];
    const nameEl = $('.ending__name');
    const tl = gsap.timeline({
      scrollTrigger: desktop
        ? { trigger: pin, start: 'top top', end: '+=160%', pin: true, scrub: .8, anticipatePin: 1 }
        : { trigger: pin, start: 'top 60%', once: true }
    });
    tl.from(we, { yPercent: 100, autoAlpha: 0, stagger: .05, duration: .5, ease: 'power3.out' })
      .from(name.slice(0, -1), { yPercent: 118, stagger: .06, duration: .7, ease: 'power3.out' }, '-=.15')
      .fromTo(nameEl, { '--ls': .14 }, { '--ls': FX.restVar(nameEl, '--ls'), duration: 1, ease: 'power3.out' }, '<')
      .from(dot, { yPercent: -320, duration: .45, ease: 'bounce.out' }, '-=.2')
      .from('.ending__line', { autoAlpha: 0, y: 26, filter: 'blur(8px)', duration: .6 }, '+=.1')
      .from('.egg', { autoAlpha: 0, duration: .4 }, '+=.1');
    if (desktop) tl.to({}, { duration: .35 });
  }

  /* ---------- init ---------- */
  function init() {
    if (!window.gsap || !window.ScrollTrigger || FX.reduce) { fallback(); return; }
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
      const { desktop } = ctx.conditions;
      heroExit();
      const cleanups = [interlude(desktop), chem(desktop)];
      members(desktop);
      missions(desktop);
      ending(desktop);
      return () => cleanups.forEach((fn) => typeof fn === 'function' && fn());
    });
  }

  window.KKDScenes = { init };
})();
