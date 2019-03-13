Ext.define('Exem.TxnTrendBaseForm', {
    extend: 'Exem.Form',
    layout: 'vbox',
    minWidth: 1080,
    width: '100%',
    title: '',
    isInitResize: true,
    isInitActivate: true,

    parentScatter: null,    // withLive일 경우 필수
    detailScatterYRange: 'dataSensitive',  // fixed or dataSensitive
    isExtBankMode: false,
    isAllWasRetrieve: false,
    autoRetrieveRange: null,
    retrRangeBeforeDragDetail: null,
    tid: null,  // RTM ALERT 에서 넘여주는 프로퍼티값
    isChartDataVisible : true,
    isChartDom : true,
    isRTM      : false,

    cls : 'list-condition Exem-FormOnCondition',

    //점차트 범위 이외 그리드 출력 제거를 위한 변수
    tmpMinElapse : 0,
    tmpMaxElapse : 0,
    tmpFromVal : '',
    tmpToVal : '',
    isInit : false,

    //Txn List Grid Pager 관련 변수
    fromRowIndex : 0,
    loadDataRow  : 10000,
    maxLoadCount : Comm.excelExportLimitRow || 50000,
    limitData : 0,
    limitFrom : 0,
    defaultLimitData : null,
    isAddGridData : false,

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        },

        afterlayout: function() {
            if (!this.isChartDom) {
                this.retrieveScatter();
                this.isChartDom = true;
            }
        },
        activate: function() {
            if (!this.isChartDataVisible) {
                this.detailScatter.fireEvent('resize');
                this.isChartDataVisible = true;
            }
            this.isInitActivate = false;
        }
    },

    init: function() {
        this.retrieve_loading = false;

        //그리드 클릭한 로우 인덱스 담는 변수.
        this.selectDetailGridRow = null;
        this.selectDetailGridRowCht = null;
        this.selectDetailGridRowTree = null;

        this.allDetailGridData = null;
        this.retrieve_click = false;

        this.monitorType = !this.monitorType ? window.rtmMonitorType : this.monitorType;

        this.createConditionLayout();
        this.createWorkLayout();

        this.add([this.conditionBox, { xtype: 'tbspacer', itemId: 'spacer', height:10, width: '100%', background: '#e9e9e9'}, this.workArea]);

        if (this.innerInit) {
            this.innerInit();
        }

        if (this.autoRetrieveRange !== null) {
            this.autoRetrieve();
        }
    },

    createConditionLayout: function() {
        var retrieveArea, prevBtn,
            self = this;

        this.conditionBox = Ext.create('Exem.Container', {
            width: '100%',
            height: 39,
            layout: 'hbox',
            style : {
                background: '#FFF',
                borderRadius: '6px'
            }
        });

        this.conditionArea = Ext.create('Ext.container.Container', {
            flex: 1,
            height: '100%',
            layout: 'absolute'
        });


        retrieveArea = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: 180,
            height: '100%'
        });

        if (Comm.isBGF) {
            prevBtn = document.createElement('img');
            prevBtn.style.opacity = 0.5;
            prevBtn.src = '../images/LeftArrow_White_On.png';
            prevBtn.style.position = 'absolute';
            prevBtn.style.top = '0px';
            prevBtn.style.left = '10px';
            prevBtn.style.cursor = 'pointer';
            prevBtn.onclick = function() {
                self.destroy();
            };
            prevBtn.onmouseover = function() {
                this.style.opacity = 1;
            };
            prevBtn.onmouseout = function() {
                this.style.opacity = 0.5;
            };
            setTimeout(function() {
                self.conditionArea.getEl().appendChild(prevBtn);
            }, 10);
        }

        this.createDefaultCondLayout();
        this.createRetrieveCondLayout(retrieveArea);

        this.conditionBox.add([this.conditionArea, retrieveArea]);

    },

    createDefaultCondLayout: function() {

        var self = this,
            fDate, tDate,
            elapseTideLabel, infinityBtn;

        this.datePicker = Ext.create('Exem.DatePicker', {
            width: 110,
            x: 32,
            y: 5,
            executeSQL: this.executeSQL,
            executeScope: this,
            rangeOneDay: true
        });

        fDate = new Date((new Date()) - 20 * 60 * 1000);
        tDate = new Date();

        fDate.setSeconds(0);
        fDate.setMilliseconds(0);

        tDate.setSeconds(0);
        tDate.setMilliseconds(0);

        this.datePicker.mainFromField.setValue(this.datePicker.dataFormatting(fDate, this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue(this.datePicker.dataFormatting(tDate, this.datePicker.DisplayTime));

        this.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 300,
            comboLabelWidth : 60,
            comboWidth      : 260,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : this.monitorType === 'WEB' ? 414 : 400,
            y               : 5,
            linkMonitorType : this.monitorType
        });

        this.minElapseField = Ext.create('Exem.NumberField', {
            x                : 715,
            y                : 5,
            width            : this.monitorType == 'CD' ? 175 : 145,
            fieldLabel       : this.monitorType == 'CD' ? common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)' : common.Util.CTR('Elapsed Time'),
            labelWidth       : this.monitorType == 'CD' ? 120 : 90,
            fieldStyle       : 'text-align: right;',
            value            : 1,
            maxLength        : 9,
            hideTrigger      : true,
            decimalPrecision : 3,
            allowExponential : false
        });

        elapseTideLabel = Ext.create('Ext.form.Label', {
            x    : this.monitorType == 'CD' ? 891 : 861,
            y    : 10,
            text : '~'
        });

        this.maxElapseField = Ext.create('Exem.TextField', {
            x          : this.monitorType == 'CD' ? 900 : 870,
            y          : 5,
            width      : 50,
            labelWidth : 0,
            fieldStyle : 'text-align: right;',
            value      : common.Util.CTR('infinite'),
            maxLength  : 9
        });

        infinityBtn = Ext.create('Exem.Container', {
            x         : this.monitorType == 'CD' ? 953 : 923,
            y         : 10,
            width     : 18,
            height    : 13,
            html      : '<img src="../images/infinity.png" class="res-inspector-infinity-btn"/>',
            listeners : {
                render: function() {
                    this.getEl().addListener('click', function() {
                        self.maxElapseField.setValue(common.Util.TR('infinite'));
                        self.detailScatter.detailScatterYRange = 'dataSensitive';
                    });
                }
            }
        });

        this.chartToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x       : 1000,
            y       : 10,
            onText  : common.Util.TR('Chart Retrieve'),
            offText : common.Util.TR('All Retrieve'),
            state   : this.chartToggleValue(),
            hidden  : !common.Menu.useTxnResponseChart
        });

        this.conditionArea.add([this.datePicker, this.wasField,
            this.minElapseField, elapseTideLabel, this.maxElapseField, infinityBtn, this.chartToggle]);

    },

    createRetrieveCondLayout: function(target) {

        var self = this,
            retrieveBtn;

        this.detailToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x            : -20,
            y            : 10,
            width        : 95,
            onText       : common.Util.TR('Detail'),
            offText      : common.Util.TR('Common'),
            resizeHandle : false,
            state        : false,
            listeners    : {
                change: function(toggle, state) {
                    self.conditionBox.setHeight(state ? 105 : 39);
                    self.setToggleSlide(state);
                }
            }
        });

        retrieveBtn = Ext.create('Ext.button.Button', {
            text    : common.Util.TR('Retrieve'),
            x       : 80,
            y       : 8,
            width   : 90,
            height  : 25,
            cls     : 'retrieve-btn',
            handler : function() {
                self.autoRetrieveRange = null;
                self.tid = '';
                self.retrieve();
            }
        });

        this.exceptionToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x: -20,
            y: 40,
            width: 110,
            onText: common.Util.TR('All'),
            offText: common.Util.TR('Exception'),
            state: true
        });

        target.add([this.detailToggle, retrieveBtn, this.exceptionToggle]);

        this.isAllWasRetrieve = false;
    },

    createWorkLayout: function() {
        var self = this,
            left_container, right_container,
            detailScatterWrap,
            scatterBox, detailScatterTitle;


        this.workArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : '100%',
            flex   : 1,
            layout : 'border',
            border : false,
            cls    : 'Exem-Form-workArea',
            style  : {
                borderRadius: '6px'
            }
        });

        left_container = Ext.create('Exem.Container',{
            region    : 'west',
            layout    : 'fit',
            width     : '40%',
            split     : true,
            border    : false,
            listeners : {
                resize: function() {
                    if (!self.isInitResize) {
                        setTimeout(function() {
                            self.detailScatter.fireEvent('resize');
                        }, 10);
                    }
                    self.isInitResize = false;
                }
            }
        });

        right_container = Ext.create('Exem.Container',{
            region : 'center',
            layout : 'fit' ,
            width  : '60%',
            split  : true
        });

        scatterBox = Ext.create('Exem.Container', {
            layout : 'vbox',
            flex   : 4,
            height : '100%',
            border : 1,
            split  : true ,
            region : 'west'
        });

        this.gridBox = Ext.create('Exem.Container', {
            layout : 'vbox',
            flex   : 6,
            height : '100%',
            border : 1
        });

        this.detailScatterBox = Ext.create('Exem.Panel', {
            layout    : 'fit',
            flex      : 1,
            width     : '100%',
            minHeight : 200,
            border    : 0,
            margin    : '0 20 20 20',
            listeners : {
                afterrender: function() {
                    if (self.autoRetrieveRange !== null) {
                        this.setLoading(true);
                    }
                }
            }
        });

        detailScatterWrap = Ext.create('Ext.panel.Panel', {
            layout    : 'vbox',
            flex      : 1,
            width     : '100%',
            minHeight : 265,
            border    : 1
        });

        this.detailScatter = Ext.create('Exem.chart.D3ScatterSelectable', {
            type                : 'detail',
            target              : this.detailScatterBox,
            parentView          : self,
            detailScatterYRange : this.detailScatterYRange
        });

        this.bottomCont = Ext.create('Exem.Panel', {
            layout    : 'fit',
            flex      : 1,
            width     : '100%',
            heigth    : '100%',
            minHeight : 260,
            border    : 1
        });

        this.bottomTab = Ext.create('Exem.TabPanel',{
            width     : '100%',
            heigth    : '100%',
            flex      : 1,
            layout    : 'fit',
            itemId    : 'bottomTab',
            listeners : {
                tabchange: function(tabPanel, newCard) {
                    if (newCard.title === common.Util.TR('Transaction Summary')) {
                        return;
                    }

                    if (!newCard.isInit) {
                        if (newCard.title === common.Util.TR('Transaction Chart')) {
                            self.createTxnChart();
                        } else if (newCard.title === common.Util.TR('Call Tree')) {
                            self.createCallTree();
                        }

                        newCard.isInit = true;
                    }

                    self.callItemClick();
                }
            }
        });

        this.bottomTab.add({title: common.Util.TR('Transaction Summary'),  layout: 'fit', tab_idx: 0, itemId: 'tab_txn'     , border: 0});
        this.bottomTab.add({title: common.Util.TR('Transaction Chart')  ,  layout: 'fit', tab_idx: 1, itemId: 'tab_txnchart', border: 0});
        if (this.monitorType != 'WEB') {
            this.bottomTab.add({title: common.Util.TR('Call Tree'),  layout: 'fit', tab_idx: 2, itemId: 'tab_calltree', border: 0});
        }

        detailScatterTitle = Ext.create('Ext.panel.Panel', {
            html   : '<p class="res-inspector-title">' + common.Util.TR('Response Time Chart') + '</p>',
            width  : '100%',
            height : 30,
            margin : '15 0 0 30',
            border : 0
        });

        this.createTxnGrid();

        this.addColumnTxnGrid(this.txnGrid);

        this.bottomCont.add(this.bottomTab);
        this.bottomTab.tabBar.items.items[1].setVisible(false);
        if (this.bottomTab.tabBar.items.items[2]) {
            this.bottomTab.tabBar.items.items[2].setVisible(false);
        }

        detailScatterWrap.add([detailScatterTitle, this.detailScatterBox]);
        scatterBox.add([detailScatterWrap, this.bottomCont]);

        left_container.add(scatterBox);
        right_container.add(this.gridBox);

        this.workArea.add([left_container, right_container]);
    },

    addDetailGrid: function() {
        var self = this,
            grid;

        grid = Ext.create('Exem.BaseGrid', {
            itemId      : 'txnDetailGrid',
            minHeight   : 500,
            margin      : '0 0 0 0',
            border      : 0,
            usePager    : true,
            defaultPageSize: 1000,
            defaultbufferSize : 0,
            localeType  : 'd H:i:s.u',
            itemSelect  : function(dv, record, index) {
                //flag check
                if (index == undefined) {
                    index = self.selectDetailGridRow;
                } else {
                    self.selectDetailGridRow = index;
                }

                switch (self.bottomTab.getActiveTab().tab_idx) {
                    case 1:

                        if (self.selectDetailGridRowCht == index) {
                            return;
                        }

                        self.retrieveTxnChart(record);
                        self.selectDetailGridRowCht = index;

                        break;

                    case 2:

                        if (self.selectDetailGridRowTree == index || self.monitorType == 'WEB') {
                            return;
                        }

                        self.retrieveCallTree(record);
                        self.selectDetailGridRowTree = index;

                        break;
                    default :
                        break;
                }
            }
        });

        if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
            this.defaultLimitData = this.loadDataRow;
        } else {
            this.defaultLimitData = 'LIMIT ' + this.loadDataRow;
        }

        grid.pnlExGridPager.add({
            xtype   : 'button',
            itemId  : 'grid_detail_list_more_btn',
            text    : common.Util.TR('More Load'),
            margin  : '0 0 0 10',
            border  : true,
            handler : function() {
                if (!self.isNotMoreData) {
                    grid.down('#grid_detail_list_more_btn').setDisabled(true);
                    grid.down('#grid_detail_list_fetch_all').setDisabled(true);
                    self.fromRowIndex += self.loadDataRow;
                    self.isAddGridData = true;
                    self.isAddTxnGridData = true;
                    if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                        self.limitData = self.defaultLimitData +  self.fromRowIndex;
                        self.limitFrom = self.fromRowIndex;
                    } else {
                        self.limitData = self.defaultLimitData + ' OFFSET ' + self.fromRowIndex;
                    }
                    self.retrieveGrid();
                }
            }
        },{
            xtype   : 'button',
            itemId  : 'grid_detail_list_fetch_all',
            text    : common.Util.TR('Fetch All'),
            margin  : '0 0 0 10',
            border  : true,
            handler : function() {
                this.setVisible(false);

                grid.down('#grid_detail_list_more_btn').setVisible(false);
                self.isAddGridData = false;
                self.isAddTxnGridData = false;
                if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                    self.limitData = self.maxLoadCount;
                    self.limitFrom = 0;
                } else {
                    self.limitData = 'LIMIT ' + self.maxLoadCount;
                }
                self.retrieveGrid();
            }
        });

        grid.down('#grid_detail_list_more_btn').setDisabled(true);
        grid.down('#grid_detail_list_fetch_all').setDisabled(true);

        grid.on('afterrender', function() {
            if (self.autoRetrieveRange !== null) {
                grid.setLoading(true);
            }
        });

        grid.pnlExGrid.on('select', function(scope, record) {
            var elapse, time;

            if (self.monitorType == 'CD') {
                elapse = record.data['txn_elapse_us'];
                time = +new Date(record.data['time']);
            } else if (self.monitorType == 'WEB') {
                elapse = record.data['elapse_time'];
                time = +record.data['raw_time'];
            } else {
                elapse = record.data['txn_elapse'];
                time = +record.data['raw_time'];
            }

            self.detailScatter.setFocus(time, elapse);
        });


        grid.pnlExGrid.on('cellclick', function(view, td) {
            common.Util.setClipboard(td.children[0].innerHTML);
        });


        return grid;
    },

    createTxnGrid: function() {
        this.txnGrid = Ext.create('Exem.BaseGrid', {
            itemId  : 'grd_txn',
            width   : '100%',
            usePager: false,
            adjustGrid: false
        });

        this.bottomTab.items.items[0].add(this.txnGrid);
    },

    createTxnChart: function() {
        this.txn_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId             : 'txn_chart',
            interval           : PlotChart.time.exHour,
            width              : '100%',
            height             : 370 ,
            flex               : 1 ,
            showLegend         : true,
            legendTextAlign    : 'east',
            legendAlign        : 'south',
            legendVH           : 'hbox',
            legendHeight       : 30,
            legendContentAlign : 'center',
            mouseSelect        : false,
            mouseSelectMode    : 'x',
            showIndicator      : true ,
            showTitle          : false,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip        : true,
            toolTipFormat      : '%x [value:%y] ',
            toolTipTimeFormat  : '%H:%M',
            toFixedNumber      : 3,
            yLabelWidth        : 100 ,
            chartProperty      : {
                axislabels : true,
                yLabelWidth: 80,
                xLabelFont : {size: 8, color: 'black'},
                yLabelFont : {size: 8, color: 'black'},
                timeformat : '%h:%M',
                yaxes          : [{
                    position  : 'left',
                    axisLabel : common.Util.TR('Executions')
                },{
                    position  : 'right',
                    axisLabel : common.Util.TR('Time/exec (sec)')
                }]
            },
            xaxisCurrentToTime : true,
            showDayLine        : false,
            selectionZoom      : false
        });

        this.txn_chart.addSeries({
            label: 'Executions',
            id   : 'cht1',
            type : PlotChart.type.exBar
        });

        this.txn_chart.addSeries({
            label: common.Util.TR('Response Time/exec'),
            id   : 'cht2',
            type : PlotChart.type.exLine,
            point: true,
            yaxis: 2 ,
            color: '#F76211',
            lineWidth: 3
        });
        if (this.monitorType == 'WAS' || this.monitorType == 'TP' || this.monitorType == 'TUX') {
            this.txn_chart.addSeries({
                label: common.Util.CTR('SQL Time/exec'),
                id   : 'cht3',
                type : PlotChart.type.exLine,
                point: true,
                yaxis: 2,
                color: '#00E03C',
                lineWidth: 3
            });
        }


        this.bottomTab.items.items[1].add(this.txn_chart);
    },

    autoRetrieve: function() {
        this.setRetrieveRange(this.autoRetrieveRange);

        if (this.autoRetrieveRange.wasName) {
            if (this.autoRetrieveRange.wasName == 'All') {
                this.wasField.selectByIndex(0);
            } else {
                this.wasField.selectByValues(this.autoRetrieveRange.wasName);
            }
        }

        this.retrieve();
    },


    createCallTree: function() {
        this.callTree = Ext.create('Exem.BaseGrid',{
            itemId    : 'callTree',
            gridType  : Grid.exTree,
            cls       : 'left-condition-tree',
            useArrows : false,
            height    : 500,
            width     : '100%',
            flex      : 1
        });

        if (this.setContextMenuCallTree) {
            this.setContextMenuCallTree();
        }


        this.bottomTab.items.items[2].add(this.callTree);
        this.addColumnCallTree();
    },

    txnGridRenderer: function(value, meta, record) {
        var total_time, was_avg, sql_avg, remote_avg,
            BarChart;

        if (record.data) {
            was_avg = +record.data['agent_avg'];
            remote_avg = +record.data['r'];
            sql_avg = +record.data['sql_avg'];

            was_avg -= sql_avg;
            remote_avg = remote_avg;

            if (was_avg < 0) {
                was_avg = 0;
            }

            if (sql_avg < 0) {
                sql_avg = 0;
            }

            if (remote_avg < 0) {
                remote_avg = 0;
            }

            total_time = was_avg + remote_avg || 0;

            was_avg = ((was_avg / total_time) * 100).toFixed(3);
            // sql_avg = ((sql_avg / total_time) * 100).toFixed(3);
            remote_avg = ((remote_avg / total_time) * 100).toFixed(3);

            BarChart = '<div style="position:relative; width:100%; height:13px">'
                + '<div data-qtip="' + 'Agent: ' + was_avg + '%' + '" style="float:left; background-color:#D1D21F;background: #D1D21F ;height:100%;width:' + was_avg + '%;"></div>'
                + '<div data-qtip="' + 'Remote: ' + remote_avg + '%' + '" style="float:left; background-color:#6EBDE8;background: #6EBDE8;height:100%;width:' + remote_avg + '%;"></div>'
                + '</div>';

            return BarChart;
        }
    },

    callTreeRenderer: function(value) {
        return '<div style="position:relative; width:100%; height:13px">' +
            '<div data-qtip="' + value + '%' + '" style="float:left; background-color:#5898E9;height:100%;width:' + value + '%;"></div>' +
            '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
            '</div>';
    },

    onGridData: function(header, data) {

        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.detailListGrid.setLoading(false);
            this.detailListGrid.loadingMask.hide();
            this.bottomCont.loadingMask.hide();
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
            return;
        }

        this.detailListGrid.setLoading(false);

        if (this.allDetailGridData == undefined || this.allDetailGridData.rows.length == 0) {
            this.allDetailGridData = data[0];
        }

        if (this.retrieve_click) {
            if (this.init_time == null) {
                this.init_time = [];
            }
            this.init_time[0] = common.Util.getDate(this.datePicker.getFromDateTime());
            this.init_time[1] = common.Util.getDate(this.datePicker.getToDateTime());
            this.allDetailGridData = data[0];
        }

        this.addRowDetailGrid(data[0]);


        if (data[0].rows.length < this.loadDataRow) {
            this.isNotMoreData = true;
            this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
        }

        this.detailListGrid.drawGrid();
        this.retrieve_click = false;

        this.detailListGrid.loadingMask.hide();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);

        this.txnGrid.clearRows(); //pjy추가
        if (data[0].rows.length > 0) {
            if (data[1] !== undefined) {

                if (this.isAddTxnGridData) {
                    this.isAddTxnGridData = false;
                    this.mergeTxnSummaryData(data[1]);
                }
                this.retrieveTxnSummary(data[1]);

                this.bottomTab.tabBar.items.items[1].setVisible(true);
                if (this.bottomTab.tabBar.items.items[2]) {
                    this.bottomTab.tabBar.items.items[2].setVisible(true);
                }
            }
        } else {
            this.bottomCont.loadingMask.hide();
        }


        this.completeGridListSqlExec = true;
        this.selectToFirstRow();
        this.retrieve_loading = false;
        this.detailScatter.retrieveLoading = this.retrieve_loading;
    },

    filterGrid: function(elapse_value, all_data) {
        var self = this,
            cnt, from, to;

        if (all_data) {
            if (this.chartToggle.getValue()) {
                this.detailListGrid.clearRows();
                this.detailListGrid.drawGrid();
                this.txnGrid.clearRows();
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
                this.bottomTab.setActiveTab(0);
                this.bottomTab.tabBar.items.items[1].setVisible(false);
                if (this.bottomTab.tabBar.items.items[2]) {
                    this.bottomTab.tabBar.items.items[2].setVisible(false);
                }
                this.detailListGrid.getEl().dom.style.opacity = '0.3';
                this.txnGrid.getEl().dom.style.opacity = '0.3';
                this.detailListGrid.setDisabled(true);
                this.txnGrid.setDisabled(true);
                return;
            }
            if (!this.allDetailGridData) {
                this.detailListGrid.getEl().dom.style.opacity = '1';
                this.txnGrid.getEl().dom.style.opacity = '1';
                this.detailListGrid.setDisabled(false);
                this.txnGrid.setDisabled(false);
                this.retrieveGrid();
            } else {
                this.allData = true;

                if (isNaN(this.init_elapse_max)) {
                    this.init_elapse_max = 100000000;
                }

                this.minElapse = this.monitorType === 'CD' ? this.init_elapse_min : this.init_elapse_min * 1000;

                if (this.monitorType === 'CD') {
                    this.minElapseField.setValue( this.minElapse );
                    this.maxElapse = this.init_elapse_max;
                } else {
                    this.minElapseField.setValue( this.minElapse / 1000 );
                    this.maxElapse = this.init_elapse_max != 100000000 ? this.init_elapse_max * 1000 : this.init_elapse_max;
                }

                this.fromTime = this.init_time[0];
                this.toTime = this.init_time[1];

                cnt = 0;
                this.loadingMask.show();


                from = +new Date(this.fromTime);
                to = +new Date(this.toTime);

                this.detailListGrid.clearRows();

                if (this.allDetailGridData.rows.length < this.loadDataRow) {
                    this.isNotMoreData = true;
                    this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                    this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
                } else {
                    this.isNotMoreData = false;
                    this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
                    this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);
                }

                this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);

                cnt = this.setFilterGridData(cnt, from, to);

                setTimeout(function() {
                    if (cnt) {
                        self.detailListGrid.drawGrid();
                        self.retrieveReTxnSummary();
                    }
                    self.loadingMask.hide();
                },500);
            }
        } else {
            this.allData = false;

            this.detailListGrid.getEl().dom.style.opacity = '1';
            this.txnGrid.getEl().dom.style.opacity = '1';

            this.detailListGrid.setDisabled(false);
            this.txnGrid.setDisabled(false);

            this.retrieveReGrid();
            this.retrieveReTxnSummary();
        }
    },

    retrieveTxnSummary: function(data) { // 좌측 아래 그리드

        this.bottomTab.tabBar.items.items[1].setVisible(false);
        if (this.bottomTab.tabBar.items.items[2]) {
            this.bottomTab.tabBar.items.items[2].setVisible(false);
        }
        this.bottomTab.setActiveTab(0);

        this.addRowTxnGrid(data);


        this.tempTxnGridRows = data.rows.concat();

        this.txnGrid.drawGrid();
        this.bottomCont.loadingMask.hide();
    },


    onReGridData: function(header, data) {
        var command = header.command;

        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.detailListGrid.setLoading(false);
            this.detailListGrid.loadingMask.hide();
            this.bottomCont.loadingMask.hide();

            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
            return;
        }

        this.detailListGrid.setLoading(false);

        if (command == this.sql.detailListGrid_Re) {
            if (data.rows.length < this.loadDataRow) {
                this.isNotMoreData = true;
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
            } else {
                this.isNotMoreData = false;
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);
            }

            this.detailListGrid.clearRows();

            this.addRowDetailGrid(data);

            this.detailListGrid.drawGrid();

            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select(0);
            this.detailListGrid.loadingMask.hide();
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
        } else if (command == this.sql.detailListGrid_Re_Txn) {
            this.txnGrid.clearRows();

            if (data.rows.length > 0) {
                this.retrieveTxnSummary(data);

                this.bottomTab.tabBar.items.items[1].setVisible(true);
                if (this.bottomTab.tabBar.items.items[2]) {
                    this.bottomTab.tabBar.items.items[2].setVisible(true);
                }
            } else {
                this.bottomCont.loadingMask.hide();
            }
        }

        if (this.allData) {
            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select(0);
            this.detailListGrid.loadingMask.hide();
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
        }
    },

    setRetrieveRange: function(retrieveRange, fromDetail) {
        var tmpTxnName, minElapse, maxElapse;

        if (!fromDetail) {
            this.retrRangeBeforeDragDetail = retrieveRange;
        }

        this.fromTime  = Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' );
        this.toTime    = Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' );

        this.msFromTime = Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s.u' );
        this.msToTime   = Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s.u' );

        this.minElapse = parseFloat(retrieveRange.elapseRange[0]);


        tmpTxnName = retrieveRange.txnName;
        if (tmpTxnName == undefined) {
            tmpTxnName = '%';
        }

        if (!fromDetail) {
            this.txnNameField.setValue(tmpTxnName);
        }

        if (retrieveRange.elapseRange[1] !== 'infinite') {
            this.maxElapse = parseFloat(retrieveRange.elapseRange[1]);
        } else {
            this.maxElapse = 100000000;
            this.init_elapse_max = this.maxElapse;
        }

        if (this.init_time == undefined || this.init_time == null) {
            this.init_time = [];
            this.init_time[0] = this.fromTime;
            this.init_time[1] = this.toTime;
        }

        this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[0], this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[1], this.datePicker.DisplayTime));

        if (retrieveRange.isExceptoin) {
            this.detailToggle.toggle();
            this.exceptionToggle.toggle();
        }

        maxElapse = this.monitorType == 'CD' ? this.maxElapse : this.maxElapse / 1000;
        minElapse = this.monitorType == 'CD' ? this.minElapse : this.minElapse / 1000;

        if (!this.isInit) {
            this.tmpMaxElapse = maxElapse;
            this.tmpMinElapse = minElapse;
            this.tmpFromVal = this.datePicker.mainFromField.getValue();
            this.tmpToVal = this.datePicker.mainToField.getValue();
            this.isInit = true;
        }

        this.detailScatter.yRange = [minElapse, maxElapse];

        this.minElapseField.setValue(minElapse);
        if (this.maxElapse == 100000000) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
        } else {
            this.maxElapseField.setValue(maxElapse);
        }
    },

    onBotData: function(header, data) {
        var ix, ixLen,
            param, chartSeries,
            calling_method_id , parent_node, calling_crc;


        if (this.isClosed) {
            return;
        }

        this.bottomCont.loadingMask.show();

        switch (header.command) {
            case this.sql.txnChart:
                param = header.parameters;
                this.txn_chart.clearValues();
                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {

                    if (this.monitorType == 'WAS' || this.monitorType == 'TP' || this.monitorType == 'TUX') {
                        chartSeries = {
                            'cht1': 2,
                            'cht2': 3
                        };
                    } else {
                        chartSeries = {
                            'cht1': 2,
                            'cht2': 3,
                            'cht3': 4
                        };
                    }

                    this.txn_chart.addValues({
                        from: param.bind[0].value,
                        to  : param.bind[1].value,
                        time: 0,
                        data: data.rows,
                        series: chartSeries
                    });
                }
                this.txn_chart.plotDraw();
                break;

            case 'txn_detail':
                this.callTree.clearNodes();
                this.callTree.beginTreeUpdate();

                if (!data) {
                    this.callTree.endTreeUpdate();
                    this.bottomCont.loadingMask.hide();
                    return;
                }

                if (!data.length) {
                    data[0] = data;
                } else {
                    if (data[0].columns.length == 8) {
                        this.callTree.endTreeUpdate();
                        this.bottomCont.loadingMask.hide();
                        return;
                    }
                }

                for (ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++) {
                    if ((data[0].rows[ix][7] == '' || data[0].rows[ix][7] == null) &&
                        (data[0].rows[ix][8] == 0 || data[0].rows[ix][8] == null)) {

                        this.addRowCallTree(null, data[0].rows[ix]);

                    } else {
                        calling_method_id = data[0].rows[ix][7];
                        calling_crc = data[0].rows[ix][8];

                        parent_node = this.callTree.MultifindNode('method_id', 'crc', calling_method_id, calling_crc);
                        if (!parent_node) {
                            continue;
                        }

                        this.addRowCallTree(parent_node, data[0].rows[ix]);
                    }
                }

                this.callTree.endTreeUpdate();
                this.callTree.drawTree();

                this.bottomCont.loadingMask.hide();

                break;

            default :
                break;
        }

        this.bottomCont.loadingMask.hide();
    },

    checkValid: function() {
        var minElapse = this.minElapseField.getValue(),
            maxElapse = this.maxElapseField.getValue();

        if (isNaN(minElapse)) {
            this.minElapseField.setValue(0);
        }
        if (isNaN(maxElapse)) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
            maxElapse = 99999999999;
        }

        if (minElapse > maxElapse) {
            this.minElapseField.markInvalid('');
            this.maxElapseField.markInvalid('');
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Minimum elapse time cannot be greater than maximum elapse time.'));
            return false;
        }
        return true;
    },

    setTitleWithTimeRange: function() {
        var findComponent, instanceName, fromTime, toTime;

        if (this.tab) {

            fromTime = this.datePicker.getFromDateTime();
            toTime = this.datePicker.getToDateTime();

            if (fromTime.length == 13) {
                fromTime += ':00';
            } else if (fromTime.length == 10) {
                fromTime += ' 00:00';
            }

            if (toTime.length == 13) {
                toTime += ':00';
            } else if (toTime.length == 10) {
                toTime += ' 00:00';
            }

            common.DataModule.timeInfo.lastFromTime = fromTime;
            common.DataModule.timeInfo.lastToTime   = toTime;


            findComponent = this.conditionArea.getComponent('wasCombo');

            if (findComponent == 'undefined' || findComponent == null) {
                findComponent = this.conditionArea.getComponent('dbCombo');
            }


            if (findComponent == 'undefined' || findComponent == null) {
                this.tab.setText(this.title + '<div>[' +
                    Ext.util.Format.date(fromTime, 'H:i~') +
                    Ext.util.Format.date(toTime, 'H:i]</div>'));
            } else {
                instanceName = findComponent.WASDBCombobox.getRawValue() + ' : ';

                if (instanceName.length > 25) {
                    instanceName = instanceName.substr(0, 20) + '... : ';
                }

                if (this.isDaily === true) {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                        Ext.util.Format.date(fromTime, 'm-d~') +
                        Ext.util.Format.date(toTime, 'm-d]</div>'));

                } else if (this.DisplayTime == DisplayTimeMode.None || this.singleField === true) {
                    this.tab.setText(this.title + '<div>[' + instanceName + Ext.util.Format.date(fromTime, 'Y-m-d]</div>'));
                } else {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                        Ext.util.Format.date(fromTime, 'H:i~') +
                        Ext.util.Format.date(toTime, 'H:i]</div>'));
                }
            }
            window.tabPanel.setRightScrollPosition();
        }
    },

    callItemClick: function() {
        var idx,
            grid = this.detailListGrid.pnlExGrid;

        if (!this.selectDetailGridRow) {
            this.selectDetailGridRow = 0;
        }

        switch (this.bottomTab.getActiveTab().tab_idx) {
            case 1:
            case 2:
                idx = this.selectDetailGridRow;
                break;
            default :
                break;
        }

        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('beforeselect', grid, grid.getSelectionModel().getLastSelected(), idx);
    },

    clearFilterGrid: function() {
        this.detailListGrid.pnlExGrid.getStore().clearFilter();
    },

    getWasList: function() {
        if (this.isAllWasRetrieve) {
            return Comm.selectedWasArr.join(',');
        } else {
            return this.wasField.getValue();
        }
    },

    selectToFirstRow: function() {
        if (this.completeGridListSqlExec && this.completeScatterSqlExec) {
            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select(0);
        }
    },

    chartToggleValue: function() {
        var state;

        if (common.Menu.useTxnResponseChart) {
            state = true;
            if (this.isRTM) {
                state = false;
            }
        } else {
            state = false;
        }

        return state;
    }
});
