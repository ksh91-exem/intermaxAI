Ext.define('rtm.src.rtmTopologyAiView', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Topology View'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    MNODECount: 0,
    CNODECount: 0,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.TOPOLOGY, me);

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.TOPOLOGY_COUNT, me.topology);

            if (this.timer) {
                clearTimeout(this.timer);
            }
            realtime.openTxnPathWin = undefined;

            window.realtime.TopologyComponentId = null;

            if (Comm.RTComm.removeReceivePacket) {
                Comm.RTComm.removeReceivePacket(PKT_DATA_NUMBER.TOPOLOGY_INFO);
                Comm.RTComm.removeReceivePacket(PKT_DATA_NUMBER.TOPOLOGY_COUNT);
            }
            this.clearTopologyData();
        }
    },


    initProperty: function() {
        this.isWinClosed      = false;
        this.isNotFirstConfig = false;
        this.isTierGroupMode  = common.Menu.isBusinessPerspectiveMonitoring || false;

        this.topologyInfoData = null;

        // 다른 컴포넌트 화면에서 토폴로지 뷰를 조작할 수 있는 토폴로지 뷰 컴포넌트 ID를 설정함.
        window.realtime.TopologyComponentId = this.id;
    },


    init: function() {
        var theme;
        var fontColor, nodeJoinColor, backgroundColor;

        this.initProperty();

        if (Comm.RTComm.addReceivePacket) {
            Comm.RTComm.addReceivePacket(PKT_DATA_NUMBER.TOPOLOGY_INFO);
            Comm.RTComm.addReceivePacket(PKT_DATA_NUMBER.TOPOLOGY_COUNT);
        }

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 5 0 5'
        });
        this.add(this.background);

        this.titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 28,
            layout : {
                type : 'hbox'
            },
            margin: '6 0 0 5'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 5',
            cls    : 'header-title',
            text   : common.Util.TR('Topology View')
        });

        this.createComponent();

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex: 1,
            cls : 'rtm-transaction',
            style: 'overflow:auto',
            listeners: {
                scope: this,
                resize: function() {
                    if (this.topology && this.topology.isImageLoad) {
                        this.topology.resize();
                    }
                }
            }
        });

        this.background.add(this.titleArea, this.chartArea);

        theme = Comm.RTComm.getCurrentTheme();
        switch (theme) {
            case 'Black' :
                fontColor = '#FFFFFF';
                nodeJoinColor = '#FFFFFF';
                backgroundColor = '#000000';
                break;
            case 'White' :
                fontColor = '#000000';
                nodeJoinColor = '#000000';
                backgroundColor = '#FFFFFF';
                break;
            default :
                fontColor = '#FFFFFF';
                nodeJoinColor = '#FFFFFF';
                backgroundColor = '#393C43';
                break;
        }

        this.topology = new XMTopologyAI();
        this.topology.id = 'topology-' + Ext.id();
        this.topology.target = this.chartArea.getEl().dom;
        this.topology.target.style.marginTop = '-20px;';
        this.topology.relPtColor = nodeJoinColor;
        this.topology.fontColor = fontColor;
        this.topology.backgroundColor = backgroundColor;

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

        this.topology.configNodePosition  = this.configNodePosition;
        this.topology.getNodeNameById     = this.getNodeNameById;
        this.topology.getDBInfoByHashCode = this.getDBInfoByHashCode;
        this.topology.saveNodePosition    = this.saveNodePosition;
        this.topology.getInitInfo         = this.getInitInfo;
        this.topology.updateDestFilter    = this.updateDestFilter;
        this.topology.isShowAllNode       = this.isShowAllNode;
        this.topology.zoomPercent         = this.zoomPercent;
        this.topology.viewGroup           = this.viewGroup;

        this.topology.init();

        if (!this.remoteData) {
            this.remoteData = [];
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.TOPOLOGY, this);

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.TOPOLOGY_COUNT, this.topology);
    },

    createOptionWindow: function() {
        var optionPanel, firstOption,
            radioBoxCon, checkBoxCon,
            bottomArea,
            bizLabelName;

        var optionWin =  Ext.create('Exem.XMWindow', {
            layout  : 'fit',
            title   : common.Util.TR('Add User Screen'),
            cls     : 'xm-dock-window-base rtm-transactionmonitor-option-window',
            width   : 440,
            height  : 280,
            modal   : true,
            resizable  : false,
            maximizable: false,
            closeAction: 'hide',
            listeners: {
                scope: this,
                afterlayout: function() {
                    this.newGroupNameField.setValue('');
                    this.orderByCopied.setValue(true);
                    this.newGroupNameField.focus();
                }
            }
        });

        optionPanel = Ext.create('Ext.panel.Panel', {
            layout : 'vbox',
            width  : '100%',
            height : 120,
            border : false,
            split  : true,
            margin : '3 0 3 0',
            padding: '2 2 2 2',
            items: [{
                xtype : 'container',
                layout: 'absolute',
                cls   : 'rtm-activetxn-option',
                itemId: 'optionPanelLeft',
                width : '100%',
                flex  : 1
            }]
        });

        firstOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 70,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Please enter a new name.'),
            x: 10,
            y: 12
        });

        this.newGroupNameField = Ext.create('Exem.TextField', {
            width: 375,
            x: 0,
            y: 10,
            maxLength: 20,
            enableKeyEvents: true,
            maskRe: new RegExp('^[A-Za-z0-9]'),
            listeners: {
                scope: this,
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER) {
                        this.saveNewViewGroup();
                    }
                }
            }
        });

        firstOption.add(this.newGroupNameField);

        this.secondOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 60,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Arrangement Standard'),
            x: 10,
            y: 87
        });

        radioBoxCon = Ext.create('Ext.container.Container', {
            layout  : 'hbox',
            x       : 10,
            y       : 5,
            margin  : '2 0 0 10',
            cls     : 'rtm-transactionmonitor-radioBoxCon'
        });

        bizLabelName = this.isTierGroupMode ? 'Tier' : 'Business';

        this.orderByBusiness = Ext.create('Ext.form.field.Radio', {
            boxLabel : bizLabelName,
            flex     : 1,
            name     : 'optiontype',
            listeners : {
                scope: this,
                change: function(self, newValue) {
                    if (newValue && this.isTierGroupMode) {
                        this.secondOption.setHeight(80);
                        this.tierBgCheck.setVisible(true);
                        this.tierBgCheck.setValue(false);
                    } else {
                        this.secondOption.setHeight(60);
                        this.tierBgCheck.setVisible(false);
                        this.tierBgCheck.setValue(false);
                    }
                }
            }
        });

        this.orderByHost = Ext.create('Ext.form.field.Radio', {
            boxLabel : 'Host',
            flex     : 1,
            name     : 'optiontype'
        });

        this.orderByCopied = Ext.create('Ext.form.field.Radio', {
            boxLabel : 'Copy',
            width    : 85,
            name     : 'optiontype',
            checked  : true
        });

        radioBoxCon.add(this.orderByBusiness, this.orderByHost, this.orderByCopied);

        checkBoxCon = Ext.create('Ext.container.Container', {
            layout  : 'hbox',
            x       : 10,
            y       : 32,
            margin  : '2 0 0 10'
        });

        this.tierBgCheck = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Add Tier Background'),
            cls     : 'rtm-combobox-label',
            margin  : '0 0 0 0',
            checked : false,
            hidden  : true
        });

        checkBoxCon.add(this.tierBgCheck);

        this.secondOption.add(radioBoxCon, checkBoxCon);

        optionPanel.getComponent('optionPanelLeft').add(firstOption, this.secondOption);

        bottomArea =  Ext.create('Exem.Container', {
            cls    : 'rtm-activetxn-option-bottom',
            layout : {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            margin: '0 0 0 0',
            width : '100%',
            height: 38,
            items: [{
                xtype: 'button',
                cls : 'rtm-btn',
                text: common.Util.TR('Save'),
                width : 60,
                height: 20,
                listeners: {
                    scope: this,
                    click: function() {
                        this.saveNewViewGroup();
                    }
                }
            },{
                xtype : 'button',
                cls   : 'rtm-btn',
                text  : common.Util.TR('Cancel'),
                margin: '0 0 0 15',
                height: 20,
                listeners: {
                    scope: this,
                    click: function() {
                        optionWin.close();
                    }
                }
            }]
        });

        optionPanel.add(bottomArea);

        optionWin.add(optionPanel);

        return optionWin;
    },

    saveNewViewGroup: function() {
        var newGroupName = this.newGroupNameField.getValue();
        var existGroupName = this.nodeViewGroupCombo.findRecordByValue(newGroupName);
        var arrangeStnd = null;

        if (!newGroupName) {
            this.newGroupNameField.focus();
            return;
        }

        if (existGroupName) {
            common.Util.showMessage(
                common.Util.TR('OK'),
                common.Util.TR('Username is already registered.'),
                Ext.MessageBox.OK,
                Ext.MessageBox.INFO
            );
            return;
        }

        if (this.orderByBusiness.getValue()) {
            arrangeStnd = this.isTierGroupMode ? 'Tier' : 'Business';
        } else if (this.orderByHost.getValue()) {
            arrangeStnd = 'Host';
        } else {
            arrangeStnd = null;
        }

        this.nodeViewGroupCombo.store.add({value: newGroupName});

        this.saveViewGroupList();
        this.viewGroup = newGroupName;
        this.topology.viewGroup = newGroupName;

        if (!arrangeStnd) {
            this.topology.saveCurrentNodeStruct();
        }
        this.reconfigureNodeGroup(arrangeStnd, this.tierBgCheck.getValue());

        this.nodeViewGroupCombo.select(this.nodeViewGroupCombo.findRecordByValue(newGroupName));


        common.Util.showMessage(
            common.Util.TR('OK'),
            common.Util.TR('Save Success'),
            Ext.MessageBox.OK,
            Ext.MessageBox.INFO
        );

        this.addViewGroupButton.optionView.close();
    },

    deleteViewGroup: function() {
        var viewGroup = this.nodeViewGroupCombo.getValue();

        if (viewGroup === 'Basic') {
            common.Util.showMessage(
                common.Util.TR('OK'),
                common.Util.TR('You cannot delete the default screen.'),
                Ext.MessageBox.OK,
                Ext.MessageBox.INFO
            );
            return;
        }

        common.Util.showMessage(
            common.Util.TR('Confirm'),
            common.Util.TR('Do you want to delete the user screen?'),
            Ext.MessageBox.OKCANCEL,
            Ext.MessageBox.INFO,
            function(buttonId) {
                var lastRecord = 0;
                var viewGroupStore = this.nodeViewGroupCombo.store;

                if (buttonId === 'ok') {
                    common.WebEnv.del_config('topologyNodeList' + viewGroup);
                    common.WebEnv.del_config('topologyNodePosition' + viewGroup);
                    common.WebEnv.del_config('topologyNodeRelation' + viewGroup);
                    common.WebEnv.del_config('topologyTierList' + viewGroup);

                    viewGroupStore.remove(this.nodeViewGroupCombo.findRecordByValue(viewGroup));
                    lastRecord = viewGroupStore.getAt(viewGroupStore.data.items.length - 1);
                    this.nodeViewGroupCombo.select(lastRecord);

                    this.saveViewGroupList();

                    common.Util.showMessage(
                        common.Util.TR('OK'),
                        common.Util.TR('Delete succeeded'),
                        Ext.MessageBox.OK,
                        Ext.MessageBox.INFO
                    );
                }
            }.bind(this)
        );
    },

    saveViewGroupList: function() {
        var ix, ixLen;
        var viewGroupLists = new Array();
        var viewGroupRecords = this.nodeViewGroupCombo.store.data.items;

        for (ix = 0, ixLen = viewGroupRecords.length; ix < ixLen; ix++) {
            viewGroupLists.push({value: viewGroupRecords[ix].data.value});
        }

        common.WebEnv.Save('rtm_topology_viewGroupList', JSON.stringify(viewGroupLists));
    },

    createComponent: function() {
        this.createViewGroupTypeComboBox();
        this.createViewGroupOptionButton();
        this.createAutoSaveCheckBox();
        this.createZoomPercentField();
        this.createShowAllNodeToggle();

        this.titleArea.add(this.frameTitle, {xtype: 'tbfill', flex: 1 },
            this.nodeViewGroupCombo, this.addViewGroupButton, this.delViewGroupButton,
            this.autoSaveCheckBox, this.savePositionButton,
            this.zoomViewField,
            this.showAllNodeToggle);
    },

    /**
     * 콤보박스 데이터 설정
     */
    createViewGroupTypeComboBox: function() {
        var viewGroupLists = null;
        var ix, ixLen;

        this.viewGroup = 'Basic';

        if (Comm.web_env_info.rtm_topology_viewGroup) {
            this.viewGroup = Comm.web_env_info.rtm_topology_viewGroup;
        }

        if (Comm.web_env_info.rtm_topology_viewGroupList) {
            viewGroupLists = JSON.parse(Comm.web_env_info.rtm_topology_viewGroupList);
        }

        this.nodeViewGroupCombo = Ext.create('Exem.ComboBox',{
            cls: 'rtm-list-condition',
            width: 150,
            margin: '0 5 0 0',
            valueField: 'value',
            displayField: 'value',
            multiSelect : false,
            forceSelection: true,
            useSelectFirstRow : false,
            editable: false,
            hidden: false,
            store: Ext.create('Ext.data.Store',{
                fields:['value'],
                data  :[]
            }),
            listeners: {
                scope: this,
                change: function(me) {
                    if (this.topology && me.getValue()) {
                        this.viewGroup = me.getValue();
                        this.topology.viewGroup = this.viewGroup;

                        common.WebEnv.Save('rtm_topology_viewGroup', this.viewGroup);
                        this.reconfigureNodeGroup();
                    }
                },
                afterrender: function() {
                    if (viewGroupLists) {
                        for (ix = 0, ixLen = viewGroupLists.length; ix < ixLen; ix++) {
                            this.nodeViewGroupCombo.store.add({value: viewGroupLists[ix].value});
                        }
                    } else {
                        this.nodeViewGroupCombo.store.add({value: 'Basic'});
                    }

                    this.nodeViewGroupCombo.select(this.nodeViewGroupCombo.findRecordByValue(this.viewGroup));
                }
            }
        });
    },

    createViewGroupOptionButton: function() {
        this.addViewGroupButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '3 6 0 0',
            html  : '<div class="frame-add-icon" title="' + common.Util.TR('Add') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.addViewGroupButton.optionView.show();
                    }, this);
                }
            }
        });

        if (this.addViewGroupButton) {
            this.addViewGroupButton.optionView = this.createOptionWindow();
        }

        this.delViewGroupButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '3 20 0 0',
            html  : '<div class="frame-delete-icon" title="' + common.Util.TR('Delete') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.deleteViewGroup();
                    }, this);
                }
            }
        });
    },

    createAutoSaveCheckBox: function() {
        realtime.isPositionAutoSave = true;

        if (Comm.web_env_info.rtm_topology_isautosave) {
            realtime.isPositionAutoSave = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_topology_isautosave);
        }

        this.autoSaveCheckBox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Save'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '0 20 0 0',
            hidden  : true,
            checked : realtime.isPositionAutoSave,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.savePositionButton.setVisible(!newVal);
                    realtime.isPositionAutoSave = newVal;
                    common.WebEnv.Save('rtm_topology_isautosave', newVal);
                }
            }
        });

        this.savePositionButton = Ext.create('Ext.button.Button', {
            cls: 'rtm-button',
            text : common.Util.TR('Apply'),
            margin: '0 20 0 0',
            width: 80,
            height: 24,
            hidden: true,
            listeners:{
                scope: this,
                click: function() {
                    this.saveAllNodePosition();
                }
            }
        });
    },

    createZoomPercentField: function() {
        this.zoomPercent = 100;

        if (Comm.web_env_info.rtm_topology_zoomPercent) {
            this.zoomPercent = parseInt(Comm.web_env_info.rtm_topology_zoomPercent);
        }

        this.zoomViewField = Ext.create('Ext.form.field.Number',{
            fieldLabel     :common.Util.TR('Zoom Ratio (%)') + ' ',
            labelAlign     : 'right',
            labelWidth     : 110,
            cls            : 'rtm-list-condition',
            margin         : '0 30 0 0',
            width          : 170,
            allowBlank     : false,
            maxLength      : 3,
            maxValue       : 150,
            minValue       : 50,
            enableKeyEvents: false,
            value          : this.zoomPercent,
            step           : 5,
            listeners      :{
                scope: this,
                change: function(field, value) {
                    if (value < 50 || value > 150 || typeof(value) !== 'number') {
                        return;
                    }

                    this.zoomPercent = value;

                    common.WebEnv.Save('rtm_topology_zoomPercent', this.zoomPercent);

                    this.topology.zoomPercent = this.zoomPercent;
                    this.topology.zoomRate = this.topology.zoomPercent / 100;
                    this.topology.canvasDraw();
                }
            }
        });
    },

    createShowAllNodeToggle: function() {
        this.isShowAllNode = true;

        if (Comm.web_env_info.rtm_topology_isshowall) {
            this.isShowAllNode =
                Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_topology_isshowall);
        }

        this.showAllNodeToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width   : 85,
            height  : 20,
            margin  : '0 20 0 0',
            onText  : common.Util.TR('All'),
            offText : common.Util.TR('Exclude'),
            state   : this.isShowAllNode,
            hidden  : false,
            listeners: {
                scope   : this,
                change  : function(toggle, state) {
                    this.topology.isShowAllNode = state;
                    common.WebEnv.Save('rtm_topology_isshowall', state);
                    this.topology.canvasDraw();
                }
            }
        });
    },

    /**
     * Update Transaction Path Header Info - WAS
     *
     * @param {} wasName
     * @param {} elapsedTime
     * @param {} sqlexecCount
     */
    updateTxnPathWasInfo: function(wasName, elapsedTime, sqlexecCount) {
        if (!this.$infoContainer) {
            return;
        }

        if (wasName) {
            this.$infoContainer.find('.txn-detail-info-java-name')
                .text(wasName).next()
                .text(common.Util.TR('Elapse') + ': ' + elapsedTime + ' / ' + common.Util.TR('Exec') + ': ' + sqlexecCount)
                .parent().parent().show().next().show();
        }
    },


    /**
     * Get Topology View Configuration Info
     */
    getInitInfo: function() {
        realTimeWS.send({
            command: COMMAND.TOPOLOGY
        });
    },


    /**
     * Update Active Transaction Dest
     *
     * @param {object} dest
     */
    updateDestFilter: function(dest) {
        var ix;
        var keys;

        realtime.topologyTxnFilterDest = dest;

        if (realtime.topologyTxnViewList) {
            keys = Object.keys(realtime.topologyTxnViewList);

            for (ix = 0; ix < keys.length; ix++) {
                if (realtime.topologyTxnViewList[keys[ix]].updateData) {
                    realtime.topologyTxnViewList[keys[ix]].updateData();
                }
            }
        }
    },


    /**
     * Save Topology Node Position
     *
     * @param {number} wasId
     * @param {number} x - node x position
     * @param {number} y - node y position
     */
    saveNodePosition: function(wasId, x, y) {
        var nodePositon;
        var saveNodeList;
        var viewGroup;
        var ix, ixLen;

        if (Comm.web_env_info.rtm_topology_viewGroup) {
            viewGroup = Comm.web_env_info.rtm_topology_viewGroup;
        } else {
            viewGroup = 'Basic';
        }
        viewGroup = viewGroup !== 'Basic' ? viewGroup : '';

        try {
            nodePositon = Comm.web_env_info['topologyNodePosition' + viewGroup];
            nodePositon = JSON.parse(nodePositon);
        } catch (e) {
            console.debug(e.message);
        }

        if (!nodePositon || nodePositon === 'undefined') {
            nodePositon = {};
        }
        nodePositon[wasId] = {x: x, y: y};

        saveNodeList = Ext.clone(this.nodeList);
        for (ix = 0, ixLen = saveNodeList.length; ix < ixLen; ix++) {
            if (saveNodeList[ix].addr) {
                saveNodeList[ix].addr.length = 0;
            }
        }

        // Save Node Position
        // common.WebEnv.Save('topologyNodePosition' + viewGroup, JSON.stringify(nodePositon));
        // Save Node List
        // common.WebEnv.Save('topologyNodeList' + viewGroup, JSON.stringify(saveNodeList));
        // Save Node Relation
        // common.WebEnv.Save('topologyNodeRelation' + viewGroup, JSON.stringify(this.relationData));

        saveNodeList = null;
    },


    saveAllNodePosition: function() {
        if (this.topology && this.topology.saveCurrentNodeStruct) {
            this.topology.saveCurrentNodeStruct(true);
        }
    },


    /**
     * Get Topology Node Position
     */
    configNodePosition: function() {
        var viewGroup = null;
        var nodePositon = null;

        if (Comm.web_env_info.rtm_topology_viewGroup) {
            viewGroup = Comm.web_env_info.rtm_topology_viewGroup;
        } else {
            viewGroup = 'Basic';
        }

        viewGroup = viewGroup !== 'Basic' ? viewGroup : '';
        nodePositon = Comm.web_env_info['topologyNodePosition' + viewGroup];

        if (this.topology) {
            this.topology.nodePot = JSON.parse(nodePositon);
        }
    },


    /**
     * Get WAS Name by was id
     *
     * @param {number} id - was id
     * @return {string} was Name
     */
    getNodeNameById: function(id) {
        return Comm.RTComm.getWASNamebyId(id) || id + '';
    },


    /**
     * Get DB Info by DB hashcode
     *
     * @param {string | number} code - db hashcode
     * @return {object} DB Info
     *         {id: dbId, name: instanceName, type: dbType}
     */
    getDBInfoByHashCode: function(code) {
        var key;
        var ix, ixLen;

        Comm.allDBInfo = {
            "1" : {
                "instanceName":"10.10.31.218.1521.fepdb01",
                "db_type":"ORACLE",
                "db_id":1,
                "dbAddr":258819178,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "2" : {
                "instanceName":"10.10.31.216.15211.mcidb",
                "db_type":"ORACLE",
                "db_id":2,
                "dbAddr":414513418,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "3" : {
                "instanceName":"10.10.31.216.15212.mcidb",
                "db_type":"ORACLE",
                "db_id":3,
                "dbAddr":1302017099,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "4" : {
                "instanceName":"10.10.31.216.15213.mcidb",
                "db_type":"ORACLE",
                "db_id":4,
                "dbAddr":-2105446516,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "5" : {
                "instanceName":"10.10.31.216.15214.mcidb",
                "db_type":"ORACLE",
                "db_id":5,
                "dbAddr":-1217942835,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "6" : {
                "instanceName":"null.0.null",
                "db_type":"ORACLE",
                "db_id":6,
                "dbAddr":-709458228,
                "host_ip":"",
                "sid":"",
                "port":""
            },
            "7" : {
                "instanceName":"null.15213.mcidb",
                "db_type":"ORACLE",
                "db_id":7,
                "dbAddr":297116972,
                "host_ip":"",
                "sid":"",
                "port":""
            }
        };

        if (!this.dbObjKeys) {
            this.dbObjKeys = Object.keys(Comm.allDBInfo);
        }

        for (ix = 0, ixLen = this.dbObjKeys.length; ix < ixLen; ix++) {
            key = this.dbObjKeys[ix];

            if (+Comm.allDBInfo[key].dbAddr === +code) {
                return {id: key, name: Comm.allDBInfo[key].instanceName, type: Comm.allDBInfo[key].db_type};
            }
        }
        return null;
    },


    /**
     * Check end transaction.
     *
     * @param {string | number} tid
     * @param {string | number} elapse
     */
    checkEndTxn: function(tid, elapse) {
        if (!tid || !elapse) {
            console.debug('%c [Topology View] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;',
                'TID, Elapse Time Parameter is undefined.');
            return;
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Topology_EndTxn.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }, {
                name: 'txn_elapse',
                type: SQLBindType.INTEGER,
                value: Math.ceil(elapse)
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed === true) {
                return;

            } else if (aheader && aheader.success === false && !adata) {
                console.debug('%c [Topology View] [ERROR] Failed to retrieve the End Txn Data.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (adata.rows && adata.rows.length > 0) {
                this.isEndTxnPathData = true;
            }

        }, this);
    },


    /**
     * Start end transaction check.
     */
    refreshCheckEndTxn: function() {
        this.stopCheckEndTxn();

        /**
         * 0:"Was_ID"
         * 1:"Was_Name"
         * 2:"TID"
         * 3:"TXN_Name"
         * 4:"Elapsed_Time"
         * 5:"Instance_Name"
         * 6:"State"
         * 7:"SQL_ID1"
         * 8:"SQL_Exec_Count"
         * 9:"Remote_Type"
         * 10:"Bind_List"
         * 11: dest
         * 12: guid
         */

        if (this.txnPath.isTxnPathRefresh === true) {
            this.checkEndTxn(this.selectedTID, this.elapsed);
        }

        this.onRemoteData();
        this.txnPath.onTxnPathData(this.remoteData, this.relationTxn);

        if (this.isEndTxnPathData) {
            this.selectedTID = null;
            this.elapsed = null;
            this.txnPathArea.setVisible(false);
            this.txnPathEmpty.setVisible(true);
            this.txnPathEmpty.setHtml(common.Util.TR('The transaction has been terminated.'));

            this.txnPath.isEndTxnPath = true;

        } else {
            this.refreshCheckTxnTimerId = setTimeout(this.refreshCheckEndTxn.bind(this), 1000 * 3);
        }
    },


    /**
     * Stop end transaction check.
     */
    stopCheckEndTxn: function() {
        if (this.refreshCheckTxnTimerId) {
            clearTimeout(this.refreshCheckTxnTimerId);
        }
    },


    /**
     * Convert Remote Data for transaction path.
     * RTMDataManager.onActiveRemoteFrame Call.
     *
     * @param {object} aData - packet data
     */
    onRemoteData: function(aData) {
        var ix, jx;
        var adata;

        this.CNodeRunOnce = false;

        this.remoteTree.clearNodes();

        if (aData) {
            this.data = Ext.clone(aData);
        } else {
            this.data = {};
            this.data.rows = Ext.clone(Repository.ActiveTxn);
        }

        if (!this.data) {
            console.debug('%c [Topology View] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;','No Data.');
            return;
        }

        this.MNODECount = 0;
        this.CNODECount = 0;

        this.addPNode();

        if (!this.remoteData) {
            this.remoteData = [];
        }
        if (!this.relationTxn) {
            this.relationTxn = [];
        }
        this.remoteData.length = 0;
        this.relationTxn.length = 0;

        adata = this.remoteTree.pnlExTree.getStore().data.items;

        for (ix = 0; ix < adata.length; ix++) {
            /**
             * 0:"Was_ID"
             * 1:"Was_Name"
             * 2:"TID"
             * 3:"TXN_Name"
             * 4:"Elapsed_Time"
             * 5:"Instance_Name"
             * 6:"State"
             * 7:"SQL_ID1"
             * 8:"SQL_Exec_Count"
             * 9:"Remote_Type"
             * 10:"Bind_List"
             * 11:"Dest"
             * 12:"GUID"
             */
            for (jx = 0; jx < Repository.ActiveTxnRemote.length; jx++) {

                if ( // this.fromWASID === adata[ix].data.wasid &&
                // this.openTxnFilterDest && this.openTxnFilterDest.indexOf(adata[ix].data.dest) !== -1 &&
                this.fromGUID === adata[ix].data.guid  &&
                Repository.ActiveTxnRemote[jx][0]  === adata[ix].data.wasid &&
                Repository.ActiveTxnRemote[jx][2]  === adata[ix].data.tid   &&
                Repository.ActiveTxnRemote[jx][11] === adata[ix].data.dest ) {
                    if (this.statTime === adata[ix].data.starttime) {
                        this.updateTxnPathWasInfo(
                            adata[ix].data.wasname,
                            adata[ix].data.elapsetime,
                            adata[ix].data.sqlexecutecount
                        );
                    }

                    this.remoteData[this.remoteData.length] = [
                        Repository.ActiveTxnRemote[jx][0],      // WAS ID
                        Repository.ActiveTxnRemote[jx][1],      // WAS Name
                        Repository.ActiveTxnRemote[jx][2],      // TID
                        Repository.ActiveTxnRemote[jx][3],      // Txn Name
                        adata[ix].data.elapsetime,              // Elapse Time
                        adata[ix].data.instance,                // Instance Name
                        Repository.ActiveTxnRemote[jx][6],      // State
                        Repository.ActiveTxnRemote[jx][7],      // SQL ID1
                        Repository.ActiveTxnRemote[jx][8],      // SQL Exec Count
                        Repository.ActiveTxnRemote[jx][9],      // Remote Type
                        Repository.ActiveTxnRemote[jx][10],     // Bind List
                        Repository.ActiveTxnRemote[jx][11],     // Dest
                        0,                                      // Depth
                        Repository.ActiveTxnRemote[jx][12]      // GUID
                    ];

                    if (adata[ix].data.childNodes.length > 0) {
                        this.setTxnTreeData(
                            adata[ix].data.id,
                            adata[ix].data.childNodes,
                            adata[ix].data.wasid + '-' + adata[ix].data.transaction,
                            1
                        );
                    }
                }
            }
        }

        adata = null;
    },


    setTxnTreeData: function(parentNodeId, adata, parentId, depth) {
        var ix, jx;

        for (ix = 0; ix < adata.length; ix++) {

            if (parentNodeId !== adata[ix].parentId) {
                continue;
            }

            /**
             * 0:"Was_ID"
             * 1:"Was_Name"
             * 2:"TID"
             * 3:"TXN_Name"
             * 4:"Elapsed_Time"
             * 5:"Instance_Name"
             * 6:"State"
             * 7:"SQL_ID1"
             * 8:"SQL_Exec_Count"
             * 9:"Remote_Type"
             * 10:"Bind_List"
             * 11:"Dest"
             * 12:"GUID"
             */
            for (jx = 0; jx < Repository.ActiveTxnRemote.length; jx++) {
                if (depth === 1 && this.openTxnToWasID && +this.openTxnToWasID !== +adata[ix].wasid) {
                    continue;
                }

                if (Repository.ActiveTxnRemote[jx][0] === adata[ix].wasid &&
                    Repository.ActiveTxnRemote[jx][2] === adata[ix].tid) {

                    this.remoteData[this.remoteData.length] = [
                        Repository.ActiveTxnRemote[jx][0],      // WAS ID
                        Repository.ActiveTxnRemote[jx][1],      // WAS Name
                        Repository.ActiveTxnRemote[jx][2],      // TID
                        Repository.ActiveTxnRemote[jx][3],      // Txn Name
                        adata[ix].elapsetime,                   // Elapse Time
                        adata[ix].instance,                     // Instance Name
                        Repository.ActiveTxnRemote[jx][6],      // State
                        Repository.ActiveTxnRemote[jx][7],      // SQL ID1
                        Repository.ActiveTxnRemote[jx][8],      // SQL Exec Count
                        Repository.ActiveTxnRemote[jx][9],      // Remote Type
                        Repository.ActiveTxnRemote[jx][10],     // Bind List
                        Repository.ActiveTxnRemote[jx][11],     // Dest
                        depth,                                  // Depth
                        Repository.ActiveTxnRemote[jx][12]      // GUID
                    ];
                    this.relationTxn[this.relationTxn.length] = {
                        fN: parentId,
                        tN: Repository.ActiveTxnRemote[jx][0] + '-' + Repository.ActiveTxnRemote[jx][3]
                    };
                }
            }

            if (adata[ix].childNodes.length > 0) {
                this.setTxnTreeData(
                    adata[ix].id,
                    adata[ix].childNodes,
                    adata[ix].wasid + '-' + adata[ix].transaction,
                    depth + 1
                );
            }

        }
        adata = null;
    },


    addPNode: function() {
        var ix, jx;
        var node = [];
        var bind = '';
        var temp;
        var guidDest, guid, dest, splitIdx;

        var rows = this.data.rows;

        for (ix = 0; ix < rows.length; ix++) {
            if (parseInt(rows[ix][42]) === 80) {
                rows[ix][42] = 'P';
                node[node.length] = rows[ix];
            }
        }

        node = node.sort(this.Comparator);

        for (ix = 0; ix < node.length; ix++) {
            if (node[ix][55] !== '') {
                bind = '';
                temp = common.Util.convertBindList(node[ix][55]);
                for (jx = 0; jx < temp.length; jx++) {
                    if (jx === 0) {
                        bind += ',';
                    }
                    bind += temp[jx].value;
                }
            }

            if (parseInt(node[ix][43]) === 0 &&
                parseInt(node[ix][44]) === 0 &&
                parseInt(node[ix][45]) === 0 &&
                node[ix][46] == '0' &&
                parseInt(node[ix][47]) === 0 &&
                parseInt(node[ix][48]) === 0) {
                continue;
            }

            guidDest = node[ix][56];
            if (guidDest.indexOf('^') !== -1) {
                guidDest = guidDest.substring(guidDest.indexOf('^') + 1);
            }

            splitIdx = guidDest.indexOf('|');
            if (splitIdx !== -1) {
                guid = guidDest.substring(0, splitIdx);
                guid = guid.toLowerCase();
                dest = guidDest.substring(splitIdx + 1);
            } else {
                guid = '';
                dest = guidDest;
            }

            this.remoteTree.addNode(
                null,
                [
                    common.Util.getDate(node[ix][0]),                           // Time
                    node[ix][42],                                               // Remote Type
                    node[ix][3],                                                // TID
                    node[ix][43],                                               // Key1
                    node[ix][44],                                               // Key2
                    node[ix][45],                                               // Key3
                    node[ix][46],                                               // Key4
                    node[ix][47],                                               // Key5
                    node[ix][48],                                               // Key6
                    node[ix][1],                                                // WAS Id
                    node[ix][2],                                                // WAS Name
                    node[ix][5],                                                // TXN Name
                    node[ix][54],                                               // Class Method
                    common.Util.codeBitToMethodType(node[ix][41]),              // Method Type
                    node[ix][6],                                                // Client IP
                    common.Util.getDate(parseInt(node[ix][7])),                 // Start Time
                    node[ix][10] / 1000,                                        // CPU_Time
                    node[ix][9] / 1000,                                         // Elapsed_Time
                    node[ix][39],                                               // Login_Name
                    ' ',                                                        // Browser
                    (node[ix][10] / 1000) + (node[ix][11] / 1000),                // DB Time
                    node[ix][11] / 1000,                                        // Wait_Time
                    node[ix][13],                                               // Pool
                    node[ix][15],                                               // Instance
                    node[ix][16],                                               // SID
                    Comm.RTComm.getActiveTxnState(node[ix][17]),                // State
                    bind,                                                       // Bind_List
                    node[ix][18],                                               // SQLID 1
                    node[ix][19],                                               // SQL_Text_1
                    node[ix][20],                                               // SQLID 2
                    node[ix][21],                                               // SQL_Text_2
                    node[ix][28],                                               // SQL Execute Count
                    node[ix][29],                                               // Fetch_Count
                    node[ix][30],                                               // Prepare_Count
                    '',                                                         // pga usage (mb)
                    node[ix][33],                                               // Logical_Reads
                    node[ix][34],                                               // Physical_Reads
                    node[ix][35],                                               // Wait_Info
                    1,                                                          // Moved
                    dest,                                                       // dest
                    guid                                                        // guid
                ]
            );
        }

        try {
            this.addMCNode(rows, 'M');
        } finally {
            node = null;
            bind = null;
            temp = null;
            rows = null;
        }
    },


    addMCNode: function(rows, type) {
        var ix, jx;
        var compare = type === 'M' ? 77 : 67;
        var bind = '';
        var temp;
        var guidDest, guid, dest, splitIdx;

        for (ix = 0; ix < rows.length; ix++) {
            if (parseInt(rows[ix][43]) === 0 &&
                parseInt(rows[ix][44]) === 0 &&
                parseInt(rows[ix][45]) === 0 &&
                rows[ix][46] == '0' &&
                parseInt(rows[ix][47]) === 0 &&
                parseInt(rows[ix][48]) === 0) {
                continue;
            }

            guidDest = rows[ix][56];
            if (guidDest.indexOf('^') !== -1) {
                guidDest = guidDest.substring(guidDest.indexOf('^') + 1);
            }

            splitIdx = guidDest.indexOf('|');
            if (splitIdx !== -1) {
                guid = guidDest.substring(0, splitIdx);
                guid = guid.toLowerCase();
                dest = guidDest.substring(splitIdx + 1);
            } else {
                guid = '';
                dest = guidDest;
            }

            if (compare === 67 && rows[ix][42] == 0) {

                this.remoteTree.addNode(
                    null,
                    [
                        common.Util.getDate(rows[ix][ 0]),                    // Time
                        rows[ix][42],                                         // Remote_Type
                        rows[ix][3],                                          // TID
                        rows[ix][43],                                         // Key1
                        rows[ix][44],                                         // Key2
                        rows[ix][45],                                         // Key3
                        rows[ix][46],                                         // Key4
                        rows[ix][47],                                         // Key5
                        rows[ix][48],                                         // Key6
                        rows[ix][1],                                          // Was_ID
                        rows[ix][2],                                          // Was_Name
                        rows[ix][5],                                          // TXN_Name
                        rows[ix][54],                                         // Class_Method
                        common.Util.codeBitToMethodType(rows[ix][41]),        // Method_Type
                        rows[ix][6],                                          // Client_IP
                        common.Util.getDate(parseInt(rows[ix][7])),           // Start_Time
                        rows[ix][10] / 1000,                                  // CPU_Time
                        rows[ix][9] / 1000,                                   // Elapsed_Time
                        rows[ix][39],                                         // Login_Name
                        ' ',                                                  // Browser
                        (rows[ix][10] / 1000) + (rows[ix][11] / 1000),          // DB Time
                        rows[ix][11] / 1000,                                  // Wait_Time
                        rows[ix][13],                                         // Pool
                        rows[ix][15],                                         // Instance
                        rows[ix][16],                                         // SID
                        Comm.RTComm.getActiveTxnState(rows[ix][17]),          // State
                        bind,                                                 // Bind_List
                        rows[ix][18],                                         // SQLID 1
                        rows[ix][19],                                         // SQL_Text_1
                        rows[ix][20],                                         // SQLID 2
                        rows[ix][21],                                         // SQL_Text_2
                        rows[ix][28],                                         // SQL Execute Count
                        rows[ix][29],                                         // Fetch_Count
                        rows[ix][30],                                         // Prepare_Count
                        '',                                                   // pga usage (mb)
                        rows[ix][33],                                         // Logical_Reads
                        rows[ix][34],                                         // Physical_Reads
                        rows[ix][35],                                         // Wait_Info
                        0,                                                    // Moved
                        dest,                                                 // dest
                        guid                                                  // guid
                    ]
                );
            }

            if (rows[ix][42] == compare) {
                rows[ix][42] = type;

                bind = '';
                if (rows[ix][55] !== '') {
                    temp = common.Util.convertBindList(rows[ix][55]);
                    for (jx = 0; jx < temp.length; jx++) {
                        if (jx === 0) {
                            bind += ',';
                        }
                        bind += temp[jx].value;
                    }
                }

                this.remoteTree.addNode(
                    null,
                    [
                        common.Util.getDate(rows[ix][ 0]),                    // Time
                        rows[ix][42],                                         // Remote_Type
                        rows[ix][3],                                          // TID
                        rows[ix][43],                                         // Key1
                        rows[ix][44],                                         // Key2
                        rows[ix][45],                                         // Key3
                        rows[ix][46],                                         // Key4
                        rows[ix][47],                                         // Key5
                        rows[ix][48],                                         // Key6
                        rows[ix][1],                                          // Was_ID
                        rows[ix][2],                                          // Was_Name
                        rows[ix][5],                                          // TXN_Name
                        rows[ix][54],                                         // Class_Method
                        common.Util.codeBitToMethodType(rows[ix][41]),        // Method_Type
                        rows[ix][6],                                          // Client_IP
                        common.Util.getDate(parseInt(rows[ix][7])),           // Start_Time
                        rows[ix][10] / 1000,                                  // CPU_Time
                        rows[ix][9] / 1000,                                   // Elapsed_Time
                        rows[ix][39],                                         // Login_Name
                        ' ',                                                  // Browser
                        (rows[ix][10] / 1000) + (rows[ix][11] / 1000),          // DB Time
                        rows[ix][11] / 1000,                                  // Wait_Time
                        rows[ix][13],                                         // Pool
                        rows[ix][15],                                         // Instance
                        rows[ix][16],                                         // SID
                        Comm.RTComm.getActiveTxnState(rows[ix][17]),          // State
                        bind,                                                 // Bind_List
                        rows[ix][18],                                         // SQLID 1
                        rows[ix][19],                                         // SQL_Text_1
                        rows[ix][20],                                         // SQLID 2
                        rows[ix][21],                                         // SQL_Text_2
                        rows[ix][28],                                         // SQL Execute Count
                        rows[ix][29],                                         // Fetch_Count
                        rows[ix][30],                                         // Prepare_Count
                        '',                                                   // pga usage (mb)
                        rows[ix][33],                                         // Logical_Reads
                        rows[ix][34],                                         // Physical_Reads
                        rows[ix][35],                                         // Wait_Info
                        0,                                                    // Moved
                        dest,                                                 // dest
                        guid                                                  // guid
                    ]
                );

                switch (type) {
                    case 'M' : this.MNODECount++;
                        break;
                    case 'C' : this.CNODECount++;
                        break;
                    default:
                        break;
                }
            }
        }

        if (!this.CNodeRunOnce) {
            this.CNodeRunOnce = true;
            this.addMCNode(rows, 'C');
        }

        if (type === 'C') {
            this.moveMNode();
        }

        compare = null;
        bind = null;
        temp = null;
    },

    moveMNode: function() {
        var ix = 0;
        var node = null;
        var temp = null;
        var count = this.MNODECount + this.CNODECount;

        for (ix = 0; ix < count; ix++) {
            temp = this.getNode();
            if (temp != null) {
                node = this.findNode(temp, this.remoteTree._jsonData);
                if (node) {
                    this.remoteTree.moveNode(temp, node);
                    temp.moved = 1;
                } else {
                    temp.moved = 1;
                }
            }
        }

        this.moveByGuid();

        try {
            this.remoteTree.drawTree();
        } finally {
            ix = null;
            node = null;
            temp = null;
            count = null;
        }
    },

    getNode: function() {
        var node = this.remoteTree._jsonData.childNodes;

        var searchNode = function(node) {
            var ix = 0;
            var result = null;
            try {
                for (ix = 0; ix < node.length; ix++) {
                    if (node[ix].remotetype != 'P') {
                        if (node[ix].childNodes.length > 0) {
                            result = searchNode(node[ix]);
                        } else {
                            if (node[ix].moved == 0) {
                                result = node[ix];
                                break;
                            }
                        }
                    }
                }
                ix = null;
                return result;
            } finally {
                result = null;
            }
        };

        return searchNode(node);
    },

    findNode: function(node, rootnode) {
        var searchNode = function(was, key1 , key2, key3, _rootnode) {
            var ix;
            var result = null;
            var data;
            var temp;
            var isBreak, isOk;

            try {
                for (ix = 0; ix < _rootnode.childNodes.length; ix++) {
                    isBreak = false;
                    data = _rootnode.childNodes[ix];

                    if (data && data.wasid) {

                        // TP 일 경우에는 동일한 WAS ID인 경우에도 처리가 가능하게 한다.
                        if (Comm.wasInfoObj[+data.wasid] && Comm.wasInfoObj[+data.wasid].type === 'TP') {
                            isOk = true;
                        } else {
                            isOk = (was != data.wasid);
                        }

                        if (isOk && key1 == data.key4 && key3 == data.key6) {
                            temp = Math.abs(Number(data.key5) - Number(key2));
                            if (temp < realtime.RemoteDiff) {
                                result = _rootnode.childNodes[ix];
                                isBreak = true;
                            }
                        } else {
                            if (_rootnode.childNodes[ix].childNodes.length > 0) {
                                result = searchNode(was, key1, key2, key3, _rootnode.childNodes[ix]);
                                if (result) {
                                    isBreak = true;
                                }
                            }
                        }
                    }
                    if (isBreak) {
                        break;
                    }
                }
                return result;
            } finally {
                ix = null;
                data = null;
                temp = null;
                result = null;
            }
        };
        return searchNode(node.wasid, node.key1, node.key2, node.key3, rootnode);
    },

    moveByGuid: function() {
        var ix;
        var temp;
        var nodeGuidMap = {};
        var nodeList = this.remoteTree._jsonData.childNodes;

        for (ix = 0; ix < nodeList.length; ix++) {
            temp = nodeList[ix];

            if (!temp.guid) {
                continue;
            }

            if (nodeGuidMap[temp.guid] >= 0 && nodeGuidMap[temp.guid] < ix + 1) {
                this.remoteTree.moveNode(temp, nodeList[nodeGuidMap[temp.guid]]);
                this.moveByGuid();
                break;

            } else {
                nodeGuidMap[temp.guid] = ix;
            }
        }
    },

    comparator: function(a, b) {
        if (a[9] > b[9]) {
            return -1;
        }
        if (a[9] < b[9]) {
            return 1;
        }
        return 0;
    },


    /**
     * Packet Alarm Data
     *
     * @param {object} data - alarm data
     */
    onAlarm : function(data) {
        if (this.topology.onAlarm) {
            this.topology.onAlarm(data);
        }

        data = null;
    },


    /**
     * Topology Configuration Packet Data
     *
     * @param {object} data
     */
    onData: function(data) {
        // 토폴로지 뷰를 필터된 서버만 보이게 재구성할 때 사용하기위한 데이터 설정.
        this.topologyInfoData = data;
        console.log(data);

        if (this.topology.onConfigLineData) {
            this.checkTopologyFilterServer(true);
            this.topology.onConfigLineData(data);
        }
    },


    /**
     * 토폴로지 뷰에 구성하는 서버(노드)정보를 다시 설정
     */
    reconfigTopologyView: function() {
        var data = this.topologyInfoData;

        if (this.topologyInfoData && this.topology.onConfigLineData) {
            // 토폴로지 뷰 데이터를 읽어왔는지 체크하는 구분값을 재설정
            // 재설정을 하지않는 경우 필터처리 하지 못하고 WebEnv에 저장된 구성 정보 그대로 표시함.
            this.topology.isLoadSaveNodeInfo = false;

            this.topology.onConfigLineData(data);
        }
    },


    /**
     * 토폴로지 뷰 구성에 필터된 서버(노드)가 있는지 체크.
     * 필터된 서버가 있는지 체크, 설정된 값이 있는 경우 토폴로지 뷰를 필터된 서버만 보이게 재구성하여 표시함.
     *
     * ex) Ext.getCmp(component id).checkTopologyFilterServer
     *
     * @param {boolean} isNotUpdate 토폴로지 뷰 구성을 업데이트 할지 정하는 값
     */
    checkTopologyFilterServer: function(isNotUpdate) {
        var isNotChange = true;

        // 필터된 정보가 있는 경우
        if (realtime.topologyFilterServers.length > 0) {

            if (realtime.topologyFilterServers.length !== this.topology.filterServerList.length) {
                isNotChange = false;

            } else if (realtime.topologyFilterServers.length === this.topology.filterServerList.length) {
                isNotChange = realtime.topologyFilterServers.every(function(v, i) {
                    return v === this.topology.filterServerList[i];
                }.bind(this));
            }
        }

        // 필터된 정보가 있거나 변경된 경우 필터 목록 재설정
        if (!isNotChange) {
            this.topology.filterServerList = realtime.topologyFilterServers.concat();

            // 토폴로지 뷰를 업데이트하는 경우만 화면을 재구성
            if (!isNotUpdate) {
                this.reconfigTopologyView();
            }
        }
    },


    /**
     * Change Node Group By Group Type.
     * [User, Host, Business, Service]
     *
     * @param {string} viewGroup - Group Type
     */
    reconfigureNodeGroup: function(arrangeStnd, bgCheck) {
        var viewGroupName = '';
        var savedNodeList = null;
        var ix, ixLen;
        var wasIdArrByGroup = {};

        if (!this.topology) {
            return;
        }

        viewGroupName = this.viewGroup !== 'Basic' ? this.viewGroup : '';
        savedNodeList = Comm.web_env_info['topologyNodeList' + viewGroupName];

        if (!savedNodeList || !savedNodeList.length) {
            if (arrangeStnd === 'Host') {
                for (ix = 0, ixLen = Comm.hosts.length; ix < ixLen; ix++) {
                    wasIdArrByGroup[Comm.hosts[ix]] = Comm.RTComm.WASListByHostName(Comm.hosts[ix]);
                }
            } else if (arrangeStnd === 'Business') {
                for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen; ix++) {
                    wasIdArrByGroup[Comm.bizGroups[ix]] = Comm.RTComm.WASListInGroup(Comm.bizGroups[ix]);
                }
            }  else if (arrangeStnd === 'Tier') {
                for (ix = 0, ixLen = Comm.sortTierInfo.length; ix < ixLen; ix++) {
                    wasIdArrByGroup[Comm.sortTierInfo[ix].tierName] = Comm.RTComm.WASListInGroup(Comm.sortTierInfo[ix].tierName);
                }
            }

            this.topology.isChangeDisplayRelation = true;
            this.topology.mergeNodeByGroupType(wasIdArrByGroup, arrangeStnd, bgCheck);
        } else {
            this.reconfigTopologyView();
        }
    },


    /**
     * Clear Topology Object Data.
     */
    clearTopologyData: function() {
        clearTimeout(this.topology.refreshTimerId);
        clearTimeout(this.topology.repeatCheckTimerId);
        clearTimeout(this.topology.refreshTxnPathTimerId);
        clearTimeout(this.topology.openFolderAnimateId);
        clearTimeout(this.topology.lastDestCheckTimeId);

        window.cancelAnimationFrame(this.topology.animationHandle);
        window.cancelAnimationFrame(this.topology.alarmAnimateHandle);
        window.cancelAnimationFrame(this.topology.lineEffectList.lineDrawAnimateId);

        this.topology.groupList         = null;
        this.topology.selectGroupIdArr  = null;
        this.topology.displayNodeList   = null;
        this.topology.nodeList          = null;
        this.topology.lineList          = null;
        this.topology.relationData      = null;
        this.topology.nodeNameBoxList   = null;
        this.topology.remoteInfoBoxList = null;
        this.topology.filterServerList  = null;
        this.topology.selectedLineObj   = null;
        this.topology.multiSelectedNode = null;
        this.topology.selectedRelationObj = null;
        this.topology.iconImg = null;

        if (this.topology.bufferWasNodes) {
            this.topology.bufferWasNodes.length   = 0;
            this.topology.bufferGroupNodes.length = 0;
            this.topology.bufferDBNodes.length    = 0;
            this.topology.bufferHostNodes.length  = 0;
        }

        delete this.topology.nodeMap;
        delete this.topology.webMap;
        delete this.topology.linePath;
        delete this.topology.nodePath;
        delete this.topology.activateDest;
        delete this.topology.tpsAvgMin;
        delete this.topology.elapsedTimeAvgMin;
        delete this.topology.originalTxnDestData;

        delete this.topology;
        delete this.topologyInfoData;
    },

    /**
     * Start Frame Animation Rendering
     */
    frameRefresh: function() {

        if (this.topology) {
            this.topology.isDrawFrame = true;
        }
    },

    /**
     * Stop Frame Animation Rendering
     */
    frameStopDraw: function() {

        if (this.topology) {
            this.topology.isDrawFrame = false;
        }
    }

});
