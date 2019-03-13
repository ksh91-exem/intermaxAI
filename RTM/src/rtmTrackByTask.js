Ext.define('rtm.src.rtmTrackByTask', {
    extend       : 'Exem.DockForm',
    title        : common.Util.CTR('Task Track'),
    layout       : 'fit',
    width        : '100%',
    height       : '100%',
    interval     : 3000,
    showToolMenu : true,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부
    listeners    : {
        destroy  : function(_this) {
            if (_this.chart) {
                _this.chart.cancelAnimation();
            }

            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        }
    },
    init : function() {
        this.monitorType  = 'E2E';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10',
            cls    : 'performance-area'
        });

        // 확대 레이어
        this.expandView = Ext.create('Ext.container.Container', {
            layout: 'fit',
            hidden: true,
            cls   : 'performance-area-expandview'
        });

        this.add(this.background, this.expandView);

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
                        this.chart.cancelAnimation(true);
                        this.chart.cancelAllAlarmAnimation(true);

                        this.clientWidth = _this.el.dom.clientWidth;
                        // this.clientWidth = this.chart.rtmTrackList ? this.chart.rtmTrackList.length * 300 : _this.el.dom.clientWidth;
                        this.clientHeight = _this.el.dom.clientHeight;

                        this.clientHeight = this.chart.rtmTrackList ? this.chart.rtmTrackList.length * 135 : 1300;

                        this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight + 60, true);
                        // console.log('바뀐 width: ', this.clientWidth);
                    }
                }.bind(this)
            }
        });

        this.background.add([this.titleArea, this.chartArea]);

        if (!this.bizExceptionCheck()) {
            return;
        }

        this.createTrackByTaskChart();

        if (this.frameChange) {
            this.frameChange();
        }

        this.drawFrame();

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

        this.initAllTrendContextMenu();
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


        this.chart = Ext.create('rtm.src.rtmTrackByTaskChart', {
            width        : 1000,
            height       : 600
        });
        this.chartArea.add(this.chart);

        this.chart.init(this.chart.id, this.chartArea.getWidth(), this.chartArea.getHeight());
        this.chartArea.fireEvent('resize', this);
    },

    bizExceptionCheck: function() {
        return !(!Comm.businessRegisterInfo || !Object.keys(Comm.businessRegisterInfo).length);
    },

    /**
     * 차트 그리기
     */
    drawFrame: function(frameRefreshed) {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.chart.loadData(frameRefreshed);
        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },

    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        if (this.chart) {
            this.chart.cancelAnimation();
            this.chart.cancelAllAlarmAnimation(true);
        }
    },

    frameRefresh: function() {
        if (this.bizExceptionCheck()) {
            this.drawFrame(true);
            this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight + 60, true);
        }
    },

    initAllTrendContextMenu: function() {
        this.allTrendMenuContext = Ext.create('Exem.ContextMenu', {
            shadow : false,
            cls    : 'rtm-contextmenu-base',
            listeners: {
                'mouseleave': function(menu) {
                    menu.hide();
                }
            }
        });

        if (!this.isRealTimeAnalysis) {
            this.allTrendMenuContext.addItem({
                title : common.Util.TR('Display Option'),
                target: this,
                fn : function(me) {
                    var colorNLine = Ext.create('rtm.src.rtmBizChartConfig',{
                        bizChart     : me.target.chart,
                        monitorType  : 'Business'
                    });
                    colorNLine.addCls('xm-dock-window-base');
                    colorNLine.init();
                    colorNLine.show();
                }
            });
        }
    },

    toolMenuFn: function(e) {
        this.allTrendMenuContext.showAt({x : e.originalEvent.x, y: e.originalEvent.y});
    }
});