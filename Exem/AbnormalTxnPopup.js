Ext.define("Exem.AbnormalTxnPopup", {
    extend: 'Exem.XMWindow',
    layout: 'vbox',
    maximizable: true,
    width: 950,
    height: 900,
    minWidth: 950,
    minHeight: 600,
    resizable: true,
    closeAction: 'destroy',
    title: common.Util.TR('Abnormal Transactions'),

    bodyStyle: { background: '#f5f5f5' },

    wasId    : null,
    statId   : null,
    statName : '',
    moment   : null,
    fromTime : null,
    toTime   : null,
    isFirstFlag : false,

    usefont: function(size, text, color) {
        var clr;
        if (color === undefined || color === null) {
            clr = '#000000';
        } else {
            clr = color;
        }
        return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px; color: ' + clr + '">' + text + '</span>';
    },

    initProperty: function() {
        this.gridArr  = [];

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
    },

    init: function() {

        this.initProperty();

        this.targetPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            height: 835,
            margin: '4 4 4 4',
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });

        var data = [{
            depth : 1,
            title : '비정상 거래',
            contents : ['EWL41210T(체크카드국내승인)', 'ECLD20102(당행계좌간 자금이체 실행)']
        }, {
            depth : 1,
            title : 'EWL41210T(체크카드국내승인) 비정상 구간',
            contents : ['코어뱅킹DB: WPCBS1, WPCBS2, WPCBS3']
        }, {
            depth : 2,
            title : 'DB(WPCBS1) Metric 분석',
            contents : [
                'library_cache_lock        598535.000       748.748 (0.000~[88.344]~2086.501)',
                'db_file_sequential_read   4763323.000      461.939 (9720.057~[35307.944]~60895.832)',
                'concurrency_wait_time     93972686.000     442.205 (0.000~[65335.322]~596239.690)',
                'log_file_sync             454191.000        56.113 (0.000~[7190.311]~27105.396)',
                'execute_count             159676.000        24.449 (0.000~[12094.167]~27184.707)',
                'user_calls                181456.000        23.309 (0.000~[13629.300]~31629.158)',
                'non_idle_wait_time        126270198.000     22.281 (0.000~[10725776.844]~23689987.179)',
                'redo_size                 73843745.000      12.435 (0.000~[5161231.822]~18969564.787)',
                'db_block_changes          130978.000         8.912 (0.000~[10135.811]~44035.091)',
                'db_file_scattered_read    1141.000           8.768 (0.000~[59.989]~368.199)',
                'db_block_gets             147941.000         7.774 (0.000~[12336.444]~55946.024)',
                'row_cache_lock            276.000            7.473 (0.000~[22.733]~107.456)',
                'user_commits              545.000            4.822 (7.096~[190.756]~374.416)',
                'session_logical_reads     1674211.000        4.206 (0.000~[317050.489]~1123712.802)',
                'consistent_gets           1526270.000        3.983 (0.000~[304713.989]~1071468.994)',
                'cpu_used_by_this_session  1296.000           3.859 (0.000~[281.511]~938.796)',
                'parse_time_elapsed        8.000              3.519 (0.000~[1.011]~5.976)',
                'buffer_busy_waits         120.000            2.915 (0.000~[10.833]~104.451)'
            ]
        }, {
            depth : 3,
            title : 'Wait Event 분석',
            contents : [
                'library cache lock 비정상 증가'
            ]
        }, {
            depth : 3,
            title : 'SQL 분석',
            contents : [
                'sql_id: cj0071dbyqf0c, module: ONL, action: EWL41210T, wait_time: 7899015',
                'sql_id: cj0071dbyqf0c, module: ONL, action: EFN7C110Q, wait_time: 1431895',
                'sql_id: cj0071dbyqf0c, module: ONL, action: ECLD20102, wait_time: 1375290'
            ]
        }, {
            depth : 2,
            title : 'DB(WPCBS2) Metric 분석',
            contents : [
                'library_cache_lock        590833.000       785.048 (0.000~[86.511]~1967.756)',
                'concurrency_wait_time     94482555.000     528.351 (0.000~[67018.389]~513764.986)',
                'non_idle_wait_time        83003666.000      12.634 (0.000~[10214213.433]~24617744.391)',
                'recursive_calls           4715.000           5.812 (0.000~[895.256]~2538.206)',
                'user_calls                31752.000          3.225 (992.691~[14425.744]~27858.797)'
            ]
        }, {
            depth : 3,
            title : 'Wait Event 분석',
            contents : [
                'library cache lock 비정상 증가'
            ]
        }, {
            depth : 3,
            title : 'SQL 분석',
            contents : [
                'sql_id: cj0071dbyqf0c, module: ONL, action: EWL41210T, wait_time: 7849130',
                'sql_id: cj0071dbyqf0c, module: ONL, action: ECLD20102, wait_time: 1644080',
                'sql_id: cj0071dbyqf0c, module: ONL, action: EFN7C110Q, wait_time: 1431805'
            ]
        }, {
            depth : 2,
            title : 'DB(WPCBS3) Metric 분석',
            contents : [
                'library_cache_lock        558381.000       667.810 (0.000~[94.789]~2184.777)',
                'concurrency_wait_time     91829591.000     429.064 (0.000~[58962.556]~593676.826)',
                'non_idle_wait_time        96225707.000      18.399 (0.000~[10281583.611]~21959221.708)',
                'recursive_calls           4539.000           3.115 (0.000~[1107.333]~3861.261)',
                'row_cache_lock            122.000            2.935 (0.000~[21.744]~107.141)'
            ]
        }, {
            depth : 3,
            title : 'Wait Event 분석',
            contents : [
                'library cache lock 비정상 증가'
            ]
        }, {
            depth : 3,
            title : 'SQL 분석',
            contents : [
                'sql_id: cj0071dbyqf0c, module: ONL, action: EWL41210T, wait_time: 7802890',
                'sql_id: cj0071dbyqf0c, module: ONL, action: ECLD20102, wait_time: 1505730',
                'sql_id: cj0071dbyqf0c, module: ONL, action: EFN7C110Q, wait_time: 1256865'
            ]
        }];

        this.show();

        this.add(this.targetPanel);

        this.createGrid(data);        
    },

    createGrid: function(data) {
        var ix, ixLen,
            jx, jxLen, blankCon;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            var gridContainer = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width : '100%',
                height: 100,
                style : {
                    'overflow' : 'hidden'
                }
            });

            var leftContainer = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width : '100%',
                height: '100%'
            });

            if (data[ix].depth > 1) {
                for (jx = 1, jxLen = data[ix].depth; jx < jxLen; jx++) {
                    blankCon = Ext.create('Ext.container.Container', {
                        layout: 'vbox',
                        width : '100%',
                        height: '100%',
                        flex : 0.1
                    });

                    leftContainer.add(blankCon);
                }
            }

            this.grid = Ext.create('Exem.BaseGrid', {
                adjustGrid : true,
                usePager: false,
                borderVisible: true,
                baseGridCls: 'baseGridRTM',
                contextBaseCls: 'rtm-context-base',
                margin : '5 25 5 5',
                style : {
                    'overflow-x' : 'hidden'
                },
                columnHeaderAlign: Grid.headerAlignLeft
            });

            this.grid.beginAddColumns();
            this.grid.addColumn(data[ix].title, data[ix].title, 50, Grid.String, true, false);
            this.grid.endAddColumns();

            leftContainer.add(this.grid);

            gridContainer.add(leftContainer);
            this.targetPanel.add(gridContainer);

            for (jx = 0, jxLen = data[ix].contents.length; jx < jxLen; jx++) {
                this.grid.addRow([data[ix].contents[jx]]);
            }

            var rowCnt = data[ix].contents.length > 5 ? 5 : data[ix].contents.length;
            this.grid.up().setHeight(38 + rowCnt * 21);
            this.grid.up().up().setHeight(38 + rowCnt * 21);
            this.grid.drawGrid();
        }
    }

});




