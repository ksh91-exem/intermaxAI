/**
 * Created by HongKyun on 14. 7. 3.
 */
Ext.define("view.DiffSource", {
    extend: 'Exem.FormOnCondition',

    isDiff: true,
    DisplayTime: DisplayTimeMode.HM,
    sql: {
        diff_first: 'IMXPA_DiffSource_first.sql',
        diff_second: 'IMXPA_DiffSource_second.sql',
        diff_combo: 'IMXPA_DiffSource_combo.sql'
    },

    execClassName: function () {
        var dataset = {};

        dataset.bind = [{
            name: 'from_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getFromDateTime())
        }, {
            name: 'to_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getToDateTime())
        }];
        dataset.sql_file = this.sql.diff_combo;
        WS.SQLExec(dataset, this.classOnData, this);

    },

    classOnData: function (header, data) {
        var dataArr = [];
        dataArr.push({name: '(All)', value: '(All)'});
        if (data.rows.length > 0) {
            for (var ix = 0; ix < data.rows.length; ix++) {
                dataArr.push({name: data.rows[ix][0], value: data.rows[ix][0]});
            }
        }
        this.searchClass.setData(dataArr);
        this.searchClass.setSearchField('name');
        this.searchClass.selectByIndex(0);
    },

    _initOptionsObj: function () {

        this.diffCallOptions = {
            dbname: null,
            class_method: null,
            was_id: null,
            was_id2: null,
            loadtime1: null,
            loadtime2: null
        };

        this.leftSourceOptions = {
            dbname: null,
            class_method: null,
            was_id: null,
            loadtime1: null
        };

        this.rightSourceOptions = {
            dbname: null,
            class_method: null,
            was_id2: null,
            loadtime2: null
        };

        this.markerList = {
            leftList: [],
            rightList: []
        };

    },

    init: function () {

        this.diffList = [];
        this.currentDiff = 0;

        this.leftCallBackFlag = false;
        this.rightCallBackFlag = false;
        this.left_binary = 0 ;
        this.right_binary = 0 ;


        this.setWorkAreaLayout('border');
        this.datePicker.setLocalY(19);

        this._initOptionsObj();

        this.searchClass = Ext.create('Exem.AjaxComboBox', {
            x: 400,
            y: 19,
            width: 400,
            labelWidth: 70,
            multiSelect: true,
            fieldLabel: common.Util.TR('Class Name'),
            listeners: {
                blur: function () {
                    if (!this.getValue() || this.getValue().length == 0) {
                        this.selectByIndex(0);

                        if (!this.getValue() || this.getValue().length == 0 ) {
                            this.setValue('(All)');
                        }
                    }
                },
                select: function (combo, records) {
                    var lastSelect = records[records.length - 1];
                    if (lastSelect.data.name == '(All)') {
                        this.reset();
                        this.setValue('(All)');
                    } else {
                        if (this.getValue().indexOf('(All)') != -1) {
                            this.reset();
                            this.setValue(lastSelect.data.value);
                        }
                    }
                }
            }
        });
        this.conditionArea.add(this.searchClass);

        var leftArea = Ext.create('Exem.Container', {
            width: '30%',
            height: '100%',
            region: 'west',
            layout: 'border',
            split: true,
            margin: '5 0 5 5',
            border: true,
            style: {
                borderBottm: '1px solid #BEBEBE',
                borderLeft: '1px solid #BEBEBE',
                borderRight: '1px solid #BEBEBE',
                borderRadius: '5px',
                background: '#fff'
            }
        });

        this.leftTopGrid = Ext.create('Exem.BaseGrid', {
            width: '100%',
            height: '40%',
            region: 'north',
            split: true,
            gridName: 'pa_diff_source_top_gridName',
            itemclick: function (thisGrid, record) {
                // arguments: thisGrid, record, item, index, e, eOpts
                this.selectRow(record.data['class']);
            }.bind(this)
        });

        this.leftTopGrid.addEventListener('cellcontextmenu', function (me) {
            //arguments: me, td, cellIndex, record, tr, rowIndex, e, eOpts
            var ix = 0, ixLen;
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
        this.leftTopGrid.addColumn(common.Util.CTR('Class'), 'class', 150, Grid.String, true, false);
        this.leftTopGrid.addColumn(common.Util.CTR('Last Load Time'), 'lastLoadTime', 150, Grid.String, true, false);
        this.leftTopGrid.addColumn(common.Util.CTR('Count'), 'count', 100, Grid.String, true, false);
        this.leftTopGrid.endAddColumns();

        this.leftTopGrid.loadLayout(this.leftTopGrid.gridName);


        this.leftTopGrid.contextMenu.addItem({
            title: common.Util.TR('Changed Source'),
            fn: function () {
                this.leftTopGrid.pnlExGrid.getStore().clearFilter();
                var menu = this.leftTopGrid.contextMenu.items.items[0];
                if (menu.text == common.Util.TR('Changed Source')) {
                    this.leftTopGrid.pnlExGrid.getStore().filterBy(function (record) {
                        if (record.data.count <= 1) {
                            menu.setText(common.Util.TR('All Source'));
                            return false;
                        } else {
                            return true;
                        }
                    });
                } else {
                    this.leftTopGrid.pnlExGrid.getStore().filterBy(function (record) {
                        menu.setText(common.Util.TR('Changed Source'));
                        return true;
                    });
                }
            }.bind(this)
        }, 0);


        this.leftCenterGrid = Ext.create('Exem.BaseGrid', {
            region: 'center',
            gridName: 'pa_diff_source_center_gridName',
            useDrag: true
        });

        this.leftCenterGrid.beginAddColumns();
        this.leftCenterGrid.addColumn(common.Util.CTR('Agent'), 'was', 100, Grid.String, true, false);
        this.leftCenterGrid.addColumn(common.Util.CTR('Loaded Date'), 'loadDate', 150, Grid.String, true, false);
        this.leftCenterGrid.addColumn(common.Util.CTR('File Size'), 'binarySize', 100, Grid.Number, true, false);
        this.leftCenterGrid.addColumn('Source ID', 'sourceId', 100, Grid.String, false, true);
        this.leftCenterGrid.addColumn('Class Name', 'className', 100, Grid.String, false, true);
        this.leftCenterGrid.addColumn('WAS ID', 'wasId', 100, Grid.Number, false, true);
        this.leftCenterGrid.endAddColumns();

        this.leftCenterGrid.loadLayout(this.leftCenterGrid.gridName);

        this.leftCenterGrid.pnlExGrid.getView().getRowClass = function () {
            // arguments: record, rowIndex, rowParams, store
            var cls = 'cellCursor';
            return cls;
        };



        this.leftCenterGrid.contextMenu.addItem({
            title: common.Util.TR('Source1'),
            fn: function () {
                this.leftCenterGrid.contextMenu.items.items[0].up().record.loadDate = common.Util.getDate(this.leftCenterGrid.contextMenu.items.items[0].up().record.loadDate) ;
                var record = this.leftCenterGrid.contextMenu.items.items[0].up().record;
                this.leftSourceLabel.setText('[' + record['was'] + ']' + '[' + record['className'] + ']' + '[' + record['loadDate'] + ']');

                this._makeJson(record, true);

                var AJSON = {};
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function = "java_file";
                AJSON.options = this.leftSourceOptions;
                WS.PluginFunction(AJSON, this.leftDiffData, this);

                this.sourceLeftArea.loadingMask.showMask();

                this.leftCenterGrid.contextMenu.setDisableItem( 1, true ) ;

            }.bind(this)
        }, 0);


        this.leftCenterGrid.contextMenu.addItem({
            title: common.Util.TR('Source2'),
            fn: function () {
                this.leftCenterGrid.contextMenu.items.items[0].up().record.loadDate = common.Util.getDate(this.leftCenterGrid.contextMenu.items.items[0].up().record.loadDate) ;
                var record = this.leftCenterGrid.contextMenu.items.items[0].up().record;
                this.rightSourceLabel.setText('[' + record['was'] + ']' + '[' + record['className'] + ']' + '[' + (record['loadDate']) + ']');

                this._makeJson(record, false);

                var AJSON = {};
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function = "java_file";
                AJSON.options = this.rightSourceOptions;
                WS.PluginFunction(AJSON, this.rightDiffData, this);

                this.sourceRightArea.loadingMask.showMask();

            }.bind(this)
        }, 1);




        var rightArea = Ext.create('Exem.Container', {
            layout: 'vbox',
            region: 'center',
            border: true,
            margin: '5 5 5 0',
            style: {
                border: '1px solid #BEBEBE',
                borderRadius: '5px',
                background: '#fff'
            }
        });

        var rightToolbarArea = Ext.create('Exem.Container', {
            width: '100%',
            height: 40,
            border: true,
            layout: 'absolute',
            style: {
                borderBottom: '1px solid #BEBEBE',
                background: '#fff'
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
            text: common.Util.TR('Next Diff'),
            x: 230,
            y: 8,
            width: 85,
            disabled: true,
            listeners: {
                scope: this,
                click: function () {

                    this.moveDiff('next');

                }
            }
        });

        this.prevDiffBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('Prev Diff'),
            x: 320,
            y: 8,
            width: 85,
            disabled: true,
            listeners: {
                scope: this,
                click: function () {

                    this.moveDiff('prev');

                }
            }
        });

        this.diffSourceBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('Trace of Modified Source'),
            x: 410,
            y: 8,
            width: 100,
            disabled: true,
            listeners: {
                scope: this,
                click: function () {
                    if(this.leftSourceOptions.class_method !== this.rightSourceOptions.class_method){
                        common.Util.showMessage(
                            common.Util.TR('ERROR'),
                            common.Util.TR('Please select the same class name.'),
                            Ext.Msg.OK,
                            Ext.MessageBox.ERROR,
                            function(){}
                        );

                        return;
                    }

                    this.rightSourceArea.loadingMask.showMask();

                    var AJSON = {};   // Host Name 요청 받아놓은 것을 주기 때문에 부하 적다고 하심
                    AJSON.dll_name = "IntermaxPlugin.dll";
                    AJSON.function = "diff_file";
                    AJSON.options = this.diffCallOptions;
                    WS.PluginFunction(AJSON, this.diffData, this);


                }
            }
        });

        var rightSourceArea = Ext.create('Exem.Container', {
            width: '100%',
            flex: 1,
            layout: 'border'
        });
        this.rightSourceArea = rightSourceArea;

        var sourceLeftArea = Ext.create('Exem.Container', {
            layout: 'vbox',
            width: '50%',
            height: '100%',
            region: 'west',
            style: 'background: #fff',
            split: true
        });
        this.sourceLeftArea = sourceLeftArea;

        var sourceRightArea = Ext.create('Exem.Container', {
            layout: 'vbox',
            region: 'center',
            style: 'background: #fff'
        });
        this.sourceRightArea = sourceRightArea;

        this.leftSourceLabel = Ext.create('Ext.form.Label', {
            width: '100%',
            height: 30,
            padding: 5,
//            text  : 'title Area',
            border: true,
            style: {
                borderBottom: '1px solid #BEBEBE'
            }
        });
        this.rightSourceLabel = Ext.create('Ext.form.Label', {
            width: '100%',
            height: 30,
            padding: 5,
//            text  : 'title Area',
            border: true,
            style: {
                borderBottom: '1px solid #BEBEBE'
            }
        });
        this.leftEditor = Ext.create('Exem.SyntaxEditor', {
            mode: 'java',
            width: '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true
        });

        this.rightEditor = Ext.create('Exem.SyntaxEditor', {
            mode: 'java',
            width: '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true
        });

        sourceLeftArea.add(this.leftSourceLabel, this.leftEditor);
        sourceRightArea.add(this.rightSourceLabel, this.rightEditor);
        rightToolbarArea.add(addLabel, modifyLabel, deleteLabel, this.nextDiffBtn, this.prevDiffBtn, this.diffSourceBtn);
        rightSourceArea.add(sourceLeftArea, sourceRightArea);
        leftArea.add(this.leftTopGrid, this.leftCenterGrid);
        rightArea.add(rightToolbarArea, rightSourceArea);
        this.workArea.add(leftArea, rightArea);

        var leftDropTargetEl = sourceLeftArea.getEl();
        var rightDropTargetEl = sourceRightArea.getEl();


        Ext.create('Ext.dd.DropTarget', leftDropTargetEl, {
            ddGroup: 'GridExample',
            notifyEnter: function () {
                // arguments: ddSource, e, data

            },
            notifyDrop: function (ddSource) {
                // arguments: ddSource, e, data
                ddSource.dragData.records[0].data.loadDate = common.Util.getDate( ddSource.dragData.records[0].data.loadDate) ;
                var record = ddSource.dragData.records[0].data;
                this.leftSourceLabel.setText('[' + record['was'] + ']' + '[' + record['className'] + ']' + '[' + record['loadDate'] + ']');

                this._makeJson(record, true);

                var AJSON = {};
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function = "java_file";
                AJSON.options = this.leftSourceOptions;
                WS.PluginFunction(AJSON, this.leftDiffData, this);

                this.sourceLeftArea.loadingMask.showMask();

            }.bind(this)
        });

        Ext.create('Ext.dd.DropTarget', rightDropTargetEl, {
            ddGroup: 'GridExample',
            notifyEnter: function () {
                // arguments: ddSource, e, data

            },
            notifyDrop: function (ddSource) {
                // arguments: ddSource, e, data
                ddSource.dragData.records[0].data.loadDate = common.Util.getDate( ddSource.dragData.records[0].data.loadDate ) ;
                var record = ddSource.dragData.records[0].data;
                this.rightSourceLabel.setText('[' + record['was'] + ']' + '[' + record['className'] + ']' + '[' + record['loadDate'] + ']');

                this._makeJson(record, false);

                var AJSON = {};
                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function = "java_file";
                AJSON.options = this.rightSourceOptions;
                WS.PluginFunction(AJSON, this.rightDiffData, this);

                this.sourceRightArea.loadingMask.showMask();

            }.bind(this)
        });

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;

        //s1.on('changeScrollTop', function() {
        //    s2.setScrollTop(s1.getScrollTop())
        //
        //});
        //s1.on('changeScrollLeft', function() {
        //    s2.setScrollLeft(s1.getScrollLeft())
        //});
        //
        //s2.on('changeScrollTop', function() {
        //    s1.setScrollTop(s2.getScrollTop())
        //});
        //s2.on('changeScrollLeft', function() {
        //    s1.setScrollLeft(s2.getScrollLeft())
        //});


        s1.on('changeFold', function (e) {
            if (e.action == 'add') {
                s2.foldAll(e.data.start.row, e.data.end.row);
            } else { // action remove
                //s2.removeFold(e.data)
                s2.unfold(e.data) ;
            }
        });
        s2.on('changeFold', function (e) {
            if (e.action == 'add') {
                s1.foldAll(e.data.start.row, e.data.end.row);
            } else { // action remove
                //s1.removeFold(e.data)
                s1.unfold(e.data) ;
            }
        });

        var previousMonth = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);

        this.datePicker.mainFromField.setValue(Ext.util.Format.date(previousMonth, Comm.dateFormat.NONE) + ' 00:00');
        this.datePicker.mainToField.setValue(Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.NONE) + ' 23:59');

        this.execClassName();

    },

    clearDiff: function () {
        if (this.markerList.leftList.length) {
            var s1 = this.leftEditor.edit.session;
            var s2 = this.rightEditor.edit.session;

            for (var ix = 0, ixLen = this.markerList.leftList.length; ix < ixLen; ix++) {

                s1.removeMarker(this.markerList.leftList[ix]);
                s2.removeMarker(this.markerList.rightList[ix]);

            }
        }
    },


    moveDiff: function (move) {

        var s1 = this.leftEditor.edit.session.getSelection().selectionLead;
//        var s2 = this.rightEditor.edit.session;
        var currentRow = s1.row;
        var tmpDiff;

        for (var ix = 0, ixLen = this.diffList.length; ix < ixLen; ix++) {

            if (this.diffList[ix] == currentRow) {

                this.currentDiff = ix;

            } else {
                if (ix > 0 && this.diffList[ix - 1] < currentRow && currentRow < this.diffList[ix]) {
                    this.currentDiff = ix - 1;
                }
            }
        }


        if (move === 'next') {

            if (this.diffList.length - 1 == this.currentDiff) {
                return;
            }
            this.currentDiff += 1;
            tmpDiff = this.diffList[this.currentDiff];
            s1.setPosition(tmpDiff);
//            this.leftEditor.edit.session.selection.moveCursorTo(tmpDiff, 0, true);


        } else {

            if (this.currentDiff == 0) {
                 return;
            }

            this.currentDiff -= 1;
            tmpDiff = this.diffList[this.currentDiff];
            s1.setPosition(tmpDiff);
//            this.leftEditor.edit.session.selection.moveCursorTo(tmpDiff, 0, true);

        }

    },

    leftDiffData: function (header, data) {

        if (header.success === false || !data) {
            this.sourceLeftArea.loadingMask.hide();

            console.debug('DiffSource-leftDiffData');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.leftEditor.setText(data.Values[0]);
        this.left_binary = data.Values[1];
        this.leftCallBackFlag = true;

        if (this.leftCallBackFlag && this.rightCallBackFlag) {
            this.diffSourceBtn.setDisabled(false);
        }

        this.sourceLeftArea.loadingMask.hide();

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;
        s1.ln = this.left_binary;
        s2.ln = this.right_binary;

        s1.on('changeScrollTop', function(){
            if ( Number(s1.ln) >= Number(s2.ln) ){
                s2.setScrollTop(s1.getScrollTop()) ;
            }
        } ) ;
        s2.on('changeScrollTop', function(){
            if ( Number(s1.ln) < Number(s2.ln) ){
                s1.setScrollTop(s2.getScrollTop()) ;
            }
        } ) ;
    },

    rightDiffData: function(header, data) {

        if (header.success === false || !data) {
            this.sourceRightArea.loadingMask.hide();

            console.debug('DiffSource-rightDiffData');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.rightEditor.setText(data.Values[0]);
        this.right_binary = data.Values[1] ;
        this.rightCallBackFlag = true;

        if (this.leftCallBackFlag && this.rightCallBackFlag) {
            this.diffSourceBtn.setDisabled(false);
        }

        this.sourceRightArea.loadingMask.hide();

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;
        s1.ln = this.left_binary;
        s2.ln = this.right_binary;

        s1.on('changeScrollTop', function(){
            if ( Number(s1.ln) >= Number(s2.ln) ){
                s2.setScrollTop(s1.getScrollTop()) ;
            }
        } ) ;
        s2.on( 'changeScrollTop', function(){
            if ( Number(s1.ln) < Number(s2.ln) ){
                s1.setScrollTop(s2.getScrollTop()) ;
            }
        }) ;



        //left - right
        //if ( s1.getScreenWidth() >= s2.getScreenWidth() ){
        //    s1.on('changeScrollLeft', function() {
        //        s2.setScrollLeft(s1.getScrollLeft())
        //    });
        //
        //    this.rightEditor.removeListener('setScrollLeft', function(){})
        //}else{
        //    s2.on('changeScrollLeft', function() {
        //        s1.setScrollLeft(s2.getScrollLeft())
        //    });
        //
        //    this.leftEditor.removeListener('setScrollLeft', function(){})
        //}  ;

    },


    diffData: function(header, data) {

        console.debug('########## DLL RECIEVE ==== >>> ', common.Util.getDate(new Date()) );

        if (header.success === false || !data) {
            this.nextDiffBtn.setDisabled(true);
            this.prevDiffBtn.setDisabled(true);
            this.diffSourceBtn.setDisabled(true);
            this.rightSourceArea.loadingMask.hide();

            console.debug('DiffSource-diffData');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.nextDiffBtn.setDisabled(false);
        this.prevDiffBtn.setDisabled(false);
        this.diffSourceBtn.setDisabled(false);

        if ( Object.keys(data).length == 0 ) {
            this.rightSourceArea.loadingMask.hide();
            return ;
        }
        this.leftEditor.setText(data.Values[1]);
        this.rightEditor.setText(data.Values[2]);


        var Range = ace.require('ace/range').Range;

        var s1 = this.leftEditor.edit.session;
        var s2 = this.rightEditor.edit.session;

        console.debug('DiffData  ==>>>  ', data);


//        s1.addMarker(new Range(3, 0, 4, 0), "aceEditor-add", "line");
//        s1.addMarker(new Range(4, 0, 5, 0), "aceEditor-modify", "line");
//        s2.addMarker(new Range(1, 0, 2, 0), "ace_active-line", "fullLine");


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

        this.leftEditor.setText(data.Values[1]);
        this.rightEditor.setText(data.Values[2]);

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

        this.nextDiffBtn.setDisabled(false);
        this.prevDiffBtn.setDisabled(false);
        this.diffSourceBtn.setDisabled(false);
        this.rightSourceArea.loadingMask.hide();


    },


    _makeJson: function(record, firstSecondFlag) {

        this.nextDiffBtn.setDisabled(true);
        this.prevDiffBtn.setDisabled(true);


        this.clearDiff();

        if (firstSecondFlag) {

            this.leftSourceOptions.was_id     = record['wasId'];
            this.leftSourceOptions.loadtime1  = record['loadDate'];
            this.leftSourceOptions.dbname = Comm.currentRepositoryInfo.database_name;
            this.leftSourceOptions.class_method = record['className'];

            this.diffCallOptions.was_id       = record['wasId'];
            this.diffCallOptions.loadtime1    = record['loadDate'];

        } else {

            this.rightSourceOptions.was_id2   = record['wasId'];
            this.rightSourceOptions.loadtime2 =record['loadDate'];
            this.rightSourceOptions.dbname = Comm.currentRepositoryInfo.database_name;
            this.rightSourceOptions.class_method = record['className'];

            this.diffCallOptions.was_id2      = record['wasId'];
            this.diffCallOptions.loadtime2    = record['loadDate'];
        }

        this.diffCallOptions.dbname = Comm.currentRepositoryInfo.database_name;
        this.diffCallOptions.class_method = record['className'];

    },

    selectRow: function(className) {

        this.leftCenterGrid.loadingMask.showMask();
        this.leftCenterGrid.clearRows();

        var dataset = {};

        dataset.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(new Date(this.datePicker.getFromDateTime()))
        }, {
            name : 'to_time',
            type : SQLBindType.STRING,
            value: common.Util.getDate(new Date(this.datePicker.getToDateTime()))
        }, {
            name : 'className',
            type : SQLBindType.STRING,
            value: className
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

        this.nextDiffBtn.setDisabled(true);
        this.prevDiffBtn.setDisabled(true);
        this.diffSourceBtn.setDisabled(true);

        this.leftCallBackFlag  = false;
        this.rightCallBackFlag = false;

        this.left_binary = 0 ;
        this.right_binary = 0 ;



        //this.leftCenterGrid.contextMenu.setDisableItem( 1, false ) ;


        this.leftSourceLabel.setText('');
        this.rightSourceLabel.setText('');

        this.leftEditor.setText('');
        this.rightEditor.setText('');

        this.leftTopGrid.clearRows();
        this.leftCenterGrid.clearRows();

        this.leftTopGrid.contextMenu.items.items[0].setText(common.Util.TR('Changed Source'));

        this.clearDiff();
        this._initOptionsObj();

        var dataset   = {};
        var classNameStr = '';
        var classNameVal = this.searchClass.getValue();
        var temp = '';

        if (classNameVal != '(All)') {

            temp = '';

            for (var ix = 0; ix < classNameVal.length; ix++) {
                if (ix != 0) {
                    temp += ', ';
                }
                temp += "'" + classNameVal[ix] + "'" ;
            }

            classNameVal = temp;

            classNameStr =
                'AND   class_name IN ( ' +
                classNameVal + ' ) ';
        }

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
            name : 'classSearch',
            value: classNameStr
        }];

        dataset.sql_file = this.sql.diff_first;
        WS.SQLExec(dataset, this.onData, this);

    },

    onData: function(header, data) {

        if(!common.Util.checkSQLExecValid(header, data)){
            this.loadingMask.hide();
            this.leftCenterGrid.loadingMask.hide();

            common.Util.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});

            console.debug('DiffSource-onData');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (data.rows.length == 0) {
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
                     ('WAS')
                     ('Load Date')
                     ('Binary Size
                     ('Source ID')
                     TR('Binary Si
                     */
                    this.leftCenterGrid.addRow([
                        dataRows[5]  // wasName
                        ,dataRows[0]  // time
                        ,dataRows[1].length / 2 //binary
                        ,dataRows[2]  // sourceId
                        ,dataRows[3]  // className
                        ,dataRows[6]  // wasId
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