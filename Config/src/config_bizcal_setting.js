Ext.define('config.config_bizcal_setting', {
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
            margin : '310 0 0 5'
        });

        this.calendar.init();

        var wasListPanel = this.createWasListPanel();

        baseCon.add([wasListPanel, this.calendar]);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.onButtonClick('Refresh');


        this.setBusiness();
    },

    setBusiness: function() {
        setTimeout(function(){
            if (this.calendar._findBlock('2019-04-10')) {
                this.calendar._findBlock('2019-04-10').querySelector('button').innerHTML = '10 <br> 급여일 <br> 집중거래일';
            }
        }.bind(this), 50);
    },

    initPopup: function() {
        var dateForm = Ext.create('config.config_bizcal_date_form');
        dateForm.parent = this;
        dateForm.init();
    },

    createWasListPanel: function(){
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

        this.wasNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_was_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_was_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh'); }
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
                this.wasNameToolbar
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
            itemclick:function() {
                self.wasNameToolbar.getComponent('cfg_was_name_edit').setDisabled(false);
                self.wasNameToolbar.getComponent('cfg_was_name_delete').setDisabled(false);
            }
        });

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: common.Util.CTR('Name')       ,  dataIndex: 'name',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'desc',      width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.endAddColumns();
    },

    onButtonClick: function(cmd) {
        var self = this,
            dataSet = {},
            wasForm, rowData;

        switch (cmd) {
            case 'Add' :
                wasForm = Ext.create('config.config_bizcal_form');
                wasForm.parent = this;
                wasForm.init('Add');
                break;
            case 'Edit' :
                rowData = this.wasGrid.getSelectedRow()[0].data;
                wasForm = Ext.create('config.config_bizcal_form');
                wasForm.parent = this;
                wasForm.wasid = rowData.was_id;
                wasForm.wasname = rowData.was_name;
                wasForm.hostname = rowData.host_name;
                wasForm.tier_id = rowData.tier_id;
                wasForm.init('Edit');
                break;
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

                this.refreshLoading = true;
                this.wasGrid.clearRows();
                this.executeSQL();

                this.wasNameToolbar.getComponent('cfg_was_name_edit').setDisabled(true);
                this.wasNameToolbar.getComponent('cfg_was_name_delete').setDisabled(true);
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

            self.wasGrid.addRow(['WAS1', 'DESC']);
            self.wasGrid.addRow(['WAS2', 'DESC']);
            self.wasGrid.addRow(['WAS3', 'DESC']);
            self.wasGrid.drawGrid();

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
