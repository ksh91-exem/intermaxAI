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
    'common.WebSocket',
    'common.Util',
    'common.DataModule'
]);

Ext.application({
    name: 'Intermax',
    //appFolder: 'Intermax5',
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        var self = this;

        Comm.Lang = localStorage.getItem('Intermax_MyLanguage');
        common.DataModule.init();

        this.viewport = Ext.create('Ext.container.Container', {
            id: 'viewPort',
            layout: 'border',
            width: '100%',
            height: '100%',
            cls: 'viewport',
            renderTo: Ext.get('homediv')
        });

        window.addEventListener('resize', function() {
            self.viewport.setSize(window.innerWidth, window.innerHeight);
        });


        window.tabPanel = Ext.create('Exem.MainTabPanel');

        window.tabPanel.addListener('beforeremove', function(_this){
            console.debug('---------Destroy-------', _this);
        });

        window.tabPanel.addListener('remove', function(_this){
            console.debug('---------Destroy-------', _this);
        });

        window.tabPanel.addListener('tabchange', function(tabPanel, newCard, oldCard){
            if (oldCard == null) {
                var addTabCon = this.getTabBar().getComponent('addTabBG');
                addTabCon.setVisible(true);
            }
        });


        var addTabBG = Ext.create('Ext.container.Container',{
            width : 45,
            height: 20,
            itemId : 'addTabBG',
            padding: '0 0 2 0',
            // tab ITEM이 없을경우에는 보이지 않음
            hidden : true,
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

        /**
         *this.login_process();
         */

        var serviceListWindow = Ext.create('rtm.src.rtmServiceList', {
            style : {'z-index': '10'},
            target: this
        });
        serviceListWindow.show();
        serviceListWindow.init();

        Comm.callbackAfterSelectService = common.Util.openMyView;
    },

    login_process: function() {
        Comm.after_login_process = this.after_login;
        this.login = Ext.create('login');
        this.login.parent = this;
        this.login.init(this.viewport);

        Comm.invisibleScatter = Ext.create('Exem.chart.D3Scatter', {
            type: 'live',
            invisible: true
        });
        Comm.onActivityTarget.push(Comm.invisibleScatter);
    },

    continue_process: function() {
        this.viewport.removeAll();
        /**
        //realtime.maintab = window.tabPanel;
         **/
        this.viewport.add(window.tabPanel);
        this.after_login();
    },

    after_login: function() {
        var menuwidth = 0;
        var menuheight = 335;

        var MenuAnimated ;
        if (String(localStorage.getItem('MenuAnimate')) !== 'null'){
            MenuAnimated = String(localStorage.getItem('MenuAnimate'));
        }else{
            MenuAnimated = 'MenuAnimate';
        }

        //==================================================================
        // Envir 로딩시 config 설정한 language 값을 window.nation에 넣어줌.
        var menuTextWidth = 7;

        switch(window.nation){
            case 'ko'       :
            case 'zh-CN'    : menuTextWidth = 12;
                break;
            case 'ja'       : menuTextWidth = 7;
                break;
            default         : window.nation = navigator.language;
                break;
        }
        //==================================================================

        SetMenuLayout = function(){
            var submenulengthMax = 0;
            /** 일단 사용하지 않기 때문에 주석처리
            var title = '';
            var service = Comm.selectedServiceInfo.name;
            var urlString = document.URL;
             //여기 if문은 없어도 되지않나 싶다.. if와 else가 값이 동일함..
            if (urlString.toUpperCase().indexOf('PA') == -1) {
//                $('body').append('<div class="header-log" style="background:url(/Intermax/images/InterMax-RealtimeMonitor.png) no-repeat">'); // Main title
//                title = 'Realtime Monitor';
                title = '';
                service = Comm.selectedServiceInfo.name;
            } else {
//                $('body').append('<div class="header-log" style="background:url(/Intermax/images/InterMax-PerformanceAnalyzer.png) no-repeat">'); // Main title
//                title = 'Performance Analyzer';
                title = '';
                service = Comm.selectedServiceInfo.name;
            }
             **/

            //===============================================================================   기본 레이아웃
            var $body = $('body');
            $body.append('<div class="header-log global"></div>');    // MainTitle
            $body.append('<div class="pa-header-log global"></div>'); // MainTitle
            $body.append('<div id="MenuBtn"> </div>');
            $body.append('<div id="quick" title="Quick Launcher"></div>');
            $body.append('<div id="descBorad"></div>');

            var $logOut = $('<div id="main-title-service" class="opacity-hover" style="position: absolute;right: 45px;top: 20px;color: rgb(175, 175, 175);cursor: pointer;">[ ' + common.Util.usedFont(9, common.Util.TR('LOGOUT')) + ' ]</div>');
            $logOut.on('click', function(){
                localStorage.setItem('Intermax_login', false);
                /**
                //location.href = 'http://' + location.host + '/Intermax5/PA/';
                //location.href = 'http://' + location.host + '/'+location.pathname.split('/')[1]+'/PA/';
                */
                location.href = location.protocol+'//' + location.host + '/'+location.pathname.split('/')[1]+'/PA/';
            });
            $body.append($logOut);

            $('body').append('<div id="descBorad"></div>');
            $('#descBorad').append('<div id="Menuimage"></div>');
            $('#descBorad').append('<div id="MenudescTitle"></div>');
            $('#descBorad').append('<div id="Menudescript"></div>');
            $('#descBorad').append('<div id="MenuBorad"></div>');
            $('#MenuBorad').append('<div id="MenuNav"></div>');
            $('#MenuNav').append('<div id="MenuText">'+common.Util.TR('Select Menu')+'</div>');
            $('#MenuNav').append('<div id="MenuClose"></div>');
            $('#MenuBorad').append('<div id="MenuList"></div>');
            $('#MenuBorad').append('<div id="MenuFooter"></div>');

            $('#MenuFooter').append('<div id="SetConfig">' + common.Util.TR('Configuration') + '</div>');
            $('#MenuFooter').append('<div id="BuildNum">Build Number : '+ BuildNumber +'</div>');

            //===============================================================================



            // =============================================================================== 언어
            var lang = $body.attr('lang');
            var ix,jx;
            var addWidth = 0;
            if (lang == 'ja') {
                addWidth = 8;
            }

            for( ix = 0; ix < common.Menu.Menucategorization.length; ix++){
                if (common.Menu.Menucategorization[ix].PGID === 'Realtime') {
                    continue;
                }
                // textlength는 여기서 직접선언되고 사용하기 시작한다.     // 메뉴등록시 불편함 및 혼동을 막기 위해서
                common.Menu.Menucategorization[ix].textWidth = common.Menu.Menucategorization[ix].text.length;
                // submenulength는 여기서 직접선언되고 사용하기 시작한다.  // 메뉴등록시 불편함 및 혼동을 막기 위해서
                common.Menu.Menucategorization[ix].submenulength = 0;
                for( jx = 0; jx < common.Menu.mainMenuData.length; jx++){

                    if (common.Menu.Menucategorization[ix].PGID == common.Menu.mainMenuData[jx].PGID)
                    {
                        // submenu의 갯수를 저장하여 이후 로직에서 서브메뉴가 9개가 넘는지 확인한다.          //  Height 관련정보를 습득
                        common.Menu.Menucategorization[ix].submenulength = common.Menu.Menucategorization[ix].submenulength + 1;
                        // 한분류에 속한 메인메뉴 와 서브메뉴들을 비교해서 가장 큰 녀석의 폭을 저장한다.      //  Width 관련 정보를 습득
                        if (common.Menu.Menucategorization[ix].textWidth < common.Menu.mainMenuData[jx].text.length + addWidth){
                            // 한분류에 속한 메인메뉴 와 서브메뉴들을 비교해서 가장 큰 녀석의 폭을 저장한다.      //  Width 관련 정보를 습득
                            common.Menu.Menucategorization[ix].textWidth = common.Menu.mainMenuData[jx].text.length + addWidth;
                        }
                    }
                }
            }


            // 같은 For문을 사용하기 때문에 Height결정값에 사용될 값과 Width결정값에 사용될 변수를 여기서 세팅한다.
            for(var cx = 0; cx < common.Menu.Menucategorization.length; cx++){

                if (common.Menu.Menucategorization[cx].PGID === 'Realtime') {
                    continue;
                }

                // Width  결정값 관련로직
                menuwidth += ( common.Menu.Menucategorization[cx].textWidth * menuTextWidth ) + 35;

                // Height 결정값 관련로직
                if ( common.Menu.Menucategorization[cx].submenulength > submenulengthMax )  {
                    submenulengthMax = common.Menu.Menucategorization[cx].submenulength;
                }
            }


            // Width 결정값 관련 로직
            if (menuwidth < 170) {
                menuwidth = 170;
            }
            $('#MenuBorad').css("width", menuwidth);
            // DescBoard의 10사이즈가 커야 Border 효과가 난다.
            $('#descBorad').css("width", menuwidth+10);


            // Height결정값 관련 로직        // 9개의 서브 항목까지는 Default의 Size를 갖고 그 이상일 경우에는 추가 증감분을 더해준다.
            if ( submenulengthMax > 9) {
                menuheight = menuheight + (submenulengthMax-9) * 25;
            }
            $('#MenuBorad').css("height", menuheight);
            // DescBoard의 7사이즈가 커야 Border 효과가 난다.
            $('#descBorad').css("height", menuheight+7);


            // 메인메뉴 Div를 설정하는 부분
            for( ix = 0; ix < common.Menu.Menucategorization.length; ix++){
                if (common.Menu.Menucategorization[ix].PGID === 'Realtime') {
                    continue;
                }
                $('#MenuList').append('<div class="categorize" id='+ common.Menu.Menucategorization[ix].PGID +'><a><span>'+common.Menu.Menucategorization[ix].text+'</span></a></div>');
                $('.categorize#'+common.Menu.Menucategorization[ix].PGID).css("width", common.Menu.Menucategorization[ix].textWidth * menuTextWidth +30 -1);
            }


            for( ix = 0; ix < common.Menu.mainMenuData.length; ix++){
                if (common.Menu.mainMenuData[ix].PGID === 'Realtime') {
                    continue;
                }
                //    서브메뉴를 설정하는 부분
                $('#'+common.Menu.mainMenuData[ix].PGID).append('<div class="subList" id='+ common.Menu.mainMenuData[ix].ID +'><a><span>'+common.Menu.mainMenuData[ix].text+'</span></a></div>');
                //    서브메뉴에 도트 백그라운드를 설정하는 부분
                $('#'+common.Menu.mainMenuData[ix].ID).append('<a class="Dotline"></a>');

                for( jx = 0; jx < common.Menu.Menucategorization.length; jx++){

                    //    서브메뉴의 글자 길이에 맞춰 도트 백그라운드 사이즈를 잡아줌
                    if ( common.Menu.Menucategorization[jx].PGID == common.Menu.mainMenuData[ix].PGID)
                        $('#'+common.Menu.mainMenuData[ix].ID+' .Dotline').css( "background-size", ((common.Menu.Menucategorization[jx].textWidth * menuTextWidth +30 -1)-45)+'px'+' 1px');
                }
            }
            // 초기 마우스 오버 동작에서 slideup이 되어 있지 않으면 slidedown이 show처럼 동작 하기 때문에 코드를 넣었습니다.
            $('#MenuBorad').slideUp('fast');
            $('#descBorad').slideUp('fast');

            // 메인 및 서브메뉴등의 증가에 따라서 퍼센트로 공간을 확장시키면 디자인상 문제가 생겨서 그에 맞게 변화 되도록 조치함
            $('#MenuList').css("height", $('#MenuBorad').height() - 78  );

            setHeaderPosByGlobal();

        }();


        $('.subList > a > span').mouseenter(function() {

            if (MenuAnimated == 'MenuAnimate'){
                var DescID = $(this).parent().parent().attr('ID');
                if (!($('#MenuBorad').is(':animated'))){
                    // DescBoard가 밖으로 나오게 하는 애니메이션
                    $('#descBorad').stop().animate({width:menuwidth+280},100);


                    // 이미지 관련 애니메이션
                    $('div#Menuimage').css("opacity",0.3);
                    $('div#Menuimage').css("background",'url(../images/Menu_Image/'+DescID+'.png) no-repeat');
                    $('div#Menuimage').stop().animate({opacity:1},600);


                    // Image Title를 설정해주는 부분
                    $('div#MenudescTitle').text(($(this).text()));

                    for(var ix = 0; ix < common.Menu.mainMenuDesc.length; ix++){
                        if(common.Menu.mainMenuDesc[ix].ID == DescID){
                            // Image Desc를 설정해주는 부분
                            $('div#Menudescript').text(common.Menu.mainMenuDesc[ix].desc);
                        }
                    }
                }
            }

        });


        $('#quick').on('click', function(){
            var bookMarkWindow = Ext.create('view.bookMarkWindow');
            bookMarkWindow.init();
        });


        $('#MenuBtn').hover(
            function () {
                //   애니메이션 동작중에 중복 동작을 방지 합니다.
                if (!($('#MenuBorad').is(':animated'))){
                    //   메뉴버튼이 동작 중 입니다 상태로 변화됨
                    $(this).addClass('btnon');
                    // <= Active클래스를 더해 주면 단순하게 CSS에서 visibility: visible;가 되는 동작
                    $('#MenuBorad').addClass('active');
                    // <= Active클래스를 더해 주면 단순하게 CSS에서 visibility: visible;가 되는 동작
                    $('#descBorad').addClass('active');

                    // 400으로 설정된 이유는 ... 사용자가 마우스 오버를 한 후에 메뉴가 등장하는데 본능적으로 클릭 동작을 합니다.
                    $('#MenuBorad').slideDown(400);
                    // 이로 인해서 다시 메뉴를 닫아버리는 학습적 현상이 발생되는데 그걸 막기 위한 최소수치 입니다.  ( 개인적인.... 최소수치 )
                    $('#descBorad').slideDown(400);
                    // 다른 동작으로 DescBoard가 넓어져 있기 때문에 초기화를 여기서 해줌
                    $('#descBorad').css("width", menuwidth+10);
                }
            },
            function () {
            }
        );

        $('#MenuBtn').click(
            function () {

                //애니메이션 동작중에 버튼을 누르는 동작을 방지 합니다.
                if (!($('#MenuBorad').is(':animated'))){
                    if ($('#MenuBorad').hasClass('active')) {
                        $(this).removeClass('btnon');

                        $('#MenuBorad').removeClass('active');
                        $('#descBorad').removeClass('active');

                        $('#MenuBorad').slideUp(400);
                        $('#descBorad').slideUp(400);

                    } else {
                        $(this).addClass('btnon');
                        $('#MenuBorad').addClass('active');
                        $('#descBorad').addClass('active');

                        $('#MenuBorad').slideDown(400);
                        $('#descBorad').slideDown(400);
                        $('#descBorad').css("width", menuwidth+10);
                    }
                }
            }
        );

        // Mouse가 메뉴영역을 벗어나면 초기화 합니다.
        $('#descBorad').mouseleave(
            function () {
                $(this).removeClass('btnon');

                $('#MenuBorad').removeClass('active');
                $('#descBorad').removeClass('active');

                $('#MenuBorad').slideUp('fast');
                $('#descBorad').slideUp('fast');
                $('#descBorad').css("width", menuwidth+10);
            }
        );

        // 메뉴내부에 우측상단에 닫기 표시 버튼 동작
        $('#MenuClose').click(
            function () {
                $(this).removeClass('btnon');

                $('#MenuBorad').removeClass('active');
                $('#descBorad').removeClass('active');

                $('#MenuBorad').slideUp('fast');
                $('#descBorad').slideUp('fast');
                $('#descBorad').css("width", menuwidth+10);
            }
        );

        // 서브메뉴항목을 클릭했을 때 폼이 열리도록 하는 로직
        $('.subList > a > span').click(
            function(){
                var submenutext = $(this).text();

                for(var ix = 0; ix < common.Menu.mainMenuData.length; ix++){
                    if (common.Menu.mainMenuData[ix].text == submenutext){
                        $('#MenuClose').removeClass('btnon');

                        $('#MenuBorad').removeClass('active');
                        $('#descBorad').removeClass('active');

                        $('#MenuBorad').slideUp('fast');
                        $('#descBorad').slideUp('fast');
                        $('#descBorad').css("width", menuwidth+10);
                        common.OpenView.onMenuItemClick( null, common.Menu.mainMenuData[ix].cls);
                    }
                }

            }
        );



        // 메뉴좌측하단에   "  * configuration "  이영역을 눌렀을 경우에 나타나는 화면에 대한 로직
        $('#SetConfig').click(
            // 특수사항이 없기 때문에 Scr인자  view.ConfigMyView <== 하드 코딩 되어 있습니다.  위에 로직하고 일반화시켜서 사용해도되는데
            function(){
                // 난중에 복잡해져서 조건 하나 더 붙을거 같아서 일반화 포기했습니다. 결론은   " 하드코딩 " scr이름 바뀌면 여기서 바꿔야함
                $('#MenuClose').removeClass('btnon');

                $('#MenuBorad').removeClass('active');
                $('#descBorad').removeClass('active');

                $('#MenuBorad').slideUp('fast');
                $('#descBorad').slideUp('fast');
                $('#descBorad').css("width", menuwidth+10);
                common.OpenView.onMenuItemClick( null, 'config.config');
            }
        );

        /**
         * 브라우저 언어에 따른 로고 이미지 설정.
         */
        function setHeaderPosByGlobal() {
            if (navigator.language == 'ko' || navigator.language == 'ko-KR') {
                $('div.header-log').removeClass('global');
                $('div.pa-header-log').removeClass('global');
            }
        }

    }
});