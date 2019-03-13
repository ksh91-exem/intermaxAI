Ext.define('config.config_alert_disk_form', {
    extend: 'Exem.Form',
    parent: null,
    mode: '',

    init: function() {
        var self = this;

        var form = Ext.create('Exem.Window', {
            layout     : 'vbox',
            maximizable: false,
            width      : 910,
            height     : 400,
            resizable  : false,
            title      : common.Util.TR('Disk Usage Alert Configuration'),
            bodyStyle  : { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        self.form = form;

        var centerPanel = Ext.create('Ext.panel.Panel', {
            layout   : 'vbox',
            cls      : 'x-config-used-round-panel',
            width    : '100%',
            flex     : 1,
            margin   : '4 4 4 4',
            border   : false,
            bodyStyle: { background: '#eeeeee' }
        });

        var listPanel = Ext.create('Ext.panel.Panel', {
            layout   : 'hbox',
            width    : '100%',
            height   : 24,
            border   : false,
            bodyStyle: { background: '#dddddd' }
        });

        var listLabel = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            margin   : '4 0 0 4',
            html: Comm.RTComm.setFont(9, common.Util.TR('Disk Usage Alert List'))
        });

        var gridPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.disk_grid = Ext.create('Exem.adminGrid', {
            id                 : 'alert_disk_form_grid',
            flex               : 1,
            width              : '100%',
            border             : false,
            editMode           : true,
            useCheckBox        : false,
            checkMode          : Grid.checkMode.SINGLE,
            showHeaderCheckbox : false,
            rowNumber          : true,
            localeType         : 'H:i:s',
            stripeRows         : true,
            defaultHeaderHeight: 26,
            usePager           : false,
            defaultbufferSize  : 300,
            defaultPageSize    : 300,
            cellclick: function(dv, td, cellIndex, record, tr, rowIndex) {
                console.debug('cellIndex', cellIndex);
                console.debug('self.grid._columns', this.disk_grid._columns[cellIndex]);

                this.row_index = rowIndex ;
                if ( cellIndex === 7 ){
                    var sms_form = Ext.create('config.config_alert_smsschedulemgr');
                    sms_form.init(self);
                }else if ( cellIndex === 8 ){
                    this.disk_grid.items.items[0].store.data.items[this.row_index].raw.sms = '' ;
                    this.disk_grid.drawGrid() ;
                }


            }.bind(this)
        });

        gridPanel.add(this.disk_grid);

        var editOption = {
            maxLength : 2,
            enforceMaxLength : true,
            minValue : 1
        };

        this.disk_grid.beginAddColumns();
        this.disk_grid.addColumn({text: common.Util.CTR('Mount Name'),       dataIndex: 'mount_name',             width: 130, type: Grid.String, alowEdit: false, editMode: false});
        this.disk_grid.addColumn({text: common.Util.CTR('File System'),      dataIndex: 'file_system', width: 190, type: Grid.String, alowEdit: false, editMode: false});
        this.disk_grid.addColumn({text: common.Util.CTR('Warning') + '(%)',  dataIndex: 'warning',              width:  80, type: Grid.Number, alowEdit: true , editMode: true, editOption: editOption});
        this.disk_grid.addColumn({text: common.Util.CTR('Critical') + '(%)', dataIndex: 'critical',             width:  80, type: Grid.Number, alowEdit: true , editMode: true, editOption: editOption});
        this.disk_grid.addColumn({text: common.Util.CTR('Check Time(m)'),    dataIndex: 'check_time',           width:  115, type: Grid.Number, alowEdit: true, editMode: true, editOption: editOption});
        this.disk_grid.addColumn({text: common.Util.CTR('SMS Schedule'),     dataIndex: 'sms',                  width: 130, type: Grid.String, alowEdit: false, editMode: false});
        this.disk_grid.addColumn({text: common.Util.CTR(''),                 dataIndex: 'set_sms',              width: 60 , type: Grid.String, alowEdit: false, editMode: false, renderer: self.renderSMS.bind(self)});
        this.disk_grid.addColumn({text: common.Util.CTR(''),                 dataIndex: 'clear_sms',            width: 70 , type: Grid.String, alowEdit: false, editMode: false});


        this.disk_grid._columns[8].renderer = self.renderSMS_clear.bind(self) ;
        this.disk_grid.endAddColumns();
        this.disk_grid.clearRows();
        for ( var ix = 0 ; ix < self.parent.DiskGrid._data.rootItems.length; ix++ ){
            var d = self.parent.DiskGrid._data.rootItems[ix] ;
            this.disk_grid.addRow([
                d.mount_name,
                d.file_system,
                d.warning,
                d.critical,
                d.check_time,
                d.sms
            ]);
            this.disk_grid.drawGrid();
        }

        var buttonPanel = Ext.create('Ext.panel.Panel', {
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

        var OKButton = Ext.create('Ext.button.Button', {
            text: 'OK',
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.save();
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

        form.add(centerPanel);
        form.add(buttonPanel);

        centerPanel.add(listPanel);
        centerPanel.add(gridPanel);

        listPanel.add( listLabel );

        buttonPanel.add(OKButton);
        buttonPanel.add(this.CancelButton);

        form.show();
    },

    renderSMS : function (value, meta) {
        meta.style = 'text-align: center';
        meta.tdCls = 'config_alert_pool_grid_renderer';
        return 'Set SMS' ;
    },

    renderSMS_clear: function( value, meta){
        meta.style = 'text-align: center';
        meta.tdCls = 'config_alert_pool_grid_renderer';
        return 'Clear SMS' ;
    } ,


    onRefresh: function() {
        var dataSet = {};

        dataSet.replace_string = [];

        if (cfg.alert.sltId) {
            dataSet.replace_string.push({
                name: 'host_ip',
                value: cfg.alert.sltId
            });
        }

        dataSet.sql_file = 'IMXConfig_DiskAlert.sql';
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            this.disk_grid.clearRows();
            for (var ix = 0; ix < adata.rows.length; ix++) {
                this.disk_grid.addRow([
                    adata.rows[ix][0],  // mount_name
                    adata.rows[ix][1],  // file_system
                    adata.rows[ix][2],  // warning_value
                    adata.rows[ix][3],  // critical_value
                    adata.rows[ix][4],  // interval
                    adata.rows[ix][5]  // sms_schedule_name
                ]);
            }
            this.disk_grid.drawGrid();
        }, this);
    },

    save: function() {
        var data;
        var ix,ixLen,jx,jxLen;
        var self = this;
        var arr_d = [] ;
        var check_time;
        var arr_check_time = [] ;

        for (ix = 0,ixLen = this.disk_grid.getRowCount(); ix < ixLen; ix++) {
            data = this.disk_grid.getRow(ix).data;
            data.count = ix;
            data.end_count = this.disk_grid.getRowCount() -1;
            data.self = self;

            //데이터 체크(경고)
            if(data.warning === '' || data.warning === null){
                data.warningCheck = null;
            } else{
                data.warningCheck ='data_in';
            }

            //데이터 체크(심각)
            if(data.critical === '' || data.critical === null){
                data.criticalCheck = null;
            } else{
                data.criticalCheck ='data_in';
            }

            //데이터 체크(기간)
            if(data.check_time === '' || data.check_time === null){
                data.timeCheck = null;
            } else{
                data.timeCheck ='data_in';
            }

            // 경고,심각이 입력되고 경고가 심각보다 높을경우
            if((data.warningCheck !== null) && (data.criticalCheck !== null) && (data.critical <= data.warning)){
                Ext.Msg.alert('Error', common.Util.TR('Put a value greater than a warning to critical.'));
                return;
            }

            // 그리드 안의 데이터를 체크 false 를 넘겨받으면 return
            if(!self.gridCheck(data)){
                return;
            }

            // 그외는 정상 입력
            arr_d.push(data);

            //변경사항 : 체크 기간이 호스트목록 기준으로 입력이 된다고 함
            //그러므로 체크기간이 모두 동일해야한다.
            if(arr_d[ix].timeCheck !== null){
                check_time = arr_d[ix].check_time;
                arr_check_time.push(check_time);
            }

            //체크기간이 모두 동일한지 확인
            if(data.count === data.end_count){
                for (jx = 0,jxLen = arr_check_time.length; jx < jxLen; jx++) {
                    if(arr_check_time[0] != arr_check_time[jx]){
                        Ext.Msg.alert('Error', common.Util.TR('Please enter the same CheckTime'));
                        return;
                    }
                }
            }
        }

        for (ix = 0, ixLen = arr_d.length; ix < ixLen; ix++) {
            config.ConfigEnv.group_flag = false;
            config.ConfigEnv.delete_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', arr_d[ix].mount_name, this.completeDelete, arr_d[ix]);
        }

        self.form.close();
    },

    completeDelete : function(){
        var set_value = this.set_value;
        //경고,심각,기간이 입력이 되야 insert 작업을 실행
        if(set_value.warningCheck !== null && set_value.criticalCheck !== null && set_value.timeCheck !== null){
            config.ConfigEnv.insert_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', set_value.mount_name, set_value.sms);
            config.ConfigEnv.insert_tag_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', set_value.mount_name, 'CRITICAL_VALUE', set_value.critical);
            config.ConfigEnv.insert_tag_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', set_value.mount_name, 'WARNING_VALUE', set_value.warning);
            config.ConfigEnv.insert_tag_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', set_value.mount_name, 'HOST_IP', cfg.alert.sltId);
            config.ConfigEnv.insert_tag_config(cfg.alert.sltHostId, 'HOST', 'File System Alert', set_value.mount_name, 'INTERVAL', set_value.check_time * 60);
        }
        if(set_value.count === set_value.end_count){
            setTimeout(function(){
                set_value.self.parent.onRefresh(true);
            },100);
        }
    },

    setSMSScheduleName: function(_sms_) {
        this.disk_grid.items.items[0].store.data.items[this.row_index].raw.sms = _sms_ ;
        this.disk_grid.drawGrid() ;
    },

    gridCheck: function(data){
        // Warning, Critical, check_time 이 입력되지 않았을 경우 error 처리.
        // 기간만 입력될 경우
        if (data.warningCheck === null && data.criticalCheck === null && data.timeCheck !== null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 심각만 입력될 경우
        if (data.warningCheck === null && data.criticalCheck !== null && data.timeCheck === null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 기간,심각 입력될 경우
        if (data.warningCheck === null && data.criticalCheck !== null && data.timeCheck !== null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 경고만 입력될 경우
        if (data.warningCheck !== null && data.criticalCheck === null && data.timeCheck === null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 경고,기간 입력될 경우
        if (data.warningCheck !== null && data.criticalCheck === null && data.timeCheck !== null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 심각,기간 입력될 경우
        if (data.warningCheck !== null && data.criticalCheck !== null && data.timeCheck === null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 값이 입력이 안된상태에서 SMS스케줄을 넣을 경우
        if ((data.warningCheck === null || data.criticalCheck === null || data.timeCheck === null) && data.sms !== ''){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        return true;
    }
});
