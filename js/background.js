/*
// 监听的回调
var callback = function(details) {
  
  if (details.type=='image') {
    console.log(details.type,details);
  };
  var headers = details.responseHeaders;
  // 返回修改后的headers列表
  return { responseHeaders: headers };
};
// 监听哪些内容
var filter = {
  urls: ["<all_urls>"]
};
console.log(chrome.webRequest)

chrome.webRequest.onCompleted.addListener(callback, filter,["responseHeaders"]);

*/


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  if (request.type == 'detectAllFaces_background') {
    getResult(request.imgurls).then(sendResponse);
  };

  return true;

});


const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 });
console.log(faceapi.nets.ssdMobilenetv1);


if (!faceapi.nets.ssdMobilenetv1.params) {
  setTimeout(downloadModel, 500);
} else {
  console.log('models ready', faceapi.nets)
};

async function downloadModel() {
  if (!faceapi.nets.ssdMobilenetv1.params) {
    console.log('download models')
    const net = await faceapi.createSsdMobilenetv1(await faceapi.fetchNetWeights(chrome.runtime.getURL('/weights/ssd_mobilenetv1.weights')));
    faceapi.nets.ssdMobilenetv1 = net;
    console.log('models ready', faceapi.nets.ssdMobilenetv1.params)
  } else {
    console.log('models ready', faceapi.nets.ssdMobilenetv1.params)
  };
};


const imageAll = new ImageAll();
var result = {};

async function getResult(_urls) {

  let res = {};

  for (let index = 0; index < _urls.length; index++) {
    const url = _urls[index];
    console.log(result[url]);
    if (!result[url]) {
      let imgNew = await imageAll.loadImgFromHTTP(url);
      let detections = await faceapi.detectAllFaces(imgNew, faceDetectionOptions);
      console.log(detections);
      result[url] = detections;
      res[url] = detections;
    } else {
      res[url] = result[url];
    };

  };

  return res;
};



