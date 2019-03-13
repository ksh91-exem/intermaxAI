/**
 * Created by ksh on 2018-01-02.
 */
Ext.define("view.ExceptionHistoryExclude",{
    extend      : 'Exem.XMWindow',
    layout      : 'fit',
    width       : 450,
    height      : 600,
    minWidth    : 500,
    minHeight   : 400,
    title       : common.Util.TR('Exception display exclusions registration'),
    draggable   : false,
    closeAction : 'hide',
    modal       : true,
    resizable   : false,
    maximizable : false,
    cls         : 'call-tree',
    target      : null,

    init: function(){
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.exclusionEnvKey = 'pa_exclude_was_exception';
    },

    initLayout: function(){
        var self = this,
            background, centerContainer, topContainer, midContainer,
            btnApply;

        background = Ext.create('Exem.Container',{
            layout: 'fit',
            width : '100%',
            height: '100%'
        }) ;

        centerContainer = Ext.create('Exem.Container',{
            layout: 'vbox',
            widht : '100%',
            height: '100%',
            flex  : 9 ,
            margin: '10 5 0 5'
        });

        topContainer = Ext.create('Exem.Container',{
            layout: 'hbox',
            width : '100%',
            flex  : 1
        }) ;

        midContainer = Ext.create('Exem.Container',{
            layout: 'hbox',
            width : '100%',
            height: '100%',
            flex  : 9
        }) ;

        btnApply = Ext.create('Ext.button.Button',{
            itemId: 'close_btn',
            text  : common.Util.TR('Apply'),
            width : 100,
            height: 22,
            margin: '3 0 0 180',
            listeners: {
                click: function(){
                    //1. web env 저장
                    var ix, ixLen,
                        data, insert_data = [];

                    for(ix=0, ixLen=self.gridExclusion.getSelectedRow().length; ix<ixLen; ix++) {
                        data = self.gridExclusion.getSelectedRow()[ix].data;
                        insert_data.push(JSON.stringify([data.exception]));
                    }

                    common.WebEnv.rewrite_config(self.exclusionEnvKey, insert_data);

                    //2. web env reload
                    common.WebEnv.Save(self.exclusionEnvKey, insert_data);

                    //3. go filter
                    self.target.executeSQL();

                    data = null;
                    insert_data = null;

                    self.cbxExclusionException.selectByIndex(0);
                    self.close();
                }
            }
        });

        this.createTopLayout(topContainer);
        this.createMidLayout(midContainer);

        centerContainer.add([topContainer, midContainer, btnApply]);
        background.add(centerContainer);
        this.add(background);
    },

    createTopLayout: function(target){
        var self = this,
            btnContainer, btnAdd, btnDel;

        this.cbxExclusionException = Ext.create('Exem.AjaxComboBox',{
            fieldLabel     : common.Util.TR('Exception'),
            width          : 340,
            labelWidth     : 55,
            data           : [],
            enableKeyEvents: true,
            listeners: {
                afterrender: function (me) {
                    me.selectByIndex(0);
                }
            }
        });

        btnContainer = Ext.create('Exem.Container',{
            layout: 'hbox',
            widht : '100%',
            height: '100%',
            flex  : 1,
            margin: '0 0 0 5'
        });

        btnAdd = Ext.create('Ext.button.Button',{
            itemId   : 'add_btn',
            text     : common.Util.TR('Add'),
            width    : 46,
            height   : 20,
            listeners:{
                click: function(){
                    self.addExclusionGrid() ;
                }
            }
        });


        btnDel = Ext.create('Ext.button.Button',{
            itemId   : 'delete_btn',
            text     : common.Util.TR('Delete'),
            width    : 46,
            height   : 20,
            listeners:{
                click: function(){
                    self.gridExclusion.deleteRecords( self.gridExclusion.baseGrid.getSelection());
                }
            }
        });


        btnContainer.add([btnAdd, {xtype: 'tbspacer', width: 3}, btnDel]);

        target.add([this.cbxExclusionException, btnContainer]);
    } ,

    createMidLayout: function(target){

        this.gridExclusion = Ext.create('Exem.adminGrid',{
            flex        : 1,
            width       : '100%',
            border      : false,
            editMode    : false,
            useCheckBox : true,
            checkMode   : Grid.checkMode.SIMPLE,
            rowNumber   : false,
            usePager    : false,
            showHeaderCheckbox: true
        });

        this.gridExclusion.beginAddColumns();
        this.gridExclusion.addColumn({
            text: common.Util.CTR('Exception exclusions item'),
            dataIndex: 'exception',
            width: '100%',
            type: Grid.String,
            alowEdit: false,
            editMode: false,
        });
        this.gridExclusion.endAddColumns();

        target.add(this.gridExclusion);
    } ,


    addExclusionGrid: function(){
        var data,
            ix, ixLen,
            exceptionComboValue,
            lastIndex;


        exceptionComboValue = this.cbxExclusionException.getValue();

        if (exceptionComboValue == '') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                });
            return ;
        }

        if (exceptionComboValue == '%') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                });
            return ;
        }

        //기존에 그리드에 있는지 확인.
        for (ix=0, ixLen=this.gridExclusion.getRowCount(); ix<ixLen; ix++) {
            data = this.gridExclusion.getRow(ix).data;

            if (data.exception !== '%' && data.exception == this.cbxExclusionException.rawValue) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Duplicate exception values exist.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                data = null;
                return ;
            }

            if (data.exception == '%') {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });

                data = null;
                return ;
            }
        }

        if (exceptionComboValue == null || exceptionComboValue.trim() == '') {
            exceptionComboValue = '%';
        }

        this.gridExclusion.addRow([exceptionComboValue]);
        this.gridExclusion.drawGrid();

        lastIndex = this.gridExclusion.getRowCount() - 1;

        this.gridExclusion.selectRow(lastIndex, true);

        this.cbxExclusionException.setValue('');

        data = null;
    },


    loadExclusionListData: function(){
        var ix, ixLen;

        if (Comm.web_env_info[this.exclusionEnvKey] == undefined) {
            return ;
        }
        if (this.gridExclusion.getRowCount() !== 0) {
            return ;
        }

        for (ix=0, ixLen=Comm.web_env_info[this.exclusionEnvKey].length; ix<ixLen; ix++){
            this.gridExclusion.addRow([JSON.parse(Comm.web_env_info[this.exclusionEnvKey][ix])[0]]);
        }

        this.gridExclusion.drawGrid();
        this.gridExclusion.checkAll();
    },

    setExclusionCbxData: function(cbxData) {
        var exceptionData;

        exceptionData = cbxData[0];

        this.cbxExclusionException.setData(exceptionData);
        this.cbxExclusionException.setSearchField('name');

        this.cbxExclusionException.selectByIndex(0);
    }
});