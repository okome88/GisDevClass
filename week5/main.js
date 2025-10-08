const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const fromLonLat = ol.proj.fromLonLat;  //取用fromLonLat坐標套件

//定義地標的坐標值
const coordFCU = fromLonLat([120.6483, 24.1799]);  //逢甲大學
const coordTCCG = fromLonLat([120.6458, 24.1602]);  //台中市政府

//建立OSM地圖為來源圖層
const source = new ol.source.OSM();

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const defaultViewOptions = {
  center: coordTCCG,
  zoom: 16
};
const view = new ol.View(defaultViewOptions);

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: source
    })
  ],
  view: view,
});

//回到起始座標位置
function GoInitView() {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//平移到逢甲大學位置
function PanToFcu() {
  view.animate({
    center: coordFCU,
    duration: 2000,  //秒數 2000 = 2秒
    rotation: 0,
  });
}

//改變工具提示文字內容
$('.ol-zoom-in').prop('title', 'let the map zoom up, after click this botton');
$('.ol-zoom-out').prop('title', 'let the map zoom down, after click this botton');
//客制化工具提示外觀
$('.ol-zoom-in, .ol-zoom-out').tooltip({
  placement: 'right',
  container: '#map',
});

//在所有任何地方配置中，啟用工具提示
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

//建立圖徵
const positionFeature = new ol.Feature();
//並設定圖徵樣式
positionFeature.setStyle(
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 12,  //半徑 6 pixels
      fill: new ol.style.Fill({
        color: '#00DDDD',  //填滿顏色
      }),
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 6, //外邊框 6 pixels
      }),
    }),
  })
);

//建立圖形-加入一個點位
positionFeature.setGeometry(new ol.geom.Point(coordTCCG));

//在目前的圖台上，建立向量圖層，並指定放入的圖徵
new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [positionFeature],
  }),
});





const toLonLat = ol.proj.toLonLat;  //取用toLonLat坐標套件
const Geolocation = ol.Geolocation;  //取用位置服務套件

//建立 geolocation
const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true 才能取到坐標值
  trackingOptions: {
    enableHighAccuracy: true,  //啟用高精度
  },
  projection: view.getProjection(),
});

//紀錄我的位置坐標
var MyPositionCoordinates;

//針對 geolocation 的 change:position 事件處理動作
geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  MyPositionCoordinates = coordinates;  //放到紀錄我的位置坐標變數 MyPositionCoordinates
  let MyCoordinates = document.getElementById('MyCoordinates');  //取得 MyCoordinates 物件
  MyCoordinates.innerHTML = ol.coordinate.toStringXY(toLonLat(coordinates), 4);  //顯示在頁面上
});

//設定開始追蹤我的位置
function GetMyPosition() {
  geolocation.setTracking(true);  //設定追蹤打開
}

//平移到我的位置
function GetPanToMyPosition() {
  if (MyPositionCoordinates != null) {
    positionFeature.setGeometry(new ol.geom.Point(MyPositionCoordinates));  //設定圖徵圖位
    view.setCenter(MyPositionCoordinates);
    view.setZoom(defaultViewOptions.zoom);
  }else{
    alert("please click 追蹤我的位置");
  }
}

function MyGetPanToMyPosition() {
  geolocation.setTracking(true);  //設定追蹤打開
  if (MyPositionCoordinates != null) {
    positionFeature.setGeometry(new ol.geom.Point(MyPositionCoordinates));  //設定圖徵圖位
    view.setCenter(MyPositionCoordinates);
    view.setZoom(defaultViewOptions.zoom);
  }else{
    alert("please allow your system that search your position");
  }
}

function reset() {
  MyPositionCoordinates = null;
}