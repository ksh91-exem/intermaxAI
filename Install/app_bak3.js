/**
 * Created by min on 2015-05-06.
 */
Ext.application({
    name: 'Intermax',
    appFolder: 'Intermax5',

    launch: function() {
        this.WS    = new IMXWS();
        this.WS.Host = location.hostname;
        this.WS.Port = location.port;
        this.WS.parseJSON = true;
        this.WS.ExtractHeader = true;
        this.WS.PushData = false;
        this.WS.Open();
        this.count = 0 ;
        this.install_click = false ;
        this.next_flag = false ;

        this.en_was_content = '<b>'+'Install Agent for Web Apps(Java) monitoring'+'<br/><br/></b>'+
        'Agent will be installed on Application Server(Java Application)'+'<br/>'+
        'allows to monitor resource usage patterns, transaction '+'<br/>'+
        'execution data, and SQL execution data on the server.';


        this.ko_was_content = '<b>'+'WAS(Java) 모니터링을 위해 Agent를 설치'+'<br/><br/></b>'+
        'Agent는 WAS서버에 설치되며, 설치가 완료되면 WAS의 자원사용 패턴,'+'<br>'+
        'Transaction 수행 정보, SQL 수행 정보에 대한 모니터링이 가능합니다.'+'</br></br>' ;

        this.en_wasdb_content = '<b>'+'Install Agent for integrated monitoring for Web Apps(Java) and DB'+'<br/><br/></b>'+
        'Application. DB Agent provides monitoring on DB resource usage'+'<br>'+
        'patterns, DB transaction execution data, DB performance statistics and '+'<br>'+
        'details of DB performance.'+'</br></br></br>' ;

        this.ko_wasdb_content = '<b>'+'WAS(Java) 및 Database 통합 모니터링을 위해 Agent를 설치'+'<br/><br/></b>'+
        'Agent는 WAS 서버 DB 서버 각각에 설치되며, 설치가 완료되면 '+'<br>'+
        'WAS 모니터링과 더불어 WAS와 연결되어 있는 DB에 대한 자원사용 패턴,'+'<br>'+
        'DB Transaction 수행정보, DB 성능지표와 같은 상세 모니터링이 가능합니다.'+'</br></br></br>'


        this.en_exp = '<b>'+'1. Copying java agent file.                '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Copy installed Agent file to WAS. (Use FTP or etc).     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Ex) /usr/local/intermax/intermax.tar                    '+'<br/>'+
        '                                                                                '+'<br/>'+
        '<b>'+'2. Installing Agent.                                                      '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Unzip Agent in InterMax directory.                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'tar –xvf intermax.tar JSPD_HOME                         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Ex) tar –xvf intermax.tar /usr/local/intermax           '+'<br/>'+
        '                                                                                '+'<br/>'+
        '<b>'+'3. Setting Agent property.                                                '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Set Gather IP in jspd.properties.                       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'File : /usr/local/intermax/jspd/cfg/JSPD.properties     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'# DataGather IP Address and port                        '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'WR_ADDR=127.0.0.1:1314                                  '+'<br/>'+
        '                                                                                '+'<br/>'+
        ':db                                                                             ' +
        '<b>'+'4. Installing License.                                                    '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Copy License in /usr/local/intermax/jspd/cfg Folder.    '+'<br/>'+
        '                                                                                '+'<br/>'+
        '<b>'+'5. Modifying Launching Option of Web Application Server.                  '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Add java agent parameter to WAS.                        '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'-javaagent: JSPD_HOME/lib/jspd.jar                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Ex) –javaagent: /usr/local/intermax/jspd/lib/jspd.jar   '+'<br/>'+
        '                                                                                '+'<br/>'+
        '<b>'+'6. Restarting the Web Application Server.                                 '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Verify normal startup after restarting WAS.             '+'<br/>'+
        '                                                                                '+'<br/>'+
        '<b>'+'7. Verifying Agent Connection Status.                                     '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Verify WAS Agent Connection in the Agent Connection Status.';


        this.ko_exp = '<b>'+'1. Java agent 파일 복사                                                   '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'설치된 Agent 파일을 WAS서버에 복사한다(FTP등 이용)                        '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'예) /usr/local/intermax/intermax.tar                                  '+'<br/>'+
        '                                                                                              '+'<br/>'+
        '<b>'+'2. Agent 설치                                                                            '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Intermax 디렉토리에 압축 해제                                            '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'tar –xvf intermax.tar JSPD_HOME                                       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'예) tar –xvf intermax.tar /usr/local/intermax                          '+'<br/>'+
        '                                                                                               '+'<br/>'+
        '<b>'+'3. Agent 환경설정                                                                         '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'/usr/local/intermax/jspd/cfg/JSPD.properties 파일에 Gaterh IP 설정      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'# DataGather IP Address and port                                       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'WR_ADDR=127.0.0.1:1314                                                 '+'<br/>'+
        '                                                                                               '+'<br/>'+
        ':db                                                                                             ' +
        '<b>'+'4. License 설치                                                                           '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'/usr/local/intermax/jspd/cfg/ 폴더에 License복사                        '+'<br/>'+
        '                                                                                              '+'<br/>'+
        '<b>'+'5. Web Application Server 실행 옵션 수정                                                  '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'WAS서버에 Java agent 파라미터 추가                                       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'-javaagent: JSPD_HOME/lib/jspd.jar                                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'예) -javaagent:/usr/local/intermax/jspd/lib/jspd.jar                  '+'<br/>'+
        '                                                                                              '+'<br/>'+
        '<b>'+'6. Web Application Server 재기동                                                         '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'WAS 재기동 후 정상 Startup 확인                                          '+'<br/>'+
        '                                                                                              '+'<br/>'+
        '<b>'+'7. Agent Connection Status 확인                                                         '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Agent Connection Status 에서 WAS Agent 와 연결 확인';



        this.en_db_exp = '<b>'+'1. Linux User Creation.                                     '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Linux user creation for MaxGauge DB ageint installation.      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'User group should be same as group of Oracle installation user'+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) adduser -d /home/maxgauge -g oinstall maxgauge            '+'<br/>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'2. Copying db agent file.                                                       '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Select specific DB agent file(OS 32/64bit, DB version) and    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'copy DB Agent file to DB Server(use FTP, etc.)                '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) linux 64bit, oracle 12.1 version                          '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'/home/maxgauge/'+'<b>'+'rts_linux_64_ora_121.tar              '+'<br/></b>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'3. Unzip Agent.                                                                 '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Unzip DB Agent in MaxGauge directory                          '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'tar –xvf rts_linux_64_ora_121.tar MAXGAUGE_HOME               '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) tar –xvf rts_linux_64_ora_121.tar /home/maxgauge          '+'<br/>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'4. Install Agent.                                                               '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'① Run install script.                                         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'/home/maxgauge/intermax/install/install.sh               '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'② During installation, user default value when prompted.      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'[Install Option]                                              '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'For Oracle DB : Select 1                                 '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user : Select suggested value                     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'configuration file name : Select suggested value         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'For ipc key : Select suggested value                     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'For pmon process : Select suggestd value                 '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'For UDP Port : 2404 ( listen port from WAS agent )       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Gather IP Address : xxx.xxx.xxx.xxx                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Gather Port : 1314                                       '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user : maxgauge (DB user creation)                '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user pass : xxxxxxx                               '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Table Space : suggested value                            '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'For y/n question, choose ‘y’                             '+'<br/>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'5. Installing License.                                                          '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Copy License file in /home/maxgauge/intermax/lib              '+'<br/>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'6. Starting DB Agent.                                                           '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Verify normal startup after starting DB Agent                 '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'/home/maxgauge/intermax/lib/imxctl start                      '+'<br/>'+
        '                                                                                      '+'<br/>'+
        '<b>'+'7. Verifying Agent Connection Status.                                           '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Verify DB Agent Connection in the Agent Connection Status.';



        this.ko_db_exp = '<b>'+'1. Linux 유저 생성                                              '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'InterMax DB agent설치를 위한 Linux 유저 생성.                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'유저 그룹은 Oracle 설치 유저 그룹과 동일하여야 합니다.              '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) adduser -d /home/maxgauge -g oinstall maxgauge            '+'<br/>'+
        '                                                                                     '+'<br/>'+
        '<b>'+'2. Agent 파일 복사                                                              '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'OS 32/64bit, DB 버전에 맞는 DB agent 파일을 선택하여            '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'DB 서버에 복사(use FTP, etc.)                                 '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) linux 64bit, oracle 12.1 version의 경우                   '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'/home/maxgauge/'+'<b>'+'rts_linux_64_ora_121.tar             '+'<br/></b>'+
        '                                                                                    '+'<br/>'+
        '<b>'+'3. 압축 해제                                                                   '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'DB Agent 파일의 압축을 해제합니다.                             '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'tar –xvf rts_linux_64_ora_121.tar MAXGAUGE_HOME              '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'ex) tar –xvf rts_linux_64_ora_121.tar /home/maxgauge         '+'<br/>'+
        '                                                                                     '+'<br/>'+
        '<b>'+'4. 인스톨 스크립트 실행                                                          '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'① install 스크립트 실행                                         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp;'+'/home/maxgauge/intermax/install/install.sh                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'② 설치 중 선택 옵션은 기본값을 선택합니다.                         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'[설치 옵션]                                                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle DB : 1번 선택                                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user : Oracle 설치 User(기본값)                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'conf 파일명 : 기본값                                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'ipc key : 기본값                                         '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'pmon process : 기본값                                    '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'UDP Port : 2404 (WAS agent로부터 listen port )           '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Gather IP Address : xxx.xxx.xxx.xxx                     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Gather Port : 1314                                      '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user : maxgauge (DB 유저 생성됨)                   '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Oracle user pass : xxxxxxx                              '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'Table Space : 기본값                                     '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp;'+'y/n 질문 : ‘y’ 선택                                      '+'<br/>'+
        '                                                                                     '+'<br/>'+
        '<b>'+'5. 라이센스 파일 적용                                                            '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'라이선스 파일을 /home/maxgauge/intermax/lib 폴더에 복사합니다.   '+'<br/>'+
        '                                                                                     '+'<br/>'+
        '<b>'+'6. Agent 기동                                                                   '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Agent 기동 스크립트를 실행하여 Agent를 기동 시킵니다.             '+'<br/>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'예) /home/maxgauge/intermax/lib/imxctl start                  '+'<br/>'+
        '                                                                                     '+'<br/>'+
        '<b>'+'7. Agent 연결 상태 확인                                                         '+'<br/></b>'+
        '&nbsp&nbsp&nbsp&nbsp;'+'Agent Connection Status 에서 DB Agent 연결 상태를 확인 합니다.';






        var self = this ;

        this.lang = localStorage.getItem('Intermax_MyLanguage');
        if ( this.lang == null ){
            localStorage.setItem('Intermax_MyLanguage', 'en');
            this.lang = navigator.language ;
        } ;

        this.layout() ;

        $(window).resize(function(){
            $(self)[0].top_pnl.el.dom.style.width = '100%' ;

        });

    } ,







    layout: function(){

        var self = this ;

        this.viewport = Ext.create('Ext.container.Container', {
            id       : 'viewPort',
            layout   : 'border',
            width    : '100%',
            height   : '100%',
            minHeight: 890,
            minWidth : 1000,
            autoScroll: true,
            cls      : 'viewport',
            renderTo : Ext.get('homediv')
        });

        var body = $('body') ;
        var title = 'INSTALL' ;
        body.append('<div class="header-log" style="background:url(../images/InterMax_Logo.png) no-repeat"></div>');
        body.append('<div class="rtm-header-log"><p class="header-line"></p><p class="header-title">' + title + '</p>'); // Main title


        this.top_pnl = Ext.create('Ext.container.Container',{
            itemId : 'top_pnl',
            layout : 'fit',
            region : 'north',
            width  : '100%',
            height : 59 ,
            style  : { 'background': '#3F4249' }
        }) ;


        this.main_pnl = Ext.create('Ext.container.Container',{
            itemId: 'main_pnl',
            layout:{
                pack: 'center',
                align: 'middle'
            },
            region: 'center',
            width : '100%',
            height: '100%'
        })
        this.viewport.add( this.top_pnl, this.main_pnl ) ;


        var was_content ;
        var wasdb_content ;
        if ( this.lang == 'en' ){
            was_content = this.en_was_content ;
            wasdb_content = this.en_wasdb_content ;
        }else{
            was_content = this.ko_was_content ;
            wasdb_content = this.ko_wasdb_content ;
        }


        $(this.main_pnl.el.dom).append('<div class="main-img"></div>') ;
        $(this.viewport.el.dom).find('.main-img').append('<p class="main-title">Agent Installation Wizard</p>' +
        '<p class="step1-title">Step 1 : Choose Install Option</p>' +
        '<p class="step2-title">Step 2 : Setup Tiers</p>' +
        '<p class="step1-sub-title">Step 1 : Choose Install Option</p>' +
        '<p class="step2-sub-title">Step 2 : Setup Tiers (Java Application Server) </p>' +
        '<p class="was-off">Web Apps(Java)</p>' +
        '<p class="wasdb-off">Web Apps(Java) + Database</p>' +
        '<p class="was-title">Web Apps(Java)</p>' +
        '<p class="was-content"> '+ was_content +' </p>' +
        '<p class="wasdb-title">Web Apps(Java) + Database(Oracle, DB2)</p>' +
        '<p class="wasdb-content">'+ wasdb_content+'</p>' +
        '<p class="close-btn"></p>' +
        '<p class="cancel-btn">Cancel</p>') ;

        $(this.viewport.el.dom).find('.main-img').append('<p class="was-temp-area"></p>') ;
        $(this.viewport.el.dom).find('.main-img').append('<p class="db-temp-area"></p>') ;

        $(this.viewport.el.dom).find('.main-img').append('<div class="grid-area"><p class="grid-title">Agent Connection Status</p></div>') ;
        $(this.viewport.el.dom).find('.main-img').append('<div class="db-grid-area"><p class="grid-title">Agent Connection Status</p></div>') ;
        $(this.viewport.el.dom).find('.main-img').append('<div class="exp-area"></div>') ;

        $(this.viewport.el.dom).find('.main-img').append('<p class="user">User</p>') ;
        $(this.viewport.el.dom).find('.main-img').append('<p class="web">Web</p>') ;
        $(this.viewport.el.dom).find('.main-img').append('<p class="was">WAS</p>') ;
        $(this.viewport.el.dom).find('.main-img').append('<p class="db">DB</p>') ;

        $(this.viewport.el.dom).find('.was-off').append('<p class="dg-text">Data'+'<br>'+'Gather'+'</br></p>') ;
        $(this.viewport.el.dom).find('.wasdb-off').append('<p class="dg-text">Data'+'<br>'+'Gather'+'</br></p>') ;
        $(this.viewport.el.dom).find('.was-off').append('<p class="agent-text">AGENT</p>') ;
        $(this.viewport.el.dom).find('.wasdb-off').append('<p class="agent-text">AGENT</p>') ;
        $(this.viewport.el.dom).find('.wasdb-off').append('<p class="agentdb-text">AGENT</p>') ;



        $(this.viewport.el.dom).find('.step2-sub-title').hide() ;
        $(this.viewport.el.dom).find('.exp-area').hide() ;
        $(this.viewport.el.dom).find('.grid-title').hide() ;
        $(this.viewport.el.dom).find('.was-temp-area').hide() ;
        $(this.viewport.el.dom).find('.db-temp-area').hide() ;
        $(this.viewport.el.dom).find('.user').hide() ;
        $(this.viewport.el.dom).find('.web').hide() ;
        $(this.viewport.el.dom).find('.was').hide() ;
        $(this.viewport.el.dom).find('.db').hide() ;

        document.getElementsByTagName("p")[5].onclick = function(e){
            $(self)[0].was_click() ;
        }

        document.getElementsByTagName("p")[8].onclick = function(e){
            $(self)[0].db_click() ;
        }


        //close btn
        document.getElementsByTagName("p")[16].onclick = function(e){
            $(self)[0].call_rtm() ;
        }

        //cancel btn click
        document.getElementsByTagName("p")[17].onclick = function(e){
            $(self)[0].call_rtm() ;
        }


        $view = null ;
        $main = null ;
        was_content = null ;
        wasdb_content = null ;

    },



    /*
    * step1 - was 클릭
    * */
    was_click: function(){
        var self = this ;

        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;



        this.create_grid() ;
        this.get_was_info() ;
        this.get_explain( this.lang, 'was', 1 ) ;
        this.change_view($view, $main) ;

        $(this.viewport.el.dom).find('.main-img').append('<p class="db-disabled"></p>') ;

        $main.find('.grid-area').show() ;
        $main.find('.db-temp-area').show() ;
        $main.find('.next-btn').hide() ;
        $main.find('.db-grid-area').hide() ;
        $main.find('.was-temp-area').hide() ;
        $main.find('.step2-sub-title').text( 'Step2 : Setup Tier ( Java Application Server )' ) ;

        $main.find('.db-temp-area').off( 'click' ) ;
        $main.find('.db-temp-area').off( 'mouseleave' ) ;
        $main.find('.db-temp-area').off( 'mouseenter' ) ;

        $main.find('.back-btn').on('click', function(e){
            $(self)[0].was_back() ;

        }) //end event

        $main.find('.step1-title').on('click', function(e){
            $(self)[0].was_back() ;
        }) ;



        //this.exp_pnl.add( $main.find('.exp-area') ) ;


        $view = null ;
        $main = null ;
    } ,


    /*
    * was화면 - back 버튼 클릭
    * */
    was_back: function(){
        var self = this ;

        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;


        console.log('와스빽호출');
        $main.find('.was-count').remove() ;
        $main.find('.db-count').remove() ;

        clearTimeout( $(self)[0].timeout ) ;
        clearTimeout( $(self)[0].db_timeout ) ;

        $main.css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/step1_bg_nonText_s.png)'})

        $main.find('.cancel-btn').mouseenter(function() {
            $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)")
        }).mouseleave(function() {
            $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_on.png)")
        }).css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)'})


        $(self)[0].step1_title_css( $main, false ) ;


        $(self)[0].grid_store.removeAll() ;
        $main.find('.step2-sub-title').hide() ;
        $main.find('.config-btn').hide() ;
        $main.find('.back-btn').hide() ;
        $main.find('.next-btn').hide() ;
        $main.find('.grid-area').hide() ;
        $main.find('.db-grid-area').hide() ;
        $main.find('.exp-area').hide() ;
        $main.find('.db-temp-area').hide() ;

        $main.find('.user').hide() ;
        $main.find('.web').hide() ;
        $main.find('.was').hide() ;
        $main.find('.db').hide() ;

        $main.find('.was-off').show() ;
        $main.find('.wasdb-off').show() ;
        $main.find('.step1-sub-title').show() ;
        $main.find('.was-title').show() ;
        $main.find('.wasdb-title').show() ;
        $main.find('.was-content').show() ;
        $main.find('.wasdb-content').show() ;



    } ,


    /*
    * step1 - db 클릭
    * */
    db_click: function(){
        var self = this ;

        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;

        clearTimeout( $(self)[0].db_timeout ) ;
        clearTimeout( $(self)[0].timet ) ;



        $(self)[0].change_view($view, $main) ;
        $(self)[0].create_grid() ;
        $(self)[0].get_explain( $(self)[0].lang, 'db', 1 ) ;
        $(self)[0].get_was_info() ;

        $main.find('.config-btn').hide() ;
        $main.find('.was-temp-area').hide() ;
        $main.find('.grid-area').show() ;

        $main.find('.db-grid-area').hide() ;
        $main.find('.db-temp-area').show() ;
        $main.find('.step2-sub-title').text( 'Step2 : Setup Tier ( Web Apps + DB )' ) ;
        $main.find('.db-disabled').remove() ;
        $main.find('.db').css({'color': '#E1DEDA' , 'font-family': "Droid Sans"}) ;
        $main.find('.was').css({'color': '#4D9AFE' , 'font-family': "Droid Sans Bold"}) ;
        $main.find('.db-count').css({'opacity': '.4'}) ;

        $main.find('.next-btn').on('click', function(e){
            clearTimeout( $(self)[0].timeout ) ;
            $(self)[0].db_next() ;
        }) ;


        $main.find('.back-btn').on('click', function(e){
            clearTimeout( $(self)[0].db_timeout ) ;
            $(self)[0].db_back() ;
        }) ;


        $main.find('.step1-title').on('click', function(e){
            clearTimeout( $(self)[0].db_timeout ) ;
            $main.find('.config-btn').hide() ;
            $(self)[0].next_flag = false ;
            $(self)[0].db_back() ;
        }) ;


        $main.find('.db-temp-area').css({ 'cursor': 'pointer' }) ;
        $main.find('.db-temp-area').mouseenter(function() {
            $(this).css("opacity","0")
            $main.find('.db-count').css("opacity",".9")
        }).mouseleave(function() {
            $(this).css("opacity",".4")
            $main.find('.db-count').css("opacity",".4")
        }).on('click', function(e){
            $(self)[0].db_next() ;
        }) ;


        //this.exp_pnl.add( $main.find('.exp-area') ) ;
    },

    db_next: function(){

        var self = this ;
        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;

        $(self)[0].step1_title_css( $main, true ) ;
        $(self)[0].next_flag = true ;

        //was도연결
        $main.find('.was-count').css({ 'cursor': 'pointer' }) ;
        $main.find('.was-count').mouseenter(function() {
            $(this).css("opacity",".9")
            $main.find('.was-temp-area').css("opacity","0")
        }).mouseleave(function() {
            $(this).css("opacity",".4")
            $main.find('.was-temp-area').css("opacity",".4")
        }).on('click', function(e) {
            $(self)[0].next_flag = true ;
            $(self.viewport.el.dom).find('.main-img').find('.was-count').hide() ;
            $(self.viewport.el.dom).find('.main-img').find('.was-count').off('click') ;
            clearTimeout( $(self)[0].db_timeout ) ;
            clearTimeout( $(self)[0].timeout ) ;
            $(self)[0].db_back() ;
        }) ;

        //
        $main.find('.was-temp-area').css({ 'cursor': 'pointer' }) ;
        $main.find('.was-temp-area').mouseenter(function() {
            $(this).css("opacity","0")
            $main.find('.was-count').css("opacity",".9")
        }).mouseleave(function() {
            $(this).css("opacity",".4")
            $main.find('.was-count').css("opacity",".4")
        }).on('click', function(e) {
            $(self)[0].next_flag = true ;
            $(self.viewport.el.dom).find('.main-img').find('.was-temp-area').hide() ;
            $(self.viewport.el.dom).find('.main-img').find('.was-temp-area').off('click') ;
            clearTimeout( $(self)[0].db_timeout ) ;
            clearTimeout( $(self)[0].timeout ) ;
            $(self)[0].db_back() ;
        }) ;



        $main.find('.grid-area').hide() ;
        $main.find('.db-grid-area').show() ;

        $main.find('.next-btn').hide() ;
        $main.find('.next-btn').off('click') ;
        $main.find('.config-btn').show() ;

        $main.find('.was-count').css({'opacity': '.4'}) ;
        $main.find('.db-count').css({'opacity': '.4'}) ;
        $main.find('.was').css({'color': '#E1DEDA', 'font-family': 'Droid Sans'}) ;
        $main.find('.db').css({'color': '#4D9AFE', 'font-family': 'Droid Sans Bold'}) ;


        $main.find('.db-temp-area').hide() ;
        $main.find('.was-temp-area').show() ;
        $(self)[0].get_explain( $(self)[0].lang, 'db', 2 ) ;
        $(self)[0].get_db_info() ;

    } ,


    /*
    * db화면 - back 클릭
    * next 버튼 이벤트도 포함.
    * db는 next버튼, back버튼이 두개씩 있어서 if~else로 분개하여 처리.
    * */
    db_back: function(){
        var self = this ;
        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;


        /*
        *this.next_flag : true -> 처음넥스트(화면은 was) / false -> 끝 넥스트(화면은 step1)
        * */

        clearTimeout( this.timeout ) ;

        if ( this.next_flag ){

            $(self)[0].next_flag = false ;
            $(self)[0].step1_title_css( $main, true ) ;

            $main.find('.config-btn').hide() ;

            $main.find('.db').css({'color': '#E1DEDA' , 'font-family': "Droid Sans"}) ;
            $main.find('.was').css({'color': '#4D9AFE' , 'font-family': "Droid Sans Bold"}) ;
            $main.find('.db-count').css({'opacity': '.4'}) ;


            $main.find('.grid-area').show() ;
            $main.find('.db-grid-area').hide() ;

            $main.find('.db-temp-area').show() ;
            $main.find('.was-temp-area').hide() ;

            $main.find('.next-btn').show() ;
            $main.find('.next-btn').on('click') ;



            $main.find('.db-count').css({ 'cursor': 'pointer' }) ;
            $main.find('.db-count').mouseenter(function() {
                $(this).css("opacity",".9")
                $main.find('.db-temp-area').css("opacity","0")
            }).mouseleave(function() {
                $(this).css("opacity",".4")
                $main.find('.db-temp-area').css("opacity",".4")
            }).on('click', function(e){
                $(self)[0].db_next() ;
            }) ;


            $main.find('.next-btn').on('click', function(e){
                $(self)[0].next_flag = true ;
                $main.find('.config-btn').show() ;

                $main.find('.was-count').css({'opacity': '.4'}) ;
                $main.find('.was-count').css({'cursor': 'pointer'}) ;
                $main.find('.was').css({'color': '#E1DEDA', 'font-family': "Droid Sans"}) ;
                $main.find('.db').css({'color': '#4D9AFE', 'font-family': "Droid Sans Bold"}) ;

                $main.find('.grid-area').hide() ;
                $main.find('.db-grid-area').show() ;

                $main.find('.db-temp-area').hide() ;
                $main.find('.was-temp-area').show() ;
                $main.find('.was-temp-area').on('click') ;
                $main.find('.was-count').on('click') ;

                $(self)[0].get_explain( $(self)[0].lang, 'db', 2 ) ;
                $(self)[0].get_db_info() ;
            })


            $(self)[0].get_explain( $(self)[0].lang, 'db', 1 ) ;
            $(self)[0].get_was_info() ;

        }else{

            $(self)[0].step1_title_css( $main, false ) ;

            $main.css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/step1_bg_nonText_s.png)'})
            $main.find('.cancel-btn').mouseenter(function() {
                $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)")
            }).mouseleave(function() {
                $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_on.png)")
            }).css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)'})

            $(self)[0].grid_store.removeAll() ;
            $main.find('.was-off').show() ;
            $main.find('.wasdb-off').show() ;

            $main.find('.step1-sub-title').show() ;
            $main.find('.step2-sub-title').hide() ;
            $main.find('.was-title').show() ;
            $main.find('.wasdb-title').show() ;
            $main.find('.was-content').show() ;
            $main.find('.wasdb-content').show() ;

            $main.find('.back-btn').hide() ;
            $main.find('.next-btn').hide() ;
            $main.find('.grid-area').hide() ;
            $main.find('.db-grid-area').hide() ;
            $main.find('.exp-area').hide() ;

            $main.find('.db-temp-area').hide() ;
            $main.find('.was-temp-area').hide() ;

            $main.find('.db-count').hide() ;
            $main.find('.was-count').hide() ;
            $main.find('.user').hide() ;
            $main.find('.web').hide() ;
            $main.find('.was').hide() ;
            $main.find('.db').hide() ;


            clearTimeout( $(self)[0].timeout ) ;
            clearTimeout( $(self)[0].db_timeout ) ;
        }
    } ,



    /*
    * step1에서 step2이미지로 변경하는 함수
    * */
    change_view: function($view, $main){
       var self = this ;

        $main.css({
            'background-image': 'url(/Intermax5/Install/image/Install_image_4/step2_bg_NonText.png)',
        }) ;


        $(self)[0].step1_title_css( $main, true ) ;



        //$main.find('.grid-area').show() ;
        $main.find('.grid-title').show() ;
        $main.find('.exp-area').show() ;


        $view.find('.was-off').hide() ;
        $view.find('.wasdb-off').hide() ;
        $view.find('.step1-sub-title').hide() ;
        $view.find('.step2-sub-title').show() ;
        $view.find('.was-title').hide() ;
        $view.find('.wasdb-title').hide() ;
        $view.find('.was-content').hide() ;
        $view.find('.wasdb-content').hide() ;
        $view.find('.was-temp-area').hide() ;
        $view.find('.db-temp-area').hide() ;

        $view.find('.user').show() ;
        $view.find('.web').show() ;
        $view.find('.was').show() ;
        $view.find('.db').show() ;


        //$main.find('.cancel-btn').css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)'})

        $main.find('.cancel-btn').mouseenter(function() {
            $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)")
        }).mouseleave(function() {
            $(this).css("background-image","url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_on.png)")
        }).css({'background-image': 'url(/Intermax5/Install/image/Install_image_4/next_bt_NonText_off.png)'}) ;


        if ( $view.find('.back-btn')[0] ){
            $main.find('.back-btn').remove() ;
            $main.find('.next-btn').remove() ;
            $main.find('.config-btn').remove() ;
        }

        $main.append('<p class="back-btn">Back</p>') ;
        $main.append('<p class="next-btn">Next</p>') ;
        $main.append('<p class="config-btn">Configuration</p>') ;

        $main.find('.config-btn').on('click', function(e){
            $(self)[0].call_config() ;
        }) //end event
    } ,



    create_grid: function(){

        if ( this.grd_pnl == undefined ){

            this.grid_store = Ext.create('Ext.data.Store',{
                fields  : [
                    {name : 'status'     , type : 'string' },
                    {name : 'server_type', type : 'string' },
                    {name : 'server_id'  , type : 'string' },
                    {name : 'ip'         , type : 'string' }
                ],
                data    : []
            })


            this.grd_pnl = Ext.create('Ext.grid.Panel',{
                renderTo: $(this.viewport.el.dom).find('.grid-area')[0],
                width : '100%',
                height: '100%',
                //flex  : 1,
                layout: 'fit',
                hideHeaders : false,
                //forceFit    : true,
                autoScroll  : true,
                store       : this.grid_store,
                columns     : [
                    {   text      : 'Status',
                        dataIndex : 'status',
                        width     : 70  ,
                        style     : {'text-align' : 'center' },
                        renderer: function(v, meta, record, rowIndex, colIndex, store) {
                            meta.align = 'center';
                            if ( record.data.status == 0 ){
                                status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50% ; border: 2px solid rgb(255, 255, 255) ; box-shadow: rgb(39, 183, 159) 0px 0px 4px; right: auto; background-color: rgb(40, 154, 249)';
                            }else{
                                status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(244, 252, 249); box-shadow: rgb(136, 133, 170) 0px 0px 4px; background-color: rgb(249, 75, 75);' ;
                            }

                            return '<div style="position:relative;overflow:hidden;"><div style="'+ status_style +'"></div></div>';
                        }
                    },
                    { text: 'Server Type',    dataIndex : 'server_type'  , style     : {'text-align' : 'center' }, flex  : 1   },
                    { text: 'Server ID'  ,    dataIndex : 'server_id'    , style     : {'text-align' : 'center' }, flex  : 1   },
                    { text: 'IP'         ,    dataIndex : 'ip'           , style     : {'text-align' : 'center' }, flex  : 1   }
                ]
            }) ;

        } ;


        if ( this.db_grd_pnl == undefined ){

            this.db_grid_store = Ext.create('Ext.data.Store',{
                fields  : [
                    {name : 'status'     , type : 'string' },
                    {name : 'server_type', type : 'string' },
                    {name : 'server_id'  , type : 'string' },
                    {name : 'ip'         , type : 'string' }
                ],
                data    : []
            })


            this.db_grd_pnl = Ext.create('Ext.grid.Panel',{
                renderTo: $(this.viewport.el.dom).find('.db-grid-area')[0],
                width : '100%',
                height: '100%',
                //flex  : 1,
                layout: 'fit',
                hideHeaders : false,
                //forceFit    : true,
                autoScroll  : true,
                store       : this.db_grid_store,
                columns     : [
                    {   text      : 'Status',
                        dataIndex : 'status',
                        width     : 70  ,
                        style     : {'text-align' : 'center' },
                        renderer: function(v, meta, record, rowIndex, colIndex, store) {
                            meta.align = 'center';
                            if ( record.data.status == 0 ){
                                status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50% ; border: 2px solid rgb(255, 255, 255) ; box-shadow: rgb(39, 183, 159) 0px 0px 4px; right: auto; background-color: rgb(40, 154, 249)';
                            }else{
                                status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(244, 252, 249); box-shadow: rgb(136, 133, 170) 0px 0px 4px; background-color: rgb(249, 75, 75);' ;
                            }

                            return '<div style="position:relative;overflow:hidden;"><div style="'+ status_style +'"></div></div>';
                        }
                    },
                    { text: 'Server Type',    dataIndex : 'server_type'  , style     : {'text-align' : 'center' }, flex  : 1   },
                    { text: 'Server ID'  ,    dataIndex : 'server_id'    , style     : {'text-align' : 'center' }, flex  : 1   },
                    { text: 'IP'         ,    dataIndex : 'ip'           , style     : {'text-align' : 'center' }, flex  : 1   }
                ]
            }) ;
        } ;




    } ,


    /*
    * lang: 언어
    * type: was or db
    * step: next depth
    * */
    get_explain: function(lang, type, step){
        var self = this ;
        var $view = $(self.viewport.el.dom) ;
        var $main = $view.find('.main-img') ;
        var text ;

        $main.find('.exp-area').empty() ;

        if ( step == 2 ){
            text = ( lang == 'en' ) ? this.en_db_exp : this.ko_db_exp ;
        }else{
            text = ( lang == 'en' ) ? this.en_exp : this.ko_exp ;
        }



        if ( type == 'db' ){
            if ( lang == 'en' ){
                text     = text.replace( ':db', '&nbsp&nbsp&nbsp&nbsp;'+'Set db agent info in Jspd.rts.'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'File : /usr/local/intermax/jspd/cfg/jspd.rts'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'# db agent IP:Port:DB InstanceName.DB IP. Listener Port'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'xxx.xxx.xxx.xxx:2404:ORA.xxx.xxx.xxx.xxx:1521'+'<br/><br/>') ;

                //{ $main.find('.exp-area').css({'line-height': '14px'}) ; }

            }else{
                text = text.replace( ':db', '&nbsp&nbsp&nbsp&nbsp;'+'Jspd.rts 파일에 db agent 정보를 설정 합니다.'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'위치 : /usr/local/intermax/jspd/cfg/jspd.rts'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'형식 : db agent IP:Port:DB InstanceName.DB IP. Listener Port'+'<br/>'+
                '&nbsp&nbsp&nbsp&nbsp;'+'예) xxx.xxx.xxx.xxx:2404:ORA.xxx.xxx.xxx.xxx:1521'+'<br/><br/>') ;

                //{ $main.find('.exp-area').css({'line-height': '15px'}) ; }
            }
            //if ( step == 2 ){ $main.find('.exp-area').css({'line-height': '11px'}) ; }


        }else{
            text = text.replace( ':db', '' ) ;

            //$main.find('.exp-area').css({'line-height': '17px'}) ;

        }
        $main.find('.exp-area').append(text) ;



        self = null ;
        $view = null ;
        $main = null ;
        text = null ;
    } ,

    get_was_info: function(){
        var ds = {};
        var self = this ;

        ds.sql =   'select t.status, '+
                    '       t.server_type, '+
                    '       w.was_id, '+
                    '       w.ip     '+
                    'from   xapm_was_info w '+
                    'inner join xapm_server_time t '+
                    'on    t.server_id = w.was_id '+
                    'and   t.server_type = 1  '+
                    'order by t.server_time desc ;' +
                    ''+
                    ''+
                    ''+
                    'select count(*)   '+
                    'from xapm_was_info w   '+
                    'inner join xapm_server_time t '+
                    'on    t.server_id = w.was_id  '+
                    'and   t.server_type = 1       '+
                    'and   t.status = 0 ;'

        this.WS.SQLExec(ds, function(header, data) {

            if ( this.count == 0 ){
                this.count = data[0].rows.length ;
                this.timeout = setTimeout( this.get_was_info.bind(this), 3000 ) ;
            }else{
                this.draw_grid( data[0], 'was' );

                var $view = $(self.viewport.el.dom) ;
                var $main = $view.find('.main-img') ;


                if ( $main.find('.was-count')[0] ){
                    $main.find('.was-count').remove() ;
                }
                $main.append('<p class="was-count">'+ data[1].rows[0][0] + '</p>') ;
                this.timeout = setTimeout( this.get_was_info.bind(this), 3000 ) ;
            }

        }, self);
    } ,

    get_db_info: function(){
        var ds = {};
        var self = this ;

        ds.sql =    'select t.status,                '+
                    '       t.server_type,           '+
                    '       d.db_id,                 '+
                    '       d.host_ip                '+
                    'from   xapm_db_info d           '+
                    'inner  join xapm_server_time t  '+
                    'on     t.server_id = d.db_id    '+
                    'and    t.server_type = 2 ;      '+
                    '                                '+
                    '                                '+
                    'select count(*)                 '+
                    'from   xapm_db_info d           '+
                    'inner  join xapm_server_time t  '+
                    'on     t.server_id = d.db_id    '+
                    'and    t.server_type = 2        '+
                    'and    t.status = 0 ;           ';

        this.WS.SQLExec(ds, function(header, data) {

            clearTimeout( this.timeout ) ;
            if ( this.count == 0 ){
                this.count = data[0].rows.length ;
                this.db_timeout = setTimeout( this.get_db_info.bind(this), 3000 ) ;
            }else{
                this.draw_grid( data[0] );

                var $view = $(self.viewport.el.dom) ;
                var $main = $view.find('.main-img') ;

                if ( $main.find('.db-count')[0] ){
                    $main.find('.db-count').remove() ;
                }
                $main.append('<p class="db-count">'+ data[1].rows[0][0] + '</p>') ;
                this.db_timeout = setTimeout( this.get_db_info.bind(this), 3000 ) ;
            }
        }, self);
    },

    draw_grid: function(data, type){

        /*
         *
         * CONNECTED    = 0
         DISCONNECTED = 1
         SERVER_DOWN  = 2
         SERVER_HANG  = 3
         *
         * */

        var server_type ;
        var arr = [] ;
        var obj ;

        if ( type == 'was' ){ obj = this.grid_store }
        else { obj = this.db_grid_store } ;

        obj.removeAll() ;
        for ( var ix = 0 ; ix < data.rows.length; ix++ ){
            if ( data.rows[ix][1] == 1 ){
                server_type = 'WAS' ;
            }else if ( data.rows[ix][1] == 2 ){
                server_type = 'DB'
            }else if ( data.rows[ix][1] == 3 ){
                server_type = 'WS'
            } ;

            console.log( 'install data-------------------------', data.rows[ix][2] );


            arr.push( {
                'status'     : data.rows[ix][0],
                'server_type': server_type,
                'server_id'  : data.rows[ix][2],
                'ip'         : data.rows[ix][3]
            } )
        } ;
        obj.loadData( arr ) ;
        //this.loading_mask.hide() ;

        obj = null ;
        ix = null ;
        server_type = null ;
        arr = null ;
    } ,


    call_rtm: function(){
        clearTimeout( this.timeout ) ;
        clearTimeout( this.db_timeout ) ;
        self.close() ;

    } ,


    call_config: function(){

        clearTimeout( this.timeout ) ;
        clearTimeout( this.db_timeout ) ;

        var path = document.location.pathname;
        var dir = path.substring(0, path.lastIndexOf('/')-7);
        this.open_in_new_tab( document.location.origin + dir + 'config' ) ;


        path = null ;
        dir = null ;
    } ,


    open_in_new_tab : function (url) {
        var win = window.open(url, '_blank');
        //win.focus();
        win.opener = null ;
        win = null ;
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


    /*
    * @param
    * main : Object
    * flag : 이벤트걸지 말지 여부
    * */
    step1_title_css: function($main, flag){

        if ( flag ){
            $main.find('.step1-title').mouseenter(function() {
                $(this).css("text-shadow","1px 1px 1px black") ;
            }).mouseleave(function() {
                $(this).css("text-shadow","0 1px 1px rgba(0,0,0,.3)") ;
            }).css({'cursor': 'pointer'}) ;
        }else{
            $main.find('.step1-title').mouseenter(function() {
                $(this).css("text-shadow","0 1px 1px rgba(0,0,0,.3)") ;
            }).mouseleave(function() {
                $(this).css("text-shadow","0 1px 1px rgba(0,0,0,.3)") ;
            }).css({'cursor': 'Default'}) ;
        }



    }
});
