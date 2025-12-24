const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const GPX = ol.format.GPX;  //取用GPX套件
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const Style = ol.style.Style;  //取用style套件Style類別
const Point = ol.geom.Point;  //取用Point套件
const Overlay = ol.Overlay;  //取用Overlay套件


//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: rasterSource,
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
  layers: [raster],
  view: view,
});

//回到起始位置
var GoInitView = function () {
  view.setCenter(defaultViewOptions.center);
  view.setZoom(defaultViewOptions.zoom);
}
//GPS軌跡使用樣式
const TrackStyle = {
  'Point': new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: 'rgba(255,0,0,0.4)',
      }),
      radius: 5,
      stroke: new Stroke({
        color: '#ff0000',
        width: 1,
      }),
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: '#0f0',
      width: 3,
    }),
  }),
};

//紀錄是否有載入GPS 軌跡
let IsGpxDataLoad = false;

//載入GPS 軌跡
function LoadGpxData() {
  if (!IsGpxDataLoad)
  {
    //建立資料來源
    const vectorSource = new ol.source.Vector({
      url: '20211203-115455T1.gpx',
      format: new GPX(),
    });

    //建立向量圖層
    const vector = new ol.layer.Vector({
      source: vectorSource,
      style: function (feature) {
        return TrackStyle[feature.getGeometry().getType()];
      },
    });
    map.addLayer(vector);  //將圖層加到清單內
    IsGpxDataLoad = true;  //紀錄已有載入
  }
}
    //圖層的圖徵載入完成後
    vectorSource.on('featuresloadend', function (evt) {
      map.getView().fit(vectorSource.getExtent());
      view.setZoom(view.getZoom() - 1);
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
  myTooltipElement = document.createElement('div');  //建立網頁上容器
  myTooltipElement.className = 'ol-tooltip ol-tooltip-my';
  myTooltip = new Overlay({
    element: myTooltipElement,  //指定網頁上容器
    offset: [0, -15],  //位移的數值
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(myTooltip);  //工具提示加到Overlay
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
    let info = features[0].get('name');  //取出名稱文字內容
    let geom = features[0].getGeometry();
    let tooltipCoord;

    if (geom instanceof Point) {
      tooltipCoord = geom.getFirstCoordinate();  //取得第一個坐標點
    }

    myTooltipElement.innerHTML = info; //設定工具提示顯示的文字內容
    myTooltip.setPosition(tooltipCoord);  //設定工具提示的坐標位置
  }
};


//當地圖點擊時 [顯示圖徵名稱]
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);  //顯示圖徵名稱函數
});
