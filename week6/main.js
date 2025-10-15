const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const Style = ol.style.Style;  //取用style套件Style類別
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const rasterSource = new ol.source.OSM();
const zoomSliderControl = new ZoomSlider();
const Draw = ol.interaction.Draw; //取用繪圖套件

//建立raster圖層
const raster = new ol.layer.Tile({
  source: rasterSource,
});


//建立vectorSource為vector圖層的來源
const vectorSource = new ol.source.Vector();
//建立vectorStyle為vector圖層的樣式設定
const vectorStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(148, 0, 148, 0.8)',    //rgba(red,green,blue,alpha)
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: '#00cc33',
    width: 2,
  }),
  image: new CircleStyle({  //點位的圓
    radius: 7,  //半徑
    fill: new Fill({  //圓的填色
      color: '#00cc33',
    }),
  }),
})

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: vectorStyle,
});

//建立drawingStyle為繪圖操作時的樣式設定 (採半透明色)
const drawingStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(0, 255, 0, 0.2)',
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: 'rgba(255, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({  //點位的圓
    radius: 5,  //半徑
    stroke: new Stroke({  //圓的線段
      color: 'rgba(0, 0, 255, 0.7)',
    }),
    fill: new Fill({  //圓的填色
      color: 'rgba(0, 57, 245, 0.2)',
    }),
  }),
})



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



//宣告一個draw變數給繪圖用
let draw;
//取得下拉選單物件
const typeSelect = document.getElementById('VectorType');

//建立addInteraction()函式，加入到地圖交互作用功能(手動繪圖操作)
function addInteraction() {
  if (draw) map.removeInteraction(draw); // 先移除舊的
  draw = new Draw({
    source: vectorSource,
    type: typeSelect.value,
    style: drawingStyle,

  });
  map.addInteraction(draw);
}
//當改變圖形選擇後
function typeSelectChanged() {
  map.removeInteraction(draw);  //先移除draw
  addInteraction();  //呼叫addInteraction()函式來重建draw
};




//呼叫addInteraction()函式
addInteraction();
//清除向量圖徵
function clearVectorFeature() {
  vectorSource.clear();
}
