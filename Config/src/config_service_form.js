Ext.define('config.config_service_form', {

    parent: null,
    mode: '',
    select_serviceid: -1,
    select_servicename: '',
    serviceGroupArr: null,

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: true,
            width: 550,
            height: 450,
            resizable: true,
            title: common.Util.CTR('Service'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 120,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.CTR('Service Settings'))
        });

        panelA1.add(labelA);

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        panelA.add(panelA1);
        panelA.add(panelA2);

        var serviceIdLabel = Ext.create('Ext.form.Label', {
            x: 20,
            y: 12,
            html: Comm.RTComm.setFont(9, common.Util.CTR('Service ID'))
        });

        this.serviceIdEdit = Ext.create('Ext.form.field.Text', {
            x: 110,
            y: 10,
            width: 400,
            allowBlank: false
        });

        var serviceNameLabel = Ext.create('Ext.form.Label', {
            x: 20,
            y: 39,
            html: Comm.RTComm.setFont(9, common.Util.CTR('Service Name'))
        });

        this.serviceNameEdit = Ext.create('Ext.form.field.Text', {
            x: 110,
            y: 37,
            width: 400,
            maxLength : 64,
            enforceMaxLength : true,
            allowBlank: false
        });

        panelA2.add(serviceIdLabel);
        panelA2.add(this.serviceIdEdit);
        panelA2.add(serviceNameLabel);
        panelA2.add(this.serviceNameEdit);
        panelA2.add(this.intervalEdit);

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '0 4 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        panelB.add(panelB1);

        var labelB = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Select Agent and Web Server'))
        });

        panelB1.add(labelB);

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB21 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            margin: '4 2 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB22 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1.2,
            margin: '4 4 4 2',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        panelB2.add(panelB21);
        panelB2.add(panelB22);
        panelB.add(panelB2);

        var gridPanelA = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            x: 15,
            y: 66,
            width: '100%',
            flex: 1,
            style: { background: '#dddddd' }
        });

        var gridPanelB = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            x: 15,
            y: 66,
            width: '100%',
            flex: 1,
            style: { background: '#dddddd' }
        });

        // GRID
        this.was_grid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            height: '100%',
            border: false,
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: false,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.was_grid.beginAddColumns();
        this.was_grid.addColumn({text: common.Util.CTR('Agent ID')  ,  dataIndex: 'was_id',   width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.was_grid.addColumn({text: common.Util.CTR('Agent Name'),  dataIndex: 'was_name', width: 115, type: Grid.String, alowEdit: false, editMode: false});
        this.was_grid.endAddColumns();

        // GRID
        this.ws_grid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            height: '100%',
            border: false,
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: false,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.ws_grid.beginAddColumns();
        this.ws_grid.addColumn({text: common.Util.CTR('Webserver ID'),   dataIndex: 'ws_id',   width: 105, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.ws_grid.addColumn({text: common.Util.CTR('Web Server Name'), dataIndex: 'ws_name', width: 120, type: Grid.String, alowEdit: false, editMode: false});
        this.ws_grid.endAddColumns();

        gridPanelA.add(this.was_grid);
        gridPanelB.add(this.ws_grid);
        panelB21.add(gridPanelA);
        panelB22.add(gridPanelB);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        this.OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    this.setDisabled(true);
                    self.fieldCheck();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        form.add(panelA);
        form.add(panelB);
        form.add(panelC);

        panelC.add(this.OKButton);
        panelC.add(this.CancelButton);

        form.show();

        this.executeSQL_Was();
        this.executeSQL_WebServer();


        setTimeout(function(){
            if (self.mode == 'Edit') {
                self.checked_was_ws();
            }
        }, 300) ;

        if (this.mode == 'Edit') {
            this.serviceIdEdit.setValue(this.select_serviceid);
            this.serviceNameEdit.setValue(this.select_servicename);
        } else {
            this.autoSeqInsert();
        }

        this.serviceIdEdit.setDisabled(true);
    },

    autoSeqInsert: function() {
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Sequence_Service_Id.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.serviceIdEdit.setValue(adata.rows[0][0]);
            this.serviceNameEdit.focus();
        }, this);
    },

    executeSQL_Was: function() {
        var dataSet = {};
        var whereList = 'was_name is not null';
        var orderBy = 'order by was_name';

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
        WS.SQLExec(dataSet, this.onData_Was, this);
    },

    onData_Was: function(aheader, adata) {
        this.was_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.was_grid.addRow([
                adata.rows[ix][0],  // Was_ID
                adata.rows[ix][1]   // Was_Name
            ]);
        }
        this.was_grid.drawGrid();

    },

    executeSQL_WebServer: function() {
        var dataSet = {};
        var whereList = '1=1';
        var orderBy = 'order by ws_name';

        dataSet.sql_file = 'IMXConfig_WsInfo.sql';
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
        WS.SQLExec(dataSet, this.onData_WebServer, this);
    },

    onData_WebServer: function(aheader, adata) {
        this.ws_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.ws_grid.addRow([
                adata.rows[ix][0],  // WebServer_ID
                adata.rows[ix][1]   // WebServer_Name
            ]);
        }
        this.ws_grid.drawGrid();
        this.serviceNameEdit.focus();
    },

    getTextLength : function(str){
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (encodeURI(str.charAt(i)).length == 9) {
                //DB가 UTF-8 일경우 한글 byte는 3byte 취급.
                len += 2;
            }
            len++;
        }
        return len;
    },


    save: function() {
        var wasList         = this.was_grid.getSelectedRow();
        var webServerList   = this.ws_grid.getSelectedRow();
        var service_id      = this.serviceIdEdit.getValue();
        var service_name    = this.serviceNameEdit.getValue();

        var dataSetDefault = {};
        var dataSetMaster = {};
        var d;
        var ix;

        //byte check
        var byteLen = this.getTextLength(service_name);

        if(byteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.OKButton.setDisabled(false);
            this.serviceNameEdit.focus();
            return;
        }


        if ( this.mode == 'Edit' ){
            dataSetDefault.sql_file = 'IMXConfig_Update_Service_Info.sql';
            if(common.Util.isMultiRepository()) {
                dataSetMaster.sql_file = 'IMXConfig_Update_Service_Info.sql';
            }
        } else {
            dataSetDefault.sql_file = 'IMXConfig_Insert_Service_Info.sql';
            if(common.Util.isMultiRepository()) {
                dataSetMaster.sql_file = 'IMXConfig_Insert_Service_Info.sql';
            }
        }
        dataSetDefault.bind = [{
            name    :   'service_name',
            value   :   service_name,
            type : SQLBindType.STRING
        }];
        dataSetDefault.replace_string = [{
            name    :   'service_id',
            value   :   service_id
        }];


        if(common.Util.isMultiRepository()){
            dataSetMaster.bind = [{
                name    :   'service_name',
                value   :   service_name,
                type : SQLBindType.STRING
            }];
            dataSetMaster.replace_string = [{
                name    :   'service_id',
                value   :   service_id
            }];
            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
            WS.SQLExec(dataSetMaster,{},this);

            dataSetDefault.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSetDefault,{},this);

        dataSetDefault = {};
        dataSetMaster = {};

        // 사용자가 선택한 WAS 목록을 저정하고,
        for (ix = 0; ix < wasList.length; ix++) {
            d = wasList[ix].data;
            dataSetDefault.sql_file = 'IMXConfig_Insert_Service_Group.sql';
            dataSetDefault.bind = [{
                name    :   'type',
                value   :   'WAS',
                type : SQLBindType.STRING
            }];
            dataSetDefault.replace_string = [{
                name    :   'service_id',
                value   :   service_id
            }, {
                name    :   'type_id',
                value   :   d.was_id
            }];
            if(common.Util.isMultiRepository()){
                dataSetMaster.sql_file = 'IMXConfig_Insert_Service_Group.sql';
                dataSetMaster.bind = [{
                    name    :   'type',
                    value   :   'WAS',
                    type : SQLBindType.STRING
                }];
                dataSetMaster.replace_string = [{
                    name    :   'service_id',
                    value   :   service_id
                }, {
                    name    :   'type_id',
                    value   :   d.was_id
                }];
            }
            d.start = ix+1;
            d.end = wasList.length;
            this.saveServiceGroupWAS(dataSetDefault,dataSetMaster,d);
        }

        // WebServer 목록도 저장한다.
        for (ix = 0; ix < webServerList.length; ix++) {
            d = webServerList[ix].data;
            dataSetDefault.sql_file = 'IMXConfig_Insert_Service_Group.sql';
            dataSetDefault.bind = [{
                name    :   'type',
                value   :   'WS',
                type : SQLBindType.STRING
            }];
            dataSetDefault.replace_string = [{
                name    :   'service_id',
                value   :   service_id
            }, {
                name    :   'type_id',
                value   :   d.ws_id
            }];

            if(common.Util.isMultiRepository()){
                dataSetMaster.sql_file = 'IMXConfig_Insert_Service_Group.sql';
                dataSetMaster.bind = [{
                    name    :   'type',
                    value   :   'WS',
                    type : SQLBindType.STRING
                }];
                dataSetMaster.replace_string = [{
                    name    :   'service_id',
                    value   :   service_id
                }, {
                    name    :   'type_id',
                    value   :   d.ws_id
                }];
            }
            this.saveServiceGroupWS(dataSetDefault,dataSetMaster);
        }
    },

    // saveServiceGroup를 WAS에다가만 동작이 끝나면 refresh와 창 종료 기능을 구현 webserver 에다가는 구현을 하지않음.
    // 백그라운드에서 처리를 끝내면 충분하다고 판단 실제 서비스 목록을 클릭을 하는 순간 다시 선택한 서비스명에 맞춰 sql를
    // 가져오므로 영향이 없다고 판단.
    saveServiceGroupWAS : function(dataSetDefault,dataSetMaster,data){
        if(common.Util.isMultiRepository()) {
            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
            WS.SQLExec(dataSetMaster,{},this);

            dataSetDefault.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSetDefault, function() {
            if(data.start === data.end){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.parent.onButtonClick('Refresh');
                this.CancelButton.fireHandler('click');
                this.getServiceHostList(parseInt(this.serviceIdEdit.getValue()));
            }
        }, this);
    },

    saveServiceGroupWS : function(dataSetDefault,dataSetMaster){
        if(common.Util.isMultiRepository()) {
            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
            WS.SQLExec(dataSetMaster,{},this);

            dataSetDefault.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSetDefault, function() {}, this);
    },

    getServiceHostList : function(service_id){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Get_Service_Host_Id.sql';
        dataSet.replace_string = [{
            name    :   'service_id',
            value   :   service_id
        }];
        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(aheader,adata) {
            if(!adata.rows){
                return;
            }
            var ix;
            var length = adata.rows.length;
            var dataSet = {};
            var host_id;
            for( ix = 0; ix < length; ix++ ){
                host_id = adata.rows[ix][0];

                dataSet.sql_file = 'IMXConfig_Insert_Service_Host_List.sql';
                dataSet.replace_string = [{
                    name    :   'service_id',
                    value   :   service_id
                }, {
                    name    :   'host_id',
                    value   :   host_id
                }];
                if(common.Util.isMultiRepository()) {
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }
                this.setServiceHostList(dataSet);
            }
        },this);
    },

    setServiceHostList : function(dataSet){
        WS.SQLExec(dataSet, function() {
        },this);
    },

    update: function(){
        //변경되기전이름으로 delete 후 다시 insert 하는 방식.
        //여기선 delete만 시키고 save() 호출하여 insert.
        var self = this ;
        var service_id = this.serviceIdEdit.getValue() ;
        var dataSet = {};
        var dataSetMaster = {};

        if ( this.select_serviceid !== Number(this.serviceIdEdit.getValue()) ){
            service_id = this.select_serviceid ;
        }

        //설정 되어 있는 xapm_service_group 과 xapm_service_host_list 데이터를 삭제.
        dataSet.sql_file = 'IMXConfig_Delete_Service_Group_Host_List.sql';

        dataSet.replace_string = [{
            name    :   'service_id',
            value   :   service_id
        }];

        if(common.Util.isMultiRepository()){
            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
            WS.SQLExec(dataSetMaster,{},this);

            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(){
            self.save() ;
        }, self ) ;

    },


    find_was: function(wid) {
        var result = false;
        var d;
        for (var ix = 0; ix < this.serviceGroupArr.length; ix++) {
            d = this.serviceGroupArr[ix];
            //여기는 Agent로 비교하지않고 WAS로하자.
            if (d[0] == this.select_serviceid && d[1] == 'WAS' && d[2] == wid) {
                result = true;
                break;
            }
        }
        return result;
    },

    find_webserver: function(wid) {
        var result = false;
        var d;
        for (var ix = 0; ix < this.serviceGroupArr.length; ix++) {
            d = this.serviceGroupArr[ix];
            if (d[0] == this.select_serviceid && d[1] == 'WS' && d[2] == wid) {
                result = true;
                break;
            }
        }
        return result;
    },

    checked_was_ws: function() {
        var self = this;
        var d;
        var ix, jx;

        self.was_grid.unCheckAll();
        self.ws_grid.unCheckAll();

        // WAS
        for (ix = 0; ix < self.was_grid.getRowCount(); ix++) {
            d = self.was_grid.getRow(ix).data;
            if (self.find_was(d['was_id'])) {
                self.was_grid.selectRow(ix, true);
            }
        }

        // WebServer
        for (jx = 0; jx < self.ws_grid.getRowCount(); jx++) {
            d = self.ws_grid.getRow(jx).data;
            if (self.find_webserver(d['ws_id'])) {
                self.ws_grid.selectRow(jx, true);
            }
        }
    },

    fieldCheck: function() {
        var self = this ;
        var serviceName = this.serviceNameEdit.getValue();
        var select_count = this.was_grid.getSelectedRow().length;

        if (serviceName == '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Service Name'));
            self.serviceNameEdit.focus() ;
            this.OKButton.setDisabled(false);
            return ;
        }

        if (select_count == 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select Agent.'));
            this.OKButton.setDisabled(false);
            return ;
        }


        //1506.11 기존에 service name 있는지도 검사하는 로직 추가 min
        var dataSet = {};
        var whereList = 'service_name =  '+'\''+serviceName+'\' ';

        dataSet.sql_file = 'IMXConfig_ServiceInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }];
        // master 에 있는 repo 를 검사를 해서 겹치는 부분이 있으면 error를 발생하도록 함.
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var isDuplicate = false;
            // adata.rows[1] : service_name
            if ( adata.rows.length > 0 ){
                if ( self.mode == 'Add' ){
                    isDuplicate = true;
                } else {
                    if(this.select_servicename == adata.rows[0][1]){
                        this.update();
                    } else{
                        isDuplicate = true;
                    }
                }

                if ( isDuplicate ){
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Service name is duplicated.'));
                    this.OKButton.setDisabled(false);
                    self.serviceNameEdit.focus() ;
                }

            }else{
                if ( this.mode == 'Add' ){
                    this.save() ;
                }else{
                    this.update() ;
                }
            }
            serviceName = null ;
            select_count = null ;
        }, this);
    }
});
