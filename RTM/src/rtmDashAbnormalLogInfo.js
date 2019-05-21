Ext.define('rtm.src.rtmDashAbnormalLogInfo', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('이상 로그 정보'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    isSkip : false,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);

            this.isClosedDockForm = true;
            this.chartId = null;
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });

        this.tranContainerHeight = 150;
        this.containerHeight = 250;
    },

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initLayout: function() {
        var targetPanel = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            margin: '4 4 4 4',
            border: true,
            autoScroll: true
        });

        var tranCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: this.tranContainerHeight,
            margin: '4 4 4 4',
            border: true
        });

        var leftCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '10%',
            height: this.tranContainerHeight,
            margin: '4 4 4 4',
            border: true,
            style : { background : '#ff4a6a' },
            items : [{
                xtype: 'label',
                margin: '5 5 0 5',
                html: common.Util.TR('Transaction'),
                style : {
                    color : 'white',
                    'font-size' : '14px'
                }
            }]
        });

        var rightCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            flex : 1,
            height: this.tranContainerHeight,
            margin: '4 4 4 4',
            border: true
        });

        var tranEditor = Ext.create('Exem.SyntaxEditor', {
            mode: 'text',
            width: '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true,
            editTheme: 'ace/theme/dark_imx'
        });

        rightCon.add(tranEditor);
        tranCon.add([leftCon, rightCon]);
        targetPanel.add(tranCon);

        tranEditor.setText('1개의 트랜잭션에서 이상이 탐지되었습니다.');

        var ix, ixLen;

        var layerTitleArr = ['WAS Layer', 'DB Layer', 'OS Layer', 'AA', 'BB'];
        var editorTextArr = ['1개의 이상한애', '2개의 이상한애', '3개의 이상한애', '4개의 이상한애', '5개의 이상한애'];

        this.conEl = [];

        for (ix = 0, ixLen = 5; ix < ixLen; ix ++) {
            var layerCon = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width: '100%',
                height: this.containerHeight,
                margin: '4 4 4 4',
                border: true
            });

            var titleCon = Ext.create('Ext.container.Container', {
                layout: 'fit',
                width: '10%',
                height: this.containerHeight,
                margin: '4 4 4 4',
                border: true,
                style : { background : '#ff4a6a' },
                items : [{
                    xtype: 'label',
                    margin: '5 5 0 5',
                    style : {
                        color : 'white',
                        'font-size' : '14px'
                    }
                }]
            });

            var editorCon = Ext.create('Ext.container.Container', {
                layout: 'fit',
                flex : 1,
                height: this.containerHeight,
                margin: '4 4 4 4',
                border: true
            });

            var editorOsCon = Ext.create('Ext.container.Container', {
                layout: 'fit',
                flex : 1,
                height: this.containerHeight,
                margin: '4 4 4 4',
                border: true
            });

            var editor = Ext.create('Exem.SyntaxEditor', {
                mode: 'text',
                width: '100%',
                height: '100%',
                readOnly: true,
                autoScroll: true,
                editTheme: 'ace/theme/dark_imx'
            });

            var editor_os = Ext.create('Exem.SyntaxEditor', {
                mode: 'text',
                width: '100%',
                height: '100%',
                readOnly: true,
                autoScroll: true,
                editTheme: 'ace/theme/dark_imx'
            });

            editorCon.add(editor);
            editorOsCon.add(editor_os);
            layerCon.add([titleCon, editorCon, editorOsCon]);
            targetPanel.add(layerCon);

            this.conEl.push({
                title : titleCon,
                editor : editor,
                editor_os : editor_os
            });
        }

        this.add(targetPanel);
        this.setData();
    },

    setData: function() {
        // Ext.Ajax.request({
        //     url : common.Menu.useGoogleCloudURL + '/admin/system',
        //     method : 'GET',
        //     success : function(response) {
        //         var result = Ext.JSON.decode(response.responseText);
        //         if (result.success === 'true') {
        //             data = result.data;
        //
        //             for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
        //                 this.systemTypeCombo.addItem(data[ix].sys_id, data[ix].name);
        //             }
        //
        //             this.systemTypeCombo.selectRow(0);
        //         }
        //     }.bind(this),
        //     failure : function(){}
        // });

        var eData = [{
            title   : 'WAS Layer'  ,
            text    : '1개의 이상한애',
            text_os : 'os의 이상한애'
        }, {
            title   : 'DB Layer'  ,
            text    : '1개의 이상한애',
            text_os : ''
        }, {
            title   : 'AA Layer'  ,
            text    : '1개의 이상한애',
            text_os : 'os의 이상한애'
        }, {
            title   : 'BB Layer'  ,
            text    : '1개의 이상한애',
            text_os : 'os의 이상한애'
        }, {
            title   : 'CC Layer'  ,
            text    : '1개의 이상한애',
            text_os : 'os의 이상한애'
        }];

        var ix, ixLen, el;

        for (ix = 0, ixLen = this.conEl.length; ix < ixLen; ix++) {
            el = this.conEl[ix];

            el.title.items.items[0].setText(eData[ix].title);
            el.editor.setText(eData[ix].text);
            el.editor_os.setText(eData[ix].text_os);
        }
    }

});

