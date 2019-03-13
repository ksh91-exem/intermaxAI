/**
 * InterMax 로그인 화면
 */

if (window.opener) {
    document.getElementById('main').style.display = 'none';
}

/**********************************************************/
/**              Global Area                              */
/**********************************************************/
var mainApp;

var INTERMAX_TYPE = {
    RTM : 0,
    PA : 1
};

var Comm = {
    loginType : INTERMAX_TYPE.RTM
};

/* 로그인 관련 부분 */
Comm.config = {};
var cfg = Comm.config;

Comm.config.login = {
    user_id     : '',
    login_id    : '',
    password    : '',
    user_name   : '',
    admin_check : '',
    permission: {
        kill_thread    : -1,
        system_dump    : -1,
        memory_leak    : -1,
        property_load  : -1,
        bind           : -1
    } ,
    wasInfoObj : {}
};


/**********************************************************/
/**              util                                     */
/**********************************************************/
var Utils = {};

/**
 * string -> hex
 * @param tmp
 * @returns {string}
 */
Utils.stringToHex = function(tmp) {
    var str = '';
    var i;
    var c;
    var tmp_len = tmp.length;

    for (i = 0; i < tmp_len; i++) {
        c = tmp.charCodeAt(i);
        str += c.toString(16);
    }
    return str;
};

Utils.showMessage = function(title, message, fn) {
    mainApp.$alertWindow.find('.alert-window-title').text(title).next().text(message);
    mainApp.$alertWindowBack.show();
    mainApp.$alertWindow.css({
        'position':'absolute',
        'top':Math.abs(((window.outerHeight - mainApp.$alertWindow.outerHeight()) / 2) + window.scrollY),
        'left':Math.abs(((window.outerWidth - mainApp.$alertWindow.outerWidth()) / 2) + window.scrollX)
    });
    mainApp.$alertWindow.callBack = fn;

};

Utils.TR = function(key) {
    var msgMap = window.msgMap || {};
    return msgMap[key] || key;
};

Utils.deepObjCopy = function(dupeObj) {
    if (! dupeObj) {
        return;
    }

    var retObj = null;
    if (typeof(dupeObj) === 'object') {
        retObj = {};

        if (typeof(dupeObj.length) !== 'undefined') {
            retObj = [];
        }

        for (var objInd in dupeObj) {
            if (typeof(dupeObj[objInd]) === 'object') {
                retObj[objInd] = this.deepObjCopy(dupeObj[objInd]);
            } else if (typeof(dupeObj[objInd]) === 'string' || typeof(dupeObj[objInd]) === 'number') {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof(dupeObj[objInd]) === 'boolean') {
                ((dupeObj[objInd] === true) ? retObj[objInd] = true : retObj[objInd] = false);
            }
        }
    }

    try {
        return retObj;
    } finally {
        retObj = null;
        dupeObj = null;
    }
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = 'expires='+d.toString();

    document.cookie = doEncrypt(cname) + '=' + doEncrypt(cvalue) + ';' + expires + ';';
}

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');

    for (var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return unEncrypt(c.substring(name.length, c.length));
        }
    }
    return '';
}

function doEncrypt(theText) {
    var output = '';
    var Temp = [];
    var Temp2 = [];
    var TextSize = theText.length;
    var rnd;

    for (var i = 0; i < TextSize; i++) {
        rnd = Math.round(Math.random() * 122) + 68;
        Temp[i] = theText.charCodeAt(i) + rnd;
        Temp2[i] = rnd;
    }

    for (i = 0; i < TextSize; i++) {
        output += String.fromCharCode(Temp[i], Temp2[i]);
    }
    return output;
}

function unEncrypt(theText) {
    var output = '';
    var Temp = [];
    var Temp2 = [];
    var TextSize = theText.length;

    for (var i = 0; i < TextSize; i++) {
        Temp[i] = theText.charCodeAt(i);
        Temp2[i] = theText.charCodeAt(i + 1);
    }

    for (i = 0; i < TextSize; i = i+2) {
        output += String.fromCharCode(Temp[i] - Temp2[i]);
    }
    return output;
}



/**********************************************************/
/**               Class Area                              */
/**********************************************************/

/************************* Loading Mask *************************************/
var MainLaoaingMask = function(arg) {
    this.initProperty(arg);
    this.createLayer();
};

MainLaoaingMask.prototype = {

    initProperty : function(arg) {
        this.textColor = '#747474';

        for (var argmuent in arg) {
            this[argmuent] = arg[argmuent];
        }

        if (! this.target) {
            return;
        }

        this.$target = $(this.target).hide();

        this.noticeIndex = 0;

        if (! this.noticeList) {
            // 기본 문구
            this.noticeList = [
                Utils.TR('The verification of the user...'),
                Utils.TR('Connecting to the service...'),
                Utils.TR('Server state is being checked...'),
                Utils.TR('Server configuration is being checked...'),
                Utils.TR('Checking your Server group...'),
                Utils.TR('Intermax starts to initialize...'),
                Utils.TR('Loading the Server list...')
            ];
        }
    },

    createLayer : function() {
        this.layer = $('<div style="position:absolute;width:100%;height:40px;"></div>');

        if (this.showProcessBar) {
            this.processBar = $('<div style="width:100%;height:20px;padding:4px;"><span style="display:block;width:0%;height:100%;transition: all 0.5s;border-radius: 6px;background: linear-gradient(to bottom, #00B4E5 0%, #29C2BF 100%);"></span></div>');
            this.layer.append(this.processBar);
        }

        this.processText = $('<div style="float:left;font-size: 17px;color:'+ this.textColor+ ';line-height: 40px;margin-right: 15px;"></div>');
        this.loadingMask = $('<div class="loading-container"><div class="loading"></div></div>');

        this.layer.append(this.processText);
        this.layer.append(this.loadingMask);

        $(this.target).append(this.layer);
    },

    show : function() {
        this.processText.text(this.noticeList[this.noticeIndex++]);
        this.$target.show();
    },

    hide : function() {
        this.$target.hide();
    },

    dsetory : function() {
        this.$target.children().remove();
        this.$target = null;
    },

    nextProcessLoad : function(index) {
        var idx = index == null ? this.noticeIndex : index;

        this.processText.text(this.noticeList[idx]);

        if (this.showProcessBar) {
            this.processBar.find('span').width( (idx / (this.noticeList.length - 1) * 100) + '%');
        }

        if (this.noticeList.length - 1 === idx && this.complete) {
            this.complete();
        }
        this.noticeIndex++;
    },

    setNotice : function(notice) {
        this.noticeList = notice;
    }
};


/********************************************* main ************************************************/

var AppLaunch = function(arg) {
    // 브라우저 언어에 따른 타이틀 설정.
    if (navigator.language === 'ko' || navigator.language === 'ko-KR') {
        document.title = 'InterMax';
        $('div.login-left-area div.login-logo').removeClass('global');
    } else {
        document.title = 'MaxGauge for Java';
    }

    this.createLayer();
    this.initProperty(arg);
    this.bindEvent();
};

/**
 * @note 다국어 지원때문에 text 처리는 스크립트 처리한다.
 */
AppLaunch.prototype.createLayer = function() {

    $('.login-type-container').append(
        '<div class="login-type login-rtm" data-type="0">' +
        '<div class="login-name">' + Utils.TR('RealTime Monitor') + '</div>' +
        '<div class="login-icon"></div>' +
        '</div>'
    );

    var $loginFiledArea = $('.login-field-area');

    // Remember User ID
    if (!common.Menu.useOTP) {
        $loginFiledArea.append(
            '<input id="idChb_RememberUserId" type="checkbox" tabindex="4"/>' +
            '<label for="idChb_RememberUserId"><span></span>' + Utils.TR('Remember User ID') + '</label>'
        );
    };

    // 로그인 필드
    $loginFiledArea.find('.login-field').append(
        '<input id="idTxt_id" class="login-field-id text-field" type="text" tabindex="1" placeholder="ID"/>'+
        '<input id="idTxt_pw" class="login-field-pw text-field" type="password" tabindex="2" placeholder="Password"/>'+
        '<button id="idBtn_ok" class="login-field-btn" tabindex="3">' + Utils.TR('Login') + '</button>'
    );

    if (common.Menu.useOTP) {
        $loginFiledArea.find('.login-field #idBtn_ok').before(
            '<input id="idTxt_otp" class="login-field-otp text-field" type="text" tabindex="3" placeholder="OTP"/>'
        );
    }

    // 로그인 패스워드 변경 화면
    this.$loginChnage = $('.login-change-field-wrap').append(
        '<h2>' + Utils.TR('Change Password') + '</h2>' +
        '<div class="login-change-field">' +
        '<div><label>' + Utils.TR('User ID') + '</label><input id="idTxt_change_id" type="text" class="text-field" tabindex="4" disabled/></div>' +
        '<div><label>' + Utils.TR('Current Password') +'</label><input id="idTxt_change_pw" type="password" class="text-field" tabindex="5" disabled/></div>' +
        '<div><label>' + Utils.TR('New Password') +'</label><input id="idTxt_change_new_pw" type="password" class="text-field" tabindex="6"/></div>' +
        '<div><label>' + Utils.TR('Confirm Password') +'</label><input id="idTxt_change_confirm_pw" type="password" class="text-field" tabindex="7"/></div>' +
        '</div>'
    );

    this.$loginChangeCaution = $('.login-change-caution').append(
        '<h2>' + Utils.TR('Caution') + '</h2>'+
        '<div><span class="policy-icon"></span><span class="policy-text">' + Utils.TR('Password must include at least one character.') + '</span></div>'+
        '<div><span class="policy-icon"></span><span class="policy-text">' + Utils.TR('Password must include at least one number.') + '</span></div>'+
        '<div><span class="policy-icon"></span><span class="policy-text">' + Utils.TR('Password must include at least one special character.') + '</span></div>'+
        '<div><span class="policy-icon"></span><span class="policy-text">' + Utils.TR('Password cannot be set the same character repeatedly.') + '</span></div>'+
        '<div><span class="policy-icon"></span><span class="policy-text">' + Utils.TR('Password cannot be the same as user id.') + '</span></div>'
    );

    this.$loginChange = $('.login-change-area')
        .append('<button id="idBtn_change_ok" class="login-field-btn" tabindex="8">' + Utils.TR('O K') + '</button>');

    // 알람창
    this.$alertWindow = $(
        '<div class="alert-window">' +
        '<div class="alert-window-icon"></div>'+
        '<div class="alert-window-title"></div>'+
        '<div class="alert-window-text"></div>'+
        '<div class="alert-window-close">x</div>'+
        '</div>'
    );

    this.$alertWindow.find('.alert-window-close').on('click', function(e) {
        e.preventDefault();
        this.$alertWindowBack.fadeOut('fast');
        if (this.$alertWindow.callBack) {
            this.$alertWindow.callBack();
        }
    }.bind(this));

    $('body').append(this.$alertWindow);

    this.$alertWindowBack = this.$alertWindow.wrap('<div class="alert-window-background"></div>').parent();

    if (localStorage.getItem('UserID') && localStorage.getItem('Intermax_login') === 'true' && common.Menu.useAutoLogin) {
        this.$loginFieldArea = $('.login-field-area');
        this.$loginFieldArea.hide();
    }

    this.$alertWindowBack[0].addEventListener('click', function(e) {
        if (e.target !== this.$alertWindowBack[0]) {
            return;
        }
        this.$alertWindowBack.fadeOut('fast');

        if (this.$alertWindow.callBack) {
            this.$alertWindow.callBack();
        }
    }.bind(this), false);
};

AppLaunch.prototype.initProperty = function() {
    // web socket init
    this.WS    = new IMXWS();
    this.WS.Host = location.hostname;
    this.WS.Port = location.port;
    this.WS.parseJSON = true;
    this.WS.ExtractHeader = true;
    this.WS.PushData = false;
    this.WS.UseType = 'Login';
    this.WS.Open();

    this.WS.onConfig = function(header, data) {
        var tmpLogin, AJSON2;

        //웹소켓 레파지토리 설정
        if (header.command === 'database_list') {

            console.debug('%c [Login]  Setting Repository configuration info', 'color:blue;');

            Comm.repositoryInfo = data;

            var ix;
            var myRepo = String(localStorage.getItem('Intermax_MyRepository'));
            var defaultRepo;

            if (myRepo !== 'null') {
                if (Comm.repositoryInfo.length > 2) {
                    for (ix = 0; ix < Comm.repositoryInfo.length; ix++) {
                        if (Comm.repositoryInfo[ix].database_default === true) {
                            Comm.currentRepositoryInfo = Comm.repositoryInfo[ix];
                            this.WS.defaultdb = Comm.currentRepositoryInfo.database_name;
                            break;
                        }
                    }
                } else {
                    for (ix in Comm.repositoryInfo) {
                        if (Comm.repositoryInfo[ix]['database_default'] === true) {
                            defaultRepo = Comm.repositoryInfo[ix];
                        }
                        if (Comm.repositoryInfo[ix]['database_name'] === myRepo) {
                            Comm.currentRepositoryInfo = Comm.repositoryInfo[ix];
                            break;
                        }
                    }

                    if (!Comm.currentRepositoryInfo) {
                        Comm.currentRepositoryInfo = defaultRepo;
                        myRepo = Comm.currentRepositoryInfo.database_name;
                    }

                    this.WS.defaultdb = myRepo;
                }
            } else {
                for (ix in data) {
                    if (data[ix]['database_name'] === this.WS.defaultdb) {
                        Comm.currentRepositoryInfo = data[ix];
                    }
                }
            }

            if (Comm.currentRepositoryInfo == null) {
                console.debug('%c [Login] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;',
                    'Current Repository Info is undefined. Please check compare Repository info in configuration file and local storage.');
            }

            cfg.repository = Comm.currentRepositoryInfo.database_type;
            localStorage.setItem('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);

            if (common.Menu.useAutoLogin) {
                tmpLogin = localStorage.getItem('Intermax_login');
                if (tmpLogin === 'true') {
                    this._tempId = localStorage.getItem('UserID');

                    AJSON2 = {};
                    AJSON2['function'] = 'checkLogin';
                    AJSON2.dll_name  = 'IntermaxPlugin.dll';
                    AJSON2.options   = {
                        dbname  : Comm.currentRepositoryInfo.database_name,
                        type    : 'auto',
                        login_id: this._tempId
                    };
                    this.WS.PluginFunction( AJSON2 , this.loginCheck , this );
                }
            }

        }
    }.bind(this);


    this.loginId  = document.getElementById('idTxt_id');
    this.loginPw  = document.getElementById('idTxt_pw');
    this.loginOtp = document.getElementById('idTxt_otp');
    this.loginOk  = document.getElementById('idBtn_ok');
    this.loginRememberId = document.getElementById('idChb_RememberUserId');

    this.$loginFieldArea = $('.login-field-area');
    this.$loginTypeContainer = $('.login-type-container');
    this.$loginLeftArea = $('.login-left-area');

    this.iframe = document.getElementById('idIframe');
    this.iframe.src='./view.html';

    if (localStorage.getItem('UserID') != null) {
        if (localStorage.getItem('Remember UserID') === 'true') {
            this.loginId.value = localStorage.getItem('UserID');
            this.loginPw.focus();
        } else {
            this.loginId.focus();
        }
    } else {
        this.loginId.focus();
    }

    if (localStorage.getItem('Remember UserID') === 'true') {
        this.loginRememberId.checked  = true;
    }

    if (localStorage.getItem('Intermax_Observer_Execute') == null) {
        localStorage.setItem('Intermax_Observer_Execute', 'false');
    }

};

/**
 * @note 엘리먼트 이벤트 바인딩
 */
AppLaunch.prototype.bindEvent = function() {

    // 로그인 버튼 클릭
    this.loginOk.onclick = function(e) {
        e.preventDefault();

        // validation check
        if (this.loginId.value === '') {
            Utils.showMessage(Utils.TR(''), Utils.TR('Please enter a ID'), function() {
                this.loginId.focus();
            }.bind(this));

            return;
        }

        if (this.loginPw.value === '') {
            Utils.showMessage(Utils.TR(''), Utils.TR('Please enter a password'), function() {
                this.loginPw.focus();
            }.bind(this));

            return;
        }

        if (this.loginOtp && this.loginOtp.value === '') {
            Utils.showMessage(Utils.TR(''), Utils.TR('Please Enter Certification Number.'), function() {
                this.loginOtp.focus();
            }.bind(this));

            return;
        }

        if (this.loadingMask) {
            this.loadingMask.dsetory();
        }

        this.$loginTypeContainer.find('.login-pa').hide();

        this.loadingMask = new MainLaoaingMask({
            target: $('.loading-area'),
            complete: function() {
                this.$loginLeftArea.hide();
                $('.login-logo').hide();
                $('#main').hide();
                this.iframe.style.opacity = 1;
            }.bind(this)
        });

        this.$loginFieldArea.hide();
        this.loadingMask.show();

        console.debug('%c [Login]  Start Login Porcess', 'color:blue;');

        this.login();

    }.bind(this);

    // OTP 엔터 이벤트
    if (common.Menu.useOTP) {
        this.loginOtp.onkeypress = function(event) {
            if (event.which === 13 || event.keyCode === 13) {
                this.loginOk.click();
            }
        }.bind(this);
    } else {
        // 패스워드 엔터 이벤트
        this.loginPw.onkeypress = function(event) {
            if (event.which === 13 || event.keyCode === 13) {
                this.loginOk.click();
            }
        }.bind(this);
    }
};

/**
 * @note 로그인 접속된 경우 로그인 화면 없이 진행
 */
AppLaunch.prototype.loginCheck = function(aheader, adata) {

    console.debug('%c [Login]  Auto Login', 'color:blue;');

    try {
        // 로그인 실패 or change password
        if (adata == null ||  adata.error !== undefined || adata.result !== 'true') {
            this._isloginPass = -1;
            this.isCheckTimeout = false;

            console.debug('%c [Login]  Login Failed.', 'color:#800000;background-color:silver;');

            if(adata.result === '-200'){
                Utils.showMessage( Utils.TR('ERROR'), Utils.TR('Access restricted IP.'));
            }

            this.$loginFieldArea.fadeIn(1000);
            this.$loginFieldArea[0].getElementsByClassName('login-field-id text-field').idTxt_id.setRangeText(this._tempId);
            this.$loginTypeContainer.find('div').show();
        } else {
            console.debug('%c [Login]  Login Success.', 'color:blue;');

            // 로그인 성공
            this._isloginPass = 1;

            if (this.loadingMask) {
                this.loadingMask.dsetory();
            }

            this.$loginTypeContainer.find('.login-pa').hide();

            this.loadingMask = new MainLaoaingMask({
                target: $('.loading-area'),
                complete: function() {
                    setTimeout(function() {
                        $('#main').hide();
                        this.iframe.style.opacity = 1;
                    }.bind(this),0);

                }.bind(this)
            });

            this.$loginFieldArea.hide();
            this.loadingMask.show();

            this.loadingMask.nextProcessLoad();

            this.rtmLoad();
        }
    } catch(exception) {
        Utils.showMessage( Utils.TR('ERROR'), exception.message);
    }

};

/**
 * @note 로그인
 * @param id
 * @param pw
 */
AppLaunch.prototype.login = function() {

    if (Comm.currentRepositoryInfo == null) {
        var warnMessage = 'Current Repository Info is undefined. Please check local storage repository info.';
        console.debug('%c [Login] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', warnMessage);

        this.backInitLogin(warnMessage);

        return;
    }

    if (this.WS.defaultdb !== Comm.currentRepositoryInfo.database_name) {

        console.debug('%c [Login]  Checking Default Database...', 'color:#63A5E0;');

        setTimeout(function() {
            this.login.call(this);
        }.bind(this),5);

        return;
    }

    this.checkProcessTimeout(false);

    console.debug('%c [Login]  Checked Default Database.', 'color:blue;');

    this._tempId = this.loginId.value;
    this._tempPwd = this.loginPw.value;

    if (this.loginRememberId && this.loginRememberId.checked) {
        localStorage.setItem('UserID', this._tempId);
        localStorage.setItem('Remember UserID', true);
    } else {
        localStorage.removeItem('Remember UserID');
        localStorage.removeItem('UserID');
    }

    var AJSON2 = {};
    AJSON2['function'] = 'checkLogin';
    AJSON2.dll_name  = 'IntermaxPlugin.dll';
    AJSON2.options   = {
        dbname  : Comm.currentRepositoryInfo.database_name,
        type    : 'select',
        login_id: this._tempId,
        password: this._tempPwd
    };
    this._isloginPass = 0; // 로그인 안함

    console.debug('%c [Login]  Checking Login Info...', 'color:#3191C8;');

    this.WS.PluginFunction( AJSON2 , this.checkLogin , this );

};

/**
 * @note 로그인 체크
 * @param aheader
 * @param adata
 */
AppLaunch.prototype.checkLogin = function(aheader, adata) {
    console.debug('%c [Login]  Checking Login Info... Validate', 'color:blue;');

    this.checkProcessTimeout(false);

    this.loadingMask.nextProcessLoad();

    try {
        // 로그인 실패 or change password
        if (adata == null ||  adata.error !== undefined || adata.result !== 'true') {
            this._isloginPass = -1;
            this.isCheckTimeout = false;

            console.debug('%c [Login]  Login Failed.', 'color:#800000;background-color:silver;');

            if(adata.result === '-200'){
                Utils.showMessage( Utils.TR('ERROR'), Utils.TR('Access restricted IP.'));
            } else if(adata.result === '-100'){
                Utils.showMessage( Utils.TR('ERROR'), Utils.TR('Sorry, your user id or password is incorrect. Please try again.'));
            }

            this.loadingMask.hide();
            this.$loginFieldArea.fadeIn(1000);
            this.$loginTypeContainer.find('div').show();
        } else {
            console.debug('%c [Login]  Login Success.', 'color:blue;');

            // 로그인 성공
            this._isloginPass = 1;

            if (common.Menu.useOTP) {
                var AJSON = {};

                AJSON.dll_name = "IntermaxPlugin.dll";
                AJSON.function = "get_extends_script";
                AJSON.options = {
                    func_name : "mrae_otp",
                    userid : this.loginId.value,
                    password : this.loginOtp.value
                };

                this.WS.PluginFunction( AJSON , this.otpLoad , this );
            } else {
                this.rtmLoad();
            }

        }
    } catch(exception) {
        Utils.showMessage( Utils.TR('ERROR'), exception.message);
    }
};


AppLaunch.prototype.otpLoad = function(aheader, adata) {

    if (adata.result) {
        this.rtmLoad();
    } else {
        Utils.showMessage( Utils.TR('ERROR'), adata.result.message);

        this.loadingMask.hide();
        this.$loginFieldArea.fadeIn(1000);
        this.$loginTypeContainer.find('div').show();
    }

};


AppLaunch.prototype.rtmLoad = function( isCache ) {

    this.checkProcessTimeout(false);

    var ds = {};

    cfg.login.login_id = this._tempId;

    console.debug('%c [Login]  Loading Service Info...', 'color:#63A5E0;');

    this.WS.SQLExec({
        sql_file: 'IMXPA_SelectService_AllService.sql',
        bind : [{
            name: 'id',
            type: 'string',
            value: cfg.login.login_id
        }]
    }, function(header, data) {
        mainApp.SQL_cache['IMXPA_SelectService_AllService']['header']  = header;
        mainApp.SQL_cache['IMXPA_SelectService_AllService']['data']    = data;
        mainApp.SQL_cache['IMXPA_SelectService_AllService']['_isload'] = true;

        console.debug('%c [Login]  Loading Service Info... Complete', 'color:blue;');
    });

    console.debug('%c [Login]  Loading User Permission and Service...', 'color:#63A5E0;');

    ds.sql_file = 'IMXRT_Login.sql';
    ds.bind = [{
        name: 'id',
        type: 'string',
        value: cfg.login.login_id
    }];
    this.WS.SQLExec(ds, function(aheader, adata) {

        this.checkProcessTimeout(false);

        console.debug('%c [Login]  Loading User Permission and Service... Complete', 'color:blue;');

        ds = null;

        console.debug('%c [Login]  Checking User Data...', 'color:#63A5E0;');

        var isErrorMsg = false;
        if (aheader != null && aheader.success === false) {
            isErrorMsg = true;
            console.debug('%c [Login] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', aheader.message);
        }

        if (isErrorMsg === true || adata == null || adata[0].rows.length <= 0) {
            console.debug('%c [Login] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'User information is not valid.');

            this.isCheckTimeout = false;

            if ( isCache !== true ) {
                Utils.showMessage(Utils.TR('ERROR'), Utils.TR('User information is not valid.'));

                this.loadingMask.hide();
                this.$loginFieldArea.fadeIn(1000);
                this.$loginTypeContainer.find('div').show();

                window.intermax_login = false;
                localStorage.removeItem('Intermax_login');
            }

            return;
        } else if (adata[2].rows.length <= 0) {
            console.debug('%c [Login] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Configured service is a user that does not exist.');

            this.isCheckTimeout = false;

            if ( isCache !== true ) {
                Utils.showMessage(Utils.TR('ERROR'), Utils.TR('Configured service is a user that does not exist.'));
                this.loadingMask.hide();
                this.$loginFieldArea.fadeIn(1000);
                this.$loginTypeContainer.find('div').show();

                window.intermax_login = false;
                localStorage.removeItem('Intermax_login');
            }
            return;
        }
        console.debug('%c [Login]  Checking User Data... Complete', 'color:blue;', '(UserID: ' + adata[0].rows[0][0], ', LoginID: ' + adata[0].rows[0][1]+')');

        cfg.login.user_id     = adata[0].rows[0][0];
        cfg.login.login_id    = adata[0].rows[0][1];
        cfg.login.user_name   = adata[0].rows[0][2];
        cfg.login.admin_check = adata[0].rows[0][3];

        if ( isCache !== true ) {
            this.loadingMask.nextProcessLoad();
        }

        if (adata[1] != null) {

            if (adata[1].rows.length === 0) {
                cfg.login.permission.kill_thread   = 0;
                cfg.login.permission.system_dump   = 0;
                cfg.login.permission.memory_leak   = 0;
                cfg.login.permission.property_load = 0;
                cfg.login.permission.bind          = 0;
            } else {
                cfg.login.permission.kill_thread   = adata[1].rows[0][0];
                cfg.login.permission.system_dump   = adata[1].rows[0][1];
                cfg.login.permission.memory_leak   = adata[1].rows[0][2];
                cfg.login.permission.property_load = adata[1].rows[0][3];
                cfg.login.permission.bind          = adata[1].rows[0][4];
            }
        }

        if ( isCache !== true ) {
            this.loadingMask.nextProcessLoad();
        }

        cfg.login.user_services = [];

        for (var ix = 0; ix < adata[2].rows.length; ix++) {
            cfg.login.user_services.push(adata[2].rows[ix][1]);
        }

        if ( isCache !== true ) {
            this.loadingMask.nextProcessLoad();
        }

        if (common.Menu.useOTP) {
            window.intermax_login = false;
        } else {
            window.intermax_login = true;
        }

        localStorage.setItem('Intermax_login', window.intermax_login);
        localStorage.setItem('UserID', cfg.login.login_id);

        this.iframe.style.opacity = 0;
        this.iframe.style.display = 'block';

        if ( isCache !== true ) {
            this.loadingMask.nextProcessLoad();
        }

        this.isCheckTimeout = false;

        console.debug('%c [Login]  Ready load resource files', 'color:blue;');

        var send_init = function( a, b ) {

            if ( Date.now() - b > 30000 ) {
                this.isCheckTimeout = false;
                mainApp.backInitLogin();
                return;
            }

            if ( mainApp.SQL_cache['IMXPA_SelectService_AllService']._isload !== true
                || !a.contentWindow
                || !a.contentWindow.document
                || a.contentWindow.document.readyState !== 'complete'
                || !a.contentWindow.addEventListener
                ) {
                return setTimeout(send_init, 50, a, b );
            }

            mainApp.WS.close();

            console.debug('%c [Login]  Start load resource files', 'color:blue;');

            a.contentWindow.postMessage({ 'event' : 'IMXRT_LoginAuthGetInfo.sql' }, location.protocol+'//'+location.host);
            console.timeEnd(' [Login]  Send Load Message');
        };

        console.time(' [Login]  Send Load Message');

        this.checkProcessTimeout(false);

        setTimeout(send_init, 10, this.iframe, Date.now());

    }, this);

};


/**
 * Comm.js에서 사용
 * @return {}
 */
AppLaunch.prototype.getConfig = function() {
    return Utils.deepObjCopy(Comm);
};

/**
 * 로그인 프로세스 타임아웃 체크.
 * 로그인 처리가 설정된 시간값을 초과하는 경우 초기 로그인 화면으로 가도록 한다.
 *
 * @param {boolean} isLoop - false: 초기 호출, true: 반복 호출
 */
AppLaunch.prototype.checkProcessTimeout = function(isLoop) {
    if (this.timeoutId != null) {
        clearTimeout(this.timeoutId);
    }

    if (isLoop === true) {
        this.loginTimeoutCount++;
    } else {
        this.loginTimeoutCount = 0;
        this.isCheckTimeout = true;
    }

    if (this.isCheckTimeout === true) {
        if (this.loginTimeoutCount > 30) {
            this.loginTimeoutCount = null;
            this.backInitLogin();
        } else {
            this.timeoutId = setTimeout(this.checkProcessTimeout.bind(this, true), 1000);
        }
    } else {
        this.loginTimeoutCount = null;
    }
};

/**
 * 초기 로그인 화면상태로 설정.
 *
 * @param {String} msg - 화면에 표시할 메시지.
 */
AppLaunch.prototype.backInitLogin = function(msg) {
    var message = msg || 'Load timed out. Please try again.';

    mainApp._isloginPass = 0;
    window.intermax_login = false;
    localStorage.removeItem('Intermax_login');
    Utils.showMessage( Utils.TR('WARNING'), Utils.TR(message));
    mainApp.loadingMask.hide();
    mainApp.$loginFieldArea.fadeIn(1000);
    mainApp.$loginTypeContainer.find('div').show();
};


/**********************************************************/
/**              InterMax Lanch                           */
/**********************************************************/

mainApp = new AppLaunch();
mainApp.SQL_cache = {};
mainApp.SQL_cache['IMXPA_SelectService_AllService'] = {'_isload':false};
mainApp._isloginPass = 0;
