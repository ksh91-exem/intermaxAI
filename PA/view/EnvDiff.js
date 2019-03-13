/**
 * Created by HongKyun on 14. 7. 3.
 */
Ext.define("view.EnvDiff", {
    extend: 'Exem.FormOnCondition',

    isDiff: true,
    DisplayTime: DisplayTimeMode.HM,
    sql: {
        diff_first    : 'IMXPA_EnvDiff_first.sql',
        diff_second   : 'IMXPA_EnvDiff_second.sql',
        grid          : 'IMXPA_EnvDiff_Grid.sql',
        grid_selected : 'IMXPA_EnvDiff_Grid_Selected.sql'
    },
    queryParam: null,
    was_id: Comm.wasIdArr.join(),

    init: function() {

        var self = this ;
        self.diff_btn_click = false ;

        this.diffList = [];
        this.currentDiff = 0;

        this.setWorkAreaLayout('border');
        if(this.datePicker){
            this.datePicker.setLocalY(19);
        }

        this.diffCallOptions = {
            env1   : null,
            env1FileName : null,
            env2   : null,
            env2FileName : null
        };

        this.markerList = {
            leftList  : [],
            rightList : []
        };


        var leftArea = Ext.create('Exem.Container', {
            width : '30%',
            height: '100%',
            region: 'west',
            layout: 'border',
            split : true,
            margin: '5 0 5 5',
            border: true,
            style : {
                borderBottm : '1px solid #BEBEBE',
                borderLeft  : '1px solid #BEBEBE',
                borderRight : '1px solid #BEBEBE',
                borderRadius : '5px',
                background : '#fff'
            }
        });

        this.leftTopGrid = Ext.create('Exem.BaseGrid', {
            width : '100%',
            height: '40%',
            region: 'north',
            split : true,
            gridName : 'pa_env_diff_top_gridName',
            itemclick: function( thisGrid, record) {
                // arguments: thisGrid, record, item, index, e, eOpts
                this.selectRow(record.data['fileName']);
            }.bind(this)
        });

        this.leftTopGrid.addEventListener('cellcontextmenu', function(me) {
            // arguments: me, td, cellIndex, record, tr, rowIndex, e, eOpts
            var ix, ixLen;
            var countFlag = false;
            this.leftTopGrid.contextMenu.setDisableItem(0, false);

            for (ix = 0, ixLen = me.store.data.items.length; ix < ixLen; ix++) {
                if (me.store.data.items[ix].data.count != 1) {
                    countFlag = true;
                    break;
                }
            }

            if (countFlag) {
                this.leftTopGrid.contextMenu.setDisableItem(0, true);
            }

        }, this);

        this.leftTopGrid.beginAddColumns();
        this.leftTopGrid.addColumn(common.Util.CTR('File Name')     , 'fileName'    , 150, Grid.String, true, false);
        this.leftTopGrid.addColumn(common.Util.CTR('Last Load Time'), 'lastLoadTime', 150, Grid.String, true, false);
        this.leftTopGrid.addColumn(common.Util.CTR('Count')         , 'count'       , 100, Grid.String, true, false);
        this.leftTopGrid.endAddColumns();

        this.leftTopGrid.loadLayout(this.leftTopGrid.gridName);

        this.leftTopGrid.contextMenu.addItem({
            title : common.Util.TR('Changed Source'),
            fn: function() {
                var menu = this.leftTopGrid.contextMenu.items.items[0];
                if (menu.text == 'Changed Source') {
                    this.leftTopGrid.pnlExGrid.getStore().filterBy(function(record) {
                        if (record.data.count <= 1) {
                            menu.setText(common.Util.TR('All Source'));
                            return false;
                        } else {
                            return true;
                        }
                    });
                } else {
                    this.leftTopGrid.pnlExGrid.getStore().filterBy(function(record) {
                        menu.setText(common.Util.TR('Changed Source'));
                        return true;
                    });
                }

            }.bind(this)
        }, 0);


        this.leftCenterGrid = Ext.create('Exem.BaseGrid', {
            region: 'center',
            gridName : 'pa_env_diff_center_gridName',
            useDrag : true
        });

        this.leftCenterGrid.beginAddColumns();
        this.leftCenterGrid.addColumn(common.Util.CTR('Agent')        , 'was'       , 100, Grid.String, true, false);
        this.leftCenterGrid.addColumn(common.Util.CTR('Loaded Date')  , 'loadDate'  , 150, Grid.String, true, false);
        this.leftCenterGrid.addColumn(common.Util.CTR('File Size'), 'binarySize', 100, Grid.Number, true, false);
        this.leftCenterGrid.addColumn('Env File'  , 'env_file'  , 100, Grid.String, false, true);
        this.leftCenterGrid.addColumn('Class Name' , 'className' , 100, Grid.String, false, true);
        this.leftCenterGrid.addColumn('WAS ID'     , 'wasId'     , 100, Grid.Number, false, true);
        this.leftCenterGrid.endAddColumns();

        this.leftCenterGrid.loadLayout(this.leftCenterGrid.gridName);

        this.leftCenterGrid.pnlExGrid.getView().getRowClass = function(){
            var cls = 'cellCursor';
            return cls;
        };

        this.leftCenterGrid.contextMenu.addItem({
            title : common.Util.TR('Source1'),
            fn: function() {
                var record = this.leftCenterGrid.contextMenu.items.items[0].up().record;
                this.leftSourceLabel.setText('['+record['was']+']'+'['+record['loadDate']+']');

                this._makeJson(record, true);

                self.diff_btn_click = false ;
                var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function =  "Env_diff_file";
                AJSON.options  = this.diffCallOptions;
                WS.PluginFunction( AJSON , this.diffData , this );
                AJSON = null ;

            }.bind(this)
        }, 0);

        this.leftCenterGrid.contextMenu.addItem({
            title : common.Util.TR('Source2'),
            fn: function() {
                var record = this.leftCenterGrid.contextMenu.items.items[0].up().record;
                this.rightSourceLabel.setText('['+record['was']+']'+'['+(record['loadDate'])+']');

                this._makeJson(record, false);


                self.diff_btn_click = false ;
                var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function =  "Env_diff_file";
                AJSON.options  = this.diffCallOptions;
                WS.PluginFunction( AJSON , this.diffData , this );
                AJSON = null ;

            }.bind(this)
        }, 1);


        var rightArea = Ext.create('Exem.Container', {
            layout : 'vbox',
            region : 'center',
            border : true,
            margin: '5 5 5 0',
            style  : {
                border : '1px solid #BEBEBE',
                borderRadius : '5px',
                background : '#fff'
            }
        });

        var rightToolbarArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 40,
            border: true,
            layout: 'absolute',
            style  : {
                borderBottom : '1px solid #BEBEBE',
                background   : '#fff'
            }
        });

        var addLabel = Ext.create('Ext.form.Label', {
            html: '<span style="position:absolute; left: 0px; top: 0px; width: 12px; height: 12px; background:#BCF061;"></span>' +
                  '<span style="position:absolute; left: 20px;">' + common.Util.TR('Add') + '</span>',
            width: 70,
            x: 10,
            y: 14
        });

        var modifyLabel = Ext.create('Ext.form.Label', {
            html: '<span style="position:absolute; left: 0px; top: 0px; width: 12px; height: 12px; background:#9ED2DD;"></span>' +
                  '<span style="position:absolute; left: 20px;">' + common.Util.TR('Modify') + '</span>',
            width: 70,
            x: 80,
            y: 14
        });

        var deleteLabel = Ext.create('Ext.form.Label', {
            html: '<span style="position:absolute; left: 0px; top: 0px; width: 12px; height: 12px; background:#E4A485;"></span>' +
                  '<span style="position:absolute; left: 20px;">' + common.Util.TR('Delete') + '</span>',
            width: 70,
            x: 150,
            y: 14
        });

        this.nextDiffBtn = Ext.create('Exem.Button', {
            text : common.Util.TR('Next Diff'),
            x : 230,
            y : 8,
            width : 85,
            disabled : true,
            listeners: {
                scope: this,
                click: function() {

                    this.moveDiff('next');

                }
            }
        });

        this.prevDiffBtn = Ext.create('Exem.Button', {
            text : common.Util.TR('Prev Diff'),
            x : 320,
            y : 8,
            width : 85,
            disabled : true,
            listeners : {
                scope: this,
                click: function() {

                    this.moveDiff('prev');

                }
            }
        });

        this.diffSourceBtn = Ext.create('Exem.Button', {
            text : common.Util.TR('Diff Env'),
            x : 410,
            y : 8,
            width : 120,
            disabled : true,
            listeners : {
                scope: this,
                click: function() {


                    self.diff_btn_click = true ;

                    if (this.diffCallOptions.env1 == null) {

                        common.Util.showMessage(common.Util.TR('ERROR'), common.Util.TR('Please select the first source'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

                        });
                        return;

                    } else if (this.diffCallOptions.env2 == null) {

                        common.Util.showMessage(common.Util.TR('ERROR'), common.Util.TR('Please select the second source'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

                        });
                        return;

                    } else if(this.diffCallOptions.env1FileName !== this.diffCallOptions.env2FileName){
                        common.Util.showMessage(
                            common.Util.TR('ERROR'),
                            common.Util.TR('Please select the same environment file.'),
                            Ext.Msg.OK,
                            Ext.MessageBox.ERROR,
                            function(){}
                        );
                        return;
                    }


                    this.rightSourceArea.loadingMask.showMask();

                    this.nextDiffBtn.setDisabled(true);
                    this.prevDiffBtn.setDisabled(true);
                    this.diffSourceBtn.setDisabled(true);
                    var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                    AJSON.dll_name = "IntermaxPlugin.dll";
                    AJSON.function =  "Env_diff_file";
                    AJSON.options  = this.diffCallOptions;
                    WS.PluginFunction( AJSON , this.diffData , this );

                }
            }
        });

        var rightSourceArea = Ext.create('Exem.Container', {
            width : '100%',
            flex  : 1,
            layout: 'border'
        });
        this.rightSourceArea = rightSourceArea;
        var sourceLeftArea = Ext.create('Exem.Container', {
            layout : 'vbox',
            width  : '50%',
            height : '100%',
            region : 'west',
            style  : 'background: #fff',
            split  : true
        });

        var sourceRightArea = Ext.create('Exem.Container', {
            layout : 'vbox',
            region : 'center',
            style  : 'background: #fff'
        });

        this.leftSourceLabel = Ext.create('Ext.form.Label', {
            width : '100%',
            height: 30,
            padding : 5,
//            text  : 'title Area',
            border: true,
            style : {
                borderBottom : '1px solid #BEBEBE'
            }
        });
        this.rightSourceLabel = Ext.create('Ext.form.Label', {
            width : '100%',
            height: 30,
            padding: 5,
//            text  : 'title Area',
            border: true,
            style : {
                borderBottom : '1px solid #BEBEBE'
            }
        });
        this.leftEditor = Ext.create('Exem.SyntaxEditor', {
            mode  : 'java',
            width : '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true,
            drag      : true,
            fadeFold: true
        });

        this.rightEditor = Ext.create('Exem.SyntaxEditor', {
            mode  : 'java',
            width : '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true,
            drag      : true,
            fadeFold: true
        });

        sourceLeftArea.add( this.leftSourceLabel, this.leftEditor );
        sourceRightArea.add( this.rightSourceLabel, this.rightEditor );
        rightToolbarArea.add( addLabel, modifyLabel, deleteLabel, this.nextDiffBtn, this.prevDiffBtn, this.diffSourceBtn );
        rightSourceArea.add( sourceLeftArea, sourceRightArea );
        leftArea.add( this.leftTopGrid, this.leftCenterGrid );
        rightArea.add( rightToolbarArea, rightSourceArea );
        this.workArea.add( leftArea, rightArea );

        var leftDropTargetEl  = sourceLeftArea.getEl();
        var rightDropTargetEl = sourceRightArea.getEl();

        Ext.create('Ext.dd.DropTarget', leftDropTargetEl, {
            ddGroup: 'GridExample',
            notifyEnter: function() {

            },
            notifyDrop: function(ddSource) {
                var record = ddSource.dragData.records[0].data;
                this.leftSourceLabel.setText('['+record['was']+']'+'['+record['loadDate']+']');

                this._makeJson(record, true);

                self.diff_btn_click = false ;
                var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function =  "Env_diff_file";
                AJSON.options  = this.diffCallOptions;
                WS.PluginFunction( AJSON , this.diffData , this );
                AJSON = null ;

            }.bind(this)
        });

        Ext.create('Ext.dd.DropTarget', rightDropTargetEl, {
            ddGroup: 'GridExample',
            notifyEnter: function() {

            },
            notifyDrop: function(ddSource) {
                var record = ddSource.dragData.records[0].data;
                this.rightSourceLabel.setText('['+record['was']+']'+'['+record['loadDate']+']');

                this._makeJson(record, false);

                self.diff_btn_click = false ;
                var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function =  "Env_diff_file";
                AJSON.options  = this.diffCallOptions;
                WS.PluginFunction( AJSON , this.diffData , this );
                AJSON = null ;

            }.bind(this)
        });

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;

        s1.on('changeScrollTop', function() {
            s2.setScrollTop(s1.getScrollTop());

        });
        s1.on('changeScrollLeft', function() {
            s2.setScrollLeft(s1.getScrollLeft());
        });

        /*
        s2.on('changeScrollTop', function() {
            s1.setScrollTop(s2.getScrollTop());
        });
        s2.on('changeScrollLeft', function() {
            s1.setScrollLeft(s2.getScrollLeft());
        });
        */


        //s1.on('changeFold', function(e) {
        //    if (e.action === 'add') {// 접기
        //        s2.foldAll(e.data.start.row, e.data.end.row);
        //    } else { // action remove  펴기
        //        s2.removeFold(e.data);
        //    }
        //});
        //s2.on('changeFold', function(e) {
        //    if (e.action === 'add') {// 접기
        //        s1.foldAll(e.data.start.row, e.data.end.row);
        //    } else { // action remove  펴기
        //        s1.removeFold(e.data);
        //    }
        //});


        var previousMonth = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);

        this.datePicker.mainFromField.setValue(Ext.util.Format.date(previousMonth, Comm.dateFormat.NONE) + ' 00:00');
        this.datePicker.mainToField.setValue(Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.NONE) + ' 00:00');

    },

    clearDiff: function()  {

        if (this.markerList.leftList.length) {
            var s1 = this.leftEditor.edit.session;
            var s2 = this.rightEditor.edit.session;

            for(var ix = 0, ixLen = this.markerList.leftList.length; ix < ixLen; ix++) {

                s1.removeMarker(this.markerList.leftList[ix]);
                s2.removeMarker(this.markerList.rightList[ix]);

            }
        }
    },

    moveDiff: function(move) {

        var s1 = this.leftEditor.edit.session.getSelection().selectionLead;
//        var s2 = this.rightEditor.edit.session;
        var currentRow = s1.row;
        var tmpDiff = 0 ;
        this.currentDiff = 0 ;

        for (var ix = 0, ixLen = this.diffList.length; ix < ixLen; ix++) {

            if (this.diffList[ix] == currentRow) {

                this.currentDiff = ix;

            } else {
                if (ix > 0 && this.diffList[ix - 1] < currentRow && currentRow < this.diffList[ix]) {
                    this.currentDiff = ix-1;
                }
            }

        } ;


        if (move == 'next') {

            if ( currentRow == this.diffList[this.diffList.length-1] ){
                return ;
            }
            //if (this.diffList.length == this.currentDiff) return;
            this.currentDiff += 1;
            tmpDiff = this.diffList[this.currentDiff];
            s1.setPosition(tmpDiff);
//            this.leftEditor.edit.session.selection.moveCursorTo(tmpDiff, 0, true);

        } else {

            if ( currentRow == 0 ){
                return ;
            }
            this.currentDiff -= 1;
            tmpDiff = this.diffList[this.currentDiff];
            s1.setPosition(tmpDiff);
//            this.leftEditor.edit.session.selection.moveCursorTo(tmpDiff, 0, true);

        }

    },

    diffData: function(header, data) {

        console.debug('DiffData  ==>>>  ', data);

        if (header.success === false) {

            this.nextDiffBtn.setDisabled(true);
            this.prevDiffBtn.setDisabled(true);
            this.diffSourceBtn.setDisabled(true);
            this.rightSourceArea.loadingMask.hide();
        }

        if (!data) {
            this.nextDiffBtn.setDisabled(true);
            this.prevDiffBtn.setDisabled(true);
            this.diffSourceBtn.setDisabled(true);
            this.rightSourceArea.loadingMask.hide();
            return;
        }

        var Range = ace.require('ace/range').Range;

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;

        /*
        s1.addMarker(new Range(3, 0, 4, 0), "aceEditor-add", "line");
        s1.addMarker(new Range(4, 0, 5, 0), "aceEditor-modify", "line");
        s2.addMarker(new Range(1, 0, 2, 0), "ace_active-line", "fullLine");
        */

        var editMarker = function(markLine, mode) {
            var marker1 = null,
                marker2 = null;

            switch (mode) {
                case 0 :
                    marker1 = s1.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-modify", "line" );
                    marker2 = s2.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-modify", "line" );
                    break;
                case 1 :
                    marker1 = s1.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-delete", "line" );
                    marker2 = s2.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-delete", "line" );
                    break;
                case 2 :
                    marker1 = s1.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-add", "line" );
                    marker2 = s2.addMarker( new Range(markLine, 0, markLine+1, 0), "aceEditor-add", "line" );
                    break;
                default:
                    break;
            }

            this.markerList.leftList.push(marker1);
            this.markerList.rightList.push(marker2);

        }.bind(this);

        if ( Object.keys(data).length == 0 ){
            this.rightSourceArea.loadingMask.hide();
            return ;
        }
        this.leftEditor.setText(data.Values[1]);
        this.rightEditor.setText(data.Values[2]);


        //1504.3 diff env버튼눌렀을때만 호출하도록 설정(min)
        if ( this.diff_btn_click ){
            this.diffList.length = 0 ;

            for (var ix = 0, ixLen = data.Values[0].length; ix < ixLen; ix++ ) {
                var dataRows = data.Values[0][ix];

                this.diffList.push(dataRows[0]); // line

                switch (dataRows[1]) { // mode
                    case 0 :  // modify - 하이라이트만
                        editMarker(dataRows[0], 0);
                        break;
                    case 1 :  // delete - 오른쪽 eidt 의 해당 라인에 줄바꿈과 색상 추가
                        editMarker(dataRows[0], 1);
//                    s2.insert( { row: dataRows[0], column: 0 }, '\n' );

                        break;
                    case 2 :  // add    - 왼쪽 edit 의 해당 라인에 줄바꿈과 색상 추가
                        editMarker(dataRows[0], 2);
//                    s1.insert( { row: dataRows[0], column: 0 }, '\n' );
                        break;
                    default:
                        break;
                }
            }
            ix = null ;
        }

        if (this.diffCallOptions.env1 != null && this.diffCallOptions.env2 != null ) {
            this.nextDiffBtn.setDisabled(false);
            this.prevDiffBtn.setDisabled(false);
            //this.diffSourceBtn.setDisabled(false);
        }

        this.rightSourceArea.loadingMask.hide();

    },


    _makeJson: function(record, firstSecondFlag) {

        this.nextDiffBtn.setDisabled(true);
        this.prevDiffBtn.setDisabled(true);

        this.leftEditor.setText('');
        this.rightEditor.setText('');

        this.clearDiff();

        /*
         var h2c = function (val){
         var str = '';
         for (var i = 0; i < val.length; i += 2)
         str += String.fromCharCode(parseInt(val.substr(i, 2), 16));
         return decodeURIComponent(escape(str));
         };
         */

        if (firstSecondFlag) {
            this.diffCallOptions.env1 = record['env_file'];
            this.diffCallOptions.env1FileName = record['className'];
        } else {
            this.diffCallOptions.env2 = record['env_file'];
            this.diffCallOptions.env2FileName = record['className'];
        }

        this.diffCallOptions.class_method = record['className'];

        if (this.diffCallOptions.env1 != null && this.diffCallOptions.env2 != null ) {
            this.diffSourceBtn.setDisabled(false);
        }
    },


    selectRow: function(fileName) {

        this.leftCenterGrid.loadingMask.showMask();
        this.leftCenterGrid.clearRows();

        var dataset = {};

        var wasList = [];
        for (var ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            wasList.push(ix);
        }

        dataset.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getFromDateTime())
        }, {
            name : 'to_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getToDateTime())
        }, {
            name : 'fileName',
            type : SQLBindType.STRING,
            value: fileName
        }];

        dataset.replace_string = [{
            name : 'was_id',
            value: Comm.wasIdArr.join()
        }];

        dataset.sql_file = this.sql.diff_second;
        WS.SQLExec(dataset, this.onData, this);

    },

    _gridClick: function (grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    executeSQL: function() {

        this.loadingMask.showMask();

        this.diffSourceBtn.setDisabled(true);
        this.nextDiffBtn.setDisabled(true);
        this.prevDiffBtn.setDisabled(true);


        this.leftSourceLabel.setText('');
        this.rightSourceLabel.setText('');

        this.leftEditor.setText('');
        this.rightEditor.setText('');

        this.leftTopGrid.clearRows();
        this.leftCenterGrid.clearRows();

        this.leftTopGrid.contextMenu.items.items[0].setText(common.Util.TR('Changed Source'));

        this.diffCallOptions = {
            env1   : null,
            env1FileName : null,
            env2   : null,
            env2FileName : null
        };

        var dataset   = {};
        dataset.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getFromDateTime())
        }, {
            name : 'to_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getToDateTime())
        }];
        dataset.replace_string = [{
            name : 'was_id',
            value: Comm.wasIdArr.join()
        }];

        dataset.sql_file = this.sql.diff_first;
        WS.SQLExec(dataset, this.onData, this);

    },

    onData: function(header, data) {

        if(!common.Util.checkSQLExecValid(header, data)){
            this.loadingMask.hide();
            this.leftCenterGrid.loadingMask.hide();

            common.Util.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});

            console.debug('EnvDiff-onData');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (data.rows.length <= 0) {
            this.loadingMask.hide();
            this.leftCenterGrid.loadingMask.hide();
            return;
        }

        var ix, ixLen;
        var dataRows;
        switch(header.command) {
            case this.sql.diff_first  :
                var grid = this.leftTopGrid.pnlExGrid;
                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    dataRows = data.rows[ix];
                    this.leftTopGrid.addRow([
                        dataRows[0]
                        ,dataRows[1]
                        ,dataRows[2]
                    ]);
                }

                this.leftTopGrid.drawGrid();

                this._gridClick(grid, 0);

                break;
            case this.sql.diff_second :

                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    dataRows = data.rows[ix];
                     /*
                     TIME,
                     was_name
                     field_id
                     env_File_name
                     env_file
                     */
                    this.leftCenterGrid.addRow([
                        dataRows[1]  // wasName
                        ,dataRows[0]  // time
                        ,dataRows[4].length / 2 // binary
                        ,dataRows[4]  // sourceId
                        ,dataRows[3]  // className
//                        ,dataRows[1]  // wasId
                    ]);
                }
                this.leftCenterGrid.drawGrid();

                if (this.isLoading)
                    this.loadingMask.hide();

                if (this.leftCenterGrid.isLoading)
                    this.leftCenterGrid.loadingMask.hide();

                break;

            default:
                break;

        }
    }
});
