Ext.define('Exem.chart.BarChart', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,
    devMode: false,
    isApplyTheme: false,

    maxValue: null,
    maxBarWidth: null,
    fixWidth: null,
    totalMode: false,

    isBarStripe: false,
    barStripeImg: null,

    isShowValue: true,
    stackBarHeight: 3,
    stackBarBlank : 2.5,

    color: {
        BASE          : '#FFFFFF',
        COLOR_TEXT    : ['#42A5F6',   '#FF9803',   '#D7000F'   , 'dimgrey'],
        COLOR_BAR     : ['#42A5F6',   '#FF9803',   '#D7000F'   ]
    },

    listeners: {
        resize: function() {
            if (this.isInitResize) {
                this.init(this.up());
                this.isInitResize = false;
            } else {
                this.resize = true;
            }
        },

        beforedestroy: function() {
            clearInterval(this.dataRefreshTimer);
            clearTimeout(this.animationTimer);
        }
    },

    onData: function(adata) {
        if (!adata || adata.rows.length <= 0) {
            return;
        }

        var me  = this;
        var idx = -1;

        _.each(adata.rows, function(v) {
            if (v[6] == 255) {
                v[6] = 0;
            }

            idx = me.idArr.indexOf(v[3]);
            if (idx !== -1) {
                me.valueArr[idx] = [v[6]+v[7]+v[8], v[9]+v[10]+v[11], v[12]+v[13]];
            }
        });

        adata = null;
    },

    init: function(target) {
        this.target = target;
        var me = this;

        me.nameArr  = [];
        me.idArr    = [];
        me.valueArr = [];
        me.sumValue = [0, 0, 0];

        me.barBox   = [];

        me.barStep;

        var SCREEN_WIDTH  = target.getWidth();
        var SCREEN_HEIGHT = target.getHeight();

        var canvas, context;
        var getMouse;

        init();

        var graph = new BarGraph(context);
        graph.margin = 3;
        graph.width  = SCREEN_WIDTH - 10;
        graph.height = SCREEN_HEIGHT - 10;

        me.dataRefreshTimer = setInterval(function () {
            graph.update();
        }, 1000);


        function init() {
            var targetEl = target.getEl();
            targetEl.setStyle('background-color', me.color.BASE);

            canvas = document.createElement('canvas');
            targetEl.appendChild(canvas);

            if (canvas && canvas.getContext) {
                context = canvas.getContext('2d');

                windowResizeHandler();

                canvas.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    if (me.totalMode === true) {
                        return;
                    }
                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;
                    var boxs = me.barBox;
                    var l = boxs.length;

                    for (var i = l-1; i >= 0; i--) {
                        if (mx >= boxs[i].x && mx <= boxs[i].w + boxs[i].x &&
                            my >= boxs[i].y && my <= boxs[i].h + boxs[i].y) {

                            realtime.openTxnFilterWasId = boxs[i].id;
                            if (realtime.openTxnFilterWasId != null) {
                                common.OpenView.onMenuPopup('rtm.src.rtmActiveTxnList');
                                e.stopPropagation();
                            }
                            return;
                        }
                    }
                  }, true);

                  canvas.addEventListener('mousemove', function(e) {
                    e.preventDefault();
                    if (me.totalMode === true) {
                        return;
                    }
                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;
                    var boxs = me.barBox;
                    var l = boxs.length;

                    for (var i = l-1; i >= 0; i--) {
                        if (mx >= boxs[i].x && mx <= boxs[i].w + boxs[i].x) {
                            if (my >= boxs[i].y && my <= boxs[i].h + boxs[i].y) {
                                $('#'+canvas.id).css('cursor','pointer');
                                break;
                            } else {
                                $('#'+canvas.id).css('cursor','default');
                            }
                        } else {
                            $('#'+canvas.id).css('cursor','default');
                        }
                    }
                }, false);
            }
        }

        function windowResizeHandler() {

            if (!me.isApplyTheme) {
                SCREEN_WIDTH = target.getWidth();
                SCREEN_HEIGHT = target.getHeight();
            }
            me.isApplyTheme = false;

            canvas.width = SCREEN_WIDTH-10;
            canvas.height = SCREEN_HEIGHT-5;

            if (graph) {
                graph.width = SCREEN_WIDTH - 10;
                graph.height = SCREEN_HEIGHT;

                if (me.maxBarWidth && (graph.width / me.nameArr.length) > me.maxBarWidth ) {
                    graph.width = (me.nameArr.length * me.maxBarWidth) ;
                }
            }

            setElPos(canvas, 0, 10);

            function setElPos(el, bottom, left) {
                el.style.position = 'absolute';
                el.style.bottom = bottom+'px';
                el.style.left   = left+'px';
            }
        }


        function BarGraph(ctx) {

            // Private properties and methods
            var that = this;

            // Public properties and methods
            this.width = 300;
            this.height = 150;
            this.margin = 5;
            this.backgroundColor = "transparent";

            this.largestValue;
            this.graphAreaWidth;
            this.graphAreaHeight;
            this.barWidth;
            this.barHeight;
            this.numOfBars;

            var draw = function () {
                if (me.resize) {
                    me.resize = false;
                    windowResizeHandler();
                }

                that.numOfBars = me.nameArr.length;

                that.graphAreaWidth = that.width;
                that.graphAreaHeight = that.height;

                me.barBox = [];

                var i;

                if (ctx.canvas.width !== that.width || ctx.canvas.height !== that.height) {
                    ctx.canvas.width = that.width;
                    ctx.canvas.height = that.height;
                }

                ctx.clearRect(0, 0, that.width, that.height);

                // If x axis labels exist then make room
                if (me.nameArr.length) {
                    that.graphAreaHeight -= 25;
                }

                if (me.maxBarHeight == null) {
                    me.maxBarHeight = 0;
                }

                // Calculate dimensions of the bar
                that.barWidth = Math.floor(that.graphAreaWidth / that.numOfBars - that.margin * 2);
                that.barHeight = that.graphAreaHeight - 25;

                // Determine the largest value in the bar array
                that.largestValue = 0;
                that.sum = 0;

                for (i = 0; i < me.valueArr.length; i += 1) {
                    that.sum = me.valueArr[i][0] + me.valueArr[i][1] + me.valueArr[i][2];

                    if (that.sum > that.largestValue) {
                        that.largestValue = that.sum;
                    }
                }

                // For each bar
                // Set the ratio of current bar compared to the maximum
                that.normal   = 0;
                that.warning  = 0;
                that.critical = 0;

                for (i = 0; i < me.valueArr.length; i += 1) {
                    that.normal   = me.valueArr[i][0];
                    that.warning  = me.valueArr[i][1];
                    that.critical = me.valueArr[i][2];
                    that.sum = me.valueArr[i][0] + me.valueArr[i][1] + me.valueArr[i][2];

                    if (me.maxValue) {
                        that.nRatio = that.normal   / me.maxValue;
                        that.wRatio = that.warning  / me.maxValue;
                        that.cRatio = that.critical / me.maxValue;
                    } else {
                        that.nRatio = that.normal   / that.largestValue;
                        that.wRatio = that.warning  / that.largestValue;
                        that.cRatio = that.critical / that.largestValue;
                    }

                    that.nBarHeight = Math.floor(that.nRatio * that.barHeight);
                    that.wBarHeight = Math.floor(that.wRatio * that.barHeight);
                    that.cBarHeight = Math.floor(that.cRatio * that.barHeight);

                    var sumHeight = that.nBarHeight;
                    if ( sumHeight > that.barHeight ) {
                        that.wBarHeight = 0;
                        that.cBarHeight = 0;

                        if (me.valueArr[i][2] > 0 && me.valueArr[i][1] > 0) {
                            that.nBarHeight = that.barHeight - 6;
                        } else if (me.valueArr[i][2] > 0 || me.valueArr[i][1] > 0) {
                            that.nBarHeight = that.barHeight - 3;
                        } else {
                            that.nBarHeight = that.barHeight;
                        }
                    }

                    sumHeight += that.wBarHeight;
                    if ( sumHeight > that.barHeight ) {
                        that.cBarHeight = 0;

                        if (me.valueArr[i][2] > 0) {
                            that.wBarHeight = that.barHeight - that.nBarHeight - 3;
                        } else {
                            that.wBarHeight = that.barHeight - that.nBarHeight;

                            if (me.valueArr[i][1] > 0 && that.wBarHeight < 4) {
                                that.wBarHeight = 3;
                            }
                        }
                    }

                    sumHeight += that.cBarHeight;
                    if ( sumHeight > that.barHeight ) {
                        that.cBarHeight = that.barHeight - that.nBarHeight - that.wBarHeight;
                    }

                    that.rectX = Math.floor(that.margin + i * that.width / that.numOfBars);

                    me.barBox.push(new BarBox(that.rectX, 25, that.barWidth, that.graphAreaHeight - 25, me.idArr[i], me.nameArr[i]));

                    // Draw Normal bar background
                    that.rectY = Math.floor(that.graphAreaHeight);

                    for (me.barStep = 0; that.nBarHeight > 0 && me.barStep < that.nBarHeight; ) {
                        ctx.fillStyle = me.color.COLOR_BAR[0];
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                        ctx.fillStyle = 'transparent';
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                    }

                    // Draw Warning bar background
                    that.rectY = that.rectY - me.barStep;

                    for (me.barStep = 0; that.wBarHeight > 0 && me.barStep < that.wBarHeight; ) {
                        ctx.fillStyle = me.color.COLOR_BAR[1];
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                        ctx.fillStyle = 'transparent';
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                    }

                    // Draw Critical bar background
                    that.rectY = that.rectY - me.barStep;

                    for (me.barStep = 0; that.cBarHeight > 0 && me.barStep < that.cBarHeight; ) {
                        ctx.fillStyle = me.color.COLOR_BAR[2];
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                        ctx.fillStyle = 'transparent';
                        ctx.fillRect(
                            that.rectX,
                            that.rectY - me.barStep,
                            that.barWidth,
                            -me.stackBarHeight
                        );
                        me.barStep += me.stackBarBlank;
                    }
                    that.topRectY = that.rectY - me.barStep - me.stackBarHeight;

                    if (Comm.Status.WAS[me.idArr[i]] === 'Disconnected' ||
                        Comm.Status.WAS[me.idArr[i]] === 'Server Down'  ||
                        Comm.Status.WAS[me.idArr[i]] === 'TP Down'      ||
                        Comm.Status.WAS[me.idArr[i]] === 'Server Hang'  ||
                        realtime.expiredServer.indexOf(me.idArr[i]) !== -1) {
                        that.rectY = Math.floor(that.graphAreaHeight - that.cBarHeight);
                        ctx.clearRect(
                            that.rectX,
                            0,
                            that.barWidth,
                            that.barHeight
                        );
                        ctx.fillStyle = 'gray';
                        ctx.fillRect(
                            that.rectX,
                            (me.maxBarHeight > 0)? that.height - me.maxBarHeight - 25 : 25,
                            that.barWidth,
                            (me.maxBarHeight > 0)? me.maxBarHeight : that.barHeight
                        );
                    }

                    // Write bar value
                    ctx.fillStyle = me.color.COLOR_TEXT[3];
                    ctx.font      = "bold 12px 'Droid Sans'";
                    ctx.textAlign = "center";

                    try {
                        ctx.save();
                        if (//Comm.Status.WAS[me.idArr[i]] === 'Disconnected' ||
                            Comm.Status.WAS[me.idArr[i]] === 'Server Down'  ||
                            Comm.Status.WAS[me.idArr[i]] === 'TP Down'      ||
                            Comm.Status.WAS[me.idArr[i]] === 'Server Hang') {
                            that.sum = 'DOWN';
                            ctx.rotate(90 * (Math.PI / 180));
                            ctx.font      = "normal 12px 'Droid Sans'";
                            ctx.fillStyle = '#FFF';
                            ctx.fillText(
                                that.sum,
                                (me.maxBarHeight > 0)? that.height - me.maxBarHeight : 50,
                                -(i * that.width / that.numOfBars + (that.width / that.numOfBars) / 2-5)
                            );
                        } else if (Comm.Status.WAS[me.idArr[i]] === 'Disconnected') {
                            that.sum = 'DISCONNECTED';
                            ctx.rotate(90 * (Math.PI / 180));
                            ctx.font      = "normal 12px 'Droid Sans'";
                            ctx.fillStyle = '#FFF';
                            that.sum = that.fittingString(ctx, that.sum , (me.maxBarHeight > 0)? me.maxBarHeight : that.barHeight);

                            ctx.fillText(
                                that.sum,
                                (me.maxBarHeight > 0)? that.height - me.maxBarHeight : 50,
                                -(i * that.width / that.numOfBars + (that.width / that.numOfBars) / 2-5)
                            );
                        } else if (realtime.expiredServer.indexOf(me.idArr[i]) !== -1) {
                            that.sum = 'LICENSE';
                            ctx.rotate(90 * (Math.PI / 180));
                            ctx.font      = "normal 12px 'Droid Sans'";
                            ctx.fillStyle = '#FFF';
                            ctx.fillText(
                                that.sum,
                                (me.maxBarHeight > 0)? that.height - me.maxBarHeight : 50,
                                -(i * that.width / that.numOfBars + (that.width / that.numOfBars) / 2-5)
                            );
                        } else {
                            ctx.fillText(
                                that.sum,
                                i * that.width / that.numOfBars + (that.width / that.numOfBars) / 2,
                                that.topRectY
                            );
                        }
                        ctx.restore();
                    } catch (ex) {
                        if (window.isBarChartDebugMode) {
                            console.debug(ex.message);
                        }
                    }

                    // Draw bar label if it exists
                    if (me.nameArr[i]) {
                        // Use try / catch to stop IE 8 from going to error town
                        ctx.fillStyle = me.color.COLOR_TEXT[3];
                        ctx.font      = "normal 12px 'Droid Sans'";
                        ctx.textAlign = "center";

                        var barLabel = that.fittingString(ctx, me.nameArr[i], (that.width / that.numOfBars));
                        try {
                            ctx.fillText(
                                barLabel,
                                i * that.width / that.numOfBars + (that.width / that.numOfBars) / 2,
                                that.height - 10);
                        } catch (ex) {
                            if (window.isBarChartDebugMode) {
                                console.debug(ex.message);
                            }
                        }
                    }
                }
            };

            var totalDraw = function () {
                if (me.resize) {
                    me.resize = false;
                    windowResizeHandler();
                }

                me.sumValue = [0,0,0];

                for (var ix = 0; ix < me.valueArr.length; ix++) {
                    if (Comm.Status.WAS[me.idArr[ix]] === 'Disconnected' ||
                        Comm.Status.WAS[me.idArr[ix]] === 'Server Down'  ||
                        Comm.Status.WAS[me.idArr[ix]] === 'TP Down'      ||
                        Comm.Status.WAS[me.idArr[ix]] === 'Server Hang') {
                        continue;
                    }

                    me.sumValue[0] += me.valueArr[ix][0];
                    me.sumValue[1] += me.valueArr[ix][1];
                    me.sumValue[2] += me.valueArr[ix][2];
                }

                that.numOfBars = 1;
                that.sumLabel  = '';

                that.graphAreaWidth  = that.width;
                that.graphAreaHeight = that.height - ((me.sumLabel)? 25:5);

                // Update the dimensions of the canvas only if they have changed
                if (ctx.canvas.width !== that.width || ctx.canvas.height !== that.height) {
                    ctx.canvas.width  = that.width;
                    ctx.canvas.height = that.height;
                }

                // Draw the background color
                ctx.clearRect(0, 0, that.width, that.height);

                // Calculate dimensions of the bar
                that.barWidth = Math.floor(that.graphAreaWidth / that.numOfBars - that.margin * 2);
                that.barHeight = that.graphAreaHeight - 25;

                // Determine the largest value in the bar array
                that.largestValue = 0;

                that.sum = me.sumValue[0] + me.sumValue[1] + me.sumValue[2];
                that.largestValue = that.sum;

                // For each bar
                // Set the ratio of current bar compared to the maximum
                that.normal   = 0;
                that.warning  = 0;
                that.critical = 0;


                that.normal   = me.sumValue[0];
                that.warning  = me.sumValue[1];
                that.critical = me.sumValue[2];

                if (me.maxValue) {
                    that.nRatio = that.normal   / me.maxValue;
                    that.wRatio = that.warning  / me.maxValue;
                    that.cRatio = that.critical / me.maxValue;
                } else {
                    that.nRatio = that.normal   / that.largestValue;
                    that.wRatio = that.warning  / that.largestValue;
                    that.cRatio = that.critical / that.largestValue;
                }

                that.nBarHeight = Math.floor(that.nRatio * that.barHeight);
                that.wBarHeight = Math.floor(that.wRatio * that.barHeight);
                that.cBarHeight = Math.floor(that.cRatio * that.barHeight);

                var sumHeight = that.nBarHeight;
                if ( sumHeight > that.barHeight ) {
                    that.wBarHeight = 0;
                    that.cBarHeight = 0;

                    if (me.sumValue[2] > 0 && me.sumValue[1] > 0) {
                        that.nBarHeight = that.barHeight - 6;
                    } else if (me.sumValue[2] > 0 || me.sumValue[1] > 0) {
                        that.nBarHeight = that.barHeight - 3;
                    } else {
                        that.nBarHeight = that.barHeight;
                    }
                }

                sumHeight += that.wBarHeight;
                if ( sumHeight > that.barHeight ) {
                    that.cBarHeight = 0;

                    if (me.sumValue[2] > 0) {
                        that.wBarHeight = that.barHeight - that.nBarHeight - 3;
                    } else {
                        that.wBarHeight = that.barHeight - that.nBarHeight;
                    }
                }

                sumHeight += that.cBarHeight;
                if ( sumHeight > that.barHeight ) {
                    that.cBarHeight = that.barHeight - that.nBarHeight - that.wBarHeight;
                }

                me.sumBarStep = 0;
                that.sumRectX = Math.floor(that.margin);
                that.sumRectY = Math.floor(that.graphAreaHeight);
                for (me.sumBarStep = 0; that.nBarHeight > 0 && me.sumBarStep < that.nBarHeight; ) {
                    ctx.fillStyle = me.color.COLOR_BAR[0];
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                    ctx.fillStyle = 'transparent';
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                }

                // Draw Warning bar background
                that.sumRectY = that.sumRectY - me.sumBarStep;

                for (me.sumBarStep = 0; that.wBarHeight > 0 && me.sumBarStep < that.wBarHeight; ) {
                    ctx.fillStyle = me.color.COLOR_BAR[1];
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                    ctx.fillStyle = 'transparent';
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                }

                // Draw Critical bar background
                that.sumRectY = that.sumRectY - me.sumBarStep;

                for (me.sumBarStep = 0; that.cBarHeight > 0 && me.sumBarStep < that.cBarHeight; ) {
                    ctx.fillStyle = me.color.COLOR_BAR[2];
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                    ctx.fillStyle = 'transparent';
                    ctx.fillRect(
                        that.sumRectX,
                        that.sumRectY - me.sumBarStep,
                        that.barWidth,
                        -me.stackBarHeight
                    );
                    me.sumBarStep += me.stackBarBlank;
                }
                that.topSumRectY = that.sumRectY - me.sumBarStep - me.stackBarHeight;

                if (me.isShowValue) {
                    // Write bar value
                    ctx.fillStyle = me.color.COLOR_TEXT[3];
                    ctx.font      = "bold 12px 'Droid Sans'";
                    ctx.textAlign = "center";

                    try {
                        ctx.fillText(
                            that.sum,
                            (that.width / that.numOfBars) / 2,
                            that.topSumRectY
                        );
                    } catch (ex) {
                        if (window.isBarChartDebugMode) {
                            console.debug(ex.message);
                        }
                    }
                }

                // Draw bar label if it exists
                if (me.sumLabel) {
                    that.sumLabel = me.sumLabel;
                }
                // Use try / catch to stop IE 8 from going to error town
                ctx.fillStyle = me.color.COLOR_TEXT[3];
                ctx.font      = "normal 12px 'Droid Sans'";
                ctx.textAlign = "center";

                try {
                    ctx.fillText(
                        that.sumLabel,
                        (that.width / that.numOfBars) / 2,
                        that.height - 10);
                } catch (ex) {
                    if (window.isBarChartDebugMode) {
                        console.debug(ex.message);
                    }
                }

            };

            var cache_fittingString = {};
            this.fittingString = function(c, str, maxWidth) {
                if( cache_fittingString['_'+maxWidth+str] )
                {
                    return cache_fittingString['_'+maxWidth+str];
                }else
                {
                    var width = c.measureText(str).width;
                    var ellipsis = '..';
                    var ellipsisWidth = c.measureText(ellipsis).width;
                    if (width<=maxWidth || width<=ellipsisWidth) {
                        cache_fittingString['_'+maxWidth+str] = str;
                        return str;
                    } else {
                        var len = str.length;
                        while (width>=maxWidth-ellipsisWidth && len-->0) {
                            str = str.substring(0, len);
                            width = c.measureText(str).width;
                        }
                        cache_fittingString['_'+maxWidth+str] = str+ellipsis;
                        return str+ellipsis;
                    }
                }
            };

            this.update = function () {
                if (me.devMode) {
                    for (var i = 0; i < me.valueArr.length; i += 1) {
                        me.valueArr[i] = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
                    }
                }
                if (me.totalMode) {
                    totalDraw();
                } else {
                    draw();
                }
            };
        }

        getMouse = function(e) {
            var element = canvas, offsetX = 0, offsetY = 0, mx, my;

            if (element.offsetParent !== null) {
              do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
              } while ((element = element.offsetParent));
            }

            mx = e.pageX - offsetX;
            my = e.pageY - offsetY;

            return {x: mx, y: my};
        };

        function BarBox(x, y, w, h, id, name) {
            this.x = x || 0;
            this.y = y || 0;
            this.w = w || 1;
            this.h = h || 1;

            this.id   = id   || '';
            this.name = name || '';
        }

    },

    setChartLabels: function(idArr, nameArr) {
        this.idArr    = [];
        this.nameArr  = [];
        this.valueArr = [];
        this.sumValue = [0, 0, 0];

        for (var ix = 0; ix < idArr.length; ix++) {
            this.idArr[this.idArr.length]       = idArr[ix];
            this.nameArr[this.nameArr.length]   = nameArr[ix];
            this.valueArr[this.valueArr.length] = [0,0,0];
        }

        this.resize = true;

        idArr   = null;
        nameArr = null;
    }
});