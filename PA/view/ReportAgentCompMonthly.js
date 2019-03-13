/**
 * Created by jykim on 2016-06-07.
 */
Ext.define("view.ReportAgentCompMonthly", {
    extend: 'Exem.ReportBaseForm',
    layout: 'fit',
    flex: 1,
    width: '100%',
    height: '100%',
    bodyLayout: 'hbox',
    DisplayTime: DisplayTimeMode.None,
    useDocumentType: false,
    usePageDirectionBtn: false,
    isAgentCompMonthly: true,
    useExcludeWeekend : true,
    innerInit: function () {
        this.regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

        this.monthlySummaryStatList = [
            common.Util.CTR('Execution Count'),
            common.Util.CTR('Elapse Time (AVG)'),
            common.Util.CTR('TPS(INPUT)'),
            common.Util.CTR('Concurrent Users'),
            common.Util.CTR('OS CPU (%)'),
            common.Util.CTR('JVM Used Heap (MB)')
        ];

        this.dailySummaryStatList = [
            common.Util.CTR('Execution Count'),
            common.Util.CTR('Elapse Time (AVG)'),
            common.Util.CTR('TPS(INPUT)'),
            common.Util.CTR('Active Transactions'),
            common.Util.CTR('Concurrent Users'),
            common.Util.CTR('OS CPU (%)'),
            common.Util.CTR('JVM CPU Usage (%)'),
            common.Util.CTR('JVM Used Heap (MB)'),
            common.Util.CTR('Active DB Connections'),
            common.Util.CTR('Exception')
        ];

        this.addSerparator(this.bodyContainer);

        this.wasArea = this.createArea(common.Util.TR('Agent List'), this.bodyContainer);
        this.addAgentComponent(this.wasArea);
        this.addSerparator(this.bodyContainer);

        this.monitorTypeSQL = this.sql[this.monitorType];
    },

    onWasData: function(type, data){
        var wasData, summaryData,
            recvData, rowData, detailData, tempData,
            ix, ixLen, jx, jxLen, kx, kxLen,
            index, indexLen, dataCnt;

        wasData = this.agentSummaryData;
        summaryData = this.monthlySummaryData;

        for(index = 0, indexLen = data.length ? data.length : 1; index < indexLen; index++){
            recvData = indexLen === 1 ? data.rows : data[index].rows;
            switch(index){
                case 0: /** 선택된 에이전트 및 통계 데이터 **/
                    for(ix = 0, ixLen = recvData.length; ix < ixLen; ix++){
                        rowData = recvData[ix];
                        for(jx = 0, jxLen = summaryData.length; jx < jxLen; jx++){
                            tempData = summaryData[jx];
                            if(tempData.wasName === rowData[0]){
                                break;
                            }
                        }

                        // 에이전트 데이터가 존재하지 않는다면 새로운 객체를 생성한다.
                        // 존재한다면 해당 인덱스의 값을 참조한다.
                        if(jx === jxLen){
                            summaryData[jx] = {};
                            summaryData[jx].wasName = rowData[0];
                        }

                        // 검색 연/월별 데이터를 분류한다.
                        if(type === 'compare'){
                            summaryData[jx].compareData = rowData;
                        }
                        else{
                            summaryData[jx].fixedData = rowData;
                        }
                    }

                    break;
                case 1: /** 선택된 에이전트 및 하루 단위 데이터 **/
                    dataCnt = 0;
                    for(ix = 0, ixLen = recvData.length; ix < ixLen; ix++){
                        rowData = recvData[ix];

                        // 첫 번재 인덱스의 경우는 데이터가 없으므로 객체생성 및 초기화를 진행한다.
                        if(ix == 0){
                            tempData = [];
                            wasData[dataCnt] = {};
                            wasData[dataCnt].wasName = rowData[1];
                            wasData[dataCnt].detailData = [];
                        }

                        // 데이터중에서 하나의 에이전트 데이터를 임시로 저장하다가 다른 에이전트 데이터를 처음 만나게 되면
                        // 임시로 가지고 있던 에이전트 데이터를 저장하고 새로운 객체생성 및 초기화를 진행한다.
                        if(wasData[dataCnt].wasName != rowData[1]) {
                            wasData[dataCnt].detailData = tempData;
                            dataCnt++;
                            tempData = [];
                            wasData[dataCnt] = {};
                            wasData[dataCnt].wasName = rowData[1];
                            wasData[dataCnt].detailData = [];
                        }

                        rowData.splice(1,1);
                        tempData.push(rowData);
                    }

                    if(recvData.length > 0){
                        wasData[dataCnt].detailData = tempData;
                    }
                    break;
                case 2: /** 선택된 에이전트 및 하루 단위 예외 데이터 **/
                    // 예외 데이터를 만들어둔 하루 단위 지표 데이터에 해당 에이전트 별로 찾아서 저장한다.
                    for(ix = 0, ixLen = recvData.length; ix < ixLen; ix++){
                        rowData = recvData[ix];
                        for(jx = 0, jxLen = wasData.length; jx < jxLen; jx++){
                            tempData = wasData[jx];
                            if(rowData[1] === tempData.wasName){
                                for(kx = 0, kxLen = tempData.detailData.length; kx < kxLen; kx++){
                                    detailData = tempData.detailData[kx];
                                    if(+new Date(rowData[0]) === +new Date(detailData[0])){
                                        detailData.push(+rowData[2]);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    break;
                default :
                    break;
            }
        }
    },

    onMonthlyWasData: function(aHeader, aData){
        var isValid, percent,
            command = aHeader.command,
            self = this.scope;

        self.executeCount--;

        isValid = common.Util.checkSQLExecValid(aHeader, aData);
        if(isValid){
            switch (command){
                case self.monitorTypeSQL.agent_report.agent_comp_monthly_report_summary:
                case self.monitorTypeSQL.agent_report.agent_comp_monthly_compare_summary:
                case self.monitorTypeSQL.agent_report.agent_comp_monthly_report_summary_time_window:
                case self.monitorTypeSQL.agent_report.agent_comp_monthly_compare_summary_time_window:
                    self.onWasData(this.type, aData);
                    break;
                default :
                    break;
            }
        }
        else{
            self.failList.push(command);

            console.warn('ReportAgentMonthly-onMonthlyWasData');
            console.warn(aHeader);
            console.warn(aData);
        }

        self.currentProgressCnt++;

        percent = (self.currentProgressCnt / self.totalProgressCnt)*100;
        if(percent < 5){
            percent = 5;
        }
        // instance process
        self.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Processing')+'.';
        // % size
        self.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width   = (percent > 95 ? '95' :  percent.toFixed(0)) + '%';
        // % text
        self.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML = (percent > 95 ? '95' :  percent.toFixed(0)) + '%';
        // 진행률.(1/4)
        self.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '0 / 1';

        if (self.executeCount == 0) {
            if (self.failList.length == 0) {
                self.downLoadFile();
            }
            else {
                // instance process
                self.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Failed')+'.';
                // % size
                self.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width   = '100%';
                // % text
                self.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML = '100%';
                // 진행률.(1/4)
                self.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '1 / 1';

                self.processClose();
            }
        }

    },

    executeMonthlyWasData: function(type, execParams){
        var dataSet = {},
            fromTime, toTime;

        if(type === 'compare'){
            fromTime = execParams.compareFromTime;
            toTime = execParams.compareToTime;
            dataSet.sql_file = this.monitorTypeSQL.agent_report.agent_comp_monthly_compare_summary;
        }
        else{
            fromTime = execParams.fixedFromTime;
            toTime = execParams.fixedToTime;
            dataSet.sql_file = this.monitorTypeSQL.agent_report.agent_comp_monthly_report_summary;
        }

        if(execParams.isExcludeWeekend){
            switch(Comm.currentRepositoryInfo.database_type) {
                case 'PostgreSQL' :
                    execParams.excludeWeekend =
                        'and to_char(:time_col, \'yyyy-mm-dd\') in (select to_char(the_day, \'yyyy-mm-dd\') from generate_series(timestamp ' + fromTime + ', timestamp ' +toTime + ', interval \'1 day\') the_day where extract(\'ISODOW\' from the_day) < 6)';
                    break;
                case 'Oracle' :
                    execParams.excludeWeekend =
                        'and to_char(:time_col, \'yyyy-mm-dd\') in (select dt from (select to_char(sdt + level - 1, \'yyyy-mm-dd\') dt, to_char(sdt+ level -1 , \'d\') d from (select to_date(' + fromTime +', \'yyyy-mm-dd hh24:mi:ss\') sdt, to_date(' + toTime + ', \'yyyy-mm-dd hh24:mi:ss\') edt from dual) connect by level <= edt - sdt + 1) where d not in (\'1\', \'7\'))';
                    break;
                case 'MSSQL' :
                    execParams.excludeWeekend =
                        'and ((DATEPART(dw, convert(nvarchar(19), :time_col, 120)) + @@DATEFIRST) % 7) NOT IN (0, 1)';
                    break;
                default :
                    execParams.excludeWeekend = '';
                    break;
            }
        }
        else {
            execParams.excludeWeekend = '';
        }

        dataSet.replace_string = [{
            name: "was_id",
            value: execParams.was_id_str
        },{
            name: "from_time",
            value: fromTime
        },{
            name: "to_time",
            value: toTime
        },{
            name: 'exclude_weekend_log_time',
            value : execParams.excludeWeekend.replace(/:time_col/gi, 'log_time')
        },{
            name: 'exclude_weekend_time',
            value : execParams.excludeWeekend.replace(/:time_col/gi, 'time')
        }];

        if(execParams.isTimeWindowChecked){
            if(type === 'compare'){
                dataSet.sql_file = this.monitorTypeSQL.agent_report.agent_comp_monthly_compare_summary_time_window;
            }
            else {
                dataSet.sql_file = this.monitorTypeSQL.agent_report.agent_comp_monthly_report_summary_time_window;
            }

            dataSet.replace_string.push({
                name: "time_window_from",
                value: execParams.from_time_window
            },{
                name: "time_window_to",
                value: execParams.to_time_window
            });
        }

        WS.SQLExec(dataSet, this.onMonthlyWasData, {
            scope: this,
            type: type
        });

        this.executeCount++;
    },

    executeAgentCompMonthly: function(execInfo){
        var ix, ixLen,
            was_ids,
            execParams;

        if(!execInfo) {
            return;
        }

        this.monthlySummaryData = [];
        this.agentSummaryData = [];

        this.executeCount = 0;
        this.totalProgressCnt = 2;
        this.currentProgressCnt = 0;

        this.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Processing')+'.';

        was_ids = [];
        for(ix = 0, ixLen = this.agentList.length; ix < ixLen; ix++){
            was_ids.push(this.agentList[ix].wasId);
        }

        execParams = {};
        execParams.was_id_str = was_ids.join(',');

        execParams.fixedFromTime = '\'' + execInfo.fixedFromTime + '\'';
        execParams.fixedToTime = '\'' + execInfo.fixedToTime + '\'';
        execParams.compareFromTime = '\'' + execInfo.compareFromTime + '\'';
        execParams.compareToTime = '\'' + execInfo.compareToTime + '\'';

        if(execInfo.isTimeWindowChecked){
            execParams.from_time_window = '\'' + execInfo.from_time_window + '\'';
            execParams.to_time_window = '\'' + execInfo.to_time_window + '\'';
            execParams.isTimeWindowChecked = execInfo.isTimeWindowChecked;
        }

        if(execInfo.isExcludeWeekend){
            execParams.isExcludeWeekend = execInfo.isExcludeWeekend;
        }

        this.executeMonthlyWasData('fixed', execParams);
        this.executeMonthlyWasData('compare', execParams);
    },

    setReportSheetHeader: function(sheet, cellPos){
        var xPos = 0,
            ix, ixLen,
            fromHour, toHour,
            currentCellPos, retrieveCellPos;

        retrieveCellPos = cellPos;

        sheet.mergeCells('A1', 'AD2');
        sheet.addData(retrieveCellPos, xPos, {value : common.Util.TR('Monthly System Performance'), metadata: { style:this.styleFormat.subTitle.id }});
        retrieveCellPos += this.excelPositionMargin.sheetTitle;
        retrieveCellPos += this.excelPositionMargin.default;

        sheet.mergeCells('A' + (retrieveCellPos + 1), 'N' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : common.Util.TR('Search Condition'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        for(ix = 1; ix < 14; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        }

        sheet.setRowInstructions(retrieveCellPos, {height: 35});
        retrieveCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (retrieveCellPos + 1), 'G' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : common.Util.TR('Fixed Date'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
        }

        sheet.mergeCells('H' + (retrieveCellPos + 1), 'N' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : Ext.util.Format.date(this.execInfo.fixedFromTime, 'Y-m'), metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        retrieveCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (retrieveCellPos + 1), 'G' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : common.Util.TR('Compare Date'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
        }

        sheet.mergeCells('H' + (retrieveCellPos + 1), 'N' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : Ext.util.Format.date(this.execInfo.compareFromTime, 'Y-m'), metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        retrieveCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (retrieveCellPos + 1), 'G' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : common.Util.TR('Operating Time'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
        }

        if(this.execInfo.isTimeWindowChecked){
            fromHour = this.execInfo.from_time_window;
            toHour = this.execInfo.to_time_window;
        }
        else {
            fromHour = Ext.util.Format.date(this.execInfo.fixedFromTime, 'H:i');
            toHour = Ext.util.Format.date(this.execInfo.fixedToTime, 'H:i');
        }

        sheet.mergeCells('H' + (retrieveCellPos + 1), 'N' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : fromHour + ' ~ ' + toHour, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        retrieveCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (retrieveCellPos + 1), 'G' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : common.Util.CTR('Agent'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
        }

        var wasName = this.agentList.length > 1 ? this.agentList[0].wasName + common.Util.TR(' and other %1 agent', this.agentList.length - 1) : this.agentList[0].wasName;

        sheet.mergeCells('H' + (retrieveCellPos + 1), 'N' + (retrieveCellPos + 1));
        sheet.addData(retrieveCellPos, xPos++, {value : wasName, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(retrieveCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        retrieveCellPos += this.excelPositionMargin.default;
        currentCellPos = retrieveCellPos;

        for(ix = cellPos + this.excelPositionMargin.sheetTitle + this.excelPositionMargin.default + this.excelPositionMargin.default, ixLen = currentCellPos + 1; ix < ixLen; ix++){
            sheet.setRowInstructions(ix, {height: 30});
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    calculateRate: function(compareValue,fixedValue){
        var denominator, numerator, increasesRate;

        if(fixedValue == null || compareValue == null){
            return '0%';
        }

        //numerator =  compareValue - fixedValue;
        numerator =  (compareValue || 0) - (fixedValue || 0);
        denominator = (fixedValue) || 1;
        increasesRate = (numerator / denominator) * 100;

        return increasesRate.toFixed(0) + '%';
    },

    setMonthlySummaryToSheet: function(dataSheet, cellPos){
        var xPos = 0, xTempPos,
            mergeCellCnt = 4,
            currentCellPos = cellPos,
            ix, ixLen, jx, jxLen, kx, kxLen, index,
            statName, statValue, increaseRate,
            summaryData, compareData, fixedData,
            fixedDate, compareDate;

        // 데이터가 존재하지 않을 시 결과 없음을 표시하고 빠져나간다
        if(this.monthlySummaryData.length < 1){
            dataSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;
            return currentCellPos;
        }

        // 표의 컬럼 값을 설정한다 (에이전트만 다른 컬럼과 다르게 2줄을 병합하므로 따로 처리 해준다)
        // 병합된 셀의 경우 한 셀에만 데이터가 들어가도 데이터가 보이나 스타일은 각각의 셀에 적용을 해줘야 표시된다.
        dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
        for(ix = 0; ix < 2; ix++){
            dataSheet.addData(currentCellPos + ix, xPos, {value : common.Util.CTR('Agent'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            for(jx = 1; jx < mergeCellCnt; jx++){
                dataSheet.addData(currentCellPos + ix, xPos + jx, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            }
        }

        xPos += mergeCellCnt;

        // 표의 컬럼 값을 설정한다. (지표명을 표시한다)
        for(ix = 0, ixLen = this.monthlySummaryStatList.length; ix < ixLen; ix++){
            dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt * 2, currentCellPos + 1));
            statName = this.monthlySummaryStatList[ix];
            if(ix == 0){
                statName += '\n' + common.Util.TR('( SUM / AVG / MAX )');
            }
            else{
                statName += '\n' + common.Util.TR('( AVG / MAX )');
            }

            dataSheet.addData(currentCellPos, xPos++, {value : statName, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            for(jx = 1, jxLen = mergeCellCnt * 2; jx < jxLen; jx++){
                dataSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            }
        }

        dataSheet.setRowInstructions(currentCellPos, {height: 35});
        currentCellPos++;
        xPos = mergeCellCnt;

        fixedDate = Ext.util.Format.date(this.execInfo.fixedFromTime, 'Y-m');
        compareDate = Ext.util.Format.date(this.execInfo.compareFromTime, 'Y-m');

        // 표의 컬럼 값을 설정한다. (기준월/비교월을 표시한다)
        for(ix = 0, ixLen = this.monthlySummaryStatList.length * 2; ix < ixLen; ix++){
            dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
            if(ix % 2){
                statName = compareDate;
            }
            else{
                statName = fixedDate;
            }

            dataSheet.addData(currentCellPos, xPos++, {value : statName, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            for(jx = 1, jxLen = mergeCellCnt; jx < jxLen; jx++){
                dataSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            }
        }

        dataSheet.setRowInstructions(currentCellPos, {height: 25});
        currentCellPos++;
        xPos = 0;

        for(ix = 0, ixLen = this.monthlySummaryData.length; ix < ixLen; ix++){
            index = 1;
            summaryData = this.monthlySummaryData[ix];
            // 지표별로 기준월/비교월 데이터를 보여주므로 지표 개수에 *2를 하고 에이전트 표시를 위한 개수를 더해준다.
            for(jx = 0, jxLen = this.monthlySummaryStatList.length * 2 + 1; jx < jxLen; jx++){
                if(jx === 0){
                    statValue = summaryData.wasName;
                    dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 2), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
                    dataSheet.addData(currentCellPos + 1, xPos, {value : common.Util.TR('Increase Rate'), metadata: { style:this.styleFormat.alignCenter.id }});
                    for(kx = 1, kxLen = mergeCellCnt; kx < kxLen; kx++){
                        dataSheet.addData(currentCellPos + 1, xPos + kx, {value : null, metadata: { style:this.styleFormat.alignCenter.id }});
                    }
                }
                else if(jx % 2){
                    fixedData = summaryData.fixedData;
                    if(!fixedData){
                        statValue = common.Util.TR('No Result');
                    }
                    else{
                        if(jx !== 1){
                            // 평균/최대 값을 1000단위 구분 콤마를 넣어주고 '/' 구분자를 이용하여 하나의 문자열로 만든다.
                            statValue = common.Util.numberWithComma(fixedData[index]) + '/' + common.Util.numberWithComma(fixedData[index + 1]);
                        }
                        else{
                            // 전체/평균/최대 값을 1000단위 구분 콤마를 넣어주고 '/' 구분자를 이용하여 하나의 문자열로 만든다.
                            statValue = common.Util.numberWithComma(fixedData[index]) + '/' + common.Util.numberWithComma(fixedData[index + 1]) + '/' + common.Util.numberWithComma(fixedData[index + 2]);
                        }
                    }
                }
                else{
                    compareData = summaryData.compareData;
                    if(!compareData){
                        statValue = common.Util.TR('No Result');
                        if(jx !== 2){
                            increaseRate = '0%/0%';
                        }
                        else{
                            increaseRate = '0%/0%/0%';
                        }
                    }
                    else{
                        if(jx !== 2){
                            // 보여줄 지표별 데이터에 접근하여 문자열을 만든다.
                            statValue = common.Util.numberWithComma(compareData[index]) + '/' + common.Util.numberWithComma(compareData[index + 1]);
                            // 기준월/비교월의 데이터의 증감률을 계산하여 문자열을 만든다. (증감율은 기준월/비교월을 가지고 계산하므로 두 데이터를 표시하는 공간을 합쳐서 사용한다)
                            if(fixedData){
                                increaseRate = this.calculateRate(compareData[index], fixedData[index]) + '/' + this.calculateRate(compareData[index + 1], fixedData[index + 1]);
                            }
                            else{
                                increaseRate = '0%/0%';
                            }

                            index += 2;
                        }
                        else{
                            statValue = common.Util.numberWithComma(compareData[index]) + '/' + common.Util.numberWithComma(compareData[index + 1]) + '/' + common.Util.numberWithComma(compareData[index + 2]);
                            if(fixedData){
                                increaseRate = this.calculateRate(compareData[index], fixedData[index]) + '/' + this.calculateRate(compareData[index + 1], fixedData[index + 1]) +
                                    '/' + this.calculateRate(compareData[index + 2], fixedData[index + 2]);
                            }
                            else{
                                increaseRate = '0%/0%/0%';
                            }

                            index += 3;
                        }
                    }

                    // X 좌표 위치는 같으나 Y 좌표 위치는 다르므로 X 좌표를 다시 계산하여 데이터를 셀에 삽입한다.
                    xTempPos = xPos - mergeCellCnt;
                    dataSheet.mergeCells(util.positionToLetterRef(xTempPos + 1, currentCellPos + 2), util.positionToLetterRef(xTempPos + mergeCellCnt * 2, currentCellPos + 2));
                    dataSheet.addData(currentCellPos + 1, xTempPos++, {value : increaseRate, metadata: { style:this.styleFormat.alignCenter.id }});
                    for(kx = 1, kxLen = mergeCellCnt * 2; kx < kxLen; kx++){
                        dataSheet.addData(currentCellPos + 1, xTempPos++, {value : null, metadata: { style:this.styleFormat.alignCenter.id }});
                    }
                }

                // 위에서 만든 지표 데이터를 각 셀 위치에 삽입한다.
                dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                dataSheet.addData(currentCellPos, xPos++, {value : statValue, metadata: { style:this.styleFormat.alignCenter.id }});
                for(kx = 1, kxLen = mergeCellCnt; kx < kxLen; kx++){
                    dataSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.alignCenter.id }});
                }

                // 각 행의 높이를 조절한다.
                dataSheet.setRowInstructions(currentCellPos, {height: 40});
                dataSheet.setRowInstructions(currentCellPos + 1, {height: 40});
            }

            currentCellPos += 2;
            xPos = 0;
        }

        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    setAgentSummaryToSheet: function(summaryData, excelObj, sheetName){
        var dataSheet,
            mergeCellCnt = 4,
            xPos, xTempPos, currentCellPos = 0,
            index, ix, ixLen, jx, jxLen, kx,
            statName, statValue, rowData, endDate, currDate, day, isExist;

        // 에이전트 통계 정보를 작성할 sheet 생성
        dataSheet = excelObj.workbook.createWorksheet({name: sheetName});
        dataSheet.setColumns(excelObj.columnsProp);
        dataSheet.setPageOrientation(excelObj.orientation);

        // 제목을 삽입한다.
        dataSheet.addData(currentCellPos, 0, {
            value: '1. ' + common.Util.TR('Agent Operating Summary') + ' (' + sheetName + ')',
            metadata: {style: this.styleFormat.subTitle.id}
        });
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        // 에이전트 데이터가 존재 하지 않을 시에는 시트 생성 및 결과 없음 메시지만 표시하고 빠져나간다.
        if(summaryData.length < 1){
            dataSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });

            return dataSheet;
        }

        xPos = 0;
        // 지표 데이터가 아닌 날짜 컬럼명을 먼저 삽입한다.
        dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
        for(ix = 0; ix < 2; ix++){
            dataSheet.addData(currentCellPos + ix, xPos, {value : common.Util.TR('Date'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            for(jx = 1; jx < mergeCellCnt; jx++){
                dataSheet.addData(currentCellPos + ix, xPos + jx, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            }
        }

        xPos += mergeCellCnt;

        // 표여줄 지표 목록을 컬럼명으로 삽입한다.
        for(ix = 0, ixLen = this.dailySummaryStatList.length; ix < ixLen; ix++){
            statName = this.dailySummaryStatList[ix];
            if(ix === 0 || ix === ixLen - 1){
                if(ix === 0){
                    // 실행건수의 경우 유형이 세가지(전체/평균/최대) 이므로 따로 컬럼명을 붙여준다.
                    statName += '\n' + common.Util.TR('( SUM / AVG / MAX )');
                }

                // 실행건수 및 예외 지표는 두줄을 차지해야 하므로 따로 삽입해준다.
                dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
                for(jx = 0; jx < 2; jx++){
                    dataSheet.addData(currentCellPos + jx, xPos, {value : statName, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    for(kx = 1; kx < mergeCellCnt; kx++){
                        dataSheet.addData(currentCellPos + jx, xPos + kx, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }
                }

                xPos += mergeCellCnt;
            }
            else{
                // 나머지 지표들의 유형은 두가지(평균/최대) 이므로 마지막에 한번만 다음줄에 삽입한다.
                if(ix === ixLen - 2){
                    xTempPos = mergeCellCnt * 2;
                    dataSheet.mergeCells(util.positionToLetterRef(xTempPos + 1, currentCellPos + 2), util.positionToLetterRef(xTempPos + mergeCellCnt * 8, currentCellPos + 2));
                    dataSheet.addData(currentCellPos + 1, xTempPos++, {value : common.Util.TR('( AVG / MAX )'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    for(jx = xTempPos + 1, jxLen = mergeCellCnt * 8; jx < jxLen; jx++){
                        dataSheet.addData(currentCellPos + 1, xTempPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }
                }

                // 남은 지표목록을 순차적으로 컬럼명으로 삽입한다.
                dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                dataSheet.addData(currentCellPos, xPos++, {value : statName, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                for(jx = 1; jx < mergeCellCnt; jx++){
                    dataSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                }
            }
        }

        // 각 행의 높이를 설정한다.
        dataSheet.setRowInstructions(currentCellPos, {height: 40});
        dataSheet.setRowInstructions(currentCellPos + 1, {height: 30});

        currentCellPos += 2;

        currDate = this.execInfo.fixedFromTime;
        endDate = new Date(this.execInfo.fixedToTime);
        for(ix = 1, ixLen = endDate.getDate() + 1; ix < ixLen; ix++){
            day = ix + '';
            isExist = false;
            currDate = currDate.substr(0, 8) + (day.length < 2 ? day = '0' + day : day);
            for(jx = 0, jxLen = summaryData.length; jx < jxLen; jx++){
                xPos = 0;
                index = 0;
                rowData = summaryData[jx];

                if(currDate == rowData[index++]){
                    isExist = true;
                    break;
                }
            }

            for(jx = 0, jxLen = this.dailySummaryStatList.length + 1; jx < jxLen; jx++){
                if(isExist){
                    if(jx === 0){
                        statValue = currDate;
                    }
                    else if(jx === 1){
                        // 전체/평균/최대 값을 1000단위 구분 콤마를 넣어주고 '/' 구분자를 이용하여 하나의 문자열로 만든다.
                        statValue = common.Util.numberWithComma(rowData[index++]) + '/' + common.Util.numberWithComma(rowData[index++]) + '/' + common.Util.numberWithComma(rowData[index++]);
                    }
                    else if(jx === jxLen - 1){
                        // 예외 데이터의 경우는 데이터가 하나이므로 1000단위 구분 콤마만 넣어준다.
                        statValue = common.Util.numberWithComma(rowData[index++] || 0);
                    }
                    else {
                        // 평균/최대 값을 1000단위 구분 콤마를 넣어주고 '/' 구분자를 이용하여 하나의 문자열로 만든다.
                        statValue = common.Util.numberWithComma(rowData[index++]) + '/' + common.Util.numberWithComma(rowData[index++]);
                    }
                }
                else{
                    if(jx === 0){
                        statValue = currDate;
                    }
                    else{
                        statValue = common.Util.TR('No Result');
                    }
                }

                // 위에서 만들어놓은 데이터를 각 셀에 삽입한다.
                dataSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                dataSheet.addData(currentCellPos, xPos++, {value : statValue, metadata: { style:this.styleFormat.alignCenter.id }});
                for(kx = 1; kx < mergeCellCnt; kx++){
                    dataSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.alignCenter.id }});
                }
            }

            // 각 행의 높이를 설정한다.
            dataSheet.setRowInstructions(currentCellPos, {height: 40});
            currentCellPos++;
        }

        return dataSheet;
    },

    generateAgentCompMonthlyReport: function(){
        var reportExcel = new Builder(),
            Workbook = reportExcel.createWorkbook(),
            overviewSheet = Workbook.createWorksheet({name: 'Overview'}),
            styleSheet = Workbook.getStyleSheet(),
            dataSheets = [],
            columnsProp, excelObj,
            currentCellPos = 0,
            orientation = null,
            agentData, agentName,
            ix, ixLen, jx, jxLen;

        columnsProp = {
            min: 1,
            max: 150,
            width: 3.5
        };

        if(this.pageDirection == this.pageType.V) {
            orientation = 'portrait';
        }
        else {
            orientation = 'landscape';
        }

        overviewSheet.setColumns(columnsProp);
        overviewSheet.setPageOrientation(orientation);

        // 기본 스타일 설정
        this.setStyleFormat(styleSheet);
        // Report Header 설정 (제목, 날짜 등)
        currentCellPos = this.setReportSheetHeader(overviewSheet, currentCellPos);

        overviewSheet.addData(currentCellPos, 0, {
            value: '1. ' + common.Util.TR('Monthly Operating Summary'),
            metadata: {style: this.styleFormat.subTitle.id}
        });
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        currentCellPos = this.setMonthlySummaryToSheet(overviewSheet, currentCellPos);

        excelObj = {
            workbook : Workbook,
            columnsProp : columnsProp,
            orientation : orientation
        };

        for(ix = 0, ixLen = this.agentList.length; ix < ixLen; ix++){
            agentName = this.agentList[ix].wasName;
            for(jx = 0, jxLen = this.agentSummaryData.length; jx < jxLen; jx++){
                if(agentName == this.agentSummaryData[jx].wasName){
                    agentData = this.agentSummaryData[jx].detailData;
                    break;
                }
            }

            if(jx == jxLen){
                agentData = [];
            }

            dataSheets.push(this.setAgentSummaryToSheet(agentData, excelObj, this.agentList[ix].wasName));
        }

        Workbook.addWorksheet(overviewSheet);
        for(ix = 0, ixLen = dataSheets.length; ix < ixLen; ix++){
            Workbook.addWorksheet(dataSheets[ix]);
        }

        return reportExcel.createFile(Workbook);
    }
});
