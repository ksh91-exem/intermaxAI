/**
 * Created by Kang on 2017-07-28.
 */

/**
 * Created by Kang on 2017-07-05.
 */

Ext.define('view.ReportNewScheduleWin', {
    extend      : 'Exem.XMWindow',
    title       : common.Util.TR('Scheduling'),
    width       : 1300,
    height      : 880,
    minWidth    : 600,
    minHeight   : 500,
    layout      : 'vbox',
    closable    : true,
    modal       : true,
    cls         : null,

    parent      : null,
    templateSeq : null,
    scheduleSeq : null,

    init: function() {
        this._initProperty();
        this._initLayout();
    },

    _initProperty: function() {
    },

    _initLayout: function() {
        var mainCon = Ext.create('Ext.container.Container', {
            width   : '100%',
            flex    : 1,
            layout  : 'hbox',
            padding : 5
        });

        var bottomBtnCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 30,
            layout : 'hbox',
            items  : [
                { xtype: 'tbspacer', flex: 1 },
                this._createButton({ text: common.Util.TR('Save')          , itemId: 'saveBtn'        }, false ),
                this._createButton({ text: common.Util.TR('Save and Close'), itemId: 'saveAndCloseBtn', width : 155         }, false ),
                this._createButton({ text: common.Util.TR('Cancel')        , itemId: 'cancelBtn'      , margin: '0 25 0 0'  }, false )
            ]
        });

        if ( this.scheduleSeq == null ) {
            mainCon.add( this._createTemplateArea() );
        }

        mainCon.add( this._createSchedulingArea() );
        this.add( mainCon, bottomBtnCon );
    },

    _createTemplateArea: function() {
        this.templateArea = Ext.create('Ext.container.Container', {
            flex   : 1,
            height : '100%',
            layout : 'vbox'
        });

        this.scheduleTitleTxtField  = Ext.create('Exem.TextField',{
            fieldLabel : common.Util.TR('Schedule Title'),
            itemId     : 'scheduleTitle',
            width      : '98%',
            height     : 20,
            margin     : '10 20 10 20',
            labelAlign : 'left',
            labelWidth : 92,
            emptyText  : common.Util.TR('Please enter schedule title'),
            listeners: {
                scope: this,
                focus: function (me) {
                    if ( !me.getValue() || !me.getValue().length ) {
                        me.setValue('');
                    }
                },
                blur: function(me) {
                    if ( !me.getValue() || !me.getValue().length ) {
                        me.applyEmptyText();
                    }
                }
            }
        });

        this.templateGrid = Ext.create('Exem.BaseGrid',{
            itemId            : 'templateGrid',
            borderVisible     : true,
            usePager          : true,
            margin            : '10 0 0 0',
            defaultbufferSize : 100,
            defaultPageSize   : 100,
            listeners: {
                afterlayout: function() {
                    this._execTemplateList();
                }.bind(this)
            },
            itemclick: function(dv, record) {}.bind(this)
        });

        var grid = this.templateGrid;
        grid.beginAddColumns();
        grid.addColumn(common.Util.TR('Template Seq')   , 'templateSeq'       , 0  , Grid.Number, false, true );
        grid.addColumn(common.Util.TR('Creation Time')  , 'creationTime'      , 140, Grid.String, false, true );
        grid.addColumn(common.Util.TR('')               , 'reportType'        , 0  , Grid.Number, false, true );
        grid.addColumn(common.Util.TR('Report Type')    , 'displayReportType' , 100, Grid.String, true , false);
        grid.addColumn(common.Util.TR('Template Title') , 'title'             , 140, Grid.String, true , false);
        grid.addColumn(common.Util.TR('Create By')      , 'createBy'          , 90 , Grid.String, true , false);
        grid.addColumn(common.Util.TR('Update Time')    , 'updateTime'        , 140, Grid.String, true , false);
        grid.addColumn(common.Util.TR('Update By')      , 'updateBy'          , 90 , Grid.String, true , false);
        grid.endAddColumns();

        this.templateArea.add( this.scheduleTitleTxtField, this.templateGrid );
        return this.templateArea;
    },

    _createSchedulingArea: function() {
        this.schedulingForm = Ext.create('view.ReportSchedulingForm', {
            parent : this,
            flex   : 1,
            height : '100%',
            margin : this.scheduleSeq != null ? 0 : '21 0 0 0'
        });

        return this.schedulingForm;
    },

    _createButton: function( paramObj, ignoreDefaultObj ) {
        var defaultObj = {
            width  : 100,
            height : 25,
            margin : '0 10 0 0',
            listeners : {
                click : function(me) {
                    this._buttonClick(me.itemId);
                }.bind(this)
            }
        };

        return Ext.create('Ext.Button', ignoreDefaultObj === true && paramObj ? paramObj : Object.assign( defaultObj, paramObj ));
    },

    _execTemplateList: function() {
        this.templateGrid.clearRows();

        $.ajax({
            // IMXPA_Report_Configuration_Template_List.sql
            type     : 'get',
            url      : '/reportTemplate',
            dataType : 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                var grid;

                if ( response.header.success ) {
                    if(!common.Util.checkSQLExecValid(response.header, response.data)){
                        console.debug('ReportNewScheduleWin - _execTemplateList');
                        console.debug(response.header);
                        console.debug(response.data);
                        return;
                    }

                    var dataRows;

                    if(response.data.rows.length){
                        dataRows = response.data.rows[0].data;
                    } else{
                        dataRows = response.data.rows;
                    }

                    this._drawTemplateGrid(dataRows);

                    if ( dataRows.length ) {
                        grid = this.templateGrid.pnlExGrid;
                        grid.getView().getSelectionModel().select(0);
                        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
                    }
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR(response.header.error), Ext.Msg.OK, Ext.MessageBox.ERROR);
                }
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {}
        });
    },

    /**
     *
     * @param dataRows{Array}
     *  0: templateSeq
     *  1: creationTime
     *  2: reportType
     *  3: displayReportType
     *  4: templateTitle
     *  5: createBy
     *  6: updateTime
     *  7: updateBy
     * @private
     */
    _drawTemplateGrid: function( dataRows ) {
        var ix, ixLen, row;

        for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
            row = dataRows[ix];
            this.templateGrid.addRow(row);
        }

        this.templateGrid.drawGrid();
    },

    _buttonClick: function( itemId ) {
        switch ( itemId ) {
            case 'saveBtn':
                this._saveSchedule();
                break;
            case 'saveAndCloseBtn':
                if ( this._saveSchedule() ) {
                    this.close();
                }
                break;
            case 'cancelBtn':
                this.close();
                break;
            default: break;
        }
    },

    _saveSchedule: function() {
        if ( this.templateGrid.getSelectedRow().length == 0 ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a report template'), Ext.Msg.OK, Ext.MessageBox.INFO, function(){}.bind(this));
            return false;
        }

        var templateSeq    = +this.templateGrid.getSelectedRow()[0].data['templateSeq'];
        var scheduleTitle  = this.scheduleTitleTxtField.getValue().trim();
        var scheduleInfo   = this.schedulingForm._getScheduleInfo();
        var userSeqListStr = this.schedulingForm._getRecipientSeqList();
        var reportConfigurationView    = this.parent;

        if ( scheduleTitle == '' ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter schedule title.'), Ext.Msg.OK, Ext.MessageBox.INFO, function(){
                this.scheduleTitleTxtField.focus();
            }.bind(this));
            return false;
        }

        //중복체크
        if ( reportConfigurationView.scheduleGrid.findRow('scheduleTitle', scheduleTitle) !== -1) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('schedule name is duplicated.'));
            this.scheduleTitleTxtField.focus();
            return false;
        }

        if ( !userSeqListStr.length ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please set recipient(s).'), Ext.Msg.OK, Ext.MessageBox.INFO, function(){}.bind(this));
            return false;
        }

        var dataSet = {
            bind: [
                { name: 'template_seq'         , type: SQLBindType.INTEGER, value: templateSeq                     },
                { name: 'schedule_title'       , type: SQLBindType.STRING , value: scheduleTitle                   },
                { name: 'start_date'           , type: SQLBindType.STRING , value: scheduleInfo.startDate          },
                { name: 'end_date'             , type: SQLBindType.STRING , value: scheduleInfo.endDate            },
                { name: 'interval_value'       , type: SQLBindType.INTEGER, value: scheduleInfo.intervalValue      },
                { name: 'interval_unit'        , type: SQLBindType.INTEGER, value: scheduleInfo.intervalUnit       },
                { name: 'interval_day_of_week' , type: SQLBindType.INTEGER, value: scheduleInfo.intervalDayOfWeek  },
                { name: 'retention_value'      , type: SQLBindType.INTEGER, value: scheduleInfo.retentionValue     },
                { name: 'smtp_seq'             , type: SQLBindType.INTEGER, value: scheduleInfo.smtpSeq            },
                { name: 'state'                , type: SQLBindType.INTEGER, value: scheduleInfo.scheduleState      },
                { name: 'login_user'           , type: SQLBindType.INTEGER, value: Comm.config.login.user_id       },
                { name: 'report_start_point'   , type: SQLBindType.INTEGER, value: scheduleInfo.reportStartPoint   },
                { name: 'report_end_point'     , type: SQLBindType.INTEGER, value: scheduleInfo.reportEndPoint     },
                { name: 'report_past_flag'     , type: SQLBindType.INTEGER, value: scheduleInfo.reportPastFlag     },
                { name: 'is_end_of_the_month'  , type: SQLBindType.INTEGER, value: scheduleInfo.isEndOfTheMonth    },
                { name: 'mail_signature'       , type: SQLBindType.INTEGER, value: scheduleInfo.mailSignature      }
            ],
            replace_string : [{
                name : 'user_seq_list',
                value: userSeqListStr || 'null'
            }]
        };

        $.ajax({
            // sql_file: 'IMXPA_Report_Configuration_Schedule_Insert.sql'
            type : 'post',
            url  : '/reportSchedule',
            data : JSON.stringify(dataSet),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                if ( response.header.success ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Save Success'), Ext.Msg.OK, Ext.MessageBox.INFO);

                    var configurationView = this.parent;
                    configurationView._execGetList('schedule');
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Cannot save %1', common.Util.TR('schedule')), Ext.Msg.OK, Ext.MessageBox.ERROR);
                }
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {}
        });

        return true;
    }

});