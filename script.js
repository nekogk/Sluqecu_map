const mapSize = 65536;
const bounds = [[0, 0], [mapSize, mapSize]];

let currentLang = 'lo';
let locationData = [];

const zoomThresholds = {'b': -4, 'd': -2, 'e': 0};
const zoomThresholdsDisappear = {'b': 0, 'd': 2, 'e': 4};
const fontSizeThresholds = {'b': '4vh', 'd': '2vh', 'e': '2vh'};
const ICON_RANKS = ['d', 'e'];
const ICON_SCALE = 1.5;

function vhToPx(vhString) {
        return (parseFloat(vhString) / 100) * window.innerHeight;
}

const ICON_LIBRARY = {
    park: {
        color: '#4CAF50',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/park.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    hospital: {
        color: '#F44336',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/hospital.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    place: {
        color: '#9E9E9E',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/place.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    castle: {
        color: '#9E9E9E',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/castle.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    account: {
        color: '#9E9E9E',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/account.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    atm: {
        color: '#9E9E9E',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/atm.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    business: {
        color: '#9E9E9E',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/business.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    subway: {
        color: '#2196F3',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <rect x="4" y="4" width="40" height="40" rx="10" ry="10" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/subway.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    train: {
        color: '#2196F3',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <rect x="4" y="4" width="40" height="40" rx="10" ry="10" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/train.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    bus: {
        color: '#2196F3',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <rect x="4" y="4" width="40" height="40" rx="10" ry="10" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/bus.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    library: {
        color: '#795548',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/library.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    school: {
        color: '#795548',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/school.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    museum: {
        color: '#E91E63',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/museum.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    theater: {
        color: '#E91E63',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/theater.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    mall: {
        color: '#FFEB3B',
        svg: `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />
            <use href="icon/mall.svg" x="10" y="10" width="28" height="28" />
        </svg>`
    },
    default: {
        color: '#8a8a8a',
        svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="currentColor"/>
        </svg>`
    }
};

const map = L.map('map', {
        crs: L.CRS.Simple,
        zoomSnap: 1/4,
        minZoom: -4,
        maxZoom: 4,
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

L.imageOverlay('Sluqecu_map.svg', bounds).addTo(map);
map.fitBounds(bounds);
map.setView([44000, 29000], 0);

let markerLayer = L.layerGroup().addTo(map);

// 2. 마커 렌더링 함수 수정
function renderMarkers() {
    markerLayer.clearLayers();
    const currentZoom = map.getZoom(); // 현재 지도의 줌 레벨 가져오기

    locationData.forEach(loc => {
        if (currentZoom >= zoomThresholds[loc.rank] && currentZoom <= zoomThresholdsDisappear[loc.rank]) {
            const text = loc.names[currentLang] || loc.names['en'];
            const fontSize = fontSizeThresholds[loc.rank];

            let html, iconSize, iconAnchor;

            if (loc.icon && ICON_RANKS.includes(loc.rank)) {
                // icon이 지정된 d, e 위계: 아이콘을 좌표에 놓고 텍스트는 오른쪽으로
                const iconDef = ICON_LIBRARY[loc.icon] || ICON_LIBRARY.default;
                const iconPx = Math.round(vhToPx(fontSize) * ICON_SCALE);
                const halfIcon = iconPx / 2;

                html = `
                    <div class="map-label-row">
                        <span class="map-icon" style="width:${iconPx}px; height:${iconPx}px; color:${iconDef.color};">${iconDef.svg}</span>
                        <span class="map-label-text" style="font-size:${fontSize}; color:${iconDef.color};">${text}</span>
                    </div>
                `;
                iconSize = [300, 40];
                iconAnchor = [halfIcon, 20];
            } else {
                // icon이 없으면 기존처럼 좌표 중심에 텍스트 (연한 회색)
                html = `<div style="font-size: ${fontSize}">${text}</div>`;
                iconSize = [200, 40];
                iconAnchor = [100, 10];
            }

            const textIcon = L.divIcon({
                className: 'map-label',
                html: html,
                iconSize: iconSize,
                iconAnchor: iconAnchor
            });

            L.marker(loc.coords, { icon: textIcon }).addTo(markerLayer);
        }
    });
}

// 3. 이벤트 리스너: 줌이 끝날 때마다 호출
map.on('zoomend', renderMarkers);

// 4. 언어 변경 함수
function changeLang(lang, btnElement) {
    // 1. 모든 버튼에서 active 제거 및 현재 버튼에 추가
    document.querySelectorAll('.lang-group .control-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // 2. body 태그의 언어 클래스 교체
    document.body.className = '';
    document.body.classList.add(`lang-${lang}`);

    // 3. 현재 언어 변수 업데이트 및 마커 다시 그리기
    currentLang = lang;
    renderMarkers();
}

// 초기 로드 시 실행 (첫 접속은 로포나어이므로)
document.addEventListener('DOMContentLoaded', () => {
    changeLang('lo', document.querySelector('.lang-group .control-btn.active'));
});

// 데이터 로드
fetch('locations.json')
    .then(res => res.json())
    .then(data => {
        locationData = data;
        renderMarkers();
    });


// 좌표 클립보드 복사
map.on('click', function(e) {
    // 1. 좌표 추출 및 반올림
    const y = Math.round(e.latlng.lat);
    const x = Math.round(e.latlng.lng);
    
    // 2. 복사할 문자열 형식 지정 (예: [32768, 32768])
    const coordString = `[${y}, ${x}]`;
    
    // 3. 클립보드로 복사
    navigator.clipboard.writeText(coordString).then(() => {
        // 4. 복사 성공 시 사용자에게 알림 (간단한 alert 혹은 커스텀 UI)
        console.log('복사된 좌표:', coordString);
        showToast(`좌표 ${coordString}가 복사되었습니다!`);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
});
