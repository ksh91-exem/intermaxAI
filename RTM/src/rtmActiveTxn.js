Ext.define('rtm.src.rtmActiveTxn', {
    extend: 'Exem.DockForm',
    layout: 'fit',
    width : '100%',
    height: '100%',

    border : false,
    visible: true,

    wasList: [],

    isOption   : false,

    allSelect  : true,
    eachSelect : false,
    selectCount: 0,
    startIndex : 0,
    selectedServrList: [],

    init: function() {

        this.initPorperty();

        this.initLayout();

        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },

    /**
     * 기본 설정 정보 구성
     */
    initPorperty: function() {

        this.wasList = [];
        this.selectedServrList = [];

        if (realtime.WasModeSelected.length > 0) {
            this.wasList = Comm.selectedWasArr.concat();

        } else {
            this.wasList = Comm.wasIdArr.concat();
        }
    },

    /**
     * 기본 화면 구성 요서 생성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-activetxn-base'
        });

        this.titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 30,
            layout : {
                type : 'hbox',
                align: 'middle'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height : 20,
            margin : '10 0 0 10',
            cls    : 'header-title'
        });

        this.expendIcon = Ext.create('Ext.container.Container', {
            width : 17,
            height: 17,
            margin: '0 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.autoRefreshLabel = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-activetxn-groupname-label',
            margin  : '0 20 0 0',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, newval) {
                    this.changeAutoRefresh(newval);
                }
            }
        });

        this.optionBtn = Ext.create('Ext.container.Container', {
            width : 21,
            height: 17,
            hidden: !this.isOption,
            margin: '0 5 0 0',
            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
            listeners: {
                scope: this,
                render : function(_this) {
                    _this.el.on( 'click', function() {
                        if (_this.optionView && _this.optionView.show) {
                            _this.optionView.show();
                        }
                    }, this);
                }
            }
        });

        this.comboContainer = Ext.create('Ext.container.Container', {
            layout : {
                type :'hbox',
                align: 'middle'
            },
            height : 30
        });

        this.tabpanel = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            flex  : 1,
            width : '100%',
            margin: '2 10 10 10',
            border: false
        });

        this.tabpanel.getTabBar().setVisible(false);

        this.comboContainer.add([this.autoRefreshLabel, this.optionBtn, this.expendIcon]);

        this.titleArea.add([this.frameTitle, {xtype: 'tbfill', flex: 1 }, this.comboContainer]);

        this.background.add([this.titleArea, this.tabpanel]);

        this.add(this.background);

    },

    /**
     * @abstract
     * rtmActiveTxn 을 상속받는 class에서 구현한다.
     */
    changeAutoRefresh: null,


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.frameChange([]);
    },


    /**
     * 설정된 WAS 정보를 변경(선택)된 WAS 정보로 재설정.
     * 화면에서 WAS 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * @param {string[]} wasList - WAS 명 배열
     */
    frameChange: function(list) {
        var ix, ixLen;

        this.wasList.length = 0;

        if (list.length === 0) {
            this.wasList = Comm.RTComm.getServerIdArr(this.monitorType).concat();

        } else {
            for (ix = 0, ixLen = list.length; ix < ixLen; ix++) {
                this.wasList[this.wasList.length] = Comm.RTComm.getServerIdByName(list[ix], this.monitorType);
            }
        }
        list = null;
    }

});
