document.addEventListener('DOMContentLoaded', () => {

    /* --- Global State --- */
    const state = {
        currentNav: 'tech-area', // curriculum, tech-area, digital-sw, career, game-zone
        currentTech: 'manufacturing',
        currentSub: 'lesson',
        techData: [], // loaded from JSON
        gameMoves: 0,
        gameLocked: false,
        firstCard: null,
        loadingJSON: false,
        dndItems: [] // for drag and drop
    };

    /* --- Data Vault (Content & Quiz) --- */
    const contentVault = {
        manufacturing: {
            title: "제조 기술 (Manufacturing)",
            color: "#AEC6CF",
            video: "t0yI4BjVVUA",
            lesson: `
                <h3>🏭 제조 공정의 이해와 스마트 팩토리</h3>
                <p>제조 기술은 원자재를 가공하여 유용한 제품으로 변화시키는 일련의 과정입니다. 현대 제조는 <strong>투입(Input) → 과정(Process) → 산출(Output) → 되먹임(Feedback)</strong>의 시스템적 접근을 따릅니다.</p>
                <img src="smart_factory_interior_1769008425961.png" alt="Smart Factory" style="width:100%; border-radius:8px; margin:10px 0;">
                
                <h3>📊 품질 관리 (Quality Control)</h3>
                <p>생산 효율을 높이기 위해 <strong>QC 7가지 도구</strong>가 사용됩니다.</p>
                <ul style="margin-left:20px; margin-bottom:15px;">
                    <li><strong>파레토 그림:</strong> 불량 원인의 중요도를 파악</li>
                    <li><strong>히스토그램:</strong> 데이터의 분포 상태 확인</li>
                    <li><strong>특성요인도:</strong> 결과와 원인 간의 관계 규명 (Fishbone Diagram)</li>
                </ul>

                <h3>🤖 4차 산업혁명과 미래 제조</h3>
                <p><strong>스마트 팩토리(Smart Factory)</strong>는 IoT 센서와 AI를 통해 공장 내 모든 설비가 데이터를 주고받으며 자율적으로 공정을 제어합니다. 다품종 소량 생산에 유리하며, 생산 효율을 극대화합니다.</p>
            `,
            rubric: [
                { item: "구조물 안정성", high: "설계도와 일치하며 5kg 하중 견딤", mid: "외형은 유사하나 흔들림 발생", low: "구조가 불안정하여 자립 불가" },
                { item: "재료 가공", high: "절단면이 매끄럽고 치수 오차 ±1mm 이내", mid: "치수 오차 ±3mm 이내", low: "마감이 거칠고 오차 큼" },
                { item: "창의성", high: "독창적인 디자인 패턴 적용", mid: "기존 도안 모방", low: "단순 형태" }
            ],
            // 15 Quiz Questions
            quiz: [
                { q: "제조 기술 시스템의 단계 중 완성된 제품이 나오는 단계는?", a: ["투입", "과정", "산출", "피드백"], c: 2 },
                { q: "품질 관리 도구 중 데이터의 분포를 막대그래프로 나타낸 것은?", a: ["파레토 그림", "히스토그램", "산점도", "체크시트"], c: 1 },
                { q: "스마트 팩토리의 기반 기술이 아닌 것은?", a: ["사물인터넷(IoT)", "빅데이터", "수동 선반", "인공지능"], c: 2 },
                { q: "3D 프린팅 방식 중 재료를 한 층씩 쌓는 방식은?", a: ["적층형", "절삭형", "주조형", "소성형"], c: 0 },
                { q: "금속을 녹여 틀에 부어 만드는 가공법은?", a: ["단조", "주조", "압연", "전조"], c: 1 },
                { q: "선반 가공에서 공작물의 회전 운동과 공구의 무슨 운동을 이용하나?", a: ["회전 운동", "직선 이송 운동", "진동", "낙하"], c: 1 },
                { q: "제조 공정의 효율성을 높이기 위한 자동화 시스템은?", a: ["컨베이어 시스템", "수공업", "가내 수공업", "도제식 교육"], c: 0 },
                { q: "목재의 성질 중 수분에 의해 변형되는 성질은?", a: ["함수율에 따른 수축/팽창", "전기 전도성", "자성", "소성"], c: 0 },
                { q: "합금의 장점이 아닌 것은?", a: ["강도 향상", "녹는점 상승(일반적)", "내식성 향상", "전기저항 증가"], c: 1 },
                { q: "플라스틱 가공법 중 열가소성 수지를 녹여 금형에 주입하는 것은?", a: ["사출 성형", "압축 성형", "진공 성형", "블로우 성형"], c: 0 },
                { q: "세라믹의 특징으로 틀린 것은?", a: ["고온에 강함", "전기가 잘 통함", "내화확성 우수", "잘 깨짐(취성)"], c: 1 },
                { q: "신소재 중 형상기억합금의 특징은?", a: ["일정 온도에서 원래 모양 회복", "전기를 가하면 수축", "빛을 받으면 전류 생성", "매우 가벼움"], c: 0 },
                { q: "표준화(Standardization)의 장점이 아닌 것은?", a: ["호환성 확보", "생산 비용 절감", "품질 균일화", "제품의 개성 극대화"], c: 3 },
                { q: "제품 구상 단계에서 아이디어를 확산하는 기법은?", a: ["브레인스토밍", "평가행렬법", "PMI 기법", "수렴적 사고"], c: 0 },
                { q: "제조업의 서비스화(Servitization) 예시는?", a: ["단순 제품 판매", "렌탈 및 유지보수 서비스 결합", "공장 폐쇄", "원가 절감"], c: 1 }
            ],
            dndTask: {
                title: "제조 기술 시스템 순서 맞추기",
                items: ["투입 (Input)", "과정 (Process)", "산출 (Output)", "되먹임 (Feedback)"],
                correctOrder: [0, 1, 2, 3] // Indices of items array
            }
        },
        construction: {
            title: "건설 기술 (Construction)",
            color: "#FFCC80",
            video: "xG9aN7_CbX4",
            lesson: `
                <h3>🏗️ 하중(Load)과 구조 역학</h3>
                <p>건축물은 다양한 힘을 견뎌야 합니다. <strong>고정하중(Dead Load)</strong>은 건물 자체의 무게이며, <strong>활하중(Live Load)</strong>은 사람이나 가구 등 움직이는 물체의 무게입니다.</p>
                <img src="construction_truss_bridge_1769009041605.png" alt="Truss Bridge" style="width:100%; border-radius:8px; margin:10px 0;">
                
                <h3>🌿 제로 에너지 빌딩 (ZEB)</h3>
                <p>에너지 소비를 최소화(패시브 기술)하고, 신재생 에너지를 생산(액티브 기술)하여 연간 에너지 수지 '0'을 달성하는 건축물입니다.</p>
                
                <h3>🌉 토목 공학의 세계</h3>
                <p>댐, 터널, 교량, 도로 등 사회 기반 시설(SOC)을 건설하여 인류의 삶을 편리하게 합니다.</p>
            `,
            rubric: [
                { item: "하중 지지력", high: "전공책 5권(약 5kg) 이상 1분간 유지", mid: "3kg 유지", low: "즉시 붕괴" },
                { item: "구조적 원리", high: "트러스/아치 구조 명확히 적용", mid: "단순 기둥 구조", low: "구조 없음" },
                { item: "경제성", high: "제한된 재료(A4 2장) 내 완성", mid: "재료 초과 사용", low: "재료 낭비 심함" }
            ],
            quiz: [
                { q: "건물 자체의 무게로, 뼈대나 벽체의 무게를 뜻하는 하중은?", a: ["고정 하중", "활하중", "풍하중", "적설 하중"], c: 0 },
                { q: "삼각형을 기본 단위로 하여 힘을 분산시키는 구조는?", a: ["라멘 구조", "트러스 구조", "일체식 구조", "가구식 구조"], c: 1 },
                { q: "시멘트+물+모래+자갈을 섞은 건설 재료는?", a: ["모르타르", "콘크리트", "철근", "아스팔트"], c: 1 },
                { q: "친환경 건축 기법이 아닌 것은?", a: ["옥상 녹화", "자연 채광", "단열 강화", "전면 유리(단열 미조치)"], c: 3 },
                { q: "교량의 종류 중 케이블로 상판을 지지하는 다리는?", a: ["현수교/사장교", "단순교", "가동교", "라멘교"], c: 0 },
                { q: "건설 기획 단계에서 하는 일이 아닌 것은?", a: ["대지 조사", "타당성 분석", "설계 도면 작성(실시설계)", "사용 승인"], c: 3 },
                { q: "철근 콘크리트에서 철근이 주로 저항하는 힘은?", a: ["압축력", "인장력", "전단력", "비틀림"], c: 1 },
                { q: "도시 계획에서 구역(Zoning)에 포함되지 않는 것은?", a: ["주거 지역", "상업 지역", "공업 지역", "우주 지역"], c: 3 },
                { q: "스마트 시티의 특징은?", a: ["ICT 기술 기반 도시 관리", "인구 감소", "자동차 중심 설계", "환경 오염"], c: 0 },
                { q: "터널 굴착 공법 중 발파를 이용한 공법은?", a: ["NATM 공법", "TBM(쉴드) 공법", "개착식 공법", "침매 공법"], c: 0 },
                { q: "주택 내부 공간 중 '개인적 공간'은?", a: ["거실", "부엌", "침실", "현관"], c: 2 },
                { q: "건설 현장 안전 색상 중 '위험/금지'를 뜻하는 색은?", a: ["빨강", "노랑", "파랑", "녹색"], c: 0 },
                { q: "바닥 난방(온돌)의 주된 열 전달 방식은?", a: ["전도와 복사", "대류만", "복사만", "전도만"], c: 0 },
                { q: "BIM(Building Information Modeling)의 장점은?", a: ["2D 평면 설계", "3D 입체 설계 및 정보 통합", "수작업 도면", "시공 후 설계"], c: 1 },
                { q: "상하수도 시설은 어떤 기술 영역에 속하는가?", a: ["제조", "건설(토목)", "수송", "통신"], c: 1 }
            ],
            dndTask: {
                title: "건설 시공 순서 맞추기",
                items: ["착공 준비 (터파기)", "기초 공사", "골조(뼈대) 공사", "마감 공사"],
                correctOrder: [0, 1, 2, 3]
            }
        },
        transportation: {
            title: "수송 기술 (Transportation)",
            color: "#98FB98",
            video: "c0bfmj6pRNA",
            lesson: `
                <h3>🚗 내연기관 vs 전기자동차(EV)</h3>
                <p>내연기관 효율은 약 30~40%인 반면, 전기차는 배터리와 모터를 사용하여 약 80~90%의 높은 에너지 효율($\\eta$)을 자랑합니다.</p>
                <img src="future_eco_city_uam_1769008501883.png" alt="Future UAM City" style="width:100%; border-radius:8px; margin:10px 0;">
                
                <h3>🛰️ 자율주행과 UAM</h3>
                <p>자율주행은 <strong>Level 0~5</strong>단계로 구분되며, Level 3부터 조건부 자율주행이 가능합니다. <strong>UAM(Urban Air Mobility)</strong>은 도심 상공을 비행하여 교통 체증을 해결하는 3차원 모빌리티입니다.</p>
            `,
            rubric: [
                { item: "충격 흡수", high: "달걀 파손 없음 (크럼플 존 작동)", mid: "달걀 금감", low: "달걀 완전 파손" },
                { item: "주행 거리", high: "목표 지점(5m) 통과", mid: "3m 이상 주행", low: "출발 못함" },
                { item: "디자인 매력도", high: "공기역학적/미적 완성도 높음", mid: "보통", low: "마감 미흡" }
            ],
            quiz: [
                { q: "전기자동차의 핵심 부품이 아닌 것은?", a: ["배터리", "모터", "엔진", "인버터"], c: 2 },
                { q: "자율주행 기술 단계 중 '완전 자동화(운전자 개입 불필요)' 단계는?", a: ["Level 2", "Level 3", "Level 4", "Level 5"], c: 3 },
                { q: "비행기가 날 수 있는 힘(양력)을 설명하는 원리는?", a: ["베르누이의 정리", "옴의 법칙", "훅의 법칙", "관성의 법칙"], c: 0 },
                { q: "하이브리드 자동차(HEV)의 특징은?", a: ["두 가지 동력원 사용", "수소만 사용", "전기만 사용", "가솔린만 사용"], c: 0 },
                { q: "선박에서 방향을 조절하는 장치는?", a: ["스크류", "키(Rudder)", "닻", "선체"], c: 1 },
                { q: "도심 항공 모빌리티를 뜻하는 약어는?", a: ["KTX", "UAM", "SUV", "GTX"], c: 1 },
                { q: "기차 바퀴와 레일 사이의 마찰을 줄여 초고속 주행하는 열차는?", a: ["디젤 기관차", "자기부상열차", "증기 기관차", "전동 킥보드"], c: 1 },
                { q: "드론(무인기)의 4개 프로펠러 중 대각선 방향끼리는?", a: ["같은 방향 회전", "서로 반대 방향 회전", "회전하지 않음", "랜덤 회전"], c: 0 },
                { q: "내연기관의 4행정 사이클 순서는?", a: ["흡입-압축-폭발-배기", "폭발-흡입-압축-배기", "배기-흡입-폭발-압축", "흡입-폭발-압축-배기"], c: 0 },
                { q: "수소연료전지차에서 배출되는 물질은?", a: ["매연", "순수한 물", "이산화탄소", "질소산화물"], c: 1 },
                { q: "로켓이 우주 공간에서 추진하는 원리는?", a: ["작용 반작용", "부력", "양력", "마찰력"], c: 0 },
                { q: "자전거의 동력 전달 장치는?", a: ["핸들", "페달", "체인과 기어", "브레이크"], c: 2 },
                { q: "고속도로에서 차량 간 통신 기술은?", a: ["LTE", "V2X", "Bluetooth", "NFC"], c: 1 },
                { q: "차량 안전 장치 중 급브레이크 시 바퀴 잠김 방지 장치는?", a: ["ABS", "Airbag", "GPS", "ECU"], c: 0 },
                { q: "물류 이동의 효율을 높이기 위한 표준 용기는?", a: ["박스", "컨테이너", "드럼통", "비닐봉투"], c: 1 }
            ],
            dndTask: {
                title: "자율주행 5단계 순서",
                items: ["레벨1 (보조)", "레벨2 (부분 자동)", "레벨3 (조건부)", "레벨5 (완전 자동)"],
                correctOrder: [0, 1, 2, 3]
            }
        },
        communication: {
            title: "통신 기술 (Communication)",
            color: "#CAB5D3",
            video: "_gTVdQeCZw0",
            lesson: `
                <h3>📡 신호의 변환과 전송</h3>
                <p>음성, 영상 등의 정보를 전기적 신호로 변환합니다. <strong>아날로그(연속 신호)</strong>와 <strong>디지털(0과 1의 이산 신호)</strong>의 차이를 이해해야 합니다.</p>
                <img src="communication_iot_network_1769009170318.png" alt="IoT Network" style="width:100%; border-radius:8px; margin:10px 0;">
                
                <h3>🌐 5G와 초연결 사회</h3>
                <p><strong>5G 통신</strong>은 초고속, 초저지연, 초연결을 특징으로 합니다. 자동차(V2X), 가전제품(IoT) 등 모든 사물이 네트워크로 연결됩니다.</p>
            `,
            rubric: [
                { item: "기능 구현", high: "NFC 태그 인식 즉시 반응", mid: "3초 이상 지연 또는 간헐적 오류", low: "인식 불가" },
                { item: "활용성", high: "실생활 문제 해결(자동화 등)", mid: "단순 URL 링크", low: "기능 없음" },
                { item: "발표력", high: "기술 원리를 명확히 설명", mid: "원리 이해 부족", low: "설명 불가" }
            ],
            quiz: [
                { q: "정보를 0과 1의 비트로 표현하는 방식은?", a: ["아날로그", "디지털", "주파수", "모스 부호"], c: 1 },
                { q: "Internet of Things의 약자는?", a: ["IoT", "ICT", "AI", "IoE"], c: 0 },
                { q: "송신자가 정보를 신호로 바꾸는 과정은?", a: ["부호화(Encoding)", "복호화(Decoding)", "채널", "수신"], c: 0 },
                { q: "차세대 이동통신 5G의 특징이 아닌 것은?", a: ["초고속", "초저지연", "초연결", "단방향 통신"], c: 3 },
                { q: "근거리에 있는 기기 간 무선 통신 기술은?", a: ["GPS", "Bluetooth", "LTE", "Fiber"], c: 1 },
                { q: "유선 통신 매체 중 빛을 이용해 전송 속도가 가장 빠른 것은?", a: ["동축 케이블", "트위스트 페어", "광섬유 케이블", "전화선"], c: 2 },
                { q: "정보 보안 3요소 기밀성, 무결성, 그리고?", a: ["가용성", "경제성", "편의성", "개방성"], c: 0 },
                { q: "자신의 창작물에 대한 권리는?", a: ["특허권", "저작권", "초상권", "소유권"], c: 1 },
                { q: "IP 주소에 대한 설명으로 옳은 것은?", a: ["인터넷 상의 컴퓨터 주소", "집 주소", "이메일 주소", "MAC 주소"], c: 0 },
                { q: "위성 통신(GPS)을 이용하기 위해 필요한 최소 위성 수는?", a: ["1개", "2개", "3개", "4개 이상"], c: 3 },
                { q: "클라우드 컴퓨팅의 장점은?", a: ["언제 어디서나 데이터 접근", "보안이 매우 취약", "하드웨어 비용 증가", "속도 저하"], c: 0 },
                { q: "증강현실(AR)의 예는?", a: ["헤드셋 쓰고 가상공간 탐험", "포켓몬GO 게임", "3D 프린터", "홀로그램"], c: 1 },
                { q: "해킹(Hacking)을 막기 위한 장비는?", a: ["라우터", "방화벽(Firewall)", "스위치", "허브"], c: 1 },
                { q: "빅데이터의 3V 특징이 아닌 것은?", a: ["Volume(양)", "Velocity(속도)", "Variety(다양성)", "Visual(시각)"], c: 3 },
                { q: "RFID 기술의 활용 예가 아닌 것은?", a: ["하이패스", "도서관 도난방지", "교통카드", "종이 책 읽기"], c: 3 }
            ],
            dndTask: {
                title: "정보 통신 과정 순서",
                items: ["정보원 (송신자)", "부호화 (Encoding)", "전송 (Channel)", "수신 및 해독"],
                correctOrder: [0, 1, 2, 3]
            }
        },
        biotech: {
            title: "생물 기술 (Biotechnology)",
            color: "#FFAB91",
            video: "RrpqdPiCRm4",
            lesson: `
                <h3>🧬 유전자 기술의 혁명</h3>
                <p><strong>CRISPR-Cas9(유전자 가위)</strong> 기술은 특정 DNA 염기서열을 정밀하게 교정하여 유전병 치료나 품종 개량에 사용됩니다.</p>
                <img src="modern_biotech_lab_1769008582514.png" alt="Biotech Lab" style="width:100%; border-radius:8px; margin:10px 0;">
                
                <h3>🦠 발효와 미생물</h3>
                <p>전통적인 발효 식품(김치, 치즈)부터 바이오 의약품 생산까지 미생물의 대사 작용을 활용합니다.</p>
                
                <h3>♻️ 바이오 에너지</h3>
                <p>옥수수, 사탕수수 등 바이오매스로부터 에탄올, 디젤 등을 생산하여 화석 연료를 대체하는 친환경 기술입니다.</p>
            `,
            rubric: [
                { item: "자료 조사", high: "신뢰성 있는 출처 3곳 이상 인용", mid: "출처 불분명하나 내용 양호", low: "내용 빈약" },
                { item: "기술 이해", high: "CRISPR 원리 정확히 설명", mid: "개념만 언급", low: "오개념 존재" },
                { item: "윤리적 고찰", high: "GMO/유전자 문제의 양면성 논리적 제시", mid: "한쪽 입장만 제시", low: "언급 없음" }
            ],
            quiz: [
                { q: "생물체의 유전 정보를 담고 있는 물질은?", a: ["RNA", "DNA", "단백질", "탄수화물"], c: 1 },
                { q: "원하는 유전자를 잘라내고 붙이는 기술은?", a: ["유전자 재조합", "핵 치환", "발효", "조직 배양"], c: 0 },
                { q: "3세대 유전자 가위 기술의 이름은?", a: ["탈렌", "징크핑거", "크리스퍼(CRISPR)", "가위손"], c: 2 },
                { q: "식물을 흙 없이 재배하는 방식은?", a: ["수경 재배", "노지 재배", "시설 재배", "유기농"], c: 0 },
                { q: "바이오매스로 만드는 에너지가 아닌 것은?", a: ["바이오 에탄올", "바이오 디젤", "바이오 가스", "원자력"], c: 3 },
                { q: "미생물을 이용하여 유용한 물질을 만드는 과정은?", a: ["부패", "발효", "증류", "광합성"], c: 1 },
                { q: "줄기세포의 특징은?", a: ["분화 능력 없음", "특정 조직으로만 분화", "다양한 조직으로 분화 가능", "죽은 세포"], c: 2 },
                { q: "GMO 식품의 뜻은?", a: ["유기농 식품", "유전자 변형 식품", "저칼로리 식품", "고단백 식품"], c: 1 },
                { q: "복제 양 돌리를 만든 기술은?", a: ["핵 치환 기술", "인공 수정", "조직 배양", "접붙이기"], c: 0 },
                { q: "스마트 팜의 장점이 아닌 것은?", a: ["노동력 절감", "수확량 증대", "날씨 영향 최소화", "초기 설치비용 저렴"], c: 3 },
                { q: "식물 조직의 일부로 대량 번식시키는 기술은?", a: ["조직 배양", "종자 파종", "삽목", "수정"], c: 0 },
                { q: "백신의 역할은?", a: ["치료", "예방(항체 생성)", "영양 공급", "수술"], c: 1 },
                { q: "DNA 구조를 밝혀낸 과학자는?", a: ["왓슨과 크릭", "멘델", "다윈", "파스퇴르"], c: 0 },
                { q: "전통 생명 기술의 예시는?", a: ["인슐린 생산", "김치 담그기", "복제견", "유전자 치료"], c: 1 },
                { q: "생명 기술 관련 윤리적 문제와 거리가 먼 것은?", a: ["맞춤 아기", "유전자 정보 유출", "생태계 교란", "인터넷 속도"], c: 3 }
            ],
            dndTask: {
                title: "생명 기술 발달 순서",
                items: ["현미경 발명", "멘델의 유전법칙", "DNA 구조 발견", "게놈 지도 완성"],
                correctOrder: [0, 1, 2, 3]
            }
        }
    };

    /* --- Calculator System --- */
    function setupCalculators() {
        window.calcGear = function () {
            const driver = parseFloat(document.getElementById('gear-driver').value);
            const driven = parseFloat(document.getElementById('gear-driven').value);
            const resultBox = document.getElementById('gear-result');

            if (!driver || !driven) {
                resultBox.innerHTML = "값을 모두 입력해주세요.";
                resultBox.style.color = "red";
                return;
            }

            const ratio = driven / driver; // Gear Ratio usually Driven/Driver for Torque multiplier (Speed reduction)
            // Speed Ratio = Driver/Driven
            const speedRatio = driver / driven;

            resultBox.innerHTML = `
                기어비(Torque): 1 : ${ratio.toFixed(2)}<br>
                속도비(Speed): 1 : ${speedRatio.toFixed(2)}<br>
                <span style="font-size:0.9rem; color:#666;">(기어비 > 1: 힘 증가, 속도 감소)</span>
            `;
            resultBox.style.color = "#2d3436";
        };

        window.calcLoad = function () {
            const total = parseFloat(document.getElementById('load-total').value);
            const count = parseFloat(document.getElementById('load-count').value);
            const resultBox = document.getElementById('load-result');

            if (!total || !count) {
                resultBox.innerHTML = "값을 모두 입력해주세요.";
                resultBox.style.color = "red";
                return;
            }

            const perPillar = total / count;
            resultBox.innerHTML = `
                기둥 1개당 하중: <strong>${perPillar.toFixed(2)} kg</strong><br>
                <span style="font-size:0.9rem; color:#666;">(안전율 미고려 단순 계산)</span>
            `;
            resultBox.style.color = "#2d3436";
        };
    }

    /* --- Initialization --- */
    function init() {
        setupNavigation();
        setupTechTabs();
        setupGame();
        setupCalculators(); // Added
        setupSandbox();
        setupDragAndDrop(contentVault.manufacturing.dndTask); // default
        renderTechContent('manufacturing');

        // Fetch JSON Data for Career
        fetchData();
    }

    /* --- Navigation Logic --- */
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.dataset.target;
                state.currentNav = targetId;

                // Update Nav UI
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Show Section
                sections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                if (targetId === 'career') renderCareerData();
            });
        });
    }

    /* --- Tech Area Logic --- */
    function setupTechTabs() {
        const techBtns = document.querySelectorAll('.tech-btn');
        const subTabs = document.querySelectorAll('.sub-tab');

        // Main Tech Area Tabs
        techBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                techBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const techKey = btn.dataset.tech;
                state.currentTech = techKey;
                renderTechContent(techKey);
            });
        });

        // Sub Tabs (Lesson/Assessment/Quiz)
        subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                subTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const subKey = tab.dataset.sub;
                state.currentSub = subKey;

                document.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
                document.getElementById(subKey).classList.add('active');
            });
        });

        // Quiz Submit Listener
        document.getElementById('quiz-submit-btn').addEventListener('click', calculateQuizScore);

        // DnD Check Listener
        document.getElementById('dnd-check-btn').addEventListener('click', checkDnD);
    }

    function renderTechContent(key) {
        const data = contentVault[key];

        // 1. Title & Color
        document.getElementById('tech-title').textContent = data.title;
        document.documentElement.style.setProperty('--c-current', data.color); // If used in CSS

        // 2. Lesson
        document.getElementById('lesson-dynamic-content').innerHTML = data.lesson;

        // 3. DnD Reset
        setupDragAndDrop(data.dndTask);

        // 4. Video & Rubric
        document.getElementById('tech-video').src = `https://www.youtube.com/embed/${data.video}`;

        const rubricTable = document.querySelector('#rubric-table tbody');
        rubricTable.innerHTML = data.rubric.map(row => `
            <tr>
                <td style="font-weight:bold">${row.item}</td>
                <td>${row.high}</td>
                <td>${row.mid}</td>
                <td>${row.low}</td>
            </tr>
        `).join('');

        // 5. Quiz Reset
        renderQuiz(data.quiz);
    }

    /* --- Quiz System --- */
    function renderQuiz(questions) {
        const list = document.getElementById('quiz-list');
        list.innerHTML = "";
        document.getElementById('quiz-score').textContent = "Score: 0";
        document.getElementById('quiz-submit-btn').style.display = "block";

        questions.forEach((q, idx) => {
            const div = document.createElement('div');
            div.className = 'quiz-item';
            div.innerHTML = `
                <div class="quiz-q-text">${idx + 1}. ${q.q}</div>
                <div class="quiz-options-box" id="q-opt-${idx}">
                    ${q.a.map((opt, i) => `<button data-idx="${i}" onclick="selectQuizOpt(${idx}, ${i})">${opt}</button>`).join('')}
                </div>
                <div class="quiz-feedback" id="q-feed-${idx}"></div>
            `;
            list.appendChild(div);
        });

        // Global Helper
        window.selectQuizOpt = (qIdx, optIdx) => {
            const container = document.getElementById(`q-opt-${qIdx}`);
            container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
            container.querySelector(`button[data-idx="${optIdx}"]`).classList.add('selected');
        };
    }

    function calculateQuizScore() {
        const questions = contentVault[state.currentTech].quiz;
        let score = 0;

        questions.forEach((q, idx) => {
            const container = document.getElementById(`q-opt-${idx}`);
            const selected = container.querySelector('.selected');
            const feedback = document.getElementById(`q-feed-${idx}`);

            feedback.style.display = "block";

            if (selected) {
                const ans = parseInt(selected.dataset.idx);
                if (ans === q.c) {
                    score++;
                    feedback.style.color = "green";
                    feedback.innerHTML = "✅ 정답입니다!";
                } else {
                    feedback.style.color = "red";
                    feedback.innerHTML = `❌ 오답입니다. 정답: ${q.a[q.c]}`;
                }
            } else {
                feedback.style.color = "orange";
                feedback.innerHTML = "⚠️ 답을 선택하지 않았습니다.";
            }
        });

        document.getElementById('quiz-score').textContent = `Score: ${score} / ${questions.length}`;
        document.getElementById('quiz-submit-btn').style.display = "none";
    }

    /* --- Drag & Drop System --- */
    function setupDragAndDrop(task) {
        const dndArea = document.getElementById('dnd-area');
        const feedback = document.getElementById('dnd-feedback');

        document.getElementById('interactive-inst').textContent = task.title + " (드래그하여 순서대로 나열하세요)";
        dndArea.innerHTML = "";
        feedback.innerHTML = "";
        feedback.className = "";

        // Shuffle Items
        let shuffled = [...task.items].map((item, index) => ({ item, index })).sort(() => Math.random() - 0.5);

        shuffled.forEach(obj => {
            const el = document.createElement('div');
            el.className = 'draggable-item';
            el.draggable = true;
            el.dataset.val = obj.index; // original index is the correct order value logic
            el.innerHTML = `<ion-icon name="menu-outline"></ion-icon> ${obj.item}`;

            el.addEventListener('dragstart', () => el.classList.add('dragging'));
            el.addEventListener('dragend', () => el.classList.remove('dragging'));

            dndArea.appendChild(el);
        });

        dndArea.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(dndArea, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                dndArea.appendChild(draggable);
            } else {
                dndArea.insertBefore(draggable, afterElement);
            }
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function checkDnD() {
        const currentItems = [...document.querySelectorAll('.draggable-item')];
        const currentOrder = currentItems.map(el => parseInt(el.dataset.val));
        const correctOrder = contentVault[state.currentTech].dndTask.correctOrder;

        const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
        const feedback = document.getElementById('dnd-feedback');

        if (isCorrect) {
            feedback.innerHTML = "🎉 정답입니다! 완벽한 순서네요.";
            feedback.style.color = "green";
        } else {
            feedback.innerHTML = "😅 순서가 맞지 않습니다. 다시 시도해보세요.";
            feedback.style.color = "red";
        }
    }

    /* --- Career Data Fetch --- */
    async function fetchData() {
        try {
            state.loadingJSON = true;
            const res = await fetch('./technology_data.json');
            if (!res.ok) throw new Error("Status " + res.status);
            state.techData = await res.json();
        } catch (err) {
            console.error(err);
            // Default Fallback content if fetch fails (e.g. local without server)
            state.techData = [
                { "기술분야": "제조기술", "기업명": "삼성전자", "주요 사업 및 수행 업무": "반도체, 모바일" },
                { "기술분야": "수송기술", "기업명": "현대자동차", "주요 사업 및 수행 업무": "전기차, 로보틱스" }
            ];
        } finally {
            state.loadingJSON = false;
        }
    }

    function renderCareerData() {
        const container = document.getElementById('company-card-list');
        if (state.loadingJSON) return;

        container.innerHTML = "";

        // Group data by '기술분야'
        const grouped = {};
        state.techData.forEach(item => {
            const field = item['기술분야'];
            if (!grouped[field]) grouped[field] = [];
            grouped[field].push(item);
        });

        // Order of fields
        const fieldOrder = ['제조기술', '건설기술', '수송기술', '통신기술', '생명기술'];

        fieldOrder.forEach(field => {
            if (!grouped[field]) return;

            // Section Title
            const h3 = document.createElement('h3');
            h3.className = 'tech-group-title';
            h3.textContent = `🔹 ${field} 관련 기업`;
            h3.style.marginTop = '1.5rem';
            h3.style.marginBottom = '1rem';
            h3.style.borderLeft = '4px solid var(--accent-blue)';
            h3.style.paddingLeft = '10px';
            container.appendChild(h3);

            // Grid wrapper for this field
            const grid = document.createElement('div');
            grid.className = 'company-grid-large';

            // Limit to top 8 items per field to avoid scrolling too much
            grouped[field].slice(0, 8).forEach(item => {
                const card = document.createElement('div');
                card.className = 'comp-card';
                card.innerHTML = `
                    <div class="comp-header">
                        ${item.기업명}
                        <span class="comp-badge">${item.기술분야}</span>
                    </div>
                    <div class="comp-body">${item['주요 사업 및 수행 업무']}</div>
                `;
                grid.appendChild(card);
            });

            container.appendChild(grid);
        });
    }

    /* --- Mini Game (Memory Match) --- */
    const gameTerms = [
        { term: "AI", desc: "인공지능", icon: "hardware-chip" },
        { term: "5G", desc: "초연결 통신", icon: "wifi" },
        { term: "EV", desc: "전기자동차", icon: "car" },
        { term: "IoT", desc: "사물인터넷", icon: "globe" },
        { term: "VR", desc: "가상현실", icon: "glasses" },
        { term: "BIM", desc: "건설정보모델", icon: "business" },
        { term: "UAM", desc: "도심항공교통", icon: "airplane" },
        { term: "DNA", desc: "유전물질", icon: "leaf" }
    ];

    function setupGame() {
        const board = document.getElementById('memory-game-board');
        const restartBtn = document.getElementById('restart-game-btn');
        const moveDisplay = document.getElementById('move-count');

        function initGame() {
            board.innerHTML = "";
            state.gameMoves = 0;
            moveDisplay.textContent = 0;
            state.firstCard = null;
            state.gameLocked = false;

            // Create Pairs (Term card & Desc card) => Actually simpler to just match Term to Term or Term to Desc.
            // Let's do Term to Desc matching.
            let cards = [];
            gameTerms.forEach((item, idx) => {
                cards.push({ id: idx, type: 'term', text: item.term, pair: idx });
                cards.push({ id: idx, type: 'desc', text: item.desc, pair: idx });
            });

            // Shuffle
            cards.sort(() => Math.random() - 0.5);

            cards.forEach(card => {
                const el = document.createElement('div');
                el.className = 'mem-card';
                el.dataset.pair = card.pair;
                el.innerHTML = `
                    <div class="mem-content">
                        ${card.text}
                    </div>
                `;
                el.addEventListener('click', () => flipCard(el));
                board.appendChild(el);
            });
        }

        function flipCard(card) {
            if (state.gameLocked) return;
            if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

            card.classList.add('flipped');

            if (!state.firstCard) {
                state.firstCard = card;
            } else {
                // Second card
                state.gameMoves++;
                moveDisplay.textContent = state.gameMoves;
                checkForMatch(state.firstCard, card);
                state.firstCard = null;
            }
        }

        function checkForMatch(c1, c2) {
            if (c1.dataset.pair === c2.dataset.pair) {
                c1.classList.add('matched');
                c2.classList.add('matched');
                // Check win
                if (document.querySelectorAll('.mem-card.matched').length === gameTerms.length * 2) {
                    setTimeout(() => alert(`🎉 축하합니다! ${state.gameMoves}번 만에 성공했습니다!`), 500);
                }
            } else {
                state.gameLocked = true;
                setTimeout(() => {
                    c1.classList.remove('flipped');
                    c2.classList.remove('flipped');
                    state.gameLocked = false;
                }, 1000);
            }
        }

        restartBtn.addEventListener('click', initGame);
        initGame();
    }

    /* --- Code Sandbox --- */
    function setupSandbox() {
        const input = document.getElementById('code-input');
        const output = document.getElementById('code-output');

        function updatePreview() {
            const html = input.value;
            output.contentDocument.open();
            output.contentDocument.write(html);
            output.contentDocument.close();
        }

        input.addEventListener('input', updatePreview);
        updatePreview(); // initial
    }

    // Start Everything
    init();
});
