//preset map view
const view = new ol.View({
  center: ol.proj.fromLonLat([141.3399, 43.0782]),
  zoom: 14
});

//preset fullscreen
const defaultControls = ol.control.defaults;
const FullScreen = ol.control.FullScreen;

//preset and control eagle eye
const OverviewMap = ol.control.OverviewMap;
const source = new ol.source.OSM();
const overviewMapControl = new OverviewMap({
  layers: [
    new ol.layer.Tile({
      source: source,
    }),
  ],
});

//preset zoom slider
const ZoomSlider = ol.control.ZoomSlider;

//preset DragRotateAndZoom
const DragRotateAndZoom = ol.interaction.DragRotateAndZoom;
const defaultInteractions = ol.interaction.defaults;



//new ol.Map() 建立地圖
var map = new ol.Map({
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  controls: defaultControls().extend([overviewMapControl, new FullScreen(), new ZoomSlider()]),
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: view
});

