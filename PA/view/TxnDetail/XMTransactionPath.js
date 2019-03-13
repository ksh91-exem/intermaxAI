XMTransactionPath = function(arg){
    this.target = null;
    this.id = null;
    this.width = null;
    this.socket = null;
    this.height = null;
    this.param = {};
    this.clientData = null;
    this.webData = null;
    this.dbData = null;
    this.javaData = null;
    this.box_design = [];
    this.box_connect = [];
    this.elapsefilter = null;
    this.focusingObj = {};
    this.$target = null;
    this.path_list = [] ; //1505.15
    this.isGroup = common.Menu.useTxnPathBizGroup;
    this.arrMapGrp = [];
    this.pBasicLvl = 1;
    this.cBasicLvl = 2;
    var self = this;

    this.initArgument = function(arg) {
        for(var key in arg){
            if(this[key] !== undefined){
                this[key] = arg[key];
            }
        }

        if(! this.target && ! this.$target){
            console.debug('Transaction Path no target!');
            return;
        }

        this.$target = this.target ? $('#' + this.target) : this.$target;
        this.width = this.$target.width();
        this.height = this.$target.height();
    };

    this.addClientToAgent = function (tid) {
        var boxes = this.box_design,
            clientBox = boxes[0],
            tempBox, agentBox,
            ix, ixLen;

        for (ix = 1, ixLen = boxes.length; ix < ixLen; ix++) {
            tempBox = boxes[ix];
            if (tempBox.type === 'WAS' && tempBox.tid.indexOf(tid) !== -1) {
                agentBox = tempBox;
                break;
            }
        }

        if (agentBox) {
            this.box_connect.push({
                from : clientBox.id,
                to : agentBox.id,
                connect_elapse : null,
                connect_exec : null
            });
        }
    };


    /**
     * data : 0: client_ip, 1: CLIENT_TIME
     */
    this.clientDataParser = function(data) {
        var clientIp = '',
            raw_elapse = [],
            pushTime = 0,
            pushStart,
            pushEnd,
            usePushRecv = false,
            endTime = -1,
            startTime = -1,
            clientInfo,
            rowData, oriTime, elapseTime, agentType, methodType,
            ix, ixLen;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];
            oriTime = rowData[1] ? rowData[1] : rowData[5];
            methodType = rowData[2];
            agentType = rowData[4];

            if (methodType) {
                if (!clientInfo) {
                    clientInfo = {};
                }

                elapseTime = agentType === 'APIM' ? common.Util.numberWithComma(+oriTime) : (+oriTime).toFixed(3);

                if (methodType === '6') {    // 외국환중개 전용.......
                    usePushRecv = true;
                    if (!pushStart) {
                        pushStart = +new Date(rowData[6]);
                        pushEnd = +new Date(rowData[7]);
                        pushTime = +oriTime;
                    }

                    if (+new Date(rowData[6]) < pushStart) {
                        pushStart = +new Date(rowData[6]);
                        pushEnd = +new Date(rowData[7]);
                        pushTime = +oriTime;
                    }
                    oriTime = null;
                    // start_time이 가장 빠른 oriTime이 raw_elapse에 push 되어야하므로 oriTime을 마지막에 null 처리
                } else {  // 4 or 5
                    if (methodType === '4') {
                        startTime = +new Date(rowData[6]);
                        clientInfo.send = elapseTime;
                    } else {
                        endTime = +new Date(rowData[7]);
                        clientInfo.recv = elapseTime;
                    }
                }
            }

            if (clientIp === '') {
                clientIp = rowData[0];
            }

            raw_elapse.push(oriTime ? (rowData.length > 1 ? +oriTime : +oriTime / 1000.0) : 0);
        }

        if (methodType) {
            if (endTime !== -1 && startTime !== -1) {
                clientInfo.respTime = self.toMliFix(endTime - startTime);
            }

            if (usePushRecv) {
                raw_elapse.push(pushTime);
                clientInfo.respTime = self.toMliFix(pushEnd - startTime);
                clientInfo.push = common.Util.numberWithComma(pushTime);
            }
        }

        if (clientIp) {
            this.box_design.push({
                t: null,
                id: clientIp,
                name: clientIp,
                type: 'CLIENT',
                exec_sum: 1,
                tid: null,
                isMulti: false,
                raw_elapse: raw_elapse,
                wasType: agentType,
                clientInfo: clientInfo,
                lvl: 0
            });
        }
    };

    /**
     * @note 2014-06-25 5번째 데이터 txn_name 추가
     * data :
     *  0: web_ip
     *  1: was_id
     *  2: was_name
     *  3: exec_count
     *  4: w_elapse_time
     *  5: t_elapse_time
     *  6: txn_name
     *  7: web_txn_name
     */
    this.webDataParser = function(data){

        for(var j = 0 ;j < this.box_design.length; j++){
            if(data.length){
                this.box_connect.push({
                    from : this.box_design[j].id,
                    to : data[0][0],
                    connect_elapse : null, //self.toMliFix(data[0][4]),
                    connect_exec : null //data[0][3] || 0
//                  dest : box_design[j].id
                });
            }
        }

        for(var i = 0 ;i < data.length; i++){
            if(data[i][0]){
                this.box_design.push({
                    t : null,
                    id: data[i][0],
                    name : data[i][0],
                    type : 'WEB',
                    elapse_time_sum : self.toMliFix(data[i][4]),
                    exec_sum : data[i][3] || 0,
                    txnName: data[i][7],
                    tid: null,
                    isMulti : false,
                    lvl : 0
                });

                this.box_connect.push({
                    from : data[i][0],
                    to : data[i][1] + '_' + data[i][6].replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, ''),
                    connect_elapse : self.toMliFix(data[i][5]),
                    connect_exec : data[i][3] || 0
                });
            }
        }
    };
    /**
     * @note 7번 txn_name 추가됨
     * data : 0: WAS_ID, 1: was_name, 2: DB_ID, 3:INSTANCE_NAME, 4: exec_cnt, 5:elapse_time, 6:elapse_time_max, 7:txn_name
     * 1409.22 param - was추가(min)
     * */

    this.setBoxConnectByGroup = function(connect, boxes, arrExecCnt, groupName, dataLen){
        var ix, ixLen, jx, jxLen,
            fromId, toId, fromNm, toNm, tmpProp,
            //connect = data,
            keys = Object.keys(connect);

        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            fromId = connect[keys[ix]].from;
            toId = connect[keys[ix]].to;
            if(this.arrMapGrp.length) { // 외부 데이터가 있는 경우
                fromNm = fromId;
                for(jx = 0, jxLen = this.arrMapGrp.length; jx < jxLen; jx++) {
                    if(fromNm == this.arrMapGrp[jx][0]) {
                        fromNm = this.arrMapGrp[jx][1];
                        break;
                    }
                }

                toNm = toId;
                tmpProp = fromNm + 'to' + toNm;
                if(fromNm != toNm) {
                    if(connect[tmpProp]) {
                        if(connect[tmpProp].connect_elapse < connect[keys[ix]].connect_elapse) {
                            connect[tmpProp] = connect[keys[ix]];
                        }
                    } else {
                        connect[tmpProp] = connect[keys[ix]];
                    }
                    connect[tmpProp].from = fromNm;
                    connect[tmpProp].to = toNm;
                }

                delete connect[keys[ix]];
            }
            else {
                if(dataLen > 1 ) {  // dataLen == 1 => 그룹화할 WAS가 없다.
                    fromNm = groupName;
                    toNm = toId;
                    tmpProp = fromNm + 'to' + toNm;
                    if(!arrExecCnt[fromNm]) {
                        arrExecCnt[fromNm] = {
                            exec_cnt : 0
                        };
                    }
                    if(fromNm != toNm) {
                        if(boxes[fromId].type == 'WAS') {
                            arrExecCnt[fromNm].exec_cnt++;
                        }
                        if(connect[tmpProp]) {
                            if(connect[tmpProp].connect_elapse < connect[keys[ix]].connect_elapse) {
                                connect[tmpProp] = connect[keys[ix]];
                            }
                        } else {
                            connect[tmpProp] = connect[keys[ix]];
                        }
                        connect[tmpProp].from = fromNm;
                        connect[tmpProp].to = toNm;
                    }
                    delete connect[keys[ix]];
                }
            }
        }


    };

    this.setBoxesByGroup = function(boxes, arrExecCnt, groupName, dataLen){
        var ix, ixLen, jx, jxLen,
            keys, boxNm, tmpProp, isFindGrpData;

        keys = Object.keys(boxes);
        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            isFindGrpData = false;

            boxNm = this.findBizGrpByWasName(boxes[keys[ix]].name);
            tmpProp = keys[ix];

            if(this.arrMapGrp.length) {
                for (jx = 0, jxLen = this.arrMapGrp.length; jx < jxLen; jx++) {
                    if (tmpProp == this.arrMapGrp[jx][0]) {
                        tmpProp = this.arrMapGrp[jx][1];
                        isFindGrpData = true;
                    }
                }
                if(boxNm || isFindGrpData) {
                    if(boxes[tmpProp]) {
                        if(boxes[tmpProp].elapse_time_sum < boxes[keys[ix]].elapse_time_sum) {
                            boxes[tmpProp]  = boxes[keys[ix]];
                        }
                    } else {
                        boxes[tmpProp]  = boxes[keys[ix]];
                    }
                    boxes[tmpProp].id = tmpProp;
                    boxes[tmpProp].name = boxNm;
                    delete boxes[keys[ix]];
                }
            } else {
                if(dataLen > 1) {  // dataLen == 1 => 그룹화할 WAS가 없다.
                    tmpProp = groupName;
                    if(boxNm) {
                        if(boxes[tmpProp]) {
                            if(boxes[tmpProp].elapse_time_sum < boxes[keys[ix]].elapse_time_sum) {
                                boxes[tmpProp]  = boxes[keys[ix]];
                            }
                        } else {
                            boxes[tmpProp]  = boxes[keys[ix]];
                        }
                        boxes[tmpProp].id = tmpProp;
                        boxes[tmpProp].name = boxNm;
                        if(arrExecCnt[tmpProp]) {
                            boxes[tmpProp].exec_sum = arrExecCnt[tmpProp].exec_cnt;
                            delete arrExecCnt[tmpProp];
                        }
                        delete boxes[keys[ix]];
                    }
                }
            }
        }
    };

    this.getBoxLevel = function(wasData, dbData, dbId) {
        var dbConnectList = [],
            levelCount = 0,
            totalLevel = 0,
            ix, ixLen, jx, jxLen,
            rowData, wasName, bizName, boxLevel;

        for (ix = 0, ixLen = dbData.length; ix < ixLen; ix++) {
            rowData = dbData[ix];
            if (dbId === rowData[2]) {
                dbConnectList.push(rowData);
            }
        }

        for (ix = 0, ixLen = dbConnectList.length; ix < ixLen; ix++) {
            wasName = dbConnectList[ix][1];
            bizName = dbConnectList[ix][7];
            for (jx = 0, jxLen = wasData.length; jx < jxLen; jx++) {
                rowData = wasData[jx];
                //if (wasName === rowData[5] && bizName === rowData[7]) {
                //    totalLevel += rowData[0] + 2;
                //    levelCount++;
                //}
                if (wasName === rowData[11] && bizName === rowData[13]) {
                    totalLevel += rowData[0] + this.cBasicLvl;
                    levelCount++;
                }
            }
        }

        if (levelCount) {
            boxLevel = Math.floor(totalLevel / levelCount);
        }
        else {
            boxLevel = this.cBasicLvl;
        }

        return boxLevel;
    };

    this.dbDataParser = function(data, was, wasInfo, wasRemoteInfo, wasData, isAsync, asyncIndex){

        var boxes = {}, orgWasId, grpWasId, wasId = null, wasName, elapseTime, execCnt, groupName, connect = [], dataLen,
            orgDbName, dbName, dbId, txnName, dblvl = 0, connId, arrExecCnt = {}, waslvlArr,
            keys, ix, ixLen, jx, jxLen;

        var isAsyncUsingMethod = common.Menu.useTxnPathAsyncMethod;

        dataLen = data.length;

        for(ix = 0, ixLen = data.length ;ix < ixLen; ix++){
            orgWasId = data[ix][0];
            wasName = data[ix][1];
            dbId = data[ix][2];
            orgDbName = data[ix][3];
            execCnt = data[ix][4];
            elapseTime = data[ix][5];
            txnName = data[ix][7];
            groupName = self.findBizGrpByWasName(wasName);
            if(dbId){
                dbId += 'DB';
                wasId = orgWasId + '_' + txnName.replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, '');
                if (groupName && this.isGroup) {
                    for (jx = 0, jxLen = this.arrMapGrp.length; jx < jxLen; jx++) {
                        if (wasId == this.arrMapGrp[jx][0]) {
                            wasId = this.arrMapGrp[jx][1];
                        }
                    }
                    grpWasId = orgWasId + '_' + txnName.replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, '');
                    connId = grpWasId + 'to' + dbId;
                }

                if(isAsync && !isAsyncUsingMethod){
                    this.isGroup ? grpWasId += '_A' + asyncIndex : wasId += '_A' + asyncIndex;
                    dbId += '_A' + asyncIndex;
                }

                if(boxes[dbId]){
                    if (this.isGroup) {
                        if(connect[connId]) {
                            if(connect[connId].connect_elapse < elapseTime) {
                                connect[connId].connect_elapse = elapseTime;
                                connect[connId].connect_exec = execCnt;
                            }
                        } else {
                            connect[connId] = {
                                from: grpWasId,
                                to: dbId,
                                connect_elapse: elapseTime,
                                connect_exec: execCnt || 0
                            };
                        }
                    }
                    else{
                        this.box_connect.push({
                            from : wasId,
                            to : dbId,
                            connect_elapse : self.toMliFix(elapseTime),
                            connect_exec : execCnt || 0
                        });
                    }

                    boxes[dbId].elapse_time_sum += (elapseTime || 0) * 1;
                    boxes[dbId].exec_sum += (execCnt || 0) *1;
                }
                else{
                    waslvlArr = [];
                    if ( orgDbName.indexOf(':') >= 0 ){
                        dbName = orgDbName.split('.') ;
                        dbName = dbName[0] + '.' + dbName[4] ;
                    }
                    else{
                        dbName = orgDbName.split('.') ;
                        dbName = dbName[0] + '.' + dbName[3] + ':' + dbName[4] ;
                    }

                    dblvl = this.getBoxLevel(wasData, data, data[ix][2]);

                    boxes[dbId] = {
                        t : null,
                        id: dbId,
                        name : orgDbName,
                        type : 'DB',
                        elapse_time_sum : (elapseTime || 0 ) * 1,
                        exec_sum : (execCnt || 0) *1,
                        tid: null,
                        isMulti : false,
                        lvl : dblvl
                    };

                    if (this.isGroup) {
                        if(connect[connId]) {
                            if(connect[connId].connect_elapse < elapseTime) {
                                connect[connId].connect_elapse = elapseTime;
                                connect[connId].connect_exec = execCnt;
                            }
                        } else {
                            connect[connId] = {
                                from: grpWasId,
                                to: dbId,
                                connect_elapse: elapseTime,
                                connect_exec: execCnt || 0
                            };
                        }
                    }
                    else{
                        this.box_connect.push({
                            from : wasId,
                            to : dbId,
                            connect_elapse : self.toMliFix(elapseTime),
                            connect_exec : execCnt || 0
                        });
                    }
                }

                if (! boxes[wasId] && wasInfo && wasInfo[0]) {

                    //1504.30 txn_name에 공백이 있는경우 없애버리도록. 두줄로나오므로 by axa_(min)
                    wasInfo[0][6] = wasInfo[0][6].replace(' ', '') ;

                    if(! _.find(self.box_design, function(o){ return o.id == wasId;})){
                        boxes[wasId] = {
                            t : null,
                            id: wasId,
                            name : wasName,
                            type : 'WAS',
                            elapse_time_sum : +wasInfo[0][9] || 0,
                            exec_sum : was[0][3] || 0 , //+wasInfo[0][8] || 0,  //1409.24 remote없이 단순 db에 연결된 was의 execute count는 상위의 값을 가져다 써야하므로 값변경.(min)
                            remote_time_sum : wasRemoteInfo.length > 0 ? ((wasRemoteInfo[0][0] / 1000).toFixed(3) || 0) : 0,
                            tid: wasInfo[0][4],
                            isMulti : false,
                            txnName: wasInfo[0][6] || '',
                            exception : wasInfo[0][12] || '',
                            lvl : this.pBasicLvl,
                            isExistCallTree: true
                        };
                    }
                }
            }
        }

        if(this.isGroup) {
            this.setBoxConnectByGroup(connect, boxes, arrExecCnt, groupName, dataLen);
            this.setBoxesByGroup(boxes, arrExecCnt, groupName, dataLen);
        }

        keys = Object.keys(boxes);
        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            if (!boxes[keys[ix]]) {
                continue;
            }

            boxes[keys[ix]].elapse_time_sum = self.toMliFix(boxes[keys[ix]].elapse_time_sum);
            boxes[keys[ix]].connect_exec = self.toMliFix(boxes[keys[ix]].connect_exec);
            this.box_design.push(boxes[keys[ix]]);
        }

        if(this.isGroup){
            keys = Object.keys(connect);
            for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
                if (!connect[keys[ix]]) {
                    continue;
                }

                connect[keys[ix]].connect_elapse = self.toMliFix(connect[keys[ix]].connect_elapse);
                this.box_connect.push(connect[keys[ix]]);
            }
        }
    };

    this.checkExistReply = function(tid, isDest) {
        var isExist = false,
            replyInfo, replyTid, ix, ixLen;

        replyInfo = self.asyncInfo.replyInfo;
        for (ix = 0 , ixLen = replyInfo.length; ix < ixLen; ix++) {
            replyTid = replyInfo[ix].srcId;
            if (isDest) {
                replyTid = replyInfo[ix].destId;
            }

            if (replyTid === tid) {
                isExist = true;
                break;
            }
        }

        return {
            isExist: isExist,
            info: isExist ? replyInfo[ix] : null,
            index: ix
        };
    };

    this.updateReplyInfo = function(index, updateInfo) {
        var replyInfo = self.asyncInfo.replyInfo[index];

        if (Array.isArray(updateInfo)) {
            replyInfo.srcId = updateInfo[0];
            replyInfo.srcTxnName = updateInfo[1];
            replyInfo.srcDest = updateInfo[2];
            replyInfo.level = updateInfo[3];
        }
        else {
            replyInfo.destId = updateInfo;
        }
    };

    /**
     *  13번째 인덱스에 c_txn_name 추가 됨
     *  2014-06-25
     *  id 만으로 구분하던걸 id + txn_name 로 구분하는걸로 변경
     *  2017-12-05
     *  timeline을 하며 데이터 인덱스 변경
     *
     *  0: "lvl" 1: "time" 2: "tid" 3: "type" 4: "p_was" 5: "WAS_NAME" 6: "txn_id"
     *  7: "TXN_NAME" 8: "method_name" 9: "c_tid" 10: "was" 11: "c_was_name" 12: "c_txn_id"
     *  13: "c_txn_name" 14: "dest" 15: "p_elapse_time" 16: "c_elapse_time" 17: "p_exec_cnt"
     *  18: "c_exec_cnt" 19: "txn_elapse" 20: "c_txn_elapse" 21: "web_ip" 22: "exception" 23: "c_exception"
     *  24: "method" 25: "c_time" , 26 : "p_was_type" , 27:"c_was_type" 28 : "txn_elapse_us" 29 : "c_txn_elapse_us"
     */
    this.javaDataParser = function (data, methodStatus, asyncIndex) {
        var boxes = {}
            , connect = {}
            , tid = ''
            , p_name = ''
            , p_was = ''
            , p_txn_elapse = 0
            , p_elapse_time = 0
            , p_exec_cnt = 0
            , p_exception = 0
            , p_txn_name = null
            , c_name = ''
            , c_id = ''
            , c_type = 'WAS'
            , c_elapse_time = 0
            , c_exec_count = 0
            , c_remote_time = 0
            , c_tid = null
            , c_txn_name = null
            , c_exception = 0
            , dest = ''
            , lvl = 0
            , nodeTypeChangeList = {}
            , isAsyncUsingMethod = common.Menu.useTxnPathAsyncMethod
            , isAsync = methodStatus
            , pathListForCallTree = self.param.detail_view.callTreeBuffer
            , etoeLinkForTxnPath = common.Menu.etoeLinkForTxnPath
            , groupId, groupingCondition, groupName, groupBoxes
            , method, fromReply, toReply, pWasType, cWasType
            , connectId, rowData, keys, key, fromId, toId, fromNm, toNm, boxNm
            , index, ix, ixLen;

        if (etoeLinkForTxnPath.grouping.make) {
            groupBoxes = {};
            groupName = etoeLinkForTxnPath.grouping.name;
            groupingCondition = etoeLinkForTxnPath.grouping.refElapseTime;
        }

        if (data.length) {
            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                rowData = data[ix];

                if (!isAsync) {
                    lvl = rowData[0];
                }

                pWasType = rowData[27] || '';
                cWasType = rowData[28] || '';
                tid = rowData[2];
                c_tid = rowData[9] || '';
                c_id = (rowData[10]);
                c_txn_name = rowData[13];
                c_exception = rowData[23];
                p_name = rowData[5];
                p_elapse_time = +(rowData[15] || 0);
                p_exec_cnt = +(rowData[17] || 0);
                p_txn_elapse = +(rowData[19] || 0);
                p_txn_name = rowData[7];
                p_exception = rowData[22];
                p_was = rowData[4] + '_' + (p_txn_name || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, '');
                dest = rowData[14].split('|')[1] || rowData[14];

                if (!tid) {
                    continue;
                }

                if (isAsyncUsingMethod) {
                    // rowData[24] - 하이닉스 전용
                    // 만약 하이닉스에 us 또는 타임라인 적용하려면 개별적으로 24이상 인덱스 처리가 필요
                    method = rowData[24];
                    if (method === 120) {
                        isAsync = true;
                        p_elapse_time = 0;
                    }
                }

                // c node
                if (c_id) {
                    c_id += '_' + (c_txn_name || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, '');
                    c_name = rowData[11];
                    c_type = 'WAS';
                    c_elapse_time = (rowData[20] || 0) * 1;
                    c_exec_count = (rowData[18] || 0) * 1;
                    c_remote_time = (rowData[16] || 0) * 1;
                }
                else {
                    c_id = (rowData[13] + '') || dest;
                    c_name = rowData[13] || dest;
                    c_type = 'NONAME';
                    c_elapse_time = p_elapse_time;
                    c_exec_count = p_exec_cnt;
                    c_remote_time = p_txn_elapse;
                }

                if (pWasType === 'APIM') {
                    p_txn_elapse = +(rowData[25] || 0);
                }

                if (cWasType === 'APIM') {
                    c_elapse_time = +(rowData[26] || 0);
                }

                if (isAsync && !isAsyncUsingMethod) {
                    p_was += '_A' + asyncIndex;
                    c_id += '_A' + asyncIndex;
                }

                toReply = this.checkExistReply(tid, true);
                if (toReply.isExist) {
                    lvl = toReply.info.level;

                    this.updateReplyInfo(toReply.index, p_was);
                }

                fromReply = this.checkExistReply(tid, false);
                if (fromReply.isExist) {
                    this.updateReplyInfo(fromReply.index, [p_was, p_txn_name, dest, lvl + 1]);
                }

                if (c_id && !fromReply.isExist) {
                    if (boxes[c_id]) {
                        if (boxes[c_id].t === 'c') {
                            if (boxes[c_id].tid.indexOf(c_tid) < 0) {
                                boxes[c_id].tid.push(c_tid);
                            }
                            boxes[c_id].elapse_time_sum += +c_elapse_time;
                            boxes[c_id].exec_sum += +c_exec_count;
                            boxes[c_id].remote_time_sum += +c_remote_time;
                        }
                    }
                    else {
                        boxes[c_id] = {
                            t: 'c',
                            id: c_id,
                            name: c_name,
                            type: c_type,
                            elapse_time_sum: +c_elapse_time,
                            exec_sum: +c_exec_count,
                            remote_time_sum: +c_remote_time,
                            tid: [c_tid],
                            lvl: lvl + this.cBasicLvl,
                            txnName: c_txn_name,
                            exception: c_exception,
                            wasType: cWasType,
                            isExistCallTree: !!pathListForCallTree[c_tid]
                        };
                    }
                }

                if (etoeLinkForTxnPath.isUsed &&
                    dest.includes(etoeLinkForTxnPath.destValue)) {
                    boxes[c_id].useLinkPopup = true;
                    boxes[c_id].parentTime = rowData[1];
                    boxes[c_id].parentTid = tid;

                    if (etoeLinkForTxnPath.grouping.make) {
                        boxes[c_id].parentBoxId = p_was;
                    }
                }

                // p node
                if (p_was) {
                    if (boxes[p_was]) {
                        if (boxes[p_was].t === 'c') {
                            if (!nodeTypeChangeList[p_was]) {
                                nodeTypeChangeList[p_was] = 1;
                            }

                            boxes[p_was].t = 'p';
                            boxes[p_was].exec_sum = p_exec_cnt;
                            boxes[p_was].remote_time_sum = p_elapse_time;
                            boxes[p_was].tid = [tid];
                        }
                        else {
                            if (boxes[p_was].tid.indexOf(tid) < 0) {
                                if (!nodeTypeChangeList[p_was]) {
                                    boxes[p_was].elapse_time_sum += p_txn_elapse;
                                }

                                boxes[p_was].tid.push(tid);
                            }
                            boxes[p_was].exec_sum += p_exec_cnt;
                            boxes[p_was].remote_time_sum += p_elapse_time;
                        }
                    }
                    else {
                        boxes[p_was] = {
                            t: 'p',
                            id: p_was + '',
                            name: p_name,
                            type: 'WAS',
                            elapse_time_sum: p_txn_elapse,
                            exec_sum: p_exec_cnt,
                            remote_time_sum: p_elapse_time,
                            tid: [tid],
                            lvl: lvl + this.pBasicLvl,
                            txnName: p_txn_name,
                            exception: p_exception,
                            wasType: pWasType,
                            isExistCallTree: !!pathListForCallTree[tid]
                        };
                    }
                }

                //box connect
                if (p_was && c_id && !fromReply.isExist) {
                    if (etoeLinkForTxnPath.grouping.make && boxes[c_id].useLinkPopup &&
                        boxes[c_id].elapse_time_sum <= groupingCondition) {
                        continue;
                    }

                    connectId = p_was + 'to' + c_id;

                    if (connect[connectId]) {
                        connect[connectId].connect_exec += p_exec_cnt;
                        connect[connectId].connect_elapse += p_elapse_time;
                    }
                    else {
                        connect[connectId] = {
                            from: p_was,
                            to: c_id,
                            connect_elapse: p_elapse_time,
                            connect_exec: p_exec_cnt,
                            dest: dest
                        };
                    }

                    if (isAsyncUsingMethod) {
                        connect[connectId].isAsync = isAsync;
                    }
                }
            }

            if (this.isGroup) {
                var tmpProp, arrExecCnt = {};

                keys = Object.keys(connect);
                for(ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    key = keys[ix];
                    fromId = connect[key].from;
                    toId = connect[key].to;
                    fromNm = this.findBizGrpByWasName(boxes[fromId].name) || boxes[fromId].name;
                    toNm = this.findBizGrpByWasName(boxes[toId].name) || boxes[toId].name;

                    if (fromNm) {
                        fromNm = '_grp-' + fromNm + '_' + boxes[fromId].t + '_';
                    }
                    else {
                        fromNm = fromId;
                    }

                    if (toNm) {
                        toNm = '_grp-' + toNm + '_' + boxes[toId].t + '_';
                    }
                    else {
                        toNm = toId;
                    }

                    if (!arrExecCnt[fromNm]) {
                        arrExecCnt[fromNm] = {
                            exec_cnt : 0
                        };
                    }

                    if (fromNm !== toNm) {
                        tmpProp = fromNm + 'to' + toNm;
                        if (boxes[fromId].t === 'p') {
                            arrExecCnt[fromNm].exec_cnt++;
                        }

                        if (connect[tmpProp]) {
                            if (connect[tmpProp].connect_elapse < connect[key].connect_elapse) {
                                connect[tmpProp] = connect[key];
                            }
                        }
                        else {
                            connect[tmpProp] = connect[key];
                        }

                        connect[tmpProp].from = fromNm;
                        connect[tmpProp].to = toNm;
                    }

                    delete connect[key];
                }

                index = 0;
                keys = Object.keys(boxes);
                for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    key = keys[ix];
                    boxNm = this.findBizGrpByWasName(boxes[key].name) || boxes[key].name;

                    if (boxNm) {
                        tmpProp = '_grp-' + boxNm + '_' +  boxes[key].t + '_';
                        this.arrMapGrp[index] = [key, tmpProp];

                        if (boxes[tmpProp]) {
                            if (boxes[tmpProp].elapse_time_sum < boxes[key].elapse_time_sum) {
                                boxes[tmpProp]  = boxes[key];
                            }
                        }
                        else {
                            boxes[tmpProp]  = boxes[key];
                        }

                        if (boxes[tmpProp].exception < boxes[key].exception) {
                            boxes[tmpProp].exception = boxes[key].exception;
                        }

                        boxes[tmpProp].id = tmpProp;
                        boxes[tmpProp].name = boxNm;

                        if (arrExecCnt[tmpProp]) {
                            boxes[tmpProp].exec_sum = arrExecCnt[tmpProp].exec_cnt;
                            delete arrExecCnt[tmpProp];
                        }

                        delete boxes[key];
                        index++;
                    }
                }
            }

            keys = Object.keys(boxes);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];

                if (!boxes[key]) {
                    continue;
                }

                if (boxes[key].parentBoxId && boxes[key].elapse_time_sum <= groupingCondition) {
                    groupId = groupName + boxes[key].lvl + boxes[key].parentBoxId;
                    if (groupBoxes[groupId]) {
                        groupBoxes[groupId].exec_sum += boxes[key].exec_sum;
                        groupBoxes[groupId].elapse_time_sum += boxes[key].elapse_time_sum;
                        groupBoxes[groupId].txnList.push({
                            name: boxes[key].name,
                            parentTime: boxes[key].parentTime,
                            elapseTime: boxes[key].elapse_time_sum
                        });
                    }
                    else {
                        groupBoxes[groupId] = {
                            t: 'c',
                            id: groupId,
                            fromId: boxes[key].parentBoxId,
                            type: 'NONAME',
                            elapse_time_sum: boxes[key].elapse_time_sum,
                            exec_sum: boxes[key].exec_sum,
                            txnList: [{
                                name: boxes[key].name,
                                parentTime: boxes[key].parentTime,
                                elapseTime: boxes[key].elapse_time_sum
                            }],
                            tid: [''],
                            lvl: boxes[key].lvl,
                            useLinkPopup: true,
                            isExistCallTree: false
                        }
                    }
                }
                else {
                    boxes[key].elapse_time_sum = boxes[key].wasType === 'APIM' ? common.Util.numberWithComma(boxes[key].elapse_time_sum) : this.toMliFix(boxes[key].elapse_time_sum);
                    boxes[key].remote_time_sum = this.toMliFix(boxes[key].remote_time_sum);

                    this.box_design.push(boxes[key]);
                }
            }


            keys = Object.keys(groupBoxes ? groupBoxes : {});
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];

                connectId = groupBoxes[key].fromId + 'to' + groupBoxes[key].id;
                connect[connectId] = {
                    from: groupBoxes[key].fromId,
                    to: groupBoxes[key].id,
                    connect_elapse: boxes[groupBoxes[key].fromId].remote_time_sum * 1000,
                    connect_exec: boxes[groupBoxes[key].fromId].exec_sum
                };

                groupBoxes[key].name = groupName + '(' + groupBoxes[key].txnList.length + ')';
                groupBoxes[key].elapse_time_sum = this.toMliFix(groupBoxes[key].elapse_time_sum);
                groupBoxes[key].txnList = groupBoxes[key].txnList.sort(function (a, b) {
                    return a.elapseTime > b.elapseTime ? -1 : a.elapseTime < b.elapseTime ? 1 : 0;
                }).slice(0, 10);

                this.box_design.push(groupBoxes[key]);
            }

            keys = Object.keys(connect);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];

                if (!connect[key]) {
                    continue;
                }

                connect[key].connect_elapse = this.toMliFix(connect[key].connect_elapse);
                this.box_connect.push(connect[key]);
            }
        }
    };

    this.checkExistParent = function(tid){
        var boxes = this.box_design,
            boxesKeys = Object.keys(boxes),
            boxData, isExist = false,
            ix, ixLen;

        if(!tid){
            return isExist;
        }

        for(ix = 0, ixLen = boxesKeys.length; ix < ixLen; ix++){
            boxData = boxes[boxesKeys[ix]];
            if(boxData.t === 'p'){
                if(boxData.tid.indexOf(tid) !== -1){
                    isExist = true;
                    break;
                }
            }
        }

        return isExist;
    };

    /*
     *  0: "lvl" 1: "time" 2: "tid" 3: "type" 4: "p_was" 5: "WAS_NAME" 6: "txn_id"
     *  7: "TXN_NAME" 8: "method" 9: "c_tid" 10: "was" 11: "c_was_name" 12: "c_txn_id"
     *  13: "c_txn_name" 14: "dest" 15: "p_elapse_time" 16: "c_elapse_time" 17: "p_exec_cnt"
     *  18: "c_exec_cnt" 19: "txn_elapse" 20: "c_txn_elapse" 21: "web_ip" 22: "exception" 23: "c_exception"
     */
    this.defaultJavaDataParser = function(data){
        var c_id = data[4] +'_' + (data[7] || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]\"\\\|\;\.\,]/g, '');
        var wasType = Comm.wasInfoObj[data[4]] ? (Comm.wasInfoObj[data[4]].type || 'WAS') : 'WAS';

        this.box_design.push({
            t : 'p',
            lvl : data[0] + this.pBasicLvl,
            id: c_id,
            name : data[5],
            type : 'WAS',
            exec_sum : 1,
            elapse_time_sum : wasType === 'CD' ? common.Util.toFixed(data[24] || 0) : data[19],
            remote_time_sum : data[15],
            tid: data[2],
            txnName: data[7],
            exception: data[22],
            isMulti : false,
            isExistCallTree: true,
            wasType: wasType === 'CD' ? 'APIM' : wasType
        });

        // Repo에 쌓인 데이터와 wasInfoObj의 Type값이 일치하지 않아 불가피하게 C Daemon을 APIM으로 Converting함.
        // tid_path에서 조회된 데이터의 wasType은 APIM으로 넘어오기 떄문.
    };

    this.createFilter = function(){
        var filterName = this.param.isMicroUnit ? common.Util.TR('Elapse Filter') + ' (' + decodeURI('%C2%B5') + 's)' : common.Util.TR('Elapse Filter');
        var el =
            '<div class="txn-path-filter">'+
            '<input type="number" pattern="[0-9]*" title=" '+common.Util.TR('Please enter only the numbers.')+' " min="0" value="' + this.elapsefilter + '">'+
            '<button class="rtm-btn">' + filterName + '</button>'+
            '</div>';


        var $filter = $(el);
        this.$elapseFileterNumberField = $filter.find('input').on('blur', function() {
            var value = this.$elapseFileterNumberField.val();
            if (value == null || value == '') {
                this.$elapseFileterNumberField.val(this.elapsefilter);
            }
        }.bind(this));
        this.$elapseFileterButton = $filter.find('button').on('click', function(e){
            e.preventDefault();

            var $self = this.$target;
            var elapseValue = this.$elapseFileterNumberField.val();
            var ix, ixLen, jx, jxLen;
            ////var className = null, elapse = null;
            var focusingObj = {};

            if (isNaN(+elapseValue)) {
                return;
            } else if(elapseValue == '') {
                this.$elapseFileterNumberField.val(this.elapsefilter);
                return;
            }

            elapseValue = +elapseValue;

            $self.children().removeClass('focus');

            var $boxs = $self.children('.boxs');
            var $connector = $self.children('svg');
            ////var conLen = $connector.length;
            var $overlay = $self.children('.node-label');
            var convert_elapse = 0;
            var raw_elapse;
            //box
            for(ix=0, ixLen=$boxs.length; ix<ixLen; ix++){

                if(this.param.isMicroUnit) {
                    // raw elapse는 클라이언트 배열데이터를 뜻함
                    if($boxs[ix].dataset.rawelapse !== "undefined") {
                        raw_elapse = $boxs[ix].dataset.rawelapse.split(',');

                        for(jx=0, jxLen=raw_elapse.length; jx<jxLen; jx++) {
                            convert_elapse += $boxs[ix].dataset.wastype === 'APIM' ? +raw_elapse[jx] : +raw_elapse[jx]*1000000;
                        }
                    }
                    else {
                        convert_elapse = $boxs[ix].dataset.wastype === 'APIM' ? +$boxs[ix].dataset.elapse.replace(',', '') : +$boxs[ix].dataset.elapse*1000000;
                    }
                }
                else {
                    if($boxs[ix].dataset.rawelapse !== "undefined") {
                        raw_elapse = $boxs[ix].dataset.rawelapse.split(',');

                        for(jx=0, jxLen=raw_elapse.length; jx<jxLen; jx++) {
                            convert_elapse += +raw_elapse[jx];
                        }
                    }
                    else {
                        convert_elapse = +$boxs[ix].dataset.elapse;
                    }
                }


                if(convert_elapse > elapseValue){
                    $boxs[ix].className += ' focus';
                    focusingObj[$boxs[ix].dataset.id] = true;
                }
            }

            //connecter
////            for(i = 0; i < conLen; i++){
////                className = $connector[i].className.animVal;
////                elapse = +(className.substr(className.indexOf('elapse') + 7, className.lastIndexOf(' ')));
////                //baseVal
////                if(+elapse > elapseValue){
////                    if($connector[i].className.baseVal.indexOf('focus') == -1){
////                        $connector[i].className.baseVal += ' focus';
////                    }
////                }else{
////                    $connector[i].className.baseVal = $connector[i].className.baseVal.replace(' focus', '');
////                }
////            }

            //overlay
            for (ix=0, ixLen=$overlay.length; ix<ixLen; ix++) {
                if ($overlay[ix]) {
                    if (focusingObj[$overlay[ix].childNodes[0].dataset.to]) {
                        $overlay[ix].className += ' focus';

                        if ($connector[ix] && $connector[ix].className.baseVal.indexOf('focus') === -1) {
                            $connector[ix].className.baseVal += ' focus';
                        }
                    } else {
                        if ($connector[ix]) {
                            $connector[ix].className.baseVal = $connector[ix].className.baseVal.replace(' focus', '');
                        }
                    }
                }

////                if($overlay[i].childNodes[0].dataset.elapse > elapseValue){
////                    $overlay[i].className += ' focus';
////                }
            }
        }.bind(this));

        this.$target.append($filter);
    };

    this.createDesign =  function() {
        var result = '';
        var box_design = self.box_design;
        var posMetrix = [];
        var maxNodeCount = 0;

        for(var i = 0 ;i < box_design.length; i++){
            if (box_design[i].type === 'CLIENT') {
                continue;
            }

            if(posMetrix[box_design[i].lvl]){
                posMetrix[box_design[i].lvl].push(box_design[i].id);
            }else{
                posMetrix[box_design[i].lvl] = [box_design[i].id];
            }
        }

        for (var j =0; j < posMetrix.length; j++) {
            if (posMetrix[j] && posMetrix[j].length > maxNodeCount) {
                maxNodeCount = posMetrix[j].length;
            }
        }

////        var pHeight = self.$target.parent().height(),
////            cHeight = maxNodeCount * 80,
////            pWidth = self.$target.parent().width(),
////            cWidth = posMetrix.length * 300;

////      self.$target.height(Math.max(pHeight,cHeight)).width(Math.max(pWidth,cWidth));
////      self.$target.width(Math.max(pWidth,cWidth));

        _.each(box_design, function(idx) {
            var cId = self.converter_id(idx.id),
                isMulti = idx.isMulti ? 'multi' : 'single',
                top = 50,
                dif = 0,
                node = posMetrix[idx.lvl],
                focusCss = '',
                elapseTime = idx.elapse_time_sum,
                leftSize = 320,
                type = idx.type,
                isLastNode = false,
                boxName = idx.name || '&nbsp;',
                convert_elapse = 0,
                timeUnit = '',
                clientInfo = idx.clientInfo,
                elapseList, send, recv, push, totalRT,
                ix, ixLen, left;

            if (idx.t === 'c') {
                for (ix = 0, ixLen = idx.tid.length; ix < ixLen; ix++) {
                    isLastNode = !self.checkExistParent(idx.tid[ix]);
                }

                if (isLastNode) {
                    isMulti = 'single';
                    type = 'LAST_NODE';
                }
            }

            if (idx.type === 'CLIENT') {
                if (clientInfo) {
                    if (clientInfo.push) {
                        type = 'CLIENT_PUSH';
                    }
                    else {
                        type = 'CLIENT';
                    }
                }
                else {
                    type = 'CLIENT_NOT_COLLECTED';
                }
            }

            if (self.param.isMicroUnit) {
                if (idx.raw_elapse) {
                    // C Daemon Client
                    for (ix = 0, ixLen = idx.raw_elapse.length; ix < ixLen; ix++) {
                        convert_elapse += idx.wasType === 'APIM' ? idx.raw_elapse[ix] : idx.raw_elapse[ix] * 1000000;
                    }
                }
                else {
                    convert_elapse = idx.wasType === 'APIM' ? +elapseTime.replace(',', '') : +elapseTime * 1000000;
                }
            }
            else {
                if (idx.raw_elapse) {
                    for (ix = 0, ixLen = idx.raw_elapse.length; ix < ixLen; ix++) {
                        convert_elapse += idx.raw_elapse[ix];
                    }
                }
                else {
                    convert_elapse = +elapseTime;
                }
            }

            if (self.elapsefilter !== 0 && convert_elapse > self.elapsefilter) {
                focusCss = 'focus';
                self.focusingObj[idx.id] = true;
            }

            if (node && node.length !== 1) {
                dif = (100 / (node.length + 1));
                top = dif * (node.indexOf(idx.id) + 1);
            }

            if (idx.lvl === 2 && posMetrix[1] == undefined ){
                leftSize = 220 ;
            }

            left = (idx.lvl * leftSize) + 50;
            if (idx.type === 'CLIENT') {
                left = 50;
                top = 20;
            }

            result += '<div id="' + cId + '" class="boxs ' + type + ' ' + isMulti + ' ' + focusCss + '"data-elapse="' + elapseTime + '" data-tid="' + idx.tid + '" data-type="' + idx.type + '" data-wastype="' + idx.wasType + '" data-rawElapse="' + idx.raw_elapse + '" data-id="' + idx.id +'" style="left:' + left + 'px;top:' + top + '%;">';

            if (idx.type === 'CLIENT') {
                if (idx.wasType === 'APIM') {
                    timeUnit = ' (' + decodeURI('%C2%B5') + 's)';
                }

                result += '<span class="ip" title="' + boxName + '">' + boxName + '</span>';

                if (type !== 'CLIENT_NOT_COLLECTED') {
                    send = (clientInfo.hasOwnProperty('send') ? clientInfo.send + timeUnit : -1);
                    recv = (clientInfo.hasOwnProperty('recv') ? clientInfo.recv + timeUnit : -1);
                    totalRT = (clientInfo.hasOwnProperty('respTime') ? clientInfo.respTime : -1);

                    result += '<span class="send" title="' + send + '">' + send + '</span>';
                    result += '<span class="recv" title="' + recv + '">' + recv + '</span>';

                    if (type === 'CLIENT_PUSH') {
                        push = (clientInfo.hasOwnProperty('push') ? clientInfo.push + timeUnit : -1);
                        result += '<span class="push_recv" title="' + push + '">' + push + '</span>';
                    }

                    result += '<span class="total_resp_time" title="' + totalRT + '">' + totalRT + '</span>';
                }
            }
            else {
                result += '<span class="box_name" title="' + idx.name + '">' + boxName + '</span>';

                if (idx.isExistCallTree) {
                    result += '<span class="call_tree_ico">&nbsp;</span>';
                }

                if (idx.txnName) {
                    result += '<span class="box_txn_name" title="'+ idx.txnName +'">' + idx.txnName + '</span>';
                }

                if (elapseTime !== null) {
                    if (idx.wasType === 'APIM') {
                        elapseTime += ' (' + decodeURI('%C2%B5') + 's)';
                    }

                    result += '<span class="box_elapse">' + elapseTime + '</span>';
                }

                if (idx.type === 'WAS' && !isLastNode) {
                    result += '<span class="box_remote">' + idx.remote_time_sum + '</span>';
                }

                if (!isLastNode) {
                    result += '<span class="box_exec">' + idx.exec_sum + '</span>';
                }

                if (idx.exception) {
                    result += '<span class="box_exception">X</span>';
                }

                if (idx.useLinkPopup) {
                    result += '<div class="link">&nbsp;</div>';
                }

                if (idx.type === 'WAS') {
                    if (self.path_list.indexOf(idx.name + ':' + idx.txnName) < 0) {
                        self.path_list.push(idx.name + ':'+ idx.txnName);
                    }
                }
            }

            if (isMulti === 'multi') {
                result += '<div class="box_ico"></div>';
                result += '<div class="multi_expand"></div>';
            } else {
                result += '<div class="box_ico"></div>';
            }

            result += '</div>';
        });

        this.$target.append(result);

        return result;
    };

    this.jsPlumbConnect = function() {
        console.debug('jsPlumbConenct call..');
        var linecolor = '#000',
            htmlTag = '',
            replyInfos, replyInfo, ix, ixLen;

        try{
            jsPlumb.importDefaults({
                DragOptions: {
                    cursor: 'move',
                    zIndex: 2000
                },
                HoverClass: 'connector-hover'
            });

            replyInfos = self.asyncInfo.replyInfo;
            for (ix = 0, ixLen = replyInfos.length; ix < ixLen; ix++) {
                replyInfo = replyInfos[ix];
                self.box_connect.push({
                    from: replyInfo.srcId,
                    to: replyInfo.destId,
                    gapTime: replyInfo.gapTime,
                    title: 'AO_Time : ' + replyInfo.srcTime + '&#10' + 'AI_Time : ' + replyInfo.destTime,
                    txnName: replyInfo.srcTxnName.replace(/ /gi, ""),
                    dest: replyInfo.srcDest
                });
            }

            _.each(self.box_connect, function(idx) {
                var from = self.converter_id(idx.from),
                    to = self.converter_id(idx.to),
                    color = linecolor,
                    focusing = false,
                    focusCss = '',
                    connectInfo = '',
                    isAsync = false,
                    dest = '';

                if(self.focusingObj[idx.to]){
                    focusing = true;
                    focusCss = 'focus';
                }

                if(idx.dest){
                    if (idx.title) {
                        dest = idx.txnName + '&#10' + idx.title;
                        isAsync = true;
                    }
                    else {
                        dest = idx.dest;
                        htmlTag = '<br/>';
                    }
                }

                if(common.Menu.useTxnPathAsyncMethod && idx.isAsync){
                    connectInfo = dest + htmlTag + idx.connect_exec + ' (async)';
                }
                else if (idx.title) {
                    connectInfo = idx.dest + '<br/>' + 'Gap Time : ' + idx.gapTime + ' s';
                }
                else{
                    if (idx.connect_elapse === null && idx.connect_exec === null) {
                        connectInfo = '';
                    }
                    else {
                        connectInfo = dest + htmlTag + idx.connect_elapse + ' s / ' + idx.connect_exec;
                    }
                }

                var con = jsPlumb.connect({
                    scope: 'path' + self.id,
                    source: from,
                    target: to,
                    // connector: 'Bezier',
                    connector: 'Straight',
//                  hoverPaintStyle:{strokeStyle:"#5d94a6"},
//                  cssClass: 'c1' + (idx%2 == 0? '' : ' c2'),
                    cssClass: focusCss + ' elapse=' + idx.connect_elapse,
                    endpoint: ['Dot', {
                        radius: 2
                    }],
                    anchor: 'AutoDefault',
                    paintStyle: {
                        lineWidth: 1,
                        strokeStyle: color
                    },
                    endpointStyle: {
                        fillStyle: linecolor
                    },
                    overlays: [
                        ['Label', {
                            cssClass: 'node-label' + (focusing ? ' focus' : '') + (isAsync ? ' async' : ''),
                            label: '<div class="node-detail" id="' + from + '_' + 'label" data-elapse="' + idx.connect_elapse + '" data-serverid="' + idx.from + '" data-to="' + idx.to + '" title="' + dest + '">' + connectInfo + '</div>',
                            location: 0.5,
                            id: 'label'
                        }],
                        ['Arrow', {
                            // cssClass: 'l1arrow',
                            location: 1,
                            width: 6,
                            length: 10
                        }]
                    ]
                });

                if(connectInfo === '') {
                    con.hideOverlay('label');
                }

                con.focusing = focusing;
                con.highLighting = true;
            });

        }catch(e){
            console.debug(e);
        }

        $('.boxs')
        .hover(function(){
            jsPlumb.select({source: this.id}).each(function(connection) {
                var className = $(connection.connector.canvas).attr('class');
                if(className.indexOf('opacity') < 0){
                    connection.setPaintStyle({
                        strokeStyle: 'blue',
                        lineWidth: 1.5
                    });

                    $(connection.getOverlays()[0].canvas).addClass('light');
                }
            });
        },function(){
            jsPlumb.select({source: this.id}).each(function(connection) {
                if(connection.focusing){
                    connection.setPaintStyle({
                        strokeStyle: '#f00',
                        lineWidth: 0.5
                    });
                }else{
                    connection.setPaintStyle({
                        strokeStyle: '#505050',
                        lineWidth: 1
                    });
                }
                //if(! connection.highLighting){
                //    $(connection.connector.canvas).css('opacity' , .1);
                //}
                $(connection.getOverlays()[0].canvas).removeClass('light');
            });
        });

        this.$target.children('.boxs')
        .on('dblclick', function(e){
            var target = this.id;
            var $self  = $(this);
            var realId = $self.data('id');
            var $pathView = self.$target;

            $pathView.children('.boxs, .node-label').addClass('opacity');
            $pathView.children('svg').each(function(){
                var $self = $(this);
                var className = $self.attr('class');

                if(className.indexOf('opacity') < 0){
                    $self.attr('class', 'opacity ' + className);
                }
            });

            var connections = jsPlumb.getConnections({scope: 'path' + self.id})|| [];

            for(var i = 0 ;i < connections.length; i++){
                connections[i].highLighting = false;
            }

            downSearch(target, realId, $pathView);
            upSearch(target, realId, $pathView);

            function downSearch(target, realId, $pathView){
                var $node = $pathView.find('#' + target);
                var $t = null;

                if(! $node) {
                    return;
                }

                $node.removeClass('opacity');

                jsPlumb.select({source: target}).each(function(connection) {
                    // overlay
                    $(connection.getOverlays()[0].canvas).removeClass('opacity');

                    $(connection.connector.canvas).each(function() {
                        var $self = $(this);
                        var className = $self.attr('class');
                        $self.attr('class', className.replace('opacity ', ''));
                    });

                    connection.highLighting = true;
                });

                var childs = _.filter(self.box_connect, function(num){
                    return num.from == realId;
                });
                for(var i = 0 ;i < childs.length; i++){
                    $t = $pathView.find('#' + self.converter_id(childs[i].to));
                    downSearch($t.attr('id'), $t.data('id'), $pathView);
                }
            }

            function upSearch(target, realId, $pathView){
                var $node = $pathView.find('#' + target);
                var $t = null;

                if(! $node) {
                    return;
                }

                $node.removeClass('opacity');

                jsPlumb.select({target: target}).each(function(connection) {
                    $(connection.getOverlays()[0].canvas).removeClass('opacity');
                    $(connection.connector.canvas).each(function() {
                        var $self = $(this);
                        var className = $self.attr('class');
                        $self.attr('class', className.replace('opacity ', ''));
                    });
                    connection.highLighting = true;
                });

                var childs = _.filter(self.box_connect, function(num) {
                    return num.to == realId;
                });
                for(var i = 0 ;i < childs.length; i++){
                    $t = $pathView.find('#' + self.converter_id(childs[i].from));
                    upSearch($t.attr('id'), $t.data('id'), $pathView);
                }
            }

            e.stopPropagation();
        });

        this.$target.find('.boxs .call_tree_ico').on('click', function(e) {
            var boxEl = e.target.parentElement,
                tidList = boxEl.getAttribute('data-tid').split(',') || [],
                detailView, callTreeList, pathListForCallTree, callTreePopInfo,
                tid, wasId, listId, ix, ixLen;

            if (tidList.length){
                wasId = boxEl.getAttribute('data-id').split('_')[0] || '';
                detailView = self.param.detail_view;
                callTreeList = detailView.callTreeInfo.dataList;
                pathListForCallTree = detailView.callTreeBuffer;
                callTreePopInfo = detailView.callTreePopUpInfo;
                callTreePopInfo.idList = [];
                callTreePopInfo.tabList = {};

                detailView.loadingMask.showMask();

                for (ix = 0, ixLen = tidList.length; ix < ixLen; ix++) {
                    tid = tidList[ix];
                    listId = '_' + wasId + '_' + tid;

                    callTreePopInfo.idList.push(listId);

                    if (!callTreeList[listId]) {
                        if (!pathListForCallTree[tid]) {
                            tid = self.param.topTid;
                        }

                        detailView.execCallTreeQuery(tid);
                        detailView.execExcludeDataQuery(tid);
                    }
                }

                if (!detailView.callTreeInfo.sqlCount) {
                    detailView.createCallTreeWindow();
                }
            }
        });

        if (common.Menu.etoeLinkForTxnPath.isUsed) {
            this.$target.find('.boxs .link').on('click', function(e) {
                var popupInfo;

                function getPopUpInfo(boxes, id) {
                    var ix, ixLen, result = null;

                    for(ix = 0, ixLen = boxes.length; ix < ixLen; ix++) {
                        if (boxes[ix].id === id) {
                            break;
                        }
                    }

                    if (ix < ixLen) {
                        result = boxes[ix];
                    }

                    return result;
                }

                popupInfo = getPopUpInfo(this.box_design, $(e.target).parent().attr('data-id'));
                if (popupInfo.txnList) {
                    if (popupInfo.txnList.length > 1) {
                        this.createExtLinkListWindow(popupInfo.txnList);
                    }
                    else {
                        this.externalLink(popupInfo.txnList[0]);
                    }
                }
                else {
                    this.externalLink(popupInfo);
                }
            }.bind(this));
        }

        this.$target.parent().on('dblclick', function(){
            var $self = $(this);
            $self.find('path, .boxs, .node-label').removeClass('opacity');
            $self.find('svg').each(function(){
                var $self = $(this);
                var className = $self.attr('class');
                if(className){
                    className = $self.removeClass('opacity');
                    $self.attr('class', className);
                }
            });
        });

        if ( this.$target.find('.boxs').length !== 0 ){
            jsPlumb.draggable(this.$target.find('.boxs'),  { containment: this.$target});
        }
    };

    this.draw = function(){
        this.$target.parent().show();
        this.createDesign();
        this.jsPlumbConnect(this.elapsefilter);
        this.createFilter();
    };



    /* util */

    this.toMliFix = function(value){
        return ((value*1 || 0) / 1000).toFixed(3);
    };

    this.converter_id = function(string) {
        var result = '';
        result = (this.id + '_' + string).
            split(':').join('').
            split(' ').join('').
            split('.').join('').
            split('?').join('').
            split(';').join('').
            split('/').join('').
            split(',').join('').
            split('&').join('').
            split('=').join('').
            split('[').join('').
            split(']').join('').
            split('(').join('').
            split(')').join('').
            split('@').join('').
            split('+').join('').
            split('$').join('').
            split('!').join('').
            split('~').join('').
            split('*').join('').
            split('#').join('').
            split('{').join('').
            split('}').join('').
            split('%').join('');
        return result;
    };


    this.findBizGrpByWasName = function(curVal) {
        var curBizGrpName;
        $.each(Comm.bizGroupWasNamePairObj, function(index, value) {
            for(var ix=0; ix<value.length; ix++) {
                if(value[ix][1] == curVal) {
                    curBizGrpName = index;
                }
            }
        });

        return curBizGrpName;
    };

    this.externalLink = function(popupInfo) {
        var popupOptions = 'scrollbars=yes, width=1500, height=1000',
            guid, logDay, logTime, url;

        guid = '?gid=' + popupInfo.name.split('+')[1];
        logDay = '&logday=' + Ext.Date.format(new Date(popupInfo.parentTime), 'Ymd');
        logTime = '&logtm=' + Ext.Date.format(new Date(popupInfo.parentTime), 'His');
        url = common.Menu.etoeLinkForTxnPath.url + guid + logDay + logTime;

        window.open(url, 'link_popup', popupOptions);
    };

    this.createExtLinkListWindow = function(links) {
        var grid, linkInfo, ix, ixLen;

        if (this.extLinkListWindow) {
            this.extLinkListWindow.removeAll();
        }

        this.extLinkListWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('List of External Link'),
            width: 360,
            height: 310,
            minWidth: 360,
            minHeight: 310,
            layout: 'vbox',
            closable: true,
            modal: true
        });

        grid = Ext.create('Exem.BaseGrid', {
            baseGridCls : 'baseGridRTM',
            usePager: false,
            itemdblclick: function(view, record) {
                if (!record || !record.data || !record.data.guid) {
                    return;
                }

                this.externalLink(record.data);
            }.bind(this)
        });

        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Name'), 'name', 120, Grid.String, false, true);
        grid.addColumn(common.Util.CTR('Parent Time'), 'parentTime', 120, Grid.String, false, true);
        grid.addColumn(common.Util.CTR('GUID'), 'guid', 250, Grid.String, true, false);
        grid.addColumn(common.Util.CTR('Elapse Time'), 'elapseTime', 80, Grid.Float, true, false);
        grid.endAddColumns();

        this.extLinkListWindow.add(grid);

        for (ix = 0, ixLen = links.length; ix < ixLen; ix++) {
            linkInfo = links[ix];
            grid.addRow([
                linkInfo.name,
                linkInfo.parentTime,
                linkInfo.name.split('+')[1],
                linkInfo.wasType === 'APIM' ? common.Util.numberWithComma(linkInfo.elapseTime) : self.toMliFix(linkInfo.elapseTime)
            ])
        }

        grid.drawGrid();

        this.extLinkListWindow.show();
    };

    this.initArgument(arg);

    return this;
};