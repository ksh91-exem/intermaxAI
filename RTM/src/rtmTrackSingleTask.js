Ext.define('rtm.src.rtmTrackSingleTask', {
    extend       : 'Exem.DockForm',
    title        : '',
    layout       : 'fit',
    width        : '100%',
    height       : '100%',
    interval     : 3000,
    floatingLayter: false,
    listeners    : {
        destroy  : function(_this) {
            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        }
    },
    init : function() {
        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10'
        });
        this.add(this.background);

        this.titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 26,
            layout : {
                type : 'hbox'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '5 0 0 5',
            cls    : 'header-title',
            text   : this.title
        });

        this.titleArea.add(this.frameTitle);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout : 'fit',
            width  : '100%',
            height : '100%',
            margin : '0 0 0 0',
            flex   : 1,
            listeners  : {
                resize : function(_this) {
                    if (this.chart) {
                        // this.chart.cancelAnimation();

                        this.clientWidth = _this.el.dom.clientWidth;
                        // this.clientWidth = this.chart.rtmTrackList ? this.chart.rtmTrackList.length * 300 : _this.el.dom.clientWidth;
                        this.clientHeight = _this.el.dom.clientHeight;

                        this.chart.cancelAnimation();
                        this.chart.cancelAlarmAnimation();
                        this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight);
                        // console.log('바뀐 width: ', this.clientWidth);
                    }
                }.bind(this)
            }
        });

        // this.background.add([this.titleArea, this.chartArea]);
        this.background.add(this.chartArea);

        this.createTrackByTaskChart();

        if (this.frameChange) {
            this.frameChange();
        }

        this.drawFrame();

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

    },

    createTrackByTaskChart: function() {
        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                break;
            default :
                labelStyle.color = '#555555';
                break;
        }

        this.chart = Ext.create('rtm.src.rtmTrackSingleTaskChart', {
            width   : 400,
            height  : 180,
            cmpId   : this.componentId
        });
        this.chartArea.add(this.chart);


        this.chart.init(this.chart.id, this.chartArea.getWidth(), this.chartArea.getHeight());
        this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight + 60);
    },

    /**
     * 차트 그리기
     */
    drawFrame: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.chart.loadData();
        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },

    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.chart.cancelAnimation();
    },

    frameRefresh: function() {
        this.drawFrame();

        this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight);
    }
});