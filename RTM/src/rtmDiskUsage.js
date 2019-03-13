Ext.define('rtm.src.rtmDiskUsage', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Disk Usage'),
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

    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.displayHostList = Comm.hosts.concat();

        // 1: WAS, 2: DB, 3: WebServer, 15: C Daemon (APIM)
        this.serverType = 1;

        this.envKeyUsageLimit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_diskusage_limit';
        this.diskusageLimit = Comm.web_env_info[this.envKeyUsageLimit];

        if (this.diskusageLimit) {
            this.txnFilterDiskUsage = +this.diskusageLimit;
        } else {
            this.txnFilterDiskUsage = 0;
        }
    },

    init: function() {
        this.initProperty();

        this.initLayout();
        this.frameRefresh();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
    },


    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-topsql-base'
        });

        this.topContentsArea = Ext.create('Exem.Container', {
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.centerArea = Ext.create('Exem.Container', {
            width  : '100%',
            height : '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : this.title
        });

        this.expendIcon = Ext.create('Ext.container.Container', {
            width : 17,
            height: 17,
            margin: '2 10 0 0',
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

        this.filterUsageText = Ext.create('Exem.NumberField',{
            cls: 'rtm-list-condition',
            fieldLabel: common.Util.TR('Disk Usage') + '(%)',
            labelWidth : 90,
            width: 140,
            maxLength: 2,
            minValue: 0,
            maxValue: 99,
            value   : this.txnFilterDiskUsage,
            margin: '0 10 0 0',
            enforceMaxLength: true,
            enableKeyEvents: true,
            allowBlank: false,
            allowDecimals: false,
            allowExponential: false,
            listeners: {
                scope: this,
                keydown: this.keyDownEvent,
                change: this.changeEvent,
                blur: this.blurEvent,
                specialkey: this.specialkeyEvent
            }
        });

        this.createTabPanel();

        this.createGrid();

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill'}, this.filterUsageText, this.expendIcon]);

        this.centerArea.add(this.tabPanel, this.diskUsageGrid);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },

    keyDownEvent: function (me, e) {
        if (!Ext.isNumeric(me.value)) {
            e.stopEvent();
            return;
        }
    },

    changeEvent: function(me, newValue, oldValue) {
        if (!Ext.isNumeric(me.value)) {
            me.setValue(oldValue);
        } else {
            if (me.value < me.minValue) {
                me.setValue(me.minValue);
            } else if (me.value > me.maxValue) {
                me.setValue(me.maxValue);
            }
        }
    },

    blurEvent: function() {
        if (+this.txnFilterDiskUsage !== +this.filterUsageText.getValue()) {
            this.txnFilterDiskUsage = +this.filterUsageText.getValue();
            common.WebEnv.Save(this.envKeyUsageLimit, this.txnFilterDiskUsage);
            this.frameRefresh();
        }
    },

    specialkeyEvent: function(me, e) {
        if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
            if (me.value < 0) {
                me.setValue(0);
            } else if (me.value > 99) {
                me.setValue(99);
            }
            me.oldValue = me.value;
            me.fireEvent('blur', me);
        }
    },


    /**
     * 모니터링 서버들의 호스트별로 탭 화면을 구성
     */
    createTabPanel: function() {
        this.tabPanel = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            width: '100%',
            height: 25,
            items: [{
                title: common.Util.TR('Total'),
                itemId: 'total',
                layout: 'fit'
            }],
            listeners: {
                scope: this,
                tabchange: function(tabpanel, newcard) {
                    this.loadingMask.show(null, true);
                    this.activeTabTitle = newcard.title;
                    this.frameRefresh();
                }
            }
        });

        var hostName;
        for (var ix = 0, ixLen = this.displayHostList.length; ix < ixLen ; ix++ ) {
            hostName = this.displayHostList[ix];
            this.tabPanel.add({
                layout: 'fit',
                title : hostName,
                itemId: hostName
            });
        }

        this.tabPanel.setActiveTab(0);
        this.activeTabTitle = this.tabPanel.getActiveTab().title;
    },


    /**
     * Grid 생성
     */
    createGrid: function () {
        this.diskUsageGrid = Ext.create('Exem.BaseGrid', {
            layout       : 'fit',
            usePager     : false,
            autoScroll   : false,
            borderVisible: true,
            localeType   : 'H:i:s',
            columnLines  : true,
            baseGridCls  : 'baseGridRTM',
            exportFileName: this.title,
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display'),
            style: {
                'overflow-x': 'hidden'
            }
        });

        this.diskUsageGrid.beginAddColumns();
        this.diskUsageGrid.addColumn(common.Util.CTR('Host Name'),      'host_name',     80,  Grid.String,  true, false);
        this.diskUsageGrid.addColumn(common.Util.CTR('Mount Name'),     'mount_name',    75,  Grid.String,  true, false);
        this.diskUsageGrid.addColumn(common.Util.CTR('File System'),    'file_system',   95,  Grid.String,  true, false);
        this.diskUsageGrid.addColumn(common.Util.CTR('Usage(%)'),       'usage',         95,  Grid.Float,   true, false);
        this.diskUsageGrid.addColumn(common.Util.CTR('Use Size(MB)'),   'use_size',      95,  Grid.Number,  true, false);
        this.diskUsageGrid.addColumn(common.Util.CTR('Total Size(MB)'), 'total_size',    95,  Grid.Number,  true, false);
        this.diskUsageGrid.endAddColumns();

        this.diskUsageGrid.addRenderer('usage', this.gridBarRenderer.bind(this), RendererType.bar);

        this.diskUsageGrid._columnsList[3].on({
            scope: this,
            resize: function() {
                this.progressFillWidth = $('#'+this.id+' .progress-bar').width();
                if (this.progressFillWidth) {
                    $('#'+this.id+' .progress-fill-text').css('width', this.progressFillWidth);
                }
            }
        });

        this.diskUsageGrid._columnsList[1].minWidth = 150;
        this.diskUsageGrid._columnsList[1].flex = 1;

        // 필터 설정 후 다른 탭으로 전환하고 설정된 필터를 해제하면 변경 전 탭에서 표시된 데이터가
        // 보여지는 이슈로 인해 필터 설정 시 그리드를 새로 고침하도록 수정.
        this.diskUsageGrid.pnlExGrid.on('filterchange', function() {
            this.diskUsageGrid.clearRows();
            this.frameRefresh();
        }.bind(this));

    },


    /**
     * 그리드에 보여지는 막대 그래프 설정.
     * value, metaData, record, rowIndex, colIndex, store, view
     *
     * @param {} value
     * @param {} metaData
     * @param {} record
     * @param {} rowIndex
     * @param {} colIndex
     * @param {} store
     * @param {} view
     * @return {}
     */
    gridBarRenderer: function() {
        var htmlStr;
        var value = arguments[0];

        if (value !== 0) {
            if (!this.progressFillWidth) {
                this.progressFillWidth = 83;
            }

            htmlStr =
                '<div class="progress-bar" style="border: 0px solid #666; height:13px; width: 100%;position:relative; text-align:center;">'+
                    '<div class="progress-fill" style="width:' + value + '%;">'+
                        '<div class="progress-fill-text" style="width:'+this.progressFillWidth+'px">'+value+'%</div>'+
                    '</div>'+ value + '%' +
                '</div>';
        } else {
            htmlStr =  '<div data-qtip="" style="text-align:center;">'+'0%'+'</div>';
        }
        return htmlStr;
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function() {
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

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp || this.floatingLayer) {
            this.selectDiskUsage();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), PlotChart.time.exMin * 1);
    },


    /**
     * 디스크 사용량 조회
     */
    selectDiskUsage: function() {

        var hostName = this.activeTabTitle;

        if (common.Util.TR('Total') === hostName) {
            hostName = '';
            for (var ix = 0, ixLen = this.displayHostList.length; ix < ixLen ; ix++ ) {
                hostName += (ix === 0? '\'' : ',\'') + this.displayHostList[ix] + '\'';
            }
        } else {
            hostName = '\'' + hostName + '\'';
        }

        if (Ext.isEmpty(hostName) === true) {
            console.debug('%c [Disk Usage] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'No Selected Host Name');
            return;
        }

        WS.SQLExec({
            sql_file: 'IMXRT_DiskUsage.sql',
            bind : [{
                name: 'server_type', value: this.serverType, type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'host_name', value: hostName
            }]
        }, function(aheader, adata) {
            this.loadingMask.hide();

            if (adata === null || adata === undefined) {
                console.debug('%c [Disk Usage] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', aheader.message);
            }

            if (this.isClosedDockForm === true) {
                return;
            }
            this.drawData(adata);

            aheader  = null;
            adata    = null;
        }, this);
    },


    /**
     * 디스크 사용량 데이터 표시
     *
     * @param {object} adata
     */
    drawData: function(adata) {

        this.diskUsageGrid.clearRows();

        if (this.diskUsageGrid.pnlExGrid.headerCt === undefined ||
            this.diskUsageGrid.pnlExGrid.headerCt === null) {
            return;
        }

        var isDownHost;
        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            if (+this.txnFilterDiskUsage <= +adata.rows[ix][2]) {
                isDownHost = Comm.RTComm.isDownByHostName(adata.rows[ix][5]);

                if (isDownHost === true) {
                    continue;
                }

                this.diskUsageGrid.addRow([
                    adata.rows[ix][5],          // host name
                    adata.rows[ix][0],          // mount name
                    adata.rows[ix][1],          // file system
                    adata.rows[ix][2],          // ratio
                    Math.trunc(+adata.rows[ix][3]),         // used size
                    Math.trunc(+adata.rows[ix][4])          // tota size
                ]);
            }
        }

        if (isDownHost === true) {
            this.diskUsageGrid.emptyTextMsg = common.Util.TR('Host Down');
        } else {
            this.diskUsageGrid.emptyTextMsg = common.Util.TR('No data to display');
        }
        this.diskUsageGrid.showEmptyText();

        this.diskUsageGrid.drawGrid();

        adata = null;
    }

});
