/**
 * InterMax 로그인 화면
 *
 */

if(window.opener){
    document.getElementById('main').style.display = 'none';
}

/**********************************************************/
/*               Global Area                              */
/**********************************************************/

var INTERMAX_TYPE = {
    RTM : 0,
    PA : 1
};

/***************************************************************************************************************
 *
 * Oracle Version
 * oracle version 에 따라 변경 되어야 할 부분을 위해 사용할 변수
 * 다양한 oracle version이 있어 SQL ID 관련 해서는 10G, 11G 이상 이외의 다른 version 은 예외처리하는 방식으로 사용해야 함
 *
 ***************************************************************************************************************/
var Comm = {
    loginType : INTERMAX_TYPE.PA
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
    },
    wasInfoObj : {}
};


/**********************************************************/
/*               util                                     */
/**********************************************************/
var Utils = {};
/**
 * string -> hex
 * @param tmp
 * @returns {string}
 */
Utils.stringToHex = function(tmp){
    var str = '';
    var i;
    var tmp_len = tmp.length;
    var c = null;

    for (i=0; i < tmp_len; i++) {
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

Utils.TR = function(key){
    var msgMap = window.msgMap || {};
    return msgMap[key] || key;
};

Utils.deepObjCopy = function(dupeObj) {
    if(! dupeObj){
        return;
    }

    var retObj = null;
    if (typeof(dupeObj) == 'object') {
        retObj = {};

        if (typeof(dupeObj.length) != 'undefined')
            retObj = [];
        for (var objInd in dupeObj) {
            if (typeof(dupeObj[objInd]) == 'object') {
                retObj[objInd] = this.deepObjCopy(dupeObj[objInd]);
            } else if ( typeof(dupeObj[objInd]) == 'string' || typeof(dupeObj[objInd]) == 'number' ) {
                retObj[objInd] = dupeObj[objInd];
            } else if (typeof(dupeObj[objInd]) == 'boolean') {
                (dupeObj[objInd] ? retObj[objInd] = true : retObj[objInd] = false);
            }
        }
    }

    try{
        return retObj;
    }finally {
        retObj = null;
        dupeObj = null;
    }
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = 'expires='+d.toString();
    document.cookie = Encrypt(cname) + "=" + Encrypt(cvalue) + ";" + expires + ';';
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return unEncrypt(c.substring(name.length, c.length));
    }
    return "";
}

function Encrypt(theText) {
    var output = {};
    var Temp = [];
    var Temp2 = [];
    var TextSize = theText.length;
    for (var i = 0; i < TextSize; i++) {
        var rnd = Math.round(Math.random() * 122) + 68;
        Temp[i] = theText.charCodeAt(i) + rnd;
        Temp2[i] = rnd;
    }
    for (i = 0; i < TextSize; i++) {
        output += String.fromCharCode(Temp[i], Temp2[i]);
    }
    return output;
}

function unEncrypt(theText) {
    var output = {};
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
/*               Class Area                              */
/**********************************************************/
/********************************************* loading ************************************************/
var MainLaoaingMask = function(arg){
    this.initProperty(arg);
    this.createLayer();
};

MainLaoaingMask.prototype.initProperty = function(arg){
    this.textColor = '#747474';

    for(var argmuent in arg){
        this[argmuent] = arg[argmuent];
    }

    if(! this.target){
        return;
    }

    this.$target = $(this.target).hide();

    this.noticeIndex = 0;

    if(! this.noticeList){
        // 기본 문구
        this.noticeList = [
            Utils.TR('Intermax starts to initialize...'),
            Utils.TR('The verification of the user...'),
            Utils.TR('Loading the script file...'),
            Utils.TR('Loading the configuration...'),
            Utils.TR('Loading the database...'),
            Utils.TR('Initialization of Web Sockets...'),
            Utils.TR('The main screen is loading...'),
            Utils.TR('Completed.')
        ];
    }

};

MainLaoaingMask.prototype.createLayer = function(){
    this.layer = $('<div style="position:absolute;width:100%;height:40px;"></div>');

    if(this.showProcessBar){
        this.processBar = $('<div style="width:100%;height:20px;padding:4px;"><span style="display:block;width:0%;height:100%;transition: all 0.5s;border-radius: 6px;background: linear-gradient(to bottom, #00B4E5 0%, #29C2BF 100%);"></span></div>');
        this.layer.append(this.processBar);
    }

    this.processText = $('<div style="float:left;font-size: 17px;color:'+ this.textColor+ ';line-height: 40px;margin-right: 15px;"></div>');
    this.loadingMask = $('<div class="loading-container"><div class="loading"></div></div>');

    this.layer.append(this.processText);
    this.layer.append(this.loadingMask);

    $(this.target).append(this.layer);
};

MainLaoaingMask.prototype.show = function(){
    this.processText.text(this.noticeList[this.noticeIndex++]);
    this.$target.show();
};

MainLaoaingMask.prototype.hide = function(){
    this.$target.hide();
};

MainLaoaingMask.prototype.dsetory = function(){
    this.$target.children().remove();
    this.$target = null;
};


/**
//MainLaoaingMask.prototype.startLoading = function(){
//    this.nextProcessLoad();
//    setTimeout(this.startLoading.bind(this),500);
//};

//MainLaoaingMask.prototype.endLoading = function(text){
//    this.processText.text(text || this.noticeList[this.noticeList.length - 1]);
//    if(this.showProcessBar){
//        this.processBar.find('span').width( '100%');
//    }
//
//    if(this.complete){
//        this.complete();
//    }
//};
 ************

MainLaoaingMask.prototype.nextProcessLoad = function(index){
    var idx = index == null ? this.noticeIndex : index;

    this.processText.text(this.noticeList[idx]);
    if(this.showProcessBar){
        this.processBar.find('span').width( (idx / (this.noticeList.length - 1) * 100) + '%');
    }
    if(this.noticeList.length - 1 == idx){
        if(this.complete){
            this.complete();
        }
    }
    this.noticeIndex++;
};

MainLaoaingMask.prototype.setNotice = function(notice){
    this.noticeList = notice;
};

/********************************************* main ************************************************/

var AppLaunch = function(arg){
    // 브라우저 언어에 따른 타이틀 설정.
    if (navigator.language == 'ko' || navigator.language == 'ko-KR') {
        document.title = 'InterMax';
        $('div.login-left-area div.login-logo').removeClass('global');
    } else {
        document.title = 'MaxGauge for Java';
    }

    if(window.opener){
        this.directPathWin();
    }else{
        this.createLayer();
        this.initProperty(arg);
        this.bindEvent();
    }

    var tmpLogin = localStorage.getItem('Intermax_login');
    if (tmpLogin == 'true') {
        this._tempId = localStorage.getItem('UserID');
        this.loginCheck();
    }
};

/**
 * @note 다국어 지원때문에 text 처리는 스크립트 처리한다.
 */
AppLaunch.prototype.createLayer = function(){
    // 왼쪽 RTM / PA 선택 부분
    $('.login-type-container').append(
//        '<div class="login-type login-rtm" data-type="0">' +
//        '<div class="login-name">' + Utils.TR('RealTime Monitor') + '</div>' +
//        '<div class="login-icon"></div>' +
//        '</div>' +
        '<div class="login-type login-pa" data-type="1">' +
        '<div class="login-name">' + Utils.TR('Performance Analyzer' )+ '</div>' +
        '<div class="login-icon"></div>' +
        '</div>'
    );

    // Remember User ID
    var $loginFiledArea = $('.login-field-area')
        .append(
        '<input id="idChb_RememberUserId" type="checkbox" tabindex="4"/>' +
        '<label for="idChb_RememberUserId"><span></span>' + Utils.TR('Remember User ID') + '</label>'
    );
    // 로그인 필드
    $loginFiledArea.find('.login-field').append(
        '<input id="idTxt_id" class="login-field-id text-field" type="text" tabindex="1" placeholder="ID"/>'+
        '<input id="idTxt_pw" class="login-field-pw text-field" type="password" tabindex="2" placeholder="Password"/>'+
        '<button id="idBtn_ok" class="login-field-btn" tabindex="3">' + Utils.TR('Login') + '</button>'
    );
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

    this.$alertWindow.find('.alert-window-close').on('click', function(){
        this.$alertWindowBack.fadeOut('fast');
        if(this.$alertWindow.callBack){
            this.$alertWindow.callBack();
        }
    }.bind(this));

    $('body').append(this.$alertWindow);
    this.$alertWindowBack = this.$alertWindow.wrap('<div class="alert-window-background"></div>').parent();
    this.$alertWindowBack[0].addEventListener('click', function(e){
        if(e.target !== this.$alertWindowBack[0]){
            return;
        }
        this.$alertWindowBack.fadeOut('fast');
        if(this.$alertWindow.callBack){
            this.$alertWindow.callBack();
        }
    }.bind(this), false);
};

AppLaunch.prototype.initProperty = function(){
    // web socket init
    this.WS    = new IMXWS();
    this.WS.Host = location.hostname;
    this.WS.Port = location.port;
    this.WS.parseJSON = true;
    this.WS.ExtractHeader = true;
    this.WS.PushData = false;
    this.WS.Open();

    this.WS.onConfig = function(header, data){
        //웹소켓 레파지토리 설정
        if (header.command == 'database_list') {
            Comm.repositoryInfo = data;
            var ix = null;
            var myRepo = String(localStorage.getItem('Intermax_MyRepository'));

            if (myRepo !== 'null') {
                this.WS.defaultdb = myRepo;
                for (ix in Comm.repositoryInfo) {
                    if (Comm.repositoryInfo[ix]['database_name'] == myRepo) {
                        Comm.currentRepositoryInfo = Comm.repositoryInfo[ix];
                        break;
                    }
                }
            }
            for (ix in data) {
                if (data[ix]['database_name'] == this.WS.defaultdb) {
                    Comm.currentRepositoryInfo = data[ix];
                }
            }

            cfg.repository = Comm.currentRepositoryInfo.database_type;
            localStorage.setItem('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
            common.WebEnv.Save('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
        }
    }.bind(this);

    this.mainLayer = document.getElementById('main');

    this.loginId = document.getElementById('idTxt_id');
    this.loginPw = document.getElementById('idTxt_pw');
    this.loginOk = document.getElementById('idBtn_ok');
    this.loginRememberId = document.getElementById('idChb_RememberUserId');

    this.$loginFieldArea = $('.login-field-area');
    this.$loginTypeContainer = $('.login-type-container');
    this.$loginLeftArea = $('.login-left-area');

    this.iframe = document.getElementById('idIframe');

    if(localStorage.getItem('UserID') != null){
        if(localStorage.getItem('Remember UserID') == 'true'){
            this.loginId.value = localStorage.getItem('UserID');
            this.loginPw.focus();
        } else {
            this.loginId.focus();
        }
    }else{
        this.loginId.focus();
    }

    if(localStorage.getItem('Remember UserID') == 'true'){
        this.loginRememberId.checked  = true;
    }

    this.mainLayer = document.getElementById('main');
};

/**
 * @note 엘리먼트 이벤트 바인딩
 */
AppLaunch.prototype.bindEvent = function(){
    /**
    // RTM, PA 선택 애니메이션 효과
//    var $loginType = $('.login-type').on('click', function(e){
//        if(e.currentTarget.dataset.type == INTERMAX_TYPE.RTM){
//            e.currentTarget.style.top = '0px';
//            e.currentTarget.style.opacity = 1;
//            e.currentTarget.nextElementSibling.style.top = '38px';
//            e.currentTarget.nextElementSibling.style.opacity = 0.3;
//            Comm.loginType = INTERMAX_TYPE.RTM;
//        }else{
//            e.currentTarget.style.top = '0px';
//            e.currentTarget.style.opacity = 1;
//            e.currentTarget.previousElementSibling.style.top = '38px';
//            e.currentTarget.previousElementSibling.style.opacity = 0.3;
//            Comm.loginType = INTERMAX_TYPE.PA;
//        }
//
//        //$loginType[0].style.top = Math.abs(+$loginType.eq(0).css('top').replace('px', '') - 38) + 'px';
//        //if(+$loginType.eq(0).css('opacity') == 1){
//        //    $loginType[0].style.opacity = 0.3;
//        //    Comm.loginType = INTERMAX_TYPE.PA;
//        //}else{
//        //    $loginType[0].style.opacity = 1;
//        //    Comm.loginType = INTERMAX_TYPE.RTM;
//        //}
//        //$loginType[1].style.top = Math.abs(+$loginType.eq(1).css('top').replace('px', '') - 38) + 'px';
//        //$loginType[1].style.opacity = +$loginType.eq(1).css('opacity') == 1 ? 0.3 : 1;
//
//
//        if(this.loginId.value == ''){
//            this.loginId.focus();
//        }else if(this.loginPw.value == ''){
//            this.loginPw.focus();
//        }else{
//            this.loginOk.focus();
//        }
//    }.bind(this));

    // 마지막 선택된 PA or RTM 을 불러와서 선택
    //$loginType.filter('[data-type=' + localStorage.Intermax_LastSelectedType + ']').click();
     */

    // 로그인 버튼 클릭
    this.loginOk.onclick = function(e){
        e.preventDefault();

        // validation check
        if(this.loginId.value == ''){
            Utils.showMessage(Utils.TR(''), Utils.TR('Please enter a ID'), function(){
                this.loginId.focus();
            }.bind(this));

            return;
        }

        if(this.loginPw.value == ''){
            Utils.showMessage(Utils.TR(''), Utils.TR('Please enter a password'), function(){
                this.loginPw.focus();
            }.bind(this));

            return;
        }

        if(this.loadingMask){
            this.loadingMask.dsetory();
        }

        if(Comm.loginType == window.INTERMAX_TYPE.RTM){
            this.$loginTypeContainer.find('.login-pa').hide();

            this.loadingMask = new MainLaoaingMask({
                target: $('.loading-area'),
                noticeList: [
                    Utils.TR('Intermax starts to initialize...'),
                    Utils.TR('The verification of the user...'),
                    Utils.TR('Connecting to the service...'),
                    Utils.TR('Server state is being checked...'),
                    Utils.TR('Server configuration is being checked...'),
                    Utils.TR('Checking your Server group...'),
                    Utils.TR('Loading the Server list...')
                ],
                complete: function(){
                    setTimeout(function(){
                        this.$loginLeftArea.animate({
                            width: window.outerWidth * 1.2
                        }, {
                            duration: 300,
                            complete: function(){

                                $('#main').fadeOut(1000);
                                this.iframe.style.opacity = 1;
                            }.bind(this)
                        });
                        $('.login-logo').hide();
                    }.bind(this), 1000);
                }.bind(this)
            });

        }else{
            this.$loginTypeContainer.find('.login-rtm').hide();

            this.loadingMask = new MainLaoaingMask({
                target: $('.loading-area'),
                noticeList: [
                    Utils.TR('Intermax starts to initialize...'),
                    Utils.TR('The verification of the user...'),
                    Utils.TR('Connecting to the service...'),
                    Utils.TR('Server state is being checked...'),
                    Utils.TR('Server configuration is being checked...'),
                    Utils.TR('Checking your Server group...'),
                    Utils.TR('Loading the Server list...')
                ],
                complete: function(){
                    setTimeout(function(){
                        this.$loginLeftArea.animate({
                            width: window.outerWidth * 1.2
                        }, {
                            duration: 300,
                            complete: function(){
                                $('#main').fadeOut(1000);
                                this.iframe.style.opacity = 1;
                            }.bind(this)
                        });
                        $('.login-logo').hide().css({
                            top: '40%',
                            left: '35%'
                        }).fadeIn(500);
                    }.bind(this), 1000);
                }.bind(this)
            });
        }

        this.$loginFieldArea.hide();
        this.loadingMask.show();

        this.login();
    }.bind(this);

    // 패스워드 엔터 이벤트
    this.loginPw.onkeypress = function(event){
        if (event.which == 13 || event.keyCode == 13) {
            this.loginOk.click();
        }
    }.bind(this);
    /**
    //$('#idBtn_change_ok').on('click', function(e){
    //    var result = this.checkChangeValid();
    //    if(this.checkPolicy && result ){
    //        var AJSON2 = {};
    //        AJSON2['function'] = "mxg_password_update";
    //        AJSON2.dll_name  = "maxgauge.dll";
    //        AJSON2.options   = {
    //            username: Utils.stringToHex(this._tempId),
    //            current_password: Utils.stringToHex(this._tempPwd),
    //            new_password: Utils.stringToHex(result.newPw)
    //        };
    //        this.WS.PluginFunction( AJSON2 , this.onPasswordUpdate , this );
    //        AJSON2  = null;
    //    }
    //}.bind(this));
    //
    //document.getElementById('idTxt_change_new_pw').onkeyup = function(e){
    //    this.checkPolicy(e.target);
    //    e = null;
    //}.bind(this);
     **/
};

/**
 * @note 로그인 접속된 경우 로그인 화면 없이 진행
 */
AppLaunch.prototype.loginCheck = function(){

    if(this.loadingMask){
        this.loadingMask.dsetory();
    }

    if (Comm.loginType == window.INTERMAX_TYPE.RTM) {
        this.$loginTypeContainer.find('.login-pa').hide();

        this.loadingMask = new MainLaoaingMask({
            target: $('.loading-area'),
            noticeList: [
                Utils.TR('Intermax starts to initialize...'),
                Utils.TR('The verification of the user...'),
                Utils.TR('Connecting to the service...'),
                Utils.TR('Server state is being checked...'),
                Utils.TR('Server configuration is being checked...'),
                Utils.TR('Checking your Server group...'),
                Utils.TR('Loading the Server list...')
            ],
            complete: function(){
                setTimeout(function(){
                    this.$loginLeftArea.animate({
                        width: window.outerWidth * 1.2
                    }, {
                        duration: 300,
                        complete: function(){

                            $('#main').fadeOut(1000);
                            this.iframe.style.opacity = 1;
                        }.bind(this)
                    });
                    $('.login-logo').hide();
                }.bind(this), 1000);
            }.bind(this)
        });

    } else {
        this.$loginTypeContainer.find('.login-rtm').hide();

        this.loadingMask = new MainLaoaingMask({
            target: $('.loading-area'),
            noticeList: [
                Utils.TR('Intermax starts to initialize...'),
                Utils.TR('The verification of the user...'),
                Utils.TR('Connecting to the service...'),
                Utils.TR('Server state is being checked...'),
                Utils.TR('Server configuration is being checked...'),
                Utils.TR('Checking your Server group...'),
                Utils.TR('Loading the Server list...')
            ],
            complete: function(){
                setTimeout(function(){
                    this.$loginLeftArea.animate({
                        width: window.outerWidth * 1.2
                    }, {
                        duration: 300,
                        complete: function(){
                            $('#main').fadeOut(1000);
                            this.iframe.style.opacity = 1;
                        }.bind(this)
                    });
                    $('.login-logo').hide().css({
                        top: '40%',
                        left: '35%'
                    }).fadeIn(500);
                }.bind(this), 1000);
            }.bind(this)
        });
    }

    this.$loginFieldArea.hide();
    this.loadingMask.show();

    this.loadingMask.nextProcessLoad();

    this.paLoad();

};

/**
 * @note 로그인
 * @param id
 * @param pw
 */
AppLaunch.prototype.login = function(){
    if(this.WS.defaultdb != Comm.currentRepositoryInfo.database_name){
        setTimeout(function(){
            this.login.call(this);
        }.bind(this),5);

        return;
    }

    this._tempId = this.loginId.value;
    this._tempPwd = this.loginPw.value;

    if(this.loginRememberId.checked){
        localStorage.setItem('UserID', this._tempId);
        localStorage.setItem('Remember UserID', true);
    }else{
        localStorage.removeItem('Remember UserID');
        localStorage.removeItem('UserID');
    }
    var AJSON2 = {};
    AJSON2['function'] = "checkLogin";
    AJSON2.dll_name  = "IntermaxPlugin.dll";
    AJSON2.options   = {
        dbname  : Comm.currentRepositoryInfo.database_name,
        type    : 'select',
        login_id: this._tempId,
        password: this._tempPwd
    };

    this.WS.PluginFunction( AJSON2 , this.checkLogin , this );
};

/**
 * @note 로그인 체크
 * @param aheader
 * @param adata
 */
AppLaunch.prototype.checkLogin = function(aheader, adata){
    try{
        this.loadingMask.nextProcessLoad();
        // 로그인 실패 or change password
        if (adata == null ||  adata.error !== undefined || adata.result != 'true') {

            console.debug('login failed');

            if(adata.result === '-200'){
                Utils.showMessage( Utils.TR('ERROR'), Utils.TR('Access restricted IP.'));
            } else if(adata.result === '-100'){
                Utils.showMessage( Utils.TR('ERROR'), Utils.TR('Sorry, your user id or password is incorrect. Please try again.'));
            }

            this.loadingMask.hide();
            this.$loginFieldArea.fadeIn(1000);
            this.$loginTypeContainer.find('div').show();
            /**
            //switch(adata.code) {
            //    case 0: // -> 실패
            //        console.log('login failed  ERROR');
            //
            //        Utils.showMessage('Login Failed',adata.error, function(){
            //            this.loginPw.value = '';
            //            this.loginPw.focus();
            //        }.bind(this));
            //        this.loadingMask.hide();
            //        this.$loginFieldArea.fadeIn(1000);
            //        this.$loginTypeContainer.find('div').show();
            //        break;
            //    case 1: // -> password 변경
            //        console.log('login failed  PASSWORD CHANGE');
            //        this.loadingMask.hide();
            //        Utils.showMessage('Change Password',adata.error, this.showPasswordChangeWin.bind(this));
            //        break;
            //}
             **/
        } else {
            /**
            // 로그인 성공
            //this.setConfig(adata);
             **/

            if(Comm.loginType == window.INTERMAX_TYPE.RTM){
                this.rtmLoad();
            }else{
                this.paLoad();
            }
        }
    }catch(exception){
        Utils.showMessage( Utils.TR('ERROR'), exception.message);
    }
};

/**
 * iframe 으로 생성된 RTM, PA 에서 사용하는 함수
 */
AppLaunch.prototype.loadingProcess = function(){
    this.loadingMask.nextProcessLoad();
};

AppLaunch.prototype.rtmLoad = function(){
    var ds = {};

    cfg.login.login_id = this._tempId;

    ds.sql_file = 'IMXRT_LoginAuthGetInfo.sql';
    ds.bind = [{
        name: 'id',
        type: 'string',
        value: cfg.login.login_id
    }];
    this.WS.SQLExec(ds, function(aheader, adata) {
        this.userAuthOnDataResult(aheader, adata);
    }, this);

    this.iframe.style.opacity = 0;
    this.iframe.style.display = 'block';

    // iframe 로드 이벤트
    this.iframe.onload = function() {
        this.loadingMask.nextProcessLoad();
    }.bind(this);
    this.loadingMask.nextProcessLoad();

    this.iframe.src = '../RTM/view.html';
};

AppLaunch.prototype.userAuthOnDataResult = function(aheader, adata){
    if (!adata.rows[0]) {
        Utils.showMessage(Utils.TR('ERROR'), Utils.TR('User information is not valid.'));
        return;
    }

    cfg.login.user_id = adata.rows[0][0];
    cfg.login.login_id = adata.rows[0][1];
    cfg.login.user_name = adata.rows[0][2];
    cfg.login.admin_check = adata.rows[0][3];
    cfg.login.user_services = [];

    var ds = {};
    ds.sql_file = 'IMXRT_LoginGetUserPermission.sql';
    ds.bind = [{ name: 'id', value: cfg.login.user_id, type: 'integer' }];

    // 사용자 권한
    this.WS.SQLExec(ds, function(aheader, adata) {
        if (adata != null) {
            if (adata.rows.length == 0) {
                cfg.login.permission.kill_thread = 0;
                cfg.login.permission.system_dump = 0;
            } else {
                cfg.login.permission.kill_thread = adata.rows[0][0];
                cfg.login.permission.system_dump = adata.rows[0][1];
            }
        }
        this.loadingMask.nextProcessLoad();
    }, this);

    ds = {};
    ds.sql_file = 'IMXRT_LoginGetUserService.sql';
    ds.bind = [{ name: 'id', value: cfg.login.user_id, type: 'integer' }];

    // 사용자가 접근할 수 있는 서비스 목록
    this.WS.SQLExec(ds, function(aheader, adata) {
        for (var ix = 0; ix < adata.rows.length; ix++) {
            cfg.login.user_services.push(adata.rows[ix][1]);
        }
        this.loadingMask.nextProcessLoad();
    }, this);

    window.intermax_login = true;
    localStorage.setItem('Intermax_login', true);
    localStorage.setItem('UserID', cfg.login.login_id);
    this.loadingMask.nextProcessLoad();
    /**
    //Comm.callbackAfterSelectService = Utils.openMyView;
    //this.selectServiceForm();
     **/
};

AppLaunch.prototype.rtmFrameInit = function(){
    $('#rtmLoadingConatiner').show();
    this.iframe.style.opacity = 0;


    if(this.loadingMask){
        this.loadingMask.dsetory();
    }
    this.loadingMask = new MainLaoaingMask({
        target: $('#rtmLoadingLayer'),
        textColor: '#fff',
        showProcessBar: true,
        noticeList: [
            Utils.TR('The connection of the instances...'),
            Utils.TR('Loading the script file...'),
            Utils.TR('Loading the css file...'),
            Utils.TR('Loading the configuration...'),
            Utils.TR('Loading the component...'),
            Utils.TR('Initialization of Web Sockets...'),
            Utils.TR('Initialization of Web Worker...'),
            Utils.TR('The layout of the screen...'),
            Utils.TR('The main screen is loading...')
        ],
        complete: function(){
            this.iframe.style.opacity = 1;
            this.iframe.style.display = 'block';
            setTimeout(function(){
                $('#rtmLoadingConatiner').fadeOut(1000);
            }, 500);

        }.bind(this)
    });
    this.loadingMask.show();
};

AppLaunch.prototype.paLoad = function(){
    var ds = {};

    cfg.login.login_id = this._tempId;

    ds.sql_file = 'IMXRT_LoginAuthGetInfo.sql';
    ds.bind = [{
        name: 'id',
        type: 'string',
        value: cfg.login.login_id
    }];
    this.WS.SQLExec(ds, function(aheader, adata) {
        this.userAuthOnDataResult(aheader, adata);

        this.iframe.style.opacity = 0;
        this.iframe.style.display = 'block';

        // iframe 로드 이벤트
        this.iframe.onload = function() {
            this.loadingMask.nextProcessLoad();
        }.bind(this);
        this.loadingMask.nextProcessLoad();

        this.iframe.src = '../PA/view.html';
    }, this);

};


AppLaunch.prototype.getConfig = function(){
    return Utils.deepObjCopy(Comm);
};

/**
 * 세션을 유지한채 RTM 이나 PA 를 새로운 윈도우로 연다.
 * @param type [integer] RTM : 0, PA : 1
 */
AppLaunch.prototype.showOpenWindow = function(type){
    /**
    var url = null;
    //var pop = window.open(url, '' ,'height=' + screen.height + ',width=' + screen.width + 'fullscreen=yes');
     **/

    Comm.childLoginType = type;
    var pop = window.open('../', '_blank');
    if(pop){
        pop.focus();
        /**
        //pop.onbeforeunload = function(e){
        //    pop.Comm = Comm;
        //};
         **/
    }
};

AppLaunch.prototype.directPathWin = function(){
    Comm = window.opener.mainApp.getConfig();
    this.iframe = document.getElementById('idIframe');
    this.main = document.getElementById('main').style.display = 'none';
    var loadingTitle = document.getElementById('loadingTitle');
    this.iframe.style.opactiy = 0;

    if(Comm.childLoginType == window.INTERMAX_TYPE.RTM){
        this.rtmFrameInit();
        this.rtmLoad();
    }else{
        loadingTitle.className = 'pa-loading-content';
        this.rtmFrameInit();
        this.paLoad();
    }
    this.loadingMask.nextProcessLoad();
};

/**********************************************************/
/*               InterMax Lanch                           */
/**********************************************************/

var mainApp = new AppLaunch();