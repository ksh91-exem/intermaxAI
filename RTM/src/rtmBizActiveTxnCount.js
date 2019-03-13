Ext.define('rtm.src.rtmBizActiveTxnCount', {
    extend: 'Exem.DockForm',
    layout: 'fit',
    listeners: {
        beforedestroy: function() {
            if (this.barChart) {
                common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.END_BUSINESS_STAT, this.barChart);
            }

            this.frameStopDraw();
        },
        activate: function() {
            if (this.barChart) {
                this.barChart.resize = true;
            }
        }
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.initSetting();
    },

    initProperty: function() {
        this.title = common.Util.TR('Active Transaction Count');
        this.menu  = common.Menu.getClassConfig('rtmBizActiveTxnCount');

        this.bizIdArr        = Comm.RTComm.getBizIdList(Comm.businessRegisterInfo);
        this.bizNameArr      = Comm.RTComm.getBizNameList(Comm.businessRegisterInfo);

        this.monitorType  = 'Business';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.webEnvKey =  this.componentId + '_rtmBizActiveTxnCountStat';

        this.envKeyChartFit = this.componentId + '_rtmBizActiveTxnChartFit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        if (Comm.web_env_info[this.webEnvKey]) {
            if (typeof Comm.web_env_info[this.webEnvKey] === 'string') {
                this.webEnvData = JSON.parse(Comm.web_env_info[this.webEnvKey]);
            } else {
                this.webEnvData = Comm.web_env_info[this.webEnvKey];
            }
        }

        if (this.webEnvData) {
            this.frameTitleText  = this.webEnvData.comboData.name;
            this.selectComboData = this.webEnvData.comboData;
            this.selectBizId     = this.webEnvData.bizId;
            this.selectBizName   = this.webEnvData.bizName;
        } else {
            this.frameTitleText  = common.Util.TR('Top Business List');
            this.selectComboData = null;
            this.selectBizId     = this.bizIdArr;
            this.selectBizName   = this.bizNameArr;
        }
    },

    initLayout: function() {
        var baseCon = Ext.create('Exem.Container', {
            cls   : 'rtm-activitygroup-base',
            width : '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 0 0 0'
        });

        this.createTopCon();

        this.createChartPnl();

        baseCon.add(this.topArea, this.pnlCenter);

        this.add(baseCon);
    },

    createTopCon: function() {
        this.topArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 25,
            layout: 'hbox'
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height: 20,
            margin: '5 0 0 10',
            cls   : 'header-title',
            text  : this.title,
            style  : {
                cursor : 'pointer'
            },
            listeners: {
                scope: this,
                render: function(me) {
                    me.el.on( 'click', function() {
                        this.monitoringChangeWindow();
                    }, this);
                }
            }
        });

        this.optionChartFit = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Scale'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '4 20 0 0',
            checked : this.isFitChart,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.barChart.isFitChart = newVal;
                    this.barChart.fireEvent('resize', this.barChart);

                    common.WebEnv.Save(this.envKeyChartFit, newVal);
                }
            }
        });

        this.topArea.add([ this.frameTitle, {xtype: 'tbfill'}, this.optionChartFit]);
    },

    createChartPnl: function() {
        var barImg    = Comm.RTComm.getBachartBackImage();
        var barColors = Comm.RTComm.getBachartColors();

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 5 0 10',
            split    : false,
            border   : false
        });

        this.barChart = Ext.create('Exem.chart.StackBarChart', {
            color        : barColors,
            devMode      : false,
            isBarStripe  : true,
            barStripeImg : barImg,
            maxValue     : 30,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            minBarWidth  : 18,
            isSingleView : true,
            isFitChart   : this.isFitChart,
            serverType   : 'Business',
            isTopBiz     : true
        });

        this.pnlCenter.add(this.barChart);
    },

    initSetting: function() {
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.END_BUSINESS_STAT, this.barChart);

        this.barChart.setChartLabels(this.selectBizId, this.selectBizName);

        this.setFrameText(this.frameTitleText);
    },

    monitoringChangeWindow: function() {
        this.changeWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('Business Active Transaction Count Option'),
            width: 380,
            height: 350,
            resizable: false,
            closeAction: 'hide',
            maximizable: false,
            closable: true,
            modal    : true,
            cls  : 'xm-dock-window-base'
        });

        this.initLayoutWindow();

        this.setBizListGrid(this.selectComboData);

        this.changeWindow.show();

        this.setComboData(this.selectComboData);
        this.selectGridRow(false, this.selectBizId);
    },

    initLayoutWindow: function() {
        var baseCon = Ext.create('Ext.container.Container', {
            layout : {
                type : 'vbox',
                pack  : 'middle'
            },
            width : '100%',
            flex : 1,
            cls  : 'rtm-statchange-base'
        });

        this.createBizChangeCon();
        this.createButtonCon();

        baseCon.add(this.bizChangeCon, this.buttonCon);

        this.changeWindow.add(baseCon);
    },

    createBizChangeCon: function() {
        var bizComboData = [],
            ix, ixLen, vBoxCon;

        this.bizChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        vBoxCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.bizComboBox = Ext.create('Exem.AjaxComboBox', {
            cls: 'rtm-list-condition',
            width: '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                select: function(me) {
                    this.setBizListGrid(me.getSelection().data);
                    this.selectGridRow(true);
                }.bind(this)
            }
        });


        bizComboData.push({name: common.Util.TR('Top Business List'), value: this.bizIdArr});

        for ( ix = 0, ixLen = this.bizNameArr.length; ix < ixLen; ix++ ) {
            bizComboData.push({name: this.bizNameArr[ix], value: this.bizIdArr[ix]});
        }

        this.bizComboBox.setData(bizComboData);
        this.bizComboBox.setSearchField('name');

        this.bizListGrid = Ext.create('Exem.BaseGrid',{
            hideGridHeader: true,
            usePager: false,
            adjustGrid: true,
            cls         : 'baseGridRTM',
            useCheckbox : {
                use : true,
                mode: 'SIMPLE',
                headerCheck: false,
                checkOnly: false
            }
        });

        this.bizListGrid.beginAddColumns();
        this.bizListGrid.addColumn('Business ID', 'bizId' ,100, Grid.Number, false, true);
        this.bizListGrid.addColumn('Business Name', 'bizName' ,150, Grid.String, true, false);
        this.bizListGrid.endAddColumns();

        vBoxCon.add(this.bizComboBox, this.bizListGrid);

        this.bizChangeCon.add(vBoxCon);
    },

    setBizListGrid: function(comboData) {
        var drawData = [], bizId,
            ix, ixLen, jx, jxLen;

        if (!comboData || comboData.name === common.Util.TR('Top Business List')) {
            for ( ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++ ) {
                drawData.push({
                    id : this.bizIdArr[ix],
                    name : this.bizNameArr[ix]
                });
            }
        } else {
            bizId = comboData.value;

            for ( ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++ ) {
                if (Comm.businessRegisterInfo[ix].parent.bizId === bizId) {
                    for ( jx = 0, jxLen = Comm.businessRegisterInfo[ix].child.length; jx < jxLen; jx++ ) {
                        drawData.push({
                            id : Comm.businessRegisterInfo[ix].child[jx].bizId,
                            name : Comm.businessRegisterInfo[ix].child[jx].bizName
                        });
                    }
                }
            }
        }

        this.bizListGrid.clearRows();
        for ( ix = 0, ixLen = drawData.length; ix < ixLen; ix++ ) {
            this.bizListGrid.addRow([
                drawData[ix].id,
                drawData[ix].name
            ]);
        }
        this.bizListGrid.drawGrid();
    },

    setComboData: function(comboData) {
        if (comboData) {
            this.bizComboBox.ajaxSelectByName(comboData.name);
        }
    },

    selectGridRow: function(selectEvent, selectGridData) {
        var ix, ixLen, bizGridData;

        for (ix = 0, ixLen = this.bizListGrid.pnlExGrid.store.getTotalCount(); ix < ixLen; ix++) {
            bizGridData = this.bizListGrid.pnlExGrid.store.getAt(ix).data;
            if (!selectEvent && selectGridData) {
                if ( selectGridData.indexOf(bizGridData.bizId) !== -1 ) {
                    this.bizListGrid.selectByValue('bizId', bizGridData.bizId, true);
                }
            } else {
                this.bizListGrid.selectByValue('bizId', bizGridData.bizId, true);
            }
        }
    },

    createButtonCon: function() {
        this.buttonCon = Ext.create('Ext.container.Container', {
            layout : {
                type  : 'hbox',
                align : 'middle',
                pack  : 'center'
            },
            width  : '100%',
            height : 25,
            margin : '5 0 0 0',
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('OK'),
                cls   : 'rtm-btn',
                width : 55,
                height: 25,
                listeners: {
                    click: function() {
                        var dataObj;

                        if (!this.bizListGrid.getSelectedRow().length) {
                            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select at least one item.'));
                            return;
                        }
                        this.selectData(this.bizListGrid.getSelectedRow(), this.bizComboBox.selection.data);
                        this.setFrameText(this.bizComboBox.selection.data.name);
                        this.frameChange();

                        dataObj = {
                            comboData   : this.bizComboBox.selection.data,
                            bizId       : this.selectBizId,
                            bizName     : this.selectBizName
                        };

                        common.WebEnv.Save(this.webEnvKey, dataObj);
                        this.changeWindow.close();
                    }.bind(this)
                }
            },{
                xtype : 'tbspacer',
                width : 5
            },{
                xtype : 'button',
                text  : common.Util.TR('Cancel'),
                cls   : 'rtm-btn',
                height: 25,
                listeners: {
                    click: function() {
                        this.changeWindow.close();
                    }.bind(this)
                }
            }]
        });
    },

    selectData: function(gridData, comboData) {
        var ix, ixLen;

        this.selectBizId = [];
        this.selectBizName = [];
        for ( ix = 0, ixLen = gridData.length; ix < ixLen; ix++ ) {
            this.selectBizId.push(gridData[ix].data.bizId);
            this.selectBizName.push(gridData[ix].data.bizName);
        }

        this.selectComboData = comboData;
    },

    setFrameText: function(selectText) {
        var displayText = selectText + '(' + this.title + ')';
        this.frameTitle.setText(displayText);
    },

    frameChange: function() {
        this.barChart.isTopBiz = this.selectComboData.name === common.Util.TR('Top Business List');
        this.barChart.setChartLabels(this.selectBizId, this.selectBizName);
    },

    /**
     * Start Bar Chart draw.
     */
    frameRefresh: function() {
        if (this.barChart) {
            this.barChart.startAnimationFrame();
        }
    },


    /**
     * Stop Bar chart draw.
     */
    frameStopDraw: function() {
        if (this.barChart) {
            this.barChart.stopAnimationFrame();
        }
    }

});
