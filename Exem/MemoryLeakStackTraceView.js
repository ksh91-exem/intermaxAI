Ext.define("Exem.MemoryLeakStackTraceView", {
    extend: 'Exem.XMWindow',
    layout: 'vbox',
    width: 800,
    height: 700,
    minWidth: 800,
    minHeight: 500,

    maximizable: true,
    resizable: true,
    closeAction: 'destroy',

    title: common.Util.TR('Has StackTrace'),

    initProperty: function() {
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
    },

    init: function() {

        this.initProperty();

        // 화면에 표시될 스택 트레이스 데이터
        var data = this.data;

        var baseCon = Ext.create('Exem.Container', {
            layout: 'vbox',
            flex  : 1
        });

        var infoPanel = Ext.create('Exem.Container', {
            width : '100%',
            height: 80,
            layout: 'hbox',
            cls   : 'mem-stacktrace-top-box',
            border: true,
            margin: '5 5 0 5',
            padding: '2 0 2 0'
        });

        var leftPanel = Ext.create('Exem.Container', {
            layout: 'vbox',
            flex  : 1
        });

        var rightPanel = Ext.create('Exem.Container', {
            layout: 'vbox',
            flex  : 1
        });

        var stackTracePanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            cls   : 'mem-stacktrace-box',
            width : '100%',
            flex  : 1,
            margin: '5 5 0 5',
            border: false
        });

        var bottomPanel = Ext.create('Exem.Container', {
            layout : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            width  : '100%',
            height : 25,
            margin : '5 0 0 0',
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('OK'),
                cls   : 'rtm-btn',
                width : 60,
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.close();
                    }
                }
            }]
        });

        this.setTraceInfoLabel(leftPanel,  common.Util.TR('Agent'),                data.agent);
        this.setTraceInfoLabel(leftPanel,  common.Util.TR('Class Name'),           data.className + ' / ' + data.instanceId);
        this.setTraceInfoLabel(leftPanel,  common.Util.TR('Create Date'),          data.time);
        this.setTraceInfoLabel(rightPanel, common.Util.TR('TID'),                  data.tid);
        this.setTraceInfoLabel(rightPanel, common.Util.TR('Element Count'),      common.Util.numberFixed(data.collectionSize, 0));
        this.setTraceInfoLabel(rightPanel, common.Util.TR('StackTrace Dump Date'), data.createdTime);

        var editTheme;
        if (Comm.rtmShow) {
            editTheme = Comm.RTComm.getEditTheme();
        } else {
            editTheme = 'ace/theme/eclipse';
        }

        var statckTrace = Ext.create('Exem.SyntaxEditor', {
            mode        : 'jade',
            width       : '100%',
            height      : '100%',
            readOnly    : true,
            autoScroll  : true,
            editTheme   : editTheme
        });
        statckTrace.setText(data.stackTrace);
        stackTracePanel.add(statckTrace);

        infoPanel.add(leftPanel, rightPanel);
        baseCon.add(infoPanel, stackTracePanel, bottomPanel);

        this.add(baseCon);

        this.setWindowClsByView();

        this.show();
    },


    /**
     * 스택 트레이스 관련 정보를 설정
     *
     * @param {object} targetPanel
     * @param {string} label
     * @param {string} value
     */
    setTraceInfoLabel: function(targetPanel, label, value) {
       var field = Ext.create('Exem.Container', {
            width : 330,
            height: 30,
            layout: 'hbox',
            items : [{
                xtype : 'label',
                width : 120,
                cls   : 'mem-stacktrace-label',
                text  : label + ' :'
            }, {
                xtype : 'label',
                width : 190,
                cls   : 'mem-stacktrace-text',
                text  : value
            }]
        });
        targetPanel.add(field);
    },


    /**
     * 표시되는 화면에 따라 윈도우 Class 설정 
     */
    setWindowClsByView: function() {
        if (Comm.rtmShow) {
            this.addCls('xm-dock-window-base');
        } else {
            this.addCls('xm-window-base');
        }
    }

});
