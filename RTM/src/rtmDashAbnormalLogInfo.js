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
            layout: 'fit',
            width: '10%',
            height: this.tranContainerHeight,
            margin: '0 4 4 4',
            border: true,
            style : {
                background : '#282b32',
                'text-align' : 'center'
            },
            items : [{
                xtype: 'label',
                margin: '5 5 0 5',
                style : {
                    color : 'white',
                    'line-height' : this.tranContainerHeight + 'px',
                    'font-size' : '14px'
                }
            }]
        });

        var rightCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            flex : 1,
            height: this.tranContainerHeight,
            margin: '0 4 4 4',
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

        this.tranConEl = {
            title : leftCon,
            editor : tranEditor
        };

        var ix, ixLen;

        this.conEl = [];

        for (ix = 0, ixLen = 2; ix < ixLen; ix ++) {
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
                margin: '0 4 4 4',
                border: true,
                style : {
                    background : '#282b32',
                    'text-align' : 'center'
                },
                items : [{
                    xtype: 'label',
                    margin: '5 5 0 5',
                    style : {
                        color : 'white',
                        'line-height' : this.containerHeight + 'px',
                        'font-size' : '14px'
                    }
                }]
            });

            var editorCon = Ext.create('Ext.container.Container', {
                layout: 'fit',
                flex : 1,
                height: this.containerHeight,
                margin: '0 4 4 4',
                border: true
            });

            var editorOsCon = Ext.create('Ext.container.Container', {
                layout: 'fit',
                flex : 1,
                height: this.containerHeight,
                margin: '0 4 4 4',
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

        var tranData = {
            status : 'error',
            title : '트랜잭션',
            text  : ' 1개의 트랜잭션에서 이상이 탐지되었습니다.\n\n' +
                    '     C53550275CBA732C2786E739252E5635559F1677의 평균 수행 시간(13.37)이 정상 범위(0~12.19)를 3.54 편차만큼 벗어났습니다.\n' +
                    '         추가로 다음의 수치에서 이상이 탐지되었습니다.\n' +
                    '             sql_time: 8.29(0.35~5.43, 6.37)'
        };

        if (tranData.status == 'error') {
            this.tranConEl.title.setStyle('background', '#ff4a6a');
        }
        this.tranConEl.title.items.items[0].setText(tranData.title);
        this.tranConEl.editor.setText(tranData.text);
        
        // '#ff4a6a' 이상

        var eData = [{
            status  : '',
            title   : 'Web Application',
            text    : ' 이상없음',
            text_os : ''
        }, {
            status  : 'error',
            title   : 'Oracle Database',
            text    : ' 1개의 Oracle Instance에서 이상이 탐지되었습니다.\n\n' +
                      '     Oracle 6 이상지표\n' +
                      '         free buffer waits: 583.0, 정상 범위: 0.0~195.17, 편차:9.42\n' +
                      '         buffer busy waits: 88.0, 정상 범위: 0.0~38.13, 편차: 7.28\n' +
                      '         concurrency wait time: 899287.0, 정상 범위: 0.0~570686.85, 편차: 5.09\n\n' +
                      '         다음 SQL에서 성능 저하가 발생했습니다.\n' +
                      '             SQL_ID: 5u474tg21rdd6 (JDBC Thin Client / nan), wait event: enq: TX - row lock contention, wait time: 167240\n' +
                      '             SQL_ID: 6pdzf5wqd2s73 (JDBC Thin Client / nan), wait event: enq: TX - row lock contention, wait time: 162110\n' +
                      '             SQL_ID: gh94qb4pc9xmd (JDBC Thin Client / nan), wait event: enq: TX - row lock contention, wait time: 93185\n\n' +
                      '         다음 SQL에서 stat 변동이 발생했습니다.\n' +
                      '             SQL_ID: 4gc6b8cht589s, physical_reads: 131781, redo_size: 112224\n' +
                      '             SQL_ID: 8bsbmkzx7kr09, physical_reads: 8707, redo_size: 17821864\n' +
                      '             SQL_ID: 7axv1a6gnc08g, physical_reads: 8203, redo_size: 51593080\n' +
                      '             SQL_ID: 5u474tg21rdd6, physical_reads: 719, redo_size: 5134356\n',
            text_os : ''
        }];

        var ix, ixLen, el;

        for (ix = 0, ixLen = this.conEl.length; ix < ixLen; ix++) {
            el = this.conEl[ix];

            if (eData[ix].status == 'error') {
                el.title.setStyle('background', '#ff4a6a');
            }
            el.title.items.items[0].setText(eData[ix].title);
            el.editor.setText(eData[ix].text);
            el.editor_os.setText(eData[ix].text_os);
        }
    }

});

