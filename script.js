const bounds = [[0, 0], [65536, 65536]];
const defaultColor = '#78909C';
const zoomThresholds = {'w': -3, 's': -2.5, 'a': -2, 'b': -1.5, 'c': -1, 'd': -0.5, 'e': 0};
const zoomThresholdsDisappear = {'w': 1, 's': 1.5, 'a': 2, 'b': 2.5, 'c': 3, 'd': 3.5, 'e': 4};
const fontSizeThresholds = {'w': '3.6vh', 's': '2.4vh', 'a': '1.6vh', 'b': '1.6vh', 'c': '1.6vh', 'd': '1.6vh', 'e': '1.6vh'};
const zIndexRanks = {'w': 700, 's': 600, 'a': 500, 'b': 400, 'c': 300, 'd': 200, 'e': 100};
const iconRanks = ['a', 'b', 'c', 'd', 'e'];

const mapLayerDefs = [
    { key: 'metro', file: 'maps/metro.svg', zIndex: 600 },
    { key: 'building', file: 'maps/building.svg', zIndex: 500 },
    { key: 'road', file: 'maps/road.svg', zIndex: 400 },
    { key: 'alley', file: 'maps/alley.svg', zIndex: 300 },
    { key: 'path', file: 'maps/path.svg', zIndex: 200 },
    { key: 'base', file: 'maps/base.svg', zIndex: 100 },
];

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
let iconData = {};
let mapLayers = {};

function buildIconSvg(def) {
    if (!def) {
        return `<svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" fill="defaultColor" stroke="#222222" stroke-width="2" />
        </svg>`;
    }
    const shapeMarkup = def.shape === 'rect'
        ? `<rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="currentColor" stroke="#222222" stroke-width="2" />`
        : `<circle cx="12" cy="12" r="10" fill="currentColor" stroke="#222222" stroke-width="2" />`;

    return `<svg viewBox="0 0 24 24" width="24" height="24">
        ${shapeMarkup}
        <use href="icons/${def.icon}" x="5" y="5" width="14" height="14" />
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
                const iconDef = iconData[loc.icon];
                const iconColor = iconDef ? iconDef.color : defaultColor;
                const iconSvg = buildIconSvg(iconDef);
                const iconPx = Math.round(parseFloat(fontSize) * window.innerHeight / 50);
                const isRect = iconDef && iconDef.shape === 'rect';

                if (isRect) {
                    html = `
                        <div class="map-label-col">
                            <span class="map-icon" style="width:${iconPx}px; height:${iconPx}px; color:${iconColor};">${iconSvg}</span>
                            <span class="map-label-text" style="font-size:${fontSize}; color:${iconColor};">${text}</span>
                        </div>
                    `;
                    const colWidth = Math.max(iconPx * 2, 200);
                    iconSize = [colWidth, iconPx + 40];
                    iconAnchor = [colWidth / 2, iconPx / 2];
                } else {
                    html = `
                        <div class="map-label-row">
                            <span class="map-icon" style="width:${iconPx}px; height:${iconPx}px; color:${iconColor};">${iconSvg}</span>
                            <span class="map-label-text" style="font-size:${fontSize}; color:${iconColor};">${text}</span>
                        </div>
                    `;
                    iconSize = [300, 40];
                    iconAnchor = [iconPx / 2, 20];
                }
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

function getVisibleLayersForZoom(zoom) {
    if (zoom < -3) {
        return ['road', 'base'];
    } else if (zoom < -2) {
        return ['metro', 'road', 'alley', 'base'];
    } else {
        return ['metro', 'building', 'road', 'alley', 'path', 'base'];
    }
}

function updateMapLayers() {
    const zoom = map.getZoom();
    const visible = getVisibleLayersForZoom(zoom);

    mapLayerDefs.forEach(def => {
        const pane = map.getPane(`${def.key}Pane`);
        const isVisible = visible.includes(def.key);
        pane.style.opacity = isVisible ? '1' : '0';
        pane.style.pointerEvents = isVisible ? 'auto' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    changeLang('lo', document.querySelector('.lang-group .control-btn.active'));
});

Promise.all([
    fetch('datas/location.json').then(res => res.json()),
    fetch('datas/icon.json').then(res => res.json())
]).then(([locations, icons]) => {
    locationData = locations;
    iconData = icons;
    renderMarkers();
});

mapLayerDefs.forEach(def => {
    const paneName = `${def.key}Pane`;
    map.createPane(paneName);
    const pane = map.getPane(paneName);
    pane.style.zIndex = def.zIndex;
    pane.classList.add('map-svg-pane');

    mapLayers[def.key] = L.imageOverlay(def.file, bounds, { pane: paneName }).addTo(map);
});

updateMapLayers();

map.fitBounds(bounds);
map.setView([44000, 29000], 0);
map.getPane('markerPane').style.zIndex = 700;

map.on('zoomend', updateMapLayers);
map.on('zoomend', renderMarkers);

map.on('click', function(e) {
    if (!e.originalEvent.shiftKey) {return;}
    const y = Math.round(e.latlng.lat);
    const x = Math.round(e.latlng.lng);
    const coordString = `[${y}, ${x}]`;
    navigator.clipboard.writeText(coordString)
});
