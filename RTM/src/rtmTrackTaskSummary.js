Ext.define('rtm.src.rtmTrackTaskSummary', {
    extend   : 'Exem.DockForm',
    title    : common.Util.CTR('Task Information'),
    layout   : 'fit',
    width    : '100%',
    height   : 50,
    minHeight: 50,
    maxHeight: 50,
    padding  : '0 30 0 30',
    componentCls : 'rtmTrackTaskSummary',

    interval : 1000 * 60,

    listeners: {
        destroy: function(_this) {
            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        },
        resize: function() {
            var pOffSet;

            if (!this.$target) {
                return;
            }

            pOffSet = this.$target.offset();

            this.$direct.css({
                top: pOffSet.top + (this.$target.height() / 2) - (this.$direct.height() / 2),
                left: pOffSet.left  + (this.$target.width() / 2) - (this.$direct.width() / 2)
            });

            this.initCanvas(this, this.width, this.height);
            this.drawManager();
        }
    },

    init: function() {
        this.initProperty();
        this.initCanvas(this, this.width, this.height);
        this.drawManager();
    },

    setInitialSize: function(target, width, height) {
        var w, h;

        if (!width) {
            width = this.minWidth;
        }
        if (!height) {
            height = this.minHeight;
        }

        w  = ( width  < this.minWidth ) ? this.minWidth : width;
        h  = ( height < this.minHeight ) ? this.minHeight : height;

        this.setSize(this, w, h);
    },

    setSize: function(target, width, height) {
        target.width = width;
        target.height = height;
    },

    initProperty: function() {
        var that = this;

        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
        this.downAlarms   = this.setDownAlarms();

        this.minWidth = 1480;
        this.minHeight = 50;

        this.ctxFillStyle = '#ABAEB5';

        this.sql = {
            'txnDetail' : 'IMXRT_TxnDetail_Count.sql',
            'errorCount': 'IMXRT_Error_Count.sql',
            'visitorCnt': 'IMXRT_ServiceStat_Visitor_Count.sql',
            'avgTxn'    : 'IMXRT_TxnDetail_Avg.sql'
        };

        this.imgIcon = {
            'src' : '../images/xm_icon_White_v1.png'
        };
        this.iconPt = {
            'txn'      : {'x': 0,   'y': 825, 'w': 40, 'h': 40},
            'visit'    : {'x': 43,  'y': 825, 'w': 40, 'h': 40},
            'average'  : {'x': 86,  'y': 825, 'w': 40, 'h': 40},
            'running'  : {'x': 129, 'y': 825, 'w': 40, 'h': 40},
            'error'    : {'x': 172, 'y': 825, 'w': 40, 'h': 40}
        };

        this.imgTxn = new Image();
        this.imgTxn.src = this.imgIcon.src;
        this.imgTxn.onload = function() {
            that.imgTxnLoad = true;
        };

        this.imgVisit = new Image();
        this.imgVisit.src = this.imgIcon.src;
        this.imgVisit.onload = function() {
            that.imgVisitLoad = true;
        };

        this.imgAVG = new Image();
        this.imgAVG.src = this.imgIcon.src;
        this.imgAVG.onload = function() {
            that.imgAVGLoad = true;
        };

        this.imgRunning = new Image();
        this.imgRunning.src = this.imgIcon.src;
        this.imgRunning.onload = function() {
            that.imgRunningLoad = true;
        };

        this.imgError = new Image();
        this.imgError.src = this.imgIcon.src;
        this.imgError.onload = function() {
            that.imgErrorLoad = true;
        };

        this.background = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: 50,
            listener: {
                resize: function(_this) {
                    if (!_this.firstLoad) {
                        _this.initCanvas(this, this.getWidth(), this.getHeight());
                        _this.drawManager();
                    }
                }
            }
        });

        this.txnCountToday  = 0;
        this.txnCountYester = 0;
        this.errorRate      = 0;
        this.visitorCnt     = 0;
        this.averageCnt     = 0;

        this.firstLoad = true;

        this.drawFrame();
    },

    initCanvas: function(target, width, height) {
        if (this.target !== target) {
            this.target = target;
        }

        this.setInitialSize(target, width, height);

        if (this.firstLoad) {
            if (!this.ctxTxn) {
                this.canvasTxn = d3.select('#' + target.id)
                    .append('canvas');
            }
            if (!this.ctxVisit) {
                this.canvasVisit = d3.select('#' + target.id)
                    .append('canvas');
            }
            if (!this.ctxAVG) {
                this.canvasAVG = d3.select('#' + target.id)
                    .append('canvas');
            }
            if (!this.ctxRunning) {
                this.canvasRunning = d3.select('#' + target.id)
                    .append('canvas');
            }
            if (!this.ctxError) {
                this.canvasError = d3.select('#' + target.id)
                    .append('canvas');
            }
            this.firstLoad = false;
        }

        this.setTickW();

        this.canvasTxn.attr({'width': this.tickW * this.flexTxn, 'height' : this.height});
        this.canvasVisit.attr({'width': this.tickW * this.flexVisit, 'height' : this.height});
        this.canvasAVG.attr({'width': this.tickW * this.flexAVG, 'height' : this.height});
        this.canvasRunning.attr({'width': this.tickW * this.flexRunning, 'height' : this.height});
        this.canvasError.attr({'width': this.tickW * this.flexError, 'height' : this.height});
        this.ctxTxn = this.canvasTxn.node().getContext('2d');
        this.ctxVisit = this.canvasVisit.node().getContext('2d');
        this.ctxAVG = this.canvasAVG.node().getContext('2d');
        this.ctxRunning = this.canvasRunning.node().getContext('2d');
        this.ctxError = this.canvasError.node().getContext('2d');
    },

    setTickW: function() {
        var curWidth = typeof this.width === 'string' ? this.getWidth() : this.width;
        if (this.width < this.width + 50) {
            this.posX = 0;
            this.flexTxn = 4;
            this.flexVisit = 2.5;
            this.flexAVG = 3;
            this.flexRunning = 2;
            this.flexError = 1.5;
        } else {
            this.posX = 20;
            this.flexTxn = 4;
            this.flexVisit = 3;
            this.flexAVG = 3;
            this.flexRunning = 2.5;
            this.flexError = 1.5;
        }
        this.tickW = (curWidth - 60) / (this.flexTxn + this.flexVisit + this.flexAVG + this.flexRunning + this.flexError);
    },

    setDownAlarms: function() {
        var ix, ixLen, obj;

        obj = {};

        if (!realtime || !realtime.downAlarms || !realtime.downAlarms.length) {
            return obj;
        }

        for (ix = 0, ixLen = realtime.downAlarms.length; ix < ixLen; ix++) {
            if (!obj[realtime.downAlarms[ix]]) {
                obj[realtime.downAlarms[ix]] = 1;
            }
        }

        return obj;
    },

    drawManager: function() {
        /*
         * [0] - time
         * [1] - visitor_count
         * [2] - yesterday_total_txn_count
         * [3] - today_total_txn_count
         * [4] - total_error_count
         * [5] - total_elapse_time
         */
        if (!Repository || !Repository.END_BUSINESS_VISITOR || !Repository.END_BUSINESS_VISITOR.data.rows.length) {
            this.data = [0,0,0,0,0,0];
        } else {
            this.data = Repository.END_BUSINESS_VISITOR.data.rows[0];
        }

        this.drawTxnCnt();
        this.drawVisitor();
        this.drawAVG();
        this.drawRunning();
        this.drawError();
    },

    drawTxnCnt: function() {
        var iconPt, text, textWidth, font, fontLg;

        if (!this.imgTxnLoad) {
            setTimeout(function() {
                this.drawTxnCnt();
            }.bind(this), 10);
            return;
        }

        this.ctxTxn.clearRect(0, 0, this.getCanvasWidth(this.canvasTxn), this.getCanvasHeight(this.canvasTxn));

        iconPt = this.iconPt.txn;
        this.txnCountToday = this.data[3];
        this.txnCountYester = this.data[2];

        font = 14;
        if (this.txnCountToday >= 100000 || this.txnCountYester >= 100000) {
            fontLg = 22;
        } else {
            fontLg = 26;
        }

        this.ctxTxn.save();

        // 이미지 그리기
        this.ctxTxn.fillStyle = this.ctxFillStyle;
        this.ctxTxn.drawImage(this.imgTxn, iconPt.x, iconPt.y, iconPt.w, iconPt.h, this.posX, 5, iconPt.w, iconPt.h);

        // '총 거래건수(금일/어제):'
        this.ctxTxn.font = this.setFontStyle(font);
        text = common.Util.CTR('Txn Count(Today/Yesterday)') + ' : ';
        textWidth = this.ctxTxn.measureText(text).width + 40;
        this.ctxTxn.fillText(text, 40 + this.posX, 32);

        // '금일'
        this.ctxTxn.save();
        this.ctxTxn.font = this.setFontStyle(fontLg);
        text = common.Util.numberWithComma(this.txnCountToday);
        this.ctxTxn.fillText(text, textWidth + this.posX, 33);
        textWidth += this.ctxTxn.measureText(text).width;
        this.ctxTxn.restore();

        // '건/'
        text = ' ' + common.Util.CTR('Txn') + ' / ';
        this.ctxTxn.fillText(text, textWidth + this.posX, 32);
        textWidth += this.ctxTxn.measureText(text).width;

        // '어제'
        this.ctxTxn.save();
        this.ctxTxn.font = this.setFontStyle(fontLg);
        text = common.Util.numberWithComma(this.txnCountYester);
        this.ctxTxn.fillText(text, textWidth + this.posX, 33);
        textWidth += this.ctxTxn.measureText(text).width;
        this.ctxTxn.restore();

        text = ' ' + common.Util.CTR('Txn');
        this.ctxTxn.fillText(text, textWidth + this.posX, 32);

        this.ctxTxn.restore();
    },

    drawVisitor: function() {
        var iconPt, text, textWidth, font, fontLg;

        if (!this.imgVisitLoad) {
            setTimeout(function() {
                this.drawVisitor();
            }.bind(this), 10);
            return;
        }

        this.visitorCnt = this.data[1];

        iconPt = this.iconPt.visit;
        font = 14;
        if (this.visitorCnt > 100000) {
            fontLg = 22;
        } else {
            fontLg = 26;
        }

        this.ctxVisit.clearRect(0, 0, this.getCanvasWidth(this.canvasVisit), this.getCanvasHeight(this.canvasVisit));

        this.ctxVisit.save();

        this.ctxVisit.drawImage(this.imgVisit, iconPt.x, iconPt.y, iconPt.w, iconPt.h, 0, 5, iconPt.w, iconPt.h);

        // '방문자 수 : '
        this.ctxVisit.font = this.setFontStyle(font);
        this.ctxVisit.fillStyle = this.ctxFillStyle;

        text = common.Util.CTR('Visitor Count') + ' : ';
        textWidth = this.ctxVisit.measureText(text).width + 42;
        this.ctxVisit.fillText(text, 42, 32);

        this.ctxVisit.save();
        this.ctxVisit.font = this.setFontStyle(fontLg);
        text = common.Util.numberWithComma(this.visitorCnt);
        this.ctxVisit.fillText(text, textWidth, 34);
        textWidth += this.ctxVisit.measureText(text).width;
        this.ctxVisit.restore();

        text = ' ' + common.Util.CTR('ppl');
        this.ctxVisit.fillText(text, textWidth, 32);

        this.ctxVisit.restore();
    },

    drawAVG: function() {
        var iconPt, text, textWidth, font, fontLg;

        if (!this.imgAVGLoad) {
            setTimeout(function() {
                this.drawAVG();
            }.bind(this), 10);
            return;
        }

        this.averageCnt = this.data[3] !== 0 ? this.data[5] / this.data[3] : 0;
        this.averageCnt /= 1000;

        iconPt = this.iconPt.average;
        font = 14;
        if (this.visitorCnt > 100000) {
            fontLg = 22;
        } else {
            fontLg = 26;
        }

        this.ctxAVG.clearRect(0, 0, this.getCanvasWidth(this.canvasAVG), this.getCanvasHeight(this.canvasAVG));

        this.ctxAVG.save();

        this.ctxAVG.drawImage(this.imgAVG, iconPt.x, iconPt.y, iconPt.w, iconPt.h, 0, 5, iconPt.w, iconPt.h);

        this.ctxAVG.font = this.setFontStyle(font);
        this.ctxAVG.fillStyle = this.ctxFillStyle;
        text = common.Util.CTR('Elapse AVG Time') + ' : ';
        this.ctxAVG.fillText(common.Util.CTR('Elapse AVG Time') + ': ', 44, 32);
        textWidth = this.ctxAVG.measureText(text).width + 44;

        this.ctxAVG.save();
        this.ctxAVG.font = this.setFontStyle(fontLg);
        text = common.Util.numberWithComma(this.averageCnt.toFixed(2));
        this.ctxAVG.fillText(text, textWidth, 34);
        textWidth += this.ctxAVG.measureText(text).width;
        this.ctxAVG.restore();

        text = ' sec';
        this.ctxAVG.fillText(text, textWidth, 32);

        this.ctxAVG.restore();
    },

    drawRunning: function() {
        var iconPt, text, textWidth, font, fontLg;

        if (!this.imgRunningLoad) {
            setTimeout(function() {
                this.drawRunning();
            }.bind(this), 10);
            return;
        }

        iconPt = this.iconPt.visit;
        font = 14;
        if (this.visitorCnt > 100000) {
            fontLg = 22;
        } else {
            fontLg = 26;
        }

        this.ctxRunning.clearRect(0, 0, this.getCanvasWidth(this.canvasRunning), this.getCanvasHeight(this.canvasRunning));

        this.ctxRunning.save();

        this.ctxRunning.drawImage(this.imgRunning, iconPt.x, iconPt.y, iconPt.w, iconPt.h, 0, 5, iconPt.w, iconPt.h);

        this.ctxRunning.fillStyle = this.ctxFillStyle;
        this.ctxRunning.font = this.setFontStyle(font);
        text = common.Util.CTR('Running Rate') + ' : ';
        this.ctxRunning.fillText(text, 44, 32);
        textWidth = this.ctxRunning.measureText(text).width + 44;

        this.ctxRunning.save();
        this.ctxRunning.font = this.setFontStyle(fontLg);
        text = this.getRunningRate();
        this.ctxRunning.fillText(text, textWidth, 34);
        textWidth += this.ctxRunning.measureText(text).width;
        this.ctxRunning.restore();

        text = ' %';
        this.ctxRunning.fillText(text, textWidth, 32);

        this.ctxRunning.restore();
    },

    drawError: function() {
        var iconPt, text, textWidth, font, fontLg;

        if (!this.imgErrorLoad) {
            setTimeout(function() {
                this.drawError();
            }.bind(this), 10);
            return;
        }

        this.errorRate = this.data[3] !== 0 ? this.data[4] / this.data[3] : 0;
        iconPt = this.iconPt.visit;
        font = 14;
        if (this.visitorCnt > 100000) {
            fontLg = 22;
        } else {
            fontLg = 26;
        }

        this.ctxError.clearRect(0, 0, this.getCanvasWidth(this.canvasError), this.getCanvasHeight(this.canvasError));

        this.ctxError.save();

        this.ctxError.drawImage(this.imgError, iconPt.x, iconPt.y, iconPt.w, iconPt.h, 0, 5, iconPt.w, iconPt.h);

        this.ctxError.fillStyle = this.ctxFillStyle;
        this.ctxError.font = this.setFontStyle(font);
        text = common.Util.CTR('Error Rate') + ' : ';
        this.ctxError.fillText(text, 44, 32);
        textWidth = this.ctxError.measureText(text).width + 44;

        this.ctxError.save();
        this.ctxError.font = this.setFontStyle(fontLg);
        text = this.errorRate.toFixed(3);
        this.ctxError.fillText(text, textWidth, 34);
        textWidth += this.ctxError.measureText(text).width;
        this.ctxError.restore();

        this.ctxError.font = this.setFontStyle(font);
        text = ' %';
        this.ctxError.fillText(text, textWidth, 32);

        this.ctxError.restore();
    },

    /**
     * 차트 그리기
     */
    drawFrame: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.drawManager();

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },

    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    },

    frameRefresh: function() {
        this.drawFrame();
    },

    getCanvasWidth: function(canvas) {
        return canvas[0][0].width;
    },

    getCanvasHeight: function(canvas) {
        return canvas[0][0].height;
    },

    /**
     * 가동률 계산. 전체 서버의 상태를 조회한다.
     * 가동 중인 서버 개수 / 전체 서버 개수 = 가동률
     */
    getRunningRate: function() {
        var ix, totalCount, connectCount, runningRate;
        var serverId, serverType, serverStatus;
        var tempMergeIdArr, allServerIdArr;

        tempMergeIdArr = [].concat(Comm.wasIdArr, Comm.tpIdArr, Comm.cdIdArr, Comm.tuxIdArr);
        allServerIdArr = tempMergeIdArr.filter(function(item, pos) {
            return tempMergeIdArr.indexOf(item) === pos;
        });

        connectCount = 0;
        totalCount = allServerIdArr.length;

        for (ix = 0; ix < totalCount; ix++) {
            serverId = allServerIdArr[ix];
            serverType = Comm.RTComm.getServerTypeById(serverId);
            serverStatus = Comm.RTComm.getServerStatus(serverType, serverId);

            if (!this.downAlarms[serverStatus]) {
                connectCount++;
            }
        }

        runningRate = totalCount ? (connectCount / totalCount * 100).toFixed(2) : 0;

        return runningRate;
    },

    setFontStyle: function(size) {
        return size + 'px Droid Sans';
    }
});