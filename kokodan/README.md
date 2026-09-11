# KOKODAN — 코코단 팀 소개 랜딩페이지

`index.html`을 브라우저로 열면 바로 동작합니다. (영상/사진이 없어도 placeholder 디자인이 표시됩니다.)

## 미디어 교체 — 파일만 넣으면 끝

`assets/` 폴더에 아래 이름 그대로 넣으세요.

| 파일 | 위치 | 권장 |
|---|---|---|
| `assets/team-video.mp4` | 히어로 풀스크린 영상 | 16:9, H.264, 10~40초, 20MB 이하 |
| `assets/ahmed.png` | 01 AHMED | **배경 제거된 PNG**, 세로 4:5, 1600px 이상 |
| `assets/dongkyu.png` | 02 DONGKYU | 〃 |
| `assets/gahyun.png` | 03 GAHYUN | 〃 |
| `assets/team-photo.png` | 단체사진 섹션 | 가로 3:2 |

- 인물 사진은 배경을 지운 PNG(누끼)를 쓰면 이름 글자 앞으로 인물이 튀어나오는 **캐릭터 포스터** 느낌이 납니다. 일반 사진(JPG)도 동작하며 이 경우 경로의 확장자만 바꾸세요.
- 영상 끝부분(마지막 약 2.5초)에서 `KOKODAN` 타이틀이 등장합니다. 영상은 음소거 자동재생되며 SOUND 버튼으로 소리를 켤 수 있습니다.

## 텍스트 수정 위치

| 수정할 것 | 파일 · 주석 |
|---|---|
| 팀원 이름/역할/특기/한 줄 소개/스탯 | `js/content.js` → `===== TEAM INFORMATION =====` |
| 사진 경로 | `js/content.js` → `===== MEMBER PHOTOS =====`, `===== TEAM PHOTO =====` |
| 작전 브리핑 | `js/content.js` → `===== MISSIONS =====` |
| 떠다니는 라벨·통계 | `js/content.js` → `===== CHEMISTRY =====` |
| 이스터에그 문구 | `js/content.js` → `===== EASTER EGG =====` |
| 히어로 문구 / 영상 경로 | `index.html` → `===== HERO COPY =====`, `===== HERO VIDEO =====` |
| 엔딩 문구 | `index.html` → `===== ENDING COPY =====` |
| 색상·폰트 | `css/base.css` → `:root` 토큰 |

## 파일 구조

```
index.html          구조 (섹션 순서)
css/base.css        디자인 토큰, 타이포, HUD, 그레인, 커서
css/hero.css        히어로 · 경고 테이프 · 인터루드
css/crew.css        팀원 캐릭터 섹션
css/story.css       작전 브리핑 · 단체사진 · 엔딩
js/content.js       ← 텍스트/사진 경로 (가장 자주 수정)
js/render.js        content.js → HTML 생성
js/fx.js            공용 효과 (글자 분리, 커서, HUD, 마퀴)
js/hero.js          영상 재생/콜드오픈/타이틀 연출
js/scenes.js        스크롤 애니메이션 (섹션별 함수)
js/main.js          부트스트랩 (Lenis + GSAP 연결)
```

## 로컬 서버로 보기 (선택)

파일을 더블클릭해도 되지만, 일부 브라우저는 로컬 영상 자동재생을 제한할 수 있습니다.

```bash
npx serve .
```

## 참고

- GSAP + ScrollTrigger, Lenis는 CDN으로 로드됩니다. 오프라인이면 애니메이션 없이 정적인 페이지로 표시됩니다.
- 모바일(900px 미만)에서는 핀 고정·패럴랙스·커스텀 커서를 끄고 가벼운 연출만 사용합니다.
- 기기의 "동작 줄이기"(`prefers-reduced-motion`) 설정이 켜져 있어도 스크롤 연출은 그대로 보이고, 화면 흔들림·마우스 패럴랙스·확대 전환 같은 큰 움직임만 약해집니다.
- 완전히 정적인 버전이 필요하면 주소 뒤에 `?motion=off` 를 붙이세요. (`?motion=full` 은 설정과 상관없이 전체 모션)
