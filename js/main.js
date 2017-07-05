/**
 * Created by ash on 05/07/2017.
 */
window.onload = function () {
  // 定义id选择器简便方法
  const $$ = function(id) {
    return document.getElementById(id);
  };
  let mosaicCanvas = null;
  let exportFileType = 'image/jpg';
  const fileSelectInput = $$('file-select-input');

  // 点击‘select file’按钮，触发文件选择
  $$('select-file-btn').addEventListener('click', function() {
    fileSelectInput.click();
  }, false);

  // 删除多余节点
  const clearNode = function(){
    $$('image-bg-div').hasChildNodes() && $$('image-bg-div').removeChild($$('image-bg-div').firstChild);
  };

  // 获取canvas缩放比例，防止canvas超出展示区域
  const getScaleRate = function() {
    const imageBgDiv = getComputedStyle($$('image-bg-div'), null);
    const imageDisplay = getComputedStyle($$('image-display'), null);
    const [ bgWidth, bgHeight, imgWidth, imgHeight ] = [
      imageBgDiv.width.replace('px', ''),
      imageBgDiv.width.replace('px', '') * 0.61,
      imageDisplay.width.replace('px', ''),
      imageDisplay.height.replace('px', ''),
    ];
    const rate = Math.min(bgWidth / imgWidth, bgHeight / imgHeight);
    return {
      rate: rate < 1 ? rate : 1,
      marginLeft: ((bgWidth - imgWidth) / 2) + 'px',
      marginTop: ((bgHeight - imgHeight) / 2) + 'px',
    };
  };

  // 文件选择
  fileSelectInput.addEventListener('change', function() {
    const files = fileSelectInput.files;
    if (!files.length || fileSelectInput.files[0].type.indexOf('image') < 0) { // 没有选择文件时
      // 删除没有用的canvas节点
      clearNode();
      // 错误信息提示
      alert('没有选择文件或者文件类型错误');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(files[0]); // 获取选择的文件信息，并转化成DataURL
    reader.onload = function() { // 获取完成后
      // 删除没有用的canvas节点
      clearNode();

      // 新建img节点，并设置属性
      const imageDisplay = document.createElement("img");
      imageDisplay.setAttribute('id', 'image-display');
      imageDisplay.setAttribute('src', this.result);
      $$('image-bg-div').appendChild(imageDisplay);

      setTimeout(function() {
        // 转换成canvas，加上mosaic
        const mosaicLevel = parseInt($$('mosaic-level').value, 10) * 2;
        // 添加mosaic
        mosaicCanvas = $$('image-display').closePixelate([{ resolution: mosaicLevel}]);
        //设置缩放
        const scaleData = getScaleRate();
        if (scaleData.rate < 1) {
          $$('image-display').style.transform = 'scale(' + scaleData.rate + ')';
          $$('image-display').style.marginLeft = scaleData.marginLeft;
          $$('image-display').style.marginTop = scaleData.marginTop;
        }
        $$('image-display').style.opacity = 1;
      }, 0);

    };
  }, false);

  // 修改mosaic模糊程度
  $$('mosaic-level').addEventListener('blur', function(e) {
    const value = e.target.value ? parseInt(e.target.value, 10) : 5;
    $$('mosaic-level').value = !value ? 5 : value;
    if ($$('image-display')) {
      mosaicCanvas.render([{ resolution: value * 2 }]);
    }
  }, false);

  // 修改文件导出格式
  const changeExportFileType = function(e) {
    exportFileType = e.target.value;
    const activeType = exportFileType.substr(6);
    const inactiveType = activeType === 'jpg' ? 'png' : 'jpg';
    $$(activeType + '-type-label').classList.add('active');
    $$(inactiveType + '-type-label').classList.remove('active');
  };
  $$('image-jpg-type').addEventListener('click', changeExportFileType, false);
  $$('image-png-type').addEventListener('click', changeExportFileType, false);

  // 文件导出
  $$('export-file-btn').addEventListener('click', function() {
    if (mosaicCanvas) {
      const strDataURI = $$('image-display').toDataURL(exportFileType);
      $$('download-file-link').setAttribute('href', strDataURI);
      $$('download-file-link').click();
    }
  }, false);
}