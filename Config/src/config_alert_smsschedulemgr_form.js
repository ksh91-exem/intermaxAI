Ext.define('config.config_alert_smsschedulemgr_form', {

    parent: null,
    mode: '',
    selectedIndex: -1,
    sms_schedule_name: '',
    scheduleArr: [],
    schedule_cells: [],

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(_state_) {
        var self = this;
        this.mode = _state_;
        this.$container = null;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 700,
            height: 450,
            resizable: false,
            title: common.Util.TR('SMS Schedule Editor'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        self.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 32,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: 150,
            height: '100%',
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 37,
            y: 6,
            html: Comm.RTComm.setFont(9, common.Util.TR('SMS Schedule Name'))
        });

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#ffffff' }
        });

        this.scheduleNameEdit = Ext.create('Ext.form.field.Text', {
            x: 10,
            y: 4,
            width: 300,
            cls: 'login_area_idpweditbox',
            allowBlank: false
        });

        panelA1.add(labelA);
        panelA2.add(this.scheduleNameEdit);

        panelA.add(panelA1);
        panelA.add(panelA2);

        //

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '0 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            flex: 1,
            height: '100%',
            margin: '4 2 4 4',
            border: false,
            bodyStyle: { background: '#f1f1f1' }
        });

        var panelB11 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelB = Ext.create('Ext.form.Label', {
            x: 10,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Weekly Schedule Settings'))
        });

        this.clearLabel = Ext.create('Ext.button.Button', {
            x: 250,
            y: 1,
            html: Comm.RTComm.setFont(9, common.Util.TR('Clear')),
            listeners: {
                click: function() {
                    if (self.$container) {
                        self.initScheduleDataArr();
                        self.schedule_cells.length = 0;
                        self.$container.handsontable('loadData', self.scheduleArr);
                    }
                }
            }
        });

        this.panelB12 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            id: 'cfg_schedule_outer',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#ffffff' }
        });

        this.panelB121 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            x: 50,
            y: 20,
            id: 'cfg_schedule_inner',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#ffffff' }
        });

        this.panelB12.add(this.panelB121);

        var ix;
        var store = Ext.create('Exem.Store');
        store.add({ '1': '--', '2': '--' });

        for (ix = 0; ix < 24; ix++) {
            store.add({
                '1': ix < 10 ? '0' + ix.toString() : ix.toString(),
                '2': ix < 10 ? '0' + ix.toString() : ix.toString()
            });
        }

        this.weekly = [];
        for (ix = 0; ix < 7; ix++) {
            this.weekly[ix] = {
                start: null,
                end: null
            };
        }

        panelB11.add(labelB);
        panelB11.add(this.clearLabel);
        panelB1.add(panelB11);
        panelB1.add(this.panelB12);

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            flex: 1.2,
            height: '100%',
            margin: '4 4 4 2',
            border: false,
            bodyStyle: { background: '#f1f1f1' }
        });

        var panelB21 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelC = Ext.create('Ext.form.Label', {
            x: 10,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Year/Month/Day Schedule Settings'))
        });

        var panelB22 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#ffffff' }
        });

        this.grid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function(dv, record, item, index) {
                self.selectedIndex = index;
            }
        });
        panelB22.add(this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('FromTime'), dataIndex: 'fromtime', width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('ToTime'),   dataIndex: 'totime',   width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('WorkMode'), dataIndex: 'workmode', width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        var panelB221 = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 32,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        // ADD BUTTON
        var AddButton = Ext.create('Ext.button.Button', {
            text: 'Add',
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.YMD_Add();
                }
            }
        });

        // DELETE BUTTON
        var DelButton = Ext.create('Ext.button.Button', {
            text: 'Delete',
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.YMD_Delete();
                }
            }
        });

        panelB221.add(AddButton);
        panelB221.add(DelButton);

        panelB22.add(panelB221);

        panelB21.add(labelC);
        panelB2.add(panelB21);
        panelB2.add(panelB22);

        panelB.add(panelB1);
        panelB.add(panelB2);

        //

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

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        //

        form.add(panelA);
        form.add(panelB);
        form.add(panelC);

        form.show();

        if (this.mode === 'Edit') {
            this.scheduleNameEdit.setValue(this.sms_schedule_name);
            this.onEditLoad(this.sms_schedule_name);
        } else {
            this.createScheduler();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    createSsveSQL: function() {
        var self = this;
        var sql = '';

        var func = function(index, startindex) {
            var start = '';
            var end;

            for (var ix = startindex; ix < 24; ix++) {
                if (self.scheduleArr[ix][index] === ' ') {
                    if (start === '')
                        start = ix;
                    if (ix === 23) {
                        end = ix;
                        sql += 'insert into xapm_alert_sms_schedule values(\'' + self.scheduleNameEdit.getValue() + '\', \'WEEKLY\', ' + index + ', ' + start + ', ' + end + ', \'WORKING\', NULL); ';
                        start = '';
                    }
                } else {
                    if (start !== '') {
                        end = ix-1;
                        sql += 'insert into xapm_alert_sms_schedule values(\'' + self.scheduleNameEdit.getValue() + '\', \'WEEKLY\', ' + index + ', ' + start + ', ' + end + ', \'WORKING\', NULL); ';
                        if (ix < 24) {
                            start = '';
                        }
                    }
                }
            }
        };

        for (var ix = 0; ix < 7; ix++) {
            func(ix, 0);
        }

        return sql;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var SQL = '';
        var start;
        var end;
        var workmode;
        var self = this;
        var dataSet = {};

        if(this.mode === 'Add' ){
            SQL += 'delete from xapm_alert_sms_schedule where sms_schedule_name = \'' + this.scheduleNameEdit.getValue() + '\'; ';
        }else {
            SQL += 'delete from xapm_alert_sms_schedule where sms_schedule_name = \'' + this.sms_schedule_name + '\'; ';
        }

        SQL += this.createSsveSQL();

        for (var ix = 0; ix < this.grid.getRowCount(); ix++) {
            start = this.grid.getRow(ix).data.fromtime;
            start = start.replace(/-/g, '');
            start = start.replace(/ /g, '');
            end   = this.grid.getRow(ix).data.totime;
            end   = end.replace(/-/g, '');
            end   = end.replace(/ /g, '');
            workmode = this.grid.getRow(ix).data.workmode;
            SQL += 'insert into xapm_alert_sms_schedule values(\'' + this.scheduleNameEdit.getValue() + '\', \'USER\', \'0\', ' + start + ', ' + end + ', \'' + workmode + '\', NULL); ';
        }

        SQL += 'commit; ';

        for(ix = 0; ix < this.parent.grid.getRowCount(); ix++){
            if(this.scheduleNameEdit.getValue() === this.parent.grid.getRow(ix).data.sms_schedule_name){
                if(this.scheduleNameEdit.getValue() === this.sms_schedule_name){
                    continue;
                }
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Duplicate SMS Schedule Name'));
                return;
            }
        }

        if(!this.scheduleNameEdit.getValue()){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the SMS Schedule Name.'));
            return;
        }

        if(!this.createSsveSQL() && !this.grid.getRowCount()){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the Schedule Settings.'));
            return;
        }

        dataSet.sql = SQL;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        try {
            WS.SQLExec(dataSet, function () {
                Ext.Msg.alert(common.Util.TR('OK'), common.Util.TR('Save Success'));
                self.form.close();
                self.parent.refresh();
            }, this);
        } catch(e) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Find error (Error message : ') + e + ')');
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    YMD_Add: function() {
        var ymd_form = Ext.create('config.config_alert_smsschedulemgr_form_add');
        ymd_form.parent = this;
        ymd_form.init();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    YMD_Delete: function() {
        var self = this;
        Ext.MessageBox.confirm(common.Util.TR('Delete SMS Schedule'), common.Util.TR('Are you sure you want to delete selected SMS Schedule?'), function(btn) {
            if (btn === 'yes') {
                self.grid.deleteRow(self.selectedIndex);
            }
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    YMD_save: function(fromtime, totime, workmode) {
        this.grid.addRow([fromtime, totime, workmode]);
        this.grid.drawGrid();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onEditLoad: function(name) {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Schedule_Manager_Load.sql';
        dataSet.bind = [{
            name    :   'name',
            value   :   name,
            type : SQLBindType.STRING
        }];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onData, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onData: function(aheader, adata) {
        var d;
        var _start;
        var _end;
        var start;
        var end;
        var workmode;
        var tempArr = [];
        var ix, jx;

        for (ix = 0; ix < 24; ix++)
            tempArr.push(['','','','','','','']);

        this.grid.clearRows();

        this.initSMSWeeklyTime();

        for (ix = 0; ix < adata.rows.length; ix++) {
            d = adata.rows[ix];
            /** 사용안해서 잃단 주석처리
            start = parseInt(d[3]) < 10 ? '0' + d[3] : d[3];
            end   = parseInt(d[4]) < 10 ? '0' + d[4] : d[4];
             **/
            switch (d[1]) {
                case 'WEEKLY' :
                    for (jx = parseInt(d[3]); jx <= parseInt(d[4]); jx++) {
                        tempArr[jx][parseInt(d[2])] = ' ';
                    }
                    break;
                case 'USER' :
                    _start   = d[3].toString();
                    _end     = d[4].toString();
                    start    = _start.substr(0, 4) + '-' + _start.substr(4, 2) + '-' + _start.substr(6, 2) + ' ' + _start.substr(8, 2);
                    end      = _end.substr(0, 4) + '-' + _end.substr(4, 2) + '-' + _end.substr(6, 2) + ' ' + _end.substr(8, 2);
                    workmode = d[5];
                    this.grid.addRow([start, end, workmode]);
                    break;
                default:
                    break;
            }
        }
        this.grid.drawGrid();

        var temp;
        var tempStr;
        for (ix = 0; ix < 24; ix++) {
            temp = ix < 10 ? '0' + ix : ix;
            tempStr = '';
            for (jx = 0; jx < 7; jx++) {
                if (tempArr[ix][jx] === ' ') {
                    tempStr += ' ,';
                }  else {
                    tempStr += ',';
                }
            }
            localStorage.setItem('Intermax_SMSWeeklyTime' + temp.toString(), tempStr);
        }
        this.createScheduler();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initSMSWeeklyTime: function() {
        var temp;
        for (var ix = 0; ix < 24; ix++) {
            temp = ix < 10 ? '0' + ix : ix;
            localStorage.setItem('Intermax_SMSWeeklyTime' + temp.toString(), ',,,,,,');
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    createScheduler: function() {
        if (this.svgr) {
            this.svgr.remove();
        }

        var self = this;
        var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        var ix;

        this.svgr = d3.select('#' + this.panelB12.id + '-innerCt')
            .append('svg')
            .attr('width', this.panelB12.getWidth())
            .attr('height', this.panelB12.getHeight());

        // SUN~SAT
        for (ix = 0; ix < days.length; ix++) {
            this.svgr.append('text')
                .text(days[ix])
                .attr('x', 50 + (32 / 2) + (32*ix))
                .attr('y', 14)
                .attr('font-family', 'imaxval')
                .attr('font-size', '8px')
                .attr('text-anchor', 'middle')
                .style('fill', this.fillStyle(ix));
        }

        // 00 - 23
        for (ix = 0; ix < 24; ix++) {
            this.svgr.append('text')
                .text(this.hourText(ix))
                .attr('x', 30)
                .attr('y', 18 + (12*ix) + 12)
                .attr('font-family', 'imaxval')
                .attr('font-size', '8px')
                .attr('text-anchor', 'middle');
        }

        var greenRenderer = function (instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            td.style.color = 'green';
            td.style.background = '#CEC';
        };

        var whiteRenderer = function (instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            td.style.color = 'white';
            td.style.background = '#FFF';
        };

        if (this.$container) {
            this.$container = null;
        }
        this.$container = $('#' + this.panelB121.id);

        var load = function() {
            var daydata;
            var temp;
            var ix, jx;
            for (ix = 0; ix < 24; ix++) {
                temp = ix < 10 ? '0' + ix : ix;
                daydata = localStorage.getItem('Intermax_SMSWeeklyTime' + temp.toString());
                if (daydata == null) {
                    self.scheduleArr[ix] = ['','','','','','',''];
                } else {
                    self.scheduleArr[ix] = daydata.split(',');
                    for (jx = 0; jx < self.scheduleArr[ix].length; jx++) {
                        if (self.scheduleArr[ix][jx] === ' ') {
                            self.schedule_cells.push({row: ix, col: jx, renderer: greenRenderer});
                        }
                    }
                }
            }
            return self.scheduleArr;
        };

        load();

        this.$container.handsontable({
            data: self.scheduleArr,
            width: 500,
            height: 900,
            colWidths: 32,
            cell: self.schedule_cells,
            afterSelectionEnd: function(startRow, startCol, endRow, endCol) {
                var ix;
                var temp;
                var rowStart = startRow <= endRow ? startRow : endRow;
                var rowEnd   = startRow >= endRow ? startRow : endRow;
                var colStart = startCol <= endCol ? startCol : endCol;
                var colEnd   = startCol >= endCol ? startCol : endCol;

                for (ix = rowStart; ix <= rowEnd; ix++) {
                    for (var jx = colStart; jx <= colEnd; jx++) {
                        if (self.scheduleArr[ix][jx] === '') {
                            self.scheduleArr[ix][jx] = ' ';
                        } else {
                            self.scheduleArr[ix][jx] = '';
                        }
                    }
                }

                for (ix = 0; ix < 24; ix++) {
                    temp = ix < 10 ? '0' + ix : ix;
                    localStorage.setItem('Intermax_SMSWeeklyTime' + temp.toString(), self.scheduleArr[ix]);
                }

                self.$container.handsontable('loadData', self.scheduleArr);
                self.$container.handsontable('render');

            },
            cells: function(row, col) {
                var cellProperties = {};
                if (self.$container.handsontable('getData')[row][col] === ' ') {
                    cellProperties.renderer = greenRenderer;
                } else {
                    cellProperties.renderer = whiteRenderer;
                }
                return cellProperties;
            },
            columns: [
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true }
            ]
        });

        if (this.mode === 'Add') {
            this.clearLabel.fireHandler('click');
            this.scheduleNameEdit.focus();
        }
    },

    fillStyle: function(ix){
            var result;
            switch (ix) {
                case 0 : result = '#990808';
                    break;
                case 6 : result = '#14b4be';
                    break;
                default : result = '#000000';
                    break;
            }
            return result;
    },

    hourText: function(ix){
        var result;
        if (ix < 10) {
            result = '0' + ix.toString();
        } else {
            result = ix.toString();
        }
        return result;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initScheduleDataArr: function() {
        for (var ix = 0; ix < 24; ix++) {
            for (var jx = 0; jx < 7; jx++) {
                this.scheduleArr[ix][jx] = '';
            }
        }
    }
});
