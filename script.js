const bounds = [[0, 0], [65536, 65536]];
const defaultColor = '#78909C';
const zoomThresholds = {'m': -4, 'w': -3, 's': -2.5, 'a': -2, 'b': -1.5, 'c': -1, 'd': -0.5, 'e': 0};
const zoomThresholdsDisappear = {'m': 0, 'w': 1, 's': 1.5, 'a': 2, 'b': 2.5, 'c': 3, 'd': 3.5, 'e': 4};
const fontSizeThresholds = {'m': '4vh', 'w': '3vh', 's': '2.5vh', 'a': '2vh', 'b': '2vh', 'c': '2vh', 'd': '2vh', 'e': '2vh'};
const zIndexRanks = {'m':1000, 'w': 800, 's': 600, 'a': 400, 'b': 300, 'c': 200, 'd': 100, 'e': 0};
const iconRanks = ['a', 'b', 'c', 'd', 'e'];

const map = L.map('map', {
    crs: L.CRS.Simple,
    zoomSnap: 0,
    minZoom: -4,
    maxZoom: 4,
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
});

let markerLayer = L.layerGroup().addTo(map);
let currentLang = 'lo';
let locationData = [];
let ICON_LIBRARY = {};

function buildIconSvg(def) {
    if (!def) {
        return `<svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="defaultColor" stroke="#222222" stroke-width="4" />
        </svg>`;
    }
    const shapeMarkup = def.shape === 'rect'
        ? `<rect x="4" y="4" width="40" height="40" rx="10" ry="10" fill="currentColor" stroke="#222222" stroke-width="4" />`
        : `<circle cx="24" cy="24" r="20" fill="currentColor" stroke="#222222" stroke-width="4" />`;

    return `<svg viewBox="0 0 48 48" width="48" height="48">
        ${shapeMarkup}
        <use href="icon/${def.icon}" x="10" y="10" width="28" height="28" />
    </svg>`;
}

function renderMarkers() {
    markerLayer.clearLayers();
    const currentZoom = map.getZoom();

    locationData.forEach(loc => {
        if (currentZoom >= zoomThresholds[loc.rank] && currentZoom <= zoomThresholdsDisappear[loc.rank]) {
            const text = loc.names[currentLang] || loc.names['en'];
            const fontSize = fontSizeThresholds[loc.rank];

            let html, iconSize, iconAnchor;

            if (loc.icon && iconRanks.includes(loc.rank)) {
                const iconDef = ICON_LIBRARY[loc.icon];
                const iconColor = iconDef ? iconDef.color : defaultColor;
                const iconSvg = buildIconSvg(iconDef);
                const iconPx = Math.round(parseFloat(fontSize) * window.innerHeight * 0.015);

                html = `
                    <div class="map-label-row">
                        <span class="map-icon" style="width:${iconPx}px; height:${iconPx}px; color:${iconColor};">${iconSvg}</span>
                        <span class="map-label-text" style="font-size:${fontSize}; color:${iconColor};">${text}</span>
                    </div>
                `;
                iconSize = [300, 40];
                iconAnchor = [iconPx / 2, 20];
            } else {
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

            const offset = zIndexRanks[loc.rank] || 0;

            L.marker(loc.coords, { 
                icon: textIcon,
                zIndexOffset: offset 
            }).addTo(markerLayer);
        }
    });
}

function changeLang(lang, btnElement) {
    document.querySelectorAll('.lang-group .control-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    document.body.className = '';
    document.body.classList.add(`lang-${lang}`);

    currentLang = lang;
    renderMarkers();
}

document.addEventListener('DOMContentLoaded', () => {
    changeLang('lo', document.querySelector('.lang-group .control-btn.active'));
});

Promise.all([
    fetch('locations.json').then(res => res.json()),
    fetch('icons.json').then(res => res.json())
]).then(([locations, icons]) => {
    locationData = locations;
    ICON_LIBRARY = icons;
    renderMarkers();
});

L.imageOverlay('Sluqecu_map.svg', bounds).addTo(map);
map.fitBounds(bounds);
map.setView([44000, 29000], 0);

map.on('zoomend', renderMarkers);

map.on('click', function(e) {
    if (!e.originalEvent.shiftKey) {return;}
    const y = Math.round(e.latlng.lat);
    const x = Math.round(e.latlng.lng);
    const coordString = `[${y}, ${x}]`;
    navigator.clipboard.writeText(coordString)
});
