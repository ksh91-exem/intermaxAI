/**
 * Created by Kang on 2017-06-28.
 */

Ext.define('Exem.ReportEmailBaseForm', {
    extend         : 'Exem.DragNDropBaseForm',
    useAllCheck    : true,
    useDisplayName : false,
    parent         : null,  // popup 주체
    scheduleSeq    : null,

    useBtnType: {
        left     : true,
        right    : true,
        leftAll  : true,
        rightAll : true
    },

    listeners: {
        beforerender: function() {
            this.items.items[0].items.items[0].padding = '0 10 0 10';

            this.okBtn.hide();
            this.cancelBtn.hide();
        }
    },

    init: function () {
        this._baseInit();

        this._initBaseProperty();
        this._initBaseLayout();

        this.initializeBtn.hide();
        this.conditionTabPanel.setActiveTab(0);

        this._execGetList('recipient');
    },

    _initBaseProperty: function() {
        this.type = {
            user  : 0,
            group : 1
        };

        this.searchNameComboData = {
            user  : [],
            group : []
        };

        this.leftGridStoreData = {
            user  : [],
            group : []
        };

        this.listGridStoreData = [];

        this.defaultModel = Ext.define('editModel', {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'userSeq'  , type: 'int'    },
                { name: 'userName' , type: 'string' },
                { name: 'email'    , type: 'string' },
                { name: 'groupId'  , type: 'string' },
                { name: 'groupName', type: 'string' }
            ]
        });
    },

    _initBaseLayout: function () {
        this._createBaseLeftArea();
        this._createBaseRightArea();
    },

    _createBaseLeftArea: function() {
        this.leftTitleCon = Ext.create('Ext.container.Container', {
            width   : '100%',
            height  : 30,
            padding : '0 5 0 0',
            layout  : this.useAllCheck ?  { type: 'hbox', pack:'end', align:'middle'} : 'fit',
            html    : '<div style = "line-height: 30px; margin-left: 10px">'+ common.Util.TR('User List') +'</div>'
        });

        var leftVBoxCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : '100%',
            layout : 'vbox',
            flex   : 1,
            border : true ,
            style  : { border: '1px solid rgb(198, 198, 198)' }
        });

        this.conditionTabPanel = Ext.create('Exem.TabPanel', {
            width     : '100%',
            height    : 60,
            listeners: {
                tabchange: function ( groupTabPanel, newCard ) {
                    this._tabChange(newCard.index);
                }.bind(this)
            },
            items: [
                { title : common.Util.TR('User') , index : 0, active: true },
                { title : common.Util.TR('Group'), index : 1  }
            ]
        });

        this.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            width    : '30%',
            data     : [],
            padding  : '9 15 0 15',
            emptyText: common.Util.TR('Find User'),
            enableKeyEvents: true,
            listeners: {
                select: function() {
                    var fieldName = this.conditionTabPanel.getActiveTab().index == 0 ? 'userName' : 'groupName';
                    this.findStatValue(fieldName);
                }.bind(this),
                keydown: function(comboboxThis, e) {
                    if ( e.keyCode == 13 && comboboxThis.getValue() ) {
                        this.findStatValue('display');
                    }
                }.bind(this)
            }
        });

        this.conditionTabPanel.addDocked( this.searchNameCombo );

        var leftUserStore = Ext.create( 'Ext.data.Store', {
            model   : this.defaultModel,
            data    : []
        });

        this.leftUserGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            border      : false,
            margin      : '10 0 0 0',
            store       : leftUserStore,
            style       : 'border : #fff',
            cls         : 'exem-statChange-grid',
            plugins: [{
                // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                leadingBufferZone : 20      // 스크롤 위쪽
            }],
            columns: [
                { text: 'User Seq'  , dataIndex: 'userSeq'  , hidden: true  },
                { text: 'User Name' , dataIndex: 'userName' , flex  : 1     },
                { text: 'Email'     , dataIndex: 'email'    , hidden: true  },
                { text: 'Group Id'  , dataIndex: 'groupId'  , hidden: true  },
                { text: 'Group Name', dataIndex: 'groupName', hidden: true  }
            ],
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true,
                    enableDrag     : false,
                    enableDrop     : false
                }
            },
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                ignoreRightMouseSelection: true,
                mode: 'SIMPLE'
            }),
            bodyStyle: { cursor: 'pointer' },
            listeners: {
                cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                    e.stopEvent();
                }.bind(this)
            }
        });

        var leftGroupStore = Ext.create( 'Ext.data.Store', {
            model   : this.defaultModel,
            data    : []
        });

        this.leftGroupGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hidden      : true,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            border      : false,
            margin      : '10 0 0 0',
            store       : leftGroupStore,
            style       : 'border : #fff',
            cls    : 'exem-statChange-grid',
            plugins: [{
                // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                leadingBufferZone : 20      // 스크롤 위쪽
            }],
            columns: [
                { text: 'User Seq'  , dataIndex: 'userSeq'  , hidden: true  },
                { text: 'User Name' , dataIndex: 'userName' , hidden: true  },
                { text: 'Email'     , dataIndex: 'email'    , hidden: true  },
                { text: 'Group Id'  , dataIndex: 'groupId'  , hidden: true  },
                { text: 'Group Name', dataIndex: 'groupName', flex  : 1     }
            ],
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true,
                    enableDrag     : false,
                    enableDrop     : false
                }
            },
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                ignoreRightMouseSelection: true,
                mode: 'SIMPLE'
            }),
            bodyStyle: { cursor: 'pointer' },
            listeners: {
                cellcontextmenu: function( me, td, cellIndex, record, tr, rowIndex, e ) {
                    e.stopEvent();
                }.bind(this)
            }
        });

        leftVBoxCon.add(this.conditionTabPanel, this.leftUserGrid, this.leftGroupGrid );
        this.leftGridArea.add( this.leftTitleCon, leftVBoxCon );
    },

    _createBaseRightArea: function () {
        var ix, ixLen, row;

        var titleCon = Ext.create('Ext.container.Container',{
            width   : '100%',
            height  : 30,
            padding : '0 5 0 0',
            layout  : this.useAllCheck ?  { type: 'hbox', pack:'end', align:'middle'} : 'fit',
            html    : '<div style = "line-height: 30px; margin-left: 15px">'+ common.Util.TR('Recipient List') +'</div>'
        });

        // 왼쪽에서 넘어온 data 넣는그리드 필요.
        this.listStore = Ext.create( 'Ext.data.Store', {
            model: this.defaultModel,
            data    : []
        });

        this.listGrid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : this.listStore,
            cls         : 'exem-statChange-grid',
            plugins   : [{
                // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                leadingBufferZone : 20     // 스크롤 위쪽
            }],
            columns     : [
                { text: 'User Seq'  , dataIndex: 'userSeq'  , hidden: true  },
                { text: 'User Name' , dataIndex: 'userName' , flex  : 1     },
                { text: 'Email'     , dataIndex: 'email'    , hidden: true  },
                { text: 'Group Id'  , dataIndex: 'groupId'  , hidden: true  },
                { text: 'Group Name', dataIndex: 'groupName', hidden: true  }
            ],
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true,
                    enableDrag     : false,
                    enableDrop     : false
                }
            },
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode              : 'SIMPLE',
                enableKeyNav      : false
            }),
            bodyStyle: { cursor: 'pointer' },
            listeners: {
                cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                    e.stopEvent();
                }.bind(this)
            }
        });

        // 이미 우측 그리드에 있는 data 이면 다시 넣지 않는다.
        this.listGrid.view.on('beforedrop', function (node, data) {
            for( ix = 0, ixLen = data.records.length; ix < ixLen; ix++ ) {
                row = this.listGrid.store.findRecord('userName',data.records[ix].data['userName'] , 0, false, false, true);
                if ( row ) {
                    this.listGrid.store.remove(row);
                }
            }

            if ( this.conditionTabPanel.getActiveTab().index == 0 ) {
                this.leftUserGrid.getSelectionModel().deselectAll();
            } else {
                this.leftGroupGrid.getSelectionModel().deselectAll();
            }
        }.bind(this));

        this.listGrid.getSelectionModel().on('selectionchange', function (model, sels){
            this.isChangeCheckListBoxRight = false;

            if ( sels.length == 0 || sels.length === this.listGrid.store.getCount() ) {
                this.rightUpDownBtns.up.addCls('disabledstate');
                this.rightUpDownBtns.down.addCls('disabledstate');
            } else {
                this.rightUpDownBtns.up.removeCls('disabledstate');
                this.rightUpDownBtns.down.removeCls('disabledstate');
            }

            this.isChangeCheckListBoxRight = true;
        }, this);

        this.rightUpDownBtns = this.addUpDownBtn( titleCon, 'right' );
        this.rightGridArea.add(titleCon, this.listGrid);
    },

    // 좌측 그리드에서 우측으로 이동
    onClickMoveRight: function() {
        var ix, ixLen, userName, groupId, selectedList;
        var tabIdx       = this.conditionTabPanel.getActiveTab().index;
        var leftUserList = this.leftGridStoreData.user;
        var rightList    = this.listGridStoreData;
        var cbBoxUserDataList = [];

        if ( tabIdx == 0 ) {
            selectedList = this.leftUserGrid.getSelectionModel().getSelection();

            for ( ix = 0, ixLen = selectedList.length; ix < ixLen; ix++ ) {
                userName = selectedList[ix].data.userName;

                leftUserList = leftUserList.filter( function(item) {
                    if ( item['userName'] == userName ) {
                        rightList.push(item);
                        return false;
                    }
                    return true;
                }, this);
            }

            this.leftUserGrid.getSelectionModel().deselectAll();
        } else if ( tabIdx == 1 ) {
            selectedList = this.leftGroupGrid.getSelectionModel().getSelection();

            for ( ix = 0, ixLen = selectedList.length; ix < ixLen; ix++ ) {
                groupId = selectedList[ix].data.groupId;

                leftUserList = leftUserList.filter( function(item) {
                    if ( 0 <= item['groupId'].indexOf(groupId) ) {
                        rightList.push(item);
                        return false;
                    }
                    return true;
                }, this);
            }

            this.leftGroupGrid.getSelectionModel().deselectAll();
        }

        for( ix = 0, ixLen = leftUserList.length; ix < ixLen; ix++){
            cbBoxUserDataList.push({
                name : leftUserList[ix]['userName'],
                value: leftUserList[ix]['userName']
            });
        }

        this.searchNameComboData.user = cbBoxUserDataList;
        this.searchNameCombo.setValue('');
        this.searchNameCombo.applyEmptyText();
        this.searchNameCombo.setData( cbBoxUserDataList );
        if ( tabIdx == 0 ) {
            this.searchNameCombo.store.loadData(cbBoxUserDataList);
        }

        this.leftGridStoreData.user   = leftUserList;
        this.leftUserGrid.getStore().loadData(leftUserList);
        this.listGrid.getStore().loadData(rightList);
    },

    // 좌측 그리드에서 우측으로 이동 All
    onClickMoveRightAll: function() {
        var ix, ixLen, groupId;
        var tabIdx        = this.conditionTabPanel.getActiveTab().index;
        var leftUserList  = this.leftGridStoreData.user;
        var leftGroupList = this.leftGridStoreData.group;
        var rightList     = this.listGridStoreData;
        var cbBoxUserDataList = [];

        if ( tabIdx == 0 ) {
            leftUserList = leftUserList.filter( function(item) {
                rightList.push(item);
                return false;
            }, this);

            this.leftUserGrid.getSelectionModel().deselectAll();
        } else if ( tabIdx == 1 ) {
            for ( ix = 0, ixLen = leftGroupList.length; ix < ixLen; ix++ ) {
                groupId = leftGroupList[ix]['groupId'];

                leftUserList = leftUserList.filter( function(item) {
                    if ( 0 <= item['groupId'].indexOf(groupId) ) {
                        rightList.push(item);
                        return false;
                    }

                    cbBoxUserDataList.push({
                        name : item['userName'],
                        value: item['userName']
                    });
                    return true;
                }, this);
            }

            this.leftGroupGrid.getSelectionModel().deselectAll();
        }

        this.searchNameComboData.user = cbBoxUserDataList;
        this.searchNameCombo.setValue('');
        this.searchNameCombo.applyEmptyText();
        this.searchNameCombo.setData( cbBoxUserDataList );
        if(tabIdx === 0){
            this.searchNameCombo.store.loadData(cbBoxUserDataList);
        }

        this.leftGridStoreData.user   = leftUserList;
        this.leftUserGrid.getStore().loadData(leftUserList);
        this.listGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 선택 리스트 삭제.
    onClickMoveLeft: function () {
        var ix, ixLen, userName;
        var tabIdx        = this.conditionTabPanel.getActiveTab().index;
        var leftUserList = this.leftGridStoreData.user;
        var rightList    = this.listGridStoreData;
        var selectedList = this.listGrid.getSelectionModel().getSelection();
        var cbBoxUserDataList = [];

        for ( ix = 0, ixLen = selectedList.length; ix < ixLen; ix++ ) {
            userName = selectedList[ix].data.userName;

            rightList = rightList.filter( function(item) {
                if ( item['userName'] == userName ) {
                    leftUserList.push(item);
                    return false;
                }
                return true;
            }, this);
        }

        for( ix = 0, ixLen = leftUserList.length; ix < ixLen; ix++){
            cbBoxUserDataList.push({
                name : leftUserList[ix]['userName'],
                value: leftUserList[ix]['userName']
            });
        }

        this.searchNameComboData.user = cbBoxUserDataList;
        this.searchNameCombo.setValue('');
        this.searchNameCombo.applyEmptyText();
        this.searchNameCombo.setData( cbBoxUserDataList );
        if ( tabIdx == 0 ) {
            this.searchNameCombo.store.loadData(cbBoxUserDataList);
        }

        this.listGridStoreData = rightList;
        this.listGrid.getSelectionModel().deselectAll();
        this.leftUserGrid.getStore().loadData(leftUserList);
        this.listGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 전체 삭제.
    onClickMoveLeftAll: function() {
        var tabIdx            = this.conditionTabPanel.getActiveTab().index;
        var leftUserList      = this.leftGridStoreData.user;
        var rightList         = this.listGridStoreData;
        var cbBoxUserDataList = [];

        rightList = rightList.filter( function(item) {
            leftUserList.push(item);
            cbBoxUserDataList.push({
                name : item['userName'],
                value: item['userName']
            });
            return false;
        }, this);

        this.searchNameComboData.user = cbBoxUserDataList;
        this.searchNameCombo.setValue('');
        this.searchNameCombo.applyEmptyText();
        this.searchNameCombo.setData( cbBoxUserDataList );
        if(tabIdx === 0){
            this.searchNameCombo.store.loadData(cbBoxUserDataList);
        }

        this.listGridStoreData = rightList;
        this.listGrid.getSelectionModel().deselectAll();
        this.leftUserGrid.getStore().loadData(leftUserList);
        this.listGrid.getStore().loadData(rightList);
    },

    // 위로 한칸 이동
    onClickRightUp: function() {
        // 전체가 선택된 경우에는 return;
        var store    = this.listGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if( this.listGrid.getSelectionModel().isSelected(item)) {
                selected.push(item);
            }
        }.bind(this));

        var index = 0;
        for (var ix = 0, ixLen = selected.length; ix < ixLen; ix++) {
            index = store.indexOf(selected[ix]);
            if (ix === 0 && index < 1) {
                break;
            }
            store.remove(selected[ix],true);
            store.insert(index-1, selected[ix]);
        }

        this.listGrid.getSelectionModel().select(selected);
    },

    // 아래로 한칸 이동
    onClickRightDown: function() {
        var store    = this.listGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if (this.listGrid.getSelectionModel().isSelected(item)){
                selected.unshift(item);
            }
        }.bind(this));

        var index   = 0;
        for (var ix = 0, ixLen = selected.length; ix < ixLen; ix++ ) {
            index = store.indexOf(selected[ix]);
            if (index == this.listGrid.store.getCount()-1){
                continue;
            }
            store.remove(selected[ix],true);
            store.insert(index+1, selected[ix]);
        }

        this.listGrid.getSelectionModel().select(selected);
    },

    cancelFn: function () {
        this.close();
    },

    findStatValue: function(fieldName) {
        var grid = this.conditionTabPanel.getActiveTab().index == 0 ? this.leftUserGrid : this.leftGroupGrid;
        var searchString = this.searchNameCombo.getValue();
        var targetStore  = grid.getStore();
        var row          = targetStore.findRecord(fieldName, searchString, 0, false, false, true );
        if (row) {
            targetStore.remove(row, true);
            targetStore.insert(0, row);
            grid.getSelectionModel().select(row);
        }
    },

    _tabChange: function( tabIdx ) {
        switch( tabIdx ) {
            case 0:
                this.leftTitleCon.update('<div style = "line-height: 30px; margin-left: 10px">'+ common.Util.TR('User List') +'</div>');

                this.searchNameCombo.emptyText = common.Util.TR('Find User');
                this.searchNameCombo.setData(this.searchNameComboData.user);
                this.leftUserGrid.getStore().loadData(this.leftGridStoreData.user);

                this.leftUserGrid.show();
                this.leftGroupGrid.hide();
                break;
            case 1:
                this.leftTitleCon.update('<div style = "line-height: 30px; margin-left: 10px">'+ common.Util.TR('Group List') +'</div>');

                this.searchNameCombo.emptyText = common.Util.TR('Find Group');
                this.searchNameCombo.setData(this.searchNameComboData.group);
                this.leftGroupGrid.getStore().loadData(this.leftGridStoreData.group);

                this.leftUserGrid.hide();
                this.leftGroupGrid.show();
                break;
            default : break;
        }

        this.searchNameCombo.setValue('');
        this.searchNameCombo.setSearchField('name');
        this.searchNameCombo.applyEmptyText();

        this.listGrid.getStore().loadData(this.listGridStoreData);
    },

    _execGetList: function( type ) {
        var url;
        var whereStr = '';
        var dataSet  = {};

        switch ( type ) {
            case 'recipient':
                // IMXPA_Report_Email_Recipient_List.sql

                whereStr = 'where ' + (this.scheduleSeq == null ? '1=0' : 'c.schedule_seq = ' + this.scheduleSeq);

                dataSet.replace_string = [{
                    name : 'where_str',
                    value: whereStr
                }];

                url = '/reportRecipient?dataSet=' + JSON.stringify(dataSet);

                this._clearAllGridData();
                break;
            default: break;
        }

        $.ajax({
            type : 'get',
            url  : url,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                var row, userList, recipientList, groupList;

                if ( response.header.success ) {
                    if(!common.Util.checkSQLExecValid(response.header, response.data)){
                        console.debug('ReportEmailBaseForm - _execGetList');
                        console.debug(response.header);
                        console.debug(response.data);
                        return;
                    }
                    switch ( type ) {
                        case 'recipient':
                        //case 'group':
                            row = response.data.rows;

                            if ( !row || !row[0] || !row[1] || !row[2] ) {
                                return false;
                            }

                            userList      = row[0].data;
                            recipientList = row[1].data;
                            groupList     = row[2].data;

                            this._makeStoreData( userList, recipientList, groupList );
                            this._tabChange(0);
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

    _makeStoreData: function( leftUserList, listUserList, leftGroupList ) {
        var ix, ixLen, row, userName, groupName, findIdx;
        var userStoreData  = this.leftGridStoreData.user;
        var groupStoreData = this.leftGridStoreData.group;
        var userCbBoxData  = this.searchNameComboData.user;
        var groupCbBoxData = this.searchNameComboData.group;
        var listStoreData  = this.listGridStoreData;

        var leftUserNameList = [];
        var listUserNameList = [];

        // Make Recipient List
        for ( ix = 0, ixLen = listUserList.length; ix < ixLen; ix++ ) {
            row      = listUserList[ix];
            userName = row[1];

            findIdx = listUserNameList.indexOf(userName);

            if ( 0 <= findIdx ) {
                listStoreData[findIdx].groupId.push(row[3]);
                continue;
            }

            listUserNameList.push(userName);
            listStoreData.push({
                userSeq   : row[0],     // userSeq
                userName  : userName,   // userName
                email     : row[2],     // email
                groupId   : [           // groupId
                    row[3]
                ],
                groupName : row[4]      // groupName
            });
        }

        // Make ( Left TabPanel > User Tab > User List )
        for ( ix = 0, ixLen = leftUserList.length; ix < ixLen; ix++ ) {
            row      = leftUserList[ix];
            userName = row[1];

            if ( 0 <= listUserNameList.indexOf(userName) ) {
                continue;
            }

            findIdx = leftUserNameList.indexOf(userName);

            if ( 0 <= findIdx ) {
                userStoreData[findIdx].groupId.push(row[3]);
                continue;
            }

            leftUserNameList.push(userName);
            userStoreData.push({
                userSeq   : row[0],     // userSeq
                userName  : userName,   // userName
                email     : row[2],     // email
                groupId   : [           // groupId
                    row[3]
                ],
                groupName : row[4]      // groupName
            });

            userCbBoxData.push({
                name : userName,
                value: userName
            });
        }

        // Make ( Left TabPanel > Group Tab > Group List )
        for ( ix = 0, ixLen = leftGroupList.length; ix < ixLen; ix++ ) {
            row = leftGroupList[ix];
            groupName = row[1];

            groupStoreData.push({
                userSeq   : null,
                userName  : null,
                email     : null,
                groupId   : row[0],   // groupId
                groupName : groupName // groupName
            });

            groupCbBoxData.push({
                name : groupName,
                value: groupName
            });
        }
    },

    _clearAllGridData: function() {
        this.leftUserGrid.getStore().removeAll();
        this.leftGroupGrid.getStore().removeAll();
        this.listGrid.getStore().removeAll();

        this.leftGridStoreData.user.length    = 0;
        this.leftGridStoreData.group.length   = 0;
        this.searchNameComboData.user.length  = 0;
        this.searchNameComboData.group.length = 0;

        this.listGridStoreData.length = 0;
    }

});