/**
 * Created by min on 2015-09-30.
 */
Ext.define('view.TxnDetail.XMCallTreeExclude',{
    extend      : 'Exem.XMWindow',
    layout      : 'fit',
    width       : 850,
    height      : 600,
    minWidth    : 500,
    minHeight   : 400,
    title       : common.Util.TR('Call Tree display exclusions registration'),
    draggable   : false,
    closeAction : 'hide',
    modal       : true,
    resizable   : false,
    maximizable : false,
    cls         : 'call-tree',
    target      : null,

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.exclusionLabel = this.monitorType === 'TP' || this.monitorType === 'CD' || this.monitorType === 'TUX' ? 'Trace' : 'Method';
        this.exclusionColTitle = this.monitorType === 'TP' || this.monitorType === 'CD' || this.monitorType === 'TUX' ? 'Trace exclusions item' : 'Method exclusions item';

        if (this.monitorType === 'TP') {
            this.exclusionEnvKey = 'pa_exclude_tp_calltree';

        } else if (this.monitorType === 'TUX') {
            this.exclusionEnvKey = 'pa_exclude_tux_calltree';

        } else if (this.monitorType === 'CD') {
            this.exclusionEnvKey = 'pa_exclude_cd_calltree';

        } else {
            this.exclusionEnvKey = 'pa_exclude_was_calltree';

        }
    },

    initLayout: function() {
        var self = this,
            background, centerContainer, topContainer, midContainer,
            btnApply;

        background = Ext.create('Exem.Container',{
            layout: 'fit',
            width : '100%',
            height: '100%'
        });

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
        });

        midContainer = Ext.create('Exem.Container',{
            layout: 'hbox',
            width : '100%',
            height: '100%',
            flex  : 9
        });

        btnApply = Ext.create('Ext.button.Button',{
            itemId: 'close_btn',
            text  : common.Util.TR('Apply'),
            width : 100,
            height: 22,
            margin: '3 0 0 330',
            listeners: {
                click: function() {
                    //1. web env 저장
                    var ix, ixLen,
                        data, insert_data = [];

                    for (ix = 0, ixLen = self.gridExclusion.getSelectedRow().length; ix < ixLen; ix++) {
                        data = self.gridExclusion.getSelectedRow()[ix].data;
                        insert_data.push(JSON.stringify([data.class, data.method]));
                    }

                    common.WebEnv.rewrite_config(self.exclusionEnvKey, insert_data);

                    //2. web env reload
                    common.WebEnv.Save(self.exclusionEnvKey, insert_data);

                    //3. go filter
                    self.target.calltree_exclude_filter( self.target.$target.tid, insert_data );

                    data = null;
                    insert_data = null;

                    self.cbxExclusionClass.selectByIndex(0);
                    self.cbxExclusionMethod.selectByIndex(0);
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

    createTopLayout: function(target) {
        var self = this,
            btnContainer, btnAdd, btnDel;

        this.cbxExclusionClass = Ext.create('Exem.AjaxComboBox',{
            fieldLabel     : common.Util.TR('Class'),
            width          : 340,
            labelWidth     : 38,
            data           : [],
            enableKeyEvents: true,
            listeners: {
                afterrender: function(me) {
                    me.selectByIndex(0);
                }
            }
        });

        this.cbxExclusionMethod = Ext.create('Exem.AjaxComboBox',{
            fieldLabel     : common.Util.TR(this.exclusionLabel),
            width          : 340,
            //height         : 50,
            labelWidth     : 50,
            data           : [],
            enableKeyEvents: true,
            listeners: {
                afterrender: function(me) {
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
                click: function() {
                    self.addExclusionGrid();
                }
            }
        });


        btnDel = Ext.create('Ext.button.Button',{
            itemId   : 'delete_btn',
            text     : common.Util.TR('Delete'),
            width    : 46,
            height   : 20,
            listeners:{
                click: function() {
                    self.gridExclusion.deleteRecords(self.gridExclusion.baseGrid.getSelection());
                }
            }
        });


        btnContainer.add([btnAdd, { xtype: 'tbspacer', width: 3 }, btnDel]);

        if (this.monitorType === 'TP' || this.monitorType === 'TUX' || this.monitorType === 'CD') {
            target.add([this.cbxExclusionMethod, btnContainer]);
        } else {
            target.add([this.cbxExclusionClass, { xtype: 'tbspacer', width: 20 }, this.cbxExclusionMethod, btnContainer]);
        }
    } ,

    createMidLayout: function(target) {
        var colHide, colHideable,
            classWidth, methodWidth;

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

        colHide     = this.monitorType === 'TP' || this.monitorType === 'TUX' || this.monitorType === 'CD';
        colHideable = this.monitorType !== 'TP' || this.monitorType !== 'TUX' || this.monitorType === 'CD';
        classWidth  = this.monitorType === 'TP' || this.monitorType === 'TUX' || this.monitorType === 'CD' ? '0%'   : '50%';
        methodWidth = this.monitorType === 'TP' || this.monitorType === 'TUX' || this.monitorType === 'CD' ? '100%' : '50%';

        this.gridExclusion.beginAddColumns();
        this.gridExclusion.addColumn({text: common.Util.CTR('Class exclusions item'), dataIndex: 'class' ,  width: classWidth, type: Grid.String, alowEdit: false, editMode: false, hide: colHide, hideable : colHideable});
        this.gridExclusion.addColumn({text: common.Util.CTR(this.exclusionColTitle) , dataIndex: 'method', width: methodWidth, type: Grid.String, alowEdit: false, editMode: false});
        this.gridExclusion.endAddColumns();

        target.add(this.gridExclusion);
    } ,


    addExclusionGrid: function() {
        var data,
            ix, ixLen,
            classComboValue, methodComboValue;


        classComboValue = this.cbxExclusionClass.getValue();
        methodComboValue = this.cbxExclusionMethod.getValue();

        if (classComboValue == '' && methodComboValue == '') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                });
            return;
        }

        if (classComboValue == '%' && methodComboValue == '%') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                });
            return;
        }

        //기존에 그리드에 있는지 확인.
        for (ix = 0, ixLen = this.gridExclusion.getRowCount(); ix < ixLen; ix++) {
            data = this.gridExclusion.getRow(ix).data;

            if (data.class !== '%' && data.class == this.cbxExclusionClass.rawValue) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Duplicate class values exist.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                data = null;
                return;
            }

            if (data.method !== '%' && data.method == this.cbxExclusionMethod.rawValue) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Duplicate method values exist.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });

                data = null;
                return;
            }

            if (data.class == '%' && data.method == '%') {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });

                data = null;
                return;
            }
        }

        if (classComboValue == null || classComboValue.trim() == '') {
            classComboValue = '%';
        }

        if (methodComboValue == null || methodComboValue.trim() == '') {
            methodComboValue = '%';
        }

        this.gridExclusion.addRow([classComboValue , methodComboValue]);
        this.gridExclusion.drawGrid();

        this.cbxExclusionClass.setValue('');
        this.cbxExclusionMethod.setValue('');

        data = null;
    },


    loadExclusionListData: function() {
        var ix, ixLen;


        if (Comm.web_env_info[this.exclusionEnvKey] == undefined) {
            return;
        }
        if (this.gridExclusion.getRowCount() !== 0) {
            return;
        }

        for (ix = 0, ixLen = Comm.web_env_info[this.exclusionEnvKey].length; ix < ixLen; ix++) {
            this.gridExclusion.addRow([JSON.parse(Comm.web_env_info[this.exclusionEnvKey][ix])[0], JSON.parse(Comm.web_env_info[this.exclusionEnvKey][ix])[1]]);
        }
        this.gridExclusion.drawGrid();
        this.gridExclusion.checkAll();

    },

    setExclusionCbxData: function(cbxData) {
        var classData, methodData;

        if (cbxData) {
            classData = cbxData[0];
            methodData = cbxData[1];

            this.cbxExclusionClass.setData(classData);
            this.cbxExclusionMethod.setData(methodData);
        }

        this.cbxExclusionClass.setSearchField('name');
        this.cbxExclusionMethod.setSearchField('name');

        this.cbxExclusionClass.selectByIndex(0);
        this.cbxExclusionMethod.selectByIndex(0);
    }
});