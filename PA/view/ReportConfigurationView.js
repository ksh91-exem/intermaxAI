/**
 * Created by Kang on 2017-06-19.
 */

Ext.define('view.ReportConfigurationView', {
    extend: 'Exem.Form',
    layout  : 'fit',
    padding : '10 20 20 20',

    _initProperty: function() {
        this.newTemplateWin = null;
        this.newScheduleWin = null;

        this.mainTabFlag = {
            sentHistoryTab : false,
            templateTab    : false,
            scheduleTab    : false
        };

        this.DISPLAY_REPORT_TYPE = {
            0: 'Custom',
            1: 'Daily',
            2: 'Long-Term'
        };
    },

    init: function() {
        this._initProperty();
        this._initLayout();
    },

    _initLayout: function() {
        this.mainTabPanel = Ext.create('Exem.TabPanel',{
            width     : '100%',
            height    : '100%',
            flex      : 1,
            layout    : 'fit',
            minWidth  : 600,
            minHeight : 200,
            autoScroll: false,
            listeners : {
                tabchange: function(me, newTab) {
                    this._tabChange(newTab.itemId);
                }.bind(this)
            },
            items: [
                Ext.create('Ext.container.Container', {
                    title  : common.Util.TR('Sent History'),
                    itemId : 'sentHistoryTab',
                    width  : '100%',
                    height : '100%',
                    layout : 'vbox',
                    padding: 11
                }),
                Ext.create('Ext.container.Container', {
                    title  : common.Util.TR('Template'),
                    itemId : 'templateTab',
                    width  : '100%',
                    height : '100%',
                    layout : 'vbox',
                    padding: 11
                }),
                Ext.create('Ext.container.Container', {
                    title  : common.Util.TR('Schedule'),
                    itemId : 'scheduleTab',
                    width  : '100%',
                    height : '100%',
                    layout : 'vbox',
                    padding: 11
                })
            ]
        });

        this.add( this.mainTabPanel );
        this._tabChange('sentHistoryTab');
        this._tabChange('templateTab');
        this._tabChange('scheduleTab');
    },

    _createSentHistoryTab: function() {
        this.reportGrid = Ext.create('Exem.BaseGrid', {
            itemId      : 'reportGrid',
            flex        : 1,
            margin      : '10 0 10 0',
            useCheckbox: {
                use : true,
                mode: Grid.checkMode.SIMPLE,
                headerCheck: false,
                checkOnly: false
            },
            style : {
                border : 'solid 1px #c5c5c5'
            },
            defaultHeaderHeight : 25,
            defaultPageSize     : 50
        });

        var bottomBtnArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 30,
            layout : { type: 'hbox', pack: 'end', align: 'middle' },
            items  : [
                { xtype: 'tbspacer', flex: 1 },
                this._createButton({ text: common.Util.TR('Refresh'), itemId: 'reportRefreshBtn' }, false),
                this._createButton({ text: common.Util.TR('Delete') , itemId: 'reportDeleteBtn'  }, false)
            ]
        });

        this._addColumns(this.reportGrid.itemId);
        this.mainTabPanel.items.items[0].add( this.reportGrid, bottomBtnArea );
    },

    _createTemplateTab: function() {
        this.templateGrid = Ext.create('Exem.BaseGrid', {
            itemId      : 'templateGrid',
            flex        : 1,
            margin      : '10 0 10 0',
            useCheckbox: {
                use : true,
                mode: Grid.checkMode.SIMPLE,
                headerCheck: false,
                checkOnly: false
            },
            style : {
                border : 'solid 1px #c5c5c5'
            },
            defaultHeaderHeight : 25,
            defaultPageSize     : 50,
            celldblclick: this._templateGridDblClick.bind(this)
        });

        var bottomBtnArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 30,
            layout : { type: 'hbox', pack: 'end', align: 'middle' },
            items  : [
                { xtype: 'tbspacer', flex: 1 },
                this._createButton({ text: common.Util.TR('New Template'), itemId: 'newTemplateBtn'   , width: 130 }, false),
                this._createButton({ text: common.Util.TR('Modify')      , itemId: 'modifyTemplateBtn'  }, false),
                this._createButton({ text: common.Util.TR('Delete')      , itemId: 'deleteTemplateBtn'  }, false)
            ]
        });

        this._addColumns(this.templateGrid.itemId);
        this.mainTabPanel.items.items[1].add( this.templateGrid, bottomBtnArea );
    },

    _createScheduleTab: function() {
        this.scheduleGrid = Ext.create('Exem.BaseGrid', {
            itemId      : 'scheduleGrid',
            flex        : 1,
            margin      : '10 0 10 0',
            useCheckbox: {
                use : true,
                mode: Grid.checkMode.SIMPLE,
                headerCheck: false,
                checkOnly: false
            },
            style : {
                border : 'solid 1px #c5c5c5'
            },
            defaultHeaderHeight : 25,
            defaultPageSize     : 50,
            celldblclick: this._scheduleGridDblClick.bind(this)
        });

        var bottomBtnArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 30,
            layout : { type: 'hbox', pack: 'end', align: 'middle' },
            items  : [
                { xtype: 'tbspacer', flex: 1 },
                this._createButton({ text: common.Util.TR('New Schedule'), itemId: 'newScheduleBtn'   , width: 130 }, false),
                this._createButton({ text: common.Util.TR('Modify')      , itemId: 'modifyScheduleBtn'  }, false),
                this._createButton({ text: common.Util.TR('Delete')      , itemId: 'deleteScheduleBtn'  }, false)
            ]
        });

        this._addColumns(this.scheduleGrid.itemId);
        this.mainTabPanel.items.items[2].add( this.scheduleGrid, bottomBtnArea );
    },

    _createButton: function( paramObj, ignoreDefaultObj ) {
        var defaultObj = {
            width     : 100,
            height    : 25,
            margin    : '0 0 0 10',
            listeners : {
                click : function(me) {
                    this._buttonClick(me.itemId);
                }.bind(this)
            }
        };

        return Ext.create('Ext.Button', ignoreDefaultObj === true && paramObj ? paramObj : Object.assign( defaultObj, paramObj ));
    },

    _tabChange: function(tab) {
        tab = tab || this.mainTabPanel.getActiveTab().itemId;

        if ( tab == 'sentHistoryTab' ) {
            if ( !this.mainTabFlag.sentHistoryTab ) {
                this._createSentHistoryTab();
                this.mainTabFlag.sentHistoryTab = true;
            }

            this._execGetList('report');
        } else if ( tab == 'templateTab' ) {
            if ( !this.mainTabFlag.templateTab ) {
                this._createTemplateTab();
                this.mainTabFlag.templateTab = true;
            }

            this._execGetList('template');
        } else if ( tab == 'scheduleTab' ) {
            if ( !this.mainTabFlag.scheduleTab ) {
                this._createScheduleTab();
                this.mainTabFlag.scheduleTab = true;
            }

            this._execGetList('schedule');
        }
    },

    _execGetList: function( type, paramObj ) {
        var url;
        var dataSet = {};

        switch ( type ) {
            case 'report':
                // IMXPA_Report_Configuration_Archive_List.sql
                url = '/reportArchive';
                this.reportGrid.clearRows();
                break;
            case 'template':
                // IMXPA_Report_Configuration_Template_List.sql
                url = '/reportTemplate';
                this.templateGrid.clearRows();
                break;
            case 'schedule':
                // IMXPA_Report_Configuration_Schedule_List.sql
                url = '/reportSchedule';
                this.scheduleGrid.clearRows();
                break;
            case 'article':
                // IMXPA_Report_Configuration_Article_Info.sql
                dataSet.bind = [{
                    name : 'template_seq',
                    type : SQLBindType.INTEGER,
                    value: paramObj.recordData.templateSeq
                }];

                url = '/reportArticle?dataSet=' + JSON.stringify(dataSet);
                break;
            default: break;
        }

        $.ajax({
            type : 'get',
            url  : url,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                if ( response.header.success ) {
                    if(!common.Util.checkSQLExecValid(response.header, response.data)){
                        console.debug('ReportConfigurationView - _execGetList');
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

                    switch ( type ) {
                        case 'report'  : this._drawSentHistoryTab(dataRows);
                            break;
                        case 'template': this._drawTemplateTab(dataRows);
                            break;
                        case 'schedule': this._drawScheduleTab(dataRows);
                            break;
                        case 'article' : this._openArticleTemplate( dataRows, paramObj.recordData );
                            break;
                        default: break;
                    }
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR(response.header.error), Ext.Msg.OK, Ext.MessageBox.ERROR);
                }
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {}
        });
    },

    _execDelete: function(type) {
        var ix, ixLen, selectedRowList, url;
        var deleteList = [];

        var dataSet = {};

        switch ( type ) {
            case 'report':
                // IMXPA_Report_Configuration_Archive_Delete.sql
                url = '/reportArchive';
                selectedRowList = this.reportGrid.getSelectedRow();

                for ( ix = 0, ixLen = selectedRowList.length; ix < ixLen; ix++ ) {
                    deleteList.push('\''+ selectedRowList[ix].data['reportName'] +'\'');
                }

                dataSet.replace_string = [{
                    name : 'report_name_list',
                    value: deleteList.join(',')
                }];
                break;
            case 'template':
                // IMXPA_Report_Configuration_Template_Delete.sql
                url = '/reportTemplate';
                selectedRowList = this.templateGrid.getSelectedRow();

                for ( ix = 0, ixLen = selectedRowList.length; ix < ixLen; ix++ ) {
                    deleteList.push(selectedRowList[ix].data['templateSeq']);
                }

                dataSet.replace_string = [{
                    name : 'template_seq_list',
                    value: deleteList.join(',')
                }];
                break;
            case 'schedule':
                // IMXPA_Report_Configuration_Schedule_Delete.sql
                url = '/reportSchedule';
                selectedRowList = this.scheduleGrid.getSelectedRow();

                for ( ix = 0, ixLen = selectedRowList.length; ix < ixLen; ix++ ) {
                    deleteList.push(selectedRowList[ix].data['scheduleSeq']);
                }

                dataSet.replace_string = [{
                    name : 'schedule_seq_list',
                    value: deleteList.join(',')
                }];
                break;
            default: break;
        }

        if ( !deleteList.length ) {
            return false;
        }

        $.ajax({
            type : 'delete',
            url  : url + '?dataSet=' + JSON.stringify(dataSet),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(type) {
                return function(response) {
                    if ( response.header.success ) {
                        common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Delete succeeded'), Ext.Msg.OK, Ext.MessageBox.INFO);
                        this._execGetList(type);
                    } else {
                        common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Delete Fail.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                    }
                }.bind(this);
            }.call(this, type),
            error: function(XHR, textStatus, errorThrown) {}
        });
    },

    _drawSentHistoryTab: function( dataRows ) {
        var ix, ixLen, row;
        var grid = this.reportGrid;

        for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
            row = dataRows[ix];

            grid.addRow([
                row[ 0],     // creationTime
                +row[ 1],     // reportType
                this.DISPLAY_REPORT_TYPE[row[ 1]],     // displayReportType
                row[ 2],     // scheduleTitle
                row[ 3],     // reportName
                row[ 4],     // buildBy
                +row[ 5],     // templateSeq
                +row[ 6]      // ScheduleSeq
            ]);
        }

        grid.drawGrid();
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
    _drawTemplateTab: function( dataRows ) {
        var ix, ixLen;
        for( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ){
            this.templateGrid.addRow([
                +dataRows[ix][0],       //templateSeq
                dataRows[ix][1],        //creationTime
                +dataRows[ix][2],       //reportType
                dataRows[ix][3],        //displayReportType
                dataRows[ix][4],        //templateTitle
                dataRows[ix][5],        //createBy
                dataRows[ix][6],        //updateTime
                dataRows[ix][7]         //updateBy
            ]);
        }
        this.templateGrid.drawGrid();
    },

    /**
     *
     * @param dataRows
     *  0: schedule_seq
     *  1: template_seq
     *  2: smtp_seq
     *  3: create_time
     *  4: report_type
     *  5: template_title
     *  6: schedule_title
     *  7: start_date
     *  8: end_date
     *  9: interval_unit
     * 10: interval_value
     * 11: interval_day_of_week
     * 12: retention_value
     * 13: state
     * 14: create_user
     * 15: modify_time
     * 16: modify_user
     * 17: report_start_point
     * 18: report_end_point
     * 19: report_past_flag
     * @private
     */
    _drawScheduleTab: function( dataRows ) {
        var ix, ixLen, row, reportType, intervalUnit, displayDayOfWeek, displayRetentionValue;
        var grid = this.scheduleGrid;
        var retentionValue = '';
        var retentionUnit  = '';

        var parseIntervalUnitObj = {
            0: 'Once',
            1: 'Daily',
            2: 'Weekly',
            3: 'Monthly',
            4: 'Yearly'
        };

        var convertRetentionUnit = {
            1: 'Days',
            2: 'Weeks',
            3: 'Months',
            4: 'Years'
        };

        for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
            row              = dataRows[ix];
            reportType       = row[4];
            intervalUnit     = row[9];
            displayDayOfWeek = row[11];
            retentionValue   = row[12];

            if ( retentionValue && intervalUnit ) {
                retentionUnit = convertRetentionUnit[intervalUnit];
                retentionUnit = retentionValue == 1 ? retentionUnit.slice(0,retentionUnit.length-1) : retentionUnit;
                displayRetentionValue = retentionValue + ' ' + retentionUnit;
            } else {
                displayRetentionValue = '';
            }

            grid.addRow([
                +row[0],                                       // scheduleSeq
                +row[1],                                       // templateSeq
                +row[2],                                       // smtpSeq
                row[3],                                       // creationTime
                +reportType,                                   // reportType
                this.DISPLAY_REPORT_TYPE[ reportType ],       // displayReportType
                row[5],                                       // templateTitle
                row[6],                                       // scheduleTitle
                row[7],                                       // startDate
                row[8],                                       // endDate
                parseIntervalUnitObj[ intervalUnit ],         // displayUnit
                this._getConvertIntervalDayOfWeek(displayDayOfWeek),   // displayDayOfWeek
                displayRetentionValue,                        // displayRetentionValue
                +row[13],                                      // state
                row[14],                                      // createBy
                row[15],                                      // updateTime
                row[16],                                      // updateBy
                +intervalUnit,                                 // intervalUnit
                +displayDayOfWeek,                             // intervalDayOfWeek
                +retentionValue,                               // retentionValue
                +row[17],                                      // reportStartPoint
                +row[18],                                      // reportEndPoint
                +row[19],                                       // reportPastFlag
                +row[21]                                       // mail_signature
            ]);
        }

        grid.drawGrid();
    },

    _buttonClick: function( itemId ) {
        var selectedRowList;

        switch ( itemId ) {
            case 'reportRefreshBtn':
                this._execGetList('report');
                break;
            case 'reportDeleteBtn':
                selectedRowList = this.reportGrid.getSelectedRow();

                if ( selectedRowList.length == 0 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select list.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Are you sure you want to delete?'), Ext.Msg.YESNO, Ext.Msg.WARNING,
                    function( check ) {
                        if ( check == 'yes' ) {
                            this._execDelete('report');
                        }
                    }.bind(this));
                break;
            case 'newTemplateBtn':
                this._openTemplateWin();
                break;
            case 'modifyTemplateBtn':
                selectedRowList = this.templateGrid.getSelectedRow();

                if ( selectedRowList.length == 0 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select template.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                if ( selectedRowList.length > 1 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select one item only.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                this.templateGrid.pnlExGrid.fireEvent('celldblclick', this.templateGrid.down().down(), null, null, this.templateGrid.pnlExGrid.getSelectionModel().getLastSelected());
                break;
            case 'deleteTemplateBtn':
                selectedRowList = this.templateGrid.getSelectedRow();

                if ( selectedRowList.length == 0 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select template.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Are you sure you want to delete?'), Ext.Msg.YESNO, Ext.Msg.WARNING,
                    function( check ) {
                        if ( check == 'yes' ) {
                            this._execDelete('template');
                        }
                    }.bind(this));
                break;
            case 'newScheduleBtn':
                this._openScheduleWin();
                break;
            case 'modifyScheduleBtn':
                selectedRowList = this.scheduleGrid.getSelectedRow();

                if ( selectedRowList.length == 0 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select schedule.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                if ( selectedRowList.length > 1 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select one item only.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }

                this.scheduleGrid.pnlExGrid.fireEvent('celldblclick', this.scheduleGrid.down().down(), null, null, this.scheduleGrid.pnlExGrid.getSelectionModel().getLastSelected());
                break;
            case 'deleteScheduleBtn':
                selectedRowList = this.scheduleGrid.getSelectedRow();

                if ( selectedRowList.length == 0 ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Please select schedule.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    return false;
                }
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Are you sure you want to delete?'), Ext.Msg.YESNO, Ext.Msg.WARNING,
                    function( check ) {
                        if ( check == 'yes' ) {
                            this._execDelete('schedule');
                        }
                    }.bind(this));
                break;
            case 'scheduleOkBtn':
                this._saveSchedule();
                break;
            case 'scheduleCancelBtn':
                this.newScheduleWin.close();
                break;
            default: break;
        }
    },

    _templateGridDblClick: function( me, td, cellIndex, record ) {
        this.loadingMask.show();

        this._execGetList('article', { recordData: record.data });
    },

    _scheduleGridDblClick: function( me, td, cellIndex, record ) {
        this._openScheduleWin(record.data);
    },

    _openTemplateWin: function( paramObj ) {
        var title;
        paramObj = paramObj || {};

        if(paramObj.modify){
            title = common.Util.TR('Modify Template');
        } else{
            title = common.Util.TR('New Template');
        }

        this.newTemplateWin = Ext.create('view.ReportNewTemplateWin', {
            parent         : this,
            title          : title,
            templateSeq    : paramObj.templateSeq,
            templateOptions: paramObj.templateOptions,
            useDefaultStat : (paramObj.useDefaultStat == undefined),
            timeWindowCheck: paramObj.timeWindowCheck,
            recordData     : paramObj.recordData
        });

        this.newTemplateWin.show();
        this.newTemplateWin.init();
    },

    _openScheduleWin: function( paramObj ) {
        paramObj = paramObj || {};

        this.loadingMask.show();

        if ( paramObj['scheduleSeq'] == null ) {
            this.newScheduleWin = Ext.create('view.ReportNewScheduleWin', {
                parent      : this,
                cls         : 'list-condition',
                padding     : 0,
                style       : {background : 'transparent !important'}
            });

            this.newScheduleWin.show();
            this.newScheduleWin.init();
        }
        else {
            this.newScheduleWin = Ext.create('Exem.XMWindow', {
                title       : common.Util.TR('Modify Schedule'),
                width       : 700,
                height      : 880,
                minWidth    : 500,
                minHeight   : 500,
                layout      : 'vbox',
                minimizable : false,
                maximizable : false,
                closable    : true,
                modal       : true,
                cls         : 'list-condition',
                padding       : 0
            });

            var scheduleTitleFieldSet = Ext.create('Ext.form.FieldSet', {
                title       : '',
                itemId      : 'scheduleTitleFieldSet',
                width       : '100%',
                height      : 45,
                layout      : 'absolute',
                margin      : '20 20 10 20',
                defaultType : 'textfield'
            });

            this.scheduleTitleTxtField  = Ext.create('Exem.TextField',{
                fieldLabel : common.Util.TR('Schedule Title'),
                itemId     : 'scheduleTitle',
                width      : '98%',
                height     : 20,
                margin     : '10 0 0 4',
                labelAlign : 'left',
                labelWidth : 92,
                value      : paramObj.scheduleTitle,
                emptyText  : common.Util.TR('Please enter schedule title'),
                listeners: {
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

            this.schedulingForm = Ext.create('view.ReportSchedulingForm', {
                parent      : this.newScheduleWin,
                width       : '100%',
                flex        : 1,
                scheduleSeq : paramObj.scheduleSeq,
                templateSeq : paramObj.templateSeq,
                scheduleTitle : paramObj.scheduleTitle,
                scheduleState : paramObj.state
            });

            var bottomBtnCon = Ext.create('Ext.container.Container', {
                width : '100%',
                height: 30,
                layout: { type: 'hbox', pack: 'center', align: 'middle' },
                items : [
                    this._createButton({ text: common.Util.TR('Ok')    , itemId: 'scheduleOkBtn'     }, false),
                    this._createButton({ text: common.Util.TR('Cancel'), itemId: 'scheduleCancelBtn' }, false)
                ]
            });

            scheduleTitleFieldSet.add(this.scheduleTitleTxtField);
            this.newScheduleWin.show();
            this.newScheduleWin.add( scheduleTitleFieldSet, this.schedulingForm, bottomBtnCon );

            this.schedulingForm._setInitData(
                paramObj.scheduleSeq,
                paramObj.templateSeq,
                {
                    reportType        : paramObj.reportType,
                    startDate         : paramObj.startDate,
                    endDate           : paramObj.endDate,
                    intervalUnit      : paramObj.intervalUnit,
                    selectSMTP        : paramObj.smtpSeq,
                    intervalDayOfWeek : paramObj.intervalDayOfWeek,
                    retentionValue    : paramObj.retentionValue,
                    reportStartPoint  : paramObj.reportStartPoint,
                    reportEndPoint    : paramObj.reportEndPoint,
                    reportPastFlag    : paramObj.reportPastFlag,
                    mailSignature     : paramObj.mailSignature
                }
            );
        }

        if ( this.isLoading ) {
            this.loadingMask.hide();
        }
    },

    _openArticleTemplate: function( dataRows, recordData ) {
        if ( !dataRows || !dataRows.length ) {
            if ( this.isLoading ) {
                this.loadingMask.hide();
            }

            return false;
        }

        var ix, ixLen, targetScope;
        var queryBindInfo = JSON.parse(dataRows[0][3]);

        var resultObj = {
            PAGE_DIRECTION  : queryBindInfo.pageDirection,
            WAS_LIST        : queryBindInfo.selectedWasIds,
            WAS_NAME        : queryBindInfo.selectedWasNames,
            AVG_CHECK       : queryBindInfo.chkAvg,
            MAX_CHECK       : queryBindInfo.chkMax,
            AGGREGATE       : queryBindInfo.aggregate,
            STAT_LIST       : {}
        };

        for ( ix = 0, ixLen = queryBindInfo.selectedStats.length; ix < ixLen; ix++ ) {
            resultObj.STAT_LIST[queryBindInfo.selectedStats[ix]] = 0;
        }

        this._openTemplateWin({
            templateSeq     : recordData.templateSeq,
            templateOptions : resultObj,
            useDefaultStat  : false,
            modify          : true,
            timeWindowCheck : queryBindInfo.timeWindowCheck,
            recordData      : recordData
        });

        targetScope = this.newTemplateWin.mainBackgroundCon;

        targetScope.mainView.buttonContainer.items.items[1].hide();  // Set Schedule Button Hide

        targetScope.templateTitleTxtField.setValue(recordData.templateTitle);
        targetScope.operationTimeWindow.timeWindow.fromTimeField.setValue(queryBindInfo.fromTime.split(':')[0]);
        targetScope.operationTimeWindow.timeWindow.toTimeField.setValue(queryBindInfo.toTime.split(':')[0]);

        if ( this.isLoading ) {
            this.loadingMask.hide();
        }
    },

    _saveSchedule: function() {
        var scheduleTitle  = this.scheduleTitleTxtField.getValue().trim();
        var schedulingForm = this.schedulingForm;
        var scheduleSeq    = schedulingForm.scheduleSeq;
        var scheduleInfo   = schedulingForm._getScheduleInfo();
        var userSeqListStr = schedulingForm._getRecipientSeqList();

        if ( scheduleTitle == '' ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter schedule title.'), Ext.Msg.OK, Ext.MessageBox.INFO, function(){
                this.scheduleTitleTxtField.focus();
            }.bind(this));
            return false;
        }

        //중복체크
        if ( schedulingForm.scheduleTitle != scheduleTitle && this.scheduleGrid.findRow('scheduleTitle', scheduleTitle) !== -1) {
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
                { name: 'schedule_seq'        , type: SQLBindType.INTEGER, value: scheduleSeq                     },
                { name: 'schedule_title'      , type: SQLBindType.STRING , value: scheduleTitle                   },
                { name: 'start_date'          , type: SQLBindType.STRING , value: scheduleInfo.startDate          },
                { name: 'end_date'            , type: SQLBindType.STRING , value: scheduleInfo.endDate            },
                { name: 'interval_value'      , type: SQLBindType.INTEGER, value: scheduleInfo.intervalValue      },
                { name: 'interval_unit'       , type: SQLBindType.INTEGER, value: scheduleInfo.intervalUnit       },
                { name: 'interval_day_of_week', type: SQLBindType.INTEGER, value: scheduleInfo.intervalDayOfWeek  },
                { name: 'retention_value'     , type: SQLBindType.INTEGER, value: scheduleInfo.retentionValue     },
                { name: 'smtp_seq'            , type: SQLBindType.INTEGER, value: scheduleInfo.smtpSeq            },
                { name: 'state'               , type: SQLBindType.INTEGER, value: scheduleInfo.scheduleState      },
                { name: 'login_user'          , type: SQLBindType.INTEGER, value: Comm.config.login.user_id       },
                { name: 'report_start_point'  , type: SQLBindType.INTEGER, value: scheduleInfo.reportStartPoint   },
                { name: 'report_end_point'    , type: SQLBindType.INTEGER, value: scheduleInfo.reportEndPoint     },
                { name: 'report_past_flag'    , type: SQLBindType.INTEGER, value: scheduleInfo.reportPastFlag     },
                { name: 'is_end_of_the_month' , type: SQLBindType.INTEGER, value: scheduleInfo.isEndOfTheMonth    },
                { name: 'mail_signature'      , type: SQLBindType.INTEGER, value: scheduleInfo.mailSignature      }
            ],
            replace_string : [{
                name : 'user_seq_list',
                value: userSeqListStr
            }]
        };

        $.ajax({
            // sql_file: 'IMXPA_Report_Configuration_Schedule_Update.sql'
            type : 'put',
            url  : '/reportSchedule',
            data : JSON.stringify(dataSet),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                if ( response.header.success ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Save Success'), Ext.Msg.OK, Ext.MessageBox.INFO);
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Cannot save %1', common.Util.TR('schedule')), Ext.Msg.OK, Ext.MessageBox.ERROR);
                }

                this._execGetList('schedule');
                this.newScheduleWin.close();
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {}
        });
    },

    _getConvertIntervalDayOfWeek: function( value ) {
        if ( !value ) {
            return null;
        }

        var ix, dayNum;
        var resultStr = '';
        var convertObj = {
            6: 'Mon',
            5: 'Tue',
            4: 'Wed',
            3: 'Thu',
            2: 'Fri',
            1: 'Sat',
            0: 'Sun'
        };

        for ( ix = 6; ix >= 0; ix-- ) {
            dayNum = value & ( 1 << ix );

            if ( dayNum ) {
                if ( resultStr ) {
                    resultStr += ', ';
                }

                resultStr += convertObj[ix];
            }
        }

        return resultStr;
    },

    _addColumns: function( itemId ) {
        var grid;

        if ( itemId == 'reportGrid' ) {
            grid = this.reportGrid;
            grid.beginAddColumns();
            grid.addColumn(common.Util.CTR('Creation Time') ,  'creationTime'       ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('')              ,  'reportType'         ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Report Type')   ,  'displayReportType'  ,  100  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Schedule Title'),  'scheduleTitle'      ,  300  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Report Name')   ,  'reportName'         ,  0    , Grid.String, false, true);
            grid.addColumn(common.Util.CTR('Build By')      ,  'buildBy'            ,  100  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Template Seq')  ,  'templateSeq'        ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Schedule Seq')  ,  'scheduleSeq'        ,  0    , Grid.Number, false, true);
            grid.endAddColumns();
        } else if ( itemId == 'templateGrid' ) {
            grid = this.templateGrid;
            grid.beginAddColumns();
            grid.addColumn(common.Util.CTR('Template Seq')      ,  'templateSeq'        ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Creation Time')     ,  'creationTime'       ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('')                  ,  'reportType'         ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Report Type')       ,  'displayReportType'  ,  100  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Template Title')    ,  'templateTitle'      ,  300  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Create By')         ,  'createBy'           ,  100  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Update Time')       ,  'updateTime'         ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('Update By')         ,  'updateBy'           ,  100  , Grid.String, true, false);
            grid.endAddColumns();
        } else if ( itemId == 'scheduleGrid' ) {
            grid = this.scheduleGrid;
            grid.beginAddColumns();
            grid.addColumn(common.Util.CTR('Schedule Seq')              ,  'scheduleSeq'            ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Template Seq')              ,  'templateSeq'            ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('SMTP Seq')                  ,  'smtpSeq'                ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Creation Time')             ,  'creationTime'           ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('')                          ,  'reportType'             ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Report Type')               ,  'displayReportType'      ,  100   , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Template Title')            ,  'templateTitle'          ,  155  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Schedule Title')            ,  'scheduleTitle'          ,  155  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Start Date')                ,  'startDate'              ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('End Date')                  ,  'endDate'                ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('Interval Unit')             ,  'displayUnit'            ,  0    , Grid.String, false, true);
            grid.addColumn(common.Util.CTR('Interval Day Of Week')      ,  'displayDayOfWeek'       ,  180  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Report Retention Period')   ,  'displayRetentionValue'  ,  175  , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('State')                     ,  'state'                  ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('Create By')                 ,  'createBy'               ,  90   , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('Update Time')               ,  'updateTime'             ,  140  , Grid.DateTime, true, false);
            grid.addColumn(common.Util.CTR('Update By')                 ,  'updateBy'               ,  90   , Grid.String, true, false);
            grid.addColumn(common.Util.CTR('')                          ,  'intervalUnit'           ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'intervalDayOfWeek'      ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'retentionValue'         ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'reportStartPoint'       ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'reportEndPoint'         ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'reportPastFlag'         ,  0    , Grid.Number, false, true);
            grid.addColumn(common.Util.CTR('')                          ,  'mailSignature'          ,  0    , Grid.Number, false, true);
            grid._columnsList.push({
                xtype: 'actioncolumn',
                text : common.Util.CTR('State'),
                dataIndex: 'stateBtn',
                width: 65,
                align: 'center',
                sortable: false,
                menuDisabled: true,
                colvisible : true,
                items: [{
                    getTip: function( a, metadata, record) {
                        return record.data.state ? 'Running' : 'Stop';
                    },
                    getClass: function( a, metadata, record) {
                        return record.data.state ? 'report-schedule-state-run' : 'report-schedule-state-stop';
                    },
                    handler: function( view, rowIdx, colIdx, item, e, record ) {
                        this.loadingMask.show();

                        var dataSet = {
                            bind: [{
                                name : 'schedule_seq',
                                type : SQLBindType.INTEGER,
                                value: record.data['scheduleSeq']
                            }, {
                                name : 'state',
                                type : SQLBindType.INTEGER,
                                value: record.data['state'] ? 0 : 1
                            }]
                        };

                        $.ajax({
                            // IMXPA_Report_Configuration_Schedule_State_Update.sql
                            type : 'put',
                            url  : '/reportSchedule/state',
                            data : JSON.stringify(dataSet),
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            success: function( record, e ) {
                                return function(response) {
                                    var msg;

                                    if ( response.header.success ) {
                                        if ( record.raw.state ) {
                                            msg = common.Util.TR('Scheduling Stop');

                                            record.raw.state = 0;
                                            record.data.state = 0;
                                            e.target.classList.remove('report-schedule-state-run');
                                            e.target.classList.add('report-schedule-state-stop');
                                            e.target.setAttribute('data-qtip','Stop');
                                        } else {
                                            msg = common.Util.TR('Scheduling Running');

                                            record.raw.state = 1;
                                            record.data.state = 1;
                                            e.target.classList.remove('report-schedule-state-stop');
                                            e.target.classList.add('report-schedule-state-run');
                                            e.target.setAttribute('data-qtip','Running');
                                        }

                                        common.Util.showMessage(common.Util.TR('Confirm'), msg, Ext.Msg.OK, Ext.MessageBox.INFO);
                                    } else {
                                        common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Cannot save report template'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                                    }

                                    this.loadingMask.hide();
                                }.bind(this);
                            }.call( this, record, e ),
                            error: function(XHR, textStatus, errorThrown) {
                            }
                        });
                    }.bind(this)
                }]
            });
            grid._columnsList.push({
                xtype: 'actioncolumn',
                text : common.Util.CTR('Send Now'),
                dataIndex: 'sendNowBtn',
                width: 85,
                align: 'center',
                sortable: false,
                menuDisabled: true,
                colvisible : true,
                items: [{
                    iconCls: 'report-schedule-build',
                    getTip: function() {
                        return 'Send Now';
                    },
                    handler: function( view, rowIdx, colIdx, item, e, record ) {
                        this.loadingMask.show();

                        $.ajax({
                            type : 'post',
                            url  : '/reportArchive',
                            data : JSON.stringify({ schedule_seq: record.data['scheduleSeq'] }),
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            success: function(response) {
                                if ( response.header.success ) {
                                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Email was successfully sent.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                                } else {
                                    // common.Util.TR('No report recipients are found.')
                                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Mail sending is failed.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                                }

                                this.loadingMask.hide();
                            }.bind(this),
                            error: function(XHR, textStatus, errorThrown) {
                            }
                        });
                    }.bind(this)
                }]
            });

            grid._fieldsList.push('stateBtn');
            grid._fieldsList.push('sendNowBtn');

            grid.endAddColumns();
        }
    }


});