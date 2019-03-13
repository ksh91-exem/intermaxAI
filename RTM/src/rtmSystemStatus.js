Ext.define('rtm.src.rtmSystemStatus', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('System Status'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    listeners: {
        beforedestroy: function() {
        }
    },

    init: function() {

        this.initLayout();
    },


    /**
     * 기본 레이어 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-systemStatus-base'
        });

        //상단 title 이 붙는 영역
        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '10 0 0 0'
        });

        // frame Title 영역
        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : common.Util.CTR('System Status')
        });

        this.statGuideIcon = Ext.create('Ext.container.Container',{
            width  : 119,
            height : 11,
            margin : '0 10 0 0',
            cls    : 'rtm-systemStatus-guide-icon'
        });

        this.topContentsArea.add(this.frameTitle, {xtype: 'tbfill'}, this.statGuideIcon);

        var configHtml = this.createBox();

        this.statGroupArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width : '100%',
            flex  : 1,
            margin: '0 10 10 10',
            html  : configHtml
        });

        this.background.add(this.topContentsArea, this.statGroupArea);

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
        }
    },


    /**
     * 구성 요소에 따라 화면 구성.
     *
     * @return {string} html string
     */
    createBox: function() {
        var configHtml = '';
        var boxList = ['WEB', 'WAS'];

        for (var ix = 0, ixLen = boxList.length; ix < ixLen; ix++) {
            configHtml +=
                '<div class="left-box">' +
                    '<div class="topLabel">'+ boxList[ix] +'</div>' +
                    '<div class="bottomLabel left">0.0</div>' +
                    '<div class="bottomLabel right">0</div>' +
                '</div>' +
                '<div class="arrow"></div>';
        }

        configHtml +=
            '<div class="right-box">' +
                '<div class="topLabel">DB</div>' +
                '<div class="bottomLabel left">0.0</div>' +
                '<div class="bottomLabel right">0</div>' +
            '</div>';

        return configHtml;
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function(){
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },

    /**
     * 데이터 새로 고침.
     */
    frameRefresh: function() {
        this.stopRefreshData();

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), PlotChart.time.exHour);
    }


});
