const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const Style = ol.style.Style;  //取用style套件Style類別
const LineString = ol.geom.LineString;  //取用LineString套件
const Polygon = ol.geom.Polygon;  //取用Polygon套件
const Overlay = ol.Overlay;  //取用Overlay套件
const Kml = ol.format.KML;  //取用KML套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

//建立Vector地圖為vector圖層的來源
const vectorSource = new ol.source.Vector({
  url: 'fcu.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});

//建立vector圖層的來源-人言大樓
const buildingSource1 = new ol.source.Vector({
  url: '人言大樓test.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
//建立vector圖層的來源-土木水利館
const buildingSource2 = new ol.source.Vector({
  url: '土木水利館.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
//建立vector圖層的來源-育樂館
const buildingSource3 = new ol.source.Vector({
  url: '育樂館.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
//建立vector圖層的來源-商學大樓
const buildingSource4 = new ol.source.Vector({
  url: '商學大樓.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});


//建立vectorStyle為vector圖層的樣式設定
const vectorStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(143, 7, 255, 0.3)',    //rgba(red,green,blue,alpha)
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: '#00C5CD',
    width: 3,
  }),
})
//建立selectedStyle為vector圖層被選取時樣式設定
const selectedStyle = new Style({
  fill: new Fill({ //多邊形的填色
    color: 'rgba(251, 255, 0, 0.3)',    //紅色透明度0.3
  }),
  stroke: new Stroke({ //代表線段的樣式
    color: '#FF0000',
    width: 3,
    lineDash: [4, 8], //虛線
  }),
});

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: vectorStyle,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立預設View(視角)的參數
const defaultViewOptions = {
  center: ol.proj.fromLonLat([120.6499, 24.2808]),  //逢甲大學
  zoom: 16
};

//建立地圖View(視角)
const view = new ol.View(defaultViewOptions);

//回到起始位置
function GoInitView() {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster, vector],
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
  myTooltipElement.className = 'ol-tooltip ol-tooltip-my';
  myTooltip = new Overlay({
    element: myTooltipElement,
    offset: [0, -15],  //位移的數值
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(myTooltip);
}

//顯示圖徵名稱函數
function displayFeatureInfo(pixel) {
  const features = [];
  //forEachFeatureAtPixel 判斷被點到的圖徵有哪些
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);  //把元素放入陣列
  });
  if (features.length > 0) {
    const info = features[0].get('name');  //取出名稱文字內容

    createMyTooltip();  //建立新的工具提示
    myTooltipElement.innerHTML = info;
    const tooltipCoord = features[0].getGeometry().getInteriorPoint().getCoordinates();  //取得內心坐標
    myTooltip.setPosition(tooltipCoord);
  }
};

//當滑鼠按下圖徵時
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

//紀錄目前使用的向量圖層來源
let CurrentVectorSource;

//移動到指定的向量圖層來源
function ZoomToExtent() {
  map.getView().fit(CurrentVectorSource.getExtent());
  view.setZoom(19);
}

//定位到人言大樓
function SelectBuildingSource1() {
  CurrentVectorSource = buildingSource1;
  //featuresloadend當圖徵載入完成
  CurrentVectorSource.on('featuresloadend', ZoomToExtent); 
  if (CurrentVectorSource.getFeatures().length != 0) //判斷是否已經載入過
  { 
    ZoomToExtent(); 
  }
 
  vector.setSource(CurrentVectorSource);  //設定vector圖層的來源
}
//定位到土木水利館
function SelectBuildingSource2() {
  CurrentVectorSource = buildingSource2;
  //featuresloadend當圖徵載入完成
  CurrentVectorSource.on('featuresloadend', ZoomToExtent);
  if (CurrentVectorSource.getFeatures().length != 0) //判斷是否已經載入過
  { 
    ZoomToExtent(); 
  }

  vector.setSource(CurrentVectorSource);
}

//定位到育樂館
function SelectBuildingSource3() {
  CurrentVectorSource = buildingSource3;
  //featuresloadend當圖徵載入完成
  CurrentVectorSource.on('featuresloadend', ZoomToExtent);
  if (CurrentVectorSource.getFeatures().length != 0) //判斷是否已經載入過
  { 
    ZoomToExtent(); 
  }

  vector.setSource(CurrentVectorSource);
}

//定位到商學大樓
function SelectBuildingSource4() {
  CurrentVectorSource = buildingSource4;
  //featuresloadend當圖徵載入完成
  CurrentVectorSource.on('featuresloadend', ZoomToExtent);
  if (CurrentVectorSource.getFeatures().length != 0) //判斷是否已經載入過
  { 
    ZoomToExtent(); 
  }

  vector.setSource(CurrentVectorSource);
}
//取得下拉選單物件
const buildingSelect = document.getElementById('building');

//被選取的圖徵
let selectedFeature;

//建築物下拉選擇改變時
function buildingChange() {
  vector.setSource(vectorSource);  //重設向量圖層資料來源
  let features = vector.getSource().getFeatures();
  if (selectedFeature != null) {  //判斷selectedFeature是否空值
    selectedFeature.setStyle(vectorStyle);  //還原成vectorStyle圖層樣式
    selectedFeature = null;  //將selectedFeature設成空值
  }

  for (let i = 0; i < features.length; i++) {
    let name = features[i].get('name');
    if (name == buildingSelect.value) {
      selectedFeature = features[i];
    }
  }

  if (selectedFeature != null) {
    selectedFeature.setStyle(selectedStyle);  //設定成被選取時樣式

    map.getView().fit(selectedFeature.getGeometry().getExtent());
    view.setZoom(19);
  }
}
