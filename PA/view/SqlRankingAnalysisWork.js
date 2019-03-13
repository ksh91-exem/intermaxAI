Ext.define('view.SqlRankingAnalysisWork', {
    extend: 'Exem.Container',
    width: '100%',
    height: '100%',
    layout : 'vbox',
    sql : {
        topRankPanel : 'IMXPA_SqlRankingAnalysis_TopRankPanel.sql',
        botDetailPanel : 'IMXPA_SqlRankingAnalysis_BotDetailPanel.sql'
    },
    constructor : function() {
        this.callParent(arguments);
        this.init();
    },

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.loadCompleted = true;

        this.clearAll();
    },

    clearAll: function() {
        this.topTabObj = {
            'Elapse Time'  : {
                gridWidth   : 433,
                label       : 'Elapse Time Ratio (%)',
                colValue    : ['Avg Elapse Time(sec)', 'Max Elapse Time(sec)'],
                columnWidth : 110,
                gridList    : [],
                colType     : Grid.Float
            },
            'Execute Count'    : {
                gridWidth   : 433,
                label       : 'Execute count Ratio (%)',
                colValue    : ['Execute count'],
                columnWidth : 110,
                gridList    : [],
                colType     : Grid.Number
            }
        };

        this.topTabFlag = {
            'Elapse Time'  : false,
            'Execute Count'  : false
        };

        if(!window.isIMXNonDB) {
            this.topTabObj['DB CPU'] = {
                gridWidth   : 463,
                label       : 'DB CPU Time Ratio (%)',
                colValue    : ['DB CPU Time'],
                columnWidth : 140,
                gridList    : [],
                colType     : Grid.Float
            };
            this.topTabObj['Logical Reads'] = {
                gridWidth   : 433,
                label       : 'Logical Reads Ratio (%)',
                colValue    : ['Logical Reads'],
                columnWidth : 110,
                gridList    : [],
                colType     : Grid.Number

            };
            this.topTabObj['Physical Reads'] = {
                gridWidth   : 433,
                label       : 'Physical Reads Ratio (%)',
                colValue    : ['Physical Reads'],
                columnWidth : 110,
                gridList    : [],
                colType     : Grid.Number
            };

            this.topTabFlag['DB CPU'] = false;
            this.topTabFlag['Logical Reads'] = false;
            this.topTabFlag['Physical Reads'] = false;

        }

        this.startTime = null;
        this.endTime = null;
        this.agentList = null;
        this.topRecordValue = null;
        this.baseGridIdx = null;
        this.baseConIdx = null;

        this.viewTab         = null;
        this.gridDateList    = [];
        this.selectedSqlId      = null;
        this.selectedSqlName = null;
        this.selectedSectionIdx = 0;
        this.rawData = null;

        if(this.sqlIdField) {
            this.sqlIdField.setValue('');
        }

        if(this.rankSqlDetailGrid) {
            this.rankSqlDetailGrid.clearRows();
        }

        if(this.sqlStackChart) {
            this.sqlStackChart.clearValues();
            this.sqlStackChart.plotDraw();
        }

        if(this.lineChartArr) {
            for(var ix=0; ix<this.lineChartArr.length; ix++) {
                if(this.lineChartArr[ix]) {
                    this.lineChartArr[ix].removeAllSeries();
                    this.lineChartArr[ix].clearValues();
                    this.lineChartArr[ix].plotDraw();
                }
            }
        }
    },

    initLayout: function() {
        this.rankTabPanel = Ext.create('Exem.TabPanel',{
            width: '100%',
            height: '100%',
            flex : 0.3,
            minHeight: 340,
            activeTab: 0,
            layout : 'hbox',
            tabBar: {
                style: 'border-top-left-radius: 6px; border-top-right-radius: 6px;'
            },
            style  : 'background: #fff; border-radius: 6px; margin:0 0 10px 0;',

            listeners: {
                beforetabchange: function() {
                    if(!this.loadCompleted) {
                        return false;
                    }
                }.bind(this),
                tabchange: function( tabPanel, newCard ) {
                    if ( !this.retrieveFlag ) {
                        return;
                    }

                    if(!this.loadCompleted) {
                        return;
                    }

                    this.loadingMask.showMask();
                    this.loadCompleted = false;

                    var baseGrid;
                    var tab = newCard.itemId;

                    this.sqlIdField.setValue('');

                    if ( !this.topTabFlag[tab] ) {
                        this.selectedSqlId   = null;
                        WS.sqlview(this.sql.topRankPanel, this.onSQLView.bind(this));
                    } else {
                        baseGrid = newCard.items.items[this.baseConIdx].items.items[0];

                        if ( baseGrid && baseGrid.pnlExGrid.getStore().getAt(0) ) {
                            this.selectedSqlId = baseGrid.pnlExGrid.getStore().getAt(0).data.sqlId;
                            this.selectedSqlName = baseGrid.pnlExGrid.getStore().getAt(0).data.sqlText;
                        }
                        WS.sqlview(this.sql.botDetailPanel, this.onSQLView.bind(this));
                    }
                }.bind(this)
            }
        });

        this.sqlGridStackChartCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            minWidth : 700,
            height: 540,
            flex : 0.2,
            minHeight: 540,
            padding: '5 5 5 5',
            layout : 'vbox',
            style  : 'background: #FFF; border-radius: 6px;'
        });

        this.sqlLineChartCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            height: 540,
            flex : 0.8,
            minHeight: 540,
            padding: '5 5 5 5',
            layout : 'vbox',
            style  : 'background: #FFF; border-radius: 6px;'
        });

        var bottomCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            height: 540,
            minHeight: 540,
            padding: '1 7 0 7',
            layout : 'hbox',
            style  : 'background: #FFF; border-radius: 6px;'
        });

        var gridKeyList = Object.keys(this.topTabObj);
        for ( var ix = 0, ixLen = gridKeyList.length; ix < ixLen; ix++ ) {
            this.rankTabPanel.add(this.createCon( gridKeyList[ix], null, null, '10px 10px 10px 10px' ));
        }

        bottomCon.add(this.sqlGridStackChartCon, this.sqlLineChartCon);

        this.add( this.rankTabPanel, bottomCon );
        this.rankTabPanel.setActiveTab(0);

        this.createBottomDetailLayout();
    },


    createBottomDetailLayout: function() {
        /* init variable */
        var sqlHistoryTitleHeight = 30;
        var nonDBColVisible, nonDBColHide;

        if(!window.isIMXNonDB) {
            nonDBColVisible = true;
            nonDBColHide = false;
        } else {
            nonDBColVisible = false;
            nonDBColHide = true;
        }
        /* Bottom Left Layout */
        this.sqlIdField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('SQL'),
            itemId     : 'sqlId',
            width      : 515,
            height     : 30,
            margin     : '10 0 10 10',
            value      : '',
            labelAlign : 'left',
            labelStyle : 'padding : 0 5px 0 0; vertical-align: middle;',
            fieldStyle : 'padding : 5px 0 0 5px;',
            labelWidth : 35,
            regexText  : common.Util.TR('Please enter only numbers and alphabets'),
            enforceMaxLength: true,
            enableKeyEvents : true,
            listeners: {
                keydown: function( numField, e ) {
                    e.stopEvent();
                }
            }
        });

        this.rankSqlDetailGrid = Ext.create('Exem.BaseGrid', {
            width  : '100%',
            height : 170,
            margin : '12 0 10 6',
            gridName  : 'sqlRankAnalysisGrid',
            flex   : null,
            border : true,
            usePager : false,
            borderVisible : true,
            itemdblclick : function() {
                this.createBotDetailPopup();
            }.bind(this)
        });

        this.rankSqlDetailGrid.addCls('ranking-anaylsis-grid');

        this.rankSqlDetailGrid.beginAddColumns();
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Date')                , 'date'               , 80  , Grid.String   , true            , false);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Execution Count')     , 'sql_exec_count'     , 130 , Grid.Number   , true            , false);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Elapse Time (Total)') , 'total_elapse'       , 100 , Grid.Float    , true            , false);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Elapse Time (Ratio)') , 'elapsed_time_ratio' , 100 , Grid.Float    , false           , true);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Elapse Time (AVG)')   , 'avg_elapse'         , 80  , Grid.Float    , true            , false);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Elapse Time (MAX)')   , 'max_elapse'         , 80  , Grid.Float    , true            , false);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('CPU Time')            , 'cpu_time'           , 100 , Grid.Float   , nonDBColVisible , nonDBColHide);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Wait Time')           , 'wait_time'          , 100 , Grid.Float   , nonDBColVisible , nonDBColHide);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Logical Reads')       , 'logical_reads'      , 100 , Grid.Number   , nonDBColVisible , nonDBColHide);
        this.rankSqlDetailGrid.addColumn(common.Util.CTR('Physical Reads')      , 'physical_reads'     , 100 , Grid.Number   , nonDBColVisible , nonDBColHide);

        this.rankSqlDetailGrid.endAddColumns();

        this.rankSqlDetailGrid.loadLayout(this.rankSqlDetailGrid.gridName);

        this.sqlStackChart = Ext.create('Exem.chart.CanvasChartLayer', {
            title        : common.Util.TR('Elapse Time & Execute Count'),
            layout       : 'fit',
            height       : '50%',
            minHeight    : 70,
            width        : '100%',
            itemId       : 'rank-sql-stack-chart',
            interval     : PlotChart.time.exDay,
            showTitle    : true,
            showLegend   : true,
            showDayLine    : false,
            showHistoryInfo    : false,
            legendOrder  : PlotChart.legendOrder.exDesc,
            chartProperty  :{
                yaxes: [{
                    min : 0
                },{
                    position: 'right'
                }],
                timeformat : '%m-%d',
                mode : 'categories'
            },
            legendWidth   : 110,
            split         : false,
            showTooltip   : true,
            toolTipFormat : '[%s] [value:%y]',
            toolTipTimeFormat : '%m-%d',

            showMaxValue  : false,
            showIndicator : false,
            titleHeight   : 20,
            plotdblclick: function () {
                this.createBotDetailPopup();
            }.bind(this)
        });

        this.sqlStackChart.addSeries({
            id   : 'max_value',
            label : common.Util.CTR('MAX'),
            type : PlotChart.type.exBar
        });

        //Chart Series 추가.
        this.sqlStackChart.addSeries({
            id    : 'avg_value',
            label : common.Util.CTR('AVG'),
            type  : PlotChart.type.exBar
        });

        this.sqlStackChart.addSeries({
            id    : 'exec_count',
            label : common.Util.CTR('Execute Count'),
            point : true,
            type  : PlotChart.type.exLine,
            yaxis : 2
        });

        this.sqlGridStackChartCon.add(this.sqlIdField, this.rankSqlDetailGrid, this.sqlStackChart);


        /* Bottom Right Layout */

        var toggleWidth;
        if(Comm.lang === 'en') {
            toggleWidth = 85;
        } else if(Comm.lang === 'ko') {
            toggleWidth = 77;
        }

        this.timeFormatToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width      : toggleWidth,
            onText     : common.Util.CTR('10 Minute'),
            offText    : common.Util.CTR('1 Hour'),
            state      : false,
            listeners: {
                change: function() {
                    this.drawSqlDetailLineChart(this.rawData);
                }.bind(this)
            }
        });

        this.timeFormatContainer = Ext.create('Exem.Container', {
            width  : '100%',
            height : 25,
            layout : 'hbox',
            style  : 'margin : 5px 5px 0 0'
        });

        this.timeFormatContainer.add({xtype:'tbfill'}, this.timeFormatToggle);

        this.sqlExecuteChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('SQL Execution Count'),
            split  : true,
            height : '33%',
            interval           : PlotChart.time.exHour,
            minHeight          : 120,
            titleHeight        : sqlHistoryTitleHeight,
            showTitle          : true,
            showLegend         : true,
            showIndicator      : false,
            showTooltip        : true,
            showHistoryInfo    : false,
            xaxisCurrentToTime : true,
            onIndexValue       : true,
            legendWidth : 90,
            toolTipFormat      : '%x [value:%y] ',
            toolTipTimeFormat  : '%H:%M',
            chartProperty      : {
                yLabelWidth: 40,
                mode        : null
            },
            plotdblclick: function () {
                this.createBotDetailPopup();
            }.bind(this)
        });

        this.sqlMaxElapseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('SQL Elapse Time (MAX)'),
            split  : true,
            height : '33%',
            interval         : PlotChart.time.exHour,
            minHeight        : 120,
            titleHeight      : sqlHistoryTitleHeight,
            showTitle        : true,
            showLegend       : true,
            showIndicator    : false,
            showTooltip      : true,
            showHistoryInfo  : false,
            xaxisCurrentToTime           : true,
            onIndexValue                 : true ,
            legendWidth : 90,
            toolTipFormat    : '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            chartProperty      : {
                yLabelWidth: 40,
                mode        : null
            },
            plotdblclick: function () {
                this.createBotDetailPopup();
            }.bind(this)

        });


        this.sqlAvgElapseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('SQL Elapse Time (AVG)'),
            split  : true,
            height : '33%',
            interval         : PlotChart.time.exHour,
            minHeight        : 120,
            titleHeight      : sqlHistoryTitleHeight,
            showTitle        : true,
            showLegend       : true,
            showIndicator    : false,
            showTooltip      : true,
            showHistoryInfo  : false,
            xaxisCurrentToTime           : true,
            onIndexValue                 : true ,
            legendWidth : 90,
            toolTipFormat    : '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            chartProperty      : {
                yLabelWidth: 40,
                mode        : null

            },
            plotdblclick: function () {
                this.createBotDetailPopup();
            }.bind(this)

        });

        this.lineChartArr = [this.sqlExecuteChart, this.sqlMaxElapseChart, this.sqlAvgElapseChart];
        this.sqlLineChartCon.add(this.timeFormatContainer, this.sqlExecuteChart, this.sqlMaxElapseChart, this.sqlAvgElapseChart);

    },

    executeSQL: function(param) {
        if(!this.loadCompleted) {
            return;
        }

        var ix, ixLen;

        this.loadingMask.showMask();
        this.loadCompleted = false;


        this.clearAll();
        this.retrieveFlag    = param.retrieveFlag;
        this.viewTab = param.viewTab;
        this.agentList = param.agentList;
        this.topRecordValue = param.topRecordValue;
        this.gridDateList = param.gridDateList;
        this.baseGridIdx = param.baseGridIdx;
        this.baseConIdx = param.baseGridIdx == 0 ? 0 : 1;
        this.startTime = param.startTime;
        this.endTime = param.endTime;


        var conList = this.rankTabPanel.items.items;

        for ( ix = 0, ixLen = conList.length; ix < ixLen; ix++ ) {
            conList[ix].removeAll(false);
        }

        WS.sqlview(this.sql.topRankPanel, this.onSQLView.bind(this));
    },


    onSQLView: function(header, data) {

        switch( header.value ) {
            case this.sql.topRankPanel:
                this.execTopPanelGrid(data);
                break;
            case this.sql.botDetailPanel:
                this.execBotDetailPanel(data);
                break;
            default:
                break;
        }
    },

    /* create Instance SQL - Top Rank Panel */
    execTopPanelGrid: function(sqlTxt) {
        var topTabSqlObj = {
            'Elapse Time': {
                oriValueStr  : [
                    'round(sum(s.elapsed_time_sum) / case sum(s.execute_count_sum) when 0 then 1 else sum(s.execute_count_sum) end / 1000.0 , 3 ) sql_elapse_avg',
                    'round(cast(max(cast( s.elapsed_time_max as float ) ) / 1000.0 as numeric ), 3) sql_elapse_max'
                ],
                valuePerStr  : ['round( x.sql_elapse_avg / case t.total_sql_elapse_avg when 0 then 1 else t.total_sql_elapse_avg end * 100, 1 ) elapsed_time_per'],
                valueStr     : ['x.sql_elapse_avg', 'x.sql_elapse_max'],
                value        : ['sql_elapse_avg', 'sql_elapse_max'],
                totValueStr  : ['sum(sql_elapse_avg) total_sql_elapse_avg'],
                orderByCol   : ['sql_elapse_avg'],
                columnPerStr : ['elapsed_time_per']
            },
            'Execute Count': {
                oriValueStr  : ['sum( s.execute_count_sum ) sql_exec_count'],
                valuePerStr  : ['round( cast(x.sql_exec_count as numeric)  / case cast(t.total_sql_exec_count as numeric) when 0 then 1 else cast(t.total_sql_exec_count as numeric) end * 100 , 2 ) exec_count_per'],
                valueStr     : ['x.sql_exec_count'],
                value        : ['sql_exec_count'],
                totValueStr  : ['sum(sql_exec_count) total_sql_exec_count'],
                orderByCol   : ['sql_exec_count'],
                columnPerStr : ['exec_count_per']
            }
        };

        if(!window.isIMXNonDB) {
            topTabSqlObj['DB CPU'] = {
                oriValueStr  : ['round((sum(s.elapsed_time_sum) - sum(s.wait_time_sum)) / case cast(sum(s.execute_count_sum) as numeric) when 0 then 1 else cast(sum(s.execute_count_sum) as numeric) end / 1000.0 , 3) cpu_time'],
                valuePerStr  : ['round( x.cpu_time / case t.total_cpu_time when 0 then 1 else t.total_cpu_time end * 100, 1 ) cpu_time_per'],
                valueStr     : ['x.cpu_time'],
                value        : ['cpu_time'],
                totValueStr  : ['sum(cpu_time) total_cpu_time'],
                orderByCol   : ['cpu_time'],
                columnPerStr : ['cpu_time_per']
            };
            topTabSqlObj['Logical Reads'] = {
                oriValueStr  : ['sum( s.logical_reads_sum ) logical_reads'],
                valuePerStr  : ['round( cast(x.logical_reads as numeric) / case cast(t.total_logical_reads as numeric) when 0 then 1 else cast(t.total_logical_reads as numeric) end * 100, 1) logical_reads_per'],
                valueStr     : ['x.logical_reads'],
                value        : ['logical_reads'],
                totValueStr  : ['sum(logical_reads) total_logical_reads'],
                orderByCol   : ['logical_reads'],
                columnPerStr : ['logical_reads_per']
            };
            topTabSqlObj['Physical Reads'] = {
                oriValueStr  : ['sum( s.physical_reads_sum ) physical_reads'],
                valuePerStr  : ['round( cast(x.physical_reads as numeric) / case cast(t.total_physical_reads as numeric) when 0 then 1 else cast(t.total_physical_reads as numeric) end * 100, 1) physical_reads_per'],
                valueStr     : ['x.physical_reads'],
                value        : ['physical_reads'],
                totValueStr  : ['sum(physical_reads) total_physical_reads'],
                orderByCol   : ['physical_reads'],
                columnPerStr : ['physical_reads_per']
            };
        }


        if(Comm.currentRepositoryInfo.database_type == 'MSSQL') {
            topTabSqlObj['Elapse Time'].oriValueStr = [
                'sum(convert(float, s.elapsed_time_sum)) / convert(float, case sum(convert(float , s.execute_count_sum)) when 0 then 1 else sum(convert(float, s.execute_count_sum )) end ) / convert(float, 1000) sql_elapse_avg',
                'round(max(convert(float , s.elapsed_time_max ) ) / convert( float, 1000 ) , 3 ) sql_elapse_max'
            ];

            if(!window.isIMXNonDB) {
                topTabSqlObj['DB CPU'].oriValueStr = ['(sum(convert(float, s.elapsed_time_sum)) - sum(convert(float, s.wait_time_sum))) / convert(float, case sum(convert(float, s.execute_count_sum)) when 0 then 1 else sum(convert(float, s.execute_count_sum)) end ) / convert(float, 1000) cpu_time'];
            }
        }

        var ix, ixLen, jx, jxLen,
            resultSQL, fromTime, toTime,
            originTruncateFirstTableSQL,
            originTruncateSecondTableSQL,
            originDropFirstTableSQL,
            originDropSecondTableSQL,
            dataSet = {},
            tmpAgentList = '',
            orderbyStr = 'order by base.rank',
            tmpCnt = 0, tab = this.rankTabPanel.getActiveTab().itemId;

        var createFirstTableSQL    = '',
            createSecondTableSQL   = '',
            selectCompareStr       = '',
            selectCompareTableStr  = '',
            truncateFirstTableSQL  = '',
            truncateSecondTableSQL = '',
            dropFirstTableSQL      = '',
            dropSecondTableSQL     = '';

        var originCreateFirstTableSQL,
            originCreateSecondTableSQL,
            selectSQL,
            originSelectCompareSQL,
            originSelectCompareTableStr;

        for(ix=0, ixLen=this.agentList.length; ix<ixLen; ix++) {
            tmpAgentList += this.agentList[ix];
            tmpAgentList += ix < ixLen - 1 ? ',' : '';
        }

        var sqlObjKeys = Object.keys(topTabSqlObj[tab]);
        var sqlOriValueStr = '',
            sqlOriValuePerStr = '',
            sqlOrderByCol = '',
            sqlValueStr = '',
            sqlValue = '',
            sqlTotValueStr = '',
            sqlValuePerStr = '';

        for(ix=0, ixLen=sqlObjKeys.length; ix<ixLen; ix++) {
            for (jx = 0, jxLen = topTabSqlObj[tab][sqlObjKeys[ix]].length; jx < jxLen; jx++) {

                if (sqlObjKeys[ix] == 'oriValueStr') {
                    sqlOriValueStr += topTabSqlObj[tab][sqlObjKeys[ix]][jx];
                    sqlOriValueStr += jx < jxLen - 1 ? ' ,\n' : '';
                }

                if (sqlObjKeys[ix] == 'valuePerStr') {
                    sqlOriValuePerStr = topTabSqlObj[tab][sqlObjKeys[ix]][0];
                    break;
                }

                if (sqlObjKeys[ix] == 'orderByCol') {
                    sqlOrderByCol = topTabSqlObj[tab][sqlObjKeys[ix]][0];
                    break;
                }

                if (sqlObjKeys[ix] == 'valueStr') {
                    sqlValueStr += topTabSqlObj[tab][sqlObjKeys[ix]][jx];
                    sqlValueStr += jx < jxLen - 1 ? ' ,\n' : '';
                }

                if (sqlObjKeys[ix] == 'value') {
                    sqlValue += topTabSqlObj[tab][sqlObjKeys[ix]][jx];
                    sqlValue += jx < jxLen - 1 ? ' ,\n' : '';
                }

                if (sqlObjKeys[ix] == 'totValueStr') {
                    sqlTotValueStr = topTabSqlObj[tab][sqlObjKeys[ix]][0];
                    break;
                }

                if (sqlObjKeys[ix] == 'columnPerStr') {
                    sqlValuePerStr = topTabSqlObj[tab][sqlObjKeys[ix]][0];
                    break;
                }
            }
        }


        sqlTxt = sqlTxt.replace(/:wasId/gi, tmpAgentList);
        sqlTxt = sqlTxt.replace(/:tmpTableSeq/gi, common.Util.getUniqueSeq());
        sqlTxt = sqlTxt.replace(/:tabOriValueStr/gi, sqlOriValueStr);
        sqlTxt = sqlTxt.replace(/:tabValuePerStr/gi, sqlOriValuePerStr);
        sqlTxt = sqlTxt.replace(/:tabValueStr/gi, sqlValueStr);
        sqlTxt = sqlTxt.replace(/:tabValue/gi, sqlValue);
        sqlTxt = sqlTxt.replace(/:tabTotalValueStr/gi, sqlTotValueStr);
        sqlTxt = sqlTxt.replace(/:orderByCol/gi, sqlOrderByCol);
        sqlTxt = sqlTxt.replace(/:tabColumnPerStr/gi, sqlValuePerStr);
        sqlTxt = sqlTxt.replace(/:baseColumnStr/gi, sqlValue);

        var sqlTxtList = sqlTxt.split(';');
        var truncateIdx = 5;

        for ( ix = 0; ix < truncateIdx; ix++ ) {
            if ( !sqlTxtList[ix] ) {
                this.loadCompleted = true;
                this.loadingMask.hide();
                return;
            }
        }

        originCreateFirstTableSQL   = sqlTxtList[0];
        originCreateSecondTableSQL  = sqlTxtList[1];
        selectSQL                   = sqlTxtList[2];
        originSelectCompareSQL      = sqlTxtList[3];
        originSelectCompareTableStr = sqlTxtList[4];

        // 예외처리 ( Oracle 은 drop Table 전에 truncate 가 필요하다 )
        if ( sqlTxtList[truncateIdx+2] ) {
            originTruncateFirstTableSQL  = sqlTxtList[truncateIdx++];
            originTruncateSecondTableSQL = sqlTxtList[truncateIdx++];
            originDropFirstTableSQL      = sqlTxtList[truncateIdx++];
            originDropSecondTableSQL     = sqlTxtList[truncateIdx];
        } else {
            originDropFirstTableSQL  = sqlTxtList[truncateIdx++];
            originDropSecondTableSQL = sqlTxtList[truncateIdx];
        }

        for ( ix = 0, ixLen = this.gridDateList.length; ix < ixLen; ix++ ) {
            if ( ix == 0 ) {
                tmpCnt = this.baseGridIdx;
            } else {
                if ( tmpCnt == this.baseGridIdx ) {
                    tmpCnt++;
                }
            }

            fromTime = Ext.Date.format (new Date(this.gridDateList[tmpCnt][0]), 'Y-m-d') +' '+ this.startTime;
            toTime   = Ext.Date.format (new Date(this.gridDateList[tmpCnt][this.gridDateList[tmpCnt].length-1]),'Y-m-d') +' '+ this.endTime;

            createFirstTableSQL += originCreateFirstTableSQL.replace(/:tIdx/gi, tmpCnt);
            createFirstTableSQL = createFirstTableSQL.replace(/:fromTime/gi, '\''+fromTime+'\'');
            createFirstTableSQL = createFirstTableSQL.replace(/:toTime/gi, '\''+toTime+'\'');
            createFirstTableSQL = createFirstTableSQL.replace(/:limitCnt/gi, this.topRecordValue);

            if(this.viewTab == 0 || !this.checkUnconnectedDay(this.gridDateList[tmpCnt])) {
                createFirstTableSQL = createFirstTableSQL.replace(/:specificDate/gi, '');
            } else {
                createFirstTableSQL = createFirstTableSQL.replace(/:specificDate/gi,  this.setSpecificDate(tmpCnt));
            }


            createSecondTableSQL += originCreateSecondTableSQL.replace(/:tIdx/gi, tmpCnt);

            dropFirstTableSQL    += originDropFirstTableSQL.replace(/:tIdx/gi, tmpCnt);
            dropSecondTableSQL   += originDropSecondTableSQL.replace(/:tIdx/gi, tmpCnt);

            if ( originTruncateFirstTableSQL ) {
                truncateFirstTableSQL  += originTruncateFirstTableSQL.replace(/:tIdx/gi, tmpCnt) + ';\n';
                truncateSecondTableSQL += originTruncateSecondTableSQL.replace(/:tIdx/gi, tmpCnt) + ';\n';
            }

            if ( ix > 0 ) {
                var sqlTargetColumnStr = '',
                    sqlCompTargetStr = '',
                    sqlaCompStr = '',
                    sqlbCompStr = '';

                for(jx=0, jxLen=topTabSqlObj[tab].value.length; jx<jxLen; jx++) {
                    sqlTargetColumnStr += 't' + tmpCnt + '.target_' + topTabSqlObj[tab].value[jx];
                    sqlTargetColumnStr += jx < jxLen - 1 ? ' ,\n' : '';

                    sqlCompTargetStr += 'target_' + topTabSqlObj[tab].value[jx];
                    sqlCompTargetStr += jx < jxLen - 1 ? ' ,\n' : '';

                    sqlaCompStr += 'a.' + topTabSqlObj[tab].value[jx];
                    sqlaCompStr += jx < jxLen - 1 ? ' ,\n' : '';

                    sqlbCompStr += 'b.' + topTabSqlObj[tab].value[jx] + ' as target_' + topTabSqlObj[tab].value[jx];
                    sqlbCompStr += jx < jxLen - 1 ? ' ,\n' : '';
                }

                selectCompareStr      += originSelectCompareSQL.replace(/:targetColumnStr/gi, sqlTargetColumnStr);
                selectCompareStr      = selectCompareStr.replace(/:tIdx/gi, tmpCnt);

                selectCompareStr      += ix < ixLen - 1 ? ',\n' : '';

                selectCompareTableStr += originSelectCompareTableStr.replace(/:tIdx/gi, tmpCnt);

                selectCompareTableStr = selectCompareTableStr.replace(/:compTargetColumnStr/gi, sqlCompTargetStr);
                selectCompareTableStr = selectCompareTableStr.replace(/:aTabColumnStr/gi, sqlaCompStr);
                selectCompareTableStr = selectCompareTableStr.replace(/:bTabColumnStr/gi, sqlbCompStr);
                selectCompareTableStr = selectCompareTableStr.replace(/:limitCnt/gi, this.topRecordValue);

                orderbyStr            += ', t' + tmpCnt + '.target_rnk';
            }

            createFirstTableSQL  += ';\n';
            createSecondTableSQL += ';\n';
            dropFirstTableSQL    += ';\n';
            dropSecondTableSQL   += ';\n';

            tmpCnt++;

            if ( ix == 0 ) {
                tmpCnt = 0;
            }
        }

        selectSQL = selectSQL.replace(/:tIdx/gi, this.baseGridIdx);
        selectSQL = selectSQL.replace(/:limitCnt/gi, this.topRecordValue);
        selectSQL = selectSQL.replace(/:selectCompareStr/gi, selectCompareStr);
        selectSQL = selectSQL.replace(/:selectCompareTableStr/gi, selectCompareTableStr);

        if(Comm.currentRepositoryInfo.database_type != 'MSSQL') {
            selectSQL += orderbyStr;
        }

        resultSQL =
            '/* Ranking Analysis ( IMXPA_SqlRankingAnalysis_TopPanelGrid.sql ) */\n' +
            createFirstTableSQL +
            createSecondTableSQL +
            '\n-- SqlId별 순위 변동 추이 trend 확인\n' + selectSQL + ';\n' +
            truncateFirstTableSQL +
            truncateSecondTableSQL +
            dropFirstTableSQL +
            dropSecondTableSQL;

        dataSet.sql = resultSQL;
        dataSet.bind = [{
            name : 'kind',
            value: this.sql.topRankPanel,
            type : SQLBindType.STRING
        }];
        dataSet.sql_seq = this.sql.topRankPanel;
        dataSet.mssqlonecall = true;
        WS.SQLExec(dataSet, this.onSqlViewData, this);
    },

    checkUnconnectedDay: function(dateList) {
        var ix, ixLen,
            prevDate, currDate, result = false;

        for(ix=1, ixLen=dateList.length; ix<ixLen; ix++) {
            prevDate = new Date(dateList[ix-1]);
            currDate = new Date(dateList[ix]);

            if(Math.abs(currDate - prevDate) > 86400000) {
                result = true;
                break;
            }

        }

        return result;
    },

    setSpecificDate: function(idx) {
        var retDateSQL = '', specFromTime, specToTime;
        var ix, ixLen;

        retDateSQL += 'and (';

        for(ix=0, ixLen=this.gridDateList[idx].length; ix<ixLen; ix++) {

            specFromTime = Ext.Date.format (new Date(this.gridDateList[idx][ix]), 'Y-m-d') +' '+ this.startTime;
            specToTime = Ext.Date.format (new Date(this.gridDateList[idx][ix]), 'Y-m-d') +' '+ this.endTime;


            switch(Comm.currentRepositoryInfo.database_type) {
                case 'PostgreSQL' :
                    retDateSQL += '(time >=\'' + specFromTime + '\'::timestamp and time <=\'' + specToTime + '\'::timestamp' + ')';
                    break;
                case 'Oracle' :
                    retDateSQL += '(time >= to_timestamp(' + '\'' + specFromTime + '\', \'yyyy-mm-dd hh24:mi:ss\')' + 'and time <= to_timestamp(' + '\'' + specToTime + '\', \'yyyy-mm-dd hh24:mi:ss\'))';
                    break;
                case 'MSSQL' :
                    retDateSQL += '(time >= convert(datetime, \'' + specFromTime + '\' , 121) and time <= convert(datetime, \'' + specToTime + '\', 121))';
                    break;
                default :
                    break;
            }

            if(ix < ixLen - 1) {
                retDateSQL += ' or ';
            }
        }

        retDateSQL += ' )';

        return retDateSQL;
    },

    /* create Instance SQL - Bottom Detail Panel */
    execBotDetailPanel : function(sqlTxt) {
        var ix, ixLen;
        var resultSQL;
        var dataSet = {};
        var tmpSqlStr = '', tmpAgentList = '';

        var sqlTxtList = sqlTxt.split(';');

        var dayGrpSQL, hourGrpSQL, tenMinGrpSQL;
        var dayGrpStr, hourGrpStr, tenMinGrpStr;


        if(Comm.currentRepositoryInfo.database_type == 'MSSQL') {
            dayGrpStr    = 'convert( nvarchar(10), time, 121)';
            hourGrpStr   = 'convert( nvarchar(13), time, 121)';
            tenMinGrpStr = 'convert( nvarchar(16), time, 121)' + '+\''+':00'+'\'';
        } else {
            dayGrpStr    = 'to_char( time, ' + '\''+'YYYY-MM-DD'+'\'' + ')';
            hourGrpStr   = 'to_char( time, ' + '\''+'YYYY-MM-DD HH24'+'\'' + ')';
            tenMinGrpStr = 'to_char( time, ' + '\''+'YYYY-MM-DD HH24:MI:SS'+'\'' + ')';
        }

        var oriTmpSqlStr = sqlTxtList[0];
        for(ix=0, ixLen=this.agentList.length; ix<ixLen; ix++) {
            tmpAgentList += this.agentList[ix];
            tmpAgentList += ix < ixLen - 1 ? ',' : '';
        }

        oriTmpSqlStr = oriTmpSqlStr.replace(/:wasId/gi, tmpAgentList);
        oriTmpSqlStr = oriTmpSqlStr.replace(/:sql_id/gi, '\''+this.selectedSqlId+'\'');

        var dateList = this.viewTab == 0 ? this.gridDateList : this.gridDateList[this.selectedSectionIdx];

        for(ix=0, ixLen=dateList.length; ix<ixLen; ix++) {
            tmpSqlStr += this.makeBottomStr( dateList[ix], oriTmpSqlStr );

            if ( ixLen != 1 && ix != ixLen -1 ) {
                tmpSqlStr += '\nunion all\n\n';
            }
        }


        dayGrpSQL = tmpSqlStr;
        dayGrpSQL = dayGrpSQL.replace(/:timeFormat/gi, dayGrpStr);
        dayGrpSQL = 'select * from (\n' + dayGrpSQL + '\n) t \n order by sql_time';

        hourGrpSQL = tmpSqlStr;
        hourGrpSQL = hourGrpSQL.replace(/:timeFormat/gi, hourGrpStr);
        hourGrpSQL = 'select * from (\n' + hourGrpSQL + '\n) t \n order by sql_time';

        tenMinGrpSQL = tmpSqlStr;
        tenMinGrpSQL = tenMinGrpSQL.replace(/:timeFormat/gi, tenMinGrpStr);
        tenMinGrpSQL = 'select * from (\n' + tenMinGrpSQL + '\n) t\n order by sql_time';

        resultSQL =
            '/* Ranking Analysis - (IMXPA_SqlRankingAnalysis_BotDetailPanel.sql ) */\n' +
            dayGrpSQL + ';\n' + hourGrpSQL + ';\n' + tenMinGrpSQL + ';\n';

        dataSet.sql = resultSQL;
        dataSet.bind = [{
            name : 'kind',
            value: this.sql.botDetailPanel,
            type : SQLBindType.STRING
        }];
        dataSet.sql_seq = this.sql.botDetailPanel;
        dataSet.mssqlonecall = true;
        WS.SQLExec(dataSet, this.onSqlViewData, this);

    },


    /* create Instance SQL - Sub Function */
    makeBottomStr: function( gridDateList, originTxt ) {
        if ( !gridDateList || gridDateList.length == 0 ) {
            return '';
        }

        var sqlTxt   = '', fromTime, toTime;

        if(this.viewTab == 0) {
            fromTime = Ext.Date.format (new Date(gridDateList[0]), 'Y-m-d') +' '+ this.startTime;
            toTime   = Ext.Date.format (new Date(gridDateList[gridDateList.length-1]), 'Y-m-d') +' '+ this.endTime;

        } else {
            fromTime = Ext.Date.format (new Date(gridDateList), 'Y-m-d') +' '+ this.startTime;
            toTime   = Ext.Date.format (new Date(gridDateList), 'Y-m-d') +' '+ this.endTime;
        }

        sqlTxt += originTxt.replace(/:fromTime/gi, '\''+fromTime+'\'');
        sqlTxt = sqlTxt.replace(/:toTime/gi, '\''+toTime+'\'');

        return sqlTxt;
    },


    /* CallBack Retrieve Data Query */
    onSqlViewData: function( header, data ) {
        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('SQL Ranking Analysis - Dynamic Instance SQL Retrieve');
            console.debug(header);
            console.debug(data);
            this.loadCompleted = true;
            this.loadingMask.hide();
            return;
        }

        if ( header.parameters && header.parameters.bind && header.parameters.bind[0] ) {
            var type = header.parameters.bind[0].value;
        }

        this.rawData = data;

        switch(type) {
            case this.sql.topRankPanel:
                this.drawTopPanelGrid(this.rawData.rows);
                break;
            case this.sql.botDetailPanel:
                this.drawBotDetailPnl(this.rawData);
                break;
            default:
                break;
        }
    },

    drawTopPanelGrid: function(data) {
        //if ( !data || data.length == 0 ) {
        //    console.debug('Top Panel No Data');
        //    this.loadCompleted = true;
        //    this.loadingMask.hide();
        //    return;
        //}

        var ix, ixLen;
        var fillCount;
        var firstSectionData  = [];
        var secondSectionData = [];


        var tab = this.rankTabPanel.getActiveTab();
        var tabTitle = tab.itemId;
        var gridWidth = this.topTabObj[tabTitle].gridWidth+10;

        // Create Section Container
        if ( this.viewTab == 0 ) {
            if ( 0 == this.baseGridIdx ) {
                tab.add(this.createCon( tabTitle + 'BaseCon', gridWidth-50 ));
                tab.add(this.createCon( tabTitle + 'CompareCon', null, 1 ));
            } else {
                fillCount = this.baseGridIdx < 3 ? this.baseGridIdx : 3;

                if ( fillCount == 3 && this.baseGridIdx != this.gridDateList.length-1 ) {
                    fillCount--;
                }

                tab.add(this.createCon( tabTitle + 'CompareConLeft', gridWidth * fillCount ));
                tab.add(this.createCon( tabTitle + 'BaseCon', gridWidth-50 ));

                if ( this.baseGridIdx != this.gridDateList.length-1 ) {
                    tab.add(this.createCon( tabTitle + 'CompareConRight', null, 1 ));
                }
            }
        } else {
            tab.add(this.createCon( tabTitle + 'BaseCon', gridWidth * 2 - 90 ));
            tab.add(this.createCon( tabTitle + 'CompareCon', null, 1 ));
        }


        // Add Grid
        if ( this.viewTab == 0 ) {
            this.addTopPanelGrid(data);
        } else {
            for ( ix = 0, ixLen = data.length; ix < ixLen; ix++ ) {
                if ( ix < 10 ) {
                    firstSectionData.push(data[ix]);
                } else {
                    secondSectionData.push(data[ix]);
                }
            }

            this.addTopPanelGrid(firstSectionData);
            this.addTopPanelGrid(secondSectionData);
        }

        this.columnColorChange();
        this.paintselectedSqlId();


        WS.sqlview(this.sql.botDetailPanel, this.onSQLView.bind(this));
    },

    drawBotDetailPnl: function(data) {
        this.sqlIdField.setValue(this.selectedSqlName);

        this.drawSqlDetailGrid(data[0].rows);
        this.drawSqlDetailStackChart(data[0].rows);
        this.drawSqlDetailLineChart(data);

        this.loadCompleted = true;
        this.loadingMask.hide();
    },

    drawSqlDetailGrid: function(data) {
        var ix, ixLen,
            dataRows;


        this.rankSqlDetailGrid.clearRows();


        for(ix=0, ixLen=data.length; ix<ixLen; ix++) {
            dataRows = data[ix];

            this.rankSqlDetailGrid.addRow([
                 Ext.util.Format.date(dataRows[0], 'Y-m-d')     //date
                ,dataRows[1]     //sql_exec_count
                ,dataRows[2]     //total_elapse
                ,dataRows[3]     //elapse_time_ratio
                ,dataRows[4]     //avg_elapse
                ,dataRows[5]     //max_elapse
                ,dataRows[6]     //cpu_time
                ,dataRows[7]     //wait_time
                ,dataRows[8]     //logical_reads
                ,dataRows[9]     //physical_reads
            ]);
        }

        this.rankSqlDetailGrid.drawGrid();
    },

    drawSqlDetailStackChart: function(data) {

        var ix, ixLen;
        var row = [];
        var TOPsqlStore = [];
        var time = '' ;

        var max  = 0;
        var avg  = 0;
        var exec = 0;


        this.sqlStackChart.clearValues();

        for(ix=0, ixLen=data.length; ix<ixLen; ix++) {
            if( time !== data[ix][0] ) {
                if( time !== '' ) {
                    TOPsqlStore.push(row);
                    row = [];
                }

                avg  = data[ix][4];
                max  = data[ix][3];
                exec = data[ix][1];
                time = data[ix][0];
            } else {
                avg  += data[ix][4];
                max  += data[ix][3];
                exec += data[ix][1];
            }

            row[0] = data[ix][0];
            row[1] = avg;
            row[2] = max;
            row[3] = exec;
        }

        if(row.length) {
            TOPsqlStore.push(row);
        }

        for(ix=0, ixLen=TOPsqlStore.length; ix<ixLen; ix++) {
            var xaxis = Ext.util.Format.date(TOPsqlStore[ix][0], 'm-d');

            this.sqlStackChart.addValue(0, [xaxis, TOPsqlStore[ix][2]]);
            this.sqlStackChart.addValue(1, [xaxis, TOPsqlStore[ix][1]]);
            this.sqlStackChart.addValue(2, [xaxis, TOPsqlStore[ix][3]]);
        }

        this.sqlStackChart.plotDraw();
    },

    drawSqlDetailLineChart: function(data) {

        var ix, ixLen, jx, jxLen, kx, kxLen,
            timeMode, tmpTime, pointSizeOp,
            curTimeInvterval, chartData, dataIdx, dayData;

        var tmpChartDataArr = [];
        dayData = data[0].rows;


        if(this.timeFormatToggle.state) {
            curTimeInvterval = PlotChart.time.exTenMin;
            chartData = data[2].rows;
            timeMode = this.timeFormatToggle.state;
            pointSizeOp = 1;
        } else {
            curTimeInvterval = PlotChart.time.exHour;
            chartData = data[1].rows;
            timeMode = this.timeFormatToggle.state;
            pointSizeOp = 3;
        }

        for(ix=0,ixLen=this.lineChartArr.length; ix<ixLen; ix++) {

            this.lineChartArr[ix].removeAllSeries();
            this.lineChartArr[ix].clearValues();
            this.lineChartArr[ix].interval = curTimeInvterval;
            this.lineChartArr[ix]._chartOption.xaxis.timeformat = '%H';

            switch(ix) {
                case 0 :
                    dataIdx = 1;
                    break;
                case 1 :
                    dataIdx = 5;
                    break;
                case 2 :
                    dataIdx = 4;
                    break;
                default : break;
            }

            for(jx=0, jxLen=dayData.length; jx<jxLen; jx++) {
                this.lineChartArr[ix].addSeries({
                        id    : 'series_id_' + dayData[jx][0],
                        label : Ext.util.Format.date(dayData[jx][0], 'm-d'),
                        type  : PlotChart.type.exLine,
                        point : true,
                        pointSize : pointSizeOp
                    });
            }

            for(jx=0, jxLen=dayData.length; jx<jxLen; jx++) {
                tmpChartDataArr[jx] = [];
                for(kx=0, kxLen=chartData.length; kx<kxLen; kx++) {
                    if(dayData[jx][0] == chartData[kx][0].substr(0, 10)) {
                        tmpTime = timeMode ? chartData[kx][0] : chartData[kx][0] + ':00';
                        tmpChartDataArr[jx].push([tmpTime, chartData[kx][dataIdx]]);
                    }
                }

                this.lineChartArr[ix].addIndexValues([{
                    from : dayData[jx][0] + ' ' + this.startTime,
                    to   : dayData[jx][0] + ' ' + this.endTime,
                    interval :  curTimeInvterval,
                    time : 0,
                    data : tmpChartDataArr[jx],
                    series : jx
                }]);
            }

            this.lineChartArr[ix].plotDraw();
        }

        tmpChartDataArr.length = 0;
        tmpChartDataArr = null;
        dayData = null;
        chartData = null;
    },

    /* Bottom SQL Detail DBLclick Sub Function  */
    createBotDetailPopup: function() {
        var ix, ixLen,
            detailData, dataRows, timeMode, timeData;

        timeMode = this.timeFormatToggle.state;
        detailData = timeMode ? this.rawData[2] : this.rawData[1];

        var grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            height: '100%',
            width: '100%',
            defaultPageSize: 60,
            cls : 'Exem-BaseGrid Exem-CanvasChart-OpenHistoryInfo'
        });


        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Time')                       , 'time'           , 110 , Grid.String   , true , false);
        grid.addColumn(common.Util.CTR('Elapse Time (MAX)')          , 'max_elapse'     , 100 , Grid.Float    , true , false);
        grid.addColumn(common.Util.CTR('Elapse Time (AVG)')          , 'avg_elapse'     , 100 , Grid.Float    , true , false);
        grid.addColumn(common.Util.CTR('Execution Count')            , 'sql_exec_count' , 130 , Grid.Number   , true , false);
        grid.endAddColumns();


        for(ix=0, ixLen=detailData.rows.length; ix<ixLen; ix++) {
            dataRows = detailData.rows[ix];
            timeData = timeMode ? dataRows[0] : dataRows[0] + ':00:00';
            grid.addRow([
                 Ext.util.Format.date(timeData, 'Y-m-d H:i') //date
                ,dataRows[5]        //max_elapse
                ,dataRows[4]        //avg_elapse
                ,dataRows[1]        //sql_exec_count
            ]);
        }



        Ext.create('Exem.XMWindow',{
            title: common.Util.TR('Elapse Time & Execute Count'),
            width: 480,
            height: 430,
            layout: 'fit',
            items: grid,
            minWidth: 350,
            minHeight : 250
        }).show();

        grid.drawGrid();


        grid = null;
    },


    /* Top Rank Panel Sub Function */
    createCon: function( id, width, flex, padding ) {
        if ( flex ) {
            return Ext.create('Ext.container.Container', {
                height    : '100%',
                flex      : flex,
                layout    : 'hbox',
                title     : common.Util.TR(id),
                itemId    : id,
                padding   : padding || 0,
                cls       : 'rank-analysis-topgridpnl',
                autoScroll: true
            });
        } else {
            return Ext.create('Ext.container.Container', {
                width     : width || '100%',
                height    : '100%',
                layout    : 'hbox',
                title     : common.Util.TR(id),
                itemId    : id,
                padding   : padding || 0,
                cls       : 'rank-analysis-topgridpnl',
                autoScroll: true
            });
        }

    },

    addTopPanelGrid: function(data) {
        var ix, ixLen, jx, jxLen;
        var tab = this.rankTabPanel.getActiveTab();
        var tabId = this.rankTabPanel.getActiveTab().itemId;
        var conSectionList = tab.items.items;
        var grid;
        var arrGrid = [];
        var dataCount;
        var compareGridRankIdx = 1;

        for ( ix = 0, ixLen = this.gridDateList.length; ix < ixLen; ix++ ) {
            if ( ix > this.baseGridIdx ) {
                compareGridRankIdx = (tabId == 'Elapse Time') ? (ix*7) -1 : (ix*6) -1;
            } else {
                compareGridRankIdx = (tabId == 'Elapse Time') ? ((ix+1)*7) -1 : ((ix+1)*6) -1;
            }

            grid = this.createTopGrid( ix, this.gridDateList[ix]);
            dataCount = 0;

            if ( ix == this.baseGridIdx ) {
                for ( jx = 0, jxLen = data.length; jx < jxLen; jx++ ) {
                    if ( !data[jx][0] && data[jx][0] < 1 ) {
                        continue;
                    }

                    dataCount++;
                    if(tabId == 'Elapse Time') {
                        grid.addRow([
                            data[jx][0]   // rank
                            , data[jx][1]   // sql_text
                            , data[jx][2]   // sql_id
                            , data[jx][3]   // tabValuePer
                            , data[jx][4]   // value_0
                            , data[jx][5]   // value_1
                            , ix            // gridIdx
                        ]);
                    } else {
                        grid.addRow([
                            data[jx][0]     // rank
                            , data[jx][1]   // txn_name
                            , data[jx][2]   // txn_id
                            , data[jx][3]   // tabValuePer
                            , data[jx][4]   // tabValue
                            , ix            // gridIdx
                        ]);
                    }

                }
            } else {
                for ( jx = 0, jxLen = data.length; jx < jxLen; jx++ ) {
                    if ( !data[jx][compareGridRankIdx] && data[jx][compareGridRankIdx] < 1 ) {
                        continue;
                    }

                    dataCount++;

                    if(tabId == 'Elapse Time') {
                        grid.addRow([
                            data[jx][compareGridRankIdx]        // rank
                            , data[jx][compareGridRankIdx + 1]  // sql_text
                            , data[jx][compareGridRankIdx + 2]  // sql_id
                            , data[jx][compareGridRankIdx + 3]  // flag
                            , data[jx][compareGridRankIdx + 4]  // tabValuePer
                            , data[jx][compareGridRankIdx + 5]  // value_0
                            , data[jx][compareGridRankIdx + 6]  // value_1
                            , ix                                // gridIdx
                        ]);
                    } else {
                        grid.addRow([
                            data[jx][compareGridRankIdx]        // rank
                            , data[jx][compareGridRankIdx + 1]  // txn_name
                            , data[jx][compareGridRankIdx + 2]  // txn_id
                            , data[jx][compareGridRankIdx + 3]  // flag
                            , data[jx][compareGridRankIdx + 4]  // tabValuePer
                            , data[jx][compareGridRankIdx + 5]  // tabValue
                            , ix                                // gridIdx
                        ]);
                    }

                }
            }

            arrGrid.push(grid);
            //if (!dataCount) {
            //    continue;
            //}

            this.topTabObj[tab.itemId].gridList.push(grid);

            if ( this.viewTab == 0 ) {
                if ( 0 == this.baseGridIdx ) {
                    if ( ix == 0 ) {
                        conSectionList[0].add(grid);
                    } else {
                        conSectionList[1].add(grid);
                    }
                } else {
                    if ( ix < this.baseGridIdx ) {
                        conSectionList[0].add(grid);
                    } else if ( ix == this.baseGridIdx ) {
                        conSectionList[1].add(grid);
                    } else {
                        conSectionList[2].add(grid);
                    }
                }
            } else {
                if ( ix == 0 ) {
                    conSectionList[0].add(grid);
                } else {
                    conSectionList[1].add(grid);
                }
            }

            grid.drawGrid();
            grid.el.dom.style.cursor = 'pointer';
        }

        if(!arrGrid[this.baseGridIdx].pnlExGrid.getStore().getCount()) {
            for(ix=0, ixLen=arrGrid.length; ix<ixLen; ix++) {
                arrGrid[ix].setOrderAct('rank', 'ASC');
            }
        }

        arrGrid.length = 0;
        this.topTabFlag[tab.itemId] = true;
    },

    columnColorChange: function() {
        var conList = this.rankTabPanel.getActiveTab().items.items;
        var tab = this.rankTabPanel.getActiveTab().itemId;
        var ix, ixLen, jx, jxLen;
        var cls;
        var gridList;
        var headerCt;
        var colObj = {};

        for ( ix = 0, ixLen = conList.length; ix < ixLen; ix++ ) {
            gridList = conList[ix].items.items;

            for ( jx = 0, jxLen = gridList.length; jx < jxLen; jx++ ) {
                headerCt = gridList[jx].pnlExGrid.headerCt;

                colObj.rankCol        = headerCt.down('[dataIndex=rank]');
                colObj.sqlIdCol       = headerCt.down('[dataIndex=sqlText]');
                colObj.tabValuePerCol = headerCt.down('[dataIndex=tabValuePer]');

                if(tab == 'Elapse Time') {
                    colObj.value_0    = headerCt.down('[dataIndex=value_0]');
                    colObj.value_1    = headerCt.down('[dataIndex=value_1]');
                }
                else {
                    colObj.value_0    = headerCt.down('[dataIndex=value_0]');
                }

                if ( (this.viewTab == 0 && ix == this.baseConIdx) || (this.viewTab == 1 && ix == 0)  ) {
                    cls = 'x-grid-base-col';
                } else {
                    cls = 'x-grid-compare-col';

                    colObj.diffCol = headerCt.down('[dataIndex=diff]');
                    colObj.diffCol.addCls(cls);
                }

                colObj.rankCol.addCls(cls);
                colObj.sqlIdCol.addCls(cls);
                colObj.tabValuePerCol.addCls(cls);

                if(tab == 'Elapse Time') {
                    colObj.value_0.addCls(cls);
                    colObj.value_1.addCls(cls);
                }
                else {
                    colObj.value_0.addCls(cls);
                }
            }
        }
    },

    paintselectedSqlId: function() {
        var grid, compareCon, findSqlId = false;
        var ix, ixLen, jx, jxLen;
        var rowIdx;
        var conList = this.rankTabPanel.getActiveTab().items.items;
        var gridList;


        if(!this.selectedSqlId) {
            grid = this.rankTabPanel.getActiveTab().items.items[this.baseConIdx].items.items[0];

            if ( grid && grid.pnlExGrid.getStore().getCount() && grid.pnlExGrid.getStore().getAt(0) ) {
                this.selectedSqlId = grid.pnlExGrid.getStore().getAt(0).data.sqlId;
                this.selectedSqlName = grid.pnlExGrid.getStore().getAt(0).data.sqlText;
                grid.pnlExGrid.getView().getSelectionModel().select(0);
                grid.drawGrid();
            }
            else {

                for(ix=0, ixLen=this.rankTabPanel.getActiveTab().items.items.length; ix<ixLen; ix++) {
                    if(ix == this.baseConIdx) {
                        continue;
                    }

                    compareCon = this.rankTabPanel.getActiveTab().items.items[ix];
                    for(jx=0, jxLen=compareCon.items.items.length; jx<jxLen; jx++) {
                        grid = compareCon.items.items[jx];

                        if(grid && grid.pnlExGrid.getStore().getCount() && grid.pnlExGrid.getStore().getAt(0)) {
                            this.selectedSqlId = grid.pnlExGrid.getStore().getAt(0).data.sqlId;
                            this.selectedSqlName = grid.pnlExGrid.getStore().getAt(0).data.sqlText;
                            grid.pnlExGrid.getView().getSelectionModel().select(0);
                            grid.drawGrid();
                            findSqlId = true;
                            break;
                        }
                    }

                    if(findSqlId) {
                        break;
                    }
                }
            }
        }

        for ( ix = conList.length-1, ixLen = 0; ix >= ixLen; ix-- ) {
            gridList = conList[ix].items.items;

            for ( jx = gridList.length-1, jxLen = 0; jx >= jxLen; jx-- ) {
                rowIdx = gridList[jx].pnlExGrid.getStore().find('sqlId', this.selectedSqlId);

                if (rowIdx > -1) {
                    gridList[jx].pnlExGrid.getView().getSelectionModel().select(rowIdx);
                } else {
                    gridList[jx].pnlExGrid.getView().getSelectionModel().deselectAll();
                }

                gridList[jx].drawGrid();
            }
        }
    },

    createTopGrid: function( gridIdx, gridDateList ) {
        var tab = this.rankTabPanel.getActiveTab().itemId;
        var dateLabel = gridDateList[0];
        var isBaseGrid = gridIdx == this.baseGridIdx;
        var arrColValue;

        if ( gridDateList.length > 1 ) {
            dateLabel += ' ~ ' + gridDateList[gridDateList.length-1];
        }

        var grid = Ext.create('Exem.BaseGrid', {
            width  : this.topTabObj[tab].gridWidth - (isBaseGrid ? 50 : 0),
            height : 261,
            margin : '12 0 0 6',
            flex   : null,
            border : true,
            usePager : false,
            useEmptyText : true,
            emptyTextMsg : common.Util.TR('No data to display'),
            borderVisible : true,
            itemclick : function(dv, record) {
                if(!this.loadCompleted) {
                    return;
                }

                this.loadingMask.showMask();
                this.loadCompleted = false;

                this.selectedSqlId      = record.data['sqlId'];
                this.selectedSqlName    = record.data['sqlText'];
                this.selectedSectionIdx = record.data['gridIdx'];

                this.paintselectedSqlId();
                WS.sqlview(this.sql.botDetailPanel, this.onSQLView.bind(this));
            }.bind(this)
        });

        grid.beginAddColumns();
        grid.addColumn(common.Util.TR('Rank'), 'rank'    , 60  , Grid.StringNumber , true, false);
        grid.addColumn(dateLabel             , 'sqlText' , 120 , Grid.String       , true, false);
        grid.addColumn('SQL ID'              , 'sqlId'   , 0   , Grid.String       , false, true);

        if ( !isBaseGrid ) {
            grid.addColumn(common.Util.TR('Diff'), 'diff', 50, Grid.String , true, false);
            grid.addRenderer('diff', this.gridColumnRender.bind(this) );
        }

        grid.addColumn(common.Util.TR(this.topTabObj[tab]['label']), 'tabValuePer' , this.topTabObj[tab]['columnWidth'] , Grid.Float , true, false);
        if (tab == 'Elapse Time') {
            grid.addColumn(common.Util.TR(this.topTabObj[tab]['colValue'][0]) , 'value_0'  , 74 , this.topTabObj[tab]['colType'], true, false);
            grid.addColumn(common.Util.TR(this.topTabObj[tab]['colValue'][1]) , 'value_1'  , 74 , this.topTabObj[tab]['colType'], true, false);
        } else {
            grid.addColumn(common.Util.TR(this.topTabObj[tab]['colValue'][0]) , 'value_0'  , 74 , this.topTabObj[tab]['colType'], true, false);
        }

        grid.addColumn('Grid Idx', 'gridIdx'     , 0    , Grid.Number, false, true);
        grid.endAddColumns();

        arrColValue = tab == 'Elapse Time' ? ['rank', 'sqlText', 'value_0', 'value_1'] : ['rank', 'sqlText', 'value_0'];

        grid.addRenderer( arrColValue, this.gridColumnRender.bind(this)  );
        grid.addRenderer( [ 'tabValuePer' ], this.gridColumnRender.bind(this)  , RendererType.bar );


        grid.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            itemId : 'exec_mnu_full_sql',
            target : self,
            fn: function() {
                var record = this.up().record;
                var sql_id = record['sqlId'];
                var full_sql_view = Ext.create('Exem.FullSQLTextWindow');

                self.full_sql_view = full_sql_view;
                self.full_sql_view.getFullSQLText(sql_id);
                self.full_sql_view.show();
            }
        }, 0);

        grid.showEmptyText();

        return grid;
    },

    gridColumnRender : function( value, meta ) {
        this.metaColorChange(meta);

        var baseStyle   = 'width:100%; height:13px; text-align:center;';


        if ( meta.column.dataIndex == 'rank' ) {
            meta.style  += 'text-align:center;';
        }
        else if ( meta.column.dataIndex == 'diff' ) {
            if ( value == 'NEW' ) {
                return '<div style="' + baseStyle + 'padding-top: 1px; ' + '">' +
                    '<div class="new-animation first-label">N</div>' +
                    '<div class="new-animation second-label">E</div>' +
                    '<div class="new-animation third-label">W</div>' +
                    '</div>';
            } else if ( value > 0 ) {
                return '<div style="' + baseStyle + ' padding-top:1px; ' + '">' +
                    '<div class="plus-diff"></div>' +
                    '<div style="display: inline-block; color:#FF0000; margin-top:1px; margin-left:1px;vertical-align: top;">' + value + '</div>' +
                    '</div>';
            } else if ( value < 0 ) {
                return '<div style="' + baseStyle + ' padding-top:1px; ' + '">' +
                    '<div class="minus-diff"></div>' +
                    '<div style="display: inline-block; color:#338bff; margin-top:1px;margin-left:1px; vertical-align: top;">' + Math.abs(value) + '</div>' +
                    '</div>';
            } else {
                return '<div style="' + baseStyle + '">' + value + '</div>';
            }
        }
        else if ( meta.column.dataIndex == 'tabValuePer' ) {
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div style="float:left; background-color:#5898E9; height:100%; width:'+ value +'%;"></div>' +
                '<div data-qtip="' + value + '%'+'" style="position:absolute;width:100%;height:100%;text-align:center;">' + common.Util.toFixed(value, 1) + '%</div>' +
                '</div>';
        }
        else if ( meta.column.dataIndex == 'value_0' || meta.column.dataIndex == 'value_1' ) {
            if ( meta.column.colType == Grid.Number ) {
                value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else if ( meta.column.colType == Grid.Float ) {
                value = common.Util.toFixed(value,Grid.DecimalPrecision);
            }

            meta.tdAttr = 'data-qtip="' + value + '"';
        }

        return value;
    },

    metaColorChange: function(meta) {
        if ( this.selectedSqlId && this.selectedSqlId == meta.record.data.sqlId ) {
            meta.style  += 'background:#F1F2BC;';
        }
    }

});