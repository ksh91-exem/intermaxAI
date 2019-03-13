Ext.define('Exem.selectItemWindow',{
    extend: 'Exem.XMWindow',
    title   : 'Window',
    height  : 310,
    width   : 300,
    minWidth: 300,
    maxWidth: 300,
    layout  : 'fit',
    modal   : true,
    draggable: false,
    closable : true,
    maximizable: false,
    constructor: function(config){
        this.superclass.constructor.call(this, config);
        this._initLayout();
        this.isChangeCheckListBox = true;
        this.addCls('xm-selectitem-window-base');
    } ,

    _initLayout: function() {
        this.add(this._initBackgroundPanel());
    },

    _initBackgroundPanel: function() {
        var self = this;
        self.backgroundPanel = Ext.create('Ext.panel.Panel',{
            itemId: 'backgroundPanel',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            items:[self._initTopPanel(),
                   self._initMainPanel(),
                   self._initBottomPanel()]
        });
        return  this.backgroundPanel;
    },

    _initTopPanel: function() {
        var self = this;
        self.topPanel = Ext.create('Ext.container.Container',{
            width: '97%',
            items: [{
                xtype:'checkboxfield',
                boxLabel: common.Util.TR('CheckAll'),
                itemId: 'checkAll',
                checked: true,
                margin: '0 0 0 3',
                handler: function() {
                    if (self.isChangeCheckListBox) {
                        self._chkListBoxChangeHandler(arguments[1]);
                    }
                }
            }]
        });
        return self.topPanel;
    },

    _chkListBoxChangeHandler: function(args) {
        var self = this;
        var checkBoxCount = self.chkListBox.items.items.length;
        for(var ix=0; ix< checkBoxCount; ix++){
            if (self.chkListBox.items.items[ix].getValue() != args){
                self.chkListBox.items.items[ix].setValue(args);
            }
        }
    },

    _initMainPanel: function() {
        var self = this;
        self.chkListBox =  Ext.create('Ext.panel.Panel',{
            layout :'vbox',
            autoScroll: true,
            padding: '0 3 0 3',
            flex   : 1,
            width  : 276,
            height : 200
        });
        return  self.chkListBox;
    },

    _initBottomPanel: function() {
        var self = this;

        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        if(self.checkedListCount() == 0){
                            self.destroy();
                        }
                        var checkBoxCount = self.chkListBox.items.items.length;
                        var checkListInfo = [];
                        for(var ix = 0; ix < checkBoxCount; ix++){
                             var item = Ext.getCmp(self.chkListBox.items.items[ix].id);
                             checkListInfo.push(item);
                        }
                        self.target.fireEvent('selectWindowsCallbackProc', checkListInfo);

                        self.destroy();
                    });
                }
            }
        });

        var cancelBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('Cancel'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.destroy();
                    });
                }
            }
        });

        self.bottomPanel = Ext.create('Ext.container.Container',{
            width:'100%',
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'center'
            },
            height: 30,
            items:[okBtn, cancelBtn]
        });
        return   self.bottomPanel;
    },

    checkedListCount: function() {
        var self = this;
        var count = 0;
        for(var i = 0; i < self.chkListBox.items.items.length; i++){
            if( self.chkListBox.items.items[i].getValue() === true) {
                count++;
            }
        }
        return count;
    },

    _isAllSelected: function () {
        var self = this;
        var isAllChecked = true;
        for(var i = 0; i < self.chkListBox.items.items.length; i++){
            if( self.chkListBox.items.items[i].getValue() === false) {
                isAllChecked = false;
                break;
            }
        }
        return isAllChecked;
    },

    addCheckBox: function(key, labelName, columnInfo) {
        var self = this;
        var checkbox = Ext.create('Ext.form.field.Checkbox',{
            margin: '2 0 0 3',
            boxLabel: labelName,
            infokey: key,
            checked:  columnInfo.colvisible,
            targetColumn: columnInfo,
            handler: function() {
                var chkAll = self.topPanel.getComponent('checkAll');
                self.isChangeCheckListBox = false;
                chkAll.setValue(self._isAllSelected());
                self.isChangeCheckListBox = true;
            }
        });
        self.chkListBox.add(checkbox);
    },
    setWindowTitle: function(titleName) {
        var self = this;
        self.setTitle(titleName);
    },

    showColumns: function(object) {

        var self = this;
        var getClass = Ext.getClass(object);
        // pnlExGrid 또는 pnlExTree 일 경우 getClass = true, 다른 object일 경우에는 false,
        if( getClass ){
            var columnInfo = object.headerCt.getGridColumns();
            for (var ix = 0; ix < columnInfo.length; ix++) {
                if (columnInfo[ix].columnHide) {
                    continue;
                }
                if(columnInfo[ix].xtype !== 'rownumberer'){
                    self.addCheckBox(columnInfo[ix].dataIndex , columnInfo[ix].text, columnInfo[ix]);
                }
            }
        } else {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    self.addCheckBox( prop , object[prop]);
                }
            }
        }
        // function으로 변경할 부분.
        var chkAll = self.topPanel.getComponent('checkAll');
        self.isChangeCheckListBox = false;
        chkAll.setValue(self._isAllSelected());
        self.isChangeCheckListBox = true;

        self.show();
        self.updateLayout();
    }

});
