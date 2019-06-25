Ext.define ('common.Util', {
    singleton : true,

    printErr: function(errorStr, callee) {
        console.debug('%c' + '[Error] ' + errorStr, 'color:Red;');
        console.debug('Caller :', arguments.callee.caller);
        console.debug('callee :', callee);
    },

    // return format: yyyy-mm-dd
    getDateFormat: function(dateOrg) {
        var date = new Date(dateOrg);
        return String(date.getFullYear()) + '-' +
                (date.getMonth() + 1 < 10 ? '0' : '') +
                String(date.getMonth() + 1) + '-' +
                (date.getDate() < 10 ? '0' : '') + String(date.getDate());
    },

    // return format: h24:mi:ss
    getTime: function(time) {
        var date;
        if (!time) {
            date = new Date();
        } else {
            date = new Date(time);
        }
        return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ':' +
                (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    },

    /** 사용하지않는 함수 주석처리
    getYMD: function(time) {
        var date;
        if (!time) {
            date = new Date();
        } else {
            date = new Date(time);
        }
        return  date.getFullYear() + "-" +
                date.getMonth() + 1 + "-" +
                date.getDate() ;
    },

    getHourMinute: function(time) {
        var date = new Date(parseInt(time));
        var h = date.getHours(),
                m = date.getMinutes();
        return '' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    },
     */

    getDate: function(time) {
        var date = new Date(time);
        var y = date.getFullYear(),
            M = date.getMonth() + 1,
            d = date.getDate(),
            h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();
        return '' + y + '-' + (M < 10 ? '0' + M : M) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },

    getUTCDate: function(time) {
        var date = new Date(time);
        var y = date.getUTCFullYear(),
            M = date.getUTCMonth() + 1,
            d = date.getUTCDate(),
            h = date.getUTCHours(),
            m = date.getUTCMinutes(),
            s = date.getUTCSeconds();
        return '' + y + '-' + (M < 10 ? '0' + M : M) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },

    /** 사용하지않는 함수 주석처리
    getUTCTime: function(time) {
        var date;
        if (!time) {
            date = new Date();
        } else {
            date = new Date(time);
        }
        return (date.getUTCHours()   < 10 ? '0' : '') + date.getUTCHours()   + ":" +
                (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes() + ":" +
                (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds();
    },

    getDateNoSecond: function(time) {
        var date = new Date(time);
        var y = date.getFullYear(),
                M = date.getMonth() + 1,
                d = date.getDate(),
                h = date.getHours(),
                m = date.getMinutes();
                //s = date.getSeconds()
        return '' + y + '-' + (M < 10 ? '0' + M : M) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    },

    dateDiffInDays: function() {
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Discard the time and time-zone information.
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    },

    getLogTime: function() {
        return  "[" + this.getTime() + "]";
    },

    getLogTimestamp: function() {
        var milliSec = new Date().getMilliseconds();
        return "[" + this.getTime() + '.' + (milliSec < 100 ? '0' : '') + (milliSec < 10 ? '0' : '') + milliSec + ']';
    },

    getNextTenMinTime: function(dateOrg) {
        var time = new Date(dateOrg);
        var date = this.getDateFormat(time);
        var nextTenMin = function(time) {
            return String(Math.floor(time.getMinutes()/10)*10);
        };
        var dateTime = date + ' ' + (time.getHours()<10?'0':'') + time.getHours() +
                ":" + nextTenMin(time) + ":00";

        var tenMinFloored = new Date(dateTime);
        tenMinFloored.setMinutes(tenMinFloored.getMinutes()+10);

        return tenMinFloored;
    },

    indexedObjToArray: function(obj) {
        var arr = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                arr.push(obj[i]);
            }
        }
        return arr;
    },
     */

    // 배열내에 중복된 요소 제거
    extractDupArray: function(arr) {
        var dups = {};
        return arr.filter(function(el) {
            var hash = el.valueOf();
            var isDup = dups[hash];
            dups[hash] = true;
            return !isDup;
        });
    },

    /**
     * XAPM_BIND_SQL_ELAPSE 테이블의 BIND_LIST 값을 변환
     *  주의: 입력값은 MSSQL이라면 다음처럼 미리 변환해서 줘야함.
     *       cast(cast(bind_list as varbinary)as varchar)
     *
     * INPUT
     *  header - 1byte : total length;
     *  content
     *            1 byte : idx (  0 = name bind , else idx)
     *            1 byte : type
     *            1 byte : bind length
     *                   (bind lenght) byte : value
     *
     * OUTPUT
     *  [{code: number, value: string},
     *   {...}]
     */
    convertBindList : function(bindList) {
        var i = 0,
            totLength = 0,
            result = [],
            range = 2,
            pos = 0,
            idx = 0,
            type = 0,
            bind_length = 0,
            bind_name = null,
            bind_value = null,

            byte = 2,
            short = 4,
            integer = 8,
            double = 16;



        var bindSubString = function(range) {
            var str = bindList.substr(pos, range);
            pos += range;
            return str;
        };

        // hex to decimal
        var h2d = function(val) {
            return parseInt(val , 16);
        };
        // hex to float
        var h2f = function(val) {

            var hex = parseInt('0x' + val);

            return (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2,23) * Math.pow(2,  ((hex >> 23 & 0xff) - 127));
        };
        // hex to double
        var h2lf = function(val) {
            // var hex = parseInt('0x' + val)
            var high = parseInt('0x' + val.slice(0, 8));
            var low = parseInt('0x' + val.slice(8, 16));
            var e = (high >> 52 - 32 & 0x7ff) - 1023;

            return (high & 0xfffff | 0x100000) * 1.0 / Math.pow(2,52 - 32) * Math.pow(2, e) + low * 1.0 / Math.pow(2, 52) * Math.pow(2, e);
        };
        // hex to character
        var h2c = function(val) {
            var str = '',
                ix, ixLen;

            try {
                for (ix = 0, ixLen = val.length; ix < ixLen; ix += 2) {
                    str += String.fromCharCode(parseInt(val.substr(ix, 2), 16));
                }

                return decodeURIComponent(escape(str));
            } catch (e) {
                return '';
            } finally {
                i = null;
                str = null;
            }
        };

        if (bindList) {
            // header
            totLength = h2d(bindSubString(range));

            for (i = 0; i < totLength; i++) {
                idx = h2d(bindSubString(range));

                if (idx == 0) {
                    bind_length = h2d(bindSubString(range));
                    bind_name = h2c(bindSubString(bind_length * 2));

                    idx = '\'' + bind_name + '\'';
                }

                type = h2d(bindSubString(range));

                switch (type) {
                    // null
                    case 0 : bind_value = null;
                        break;
                    // boolean
                    case 1 :
                        bind_value = h2d(bindSubString(byte));
                        bind_name = 'boolean';
                        if (bind_value == 0) {
                            bind_value = false;
                        } else {
                            bind_value = true;
                        }

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // byte
                    case 2 :
                        bind_value = h2d(bindSubString(byte));
                        bind_name = 'byte';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // short
                    case 3 :
                        bind_value = h2d(bindSubString(short));
                        bind_name = 'short';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // integer
                    case 4 :
                        bind_value = h2d(bindSubString(integer));
                        bind_name = 'integer';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // long int
                    case 5 :
                        bind_value = h2d(bindSubString(double));
                        bind_name = 'long int';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // float (single)
                    case 6 :
                        bind_value = h2f(bindSubString(integer));
                        bind_name = 'float';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // double
                    case 7 :
                        bind_value = h2lf(bindSubString(double));
                        bind_name = 'double';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // int64
                    case 8 :
                        bind_value = h2d(bindSubString(double));
                        bind_name = 'int64';

                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    // string
                    case 9 :
                        bind_length = h2d(bindSubString(byte));
                        bind_value = h2c(bindSubString(bind_length * 2));
                        bind_name = 'string';
                        result.push({
                            code: idx,
                            value : '\'' + bind_value + '\''
                        });
                        break;
                    // date yyyy-mm-dd
                    case 10 :
                        bind_value = h2d(bindSubString(double));
                        bind_name = 'date';

                        bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.NONE);

                        result.push({
                            code : idx,
                            value : '\'' + bind_value + '\''
                        });
                        break;
                    // time hh:mm:ss
                    case 11 :
                        bind_value = h2d(bindSubString(double));
                        bind_name = 'time';

                        bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.HIS);

                        result.push({
                            code : idx,
                            value : '\'' + bind_value + '\''
                        });
                        break;
                    // time stamp yyyy-mm-dd hh:mm:ss
                    case 12 :
                        bind_value = h2d(bindSubString(double));
                        bind_name = 'time_stamp';

                        bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.HMSMS);

                        result.push({
                            code : idx,
                            value : '\'' + bind_value + '\''
                        });
                        break;
                    // bytes
                    case 13 :
                        bind_length = h2d(bindSubString(byte));
                        bind_value = h2d(bindSubString(bind_length * 2));
                        bind_name = 'bytes';
                        result.push({
                            code : idx,
                            value : bind_value
                        });
                        break;
                    default : break;
                }
            }
        }
        return result;
    },

    // 숫자에 콤마를 넣어 스트링 반환
    numberWithComma: function(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // WAS_ID로 속해있는 GROUP_NAME 리턴
    getGroupNameByWasId: function(wasid) {
        var tmp = '',
            keys, key, ix, ixLen, jx, jxLen;

        keys = Object.keys(Comm.bizGroupWasIdPairObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (Comm.bizGroupWasIdPairObj.hasOwnProperty(key)) {
                for (jx = 0, jxLen = Comm.bizGroupWasIdPairObj[key].length; jx < jxLen; jx++) {
                    if (Comm.bizGroupWasIdPairObj[key][jx] == wasid) {
                        tmp = key;
                        if (tmp != '') {
                            break;
                        }
                    }
                }
            }
        }
        if (tmp === '') {
            tmp = undefined;
        }
        return tmp;
    },

    getGroupNameByWasName: function(wasname) {
        var wasid = 0,
            keys, key, ix, ixLen;

        keys = Object.keys(Comm.wasInfoObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (Comm.wasInfoObj.hasOwnProperty(key) && Comm.wasInfoObj[key].wasName == wasname) {
                wasid = key;
                break;
            }
        }
        return this.getGroupNameByWasId(wasid);
    },

    getWasIdbyName: function(wasname) {
        var tmp,
            keys, key, ix, ixLen;

        keys = Object.keys(Comm.wasInfoObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (Comm.wasInfoObj.hasOwnProperty(key) && Comm.wasInfoObj[key].wasName == wasname) {
                tmp = key;
                break;
            }
        }
        return tmp;
    },

    // DB_ID로 DBNAME 알아내기
    getDBNameById: function(dbid) {
        var tmp = '',
            keys, key, ix, ixLen;

        keys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];
            if (Comm.dbInfoObj.hasOwnProperty(key) && key == dbid) {
                tmp = Comm.dbInfoObj[key].instanceName;
                break;
            }
        }
        return tmp;
    },

    getDBIdByName: function(dbName) {
        var tmp,
            keys, key, ix, ixLen;

        keys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];
            if (Comm.dbInfoObj.hasOwnProperty(key) && Comm.dbInfoObj[key].instanceName == dbName) {
                tmp = key;
                break;
            }
        }
        return tmp;
    },

    getActiveTxnState: function(state) {
        var temp = '',
            ix, ixLen;

        for (ix = 0, ixLen = realtime.ActiveTxnStateArr.length; ix < ixLen; ix++) {
            if (realtime.ActiveTxnStateArr[ix][0] == state) {
                temp = realtime.ActiveTxnStateArr[ix][1];
                break;
            }
        }
        return temp;
    },

    cutOffTxnExtName: function(txnName) {
        if (txnName.indexOf(']') !== -1) {
            return txnName.substring(txnName.lastIndexOf(']') + 2);
        } else {
            return txnName;
        }
    },

    numberFixed: function(number, point) {
        number += '';

        if (number.indexOf('.') > 0) {
            return (+number).toFixed(point).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else {
            return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    },

    toFixed: function(number, point) {
        var temp = (+number).toFixed(point);
        var dotPos = temp.indexOf('.');
        var integer = null;

        if (dotPos == -1) {
            integer = temp;
            return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else {
            integer = temp.substring(0, dotPos);
            return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + temp.substring(dotPos, temp.length);
        }

    },

    /**
     * 지정된 소수점 만큼 잘라서 반환하는 함수
     *
     * @param {number | string} value - 변환 값
     * @param {number} decimals - 소수점
     * @return {number}
     */
    decimalsFixed: function(value, decimals) {

        /* 소수점을 잘라서 반환하는 다른 내용 예
         * return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
         */

        if (value != null && decimals > 0) {
            value = Number(Ext.Number.toFixed(+value, decimals));
        }
        return value;
    },


    isInt: function(value) {
        return (typeof value === 'number' && value % 1 == 0);
    },

    isFloat: function(value) {
        return (typeof value === 'number' && Math.abs( value % 1 ) > 0);
    },

    lPad: function(s, c, n) {
        if (! s || ! c || ! n) {
            return s;
        }

        s += '';

        var max = (n - s.length) / c.length,
            ix, ixLen;

        for (ix = 0, ixLen = max; ix < ixLen; ix++) {
            s = c + s;
        }

        return s;
    },

    TR : function(key, replacement) {
        if (key.indexOf('JVM') >= -1 && window.Comm && Comm.wasAppTypeFlag) {
            if (Comm.wasAppTypeFlag.isDotNet) {
                if (Comm.wasAppTypeFlag.isJava) {
                    key = key.replace('JVM', 'JVM(.NET)');
                } else {
                    key = key.replace('JVM', '.NET');
                }
            }
        }

        var msgMap = window.msgMap,
            str, prefix, ix, ixLen;

        if (replacement == null) {
            if (!msgMap) {
                return key;
            } else {
                return msgMap[key] || key;
            }
        } else {
            str = msgMap[key] || key;
            prefix = '%';

            if (Array.isArray(replacement)) {
                for (ix = 0, ixLen = replacement.length; ix < ixLen; ix++) {
                    str = str.replace(new RegExp(prefix + parseInt(ix + 1), 'g'), replacement[ix]);
                }

                return str;
            } else {
                return str.replace(/%1/g, replacement);
            }
        }
    },

    CTR : function(key) {
        if (key.indexOf('JVM') >= -1 && window.Comm && Comm.wasAppTypeFlag) {
            if (Comm.wasAppTypeFlag.isDotNet) {
                if (Comm.wasAppTypeFlag.isJava) {
                    key = key.replace('JVM', 'JVM(.NET)');
                } else {
                    key = key.replace('JVM', '.NET');
                }
            }
        }

        if (!window.Comm || !Comm.web_env_info) {
            if (localStorage.getItem('Intermax_MyLanguage') === 'ja') {
                return key;
            } else {
                return window.msgMap[key] || key;
            }
        } else if (window.Comm && Comm.web_env_info.Intermax_MyLanguage === 'ja' || window.nation === 'ja') {
            return key;
        } else {
            return window.msgMap[key] || key;
        }
    },

    /**
     * EtoETransactionMonitor에서 사용할 모든 비즈니스 아이디를 수집하는 메소드
     *
     * @param {Integer | String} business_id
     * @return {Array} business_id 이하 모든 하위 business_id를 담은 배열
     */
    getAllBizList: function(bizId) {
        var ix, ixLen, jx, jxLen;
        var treeKey, keyList, keyObj, split, retArr;

        keyList = Comm.metaTreeKey;
        keyObj  = {};
        retArr  = [];

        if (typeof bizId === 'string') {
            bizId = +bizId;
        }

        // 모든 트리키가 있는 리스트를 검색해서 bizId에 해당하는 트리키 수집
        for (ix = 0, ixLen = keyList.length; ix < ixLen; ix++) {
            treeKey = keyList[ix];

            if (+treeKey.split('-')[0] === bizId) {
                split = treeKey.split('-');

                for (jx = 0, jxLen = split.length; jx < jxLen; jx++) {
                    if (!keyObj[split[jx]]) {
                        keyObj[split[jx]] = 1;
                    }
                }
            }
        }

        for (ix in keyObj) {
            retArr.push(ix);
        }

        return retArr;
    },

    getURLCheck: function() {
        var result;

        result = 'rtm.view.rtmView';
        window.loginMode = 'RTM';
        window.RTMShow = true;

        return result;
    },

    openMyView: function() {
        var className, testTab, classType, srcName, title,
            keys, key, ix, ixLen;

        if (String(Comm.web_env_info['Intermax_MyView']) !== 'null') {
            className = common.Util.getURLCheck();
            testTab = Ext.create(className, common.Menu.getClassConfig(className.substring(className.lastIndexOf('.') + 1)));

            if (window.loginMode === 'RTM') {
                //실시간 화면에 WAS 모니터링 탭 이름 설정
                testTab.title = common.Util.TR('AI Monitor');
                window.RTMShow = true;
            } else {
                title = '';

                keys = Object.keys(common.Menu.mainMenuData);
                for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    key = keys[ix];

                    if (common.Menu.mainMenuData.hasOwnProperty(key) && common.Menu.mainMenuData[key].cls == className) {
                        title = common.Menu.mainMenuData[key].text;
                        break;
                    }
                }

                testTab.title = title;

                classType = className.split('.');
                srcName   = classType[classType.length - 1];
                common.DataModule.timeInfo.lastFormType = srcName;
            }
        } else {
            className = common.Util.getURLCheck(); /* common.Menu.defaultView.className, */
            testTab = Ext.create(className, common.Menu.getClassConfig(className.substring(className.lastIndexOf('.') + 1)));
            if (window.loginMode === 'RTM') {
                //실시간 화면에 WAS 모니터링 탭 이름 설정
                testTab.title = common.Util.TR('AI Monitor');
                window.RTMShow = true;
            } else {
                if (Comm.Lang === 'ko') {
                    testTab.title = '<span style="font-family: NanumGothic; font-size: 11px;">' + common.Util.TR(common.Menu.defaultView.title) + '</span>';
                } else {
                    testTab.title = '<span style="font-family: Droid Sans; font-size: 8pt;">' + common.Util.TR(common.Menu.defaultView.title) + '</span>';
                }
                classType = className.split('.');
                srcName   = classType[classType.length - 1];
                common.DataModule.timeInfo.lastFormType = srcName;
            }
        }

        if (window.loginMode === 'RTM' || testTab.title === common.Util.TR('Default View')) {
            testTab.closable = false;
            testTab.reorderable = false; // 탭 패널 순서를 변경하지 못하게 고정하는 옵션
        } else {
            testTab.closable = true;
        }
        Ext.getCmp('viewPort').getComponent('mainTab').add(testTab);
        Ext.getCmp('viewPort').getComponent('mainTab').setActiveTab(testTab);
        testTab.init();
    },

    setClipboard: function(copyStr) {
        Comm.clipboard.value = copyStr;
        Comm.clipboard.focus();
        setTimeout(function() {
            Comm.clipboard.select();
        },0);
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

    codeBitToMethodType : function(code) {
        var result = '';

        if ((code & 1) > 0 ) {
            result = result + 'loop,';
        }

        if ((code & 2) > 0 ) {
            result = result + 'synchronized,';
        }

        if ((code & 4) > 0 ) {
            result = result + 'new alloc,';
        }

        if ((code & 64) > 0 ) {
            result = result + 'exit,';
        }

        if ((code & 128) > 0 ) {
            result = result + 'gc,';
        }

        if ((code & 256) > 0 ) {
            result = result + 'arraycopy,';
        }

        if ((code & 4096) > 0 ) {
            result = result + 'classloader,';
        }

        if ((code & 8192) > 0 ) {
            result = result + 'thread,';
        }

        if ((code & 16384) > 0 ) {
            result = result + 'reflect,';
        }

        if ((code & 32768) > 0 ) {
            result = result + 'io,';
        }

        if ((code & 65536) > 0 ) {
            result = result + 'net,';
        }

        if ((code & 131072) > 0 ) {
            result = result + 'nio,';
        }

        if ((code & 2097152) > 0 ) {
            result = result + 'enumeration,';
        }

        if ((code & 4194304) > 0 ) {
            result = result + 'iterator,';
        }

        if ((code & 8388608) > 0 ) {
            result = result + 'strbuffer,';
        }

        if ((code & 16777216) > 0 ) {
            result = result + 'strtoken,';
        }

        if ((code & 33554432) > 0 ) {
            result = result + 'blob,';
        }

        if ((code & 67108864) > 0 ) {
            result = result + 'clob,';
        }

        if ((code & 134217728) > 0 ) {
            result = result + 'xml,';
        }

        if ((code & 536870912) > 0 ) {
            result = result + 'ejb,';
        }

        if (typeof code === 'string') {
            return code;
        }
        return result.slice(0, result.length - 1);
    },

    wasColorScale: function(id) {
        var wasIdSortedByWasName = _.chain(Comm.wasInfoObj)
            .map(function(d, wasId) {
                return [Number(wasId), d.wasName];
            })
            .sortBy(function(d) {
                return d[1];
            })
            .map(function(d) {
                return d[0];
            }).value();

        var scales = d3.scale.ordinal().domain(wasIdSortedByWasName).range(Colors);

        return scales(id);
    },

    //  nation 에 따른 date Format type 얻어오기
    getLocaleType: function(format) {
        var aYear = 'Y-m-d';
        var temp = [];
        var selectedMonth = false;

        if (format == DisplayTimeMode.YM) {
            aYear = 'Y-m';
            selectedMonth = true;
        }

        switch (nation) {
            case 'ko' :
                break;
            case 'zh-CN':
            case 'ja' :
                aYear = aYear.replace(/-/g, '/');
                break;
            case 'en' :
                aYear = aYear.replace(/-/g, '/');
                if (aYear[0].toUpperCase() === 'Y') {
                    temp.push('/' + aYear[0]);
                    if (!selectedMonth) {
                        temp.unshift('/d');
                    }
                    temp.unshift('m');
                    aYear = temp.join('');
                }
                break;
            default:
                break;
        }

        switch (format) {

            case DisplayTimeMode.HMS:
                return  aYear + ' H:i:s';

            case DisplayTimeMode.HM:
                return  aYear + ' H:i';

            case DisplayTimeMode.H:
                return  aYear + ' H';

            case DisplayTimeMode.None:
            case DisplayTimeMode.YM:
                return  aYear;

            case DisplayTimeMode.HMSMS:
                return  aYear + ' H:i:s.u';

            default:
                break;
        }
    },

    deepObjCopy: function(dupeObj) {
        if (!dupeObj) {
            return;
        }

        var retObj = null,
            keys, objInd, ix, ixLen;
        if (typeof(dupeObj) === 'object') {
            retObj = {};

            if (typeof(dupeObj.length) !== 'undefined') {
                retObj = [];
            }

            keys = Object.keys(dupeObj);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                objInd = keys[ix];

                if (dupeObj.hasOwnProperty(objInd)) {
                    if (typeof(dupeObj[objInd]) === 'object') {
                        retObj[objInd] = this.deepObjCopy(dupeObj[objInd]);
                    } else if (typeof(dupeObj[objInd]) === 'string' || typeof(dupeObj[objInd]) === 'number') {
                        retObj[objInd] = dupeObj[objInd];
                    } else if (typeof(dupeObj[objInd]) === 'boolean') {
                        ((dupeObj[objInd] === true) ? retObj[objInd] = true : retObj[objInd] = false);
                    }
                }
            }
        }

        try {
            return retObj;
        } finally {
            retObj = null;
            dupeObj = null;
        }
    },

    /** 사용하지 않는 함수 주석처리.
    QuotedStr: function(str) {
        return '\'' + str + '\'';
    },
     */

    usedFont: function(size, text) {
        var result;
        if (window.nation === 'ko') {
            result = '<span style="padding-left: 0px; padding-top: 0px; letter-spacing: 0pt; font-family: NanumGothic; font-size: ' + size + 'pt">' + text + '</span>';
        } else {
            result = '<span style="padding-left: 0px; padding-top: 0px; font-family: &quot;Droid Sans&quot;; font-size: ' + size + 'pt">' + text + '</span>';
        }
        return result;
    },

    getBetweenDate: function(todate, fromdate) {
        return Math.floor((+todate - +fromdate) / 86400000 );
    },

    getVersion: function() {
        var token = window.BuildNumber.split('.');

        return {
            major: +token[0],
            minor: +token[1],
            build: +token[2]
        };
    },

    checkOverVersion: function(version) {
        return common.Util.checkSupportVersion(version, 'OVER');
    },

    checkSupportVersion: function(version, type) {
        if (version == null) {
            return true;
        }

        var isSupport = true;
        var clientVersion = common.Util.getVersion();

        var token = version.split('.');

        if (token == null || token.length < 3) {
            return isSupport;
        }
        var major = +token[0];
        var minor = +token[1];
        var build = +token[2];

        switch (type) {
            case 'OVER' :
                if (clientVersion.major < major) {
                    isSupport = false;

                } else if (clientVersion.major === major) {
                    if (clientVersion.minor < minor) {
                        isSupport = false;

                    } else if (clientVersion.minor = minor && clientVersion.build < build) {
                        isSupport = false;
                    }
                }
                break;

            case 'UNDER':
                if (clientVersion.major > major) {
                    isSupport = false;

                } else if (clientVersion.major === major) {
                    if (clientVersion.minor > minor) {
                        isSupport = false;

                    } else if (clientVersion.minor = minor && clientVersion.build > build) {
                        isSupport = false;
                    }
                }
                break;
            default:
                isSupport = true;
                break;
        }

        try {
            return isSupport;
        } finally {
            clientVersion = null;
            token         = null;
        }

    },

    /** 사용하지 않는 함수 주석처리.
    compareIpAddress: function(baseIP, targetIP) {
        if (baseIP == null || targetIP == null) {
            return false;
        }
        if (typeof baseIP !== 'string' || typeof targetIP !== 'string') {
            return false;
        }

        var baseArr = baseIP.split('.');
        var targetArr = targetIP.split('.');
        var isOk = true;

        if (baseArr.length > 4 || targetArr.length !== 4) {
            return false;
        }

        if (baseArr.length !== 4 && baseArr[baseArr.length-1] !== '*') {
            return false;
        }

        for (var ix = 0; ix < baseArr.length; ix++) {
            if (baseArr[ix] !== '*' && baseArr[ix] !== targetArr[ix]) {
                isOk = false;
                break;
            }
        }
        return isOk;
    },

    checkExecuteEnvirInfo: function() {
        console.debug('');
        console.group('Environment');
        // Core
        console.debug('CPU : %s Core', navigator.hardwareConcurrency);
        // Graphic
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext("experimental-webgl");
        var ext = gl.getExtension("WEBGL_debug_renderer_info");
        console.debug('Graphic : %s', gl.getParameter( ext.UNMASKED_RENDERER_WEBGL ));
        // version
        console.debug('Chrome Version : %s', navigator.appVersion);
        console.groupEnd();
        console.debug('');
    },
     */

    getUniqueSeq: function() {
        return '_' + (+new Date());
    },

    checkSQLExecValid: function(header, data) {
        var ix, ixLen;

        if (header.success === false) {
            return false;
        }

        if (!data || typeof data === 'string') {
            return false;
        }

        if (data.length > 1) {
            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                if (!data[ix].rows) {
                    return false;
                }
            }
        } else {
            if (!data.rows) {
                return false;
            }
        }

        return true;
    },

    isUsedMemoryDB: function() {
        var isUsed = false,
            ix, ixLen;

        for (ix = 0, ixLen = Comm.repositoryInfo.length; ix < ixLen; ix++) {
            if (Comm.repositoryInfo[ix].database_type === 'memory') {
                isUsed = true;
                break;
            }
        }
        return isUsed;
    },


    hashCode: function(str) {
        var ret, i, len;
        for (ret = 0, i = 0, len = str.length; i < len; i++) {
            ret = (31 * ret + str.charCodeAt(i)) << 0;
        }
        return ret;
    },

    longToByteArray: function(long) {
        // we want to represent the input as a 8-bytes array
        //var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        var byteArray = [0, 0, 0, 0];
        var byte, index;

        for (index = 0; index < byteArray.length; index ++) {
            byte = long & 0xff;
            byteArray [ index ] = byte;
            long = (long - byte) / 256;
        }

        return byteArray;
    },

    getLongToIP: function(long) {
        var addrs = common.Util.longToByteArray(long);
        var ip = addrs.reverse().join('.');

        return ip;
    },

    /**
     * Multi Repository 사용유무를 반환.
     *
     * @return {boolean} true: Multi Repository, false: Single Repository
     */
    isMultiRepository: function() {
        var isMulti = false;
        var repository, ix, ixLen;

        if (Comm.repositoryInfo && Comm.repositoryInfo.length > 2) {
            for (ix = 0, ixLen = Comm.repositoryInfo.length; ix < ixLen; ix++) {
                repository = Comm.repositoryInfo[ix];

                if (repository.database_default === false && repository.database_name !== 'memory') {
                    isMulti = true;
                    break;
                }
            }
        }
        try {
            return isMulti;
        } finally {
            repository = null;
        }
    },
    hexIpToDecStr: function(hexIp) {
        var ix, iy, ixLen, decIp = [], retDecIp = '';
        for (ix = 0, iy = 2, ixLen = hexIp.length; ix < ixLen; ix += 2, iy += 2) {
            decIp.push(hexIp.slice(ix, iy));
        }

        for (ix = 0, ixLen = decIp.length; ix < ixLen; ix++) {
            decIp[ix] = parseInt(decIp[ix], 16);
            if (ix == ixLen - 1) {
                retDecIp += decIp[ix];
            } else {
                retDecIp += decIp[ix] + '.';
            }
        }

        return retDecIp;
    },

    strIpToHex: function(strIp) {
        var arrIp, convertIp, retHexIp = '';
        var ix, ixLen, hex = [], hexValue = [], pos, posArr = [], likePos;


        pos = strIp.indexOf('%');
        while (pos > -1) {
            posArr.push(pos);
            pos = strIp.indexOf('%', ++pos);
        }

        convertIp = strIp;
        if (posArr.length) {
            if (posArr.length > 1) {
                convertIp = strIp.substring(posArr[0] + 1, posArr[posArr.length - 1]);
                likePos = 'both';
            } else {
                if (posArr[0] < strIp.length - 1) {
                    convertIp = strIp.substring(posArr[0] + 1, strIp.length);
                    likePos = 'left';
                } else {
                    convertIp = strIp.substring(0, posArr[0]);
                    likePos = 'right';
                }
            }
        }

        arrIp = convertIp.split('.');
        for (ix = 0, ixLen = arrIp.length; ix < ixLen; ix++) {
            if (!arrIp[ix].length) {
                continue;
            }
            hex[ix] = parseInt(arrIp[ix]).toString(16).toUpperCase();
            hexValue[ix] = (parseInt(hex[ix], 16) < parseInt(10, 16)) ? '0' + hex[ix] : hex[ix];

            retHexIp += hexValue[ix];
        }

        switch (likePos) {
            case 'both':
                retHexIp = '%' + retHexIp + '%';
                break;
            case 'left':
                retHexIp = '%' + retHexIp;
                break;
            case 'right':
                retHexIp = retHexIp + '%';
                break;
            default :
                break;
        }

        return retHexIp;
    },

    /**
     * Multi Repository인 경우 database name 목록을 반환.
     *
     * @return {array} database name 목록
     */

    /**사용하지 않는 함수 주석처리.
    getRepositoryNames: function() {
        var repository;
        var repoNames = [];

        if (Comm.repositoryInfo && Comm.repositoryInfo.length > 2) {
            for (var ix = 0, ixLen = Comm.repositoryInfo.length; ix < ixLen; ix++) {
                repository = Comm.repositoryInfo[ix];

                if (repository.database_default === false && repository.database_name !== 'memory') {
                    repoNames[repoNames.length] = repository.database_name;
                    break;
                }
            }
        }
        try {
            return repoNames;
        } finally {
            repository = null;
            repoNames = null;
        }
    },
     */


    /**
     * 기본 데이터베이스 이름을 반환
     *
     * @return {string} - default database name
     */
    getDefaultDatabaseName: function() {
        var repository, repoName,
            ix, ixLen;

        if (Comm.repositoryInfo) {
            for (ix = 0, ixLen = Comm.repositoryInfo.length; ix < ixLen; ix++) {
                repository = Comm.repositoryInfo[ix];

                if (repository.database_default === true) {
                    repoName = repository.database_name;
                    break;
                }
            }
        }

        try {
            return repoName;
        } finally {
            repository = null;
        }
    },


    /**
     * 단어 첫글자를 대문자로 변경해서 반환
     * ex) 'base'      --> 'Base'
     *     'base ball' --> 'Base Ball'
     *
     * @param {string} str - 변경 대상 문자
     * @return {string} - 변경한 무자
     */
    initCap: function(str) {
        var value;
        if (str) {
            value = str.replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
        }
        return value;
    },

    /**
     * Close Component Window
     */
    closeComponentWindow: function() {
        while (Ext.WindowManager.zIndexStack.items.length > 0) {
            Ext.WindowManager.zIndexStack.items[0].close();
        }
    },

    /**
     * Destroy Component Window
     */
    destroyComponentWindow: function() {
        while (Ext.WindowManager.zIndexStack.items.length > 0) {
            Ext.WindowManager.zIndexStack.items[0].destroy();
        }
    },

    /**
     * Hide Component Window
     */
    hideComponentWindow: function($className) {
        var ix, ixLen;
        for (ix = 0, ixLen = Ext.WindowManager.zIndexStack.items.length; ix < ixLen; ix++) {
            if (Ext.WindowManager.zIndexStack.items[ix].$className === 'Ext.menu.Menu') {
                continue;
            }

            if (Ext.WindowManager.zIndexStack.items[ix].openViewType) {

                //Detail Frame
                if (Ext.WindowManager.zIndexStack.items[ix].openViewType === realtime.rtmViewClassObj[$className]) {
                    Ext.WindowManager.zIndexStack.items[ix].el.dom.style.display = 'none';
                }

            } else if (Ext.WindowManager.zIndexStack.items[ix].config.items) {

                //RTM Frame
                if (Ext.WindowManager.zIndexStack.items[ix].config.items.openViewType === realtime.rtmViewClassObj[$className]) {
                    Ext.WindowManager.zIndexStack.items[ix].el.dom.style.display = 'none';
                }

            }
        }
    },

    /**
     * Show Component Window
     */
    showComponentWindow: function($className) {
        var ix, ixLen;
        for (ix = 0, ixLen = Ext.WindowManager.zIndexStack.items.length; ix < ixLen; ix++) {

            if (Ext.WindowManager.zIndexStack.items[ix].openViewType) {

                //Detail Frame
                if (Ext.WindowManager.zIndexStack.items[ix].openViewType === realtime.rtmViewClassObj[$className]) {
                    Ext.WindowManager.zIndexStack.items[ix].el.dom.style.display = '';
                }

            } else if (Ext.WindowManager.zIndexStack.items[ix].config.items) {

                //RTM Frame
                if (Ext.WindowManager.zIndexStack.items[ix].config.items.openViewType === realtime.rtmViewClassObj[$className]) {
                    Ext.WindowManager.zIndexStack.items[ix].el.dom.style.display = '';
                }

            }
        }
    },

    /**
     * Destroy Config Component Window
     * RTM, PA : Eexm.XMWindow
     * Config = Exem.Window
     */
    destroyConfigComponentWindow: function() {
        var ix;
        for (ix = Ext.WindowManager.zIndexStack.items.length; ix > 0; ix--) {
            if (Ext.WindowManager.zIndexStack.items[ix - 1].$className === 'Exem.Window') {
                Ext.WindowManager.zIndexStack.items[ix - 1].destroy();
            }
        }
    },

    getDiffDays: function(first, second) {
        return (new Date(second).setHours(0,0,0,0) - new Date(first).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24);
    },

    /**
     * 브라우저 설정 언어 코드 반환
     * 한국어, 일본어 외 언어는 지원하지 않으므로 영어로 반환.
     *
     * @return {string} 언어 코드
     */
    getLocalLang: function() {
        var local = window.nation || navigator.language;

        switch (local) {
            case 'ko':
                local = 'ko';
                break;
            case 'en':
            case 'zh-CN':
                local = 'en';
                break;
            case 'ja':
                local = 'ja';
                break;
            default:
                local = 'en';
                break;
        }
        return local;
    },


    /**
    * toLowerCase()의 Array버전
    *
    * @return {array}
    */
    toLowerCaseArray: function(array) {
        if (Array.isArray(array) == false) {
            return;
        }

        var ix, ixLen;

        for ( ix = 0, ixLen = array.length; ix < ixLen; ix++ ) {
            array[ix] = array[ix].toLowerCase();
        }

        return array;
    }
});
