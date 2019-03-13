/**
 * Created with IntelliJ IDEA.
 * User: JONGHO
 * Date: 13. 12. 17
 * Time: 오후 3:28
 * To change this template use File | Settings | File Templates.
 */
Ext.define('Exem.FullSQLTextWindow',{
    extend   : 'Exem.XMWindow',
    layout   : 'border',
    width    : 800,
    height   : 600,
    minWidth : 200,
    minHeight: 200,
    title    : common.Util.TR('Full SQL Text'),

    draggable: false,
    closable : true,

    mxgParams: null,

    constructor: function(config){
        this.superclass.constructor.call(this, config);

        this.openViewType = Comm.RTComm.getCurrentMonitorType();

        this.add(this._initCenterLayout());
        this.add(this._initBottomLayout());
    },

    _initCenterLayout: function(){
        var self = this;
        self.BaseFrame = Ext.create('Exem.SQLEditorBaseFrame');
        return self.BaseFrame;
    },

    _initBottomLayout: function(){
        var self = this;
        self.BottomPanel = Ext.create('Ext.panel.Panel',{
            width : '100%',
            height: 35,
            region: 'south',
            layout:  'absolute',

            listeners: {
                resize : function (){
                    if (self.closeButton != undefined) {
                        self.closeButton.setPosition(self.width - self.closeButton.width - 30, self.closeButton.y );
                    }
                }
            }
        });
        self.BottomPanel.add(self._initButtons('sqlFormat'));

        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();
        if (isEnableMaxGaugeLink && this.mxgParams) {
            self.BottomPanel.add(self._initButtons('sqlDetailAnalysis'));

            if (this.mxgParams.viewType !== 'SessionDetail') {
                this.BottomPanel.add(self._initButtons('sqlPlan'));
            }
        }

        self.BottomPanel.add(self._initButtons('close'));
        return  self.BottomPanel;
    },

    _initButtons: function(buttonType){
        var self = this;
        switch(buttonType){
            case 'sqlFormat':
                self.sqlFormatButton = Ext.create('Ext.button.Button',{
                    height : 25,
                    width  : 100,
                    margin : '0 5 0 0',
                    cls    : 'button3d',
                    x    : 3,
                    y    : 5,
                    text : common.Util.TR('Format SQL'),

                    listeners: {
                        'click': function() {
                            self.BaseFrame.setFormatSQL();
                        }
                    }
                });
                return self.sqlFormatButton;

            case 'sqlDetailAnalysis':
                self.sqlFormatButton = Ext.create('Ext.button.Button',{
                    height : 25,
                    width  : 100,
                    margin : '0 5 0 0',
                    cls    : 'button3d',
                    x    : 110,
                    y    : 5,
                    text : common.Util.TR('SQL Detail Analysis'),
                    listeners: {
                        scope: this,
                        click: function() {
                            var dbId, fromTime, toTime, sqlUid, sid, tid;

                            if (Comm.RTComm.openMaxGaugeSQLList) {
                                dbId     = this.mxgParams.dbId;
                                fromTime = this.mxgParams.fromTime;
                                toTime   = this.mxgParams.toTime;
                                sqlUid   = this.mxgParams.sqlUid;
                                tid      = this.mxgParams.tid;
                                sid      = this.mxgParams.sid;

                                if (this.mxgParams.viewType === 'LongTermTrendSQLView') {
                                    Comm.RTComm.openMaxGaugeLongTerm(dbId, fromTime, toTime, sqlUid);

                                } else if (this.mxgParams.viewType === 'SessionDetail') {
                                    Comm.RTComm.openMaxGaugeSessionDetail(dbId, sqlUid, sid, tid);

                                } else {
                                    Comm.RTComm.openMaxGaugeSQLList(dbId, fromTime, toTime, sqlUid);
                                }
                            }
                        }
                    }
                });
                return self.sqlFormatButton;

            case 'sqlPlan':
                self.sqlFormatButton = Ext.create('Ext.button.Button',{
                    height : 25,
                    width  : 100,
                    margin : '0 5 0 0',
                    cls    : 'button3d',
                    x    : 220,
                    y    : 5,
                    text : common.Util.TR('SQL Plan'),
                    listeners: {
                        scope: this,
                        click: function() {
                            var dbId, fromTime, toTime, sqlUid;

                            if (Comm.RTComm.openMaxGaugeSQLList) {
                                dbId     = this.mxgParams.dbId;
                                fromTime = this.mxgParams.fromTime;
                                toTime   = this.mxgParams.toTime;
                                sqlUid   = this.mxgParams.sqlUid;

                                Comm.RTComm.openMaxGaugeSQLPlan(dbId, fromTime, toTime, sqlUid);
                            }
                        }
                    }
                });
                return self.sqlFormatButton;

            case 'close':
                self.closeButton = Ext.create('Ext.button.Button',{
                    height : 25,
                    width  : 80,
                    margin : '5 0 0 0',
                    cls    : 'button3d',
                    text  : common.Util.TR('Close') ,

                    listeners: {
                        'click': function() {
                            this.up().up().destroy();
                        }
                    }
                });
                return self.closeButton;

            default:
                break;
        }
    },

    getFullSQLText: function(sql_Id, bindList){
        var self = this;
        self.BaseFrame.getFullSQLText(sql_Id, bindList);
    }


});
