/* ==========================================================================
   KOKODAN — CONTENT FILE
   --------------------------------------------------------------------------
   텍스트와 사진 경로는 거의 전부 이 파일에서 수정합니다.
   (히어로/엔딩 문구와 영상 경로는 index.html 의 "HERO COPY", "HERO VIDEO",
    "ENDING COPY" 주석 위치에 있습니다.)
   ========================================================================== */

window.KOKODAN = {

  /* ===== TEAM INFORMATION =====
     - nameEn / nameKo / role / specialty / oneLiner : 화면에 보이는 텍스트
     - photo    : ===== MEMBER PHOTOS ===== 사진 경로 (배경 제거된 PNG 추천)
     - accent   : 'hot' | 'violet' | 'acid'  (포인트 컬러)
     - theme    : 'ink'(어두운 배경) | 'cream'(밝은 배경)
     - entrance : 'slide' | 'zoom' | 'impact'  (등장 연출 — js/scenes.js)
     - stats    : value 는 0~100, display 를 넣으면 숫자 대신 그 글자를 표시     */
  members: [
    {
      id: 'ahmed',
      number: '01',
      nameEn: 'AHMED',
      nameKo: '아메드',
      codename: 'CODENAME: SPARK',
      role: 'The Instigator',
      roleKo: '일 벌이기 담당',
      specialty: '아무도 안 물어본 아이디어를 회의 시작 3분 만에 던지기',
      oneLiner: '일단 해보고, 설명은 나중에 할게요.',
      photo: 'assets/ahmed.png',          // ← MEMBER PHOTO
      accent: 'hot',
      theme: 'ink',
      entrance: 'slide',
      stats: [
        { label: '아이디어 발사 속도', value: 97 },
        { label: '회의록 작성 확률', value: 8 },
        { label: '근거 없는 자신감', value: 100, display: 'MAX' }
      ]
    },
    {
      id: 'dongkyu',
      number: '02',
      nameEn: 'DONGKYU',
      nameKo: '김동규',
      codename: 'CODENAME: BLUEPRINT',
      role: 'The Strategist',
      roleKo: '계획 담당',
      specialty: '혼돈을 깔끔한 표 한 장으로 바꾸는 능력',
      oneLiner: '그 변수, 이미 세 수 앞에서 계산해 뒀습니다.',
      photo: 'assets/dongkyu.png',        // ← MEMBER PHOTO
      accent: 'violet',
      theme: 'cream',
      entrance: 'zoom',
      stats: [
        { label: '계산 속도', value: 95 },
        { label: '표정 변화', value: 6 },
        { label: '플랜 B 보유량', value: 100, display: '∞' }
      ]
    },
    {
      id: 'gahyun',
      number: '03',
      nameEn: 'GAHYUN',
      nameKo: '이가현',
      codename: 'CODENAME: FINAL BOSS',
      role: 'The Finisher',
      roleKo: '마무리 담당',
      specialty: '"거의 다 됐어요"를 진짜 "다 됐어요"로 만드는 기술',
      oneLiner: '시작은 둘이 했고, 끝은 제가 냅니다.',
      photo: 'assets/gahyun.png',         // ← MEMBER PHOTO
      accent: 'acid',
      theme: 'ink',
      entrance: 'impact',
      stats: [
        { label: '완성도', value: 99 },
        { label: '디테일 집착', value: 98 },
        { label: '마감 앞 자비', value: 0, display: '0' }
      ]
    }
  ],

  /* ===== MISSIONS (작전 브리핑) =====
     - target + verb : 제목 ("재미없는 아이디어" + "제거")
     - fx : 'strike'(줄 긋기) | 'snatch'(납치) | 'build'(형광펜) | 'redacted'(전부 가림)
     - desc 안의 [[텍스트]] 는 검은 줄로 가려지고, 마우스를 올리면 보입니다.     */
  missions: [
    {
      no: '01',
      target: '재미없는 아이디어',
      verb: '제거',
      fx: 'strike',
      desc: '회의실을 떠도는 "무난한데요?"를 추적해 [[아주 조용히]] 처리합니다.',
      status: '상시 진행 중',
      risk: '낮음 (아이디어 본인에겐 높음)'
    },
    {
      no: '02',
      target: '평범한 결과물',
      verb: '납치',
      fx: 'snatch',
      desc: '평범해질 뻔한 결과물을 [[몸값 없이]] 데려와 처음부터 다시 교육시킵니다.',
      status: '작전 수행 중',
      risk: '중간 (반항 가능성 있음)'
    },
    {
      no: '03',
      target: '재미있는 결과물',
      verb: '제작',
      fx: 'build',
      desc: '결국 사람들이 "이거 누가 만들었어?"라고 묻게 만듭니다. 이게 [[처음부터 진짜 목적]]이었습니다.',
      status: '성공률 높음 (자체 평가)',
      risk: '재미 과다 복용'
    },
    {
      no: '04',
      target: '[[세계 정복]]',
      verb: '',
      fx: 'redacted',
      desc: '[[아직 말할 수 없음. 사실 아직 안 정함.]]',
      status: '[[미정]]',
      risk: '[[모름]]'
    }
  ],

  /* ===== CHEMISTRY (단체사진 섹션) =====
     - photo  : ===== TEAM PHOTO ===== 단체사진 경로
     - labels : 사진 주변에 떠다니는 낙서. x/y 는 무대 기준 % 위치,
                depth 는 마우스 패럴랙스 강도, style: tape | marker | circle | stamp  */
  chemistry: {
    photo: 'assets/team-photo.png',       // ← TEAM PHOTO
    labels: [
      { text: 'CHAOS', x: 4,  y: 10, depth: 1.6, rot: -9, style: 'tape' },
      { text: 'IDEA',  x: 80, y: 6,  depth: 1.1, rot: 6,  style: 'circle' },
      { text: 'BUILD', x: 88, y: 58, depth: 1.8, rot: -4, style: 'stamp' },
      { text: 'SHIP',  x: 2,  y: 72, depth: 1.3, rot: 5,  style: 'marker' },
      { text: '???',   x: 58, y: 88, depth: 2.2, rot: -12, style: 'tape' },
      { text: '간식?', x: 30, y: -4, depth: 0.8, rot: 3,  style: 'marker' }
    ],
    stats: [
      { value: 12,  suffix: '%', label: '회의 중 실제 회의 비율' },
      { value: 47,  suffix: '회', label: '하루 평균 "오 그거 좋다"' },
      { value: null, display: '∞', label: '마감 전날 집중력' }
    ]
  },

  /* ===== EASTER EGG (엔딩의 To be continued... 클릭) ===== */
  easterEgg: {
    question: '비밀 작전에 참여하시겠습니까?',
    yes: '참여한다',
    no: '아니요',
    noDodges: ['앗', '거절은', '받지 않습니다', '...알겠어요, 눌러보세요'],
    result: '이미 늦었습니다.',
    after: '당신은 방금 코코단 4번째 요원(무급)으로 등록되었습니다. 탈퇴 버튼은 없습니다.'
  }
};
