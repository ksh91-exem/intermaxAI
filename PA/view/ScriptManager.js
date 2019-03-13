/**
 * Created with IntelliJ IDEA.
 * User: JONGHO
 * Date: 14. 2. 4
 * Time: 오후 4:32
 * To change this template use File | Settings | File Templates.
 */
Ext.define("view.ScriptManager", {
    extend : "Exem.Form",
    title    : common.Util.TR('Script Manager') + '[' + Comm.selectedServiceInfo.name + ']',
    layout   : 'border',
    minWidth : 900,
    minHeight: 500,
    plain    : true,        // Script window를 inner형태로 포함하게하는 옵션

    //==== CHART 관련 property
    _intervalTime         : 3000,                                // 체크 박스 선택에 따른 인터벌 값
    _drawForChartArray    : [],                                  // CHART에 그려질 DATA Array
    _maxDataLength        : (60 / 3) * 2,                        // 10분 DATA  초기값은 3초
    _nowExecuteSql        : null,                                // 인터벌 실횅시 실행할 SQL TEXT, exe SQL 버튼 누르면 할당됨.
    _bottomChartLegendList: [],                                  // chart에 들어가는 legendList
    isDrawReady           : false,                               //exe SQL이 처음일 경우 -> 한번만 gridColumn, 차트 시리즈를 그리는거 체크

    viewName              : 'pa_scriptManager_tree_gridName',

    selectendType: {  SQL: 'sql',  CHART: 'chart' },
    listeners: {
        beforedestroy: function() {
            var self = this;
            if (self.task) {
                // inverval이 돌고 있으면 정지.
                self.stopInterval();
            }
        }
    },

    init: function(){
        var self = this;
        self.saveItemName          = 'ScriptManager';           // 로컬 스토리지에 저장될 이름.
        self.selectedRadioBtnValue =  self.selectendType.SQL;   // 라디오 버튼 체크된 value값, 초기값은 sql임.

        // MAIN WINDOW  생성
        self.scriptWindow          = self.initScriptWindow();   // script 작은 WINDOW 생성

        self.initLeftTree(self);                     // MAIN WINDOW 좌측 영역
        self.initRightFrame(self);                   // MAIN WINDOW 우측 영역

        self.treeRoot = self.leftTree.getRootNode();            // 생성된 Tree의 RootNode

        self.loadDataFromLocal();                               // 로컬 스토리지에 저장된 data 로드해오기.
        self.show();
        self.createChart();                                     // mainWindow가 show 인상태에서 CHART 생성해준다.
    },

    // CREATE, EDIT, 클릭시 생성되는 작은 WINDOW
    initScriptWindow: function() {
        var self = this;

        var scriptWindow = Ext.create('Exem.XMWindow',{
            title     : common.Util.TR('Script'),
            cls       : 'xm-scriptmanager',
            layout    : 'vbox',
            resizable : true,
            width     : 550,
            height    : 450,
            modal     : true,
            draggable : false,
            //constrain : true,          // 이옵션은 main Window안에 서만 생성되게.
            //constrainHeader: true,      // main Window에서 생성되고 header만 벗어나지 못하게
            listeners: {
                hide: function() {
                    self.scriptWindowClearAll();
                },
                close: function() {
                    self.leftTree.editMode = false;
                }
            }
        });

        var topComponentArea = Ext.create('Ext.panel.Panel',{
            width  : '100%',
            height : 100,
            padding: '5 5 3 5',
            layout : 'vbox',
            items  : [{
                xtype  : 'label',
                height : 30,
                width  : '100%',
                margin : '0 10 0 10',
                text   : common.Util.TR('Script'),
                style  : {
                    'lineHeight'   : '30px',
                    'border-bottom':'1px solid #AAAAAA'
                }
            }]
        });

        self.radioButtonGroup = Ext.create('Ext.form.FieldContainer',{
            fieldLabel : common.Util.TR('Type'),
            labelWidth : 40,
            padding    : '0 0 0 10',
            defaultType: 'radiofield',
            layout     : 'hbox',
            items: [
                {
                    boxLabel : common.Util.TR('SQL'),
                    name     : 'radioGroup',
                    itemId   : 'sqlRadioButton',
                    checked  : true,

                    listeners: {
                        change: function(){
                            if(this.checked){
                                self.selectedRadioBtnValue =  self.selectendType.SQL;
                            }
                        }
                    }
                }, {
                    boxLabel : common.Util.TR('Trend Chart'),
                    margin   : '0 0 0 20',
                    name     : 'radioGroup',

                    listeners: {
                        change: function(){
                            if(this.checked){
                                self.selectedRadioBtnValue =  self.selectendType.CHART;
                            }
                        }
                    }
                }
            ]
        });

        self.nameFieldArea = Ext.create('Ext.form.field.Text',{
            name      : 'name',
            fieldLabel: common.Util.TR('Name'),
            width     : '100%',
            labelWidth: 40,
            padding   : '0 10 0 10',
            allowBlank: false,
            listeners: {
                render: function() {
                    this.getEl().on('contextmenu',function(e) {
                        e.preventDefault();
                    });
                }
            }

        });
        topComponentArea.add(self.radioButtonGroup);
        topComponentArea.add(self.nameFieldArea);


        var middleScriptArea = Ext.create('Ext.panel.Panel',{
            width  : '100%',
            flex   : 1,
            padding: '0 5 0 5',
            layout : 'vbox',
            items  : [{
                xtype : 'label',
                height: 25,
                width : '100%',
                margin: '0 10 0 10',
                text  : common.Util.TR('Script SQL'),
                style : {
                    'lineHeight'   : '25px'
                }
            }]

        });

        self.sqlTextArea = Ext.create('Exem.SyntaxEditor',{
            width : '100%',
            height: '100%',
            margin: '0 0 -2 0',
            readOnly: false,
            autoScroll: true
        });

        middleScriptArea.add(self.sqlTextArea);

        self.createSQLTextAreaContextMenu(self.sqlTextArea);

        var bottomBtnArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 25,
            layout: {
                type :'hbox',
                pack :'center',
                align: 'middle'
            },
            items  : [{
                xtype: 'button',
                width: 60,
                text : common.Util.TR('Ok'),

                listeners: {
                    click: function() {
                        var radioType    =  self.selectedRadioBtnValue;
                        var getText      =  self.nameFieldArea.getValue();
                        var sqlfildValue =  self.sqlTextArea.getText();
                        //text 길이 3자 이상
                        if (getText.trim().length >= 3) {
                            // sql text field 10자 이상
                            if (sqlfildValue.trim().length >= 10) {
                                // 에티드 버튼 눌렀을경우
                                if (self.leftTree.editMode) {
                                    self.updateTree();
                                    self.scriptWindow.destroy();
                                    return;
                                }

                                // 이름이 존재하는지 체크 -> 존재하면 else 문으로 / 존재하지 않으면 add
                                if (self.nameExistCheck(getText) !== true) {
                                    self.addTreeItem(radioType, getText, sqlfildValue);
                                    self.scriptWindow.destroy();
                                } else {
                                    self.showMessage(common.Util.TR('ERROR'), common.Util.TR('the name is already in use.') , Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                                        self.nameFieldArea.focus();
                                    });
                                }
                            } else {
                                self.showMessage(common.Util.TR('ERROR'),  common.Util.TR('At least ten character must be entered.'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                                    Ext.Function.defer(function(){
                                        self.sqlTextArea.edit.focus();
                                    }, 100);
                                });
                            }
                        } else {
                            self.showMessage(
                                common.Util.TR('ERROR'),
                                common.Util.TR('At least three character must be entered.'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                                    self.nameFieldArea.focus();
                            });
                        }

                    }
                }
            },{
                xtype: 'tbspacer',
                width: 3
            },{
                xtype: 'button',
                cls  : 'xm-cancel-button',
                text : common.Util.TR('Cancel'),

                listeners: {
                    click: function() {
                        self.leftTree.editMode = false;
                        self.scriptWindow.destroy();
                    }
                }
            }]
        });

        scriptWindow.add(topComponentArea, middleScriptArea, bottomBtnArea);

        return scriptWindow;
    },

    initLeftTree: function(_mainWindow) {
        var self= this;
        var treeMenuStore = Ext.create('Ext.data.TreeStore',{
            root: {
                text    : common.Util.TR('User Script'),
                expanded: true,
                children: []
            }
        });

        var tools = Ext.create('Ext.toolbar.Toolbar',{
            width : '100%',
            height : 27,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, {
                html: '<img src="../images/Delete_all.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Delete_All'); }
            }]
        });


        /////////////////////////////////
        // 가장 좌측 BG
        self.leftBgPanel = Ext.create('Ext.panel.Panel',{
            width   : '30%',
            height  : '100%',
            region  : 'west',
            split   :  true,
            layout  : 'vbox'
        });

        // 좌측 treepanel
        self.leftTree = Ext.create('Ext.tree.Panel',{
            width   : '100%',
            height  : '100%',
            flex    : 1,
            store   : treeMenuStore,
            rootVisible: true,
            editMode: false,
            listeners: {
                itemclick: function(view, record) {
                    self.topSqlTextArea.setText(record.data._sql);
                    self.topSqlTextArea.sqlInfo = record.data._type;
                },
                itemdblclick: function() {
                    // EXE SQL 버튼 누른거와 같은 효과.
                    self.executeSqlButton.fireEvent('click');
                },
                render: function() {
                    self.createTreeMenuContextMenu(this);
                    // 트리 노드 이외의 공백영영의 우클릭 막기.
                    var el = this.getEl();
                    if (el) {
                        el.on('contextmenu', function(e) {
                            e.stopEvent();
                        });
                    }
                },
                itemcontextmenu: function(tree, record, item, index, e) {
                    e.stopEvent();
                    if (index !== undefined && record.internalId !== 'root') {
                        this.treeContextMenu.showAt(e.getXY());
                    }
                }
            }
        });
        self.leftBgPanel.add(tools);
        self.leftBgPanel.add(self.leftTree);
        _mainWindow.add( self.leftBgPanel);
    },

    onButtonClick: function(type) {
        switch(type) {
            case 'Add':
                this.scriptWindow = this.initScriptWindow();
                this.scriptWindow.show();
                break;
            case 'Edit':
                if(!this.treeRoot.data.expanded) {
                    return;
                }
                // 윈도우 보여주고 선택된 정보 settine 해주어야 함.
                var record = this.leftTree.getSelectionModel().getSelection()[0];
                if(record && record.internalId !== 'root'){
                    this.scriptWindow = this.initScriptWindow();
                    this.editReloadData();
                    this.scriptWindow.show();
                }
                break;
            case 'Delete':
                if (!this.treeRoot.data.expanded) {
                    return;
                }
                this.deleteTreeItem();
                break;
            case 'Delete_All':
                if (!this.treeRoot.data.expanded) {
                    return;
                }
                this.deleteAllTreeItem();
                break;
            default :
                break;
        }
    },

    initRightFrame: function(_mainWindow) {
        var self = this;
        self.rightFrammeTbarArea = Ext.create('Ext.container.Container',{
            height:  22,
            width : '100%',
            layout: 'hbox'
        });

        var showSqlButton = Ext.create('Ext.button.Button',{
            margin      : '0 2 0 2',
            text        : common.Util.TR('SQL'),
            tooltip     : common.Util.TR('Show SQL'),
            clickFlag   : false,
            enableToggle: true,

            listeners: {
                click: function(){
                    if (!this.clickFlag) {
                        this.clickFlag = true;
                        self.topPanel.setVisible(true);
                    } else if (this.clickFlag) {
                        this.clickFlag = false;
                        self.topPanel.setVisible(false);
                    }
                }
            }
        });

        self.executeSqlButton = Ext.create('Ext.button.Button',{
            margin : '0 2 0 2',
            text   : common.Util.TR('Run SQL'),
            tooltip: common.Util.TR('Run SQL'),

            listeners: {
                click: function() {
                    //.선택된 Tree노드를 가져온다.- raw값이 없으면 return
                    var record = self.leftTree.getSelectionModel().getSelection()[0];

                    // tree노드 data가 없을때
                    if (!record || !record.data) {
                        return;
                    }

                    // 그리기전 모두 삭제
                    self.allClear(record.data._type);
                    // 선택된 노드가 CHART type이면
                    if (record.data._type === self.selectendType.CHART) {
                        self.refreshCheckbox.setValue(false);
                        self.middlePanel.setVisible(true);
                        self.splliter.setVisible(true);
                        self.setChartTitle();
                        self.invervalSpinner.setVisible(true);
                        self.refreshCheckbox.setVisible(true);
                    } else if (record.data._type === self.selectendType.SQL) {
                        // 차트 쿼리 조회후 인터벌이 돌고 있을수 있으므로 stop 시켜준다.
                        self.stopInterval();
                        self.middlePanel.setVisible(false);
                        self.splliter.setVisible(false);
                        self.invervalSpinner.setVisible(false);
                        self.refreshCheckbox.setVisible(false);
                        self.refreshCheckbox.setValue(false);
                    }

                    self.topSqlTextArea.sqlInfo = record.data._type;

                    var getSqlText = record.data._sql;
                    if (getSqlText) {
                        // 실행할 SQL , 나중에 Interval시 현재 실행할 sql Text가 필요하다.
                        self._nowExecuteSql = getSqlText;
                        self.exeSQL(getSqlText);
                        self.isDrawReady = false;
                    }
                }
            }
        });

        // 버튼과 스피너 사이 공백
        var spacer = Ext.create('Ext.toolbar.Spacer',{
            flex: 1
        });

        //
        self.invervalSpinner = Ext.create('Ext.form.field.Number',{
            fieldLabel: common.Util.TR('Interval (Sec)'),
            width     : 130,
            labelWidth: 80,
            height    : 20,
            hidden    : true,
            disabled  : false,
            value     : 3,
            minValue  : 3,
            maxValue  : 60,
            maxLength : 2,      // 입력 숫자는 2자리까지만.
            step      : 3,
            enforceMaxLength: true,
            enableKeyEvents : true,
            allowDecimals   : false,
            allowExponential: false,
            listeners: {
                blur: function(numfield) {
                    var nowFieldValue = numfield.getValue();
                    if (nowFieldValue > 60) {
                        numfield.setValue(3);
                    }
                    if (nowFieldValue < 3) {
                        numfield.setValue(3);
                    }
                },
                keydown: function( numfield, e ){
                    if (!Ext.isNumeric(numfield.value)) {
                        e.stopEvent();
                        return;
                    }
                    // e.button 값이     189 == '.' 188은 '-'  68은 e
                    if(e.button === 189 || e.button === 188 || e.button === 68 ){
                        e.stopEvent();
                    }
                }

            }
        });

        self.refreshCheckbox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel: common.Util.TR('Auto Refresh'),
            checked : false,
            hidden  : true,
            margin  : '0 0 0 10',
            listeners: {
                change: function() {
                    if (this.checked) {
                        self._intervalTime = self.invervalSpinner.getValue() * 1000;
                        self.invervalSpinner.setDisabled(true);
                        self.startInterval(self._intervalTime);
                    } else {
                        self.invervalSpinner.setDisabled(false);
                        self.stopInterval();
                    }
                }
            }
        });

        self.rightFrammeTbarArea.add(showSqlButton);
        self.rightFrammeTbarArea.add(self.executeSqlButton);
        self.rightFrammeTbarArea.add(spacer);
        self.rightFrammeTbarArea.add(self.invervalSpinner);
        self.rightFrammeTbarArea.add(self.refreshCheckbox);

        self.rightFrame = Ext.create('Ext.panel.Panel',{
            width  : '70%',
            region : 'center',
            split  : true,
            layout : 'border',
            tbar   : [self.rightFrammeTbarArea],
            minWidth: 300
        });

        self.topPanel = Ext.create('Ext.panel.Panel',{
            width : '100%',
            region: 'north',
            hidden: true,
            height: 100,
            split : true,
            layout: 'fit'
        });

        self.topSqlTextArea = Ext.create('Exem.SyntaxEditor',{
            width   : '100%',
            readOnly: true,
            sqlInfo : null     // sql 용인지 chart용인지 type 이저장될 예정.
        });


        // 우클릭 막기
        self.topSqlTextArea.addEventListeners('contextmenu', function(e) {
            e.preventDefault();
        }, self.topSqlTextArea);
        self.topPanel.add(self.topSqlTextArea);

        self.middleAndBottomFrame =  Ext.create('Ext.container.Container',{
            layout: 'vbox',
            region: 'center',
            flex  :  1,
            height: '100%',
            minHeight: 200
        });

        self.middlePanel = Ext.create('Ext.container.Container',{
            width : '100%',
            flex  : 1,
            height: '50%',
            layout: 'fit',
            hidden: true,
            minHeight: 80,

            listeners: {
                render: function() {
                    // 우클릭 막기
                    this.getEl().on("contextmenu", Ext.emptyFn, null, {preventDefault: true});
                }
            }
        });

        self.splliter = Ext.create('Ext.resizer.Splitter',{
            hidden: true
        });

        self.bottomPanel =  Ext.create('Ext.container.Container',{
            height: '50%',
            width : '100%',
            flex  : 1,
            layout: 'fit',
            minHeight: 80
        });

        self.rightFrame.add(self.topPanel);
        self.middleAndBottomFrame.add(self.middlePanel);
        self.middleAndBottomFrame.add(self.splliter);
        self.bottomPanel.add(self.addBottomGrid());
        self.middleAndBottomFrame.add(self.bottomPanel);
        self.rightFrame.add(self.middleAndBottomFrame);
        _mainWindow.add( self.rightFrame);
    },

    addBottomGrid: function() {
        var self = this;
        self.bottomGrid = Ext.create('Exem.BaseGrid',{
            minHeight: 72,
            gridType : Grid.exGrid
        });
        return self.bottomGrid;
    },

    // 주기적으로 쿼리 보내기 시작
    startInterval: function(time) {
        var self = this;
        var runner = new Ext.util.TaskRunner();
        self.task = runner.newTask({
            self: this,
            run: function() {
                self.exeSQL(self._nowExecuteSql);
            },
            interval: time
        });
        self.task.start();
    },

    // interval 정지
    stopInterval: function() {
        var self = this;
        if (self.task) {
            self.task.stop();
        }
    },

    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    createTreeMenuContextMenu: function(tree) {
        var self = this;
        tree.treeContextMenu  = Ext.create('Exem.ContextMenu');

        tree.treeContextMenu.addItem({
            title : common.Util.TR('Edit'),
            icon  : '',
            target: tree,
            fn: function() {
                self.onButtonClick('Edit');
            }
        });
        tree.treeContextMenu.addItem({
            title : common.Util.TR('Delete'),
            icon  : '',
            target: tree,
            fn: function() {
                self.onButtonClick('Delete');
            }
        });

    },

    // syntaxEditor에 우클릭 메뉴
    createSQLTextAreaContextMenu: function(syntaxEditor){
        var self = this;
        syntaxEditor.sqlContextMenu  = Ext.create('Exem.ContextMenu');

        syntaxEditor.sqlContextMenu.addItem({
            title : common.Util.TR('Format SQL'),
            icon  : '',
            target: self,

            fn: function() {
                WS.FormatSQL(syntaxEditor.getText(), self.setFormatSQL, self);
            }
        });

        syntaxEditor.addEventListeners('contextmenu', function(e) {
            e.preventDefault();
            if (this.getText().length > 0){
                this.sqlContextMenu.showAt([e.x, e.y]);
            }
        }, syntaxEditor);
    },

    // sql format 으로 set해주기
    setFormatSQL: function(aHeader,aData) {
        var self = this;
        self.sqlTextArea.setText(aData);
    },


    // 스크립트 window의 모든 field 를 지운다. radio는 sql에 select
    scriptWindowClearAll: function() {
        var self = this;
        self.radioButtonGroup.getComponent('sqlRadioButton').setValue(true);
        self.nameFieldArea.setValue('');
        self.sqlTextArea.setText('');
    },

    // 입력된 이름이 이미 존재하는지 체크
    nameExistCheck: function(text) {
        var self = this;
        var exist = false;
        for (var ix = 0; ix < self.treeRoot.childNodes.length; ix++) {
            if(self.treeRoot.childNodes[ix].data['text'] === text){
                exist = true;
                break;
            }
        }
        return exist;
    },

    // sql 실행
    exeSQL : function (SQLText) {
        var self = this;
        var sql_Text_dataset = {};
        sql_Text_dataset.sql = SQLText;
        var ondata;
        //SQL or Trend Chart 인지 -> onData가 다르다.
        self.topSqlTextArea.sqlInfo === 'sql' ? ondata = self.onDataForSQL : ondata = self.onDataForChart;

        WS.SQLExec(sql_Text_dataset, ondata, self);
        self.loadingMask.showMask();

        self.leftBgPanel.setDisabled(true);
        self.rightFrammeTbarArea.setDisabled(true);
    },

    allClear: function(type) {
        var self = this;
        self.bottomGrid.clearRows();
        self.bottomGrid.clearColumns();
        self.bottomGrid.drawGrid();
        if(type === 'chart') {
            self.middleFlowChart.labelLayer.removeAll();
            self.middleFlowChart.removeAllSeries();
        }
    },

    //data 받아오기
    onDataForSQL: function(aHeader, aData) {
        var self = this;

        if(!common.Util.checkSQLExecValid(aHeader, aData)){
            self.showMessage(common.Util.TR('SQL Chart'), aData.result_message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                self.allClear('sql');
            });

            self.loadingMask.hide();
            self.setDisabled(false);
            self.leftBgPanel.setDisabled(false);
            self.rightFrammeTbarArea.setDisabled(false);

            return;
        }

        self.bottomGrid.clearColumns();
        if (aData.length > 1) {
            self.bottomGrid.onData(aHeader, aData[0]);
        } else {
            self.bottomGrid.onData(aHeader, aData);
        }

        self.loadingMask.hide();
        self.leftBgPanel.setDisabled(false);
        self.rightFrammeTbarArea.setDisabled(false);
    },

    onDataForChart: function(aHeader, aData) {
        var self = this;
        var ix, ixLen;
        var isValidData;
        var dataRows = aData.rows;

        if(!common.Util.checkSQLExecValid(aHeader, aData)){
            self.showMessage(common.Util.TR('Trend Chart Result'), aData.result_message,Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                self.allClear('chart');
            });
            isValidData = false;

        } else if (aData.rows.length === 0) {
            Ext.Msg.alert('result', common.Util.TR('There are no results to display.'));
            isValidData = false;

        } else {
            isValidData = true;
        }

        if (!isValidData) {
            self.loadingMask.hide();
            self.setDisabled(false);
            self.leftBgPanel.setDisabled(false);
            self.rightFrammeTbarArea.setDisabled(false);
            return;
        }

        if (!self.isDrawReady) {
            // exe SQL을 누르면 isDrawReady가 false가 된다. 그리드와 차트에 컬럼, 시리즈를 추가해준다.
            self.makeGridAndColumns(aData);
            self.middleFlowChart.labelLayer.removeAll();
            self.middleFlowChart.removeAllSeries();

            self._bottomChartLegendList.length = 0;
            var seriesCount = self.chartAddSeries(aData);
            self.makeDefaultChartData(aData, seriesCount);
            self.isDrawReady = true;
        }

        // 그리드 data의 갯수가 100개 일경우 shift 해주고 push해준다 100개 유지
        if (self.bottomGrid._localStore.rootItems.length >= 100) {
            self.bottomGrid._localStore.rootItems.shift();
        }

        // 그리드 data push & 그리는 부분
        for (ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
            self.bottomGrid.addRow(dataRows[ix]);
        }
        self.bottomGrid.drawGrid();

        // 차트 그리는부분
        var time = Math.floor( Number(new Date(dataRows[0][0])) * 1000 ) / 1000 ;

        for(ix = 0, ixLen = self._bottomChartLegendList.length; ix < ixLen; ix++){
            self.middleFlowChart.addValue(ix,[time,dataRows[0][ix+1]]);
        }

        self.middleFlowChart.plotDraw();

        self.loadingMask.hide();
        self.leftBgPanel.setDisabled(false);
        self.rightFrammeTbarArea.setDisabled(false);
    },

    // 차트 생성
    createChart: function() {
        var self = this;
        self.middleFlowChart = Ext.create('Exem.chart.CanvasChartLayer',{
            title        : '',
            showTitle    : true,
            titleHeight  : 20,
            titleFontSize: '6px',
            titleBackgroundColor:'#E3EAF1',
            showLegend   : true,
            showTooltip  : true,
            dataBufferSize: 20,
            showHistoryInfo: false,
            chartProperty: {
                timeformat: '%M:%S'
            }
        });
        self.middlePanel.add(self.middleFlowChart);
    },

    setChartTitle: function() {
        var self = this;
        var record = self.leftTree.getSelectionModel().getSelection()[0];
        self.middleFlowChart.setTitle(record.data.text);
        self.middleFlowChart.doLayout();
    },

    // 차트 초기에 data 0으로 채워주기
    makeDefaultChartData: function(aData) {
        var self = this;
        var datasFirstTime = aData.rows[0][0];
        var nowTime = Math.floor( Number( new Date(datasFirstTime) )/1000 )*1000  ;

        self._drawForChartArray = [];

        for(var ix = 0; ix < self._bottomChartLegendList.length; ix++){
            self.middleFlowChart.initData(nowTime, self._intervalTime, 0, ix);
        }
        self.middleFlowChart.plotDraw() ;
    },

    chartAddSeries: function(adata) {
        var self = this;
        var seriesCount = null;
        for (var ix = 0; ix < adata.columns.length; ix++) {
            if (adata.datatype[ix] !== 'datetime'){
                self.middleFlowChart.addSeries({
                    id   : adata.columns[ix],
                    label: adata.columns[ix],
                    type : PlotChart.type.exLine
                });
                self._bottomChartLegendList.push(adata.columns[ix]);
                seriesCount = ix;
            }
        }
        return seriesCount;
    },

    // exe SQL을 눌렀을 경우에 처음 그리드 컬럼을 만들어준다.
    makeGridAndColumns: function(adata) {
        var self = this;
        // 그리드 재생성
        self.bottomGrid.destroy();
        self.bottomPanel.add(self.addBottomGrid());


        var columns      = adata.columns;
        var columnTypes  = adata.datatype;
        var columnList   = [];
        var makeColumnTitle;
        var columnType;
        var sortColumn = null;
        self.bottomGrid.beginAddColumns();
        for (var ix = 0; ix < columns.length; ix++) {
            // 컬럼이 시간인경우
            if (columns[ix] === 'time') {
                sortColumn = columns[ix];
            }

            makeColumnTitle = common.Util.initCap( columns[ix].replace(/_/gi, ' ') );

            switch (columnTypes[ix]) {
                case 'datetime' :
                    columnType = Grid.DateTime;
                    break;
                case 'memo'   :
                case 'widememo':
                case 'string' :
                    columnType = Grid.String;
                    break;
                case 'float'  :
                    columnType = Grid.Float;
                    break;
                case 'integer':
                case 'int64'  :
                    columnType = Grid.Number;
                    break;
                default :
                    columnType = Grid.String;
                break;
            }
            columnList.push([makeColumnTitle, columns[ix], 200, columnType, true, false ]);
        }

        self.bottomGrid.addColumns(columnList);
        self.bottomGrid.endAddColumns();

        // 컬럼이 시간인경우 sort DESC 최근시간이 위로 가도록
        if(sortColumn){
            self.bottomGrid.setOrderAct(sortColumn , 'DESC');
        }

        self.bottomGrid.drawGrid();
    },

    // 트리 아이템 추가
    addTreeItem: function(selectedType, nameFieldText, sqlfildText) {
        var self = this;
        var newNode =  {
            id   : nameFieldText,
            text : nameFieldText,
            leaf : true,
            _type: selectedType,
            _sql : sqlfildText
        };
        self.treeRoot.appendChild(newNode);
        self.saveTree();
    },

    // 트리 아이템 제거
    deleteTreeItem: function() {
        var self = this;
        var record = self.leftTree.getSelectionModel().getSelection()[0];
        if (!record || !record.parentNode) {
            return;
        }

        if (record) {
            Ext.Msg.show({
                title  : common.Util.TR('Confirmation'),
                msg    : common.Util.TR('Are you sure you want to delete?'),
                buttons: Ext.Msg.OKCANCEL,
                icon   : Ext.MessageBox.INFO,
                fn: function(buttonId) {
                    if (buttonId === "ok") {
                        if (record) {
                            //아이템을 지우고 처음 데이터를 SQL AREA에 set해준다.
                            //record.remove(true)
                            record.drop();
                            self.leftTree.getView().refresh();
                            self.setFirstData();
                            self.saveTree();
                        } else {
                            return;
                        }
                    }
                }
            });

        } else {
            return;
        }
    },

    deleteAllTreeItem: function() {
        var self = this;
        Ext.Msg.show({
            title  : common.Util.TR('Confirmation'),
            msg    : common.Util.TR('Are you sure you want to delete all?'),
            buttons: Ext.Msg.OKCANCEL,
            icon   : Ext.MessageBox.INFO,
            fn: function(buttonId) {
                if (buttonId === "ok") {
                    self.leftTree.getRootNode().removeAll();
                    self.saveTree();
                }
            }
        });
    },

    // 로컬 스토리지에서 저장된 데이터 불러오기
    loadDataFromLocal: function () {
        var self= this;
        var getSavedData;
        if (Comm.web_env_info[['GridColumns']][this.viewName]) {
            getSavedData = Comm.web_env_info[['GridColumns']][this.viewName];
            for(var ix = 0; ix < getSavedData.length; ix++) {
                self.treeRoot.appendChild({
                    id   : getSavedData[ix]['id'],
                    text : getSavedData[ix]['text'],
                    leaf : getSavedData[ix]['leaf'],
                    _type: getSavedData[ix]['_type'],
                    _sql : getSavedData[ix]['_sql']
                });
            }
        }

        //읽어 온뒤에 itemappend 리스너를 달아서 tree에 item이 추가될때는 추가된 노드 선택. sqltext setting 해준다.
        self.leftTree.addListener('itemappend', function (tree, node) {
            this.getSelectionModel().select([node]);
            self.topSqlTextArea.setText(node.data._sql);
            self.topSqlTextArea.sqlInfo = node.data._type;
        });
    },

    // 첫번째 data값 setting 해주기
    setFirstData: function() {
        var self = this;
        if (!self.treeRoot.childNodes[0]) {
            self.topSqlTextArea.setText('');
            return;
        }
        var firstdataSql = self.treeRoot.childNodes[0].data._sql;
        self.leftTree.getSelectionModel().select(self.treeRoot.childNodes[0]);
        self.topSqlTextArea.sqlInfo = self.treeRoot.childNodes[0].data._type;
        self.topSqlTextArea.setText(firstdataSql);
    },

    // edit button 클릭시 data Window에 data 읽어오기
    editReloadData: function() {
        var self = this;
        var record = self.leftTree.getSelectionModel().getSelection()[0];
        self.leftTree.editMode = true;
        if (record.data._type === self.selectendType.SQL) {
            self.radioButtonGroup.items.items[0].setValue(true);
        } else {
            self.radioButtonGroup.items.items[1].setValue(true);
        }
        self.nameFieldArea.setValue(record.data.text);
        self.sqlTextArea.setText(record.data._sql);

    },

    saveTree: function() {
        var self = this;
        var tempData = [];
        var data     = self.treeRoot;

        for (var ix = 0; ix < data.childNodes.length; ix++) {
            tempData.push({
                id   :  data.childNodes[ix].data['id']   ,
                text :  data.childNodes[ix].data['text'] ,
                leaf :  data.childNodes[ix].data['leaf'] ,
                _type:  data.childNodes[ix].data['_type'],
                _sql :  data.childNodes[ix].data['_sql']
            });
        }

        common.WebEnv.Save('pa_scriptManager_tree_gridName', JSON.stringify(tempData));
        Comm.web_env_info[['GridColumns']]['pa_scriptManager_tree_gridName'] = tempData;
    },

    // treeUpdate
    updateTree: function() {
        var self = this;
        var record  = self.leftTree.getSelectionModel().getSelection()[0];
        var getNode = self.leftTree.getStore().getNodeById(record.data.id);

        var radioType    = self.selectedRadioBtnValue;
        var getText      = self.nameFieldArea.getValue();
        var sqlfildValue = self.sqlTextArea.getText();

        self.scriptWindowClearAll();

        getNode.set('_sql' , sqlfildValue );
        getNode.set('_type', radioType   );
        getNode.set('text' , getText );
        getNode.set('id'   , getText );
        getNode.set('leaf' , true );

        self.topSqlTextArea.setText(sqlfildValue);

        getNode.data['_sql'] = sqlfildValue;
        getNode.data['_type']= radioType;
        getNode.data['text'] = getText;
        getNode.data['id']   = getText;
        getNode.data['leaf'] = true;

        getNode.commit();     // 이거 해주어야 Tree update 된 노드에 빨간 삼각형 없어짐!!
        self.saveTree();

        self.leftTree.editMode = false;
    }

});