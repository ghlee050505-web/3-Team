/* ==========================================================================
   RENDER — js/content.js 데이터를 HTML 로 만들어 넣습니다.
   (디자인 구조를 바꾸고 싶을 때만 수정하세요. 텍스트는 content.js 에서.)
   ========================================================================== */
(function () {
  'use strict';

  const C = window.KOKODAN || {};
  const $ = (sel, root = document) => root.querySelector(sel);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  // [[텍스트]] → 검은 줄로 가려진 텍스트 (hover / focus 시 공개)
  const redact = (s) => esc(s).replace(
    /\[\[(.+?)\]\]/g,
    '<span class="redact" tabindex="0" data-cursor="REVEAL"><span>$1</span></span>'
  );

  const ACCENTS = {
    hot:    { c: 'var(--hot)',    on: 'var(--ink)' },
    violet: { c: 'var(--violet)', on: 'var(--cream)' },
    acid:   { c: 'var(--acid)',   on: 'var(--ink)' }
  };

  /* 이미지가 실제로 있을 때만 붙이고, 없으면 placeholder 유지 */
  function loadImage(target, src, alt, className, onReady) {
    if (!src || !target) return;
    const img = new Image();
    img.className = className;
    img.alt = alt || '';
    img.decoding = 'async';
    img.onload = () => { target.appendChild(img); onReady && onReady(img); };
    img.onerror = () => { /* 파일 없음 → placeholder 그대로 */ };
    img.src = src;
  }

  /* ---------- placeholder silhouettes ---------- */
  function silhouette(id) {
    return `
      <svg class="sil" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <pattern id="ht-${id}" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="2" style="fill:var(--accent)"/>
          </pattern>
          <linearGradient id="fade-${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#fff" stop-opacity="1"/>
          </linearGradient>
          <mask id="m-${id}"><rect width="400" height="500" fill="url(#fade-${id})"/></mask>
        </defs>
        <path class="sil__body" d="M200 64c54 0 94 42 94 100 0 46-23 84-55 101v20c90 19 152 73 161 155v60H0v-60c9-82 71-136 161-155v-20c-32-17-55-55-55-101 0-58 40-100 94-100Z"/>
        <path d="M200 64c54 0 94 42 94 100 0 46-23 84-55 101v20c90 19 152 73 161 155v60H0v-60c9-82 71-136 161-155v-20c-32-17-55-55-55-101 0-58 40-100 94-100Z" fill="url(#ht-${id})" mask="url(#m-${id})" opacity=".55"/>
      </svg>`;
  }

  function groupSilhouettes() {
    const one = (x, s) => `<path transform="translate(${x} ${120 - s * 120}) scale(${s})" d="M100 32c27 0 47 21 47 50 0 23-12 42-28 51v10c45 9 76 36 81 77v30H0v-30c5-41 36-68 81-77v-10c-16-9-28-28-28-51 0-29 20-50 47-50Z"/>`;
    return `<svg class="sil sil--group" viewBox="0 0 600 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g>${one(40, .92)}${one(200, 1.04)}${one(370, .96)}</g></svg>`;
  }

  /* ---------- entrance-specific FX layers ---------- */
  function speedlines() {
    let lines = '';
    for (let i = 0; i < 11; i++) {
      const top = (6 + i * 8.4 + Math.random() * 4).toFixed(1);
      const w = (18 + Math.random() * 40).toFixed(0);
      const h = Math.random() > .7 ? 3 : 1;
      lines += `<i style="top:${top}%;width:${w}%;height:${h}px"></i>`;
    }
    return `<div class="speedlines" aria-hidden="true">${lines}</div>`;
  }
  const viewfinder = () => `
    <div class="viewfinder" aria-hidden="true">
      <i></i><i></i><i></i><i></i><b class="vf-cross"></b>
      <span class="vf-readout label">FOCUS <em>0.00</em> · CALCULATING</span>
    </div>`;
  const impactFx = () => `<div class="impact" aria-hidden="true"><span class="flash"></span><span class="burst"></span></div>`;

  /* ===== MEMBERS ===== */
  function memberHTML(m, i, total) {
    const a = ACCENTS[m.accent] || ACCENTS.hot;
    const flip = i % 2 === 1 ? ' member--flip' : '';
    const hud = m.theme === 'cream' ? ' data-hud="light"' : '';
    const stats = (m.stats || []).map((s) => `
      <li>
        <span class="k">${esc(s.label)}</span>
        <span class="bar"><i style="--v:${Math.max(0, Math.min(100, s.value)) / 100}"></i></span>
        <b>${esc(s.display != null ? s.display : s.value)}</b>
      </li>`).join('');

    return `
    <article class="member member--${esc(m.id)} theme-${esc(m.theme || 'ink')}${flip}"
      id="member-${esc(m.id)}" data-entrance="${esc(m.entrance)}"
      data-section="${esc(m.number)} ${esc(m.nameEn)}"${hud}
      style="--accent:${a.c};--on-accent:${a.on}">

      <span class="member__num" aria-hidden="true">${esc(m.number)}</span>
      ${m.entrance === 'slide' ? speedlines() : ''}
      ${m.entrance === 'impact' ? impactFx() : ''}

      <div class="member__inner">
        <figure class="member__portrait" data-cursor="SUSPECT ${esc(m.number)}">
          <div class="member__slab"></div>
          <div class="member__photo">
            <!-- MEMBER PHOTO PLACEHOLDER -->
            <div class="member__ph">
              ${silhouette(m.id)}
              <span class="member__q">?</span>
              <span class="member__phlabel label">PHOTO PLACEHOLDER<code>${esc(m.photo)}</code></span>
            </div>
          </div>
          ${m.entrance === 'zoom' ? viewfinder() : ''}
          <figcaption class="member__tag label"><span>${esc(m.codename)}</span><span>FIG.${esc(m.number)}</span></figcaption>
        </figure>

        <div class="member__info">
          <p class="member__kicker label"><b>${esc(m.number)}</b><span>${esc(m.nameEn)}</span><span class="of">/ ${String(total).padStart(2, '0')}</span></p>
          <h3 class="member__name">
            <span class="en">${esc(m.nameEn)}</span>
            <span class="ko">${esc(m.nameKo)}</span>
          </h3>
          <dl class="member__spec">
            <div class="row"><dt>NAME</dt><dd>${esc(m.nameKo)} <span class="dim">· ${esc(m.nameEn)}</span></dd></div>
            <div class="row"><dt>ROLE</dt><dd><strong>${esc(m.role)}</strong> <span class="dim">${esc(m.roleKo)}</span></dd></div>
            <div class="row"><dt>SPECIALTY</dt><dd>${esc(m.specialty)}</dd></div>
          </dl>
          <blockquote class="member__quote">
            <span class="label">ONE-LINER</span>
            <p><span class="qm">“</span>${esc(m.oneLiner)}<span class="qm">”</span></p>
          </blockquote>
          <ul class="member__stats">${stats}</ul>
        </div>
      </div>

      ${m.entrance === 'impact' ? '<div class="member__stamp" aria-hidden="true">LAST BUT<br>NOT LEAST</div>' : ''}
    </article>`;
  }

  function renderMembers() {
    const mount = $('#crewMount');
    if (!mount || !C.members) return;
    mount.innerHTML = C.members.map((m, i) => memberHTML(m, i, C.members.length)).join('');
    C.members.forEach((m) => {
      const fig = $(`#member-${m.id} .member__portrait`);
      loadImage($('.member__photo', fig), m.photo, `${m.nameKo} (${m.nameEn})`, 'member__img',
        () => fig.classList.add('has-photo'));
    });
  }

  /* ===== MISSIONS ===== */
  function renderMissions() {
    const mount = $('#opsMount');
    if (!mount || !C.missions) return;
    mount.innerHTML = C.missions.map((op) => {
      const extra = op.fx === 'strike'
        ? '<svg class="op__scribble" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path d="M4 27C52 13 98 31 150 19S250 9 296 23"/><path d="M10 33C80 22 160 34 290 16"/></svg>'
        : op.fx === 'snatch' ? '<span class="op__ghost label" aria-hidden="true">(납치됨)</span>' : '';
      return `
      <li class="op op--${esc(op.fx)}" data-fx="${esc(op.fx)}">
        <div class="op__no"><span class="label">OPERATION</span><b>${esc(op.no)}</b></div>
        <div class="op__main">
          <h3 class="op__title">
            <span class="op__target"><span class="op__target-text">${redact(op.target)}</span>${extra}</span>
            ${op.verb ? `<span class="op__verb">${esc(op.verb)}</span>` : ''}
          </h3>
          <p class="op__desc">${redact(op.desc)}</p>
        </div>
        <dl class="op__meta label">
          <div><dt>STATUS</dt><dd>${redact(op.status)}</dd></div>
          <div><dt>RISK</dt><dd>${redact(op.risk)}</dd></div>
        </dl>
      </li>`;
    }).join('');
  }

  /* ===== CHEMISTRY ===== */
  function renderChemistry() {
    const chem = C.chemistry;
    const photo = $('#chemPhoto');
    const doodles = $('#chemDoodles');
    const stats = $('#chemStats');
    if (!chem) return;

    if (photo) {
      photo.innerHTML = `
        <div class="chem__frame">
          <!-- TEAM PHOTO PLACEHOLDER -->
          <div class="chem__ph">
            ${groupSilhouettes()}
            <span class="chem__phlabel label">TEAM PHOTO PLACEHOLDER<code>${esc(chem.photo)}</code></span>
          </div>
          <span class="chem__tape chem__tape--l"></span><span class="chem__tape chem__tape--r"></span>
        </div>
        <figcaption class="label">FIG. C — 좌측부터 아메드, 김동규, 이가현 (추정)</figcaption>`;
      const frame = $('.chem__frame', photo);
      loadImage(frame, chem.photo, '코코단 단체사진', 'chem__img', () => photo.classList.add('has-photo'));
    }

    if (doodles) {
      const circle = '<svg class="doodle__circle" viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true"><path d="M112 8C54 2 8 20 10 46s58 40 110 36 76-22 72-44S130 4 70 14"/></svg>';
      doodles.innerHTML = (chem.labels || []).map((l) => `
        <div class="doodle doodle--${esc(l.style)}" data-depth="${Number(l.depth) || 1}"
          style="left:${l.x}%;top:${l.y}%;--rot:${l.rot || 0}deg">
          <span class="doodle__in">${esc(l.text)}${l.style === 'circle' ? circle : ''}</span>
        </div>`).join('') + `
        <div class="doodle doodle--arrow" data-depth="1.4" style="left:66%;top:22%;--rot:0deg" aria-hidden="true">
          <span class="doodle__in">
            <em>범인들</em>
            <svg viewBox="0 0 120 70"><path d="M6 10c30-8 70 0 92 40"/><path d="M84 46l15 6 2-16"/></svg>
          </span>
        </div>`;
    }

    if (stats) {
      stats.innerHTML = (chem.stats || []).map((s) => `
        <li>
          <b>${s.value == null
            ? esc(s.display)
            : `<span class="count" data-to="${Number(s.value)}">${Number(s.value)}</span><small>${esc(s.suffix || '')}</small>`}</b>
          <p>${esc(s.label)}</p>
        </li>`).join('');
    }
  }

  /* ===== EASTER EGG ===== */
  function renderEgg() {
    const e = C.easterEgg;
    if (!e) return;
    $('#eggQ') && ($('#eggQ').textContent = e.question);
    $('#eggYes') && ($('#eggYes').textContent = e.yes);
    $('#eggNo') && ($('#eggNo').textContent = e.no);
  }

  window.KKDRender = {
    all() { renderMembers(); renderMissions(); renderChemistry(); renderEgg(); }
  };
})();
