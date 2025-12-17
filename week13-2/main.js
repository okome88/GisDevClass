const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const WMTSTileGrid = ol.tilegrid.WMTS;  //取用 tilegrid 的 WMTS 套件
const getProjection = ol.proj.get;  //取用proj套件 get 功能
const getTopLeft = ol.extent.getTopLeft;  //取用extent套件 getTopLeft 功能
const getWidth = ol.extent.getWidth;  //取用extent套件 getWidth 功能
const getRenderPixel = ol.render.getRenderPixel;  //取用render套件 getRenderPixel 功能

//WMTS 使用參數
const projection = getProjection('EPSG:3857');  //google 平面坐標
const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);  //設定有19層
const matrixIds = new Array(19);  //設定有19層
for (let z = 0; z < 19; ++z) {  //19層索引 0 ~ 18
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: rasterSource,
});

//建立 臺灣通用電子地圖 為WMTS圖層的來源
const sourceWMTS = new ol.source.WMTS({
  attributions: 'Tiles © <a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',
  url: 'https://wmts.nlsc.gov.tw/wmts',
  layer: 'PHOTO_MIX',
  matrixSet: 'GoogleMapsCompatible',
  format: 'image/png',
  projection: projection,
  tileGrid: new WMTSTileGrid({
    origin: getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds,
  }),
  style: 'default',
  wrapX: true,
});

//建立WMTS圖層
const rasterWMTS = new ol.layer.Tile({
  //opacity: 0.5,
  source: sourceWMTS,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const defaultViewOptions = {
  center: ol.proj.fromLonLat([120.6483, 24.1799]),  //逢甲大學
  zoom: 16
};
const view = new ol.View(defaultViewOptions);

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster, rasterWMTS],

  view: view,
});

//回到起始位置
var GoInitView = function () {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//取得滑動(Swipe)軸
const swipe = document.getElementById('swipe');
//rasterWMTS prerender 事件
rasterWMTS.on('prerender', function (event) {
  const ctx = event.context;
  const mapSize = map.getSize();
  const width = mapSize[0] * (swipe.value / 100);
  const tl = getRenderPixel(event, [width, 0]);
  const tr = getRenderPixel(event, [mapSize[0], 0]);
  const bl = getRenderPixel(event, [width, mapSize[1]]);
  const br = getRenderPixel(event, mapSize);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.closePath();
  ctx.clip();
});

//rasterWMTS postrender 事件
rasterWMTS.on('postrender', function (event) {
  const ctx = event.context;
  ctx.restore();
});

//input, change listener
function listener() {
  map.render();
};
swipe.addEventListener('input', listener);
swipe.addEventListener('change', listener);
