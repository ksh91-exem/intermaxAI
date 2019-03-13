Ext.define("Exem.Form", {
    extend: 'Ext.container.Container',
    alias: 'widget.baseform',
    layout: 'vbox',
    height: '100%',
    width: '100%',
    border: false,
    sqlStore: null,
    sqlCount: 0,
    sqlPreFix: '../sql/',

    constructor: function() {
        this.callParent(arguments);
        var self = this;
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this.sqlPreFix += Comm.currentRepositoryInfo.database_type + '/';
        self.sqlStore = [];

        self.addListener('render', function(){
            this.el.set({'TabIndex': '1'});

            var componentId = this.getEl().dom.id;
            if (!document.getElementById(componentId)) {
                return false;
            }

            new Ext.KeyMap( componentId , [{
                key: "s",
                ctrl:true,
                shift: true,
                fn: function(){
                    var sqlList = Comm.sqlExecHistory[this.id];

                    if (! sqlList && this.up) {
                        sqlList = Comm.sqlExecHistory[this.up().id];
                    }

                    if(! sqlList){
                        return;
                    }

                    this.loadingMask.show();

                    for (var sql in sqlList) {
                        if (!sqlList[sql]) {
                            continue;
                        }
                        this.sqlStore.push({
                            sql: sql,
                            bind: sqlList[sql].bind,
                            replace_string: sqlList[sql].replace_string
                        });

                        this.sqlCount++;

                        WS.sqlview(sql, this.sqlHistoryManager.bind(this));
                    }
                }.bind(this)
            }]);

        }, self);

        self.addListener('destroy', function(){
            if(Comm.sqlExecHistory[this.id]){
                Comm.sqlExecHistory['delete'](this.id);
            }
        });
    },

    /**
     * 현재 클래스에서 실행된 sql 리스트를 보여준다.
     */
    sqlHistoryManager: function(head, data){
        try{
            var sql = head.value.replace(this.sqlPreFix, '');

            for(var ix = 0, ixLen = this.sqlStore.length; ix < ixLen; ix++){
                if(this.sqlStore[ix].sql == sql){
                    this.sqlStore[ix].text = data;
                    break;
                }
            }
        }catch(e){

        }finally{
            --this.sqlCount;
            if(this.sqlCount == 0){
                var text = [];
                var bind = null;
                var replaceString = null;
                var bindText = null;
                var regExp = null;

                text.push('/*==========================================================\n');
                text.push('\t\tClassName : ' + this.$className + '\n');
                text.push('==========================================================*//*\n\n\n*/');

                var fullSqlTextWindow = Ext.create('Exem.FullSQLTextWindow', {
                    width: 800,
                    height: 600
                });

                for(var jx = 0, jxLen = this.sqlStore.length; jx < jxLen; jx++){
                    // sql output
                    text.push('/*------------------------------------------------------------------------------------------------------------------\n');
                    text.push('[SQL] : ' + this.sqlStore[jx].sql + '\n');
                    bindText = this.sqlStore[jx].text;

                    if(bindText == null){
                        text.push('---------------------------------------------------------*/\n');
                        continue;
                    }
                    // bind output
                    if(this.sqlStore[jx].bind){
                        text.push('[BIND] : \n');
                        for(var kx = 0, kxLen = this.sqlStore[jx].bind.length; kx < kxLen; kx++){
                            bind = this.sqlStore[jx].bind[kx];
                            for(var b in bind){
                                text.push(' - ' + b + ' : ' + bind[b] + '\n');
                            }

                            regExp = new RegExp(':' + bind.name, 'gim');
                            bindText = bindText.replace(regExp, bind.type == 'string' ? ('\'' + bind.value + '\'') : bind.value);
                        }
                    }

                    // replace string output
                    if(this.sqlStore[jx].replace_string){
                        text.push('[REPLACE STRING] : \n');
                        for(var lx = 0, lxLen = this.sqlStore[jx].replace_string.length; lx < lxLen; lx++){
                            replaceString = this.sqlStore[jx].replace_string[lx];
                            for(var r in replaceString){
                                text.push(' - ' + r + ' : ' + replaceString[r] + '\n');
                            }

                            regExp = new RegExp('\\$' + replaceString.name + '\\$', 'gim');
                            bindText = bindText.replace(regExp, replaceString.value);
                        }
                    }
                    text.push('------------------------------------------------------------------------------------------------------------------*/\n');
                    text.push('\n/*\n*/\n');
                    text.push(this.sqlStore[jx].text);
                    text.push('\n/*\n*/');
                    text.push('/*========================== SQL with binded value ==========================*/\n');
                    text.push(bindText);
                    text.push('\n/*\n*/');
                    text.push('/*==================================================================*/\n');

                    if(jx != this.sqlStore.length -1){
                        text.push('/*\n\n\n*/');
                    }
                }

                // sql bind tab hide
                fullSqlTextWindow.BaseFrame.items.items[1].tab.setVisible(false);

                fullSqlTextWindow.BaseFrame.sqlEditor.setText(text.join(''));

                this.loadingMask.hide();
                fullSqlTextWindow.show();
                fullSqlTextWindow.BaseFrame.sqlEditor.edit.focus();

                this.sqlStore.length = 0;

                new Ext.KeyMap( fullSqlTextWindow.id , [{
                    key: Ext.EventObject.ENTER,
                    alt:true,
                    fn: function(){
                        fullSqlTextWindow.maximize();
                    }.bind(this)
                }]);
            }
        }
    }
});
