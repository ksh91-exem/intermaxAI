/**
 * Created by JONGHO on 2015-04-22.
 */
Ext.define("Exem.ReportStatChange", {
    extend : 'Ext.container.Container',
    width  :'100%',
    height : '100%',
    layout : 'vbox',
    init: function() {
        this.initProperty();
        this.initLayout();
    },

    selectedStatCount     : 0,

    initProperty: function() {

        this.singleInstance = false;

        this.type = {
            stat: 0,
            wait: 1,
            os  : 2
        };

        this.dataList = {
            stat  : [],
            wait  : [],
            os    : []
        };

        this.searchNameComboData = {
            0  : [],
            1  : [],
            2  : []
        };

        // dname - displayname
        // rname - real
        // stype - stattype
        this.favDisplayList = [
            { dname: common.Util.TR('Concurrent Users'),                rname:'WAS_SESSION',   stype: this.type.stat },
            { dname: common.Util.TR('TPS'),                             rname:'TPS',           stype: this.type.stat },
            { dname: common.Util.TR('Execute Count'),                   rname:'EXECUTE_COUNT', stype: this.type.stat },
            { dname: common.Util.TR('Visitor Count'),                   rname:'VISITOR',       stype: this.type.stat },
            { dname: common.Util.TR('Event Count'),                     rname:'EVENT_COUNT',   stype: this.type.stat }
            //{ dname: common.Util.TR('Transaction Elapse Time (AVG)'),   rname:'TXN_ELAPSE',    stype: this.type.stat }
        ];
    },

    clearDataList: function() {
        this.dataList.stat.langth = 0;
        this.dataList.wait.langth = 0;
        this.dataList.os.langth   = 0;

        this.searchNameComboData[0].langth = 0;
        this.searchNameComboData[1].langth = 0;
        this.searchNameComboData[2].langth = 0;
    },

    initLayout: function() {
        // stat chage 영역

        this.checkBoxField = Ext.create('Ext.container.Container',{
            width : 250,
            layout: 'vbox',
            margin: '0 0 10 0'
        });

        var check = null;
        for (var ix = 0; ix < this.favDisplayList.length; ix++) {
            check = Ext.create('Ext.form.field.Checkbox' ,{
                boxLabel : this.favDisplayList[ix].dname,
                infoLabel: this.favDisplayList[ix].rname,
                stype    : this.favDisplayList[ix].stype,
                height   : 18,
                name     : 'rb',
                itemId   : 'checkList'+ix,
                id       : this.id + this.favDisplayList[ix].dname,
                inputValue: ix,
                listeners: {
                    scope: this,
                    change: function( _this, newValue) {
                        var targetGrid = this.statTabGrid;
                        var row = targetGrid.getStore().findRecord('display', _this.boxLabel );

                        if(newValue) {
                            if(this.selectListGrid._localStore.rootItems.length > 5) {
                                _this.setValue(false);
                                common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('You can select up to maximum 6 indicators'),Ext.Msg.OK);
                                return;
                            }

                            this.addSelectedList(_this.boxLabel, _this.infoLabel, _this.stype, 'check');
                            targetGrid.getSelectionModel().select(row, true, true);
                        }else {
                            this.deleteSelectedList(_this.boxLabel);

                            targetGrid.getSelectionModel().deselect(row, true);
                        }
                    }
                }
            });
            this.checkBoxField.add(check);
        }

        //this.add(this.checkBoxField)

        this.statField = Ext.create('Ext.container.Container',{
            width : '100%',
            flex : 1,
            layout: 'vbox',
            style: {
                border: '1px solid #C6C6C6'
            }
        });

        this.add(this.statField);

        this.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            width  : 225,
            data   : [],
            padding: '7 15 0 15',
            cls    : 'instanceCombo',
            emptyText: common.Util.TR('Find Stat'),
            enableKeyEvents: true,
            useSelectFirstRow : false,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findStatValue();
                },
                keydown: function(_this, e) {
                    //keyCode 은 ENTER , 입력 값이 있는경우에만 find and focus된다.
                    if (e.keyCode == 13 && _this.getValue()) {
                        this.findStatValue();
                    }
                }
            }
        });

        this.statField.add( this.searchNameCombo );

        this.statTabGrid   = this.addEventTypeGrid(this.statField, this.type.stat);

        this.addStatData();

        // selected 영역
        this.selectedBG = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 150,
            layout: 'vbox',
            style : {
                'border'  : '1px solid #C6C6C6',
                 borderTop: 'none'
            }
        });

        this.add(this.selectedBG);

        this.addSelectedListArea();

        if(this.useDefaultStat) {
            this.setDefaultStat();
        }
    },

    setDefaultStat: function() {
        var ix,
            ixLen,
            statData = this.statTabGrid.getStore().data.items;

        for(ix = 0, ixLen=statData.length; ix<ixLen; ix++) {
            if(statData[ix].data.defaultStat) {
                this.statTabGrid.getSelectionModel().select(ix, true);
            }
        }

    },

    addSelectedListArea: function() {
        var titleArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 25,
            layout: {
                type :'hbox',
                align: 'middle'
            }
        });


        var title = Ext.create('Ext.form.Label',{
            width : 115,
            text  : common.Util.TR('Selected Stat'),
            height: 25,
            style : {
                color      : '#00baff',
                'font-size': '14px',
                lineHeight : '25px',
                textIndent : '15px'
            }
        });

        var clearButton = Ext.create('Exem.Button',{
            styleType: 1,
            text     : common.Util.TR('Clear'),
            margin   : '0 10 0 0',
            height   : 20,
            width    : 50,
            listeners: {
                scope: this,
                click: function() {
                    // stat 쪽  선택된 record 선택 해제.
                    this.statTabGrid.getSelectionModel().deselectAll(true);

                    // 체크박스 목록 삭제.
                    var itemsList = this.checkBoxField.items.items;
                    for (var ix = 0; ix < itemsList.length; ix++) {
                        itemsList[ix].setValue(false);
                    }

                    // 선택된 리스트 삭제.
                    this.selectListGrid.clearRows();
                }
            }
        });

        titleArea.add(title,{xtype: 'tbspacer', flex: 1}, clearButton);

        this.selectedBG.add(titleArea);


        this.selectListGrid   = Ext.create('Exem.BaseGrid',{
            flex: 1,
            usePager      : false,
            adjustGrid    : true,
            hideGridHeader: true,
            stripeRows    : false,
            cellclick: function(thisGrid, td, cellIndex, record) {
                var row    = null;
                var grid   = null;
                var ix     = 0;
                var itemList = null;

                // 상단 체크박스 인경우
                if(record.data.location == 'check') {
                     itemList = this.checkBoxField.items.items;
                   for (ix = 0; ix < itemList.length; ix++) {
                       if( itemList[ix].boxLabel ==  record.data.display) {
                           itemList[ix].setValue(false);
                           break;
                       }
                   }
                } else {
                    // 그리드에 있는 경우
                    grid = null;
                    if(+record.data.type == this.type.stat){
                        grid = this.statTabGrid;
                    }

                    row   = grid.getStore().findRecord('display', record.data.display);
                    grid.getSelectionModel().deselect(row);
                }
            }.bind(this)
        });

        this.selectedBG.add(this.selectListGrid);

        this.selectListGrid.beginAddColumns();
        // 컬럼 title 은 보이지 않음.
        this.selectListGrid.addColumn( 'DisplayName', 'display' , 100, Grid.String, true , false );   // 이름 + unit
        this.selectListGrid.addColumn( 'RealName'   , 'realname', 100, Grid.String, false , true );   // db에 저장된 이름
        this.selectListGrid.addColumn( 'type'       , 'type'    , 100, Grid.String, false , true );   // 선택된 상태
        this.selectListGrid.addColumn( 'location'   , 'location', 100, Grid.String, false , true );   // 선택 해제시 필요
        this.selectListGrid.addColumn( 'del'        , 'del'     , 10,  Grid.String, false , true );
        this.selectListGrid.endAddColumns();

        this.selectListGrid.addRenderer('del', function(value, meta){
            meta.css = 'report-delete-item';
        });
    },

    addEventTypeGrid: function(target, type) {
        var statModel = Ext.create('Ext.data.Model', {
            fields: [
                {name: 'display', type: 'String'},
                {name: 'name', type: 'String'},
                {name: 'type', type: 'String'}
            ]
        });

        var store = Ext.create('Ext.data.Store', {
            model: statModel,
            data   : []
        });

        var checkBoxModel = Ext.create('Ext.selection.CheckboxModel',{
            showHeaderCheckbox: true,
            mode              : Grid.checkMode.SIMPLE,
            toggleOnClick     : true,
            allowDeselect     : true
        });


        var grid   = Ext.create('Ext.grid.Panel',{
            width   : '100%',
            flex    : 1,
            margin  : '5 0 0 0',
            _type   : type,
            hideHeaders : false,
            simpleSelect: false,
            forceFit    : true,
            border      : false,
            autoScroll  : true,
            selModel    : checkBoxModel,
            cls : 'ReportStatChange-statGrid',
            viewConfig: {
                stripeRows : false,
                listeners:{
                    itemkeydown:function(view, record, item, index, e){
                        // 눌러진 key로 focus가게 는 부분. s를 누르면 s로 시작하는 부분에 focus
                        var pressedKey = String.fromCharCode(e.getCharCode());
                        var gridData =  this.getStore().data.items;
                        for (var ix = 0; ix < gridData.length; ix++) {
                            if (gridData[ix].data['name'].toLowerCase() == pressedKey.toLowerCase()) {
                                this.getSelectionModel().select(this.getStore().data.items[ix], true);
                                break;
                            }
                        }
                    }
                }
            },
            columns: [
                { text: common.Util.TR('Stat Name')   , dataIndex: 'display'   , flex:1 },
                { text: 'Name'      , dataIndex: 'name'      , hidden : true },
                { text: 'Type'      , dataIndex: 'type'      , hidden : true }
            ],
            store :store,
            listeners: {
                scope: this,
                beforeselect: function() {

                },
                select: function (thisGrid, record) {
                    // 선택된 row를 하단 그리드에 추가한다.
                    this.addSelectedList(record.data.display, record.data.name, record.data.type, 'tab');
                },
                deselect: function(thisGrid, record) {
                    // 해제되면 리스트에서 제거.
                    this.deleteSelectedList(record.data.display);
                }
            }
        });

        target.add(grid);
        return grid;
    },

    checkFavoriteStat: function(statName){
        var ix, ixLen, favoriteStatName;
        for(ix = 0, ixLen = this.favDisplayList.length; ix < ixLen; ix++){
            favoriteStatName = this.favDisplayList[ix].dname;
            if(favoriteStatName == statName){
                return true;
            }
        }

        return false;
    },

    // stat chage 영역 data
    addStatData : function() {
        var ix, ixLen;
        var data, tempText;
        for (ix = 0, ixLen = this.statList.length; ix < ixLen; ix++) {
            data = this.statList[ix];
            tempText = data.statType != 'total' ? data.text + ' (' + common.Util.CTR('AVG') + ')' + '(' + common.Util.CTR('MAX') + ')' : data.text;
            this.dataList.stat.push( {'display': tempText, 'name': data.name, 'type': this.type.stat, 'defaultStat' : data.defaultStat});
            this.searchNameComboData[0].push({name: data.text, value: data.name });
        }
        this.statTabGrid.getStore().loadData(this.dataList.stat);
        this.searchNameCombo.setData(this.searchNameComboData[this.type.stat]);
        this.searchNameCombo.setSearchField('name');
    },

    findStatValue: function() {
        var searchString = this.searchNameCombo.getRawValue();
        var targetGrid   = this.statTabGrid;
        var row   = targetGrid.getStore().findRecord('display', searchString );

        targetGrid.getSelectionModel().select(row, true);  // 뒤의 인자가 true 이면 다른 선택된 record 가 해제되지 않는다.
    },

    // 선택된 record 추가.
    addSelectedList: function(display, name, type, loc) {
        var find = this.selectListGrid.pnlExGrid.getStore().findRecord('display', display);
        if(find){
            return;
        }

        this.selectListGrid.addRow([display, name, type, loc, '']);
        this.selectListGrid.drawGrid();
    },

    // 해당 record 를 삭제하고, 해당 선택된 컴포넌트를 해제 시켜준다.
    deleteSelectedList: function(display) {
        var find = this.selectListGrid.pnlExGrid.getStore().findRecord('display', display);
        //  find가 없는 경우에는 15개가 모두 선택된경우  체크 선택시 deselect 하는부분이있어서
        if (find) {
            var index = this.selectListGrid.pnlExGrid.getStore().indexOf(find);
            this.selectListGrid.deleteRow(index);
            this.selectListGrid.drawGrid();
        }
    },


    getSelectedList: function() {
        var selectedStatList = [];

        var items = this.selectListGrid._localStore.rootItems;
        if (items.length != 0) {
            for (var ix=0; ix < items.length; ix++) {
                if(+items[ix].type == 0){
                    selectedStatList.push(items[ix].realname);
                }
            }
        }
        return selectedStatList;
    },

    getSelectedDisplayList: function(){
        var displayList = {};

        var items = this.selectListGrid._localStore.rootItems;
        if (items.length != 0) {
            for (var ix=0; ix < items.length; ix++) {
                displayList[items[ix].realname] = items[ix].display;
            }
        }

        return displayList;
    },

    getSelectedUnitList: function(){
        var unitList = {};

        var items = this.selectListGrid._localStore.rootItems;
        if (items.length != 0) {
            for (var ix=0; ix < items.length; ix++) {
                unitList[items[ix].realname] = items[ix].unit;
            }
        }

        return unitList;
    },
    setGridSelect: function( statInfo ){
        var grid = this.statTabGrid,
            row, rowIndex;

        rowIndex = grid.getStore().findExact( 'name', statInfo.name);

        row = grid.getStore().findRecord( 'name', statInfo.name, rowIndex);
        grid.getSelectionModel().select(row, true);

        grid = null;
        statInfo = null;
        row = null;
    }
});