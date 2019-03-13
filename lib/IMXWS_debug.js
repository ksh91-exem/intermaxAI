/**
 * @author dollee

 packet 관련 event 는 function(header, json) 형식으로 파라메터를 정해 주어야 한다.

 2013-06-18 - IE 호환 작업 돌임.

 */


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
//
if (typeof Zlib === "undefined")
{
    var urlMatches = urlParseRE.exec(document.currentScript.src);

    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = urlMatches[4] + urlMatches[5] + urlMatches[6] + urlMatches[14] + "zlib.min.js";                        // 기본 lib/ 디렉토리는 변경이 없다는 가정...

    // Fire the loading
    head.appendChild(script);

    head = null;
    script = null;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Base64 library
// Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var PKT_CLIENT_RES_ALARM_HISTORY = 200;
var PKT_CLIENT_RES_SERVICE_INFO = 201;
var PKT_CLIENT_RES_ACTIVITY = 202; // ACTIVE_RANGE_COUNT 를 포함하는 TXN의 BEGIN/ END 카운트 패킷
var PKT_CLIENT_RES_WAS_STAT = 203;
var PKT_CLIENT_RES_DB_CPU_USAGE = 204;
var PKT_CLIENT_RES_DB_STAT = 205;
var PKT_CLIENT_RES_SQL_ELAPSE = 206;  // WAS TXN 별 SQL MAX ELAPSE TIME 을 전송
var PKT_CLIENT_RES_ACTIVE_TXN = 207;  // ACTIVE TXN LIST, 이 패킷은 데이터가 없는 경우에도 1건의 STRUCTURE 형태를 전송하게 되어있습니다.
// 이 경우를 NULL PACKET 이라고 칭하며 NULL PACKET과 일반 패킷의 구분은 패킷헤더의 두번째 인자인
// SIZE 가 1647( : 최소패킷사이즈) 일 경우 NULL 로 인지합니다.
// NULL 이 아닌 실제 1건의 TXN LIST 일 경우 SIZE 에 헤더의 길이가 포함됩니다. ( 1647 + 11 )
// NULL PACKET 인 경우도 WAS_ID, 와 TIME 은 실제 데이터를 전송합니다.
var PKT_CLIENT_RES_POOL_MONITOR = 208;
var PKT_CLIENT_RES_LOG_HISTORY = 209;
var PKT_CLIENT_RES_PROCESS_MONITOR = 210;
var PKT_CLIENT_RES_JVM_GC_MAX = 211;
var PKT_CLIENT_RES_JVM_GC_STAT = 212;
var PKT_CLIENT_RES_LOCK_INFO = 213;
var PKT_CLIENT_RES_WS_STAT = 216;
var PKT_CLIENT_RES_WS_OS_STAT = 217;

var PKT_WEB_SOCKET_NH_GLB = 218;

var PKT_CLIENT_RES_SERVER_STATUS = 219;
var PKT_CLIENT_RES_RECENT_TOP_TXN = 230;
var PKT_CLIENT_RES_RECENT_TOP_SQL = 231;
var PKT_CLIENT_RES_RECENT_TOP_EXCEPTION = 232;
//var PKT_CLIENT_RES_DG_TIMEZONE = 233; // 연결시 최초 한번 전송. 클라이언트와 서비스의 타임존 극복을 위해 데이터게더 로컬의 타임존OFFSET 전송
var PKT_CLIENT_RES_WEB_ACTIVE = 234; // WEBCALL ACTIVE 데이터 전송
var PKT_CLIENT_RES_WEB_ACTIVE_SUM = 236;
var PKT_CLIENT_RES_RTM_SUMMARY = 237;
var PKT_CLIENT_RES_WAS_TXN_SUMMARY = 238;
var PKT_CLIENT_RES_WAS_DB_TXN_SUMMARY = 239;
var PKT_CLIENT_RES_WAS_SESSION_COUNT = 240;
var PKT_CLIENT_RES_TOP_WAS_INFO = 241;
var PKT_CLIENT_RES_HOST_GROUP_INFO = 242;
var PKT_CLIENT_RES_WAS_TPS = 243;
var PKT_CLIENT_RES_WAS_TXN_ELAPSE = 244;
var PKT_CLIENT_RES_DASHBOARD_TXN_COUNT = 245;
var PKT_WEB_SOCKET_WAS_STAT_OS = 250;
var PKT_WEB_SOCKET_WAS_STAT_BANK = 251;

// addMethod - By John Resig (MIT Licensed)
// javascript  에서 overload 구현.
/*
 // 아래와 같이 정의하고...
 function Users(){}
 addMethod(Users.prototype, "find", function(){
 // Find all users...
 });
 addMethod(Users.prototype, "find", function(name){
 // Find a user by name
 });
 addMethod(Users.prototype, "find", function(first, last){
 // Find a user by first and last name
 });

 // 아래와 같이 사용 한다.
 var users = new Users();
 users.find(); // Finds all
 users.find("John"); // Finds users by name
 users.find("John", "Resig"); // Finds users by first and last name
 users.find("John", "E", "Resig"); // Does nothing

 */
function _addMethod(aobject, name, fn)
{
    "use strict";

    var old; // = object[name];
    if (typeof aobject[name] !== "undefined")
    {
        old = aobject[name];
        aobject[name] = (function ()
        {
            if (fn.length === arguments.length)
            {
                return fn.apply(this, arguments);
            }
            else if (typeof old === "function")
            {
                return old.apply(this, arguments);
            }
        });
    }
    else
    {
        aobject[name] = fn;
    }
}

// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt

/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
        c = array[i++];
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
            case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                ((char2 & 0x3F) << 6) |
                ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}


// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

var IMXWS = (function ()
{
//function IMXWS() {

    "use strict";

    var _self = this;
    var _WSHost = "";
    var _WSPort = 0;

    // WebSocket object
    var _IMXWSConn;
    //   push  받을  packet  목록
    var _IMXWS_Packets = new Array();
    var _IMXWS_Was_Servers = new Array();
    var _IMXWS_DB_Servers = new Array();
    var _IMXWS_Web_Servers = new Array();

//    var _IMXWS_Options = new Array();
//    var _IMXWS_Options = {};

    var _PushData = false;

//	var _ExtractHeader = true;

    var _JobQueue = {};

    var _WSAlivePingTimer;
    var _WSCheckConnectionTimer;
    var _WSLiveSendTimer;
    var _parseJSON = false;
//	var _SQLExtractHeader = true;

    var _DBList = new Array();
    var _DefaultDB = "";

    var _PluginList = new Array();


    var _NeedCallInitialize = false;

    var _KeepConnection = false;

    var _JS_Debug_Level = 0;       // none

    var _IsConnOpened = false;

//    var _Option_Listener = new Array();
    var _Option_Listener = {};

    var _DeepDelete = true;

    var _DebuggingLevel = 8;       // exception log 를 받도록 함.

    var _CompSize = 0;  // compress size 0 - 압축 안함 (서버 설정에 따름), 1 - 모두 압축함, n - n bytes 보다 크면 압축 함.

    Object.defineProperty(this, "CONNECTION", {
        get: function ()
        {
            return 0;
        }
    });

    Object.defineProperty(this, "OPEN", {
        get: function ()
        {
            return 1;
        }
    });

    Object.defineProperty(this, "CLOSING", {
        get: function ()
        {
            return 2;
        }
    });

    Object.defineProperty(this, "CLOSED", {
        get: function ()
        {
            return 3;
        }
    });

    Object.defineProperty(this, "NOASSIGNED", {
        get: function ()
        {
            return 4;
        }
    });

    Object.defineProperty(this, "BIND_VALUES_ONLY", {
        get: function ()
        {
            return 0;
        }
    });

    Object.defineProperty(this, "BIND_PAIR", {
        get: function ()
        {
            return 1;
        }
    });

    Object.defineProperty(this, "BIND_PAIR_WITH_TYPE", {
        get: function ()
        {
            return 2;
        }
    });

    Object.defineProperty(this, "JS_DEBUG_NONE", {
        get: function ()
        {
            return 0;
        }
    });

    Object.defineProperty(this, "JS_DEBUG_INFO", {
        get: function ()
        {
            return 1;
        }
    });

    Object.defineProperty(this, "JS_DEBUG_RESULT", {
        get: function ()
        {
            return 2;
        }
    });

    Object.defineProperty(this, "JS_DEBUG_WARNING", {
        get: function ()
        {
            return 3;
        }
    });

    Object.defineProperty(this, "JS_DEBUG_ERROR", {
        get: function ()
        {
            return 4;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_HTTP", {
        get: function ()
        {
            return 1;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_WEBSOCKET", {
        get: function ()
        {
            return 2;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_DATAGATHER", {
        get: function ()
        {
            return 4;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_EXCEPTION", {
        get: function ()
        {
            return 8;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_CRITICAL", {
        get: function ()
        {
            return 8;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_WARNING", {
        get: function ()
        {
            return 16;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_INFO", {
        get: function ()
        {
            return 32;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_RESULT", {
        get: function ()
        {
            return 64;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_ALL_EXCEPTION", {
        get: function ()
        {
            return 128;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_ALL_CRITICAL", {
        get: function ()
        {
            return 128;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_ALL_WARNING", {
        get: function ()
        {
            return 256;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_ALL_INFO", {
        get: function ()
        {
            return 512;
        }
    });

    Object.defineProperty(this, "DEBUG_LEVEL_ALL_RESULT", {
        get: function ()
        {
            return 1024;
        }
    });

// event 변수 목록...
    // onconnect
    // function(){};
    var _OnConnect;

    Object.defineProperty(this, "onConnect", {
        get: function ()
        {
            return _OnConnect;
        },
        set: function (afunc)
        {
            _OnConnect = afunc;
        }
    });

    Object.defineProperty(this, "onconnect", {
        get: function ()
        {
            return this.onConnect;
        },
        set: function (afunc)
        {
            this.onConnect = afunc;
        }
    });

    var _DoConnect = (function (AEvent, AScope)
    {
        if (typeof _OnConnect === "function")
        {
            try
            {
                _OnConnect(AEvent, AScope);
            } catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onconnect: ' + e.message);
                }
            }
        }
    });

    // ondisconnect
    // function(){};
    var _OnDisConnect;

    Object.defineProperty(this, "onDisconnect", {
        get: function ()
        {
            return _OnDisConnect;
        },
        set: function (afunc)
        {
            _OnDisConnect = afunc;
        }
    });

    Object.defineProperty(this, "ondisconnect", {
        get: function ()
        {
            return this.onDisconnect;
        },
        set: function (afunc)
        {
            this.onDisconnect = afunc;
        }
    });

    var _DoDisconnect = (function (AEvnet, AScope)
    {
        if (typeof _OnDisConnect === "function")
        {
            try
            {
                _OnDisConnect(AEvent, AScope);
            } catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.ondisconnect: ' + e.message);
                }
            }
        }
    });

    // onmessage
    // function(aheader, adata);
    var _OnMessage;

    Object.defineProperty(this, "onMessage", {
        get: function ()
        {
            return _OnMessage;
        },
        set: function (afunc)
        {
            _OnMessage = afunc;
        }
    });

    Object.defineProperty(this, "onmessage", {
        get: function ()
        {
            return this.onMessage;
        },
        set: function (afunc)
        {
            this.onMessage = afunc;
        }
    });

    var _DoMessage = (function (AHeader, AData, AScope)
    {
        if (typeof _OnMessage === "function")
        {
//            try
//            {
            _OnMessage(AHeader, AData, AScope);
//            } catch (e)
//            {
//                console.log('IMXWS.onmessage: ' + e.message);
//            }
        }
    });

    // onsqlexec;
    // function(aheader, adata);
    var _OnSQLExec;

    Object.defineProperty(this, "onSQLExec", {
        get: function ()
        {
            return _OnSQLExec;
        },
        set: function (afunc)
        {
            _OnSQLExec = afunc;
        }
    });

    Object.defineProperty(this, "onsqlexec", {
        get: function ()
        {
            return this.onSQLExec;
        },
        set: function (afunc)
        {
            this.onSQLExec = afunc;
        }
    });

    var _DoSQLExec = (function (AHeader, AData, AScope)
    {
        if (typeof _OnSQLExec === "function")
        {
//            try
//            {
            _OnSQLExec(AHeader, AData, AScope);
//            } catch (e)
//            {
//                console.log('IMXWS.onsqlexec: ' + e.message);
//            }
        }
    });

    // onsqlexec;
    // function(aheader, adata);
    var _OnStoredProcExec;

    Object.defineProperty(this, "onStoredProcExec", {
        get: function ()
        {
            return _OnStoredProcExec;
        },
        set: function (afunc)
        {
            _OnStoredProcExec = afunc;
        }
    });

    Object.defineProperty(this, "onstoredprocexec", {
        get: function ()
        {
            return this.onStoredProcExec;
        },
        set: function (afunc)
        {
            this.onStoredProcExec = afunc;
        }
    });

    var _DoStoredProcExec = (function (AHeader, AData, AScope)
    {
        if (typeof _OnStoredProcExec === "function")
        {
//            try
//            {
            _OnStoredProcExec(AHeader, AData, AScope);
//            } catch (e)
//            {
//                console.log('IMXWS.onsqlexec: ' + e.message);
//            }
        }
    });

    // ondgpacket;
    // function(aheader, adata);
    var _OnDataGather;

    Object.defineProperty(this, "onDataGather", {
        get: function ()
        {
            return _OnDataGather;
        },
        set: function (afunc)
        {
            _OnDataGather = afunc;
        }
    });

    Object.defineProperty(this, "ondatagather", {
        get: function ()
        {
            return this.onDataGather;
        },
        set: function (afunc)
        {
            this.onDataGather = afunc;
        }
    });

    var _DoDataGather = (function (AHeader, AData, AScope)
    {
        if (typeof _OnDataGather === "function")
        {
//            try
//            {
            _OnDataGather(AHeader, AData, AScope);
//            }
//            catch (e)
//            {
//                console.log('IMXWS.ondatagather: ' + e.message);
//            }
        }
    });

    // onfunction;
    // function(aheader, adata);
    var _OnFunction;

    Object.defineProperty(this, "onFunction", {
        get: function ()
        {
            return _OnFunction;
        },
        set: function (afunc)
        {
            _OnFunction = afunc;
        }
    });

    Object.defineProperty(this, "onfunction", {
        get: function ()
        {
            return this.onFunction;
        },
        set: function (afunc)
        {
            this.onFunction = afunc;
        }
    });

    var _DoFunction = (function (AHeader, AData, AScope)
    {
        if (typeof _OnFunction === "function")
        {
            try
            {
                _OnFunction(AHeader, AData, AScope);
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onfunction: ' + e.message);
                }
            }
        }
    });

    // onpushdata
    // function(aheader, adata);
    var _OnPushData;

    Object.defineProperty(this, "onPushData", {
        get: function ()
        {
            return _OnPushData;
        },
        set: function (afunc)
        {
            _OnPushData = afunc;
        }
    });

    Object.defineProperty(this, "onpushdata", {
        get: function ()
        {
            return this.onPushData;
        },
        set: function (afunc)
        {
            this.onPushData = afunc;
        }
    });

    var _DoPushData = (function (AHeader, AData)
    {
        if (typeof _OnPushData === "function")
        {
//            try
//            {
            _OnPushData(AHeader, AData);
//            }
//            catch (e)
//            {
//                console.log('IMXWS.onpushdata: ' + e.message);
//            }
        }
    });

    // onconfig
    // function(aheader, adata)
    // websocket daemon 에서 접속후 필요한 db 정보를 전달 한다.
    var _OnConfig;

    Object.defineProperty(this, "onConfig", {
        get: function ()
        {
            return _OnConfig;
        },
        set: function (afunc)
        {
            _OnConfig = afunc;
        }
    });

    Object.defineProperty(this, "onconfig", {
        get: function ()
        {
            return this.onConfig;
        },
        set: function (afunc)
        {
            this.onConfig = afunc;
        }
    });

    var _DoConfig = (function (AHeader, AData, AScope)
    {
        if (typeof _OnConfig === "function")
        {
            try
            {
                _OnConfig(AHeader, AData, AScope);
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onConfig: ' + e.message);
                }
            }
        }
    });

    var _OnInitialize;

    Object.defineProperty(this, "onInitialize", {
        get: function ()
        {
            return _OnInitialize;
        },
        set: function (afunc)
        {
            _OnInitialize = afunc;
        }
    });

    Object.defineProperty(this, "oninitialize", {
        get: function ()
        {
            return this.onInitialize;
        },
        set: function (afunc)
        {
            this.onInitialize = afunc;
        }
    });

    var _DoInitialize = (function ()
    {
        if (typeof _OnInitialize === "function")
        {
            try
            {
                _OnInitialize();
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onInitialize: ' + e.message);
                }
            }
        }
    });

    var _OnJavaScript;

    Object.defineProperty(this, "onJavaScript", {
        get: function ()
        {
            return _OnJavaScript;
        },
        set: function (afunc)
        {
            _OnJavaScript = afunc;
        }
    });

    Object.defineProperty(this, "onjavascript", {
        get: function ()
        {
            return this.onJavaScript;
        },
        set: function (afunc)
        {
            this.onJavaScript = afunc;
        }
    });

    var _DoJavaScript = (function (aheader, adata, AScope)
    {
        if (typeof _OnJavaScript === "function")
        {
            try
            {
                _OnJavaScript(aheader, adata, AScope);
            }
            catch(e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("IMXWS.onJavaScript: '" + e.message);
                }
            }
        }
    });

    var _OnJavaScriptDebug;

    Object.defineProperty(this, "onJavaScriptDebug", {
        get: function()
        {
            return _OnJavaScriptDebug;
        },
        set: function(afunc)
        {
            _OnJavaScriptDebug = afunc;
        }
    });

    var _DoJavaScriptDebug = (function (aheader, adata, AScope)
    {
        if (typeof _OnJavaScriptDebug === "function")
        {
            try
            {
                _OnJavaScriptDebug(aheader, adata, AScope);
            }
            catch(e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("IMXWS.onJavaScriptDebug: '" + e.message);
                }
            }
        }
        else
        {
            // onjavascriptdebug 가 연결 돼 있지 않으면...
            // console 에 쏴 준다...

            if (_DebuggingLevel && _self.DEBUG_LEVEL_RESULT)
            {
                console.log("javascript file: " + aheader.script_name + "\n" +
                "Level: " + aheader.command + "\n" +
                "message: " + (aheader.message));
            }
        }
    });

    Object.defineProperty(this, "onjavascriptdebug", {
        get: function()
        {
            return this.onJavaScriptDebug;
        },
        set: function(afunc)
        {
            this.onJavaScriptDebug = afunc;
        }
    });

    Object.defineProperty(this, "onJavaScript_Debug", {
        get: function()
        {
            return this.onJavaScriptDebug;
        },
        set: function(afunc)
        {
            this.onJavaScriptDebug = afunc;
        }
    });

    Object.defineProperty(this, "onjavascript_debug", {
        get: function()
        {
            return this.onJavaScriptDebug;
        },
        set: function(afunc)
        {
            this.onJavaScriptDebug = afunc;
        }
    });

    var _OnJavaScriptPush;

    Object.defineProperty(this, "onJavaScriptPush", {
        get: function()
        {
            return _OnJavaScriptPush;
        },
        set: function(afunc)
        {
            _OnJavaScriptPush = afunc;
        }
    });

    Object.defineProperty(this, "onjavascriptpush", {
        get: function()
        {
            return this.onJavaScriptPush;
        },
        set: function(afunc)
        {
            this.onJavaScriptPush = afunc;
        }
    });

    Object.defineProperty(this, "onJavaScript_Push", {
        get: function()
        {
            return this.onJavaScriptPush;
        },
        set: function(afunc)
        {
            this.onJavaScriptPush = afunc;
        }
    });

    Object.defineProperty(this, "onjavascript_push", {
        get: function()
        {
            return this.onJavaScriptPush;
        },
        set: function(afunc)
        {
            this.onJavaScriptPush = afunc;
        }
    });

    var _DoJavaScriptPush = (function (aheader, adata)
    {
        if (typeof _OnJavaScriptPush === "function")
        {
            try
            {
                _OnJavaScriptPush(aheader, adata);
            }
            catch(e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("IMXWS.onJavaScriptPush: '" + e.message);
                }
            }
        }
    });

    var _OnPluginFunction;

    Object.defineProperty(this, "onPluginFunction", {
        get: function()
        {
            return _OnPluginFunction;
        },
        set: function(afunc)
        {
            _OnPluginFunction = afunc;
        }
    });

    Object.defineProperty(this, "onpluginfunction", {
        get: function()
        {
            return this.onPluginFunction;
        },
        set: function(afunc)
        {
            this.onPluginFunction = afunc;
        }
    });

    var _DoPluginFunction = (function (aheader, adata, AScope)
    {
        if (typeof _OnPluginFunction === "function")
        {
            try
            {
                _OnPluginFunction(aheader, adata, AScope);
            }
            catch(e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("IMXWS.onPluginFunction: '" + e.message);
                }
            }
        }
    });

    var _OnDebuggingMessage;

    Object.defineProperty(this, "onDebuggingMessage", {
        get: function()
        {
            return _OnDebuggingMessage;
        },
        set: function(afunc)
        {
            _OnDebuggingMessage = afunc;
        }
    });

    Object.defineProperty(this, "ondebuggingmessage", {
        get: function()
        {
            return this.onDebuggingMessage;
        },
        set: function(afunc)
        {
            return this.onDebuggingMessage = afunc;
        }
    });

    Object.defineProperty(this, "onDebugging_Message", {
        get: function()
        {
            return this.onDebuggingMessage;
        },
        set: function(afunc)
        {
            return this.onDebuggingMessage = afunc;
        }
    });

    Object.defineProperty(this, "ondebugging_message", {
        get: function()
        {
            return this.onDebuggingMessage;
        },
        set: function(afunc)
        {
            return this.onDebuggingMessage = afunc;
        }
    });

    var _DoDebuggingMessage = (function (aheader, adata)
    {
        if (typeof _OnDebuggingMessage === "function")
        {
            try
            {
                _OnDebuggingMessage(aheader, adata);
            }
            catch(e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("IMXWS.onDebuggingMessage: '" + e.message);
                }
            }
        }
        else
        {
            // onjavascriptdebug 가 연결 돼 있지 않으면...
            // console 에 쏴 준다...

            if (_DebuggingLevel && _self.DEBUG_LEVEL_RESULT)
            {
                var ALogMsg = "Debuggging Message Arrived\n";

                if (adata != null)
                {
                    if (adata.class != undefined && adata.method != undefined)
                    {
                        ALogMsg += "Class & Method : " + adata.class + "." + adata.method + "\n";
                    }
                    else if (adata.class != undefined)
                    {
                        ALogMsg += "Class : " + adata.class + "\n";
                    }
                    else if (adata.method != undefined)
                    {
                        ALogMsg += "Method : " + adata.method + "\n";
                    }

                    if (adata.result_message != undefined)
                    {
                        ALogMsg += "Message : " + adata.result_message;
                    }
                }

                console.log(ALogMsg);
                ALogMsg = null;
            }
        }
    });


    // isPushData
    Object.defineProperty(this, "isPushData", {
        get: function ()
        {
            return _PushData;
        }
    });

    Object.defineProperty(this, "ispushdata", {
        get: function ()
        {
            return this.isPushData;
        }
    });

    // Host
    Object.defineProperty(this, "Host", {
        get: function ()
        {
            return _WSHost;
        },
        set: function (ahost)
        {
            _WSHost = ahost;
        }
    });

    Object.defineProperty(this, "host", {
        get: function ()
        {
            return this.Host;
        },
        set: function (ahost)
        {
            this.Host = ahost;
        }
    });

    // Port
    Object.defineProperty(this, "Port", {
        get: function ()
        {
            return _WSPort;
        },
        set: function (aport)
        {
            _WSPort = aport;

            if (_WSPort == 0 || _WSPort == "" || _WSPort == null || _WSPort == undefined)
            {
                _WSPort = 80;
            }
        }
    });

    Object.defineProperty(this, "port", {
        get: function ()
        {
            return this.Port;
        },
        set: function (aport)
        {
            this.Port = aport;
        }
    });

    /*
     // parseJSON
     Object.defineProperty(this, "parseJSON", {
     get : function() { return _parseJSON; },
     set : function(abool) { _parseJSON = abool; }
     });


     Object.defineProperty(this, "parsejson", {
     get : function() { return this.parseJSON; },
     set : function(abool) { this.parseJSON = abool; }
     });

     Object.defineProperty(this, "parse_json", {
     get : function() { return this.parseJSON; },
     set : function(abool) { this.parseJSON = abool; }
     });
     */

    // ExtractHeader
    /*
     Object.defineProperty(this, "ExtractHeader", {
     get : function() { return _ExtractHeader; },
     set : function(aonoff) {
     if (_ExtractHeader != aonoff) {
     _ConfigExtractHeader(aonoff);
     }
     }
     });

     Object.defineProperty(this, "extractheader", {
     get : function() { return this.ExtractHeader; },
     set : function(aonoff) { this.ExtractHeader = aonoff; }
     });

     // SQLExtractHeader
     Object.defineProperty(this, "SQLExtractHeader", {
     get : function() { return _SQLExtractHeader; },
     set : function(aonoff) { _SQLExtractHeader = aonoff; }
     });

     Object.defineProperty(this, "sqlextractheader", {
     get : function() { return this.SQLExtractHeader; },
     set : function(aonoff) { this.SQLExtractHeader = aonoff; }
     });
     */

    // AllPackets
    Object.defineProperty(this, "AllPackets", {
        get: function ()
        {
            return _IMXWS_Packets[0];
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                this.ReceiveAllPackets();
            }
            else
            {
                this.ReceiveSelectedPackets();
            }
        }
    });

    Object.defineProperty(this, "allpackets", {
        get: function ()
        {
            return this.AllPackets;
        },
        set: function (aonoff)
        {
            this.AllPackets = aonoff;
        }
    });

    // ConnectState
    Object.defineProperty(this, "ConnectState", {
        get: function ()
        {
            if (typeof _IMXWSConn == "undefined" || _IMXWSConn == null)
            {
                return IMXWS.NOASSIGNED;
            }
            else if (typeof _IMXWSConn === "object" || typeof _IMXWSConn === "function")
            {
                return _IMXWSConn.readyState;
            }
        }
    });

    Object.defineProperty(this, "connectstate", {
        get: function ()
        {
            return this.ConnectState;
        }
    });

    Object.defineProperty(this, "connect_state", {
        get: function ()
        {
            return this.ConnectState;
        }
    });

    Object.defineProperty(this, "DeepDelete", {
        get: function ()
        {
            return _DeepDelete;
        },
        set: function (AOnOff)
        {
            _DeepDelete = AOnOff;
        }
    });

    Object.defineProperty(this, "deepdelete", {
        get: function ()
        {
            return this.DeepDelete;
        },
        set: function (AOnOff)
        {
            this.DeepDelete = AOnOff;
        }
    });

    Object.defineProperty(this, "Deep_Delete", {
        get: function ()
        {
            return this.DeepDelete;
        },
        set: function (AOnOff)
        {
            this.DeepDelete = AOnOff;
        }
    });

    Object.defineProperty(this, "deep_delete", {
        get: function ()
        {
            return this.DeepDelete;
        },
        set: function (AOnOff)
        {
            this.DeepDelete = AOnOff;
        }
    });

    // PushData
    Object.defineProperty(this, "PushData", {
        get: function ()
        {
            return _PushData;
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                this.PushDataOn();
            }
            else
            {
                this.PushDataOff();
            }
        }
    });
    Object.defineProperty(this, "pushdata", {
        get: function ()
        {
            return this.PushData;
        },
        set: function (aonoff)
        {
            this.PushData = aonoff;
        }
    });

    // ReceiveAllServers
    Object.defineProperty(this, "AllServers", {
        get: function ()
        {
            if (_IMXWS_Was_Servers.length == 0 && _IMXWS_DB_Servers.length == 0 && _IMXWS_Web_Servers.length == 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                _ReceiveAllServers();
            }
        }
    });

    Object.defineProperty(this, "allservers", {
        get: function ()
        {
            return this.AllServers;
        },
        set: function (aonoff)
        {
            this.AllServers = aonoff;
        }
    });

    // ReceiveAllWasServers
    Object.defineProperty(this, "AllWasServers", {
        get: function ()
        {
            if (_IMXWS_Was_Servers.length == 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                _ReceiveAllWasServers();
            }
        }
    });

    Object.defineProperty(this, "allwasservers", {
        get: function ()
        {
            return this.AllWasServers;
        },
        set: function (aonoff)
        {
            this.AllWasServers = aonoff;
        }
    });

    // ReceiveAllDBServers
    Object.defineProperty(this, "AllDBServers", {
        get: function ()
        {
            if (_IMXWS_DB_Servers.length == 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                _ReceiveAllDBServers();
            }
        }
    });

    Object.defineProperty(this, "alldbservers", {
        get: function ()
        {
            return this.AllDBServers;
        },
        set: function (aonoff)
        {
            this.AllDBServers = aonoff;
        }
    });

    // ReceiveALlWebServers
    Object.defineProperty(this, "AllWebServers", {
        get: function ()
        {
            if (_IMXWS_Web_Servers.length == 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        set: function (aonoff)
        {
            if (aonoff)
            {
                _ReceiveAllWebServers();
            }
        }
    });

    Object.defineProperty(this, "allwebservers", {
        get: function ()
        {
            return this.AllWebServers;
        },
        set: function (aonoff)
        {
            this.AllWebServers = aonoff;
        }
    });

    Object.defineProperty(this, "WasServers", {
        get: function ()
        {
            var AResult = new Array();

            AResult.push(_IMXWS_Was_Servers);

            return AResult;
        },
        set: function (was_servers)
        {
            if (Array.isArray(was_servers))
            {
                _IMXWS_Was_Servers = null;
                _IMXWS_Was_Servers = new Array();
                _IMXWS_Was_Servers.push(was_server);
            }
            else if (typeof was_servers === "string")
            {
                if (was_servers.indexOf(",") != -1)
                {
                    _IMXWS_Was_Servers = null;
                    _IMXWS_Was_Servers = was_servers.split(",");

                }
                else
                {
                    _IMXWS_Was_Servers = null;
                    _IMXWS_Was_Servers = new Array();
                    _IMXWS_Was_Servers[0] = was_servers.trim();
                }
            }

            var ALen = _IMXWS_Was_Servers.length;
            for (var ix = 0; ix < ALen; ix++)
            {
                _IMXWS_Was_Servers[ix] = _IMXWS_Was_Servers[ix].trim();
            }

            _SetWasServers();

            ALen = null;
            ix = null;
        }
    });

    Object.defineProperty(this, "Options", {
        get: function ()
        {
            return Object.keys(_Option_Listener);
        }
    });
    /*
     Object.defineProperty(this, "Options", {
     get: function ()
     {
     var AResult; // = new Array();

     //            AResult.push(_IMXWS_Options);
     AResult = Object.keys(_IMXWS_Options);

     try
     {
     return AResult;
     }
     finally
     {
     AResult = null;
     }
     }
     ,
     set: function (option_strings)
     {
     if (Array.isArray(option_strings))
     {
     _IMXWS_Options = null;
     _IMXWS_Options = new Array();
     _IMXWS_Options.push(option_strings);
     }
     else if (typeof option_strings === "string")
     {
     if (option_strings.indexOf(",") != -1)
     {
     _IMXWS_Options = null;
     _IMXWS_Options = option_strings.split(",");

     }
     else
     {
     _IMXWS_Options = null;
     _IMXWS_Options = new Array();
     _IMXWS_Options[0] = option_strings.trim();
     }
     }

     var ALen = _IMXWS_Options.length;
     for (var ix = 0; ix < ALen; ix++)
     {
     _IMXWS_Options[ix] = _IMXWS_Options[ix].trim();
     }

     _SetOptions(_IMXWS_Options);

     ALen = null;
     ix = null;
     }
     });

     Object.defineProperty(this, "options", {
     get: function ()
     {
     return this.Options;
     },
     set: function (option_strings)
     {
     return this.Options = option_strings;
     }
     });
     */

    Object.defineProperty(this, "DBServers", {
        get: function ()
        {
            var AResult = new Array();

            AResult.push(_IMXWS_DB_Servers);

            return AResult;
        },
        set: function (db_servers)
        {
            if (Array.isArray(db_servers))
            {
                _IMXWS_DB_Servers = null;
                _IMXWS_DB_Servers = new Array();
                _IMXWS_DB_Servers.push(db_servers);
            }
            else if (typeof db_servers === "string")
            {
                if (db_servers.indexOf(",") != -1)
                {
                    _IMXWS_DB_Servers = null;
                    _IMXWS_DB_Servers = db_servers.split(",");

                }
                else
                {
                    _IMXWS_DB_Servers = null;
                    _IMXWS_DB_Servers = new Array();
                    _IMXWS_DB_Servers[0] = db_servers.trim();
                }
            }

            var ALen = _IMXWS_DB_Servers.length;
            for (var ix = 0; ix < ALen; ix++)
            {
                _IMXWS_DB_Servers[ix] = _IMXWS_DB_Servers[ix].trim();
            }

            _SetDBServers();

            ALen = null;
            ix = null;
        }
    });

    Object.defineProperty(this, "WebServers", {
        get: function ()
        {
            var AResult = new Array();

            AResult.push(_IMXWS_Web_Servers);

            return AResult;
        },
        set: function (web_servers)
        {
            if (Array.isArray(web_servers))
            {
                _IMXWS_Web_Servers = null;
                _IMXWS_Web_Servers = new Array();
                _IMXWS_Web_Servers.push(web_servers);
            }
            else if (typeof web_servers === "string")
            {
                if (web_servers.indexOf(",") != -1)
                {
                    _IMXWS_Web_Servers = null;
                    _IMXWS_Web_Servers = web_servers.split(",");

                }
                else
                {
                    _IMXWS_Web_Servers = null;
                    _IMXWS_Web_Servers = new Array();
                    _IMXWS_Web_Servers[0] = web_servers.trim();
                }
            }

            var ALen = _IMXWS_Web_Servers.length;
            for (var ix = 0; ix < ALen; ix++)
            {
                _IMXWS_Web_Servers[ix] = _IMXWS_Web_Servers[ix].trim();
            }
            IM
            _SetWebServers();

            ALen = null;
            ix = null;
        }
    });

    Object.defineProperty(this, "DefaultDB", {
        get: function ()
        {
            return _DefaultDB;
        },
        set: function (ADefaultDB)
        {
            if (_DefaultDB != ADefaultDB)
            {
                _DefaultDB = ADefaultDB;

                _SendDefaultDB(ADefaultDB);
            }
        }
    });

    Object.defineProperty(this, "defaultdb", {
        get: function ()
        {
            return this.DefaultDB;
        },
        set: function (ADefaultDB)
        {
            this.DefaultDB = ADefaultDB;
        }
    });

    Object.defineProperty(this, "DefaultDatabase", {
        get: function ()
        {
            return this.DefaultDB;
        },
        set: function (ADefaultDB)
        {
            this.DefaultDB = ADefaultDB;
        }
    });

    Object.defineProperty(this, "defaultdatabase", {
        get: function ()
        {
            return this.DefaultDB;
        },
        set: function (ADefaultDB)
        {
            this.DefaultDB = ADefaultDB;
        }
    });

    Object.defineProperty(this, "Default_Database", {
        get: function ()
        {
            return this.DefaultDB;
        },
        set: function (ADefaultDB)
        {
            this.DefaultDB = ADefaultDB;
        }
    });

    Object.defineProperty(this, "default_database", {
        get: function ()
        {
            return this.DefaultDB;
        },
        set: function (ADefaultDB)
        {
            this.DefaultDB = ADefaultDB;
        }
    });

    Object.defineProperty(this, "DatabaseList", {
        get: function ()
        {
            return _DBList;
        }
    });

    Object.defineProperty(this, "databaselist", {
        get: function ()
        {
            return this.DatabaseList;
        }
    });

    Object.defineProperty(this, "Databases", {
        get: function ()
        {
            return this.DatabaseList;
        }
    });

    Object.defineProperty(this, "databases", {
        get: function ()
        {
            return this.DatabaseList;
        }
    });

    Object.defineProperty(this, "KeepConnection", {
        get: function ()
        {
            return _KeepConnection;
        },
        set: function (AOnOff)
        {
            if (AOnOff != _KeepConnection)
            {
                _KeepConnection = AOnOff;

                _SendKeepConnection(_KeepConnection);
            }
        }
    });

    Object.defineProperty(this, "keepconnection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "Keep_Connection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "keep_connection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "ContinuousConnection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "continuousconnection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "Continuous_Connection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "continuous_connection", {
        get: function ()
        {
            return this.KeepConnection;
        },
        set: function (AOnOff)
        {
            this.KeepConnection = AOnOff;
        }
    });

    Object.defineProperty(this, "CompressSize", {
        get: function ()
        {
            return _CompSize;
        },
        set: function (ACompSize)
        {
            if (ACompSize != _CompSize)
            {
                _CompSize = ACompSize;

                _SendCompressSize(_CompSize);
            }
        }
    });

    Object.defineProperty(this, "compresssize", {
        get: function ()
        {
            return this.CompressSize;
        },
        set: function (ACompSize)
        {
            this.CompressSize = ACompSize;
        }
    });

    Object.defineProperty(this, "Compress_Size", {
        get: function ()
        {
            return this.CompressSize;
        },
        set: function (ACompSize)
        {
            this.CompressSize = ACompSize;
        }
    });

    Object.defineProperty(this, "compress_size", {
        get: function ()
        {
            return this.CompressSize;
        },
        set: function (ACompSize)
        {
            this.CompressSize = ACompSize;
        }
    });

    Object.defineProperty(this, "DebuggingLevel", {
        get: function ()
        {
            return _DebuggingLevel;
        },
        set: function (ALevel)
        {
            if (ALevel != _DebuggingLevel)
            {
                _DebuggingLevel = ALevel;

                _SendDebuggingLevel(_DebuggingLevel);
            }
        }
    });

    Object.defineProperty(this, "debugginglevel", {
        get: function ()
        {
            return this.DebuggingLevel;
        },
        set: function (ALevel)
        {
            this.DebuggingLevel = ALevel;
        }
    });

    Object.defineProperty(this, "Debugging_Level", {
        get: function ()
        {
            return this.DebuggingLevel;
        },
        set: function (ALevel)
        {
            this.DebuggingLevel = ALevel;
        }
    });

    Object.defineProperty(this, "debugging_level", {
        get: function ()
        {
            return this.DebuggingLevel;
        },
        set: function (ALevel)
        {
            this.DebuggingLevel = ALevel;
        }
    });



    Object.defineProperty(this, "JavaScript_Debug_Level", {
        get: function ()
        {
            return this._JS_Debug_Level;
        },
        set: function(alevel)
        {
            if (_JS_Debug_Level != alevel)
            {
                var adebug_str;
                var adebug_arr = ["js_debug_info", "js_debug_result", "js_debug_warning", "js_debug_error"];

                switch(alevel)
                {
                    case this.JS_DEBUG_NONE:
                        adebug_str = "";
                        break;
                    case this.JS_DEBUG_INFO:
                        adebug_str = adebug_arr[0];
                        adebug_arr.splice(0, 1);
                        break;
                    case this.JS_DEBUG_RESULT:
                        adebug_str = adebug_arr[1];
                        adebug_arr.splice(1, 1);
                        break;
                    case this.JS_DEBUG_WARNING:
                        adebug_str = adebug_arr[2];
                        adebug_arr.splice(2, 1);
                        break;
                    case this.JS_DEBUG_ERROR:
                        adebug_str = adebug_arr[3];
                        adebug_arr.splice(3, 1);
                        break;
                }

                _RemoveOption(adebug_arr);  // 기존에 있던 옵션을 제거.

                if (adebug_str != "")
                {
                    _AddOption(adebug_str);     // 새로운 디버그 옵션 설정.
                }
            }
        }
    })

    Object.defineProperty(this, "javascript_debug_level", {
        get: function()
        {
            return this.JavaScript_Debug_Level;
        },
        set: function(alevel)
        {
            this.JavaScript_Debug_Level = alevel;
        }
    })

    Object.defineProperty(this, "JS_Debug", {
        get: function()
        {
            return this.JavaScript_Debug_Level;
        },
        set: function(alevel)
        {
            this.JavaScript_Debug_Level = alevel;
        }
    })

    Object.defineProperty(this, "js_debug", {
        get: function()
        {
            return this.JavaScript_Debug_Level;
        },
        set: function(alevel)
        {
            this.JavaScript_Debug_Level = alevel;
        }
    })

    Object.defineProperty(this, "JS_Debug_Level", {
        get: function()
        {
            return this.JavaScript_Debug_Level;
        },
        set: function(alevel)
        {
            this.JavaScript_Debug_Level = alevel;
        }
    })

    Object.defineProperty(this, "js_debug_level", {
        get: function()
        {
            return this.JavaScript_Debug_Level;
        },
        set: function(alevel)
        {
            this.JavaScript_Debug_Level = alevel;
        }
    })

    /*
     *  DataGather Packet Event
     *  onAlarmHistory
     *  PKT_CLIENT_RES_ALARM_HISTORY
     *  function(aheader, adata) {}
     */
    var _onAlarmHistory;

    Object.defineProperty(this, "onAlarmHistory", {
        get: function ()
        {
            return _onAlarmHistory;
        },
        set: function (afunc)
        {
            _onAlarmHistory = afunc;
            if (_onAlarmHistory == null || typeof _onAlarmHistory === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_ALARM_HISTORY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_ALARM_HISTORY);
            }
        }
    });

    Object.defineProperty(this, "onalarmhistory", {
        get: function ()
        {
            return this.onAlarmHistory;
        },
        set: function (afunc)
        {
            this.onAlarmHistory = afunc;
        }
    });

    var _DoAlarmHistory = (function (AHeader, AData)
    {
        if (typeof _onAlarmHistory === "function")
        {
            try
            {
                _onAlarmHistory(AHeader, AData);
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('onAlarmHistory: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onServiceInfo
     *  PKT_CLIENT_RES_SERVICE_INFO
     *  function(aheader, adata) {}
     */
    var _onServiceInfo;

    Object.defineProperty(this, "onServiceInfo", {
        get: function ()
        {
            return _onServiceInfo;
        },
        set: function (afunc)
        {
            _onServiceInfo = afunc;
            if (_onServiceInfo == null || typeof _onServiceInfo === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_SERVICE_INFO);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_SERVICE_INFO);
            }
        }
    });

    Object.defineProperty(this, "onserviceinfo", {
        get: function ()
        {
            return this.onServiceInfo;
        },
        set: function (afunc)
        {
            this.onServiceInfo = afunc;
        }
    });

    var _DoServiceInfo = (function (AHeader, AData)
    {
        if (typeof _onServiceInfo === "function")
        {
            try
            {
                _onServiceInfo(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onServiceInfo: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onActivity
     *  PKT_CLIENT_RES_ACTIVITY
     *  function(aheader, adata) {}
     */
    var _onActivity;

    Object.defineProperty(this, "onActivity", {
        get: function ()
        {
            return _onActivity;
        },
        set: function (afunc)
        {
            _onActivity = afunc;
            if (_onActivity == null || typeof _onActivity === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_ACTIVITY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_ACTIVITY);
            }
        }
    });

    Object.defineProperty(this, "onactivity", {
        get: function ()
        {
            return this.onActivity;
        },
        set: function (afunc)
        {
            this.onActivity = afunc;
        }
    });

    var _DoActivity = (function (AHeader, AData)
    {
        if (typeof _onActivity === "function")
        {
            try
            {
                _onActivity(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onActivity: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasStat
     *  PKT_CLIENT_RES_WAS_STAT
     *  function(aheader, adata) {}
     */
    var _onWasStat;

    Object.defineProperty(this, "onWasStat", {
        get: function ()
        {
            return _onWasStat;
        },
        set: function (afunc)
        {
            _onWasStat = afunc;
            if (_onWasStat == null || typeof _onWasStat === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_STAT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_STAT);
            }
        }
    });

    Object.defineProperty(this, "onwasstat", {
        get: function ()
        {
            return this.onWasStat;
        },
        set: function (afunc)
        {
            this.onWasStat = afunc;
        }
    });

    var _DoWasStat = (function (AHeader, AData)
    {
        if (typeof _onWasStat === "function")
        {
            try
            {
                _onWasStat(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasStat: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onDBCPUUsage
     *  PKT_CLIENT_RES_DB_CPU_USAGE
     *  function(aheader, adata) {}
     */
    var _onDBCPUUsage;

    Object.defineProperty(this, "onDBCPUUsage", {
        get: function ()
        {
            return _onDBCPUUsage;
        },
        set: function (afunc)
        {
            _onDBCPUUsage = afunc;
            if (_onDBCPUUsage == null || typeof _onDBCPUUsage === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_DB_CPU_USAGE);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_DB_CPU_USAGE);
            }
        }
    });

    Object.defineProperty(this, "ondbcpuusage", {
        get: function ()
        {
            return this.onDBCPUUsage;
        },
        set: function (afunc)
        {
            this.onDBCPUUsage = afunc;
        }
    });

    var _DoDBCPUUsage = (function (AHeader, AData)
    {
        if (typeof _onDBCPUUsage === "function")
        {
            try
            {
                _onDBCPUUsage(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onDBCPUUsage: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onDBStat
     *  PKT_CLIENT_RES_DB_STAT
     *  function(aheader, adata) {}
     */
    var _onDBStat;

    Object.defineProperty(this, "onDBStat", {
        get: function ()
        {
            return _onDBStat;
        },
        set: function (afunc)
        {
            _onDBStat = afunc;
            if (_onDBStat == null || typeof _onDBStat === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_DB_STAT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_DB_STAT);
            }
        }
    });

    Object.defineProperty(this, "ondbstat", {
        get: function ()
        {
            return this.onDBStat;
        },
        set: function (afunc)
        {
            this.onDBStat = afunc;
        }
    });

    var _DoDBStat = (function (AHeader, AData)
    {
        if (typeof _onDBStat === "function")
        {
            try
            {
                _onDBStat(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onDBStat: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onSQLElapse
     *  PKT_CLIENT_RES_SQL_ELAPSE
     *  function(aheader, adata) {}
     */
    var _onSQLElapse;

    Object.defineProperty(this, "onSQLElapse", {
        get: function ()
        {
            return _onSQLElapse;
        },
        set: function (afunc)
        {
            _onSQLElapse = afunc;
            if (_onSQLElapse == null || typeof _onSQLElapse === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_SQL_ELAPSE);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_SQL_ELAPSE);
            }
        }
    });

    Object.defineProperty(this, "onsqlelapse", {
        get: function ()
        {
            return this.onSQLElapse;
        },
        set: function (afunc)
        {
            this.onSQLElapse = afunc;
        }
    });

    var _DoSQLElapse = (function (AHeader, AData)
    {
        if (typeof _onSQLElapse === "function")
        {
            try
            {
                _onSQLElapse(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onSQLElapse: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onActiveTXN
     *  PKT_CLIENT_RES_ACTIVE_TXN
     *  function(aheader, adata) {}
     */
    var _onActiveTXN;

    Object.defineProperty(this, "onActiveTXN", {
        get: function ()
        {
            return _onActiveTXN;
        },
        set: function (afunc)
        {
            _onActiveTXN = afunc;
            if (_onActiveTXN == null || typeof _onActiveTXN === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_ACTIVE_TXN);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_ACTIVE_TXN);
            }
        }
    });

    Object.defineProperty(this, "onactivetxn", {
        get: function ()
        {
            return this.onActiveTXN;
        },
        set: function (afunc)
        {
            this.onActiveTXN = afunc;
        }
    });

    var _DoActiveTXN = (function (AHeader, AData)
    {
        if (typeof _onActiveTXN === "function")
        {
            try
            {
                _onActiveTXN(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onActiveTXN: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onPoolMonitor
     *  PKT_CLIENT_RES_POOL_MONITOR
     *  function(aheader, adata) {}
     */
    var _onPoolMonitor;

    Object.defineProperty(this, "onPoolMonitor", {
        get: function ()
        {
            return _onPoolMonitor;
        },
        set: function (afunc)
        {
            _onPoolMonitor = afunc;
            if (_onPoolMonitor == null || typeof _onPoolMonitor === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_POOL_MONITOR);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_POOL_MONITOR);
            }
        }
    });

    Object.defineProperty(this, "onpoolmonitor", {
        get: function ()
        {
            return this.onPoolMonitor;
        },
        set: function (afunc)
        {
            this.onPoolMonitor = afunc;
        }
    });

    var _DoPoolMonitor = (function (AHeader, AData)
    {
        if (typeof _onPoolMonitor === "function")
        {
            try
            {
                _onPoolMonitor(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onPoolMonitor: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onLogHistory
     *  PKT_CLIENT_RES_LOG_HISTORY
     *  function(aheader, adata) {}
     */
    var _onLogHistory;

    Object.defineProperty(this, "onLogHistory", {
        get: function ()
        {
            return _onLogHistory;
        },
        set: function (afunc)
        {
            _onLogHistory = afunc;
            if (_onLogHistory == null || typeof _onLogHistory === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_LOG_HISTORY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_LOG_HISTORY);
            }
        }
    });

    Object.defineProperty(this, "onloghistory", {
        get: function ()
        {
            return this.onLogHistory;
        },
        set: function (afunc)
        {
            this.onLogHistory = afunc;
        }
    });

    var _DoLogHistory = (function (AHeader, AData)
    {
        if (typeof _onLogHistory === "function")
        {
            try
            {
                _onLogHistory(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onLogHistory: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onProcessMonitor
     *  PKT_CLIENT_RES_PROCESS_MONITOR
     *  function(aheader, adata) {}
     */
    var _onProcessMonitor;

    Object.defineProperty(this, "onProcessMonitor", {
        get: function ()
        {
            return _onProcessMonitor;
        },
        set: function (afunc)
        {
            _onProcessMonitor = afunc;
            if (_onProcessMonitor == null || typeof _onProcessMonitor === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_PROCESS_MONITOR);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_PROCESS_MONITOR);
            }
        }
    });

    Object.defineProperty(this, "onprocessmonitor", {
        get: function ()
        {
            return this.onProcessMonitor;
        },
        set: function (afunc)
        {
            this.onProcessMonitor = afunc;
        }
    });

    var _DoProcessMonitor = (function (AHeader, AData)
    {
        if (typeof _onProcessMonitor === "function")
        {
            try
            {
                _onProcessMonitor(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onProcessMonitor: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onJVMGCMax
     *  PKT_CLIENT_RES_JVM_GC_MAX
     *  function(aheader, adata) {}
     */
    var _onJVMGCMax;

    Object.defineProperty(this, "onJVMGCMax", {
        get: function ()
        {
            return _onJVMGCMax;
        },
        set: function (afunc)
        {
            _onJVMGCMax = afunc;
            if (_onJVMGCMax == null || typeof _onJVMGCMax === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_JVM_GC_MAX);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_JVM_GC_MAX);
            }
        }
    });

    Object.defineProperty(this, "onjvmgcmax", {
        get: function ()
        {
            return this.onJVMGCMax;
        },
        set: function (afunc)
        {
            this.onJVMGCMax = afunc;
        }
    });

    var _DoJVMGCMax = (function (AHeader, AData)
    {
        if (typeof _onJVMGCMax === "function")
        {
            try
            {
                _onJVMGCMax(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onJVMGCMax: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onJVMGCStat
     *  PKT_CLIENT_RES_JVM_GC_STAT
     *  function(aheader, adata) {}
     */
    var _onJVMGCStat;

    Object.defineProperty(this, "onJVMGCStat", {
        get: function ()
        {
            return _onJVMGCStat;
        },
        set: function (afunc)
        {
            _onJVMGCStat = afunc;
            if (_onJVMGCStat == null || typeof _onJVMGCStat === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_JVM_GC_STAT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_JVM_GC_STAT);
            }
        }
    });

    Object.defineProperty(this, "onjvmgcstat", {
        get: function ()
        {
            return this.onJVMGCStat;
        },
        set: function (afunc)
        {
            this.onJVMGCStat = afunc;
        }
    });

    var _DoJVMGCStat = (function (AHeader, AData)
    {
        if (typeof _onJVMGCStat === "function")
        {
            try
            {
                _onJVMGCStat(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onJVMGCStat: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onLockInfo
     *  PKT_CLIENT_RES_LOCK_INFO
     *  function(aheader, adata) {}
     */
    var _onLockInfo;

    Object.defineProperty(this, "onLockInfo", {
        get: function ()
        {
            return _onLockInfo;
        },
        set: function (afunc)
        {
            _onLockInfo = afunc;
            if (_onLockInfo == null || typeof _onLockInfo === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_LOCK_INFO);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_LOCK_INFO);
            }
        }
    });

    Object.defineProperty(this, "onlockinfo", {
        get: function ()
        {
            return this.onLockInfo;
        },
        set: function (afunc)
        {
            this.onLockInfo = afunc;
        }
    });

    var _DoLockInfo = (function (AHeader, AData)
    {
        if (typeof _onLockInfo === "function")
        {
            try
            {
                _onLockInfo(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onLockInfo: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onServerStatus
     *  PKT_CLIENT_RES_SERVER_STATUS
     *  function(aheader, adata) {}
     */
    var _onServerStatus;

    Object.defineProperty(this, "onServerStatus", {
        get: function ()
        {
            return _onServerStatus;
        },
        set: function (afunc)
        {
            _onServerStatus = afunc;
            if (_onServerStatus == null || typeof _onServerStatus === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_SERVER_STATUS);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_SERVER_STATUS);
            }
        }
    });

    Object.defineProperty(this, "onserverstatus", {
        get: function ()
        {
            return this.onServerStatus;
        },
        set: function (afunc)
        {
            this.onServerStatus = afunc;
        }
    });

    var _DoServerStatus = (function (AHeader, AData)
    {
        if (typeof _onServerStatus === "function")
        {
            try
            {
                _onServerStatus(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onServerStatus: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onRecentTopTXN
     *  PKT_CLIENT_RES_RECENT_TOP_TXN
     *  function(aheader, adata) {}
     */
    var _onRecentTopTXN;

    Object.defineProperty(this, "onRecentTopTXN", {
        get: function ()
        {
            return _onRecentTopTXN;
        },
        set: function (afunc)
        {
            _onRecentTopTXN = afunc;
            if (_onRecentTopTXN == null || typeof _onRecentTopTXN === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_RECENT_TOP_TXN);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_RECENT_TOP_TXN);
            }
        }
    });

    Object.defineProperty(this, "onrecenttoptxn", {
        get: function ()
        {
            return this.onRecentTopTXN;
        },
        set: function (afunc)
        {
            this.onRecentTopTXN = afunc;
        }
    });

    var _DoRecentTopTXN = (function (AHeader, AData)
    {
        if (typeof _onRecentTopTXN === "function")
        {
            try
            {
                _onRecentTopTXN(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onRecentTopTXN: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onRecentTopSQL
     *  PKT_CLIENT_RES_RECENT_TOP_SQL
     *  function(aheader, adata) {}
     */
    var _onRecentTopSQL;

    Object.defineProperty(this, "onRecentTopSQL", {
        get: function ()
        {
            return _onRecentTopSQL;
        },
        set: function (afunc)
        {
            _onRecentTopSQL = afunc;
            if (_onRecentTopSQL == null || typeof _onRecentTopSQL === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_RECENT_TOP_SQL);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_RECENT_TOP_SQL);
            }
        }
    });

    Object.defineProperty(this, "onrecenttopsql", {
        get: function ()
        {
            return this.onRecentTopSQL;
        },
        set: function (afunc)
        {
            this.onRecentTopSQL = afunc;
        }
    });

    var _DoRecentTopSQL = (function (AHeader, AData)
    {
        if (typeof _onRecentTopSQL === "function")
        {
            try
            {
                _onRecentTopSQL(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onRecentTopSQL: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onRecentTopException
     *  PKT_CLIENT_RES_RECENT_TOP_EXCEPTION
     *  function(aheader, adata) {}
     */
    var _onRecentTopException;

    Object.defineProperty(this, "onRecentTopException", {
        get: function ()
        {
            return _onRecentTopException;
        },
        set: function (afunc)
        {
            _onRecentTopException = afunc;
            if (_onRecentTopException == null || typeof _onRecentTopException === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_RECENT_TOP_EXCEPTION);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_RECENT_TOP_EXCEPTION);
            }
        }
    });

    Object.defineProperty(this, "onrecenttopexception", {
        get: function ()
        {
            return this.onRecentTopException;
        },
        set: function (afunc)
        {
            this.onRecentTopException = afunc;
        }
    });

    var _DoRecentTopException = (function (AHeader, AData)
    {
        if (typeof _onRecentTopException === "function")
        {
            try
            {
                _onRecentTopException(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onRecentTopException: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWebActive
     *  PKT_CLIENT_RES_WEB_ACTIVE
     *  function(aheader, adata) {}
     */
    var _onWebActive;

    Object.defineProperty(this, "onWebActive", {
        get: function ()
        {
            return _onWebActive;
        },
        set: function (afunc)
        {
            _onWebActive = afunc;
            if (_onWebActive == null || typeof _onWebActive === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WEB_ACTIVE);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WEB_ACTIVE);
            }
        }
    });

    Object.defineProperty(this, "onwebactive", {
        get: function ()
        {
            return this.onWebActive;
        },
        set: function (afunc)
        {
            this.onWebActive = afunc;
        }
    });

    var _DoWebActive = (function (AHeader, AData)
    {
        if (typeof _onWebActive === "function")
        {
            try
            {
                _onWebActive(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWebActive: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWebActiveSum
     *  PKT_CLIENT_RES_WEB_ACTIVE_SUM
     *  function(aheader, adata) {}
     */
    var _onWebActiveSum;

    Object.defineProperty(this, "onWebActiveSum", {
        get: function ()
        {
            return _onWebActiveSum;
        },
        set: function (afunc)
        {
            _onWebActiveSum = afunc;
            if (_onWebActiveSum == null || typeof _onWebActiveSum === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WEB_ACTIVE_SUM);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WEB_ACTIVE_SUM);
            }
        }
    });

    Object.defineProperty(this, "onwebactivesum", {
        get: function ()
        {
            return this.onWebActiveSum;
        },
        set: function (afunc)
        {
            this.onWebActiveSum = afunc;
        }
    });

    var _DoWebActiveSum = (function (AHeader, AData)
    {
        if (typeof _onWebActiveSum === "function")
        {
            try
            {
                _onWebActiveSum(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWebActiveSum: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onRTMSummary
     *  PKT_CLIENT_RES_RTM_SUMMARY
     *  function(aheader, adata) {}
     */
    var _onRTMSummary;

    Object.defineProperty(this, "onRTMSummary", {
        get: function ()
        {
            return _onRTMSummary;
        },
        set: function (afunc)
        {
            _onRTMSummary = afunc;
            if (_onRTMSummary == null || typeof _onRTMSummary === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_RTM_SUMMARY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_RTM_SUMMARY);
            }
        }
    });

    Object.defineProperty(this, "onrtmsummary", {
        get: function ()
        {
            return this.onRTMSummary;
        },
        set: function (afunc)
        {
            this.onRTMSummary = afunc;
        }
    });

    var _DoRTMSummary = (function (AHeader, AData)
    {
        if (typeof _onRTMSummary === "function")
        {
            try
            {
                _onRTMSummary(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWebActiveSum: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasTXNSummary
     *  PKT_CLIENT_RES_WAS_TXN_SUMMARY
     *  function(aheader, adata) {}
     */
    var _onWasTXNSummary;

    Object.defineProperty(this, "onWasTXNSummary", {
        get: function ()
        {
            return _onWasTXNSummary;
        },
        set: function (afunc)
        {
            _onWasTXNSummary = afunc;
            if (_onWasTXNSummary == null || typeof _onWasTXNSummary === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_TXN_SUMMARY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_TXN_SUMMARY);
            }
        }
    });

    Object.defineProperty(this, "onwastxnsummary", {
        get: function ()
        {
            return this.onWasTXNSummary;
        },
        set: function (afunc)
        {
            this.onWasTXNSummary = afunc;
        }
    });

    var _DoWasTXNSummary = (function (AHeader, AData)
    {
        if (typeof _onWasTXNSummary === "function")
        {
            try
            {
                _onWasTXNSummary(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasTXNSummary: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasDBTXNSummary
     *  PKT_CLIENT_RES_WAS_DB_TXN_SUMMARY
     *  function(aheader, adata) {}
     */
    var _onWasDBTXNSummary;

    Object.defineProperty(this, "onWasDBTXNSummary", {
        get: function ()
        {
            return _onWasDBTXNSummary;
        },
        set: function (afunc)
        {
            _onWasDBTXNSummary = afunc;
            if (_onWasDBTXNSummary == null || typeof _onWasDBTXNSummary === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_DB_TXN_SUMMARY);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_DB_TXN_SUMMARY);
            }
        }
    });

    Object.defineProperty(this, "onwasdbtxnsummary", {
        get: function ()
        {
            return this.onWasDBTXNSummary;
        },
        set: function (afunc)
        {
            this.onWasDBTXNSummary = afunc;
        }
    });

    var _DoWasDBTXNSummary = (function (AHeader, AData)
    {
        if (typeof _onWasDBTXNSummary === "function")
        {
            try
            {
                _onWasDBTXNSummary(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasDBTXNSummary: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasSessionCount
     *  PKT_CLIENT_RES_WAS_SESSION_COUNT
     *  function(aheader, adata) {}
     */
    var _onWasSessionCount;

    Object.defineProperty(this, "onWasSessionCount", {
        get: function ()
        {
            return _onWasSessionCount;
        },
        set: function (afunc)
        {
            _onWasSessionCount = afunc;
            if (_onWasSessionCount == null || typeof _onWasSessionCount === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_SESSION_COUNT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_SESSION_COUNT);
            }
        }
    });

    Object.defineProperty(this, "onwassessioncount", {
        get: function ()
        {
            return this.onWasSessionCount;
        },
        set: function (afunc)
        {
            this.onWasSessionCount = afunc;
        }
    });

    var _DoWasSessionCount = (function (AHeader, AData)
    {
        if (typeof _onWasSessionCount === "function")
        {
            try
            {
                _onWasSessionCount(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasDBTXNSummary: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onTopWasInfo
     *  PKT_CLIENT_RES_TOP_WAS_INFO
     *  function(aheader, adata) {}
     */
    var _onTopWasInfo;

    Object.defineProperty(this, "onTopWasInfo", {
        get: function ()
        {
            return _onTopWasInfo;
        },
        set: function (afunc)
        {
            _onTopWasInfo = afunc;
            if (_onTopWasInfo == null || typeof _onTopWasInfo === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_TOP_WAS_INFO);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_TOP_WAS_INFO);
            }
        }
    });

    Object.defineProperty(this, "ontopwasinfo", {
        get: function ()
        {
            return this.onTopWasInfo;
        },
        set: function (afunc)
        {
            this.onTopWasInfo = afunc;
        }
    });

    var _DoTopWasInfo = (function (AHeader, AData)
    {
        if (typeof _onTopWasInfo === "function")
        {
            try
            {
                _onTopWasInfo(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onTopWasInfo: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onHostGroupInfo
     *  PKT_CLIENT_RES_HOST_GROUP_INFO
     *  function(aheader, adata) {}
     */
    var _onHostGroupInfo;

    Object.defineProperty(this, "onHostGroupInfo", {
        get: function ()
        {
            return _onHostGroupInfo;
        },
        set: function (afunc)
        {
            _onHostGroupInfo = afunc;
            if (_onHostGroupInfo == null || typeof _onHostGroupInfo === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_HOST_GROUP_INFO);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_HOST_GROUP_INFO);
            }
        }
    });

    Object.defineProperty(this, "onhostgroupinfo", {
        get: function ()
        {
            return this.onHostGroupInfo;
        },
        set: function (afunc)
        {
            this.onHostGroupInfo = afunc;
        }
    });

    var _DoHostGroupInfo = (function (AHeader, AData)
    {
        if (typeof _onHostGroupInfo === "function")
        {
            try
            {
                _onHostGroupInfo(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onHostGroupInfo: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasTPS
     *  PKT_CLIENT_RES_WAS_TPS
     *  function(aheader, adata) {}
     */
    var _onWasTPS;

    Object.defineProperty(this, "onWasTPS", {
        get: function ()
        {
            return _onWasTPS;
        },
        set: function (afunc)
        {
            _onWasTPS = afunc;
            if (_onWasTPS == null || typeof _onWasTPS === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_TPS);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_TPS);
            }
        }
    });

    Object.defineProperty(this, "onwastps", {
        get: function ()
        {
            return this.onWasTPS;
        },
        set: function (afunc)
        {
            this.onWasTPS = afunc;
        }
    });

    var _DoWasTPS = (function (AHeader, AData)
    {
        if (typeof _onWasTPS === "function")
        {
            try
            {
                _onWasTPS(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasTPS: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onWasTXNElapse
     *  PKT_CLIENT_RES_WAS_TXN_ELAPSE
     *  function(aheader, adata) {}
     */
    var _onWasTXNElapse;

    Object.defineProperty(this, "onWasTXNElapse", {
        get: function ()
        {
            return _onWasTXNElapse;
        },
        set: function (afunc)
        {
            _onWasTXNElapse = afunc;
            if (_onWasTXNElapse == null || typeof _onWasTXNElapse === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WAS_TXN_ELAPSE);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WAS_TXN_ELAPSE);
            }
        }
    });

    Object.defineProperty(this, "onwastxnelapse", {
        get: function ()
        {
            return this.onWasTXNElapse;
        },
        set: function (afunc)
        {
            this.onWasTXNElapse = afunc;
        }
    });

    var _DoWasTXNElapse = (function (AHeader, AData)
    {
        if (typeof _onWasTXNElapse === "function")
        {
            try
            {
                _onWasTXNElapse(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasTXNElapse: ' + e.message);
                }
            }
        }
    });
    /*
     *  DataGather Packet Event
     *  onDashboardTXNCount
     *  PKT_CLIENT_RES_DASHBOARD_TXN_COUNT
     *  function(aheader, adata) {}
     */
    var _onDashboardTXNCount;

    Object.defineProperty(this, "onDashboardTXNCount", {
        get: function ()
        {
            return _onDashboardTXNCount;
        },
        set: function (afunc)
        {
            _onDashboardTXNCount = afunc;
            if (_onDashboardTXNCount == null || typeof _onDashboardTXNCount === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_DASHBOARD_TXN_COUNT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_DASHBOARD_TXN_COUNT);
            }
        }
    });

    Object.defineProperty(this, "ondashboardtxncount", {
        get: function ()
        {
            return this.onDashboardTXNCount;
        },
        set: function (afunc)
        {
            this.onDashboardTXNCount = afunc;
        }
    });

    var _DoDashboardTXNCount = (function (AHeader, AData)
    {
        if (typeof _onDashboardTXNCount === "function")
        {
            try
            {
                _onDashboardTXNCount(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onDashboardTXNCount: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onWasStatOS
     *  PKT_WEB_SOCKET_WAS_STAT_OS
     *  function(aheader, adata) {}
     */

    var _onWasStatOS;

    Object.defineProperty(this, "onWasStatOS", {
        get: function()
        {
            return _onWasStatOS;
        },
        set: function(afunc)
        {
            _onWasStatOS = afunc;
            if (_onWasStatOS == null || typeof _onWasStatOS === "undefined")
            {
                _RemovePacket(PKT_WEB_SOCKET_WAS_STAT_OS);
            }
            else
            {
                _AddPacket(PKT_WEB_SOCKET_WAS_STAT_OS);
            }
        }
    });

    Object.defineProperty(this, "onwasstatos", {
        get: function()
        {
            return this.onWasStatOS;
        },
        set: function(afunc)
        {
            this.onWasStatOS = afunc;
        }
    });

    var _DoWasStatOS = (function (AHeader, AData)
    {
        if (typeof _onWasStatOS === "function")
        {
            try
            {
                _onWasStatOS(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasStatOS: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onWasStatOS
     *  PKT_WEB_SOCKET_WAS_STAT_BANK
     *  function(aheader, adata) {}
     */

    var _onWasStatBank;

    Object.defineProperty(this, "onWasStatBank", {
        get: function()
        {
            return _onWasStatBank;
        },
        set: function(afunc)
        {
            _onWasStatBank = afunc;
            if (_onWasStatBank == null || typeof _onWasStatBank === "undefined")
            {
                _RemovePacket(PKT_WEB_SOCKET_WAS_STAT_BANK);
            }
            else
            {
                _AddPacket(PKT_WEB_SOCKET_WAS_STAT_BANK);
            }
        }
    });

    Object.defineProperty(this, "onwasstatbank", {
        get: function()
        {
            return this.onWasStatBank;
        },
        set: function(afunc)
        {
            this.onWasStatBank = afunc;
        }
    });

    var _DoWasStatBank = (function (AHeader, AData)
    {
        if (typeof _onWasStatBank === "function")
        {
            try
            {
                _onWasStatBank(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWasStatBank: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onWasStatOS
     *  PKT_CLIENT_RES_WS_STAT
     *  function(aheader, adata) {}
     */

    var _onWSStat;

    Object.defineProperty(this, "onWSStat", {
        get: function()
        {
            return _onWSStat;
        },
        set: function(afunc)
        {
            _onWSStat = afunc;
            if (_onWSStat == null || typeof _onWSStat === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WS_STAT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WS_STAT);
            }
        }

    });

    Object.defineProperty(this, "onwsstat", {
        get: function()
        {
            return this.onWSStat;
        },
        set: function(afunc)
        {
            this.onWSStat = afunc;
        }
    })

    var _DoWSStat = (function (AHeader, AData)
    {
        if (typeof _onWSStat === "function")
        {
            try
            {
                _onWSStat(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWSStat: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onWSOSStat
     *  PKT_CLIENT_RES_WS_OS_STAT
     *  function(aheader, adata) {}
     */

    var _onWSOSStat;

    Object.defineProperty(this, "onWSOSStat", {
        get: function()
        {
            return _onWSOSStat;
        },
        set: function(afunc)
        {
            _onWSOSStat = afunc;
            if (_onWSOSStat == null || typeof _onWSOSStat === "undefined")
            {
                _RemovePacket(PKT_CLIENT_RES_WS_OS_STAT);
            }
            else
            {
                _AddPacket(PKT_CLIENT_RES_WS_OS_STAT);
            }
        }

    });

    Object.defineProperty(this, "onwsosstat", {
        get: function()
        {
            return this.onWSOSStat;
        },
        set: function(afunc)
        {
            this.onWSOSStat = afunc;
        }
    })

    var _DoWSOSStat = (function (AHeader, AData)
    {
        if (typeof _onWSOSStat === "function")
        {
            try
            {
                _onWSOSStat(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onWSOSStat: ' + e.message);
                }
            }
        }
    });

    /*
     *  DataGather Packet Event
     *  onNHGLB
     *  PKT_WEB_SOCKET_NH_GLB
     *  function(aheader, adata) {}
     */

    var _onNHGLB;

    Object.defineProperty(this, "onNHGLB", {
        get: function()
        {
            return _onNHGLB;
        },
        set: function(afunc)
        {
            _onNHGLB = afunc;
            if (_onNHGLB == null || typeof _onNHGLB === "undefined")
            {
                _RemovePacket(PKT_WEB_SOCKET_NH_GLB);
            }
            else
            {
                _AddPacket(PKT_WEB_SOCKET_NH_GLB);
            }
        }

    });

    Object.defineProperty(this, "onnhglb", {
        get: function()
        {
            return this.onNHGLB;
        },
        set: function(afunc)
        {
            this.onNHGLB = afunc;
        }
    })

    var _DoNHGLB = (function (AHeader, AData)
    {
        if (typeof _onNHGLB === "function")
        {
            try
            {
                _onNHGLB(AHeader, AData)
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('IMXWS.onNHGLB: ' + e.message);
                }
            }
        }
    });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var _OptionListener_Clear = (function ()
    {
        _Option_Listener = null;
//        _Option_Listener = new Array();
        _Option_Listener = {};
    });

    /*
     var _OptionListener_IndexOf = (function (aoption)
     {
     var alen = _Option_Listener.length;
     for (var ix =0; ix < alen; ix++)
     {
     if (_Option_Listener[ix].option == aoption)
     {
     return ix;
     }
     }

     ix = null;
     return -1;
     });
     */


    var _Add_OptionListener = (function (aoption, afunc, ascope)
    {
        var Listener;
        var ANeedAddOption = false;
        var AResult = false;

        if (!_Option_Listener[aoption]) {
            ANeedAddOption = true;
            Listener = {};
            Listener.option = aoption;
            Listener.listeners = new Array();
            Listener.scopes = new Array();
        }
        else
        {
            Listener = _Option_Listener[aoption];
        }

        if (typeof afunc !== "undefined" && typeof afunc !== "null")
        {
            Listener.listeners.push(afunc);
        }
        else
        {
            if (Listener.listeners.indexOf(null) != -1)
            {
                Listener.listeners.push(null);
            }
        }

        if (typeof ascope !== "undefined" && typeof ascope !== "null")
        {
            Listener.scopes.push(ascope);
        }
        else
        {
            Listener.scopes.push(null);
        }

        _Option_Listener[aoption] = null;
        _Option_Listener[aoption] = Listener;
        Listener = null;

        if (ANeedAddOption)
        {
            // 여기에서 실질적으로 json 을 생성해서 보낸다.

            var ASendJSON = {};

            ASendJSON.type = "config";
            ASendJSON.command = "add_option_string";
            ASendJSON.parameters = {};

            ASendJSON.parameters.options = new Array();
            ASendJSON.parameters.options.push(aoption);

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;
        }

        ANeedAddOption = null;

        return AResult;
    });
    /*
     var _Add_OptionListener = (function (aoption, afunc, ascope)
     {
     var ix = _OptionListener_IndexOf(aoption);
     var Listener = {};

     if (typeof aoption === "undefined" || typeof afunc === "undefined" )
     {
     ix = null;
     Listener = null;

     return;
     }

     if (ix == -1)
     {
     // 기존에 지정된 option listener 가 없을 경우...

     Listener.option = aoption;
     Listener.listeners = new Array();   // 함수 목록을 담아 둠.
     Listener.scopes = new Array();      // scope 목록을 담아 둠.
     Listener.listeners.push(afunc);
     if (typeof ascope !== "undefined")
     {
     Listener.scopes.push(ascope);
     }
     else
     {
     Listener.scopes.push(null);
     }

     //            _Option_Listener.push(Listener);

     _AddOption(aoption);
     }
     else
     {
     // 기존에 지정된 option listener 가 있을 경우...
     Listener = _Option_Listener[ix];

     // function list 에 function 을 추가 함.
     if (Listener.listeners.indexOf(afunc) == -1)
     {
     Listener.listeners.push(afunc);
     if (typeof ascope !== "undefined")
     {
     Listener.scopes.push(ascope);
     }
     else
     {
     Listener.scopes.push(null);
     }
     }
     }

     ix = null;
     Listener = null;
     });
     */

    var _Remove_OptionListener = (function (aoption, afunc)
    {
        var Listener = {};
        var AResult = false;
        var ANeedRemoveListener = false;

        if (_Option_Listener[aoption])
        {
            var idx;

            Listener = _Option_Listener[aoption];

            if (typeof afunc !== "undefined" && typeof afunc !== "null")
            {
                idx = Listener.listeners.indexOf(afunc);
            }
            else
            {
                idx = Listener.listeners.indexOf(null);
            }

            if (idx != -1)
            {
                Listener.listeners.splice(idx, 1);
                Listener.scopes.splice(idx, 1);
            }

            if (Listener.listeners.length == 0)
            {
                ANeedRemoveListener = true;
            }

            Listener = null;
        }

        if (ANeedRemoveListener)
        {
            var ASendJSON = {};
            delete _Option_Listener[aoption];

            ASendJSON.type = "config";
            ASendJSON.command = "remove_option_string";
            ASendJSON.parameters = {};

            ASendJSON.parameters.options = new Array();
            ASendJSON.parameters.options.push(aoption);

            AResult = _SendJSON(ASendJSON);
            ASendJSON = null;
        }

        return AResult;
    });

    /*
     var _Remove_OptionListener = (function (aoption, afunc)
     {
     var ix = _OptionListener.IndexOf(aoption);
     var Listener = {};

     if (ix == -1)
     {
     // 아무일도 없으니 걍 빠져 나가자...
     }
     else
     {
     Listener = _Option_Listener[ix];

     var jx = Listener.listeners.indexOf(afunc);

     if (jx != -1)
     {
     // listeners 목록에서 function 을 제거 함.
     Listener.listeners.splice(jx, 1);
     // scope 는 항상 같은 index 에 들어 있다.
     Listener.scopes.splice(jx, 1);
     }

     if (Listener.listeners.length == 0)
     {
     // 옵션에 지정된 함수가 없으니 옵션도 제거하고 목록도 제거하고...
     _RemoveOption(Listener.option);

     _Option_Listener.splice(ix, 1);
     }
     }

     ix = null;
     Listener = null;
     });
     */


    var _Call_OptionListeners = function(AHeader, AData)
    {
        // header 에 options 가 있고 그것이 배열일 때 동작 함.
        if (typeof AHeader !== "undefined" && typeof AHeader.options !== "undefined" && Array.isArray(AHeader.options))
        {
            var afunc;
            var ascope;
            var jx;
            var afunclen;
            var Listener = {};
            var alen = AHeader.options.length;
            for (var ix = 0; ix < alen; ix++)
            {
                if (!_Option_Listener[AHeader.options[ix]])
                {
                    Listener = _Option_Listener[AHeader.options[ix]];

                    afunclen = Listener.listeners.length;
                    for(jx = 0; jx < afunclen; jx++)
                    {
                        afunc = Listener.listeners[jx];
                        ascope = Listener.scopes[jx];

                        try
                        {
                            if (typeof afunc === "function" && typeof ascope !== "undefined" && ascope != null)
                            {
                                afunc.call(ascope, AHeader, AData);
                            }
                            else
                            {
                                afunc(AHeader, AData);
                            }
                        }
                        catch (e)
                        {
                            if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                            {
                                console.log("call back function('" + afunc.toString() + "') error! : " + e.message)
                            }
                        }

                        afunc = {};
                        ascope = {};
                    }
                }
            }
        }
    }
    /*
     var _Call_OptionListeners = function(AHeader, AData)
     {
     // header 에 options 가 있고 그것이 배열일 때 동작 함.
     if (typeof AHeader !== "undefined" && typeof AHeader.options !== "undefined" && Array.isArray(AHeader.options))
     {
     var afunc;
     var ascope;
     var idx;
     var jx;
     var afunclen;
     var Listener = {};
     var alen = AHeader.options.length;
     for (var ix = 0; ix < alen; ix++)
     {
     idx = _Option_Listener.IndexOf(AHeader.options[ix]);

     if (idx !== -1)
     {
     Listener = _Option_Listener[idx];

     afunclen = Listener.listeners.length;
     for(jx = 0; jx < afunclen; jx++)
     {
     afunc = Listener.listeners[jx];
     ascope = Listener.scopes[jx];

     try
     {
     if (typeof afunc === "function" && typeof ascope !== "undefined" && ascope != null)
     {
     afunc.call(ascope, AHeader, AData);
     }
     else
     {
     afunc(AHeader, AData);
     }
     }
     catch (e)
     {
     console.log("call back function('" + afunc.toString() + "') error! : " + e.message)
     }

     afunc = {};
     ascope = {};
     }
     }
     }
     }
     }
     */

    // job queue 를 초기화 한다.
    var _JobQueue_Clear = (function ()
    {
        _JobQueue = null;
        _JobQueue = {};
    });

    // 오래된 job id 들을 해제시킨다.
    var _JobQueue_RemoveOld = (function ()
    {
        var AJobIds = Object.keys(_JobQueue);
        var alen = AJobIds.length;
        var ANow = new Date();
        var ATime = ANow.getTime();

        if (AJobIds.length > 20)
        {
            for (var ix = 0; ix < alen; ix++)
            {
                if (ATime - _JobQueue[AJobIds[ix]].job_time > 10000)
                {
                    delete _JobQueue[AJobIds[ix]];
                }
            }
        }

        AJobIds = null;
    });

    // job_id 가 사용 가능한지 (중복되지 않은지...) 알아보는 function, true 가 return 되면 사용해도 된다.
    var _JobQueue_CheckID = (function (job_id)
    {
        return _JobQueue[job_id] == undefined;
    });

    var _JobQueue_AddJob = (function (job_id, afunc, scopeObj)
    {
        if (afunc == undefined)
        {
            return;
        }

        var AJobTime = new Date();

        if (_JobQueue_CheckID(job_id))
        {
            _JobQueue[job_id] = {key_name: job_id, call_back: afunc, scope: scopeObj, job_time: AJobTime.getTime()};
        }

        _JobQueue_RemoveOld();
    });

    // job queue 에서 job id 에 해당하는 item 을 찾아 되돌린다.
    var _JobQueue_PopJob = (function (job_id)
    {
        if (_JobQueue_CheckID(job_id))
        {
            return null;
        }
        else
        {
            var ret = _JobQueue[job_id];

            delete _JobQueue[job_id];

            return ret;
        }
    });

    // job queueu 에 넣을 겹치지 않는 job id 를 만들어 준다.
    // prefix 를 주면 prefix + "_" + 숫자 형태로 만들어 주며...
    // 넣어 주지 않으면 "untyped_job_id_" + 숫자 형태로 만들어 준다.
    // 큰 의미는 없음...^^
    var _JobQueue_MakeJobID = (function (prefix)
    {
        var AJobID;
        var AJobNumber;

        if (prefix == null || typeof prefix === "undefined" || prefix == "")
        {
            AJobID = "untyped_job_id_";
        }
        else
        {
            AJobID = prefix + "_";
        }

        AJobNumber = parseInt(Math.random() * 10000);
        while (!_JobQueue_CheckID(AJobID + AJobNumber))
        {
            AJobNumber = parseInt(Math.random() * 10000);
        }

        return AJobID + AJobNumber;
    });

    var _OnWSConnected = (function (AEvent)
    {
        var AOptions;
//	this._OnConnected = (function(AEvent) {
        // 접속되면 class 설정 값들을 전송 한다.
        if (_IMXWS_Packets[0])
        {
            _self.ReceiveAllPackets();
        }
        else
        {
            _self.ReceiveSelectedPackets();
        }

        if (_IMXWS_Was_Servers.length > 0)
        {
            _SetWasServers();
        }

        if (_IMXWS_DB_Servers.length > 0)
        {
            _SetDBServers();
        }

        if (_IMXWS_Web_Servers.length > 0)
        {
            _SetWebServers();
        }

        // header 분리 여부를 설정.
//		_ConfigExtractHeader(_ExtractHeader);

        if (_DefaultDB != "")
        {
            _SendDefaultDB(_DefaultDB);
        }

        _SendKeepConnection(_KeepConnection);

        _SendCompressSize(_CompSize);

        _SendDebuggingLevel(_DebuggingLevel);

//        if (_IMXWS_Options.length > 0)
//        {
////            _SetOptions(_IMXWS_Options);
//            _SetOptions(Object.Keys(_Option_Listener));
//        }
        AOptions = Object.keys(_Option_Listener);
        if (AOptions.length > 0)
        {
            _SetOptions(AOptions);
        }
        AOptions = null;

        if (_self.isPushData)
        {
            _self.PushDataOn();
        }
        else
        {
            _self.PushDataOff();
        }

        if (_DebuggingLevel && _self.DEBUG_LEVEL_INFO)
        {
            console.log('WebSocket Connected');
        }

        if (typeof _self.onconnect === "function")
        {
            _self.onconnect();
        }
    });

    var _OnWSClosed = (function (AEvent)
    {
//	this._OnClosed = (function(AEvent) {
        if (_DebuggingLevel && _self.DEBUG_LEVEL_INFO)
        {
            console.log('WebSocket Closed');
        }
        if (typeof _self.onclose === "function")
        {
            _self.onclose();
        }
    });

    var _OnWSError = (function (AEvent)
    {
//	this._OnError = (function(AEvent) {
        /*
         if (typeof onerror === "function" && onerror.arguments.length = 1) {
         onerror(AEvent.data);
         }
         */
    });

    var _OnWSMessage = (function (AEvent)
    {
//	this._OnMessage = (function(AEvent) {
//		var AResult = AEvent.data.split("\n");
        var AResult = {};
//		var AHeader;
//		var AData;
//		var AHeaderStr;
//		var ADataStr;
        var ARequestType = -1;
        var AJobID;
        var ACallbackFunc;
        var AJobItem;
//		var AJSONResult;
        var ASendHeader;
        var ASendData;
        var AScope;


        // header 와 json 데이터를 분리해 놓는다.
        /*
         if (AResult != null) {
         if (AResult.length >= 3) {
         try {
         AHeaderStr = "{" + AResult[1] + "}";
         // header packet 은 사용을 위해 무조건 JSON parsing 을 거쳐야 함.
         AHeader = JSON.parse(AHeaderStr);
         } catch (e) {
         console.log(e.message);
         console.log("Header String : " + AHeaderStr);
         }
         try {
         ADataStr = "{" + AResult[3];
         if (_parseJSON) {
         // data 는 원할 경우에만 parsing 하도록 한다.
         AData = JSON.parse(ADataStr);
         }
         } catch (e) {
         console.log(e.message);
         console.log("Data String : " + ADataStr);
         }
         }

         if (typeof AHeaderStr === "undefined" || AHeaderStr == "") {
         try {
         AJSONResult = JSON.parse(AEvent.data);

         AHeaderStr = '{"request_header":' + JSON.stringify(AJSONResult.request_header) + '}';
         AHeader = AJSONResult.request_header;
         ADataStr = '{"result":' + JSON.stringify(AJSONResult.result) + '}';

         if (_parseJSON) {
         AData = JSON.result;
         }
         } catch (e) {
         console.log(e.message);
         console.log(AResult);
         }
         }
         */

        var AResultTime = new Date();

        if (AEvent.data instanceof ArrayBuffer)
        {
            // binary data 처리...
            var ABuf = new Uint8Array(AEvent.data);
            var ACompBuf = new Zlib.Inflate(ABuf);

            var AStrBuf = ACompBuf.decompress();
            var AStrResult = "";

            AStrResult = Utf8ArrayToStr(AStrBuf);

            // text data 처리...
            try
            {
                AResult = JSON.parse(AStrResult);
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log(e.message);
                    console.log(AStrResult);
                }
            }

            AStrResult = null;
            AStrBuf = null;
            ACompBuf = null;
            ABuf = null;
        }
        else
        {
            // text data 처리...
            try
            {
                AResult = JSON.parse(AEvent.data);
            }
            catch (e)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log(e.message);
                    console.log(AEvent.data);
                }
            }
        }

        var AJSONTime = new Date();
        /*
         if (typeof AResult.request_header.parameters !== "undefined" && typeof AResult.request_header.parameters === "string")
         {
         var AStr;

         AStr = AResult.request_header.parameters;
         AResult.request_header.parameters = null;
         AResult.request_header.parameters = {};

         try
         {
         AResult.request_header.parameters = JSON.parse(AStr);
         }
         catch (e)
         {
         console.log(e.message);
         console.log(AStr);
         }
         }
         */
//			if (typeof AHeader === "object" && typeof AHeader.request_header === "object" && typeof AHeader.request_header.type === "string") {
        if (typeof AResult === "object" && typeof AResult.request_header === "object" && typeof AResult.request_header.type === "string")
        {
//				switch(AHeader.request_header.type.toLowerCase()) {
            AResult.request_header.result_time = AResultTime.getTime() - (AResultTime.getTimezoneOffset() * 60 * 1000);
            AResult.request_header.parse_time = AJSONTime.getTime() - (AJSONTime.getTimezoneOffset() * 60 * 1000);
            if (AEvent.data instanceof ArrayBuffer)
            {
                AResult.data_size = AEvent.data.byteLength / 1024;
            }
            else
            {
                AResult.data_size = AEvent.data.length / 1024;
            }

            switch (AResult.request_header.type.toLowerCase())
            {
                case "sql":
                case "sql_file":
                    ARequestType = 0;
                    break;
                case "function":
                    ARequestType = 1;
                    break;
                case "dg":
                case "datagather":
                    ARequestType = 2;
                    break;
                case "push_data":
                    ARequestType = 3;
                    break;
                case "config":
                    ARequestType = 4;
                    break;
                case "java_script":
                case "js":
                case "javascript":
                    ARequestType = 5;
                    break;
                case "js_debug":
                    ARequestType = 6;
                    break;
                case "js_push":
                    ARequestType = 7;
                    break;
                case "sql_proc":
                    ARequestType = 8;
                    break;
                case "plugin_function":
                    ARequestType = 9;
                case "debug_msg":
                    ARequestType = 10;
            }

            AJobID = AResult.request_header.job_id;
        }

        /*
         if (_parseJSON) {
         ASendHeader = AHeader;
         ASendData = AData;
         } else {
         ASendHeader = AHeaderStr;
         ASendData = ADataStr;
         }
         */
        ASendHeader = AResult.request_header;
        ASendData = AResult.result;

        switch (ARequestType)
        {
            case 0:
            case 1:
            case 2:
            case 4:
            case 5:
            case 8:
            case 9:
                var ARequestTime = new Date();
                var AReceivedTime = new Date();
                var ACompleteTime = new Date();

                if (_DebuggingLevel && _self.DEBUG_LEVEL_RESULT)
                {
                    console.log("%c Received JSON Object:", "color:black;font-weight:bold");
                    console.log(ASendHeader);

                    if (ASendHeader.received_time != undefined && ASendHeader.complete_time != undefined)
                    {
                        ARequestTime.setTime(parseInt(ASendHeader.request_time) + Math.abs(ARequestTime.getTimezoneOffset() * 60 * 1000));
                        AReceivedTime.setTime(parseInt(ASendHeader.received_time) + (AReceivedTime.getTimezoneOffset() * 60 * 1000));
                        ACompleteTime.setTime(parseInt(ASendHeader.complete_time) + (ACompleteTime.getTimezoneOffset() * 60 * 1000));

//                    console.log('Debug Time:\nRequest Time - ' + ARequestTime.toLocaleString() + '\nReceived Time - ' + AReceivedTime.toLocaleString() + '\nComplete Time - ' + ACompleteTime.toLocaleString() + '\nResult Time - ' + AResultTime.toLocaleString());
                        console.log('Data Size: ' + AResult.data_size.toFixed(2) + ' kb\nDebug Time:All Processing Time - ' + (ACompleteTime.getTime() - AReceivedTime.getTime()) + ' ms, \nfrom Request Time - ' + (AResultTime.getTime() - ARequestTime.getTime()) + ' ms, \nJSON Parsing Time - ' + (AJSONTime.getTime() - AResultTime.getTime()) + ' ms');
                        if (AResult.data_size > (1024*1024))
                        {
                            console.log('Received Data: ' + ASendData);
                        }
                    }
                }
                break;
        }

        // job id 로 호출된 경우 job queue 에서 item 을 찾아 놓는다.
        if (AJobID != "")
        {
            AJobItem = _JobQueue_PopJob(AJobID);

            if (AJobItem != null)
            {

                // 먼저 callback 이 지정 돼 있으면 해당 callback 함수를 먼저 호출 해 준다.
                if (AJobID = AJobItem.key_name &&
                    (typeof AJobItem.call_back === "function" || typeof AJobItem.call_back === "string" || (Array.isArray(AJobItem.call_back) && AJobItem.call_back.length > 0)))
                {
                    if (typeof AJobItem.call_back === "function")
                    {
//                        try
//                        {
                        /*
                         if (_parseJSON) {
                         AJobItem.call_back(AHeader, AData);
                         } else {
                         AJobItem.call_back(AHeaderStr, ADataStr);
                         }
                         */
                        if (typeof AJobItem.scope != "undefined")
                        {
                            AScope = AJobItem.scope;
                            AJobItem.call_back.call(AJobItem.scope, ASendHeader, ASendData);
                        }
                        else
                        {
                            AJobItem.call_back(ASendHeader, ASendData);
                            AScope = null;
                        }
//                        }
//                        catch (e)
//                        {
//                            console.log("call back function('" + AJobItem.call_back.toString() + "') error! : " + e.message)
//                        }
                    }
                    else if (typeof AJobItem.call_back === "string")
                    {
                        try
                        {
                            /*
                             if (_parseJSON) {
                             window[AJobItem.call_back](AHeader, AData);
                             } else {
                             window[AJobItem.call_back](AHederStr, ADataStr);
                             }
                             */
                            if (typeof AJobItem.scope != "undefined")
                            {
                                AScope = AJobItem.scope;
                                window[AJobItem.call_back].call(AJobItem.scope, ASendHeader, ASendData);
                            }
                            else
                            {
                                AScope = null;
                                window[AJobItem.call_back](ASendHeader, ASendData);
                            }
                        }
                        catch (e)
                        {
                            if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                            {
                                console.log("call back function('" + call_back + "()') error! : " + e.message)
                            }
                        }

                    }
                    else if (Array.isArray(AJobItem.call_back))
                    {
                        if (typeof AJobItem.scope != "undefined")
                        {
//                            AJobItem.call_back.call(AJobItem.scope, ASendHeader, ASendData);
                            for (var ix = 0; ix < AJobItem.call_back.length; ix++)
                            {
                                try
                                {
                                    AScope = AJobItem.scope;
                                    AJobItem.call_back[ix].call(AJobItem.scope, ASendHeader, ASendData);
                                }
                                catch (e)
                                {
                                    if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                                    {
                                        console.log("call back function('" + AJobItem.call_back[ix].toString() + "') error! : " + e.message)
                                    }
                                }
                            }
                        }
                        else
                        {
                            AJobItem.call_back(ASendHeader, ASendData);
                            AScope = null;
                        }
                    }
                }
            }

            AJobItem = null;
        }
        else
        {
            AScope = null;
        }

        {
            if (Array.isArray(ASendHeader.options))
            {
                // option 배열이 있으면 listener 를 호출 한다.
                _Call_OptionListeners(ASendHeader, ASendData, AScope);
            }
        }

        switch (ARequestType)
        {
            case 0 : // sql, sql_file
                // 다음으로 onsqlexec 가 지정 돼 있으면 호출 해 준다.
                if (_self.onSQLExec != null && typeof _self.onSQLExec === "function")
                {
                    /*
                     if (_parseJSON) {
                     _DoSQLExec(AHeader, AData);
                     } else {
                     _DoSQLExec(AHeaderStr, ADataStr);
                     }
                     */
                    _DoSQLExec(ASendHeader, ASendData, AScope);
                }
                break;
            case 1 : // function
                // onfunction 가 지정 돼 있으면 호출 해 준다.
                if (_self.onFunction != null && typeof _self.onFunction === "function")
                {
                    /*
                     if (_parseJSON) {
                     _DoFunction(AHeader, AData);
                     } else {
                     _DoFunction(AHeaderStr, ADataStr);
                     }
                     */
                    _DoFunction(ASendHeader, ASendData, AScope);
                }
                break;
            case 2 : // dg, datagather
                // onfunction 가 지정 돼 있으면 호출 해 준다.
                if (_self.onDataGather != null && typeof _self.onDataGather === "function")
                {
                    /*
                     if (_parseJSON) {
                     _DoDataGather(AHeader, AData);
                     } else {
                     _DoDataGather(AHeaderStr, ADataStr);
                     }
                     */
                    _DoDataGather(ASendHeader, ASendData, AScope);
                }
                break;
            case 3 : // push_data
                // command 가 packet name 이 들어오기 때문에 이를 검사 해 주면 좋다...
                if (AResult.request_header.command != "")
                {
                    // value 에 들어있는 packet number 로 작업을 구분 한다.
                    switch (AResult.request_header.value)
                    {
                        case PKT_CLIENT_RES_ALARM_HISTORY:
                            _DoAlarmHistory(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_SERVICE_INFO:
                            _DoServiceInfo(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_ACTIVITY:
                            _DoActivity(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_STAT:
                            _DoWasStat(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_DB_CPU_USAGE:
                            _DoDBCPUUsage(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_DB_STAT:
                            _DoDBStat(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_SQL_ELAPSE:
                            _DoSQLElapse(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_ACTIVE_TXN:
                            _DoActiveTXN(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_POOL_MONITOR:
                            _DoPoolMonitor(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_LOG_HISTORY:
                            _DoLogHistory(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_PROCESS_MONITOR:
                            _DoProcessMonitor(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_JVM_GC_MAX:
                            _DoJVMGCMax(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_JVM_GC_STAT:
                            _DoJVMGCStat(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_LOCK_INFO:
                            _DoLockInfo(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_SERVER_STATUS:
                            _DoServerStatus(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_RECENT_TOP_TXN:
                            _DoRecentTopTXN(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_RECENT_TOP_SQL:
                            _DoRecentTopSQL(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_RECENT_TOP_EXCEPTION:
                            _DoRecentTopException(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WEB_ACTIVE:
                            _DoWebActive(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WEB_ACTIVE_SUM:
                            break;
                        case PKT_CLIENT_RES_RTM_SUMMARY:
                            _DoRTMSummary(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_TXN_SUMMARY:
                            _DoWasTXNSummary(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_DB_TXN_SUMMARY:
                            _DoWasDBTXNSummary(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_SESSION_COUNT:
                            _DoWasSessionCount(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_TOP_WAS_INFO:
                            _DoTopWasInfo(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_HOST_GROUP_INFO:
                            _DoHostGroupInfo(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_TPS:
                            _DoWasTPS(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WAS_TXN_ELAPSE:
                            _DoWasTXNElapse(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_DASHBOARD_TXN_COUNT:
                            _DoDashboardTXNCount(ASendHeader, ASendData);
                            break;
                        case PKT_WEB_SOCKET_WAS_STAT_OS:
                            _DoWasStatOS(ASendHeader, ASendData);
                            break;
                        case PKT_WEB_SOCKET_WAS_STAT_BANK:
                            _DoWasStatBank(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WS_STAT:
                            _DoWSStat(ASendHeader, ASendData);
                            break;
                        case PKT_CLIENT_RES_WS_OS_STAT:
                            _DoWSOSStat(ASendHeader, ASendData);
                            break;
                        case PKT_WEB_SOCKET_NH_GLB:
                            _DoNHGLB(ASendHeader, ASendData);
                            break;
                    }

                    if (typeof _self.onpushdata === "function")
                    {
                        _DoPushData(ASendHeader, ASendData);
                    }
                }
                break;
            case 4 : // config
                // config 는 되돌려 지는 값이 일단 없으니 비워두자.
                // config 전체 설정값 주고 받는 루틴 추가 필요.

                // 접속하자 마자 데이터 베이스 정보를 보내 준다.
//					if (AHeader.request_header.type == "Config" && AHeader.request_header.command == "database_list" ) {
                //if (AResult.request_header.type.toLowerCase() == "config" && AResult.request_header.command == "database_list")
                if (ASendHeader.type.toLowerCase() == "config" && ASendHeader.command == "database_list")
                {
                    var ALen;
                    var ADB;
                    var ATempDefaultDB = "";
                    var ADirMatches = urlParseRE.exec(location.href);
                    var ACurrDir = ADirMatches[14].toLowerCase();
                    var ANeedSendDefaultDB = false;

                    if (ACurrDir.charAt(ACurrDir.length - 1) == '/')
                    {
                        ACurrDir = ACurrDir.substring(0, ACurrDir.length - 1);
                    }
                    /*
                     if (!_parseJSON) {
                     AData = JSON.parse(ADataStr);
                     }
                     */

                    _DBList = null;
                    _DBList = new Array();

                    ALen = ASendData.length;

                    for (var ix = 0; ix < ALen; ix++)
                    {
                        ADB = {};

                        ADB.database_name = ASendData[ix].database_name;
                        ADB.database_type = ASendData[ix].database_type;
                        ADB.database_server = ASendData[ix].database_server;
                        ADB.database_database = ASendData[ix].database_database;
                        ADB.database_user = ASendData[ix].database_user;
                        ADB.database_description = ASendData[ix].database_description;
                        if (typeof ASendData[ix].database_uri_list === "undefined")
                        {
                            ADB.database_uri_list = [];
                        }
                        else
                        {
                            ADB.database_uri_list = ASendData[ix].database_uri_list;
                        }

                        _DBList.push(ADB);

                        if (_DefaultDB == "")
                        {
                            if (ASendData[ix].database_default == true && ATempDefaultDB == "")
                            {
                                ATempDefaultDB = ADB.database_name;
                            }

                            if (ADB.database_uri_list.indexOf(ACurrDir) != -1)
                            {
                                _DefaultDB = ADB.database_name;
                                ANeedSendDefaultDB = true;
                            }
                        }

                        ADB = null;
                    }

                    if (_DefaultDB == "" && ATempDefaultDB != "")
                    {
                        _DefaultDB = ATempDefaultDB;
                        ANeedSendDefaultDB = true;
                        _SendDefaultDB(_DefaultDB);
                    }

                    ALen = null;
                    ADB = null;
                    ATempDefaultDB = null;
                    ADirMatches = null;
                    ACurrDir = null;
                }

                // onConfig event 처리...
                if (typeof _self.onConfig === "function")
                {
                    /*
                     if (_parseJSON) {
                     _DoConfig(AHeader, AData);
                     } else {
                     _DoConfig(AHeaderStr, ADataStr);
                     }
                     */
                    _DoConfig(ASendHeader, ASendData, AScope);
                }
                break;
            case 5 : // java script
                // java script 의 실행 결과를 받는다...

                _DoJavaScript(ASendHeader, ASendData, AScope);
                break;
            case 6 : // java script debuggin message
                // java script 의 debugging message 를 받는다.

                _DoJavaScriptDebug(ASendHeader, ASendData);
                break;
            case 7 : // java script push message
                // java script 의 BroadcastData 함수로 push 데이터를 받는다.

                _DoJavaScriptPush(ASendHeader, ASendData);
                break;
            case 8 : // sql_proc
                // 다음으로 onsqlexec 가 지정 돼 있으면 호출 해 준다.
                if (_self.onStoredProcExec != null && typeof _self.onStoredProcExec === "function")
                {
                    /*
                     if (_parseJSON) {
                     _DoStoredProcExec(AHeader, AData);
                     } else {
                     _DoStoredProcExec(AHeaderStr, ADataStr);
                     }
                     */
                    _DoStoredProcExec(ASendHeader, ASendData, AScope);
                }
                break;
            case 9 : // plugin_function
                // 다음으로 onPluginFunction 이 설정돼 있으면 호출 해 준다.
                _DoPluginFunction(ASendHeader, ASendData, AScope);
                break;
            case 10 : // debugging message
                _DoDebuggingMessage(ASendHeader, ASendData);
                break;
        }

        // 마지막으로 onmessage 이벤트를 처리 한다.
        if (typeof _self.onmessage === "function" && ARequestType != 10)
        {
            /*
             if (_parseJSON) {
             _DoMessage(AHeader, AData);
             } else {
             _DoMessage(AHeaderStr, ADataStr);
             }
             */
            _DoMessage(ASendHeader, ASendData, AScope);
        }


        // 이제부터 이벤트 처리를 해 주어야 한다.
        /*
         if (AResult.type.toLowerCase() == "sql" || AResult.type.toLowerCase() == "sql_file") {
         // sql or sql_file 처리...
         } else if (AResult.type.toLowerCase() == "function") {
         // function 처리...
         } else if (AResult.type.totoLowerCase() == "push_data") {
         // datagather push_data 처리...
         }
         */

        /*
         }
         */

        if (_DeepDelete)
        {
            delete AResult.request_header;
            delete AResult.result;
        }

        AScope = null;
        AResult = null;
        ASendHeader = null;
        ASendData = null;
        ARequestType = null;
        ARequestTime = null;
//		AHeader = null;
//		AData = null;

        if (_NeedCallInitialize)
        {
            _NeedCallInitialize = false;
            self.setTimeout(_DoInitialize(), 10);
        }
    });

    var _makeNewWSConnection = (function ()
    {
        if (!_IsConnOpened)
        {
            // open 으로 연어 놓지 않았다면... 재 접속을 시도하지 않는다.
            return;
        }

        if (_IMXWSConn != null)
        {
            _IMXWSConn = null;
        }

        if (typeof _IMXWSConn === "undefined" || _IMXWSConn == null)
        {
            // 접속 해제...
            _IMXWSConn = null;

            if (_WSHost != "" && _WSPort != 0 && typeof Zlib !== "undefined")
            {
                _IMXWSConn = new WebSocket("ws://" + _WSHost + ":" + _WSPort);

                _IMXWSConn.onopen = _OnWSConnected;
                _IMXWSConn.onclose = _OnWSClosed;
                _IMXWSConn.onerror = _OnWSError;
                _IMXWSConn.onmessage = _OnWSMessage;

                _IMXWSConn.binaryType = "arraybuffer";
            }
        }
    });

    var _Open = (function ()
    {
//	this._Open = (function() {
//	function _Open() {
        _NeedCallInitialize = true;
        _IsConnOpened = true;
        if (_WSHost != "" && _WSPort != 0)
        {

            // 접속을 시작할 때 DefaultDB 를 초기화 한다.
            _DefaultDB = "";

            if (_IMXWSConn != null && typeof _IMXWSConn === "object" && (_IMXWSConn.readyState != 0 && _IMXWSConn.readyState != 1))
            {
                _IMXWSConn = null;

                // websocket 접속을 새로 만들어 해 연결을 구성 한다.
                _makeNewWSConnection();
            }
            else
            {
                _makeNewWSConnection();
            }

            _WSAlivePingTimer = self.setInterval(function ()
            {
                _SendPing()
            }, 60000);

            /*
             _WSLiveSendTimer = self.setInterval(function ()
             {
             _SendNull()
             }, 50);
             */
            _WSCheckConnectionTimer = self.setInterval(function ()
            {
                _CheckWebSocketConnected()
            }, 1000);
        }
    });
//	}

    var _OpenWithParam = (function (host, port)
    {
//	this._OpenWithParam = (function (host, port) {
        Host = host;
        Port = port;
        return _Open();
    });

    var _SendJSON = (function (AJSONData)
    {
//        var aSendString;
        var ADate = new Date();
        var AJSONObj; // = {};  // for debugging
        var ALogConsole = false;

        if (typeof _IMXWSConn === "undefined" || _IMXWSConn.readyState == WebSocket.CLOSED || _IMXWSConn.readyState == WebSocket.CLOSING)
        {
            aSendString = null;
            ADate = null;
            AJSONObj = null;
            ALogConsole = null;

            AJSONData = null;

            return false;
        }

        // AJSONData 를 문자열로 변환 시킨다.
        if (typeof AJSONData === "object")
        {
            // request time 을 추가 함.
            if (typeof AJSONData.type !== "undefined")
            {
                ALogConsole = true;
            }

            if (AJSONData.retry_count != undefined)
            {
                AJSONData.retry_count ++;
            }
            else
            {
                AJSONData.retry_count = 0;
            }
//            aSendString = JSON.stringify(AJSONData);
            AJSONObj = AJSONData;
        }
        else if (typeof AJSONData === "string" && AJSONData != "{}")
        {
//            aSendString = AJSONData;
            AJSONObj = JSON.parse(AJSONData);
            //aSendString = JSON.stringify(AJSONObj);

            if (typeof AJSONObj.retry_count !== "undefined")
            {
                AJSONObj.retry_count ++;
            }
            else
            {
                AJSONObj.retry_count = 0;
            }
        }

        if (AJSONObj.retry_count > 25)
        {
            aSendString = null;
            ADate = null;
            AJSONObj = null;
            ALogConsole = null;

            AJSONData = null;

            return false;
        }

        // 보낼 데이터가 있으면...
//        if (aSendString != "")
        if (typeof AJSONObj === "object")
        {
            //  WebSocket  접속이 선언 돼 있는지 검사 한다.
            if (typeof _IMXWSConn != "undefined")
            {
                // WebSocket 접속 여부를 판단한다.
                if (_IMXWSConn.readyState == WebSocket.OPEN)
                {
                    try
                    {
                        var aSendString;
                        // request time 을 추가 함.
                        //AJSONObj = JSON.parse(aSendString);
                        if (typeof AJSONObj.type !== "undefined")
                        {
                            AJSONObj.request_time = ADate.getTime() + (ADate.getTimezoneOffset() * 60 * 1000);
                        }

                        //aSendString = JSON.stringify(AJSONObj);

                        if (ALogConsole)
                        {
                            if (_DebuggingLevel && _self.DEBUG_LEVEL_INFO)
                            {
                                console.log("%c Sending JSON Object:", 'color:blue;');
                                console.log(AJSONObj);
                            }
                        }

                        //AJSONObj = null;

                        aSendString = JSON.stringify(AJSONObj);

                        /*
                         if (aSendString.length > 1024 * 120)
                         {
                         _IMXWSConn.send(str2ab(aSendString));
                         }
                         else
                         {
                         _IMXWSConn.send(aSendString);
                         }
                         */
                        _IMXWSConn.send(aSendString);

                        aSendString = null;

                        // 버그 퇴치용...
                        //setTimeout(function(){
                        //    if(_IMXWSConn.readyState==WebSocket.OPEN) {_IMXWSConn.send("{}");}
                        //}, 50);
                    }
                    catch (e)
                    {
                        aSendString = null;
                        return false;
                    }
                }
                else if (_IMXWSConn.readyState == WebSocket.CONNECTING)
                {
                    if (typeof AJSONData === "object")
                    {
                        if (AJSONData.retry_count >= 20)
                        {
                            AJSONObj = null;
                            ALogConsole = null;

                            AJSONData = null;

                            return false;
                        }
                    }
                    else if (AJSONData != "{}" && typeof AJSONObj === "object" && typeof AJSONObj.retry_count != undefined)
                    {
                        if (AJSONObj.retry_count >= 20)
                        {
                            AJSONObj = null;
                            ALogConsole = null;

                            AJSONData = null;

                            return false;
                        }
                        else
                        {
                            AJSONData = JSON.stringify(AJSONObj);
                        }
                    }

                    AJSONObj = null;
                    // 접속 진행 중이면 100msec 후에 재 시도 하도록 한다.
                    setTimeout(function ()
                    {
                        _SendJSON(AJSONData)
                    }, 100);
                }
                else if (_IMXWSConn.readyState == WebSocket.CLOSED || _IMXWSConn.readyState == WebSocket.CLOSING)
                {
                    AJSONObj = null;
                    // 접속이 끊어져 있으면 연결을 재 설정하고 타이머를 걸어 차후에 데이터를 보내도록 한다.
                    _makeNewWSConnection();
                    setTimeout(function ()
                    {
                        _SendJSON(AJSONData)
                    }, 500);
                }
            }
            else
            {
                // 접속이 만들어 져 있지 않으면...
                // 새로 접속을 만들고 데이터를 다시 보낸다.
                // 접속이 끊어져 있으면 연결을 재 설정하고 타이머를 걸어 차후에 데이터를 보내도록 한다.
                _makeNewWSConnection();
                setTimeout(function () { _SendJSON(AJSONObj); });
                AJSONObj = null;
            }

            AJSONObj = null;
            //aSendString = null;
            return true;
        }
        else
        {
            AJSONObj = null;
            //aSendString = null;
            return false;
        }
    });

    var _SendPing = (function ()
    {
        var ASendJSON = {};

        _SendJSON(ASendJSON);

        ASendJSON = null;
    });

    var _SendNull = (function()
    {
        if (_IMXWSConn != null)
        {
            if (_IMXWSConn.readyState == WebSocket.OPEN)
            {
                _IMXWSConn.send("");
            }
        }
    });

    var _CheckWebSocketConnected = (function ()
    {
        if (_IMXWSConn != null)
        {
            if (_IMXWSConn.readyState == WebSocket.CLOSED || _IMXWSConn.readyState == WebSocket.CLOSING)
            {
                _IMXWSConn.close();
                _makeNewWSConnection();
            }
        }
        else
        {
            _makeNewWSConnection();
        }
    });

    var _CheckPacket = (function (AAuto)
    {
        var ADone = false;
        for (var ix = 1; ix < _IMXWS_Packets.length; ix++)
        {
            if (_IMXWS_Packets[ix])
            {
                ADone = true;
                break;
            }
        }

        if (AAuto)
        {
            _IMXWS_Packets[0] = !ADone;
        }

        // false 가 return 되면 선택된 패킷이 없을 때 이다.
        return ADone;
    });

    // packet  을 추가 하는 루틴.
    var _AddPacket = (function (packet_number)
    {
        var ASendJSON = {};
        var AResult = false;

//		if (_IMXWS_Packets.indexOf(packet_number) == -1) {
//			_IMXWS_Packets.push(packet_number);
        if (_IMXWS_Packets.length > packet_number)
        {
            _IMXWS_Packets[packet_number] = true;

            _CheckPacket(true);

            // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
            if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
            {
                if (_IMXWS_Packets[0])
                {
                    ASendJSON.type = "config";
                    ASendJSON.command = "packet_setting";
                    ASendJSON.value = "all";
                }
                else
                {
                    ASendJSON.type = "config";
                    ASendJSON.command = "add_packet";
                    ASendJSON.value = packet_number;
                }

                AResult = _SendJSON(ASendJSON);
            }

            ASendJSON = null;
        }
        return AResult;
    });

    var _RemovePacket = (function (packet_number)
    {
        var ASendJSON = {};
        var AResult = false;

        if (_IMXWS_Packets.length > packet_number)
        {
            _IMXWS_Packets[packet_nubmer] = false;
        }

        console.debug('DEBUG', '_RemovePacket');

        _CheckPacket(true);

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            if (_IMXWS_Packets[0])
            {
                ASendJSON.type = "config";
                ASendJSON.command = "packet_setting";
                ASendJSON.value = "all";
            }
            else
            {
                ASendJSON.type = "config";
                ASendJSON.command = "remove_packet";
                ASendJSON.value = packet_number;
            }

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });

    var _SetPackets = (function ()
    {
        var ASendJSON = {};
        var APackets = new Array();
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            console.debug('DEBUG', '_SetPackets');
            
            ASendJSON.type = "config";
            ASendJSON.command = "packet_setting";

            var APacketLen = _IMXWS_Packets.length;
            for (var ix = 0; ix < APacketLen; ix++)
            {
                if (_IMXWS_Packets[ix])
                {
                    APackets.push(ix);
                }
            }
            ASendJSON.bind = APackets;

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;
        APackets = null;

        return AResult;
    });

    var _Init_Packets = (function ()
    {
        console.debug('DEBUG', '_Init_Packets');
        
        _IMXWS_Packets.splice(0, _IMXWS_Packets.length);
        // 0 elements  가 0 이면 All Packets Receive  이다.
        _IMXWS_Packets.push(true);
        for (var ix = 1; ix <= 255; ix++)
        {
            _IMXWS_Packets.push(false);
        }
    });

    this.ReceiveAllPackets = (function ()
    {
        //function ReceiveAllPackets() {
        var ASendJSON = {};
        var AResult = false;

        // _IMXWS_Packets array 의 모든 데이터를 삭제 한다.
        // 0 elements 가 자동으로 false 로 되기에 Receive All 상태가 된다.
        //_Init_Packets();
        // 잘못 생각했음...
        // 걍 0번째 Element 만 true 로 변경 해 놓아야 함.
        _IMXWS_Packets[0] = true;

        console.debug('DEBUG', 'ReceiveAllPackets');
        
        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "packet_setting";

            ASendJSON.value = "all";

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });
    //}

    this.receiveallpackets = (function ()
    {
        return ReceiveAllPackets();
    });

    this.ReceiveSelectedPackets = (function ()
    {
        if (_CheckPacket(true))
        {
            return _SetPackets();
        }
        else
        {
            return ReceiveAllPackets();
        }
    });
    this.receiveselectedpackets = (function ()
    {
        return ReceiveSelectedPackets();
    });

    var _SendDefaultDB = (function (ADefaultDB)
    {
        var ASendJSON = {};
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            console.debug('DEBUG', '_SendDefaultDB');
            
            ASendJSON.type = "config";
            ASendJSON.command = "database_default";
            ASendJSON.value = ADefaultDB;

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;

    });

    var _SendPushData = (function (AOnOff)
    {
        var ASendJSON = {};
        var AResult = false;

        if (AOnOff)
        {
            _PushData = true;
        }
        else
        {
            _PushData = false;
        }

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "push_data";
            if (AOnOff)
            {
                ASendJSON.value = "on";
            }
            else
            {
                ASendJSON.value = "off";
            }

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });

    this.PushDataOn = (function ()
    {
        return _SendPushData(true);
    });
    this.pushdataon = (function ()
    {
        return this.PushDataOn();
    });

    this.PushDataOff = (function ()
    {
        return _SendPushData(false);
    });
    this.pushdataoff = (function ()
    {
        return this.PushDataOff();
    });

    var _SendKeepConnection = (function (AOnOff)
    {
        var ASendJSON = {};
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "keep_connection";
            ASendJSON.value = AOnOff;

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });

    var _SendCompressSize = (function (ACompSize)
    {
        var ASendJSON = {};
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "compress_size";
            ASendJSON.value = ACompSize;

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });

    var _SendDebuggingLevel = (function (ALevel)
    {
        var ASendJSON = {};
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "debugging_level";
            ASendJSON.value = ALevel;

            AResult = _SendJSON(ASendJSON);
        }

        ASendJSON = null;

        return AResult;
    });

    var _Close = (function ()
    {
        _IsConnOpened = false;
        if (_IMXWSConn != null && (_IMXWSConn.readyState == WebSocket.OPEN || _IMXWSConn.readyState == WebSocket.CONNECTING))
        {
            _IMXWSConn.close();

            clearInterval(_WSAlivePingTimer);
            clearInterval(_WSCheckConnectionTimer);

            _IMXWSConn = null;

            //_WSAlivePingTimer = null;
            //_WSCheckConnectionTimer = null;
        }

        return true;
    });

    // Class Constructor
    var __constructor = (function ()
    {
//	var _WSAlivePingTimer;
//	var _WSCheckConnectionTimer;

        _Init_Packets();

    });

    this.Disconnect = (function ()
    {
        return _Close();
    });
    this.disconnect = (function ()
    {
        return this.Disconnect();
    })
    this.Close = (function ()
    {
        return _Close();
    });
    this.close = (function ()
    {
        return this.Close();
    });
    this.Open = (function ()
    {
        return _Open();
    });
    this.open = (function ()
    {
        return _Open();
    });
    this.Connect = (function (ahost, aport)
    {
        return _OpenWithParam(ahost, aport);
    });
    this.connect = (function (ahost, aport)
    {
        return this.Connect(ahost, aport);
    });

    /*
     var _makeSQLExtraceHeaderValue = function(ASendJSON) {
     if (_ExtractHeader != _SQLExtractHeader) {
     if (_SQLExtractHeader) {
     ASendJSON.value = "extract_field_name_on";
     } else {
     ASendJSON.value = "extract_field_name_off";
     }
     }
     }
     */

    var _ParseStringArray = (function (AStr)
    {
        var AStrArray;

        try
        {
            if (AStr.charAt(0) == '[' && AStr.charAt(AStr.length - 1) == ']')
            {
                AStrArray = JSON.parse('{"array":' + AStr + '}');
            }
            else
            {
                AStrArray = JSON.parse('{"array":[' + AStr + ']}');
            }
        }
        catch (e)
        {
//			AStrArray = JSON.parse('{"array":[]}');
            if (AStr.indexOf(",") != -1)
            {
                AStrArray = new Array();
                AStrArray.array = AStr.split(",");
            }
            else
            {
                AStrArray.array = new Array();
                AStrArray.array.push(AStr);
            }
            /*
             if (replace_array.indexOf(",") != -1) {
             ASendJSON.replace_pair = replace_array.split(",");
             } else {
             ASendJSON.replace_pair = new Array();
             ASendJSON.replace_pair.push(replace_array);
             }

             */
        }

        return AStrArray.array;
    });

    this.SQLFileExecNoParam = (function (sql_file, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "sql_file";
        ASendJSON.command = sql_file;
        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }
//		_makeSQLExtraceHeaderValue(ASendJSON);
        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecnoparam = (function (sql_file, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecNoParam(sql_file, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecNoParamAndReplace = (function (sql_file, replace_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof replace_array !== "undefined")
        {
            if (Array.isArray(replace_array))
            {
                ASendJSON.replace_pair = replace_array;
            }
            else if (typeof replace_array === "string")
            {
                ASendJSON.replace_pair = _ParseStringArray(replace_array);
            }
        }
        else
        {
            ASendJSON.replace_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecnoparamandreplace = (function (sql_file, replace_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecNoParamAndReplace(sql_file, replace_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBind = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ASendJSON.bind = bind_array;
            }
            else if (typeof bind_array === "string")
            {
                ASendJSON.bind = _ParseStringArray(bind_array);
            }
        }
        else
        {
            ASendJSON.bind = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbind = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBind(sql_file, bind_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBindAndReplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ASendJSON.bind = bind_array;
            }
            else if (typeof bind_array === "string")
            {
                ASendJSON.bind = _ParseStringArray(bind_array);
            }
        }
        else
        {
            ASendJSON.bind = new Array();
        }

        if (typeof replace_array !== "undefined")
        {
            if (Array.isArray(replace_array))
            {
                ASendJSON.replace_pair = replace_array;
            }
            else if (typeof replace_array === "string")
            {
                ASendJSON.replace_pair = _ParseStringArray(replace_array);
            }
        }
        else
        {
            ASendJSON.replace_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbindandreplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBindAndReplace(sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBindPair = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ASendJSON.bind_pair = bind_array;
            }
            else if (typeof bind_array === "string")
            {
                ASendJSON.bind_pair = _ParseStringArray(bind_array);
            }

            if (ASendJSON.bind_pair.length % 2 != 0)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('bind pair length error!');
                }
                ASendJSON = null;

                return "";
            }
        }
        else
        {
            ASendJSON.bind_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbindpair = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBindPair(sql_file, bind_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBindPairType = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;
        var ABindPairTypeArray = {};

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ABindPairTypeArray = bind_array;
            }
            else if (typeof bind_array === "string")
            {
                ABindPairTypeArray = _ParseStringArray(bind_array);
            }

            ASendJSON.bind_pair = new Array();
            ASendJSON.bind = new Array();

            ALen = ABindPairTypeArray.length;

            if (ALen % 3 != 0)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log("bind pair type length error!");
                }

                ASendJSON = null;
                ABindPairTypeArray = null;

                return "";
            }

            for (ix = 0; ix < ALen; ix++)
            {
                if (ix % 3 == 0 || ix % 3 == 1)
                {
                    // 첫번째 값은 Bind 의 이름이다.
                    // 두번째 값은 Bind 의 값이다.
                    ASendJSON.bind_pair.push(ABindPairTypeArray[ix]);
                }
                else if (ix % 3 == 2)
                {
                    // 세번째 값은 Bind 의 Type 이며 "varchar", "integer", "float" 이다.
                    ASendJSON.bind.push(ABindPairTypeArray[ix]);
                }
            }

            ABindPairTypeArray = null;
        }
        else
        {
            ASendJSON.bind_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbindpairtype = (function (sql_file, bind_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBindPairType(sql_file, bind_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBindPairAndReplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        }
        else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ASendJSON.bind_pair = bind_array;
            }
            else if (typeof bind_array === "string")
            {
                ASendJSON.bind_pair = _ParseStringArray(bind_array);
            }

            if (ASendJSON.bind_pair.length % 2 != 0)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('bind pair length error!');
                }
                ASendJSON = null;

                return "";
            }
        }
        else
        {
            ASendJSON.bind_pair = new Array();
        }

        if (typeof replace_array !== "undefined")
        {
            if (Array.isArray(replace_array))
            {
                ASendJSON.replace_pair = replace_array;
            }
            else if (typeof replace_array === "string")
            {
                ASendJSON.replace_pair = _ParseStringArray(replace_array);
            }
        }
        else
        {
            ASendJSON.replace_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbindpairandreplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBindPairAndReplace(sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj);
    });

    this.SQLFileExecWithBindPairTypeAndReplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;
        var ALen;
        var ix;
        var ABindPairTypeArray = {};

        ASendJSON.type = "sql_file";

        ASendJSON.command = sql_file;

        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        } else
        {
            ASendJSON.database = select_database;
        }

//		_makeSQLExtraceHeaderValue(ASendJSON);

        if (typeof bind_array !== "undefined")
        {
            if (Array.isArray(bind_array))
            {
                ABindPairTypeArray = bind_array;
            } else if (typeof bind_array === "string")
            {
                ABindPairTypeArray = _ParseStringArray(bind_array);
            }

            ASendJSON.bind_pair = new Array();
            ASendJSON.bind = new Array();

            ALen = ABindPairTypeArray.length;

            if (ALen % 3 != 0)
            {
                if (_DebuggingLevel && _self.DEBUG_LEVEL_EXCEPTION)
                {
                    console.log('bind pair with type length error');
                }
                ASendJSON = null;
                ABindPairTypeArray = null;

                return "";
            }

            for (ix = 0; ix < ALen; ix++)
            {
                if (ix % 3 == 0 || ix % 3 == 1)
                {
                    // 첫번째 값은 Bind 의 이름이다.
                    // 두번째 값은 Bind 의 값이다.
                    ASendJSON.bind_pair.push(ABindPairTypeArray[ix]);
                } else if (ix % 3 == 2)
                {
                    // 세번째 값은 Bind 의 Type 이며 "varchar", "integer", "float" 이다.
                    ASendJSON.bind.push(ABindPairTypeArray[ix]);
                }
            }

            ABindPairTypeArray = null;
        } else
        {
            ASendJSON.bind_pair = new Array();
        }

        if (typeof replace_array !== "undefined")
        {
            if (Array.isArray(replace_array))
            {
                ASendJSON.replace_pair = replace_array;
            } else if (typeof replace_array === "string")
            {
                ASendJSON.replace_pair = _ParseStringArray(replace_array);
            }
        } else
        {
            ASendJSON.replace_pair = new Array();
        }

        AJobID = _JobQueue_MakeJobID("sql_file");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.sqlfileexecwithbindpairtypeandreplace = (function (sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj)
    {
        return this.SQLFileExecWithBindPairTypeAndReplace(sql_file, bind_array, replace_array, select_database, call_back_func, scopeObj);
    });

    /*===========================================================================================*/
    _addMethod(_self, "SQLFileExec", function (sql_file, call_back_func)
    {
        return _self.SQLFileExecNoParam(sql_file, "", call_back_func);
    });

    _addMethod(_self, "sqlfileexec", function (sql_file, call_back_func)
    {
        return _self.SQLFileExecNoParam(sql_file, "", call_back_func);
    });

    _addMethod(_self, "SQLFileExec", function (sql_file, replace_array, call_back_func)
    {
        return _self.SQLFileExecNoParamAndReplace(sql_file, replace_array, "", call_back_func);
    });

    _addMethod(_self, "sqlfileexec", function (sql_file, replace_array, call_back_func)
    {
        return _self.SQLFileExecNoParamAndReplace(sql_file, replace_array, "", call_back_func);
    });

    _addMethod(_self, "SQLFileExec", function (sql_file, bind_array, abindpair, call_back_func)
    {
        switch (abindpair)
        {
            case "0" :
            case false :
            case this.BIND_VALUES_ONLY : // 0
                return this.SQLFileExecWithBind(sql_file, bind_array, "", call_back_func);
                break;
            case "1" :
            case true :
            case this.BIND_PAIR : // 1
                return this.SQLFileExecWithBindPair(sql_file, bind_array, "", call_back_func);
                break;
            case "2" :
            case this.BIND_PAIR_WITH_TYPE : // 2
                return this.SQLFileExecWithBindPairType(sql_file, bind_array, "", call_back_func);
                break;
        }
    });

    _addMethod(_self, "sqlfileexec", function (sql_file, bind_array, abindpair, call_back_func)
    {
        return this.SQLFileExec(sql_file, bind_array, abindpair, "", call_back_func);
    });
    _addMethod(_self, "SQLFileExec", function (sql_file, bind_array, abindpair, replace_array, call_back_func)
    {
        switch (abindpair)
        {
            case 0 :
            case "0" :
            case false :
            case this.BIND_VALUES_ONLY : // 0
                return this.SQLFileExecWithBindAndReplace(sql_file, bind_array, replace_array, "", call_back_func);
                break;
            case 1 :
            case "1" :
            case true :
            case this.BIND_PAIR : // 1
                return this.SQLFileExecWithBindPairAndReplace(sql_file, bind_array, replace_array, "", call_back_func);
                break;
            case 2 :
            case "2" :
            case this.BIND_PAIR_WITH_TYPE : // 2
                return this.SQLFileExecWithBindPairTypeAndReplace(sql_file, bind_array, replace_array, "", call_back_func);
                break;
        }
    });

    _addMethod(_self, "sqlfileexec", function (sql_file, bind_array, abindpair, replace_array, call_back_func)
    {
        return _self.SQLFileExec(sql_file, bind_array, abindpair, replace_array, "", call_back_func);
    });
    /*===========================================================================================*/
// sqlexec
// json object 로 sql or sql file 호출.
// bind 와 replace string 등을 json object 로 제공 해야 함.
// job_id 는 제출 가능 함.
//---------------------------------------------------------------------------------------------
    /*
     {
     "sql": "select * from dual;",
     "sql_file": "service_list.sql",
     "bind": [
     {
     "name": "param1",
     "value": "value1",
     "type": "string"
     },
     {
     "name": "param2",
     "value": "value2"
     "type": "integer"
     }
     ],
     "replace_string": [
     {
     "name": "param1",
     "value": "value1"
     },
     {
     "name": "param2",
     "value": "value2"
     }
     ],
     "database": "maxgauge3",
     "job_id": "sql_exec_1234"
     }

     -----------------------------------------------------------------------------------------------
     // 설명
     // sql : sql 문장.
     // sql_file : 실행 시킬 sql 파일
     // sql / sql_file 둘중 하나만 있어야 함. sql_file 은 서버의 sql 디렉토리에 저장된 파일을 의미함.
     // bind : bind parameter 처리용. 배열로 name, value, type 로 지정 해 주면 된다.
     //      : type 은 string, integer(int64), float(double) 가 있으며...
     //      : java script 에서는 int64 가 제대로 지원 되지 않으니 주의하자...
     // replace_string : sql 에서 '$' 문자로 싸인 물자열을 치환한다.
     // database : 기본 db 가 아닌 다른 등록된 db 를 사용하고자 할때 지정.
     //          : databaselist property 를 통해 db 이름을 얻으면 된다.
     //
     */
    /*===========================================================================================*/

    this.SQLExec = (function (ASQLJSON, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        if (typeof ASQLJSON != "undefined")
        {
            // sql / sql_file 명령 구분.
            if (typeof ASQLJSON.sql != "undefined")
            {
                ASendJSON.type = "sql";
                ASendJSON.command = ASQLJSON.sql;
            }
            else if (typeof ASQLJSON.sql_file != "undefined")
            {
                ASendJSON.type = "sql_file";
                ASendJSON.command = ASQLJSON.sql_file;

                if (typeof Comm != "undefined" && Comm.sqlExecHistory) {
                    Comm.sqlExecHistory.put(ASQLJSON, scopeObj);
                }
            }

            // parameter setting
            ASendJSON.parameters = {};

            // bind setting
            if (typeof ASQLJSON.bind != "undefined" && Array.isArray(ASQLJSON.bind))
            {
                var ABindLen = ASQLJSON.bind.length;

                ASendJSON.parameters.bind = new Array();

                for (var ix = 0; ix < ABindLen; ix++)
                {
                    if (typeof ASQLJSON.bind[ix].name != "undefined" && typeof ASQLJSON.bind[ix].value != "undefined")
                    {
                        ASendJSON.parameters.bind.push(ASQLJSON.bind[ix]);

                        // type 이 지정돼 있지 않으면 string 으로 진행 한다.
                        if (typeof ASQLJSON.bind[ix].type == "undefined")
                        {
                            ASendJSON.parameters.bind[ix].type = "string";
                        }
                    }
                }
            }

            // replace string settign
            if (typeof ASQLJSON.replace_string != "undefined" && Array.isArray(ASQLJSON.replace_string))
            {
                var AReplLen = ASQLJSON.replace_string.length;

                ASendJSON.parameters.replace_string = new Array();

                for (var ix = 0; ix < AReplLen; ix++)
                {
                    if (typeof ASQLJSON.replace_string[ix].name != "undefined" && typeof ASQLJSON.replace_string[ix].value != "undefined")
                    {
                        ASendJSON.parameters.replace_string.push(ASQLJSON.replace_string[ix]);
                    }
                }
            }

            if (typeof ASQLJSON.database != "undefined")
            {
                ASendJSON.database = ASQLJSON.database;
            }
            else
            {
                ASendJSON.database = _DefaultDB;
            }

            if (typeof ASQLJSON.timeout !== "undefined")
            {
                ASendJSON.timeout = ASQLJSON.timeout;
            }

            if (typeof ASQLJSON.return_param !== "undefined")
            {
                ASendJSON.return_param = ASQLJSON.return_param;
            }

            /*
             if (typeof ASQLJSON.extract_header != "undefined") {
             if (typeof ASQLJSON.extract_header == "boolean") {
             if (ASQLJSON.extract_header) {
             ASendJSON.value = "extract_field_name_on";
             } else {
             ASendJSON.value = "extract_field_name_off";
             }
             }
             }
             */
            AJobID = "";

            // job_id setting
            if (typeof ASQLJSON.job_id != "undefined")
            {
                AJobID = ASQLJSON.job_id;
                if (!_JobQueue_CheckID(AJobID))
                {
                    return "";
                }
            } else
            {
                AJobID = _JobQueue_MakeJobID("SQLExec");
            }

            if (AJobID == "")
            {
                ASendJSON = null;
                AJobID = null;
                AResult = null;

                return "";
            }

            ASendJSON.job_id = AJobID;
//            Comm.sqlExecHistory.elapsedTime[AJobID] = [Number(new Date()), null];

            if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
            {
                _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
            }

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;

            if (AResult)
            {
                return AJobID;
            } else
            {
                // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
                _JobQueue_PopJob(AJobID);
                return "";
            }
        } else
        {
            return "";
        }
    });

    /*===========================================================================================*/

// storedprocexec
// json object 로 stored procedure 호출.
// bind를 json object 로 제공 해야 함.
// job_id 는 제출 가능 함.
//---------------------------------------------------------------------------------------------
    /*
     {
     "stored_proc": "txn_detail",
     "bind": [
     {
     "name": "param1",
     "value": "value1",
     "type": "string"
     },
     {
     "name": "param2",
     "value": "value2"
     "type": "integer"
     }
     ],
     "database": "maxgauge3",
     "job_id": "sql_exec_1234"
     }

     -----------------------------------------------------------------------------------------------
     // 설명
     // sql_proc : stored procedure 이름.
     // bind : bind parameter 처리용. 배열로 name, value, type 로 지정 해 주면 된다.
     //      : type 은 string, integer(int64), float(double) 가 있으며...
     //      : java script 에서는 int64 가 제대로 지원 되지 않으니 주의하자...
     //      : out parameter 는 다로 지정하지 않아도 됨.
     // database : 기본 db 가 아닌 다른 등록된 db 를 사용하고자 할때 지정.
     //          : databaselist property 를 통해 db 이름을 얻으면 된다.
     //---------------------------------------------------------------------------------------------
     // 참고로 현재는 Result 가 Ref Cursor 인 경우에만 데이터가 제대로 나온다.
     // 다른 결과값을 Return 하는 Stored Procedure 는 일반 SQL 호출 방법을 사용해야 함.
     // MARS (Multi Active Result Set)을 기본적 으로 지원 함. (Oracle, PostgreSQL, MS SQL 모두 지원)
     */
    this.StoredProcExec = (function(AProcJSON, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        if (typeof AProcJSON != "undefined")
        {
            // sql / sql_file 명령 구분.
            if (typeof AProcJSON.stored_proc != "undefined")
            {
                ASendJSON.type = "sql_proc";
                ASendJSON.command = AProcJSON.stored_proc;
            }

            // parameter setting
            ASendJSON.parameters = {};

            // bind setting
            if (typeof AProcJSON.bind != "undefined" && Array.isArray(AProcJSON.bind))
            {
                var ABindLen = AProcJSON.bind.length;

                ASendJSON.parameters.bind = new Array();

                for (var ix = 0; ix < ABindLen; ix++)
                {
                    if (typeof AProcJSON.bind[ix].name != "undefined" && typeof AProcJSON.bind[ix].value != "undefined")
                    {
                        ASendJSON.parameters.bind.push(AProcJSON.bind[ix]);

                        // type 이 지정돼 있지 않으면 string 으로 진행 한다.
                        if (typeof AProcJSON.bind[ix].type == "undefined")
                        {
                            ASendJSON.parameters.bind[ix].type = "string";
                        }
                    }
                }
            }

            if (typeof AProcJSON.database != "undefined")
            {
                ASendJSON.database = AProcJSON.database;
            }
            else
            {
                ASendJSON.database = _DefaultDB;
            }

            if (typeof AProcJSON.timeout !== "undefined")
            {
                ASendJSON.timeout = AProcJSON.timeout;
            }

            if (typeof AProcJSON.return_param !== "undefined")
            {
                ASendJSON.return_param = AProcJSON.return_param;
            }

            AJobID = "";

            // job_id setting
            if (typeof AProcJSON.job_id != "undefined")
            {
                AJobID = AProcJSON.job_id;
                if (!_JobQueue_CheckID(AJobID))
                {
                    return "";
                }
            } else
            {
                AJobID = _JobQueue_MakeJobID("StoredProc");
            }

            if (AJobID == "")
            {
                ASendJSON = null;
                AJobID = null;
                AResult = null;

                return "";
            }

            ASendJSON.job_id = AJobID;

            if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
            {
                _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
            }

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;

            if (AResult)
            {
                return AJobID;
            } else
            {
                // 전송 실패시 job queue 에 등록된 id 를 삭제 해 준다.
                _JobQueue_PopJob(AJobID);
                return "";
            }
        } else
        {
            return "";
        }
    });

    this.storedprocexec = (function(AProcJSON, call_back_func, scopeObj)
    {
        return StoredProcExec(AProcJSON, call_back_func, scopeObj);
    });
    /*===========================================================================================*/

    this.FormatSQL = (function (ASQL, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "function";
        ASendJSON.command = "sql_format";
        ASendJSON.value = ASQL;
        AJobID = _JobQueue_MakeJobID("func_sql_format");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.formatsql = (function (ASQL, call_back_func, scopeObj)
    {
        return thils.FormatSQL(ASQL, call_back_func, scopeObj);
    });

    this.SQLList = (function (select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "function";
        ASendJSON.command = "sql_list";
        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        } else
        {
            ASendJSON.database = select_database;
        }

        AJobID = _JobQueue_MakeJobID("func_sql_list");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.sqllist = (function (select_database, call_back_func, scopeObj)
    {
        return this.SQLList(select_database, call_back_func, scopeObj);
    });

    _addMethod(_self, "SQLList", function (call_back_func)
    {
        return _self.SQLList("", call_back_func);
    });

    _addMethod(_self, "sqllist", function (call_back_func)
    {
        return _self.SQLList("", call_back_func);
    });

    this.SQLView = (function (ASQLFile, select_database, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "function";
        ASendJSON.command = "sql_view";
        if (select_database == undefined || select_database == null || select_database == "")
        {
            ASendJSON.database = _DefaultDB;
        } else
        {
            ASendJSON.database = select_database;
        }

        ASendJSON.value = ASQLFile;
        AJobID = _JobQueue_MakeJobID("func_sql_view");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.sqlview = (function (asqlfile, select_database, call_back_func, scopeObj)
    {
        return this.SQLView(asqlfile, select_database, call_back_func, scopeObj);
    });

    _addMethod(_self, "SQLView", function (asqlfile, call_back_func)
    {
        return this.SQLView(asqlfile, "", call_back_func);
    });

    _addMethod(_self, "sqlview", function (asqlfile, call_back_func)
    {
        return this.SQLView(asqlfile, "", call_back_func);
    });

    this.ReadText = (function (ATextFile, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "function";
        ASendJSON.command = "read_text";
        ASendJSON.database = _DefaultDB;

        ASendJSON.value = ATextFile;
        AJobID = _JobQueue_MakeJobID("func_read_text");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.readtext = (function (ATextFile, call_back_func, scopeObj)
    {
        return this.ReadText(ATextFile, call_back_func, scopeObj);
    });

    this.ServiceInfo = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "service_info";
        AJobID = _JobQueue_MakeJobID("func_dg_serviceinfo");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });
    this.serviceinfo = (function (call_back_func, scopeObj)
    {
        return this.ServiceInfo(call_back_func, scopeObj);
    });

    this.AlarmHistory = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "alarm_history";
        AJobID = _JobQueue_MakeJobID("func_dg_alarmhistory");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.alarmhistory = (function (call_back_func, scopeObj)
    {
        return this.AlarmHistory(call_back_func, scopeObj);
    });

    this.AddReceivePacket = (function (packet_number)
    {
        return _AddPacket(packet_number);
    });

    this.addreceivepacket = (function (packet_number)
    {
        return this.AddReceivePacket(packet_number);
    });

    this.RemoveReceivePacket = (function (packet_number)
    {
        return _RemovePacket(packet_number);
    });

    this.removereceivepacket = (function (packet_number)
    {
        return this.RemoveReceivePacket(packet_number);
    });

    this.HostGroupInfo = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "host_group_info";
        AJobID = _JobQueue_MakeJobID("func_dg_hostgroupinfo");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.hostgroupinfo = (function (call_back_func, scopeObj)
    {
        return this.HostGroupInfo(call_back_func, scopeObj);
    });
    /*
     WasSessionCount();
     WasTPS();
     WasTXNElapse();
     DashboardTXNCount();
     이 네 펑션은 쿼리로 데이터를 가져오는 것이 정상이다.

     this.WasSessionCount = (function (call_back_func, scopeObj) {
     var ASendJSON = {};
     var AJobID;
     var AResult = false;

     ASendJSON.type = "datagather";
     ASendJSON.command = "was_session_count";
     AJobID = _JobQueue_MakeJobID("func_dg_wassessioncount");
     ASendJSON.job_id = AJobID;

     if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
     _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
     }

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult) {
     return AJobID;
     } else {
     return "";
     }
     });

     this.wassessioncount = (function(call_back_func, scopeObj) {
     return this.WasSessionCount(call_back_func, scopeObj);
     });

     this.WasTPS = (function (call_back_func, scopeObj) {
     var ASendJSON = {};
     var AJobID;
     var AResult = false;

     ASendJSON.type = "datagather";
     ASendJSON.command = "was_tps";
     AJobID = _JobQueue_MakeJobID("func_dg_wastps");
     ASendJSON.job_id = AJobID;

     if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
     _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
     }

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult) {
     return AJobID;
     } else {
     return "";
     }
     });

     this.wastps = (function(call_back_func, scopeObj) {
     return this.WasTPS(call_back_func, scopeObj);
     });

     this.WasTXNElapse = (function (call_back_func, scopeObj) {
     var ASendJSON = {};
     var AJobID;
     var AResult = false;

     ASendJSON.type = "datagather";
     ASendJSON.command = "was_txn_elapse";
     AJobID = _JobQueue_MakeJobID("func_dg_wastxnelapse");
     ASendJSON.job_id = AJobID;

     if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
     _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
     }

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult) {
     return AJobID;
     } else {
     return "";
     }
     });

     this.wastxnelapse = (function(call_back_func, scopeObj) {
     return this.WasTXNElapse(call_back_func, scopeObj);
     });

     this.DashboardTXNCount = (function (call_back_func, scopeObj) {
     var ASendJSON = {};
     var AJobID;
     var AResult = false;

     ASendJSON.type = "datagather";
     ASendJSON.command = "dashboard_txn_count";
     AJobID = _JobQueue_MakeJobID("func_dg_dashboardtxncount");
     ASendJSON.job_id = AJobID;

     if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
     _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
     }

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult) {
     return AJobID;
     } else {
     return "";
     }
     });

     this.dashboardtxncount = (function(call_back_func, scopeObj) {
     return this.DashboardTXNCount(call_back_func, scopeObj);
     });
     */
    this.RecentTopSQL = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "recent_top_sql";
        AJobID = _JobQueue_MakeJobID("func_dg_recenttopsql");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.recenttopsql = (function (call_back_func, scopeObj)
    {
        return this.RecentTopSQL(call_back_func, scopeObj);
    })

    this.RecentTopTXN = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "recent_top_txn";
        AJobID = _JobQueue_MakeJobID("func_dg_recenttoptxn");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.recenttoptxn = (function (call_back_func, scopeObj)
    {
        return this.RecentTopTXN(call_back_func, scopeObj);
    })

    this.RecentTopException = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "recent_top_exception";
        AJobID = _JobQueue_MakeJobID("func_dg_recenttopexception");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.recenttopexception = (function (call_back_func, scopeObj)
    {
        return this.RecentTopException(call_back_func, scopeObj);
    })

    this.NHGlobal = (function (call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        ASendJSON.type = "datagather";
        ASendJSON.command = "nh_global";
        AJobID = _JobQueue_MakeJobID("func_dg_nhglobal");
        ASendJSON.job_id = AJobID;

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        } else
        {
            return "";
        }
    });

    this.nhglobal = (function (call_back_func, scopeObj)
    {
        return this.NHGlobal(call_back_func, scopeObj);
    })

    /*
     var _ConfigExtractHeader = (function(AOnOff) {
     var ASendJSON = {};
     var AResult = false;

     if (AOnOff) {
     _ExtractHeader = true;
     } else {
     _ExtractHeader = false;
     }

     // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
     if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN) {
     ASendJSON.type = "config";
     ASendJSON.command = "extract_field_name";
     if (AOnOff) {
     ASendJSON.value = "on";
     } else {
     ASendJSON.value = "off";
     }

     AResult = _SendJSON(ASendJSON);
     }

     ASendJSON = null;

     return AResult;
     });
     */

    this.SetConfig = (function (command, value)
    {
        var ASendJSON = {};

        ASendJSON.type = "config";
        ASendJSON.command = command;
        ASendJSON.value = value;

        _SendJSON(ASendJSON);

        ASendJSON = null;
    });

    var _SetWasServers = (function ()
    {
        var ASendJSON = {};
        var AServers = new Array();
        var AResult = false;
// 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "was_server_setting";

            var AServerLen = _IMXWS_Was_Servers.length;
            if (AServerLen > 0)
            {
                for (var ix = 0; ix < AServerLen; ix++)
                {
                    AServers.push(_IMXWS_Was_Servers[ix]);
                }
                ASendJSON.bind = AServers;
            } else
            {
                ASendJSON.value = "all";
            }

            AResult = _SendJSON(ASendJSON);
            AServerLen = null;
        }

        ASendJSON = null;
        AServers = null;

        return AResult;
    });

    this.ReceiveAllWasServers = (function ()
    {
        return _ReceiveAllWasServers();
    });

    this.receiveallwasservers = (function ()
    {
        return _ReceiveAllWasServers();
    })

    var _AddWasServer = (function (was_name)
    {
        var AWasIndex;
        var ASendJSON = {};
        var AResult = false;

        AWasIndex = -1;
        if (Array.isArray(_IMXWS_Was_Servers))
        {
            AWasIndex = _IMXWS_Was_Servers.indexOf(was_name.toLowerCase());
        }

        if (AWasIndex != -1)
        {
            // 기존에 이미 추가된 was 임.
            AResult = false;
        } else
        {
            // 기존 배열에 was_name 을 추가 한다.
            _IMXWS_Was_Servers.push(was_name.toLowerCase());

            ASendJSON.type = "config";
            ASendJSON.command = "was_add_server";
            ASendJSON.value = was_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);
        }

        AWasIndex = null;
        ASendJSON = null;

        return AResult;
    });

    this.AddWasServer = (function (Was_Name)
    {
        return _AddWasServer(Was_Name);
    });

    this.addwasserver = (function (was_name)
    {
        return _AddWasServer(was_name);
    });

    var _RemoveWasServer = (function (was_name)
    {
        var AWasIndex;
        var ASendJSON = {};
        var AResult = false;

        AWasIndex = -1;
        if (Array.isArray(_IMXWS_Was_Servers))
        {
            AWasIndex = _IMXWS_Was_Servers.indexOf(was_name.toLowerCase());
        }

        if (AWasIndex == -1)
        {
            // 기존에 설정된 was 서버가 없음.
            AWasIndex = null;
            ASendJSON = null;
            return false;
        } else
        {
            // 기존 배열에서 was_name 을 제거 한다.
            _IMXWS_Was_Servers.splice(AWasIndex, 1);

            ASendJSON.type = "config";
            ASendJSON.command = "was_remove_server";
            ASendJSON.value = was_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;
            AWasIndex = null;

            return AResult;
        }
    });

    this.RemoveWasServer = (function (Was_Name)
    {
        return _RemoveWasServer(Was_Name);
    });

    this.removewasserver = (function (was_name)
    {
        return _RemoveWasServer(was_name);
    });

    var _SetDBServers = (function ()
    {
        var ASendJSON = {};
        var AServers = new Array();
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "db_server_setting";

            var AServerLen = _IMXWS_DB_Servers.length;
            if (AServerLen > 0)
            {
                for (var ix = 0; ix < AServerLen; ix++)
                {
                    AServers.push(_IMXWS_DB_Servers[ix]);
                }
                ASendJSON.bind = AServers;
            } else
            {
                ASendJSON.value = "all";
            }

            AResult = _SendJSON(ASendJSON);

            AServerLen = null;
        }

        ASendJSON = null;
        AServers = null;

        return AResult;
    });

    this.ReceiveAllDBServers = (function ()
    {
        return _ReceiveAllDBServers();
    })

    this.receivealldbservers = (function ()
    {
        return _ReceiveAllDBServers();
    })

    var _AddDBServer = (function (db_name)
    {
        var ADBIndex;
        var ASendJSON = {};
        var AResult = false;

        ADBIndex = -1;
        if (Array.isArray(_IMXWS_DB_Servers))
        {
            ADBIndex = _IMXWS_DB_Servers.indexOf(db_name.toLowerCase());
        }

        if (ADBIndex != -1)
        {
            // 기존에 이미 추가된 db 임.
            ADBIndex = null;
            ASendJSON = null;
            return false;
        } else
        {
            // 기존 배열에 db_name 을 추가 한다.
            _IMXWS_DB_Servers.push(db_name.toLowerCase());

            ASendJSON.type = "config";
            ASendJSON.command = "db_add_server";
            ASendJSON.value = db_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;
            ADBIndex = null;

            return AResult;
        }
    });

    this.AddDBServer = (function (DB_Name)
    {
        return _AddDBServer(DB_Name);
    });

    this.adddbserver = (function (db_name)
    {
        return _AddDBServer(db_name);
    });

    var _RemoveDBServer = (function (db_name)
    {
        var ADBIndex;
        var ASendJSON = {};
        var AResult = false;

        ADBIndex = -1;
        if (Array.isArray(_IMXWS_DB_Servers))
        {
            ADBIndex = _IMXWS_DB_Servers.indexOf(db_name.toLowerCase());
        }

        if (ADBIndex == -1)
        {
            // 기존에 설정된 db 서버가 없음.
            ADBIndex = null;
            ASendJSON = null;
            return false;
        } else
        {
            // 기존 배열에서 db_name 을 제거 한다.
            _IMXWS_DB_Servers.splice(ADBIndex, 1);

            ASendJSON.type = "config";
            ASendJSON.command = "db_remove_server";
            ASendJSON.value = db_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;
            ADBIndex = null;

            return AResult;
        }
    });

    this.RemoveDBServer = (function (DB_Name)
    {
        return _RemoveDBServer(DB_Name);
    });

    this.removedbserver = (function (db_name)
    {
        return _RemoveDBServer(db_name);
    });

    var _SetWebServers = (function ()
    {
        var ASendJSON = {};
        var AServers = new Array();
        var AResult = false;

        // 접속 전이면 내부 변수만 설정하고 빠져 나간다.
        if (_IMXWSConn != null && _IMXWSConn.readyState === WebSocket.OPEN)
        {
            ASendJSON.type = "config";
            ASendJSON.command = "web_server_setting";

            var AServerLen = _IMXWS_Web_Servers.length;
            if (AServerLen > 0)
            {
                for (var ix = 0; ix < AServerLen; ix++)
                {
                    AServers.push(_IMXWS_Web_Servers[ix]);
                }
                ASendJSON.bind = AServers;
            } else
            {
                ASendJSON.value = "all";
            }

            AResult = _SendJSON(ASendJSON);

            AServerLen = null;
        }

        ASendJSON = null;
        AServers = null;

        return AResult;
    });

    var _AddWebServer = (function (web_name)
    {
        var AWebIndex;
        var ASendJSON = {};
        var AResult = false;

        AWebIndex = -1;
        if (Array.isArray(_IMXWS_Web_Servers))
        {
            AWebIndex = _IMXWS_Web_Servers.indexOf(web_name.toLowerCase());
        }

        if (AWebIndex != -1)
        {
            // 기존에 이미 추가된 web 임.
            AWebIndex = null;
            ASendJSON = null;
            return false;
        } else
        {
            // 기존 배열에 web_name 을 추가 한다.
            _IMXWS_Web_Servers.push(web_name.toLowerCase());

            ASendJSON.type = "config";
            ASendJSON.command = "web_add_server";
            ASendJSON.value = web_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);

            AWebIndex = null;
            ASendJSON = null;

            return AResult;
        }
    });

    this.ReceiveAllWebServers = (function ()
    {
        return _ReceiveAllWebServers();
    })

    this.receiveallwebservers = (function ()
    {
        return _ReceiveAllWebServers();
    })

    this.AddWebServer = (function (Web_Name)
    {
        return _AddWebServer(Web_Name);
    });

    this.addwebserver = (function (web_name)
    {
        return _AddWebServer(web_name);
    });

    var _RemoveWebServer = (function (web_name)
    {
        var AWebIndex;
        var ASendJSON = {};
        var AResult = false;

        AWebIndex = -1;
        if (Array.isArray(_IMXWS_Web_Servers))
        {
            AWebIndex = _IMXWS_Web_Servers.indexOf(web_name.toLowerCase());
        }

        if (AWebIndex == -1)
        {
            // 기존에 설정된 web 서버가 없음.
            AWebIndex = null;
            ASendJSON = null;
            return false;
        } else
        {
            // 기존 배열에서 web_name 을 제거 한다.
            _IMXWS_Web_Servers.splice(AWebIndex, 1);

            ASendJSON.type = "config";
            ASendJSON.command = "web_remove_server";
            ASendJSON.value = web_name.toLowerCase();

            AResult = _SendJSON(ASendJSON);

            ASendJSON = null;
            AWebIndex = null;

            return AResult;
        }
    });

    this.RemoveWebServer = (function (Web_Name)
    {
        return _RemoveWebServer(Web_Name);
    });

    this.removewebserver = (function (web_name)
    {
        return _RemoveWebServer(web_name);
    });

    var _ReceiveAllServers = (function ()
    {
        _ReceiveAllWasServers();
        _ReceiveAllDBServers();
        _ReceiveAllWebServers();
    });

    var _ReceiveAllWasServers = (function ()
    {
        // 기존 사용 하던 변수를 해제 시킨다.
        _IMXWS_Was_Servers = null;
        // 새로운 배열을 선언.
        _IMXWS_Was_Servers = new Array();
        _SetWasServers();
    });

    var _ReceiveAllDBServers = (function ()
    {
        // 기존 사용 하던 변수를 해제 시킨다.
        _IMXWS_DB_Servers = null;
        // 새로운 배열을 선언.
        _IMXWS_DB_Servers = new Array();
        _SetDBServers();
    });

    var _ReceiveAllWebServers = (function ()
    {
        // 기존 사용 하던 변수를 해제 시킨다.
        _IMXWS_Web_Servers = null;
        // 새로운 배열을 선언.
        _IMXWS_Web_Servers = new Array();
        _SetWebServers();
    })

    /*
     var _AddOption = (function (option_name)
     {
     var AOptionIndex;
     var ASendJSON = {};
     var AResult = false;

     // add option 은 1개씩만 가능.
     // 여러개를 보내면 set options 로 동작 함. 주의!
     if (!Array.isArray(option_name))
     {
     AOptionIndex = _IMXWS_Options.indexOf(option_name);

     if (AOptionIndex != -1)
     {
     // 이미 기존에 추가 된 옵션 임.
     AOptionIndex = null;
     ASendJSON = null;
     return false;
     }
     else
     {
     ASendJSON.type = "config";
     ASendJSON.command = "add_option_string";
     ASendJSON.parameters = {};

     ASendJSON.parameters.options = new Array();
     ASendJSON.parameters.options.push(option_name);

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult)
     {
     _IMXWS_Options.push(option_name);
     }

     AOptionIndex = null;
     return AResult;
     }
     }

     AOptionIndex = null;
     ASendJSON = null;
     return false;
     });
     */
    var _AddOption = (function (option_name)
    {
        var ASendJSON = {};
        var AResult = false;

        // add option 은 1개씩만 가능.
        if (!Array.isArray(option_name))
        {
            AResult = _Add_OptionListener(option_name, null, null)
        }
        else
        {
            // 배열이 왔을 경우...
            var ix;
            var len = option_name.length;

            AResult = true;
            for (ix = 0; ix < len; ix ++)
            {
                AResult &= _Add_OptionListener(option_name[ix], null, null);
            }
        }

        return AResult;
    });

    this.AddOption = (function (option_name)
    {
        return _AddOption(option_name);
    });

    this.addooption = (function (option_name)
    {
        return _AddOption(option_name);
    });

    this.Add_Option = (function (option_name)
    {
        return _AddOption(option_name);
    });

    this.add_option = (function (option_name)
    {
        return _AddOption(option_name);
    });

    var _RemoveOption = (function (option_name)
    {
        var AResult = false;
        /*
         var AOptionIndex;
         var ASendJSON = {};
         var alen;
         var ix;

         ASendJSON.type = "config";
         ASendJSON.command = "remove_option_string";
         //            ASendJSON.value = option_name;
         ASendJSON.parameters = {};

         ASendJSON.parameters.options = new Array();

         AOptionIndex = -1;
         if (!Array.isArray(option_name))
         {
         AOptionIndex = _IMXWS_Options.indexOf(option_name);

         if (AOptionIndex == -1)
         {
         // 기존에 설정된 web 서버가 없음.
         AOptionIndex = null;
         ASendJSON = null;
         return false;
         }
         else
         {
         ASendJSON.parameters.options.push(option_name);
         }
         }
         else
         {
         alen = option_name.length;

         for (ix = 0; ix < alen; ix++)
         {
         AOptionIndex = _IMXWS_Options.indexOf(option_name[ix]);

         if (AOptionIndex !== -1)
         {
         ASendJSON.parameters.options.push(option_name[ix]);
         }
         }

         if (ASendJSON.parameters.options.length == 0)
         {
         AOptionIndex = null;
         ASendJSON = null;
         return false;
         }

         }

         AResult = _SendJSON(ASendJSON);

         ASendJSON = null;

         // 기존 배열에서 web_name 을 제거 한다.
         if (AResult)
         {
         if (!Array.isArray(option_name))
         {
         _IMXWS_Options.splice(AOptionIndex, 1);
         }
         else
         {
         alen = option_name.length;

         AOptionIndex = _IMXWS_Options.indexOf(option_name[ix]);

         if (AOptionIndex !== -1)
         {
         _IMXWS_Options.splice(AOptionIndex, 1);
         }
         }
         }

         return AResult;
         */
        if (!Array.isArray(option_name))
        {
            AResult = _Remove_OptionListener(option_name, null, null);
        }
        else
        {
            // 배열이 왔을 경우...
            var ix;
            var len = option_name.length;

            AResult = true;
            for (ix = 0; ix < len; ix ++)
            {
                AResult &= _Remove_OptionListener(option_name[ix], null, null);
            }
        }
        return AResult;
    });

    this.RemoveOption = (function (option_name)
    {
        return _RemoveOption(option_name);
    });

    this.removeooption = (function (option_name)
    {
        return _RemoveOption(option_name);
    });

    this.Remove_Option = (function (option_name)
    {
        return _RemoveOption(option_name);
    });

    this.remove_option = (function (option_name)
    {
        return _RemoveOption(option_name);
    });

    var _SetOptions = (function (option_names)
    {
        var ASendJSON = {};
        var AResult = false;

        ASendJSON.type = "config";
        ASendJSON.command = "add_option_string";
        ASendJSON.parameters = {};

        ASendJSON.parameters.options = new Array();
        if (typeof option_names !== "undefined")
        {
            if (Array.isArray(option_names))
            {
                ASendJSON.parameters.options = option_names;
            } else if (typeof opiton_names === "string")
            {
                ASendJSON.parameters.options = _ParseStringArray(option_names);
            }
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;
        option_names = null;

        /*
         if (AResult)
         {
         _IMXWS_Options = null;

         _IMXWS_Options = new Array();
         }
         */
        return AResult;
    });

    /*----------------------------------------------------------------------------------------------------------------------
     // java script call json format
     {
     "js_file":"java_script.js",
     "options":{...},
     "database":"intermax",
     "job_id":"js_1234"
     }

     ----------------------------------------------------------------------------------------------------------------------*/

    this.RunJavaScript = (function (js_json, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        /*
         ASendJSON.type = "java_script";
         ASendJSON.command = js_file_name;
         ASendJSON.value = "";

         ASendJSON.parameters = {};
         if (options == undefined || options == null) {
         ASendJSON.parameters.options = {};
         } else if (typeof options === "string") {
         ASendJSON.parameters.options = options;
         } else if (typeof options === "object") {
         try {
         ASendJSON.parameters.options = options;
         } catch(e) {
         ASendJSON.parameters.options = {};
         }
         } else {
         ASendJSON.parameters.options = {};
         }
         */
        if (typeof js_json != "object" || typeof js_json.js_file == "undefined")
        {
            return "";
        }

        ASendJSON.type = "java_script";
        ASendJSON.command = js_json.js_file;
        ASendJSON.value = "";

        ASendJSON.parameters = {};

        if (typeof js_json.options != "undefined")
        {
//            ASendJSON.parameters.options = {};
            ASendJSON.parameters.options = js_json.options;
        }

        if (typeof jsjson.timeout !== "undefined")
        {
            ASendJSON.timeout = js_json.timeout;
        }

        if (typeof jsjson.return_param !== "undefined")
        {
            ASendJSON.return_param = js_json.return_param;
        }

        if (typeof js_json.job_id != "undefined")
        {
            AJobID = js_json.job_id;
        }
        else
        {
            AJobID = _JobQueue_MakeJobID("java_script_call");
            ASendJSON.job_id = AJobID;
        }

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    // plug in function call json format
    /*
     {
     "function":"test_function",
     "dll_name":"maxgauge.dll",
     "options":{...},
     "job_id":"js_1234"
     }
     */

    this.PluginFunction = (function (pf_json, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult = false;

        /*
         ASendJSON.type = "plugin_function";
         ASendJSON.command = "test_function";
         ASendJSON.value = "";

         ASendJSON.parameters = {};
         if (options == undefined || options == null) {
         ASendJSON.parameters.options = {};
         } else if (typeof options === "string") {
         ASendJSON.parameters.options = options;
         } else if (typeof options === "object") {
         try {
         ASendJSON.parameters.options = options;
         } catch(e) {
         ASendJSON.parameters.options = {};
         }
         } else {
         ASendJSON.parameters.options = {};
         }
         */
        if (typeof pf_json != "object")
        {
            return "";
        }

        ASendJSON.type = "plugin_function";
        ASendJSON.command = pf_json.function;
        ASendJSON.value = pf_json.dll_name;

        ASendJSON.parameters = {};

        if (typeof pf_json.options != "undefined")
        {
            ASendJSON.parameters.options = pf_json.options;
        }

        if (typeof pf_json.return_param != "undefined")
        {
            ASendJSON.return_param = pf_json.return_param;
        }

        if (typeof pf_json.job_id != "undefined")
        {
            AJobID = pf_json.job_id;
        }
        else
        {
            AJobID = _JobQueue_MakeJobID("plugin_function_call");
            ASendJSON.job_id = AJobID;
        }

        if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
        {
            _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
        }

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    this.runjavascript = (function (js_file_name, options, call_back_func, scopeObj)
    {
        return RunJavaScript(js_file_name, options, call_back_func, scopeObj);
    });

    this.run_java_script = (function (js_file_name, options, call_back_func, scopeObj)
    {
        return RunJavaScript(js_file_name, options, call_back_func, scopeObj);
    });

    this.Run_Java_Script = (function (js_file_name, options, call_back_func, scopeObj)
    {
        return RunJavaScript(js_file_name, options, call_back_func, scopeObj);
    });

    this.AddListener = (function(alisten_name, afunc, ascope)
    {
        _Add_OptionListener(alisten_name, afunc, ascope);
    });

    this.addlistener = (function(alisten_name, afunc, ascope)
    {
        _Add_OptionListener(alisten_name, afunc, ascope);
    });

    this.Add_Listener = (function(alisten_name, afunc, ascope)
    {
        _Add_OptionListener(alisten_name, afunc, ascope);
    });

    this.add_listener = (function(alisten_name, afunc, ascope)
    {
        _Add_OptionListener(alisten_name, afunc, ascope);
    });

    this.RemoveListener = (function(alisten_name, afunc)
    {
        _Remove_OptionListener(alisten_name, afunc);
    });

    this.removelistener = (function(alisten_name, afunc)
    {
        _Remove_OptionListener(alisten_name, afunc);
    });

    this.Remove_Listener = (function(alisten_name, afunc)
    {
        _Remove_OptionListener(alisten_name, afunc);
    });

    this.remove_listener = (function(alisten_name, afunc)
    {
        _Remove_OptionListener(alisten_name, afunc);
    });

    /*
     this.PluginFunction = (function (afunc_name, aoptions, call_back_func, scopeObj)
     {
     var ASendJSON = {};
     var AJobID;
     var AResult = false;

     ASendJSON.type = "plugin_function";
     ASendJSON.command = afunc_name;
     AJobID = _JobQueue_MakeJobID("plugin_function");
     ASendJSON.job_id = AJobID;

     ASendJSON.parameters = {};

     if (typeof aoptions == "object")
     {
     //            ASendJSON.parameters.options = {};
     ASendJSON.parameters.options = aoptions;
     }
     else if (typeof aoptions == "string")
     {
     ASendJSON.parameters.options = JSON.parse(aoptions);
     }

     if (typeof call_back_func === "function" || (Array.isArray(call_back_func) && call_back_func.length > 0))
     {
     _JobQueue_AddJob(AJobID, call_back_func, scopeObj);
     }

     AResult = _SendJSON(ASendJSON);

     ASendJSON = null;

     if (AResult)
     {
     return AJobID;
     } else
     {
     return "";
     }
     });
     */

    this.pluginfunction = (function (afunc_name, aoptions, call_back_func, scopeObj)
    {
        return PluginFunction(afunc_name, aoptions, call_back_func, scopeObj);
    });

    this.PlugInFunction = (function (afunc_name, aoptions, call_back_func, scopeObj)
    {
        return PluginFunction(afunc_name, aoptions, call_back_func, scopeObj);
    });

    this.RunJSONObject = (function (ajson, call_back_func, scopeObj)
    {
        var ASendJSON;
        var AResult;
        var AJobID;

        if (typeof ajson !== "object" && typeof ajson === "string")
        {
            try
            {
                ASendJSON = JSON.parse(ajson);
            }
            catch (e)
            {
                console.log(e);
                return "";
            }
        }
        else
        {
            if (typeof ajson === "object")
            {
                ASendJSON = ajson;
            }
        }

        if (ASendJSON == undefined)
        {
            ajson = null;

            return "";
        }

        if (typeof ASendJSON.job_id === "undefined")
        {
            AJobID = _JobQueue_MakeJobID("send_json_call");
            ASendJSON.job_id = AJobID;
        }

        _JobQueue_AddJob(AJobID, call_back_func, scopeObj);

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            _JobQueue_PopJob(AJobID);
            return "";
        }

    });

    /*
     // mail obj
     {
     "server": "mail server name",
     "from": {
     "name": "maxgauge",
     "address": "maxgauge@ex-em.com"
     },
     "mail_to": [
     {
     "name": "name1",
     "address": "addr1@ex-em.com"
     },
     {
     "name": "name2",
     "address": "addr2@ex-em.com"
     }
     ],
     "mail_cc": [
     {
     "name": "name3",
     "address": "addr3@ex-em.com"
     }
     ],
     "mail_bcc": [
     {
     "name": "name3",
     "address": "addr3@ex-em.com"
     }
     ],
     "subject": "mail title",
     "content": "mail text",
     "content_type": "plain/text",
     "attachments": [
     {
     "filename": "file1.png",
     "content_id": "123",
     "file_type": "image/png",
     "content": "base64 encoded text"
     },
     {
     "filename": "file2.jpg",
     "content_id": "345",
     "file_type": "image/jpg",
     "content": "base64 encoded text"
     },
     {
     "filename": "file3.pdf",
     "content_id": "345",
     "file_type": "application/pdf",
     "content": "base64 encoded text"
     }
     ]
     }

     */


    /*
     // 실제 보내지는 형식.
     {
     "type": "function",
     "command": "send_mail",
     "value": "mail_server_name",
     "parameters":
     {
     "mail":
     {
     "from":
     {
     "name": "junpyo lee",
     "address": "dollee@ex-em.com"
     },
     "mail_to":
     [
     {
     "name": "name1",
     "address": "addr1@ex-em.com"
     },
     {
     "name": "name2",
     "address": "addr2@ex-em.com"
     }
     ],
     "mail_cc":
     [
     {
     "name": "name1",
     "address": "addr1@ex-em.com"
     }
     ],
     "mail_bcc":
     [
     {
     "name": "name1",
     "address": "addr1@ex-em.com"
     }
     ],
     "subject": "title",
     "content_type": "plain/text",
     "content": "mail text",
     "attachments":
     [
     {
     "filename": "file1.png",
     "content_id": "1234",
     "content_type": "image/png",
     "content": "base64 encoded text"
     },
     {
     "filename": "file2.png",
     "content_id": "5678",
     "content_type": "image/png",
     "content": "base64 encoded text"
     }
     ]
     }
     }
     }
     */

    this.SendMail = (function(AMailObj, call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AResult;
        var AJobID;

        if (typeof AMailObj !== "object" && typeof AMailObj === "string")
        {
            return "";
        }
        else if (typeof AMailObj.from === "undefined" ||
            (typeof AMailObj.mail_to === "undefined" && typeof AMailObj.mail_cc === "undefined" && typeof AMailObj.mail_bcc === "undefined") ||
            typeof AMailObj.subject === "undefined" || typeof AMailObj.content === "undefined")
        {
            return "";
        }


        ASendJSON.type = "function";
        ASendJSON.command = "send_mail";
        ASendJSON.value = "";

        ASendJSON.parameters = {};
        ASendJSON.parameters.mail = {};

        if (typeof AMailObj.from !== "undefined")
        {
//            ASendJSON.parameters.mail.from = AMailObj.from;
            ASendJSON.parameters.mail.from = {};
            if (typeof AMailObj.from.name !== "undefined")
            {
                ASendJSON.parameters.mail.from.name = AMailObj.from.name;
            }
            if (typeof AMailObj.from.address !== "undefined")
            {
                ASendJSON.parameters.mail.from.address = AMailObj.from.address;
            }
        }

        if (typeof AMailObj.mail_to !== "undefined" && Array.isArray(AMailObj.mail_to) && AMailObj.mail_to.length >= 1)
        {
            ASendJSON.parameters.mail.mail_to = [];
            Array.prototype.push.apply(ASendJSON.parameters.mail.mail_to, AMailObj.mail_to);
        }

        if (typeof AMailObj.mail_cc !== "undefined" && Array.isArray(AMailObj.mail_cc) && AMailObj.mail_cc.length >= 1)
        {
            ASendJSON.parameters.mail.mail_cc = [];
            Array.prototype.push.apply(ASendJSON.parameters.mail.mail_cc, AMailObj.mail_cc);
        }

        if (typeof AMailObj.mail_bcc !== "undefined" && Array.isArray(AMailObj.mail_bcc) && AMailObj.mail_bcc.length >= 1)
        {
            ASendJSON.parameters.mail.mail_bcc = [];
            Array.prototype.push.apply(ASendJSON.parameters.mail.mail_bcc, AMailObj.mail_bcc);
        }

        if (typeof AMailObj.subject !== "undefined")
        {
            ASendJSON.parameters.mail.subject = AMailObj.subject;
        }

        if (typeof AMailObj.content !== "undefined")
        {
            ASendJSON.parameters.mail.content = AMailObj.content;
            if (typeof AMailObj.content_type !== "undefined")
            {
                ASendJSON.parameters.mail.content_type = AMailObj.content_type;
            }
            else
            {
                ASendJSON.parameters.mail.content_type = "text/plain"
            }
        }

        if (typeof AMailObj.attachments !== "undefined" && Array.isArray(AMailObj.attachments) && AMailObj.attachments.length >= 1)
        {
            ASendJSON.parameters.mail.attachments = [];
            Array.prototype.push.apply(ASendJSON.parameters.mail.attachments, AMailObj.attachments);
        }

        if (typeof AMailObj.timeout !== "undefined")
        {
            ASendJSON.timeout = AMailObj.timeout;
        }

        if (typeof AMailObj.return_param !== "undefined")
        {
            ASendJSON.return_param = AMailObj.return_param;
        }

        if (typeof ASendJSON.job_id === "undefined")
        {
            AJobID = _JobQueue_MakeJobID("send_mail_call");
            ASendJSON.job_id = AJobID;
        }

        _JobQueue_AddJob(AJobID, call_back_func, scopeObj);

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            _JobQueue_PopJob(AJobID);
            return "";
        }

    });

    this.ClientIP = (function(call_back_func, scopeObj)
    {
        var ASendJSON = {};
        var AJobID;
        var AResult;

        ASendJSON.type = "function";
        ASendJSON.command = "client_ip";

        AJobID = _JobQueue_MakeJobID("client_ip_call");
        ASendJSON.job_id = AJobID;

        _JobQueue_AddJob(AJobID, call_back_func, scopeObj);

        AResult = _SendJSON(ASendJSON);

        ASendJSON = null;

        if (AResult)
        {
            return AJobID;
        }
        else
        {
            _JobQueue_PopJob(AJobID);
            return "";
        }
    });

    // 초기화 함수 호출...
    __constructor();
});
//}
