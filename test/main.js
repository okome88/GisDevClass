const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const Style = ol.style.Style;  //取用style套件Style類別
const LineString = ol.geom.LineString;  //取用LineString套件
const Polygon = ol.geom.Polygon;  //取用Polygon套件
const Point = ol.geom.Point;  //取用Point套件
const Overlay = ol.Overlay;  //取用Overlay套件
const Kml = ol.format.KML;  //取用KML套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

//建立vector圖層的資料來源(vectorSource)
const vectorSource = new ol.source.Vector({
  url: 'TaichungDistrict.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
const vectorSource2 = new ol.source.Vector({
  url: 'dbd.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
//當Vector圖層資料載入時, 定位到全圖
vectorSource.on('featuresloadend', function (evt) {
  map.getView().fit(vectorSource.getExtent());
});
vectorSource2.on('featuresloadend', function (evt) {
  map.getView().fit(vectorSource2.getExtent());
});
//一般樣式
const normalStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.3)',
  }),
  stroke: new Stroke({
    color: '#333333',
    width: 2,
  }),
  text: new ol.style.Text({
    text: '用來顯示名稱',
    offsetX: 10,
    scale: 1.3,
    textAlign: 'start',
    fill: new ol.style.Fill({
      color: '#FFFFFF'
    }),
    stroke: new ol.style.Stroke({
      color: '#333333',
      width: 3.5
    })
  })
});

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: (function () {
    var style = normalStyle;
    var styles = [style];
    return function (feature, resolution) {
      style.getFill().setColor(DistrictColorSet(feature.get("name")));
      style.getText().setText(feature.get("name"));
      return styles;
    };
  })()
  

});
const vector2 = new ol.layer.Vector({
  source: vectorSource2,
  style: (function () {
    var style = normalStyle;
    var styles = [style];
    return function (feature, resolution) {
      style.getFill().setColor(DistrictColorSet(feature.get("name")));
      style.getText().setText(feature.get("name"));
      return styles;
    };
  })()
  

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
  layers: [raster, vector,vector2],

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

  createMyTooltip();  //建立新的工具提示
  if (features.length > 0) {
    let info = features[0].get('name');
    let geom = features[0].getGeometry();
    let tooltipCoord;

    if (geom instanceof Polygon) {
      tooltipCoord = geom.getInteriorPoint().getCoordinates();  //取得內心坐標
      info = GetDistrictPopulationValue(info);  //輸入區名取得人口數值

    } else if (geom instanceof Point) {
      tooltipCoord = geom.getFirstCoordinate();  //取得點坐標
    }

    myTooltipElement.innerHTML = info;
    myTooltip.setPosition(tooltipCoord);
  }
};

//當滑鼠按下圖徵時
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

//回到起始位置
function GoInitView() {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}

//取得下拉選單物件
const PopulationSelect = document.getElementById('PopulationSelect');

//人口統計資料
let populationData;

//人口統計年度選單下拉選擇改變時
function PopulationSelectChange() {
  if (populationData == null) {
    LoadpopulationData();
  }
  else {
    let vectorLayer = map.getLayers().item(1);  //指到vector圖層
    vectorLayer.changed();
  }
}
//色碼表 https://www.ifreesite.com/color/
let colorList = ["#844200"
  , "#9F5000"
  , "#BB5E00"
  , "#D26900"
  , "#EA7500"
  , "#FF8000"
  , "#FF9224"
  , "#FFA042"
  , "#FFAF60"
  , "#FFBB77"
  , "#FFC78E"
  , "#FFD1A4"
  , "#FFDCB9"
  , "#FFE4CA"
  , "#FFEEDD"
  , "#FFFAF4"];
//人口統計級距
let colorLevelList = [300000
  , 280000
  , 260000
  , 240000
  , 220000
  , 200000
  , 180000
  , 160000
  , 140000
  , 120000
  , 100000
  , 80000
  , 60000
  , 40000
  , 20000
  , 0];
//載入人口資料
function LoadpopulationData() {
  let request = new XMLHttpRequest();
  let requestURL = "population.json";
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function () {
    populationData = request.response;
    //alert(populationData[1].District);
    let vectorLayer = map.getLayers().item(1);  //指到vector圖層
    vectorLayer.changed();  //重新展示圖層
  }
}
function GetDistrictPopulationValue(districtName) {
  let populationValue = 0;

  if (populationData != null) {
    //
    for (let i = 0; i < populationData.length; i++) {
      if (districtName == populationData[i].District) {  //比對到區名
        if (PopulationSelect.value == "Year112") {
          populationValue = populationData[i].Year112;  //取得Year112的數值
        }
        else if (PopulationSelect.value == "Year111") {
          populationValue = populationData[i].Year111;  //取得Year111的數值
        }
        else if (PopulationSelect.value == "Year110") {
          populationValue = populationData[i].Year110;  //取得Year110的數值
        } 
        else if (PopulationSelect.value == "Year109") {
          populationValue = populationData[i].Year109;  //取得Year109的數值
        }
        else if (PopulationSelect.value == "Year108") {
          populationValue = populationData[i].Year108;  //取得Year108的數值
        }
        else if (PopulationSelect.value == "Year107") {
          populationValue = populationData[i].Year107;  //取得Year107的數值
        }
      }
    }
  }

  return populationValue;  //回值對應人數
}
//取得設定顏色
function DistrictColorSet(districtName) {
  let colorIndex = 0;
  let populationValue = GetDistrictPopulationValue(districtName);

  //依人口數找對應級距
  for (let i = 0; i < colorLevelList.length; i++) {
    if (populationValue >= colorLevelList[i]) {  //比對數值所在級距
      colorIndex = i;
      break;
    }
  }

  return colorList[colorIndex];  //回值對應級距的顏色值
}

