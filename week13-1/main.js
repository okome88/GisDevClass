const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Style = ol.style.Style;  //取用style套件Style類別
const Overlay = ol.Overlay;  //取用Overlay套件
const KML = ol.format.KML;  //取用KML套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: rasterSource,
});
//一般樣式normalStyle
const normalStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0)',
  }),
});

//建立行政區樣式Style
const DistrictStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(255, 40, 40, 0)',
  }),
  stroke: new ol.style.Stroke({  //代表線段的樣式
    color: 'rgba(39, 0, 212, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
});

//建立DistrictSource為區界圖層的來源
const DistrictSource = new ol.source.Vector({
  projection: 'EPSG:4326',  //經緯度坐標WGS84
  url: 'TaichungDistrict.kml',
  format: new KML({
    extractStyles: false,  //截取KML樣式
  }),
});


//建立vectorDistrict區界圖層
const vectorDistrict = new ol.layer.Vector({
  source: DistrictSource,
  style: DistrictStyle,

})

//建立VillageSource為里界圖層的來源
const VillageSource = new ol.source.Vector({
  projection: 'EPSG:4326',  //經緯度坐標WGS84
  url: 'TaichungVillage.kml',
  format: new KML({
    extractStyles: false,  //截取KML樣式
  }),
});

//建立vectorVillage里界圖層
const vectorVillage = new ol.layer.Vector({
  source: VillageSource,
  style: normalStyle
})

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
  layers: [raster, vectorDistrict, vectorVillage],
  view: view,
});

//工具提示物件.
let myTooltipElement;

//這個是一個區域疊加層(Overlay), 用來放置顯示名稱(myTooltipElement)
let myTooltip;

//建立一個新的工具提示 Create a new my tooltip
function createMyTooltip() {
  if (myTooltipElement) {
    myTooltipElement.parentNode.removeChild(myTooltipElement);
  }
  myTooltipElement = document.createElement('div');
  myTooltipElement.className = 'popover ol-popover ol-tooltip-my';
  
  //建立一個新的區域疊加層(Overlay)
  myTooltip = new Overlay({
    element: myTooltipElement,
    offset: [0, -5],  //位移的數值
    positioning: 'bottom-center',
    stopEvent: false,  //停用事件
    insertFirst: true,  //插入首位
  });
  map.addOverlay(myTooltip);
}

//顯示圖徵名稱
function displayFeatureInfo(pixel) {
  const features = [];
  //forEachFeatureAtPixel 判斷被點到的圖徵有哪些
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);  //把元素放入陣列
  });
  createMyTooltip();  //建立新的工具提示
  if (features.length > 0) {
    let infoBody = features[0].get('name') + '<br />';  //行政區
    if (features.length > 1) {
      infoBody = infoBody + features[1].get('name') + '<br />';  //里
    }
    let tooltipCoord = map.getCoordinateFromPixel(pixel);  //取得點坐標
    let coordText = ol.coordinate.format(ol.proj.toLonLat(tooltipCoord), "{x} , {y}", 4);  //坐標轉換及格式化
    infoBody = infoBody + "坐標:" + coordText;
    myTooltipElement.innerHTML = '<h3 class="popover-header">所在位置</h3><div class="popover-body">' + infoBody + '</div>';
    myTooltip.setPosition(tooltipCoord);
  }
};

//當滑鼠按下圖徵時
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

//回到起始位置
var GoInitView = function () {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//設定全域起用popover
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})
