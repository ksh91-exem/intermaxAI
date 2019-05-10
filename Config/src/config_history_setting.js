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
        this.wasGrid.baseGrid.setDisabled(true);

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
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_history_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'history'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                id: 'cfg_history_name_refresh',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'history', this.wasGrid.getSelectedRow()[0].data.failure_time); }
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
                    html: Comm.RTComm.setFont(9, common.Util.TR('장애 History'))
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
        this.historyGrid.baseGrid.setDisabled(true);

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
            defaultPageSize: 300,
            itemclick:function(dv, record, item, index) {
                self.onButtonClick('Refresh', 'history', record.raw.failure_time);
                self.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(false);
            }
        });

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',            width: 100, type: Grid.Number,   alowEdit: false, editMode: false, hide: true});
        this.wasGrid.addColumn({text: common.Util.CTR('Date')       ,  dataIndex: 'failure_time',      width: 110, type: Grid.DateTime, alowEdit: false, editMode: false, renderer: this.renderDate});
        this.wasGrid.addColumn({text: 'failure_type'                ,  dataIndex: 'failure_type',      width: 100, type: Grid.String,   alowEdit: false, editMode: false, renderer: this.renderFailureType});
        this.wasGrid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'detail',            width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        this.wasGrid.endAddColumns();
    },

    createHistoryGrid: function(){
        var self = this;

        this.historyGrid = Ext.create('Exem.adminGrid', {
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
            defaultPageSize: 300,
            itemclick:function() {
                self.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(false);
            }
        });

        this.historyGrid.beginAddColumns();
        this.historyGrid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',            width: 100, type: Grid.Number,   alowEdit: false, editMode: false, hide: true});
        this.historyGrid.addColumn({text: common.Util.CTR('Time')       ,  dataIndex: 'failure_time',      width: 110, type: Grid.DateTime, alowEdit: false, editMode: false, renderer: this.renderDate});
        this.historyGrid.addColumn({text: 'failure_type'                ,  dataIndex: 'failure_type',      width: 100, type: Grid.String,   alowEdit: false, editMode: false, renderer: this.renderFailureType});
        this.historyGrid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'detail',            width: 200, type: Grid.String,   alowEdit: false, editMode: false});
        // this.historyGrid.addColumn({text: common.Util.CTR('E2E')        ,  dataIndex: 'E2E',               width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        // this.historyGrid.addColumn({text: common.Util.CTR('TRCD')       ,  dataIndex: 'TRCD',              width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        // this.historyGrid.addColumn({text: common.Util.CTR('30초')      ,  dataIndex: '30초',             width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        // this.historyGrid.addColumn({text: common.Util.CTR('정상')        ,  dataIndex: 'failure_type',      width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        this.historyGrid.endAddColumns();
    },

    renderDate: function(val) {
        var year = val.substring(0, 4);
        var month = val.substring(4, 6);
        var day = val.substring(6, 8);
        var hour = val.substring(8, 10);
        var minute = val.substring(10, 12);
        var date = new Date(year, month-1, day, hour, minute);
        val = Ext.util.Format.date(date, 'Y-m-d H:i');
        return val;
    },

    renderFailureType: function(val) {
        var failureTypeSet = ["0 : 정상", "1 : 이상", "2 : 장애"],
            ix, ixLen;
        for (ix = 0, ixLen = failureTypeSet.length; ix < ixLen; ix++) {
            if (val == ix) val = failureTypeSet[ix];
        }
        return val;
    },

    onButtonClick: function(cmd, key, time) {
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
            case 'Edit' :
                
                rowData = this.historyGrid.getSelectedRow()[0].data;

                wasForm = Ext.create('config.config_history_form');
                wasForm.systemID     = rowData.sys_id;
                wasForm.failureTime  = rowData.failure_time;
                wasForm.failureType  = rowData.failure_type;
                wasForm.detail       = rowData.detail;

                wasForm.parent = this;
                wasForm.init('Edit');

                break;
            case 'Refresh' :
                if ( this.refreshLoading ){
                    return;
                }

                if (key == 'failure') {
                    this.wasGrid.clearRows();
                    this.executeSQL(key, '20190430'); // 캘린더 선택시의 yyyymmdd 날짜로 대체해야함
                } else {
                    this.historyGrid.clearRows();
                    this.executeSQL(key, time);
                }

                // this.refreshLoading = true;


                this.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(true);
                this.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(true);
                break;
            default :
                break;
        }
    },

    executeSQL: function(key, time) {
        var self = this,
            ix, ixLen, data;
        var id = 1; // sys_id로 대체해야함

        switch (key) {
            case 'failure' :
        
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/failurehistory/' + time,
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.wasGrid.clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.wasGrid.addRow([data[ix].sys_id, data[ix].failure_time, data[ix].failure_type, data[ix].detail]);
                            }
                            
                            self.wasGrid.drawGrid();
                            self.wasGrid.baseGrid.setDisabled(false);
                            self.historyGrid.clearRows();
                            self.historyGrid.baseGrid.setDisabled(true);
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'history' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/failurehistory/' + time,
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.historyGrid.clearRows();
        
                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.historyGrid.addRow([data[ix].sys_id, data[ix].failure_time, data[ix].failure_type, data[ix].detail]);
                            }
                            
                            self.historyGrid.drawGrid();
                            self.historyGrid.baseGrid.setDisabled(false);
                        }
                    },
                    failure : function(){}
                });
                break;
        }
        
        this.refreshLoading = false;
    },

    changeWasInfo: function(systemid, failuretime, failuretype, detail) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.wasGrid.getRowCount(); ix < ixLen; ix++) {
            if (this.wasGrid.getRow(ix).data.failure_time == failuretime) {
                record = this.wasGrid.findRow('failure_time', failuretime);
                record.set('system_id', systemid);
                record.set('failure_time', failuretime);
                record.set('failure_type', failuretype);
                record.set('detail', detail);
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
