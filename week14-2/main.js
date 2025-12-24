const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件

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
  center: ol.proj.fromLonLat([120.6483, 24.1799]), //逢甲大學
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

//紙張大小 寬高(mm)
const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

//取得[輸出 PDF]按鈕
const exportButton = document.getElementById('export-pdf');

//取得[紙張大小]下拉選單
const formatSelect = document.getElementById('format');

//取得[解析度]下拉選單
const resolutionSelect = document.getElementById('resolution');

//輸出 PDF
function ExportPdf() {
  exportButton.disabled = true;  //先不能按
  document.body.style.cursor = 'progress';  //改變游標

  const format = formatSelect.value;  //紙張大小
  const resolution = resolutionSelect.value;  //解析度(DPI是一個量度單位，用於點陣數位影像，意思是指每一英吋長度中點的數目。)
  const dim = dims[format];  //紙張大小寬高陣列
  const width = Math.round((dim[0] * resolution) / 25.4);  //寬 (一英吋 = 25.4mm)
  const height = Math.round((dim[1] * resolution) / 25.4);  //高 (一英吋 = 25.4mm)
  const size = map.getSize();  //地圖在網頁上大小
  const viewResolution = map.getView().getResolution();  //取得解析度

    //map render完成
    map.once('rendercomplete', function () {
      const mapCanvas = document.createElement('canvas');  //建立繪圖版
      mapCanvas.width = width;
      mapCanvas.height = height;
      const mapContext = mapCanvas.getContext('2d');
  
          //處理繪圖
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const transform = canvas.style.transform;
          // Get the transform parameters from the style's transform matrix
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    //產生PDF
    const pdf = new jspdf.jsPDF('landscape', undefined, format);
    pdf.addImage(
      mapCanvas.toDataURL('image/jpeg'),
      'JPEG',
      0,
      0,
      dim[0],
      dim[1]
    );
    pdf.save('map.pdf');

    // Reset original map size
    map.setSize(size);
    map.getView().setResolution(viewResolution);
    exportButton.disabled = false;  //不能按 解除
    document.body.style.cursor = 'auto'; //改變游標

  });
    // Set print size
    const printSize = [width, height];
    map.setSize(printSize);
    const scaling = Math.min(width / size[0], height / size[1]);
    map.getView().setResolution(viewResolution / scaling);
  
}


