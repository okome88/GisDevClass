const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const FullScreen = ol.control.FullScreen;  //取用FullScreen全螢幕控制器套件
const OverviewMap = ol.control.OverviewMap;  //取用OverviewMap鷹眼控制器套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const WMTSTileGrid = ol.tilegrid.WMTS; //取用 tilegrid 的 WMTS 套件
const getProjection = ol.proj.get; //取用proj套件 get 功能
const getTopLeft = ol.extent.getTopLeft; //取用extent套件 getTopLeft 功能
const getWidth = ol.extent.getWidth; //取用extent套件 getWidth 功能

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
  source: new ol.source.OSM(),
});

//建立 臺灣通用電子地圖 為WMTS圖層的來源
const sourceWMTS = new ol.source.WMTS({
  attributions: 'Tiles © <a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',  //版權宣告
  url: 'https://wmts.nlsc.gov.tw/wmts',  //WMTS服務接口
  layer: 'EMAP',  //圖層介接代碼
  matrixSet: 'GoogleMapsCompatible',  //參考WMTS服務規格
  format: 'image/png',  //參考WMTS服務規格
  projection: projection,  //投影坐標系統(上方定義)
  tileGrid: new WMTSTileGrid({  //建立tileGrid
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

//建立WMTS圖層-EMAP8 臺灣通用電子地圖(EN)
const rasterEMAP8 = CreateNlscWMTSLayer("EMAP8");

//建立WMTS圖層-EMAP15 臺灣通用電子地圖(等高線無門牌)
const rasterEMAP15 = CreateNlscWMTSLayer("EMAP15");

//建立WMTS圖層-PHOTO2 正射影像圖(通用)
const rasterPHOTO2 = CreateNlscWMTSLayer("PHOTO2");

//建立WMTS圖層-PHOTO_MIX 正射影像(混合)
const rasterPHOTO_MIX = CreateNlscWMTSLayer("PHOTO_MIX");

//建立WMTS圖層-ConvenienceStore 便利商店(超商)
const rasterConvenienceStore = CreateNlscWMTSLayer("ConvenienceStore");

//建立WMTS圖層-CITY 縣市界
const rasterCITY = CreateNlscWMTSLayer("CITY");

//建立WMTS圖層-TOWN 鄉鎮區界
const rasterTOWN = CreateNlscWMTSLayer("TOWN");

//建立 全螢幕 控制器
const fullScreenControl = new FullScreen();

//建立 鷹眼 控制器，並指定來源地圖
const overviewMapControl = new OverviewMap({
  layers: [
    new ol.layer.Tile({
      source: rasterSource,    //指定來源地圖
    }),
  ],
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
  controls: defaultControls().extend([fullScreenControl, overviewMapControl, zoomSliderControl]),
  target: 'map',
  layers: [raster, rasterWMTS, rasterEMAP8, rasterEMAP15, rasterPHOTO2, rasterPHOTO_MIX, rasterConvenienceStore, rasterCITY, rasterTOWN],


  view: view,
});

//回到起始位置
function GoInitView() {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//切換全螢幕控制器
function SwitchFullScreen(obj) {
  if (obj.checked) {  //條件成立 勾選時
    map.controls.extend([fullScreenControl]);  //加入
  }
  else {  //條件不成立 沒有勾選時
    map.controls.remove(fullScreenControl);  //移除
  }
}

//切換 鷹眼 控制器
function SwitchOverviewMap(obj) {
  if (obj.checked) {  //條件成立 勾選時
    map.controls.extend([overviewMapControl]);  //加入
  }
  else {  //條件不成立 沒有勾選時
    map.controls.remove(overviewMapControl);  //移除
  }
}

//切換 放大縮小軸 控制器
function SwitchZoomSlider(obj) {
  if (obj.checked) {  //條件成立 勾選時
    map.controls.extend([zoomSliderControl]);  //加入
  }
  else {  //條件不成立 沒有勾選時
    map.controls.remove(zoomSliderControl);  //移除
  }
}

//建立NLSC WMTS圖層函數
function CreateNlscWMTSLayer(LayerName) {
  //建立 WMTS圖層的來源
  let MySource = new ol.source.WMTS({
    attributions: 'Tiles © <a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',  //版權宣告
    url: 'https://wmts.nlsc.gov.tw/wmts',  //WMTS服務接口
    layer: LayerName,  //圖層介接代碼，由函數參數傳入
    matrixSet: 'GoogleMapsCompatible',  //參考WMTS服務規格
    format: 'image/png',  //參考WMTS服務規格
    projection: projection,  //投影坐標系統(上方定義)
    tileGrid: new WMTSTileGrid({  //建立tileGrid
      origin: getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds,
    }),
    style: 'default',
    wrapX: true,
  });
  //建立WMTS圖層
  let rasterLayer = new ol.layer.Tile({
    source: MySource,
  });
  return rasterLayer;
}
//底圖切換功能函數
function ChangeBaseMap(layerId) {
  //先將所有raster圖層設為不可視
  raster.setVisible(false);
  rasterWMTS.setVisible(false);
  rasterEMAP8.setVisible(false);
  rasterEMAP15.setVisible(false);
  rasterPHOTO2.setVisible(false);
  rasterPHOTO_MIX.setVisible(false);

  //依據傳入layerId將對應圖層設為可視
  if (layerId == "raster") {
    raster.setVisible(true);
  }
  else if (layerId == "rasterWMTS") {
    rasterWMTS.setVisible(true);
  }
  else if (layerId == "rasterEMAP8") {
    rasterEMAP8.setVisible(true);
  }
  else if (layerId == "rasterEMAP15") {
    rasterEMAP15.setVisible(true);
  }
  else if (layerId == "rasterPHOTO2") {
    rasterPHOTO2.setVisible(true);
  }
  else if (layerId == "rasterPHOTO_MIX") {
    rasterPHOTO_MIX.setVisible(true);
  }
  else {
    raster.setVisible(true);
  }
}
//動態圖層功能函數
function ChangeLayerDisplay(obj, layerId) {
  if (layerId == "ConvenienceStore") {
    rasterConvenienceStore.setVisible(obj.checked);
  }
  else if (layerId == "CITY") {
    rasterCITY.setVisible(obj.checked);
  }
  else if (layerId == "TOWN") {
    rasterTOWN.setVisible(obj.checked);
  }
}
