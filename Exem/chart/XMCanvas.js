if(! window.EXEM){
    window.EXEM = {
        cls: {
            create : function(className, arg){
                if(window.EXEM.cls[className]){
                    return new window.EXEM.cls[className](arg);
                }
                return null;
            }
        }
    };
}else{
    window.EXEM.cls = {};
    window.EXEM.cls.create = function(className, arg){
        if(window.EXEM.cls[className]){
            return new window.EXEM.cls[className](arg);
        }
        return null;
    };
}

(function(XM){
    /**
     * @note Base Canvas
     * @param arg
     * @constructor
     */
    var XMCanvas = function(){
        // Determine the screen's ratio of physical to device-independent
        // pixels.  This is the ratio between the canvas width that the browser
        // advertises and the number of pixels actually present in that space.

        // The iPhone 4, for example, has a device-independent width of 320px,
        // but its screen is actually 640px wide.  It therefore has a pixel
        // ratio of 2, while most normal devices have a ratio of 1.



    };

    XMCanvas.prototype.initProperty = function(arg){
        this.target = null;                                       // 차트가 생성될 레이어
        this.displayCanvas = document.createElement('canvas');    // 메인 뷰 캔버스
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.bufferCanvas = document.createElement('canvas');     // 버퍼 캔버스
        this.bufferCtx = this.bufferCanvas.getContext('2d');
        this.overlayCanvas = document.createElement('canvas');    // overlay 캔버스
        this.overlayCtx = this.overlayCanvas.getContext('2d');

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio =
                this.displayCtx.webkitBackingStorePixelRatio ||
                this.displayCtx.mozBackingStorePixelRatio ||
                this.displayCtx.msBackingStorePixelRatio ||
                this.displayCtx.oBackingStorePixelRatio ||
                this.displayCtx.backingStorePixelRatio || 1;

        this.pixelRatio = devicePixelRatio / backingStoreRatio;
        this.oldPixelRatio = this.pixelRatio;

        if (devicePixelRatio !== backingStoreRatio) {
            this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);
            this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
        }

        for(var key in arg){
            this[key] = arg[key];
        }

        arg = null;
    };

    XMCanvas.prototype.setWidth = function(width){
        this.displayCanvas.width = width * this.pixelRatio;
        this.displayCanvas.style.width = width + 'px';
        this.bufferCanvas.width = width * this.pixelRatio;
        this.bufferCanvas.style.width = width + 'px';
        this.overlayCanvas.width = width * this.pixelRatio;
        this.overlayCanvas.style.width = width + 'px';
    };

    XMCanvas.prototype.setHeight = function(height){
        this.displayCanvas.height = height * this.pixelRatio;
        this.displayCanvas.style.height = height + 'px';
        this.bufferCanvas.height = height * this.pixelRatio;
        this.bufferCanvas.style.height = height + 'px';
        this.overlayCanvas.height = height * this.pixelRatio;
        this.overlayCanvas.style.height = height + 'px';
    };

    /**
     * canvas 에 그린다.
     * double buffering 으로 beffuer canvas 에 그린후 display canvas 에 buffer canvas 를 엎는다.
     */
    XMCanvas.prototype.draw = function(){
        this.clearDraw();

        this.displayCtx.drawImage(this.bufferCanvas, 0 , 0);
    };

    XMCanvas.prototype.redraw = function(width, height){
        if (!width && !this.width && !height && !this.height) {
            return;
        }

        this.setWidth(width || this.width);
        this.setHeight(height || this.height);

        this.initScale();

        if(this.isDrawing){
            this.draw();
        }
    };

    XMCanvas.prototype.clearDraw = function(){
        this.clearRectRatio = (this.pixelRatio < 1)? this.pixelRatio : 1;

        this.displayCtx.clearRect(0, 0, this.displayCanvas.width / this.clearRectRatio, this.displayCanvas.height / this.clearRectRatio);
        this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width / this.clearRectRatio, this.bufferCanvas.height / this.clearRectRatio);
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio, this.overlayCanvas.height / this.clearRectRatio);

        if(this.maxValueTip){
            this.maxValueTip.hide();
        }
    };

    /**
     * @note highlight, crosshair, hit, selection.. 등 overlay 캔버스에 적용된 액션들을 없앤다.
     */
    XMCanvas.prototype.overlayClear = function(){
        this.clearRectRatio = (this.pixelRatio < 1)? this.pixelRatio : 1;
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio, this.overlayCanvas.height / this.clearRectRatio);
    };

    XMCanvas.prototype.aliasPixel = function(pixelWidth){
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    };

    XMCanvas.prototype.calculateMagnitude = function(val){
        return Math.floor(Math.log(val) / Math.LN10);
    };


    XMCanvas.prototype.initScale = function() {
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio =
                this.displayCtx.webkitBackingStorePixelRatio ||
                this.displayCtx.mozBackingStorePixelRatio ||
                this.displayCtx.msBackingStorePixelRatio ||
                this.displayCtx.oBackingStorePixelRatio ||
                this.displayCtx.backingStorePixelRatio || 1;

        this.pixelRatio = devicePixelRatio / backingStoreRatio;

        if (this.oldPixelRatio !== this.pixelRatio) {
            this.oldPixelRatio = this.pixelRatio;
            this.resize();
        }

        if (devicePixelRatio !== backingStoreRatio) {
            this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);
            this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
        }
    };

//////////////////////////////////////////////////// EVENT ////////////////////////////////////////////////////

    /**
     * dom resize 가 안먹어서 extjs resize 이벤트를 대입.
     * @param me
     * @param width
     * @param height
     * @param oldWidth
     * @param oldHeight
     * @param eOpts
     */
    XMCanvas.prototype.resize = function( me, width, height, oldWidth, oldHeight, eOpts){
        this.width = width;
        this.height = height;

        var context = this.bufferCtx;
        // Save the context, so we can reset in case we get replotted.  The
        // restore ensure that we're really back at the initial state, and
        // should be safe even if we haven't saved the initial state yet.

        context.restore();
        context.save();

        // Scale the coordinate space to match the display density; so even though we
        // may have twice as many pixels, we still want lines and other drawing to
        // appear at the same size; the extra pixels will just make them crisper.

        context.scale(this.pixelRatio, this.pixelRatio);

        if(this.resizeTimer){
            clearTimeout(this.resizeTimer);
        }

        this.resizeTimer = setTimeout(this.redraw.bind(this), 50);
    };



//////////////////////////////////////////////////// UTIL ////////////////////////////////////////////////////
    XMCanvas.prototype.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);

        return r + "," + g + "," + b;
    };

    /**
     *
     * @param evt{object} mouse event
     * @returns {obejct} {x: *, y: *}
     */
    XMCanvas.prototype.getMousePosition = function(evt) {
        var mouseX, mouseY;
        var e = evt.originalEvent || evt,
        //canvas = evt.currentTarget || evt.srcElement,
            boundingRect = this.overlayCanvas.getBoundingClientRect();

        if (e.touches){
            mouseX = e.touches[0].clientX - boundingRect.left;
            mouseY = e.touches[0].clientY - boundingRect.top;

        }
        else{
            mouseX = e.clientX - boundingRect.left;
            mouseY = e.clientY - boundingRect.top;
        }

        return [mouseX, mouseY];
    };

    XM.cls['XMCanvas'] = XMCanvas;
})(window.EXEM);
