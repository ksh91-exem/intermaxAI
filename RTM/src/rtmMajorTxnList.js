Ext.define('rtm.src.rtmMajorTxnList', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Major Transaction Elapse Time Statistics'),
    layout: 'fit',
    width : '100%',
    height: '100%',
    isClosedDockForm: false,
    sql: {
        majorTxnListTrace : 'IMXRT_MajorTxnList_Trace.sql'
    },

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();
        }
    },

    init: function() {

        this.initLayout();

        this.createTooltip();

        this.frameRefresh();

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
            cls: 'rtm-majortxn-base'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 5 5 5'
        });

        this.datePicker = Ext.create('Exem.DatePicker', {
            width : 110,
            label : common.Util.TR('Date'),
            DisplayTime: DisplayTimeMode.None,
            cls: 'Exem-DatePicker',
            useRetriveBtn: true,
            singleField: true,
            comparisionMode:true,
            setRightCalPos:  true,
            isRtmTxnList : true,
            retriveClick: function(){
                this.frameRefresh();
            }.bind(this)
        });


        var comp_date = new Date();
        comp_date.setDate(comp_date.getDate() -1);
        comp_date = Ext.Date.format( comp_date, Comm.dateFormat.NONE);
        this.datePicker.mainFromField.setValue(comp_date);

        this.btn_retrieve = Ext.create('Exem.Button', {
            //            text   : 'Refresh',
            text   : common.Util.TR('Retrieve'),
            itemId : 'btn_retrieve',
            cls       : 'button3d',
            height  : 22,
            margin : '0 10 0 10',
            listeners: {
                click : function(){
                    this.frameRefresh();
                }.bind(this)
            }
        });


        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : common.Util.TR('Major Transaction Elapse Time Statistics')
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill'}, this.datePicker, this.btn_retrieve]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid(this.centerArea);

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
        }
    },


    /**
     * Grid 생성
     */
    createGrid: function (target) {
        this.majorTxnGrid = Ext.create('Exem.BaseGrid', {
            gridName     : 'intermax_rtm_majortxn',
            layout       : 'fit',
            usePager     : false,
            autoScroll   : false,
            borderVisible: true,
            localeType   : 'H:i:s',
            columnLines  : true,
            baseGridCls  : 'baseGridRTM',
            exportFileName: this.title,
            style: {
                'overflow-x': 'hidden'
            }
        });

        this.majorTxnGrid.beginAddColumns();
        this.majorTxnGrid.addColumn(common.Util.CTR('Transaction Name'),    'txninfo',      75,  Grid.String, true,  false);
        this.majorTxnGrid.addColumn(common.Util.CTR('Comparison(sec)'),     'comparison',   95,  Grid.StringNumber,  true, false);
        this.majorTxnGrid.addColumn(common.Util.CTR('Recently(sec)'),       'recent',       95,  Grid.StringNumber,  true,  false);
        this.majorTxnGrid.addColumn(common.Util.CTR('Increase Rate'),       'percentage',   95,  Grid.Number, true, false);
        this.majorTxnGrid.endAddColumns();

        this.majorTxnGrid.addRenderer('percentage', this.gridBarRenderer.bind(this), RendererType.bar);

        target.add(this.majorTxnGrid);

        this.majorTxnGrid._columnsList[0].minWidth = 150;
        this.majorTxnGrid._columnsList[0].flex = 1;

    },


    /**
     * 그리드에 보여지는 막대 그래프 설정.
     */
    gridBarRenderer: function(value) {
        var htmlStr =
            '<div class="percentage-change" style="height:100%; width: 100%;">';


        if (typeof(value) == '0') {
            htmlStr +=
                '<span class="percent-value">0% </span>' +
                '<span class="percent-pointer-equal"></span>' +
                '</div>';
        } else {
            var absVal = Math.abs(value);
            htmlStr += '<span class="percent-value">' + absVal + '% </span>';

            if (value > 0) {
                htmlStr +=
                    '<span class="percent-pointer-up"></span>' +
                    '</div>';
            } else if (value < 0) {
                htmlStr +=
                    '<span class="percent-pointer-down"></span>' +
                    '</div>';
            } else {
                htmlStr +=
                    '<span class="percent-pointer-equal"></span>' +
                    '</div>';
            }
        }

        return htmlStr;
    },


    /**
     * 그리드 바에 마우스 오버시 표시되는 툴팁 레이아웃 생성.
     */
    createTooltip: function() {
        this.removeTooltip();

        this.majorTxnTooltip = $('<div class="majortxn-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 100000,
            'color': '#000',
            'background-color': '#fff',
            'padding': '8px 8px 8px 10px',
            'border': '1px solid #D8D8D8',
            'border-radius': '4px',
            'max-width': '500px'
        });

        this.majorTxnTooltip.prepend('<div class="elapsetime" style="margin-bottom:2px;border-bottom: 1px solid #D2D2D2;"></div>');
        var $valueArea = $('<div style="float:left;margin-left: 3px;"></div>');

        this.majorTxnTooltip.append($valueArea);

        $valueArea.append('<div class="sqltext" style="margin-bottom: 1px;"></div>');

        $('body').append(this.majorTxnTooltip);
    },


    /**
     * 툴팁 삭제.
     */
    removeTooltip: function() {
        if (this.majorTxnTooltip) {
            this.majorTxnTooltip.remove();
            this.majorTxnTooltip = null;
        }
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
     * 새로고침 간격 (1분)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        if (Comm.rtmShow || this.floatingLayer) {
            this.executeSQL();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), PlotChart.time.exMin);

    },



    /**
     * 증감율 조회
     */
    executeSQL: function(){
        var dataSet = {};

        var date = new Date();
        date =  Ext.util.Format.date(date, 'Y-m-d H:i:s');
        dataSet.sql_file = this.sql.majorTxnListTrace;

        dataSet.bind = [{
            name : 'current_time',
            type : SQLBindType.STRING,
            value: date
        },{
            name : 'from_time',
            type : SQLBindType.STRING,
            value :  Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d') + ' 08:00:00'
        },{
            name : 'to_time',
            type : SQLBindType.STRING,
            value :  Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d') + ' 18:00:00'
            //value: this.datePicker.getFromDateTime() + ' 18:00:00'
        },{
            name : 'user_id',
            type : SQLBindType.INTEGER,
            value: Comm.web_env_info['user_id']
        }];

        WS.SQLExec(dataSet, this.onMajorTxnListTraceData, this);
    },


    onMajorTxnListTraceData: function(header, data){
        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('BusinessTxnSummary-onBusinessSummaryData');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.majorTxnGrid.clearRows();

        var curVal, cmpVal, ratio, txnName,
            currentData = data[0].rows,
            prevData = data[1].rows,
            ix, ixLen, jx, jxLen;


        for (ix = 0, ixLen = currentData.length; ix < ixLen; ix++) {
            txnName = currentData[ix][0];

            for(jx = 0, jxLen = prevData.length; jx < jxLen; jx++){
                if(txnName == prevData[jx][0]){
                    break;
                }
            }

            if(currentData[ix][1] && prevData[jx][1]) {
                ratio = Math.round((currentData[ix][1] - prevData[jx][1]) / prevData[jx][1] * 100);
                cmpVal = prevData[jx][1];
                curVal = currentData[ix][1];
            } else {
                if(prevData[jx][1]) {
                    cmpVal = prevData[jx][1];
                } else {
                    cmpVal = 'NoData';
                }

                if(currentData[ix][1]) {
                    curVal = currentData[ix][1];
                } else {
                    curVal = 'NoData';
                }

                ratio = '0';
            }

            this.majorTxnGrid.addRow([
                txnName,          // Transaction Name
                cmpVal,          // Comparison  Time
                curVal,          // Current Time
                ratio
            ]);

        }

        this.majorTxnGrid.drawGrid();

        data = null;
    }
});
