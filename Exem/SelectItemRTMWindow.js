Ext.define('Exem.selectItemRTMWindow',{
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
                        if(self.checkedListCount() === 0){
                            this.up('window').destroy();
                        }
                        var checkBoxCount = self.chkListBox.items.items.length;
                        var checkListInfo = [];
                        for(var ix = 0; ix < checkBoxCount; ix++){
                             var item = Ext.getCmp(self.chkListBox.items.items[ix].id);
                             checkListInfo[checkListInfo.length] = !item.checked;
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

    addCheckBox: function(key, labelName, isHidden) {
        var self = this;

        var checkbox = Ext.create('Ext.form.field.Checkbox',{
            margin: '2 0 0 3',
            boxLabel: labelName,
            infokey: key,
            checked: !(isHidden === 'true' || isHidden), //columnInfo.colvisible,
            //targetColumn: columnInfo,
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
        this.setTitle(titleName);
    },

    showColumns: function(object) {
        var self = this;
        var columnNums = object.getColumnsNum();

        for (var ix = 0; ix < columnNums; ix++) {
            self.addCheckBox(object.getColumnId(ix) , object.getColumnLabel(ix), object.isColumnHidden(ix));
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
