const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const FullScreen = ol.control.FullScreen;  //取用FullScreen全螢幕控制器套件
const OverviewMap = ol.control.OverviewMap;  //取用OverviewMap鷹眼控制器套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const MousePosition = ol.control.MousePosition;  //取用MousePosition滑鼠位置坐標套件
const createStringXY = ol.coordinate.createStringXY;  //createStringXY是用來將坐標數值建立成字串格式
const ScaleLine = ol.control.ScaleLine;  //取用ScaleLine比例尺控制器套件
const Control = ol.control.Control;  //取用控制器套件


//定義 Home鍵 控制器 (回預設View)
class HomeControl extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const button = document.createElement('button');
    button.innerHTML = 'H';  //按鈕文字
    const element = document.createElement('div');
    element.className = 'back-home ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
      target: options.target,
    });
    button.addEventListener('click', this.handleHome.bind(this), false);  //加入Click動作
  }

  handleHome() {
    map.setView(new ol.View({
      center: ol.proj.fromLonLat([0.6499, 36.1809]),
      zoom: 16
    }));
  }
}
//建立 Home鍵 控制器 (回預設View)
const homeControl = new HomeControl();

//建立OSM地圖為來源圖層
const source = new ol.source.OSM();

//建立 全螢幕 控制器
const fullScreenControl = new FullScreen();
//建立 坐標 控制器
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),  //參數為小數點位數
  projection: 'EPSG:4326',  // WGS84 
  // comment the following two lines to have the mouse position be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});


/* 
  1.建立 鷹眼 控制器
  2.指定來源地圖
 */
const overviewMapControl = new OverviewMap({
  layers: [
    new ol.layer.Tile({
      source: source,    //指定來源地圖
    }),
  ],
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();
//建立 比例尺 控制器
//建立 比例尺 控制器
const scaleLineControl = new ScaleLine();

const scalebarControl = new ScaleLine({
  units: "metric",  //單位公尺
  bar: true,
  steps: 4,  //幾節
  text: true,  //顯示比例 1 : XXXX
  minWidth: 140  //最小寬度 px
  
});



//建立地圖View(視角)
const view = new ol.View({
  center: ol.proj.fromLonLat([282.963, 38.8975]),
  zoom: 16
});

//建立地圖
var map = new ol.Map({
  
  controls: defaultControls().extend([fullScreenControl, overviewMapControl, zoomSliderControl, mousePositionControl, scaleLineControl, homeControl,scalebarControl]),

  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: source    //指定來源地圖
    })
  ],
  view: view,
});

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

//重新設定坐標系統
function SetProjection(obj) {
  mousePositionControl.setProjection(obj.value);
}

//重新設定小數位數
function SetPrecision(obj) {
  var format = createStringXY(obj.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
}




