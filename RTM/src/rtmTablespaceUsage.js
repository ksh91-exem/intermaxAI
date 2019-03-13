Ext.define('rtm.src.rtmTablespaceUsage', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Tablespace Usage'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;
        }
    },

    init: function() {

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.initLayout();

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
            cls   : 'rtm-tablespace-base'
        });

        //상단 title 과 toggle 버튼이 붙는 영역
        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '10 0 0 0'
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            flex   : 1,
            layout :'fit'
        });

        // DB 목록
        this.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width: 150,
            margin: '0 0 0 20',
            listeners: {
                scope: this,
                select: function() {
                    this.tablespaceQuery();
                }
            }
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '0 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        // frame Title 영역
        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            flex   : 1,
            cls    : 'header-title',
            text   : common.Util.CTR('Tablespace Usage')
        });

        // 그리드 영역
        this.gridFrame = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            margin : '5 10 10 10'
        });

        this.topContentsArea.add([this.frameTitle, this.searchNameCombo, this.expendIcon]);

        this.centerArea.add(this.gridFrame);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid(this.gridFrame);        // 그리드 생성

        this.add(this.background);

        // 테이블스페이스 정보를 보여줄 DB 목록 가져오기
        if (!Comm.tablespaceDB) {
            common.DataModule.getTablespaceDBList(function() {
                this.addComboList();

                this.frameRefresh();
            }.bind(this));
        } else {
            this.addComboList();
        }

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * Grid 생성
     */
    createGrid: function (target) {
        this.toptxnGrid = Ext.create('Exem.BaseGrid', {
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

        this.toptxnGrid.beginAddColumns();
        this.toptxnGrid.addColumn(common.Util.CTR('Name'),            'name',      75,  Grid.String, true,  false);
        this.toptxnGrid.addColumn(common.Util.CTR('Total'),           'total',     95,  Grid.Number, false, false);
        this.toptxnGrid.addColumn(common.Util.CTR('Size (MB)'),       'size',      90,  Grid.Number, true,  false);
        this.toptxnGrid.addColumn(common.Util.CTR('Size (%)'),        'percent',   90,  Grid.Float,  true,  false);
        this.toptxnGrid.endAddColumns();
        target.add(this.toptxnGrid);

        this.toptxnGrid._columnsList[0].flex     = 1;
        this.toptxnGrid._columnsList[0].minWidth = 80;
        this.toptxnGrid.addRenderer('percent', this.gridBarRenderer.bind(this));

        this.toptxnGrid._columnsList[3].on({
            scope: this,
            resize: function() {
                this.progressFillWidth = $('#'+this.id+' .progress-bar').width();
                if (this.progressFillWidth) {
                    $('#'+this.id+' .progress-fill-text').css('width', this.progressFillWidth);
                }
            }
        });
    },


    /**
     * 그리드에 보여지는 막대 그래프 설정.
     */
    gridBarRenderer: function(value) {
        var htmlStr;
        var barWidth;

        barWidth = value;
        if (value > 0) {
            if (!this.progressFillWidth) {
                this.progressFillWidth = 78;
            }
            htmlStr =
                '<div class="progress-bar" style="border: 0px solid #666; height:13px; width: 100%;position:relative; text-align:center;">'+
                    '<div class="progress-fill" style="width:' + barWidth + '%;">'+
                        '<div class="progress-fill-text" style="width:'+this.progressFillWidth+'px">'+value+'%</div>'+
                    '</div>'+ value + '%' +
                '</div>';
        } else {
            htmlStr =  '<div data-qtip="" style="text-align:center;">'+'0%'+'</div>';
        }
        return htmlStr;
    },


    /**
     * 콤보박스 데이터 설정
     */
    addComboList : function() {
        var instance;
        var display;

        this.comboData = [];

        for (var ix = 0, ixLen = Comm.tablespaceDB.length; ix < ixLen ; ix++ ) {
            instance = Comm.tablespaceDB[ix][0];
            display  = Comm.tablespaceDB[ix][1];

            this.comboData[this.comboData.length] = {name: display, value: instance };
        }

        this.searchNameCombo.setData(this.comboData);
        this.searchNameCombo.setSearchField( 'name' );

        if (this.comboData.length > 0) {
            this.searchNameCombo.setValue(this.comboData[0].value);
        }

        instance = null;
        display  = null;
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
     * 새로고침 간격 (1시간)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        this.tablespaceQuery();

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), PlotChart.time.exHour);
    },


    /**
     * 일일 처리 건수 조회
     */
    tablespaceQuery: function() {

        var value = this.searchNameCombo.getValue();

        // 선택된 DB 정보가 없는 경우 쿼리를 실행하지 않는다.
        if (Ext.isEmpty(value) === true) {
            console.debug('%c '+'Tablespace Usage - No Selected DB', 'color:#BF0000;');
            return;
        }

        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%cTablespace Usage - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

            if (this.beforeLastestTime == null) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        temp = Ext.Date.subtract(temp, Ext.Date.DAY, 1);
        var fromtime = Ext.Date.format(temp, 'Y-m-d 00:00:00.000');
        var totime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        WS.SQLExec({
            sql_file : 'IMXRT_TablespaceInfo.sql',
            bind: [{
                name: 'db_id',
                type: SQLBindType.INTEGER,
                value:  value
            },{
                name: 'from_time', value: fromtime, type: SQLBindType.STRING
            },{
                name: 'to_time',   value: totime, type: SQLBindType.STRING
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm === true) {
                return;
            }

            this.drawData(adata);

            adata   = null;
        }, this);

        temp     = null;
    },


    /**
     * 일일 처리건수 데이터 표시
     */
    drawData: function(adata) {
        var name;
        var size;
        var total;
        var percent;

        this.toptxnGrid.clearRows();

        for (var ix = 0, ixLen = adata.rows.length ; ix < ixLen; ix++ ){

            name  = adata.rows[ix][1];
            total = adata.rows[ix][2];
            size  = adata.rows[ix][2] - adata.rows[ix][3];
            percent =  size / total * 100;
            percent = isNaN(percent)? 0 : percent;

            percent  = Number(common.Util.numberFixed(percent , 2));

            this.toptxnGrid.addRow([
                name,            // Tablespace Name
                total,           // Tablespace Total space
                size,            // Tablespace Usage space
                percent          // Tablespace Use Percent
            ]);
        }

        this.toptxnGrid.drawGrid();

        name  = null;
        total = null;
        size  = null;
        percent = null;
    }

});
