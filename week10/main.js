const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Squre = ol.style.Squre
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

//建立Vector地圖為vector圖層的來源
const vectorSource = new ol.source.Vector({
  url: 'fcu.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});

//建立lodgingLayer的資料來源(lodgingSource)
const lodgingSource = new ol.source.Vector({
  url: 'test2.kml',
  format: new Kml({
    extractStyles: false,  //截取KML樣式
  }),
});
//當lodgingLayer資料載入時, 定位及Zoom到第13層
lodgingSource.on('featuresloadend', function (evt) {
  map.getView().fit(lodgingSource.getExtent());

});
//建立clusterLayer的資料來源(clusterSource)
const clusterSource = new ol.source.Cluster({
  distance: 30,  //聚集半徑：螢幕上 30 像素
  minDistance: 20,  //避免過於頻繁的重新計算：20 像素
  source: lodgingSource,  //引用旅宿位置資料來源
});

//建立normalStyle為vector圖層的樣式設定
const normalStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(255, 255, 255, 0.3)',    //rgba(red,green,blue,alpha)
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: '#00C5CD',
    width: 3,
  }),
})
//建立selectedStyle為vector圖層被選取時樣式設定
const selectedStyle = new Style({
  fill: new Fill({ //多邊形的填色
    color: 'rgba(255, 0, 0, 0.3)',    //紅色透明度0.3
  }),
  stroke: new Stroke({ //代表線段的樣式
    color: '#FF0000',
    width: 3,
    lineDash: [4, 8], //虛線
  }),
});
//建立lodgingStyle為lodgingLayer圖層的樣式設定
const lodgingStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({
      color: '#ffcc33',
    }),
    stroke: new Stroke({
      color: '#00C5CD',
      width: 3,
    }),
  }),
  text: new ol.style.Text({
    text: '用來顯示名稱',
    scale: 1.3,
    textAlign: 'left',  //文字對齊左方
    offsetX: 13,  // 水平向右偏移 13 像素
    fill: new ol.style.Fill({
      color: '#000000'
    }),
    stroke: new ol.style.Stroke({
      color: '#FFFF99',
      width: 3.5
    })
  })

})
//建立clusterStyle為clusterLayer圖層的樣式設定
const styleCache = {};
const clusterStyle = function (feature) {
  const size = feature.get('features').length;
  let style = styleCache[size];
  if (!style) {
    style = new Style({
      image: new CircleStyle({
        radius: 10,
        stroke: new Stroke({
          color: '#fff',
        }),
        fill: new Fill({
          color: '#3399CC',
        }),
      }),
      text: new ol.style.Text({
        text: size.toString(),
        fill: new Fill({
          color: '#fff',
        }),
      }),
    });
    styleCache[size] = style;
  }
  return style;
}

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: normalStyle,
});
//建立lodgingLayer圖層
const lodgingLayer = new ol.layer.Vector({
  source: lodgingSource,
  minZoom: 15,  //表示在 Zoom = 17, 18, 19... 時顯示，但在 Zoom = 16 及以下時不顯示。

  style: (function () {
    var style = lodgingStyle;
    var styles = [style];
    return function (feature, resolution) {
      style.getText().setText(feature.get("name"));
      return styles;
    };
  })()


});
//建立clustersLayer圖層
const clustersLayer = new ol.layer.Vector({
  source: clusterSource,
  maxZoom: 15,  //表示在 Zoom = 16 及以下時顯示，但在 Zoom = 17 及以上時不顯示。
  style: clusterStyle,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const defaultViewOptions = {
  center: ol.proj.fromLonLat([120.6483, 24.1799]),
  zoom: 16
};
const view = new ol.View(defaultViewOptions);

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster, vector, lodgingLayer, clustersLayer],
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
const displayFeatureInfo = function (pixel) {
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
    } else if (geom instanceof Point) {
      info = features[0].get('description');
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
const buildingSelect = document.getElementById('building');

//被選取的圖徵
let selectedFeature;

//建築物下拉選擇改變時
function buildingChange() {
  let features = vector.getSource().getFeatures();

  if (selectedFeature != null) {  //判斷selectedFeature是否空值
    selectedFeature.setStyle(normalStyle);  //先將前一個被選取的圖徵  改為原本的樣式
    selectedFeature = null;  //將selectedFeature設成空值
  }

  for (let i = 0; i < features.length; i++) {
    let name = features[i].get('name');
    if (name == buildingSelect.value) {
      selectedFeature = features[i];
    }
  }

  if (selectedFeature != null) {
    selectedFeature.setStyle(selectedStyle);  //將圖徵設定為被選取的樣式
    map.getView().fit(selectedFeature.getGeometry().getExtent());
    view.setZoom(19);
  }
}
