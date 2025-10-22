const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const Style = ol.style.Style;  //取用style套件Style類別
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const Draw = ol.interaction.Draw; //取用繪圖套件
const LineString = ol.geom.LineString;  //取用LineString套件
const Polygon = ol.geom.Polygon;  //取用Polygon套件
const sphere = ol.sphere;  //取用計算距離、計算面積套件
const Overlay = ol.Overlay;  //取用Overlay套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

//建立vectorSource為vector圖層的來源
const vectorSource = new ol.source.Vector();

//建立vectorStyle為vector圖層的樣式設定
const vectorStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(255, 255, 255, 0.2)',    //rgba(red,green,blue,alpha)
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: '#ffcc33',
    width: 3,
  }),
  image: new CircleStyle({  //點位的圓
    radius: 7,  //半徑
    fill: new Fill({  //圓的填色
      color: '#ffcc33',
    }),
  }),
})

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: vectorStyle,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const view = new ol.View({
  center: ol.proj.fromLonLat([120.6499, 24.1808]),
  zoom: 16
});

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster, vector],
  view: view,
});

//取得下拉選單物件
const typeSelect = document.getElementById('VectorType');
//取得量測結果的顯示標籤
const labMeasureResult = document.getElementById('labMeasureResult');
//量測的工具提示物件.
let measureTooltipElement;

//這個是一個區域疊加層(Overlay), 用來放置顯示量測結果(measureTooltipElement)
let measureTooltip;

//當前繪製的圖徵
let sketch;

//建立drawingStyle為繪圖操作時的樣式設定 (採半透明色)
const drawingStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 4,
  }),
  image: new CircleStyle({  //點位的圓
    radius: 5,  //半徑
    stroke: new Stroke({  //圓的線段
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({  //圓的填色
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
})

//宣告一個draw變數給繪圖用
let draw;

//建立addInteraction()
function addInteraction() {
  draw = new Draw({
    source: vectorSource,
    type: typeSelect.value,
    style: drawingStyle,
  });
  map.addInteraction(draw);
}
  //配置事件監聽變數
  let listener;
  
  //當開始繪圖時
  draw.on('drawstart', function (evt) {
    //取得當前繪製的圖徵
    sketch = evt.feature;
    listener = sketch.getGeometry().on('change', function (changedEvt) {
      const geom = changedEvt.target;  //繪製的圖形
      let output;  //輸出量測結果文字
      if (geom instanceof Polygon) {
        output = formatArea(geom);  //計算面積


      } else if (geom instanceof LineString) {
        output = formatLength(geom);  //計算距離


      }
      labMeasureResult.innerHTML = output;
    });
  });

//建立一個新的量測的工具提示 Create a new measure tooltip
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15], //位移的數值
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}


//當改變圖形選擇後
function typeSelectChanged() {
  map.removeInteraction(draw);  //先移除draw
  draw = null;
  addInteraction();  //呼叫addInteraction()函式來重建draw
};

//清除向量圖徵
function clearVectorFeature() {
  vectorSource.clear();
  map.getOverlays().clear();  //清除Overlays疊加層

}

//開始量測
function startMeasure() {
  if (draw != null) { map.removeInteraction(draw); }
  //呼叫addInteraction()函式來啟用draw
  addInteraction();
}

//停止量測
function stopMeasure() {
  map.removeInteraction(draw);
  draw = null;
}


//格式化距離結果輸出
function formatLength(line) {
  const length = sphere.getLength(line); //計算距離
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

//格式化面積結果輸出
function formatArea(polygon) {
  const area = sphere.getArea(polygon); //計算面積
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

//建立addInteraction()
function addInteraction() {
  draw = new Draw({
    source: vectorSource,
    type: typeSelect.value,
    style: drawingStyle,
  });
  map.addInteraction(draw);

  createMeasureTooltip();

  //配置事件監聽變數
  let listener;

  //當開始繪圖時
  draw.on('drawstart', function (evt) {
    //取得當前繪製的圖徵
    sketch = evt.feature;

    //顯示工具提示的坐標位置
    let tooltipCoord;

    listener = sketch.getGeometry().on('change', function (changedEvt) {
      const geom = changedEvt.target;  //繪製的圖形
      let output;  //輸出量測結果文字
      if (geom instanceof Polygon) {
        output = formatArea(geom);  //計算面積
        tooltipCoord = geom.getInteriorPoint().getCoordinates();  //取得內心坐標
      } else if (geom instanceof LineString) {
        output = formatLength(geom);  //計算距離
        tooltipCoord = geom.getLastCoordinate();  //取得最後一個點坐標
      }
      labMeasureResult.innerHTML = output;
      measureTooltipElement.innerHTML = output;  //設定工具提示顯示的文字內容
      measureTooltip.setPosition(tooltipCoord);  //設定工具提示的坐標位置
    });
  });

}

  //當繪圖結束時
  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);  //位移的數值
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
  });
