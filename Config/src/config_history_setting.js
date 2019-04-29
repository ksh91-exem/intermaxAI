Ext.define('config.config_history_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this.initProperty();
        this.initLayout();
        this.initDataSetting();
    },

    initProperty: function(){
        this.refreshLoading = false;
    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        var vboxCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            style: { background: '#ffffff' }
        });

        this.calendar = Ext.create('Exem.BusinessCalendar',{
            flex : 1,
            multiSelectDate : false,
            floating        : false,
            trendMode       : true,
            border          : false,
            bodyStyle       : null,
            parent          : this,
            paramTextField  : this.baseDateTextField,
            isPreventInit  : true,
            cls : 'businessCalendar',
            margin : '10 0 0 5'
        });

        this.calendar.init();

        vboxCon.add([Ext.create('Ext.container.Container', {
            width : '100%',
            height : 30,
            margin : '280 0 0 5',
            layout: 'hbox',
            cls : 'businessLegend'
        }), this.calendar]);

        var wasListPanel = this.createWasListPanel();
        var wasListPanel2 = this.createHistoryListPanel();

        baseCon.add([vboxCon, wasListPanel, wasListPanel2]);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.onButtonClick('Refresh');

        setTimeout(function(){
            document.getElementsByClassName('businessLegend')[0].innerHTML +=
                '<div class="XMLineChart-legend" style="width: 135px;">' +
                '<div class="XMLineChart-legend-container horizontal"><span class="businessCalendar-legend-color" data-series-index="0" data-check="1" style="background-color: rgb(233, 94, 94); cursor:default;"></span>' +
                '<span class="XMLineChart-legend-name" title="장애" data-series-index="0" style="color: rgb(85, 85, 85);line-height:27px;">장애</span>' +
                '</div>' +
                '<div class="XMLineChart-legend-container horizontal"><span class="businessCalendar-legend-color" data-series-index="1" data-check="1" style="background-color: rgb(246, 193, 81); cursor:default;"></span>' +
                '<span class="XMLineChart-legend-name" title="이상" data-series-index="1" style="color: rgb(85, 85, 85);line-height:27px;">이상</span>' +
                '</div>';
        }, 50);

        this.set장애();
        this.set이상();

    },

    set장애: function() {
        setTimeout(function(){
            if (this.calendar._findBlock('2019-04-10')) {
                this.calendar._findBlock('2019-04-10').querySelector('button').style = 'background: #e95e5e;box-shadow: inset 0 1px 3px #e95e5e;';
            }
        }.bind(this), 50);
    },

    set이상: function() {
        setTimeout(function(){
            if (this.calendar._findBlock('2019-04-08')) {
                this.calendar._findBlock('2019-04-08').querySelector('button').style = 'background: #f6c151;box-shadow: inset 0 1px 3px #f6c151;';
            }
        }.bind(this), 50);
    },

    createWasListPanel: function(){
        var wasListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width : 350,
            height: '100%',
            border: false,
            split: true,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.failureToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 30,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'failure'); }
            }]
        });

        var wasListTitleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('장애 List'))
                },
                this.failureToolbar
            ]
        });

        var wasListBodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid();

        wasListBodyCon.add(this.wasGrid);
        wasListPanel.add(wasListTitleCon, wasListBodyCon);

        return wasListPanel;
    },

    createHistoryListPanel: function(){
        var wasListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width : 600,
            height: '100%',
            border: false,
            split: true,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.historyToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 70,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_history_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'history'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'history'); }
            }]
        });

        var wasListTitleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Business Type List'))
                },
                this.historyToolbar
            ]
        });

        var wasListBodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createHistoryGrid();

        wasListBodyCon.add(this.historyGrid);
        wasListPanel.add(wasListTitleCon, wasListBodyCon);

        return wasListPanel;
    },

    createGrid: function(){
        var self = this;

        this.wasGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: common.Util.CTR('Date')       ,  dataIndex: 'date',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'desc',      width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.endAddColumns();
    },

    createHistoryGrid: function(){
        var self = this;

        this.historyGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                self.historyToolbar.getComponent('cfg_history_name_delete').setDisabled(false);
            }
        });

        this.historyGrid.beginAddColumns();
        this.historyGrid.addColumn({text: common.Util.CTR('E2E')    ,  dataIndex: 'e2e',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.historyGrid.addColumn({text: common.Util.CTR('TRCD')   ,  dataIndex: 'trcd',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.historyGrid.addColumn({text: common.Util.CTR('30초')   ,  dataIndex: 'time',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.historyGrid.addColumn({text: common.Util.CTR('정상')   ,  dataIndex: 'flag',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.historyGrid.endAddColumns();
    },

    onButtonClick: function(cmd, type) {
        var self = this,
            dataSet = {},
            wasForm, rowData;

        switch (cmd) {
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        rowData = self.wasGrid.getSelectedRow()[0].data;

                        dataSet.sql_file = 'IMXConfig_Delete_WasInfo.sql';
                        dataSet.bind = [{
                            name: 'wasId',
                            value: rowData.was_id,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()) {
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                            self.onButtonClick('Refresh');
                        }, this);

                        self.insertDeleteAutoId(rowData.was_id);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refreshLoading ){
                    return;
                }

                if (type == 'failure') {
                    this.wasGrid.clearRows();
                    this.executeSQL();
                } else {
                    this.historyGrid.clearRows();
                    this.executeSQL2();
                }

                this.refreshLoading = true;


                this.historyToolbar.getComponent('cfg_history_name_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    executeSQL: function() {
        var self = this,
            dataSet = {},
            whereList = '1=1',
            orderBy = 'order by was_name';

        dataSet.sql_file = 'IMXConfig_WasInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var rowData, ix, ixLen;

            if(!common.Util.checkSQLExecValid(header, data)){
                console.debug('config_wasname.js - executeSQL()');
                console.debug(header);
                console.debug(data);
                return;
            }

            self.wasGrid.addRow(['1999-01-01', '급여일']);
            self.wasGrid.addRow(['1999-01-01', '급여일']);
            self.wasGrid.addRow(['1999-01-01', '급여일']);
            self.wasGrid.drawGrid();

            this.refreshLoading = false ;
        }, this);
    },

    executeSQL2: function() {
        var self = this,
            dataSet = {},
            whereList = '1=1',
            orderBy = 'order by was_name';

        dataSet.sql_file = 'IMXConfig_WasInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var rowData, ix, ixLen;

            if(!common.Util.checkSQLExecValid(header, data)){
                console.debug('config_wasname.js - executeSQL()');
                console.debug(header);
                console.debug(data);
                return;
            }

            self.historyGrid.addRow(['Ins1', 'FEP12']);
            self.historyGrid.addRow(['Ins2', 'FEP21']);
            self.historyGrid.addRow(['Ins3', 'FEP33']);
            self.historyGrid.drawGrid();

            this.refreshLoading = false ;
        }, this);
    },

    changeWasInfo: function(wasid, wasname, hostname, tierId) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.wasGrid.getRowCount(); ix < ixLen; ix++) {
            if (this.wasGrid.getRow(ix).data.was_id == wasid) {
                record = this.wasGrid.findRow('was_id', wasid);
                record.set('was_name', wasname);
                record.set('host_name', hostname);
                record.set('tier_id', tierId);
                break;
            }
        }
    },

    insertDeleteAutoId: function(serverId){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Insert_Delete_Auto_Id.sql';
        dataSet.bind = [{
            name    : 'serverId',
            value   : serverId,
            type    : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {}, this);
    }
});
