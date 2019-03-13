/**
 * Created by jykim on 2015-12-07.
 */
Ext.override(Ext.grid.Panel, {

    downloadExcel: function() {
        var fileName = this.title;
        var filePath = location.pathname.split('/');
        var compressExcelData, tempExcelPartData;
        var compressExcelDataKeys;
        var startIndex, endIndex;
        var AJSON2, parameter;
        var key = Comm.config.login.login_id + common.Util.getUniqueSeq();      // dll에서 패킷 구분을 위한 키값
        var partLen = 200;                                                      // 패킷 하나당 파일 개수
        var ix, ixLen, jx, jxLen;

        // grid store 데이터를 이용하여 Excel 형식 파일 생성
        compressExcelData = this.generateExcelData();

        // 생성된 파일이 많을 경우 특정단위(default : 200)로 개수를 나누어서 dll로 전달
        compressExcelDataKeys = Object.keys(compressExcelData);
        for(ix = 0, ixLen = (compressExcelDataKeys.length < partLen ? 1 : Math.floor(compressExcelDataKeys.length / partLen) + 1); ix < ixLen; ix++){
            startIndex = ix * partLen;
            endIndex = (startIndex + partLen > compressExcelDataKeys.length ? compressExcelDataKeys.length : startIndex + partLen);

            tempExcelPartData = {};
            for(jx = startIndex, jxLen = endIndex; jx < jxLen; jx++){
                tempExcelPartData[compressExcelDataKeys[jx]] = compressExcelData[compressExcelDataKeys[jx]];
            }

            parameter = {};
            _.extend(parameter, tempExcelPartData);
            parameter.report_key = key;
            parameter.packet_count = compressExcelDataKeys.length;
            parameter.user_name = Comm.config.login.login_id;
            parameter.file_name = fileName + "-" + Ext.Date.format(new Date(), 'YmdHisms') + '.xlsx';
            parameter.root = filePath[1];

            AJSON2 = {};
            AJSON2['function']  = "mxg_ReportStream";
            AJSON2.dll_name     = "IntermaxPlugin.dll";
            AJSON2.options      = parameter;
            AJSON2.return_param = false;
            WS.PluginFunction( AJSON2 , this.onDownloadUrl , this);
        }

        compressExcelData = null;
        tempExcelPartData = null;
        parameter = null;
        AJSON2 = null;

        this.loadingMaskTimer = setTimeout(function() {
            this.exportCallback();
        }.bind(this), 15 * 1000);
    },

    onDownloadUrl: function(aHeader, aData){
        var gridEl, downloadEl;

        if(aData.result == "COMPLETE"){
            if(this.loadingMaskTimer){
                clearTimeout(this.loadingMaskTimer);
            }

            if (this.exportCallback != null) {
                this.exportCallback();
            }

            gridEl = this.getEl();
            downloadEl = Ext.DomHelper.append(gridEl, {
                tag: "a",
                download: null,
                href: aData.url
            });

            downloadEl.click();
            Ext.fly(downloadEl).destroy();
        }
    },

    generateExcelData: function(){
        var gridToExcelData = new Builder();
        var Workbook = gridToExcelData.createWorkbook();
        var dataSheet = Workbook.createWorksheet({name: this.title});
        var styleSheet = Workbook.getStyleSheet();
        var dataStore, columnList, dataList, data, column, columnsProp;
        var currentCellPos = 1;
        var ix, ixLen, jx, jxLen;
        var progressBarRef, progressBarYPos, progressBarXPos = -1;

        this.setStyleFormat(styleSheet);

        columnList = this.getColumnList();
        //dataStore = this.store;
        dataStore = this.exportStore;

        for(ix = 0, ixLen = columnList.length; ix < ixLen; ix++){
            column = columnList[ix];
            if(column.rendererType == RendererType.bar){
                progressBarXPos = ix + 1;
                progressBarYPos = currentCellPos + 2;
            }

            dataSheet.addData(currentCellPos, ix, {value: column.text, metadata:{style:this.styleFormat.tableColumns.id}});

            columnsProp = {};
            columnsProp.min = ix + 1;
            columnsProp.max = ix + 1;
            columnsProp.width = column.width / 5;
            dataSheet.setColumns(columnsProp);
        }

        currentCellPos += 1;

        for(ix = 0, ixLen = dataStore.data.items.length; ix < ixLen; ix++){
            dataList = dataStore.data.items[ix].data;
            for(jx = 0, jxLen = columnList.length; jx < jxLen; jx++){
                column = columnList[jx];
                data = dataList[column.dataIndex];
                if(!data && data != 0){
                    data = null;
                }
                else if(column.dataType == 'int' || column.dataType == 'float'){
                    data = Number(data);
                }

                if(column.rendererType == RendererType.bar){
                    dataSheet.addData(currentCellPos, jx, {value: data, metadata:{style:this.styleFormat.tableData_percent.id}});
                }
                else{
                    dataSheet.addData(currentCellPos, jx, {value: data, metadata:{style:this.getCellStyle(column.align, column.dataType)}});
                }
            }
            currentCellPos++;
        }

        if(progressBarXPos != -1){
            progressBarRef = util.positionToLetterRef(progressBarXPos, progressBarYPos) + ':' + util.positionToLetterRef(progressBarXPos, currentCellPos + 1);
            dataSheet.setConditionalFormatting(progressBarRef, 'dataBar', 'num', 0, 100, 'FF8ac449', false);
        }

        dataSheet.mergeCells(util.positionToLetterRef(1, 1), util.positionToLetterRef(1 + (columnList.length - 1), 1));
        dataSheet.addData(0, 0, {
            value: this.title,
            metadata: {style: this.styleFormat.title.id}
        });

        Workbook.addWorksheet(dataSheet);

        return gridToExcelData.createFile(Workbook);
    },

    getCellStyle: function(align, dataType){
        var cellStyleId;

        if(align == 'left'){
            switch (dataType){
                case 'int':
                    cellStyleId = this.styleFormat.tableData_alignLeft_int.id;
                    break;
                case 'float':
                    cellStyleId = this.styleFormat.tableData_alignLeft_float.id;
                    break;
                default :
                    cellStyleId = this.styleFormat.tableData_alignLeft.id;
                    break;
            }
        }
        else if(align == 'right'){
            switch (dataType){
                case 'int':
                    cellStyleId = this.styleFormat.tableData_alignRight_int.id;
                    break;
                case 'float':
                    cellStyleId = this.styleFormat.tableData_alignRight_float.id;
                    break;
                default :
                    cellStyleId = this.styleFormat.tableData_alignRight.id;
                    break;
            }
        }

        return cellStyleId;
    },

    getColumnList: function(){
        var columnList = [], column;
        var ix, ixLen;

        for(ix = 0, ixLen = this.columns.length; ix < ixLen; ix++){
            column = this.columns[ix];
            if(column.dataIndex != '' && !column.hidden){
                if(column.text !== ""){
                    columnList.push(column);
                }
            }
        }

        return columnList;
    },

    setStyleFormat: function(styleSheet){
        this.styleFormat = {};

        this.styleFormat.numFmt = styleSheet.createNumberFormatter('#,##0');            // 1000단위씩 콤마로 구분
        this.styleFormat.numFmtFloat = styleSheet.createNumberFormatter('#,##0.000');   // 1000단위씩 콤마로 구분, 소수점 세자리까지 표시
        this.styleFormat.numFmtPercent = styleSheet.createNumberFormatter('0.0"%"');    // 셀의 값에 %를 붙여줌

        // 셀의 선 스타일
        this.styleFormat.border = styleSheet.createBorderFormatter({
            bottom: {color: '474a53', style: 'thin'},
            top: {color: '474a53', style: 'thin'},
            left: {color: '474a53', style: 'thin'},
            right: {color: '474a53', style: 'thin'}
        });

        // 셀의 바탕색 스타일(컬럼명)
        this.styleFormat.fill_column = styleSheet.createFill({
            type : 'pattern',
            patternType : 'solid',
            bgColor : {
                rgb : '5B9BD5'
            },
            fgColor : {
                rgb : '5B9BD5'
            }
        });

        // 셀의 바탕색 스타일(Peak Time Comparison)
        this.styleFormat.fill_diff = styleSheet.createFill({
            type : 'pattern',
            patternType : 'solid',
            bgColor : {
                rgb : 'DCEFFF'
            },
            fgColor : {
                rgb : 'DCEFFF'
            }
        });

        // 글자 크기 : 10
        this.styleFormat.font10 = styleSheet.createFontStyle({
            size: 10,
            fontName: 'Courier New'
        });

        // 글자 크기 : 10, 진하게, 글자색 : 흰색
        this.styleFormat.font10BC = styleSheet.createFontStyle({
            bold : true,
            size: 10,
            color : 'ffffff',
            fontName: 'Courier New'
        });

        // 제목 스타일
        this.styleFormat.title = styleSheet.createFormat({
            font : {
                size : 26,
                fontName: 'Courier New'
            },
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });

        // 그리드 컬럼 스타일
        this.styleFormat.tableColumns = styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : '1'
            }
        });
        this.styleFormat.tableColumns.fontId = this.styleFormat.font10BC.id;
        this.styleFormat.tableColumns.fillId = this.styleFormat.fill_column.id;
        this.styleFormat.tableColumns.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬)
        this.styleFormat.tableData_alignLeft = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시)
        this.styleFormat.tableData_alignLeft_int = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft_int.numFmtId = this.styleFormat.numFmt.id;
        this.styleFormat.tableData_alignLeft_int.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft_int.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시 및 소수점 세자리까지 표시)
        this.styleFormat.tableData_alignLeft_float = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft_float.numFmtId = this.styleFormat.numFmtFloat.id;
        this.styleFormat.tableData_alignLeft_float.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft_float.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(오른쪽 정렬)
        this.styleFormat.tableData_alignRight = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시)
        this.styleFormat.tableData_alignRight_int = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight_int.numFmtId = this.styleFormat.numFmt.id;
        this.styleFormat.tableData_alignRight_int.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight_int.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시 및 소수점 세자리까지 표시)
        this.styleFormat.tableData_alignRight_float = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight_float.numFmtId = this.styleFormat.numFmtFloat.id;
        this.styleFormat.tableData_alignRight_float.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight_float.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(오른쪽 정렬, 퍼센트 표시)
        this.styleFormat.tableData_percent =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_percent.numFmtId = this.styleFormat.numFmtPercent.id;
        this.styleFormat.tableData_percent.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_percent.borderId = this.styleFormat.border.id;
    }

});

Ext.override(Ext.tree.Panel, {

    downloadExcel: function() {
        var fileName = this.title;
        var filePath = location.pathname.split('/');
        var compressExcelData, tempExcelPartData;
        var compressExcelDataKeys;
        var startIndex, endIndex;
        var AJSON2, parameter;
        var key = Comm.config.login.login_id + common.Util.getUniqueSeq();
        var partLen = 200;
        var ix, ixLen, jx, jxLen;

        compressExcelData = this.generateExcelData();

        compressExcelDataKeys = Object.keys(compressExcelData);
        for(ix = 0, ixLen = (compressExcelDataKeys.length < partLen ? 1 : Math.floor(compressExcelDataKeys.length / partLen) + 1); ix < ixLen; ix++){
            startIndex = ix * partLen;
            endIndex = (startIndex + partLen > compressExcelDataKeys.length ? compressExcelDataKeys.length : startIndex + partLen);

            tempExcelPartData = {};
            for(jx = startIndex, jxLen = endIndex; jx < jxLen; jx++){
                tempExcelPartData[compressExcelDataKeys[jx]] = compressExcelData[compressExcelDataKeys[jx]];
            }

            parameter = {};
            _.extend(parameter, tempExcelPartData);
            parameter.report_key = key;
            parameter.packet_count = compressExcelDataKeys.length;
            parameter.user_name = Comm.config.login.login_id;
            parameter.file_name = fileName + "-" + Ext.Date.format(new Date(), 'YmdHisms') + '.xlsx';
            parameter.root = filePath[1];

            AJSON2 = {};
            AJSON2['function']  = "mxg_ReportStream";
            AJSON2.dll_name     = "IntermaxPlugin.dll";
            AJSON2.options      = parameter;
            AJSON2.return_param = false;
            WS.PluginFunction( AJSON2 , this.onDownloadUrl , this);
        }

        compressExcelData = null;
        tempExcelPartData = null;
        parameter = null;
        AJSON2 = null;

        this.loadingMaskTimer = setTimeout(function() {
            this.exportCallback();
        }.bind(this), 15 * 1000);
    },

    onDownloadUrl: function(aHeader, aData){
        var gridEl, downloadEl;

        if(aData.result == "COMPLETE"){
            if(this.loadingMaskTimer){
                clearTimeout(this.loadingMaskTimer);
            }

            if (this.exportCallback != null) {
                this.exportCallback();
            }

            gridEl = this.getEl();

            downloadEl = Ext.DomHelper.append(gridEl, {
                tag: "a",
                download: null,
                href: aData.url
            });

            downloadEl.click();
            Ext.fly(downloadEl).destroy();
        }
    },

    generateExcelData: function(){
        var gridToExcelData = new Builder();
        var Workbook = gridToExcelData.createWorkbook();
        var dataSheet = Workbook.createWorksheet({name: this.title});
        var styleSheet = Workbook.getStyleSheet();
        var dataStore, columnList, column;
        var currentCellPos = 1;
        var columnCellPos = 0;
        var progressBarRef;
        var ix, ixLen, xPos;

        this.setStyleFormat(styleSheet);

        columnList = this.getColumnList();
        columnCellPos = currentCellPos;
        currentCellPos++;

        dataStore = this.store;
        currentCellPos = this.setTreeDataToDataSheet(dataStore.getRootNode().childNodes, columnList, dataSheet, currentCellPos);

        xPos = 0;
        for(ix = 0, ixLen = columnList.length; ix < ixLen; ix++){
            column = columnList[ix];
            if(column.xtype == 'exemtreecolumn' || column.xtype == 'treecolumn'){
                dataSheet.addData(columnCellPos, xPos, {value: column.text, metadata:{style:this.styleFormat.tableColumns.id}});
            }
            else{
                dataSheet.addData(columnCellPos, xPos, {value: column.text, metadata:{style:this.styleFormat.tableColumns.id}});
                if(column.rendererType == RendererType.bar){
                    progressBarRef = util.positionToLetterRef(xPos + 1, columnCellPos + 1) + ':' + util.positionToLetterRef(xPos + 1, currentCellPos + 1);
                    dataSheet.setConditionalFormatting(progressBarRef, 'dataBar', 'num', 0, 100, 'FF8ac449', false);
                }
            }

            this.setColumnWidth(dataSheet, column, xPos, xPos);
            xPos++;
        }

        dataSheet.mergeCells(util.positionToLetterRef(1, 1), util.positionToLetterRef(1 + (columnList.length - 1), 1));
        dataSheet.addData(0, 0, {
            value: this.title,
            metadata: {style: this.styleFormat.title.id}
        });

        Workbook.addWorksheet(dataSheet);

        return gridToExcelData.createFile(Workbook);
    },

    getCellStyle: function(align, dataType){
        var cellStyleId;

        if(align == 'left'){
            switch (dataType){
                case 'int':
                    cellStyleId = this.styleFormat.tableData_alignLeft_int.id;
                    break;
                case 'float':
                    cellStyleId = this.styleFormat.tableData_alignLeft_float.id;
                    break;
                default :
                    cellStyleId = this.styleFormat.tableData_alignLeft.id;
                    break;
            }
        }
        else if(align == 'right'){
            switch (dataType){
                case 'int':
                    cellStyleId = this.styleFormat.tableData_alignRight_int.id;
                    break;
                case 'float':
                    cellStyleId = this.styleFormat.tableData_alignRight_float.id;
                    break;
                default :
                    cellStyleId = this.styleFormat.tableData_alignRight.id;
                    break;
            }
        }

        return cellStyleId;
    },

    setColumnWidth: function(dataSheet, column, min, max){
        var columnsProp = {};
        columnsProp.min = min + 1;
        columnsProp.max = max + 1;
        //columnsProp.width = (column.xtype == 'exemtreecolumn') ? 100 : (column.width / 10) + 3;
        columnsProp.width = (column.width / 10) + 3;
        dataSheet.setColumns(columnsProp);
    },

    setTreeDataToDataSheet: function(nodeList, columnList, dataSheet, cellPos){
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var dataList, data, column, depth, xPos;
        var currentCellPos = cellPos;

        for(ix = 0, ixLen = nodeList.length; ix < ixLen; ix++){
            dataList = nodeList[ix].data;
            depth = dataList.depth - 1;

            xPos = 0;
            for(jx = 0, jxLen = columnList.length; jx < jxLen; jx++){
                column = columnList[jx];
                data = dataList[column.dataIndex];
                if(!data && data != 0){
                    data = null;
                }
                else if(column.dataType == 'int' || column.dataType == 'float'){
                    data = Number(data);
                }

                if(column.xtype == 'exemtreecolumn' || column.xtype == 'treecolumn'){
                    for(kx = 0, kxLen = depth; kx < kxLen; kx++){
                        data = ' ' + data;
                    }
                }

                if(column.rendererType == RendererType.bar){
                    dataSheet.addData(currentCellPos, xPos, {value: data, metadata:{style:this.styleFormat.tableData_percent.id}});
                }
                else{
                    dataSheet.addData(currentCellPos, xPos, {value: data, metadata:{style:this.getCellStyle(column.align, column.dataType)}});
                }

                xPos++;
            }

            currentCellPos++;

            if(nodeList[ix].childNodes.length){
                currentCellPos = this.setTreeDataToDataSheet(nodeList[ix].childNodes, columnList, dataSheet, currentCellPos);
            }
        }

        return currentCellPos;
    },

    getColumnList: function(){
        var columnList = [], column;
        var ix, ixLen;

        for(ix = 0, ixLen = this.columns.length; ix < ixLen; ix++){
            column = this.columns[ix];
            if(column.dataIndex != '' && !column.hidden){
                if(column.text !== ""){
                    columnList.push(column);
                }
            }
        }

        return columnList;
    },

    setStyleFormat: function(styleSheet){
        this.styleFormat = {};

        this.styleFormat.numFmt = styleSheet.createNumberFormatter('#,##0');            // 1000단위씩 콤마로 구분
        this.styleFormat.numFmtFloat = styleSheet.createNumberFormatter('#,##0.000');   // 1000단위씩 콤마로 구분, 소수점 세자리까지 표시
        this.styleFormat.numFmtPercent = styleSheet.createNumberFormatter('0.0"%"');    // 셀의 값에 %를 붙여줌

        // 셀의 선 스타일
        this.styleFormat.border = styleSheet.createBorderFormatter({
            bottom: {color: '474a53', style: 'thin'},
            top: {color: '474a53', style: 'thin'},
            left: {color: '474a53', style: 'thin'},
            right: {color: '474a53', style: 'thin'}
        });

        // 셀의 선 스타일(오른쪽 선만)
        this.styleFormat.borderRight = styleSheet.createBorderFormatter({
            right: {color: '474a53', style: 'thin'}
        });

        // 셀의 바탕색 스타일
        this.styleFormat.fill_column = styleSheet.createFill({
            type : 'pattern',
            patternType : 'solid',
            bgColor : {
                rgb : '5B9BD5'
            },
            fgColor : {
                rgb : '5B9BD5'
            }
        });

        // 글자 크기 : 10
        this.styleFormat.font10 = styleSheet.createFontStyle({
            size: 10,
            fontName: 'Courier New'
        });

        // 글자 크기 : 10, 진하게, 글자색 : 흰색
        this.styleFormat.font10BC = styleSheet.createFontStyle({
            bold : true,
            size: 10,
            color : 'ffffff',
            fontName: 'Courier New'
        });

        // 제목 스타일
        this.styleFormat.title = styleSheet.createFormat({
            font : {
                size : 26,
                fontName: 'Courier New'
            },
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });

        // 부제목 스타일
        this.styleFormat.subTitle = styleSheet.createFormat({
            font : {
                size : 12,
                fontName : 'Courier New',
                color : '5B9BD5',
                bold : true
            },
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });

        // 그리드 컬럼 스타일
        this.styleFormat.tableColumns =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : '1'
            }
        });
        this.styleFormat.tableColumns.fontId = this.styleFormat.font10BC.id;
        this.styleFormat.tableColumns.fillId = this.styleFormat.fill_column.id;
        this.styleFormat.tableColumns.borderId = this.styleFormat.border.id;

// 그리드 값 스타일(왼쪽 정렬)
        this.styleFormat.tableData_alignLeft = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시)
        this.styleFormat.tableData_alignLeft_int = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft_int.numFmtId = this.styleFormat.numFmt.id;
        this.styleFormat.tableData_alignLeft_int.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft_int.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시 및 소수점 세자리까지 표시)
        this.styleFormat.tableData_alignLeft_float = styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignLeft_float.numFmtId = this.styleFormat.numFmtFloat.id;
        this.styleFormat.tableData_alignLeft_float.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignLeft_float.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(오른쪽 정렬)
        this.styleFormat.tableData_alignRight = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시)
        this.styleFormat.tableData_alignRight_int = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight_int.numFmtId = this.styleFormat.numFmt.id;
        this.styleFormat.tableData_alignRight_int.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight_int.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(왼쪽 정렬, 1000단위 표시 및 소수점 세자리까지 표시)
        this.styleFormat.tableData_alignRight_float = styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_alignRight_float.numFmtId = this.styleFormat.numFmtFloat.id;
        this.styleFormat.tableData_alignRight_float.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_alignRight_float.borderId = this.styleFormat.border.id;

        // 그리드 값 스타일(오른쪽 정렬, 퍼센트 표시)
        this.styleFormat.tableData_percent =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center'
            }
        });
        this.styleFormat.tableData_percent.numFmtId = this.styleFormat.numFmtPercent.id;
        this.styleFormat.tableData_percent.fontId = this.styleFormat.font10.id;
        this.styleFormat.tableData_percent.borderId = this.styleFormat.border.id;
    }
});