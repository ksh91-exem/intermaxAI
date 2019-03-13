Ext.define('view.EtoEResponseTime', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    style: {
        background: '#cccccc'
    },
    sql: {
        responseTime: 'IMXPA_EtoEResponseTime.sql'
    },
    cls: 'list-condition Exem-FormOnCondition',
    DisplayTime: DisplayTimeMode.HM,

    init: function() {
        var fDate = new Date((new Date()) - 20 * 60 * 1000);
        var tDate = new Date();
        var tierName = [], mca, ap, other;

        if (typeof Comm.sortTierInfo === 'object') {
            tierName.push(this.tierInfo(1), this.tierInfo(2), this.tierInfo(3));
        }

        mca = !(tierName[0]) ? 'MCA' : tierName[0];
        ap = !(tierName[1]) ? 'AP' : tierName[1];
        other = !(tierName[2]) ? 'FEP' : tierName[2];
        this.mca = mca + '&#160;' +  common.Util.CTR('Response Time');
        this.ap = ap + '&#160;' +  common.Util.CTR('Response Time');
        this.other = other + '&#160;' +  common.Util.CTR('Response Time');

        this.setWorkAreaLayout('vbox');
        this.condition_layout();
        this.create_grid();

        fDate.setSeconds(0);
        fDate.setMilliseconds(0);

        tDate.setSeconds(0);
        tDate.setMilliseconds(0);

        this.datePicker.mainFromField.setValue(this.datePicker.dataFormatting(fDate, this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue(this.datePicker.dataFormatting(tDate, this.datePicker.DisplayTime));

    },

    tierInfo: function(num) {
        var tierInfo = Comm.sortTierInfo;
        var tierId = tierInfo.findIndex(function(x) {
            return x.tierId === num;
        });
        if (tierId === -1) {
            return '';
        }
        return tierInfo[tierId].tierName;
    },

    condition_layout: function() {
        var self = this;
        var elapseTideLabel = Ext.create('Ext.form.Label', {
            x: 1061,
            y: 10,
            text: '~'
        });

        var infinityBtn = Ext.create('Exem.Container', {
            x: 1125,
            y: 10,
            width: 18,
            html: '<img src="../images/infinity.png" class="res-inspector-infinity-btn"/>',
            listeners: {
                render: function() {
                    this.getEl().addListener('click', function() {
                        self.maxElapseField.setValue(common.Util.TR('infinite'));
                    });
                }
            }
        });

        this.cbxWasDBHost = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 280,
            comboLabelWidth : 60,
            comboWidth      : 220,
            fieldLabel      : common.Util.TR('TP'),
            selectType      : common.Util.TR('TP'),
            multiSelect     : true,
            x               : 320,
            y               : 5,
            linkMonitorType : 'TP'
        });

        this.rdoServerTypeField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            labelWidth  : 40,
            x           : 580,
            y           : 5
        });

        this.rdoServerTypeField.add([
            this.addRadioBtn('servergroup', 'total', 'ALL', 90, false, '0', 'server'),
            this.addRadioBtn('servergroup', 'tp_type', 'TP', 90, false, '1', 'server'),
            this.addRadioBtn('servergroup', 'cd_type', 'C_Daemon', 90, false, '15', 'server')
        ]);
        this.rdoServerTypeField.items.items[0].setValue(true);

        this.minElapseField = Ext.create('Exem.NumberField', {
            x: 905,
            y: 5,
            width: 150,
            fieldLabel: common.Util.CTR('Turn Around Time'),
            labelWidth: 100,
            fieldStyle: 'text-align: right;',
            value: 0,
            maxLength: 9,
            hideTrigger: true,
            decimalPrecision: 3,
            allowExponential: false
        });

        this.maxElapseField = Ext.create('Exem.TextField', {
            x: 1072,
            y: 5,
            width: 50,
            labelWidth: 0,
            fieldStyle: 'text-align: right;',
            value: common.Util.CTR('infinite'),
            maxLength: 9
        });


        this.txnName = Ext.create('Exem.TextField', {
            x: 25,
            y: 32,
            fieldLabel: '',
            itemId: 'txn_name',
            labelAlign: 'right',
            labelWidth: 90,
            width : 260,
            allowBank: false,
            value: common.Util.TR('Transaction'),
            listeners: {
                focus: function() {
                    if (this.getValue() === '%' || this.getValue() === common.Util.TR('Transaction')) {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if (this.getValue() === '%') {
                        this.setValue(common.Util.TR('Transaction'));
                    }
                }
            }
        });

        this.clientIP = Ext.create('Exem.TextField', {
            x: 390,
            y: 32,
            fieldLabel: '',
            itemId: 'client_ip',
            labelAlign: 'right',
            labelWidth: 100,
            width : 260,
            allowBank: false,
            value : common.Util.TR('Client IP'),
            listeners: {
                focus: function() {
                    if (this.getValue() === common.Util.TR('Client IP')) {
                        this.setValue();
                    }
                },
                blur: function() {
                    if (this.getValue() === '') {
                        this.setValue(common.Util.TR('Client IP'));
                    }
                }
            }
        });

        this.txnCode = Ext.create('Exem.TextField', {
            x: 1010,
            y: 32,
            fieldLabel: '',
            itemId: 'transaction_code',
            labelAlign: 'right',
            labelWidth: 100,
            width: 260,
            allowBank: false,
            value: common.Util.TR('Transaction Code'),
            listeners: {
                focus: function() {
                    if (this.getValue() === '%' || this.getValue() === common.Util.TR('Transaction Code')) {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if (this.getValue() === '%') {
                        this.setValue(common.Util.TR('Transaction Code'));
                    }
                }
            }
        });

        this.conditionArea.add([this.cbxWasDBHost, this.rdoServerTypeField, this.txnName, this.clientIP, this.txnCode, this.minElapseField, elapseTideLabel, this.maxElapseField, infinityBtn]);
    },

    create_grid: function() {
        var self = this;
        var create_time_line = function(value, meta) {
            meta.tdCls = meta.tdCls + 'customContentCell';
            return '';
        };

        var pnl = Ext.create('Exem.Container',{
            itemId: 'pnl',
            layout : {
                type : 'hbox',
                pack : 'end'
            },
            width : '100%',
            height: 20,
            items : [{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#FFE699' }
            },{
                xtype: 'label',
                text :  common.Util.TR('Client Time'),
                margin: '-1 10 10 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#F4B183' }
            },{
                xtype: 'label',
                text : this.mca.replace('&#160;', ' '),
                margin: '-1 10 10 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#1F4E79' }
            },{
                xtype: 'label',
                text : this.ap.replace('&#160;', ' '),
                margin: '-1 10 10 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#A9D18E' }
            },{
                xtype: 'label',
                text : this.other.replace('&#160;', ' '),
                margin: '-1 10 10 0'
            }]
        });

        this.grid = Ext.create('Exem.BaseGrid', {
            itemId: 'ex-grid',
            gridType: Grid.exGrid,
            adjustGrid: true,
            useArrows: true,
            defaultbufferSize: 1000,
            defaultPageSize: 40,
            gridName: 'timeline-grid'
        });

        this.workArea.add(pnl, this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.CTR('Transaction')           , 'txn_name'        , 200, Grid.String  , true , false);
        this.grid.addColumn(common.Util.CTR('Client IP')             , 'client_ip'       , 120, Grid.String  , true , false);
        this.grid.addColumn(common.Util.CTR('Business')              , 'business_name'   , 130, Grid.String  , true , false);
        this.grid.addColumn(common.Util.CTR('Transaction Code')      , 'tx_code'         , 80 , Grid.String  , true , false);
        this.grid.addColumn(common.Util.CTR('Client Time')           , 'client_elapse'   , 90 , Grid.Float   , true , false);
        this.grid.addColumn(this.mca                                 , 'mca_elapse'      , 90 , Grid.Float   , true , false);
        this.grid.addColumn(this.ap                                  , 'ap_elapse'       , 90 , Grid.Float   , true , false);
        this.grid.addColumn(this.other                               , 'fep_elapse'      , 90 , Grid.Float   , true , false);
        this.grid.addColumn(common.Util.CTR('Turn Around Time')      , 'turn_around_time', 80 , Grid.Number  , true , false);
        this.grid.addColumn(common.Util.CTR('Response Time Sum')     , 'response_sum'    , 80 , Grid.Float   , true , false);
        this.grid.addColumn(common.Util.CTR('Response Time Diff')    , 'response_diff'   , 80 , Grid.Float   , true , false);
        this.grid.addColumn(common.Util.CTR('Exception Count')       , 'exception_count' , 60 , Grid.Number  , true , false);
        this.grid.addColumn(common.Util.CTR('Start Time')            , 'start_time'      , 140, Grid.DateTime, true , false);
        this.grid.addColumn(common.Util.CTR('Time Line')             , 'time_line'       , 220, Grid.String  , true , false);
        this.grid.addColumn('TID'                                    , 'tid'             , 80 , Grid.String  , false, false);
        this.grid.addColumn(''                                       , 'txn_elapse'      , 1  , Grid.String  , false, true);
        this.grid.addColumn(''                                       , 'txn_elapse_us'   , 1  , Grid.String  , false, true);
        this.grid.addColumn(''                                       , 'was_id'          , 1  , Grid.String  , false, true);
        this.grid.addColumn(''                                       , 'was_name'        , 1  , Grid.String  , false, true);
        this.grid.addColumn(''                                       , 'time'            , 1  , Grid.String  , false, true);
        this.grid.addColumn('GUID'                                   , 'guid'            , 80 , Grid.String  , false, false);
        this.grid.addColumn('PUSHID'                                 , 'push_id'         , 80 , Grid.String  , false, false);
        this.grid.endAddColumns();
        this.grid.addRenderer('time_line'                            , create_time_line, RendererType.bar);

        this.grid.addEventListener(
            'celldblclick', function(grid, td, cellIndex, record) {
                var dataIndex = grid.headerCt.gridDataColumns[cellIndex].dataIndex;
                if (dataIndex ===  'txn_name') {
                    self.openTxnDetail(record.data);
                }
            }
        );

        this.grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                self.openTxnDetail((this.up().record));
            }
        }, 0);
    },

    executeSQL: function() {
        if (!this.check_validate()) {
            return;
        }
        this.loadingMask.showMask();
        this.get_data();
    },

    check_validate: function() {
        if (this.clientIP.getRawValue() === common.Util.TR('Client IP')) {
            return true;
        }

        if (this.clientIP.getRawValue().split('.').length !== 4) {
            common.Util.showMessage(common.Util.TR('ERROR'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                return false;
            });
            return false;
        }

        return true;
    },

    get_data: function() {
        var self = this;
        var action_value = this.txnName.getValue();
        var ip_value = this.clientIP.getValue();
        var code_value = this.txnCode.getValue();

        if (action_value === common.Util.TR('Transaction')) {
            action_value = '';
        } else {
            action_value = 'and a.txn_name like \'' + action_value + '\'';
        }

        if (ip_value === common.Util.TR('Client IP')) {
            ip_value = '';
        } else {
            ip_value = 'and a.client_ip = \'' + ip_value + '\'';
        }

        if (code_value === common.Util.TR('Transaction Code')) {
            code_value = '';
        } else {
            code_value = 'and a.tx_code like \'' + code_value + '\'';
        }

        this.minElapse = parseFloat(this.minElapseField.getValue());

        if (this.maxElapseField.getValue() !== common.Util.TR('infinite')) {
            this.maxElapse = parseFloat(this.maxElapseField.getValue());
        } else {
            this.maxElapse = 100000000;
        }

        WS.SQLExec({
            sql_file: this.sql.responseTime,
            bind: [{
                name: 'from_time', type: SQLBindType.STRING,
                value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00'
            }, {
                name: 'to_time', type: SQLBindType.STRING,
                value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00'
            }, {
                name: 'minElapse', type: SQLBindType.FLOAT,
                value: this.minElapse
            }, {
                name: 'maxElapse', type: SQLBindType.FLOAT,
                value: this.maxElapse
            }],
            replace_string: [{
                name: 'condition_where',
                value: action_value + ip_value + code_value
            },{
                name: 'was_id',
                value: this.cbxWasDBHost.getValue()
            }]
        }, this.grid_data, this);
    },

    checkValid: function() {
        var minElapse = this.minElapseField.getValue(),
            maxElapse = this.maxElapseField.getValue();

        if (isNaN(minElapse)) {
            this.minElapseField.setValue(0);
        }
        if (isNaN(maxElapse)) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
            maxElapse = 99999999999;
        }

        if (minElapse > maxElapse) {
            this.minElapseField.markInvalid('');
            this.maxElapseField.markInvalid('');
            Ext.msg.alert(common.Util.TR('ERROR'), common.Util.TR('Minimum elapse time cannot be greater than maximum elapse time.'));
            return false;
        }
        return true;
    },

    getSum: function(total, num) {
        return total + num;
    },

    grid_data: function(header, data) {
        var self = this;
        var ix, retText;
        var client_elapse, mca_elapse, ap_elapse, fep_elapse;
        var response_sum, response_diff, turn_around_time;

        this.grid.clearRows();

        if (self.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.loadingMask.hide();

            console.debug('responseTime-grid_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        for (ix = 0; ix < data.rows.length; ix++) {
            client_elapse = data.rows[ix][2]; // Math.random() * 10;
            client_elapse.toFixed(3);
            mca_elapse = data.rows[ix][3];
            mca_elapse.toFixed(3);
            ap_elapse  = data.rows[ix][4];
            ap_elapse.toFixed(3);
            fep_elapse = data.rows[ix][5];
            fep_elapse.toFixed(3);

            retText = client_elapse + '/' + mca_elapse + '/' + ap_elapse + '/' + fep_elapse;

            turn_around_time = data.rows[ix][10] || 0.000;
            response_sum  = client_elapse + mca_elapse + ap_elapse + fep_elapse;
            response_diff = turn_around_time - response_sum;

            this.grid.addRow([
                data.rows[ix][18]                         // 'txn_name'
                , data.rows[ix][12]                       // 'client_ip'
                , data.rows[ix][24]                       // 'business_name'
                , data.rows[ix][14]                       // 'tx_code'
                , client_elapse || 0.000                  // 'client_elapse'
                , mca_elapse || 0.000                     // 'mca_elapse'
                , ap_elapse  || 0.000                     // 'ap_elapse'
                , fep_elapse || 0.000                     // 'fep_elapse'
                , turn_around_time                        // 'turn_around_time'
                , response_sum                            // 'response_sum'
                , response_diff                           // 'response_diff'
                , data.rows[ix][11]                       // 'exception_count'
                , common.Util.getDate(data.rows[ix][17])  // 'start_time'
                , retText                                 // 'time_line'
                , data.rows[ix][16]                       // 'tid'
                , data.rows[ix][19]                       // 'txn_elapse'
                , data.rows[ix][20]                       // 'txn_elapse_us'
                , data.rows[ix][21]                       // 'was_id'
                , data.rows[ix][22]                       // 'was_name'
                , data.rows[ix][23]                       // 'time'
                , data.rows[ix][0]                        // 'guid'
                , data.rows[ix][1]                        // 'push_id'

            ]);
        }

        this.grid.pnlExGrid.getView().on('refresh', function() {

            var recordIdx, record, grid_row, el;
            var client_per, mca_per, ap_per, fep_per;
            var bg, client, mca, ap, fep;
            var sum, val, tierValue = [];

            this.starttime = null;

            for (recordIdx = 0; recordIdx < this.grid.pnlExGrid.store.getCount(); recordIdx++) {
                record = this.grid.pnlExGrid.store.getAt(recordIdx);
                val = record.data;

                if (Number(data.tid) === 0) {
                    this.starttime = record.data.start_time;
                }

                grid_row = this.grid.pnlExGrid.view.getNode(record);
                if (grid_row && Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0]) {
                    el = Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0].children;
                } else {
                    return;
                }

                if ( el[0].getElementsByClassName('quick-tip').length > 0 ) {
                    return;
                }

                tierValue.push(val['client_elapse'], val['mca_elapse'], val['ap_elapse'], val['fep_elapse']);

                sum = tierValue.reduce(this.getSum, 0);
                client_per = (val['client_elapse'] / sum) * 100;
                mca_per = (val['mca_elapse'] / sum) * 100;
                ap_per = (val['ap_elapse'] / sum) * 100;
                fep_per = (val['fep_elapse'] / sum) * 100;

                bg  = document.createElement('div');
                client = document.createElement('div');
                mca = document.createElement('div');
                ap = document.createElement('div');
                fep = document.createElement('div');

                client.setAttribute('class', 'quick-tip');
                mca.setAttribute('class', 'quick-tip');
                ap.setAttribute('class', 'quick-tip');
                fep.setAttribute('class', 'quick-tip');
                client.setAttribute('data-tab', self.id);
                mca.setAttribute('data-tab', self.id);
                ap.setAttribute('data-tab', self.id);
                fep.setAttribute('data-tab', self.id);

                bg.style.width = '100%';
                bg.style.height = '100%';
                bg.style.marginTop = '-12px';

                client.style.width = (client_per) + '%';
                client.style.height = '10px';
                client.style.backgroundColor = '#FFE699';
                client.style.float = 'left';

                mca.style.width = (mca_per) + '%';
                mca.style.height = '10px';
                mca.style.backgroundColor = '#F4B183';
                mca.style.float = 'left';

                ap.style.width = (ap_per) + '%';
                ap.style.height = '10px';
                ap.style.backgroundColor = '#1F4E79';
                ap.style.float = 'left';

                fep.style.width = (fep_per) + '%';
                fep.style.height = '10px';
                fep.style.backgroundColor = '#A9D18E';
                fep.style.float = 'left';

                el[0].appendChild(bg);

                bg.appendChild(client);
                bg.appendChild(mca);
                bg.appendChild(ap);
                bg.appendChild(fep);

                bg = null;
                mca = null;
                ap = null;
                fep = null;
                sum = 0;
                tierValue = [];
                self.create_tooltip(record);
            }
        }.bind(this));

        this.grid.drawGrid();
        this.loadingMask.hide();
        ix = null;
    },

    openTxnDetail: function(record) {
        var type, params, txnView, mainTab;
        var wasObj = Comm.wasInfoObj[record.was_id];

        if (!wasObj) {
            console.debug('Check Monitor Type and Server Info Object.');
            return;
        }
        type = wasObj.type;
        params = {
            title : type + '&#160;' + common.Util.TR('Transaction Detail'),
            endTime: record.time,
            wasId: record.was_id,
            name: record.was_name,
            txnName: record.txn_name,
            tid: record.tid,
            startTime: record.start_time,
            elapseTime : (type === 'CD') ? record.txn_elapse_us : record.txn_elapse ,
            gid: record.guid,
            monitorType : type,
            socket: WS
        };

        txnView = Ext.create('view.TransactionDetailView', params);
        mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTab.add(txnView);
        mainTab.setActiveTab(mainTab.items.length - 1);
        txnView.init();
    },

    create_tooltip: function(record) {

        var self = this;
        var ix, elems, elems_arr = [];
        var rect, left_loc, bottom_loc;

        this.tip      = document.createElement('div');
        this.bodytime = document.createElement('div');

        this.client_name = document.createElement('div');
        this.client_rec  = document.createElement('div');

        this.mca_name  = document.createElement('div');
        this.mca_rec   = document.createElement('div');

        this.ap_name  = document.createElement('div');
        this.ap_rec   = document.createElement('div');

        this.fep_name  = document.createElement('div');
        this.fep_rec   = document.createElement('div');

        if ( self.tip.getAttribute('data-tab') == null ) {
            self.tip.setAttribute('data-tab', self.id);
        }

        elems = document.getElementsByClassName('quick-tip');
        for (ix = 0; ix < elems.length; ix++) {
            if ( (elems[ix].getAttribute('data-tab') !== self.id) || (elems[ix].getAttribute('data-tool-tip') !== null) ) {
                continue;
            }
            elems[ix].setAttribute('data-tool-tip', 'true');
            elems_arr.push( elems[ix] );
        }

        for (ix = 0; ix < elems_arr.length; ix++ ) {
            elems_arr[ix].addEventListener('mouseover', doTip.bind(record), false);
            elems_arr[ix].addEventListener('mouseout' , doTip.bind(record), true);
        }

        elems_arr = null;

        function doTip(e) {
            var elem = e.toElement;
            var val = record.data;

            if (self.tip.getAttribute('data-tip-on') === null) {
                self.tip.setAttribute('data-tip-on', 'false');
            }

            if (self.tip.getAttribute('data-tab') !== self.id) {
                return;
            }

            if (self.tip.getAttribute('data-tip-on') === 'false') {

                self.tip.setAttribute('data-tip-on', 'true');

                rect = elem.parentNode.getBoundingClientRect();
                left_loc = rect.left;
                bottom_loc = rect.bottom;

                if (bottom_loc > 723) {
                    bottom_loc =  bottom_loc - 140;
                }

                self.tip.innerHTML = elem.getAttribute('data-tip');
                self.tip.style.top =  bottom_loc  + 'px';
                self.tip.style.left = (left_loc) + 'px';
                self.tip.style.height = 90 + 'px';
                self.tip.style.border = 1 + 'px';
                self.tip.style.zIndex = 100;
                self.tip.setAttribute('class','tip-box');

                self.bodytime.style.top = rect.bottom + 10 + 'px';
                self.bodytime.style.fontWeight = 'bold';
                self.bodytime.style.size = '13px';
                self.bodytime.setAttribute('class', 'tip-title');

                self.client_name.setAttribute('class', 'tip-title');
                self.client_rec .setAttribute('class', 'tip-tra-rec');
                self.client_name.innerHTML = common.Util.TR('Client Time') + ' : ' + val['client_elapse'].toFixed(3);

                self.mca_name.setAttribute('class', 'tip-title');
                self.mca_rec .setAttribute('class', 'tip-rec-rec');
                self.mca_name.innerHTML = self.mca + ' : ' +  val['mca_elapse'].toFixed(3);

                self.ap_name.setAttribute('class', 'tip-title');
                self.ap_rec .setAttribute('class', 'tip-net-rec');
                self.ap_name.innerHTML = self.ap + ' : ' + val['ap_elapse'].toFixed(3);

                self.fep_name.setAttribute('class', 'tip-title');
                self.fep_rec .setAttribute('class', 'tip-ser-rec');
                self.fep_name.innerHTML = self.other + ' : ' + val['fep_elapse'].toFixed(3);

                self.tip.appendChild(self.client_rec);
                self.tip.appendChild(self.client_name);

                self.tip.appendChild(self.mca_rec);
                self.tip.appendChild(self.mca_name);

                self.tip.appendChild(self.ap_rec);
                self.tip.appendChild(self.ap_name);

                self.tip.appendChild(self.fep_rec);
                self.tip.appendChild(self.fep_name);

                document.body.appendChild(self.tip);
            } else {
                self.tip.setAttribute('data-tip-on', 'false');
                if (self.tip.parentNode === undefined) {
                    self.tip.remove();
                } else {
                    self.tip.parentNode.removeChild(self.tip);
                }
            }
        }

        ix = null;
        elems = null;
    },

    addRadioBtn: function(name, itemId, label, width, checked, typeValue, type, hidden) {
        var radioBtn;
        radioBtn = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR(label),
            itemId: itemId,
            width: width,
            name: this.id + '_' + name,
            inputValue : typeValue,
            checked: checked,
            hidden : hidden,
            listeners: {
                change: function(field) {
                    var selectType, selectRadioType;
                    if (type === 'server' && field.getValue()) {
                        selectType = field.boxLabel;
                        selectRadioType = (selectType === common.Util.TR('C_Daemon')) ? 'CD' : field.boxLabel;

                        this.cbxWasDBHost.setDisabled(false);
                        this.cbxWasDBHost.WASDBCombobox.setFieldLabel(selectType);
                        this.cbxWasDBHost.selectType = (selectType === common.Util.TR('ALL')) ? 'MultiTotal' : common.Util.TR(selectType);
                        this.cbxWasDBHost.selectRadioType = selectRadioType;
                        this.cbxWasDBHost._getServiceInfo();
                    }
                }.bind(this)
            }
        });
        return radioBtn;
    }
});
