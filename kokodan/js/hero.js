/* ==========================================================================
   HERO — 콜드 오픈 → 영상 재생 → (영상 끝부분) KOKODAN 타이틀 등장
   영상이 없으면 placeholder 모드로 같은 연출을 가짜 타임라인으로 재생합니다.
   ========================================================================== */
(function () {
  'use strict';

  const FX = window.KKDFX;
  const $ = (s, r = document) => r.querySelector(s);

  // ===== HERO TIMING ===== (연출 타이밍 조절은 여기서)
  const CFG = {
    videoWaitMs: 2600,        // 영상 로딩 대기 시간 — 넘으면 placeholder 모드
    titleLead: 2.5,           // 영상이 끝나기 몇 초 전에 타이틀을 띄울지
    placeholderLength: 6.5,   // placeholder 모드의 가짜 영상 길이(초)
    placeholderTitleAt: 3.2,  // placeholder 모드에서 타이틀 등장 시점(초)
    glitchEvery: 7000         // 타이틀 등장 후 가끔 발생하는 글리치 간격(ms)
  };

  const el = {};
  const state = { mode: 'loading', titled: false, inView: true, autoPaused: false, fake: null };
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (t) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}:${pad(Math.floor((t % 1) * 24))}`;

  /* ---------- 영상 파일 존재 여부 확인 ---------- */
  function probeVideo() {
    return new Promise((resolve) => {
      const v = el.video;
      if (!v) return resolve(false);
      let done = false;
      const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
      if (v.readyState >= 2) return finish(true);
      if (v.error || v.networkState === 3) return finish(false); // NETWORK_NO_SOURCE
      v.addEventListener('loadeddata', () => finish(true), { once: true });
      v.addEventListener('error', () => finish(false), { once: true });
      const src = v.querySelector('source');
      src && src.addEventListener('error', () => finish(false), { once: true });
      setTimeout(() => finish(v.readyState >= 2), CFG.videoWaitMs);
    });
  }

  /* ---------- 콜드 오픈: "WHO ARE WE? / 누가 코코단을 불렀는가?" ---------- */
  function coldOpenIn() {
    return new Promise((resolve) => {
      if (!FX.hasGSAP() || FX.reduce) {
        setTimeout(resolve, FX.reduce ? 900 : 0);
        return;
      }
      const blur = FX.isDesktop() ? 14 : 6;
      const chars = FX.splitChars($('.coldopen__line', el.cold));
      gsap.timeline({ onComplete: resolve })
        .from('.coldopen__kicker', { autoAlpha: 0, letterSpacing: '1.2em', duration: 1, ease: 'expo.out' })
        .from(chars, {
          autoAlpha: 0, yPercent: 55, filter: `blur(${blur}px)`,
          duration: .9, stagger: .035, ease: 'expo.out'
        }, '-=.6')
        .to({}, { duration: .75 }); // hold
    });
  }

  function coldOpenOut() {
    if (!FX.hasGSAP()) {
      el.cold.style.display = 'none';
      el.media.style.opacity = 1;
      return;
    }
    gsap.timeline()
      .to(el.cold, {
        autoAlpha: 0, scale: 1.05, filter: FX.reduce ? 'none' : 'blur(12px)',
        duration: FX.reduce ? .3 : .8, ease: 'power2.in'
      })
      .to(el.media, { autoAlpha: 1, duration: FX.reduce ? .3 : 1.4, ease: 'power2.out' }, '-=.45');
    el.hud && el.hud.classList.add('is-on');
  }

  /* ---------- 타이틀 등장 (영화 타이틀처럼: 폭/자간/블러/스케일/글리치) ---------- */
  function glitch() {
    if (FX.reduce) return;
    el.titleEn.classList.remove('is-glitch');
    void el.titleEn.offsetWidth; // 애니메이션 재시작
    el.titleEn.classList.add('is-glitch');
  }

  function revealTitle() {
    if (state.titled) return;
    state.titled = true;
    el.hero.classList.add('is-titled');
    el.title.style.visibility = 'visible';
    el.skip.hidden = true;

    if (!FX.hasGSAP() || FX.reduce) { el.cold.style.visibility = 'hidden'; return; }
    gsap.to(el.cold, { autoAlpha: 0, duration: .3, overwrite: 'auto' }); // 콜드 오픈이 남아 있으면 정리

    const chars = FX.splitChars(el.titleEn);
    const blur = FX.isDesktop() ? 26 : 10;
    gsap.timeline()
      .fromTo(el.titleEn,
        { '--wdth': 62, '--ls': .42 },
        { '--wdth': FX.restVar(el.titleEn, '--wdth'), '--ls': FX.restVar(el.titleEn, '--ls'),
          duration: 1.8, ease: 'expo.out' }, 0)
      .fromTo(chars,
        { autoAlpha: 0, scale: 2.3, filter: `blur(${blur}px)`, yPercent: () => gsap.utils.random(-45, 45) },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', yPercent: 0, duration: 1.25,
          stagger: { each: .055, from: 'center' }, ease: 'expo.out' }, 0)
      .add(glitch, .9)
      .fromTo(el.titleKo,
        { autoAlpha: 0, scale: 0, rotate: -40 },
        { autoAlpha: 1, scale: 1, rotate: -6, duration: .75, ease: 'back.out(2.4)' }, 1.05)
      .from('.hero__tagline .line > span', { yPercent: 110, duration: 1, stagger: .12, ease: 'expo.out' }, 1.25);

    // 신호 탈취 느낌의 글리치 — 히어로가 보일 때만 가끔
    setInterval(() => { if (state.inView && !document.hidden) glitch(); }, CFG.glitchEvery);
  }

  /* ---------- 진행 표시 ---------- */
  function setProgress(t, dur) {
    el.timecode.textContent = fmt(t);
    el.progress.style.transform = `scaleX(${dur ? Math.min(1, t / dur) : 0})`;
  }

  /* ---------- 실제 영상 모드 ---------- */
  function runVideo() {
    const v = el.video;
    v.addEventListener('timeupdate', () => {
      setProgress(v.currentTime, v.duration);
      const lead = Math.min(CFG.titleLead, (v.duration || 0) * 0.4);
      if (v.duration && v.duration - v.currentTime <= lead) revealTitle();
    });
    v.addEventListener('ended', () => {
      el.hero.classList.add('is-ended');
      el.play.textContent = 'REPLAY';
      el.play.dataset.cursor = 'REPLAY';
      revealTitle();
    });

    if (FX.reduce) {           // 모션 감소 설정: 자동재생 하지 않음
      el.play.textContent = 'PLAY';
      revealTitle();
      return;
    }
    const p = v.play();
    p && p.catch(() => {       // 자동재생 차단 시
      el.play.textContent = 'PLAY';
      revealTitle();
    });
  }

  /* ---------- placeholder 모드 (영상 파일 없음) ---------- */
  function runPlaceholder() {
    el.hero.classList.add('is-placeholder');
    el.sound.hidden = true;
    const obj = { t: 0 };
    const update = () => {
      setProgress(obj.t, CFG.placeholderLength);
      if (obj.t >= CFG.placeholderTitleAt) revealTitle();
    };
    if (FX.hasGSAP() && !FX.reduce) {
      state.fake = gsap.to(obj, {
        t: CFG.placeholderLength, duration: CFG.placeholderLength, ease: 'none', onUpdate: update,
        onComplete: () => { el.play.textContent = 'REPLAY'; }
      });
    } else {
      obj.t = CFG.placeholderLength;
      update();
      el.play.hidden = true;
    }
  }

  /* ---------- 컨트롤 ---------- */
  function bindControls() {
    el.play.addEventListener('click', () => {
      if (state.mode === 'video') {
        const v = el.video;
        if (v.ended) { v.currentTime = 0; el.hero.classList.remove('is-ended'); }
        if (v.paused) { v.play(); el.play.textContent = 'PAUSE'; }
        else { v.pause(); el.play.textContent = 'PLAY'; }
        state.autoPaused = false;
      } else if (state.fake) {
        if (state.fake.progress() === 1) { state.fake.restart(); el.play.textContent = 'PAUSE'; }
        else if (state.fake.paused()) { state.fake.resume(); el.play.textContent = 'PAUSE'; }
        else { state.fake.pause(); el.play.textContent = 'PLAY'; }
      }
    });

    el.sound.addEventListener('click', () => {
      const v = el.video;
      v.muted = !v.muted;
      el.sound.innerHTML = `SOUND <b>${v.muted ? 'OFF' : 'ON'}</b>`;
      if (!v.muted && v.paused) { v.play(); el.play.textContent = 'PAUSE'; }
    });

    el.skip.addEventListener('click', () => {
      if (state.mode === 'video' && el.video.duration) {
        el.video.currentTime = Math.max(0, el.video.duration - CFG.titleLead);
      } else if (state.fake) {
        state.fake.progress(CFG.placeholderTitleAt / CFG.placeholderLength);
      }
      revealTitle();
    });

    // 타이틀 전에 스크롤해 버리면 바로 타이틀 공개
    addEventListener('scroll', () => {
      if (!state.titled && state.mode !== 'loading' && scrollY > innerHeight * 0.2) revealTitle();
    }, { passive: true });

    // 히어로가 화면 밖이면 영상 일시정지 (성능)
    new IntersectionObserver(([en]) => {
      state.inView = en.isIntersecting;
      if (state.mode !== 'video') return;
      const v = el.video;
      if (!en.isIntersecting && !v.paused) { v.pause(); state.autoPaused = true; }
      else if (en.isIntersecting && state.autoPaused) { v.play(); state.autoPaused = false; }
    }, { threshold: 0.15 }).observe(el.hero);
  }

  /* ---------- init ---------- */
  async function init() {
    el.hero = $('.hero');
    if (!el.hero) return;
    el.video = $('#heroVideo');
    el.media = $('#heroMedia');
    el.cold = $('#coldopen');
    el.title = $('#heroTitle');
    el.titleEn = $('.title__en');
    el.titleKo = $('.title__ko');
    el.timecode = $('#heroTimecode');
    el.progress = $('#heroProgress');
    el.play = $('#playToggle');
    el.sound = $('#soundToggle');
    el.skip = $('#skipBtn');
    el.hud = $('#hud');

    bindControls();
    const probe = probeVideo();          // 콜드 오픈과 동시에 영상 로딩 확인
    await coldOpenIn();
    const ok = await probe;
    state.mode = ok ? 'video' : 'placeholder';
    coldOpenOut();
    ok ? runVideo() : runPlaceholder();
  }

  window.KKDHero = { init, reveal: revealTitle, glitch };
})();
