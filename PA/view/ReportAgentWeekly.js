/**
 * Created by jykim on 2015-10-22.
 */
Ext.define("view.ReportAgentWeekly", {
    extend: 'Exem.ReportBaseForm',
    layout: 'fit',
    flex: 1,
    width: '100%',
    height: '100%',
    bodyLayout: 'hbox',
    DisplayTime: DisplayTimeMode.None,
    useDocumentType: false,
    usePageDirectionBtn: false,
    useDefaultStat : true,
    isAgentWeekly : true,
    innerInit: function () {
        this.regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;


        this.addSerparator(this.bodyContainer);

        this.wasArea = this.createArea(common.Util.TR('Agent List'), this.bodyContainer, false);
        this.addAgentComponent(this.wasArea);
        this.addSerparator(this.bodyContainer);

        this.statListArea  = this.createArea(common.Util.TR('Stat List'),this.bodyContainer, true);
        this.addSerparator(this.bodyContainer);
        this.addStatComponent(this.statListArea);

        this.setRadioValue('Last Week', true);
        this._dateClick('Last Week');

        this.monitorTypeSQL = this.sql[this.monitorType];
    },

    executeAgentWeekly: function(execInfo){
        var ix, ixLen;
        var was_ids;

        if(!execInfo) {
            return;
        }


        this.overallData = {
            columnList : [],
            dataType : [],
            dataList : []
        };

        this.overallDetailData = {
            columnList : [],
            dataType : [],
            dataList : []
        };

        this.performanceData = [];

        this.agentSummaryData = {
            columnList : [],
            dataType : [],
            dataList : [],
            statAggr : [],
            statType : []
        };

        this.agentDetailData = {};

        this.alertHistoryData = {
            columnList : [],
            dataType : [],
            dataList : []
        };

        this.executeCount = 0;
        this.totalProgressCnt = 3;
        this.currentProgressCnt = 0;

        this.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Processing')+'.';


        var execParams = {};

        was_ids = [];
        for(ix = 0, ixLen = this.agentList.length; ix < ixLen; ix++){
            was_ids.push(this.agentList[ix].wasId);
        }

        execParams.was_id_str = was_ids.join(',');
        execParams.from_time = '\'' + execInfo.from_time + '\'';
        execParams.to_time = '\'' + execInfo.to_time + '\'';

        if(execInfo.isTimeWindowChecked){
            switch(Comm.currentRepositoryInfo.database_type) {
                case 'PostgreSQL' :
                    execParams.timeWindow = 'and to_char(:time_col, \'hh24:mi\')  >=\'' + execInfo.from_time_window + '\' and to_char(:time_col, \'hh24:mi\') <=\'' + execInfo.to_time_window + '\'';
                    break;
                case 'Oracle' :
                    execParams.timeWindow = 'and to_char(:time_col, \'hh24:mi\') >=' + '\'' + execInfo.from_time_window + '\'' + ' and to_char(:time_col, \'hh24:mi\') <=\'' + execInfo.to_time_window + '\'';
                    break;
                case 'MSSQL' :
                    execParams.timeWindow = 'and convert(nvarchar(5), :time_col, 114) >=\'' + execInfo.from_time_window + '\' and convert(nvarchar(5), :time_col, 114) <= \'' + execInfo.to_time_window + '\'';
                    break;
                default :
                    execParams.timeWindow = '';
                    break;
            }
        }
        else {
            execParams.timeWindow = '';
        }


        this.executeAgentWeeklyData('overall', execParams);
        this.executeAgentWeeklyData('overall_detail', execParams);
        this.executeAgentWeeklyData('performance_summary', execParams);
        this.executeAgentWeeklyData('agent_summary', execParams);
        this.executeAgentWeeklyData('agent_detail', execParams);
        this.executeAgentWeeklyData('alert_history', execParams);
    },

    executeAgentWeeklyData: function(type, execParams){
        var dataSet = {};

        switch (type){
            case 'overall':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_overall_summary;
                break;
            case 'overall_detail':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_overall_detail;
                break;
            case 'performance_summary':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_performance_summary;
                break;
            case 'agent_summary':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_agent_summary;
                break;
            case 'agent_detail':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_agent_detail;
                break;
            case 'alert_history':
                dataSet.sql_file = this.monitorTypeSQL.agent_report.longterm_alert_history;
                break;
            default:
                return;
        }

        dataSet.replace_string = [{
            name: 'was_id',
            value: execParams.was_id_str
        },{
            name: 'from_time',
            value: execParams.from_time
        },{
            name: 'to_time',
            value: execParams.to_time
        },{
            name: 'log_time_window',
            value: execParams.timeWindow.replace(/:time_col/gi, 'log_time')
        },{
            name: 'time_window',
            value : execParams.timeWindow.replace(/:time_col/gi, 'time')
        },{
            name: 'exclude_weekend_log_time',
            value : ''
        },{
            name: 'exclude_weekend_time',
            value : ''
        }];

        WS.SQLExec(dataSet, this.onAgentWeeklyData, this);
        this.executeCount++;
    },


    onAgentWeeklyData: function(header, data) {
        var percent;

        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.failList.push(header.command);
            console.warn('ReportAgentWeekly-onWeeklyWasData');
            console.warn(header);
            console.warn(data);
        } else {
            switch (header.command) {
                case this.monitorTypeSQL.agent_report.longterm_overall_summary:
                    this.onOverallData(data);
                    break;
                case this.monitorTypeSQL.agent_report.longterm_overall_detail:
                    this.onOverallDetailData(data);
                    break;
                case this.monitorTypeSQL.agent_report.longterm_performance_summary:
                    this.onPerformanceSummary(data);
                    break;
                case this.monitorTypeSQL.agent_report.longterm_agent_summary:
                    this.onAgentSummary(data);
                    break;
                case this.monitorTypeSQL.agent_report.longterm_agent_detail:
                    this.onAgentDetail(data);
                    break;
                case this.monitorTypeSQL.agent_report.longterm_alert_history:
                    this.onAlertHistory(data);
                    break;
                default :
                    break;
            }
        }

        this.currentProgressCnt++;

        percent = (this.currentProgressCnt/this.totalProgressCnt)*100;
        if(percent < 5){
            percent = 5;
        }
        // instance process
        this.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Processing')+'.';
        // % size
        this.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width   = (percent > 95 ? '95' :  percent.toFixed(0)) + '%';
        // % text
        this.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML = (percent > 95 ? '95' :  percent.toFixed(0)) + '%';
        // 진행률.(1/4)
        this.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '0 / 1';
        if (this.executeCount == 0) {
            if (this.failList.length == 0) {
                this.downLoadFile();
            }
            else {
                // instance process
                this.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Agent Report Failed')+'.';
                // % size
                this.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width   = '100%';
                // % text
                this.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML = '100%';
                // 진행률.(1/4)
                this.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '1 / 1';
                this.processClose();
            }
        }

    },

    onOverallData: function(data) {
        var ix, ixLen,
            jx, jxLen,
            kx, kxLen,
            overallStat, column, columnText, columnData, tempData;

        overallStat = this.overallStatList[this.monitorType];

        for(ix=0, ixLen=overallStat.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data.length; jx<jxLen; jx++) {
                for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {
                    column = data[jx].columns[kx].toLowerCase();
                    if(overallStat[ix].name === column) {
                        columnText = overallStat[ix].text;
                        tempData = data[jx].rows;
                        columnData = tempData.length > 0 ? data[jx].rows[0][kx] : null

                        if (column === 'tps_max_agent') {
                            columnData = columnData === null ? 'No Result' : Comm.RTComm.getServerNameByID(columnData);
                            columnText += '(' + columnData + ')';
                            columnData = undefined;
                        }

                        this.overallData.columnList.push(columnText);
                        this.overallData.dataType.push(overallStat[ix].type);
                        this.overallData.dataList.push(columnData);
                    }
                }
            }
        }
    },

    onOverallDetailData: function(data) {
        var ix, ixLen,
            jx, jxLen,
            kx, kxLen,
            lx, lxLen,
            mx, mxLen,
            nx, nxLen,
            statIdx = 0, agentProp, findTime, column, columnText;

        var overallStat = this.overallStatList[this.monitorType];

        function detailDataSort(d1, d2) {
            return d1[0] < d2[0] ? -1 : d1[0] > d2[0] ? 1 : 0;
        }

        this.overallDetailData.columnList[0] = common.Util.TR('Time');
        this.overallDetailData.dataType[0] = 'datetime';

        statIdx++;
        for(ix=0, ixLen=overallStat.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data.length; jx<jxLen; jx++) {
                for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {

                    column = data[jx].columns[kx].toLowerCase()
                    if(overallStat[ix].name === column) {
                        columnText = overallStat[ix].text;

                        this.overallDetailData.columnList[statIdx] = columnText;
                        this.overallDetailData.dataType[statIdx] = overallStat[ix].type;

                        for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {
                            agentProp = data[jx].rows[lx][0];

                            findTime = false;
                            for(mx=0, mxLen=this.overallDetailData.dataList.length; mx<mxLen; mx++) {
                                if(this.overallDetailData.dataList[mx][0] == data[jx].rows[lx][0]) {
                                    findTime = true;
                                }
                            }

                            if(!findTime) {
                                this.overallDetailData.dataList[this.overallDetailData.dataList.length] = [];
                                this.overallDetailData.dataList[this.overallDetailData.dataList.length-1][0] = data[jx].rows[lx][0];
                            }
                        }


                        for(mx=0, mxLen=this.overallDetailData.dataList.length; mx<mxLen; mx++) {
                            for(nx=0, nxLen=data[jx].rows.length; nx<nxLen; nx++) {
                                if(this.overallDetailData.dataList[mx][0] == data[jx].rows[nx][0]) {
                                    this.overallDetailData.dataList[mx][statIdx] = data[jx].rows[nx][kx];
                                }
                            }

                            this.overallDetailData.dataList.sort(detailDataSort);
                        }


                        statIdx++;
                    }
                }
            }
        }
    },

    onPerformanceSummary: function(data) {
        var ix, ixLen,
            jx, jxLen,
            kx, kxLen,
            lx, lxLen, dataIdx;
        var oriStatData, curStatName, curStatAggr;

        for(ix=0, dataIdx=0, ixLen=this.selectedStatList.length; ix<ixLen; ix++) {

            this.performanceData[dataIdx] = {};
            this.performanceData[dataIdx].dataType = this.selectedStatList[ix].statType;
            this.performanceData[dataIdx].rawData = [];
            this.performanceData[dataIdx].aggregate = this.statAggregate;

            if(this.selectedStatList[ix].statType == 'agent' && this.statAggregate == 'ALL') {
                this.performanceData[dataIdx+1] = {};
                this.performanceData[dataIdx+1].dataType = this.selectedStatList[ix].statType;
                this.performanceData[dataIdx+1].rawData = [];

            }


            if(this.selectedStatList[ix].statType == 'total') {

                this.performanceData[dataIdx].statName =  this.selectedStatList[ix].text;

                for(jx=0, jxLen=data.length; jx<jxLen; jx++) {
                    for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {
                        if(this.selectedStatList[ix].name.toUpperCase() == data[jx].columns[kx].toUpperCase()) {
                            for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {
                                this.performanceData[dataIdx].rawData.push([data[jx].rows[lx][0], data[jx].rows[lx][kx]]);
                            }
                        }
                    }
                }

                dataIdx++;
            }
            else if(this.selectedStatList[ix].statType == 'overall') {

                if(this.statAggregate == 'ALL') {
                    this.performanceData[dataIdx].statName =  this.selectedStatList[ix].text + ' (' + common.Util.CTR('AVG') + ')' + '(' + common.Util.CTR('MAX') + ')';
                }
                else {
                    this.performanceData[dataIdx].statName =  this.selectedStatList[ix].text + ' (' + common.Util.CTR(this.statAggregate) + ')';
                }

                for(jx=1, jxLen=data.length; jx<jxLen; jx++) {
                    for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {

                        oriStatData = data[jx].columns[kx].toUpperCase();
                        curStatAggr = oriStatData.split('_').pop();
                        curStatName = oriStatData.substring(0, oriStatData.indexOf('_' + curStatAggr));


                        if(this.selectedStatList[ix].name.toUpperCase() == curStatName) {

                            for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {

                                if(this.statAggregate == 'ALL') {
                                    this.performanceData[dataIdx].rawData.push([curStatAggr, data[jx].rows[lx][0], data[jx].rows[lx][kx]]);
                                }
                                else if(curStatAggr == this.statAggregate) {
                                    this.performanceData[dataIdx].rawData.push([data[jx].rows[lx][0], data[jx].rows[lx][kx]]);
                                }
                            }
                        }
                    }
                }

                dataIdx++;
            }
            else { // agent
                if(this.statAggregate == 'ALL') {
                    this.performanceData[dataIdx].aggregate = 'AVG';
                    this.performanceData[dataIdx+1].aggregate = 'MAX';
                    this.performanceData[dataIdx].statName =  this.selectedStatList[ix].text + ' (' + common.Util.CTR('AVG') + ')';
                    this.performanceData[dataIdx+1].statName =  this.selectedStatList[ix].text + ' (' + common.Util.CTR('MAX') + ')';
                }
                else {
                    this.performanceData[dataIdx].statName =  this.selectedStatList[ix].text + ' (' + common.Util.CTR(this.statAggregate) + ')';
                }


                for(jx=1, jxLen=data.length; jx<jxLen; jx++) {
                    for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {

                        oriStatData = data[jx].columns[kx].toUpperCase();
                        curStatAggr = oriStatData.split('_').pop();
                        curStatName = oriStatData.substring(0, oriStatData.indexOf('_' + curStatAggr));

                        if(this.selectedStatList[ix].name.toUpperCase() == curStatName) {

                            for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {

                                if(this.statAggregate == 'ALL') {
                                    if(curStatAggr == 'AVG') {
                                        this.performanceData[dataIdx].rawData.push([data[jx].rows[lx][0], data[jx].rows[lx][1], data[jx].rows[lx][kx]]);
                                    }
                                    else {
                                        this.performanceData[dataIdx+1].rawData.push([data[jx].rows[lx][0], data[jx].rows[lx][1], data[jx].rows[lx][kx]]);
                                    }
                                }
                                else if(curStatAggr == this.statAggregate){
                                    this.performanceData[dataIdx].rawData.push([data[jx].rows[lx][0], data[jx].rows[lx][1], data[jx].rows[lx][kx]]);
                                }

                            }
                        }
                    }
                }

                if(this.statAggregate == 'ALL') {
                    dataIdx+=2;
                }
                else {
                    dataIdx++;
                }

            }
        }
    },

    onAgentSummary : function(data) {
        var ix, ixLen,
            jx, jxLen,
            kx, kxLen,
            lx, lxLen,
            mx, mxLen,
            statIdx = 0, findAgent, statName, columnName,
            oriStatData, curStatAggr, curStatName;

        this.agentSummaryData.columnList[statIdx] = common.Util.TR('Agent');
        this.agentSummaryData.dataType[statIdx] = 'string';
        this.agentSummaryData.statAggr[statIdx] = 'none';
        this.agentSummaryData.statType[statIdx] = 'total';

        statIdx++;

        for(ix=0, ixLen=this.selectedStatList.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data.length; jx<jxLen; jx++) {
                for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {

                    oriStatData = data[jx].columns[kx].toUpperCase();
                    curStatAggr = oriStatData.split('_').pop();
                    curStatName = oriStatData.substring(0, oriStatData.indexOf('_' + curStatAggr));

                    statName = this.selectedStatList[ix].statType == 'total' ? data[jx].columns[kx].toUpperCase() : curStatName;

                    if(this.selectedStatList[ix].name.toUpperCase() == statName) {

                        if(this.selectedStatList[ix].statType != 'total' && this.statAggregate != 'ALL' && this.statAggregate != curStatAggr) {
                            continue;
                        }

                        if(this.selectedStatList[ix].statType == 'total' || this.statAggregate =='ALL') {
                            columnName = this.selectedStatList[ix].text;
                        }
                        else {
                            columnName = this.selectedStatList[ix].text + '\n(' + common.Util.CTR(curStatAggr) + ')';
                        }

                        this.agentSummaryData.columnList[statIdx] = columnName;
                        this.agentSummaryData.dataType[statIdx] = this.selectedStatList[ix].type;
                        this.agentSummaryData.statAggr[statIdx] = common.Util.CTR(curStatAggr);
                        this.agentSummaryData.statType[statIdx] = this.selectedStatList[ix].statType;

                        for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {
                            findAgent = false;
                            for(mx=0, mxLen=this.agentSummaryData.dataList.length; mx<mxLen; mx++) {
                                if(this.agentSummaryData.dataList[mx][0] == data[jx].rows[lx][0]) {
                                    findAgent = true;
                                }
                            }

                            if(!findAgent) {
                                this.agentSummaryData.dataList[this.agentSummaryData.dataList.length] = [];
                                this.agentSummaryData.dataList[this.agentSummaryData.dataList.length-1][0] = data[jx].rows[lx][0];
                            }
                        }

                        for(lx=0, lxLen=this.agentSummaryData.dataList.length; lx<lxLen; lx++) {
                            for(mx=0, mxLen=data[jx].rows.length; mx<mxLen; mx++) {
                                if(this.agentSummaryData.dataList[lx][0] == data[jx].rows[mx][0]) {
                                    this.agentSummaryData.dataList[lx][statIdx] = data[jx].rows[mx][kx];
                                }
                            }
                        }

                        statIdx++;
                    }
                }
            }
        }
    },

    onAgentDetail : function(data) {
        var ix, ixLen,
            jx, jxLen,
            kx, kxLen,
            lx, lxLen,
            mx, mxLen,
            nx, nxLen,
            statIdx = 0, agentProp, findTime, agentKeys,
            oriStatData, curStatAggr, curStatName, statName, columnName;


        function detailDataSort(d1, d2) {
            return d1[0] < d2[0] ? -1 : d1[0] > d2[0] ? 1 : 0;
        }

        for(ix=0, ixLen=data.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data[ix].rows.length; jx<jxLen; jx++) {

                agentProp = data[ix].rows[jx][0];

                if(!this.agentDetailData[agentProp]) {
                    this.agentDetailData[agentProp] = {
                        columnList : [],
                        dataType : [],
                        dataList : [],
                        statAggr : [],
                        statType : []

                    };

                    this.agentDetailData[agentProp].columnList[0] = common.Util.TR('Time');
                    this.agentDetailData[agentProp].dataType[0] = 'datetime';
                    this.agentDetailData[agentProp].statAggr[0] = 'none';
                    this.agentDetailData[agentProp].statType[0] = 'total';
                }
            }
        }

        statIdx++;
        for(ix=0, ixLen=this.selectedStatList.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data.length; jx<jxLen; jx++) {
                for(kx=0, kxLen=data[jx].columns.length; kx<kxLen; kx++) {

                    oriStatData = data[jx].columns[kx].toUpperCase();
                    curStatAggr = oriStatData.split('_').pop();
                    curStatName = oriStatData.substring(0, oriStatData.indexOf('_' + curStatAggr));

                    statName = this.selectedStatList[ix].statType == 'total' ? data[jx].columns[kx].toUpperCase() : curStatName;

                    if(this.selectedStatList[ix].name.toUpperCase() == statName) {

                        if(this.selectedStatList[ix].statType != 'total' && this.statAggregate != 'ALL' && this.statAggregate != curStatAggr) {
                            continue;
                        }

                        if(this.selectedStatList[ix].statType == 'total' || this.statAggregate =='ALL') {
                            columnName = this.selectedStatList[ix].text;
                        }
                        else {
                            columnName = this.selectedStatList[ix].text + '\n(' + common.Util.CTR(curStatAggr) + ')';
                        }

                        agentKeys = Object.keys(this.agentDetailData);
                        for(lx=0, lxLen=agentKeys.length; lx<lxLen; lx++) {
                            this.agentDetailData[agentKeys[lx]].columnList[statIdx] = columnName;
                            this.agentDetailData[agentKeys[lx]].dataType[statIdx] = this.selectedStatList[ix].type;
                            this.agentDetailData[agentKeys[lx]].statAggr[statIdx] = common.Util.CTR(curStatAggr);
                            this.agentDetailData[agentKeys[lx]].statType[statIdx] = this.selectedStatList[ix].statType;
                        }


                        for(lx=0, lxLen=data[jx].rows.length; lx<lxLen; lx++) {
                            agentProp = data[jx].rows[lx][0];

                            findTime = false;
                            for(mx=0, mxLen=this.agentDetailData[agentProp].dataList.length; mx<mxLen; mx++) {
                                if(this.agentDetailData[agentProp].dataList[mx][0] == data[jx].rows[lx][1]) {
                                    findTime = true;
                                }
                            }

                            if(!findTime) {
                                this.agentDetailData[agentProp].dataList[this.agentDetailData[agentProp].dataList.length] = [];
                                this.agentDetailData[agentProp].dataList[this.agentDetailData[agentProp].dataList.length-1][0] = data[jx].rows[lx][1];
                            }
                        }

                        for(lx=0, lxLen=agentKeys.length; lx<lxLen; lx++) {
                            for(mx=0, mxLen=this.agentDetailData[agentKeys[lx]].dataList.length; mx<mxLen; mx++) {
                                for(nx=0, nxLen=data[jx].rows.length; nx<nxLen; nx++) {
                                    if(this.agentDetailData[agentKeys[lx]].dataList[mx][0] == data[jx].rows[nx][1] && agentKeys[lx] == data[jx].rows[nx][0]) {
                                        this.agentDetailData[agentKeys[lx]].dataList[mx][statIdx] = data[jx].rows[nx][kx];
                                    }
                                }

                                this.agentDetailData[agentKeys[lx]].dataList.sort(detailDataSort);
                            }
                        }

                        statIdx++;
                    }
                }
            }
        }
    },


    onAlertHistory : function(data) {
        var ix, ixLen,
            jx, jxLen;

        for(ix=0, ixLen=this.alertColumnList.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=data.columns.length; jx<jxLen; jx++) {
                if(this.alertColumnList[ix].name.toUpperCase() == data.columns[jx].toUpperCase()) {
                    this.alertHistoryData.columnList.push(this.alertColumnList[ix].text);
                    this.alertHistoryData.dataType.push(this.alertColumnList[ix].type);
                }
            }
        }
        this.alertHistoryData.dataList = data.rows;
    },

    setIntLegendToDataSheet: function(legendInfo, excelObj, endYPos) {
        var data = legendInfo.data,
            xPos = this.excelPositionMargin.chartWidth * 3 + this.excelPositionMargin.default * 3,
            yPos = legendInfo.startYPos,
            sheetName = 'integrationLegend',
            chart, graphic, dataSheet,
            ix, ixLen, jx, jxLen;

        dataSheet = excelObj.workbook.createWorksheet({name: sheetName, state: 'hidden'});
        excelObj.dataSheets.push(dataSheet);

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            for(jx = 0, jxLen = data[ix].length; jx < jxLen; jx++) {
                if (!ix && !jx) {
                    dataSheet.addData(ix, jx, null);
                }
                else if (!ix || !jx) {
                    dataSheet.addData(ix, jx, data[ix][jx]);
                }
                else {
                    dataSheet.addData(ix, jx, null);
                }

            }
        }

        chart = ChartFrame.createChart('line');
        graphic = new GraphicFrame();

        chart.setChartData(data, data.length-1);
        chart.setSheetName(sheetName);
        chart.setAutoTitleDeleted(true);
        chart.setLegend_Position('t');
        chart.setCatAx_visible(false);
        chart.setValAx_visible(false);

        excelObj.workbook.addCharts(chart);

        graphic.createAnchor('twoCellAnchor', {
            from: {
                x: xPos,
                y: yPos + 1,
                xOff : 0,
                yOff : 0
            },
            to: {
                x: xPos + 8,
                y: endYPos,
                xOff : 0,
                yOff : 152400
            }
        });

        graphic.setChartId(chart.id);
        excelObj.drawings.addDrawing(graphic);
    },

    generateAgentWeeklyReport: function(){
        var reportExcel = new Builder();
        var Workbook = reportExcel.createWorkbook();
        var chartSheet = Workbook.createWorksheet({name: 'Report'});
        var styleSheet = Workbook.getStyleSheet();
        var drawings = new Drawings();
        var dataSheets = [];
        var chartFrames = [];
        var graphicFrames = [];

        var columnsProp;

        var currentCellPos = 0;
        var orientation = null;
        var isSetIntLegend;
        var intLegendInfo;

        var chartType;
        var weeklyPTData;
        var cellXYPos;

        var ix, ixLen, agentKeys;

        this.sheetCnt = 0;

        columnsProp = {
            min: 1,
            max: 150,
            width: 3.5
        };

        var excelObj = {
            chartSheet : chartSheet,
            dataSheets : dataSheets,
            chartFrames : chartFrames,
            graphicFrames : graphicFrames,
            drawings : drawings,
            workbook : Workbook
        };

        if(this.pageDirection == this.pageType.V) {
            orientation = 'portrait';
        }
        else {
            orientation = 'landscape';
        }

        chartSheet.setColumns(columnsProp);
        chartSheet.setPageOrientation(orientation);

        // 기본 스타일 설정
        this.setStyleFormat(styleSheet);

        // Report Header 설정 (제목)
        currentCellPos = this.setReportSheetHeader(chartSheet, currentCellPos);

        // 성능 요약 지표
        currentCellPos = this.setReportSheetSummary(chartSheet, currentCellPos);

        currentCellPos = this.setSheetOverallDetail(chartSheet, currentCellPos);


        // 전체 성능 타이틀 세팅
        chartSheet.addData(currentCellPos, 0, {
            value: '1. ' + common.Util.TR('Total Performance Trend'),
            metadata: {style: this.styleFormat.subTitle.id}
        });

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;


        // 선택 지표에 따른 차트 생성
        cellXYPos = [0, currentCellPos];
        if (this.useIntLegend) {
            intLegendInfo = {};
            intLegendInfo.startYPos = currentCellPos;
            isSetIntLegend = false;
        }

        for(ix=0, ixLen=this.performanceData.length; ix<ixLen; ix++) {

            chartType = this.performanceData[ix].dataType == 'total' ? 'bar' : 'line';
            weeklyPTData = this.setPTDefaultData(this.performanceData[ix]);

            cellXYPos = this.setPTDataToDataSheet(weeklyPTData, excelObj, cellXYPos[0], cellXYPos[1], this.sheetCnt++, this.performanceData[ix].statName, chartType, this.performanceData[ix].dataType);

            if (!isSetIntLegend && this.useIntLegend && this.performanceData[ix].dataType === 'agent' && weeklyPTData[0][1]) {
                intLegendInfo.data = weeklyPTData.slice(0);
                isSetIntLegend = true;
            }

            if(this.sheetCnt % 3 === 0) {
                cellXYPos = [0, cellXYPos[1] + this.excelPositionMargin.chartHeight + 2];
            }

            if((ixLen === 1) || (ix === ixLen - 1) && (ixLen % 3 !== 0)) {
                cellXYPos[1] += this.excelPositionMargin.chartHeight + 2;
            }
        }

        if (this.useIntLegend && isSetIntLegend) {
            this.setIntLegendToDataSheet(intLegendInfo, excelObj, cellXYPos[1] - 1);
        }


        currentCellPos = cellXYPos[1];
        currentCellPos += this.excelPositionMargin.default;

        // 에이전트 성능 요약
        chartSheet.addData(currentCellPos, 0, {
            value: '2. ' + common.Util.TR('Agent Performance Summary'),
            metadata: {style: this.styleFormat.subTitle.id}
        });
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        currentCellPos = this.setAgentPerformanceSummary(chartSheet, currentCellPos);
        currentCellPos += this.excelPositionMargin.default;


        chartSheet.addData(currentCellPos, 0, {
            value: '3. ' + common.Util.TR('Agent Performance Detail'),
            metadata: {style: this.styleFormat.subTitle.id}
        });
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        agentKeys = Object.keys(this.agentDetailData);

        if(!agentKeys.length) {
            chartSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;

        }

        for(ix=0, ixLen=agentKeys.length; ix<ixLen; ix++) {
            currentCellPos = this.setAgentPerformanceDetail(chartSheet, currentCellPos, agentKeys[ix], this.agentDetailData[agentKeys[ix]]);
            currentCellPos += this.excelPositionMargin.default;
        }

        currentCellPos += this.excelPositionMargin.default;
        chartSheet.addData(currentCellPos, 0, {
            value: '4. ' + common.Util.TR('Agent Alert History'),
            metadata: {style: this.styleFormat.subTitle.id}
        });

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos = this.setAgentAlertHistory(chartSheet, currentCellPos);




        chartSheet.addDrawings(drawings);
        Workbook.addDrawings(drawings);
        Workbook.addWorksheet(chartSheet);

        for(ix = 0, ixLen = dataSheets.length; ix < ixLen; ix++){
            Workbook.addWorksheet(dataSheets[ix]);
        }

        return reportExcel.createFile(Workbook);
    },


    setReportSheetHeader: function(sheet, cellPos) {
        var currentCellPos = cellPos;
        var xPos = 0;

        sheet.mergeCells('A1', 'AI2');
        sheet.addData(currentCellPos, xPos, {value : common.Util.TR('Agent Weekly Report'), metadata: { style:this.styleFormat.subTitle.id }});

        currentCellPos += this.excelPositionMargin.sheetTitle;
        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    setReportSheetSummary: function(sheet, cellPos) {
        var currentCellPos = cellPos;
        var xPos = 0;
        var ix, ixLen;

        sheet.mergeCells('A' + (currentCellPos + 1), 'L' + (currentCellPos + 1));
        sheet.addData(currentCellPos, xPos++, {value : common.Util.TR('Search Condition'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        for(ix = 1; ix < 12; ix++){
            sheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        }

        sheet.setRowInstructions(currentCellPos, {height: 24});
        currentCellPos += this.excelPositionMargin.default;

        xPos = 0;
        sheet.mergeCells('A' + (currentCellPos + 1), 'E' + (currentCellPos + 2));
        sheet.addData(currentCellPos, xPos, {value : common.Util.TR('Search Date'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 5; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        sheet.mergeCells('F' + (currentCellPos + 1), 'L' + (currentCellPos + 2));
        sheet.addData(currentCellPos, xPos, {value : Ext.util.Format.date(this.execInfo.from_time, 'Y-m-d') + ' ~ ' + Ext.util.Format.date(this.execInfo.to_time, 'Y-m-d'), metadata: { style:this.styleFormat.retrieveValue.id }});
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (currentCellPos + 1), 'E' + (currentCellPos + 2));
        sheet.addData(currentCellPos, xPos, {value : common.Util.TR('Operating Time'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 5; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        sheet.mergeCells('F' + (currentCellPos + 1), 'L' + (currentCellPos + 2));
        if(this.execInfo.isTimeWindowChecked) {
            sheet.addData(currentCellPos, xPos, {value : this.execInfo.from_time_window + ' ~ ' + this.execInfo.to_time_window, metadata: { style:this.styleFormat.retrieveValue.id }});
        }
        else {
            sheet.addData(currentCellPos, xPos, {value : Ext.util.Format.date(this.execInfo.from_time, 'H:i') + ' ~ ' + Ext.util.Format.date(this.execInfo.to_time, 'H:i'), metadata: { style:this.styleFormat.retrieveValue.id }});
        }
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});

        for(ix = 1; ix < 7; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;
        xPos = 0;

        sheet.mergeCells('A' + (currentCellPos + 1), 'E' + (currentCellPos + 2));
        sheet.addData(currentCellPos, xPos, {value : common.Util.CTR('Agent'), metadata: { style:this.styleFormat.retrieveColumns.id }});
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 5; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumns.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        var wasName = this.agentList.length > 1 ? this.agentList[0].wasName + common.Util.TR(' and other %1 agent', this.agentList.length - 1) : this.agentList[0].wasName;

        sheet.mergeCells('F' + (currentCellPos + 1), 'L' + (currentCellPos + 2));
        sheet.addData(currentCellPos, xPos, {value : wasName, metadata: { style:this.styleFormat.retrieveValue.id }});
        sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        for(ix = 1; ix < 7; ix++){
            sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveValue.id }});
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        for(ix = cellPos + this.excelPositionMargin.sheetTitle + this.excelPositionMargin.default + this.excelPositionMargin.default, ixLen = currentCellPos + 1; ix < ixLen; ix++){
            sheet.setRowInstructions(ix, {height: 20});
        }

        //xPos+=2;
        xPos+=3;
        currentCellPos = this.setSheetOverall(sheet, xPos, cellPos);

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    setSheetOverall: function(sheet, xCellPos, yCellPos) {
        var currentCellPos = yCellPos;
        var xPos = xCellPos;
        var ix, jx, dataArr;


        //sheet.mergeCells('O' + (currentCellPos + 1), 'AI' + (currentCellPos + 1));
        sheet.mergeCells('P' + (currentCellPos + 1), 'AJ' + (currentCellPos + 1));
        sheet.addData(currentCellPos, xPos++, {value : common.Util.TR('Performance Stat Summary'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        for(ix = 1; ix < 21; ix++){
            sheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        }
        currentCellPos += this.excelPositionMargin.default;

        for(ix=0; ix<9; ix+=3) {
            dataArr = [
                this.overallData.dataList[ix] !== null ? this.overallData.dataList[ix] : 'No Result',
                this.overallData.dataList[ix+1] !== null ? this.overallData.dataList[ix+1] : 'No Result',
                this.overallData.dataList[ix+2] !== null ? this.overallData.dataList[ix+2] : 'No Result'
            ];

            xPos = xCellPos;
            //sheet.mergeCells('O' + (currentCellPos + 1), 'R' + (currentCellPos + 2));
            sheet.mergeCells('P' + (currentCellPos + 1), 'S' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value :this.overallData.columnList[ix], metadata: { style:this.styleFormat.overrallSummray.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 4; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }

            //sheet.mergeCells('S' + (currentCellPos + 1), 'U' + (currentCellPos + 2));
            sheet.mergeCells('T' + (currentCellPos + 1), 'V' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value : dataArr[0], metadata: { style: this.getOverallCellStyle(this.overallData.dataType[ix]) }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 3; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }

            //sheet.mergeCells('V' + (currentCellPos + 1), 'Y' + (currentCellPos + 2));
            sheet.mergeCells('W' + (currentCellPos + 1), 'Z' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value : this.overallData.columnList[ix+1], metadata: { style:this.styleFormat.overrallSummray.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 4; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }

            //sheet.mergeCells('Z' + (currentCellPos + 1), 'AB' + (currentCellPos + 2));
            sheet.mergeCells('AA' + (currentCellPos + 1), 'AC' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value : dataArr[1], metadata: { style:this.getOverallCellStyle(this.overallData.dataType[ix+1]) }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 3; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }

            //sheet.mergeCells('AC' + (currentCellPos + 1), 'AF' + (currentCellPos + 2));
            sheet.mergeCells('AD' + (currentCellPos + 1), 'AG' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value : this.overallData.columnList[ix+2], metadata: { style:this.styleFormat.overrallSummray.id }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 4; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }

            //sheet.mergeCells('AG' + (currentCellPos + 1), 'AI' + (currentCellPos + 2));
            sheet.mergeCells('AH' + (currentCellPos + 1), 'AJ' + (currentCellPos + 2));
            sheet.addData(currentCellPos, xPos, {value : dataArr[2], metadata: { style:this.getOverallCellStyle(this.overallData.dataType[ix+2]) }});
            sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx = 1; jx < 3; jx++){
                sheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
                sheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }
            sheet.setRowInstructions(currentCellPos, {height: 20});
            sheet.setRowInstructions(currentCellPos + 1, {height: 20});
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;

        }

        return currentCellPos;
    },

    setSheetOverallDetail: function(chartSheet, cellPos) {
        var xPos = 0;
        var currentCellPos = cellPos;
        var mergeCellCnt = 4;
        var ix, ixLen,
            jx, jxLen,
            kx;

        var overallData = this.setOverallDetailData();

        chartSheet.mergeCells('A' + (currentCellPos + 1), 'AJ' + (currentCellPos + 1));
        chartSheet.addData(currentCellPos, xPos++, {value : common.Util.TR('Performance Stat Summary (Detail)'), metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        for(ix = 1; ix < 36; ix++){
            chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
        }
        currentCellPos += this.excelPositionMargin.default;
        xPos = 0;

        chartSheet.setRowInstructions(currentCellPos, {height: 50});
        // Table Header
        for(ix=0, ixLen=this.overallDetailData.columnList.length; ix<ixLen; ix++) {
            chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
            // mergeCell 3일때 backup
            // chartSheet.addData(currentCellPos, xPos, {value :this.overallDetailData.columnList[ix], metadata: { style:this.styleFormat.overrallSummray.id }});
            // chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            // chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});

            // for(jx=1; jx<3; jx++){
            //     chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            //     chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            //     chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            // }

            chartSheet.addData(currentCellPos, xPos++, {value :this.overallDetailData.columnList[ix], metadata: { style:this.styleFormat.overrallSummray.id }});
            for(jx=1; jx<4; jx++){
                chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style:this.styleFormat.overrallSummray.id }});
            }
        }

        currentCellPos += this.excelPositionMargin.default;
        // currentCellPos += this.excelPositionMargin.default;

        //Table Contents
        for(ix=0, ixLen=overallData.length; ix<ixLen; ix++) {
            xPos = 0;
            for(jx=0, jxLen=this.overallDetailData.columnList.length; jx<jxLen; jx++) {

                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                chartSheet.addData(currentCellPos, xPos++, {value : overallData[ix][jx], metadata: { style: this.getCellStyle(this.overallDetailData.dataType[jx]) }});
                for(kx = 1; kx < mergeCellCnt; kx++){
                    chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style: this.getCellStyle(this.overallDetailData.dataType[jx]) }});
                }
            }
            currentCellPos += this.excelPositionMargin.default;
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    setAgentPerformanceSummary: function(chartSheet, cellPos) {
        var xPos = 0, tmpXPos;
        var currentCellPos = cellPos;
        var mergeCellCnt = 3;
        var ix, ixLen,
            jx, jxLen,
            kx;

        if(!this.agentSummaryData.dataList.length) {
            chartSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;
            return currentCellPos;
        }

        // Table Header
        if(this.statAggregate == 'ALL') {

            for(ix=0, ixLen=this.agentSummaryData.columnList.length; ix<ixLen; this.agentSummaryData.statType[ix] == 'total' ? ix++ : ix+=2) {
                if(this.agentSummaryData.statType[ix] == 'total') {
                    mergeCellCnt = 3;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 3));
                    chartSheet.addData(currentCellPos, xPos, {value :this.agentSummaryData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    for(jx=1; jx<mergeCellCnt; jx++){
                        chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }
                }
                else {
                    mergeCellCnt = 4;
                    tmpXPos = xPos;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
                    chartSheet.addData(currentCellPos, xPos, {value :this.agentSummaryData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    for(jx=1; jx<mergeCellCnt; jx++) {
                        chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }

                    xPos = tmpXPos;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 3), util.positionToLetterRef(xPos + (mergeCellCnt/2), currentCellPos + 3));
                    chartSheet.addData(currentCellPos+2, xPos++, {value :this.agentSummaryData.statAggr[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 3), util.positionToLetterRef(xPos + (mergeCellCnt/2), currentCellPos + 3));
                    chartSheet.addData(currentCellPos+2, xPos++, {value :this.agentSummaryData.statAggr[ix+1], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                }
            }
        }
        else {
            mergeCellCnt = 3;

            for(ix=0, ixLen=this.agentSummaryData.columnList.length; ix<ixLen; ix++) {
                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 3));
                chartSheet.addData(currentCellPos, xPos, {value :this.agentSummaryData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                for(jx=1; jx<mergeCellCnt; jx++){
                    chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                }

            }

        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        //Table Contents
        for(ix=0, ixLen=this.agentSummaryData.dataList.length; ix<ixLen; ix++) {
            xPos = 0;

            for(jx=0, jxLen=this.agentSummaryData.columnList.length; jx<jxLen; jx++) {
                if(this.statAggregate == 'ALL' && this.agentSummaryData.statType[jx] != 'total') {
                    mergeCellCnt = 2;
                }
                else {
                    mergeCellCnt = 3;
                }

                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                chartSheet.addData(currentCellPos, xPos++, {value : this.agentSummaryData.dataList[ix][jx], metadata: { style: this.getCellStyle(this.agentSummaryData.dataType[jx]) }});
                for(kx = 1; kx < mergeCellCnt; kx++){
                    chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style: this.getCellStyle(this.agentSummaryData.dataType[jx]) }});
                }
            }
            currentCellPos += this.excelPositionMargin.default;
        }

        return currentCellPos;

    },

    setAgentPerformanceDetail: function(chartSheet, cellPos, agentName, agentData) {
        var xPos = 0, tmpXPos;
        var currentCellPos = cellPos;
        var mergeCellCnt = 3;
        var ix, ixLen,
            jx, jxLen,
            kx;


        var detailData = agentData.dataList;

        //Subject
        chartSheet.addData(currentCellPos, 0, {
            value : agentName,
            metadata : {style : this.styleFormat.thirdTitle.id}
        });
        currentCellPos += this.excelPositionMargin.default;

        if(!detailData.length) {
            chartSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;
            return currentCellPos;
        }

        // Table Header
        if(this.statAggregate == 'ALL') {

            for(ix=0, ixLen=agentData.columnList.length; ix<ixLen; agentData.statType[ix] == 'total' ? ix++ : ix+=2) {
                if(agentData.statType[ix] == 'total') {
                    mergeCellCnt = 3;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 3));
                    chartSheet.addData(currentCellPos, xPos, {value :agentData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    for(jx=1; jx<3; jx++){
                        chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }
                }
                else {
                    mergeCellCnt = 4;
                    tmpXPos = xPos;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
                    chartSheet.addData(currentCellPos, xPos, {value :agentData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    for(jx=1; jx<mergeCellCnt; jx++) {
                        chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                        chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    }

                    xPos = tmpXPos;

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 3), util.positionToLetterRef(xPos + (mergeCellCnt/2), currentCellPos + 3));
                    chartSheet.addData(currentCellPos+2, xPos++, {value :agentData.statAggr[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                    chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 3), util.positionToLetterRef(xPos + (mergeCellCnt/2), currentCellPos + 3));
                    chartSheet.addData(currentCellPos+2, xPos++, {value :agentData.statAggr[ix+1], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});

                }
            }
        }
        else {
            mergeCellCnt = 3;

            for(ix=0, ixLen=agentData.columnList.length; ix<ixLen; ix++) {
                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 3));
                chartSheet.addData(currentCellPos, xPos, {value :agentData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                for(jx = 1; jx < mergeCellCnt; jx++){
                    chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+1, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                    chartSheet.addData(currentCellPos+2, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                }
            }
        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        // Table Contents
        for(ix=0, ixLen=agentData.dataList.length; ix<ixLen; ix++) {
            xPos = 0;

            for(jx=0, jxLen=agentData.columnList.length; jx<jxLen; jx++) {
                if(this.statAggregate == 'ALL' && agentData.statType[jx] != 'total') {
                    mergeCellCnt = 2;
                }
                else {
                    mergeCellCnt = 3;
                }

                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                chartSheet.addData(currentCellPos, xPos++, {value : agentData.dataList[ix][jx], metadata: { style: this.getCellStyle(agentData.dataType[jx]) }});
                for(kx = 1; kx < mergeCellCnt; kx++){
                    chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style: this.getCellStyle(agentData.dataType[jx]) }});
                }
            }
            currentCellPos += this.excelPositionMargin.default;
        }

        return currentCellPos;
    },

    setAgentAlertHistory: function(chartSheet, cellPos) {
        var xPos = 0;
        var currentCellPos = cellPos;
        var mergeCellCnt, alertData;
        var ix, ixLen,
            jx, jxLen,
            kx;

        if(!this.alertHistoryData.dataList.length) {
            chartSheet.addData(currentCellPos, 0, {
                value: 'No Result',
                metadata: {style: this.styleFormat.mainText.id}
            });
            currentCellPos += this.excelPositionMargin.default;
            currentCellPos += this.excelPositionMargin.default;
            return currentCellPos;
        }

        // Table Header
        for(ix=0, ixLen=this.alertHistoryData.columnList.length; ix<ixLen; ix++) {

            mergeCellCnt = ix == 1 ? 9 : 3;

            chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 2));
            chartSheet.addData(currentCellPos, xPos, {value : this.alertHistoryData.columnList[ix], metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            for(jx = 1; jx < mergeCellCnt; jx++){
                chartSheet.addData(currentCellPos, xPos, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
                chartSheet.addData(currentCellPos+1, xPos++, {value : null, metadata: { style:this.styleFormat.retrieveColumnTitle.id }});
            }

        }

        currentCellPos += this.excelPositionMargin.default;
        currentCellPos += this.excelPositionMargin.default;

        // Table Content
        for(ix=0, ixLen=this.alertHistoryData.dataList.length; ix<ixLen; ix++) {
            xPos = 0;

            for(jx=0, jxLen=this.alertHistoryData.columnList.length; jx<jxLen; jx++) {
                alertData =  this.alertHistoryData.dataList[ix][jx];
                mergeCellCnt = jx == 1 ? 9 : 3;

                chartSheet.mergeCells(util.positionToLetterRef(xPos + 1, currentCellPos + 1), util.positionToLetterRef(xPos + mergeCellCnt, currentCellPos + 1));
                chartSheet.addData(currentCellPos, xPos++, {value : jx != 3 ? alertData : +alertData , metadata: { style: this.getCellStyle(this.alertHistoryData.dataType[jx]) }});
                for(kx = 1; kx < mergeCellCnt; kx++){
                    chartSheet.addData(currentCellPos, xPos++, {value : null, metadata: { style: this.getCellStyle(this.alertHistoryData.dataType[jx]) }});
                }
            }
            currentCellPos += this.excelPositionMargin.default;
        }

        currentCellPos += this.excelPositionMargin.default;

        return currentCellPos;
    },

    setPTDataToDataSheet: function(weeklyPTData, excelObj, xPos, yPos, sheetCnt, statName, chartType, dataType){
        var xCellPos = xPos, yCellPos = yPos;
        var sheetName = statName.split(' ').join('_').replace(this.regExp, '').substring(0, 30);
        var showLegend = (dataType != 'total');
        var ix, ixLen,
            jx, jxLen;

        excelObj.dataSheets.push(excelObj.workbook.createWorksheet({name: sheetName, state: 'hidden'}));
        excelObj.chartFrames.push(ChartFrame.createChart(chartType));
        excelObj.graphicFrames.push(new GraphicFrame());

        for(ix=0, ixLen=weeklyPTData.length; ix<ixLen; ix++) {
            for(jx=0, jxLen=weeklyPTData[ix].length; jx<jxLen; jx++) {
                excelObj.dataSheets[sheetCnt].addData(ix, jx, weeklyPTData[ix][jx]);
            }
        }

        if(weeklyPTData[0][1] == "") {
            showLegend = false;
        }

        // set chart props
        if(chartType == 'bar') {
            excelObj.chartFrames[sheetCnt].setChartProperty(null, '75', null);
        }

        if(statName.indexOf('%') > -1) {
            excelObj.chartFrames[sheetCnt].setValAx_minMax('0', '110');
        }

        if (showLegend && dataType === 'agent' && this.useIntLegend) {
            showLegend = false;
        }

        excelObj.chartFrames[sheetCnt].setChartData(weeklyPTData, weeklyPTData.length-1);
        excelObj.chartFrames[sheetCnt].setSheetName(excelObj.dataSheets[sheetCnt].name);
        excelObj.chartFrames[sheetCnt].setAutoTitleDeleted(true);


        excelObj.chartFrames[sheetCnt].setLegendVisible(showLegend);
        excelObj.chartFrames[sheetCnt].setLegend_Position('b');

        excelObj.workbook.addCharts(excelObj.chartFrames[sheetCnt]);

        excelObj.chartSheet.addData(yCellPos, xCellPos, {
            value: common.Util.TR(statName),
            metadata: {style: this.styleFormat.thirdTitle.id}
        });


        excelObj.graphicFrames[sheetCnt].createAnchor('twoCellAnchor', {
            from: {
                x: xCellPos,
                y: yCellPos + 1,
                xOff : 0,
                yOff : 0
            },
            to: {
                x: xCellPos + this.excelPositionMargin.chartWidth,
                y: yCellPos + 1 + 1 + this.excelPositionMargin.chartHeight - 1,
                xOff : 0,
                yOff : 152400
            }
        });
        xCellPos += this.excelPositionMargin.chartWidth + 1;

        excelObj.graphicFrames[sheetCnt].setChartId(excelObj.chartFrames[sheetCnt].id);
        excelObj.drawings.addDrawing(excelObj.graphicFrames[sheetCnt]);

        return [xCellPos, yCellPos];
    },

    setPTDefaultData: function(data) {
        var ix, ixLen,
            jx, jxLen,
            tempData = [], agentIdx, tempDate;


        var fromTime = new Date(this.execInfo.from_time);
        var toTime = new Date(this.execInfo.to_time);
        var diffDay = common.Util.getDiffDays(fromTime, toTime);


        tempData[0] = [];

        if((data.dataType == 'total') || (data.dataType == 'overall' && this.statAggregate != 'ALL')) {
            tempData[0][0] = '';
            tempData[0][1] = data.aggregate.toUpperCase();

            for(ix=0; ix<=diffDay; ix++) {
                tempData[ix + 1] = [];
                tempDate = new Date(Date.parse(fromTime) + ix * 1000 * 60 * 60 * 24).getDate();

                tempData[ix + 1][0] = tempDate;

                for(jx=0, jxLen=data.rawData.length; jx<jxLen; jx++) {
                    if(data.rawData[jx] && data.rawData[jx][0].split('-')[1] == tempDate) {
                        tempData[ix + 1][1] = data.rawData[jx][1];
                        break;
                    }
                    else {
                        tempData[ix + 1][1] = null;
                    }
                }

            }
        }
        else if((data.dataType == 'overall' && this.statAggregate == 'ALL') || data.dataType == 'agent') {
            tempData[0][0] = '';
            agentIdx = 0;

            if(data.rawData.length) {
                for(ix=0, ixLen=data.rawData.length; ix<ixLen; ix++) {
                    if(ix == 0 || data.rawData[ix-1][0] != data.rawData[ix][0]) {
                        tempData[0][++agentIdx] = data.rawData[ix][0];
                    }

                    for(jx=0; jx<=diffDay; jx++) {
                        tempDate = new Date(Date.parse(fromTime) + jx * 1000 * 60 * 60 * 24).getDate();

                        if(!tempData[jx+1]) {
                            tempData[jx+1] = [];
                            tempData[jx+1][0] = tempDate;
                        }

                        if(data.rawData[ix][1].split('-')[1] == tempDate) {
                            tempData[jx+1][agentIdx] = data.rawData[ix][2];
                        }
                        else {
                            if(tempData[jx+1][agentIdx] === null) {
                                tempData[jx+1][agentIdx] = null;
                            }
                        }

                    }
                }
            }
            else {
                tempData[0] = [];
                tempData[0][1] = '';

                for(ix=0; ix<=diffDay; ix++) {
                    tempData[ix + 1] = [];
                    tempData[ix + 1][0] = ix;
                    tempData[ix + 1][1] = null;
                }
            }
        }

        return tempData;
    },

    // overall detail 데이터 중 중간에 데이터가 없거나, 전체 데이터가 없을 때 표를 만들기 위한 기본 데이터 세팅
    setOverallDetailData: function() {
        var ix,
            jx, jxLen,
            fromTime, toTime, diffDay,
            tempDate, findDate, tempData = [];

        var data = this.overallDetailData.dataList;

        fromTime = new Date(this.execInfo.from_time);
        toTime = new Date(this.execInfo.to_time);
        diffDay = common.Util.getDiffDays(fromTime, toTime);

        // 전체 조회 기간
        for(ix=0; ix<=diffDay; ix++) {
            tempData[ix] = [];
            tempDate = Ext.util.Format.date(new Date((+fromTime) + (ix * 1000 * 60 * 60 * 24)), 'Y-m-d');
            findDate = false;

            // ix로 하루씩 Date를 넘겨가며 data와 비교
            for(jx=0, jxLen=data.length; jx<jxLen; jx++) {

                // tempDate와 데이터의 0번째 데이터 날짜를 비교
                if(tempDate == data[jx][0]) {
                    findDate = true;
                    tempData[ix] = data[jx];
                    break;
                }

            }
            // 데이터 전체 순회 후 데이터가 없을 경우 첫 칸 날짜 및 빈값 채우기
            if(!findDate) {
                tempData[ix][0] = tempDate;
                for(jx=1, jxLen=this.overallDetailData.columnList.length; jx<jxLen; jx++) {
                    tempData[ix][jx] = null;
                }
            }
        }

        return tempData;
    }
});