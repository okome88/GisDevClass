const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const fromLonLat = ol.proj.fromLonLat;  //取用fromLonLat坐標套件

const coordFCU = fromLonLat([120.6483, 24.1799]);  //逢甲大學
const coordTCCG = fromLonLat([120.6458, 24.1602]);  //台中市政府
const coordTMNS = fromLonLat([120.6661, 24.1575]);  //科博館
const coordWFP = fromLonLat([120.6453, 24.1454]);  //文心森林公園
const coordTOKYO = fromLonLat([139.7847, 35.5408]);  //TOKYO

//建立OSM地圖為來源圖層
const source = new ol.source.OSM();

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//定義一個預設View(視角)參數集
const defaultViewOptions = {
  center: ol.proj.fromLonLat([120.6458, 24.1602]),
  rotation: Math.PI / 4,  //PI 是對應 180°
  zoom: 16
};
//建立地圖View(視角)
const view = new ol.View(defaultViewOptions);

//順旋10度 
function RotateViewRight() {
  var newRotation = view.getRotation() + (Math.PI / 18);  //PI 是對應 180°， + (Math.PI / 4) 就是加45度
  view.setRotation(newRotation);  //設定地圖目前View(視角)的角度
}

//逆旋10度
function RotateViewLeft() {
  var newRotation = view.getRotation() - (Math.PI / 18);  //PI 是對應 180°， - (Math.PI / 4) 就是減45度
  view.setRotation(newRotation);  //設定地圖目前View(視角)的角度
}



//動畫效果 順旋45度 (取得目前的角度再加45度)
function AnimateRotateViewRight() {
  view.animate(
  {
    rotation:Math.PI,  //加45度
    easing: ol.easing.easeIn,
  },
  {
    rotation:0,  
    easing: ol.easing.easeOut,
  }
  
);
}

//動畫效果 逆旋45度 (取得目前的角度再減45度)
function AnimateRotateViewLeft() {
  view.animate({
    rotation: view.getRotation() - (Math.PI / 4),  //減45度
  });
}

//平移到逢甲大學
function PanToFcu() {
  view.animate({ //動畫效果
    center: coordFCU,
    duration: 6000,  //秒數 6000 = 6秒
  });
}

//動畫效果 飛到某地點
function flyTo(location) {
  const duration = 3000;  //秒數 3000 = 3秒
  const zoom = view.getZoom();
  //動畫效果 平移
  view.animate({
    center: location,
    duration: duration,
  });
  //動畫效果 先拉遠再拉近 (上下)
  view.animate(
    {
      zoom: zoom - 10,  //拉高 1 層
      duration: duration / 2,  //秒數 3000 / 2 = 1.5秒
      
    },
    {
      zoom: zoom,  //再往下 1 層
      duration: duration / 2,  //秒數 3000 / 2 = 1.5秒
    }
  );
}

//飛到科博館
function FlyToTMNS() {
  flyTo(coordTMNS);  //參數1:目的地坐標
}

//緩動函數-彈跳 參數ｔ時間百分比（介於0%～100%之間）
//參考 https://easings.net/zh-tw
function easeOutBounce(t) {
  const s = 7.5625;
  const p = 2.75;  //波形的時間分段
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else if (t < 2 / p) {
    t -= 1.5 / p;
    l = s * t * t + 0.75;
  } else if (t < 2.5 / p) {
    t -= 2.25 / p;
    l = s * t * t + 0.9375;
  } else {
    t -= 2.625 / p;
    l = s * t * t + 0.984375;
  }
  return l;
}

//彈跳到文心森林公園
function BounceToWFP() {
  view.animate({
    center: coordWFP,
    duration: 3000,  //秒數 3000 = 3秒
    easing: easeOutBounce,  //緩動函數
  });
}

//旋轉到科博館
function SpinToTMNS () {
  // 單次旋轉最多180°, 所以分成2個部份
  const center = view.getCenter();
  view.animate(
    {
      center: [
        center[0] + (coordTMNS[0] - center[0]) / 2 ,
        center[1] + (coordTMNS[1] - center[1]) / 2
      ],  // 取始點與終點的中間點
      rotation: Math.PI,
      easing: ol.easing.easeIn,
    },
    {
      center: coordTMNS,
      rotation: 0,
      easing: ol.easing.easeOut,
    }
  );
}

//飛到科博館
function FlyToTOKYO() {
  flyTo(coordTOKYO);  //參數1:目的地坐標
}



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

//回到起始位置
function GoInitView() {
  //設定地圖目前的View(視角)
  view.setCenter(defaultViewOptions.center);  //採用先前定義的中心點
  view.setZoom(defaultViewOptions.zoom);  //採用先前定義的zoom層級
}
