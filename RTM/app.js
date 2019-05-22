// 동적파일을 캐쉬한다.

Ext.Loader.setConfig({ enabled: true, disableCaching: false });

Ext.Loader.setPath({
    'config': '../Config/src',
    'rtm'   : '../RTM',
    'view'  : '../PA/view',
    'Exem'  : '../Exem',
    'Ext.ux': '../extjs/src/ux'
});

Ext.require([
    'common.Menu',
    'common.OpenView',
    // 'common.WebSocket', // 로긴후 불러야함.
    'common.Util',
    'common.DataModule'
]);



Ext.application({
    name: 'Intermax',
    is_init : false,
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        this.is_init = true;
    },
    launch_afterInit: function() {

        var self = this;
        this.initScriptLoad = false;

        Comm.Lang = localStorage.getItem('Intermax_MyLanguage');
        common.DataModule.init();

        this.viewport = Ext.create('Ext.container.Container', {
            id    : 'viewPort',
            layout: 'fit',
            width : '100%',
            height: '100%',
            cls   : 'viewport',
            renderTo: Ext.get('homediv')
        });

        window.addEventListener('resize', function() {
            self.viewport.setSize(window.innerWidth, window.innerHeight);
        });

        window.tabPanel = Ext.create('Exem.MainTabPanel');

        var addTabBG = Ext.create('Ext.container.Container',{
            width : 45,
            height: 20,
            itemId : 'addTabBG',
            padding: '0 0 2 0',
            hidden : true,  // tab ITEM이 없을경우에는 보이지 않음
            layout: {
                type : 'vbox',
                pack : 'center',
                align: 'center'
            },
            style: {
                background: 'transparent'
            }
        });

        window.tabPanel.getTabBar().add(addTabBG);

        // window.tabPanel.getTabBar().setStyle('display','none');

        var serviceListWindow = Ext.create('rtm.src.rtmServiceList', {
            style : {'z-index': '10'},
            isChangeMode: false,
            target: this
        });

        Comm.callbackAfterSelectService = common.Util.openMyView;

        this.nextProcess();

        if (!sessionStorage.getItem('Intermax_ServiceReconfigure')) {
            // serviceListWindow.show();
            // serviceListWindow.init();

        } else {
            // serviceListWindow.changeService();
        }

        // URL을 통해서 접속하여 트랜잭션 화면을 표시할 지 PA 화면을 표시하는 경우인지 체크.
        // PA 화면을 표시하는 경우 관련 정보를 설정 후 실시간 화면이 표시되고 나서 PA 화면으로 이동.
        common.LinkedManager.checkOpenUrl(serviceListWindow);
    },

    nextProcess: function() {
        if (window._dynamicLoadCount > 0) {
            this.initScriptLoad = true;
        }

        console.log('loadCompleteCheck', window._dynamicLoadCount);
        if (Comm.repositoryInfo && Comm.repositoryInfo.length && this.initScriptLoad && window._dynamicLoadCount === 0) {
            common.DataModule.afterSelectService(function() {
                $('#initImg').hide();
                this.continue_process();
            }.bind(this));
        } else {
            return setTimeout(function() {
                this.nextProcess();
            }.bind(this),500);
        }
    },

    login_process: function() {
        Comm.after_login_process = this.after_login;
        this.login = Ext.create('login');
        this.login.parent = this;
        this.login.init(this.viewport);
    },

    continue_process: function() {
        this.viewport.removeAll();

        this.viewport.add(window.tabPanel);
        this.after_login();
    },


    after_login: function() {
        var self = this;

        // 모니터링 뷰 타입 설정
        Comm.RTComm.checkMonitorViewType();

        (function() {
            // 화면 상단 기본 레이아웃 구성
            self.createTopBaseLayout();

            // 메뉴 화면 레이아웃 구성
            self.configMenuLayout();

            // 구성된 메뉴 레이아웃에 목록 설정
            self.setMenuList();

            // 초기 마우스 오버 동작에서 slideup이 되어 있지 않으면 slidedown이 show처럼 동작 하기 때문에 코드를 넣었습니다.
            $('#MenuBorad').slideUp('fast');
            $('#descBorad').slideUp('fast');

            // 메인 및 서브메뉴등의 증가에 따라서 퍼센트로 공간을 확장시키면 디자인상 문제가 생겨서 그에 맞게 변화 되도록 조치함
            $('#MenuList').css('height', $('#MenuBorad').height() - 65);

        })();

        // 로고 이미지 설정
        this.setHeaderPosByGlobal();

        // 메뉴 화면에 이벤트 설정
        this.setMenuEvents();

        // 플랫폼JS 정보 화면 오픈 단축키 설정
        this.setPlatformJSInfoLink();

        // 오픈 단축키 설정
        this.setKeymap();
    },


    /**
     * 화면 상단 부분에 보여지는 기본 레이아웃 구성
     */
    createTopBaseLayout: function() {
        var title = '';
        var service = Comm.selectedServiceInfo.name;

        var $body = $('body');
        $body.append('<div class="header-log global"></div>'); // Main title
        $body.append('<div class="rtm-header-log global"><p class="header-line"></p><p id="main-title-service">' + 'DASHBOARD' + '</p>'); // Main title
        $body.append('<div id="MenuBtn"></div>');
        // $body.append('<div id="ManualBtn" title="Manual"></div>');
        // $body.append('<div id="connectionConfig" title="Service Change"></div>');
        $body.append('<div id="userLogout" title="Logout : ' + Comm.web_env_info.user_name + '"></div>');
        $body.append('<div id="descBorad"></div>');

        var typeInfo = '<div id="MenuServerType" class="server-type-info">'     +
                       '<div id="TypeWAS" style="display:none;">WAS</div>'      +
                       '<div id="TypeTP"  style="display:none;">TP</div>'       +
                       '<div id="TypeTUX" style="display:none;">Tuxedo</div>'   +
                       '<div id="TypeWEB" style="display:none;">WEB</div>'      +
                       '<div id="TypeCD"  style="display:none;">C Daemon</div>' +
                       '<div id="TypeE2E" style="display:none;">EtoE</div></div>';
        $body.append(typeInfo);

        $('#descBorad').append('<div id="Menuimage"></div>');
        $('#descBorad').append('<div id="MenudescTitle"></div>');
        $('#descBorad').append('<div id="Menudescript"></div>');
        $('#descBorad').append('<div id="MenuBorad"></div>');
        $('#MenuBorad').append('<div id="MenuNav"></div>');
        $('#MenuNav').append('<div id="MenuText">' + common.Util.TR('Select Menu') + '</div>');
        $('#MenuNav').append('<div id="MenuClose"></div>');
        $('#MenuBorad').append('<div id="MenuList"></div>');
        $('#MenuBorad').append('<div id="MenuFooter"></div>');

        $('#MenuFooter').append('<div id="SetConfig">' + common.Util.TR('Configuration') + '</div>');

        $('#MenuFooter').append('<div id="BuildNum">' + common.Util.TR('Build Number') + ' : ' + BuildNumber + '</div>');

        $('#MenuList').append('<div id="rtm-menu-group" style="float:left;height:100%"></div>');
        $('#MenuList').append('<div id="pa-menu-group" style="float:left;height:100%"></div>');

        $('#rtm-menu-group').append('<div class="rtm-menu-group-title" ' +
                'style="height: 24px;border-bottom: 1px solid lightgray; border-right: 1px solid lightgray; margin-right:-1px; background-color:transparent;font-size:14px;padding:2px 0 0px 10px;font-weight:bold;text-align:center;line-height:21px;">'
                + common.Util.TR('Real-Time Monitoring')
                + '</div>');

        $('#pa-menu-group').append('<div class="pa-menu-group-title" ' +
                'style="height: 24px;border-bottom: 1px solid lightgray;background-color:transparent;font-size:14px;padding:2px 0 0px 10px;font-weight:bold;text-align:center;line-height:21px;">'
                + common.Util.TR('Performance Analysis')
                + '</div>');
    },


    /**
     * 메뉴 화면 구성
     */
    configMenuLayout: function() {

        var menuheight = (window.rtmMonitorType === 'WEB' || window.rtmMonitorType === 'CD') ? 370 : 335;
        var submenulengthMax = 0;
        var addSize   = this.getChangeSizeByLang();
        var addHeight = addSize.h;

        var isDisplayMenu;
        var menuCategories, menuData;
        var ix, jx, ixLen, jxLen;

        for (ix = 0, ixLen = common.Menu.Menucategorization.length; ix < ixLen; ix++) {
            menuCategories = common.Menu.Menucategorization[ix];

            // 메뉴등록시 불편함 및 혼동을 막기 위해서
            // textlength 및 submenulength는 여기서 직접선언되고 사용하기 시작한다.
            menuCategories.submenulength = 0;

            for (jx = 0, jxLen = common.Menu.mainMenuData.length; jx < jxLen; jx++) {
                menuData = common.Menu.mainMenuData[jx];

                if (!this.checkDisplayMenu(menuData)) {
                    continue;
                }

                // 모니터링 뷰 타입에 따라 표시대상이 되는 메뉴인지 체크.
                isDisplayMenu = false;

                if (window.rtmMonitorType !== 'WAS' && window.rtmMonitorType !== 'E2E' && menuCategories.PGID === 'Dashboard') {
                    isDisplayMenu = false;

                } else if (window.rtmMonitorType === 'E2E' && ['Pstatistics', 'Panalysis', 'Report'].indexOf(menuData.PGID) !== -1) {
                    isDisplayMenu = false;

                } else if (window.rtmMonitorType !== 'E2E' && ['E2EMonitor'].indexOf(menuData.PGID) !== -1) {
                    isDisplayMenu = false;

                } else if (menuData.STYPE === window.rtmMonitorType || menuData.STYPE === 'ALL' || window.rtmMonitorType === 'E2E') {
                    isDisplayMenu = true;
                }

                if (menuCategories.PGID === menuData.PGID && isDisplayMenu) {
                    // submenu의 갯수를 저장하여 이후 로직에서 서브메뉴가 9개가 넘는지 확인한다.          //  Height 관련정보를 습득
                    menuCategories.submenulength = menuCategories.submenulength + 1;
                }
            }
        }

        // 같은 For문을 사용하기 때문에 Height결정값에 사용될 값과 Width결정값에 사용될 변수를 여기서 세팅한다.
        var cx, cxLen;
        for (cx = 0, cxLen = common.Menu.Menucategorization.length; cx < cxLen; cx++) {
            if (common.Menu.Menucategorization[cx].PARENTID) {
                continue;
            }

            if ( common.Menu.Menucategorization[cx].submenulength > submenulengthMax ) {
                submenulengthMax = common.Menu.Menucategorization[cx].submenulength;              // <==      Height 결정값 관련로직
            }
        }

        // Height 결정값 관련 로직
        // 9개의 서브 항목까지는 Default의 Size를 갖고 그 이상일 경우에는 추가 증감분을 더해준다.
        if ( submenulengthMax > 9) {
            menuheight = menuheight + (submenulengthMax - 9) * addHeight;
        }

        $('#MenuBorad').css('width', 'auto');
        $('#descBorad').css('width', $('#MenuBorad').width() + 10);     // DescBoard의 10사이즈가 커야 Border 효과가 난다.

        $('#MenuBorad').css('height', menuheight);
        $('#descBorad').css('height', menuheight + 21);   // DescBoard의 10사이즈가 커야 Border 효과가 난다.
    },


    /**
     * 모니터링 화면 종류에 따라 메뉴 레이아웃을 재구성.
     */
    reconfigMenuLayout: function() {
        // 선택된 모니터링 타입에 따라 메뉴를 표시/숨김처리한다.
        var mType = window.rtmMonitorType || 'WAS';
        var $isPaMenu = $('#pa-menu-group .categorize .subList[stype=' + mType + ']');
        var $isNotPaMenu = $('#pa-menu-group .categorize .subList[stype!=' + mType + ']');
        // 모니터링 타입이 WAS 가 아닌 경우 '실시간 대시보드' 메뉴는 표시하지 않는다.
        // EtoE 모니터링 화면에서도 대시보드 메뉴를 숨김
        if (window.rtmMonitorType && window.rtmMonitorType !== 'WAS') {
            $('#Dashboard').css('display', 'none');

        } else {
            $('#Dashboard').css('display', '');
        }


        if (window.rtmMonitorType && window.rtmMonitorType === 'TP') {
            $('#Dashboard').css('display', '');
        }

        if ((window.rtmMonitorType !== 'WEB' && window.rtmMonitorType !== 'E2E') ||
            (window.rtmMonitorType === 'E2E' && Comm.webIdArr.length === 0)) {
            $('#RealtimeWeb').css('display', 'none');

        } else if (Comm.webIdArr.length > 0) {
            $('#RealtimeWeb').css('display', '');
        }

        var isWasData = Comm.RTComm.getServerIdArr('WAS').length > 0;

        if ((window.rtmMonitorType !== 'WAS' && window.rtmMonitorType !== 'E2E') ||
            !isWasData) {
            $('#Realtime1').css('display', 'none');
            $('#Realtime2').css('display', 'none');
            $('#RealtimeAI').css('display', 'none');
        } else {
            $('#Realtime1').css('display', '');
            $('#Realtime2').css('display', '');
            $('#RealtimeAI').css('display', '');
        }

        if ((window.rtmMonitorType !== 'TP' && window.rtmMonitorType !== 'E2E') ||
            (window.rtmMonitorType === 'E2E' && Comm.tpIdArr.length === 0)) {
            $('#RealtimeTP').css('display', 'none');

        } else if (Comm.tpIdArr.length > 0) {
            $('#RealtimeTP').css('display', '');
        }

        if ((window.rtmMonitorType !== 'TUX' && window.rtmMonitorType !== 'E2E') ||
            (window.rtmMonitorType === 'E2E' && Comm.tuxIdArr.length === 0)) {
            $('#RealtimeTUX').css('display', 'none');

        } else if (Comm.tuxIdArr.length > 0) {
            $('#RealtimeTUX').css('display', '');
        }

        if ((window.rtmMonitorType !== 'CD' && window.rtmMonitorType !== 'E2E') ||
            (window.rtmMonitorType === 'E2E' && Comm.cdIdArr.length === 0)) {
            $('#RealtimeCD').css('display', 'none');

        } else if (Comm.cdIdArr.length > 0) {
            $('#RealtimeCD').css('display', '');
        }

        if (mType === 'E2E') {
            // 추후 리팩토링 필요
            if (common.Menu.useEtoePaMenu && $isPaMenu.length) {
                $('#pa-menu-group').css('display', '');
                $isPaMenu.css('display', '');
                $isNotPaMenu.css('display', 'none');
            } else {
                $('#pa-menu-group').css('display', 'none');
            }
            $('.categorize .subList[stype=' + mType + ']').css('display', '');
            $('.categorize .subList[stype!=' + mType + ']').css('display', '');
            $('#E2EMonitor').css('display', '');
        } else {
            $('#pa-menu-group').css('display', '');
            $('#E2EMonitor').css('display', 'none');
            $('.categorize .subList[stype=' + mType + ']').css('display', '');
            $('.categorize .subList[stype!=' + mType + ']').css('display', 'none');
        }

        // 추후 리팩토링 필요
        if (window.rtmMonitorType === 'E2E' && common.Menu.useEtoePaMenu) {
            $('.categorize .subList[stype=ALL]').css('display', 'none');
            $('#Tools').css('display', 'none');
            $('#Panalysis').css('display', 'none');
            $('#Pstatistics').css('display', 'none');
            $('#Panalysis2').css('display', '');
            $('#Panalysis2.categorize').css('border-left', '1px solid #C7C7C7');
        } else {
            $('.categorize .subList[stype=ALL]').css('display', '');
            $('#Panalysis2').css('display', 'none');
            $('#Tools').css('display', '');
            $('#Panalysis').css('display', '');
            $('#Pstatistics').css('display', '');
        }


        // 웹 모니터링 화면의 보고서 기능이 완료되지 않아 레포트 메뉴가 보이지 않게 수정함.
        // C Daemon 모니터링 화면의 보고서 기능도 동일 처리
        // 추후 기능이 완료된 후 해당 코드는 제거.
        if (window.rtmMonitorType === 'TUX' || window.rtmMonitorType === 'WEB' || window.rtmMonitorType === 'CD' || window.rtmMonitorType === 'E2E') {
            $('#Report').css('display', 'none');
        } else {
            $('#Report').css('display', '');
        }

        if (window.rtmMonitorType === 'WEB') {
            if (!window.isWebToB) {
                $('.categorize .subList[id=M_rtmWebBlockRun]').css('display', 'none');
            } else {
                $('.categorize .subList[id=M_rtmWebBlockRun]').css('display', '');
            }
        }

        // 모니터링 화면 타입에 따라 메뉴 상단명칭 변경
        if (window.rtmMonitorType === 'E2E') {
            $('#Realtime1 a span')[0].textContent = 'WAS / Java';
        } else {
            $('#Realtime1 a span')[0].textContent = common.Util.TR('Docking Frame');
        }

        if (window.rtmMonitorType === 'TP') {
            $('#RealtimeTP a span')[0].textContent = common.Util.TR('Docking Frame');
        } else {
            $('#RealtimeTP a span')[0].textContent = common.Util.TR('TP');
        }

        if (window.rtmMonitorType === 'TUX') {
            $('#RealtimeTUX a span')[0].textContent = common.Util.TR('Docking Frame');
        } else {
            $('#RealtimeTUX a span')[0].textContent = common.Util.TR('Tuxedo');
        }

        if (window.rtmMonitorType === 'CD') {
            $('#RealtimeCD a span')[0].textContent = common.Util.TR('Docking Frame');
        } else {
            $('#RealtimeCD a span')[0].textContent = common.Util.TR('C Daemon');
        }

        if (window.rtmMonitorType === 'WEB') {
            $('#RealtimeWeb a span')[0].textContent = common.Util.TR('Docking Frame');
        } else {
            $('#RealtimeWeb a span')[0].textContent = common.Util.TR('WEB');
        }

        // 메뉴 화면 구성
        this.configMenuLayout();

        // 재구성된 메뉴 개수에 따라 높이를 재설정
        $('#MenuList').css('height', $('#MenuBorad').height() - 65);
    },


    /**
     * 구성된 메뉴 레이아웃에 메뉴 목록을 추가.
     */
    setMenuList: function() {
        // 메인메뉴 Div를 설정하는 부분
        var targetId;
        var ix, jx, ixLen, jxLen;

        var menuCategories, menuPgid, menuText;

        // 큰 카테고리에 해당하는 레이아웃 설정
        for (ix = 0, ixLen = common.Menu.Menucategorization.length; ix < ixLen; ix++) {
            menuCategories = common.Menu.Menucategorization[ix];
            menuPgid       = menuCategories.PGID;
            menuText       = menuCategories.text;

            if (['Dashboard', 'DashboardAI', 'Realtime1', 'Realtime2', 'RealtimeWeb', 'RealtimeTP', 'RealtimeTUX', 'RealtimeCD', 'RealtimeAI', 'E2EMonitor'].indexOf(menuPgid) === -1) {
                targetId = '#pa-menu-group';
            } else {
                targetId = '#rtm-menu-group';
            }

            if (menuCategories.PARENTID) {
                $(targetId).append('<div class="categorize sub-categorize" id=' + menuPgid + '><a><span>' + menuText + '</span></a></div>');

            } else if (ix > 0 && menuCategories.GROUP === common.Menu.Menucategorization[ix - 1].GROUP) {
                $(targetId).append('<div class="categorize group" id=' + menuPgid + '><a><span>' + menuText + '</span></a></div>');

            } else {
                $(targetId).append('<div class="categorize" id=' + menuPgid + '><a><span>' + menuText + '</span></a></div>');
            }

            $('.categorize#' + menuPgid).css({'margin-right': '30px'});
        }

        // 메뉴 맨 좌측의 레이아웃 선은 중복되어 표시가 되기 때문에 두께를 0으로 준다.
        $('.categorize')[0].style.borderLeftWidth = '0px';

        var mainMenuLength = common.Menu.mainMenuData.length;
        var isMenuGroupLine;
        var menuData, nextMenuData;

        // 카테고리 별로 하위 메뉴를 구성
        for (ix = 0; ix < mainMenuLength; ix++) {
            menuData     = common.Menu.mainMenuData[ix];
            nextMenuData = common.Menu.mainMenuData[ix + 1];

            if (!this.checkDisplayMenu(menuData)) {
                continue;
            }

            this.isDisplayMenuByType(menuData);

            // 서브메뉴를 설정하는 부분
            $('#' + menuData.PGID).append('<div class="subList" id=' + menuData.ID + ' stype=' + menuData.STYPE + '><a><span tabIndex=' + (ix + 1) + '>' + menuData.text + '</span></a></div>');

            // 서브메뉴 그룹 선을 표시할지 구분하는 값 설정
            isMenuGroupLine = false;

            if (ix + 1 < mainMenuLength &&
                menuData.PGID === nextMenuData.PGID &&
                menuData.GPIDX && nextMenuData.GPIDX &&
                menuData.GPIDX !== nextMenuData.GPIDX) {
                isMenuGroupLine = true;
            }

            if (isMenuGroupLine === true) {
                // 서브메뉴에 도트 백그라운드를 설정하는 부분
                $('#' + menuData.ID).append('<a class="GroupDotline"></a>');

            } else {
                // 서브메뉴에 도트 백그라운드를 설정하는 부분
                $('#' + menuData.ID).append('<a class="Dotline"></a>');
            }

            for (jx = 0, jxLen = common.Menu.Menucategorization.length; jx < jxLen; jx++) {

                // 서브메뉴의 글자 길이에 맞춰 도트 백그라운드 사이즈를 잡아줌
                if (common.Menu.Menucategorization[jx].PGID === menuData.PGID) {
                    if (isMenuGroupLine === true) {
                        $('#' + menuData.ID + ' .GroupDotline').css('width', '80%');

                    } else {
                        $('#' + menuData.ID + ' .Dotline').css('background-size', '80% 1px');
                    }
                }
            }
        }

        // 확장 메뉴 (Tool, Report) 구성
        for (ix = 0, ixLen = common.Menu.Menucategorization.length; ix < ixLen; ix++) {

            for (jx = 0; jx < common.Menu.Menucategorization.length; jx++) {

                if (common.Menu.Menucategorization[ix].PGID === common.Menu.Menucategorization[jx].PARENTID) {
                    $('#' + common.Menu.Menucategorization[ix].PGID).append($('#' + common.Menu.Menucategorization[jx].PGID));
                }
            }
        }
    },


    /**
     * 메뉴 구성시 언어에 따라 글자의 폭, 높이에 차이가 있어서 메뉴의 행과 열을 조정하기 위한 값 반환
     *
     * @return {object}
     */
    getChangeSizeByLang: function() {
        var addWidth   = 0;
        var addHeight = 23;

        if (window.nation === 'ja') {
            addWidth = 7;
            addHeight = 30;
        }
        return {w: addWidth, h: addHeight};
    },


    /**
     * 메뉴 화면에 마우스 이벤트 추가
     *
     * @param {number} menuwidth
     */
    setMenuEvents: function() {
        var self = this;

        var menuwidth = $('#MenuBorad').width();
        var MenuAnimated;

        if (String(localStorage.getItem('MenuAnimate')) !== 'null') {
            MenuAnimated = String(localStorage.getItem('MenuAnimate'));
        } else {
            MenuAnimated = 'MenuAnimate';
        }

        $('.subList > a > span').mouseenter(function() {
            var DescID, ix, ixLen;
            if (MenuAnimated === 'MenuAnimate') {
                DescID = $(this).parent().parent().attr('ID');

                if (!($('#MenuBorad').is(':animated'))) {
                    // DescBoard가 밖으로 나오게 하는 애니메이션
                    $('#descBorad').stop().animate({width:menuwidth + 280},100);

                    // 이미지 관련 애니메이션
                    $('div#Menuimage').css('opacity',0.3);
                    $('div#Menuimage').css('background','url(../images/Menu_Image/' + DescID + '.png) no-repeat');
                    $('div#Menuimage').stop().animate({opacity:1},600);

                    // Image Title를 설정해주는 부분
                    $('div#MenudescTitle').text(($(this).text()));

                    for (ix = 0, ixLen = common.Menu.mainMenuDesc.length; ix < ixLen; ix++) {
                        if (common.Menu.mainMenuDesc[ix].ID === DescID) {
                            // Image Desc를 설정해주는 부분
                            $('div#Menudescript').text(common.Menu.mainMenuDesc[ix].desc);
                        }
                    }
                }
            }

        });

        $('#connectionConfig').on('click', function(e) {
            e.stopPropagation();
            var serviceListWindow = Ext.create('rtm.src.rtmServiceList', {
                style: {'z-index': '10'},
                isChangeMode: true
            });
            serviceListWindow.addCls('xm-dock-window-base');
            serviceListWindow.show();
            serviceListWindow.init();
            serviceListWindow = null;
        });

        $('#userLogout').on('click', function(e) {
            e.stopPropagation();
            localStorage.setItem('Intermax_login', false);
            window.parent.location.href = location.origin + '/' + location.pathname.split('/')[1];
        });

        $('#MenuServerType div').on('click', function(e) {
            e.stopPropagation();

            var tabName;
            var id = this.getAttribute('id'),
                ix, ixLen;

            if (id === 'TypeWAS') {
                tabName = common.Util.TR('WAS Monitor');

            } else if (id === 'TypeTP') {
                tabName = common.Util.TR('TP Monitor');

            } else if (id === 'TypeTUX') {
                tabName = common.Util.TR('Tuxedo Monitor');

            } else if (id === 'TypeWEB') {
                tabName = common.Util.TR('Web Monitor');

            } else if (id === 'TypeCD') {
                tabName = common.Util.TR('C Daemon Monitor');

            } else if (id === 'TypeE2E') {
                tabName = common.Util.TR('EtoE Monitor');
            }

            if (!tabName) {
                return;
            }

            for (ix = 0, ixLen = window.tabPanel.items.items.length; ix < ixLen; ix++) {
                if (window.tabPanel.items.items[ix].title === tabName) {
                    if (window.tabPanel.getTabBar().items.items[ix].hidden) {
                        window.tabPanel.getTabBar().items.items[ix].setVisible(true);
                    }
                    window.tabPanel.setActiveTab(ix);
                    break;
                }
            }
        });

        $('#MenuBtn').click(function() {

            //애니메이션 동작중에 버튼을 누르는 동작을 방지 합니다.
            if (!($('#MenuBorad').is(':animated'))) {
                if ($('#MenuBorad').hasClass('active')) {
                    $(this).removeClass('btnon');

                    $('#MenuBorad').removeClass('active');
                    $('#descBorad').removeClass('active');

                    $('#MenuBorad').slideUp(400);
                    $('#descBorad').slideUp(400);

                } else {
                    self.reconfigMenuLayout();

                    $(this).addClass('btnon');
                    $('#MenuBorad').addClass('active');
                    $('#descBorad').addClass('active');

                    $('#MenuBorad').slideDown(400);
                    $('#descBorad').slideDown(400);

                    // 설정된 메뉴 구성에 따라 메뉴 화면 폭을 다시 설정한다.
                    menuwidth = $('#MenuBorad').width();
                    $('#descBorad').css('width', menuwidth + 10);
                }
            }
        });

        // Mouse가 메뉴영역을 벗어나면 초기화 합니다.
        $('#descBorad').mouseleave(function() {
            if (!($('#MenuBorad').is(':animated'))) {
                $(this).css('display', 'none').removeClass('btnon');

                $('#MenuBorad').removeClass('active');
                $('#descBorad').removeClass('active');

                $('#MenuBorad').slideUp('fast');
                $('#descBorad').slideUp('fast');
                $('#descBorad').css('width', menuwidth + 10);
            }
        });

        // 메뉴내부에 우측상단에 닫기 표시 버튼 동작
        $('#MenuClose').click(function() {
            $(this).removeClass('btnon');

            $('#MenuBorad').removeClass('active');
            $('#descBorad').removeClass('active');

            $('#MenuBorad').slideUp('fast');
            $('#descBorad').slideUp('fast');
            $('#descBorad').css('width', menuwidth + 10);
        });

        // 서브메뉴항목을 클릭했을 때 폼이 열리도록 하는 로직
        $('.subList > a > span').click(function() {
            //var submenutext = $(this).text();
            var subListId   = this.parentElement.parentElement.id,
                ix, ixLen;

            for (ix = 0, ixLen = common.Menu.mainMenuData.length; ix < ixLen; ix++) {
                if (common.Menu.mainMenuData[ix].ID === subListId) {
                //if (common.Menu.mainMenuData[ix].text === submenutext) {
                    $('#MenuClose').removeClass('btnon');

                    $('#MenuBorad').removeClass('active');
                    $('#descBorad').removeClass('active');

                    $('#MenuBorad').slideUp('fast');
                    $('#descBorad').slideUp('fast');
                    $('#descBorad').css('width', menuwidth + 10);
                    common.OpenView.onMenuItemClick(null, common.Menu.mainMenuData[ix].cls, common.Menu.mainMenuData[ix].PGID);
                    break;
                }
            }
        });

        // 메뉴좌측하단에   "  * configuration "  이영역을 눌렀을 경우에 나타나는 화면에 대한 로직
        // 특수사항이 없기 때문에 Scr인자  view.ConfigMyView <== 하드 코딩 되어 있습니다.  위에 로직하고 일반화시켜서 사용해도되는데
        // 난중에 복잡해져서 조건 하나 더 붙을거 같아서 일반화 포기했습니다. 결론은   " 하드코딩 " scr이름 바뀌면 여기서 바꿔야함
        $('#SetConfig').click(function() {

            $('#MenuClose').removeClass('btnon');
            $('#MenuBorad').removeClass('active');
            $('#descBorad').removeClass('active');

            $('#MenuBorad').slideUp('fast');
            $('#descBorad').slideUp('fast');
            $('#descBorad').css('width', menuwidth + 10);
            common.OpenView.onMenuItemClick( null, 'config.config');
        });

        $('#ManualBtn').click(function() {
            $('#MenuClose').removeClass('btnon');

            $('#MenuBorad').removeClass('active');
            $('#descBorad').removeClass('active');

            $('#MenuBorad').slideUp('fast');
            $('#descBorad').slideUp('fast');
            $('#descBorad').css('width', menuwidth + 10);

            var manualOpenLink = document.createElement('a');
            manualOpenLink.rel = 'noreferrer';
            manualOpenLink.target = 'IMX_Manual_Open';
            manualOpenLink.href = '/manual/';

            if (self.manualExist(manualOpenLink.href)) {
                manualOpenLink.click();
            } else {
                Ext.MessageBox.show({
                    title   : '',
                    icon    : Ext.MessageBox.WARNING,
                    message : common.Util.TR('Manual does not exist.'),
                    modal   : true,
                    buttons : Ext.Msg.OK
                });
            }
        });

    },


    /**
     * Check Online Manual link
     *
     * @param {string} url - 매뉴얼 자료 경로
     * @return {boolean} true: 매뉴얼 자료 있음, false: 매뉴얼 자료 없음
     */
    manualExist: function(url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status !== 404;
    },


    /**
     * 브라우저 언어에 따른 로고 이미지 설정.
     */
    setHeaderPosByGlobal: function() {
        if (navigator.language === 'ko' || navigator.language === 'ko-KR') {
            $('div.header-log').removeClass('global');
            $('div.rtm-header-log').removeClass('global');
        }
    },


    /**
     * PlatformJS 정보화면을 볼 수 있는 화면 단축키 추가
     * key: Ctrl + Shift + Alt + h
     */
    setPlatformJSInfoLink: function() {
        var infoKeyMap = new Ext.KeyMap( window.id);
        infoKeyMap.addBinding({
            key: 'h',
            alt: true,
            ctrl:true,
            shift: true,
            fn: function() {
                var imxOpenLink = document.createElement('a');
                imxOpenLink.rel = 'noreferrer';
                imxOpenLink.target = 'IMX_Platform_Log_Browser';
                imxOpenLink.href = '/utils/';
                imxOpenLink.click();
            }.bind(this)
        });
    },

    /**
     * 단축키 추가
     */
    setKeymap: function() {
        var infoKeyMap = new Ext.KeyMap(window.id);

        // minus (-) (메뉴 열기/닫기)
        infoKeyMap.addBinding({
            key: [109, 189],
            alt: true,
            fn: function() {
                $('#MenuBtn').click();
            }
        });

        // 1~9 (메뉴 탭인덱스)
        infoKeyMap.addBinding({
            key: [49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104, 105],
            fn: function(e) {
                var index;

                if (e >= 49 && e <= 57) {
                    index = e - 49;
                } else if ( e >= 97 && e <= 105) {
                    index = e - 97;
                }

                if ($('.categorize:visible').length == 0 || $('.categorize:visible')[index] == undefined) {
                    return;
                }

                $($('.categorize:visible')[index]).find('.subList span')[0].focus();
            }
        });

        // plus (+) (메뉴펼친 뒤 환경설정)
        infoKeyMap.addBinding({
            key: [107, 187],
            fn: function() {
                if ($('.categorize:visible').length == 0) {
                    return;
                }

                $('#SetConfig').click();
            }
        });

        // alt + w (탭 닫기)
        infoKeyMap.addBinding({
            key: 'w',
            alt: true,
            fn: function() {
                $('.x-tab-bar .x-tab-active .x-tab-close-btn').click();
            }
        });

        // alt + Enter (PA 조회)
        // infoKeyMap.addBinding({
        //     key: Ext.EventObject.ENTER,
        //     alt: true,
        //     fn: function() {
        //         if ($('.Exem-FormOnCondition:visible')) {
        //             $('.retrieve-btn span').click();
        //         }
        //     }
        // });

        $('.subList span').keypress(function(e) {
            if (e.which == 13) {
                $(this).click();
            }
        });
    },


    /**
     * 사용자가 정의한 화면 메뉴 정보를 설정한다.
     */
    setUserDefineMenu: function() {
        // Add User Main Menu
        common.Menu.mainMenuData[common.Menu.mainMenuData.length] = {
            ID: 'M_PerformanceTrend',
            PGID: 'Panalysis',
            text: common.Util.TR('Performance Trend'),
            cls: 'view.PerformanceTrend'
        };

        // Add User Menu Desc
        common.Menu.mainMenuDesc[common.Menu.mainMenuDesc.length] = {
            ID: '',
            desc: ''
        };
    },


    /**
     * 메뉴 화면에 보여지는 항목인지 체크
     *
     * @param {object} mData - 메뉴 정보 데이터
     * @return {Boolean} true: 표시, false: 숨김
     */
    checkDisplayMenu: function(mData) {

        var isSupport;
        if (mData.limitVersion != null) {
            isSupport = common.Util.checkSupportVersion(mData.limitVersion, mData.limitType);
            if (isSupport === false) {
                return false;
            }
        }

        if (window.isIMXNonDB && common.Menu.nonDbHiddenMenu.indexOf(mData.ID) !== -1) {
            return false;
        }

        if (!window.isConnectDB && common.Menu.nonDbHiddenMenu.indexOf(mData.ID) !== -1) {
            return false;
        }

        if (mData.ID === 'M_rtmActiveTxnRemoteTree') {
            if (!window.isRemoteTree) {
                return false;
            }
        } else if (mData.ID === 'M_WebStat') {
            if (!window.isWebserver) {
                return false;
            }
        } else if (mData.ID === 'M_rtmTablespaceUsage' && !window.isTablespace) {
            return false;
        }

        return true;
    },


    /**
     * 모니터링 타입 (WEB, WAS, TP, E2E)에 따라 메뉴를 숨김/표시 처리한다.
     *
     * @param {object} mData - 메뉴 정보 데이터
     */
    isDisplayMenuByType: function(mData) {
        this.monitorType = (!this.monitorType) ? 'WAS' : this.monitorType === 'WAS' ? 'TP' : 'WAS';

        var isDisplay;

        if (!mData.STYPE || this.monitorType === mData.STYPE || this.monitorType === 'E2E') {
            isDisplay = true;
        } else {
            isDisplay = false;
        }

        return isDisplay;
    }

});
