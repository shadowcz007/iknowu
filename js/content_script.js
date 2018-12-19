async function detectAllFaces_background(_urls) {
    return new Promise((resolve, reject) => {
        //console.log(_urls);
        chrome.runtime.sendMessage(
            { type: 'detectAllFaces_background', imgurls: _urls },
            function (response) {
                //console.log('收到来自后台的回复：', response);
                resolve(response);
            }
        );
    })
};

async function init(){
    const imageAll=new ImageAll(detectAllFaces_background,false);

    await imageAll.run(document.body);
};

setTimeout(()=>{
    init();
},1000);


