/**
 * Created with IntelliJ IDEA.
 * User: JONGHO
 * Date: 13. 12. 17
 * Time: 오후 2:44
 * To change this template use File | Settings | File Templates.
 */
Ext.define('Exem.SQLEditorBaseFrame',{
    extend: 'Exem.TabPanel',
    region: 'center',
    width : '100%',
    flex  : 1,
    mode  : 'sql',
    firstTabCaption: 'SQL',
    useFormatBtn  : false,
    useContextMenu: true,      // 우클릭 메뉴 사용 안하는 경우   2015-01-29 추가 JH
    mxgParams: null,
    listeners: {
        tabchange: function(tabPanel, newCard){
            if(newCard.title == tabPanel.firstTabCaption){
                tabPanel.sqlEditor.setText(tabPanel.editorData.sql);
            }
            else{
                if (Comm.config.login.permission.bind == 1) {
                    tabPanel.bindEditor.setText(tabPanel.editorData.bind);
                }
                else {
                    tabPanel.bindEditor.bindDisable();
                }
            }
        }
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
        var self = this;

        self._binValueList = '';

        self.editorData = {
            sql : '',
            bind: ''
        };

        self.sqlEditor = self._createSyntexEditor();
        self.bindEditor = self._createSyntexEditor();

        if(this.useContextMenu) {
            self._initConTextMenu();
            self._addEventListener(self.sqlContextMenu, self.sqlEditor);
            self._addEventListener(self.bindContextMenu, self.bindEditor);

        }

        self.sqlContainer  = self._createContainer(self.firstTabCaption, self.sqlEditor);
        self.bindContainer = self._createContainer(common.Util.TR('SQL with binded value'), self.bindEditor);

        self.add(self.sqlContainer);
        self.add(self.bindContainer);

        self.setActiveTab(self.sqlContainer);

        //  하단 영역에 버튼 추가해주기
        if (self.useFormatBtn === true) {

            var btnList =  [];

            var formatSQLBtn = {
                xtype : 'button',
                margin: '3 0 0 3',
                text  : common.Util.TR('Format SQL'),
                listeners: {
                    click: function() {
                        self.setFormatSQL();
                    }
                }
            };
            btnList.push(formatSQLBtn);

            var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

            if (isEnableMaxGaugeLink && this.mxgParams) {
                var sqlAnalysisBtn = {
                    xtype : 'button',
                    margin: '3 0 0 3',
                    text  : common.Util.TR('SQL Detail Analysis'),
                    listeners: {
                        scope: self,
                        click: function() {
                            if (Comm.RTComm.openMaxGaugeSQLList) {
                                var dbId     = this.mxgParams.dbId;
                                var sqlUid   = this.mxgParams.sqlUid;
                                var tid      = this.mxgParams.tid;
                                var fromTime = this.mxgParams.fromTime;
                                var toTime   = this.mxgParams.toTime;

                                Comm.RTComm.openMaxGaugeSQLList(dbId, fromTime, toTime, sqlUid, tid);
                            }
                        }
                    }
                }
                btnList.push(sqlAnalysisBtn);

                var sqlPlanBtn = {
                    xtype : 'button',
                    margin: '3 0 0 3',
                    text  : common.Util.TR('SQL Plan'),
                    listeners: {
                        scope: self,
                        click: function() {
                            if (Comm.RTComm.openMaxGaugeSQLPlan) {
                                var dbId     = this.mxgParams.dbId;
                                var sqlUid   = this.mxgParams.sqlUid;
                                var fromTime = this.mxgParams.fromTime;
                                var toTime   = this.mxgParams.toTime;

                                Comm.RTComm.openMaxGaugeSQLPlan(dbId, fromTime, toTime, sqlUid);
                            }
                        }
                    }
                }
                btnList.push(sqlPlanBtn);
            }

            self.addDocked({
                dock   : 'bottom',
                xtype  : 'panel',
                layout : {
                  type : 'hbox'
                },
                height: 29,
                items : btnList
            });
        }

    },

    init: function() {},

    _createSyntexEditor: function() {
        var editor = Ext.create('Exem.SyntaxEditor',{
            readOnly : true,
            mode     : this.mode
        });
        return editor;
    },

    _addEventListener: function(contextMenu ,syntaxEditor) {
        syntaxEditor.addEventListeners('contextmenu',function(e){
            e.preventDefault();
            if (syntaxEditor.getText().length > 0){
                contextMenu.showAt([e.x, e.y]);
            }
        });
    },

    _createContainer: function(caption, syntaxEditor) {
        var sqlContainer = Ext.create('Ext.container.Container',{
            title : caption,
            itemId: 'tab_' + Math.floor((Math.random()*100).toString()), //caption.replace(' ', '_'),
            layout: 'fit',
            items : [syntaxEditor]
        });
        return sqlContainer;
    },

    _onSQLFormattedData: function(aheader, resultDataSet) {
        var self = this;
        var activeTab = self.getActiveTab();

        if (activeTab != null) {
            activeTab.items.items[0].setText(resultDataSet);

            if (activeTab.title == self.firstTabCaption) {
                self.editorData.sql = resultDataSet;
            } else {
                self.editorData.bind = resultDataSet;
            }
        }
    },

    _onData: function(aheader, resultDataSet) {
        var self = this;
        var ix;

        if (aheader.rows_affected != 0) {
            self.editorData.sql = '';
            self.editorData.bind = '';

            var tempBindInfo =  '';
            if (self._binValueList.length != 0 && Comm.config.login.permission.bind == 1 ) {
                tempBindInfo = '/*---------------------------------\r\n';
                tempBindInfo += '  Bind Value List\r\n\r\n';

                for (ix = 0; ix < self._binValueList.length; ix++) {
                    tempBindInfo += self._binValueList[ix].code+ ' = ' + self._binValueList[ix].value + '\r\n';
                }
                tempBindInfo += '----------------------------------*/\r\n\r\n\r\n';
            }

            tempBindInfo += resultDataSet.rows[0][0];

            self.sqlEditor.setText(tempBindInfo);
            self.editorData.sql = tempBindInfo;

            //if (self.getTabBar().items.items[1].hidden === false) {

                // 권한 없음 layer 가 이미 있을경우 삭제.
                if (self.bindEditor.el.dom.getElementsByClassName('not_support').length != 0) {
                    self.bindEditor.el.dom.getElementsByClassName('not_support')[0].remove();
                }

                if (Comm.config.login.permission.bind == 1) {
                    for (ix = self._binValueList.length-1; ix >= 0; ix--) {
                        resultDataSet.rows[0][0] = resultDataSet.rows[0][0].replace(new RegExp(':'+ (self._binValueList[ix].code) ,'i'),  " "+self._binValueList[ix].value);
                    }
                    self.bindEditor.setText(resultDataSet.rows[0][0]);
                    self.editorData.bind = resultDataSet.rows[0][0];
                } else {
                    self.bindEditor.bindDisable();
                }

            //}
        }
    },

    _initConTextMenu: function() {
        var self = this;
        self.sqlContextMenu  = Ext.create('Exem.ContextMenu');
        self.bindContextMenu = Ext.create('Exem.ContextMenu');

        self._createFullSQLTextMenu(self.sqlContextMenu, self.sqlEditor);
        self._createFullSQLTextMenu(self.bindContextMenu, self.bindEditor);
    },

    _createFullSQLTextMenu: function(contextMenu ,syntaxEditor) {
        var self = this;
        contextMenu.addItem({
            title : common.Util.TR('Format SQL'),
            icon  : '',
            target: self,

            fn: function() {
                var activeTab = self.getActiveTab();
                if (activeTab && syntaxEditor.getText()) {
                    WS.FormatSQL(syntaxEditor.getText(), self._onSQLFormattedData, self);
                }
            }
        });
    },

    setFormatSQL: function() {
        var self = this;
        var activeTab = self.getActiveTab();
        if (activeTab && activeTab.items.items[0].getText()) {
            WS.FormatSQL(activeTab.items.items[0].getText(), self._onSQLFormattedData, self);
        }
    },

    getFullSQLText: function(sql_Id, bindList) {
        var self = this;
        self._binValueList = [];
        self.tempArr       = [];
        if (bindList == undefined || bindList.length <= 0) {
            self.getTabBar().items.items[1].hide();
        } else {
            self.getTabBar().items.items[1].show();
            self._binValueList = common.Util.convertBindList(bindList);
        }
        var sql_Text_dataset = {};
        sql_Text_dataset.bind = [{
            name : "sql_id",
            value: sql_Id,
            type : SQLBindType.STRING
        }];
        sql_Text_dataset.sql_file ='IMXPA_SQLEditorBaseFrame.sql';

        WS.SQLExec(sql_Text_dataset, self._onData, self);
    },

    clearEditorText: function() {
        var self = this;
        self.sqlEditor.setText(null);
        self.bindEditor.setText(null);
    }

});
