Ext.define('config.config_alert_poolalert_form', {
    extend: 'Exem.Form',

    parent: null,
    mode: '',

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout     : 'vbox',
            maximizable: false,
            width      : 910,
            height     : 400,
            resizable  : false,
            title      : common.Util.TR('Connection Pool Alert Configuration'),
            bodyStyle  : { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        self.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout   : 'vbox',
            cls      : 'x-config-used-round-panel',
            width    : '100%',
            flex     : 1,
            margin   : '4 4 4 4',
            border   : false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout   : 'hbox',
            width    : '100%',
            height   : 24,
            border   : false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Connection Pool Alert List'))
        });

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.grid = Ext.create('Exem.adminGrid', {
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
                console.debug('self.grid._columns', self.grid._columns[cellIndex]);

                this.row_index = rowIndex ;
                if ( cellIndex == 8 ){
                    var sms_form = Ext.create('config.config_alert_smsschedulemgr');
                    sms_form.init(self);
                }else if ( cellIndex == 9 ){
                    this.grid.items.items[0].store.data.items[this.row_index].raw.sms = '' ;
                    this.grid.drawGrid() ;
                }


            }.bind(this)
        });
        panelA2.add(this.grid);

        var editOption = {
            maxLength : 2,
            enforceMaxLength : true,
            minValue : 1
        };

        self.grid.beginAddColumns();
        self.grid.addColumn({text: common.Util.CTR('Agent ID'),          dataIndex: 'was_id',               width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        self.grid.addColumn({text: common.Util.CTR('Agent Name'),        dataIndex: 'was_name',             width: 130, type: Grid.String, alowEdit: false, editMode: false});
        self.grid.addColumn({text: common.Util.CTR('Connect Pool Name'), dataIndex: 'connection_pool_name', width: 200, type: Grid.String, alowEdit: false, editMode: false});
        self.grid.addColumn({text: common.Util.CTR('Warning'),           dataIndex: 'warning',              width:  80, type: Grid.Number, alowEdit: true , editMode: true, editOption: editOption});
        self.grid.addColumn({text: common.Util.CTR('Critical'),          dataIndex: 'critical',             width:  80, type: Grid.Number, alowEdit: true , editMode: true, editOption: editOption});
        self.grid.addColumn({text: common.Util.CTR('Max Conn'),          dataIndex: 'maxconn',              width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        self.grid.addColumn({text: common.Util.CTR('SMS Schedule'),      dataIndex: 'sms',                  width: 141, type: Grid.String, alowEdit: false, editMode: false});
        self.grid.addColumn({text: common.Util.CTR(''),                  dataIndex: 'set_sms',              width: 60 , type: Grid.String, alowEdit: false, editMode: false, renderer: self.renderSMS.bind(self)});
        self.grid.addColumn({text: common.Util.CTR(''),                  dataIndex: 'clear_sms',            width: 70 , type: Grid.String, alowEdit: false, editMode: false});
        /*
         * 1504.2 종호왈: 렌더러는 컬럼을 save하지않는한 저렇게써도되고 아래처럼써도되고 addRenderer해도 된댄다.
         * 하하하하하하
         * */
        self.grid._columns[9].renderer = self.renderSMS_clear.bind(self) ;
        self.grid.endAddColumns();
        self.grid.clearRows();
        for ( var ix = 0 ; ix < self.parent.poolGrid._data.rootItems.length; ix++ ){
            var d = self.parent.poolGrid._data.rootItems[ix] ;
            self.grid.addRow([
                d.was_id,
                d.was_name,
                d.connection_pool_name,
                d.warning,
                d.critical,
                d.maxconn,
                d.sms
            ]);
            self.grid.drawGrid();
        }
        ix = null ;

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


        //

        form.add(panelA);
        form.add(panelC);

        panelA.add(panelA1);
        panelA.add(panelA2);

        panelA1.add( labelA );

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

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
    },

    save: function() {
        var d = null;
        var self = this;
        var arr_d = [] ;

        for (var ix = 0; ix < this.grid.getRowCount(); ix++) {
            d = this.grid.getRow(ix).data;
            d.count = ix;
            d.end_count = this.grid.getRowCount() -1;
            d.self = self;

            //데이터 체크(경고)
            if(d.warning === '' || d.warning === null){
                d.warningCheck = null;
            }else{
                d.warningCheck ='data_in';
            }

            //데이터 체크(심각)
            if(d.critical === '' || d.critical === null){
                d.criticalCheck = null;
            }else{
                d.criticalCheck ='data_in';
            }

            // 그리드 안의 데이터를 체크 false 를 넘겨받으면 return
            if(!self.gridCheck(d)){
                return;
            }

            arr_d.push( d ) ;
            config.ConfigEnv.group_flag = false ;

            config.ConfigEnv.delete_config( d.was_id, 'WAS', 'Connection Pool', d.connection_pool_name, this.poolDelete, d);
        }

        self.form.close();
    },

    poolDelete : function(){
        var d = this.set_value;
        if(d.warningCheck !== null && d.criticalCheck !== null) {
            config.ConfigEnv.insert_config(d.was_id, 'WAS', 'Connection Pool', d.connection_pool_name, d.sms);
            config.ConfigEnv.insert_tag_config(d.was_id, 'WAS', 'Connection Pool', d.connection_pool_name, 'CRITICAL_VALUE', d.critical);
            config.ConfigEnv.insert_tag_config(d.was_id, 'WAS', 'Connection Pool', d.connection_pool_name, 'WARNING_VALUE', d.warning);
        }
        if(d.count === d.end_count){
            setTimeout(function(){
                d.self.parent.onRefresh(true);
            },100);
        }
    },

    gridCheck : function (d) {
        // Warning, Critical이 입력되지 않았을 경우 error 처리.
        // 심각만 입력될 경우
        if (d.warningCheck === null && d.criticalCheck !== null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 경고만 입력될 경우
        if (d.warningCheck !== null && d.criticalCheck === null){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        // 경고,심각이 입력되고 경고가 심각보다 높을경우
        if((d.warningCheck !== null) && (d.criticalCheck !== null) && (d.critical <= d.warning)){
            Ext.Msg.alert('Error', common.Util.TR('Put a value greater than a warning to critical.'));
            return false;
        }
        // 값이 입력이 안된상태에서 SMS스케줄을 넣을 경우
        if ((d.warningCheck === null || d.criticalCheck === null) && d.sms !== ''){
            Ext.Msg.alert('Error', common.Util.TR('Please enter remaining values.'));
            return false;
        }
        return true;
    },

    setSMSScheduleName: function(_sms_) {
        this.grid.items.items[0].store.data.items[this.row_index].raw.sms = _sms_ ;
        this.grid.drawGrid() ;
    }
});
