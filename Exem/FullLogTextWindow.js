Ext.define('Exem.FullLogTextWindow',{
    extend   : 'Exem.XMWindow',
    layout   : 'border',
    width    : 600,
    height   : 500,
    minWidth : 200,
    minHeight: 200,
    title    : common.Util.TR('Full Log Text'),
    modal    : true,
    draggable: false,
    closable : true,

    constructor: function(config){
        this.superclass.constructor.call(this, config);

        this.add(this._initCenterLayout());
        this.add(this._initBottomLayout());
    },

    _initCenterLayout: function(){
        var self = this;
        self.BaseFrame = Ext.create('Exem.SQLEditorBaseFrame', {
            mode : 'jade',
            useContextMenu : false,
            firstTabCaption : common.Util.TR('Log')
        });

        self.BaseFrame.getTabBar().items.items[1].hide();
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

        self.BottomPanel.add(self._initButtons('Close'));
        return  self.BottomPanel;
    },

    _initButtons: function(buttonType){
        var self = this;
        if (buttonType === 'Close') {
            self.closeButton = Ext.create('Ext.container.Container',{
                html   : common.Util.TR('Cancel'),
                height : 25,
                width  : 55,
                margin : '5 0 0 0',
                cls    : 'button3d',
                listeners: {
                    render: function(){
                        this.getEl().on('click', function(){
                            self.close() ;
                        });
                    }
                }
            });
            return self.closeButton;
        }
    },

    getFullLogText: function(LogId){
        var self = this;
        var dataset = {};

        dataset.bind = [{
            name : "log_id",
            value: LogId,
            type: SQLBindType.STRING
        }];

        dataset.sql_file = 'IMXPA_ExceptionHistory_Log.sql';
        WS.SQLExec(dataset, self.onData, self);
    },


    onData : function(header, data) {
        if (!Number(header.rows_affected) > 0) {
            return;
        }

        var text = '';
        if (data.rows[0][0])
            text = data.rows[0][0];

        text = text.replace(/[\n]/g, '\r\n');
        this.BaseFrame.sqlEditor.setText(text);

    }

});
