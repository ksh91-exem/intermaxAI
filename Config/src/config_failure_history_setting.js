Ext.define('config.config_failure_history_setting', {
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
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        this.systemTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118,
            margin: '3 5 3 6',
            listeners   : {
                change: function(me) {
                    this.resetGrids();
                    this.resetCalendar();
                }.bind(this)
            }
        });

        var hboxCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
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

        this.calendarLegend = Ext.create('Ext.container.Container', {
            width : '100%',
            height : 30,
            margin : '0 0 0 5',
            layout: 'fit'
        });

        vboxCon.add([this.calendarLegend, this.calendar]);

        var wasListPanel = this.createWasListPanel();
        var wasListPanel2 = this.createHistoryListPanel();

        hboxCon.add([vboxCon, wasListPanel, wasListPanel2]);

        baseCon.add([this.systemTypeCombo, hboxCon]);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        setTimeout(function(){
            this.calendarLegend.el.dom.innerHTML =
                '<div class="XMLineChart-legend" style="width: 135px;">' +
                '<div class="XMLineChart-legend-container horizontal"><span class="businessCalendar-legend-color" data-series-index="0" data-check="1" style="background-color: rgb(233, 94, 94); cursor:default;"></span>' +
                '<span class="XMLineChart-legend-name" title="장애" data-series-index="0" style="color: rgb(85, 85, 85);line-height:27px;">장애</span>' +
                '</div>' +
                '<div class="XMLineChart-legend-container horizontal"><span class="businessCalendar-legend-color" data-series-index="1" data-check="1" style="background-color: rgb(246, 193, 81); cursor:default;"></span>' +
                '<span class="XMLineChart-legend-name" title="이상" data-series-index="1" style="color: rgb(85, 85, 85);line-height:27px;">이상</span>' +
                '</div>';
        }.bind(this), 50);

        this.setSystemCombo();

    },

    setFailure: function(selectedDate) {
        var allDateList = Object.keys(this.calendarFailureTypes),
            ix, ixLen, failureCheck;

        for (ix = 0, ixLen = allDateList.length; ix < ixLen; ix++) {
            failureCheck = this.calendarFailureTypes[allDateList[ix]].find(function(item) {
                return item == 2;
            });

            if (failureCheck && selectedDate != allDateList[ix]) {
                this.calendar._findBlock(allDateList[ix]).querySelector('button').style = 'background: #e95e5e;box-shadow: inset 0 1px 3px #e95e5e;';
            }
            else if (failureCheck && selectedDate == allDateList[ix]) {
                this.calendar._findBlock(selectedDate).querySelector('button').removeAttribute('style');
            }
        }
    },

    setAnomaly: function(selectedDate) {
        var allDateList = Object.keys(this.calendarFailureTypes),
            ix, ixLen, anomalyCheck;

        for (ix = 0, ixLen = allDateList.length; ix < ixLen; ix++) {
            anomalyCheck = this.calendarFailureTypes[allDateList[ix]].find(function(item) {
                return item == 1;
            });

            if (anomalyCheck && selectedDate != allDateList[ix]) {
                this.calendar._findBlock(allDateList[ix]).querySelector('button').style = 'background: #f6c151;box-shadow: inset 0 1px 3px #f6c151;';
            }
            else if (anomalyCheck && selectedDate == allDateList[ix]) {
                this.calendar._findBlock(selectedDate).querySelector('button').removeAttribute('style');
            }
        }
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
                id: 'cfg_failure_name_refresh',
                scope: this,
                handler: function() { 
                    this.onButtonClick('Refresh', 'failure');
                    this.historyGrid.clearRows();
                    this.historyGrid.baseGrid.setDisabled(true);
                }
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
                    html: Comm.RTComm.setFont(9, common.Util.TR('Failure List'))
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
                    html: Comm.RTComm.setFont(9, common.Util.TR('Failure History'))
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
                self.failureHistoryTime = record.data.failure_time;
                self.onButtonClick('Refresh', 'history');
            }
        });

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',            width: 100, type: Grid.Number,   alowEdit: false, editMode: false, hide: true});
        this.wasGrid.addColumn({text: common.Util.CTR('Date')       ,  dataIndex: 'failure_time',      width: 110, type: Grid.DateTime, alowEdit: false, editMode: false, renderer: this.renderDate});
        this.wasGrid.addColumn({text: common.Util.CTR('Failure Type'), dataIndex: 'failure_type',      width: 100, type: Grid.String,   alowEdit: false, editMode: false, renderer: this.renderFailureType});
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

        this.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(true);
        this.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(true);

        this.historyGrid.beginAddColumns();
        this.historyGrid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',            width: 100, type: Grid.Number,   alowEdit: false, editMode: false, hide: true});
        this.historyGrid.addColumn({text: common.Util.CTR('Time')       ,  dataIndex: 'failure_time',      width: 110, type: Grid.DateTime, alowEdit: false, editMode: false, renderer: this.renderDate});
        this.historyGrid.addColumn({text: common.Util.CTR('Failure Type'), dataIndex: 'failure_type',      width: 100, type: Grid.String,   alowEdit: false, editMode: false, renderer: this.renderFailureType});
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

    onButtonClick: function(cmd, key) {
        var wasForm, rowData;
        var selectedDate = this.calendar.multiSelectArr[0].replace(/-/gi,"");
        var selectedTime = this.failureHistoryTime;

        switch (cmd) {
            case 'Edit' :
                
                rowData = this.historyGrid.getSelectedRow()[0].data;

                wasForm = Ext.create('config.config_failure_history_form');
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
                    // this.wasGrid.clearRows();
                    this.executeSQL(key, selectedDate);
                    selectedTime = '';
                    this.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(true);
                    this.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(true);
                } else {
                    // this.historyGrid.clearRows();
                    this.executeSQL(key, selectedTime);
                    this.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(true);
                }

                // this.refreshLoading = true;

                break;
            default :
                break;
        }
    },

    executeSQL: function(key, time) {
        var self = this,
            systemID = this.systemTypeCombo.getValue(),
            ix, ixLen, data;

        if (!systemID) {
            return;
        }

        switch (key) {
            case 'failure' :
                self.wasGrid.clearRows();

                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/failurehistory/' + time,
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === true) {
                            data = result.data;

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.wasGrid.addRow([data[ix].sys_id, data[ix].failure_time, data[ix].failure_type, data[ix].detail]);
                            }
                            
                            if (data.length > 0) {
                                self.wasGrid.drawGrid();
                                self.wasGrid.baseGrid.setDisabled(false);
                                self.failureToolbar.getComponent('cfg_failure_name_refresh').setDisabled(false);
                            }
                        }
                    },
                    failure : function(){}
                });
                break;
            case 'history' :
                self.historyGrid.clearRows();

                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/failurehistory/' + time,
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === true) {
                            data = result.data;
        
                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.historyGrid.addRow([data[ix].sys_id, data[ix].failure_time, data[ix].failure_type, data[ix].detail]);
                            }
                            
                            if (data.length > 0) {
                                self.historyGrid.drawGrid();
                                self.historyGrid.baseGrid.setDisabled(false);
                                self.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(false);
                            }
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

    setSystemCombo: function() {
        var data,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        this.systemTypeCombo.addItem(data[ix].sys_id, data[ix].name);
                    }

                    this.systemTypeCombo.selectRow(0);
                }
            }.bind(this),
            failure : function(){}
        });
    },

    setBusiness: function() {
        var systemID = this.systemTypeCombo.getValue(),
            data, day, historyCalendar, month, ix, ixLen;

        if (!systemID) {
            return;
        }
        
        this.resetGrids();

        month = this.calendar.fromCalendar.calendars[0].month + 1;
        month = month > 10 ? month : '0' + month;

        historyCalendar = this.calendar.fromCalendar.calendars[0].year + month;

        Ext.Ajax.request({ //호출 URL
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/failurehistory/' + historyCalendar,
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    this.calendarFailureTypes = {};

                    var selectedDate = this.calendar.multiSelectArr[0];

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        var date = data[ix].failure_time.substr(0,8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

                        if (this.calendar._findBlock(date)) {
                            if (day != this.calendar._findBlock(date).getAttribute('data-day')) {
                                this.calendarFailureTypes[date] = [];

                                day = this.calendar._findBlock(date).getAttribute('data-day');

                                this.calendar._findBlock(date).querySelector('button').innerHTML = day;
                            }

                            this.calendarFailureTypes[date].push(data[ix].failure_type);
                            this.calendar._findBlock(date).querySelector('button').innerHTML += '<br> ' + data[ix].detail;
                        }
                    }
                    this.setAnomaly(selectedDate);
                    this.setFailure(selectedDate);
                }
            }.bind(this),
            failure : function(){}
        });
    },

    initPopup: function(dateArr) {
        var selectedDate = dateArr[0].replace(/-/gi,"");

        this.resetGrids();
        
        this.executeSQL('failure', selectedDate);
        
        this.setAnomaly(dateArr[0]);
        this.setFailure(dateArr[0]);
    },

    resetGrids: function() {
        this.wasGrid.clearRows();
        this.historyGrid.clearRows();
        this.wasGrid.baseGrid.setDisabled(true);
        this.historyGrid.baseGrid.setDisabled(true);
        this.failureToolbar.getComponent('cfg_failure_name_refresh').setDisabled(true);
        this.historyToolbar.getComponent('cfg_history_name_edit').setDisabled(true);
        this.historyToolbar.getComponent('cfg_history_name_refresh').setDisabled(true);
    },

    resetCalendar: function() {
        this.calendar.allClearDate(); // 캘린더에 선택된 날짜 리셋
        this.calendar.fromCalendar.draw(); // 캘린더 내장함수를 통해 setBusiness를 호출
    }
});
