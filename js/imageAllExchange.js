class ImageAll {
    constructor(_detectAllFacesFn,_isDev) {
        this.detectAllFacesFn = _detectAllFacesFn;
        this.result = {
            elements: [],
            urls: [],
            types: [],
            sizes: [],
            allFaces: {}
        };
        this.isDev=!!_isDev;
    };



    async run(_dom) {
        const one = (new Date()).getTime();
        await this.get(_dom);
        if (this.isDev) console.log(this, this.len());
        this.updateFacesResult(await this.detectAllFacesFn(this.result.urls));
        await this.exChangeImages();
        if (this.isDev) console.log('TIME:', (new Date()).getTime() - one, this);

    };


    updateFacesResult(_allFaces) {
        this.result.allFaces = _allFaces;
    };

    async get(_parent) {
        let that = this;
        that.getImgElement();
        
        await that.traversal(_parent);
        if (this.isDev) console.log(this);
    };

   
    async exChangeImages() {
        let that = this;
        let allFaces = this.result.allFaces;

        let imgs = this.result.elements,
            urls = this.result.urls,
            types = this.result.types;

        for (let index = 0; index < imgs.length; index++) {
            const img = imgs[index];
            let imgNew = await that.loadImgFromHTTP(urls[index]),
                ctx = that.createCanvasFromImg(imgNew);
            var detections = allFaces[urls[index]];

            for (let j = 0; j < detections.length; j++) {
                //console.log(detections)
                let box = detections[j]._box;
                let x = box._x, y = box._y, w = box._width, h = box._height;
                ctx.drawImage(that.randomGetBaseImg(j), x - w * 0.25, y - 0.85 * w * 279 / 400, w * 1.5, w * 1.5 * 279 / 400);
            };

            if (types[index] == 'element-image') {
                img.src = ctx.canvas.toDataURL();
            } else if (types[index] == 'background-image') {
                img.style["background-image"] = "url(" + ctx.canvas.toDataURL() + ")";
            };

        };
    };

    len() {
        return this.result.urls.length;
    };

    async traversal(_parent) {
        var that = this;
        var parent = _parent;
        var child = parent.firstChild;

        while (child != parent.lastChild) {

            if (child.nodeType == 1) {

                let exRes = await that.extractBgUrl(child);

                if (exRes && exRes.url) {
                    that.pushResult(child, exRes.url, "background-image", {
                        width: exRes.img.naturalWidth,
                        height: exRes.img.naturalHeight
                    });
                };

                await that.traversal(child);

            };

            child = child.nextSibling;
        };

        if (that.isDev) console.log(child != parent.lastChild,_parent);

    };

    async extractBgUrl(_element) {
        let that = this;
        let bgStr = window.getComputedStyle(_element)["background-image"];
        // console.log(encodeURI(bgStr))
        if (bgStr != "none") {
            let res = bgStr.split("(")[1].split(")")[0].replace(/\"|\'/ig, '');
            // console.log('------',res,'------');
            if (res != 'url' && !res.match('undefined')) {

                let img = await that.loadImgFromHTTP(res);
                let w = img.naturalWidth,
                    h = img.naturalHeight,
                    url = res;

                if (that.isImgMatch(w, h, url)) {

                    return { url: res, img: img };

                };

            };
        };
    };

    getImgElement() {
        let that = this;
        let imgs = document.images;

        //bug 
        if (that.isDev) console.log(imgs.length);

        for (let i = 0; i < imgs.length; i++) {
            let img = imgs[i];
            let w = img.naturalWidth,
                h = img.naturalHeight,
                url = img.src;

            if (that.isImgMatch(w, h, url)) {

                that.pushResult(img, url, "element-image", {
                    width: w,
                    height: h
                });

            };
        };
    };

    isImgMatch(_w, _h, _url) {
        let isMatch=!!(_w != 0 & _h != 0 & _w > 10 && !_url.match('.svg'));
        if (this.isDev)  console.log(isMatch);
        return isMatch;
    };

    pushResult(_e, _u, _t, _s) {

        this.result.urls.push(_u);
        this.result.elements.push(_e);
        this.result.types.push(_t);
        this.result.sizes.push(_s);

    };

    async loadImgFromHTTP(_url) {
        //console.log("loadImgFromHTTP:", _url);
        let that = this;

        return new Promise((resolve, reject) => {

            let url = _url;
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open("GET", url, true);
            // console.log(xhr);
            xhr.send();

            xhr.onload = async function (e) {
                // console.log(this.response);
                var blob = this.response;
                var base64 = btoa(
                    new Uint8Array(blob)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                //btoa(String.fromCharCode.apply(null, new Uint8Array(blob)))
                var str = 'data:image/png;base64,' + base64;
                var img = await that.loadImg(str);
                resolve(img);
            };
        });

    };

    async loadImg(_url) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = _url;
            // console.log(str);
            img.onload = function () {
                resolve(img);
            };
        });
    };

    createCanvasFromImg(_img) {
        let w = _img.naturalWidth,
            h = _img.naturalHeight;

        let c = document.createElement('canvas');
        c.width = w;
        c.height = h;

        let ctx = c.getContext('2d');
        ctx.drawImage(_img, 0, 0, w, h);

        return ctx

    };

    randomGetBaseImg(_index) {
        let imgs = [baseImg, baseImg1, baseImg2, baseImg3];
        if (_index >= imgs.length) {
            _index = 0;
        };
        let img = imgs[_index];
        return img;
    }
};









