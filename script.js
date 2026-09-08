const bounds = [[0, 0], [65536, 65536]];
const defaultColor = '#ffffff';
const zoomThresholds = {'w': -4, 't': -3, 's': -2.5, 'a': -2, 'b': -1.5, 'c': -1, 'd': -0.5, 'e': 0};
const zoomThresholdsDisappear = {'w': -1, 't': 0, 's': 0.5, 'a': 1, 'b': 1.5, 'c': 2, 'd': 2.5, 'e': 3};
const fontSizeThresholds = {'w': '3.6vh', 't': '2.4vh', 's': '2.4vh', 'a': '1.6vh', 'b': '1.6vh', 'c': '1.6vh', 'd': '1.6vh', 'e': '1.6vh'};
const zIndexRanks = {'w': 700, 's': 600, 'a': 500, 'b': 400, 'c': 300, 'd': 200, 'e': 100};
const iconRanks = ['a', 'b', 'c', 'd', 'e'];

const mapLayerDefs = [
    { key: 'metro', file: 'maps/metro.svg', zIndex: 900 },
    { key: 'station', file: 'maps/station.svg', zIndex: 800 },
    { key: 'railroad', file: 'maps/railroad.svg', zIndex: 700 },
    { key: 'map04', file: 'maps/map04.svg', zIndex: 300 },
    { key: 'map03', file: 'maps/map03.svg', zIndex: 300 },
    { key: 'map02', file: 'maps/map02.svg', zIndex: 300 },
    { key: 'map01', file: 'maps/map01.svg', zIndex: 100 },
];

const map = L.map('map', {
    crs: L.CRS.Simple,
    zoomSnap: 0.25,
    minZoom: -5,
    maxZoom: 3,
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
});

const bracketByZoom = zoom => {
    if (zoom < -4) return 0;
    if (zoom < -3) return 1;
    if (zoom < -2) return 2;
    return 3;
};

const mapKeys = [
    ['Sluqecu_map04', 'Sluqecu_map03', 'Sluqecu_map02', 'Sluqecu_map01'],
    ['Sluqecu_map08', 'Sluqecu_map07', 'Sluqecu_map06', 'Sluqecu_map05'],
    ['Sluqecu_map12', 'Sluqecu_map11', 'Sluqecu_map10', 'Sluqecu_map09'],
    ['Sluqecu_map16', 'Sluqecu_map15', 'Sluqecu_map14', 'Sluqecu_map13']
];

let currentMapKey = 'Sluqecu_map01';
let mapOverlay = L.imageOverlay(`maps/${currentMapKey}.svg`, bounds, { pane: 'mapPane' }).addTo(map);
let markerLayer = L.layerGroup().addTo(map);
let currentLang = 'lo';
let transitLayer = 0;
let landLayer = 0;
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

function changeLang(lang) {
    document.body.className = '';
    document.body.classList.add(`lang-${lang}`);

    currentLang = lang;
    renderMarkers();
}

function toggleLang(btnElement) {
    const isActive = btnElement.classList.toggle('active');
    changeLang(isActive ? 'en' : 'lo');
}

function toggleTransit(btnElement) {
    const isActive = btnElement.classList.toggle('active');
    transitLayer = isActive ? 1 : 0;
    updateMapLayers();
}

function toggleLand(btnElement) {
    const isActive = btnElement.classList.toggle('active');
    landLayer = isActive ? 2 : 0;
    updateMapLayers();
}

function getMapKey(zoom) {
    return mapKeys[transitLayer + landLayer][bracketByZoom(zoom)];
}

function updateMapLayers() {
    const key = mapKeys[transitLayer + landLayer][bracketByZoom(map.getZoom())];
    if (key === currentMapKey) return;

    mapOverlay.setUrl(`maps/${key}.svg`);
    currentMapKey = key;
}

document.addEventListener('DOMContentLoaded', () => {
    changeLang('lo');
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

    mapLayers[def.key] = L.imageOverlay(def.file, bounds, { pane: paneName });
});

updateMapLayers();

map.fitBounds(bounds);
map.setView([44000, 29000], 0);

map.on('zoomend', updateMapLayers);
map.on('zoomend', renderMarkers);

map.on('click', function(e) {
    if (!e.originalEvent.shiftKey) {return;}
    const y = Math.round(e.latlng.lat);
    const x = Math.round(e.latlng.lng);
    const coordString = `[${y}, ${x}]`;
    navigator.clipboard.writeText(coordString)
});
