Ext.define('rtm.src.rtmServiceList', {
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Service List'),
    layout: 'fit',
    cls   : 'rtm-servicelist',
    width : 269,
    height: 419,
    minHeight: 400,
    maximizable : false,
    closable    : false,
    isChangeMode: false,

    modal   : true,

    listeners: {
        afterrender: function() {
            this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
                scope: this,
                enter: function() {
                    this.focus();
                    document.getElementById('login_select_service_form').click();
                }
            });
        }
    },

    init: function() {

        this.initLayout();

        if (this.isChangeMode !== true) {
            this.checkSkipService();
        }
    },


    initLayout: function() {
        var self = this;

        self.background = Ext.create('Exem.Container', {
            layout: 'vbox',
            region: 'center',
            flex  : 1
        });
        self.add(self.background);


        self.middleArea = Ext.create('Ext.container.Container',{
            flex  : 1,
            width : '100%',
            autoScroll: true,
            padding   : 5,
            cls       : 'rtm-servicename-base'
        });

        self.bottomArea =  Ext.create('Exem.Container', {
            layout : {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            margin: '1 0 1 0',
            width : '100%',
            height: 38,
            cls   : 'rtm-servicelist-bottom',
            items: [{
                xtype: 'button',
                id: 'login_select_service_form',
                cls : 'rtm-btn',
                text: common.Util.TR('OK'),
                width : 60,
                height: 20,
                listeners: {
                    render: function() {
                        this.el._clicked = false;
                        this.el.on('click', function() {
                            if( this.el._clicked ) {
                                 return;
                            }
                            if (self.isChangeMode) {
                                // 서비스를 변경하는 경우
                                sessionStorage.setItem('Intermax_MyTheme', Comm.web_env_info.Intermax_MyTheme);
                            }

                            this.component.setDisabled(true);

                            //선택된 서비스에 대해 NonDB 유무를 체크
                            Comm.selectedServiceInfo = self.fieldCon.getCheckedRow();
                            if (Comm.selectedServiceInfo) {
                                self.loadingMask.show(null, true);

                                self.checkRepositoryInfoList();

                            } else {
                                this.component.setDisabled(false);
                                Ext.Msg.show({
                                    title : 'Warning',
                                    msg : common.Util.TR('Please select Service.'),
                                    width : 300,
                                    buttons : Ext.Msg.OK,
                                    icon : Ext.MessageBox.WARNING
                                });
                                return;
                            }
                            this.el._clicked = true;

                        });
                        this.el.on('mousemove', function() {
                            this.el.setStyle('cursor', 'pointer');
                        });
                    }
                }
            }]
        });

        // RTM 화면에서 실행한 경우 Cancel 버튼 표시
        if (this.isChangeMode) {
            self.bottomArea.add({
                xtype : 'button',
                cls   : 'rtm-btn',
                text  : common.Util.TR('Cancel'),
                margin: '0 0 0 15',
                height: 20,
                listeners: {
                    render: function() {
                        this.el.on('click', function() {
                            self.close();

                        });
                        this.el.on('mousemove', function() {
                            this.el.setStyle('cursor', 'pointer');
                        });
                    }
                }
            });
        }

        // 서비스 목록 표시 영역
        self.fieldCon = Ext.create('Exem.FieldContainer', {
            itemId       : 'serviceCheckboxContainer',
            defaultType  : 'checkboxfield',
            padding      : '15 30 30 20',
            selectionMode: 'single',
            cls          : 'rtm-servicename-label'
        });

        self.loadingMask = Ext.create('Exem.LoadingMask', {
            target: self
        });
        self.loadingMask.show(null, true);

        // 서비스 목록 가져와서 설정하기
        function configServiceListOfUser( header, data ) {
            if (!data.rows || data.rows.length <= 0) {
                console.debug('%c [ServiceList] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'No Data - Service List');
                Ext.Msg.show({
                    title : 'Warning',
                    msg : common.Util.TR('Configured service is a user that does not exist.'),
                    width : 300,
                    buttons : Ext.Msg.OK,
                    icon : Ext.MessageBox.WARNING
                });
                self.loadingMask.hide();
                return;
            }

            var cx, cxLen, ix, ixLen;
            var services = [];

            for (cx = 0, cxLen = data.rows.length; cx < cxLen; cx++) {
                for (ix = 0, ixLen = cfg.login.user_services.length; ix < ixLen; ix++) {
                    services.length = 0;

                    if (cfg.login.user_services[ix] && cfg.login.user_services[ix] == data.rows[cx][1]) {
                        //0: SERVICE_NAME, 1: SERVICE_ID
                        services[services.length] = [data.rows[cx][0], data.rows[cx][1]];
                        self.fieldCon.addRecords('Checkbox', services);
                    }
                }
            }

            var allCheckbox = self.fieldCon.query('checkbox');

            for (ix = 0, ixLen = allCheckbox.length; ix < ixLen; ix++) {
                if (allCheckbox[ix].inputValue == localStorage.getItem('SelectedServiceId')) {
                    allCheckbox[ix].setValue(true);
                }
                if (allCheckbox.length === 1) {
                    allCheckbox[0].setValue(true);
                }
            }

            self.loadingMask.hide();

            ix       = null;
            cx       = null;
            ixLen    = null;
            services = null;
            data     = null;
        }

        self.middleArea.add(self.fieldCon);

        self.background.add(self.middleArea, self.bottomArea);

        // 메인에 있는 캐쉬 쓰고 없으면 쿼리한다.
        var header, data;
        try {
            header = Comm.pMainApp.SQL_cache.IMXPA_SelectService_AllService.header;
            data   = Comm.pMainApp.SQL_cache.IMXPA_SelectService_AllService.data;
        } catch(e) {
            header = null;
            data   = null;
        }

        if ( data != null && typeof(data) != 'undefined' ) {
            configServiceListOfUser(header, data );

        } else {
            WS.SQLExec({
                sql_file: 'IMXPA_SelectService_AllService.sql',
                bind : [{
                    name: 'id',
                    type: SQLBindType.STRING,
                    value: cfg.login.login_id
                }]
            }, function(header, data) {
                configServiceListOfUser(header, data);
            });
        }

        Ext.getCmp('login_select_service_form').focus();

    },


    /**
     * 서비스 선택
     */
    OK_Process: function(fieldCon) {

        if ( window._dynamicLoadCount > 0 ) {
            return setTimeout(function(a) {
                this.OK_Process(a);
            }.bind(this), 500, fieldCon);
        }

        console.debug('%c [ServiceList]  Check Resource load... Complete', 'color:blue;');

        var self = this;

        Comm.isFirstSelectService = false;

        // 서비스 변경시 서비스를 선택하지 않고 바로 화면을 보여주기 위해서
        // 선택된 서비스 정보를 세션에 저장한다.
        sessionStorage.setItem('Intermax_SelectedServiceInfo', JSON.stringify(Comm.selectedServiceInfo));

        var selectedServices = fieldCon.getCheckedValueArr();

        // 선택된 서비스가 없는 경우
        if (selectedServices.length === 0) {
            var serviceForm = Ext.getCmp('login_select_service_form');
            if (!Ext.isEmpty(serviceForm)) {
                serviceForm.setDisabled(false);
                serviceForm.el._clicked = false;
                serviceForm = null;

                Ext.Msg.show({
                    title : 'Warning',
                    msg : common.Util.TR('Please select Service.'),
                    width : 300,
                    buttons : Ext.Msg.OK,
                    icon : Ext.MessageBox.WARNING
                });
            }

            // 경고창이 표시된 경우에만 로딩마스크를 숨김처리함.
            self.loadingMask.hide();

            return;
        }
        localStorage.setItem('SelectedServiceId', selectedServices);

        if (String(localStorage.getItem('Intermax_DetailElapse')) === 'null') {
            localStorage.setItem('Intermax_DetailElapse', 1);
        }

        if (String(localStorage.getItem('Intermax_MyLanguage')) === 'null') {
            var local = common.Util.getLocalLang();

            localStorage.setItem('Intermax_MyLanguage', local);
            common.WebEnv.Save('Intermax_MyLanguage', local);
        } else {
            if (Comm.web_env_info.Intermax_MyLanguage &&
                Comm.web_env_info.Intermax_MyLanguage !== localStorage.getItem('Intermax_MyLanguage') ) {
                common.WebEnv.Save('Intermax_MyLanguage', localStorage.getItem('Intermax_MyLanguage'));
            }
        }

        if (String(localStorage.getItem('Intermax_MyRepository')) === 'null') {
            localStorage.setItem('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
        }
        common.WebEnv.Save('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);

        common.WebEnv.Save('Intermax_MyView', 'rtm.view.rtmView');

        // 실시간 화면에서 서비스 변경 시
        if (sessionStorage.getItem('Intermax_ServiceReconfigure')) {
            // 서비스 변경 시 메인화면을 표시하고 있는 경우 화면 전환이 느려서 비우고 진행
            $('.main-tab').empty();

            location.reload();
        } else {
            common.DataModule.afterSelectService(selectedServices, function() {
                $('#initImg').hide();

                if (this.target) {
                    this.target.continue_process();
                }

                // 서비스 목록 화면을 destroy 처리할 때 로딩마스크도 보이지 않게 되므로
                // 별도로 로딩 마스크를 숨김 처리하지 않음.

                if (this.up()) {
                    this.up().close();
                    this.destroy();
                } else {
                    this.destroy();
                }
            }.bind(this));
        }

    },

    /**
     * NonDB 인지 체크
     *
     * @param {string} serviceId - 서비스ID
     * @param {function} callback - 실행할 함수
     */
    checkNonDB: function (serviceId, callback) {
        window.isRemoteTree = true;
        window.isWebserver  = true;
        window.isTablespace = true;
        window.isConnectDB  = true;
        window.isIMXNonDB   = false;

        var self = this;

        try {
            WS.SQLExec({
                sql_file: 'IMXRT_NonDB.sql',
                bind: [{
                    name: 'service_id',
                    type: SQLBindType.INTEGER,
                    value: serviceId
                }]
            }, function(header, data) {
                var isDataOk = true;

                if (header.success === false) {
                    try {
                        console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message.split('\n')[0]);
                    } catch (e) {
                        console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message);
                    }
                    isDataOk = false;

                } else if (data == null) {
                    console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', 'Not enough data. (Result Data is null.)');
                    isDataOk = false;

                } else if (data.length < 4) {
                    console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', 'Not enough data. (Check Data Size: 4, Result Data Size: '+ data.length+')');
                    isDataOk = false;
                }

                if (isDataOk === false) {
                    self.loadingMask.hide();
                    if (Ext.getCmp('login_select_service_form') != null) {
                        Ext.getCmp('login_select_service_form').el._clicked = false;
                        Ext.getCmp('login_select_service_form').setDisabled(false);
                    }
                    Ext.Msg.show({
                        title : '',
                        msg : common.Util.TR('Failed to retrieve the data for this request.'),
                        width : 300,
                        buttons : Ext.Msg.OK,
                        icon : Ext.MessageBox.WARNING
                    });
                    return;
                }

                /* data[0].columns
                 * [0] was_id
                 * [1] db_id
                 * [2] monitorable
                 * [3] download_tablespace
                 */
                // 결과값이 없는 경우 NonDB
                if (data[0].rows && data[0].rows.length > 0) {
                    window.isIMXNonDB = false;
                } else {
                    window.isIMXNonDB = true;
                }
                //결과값이 있는 경우 Remote Tree를 표시하고 없는 경우 Remote Tree를 숨김
                if (!data[1].rows || data[1].rows.length <= 0) {
                    window.isRemoteTree = false;
                }

                // Webserver data 없는 경우Webserver Summary 숨김
                if (!data[2].rows || data[2].rows.length <= 0) {
                    window.isWebserver = false;
                }

                // WAS와 연결된 DB가 없는 경우 DB 관련 메뉴 숨김
                if (!data[3].rows || data[3].rows.length <= 0) {
                    window.isConnectDB = false;
                }

                // Tablespace Info data 없는 경우 Tablespace Usage 숨김
                if (!data[4].rows || data[4].rows.length <= 0) {
                    window.isTablespace = false;
                }
                callback();
            });
        } catch (e) {
            window.isIMXNonDB   = false;
            window.isRemoteTree = true;
            window.isWebserver  = true;
            callback();
        }
    },


    changeMonitoringService: function(fieldCon) {
        common.RTMDataManager.resetObjectData();

        if (realtime.txnPopupMonitorWindow) {
            realtime.txnPopupMonitorWindow.close();
        }

        var ix, ixLen;
        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            realtime.rtmPopupList[ix].obj.close();
        }

        var serviceName = this.fieldCon.getCheckedRow().name;
        $('.rtm-header-log #main-title-service:nth-child(3)').attr('title', serviceName);
        $('.rtm-header-log #main-title-service:nth-child(3)').text(Ext.String.ellipsis(serviceName, 14));

        Comm.isFirstSelectService = false;
        Comm.beforeTheme = Comm.web_env_info.Intermax_MyTheme;

        sessionStorage.removeItem('Intermax_ServiceReconfigure');
        sessionStorage.removeItem('Intermax_SelectedServiceInfo');

        var selectedServices = fieldCon.getCheckedValueArr();
        localStorage.setItem('SelectedServiceId', selectedServices);

        common.WebEnv.Save('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
        common.DataModule.init();

        Comm.selectedServiceInfo = this.fieldCon.getCheckedRow();
        Comm.callbackAfterSelectService = common.Util.openMyView;

        common.DataModule.afterSelectService(selectedServices);

        common.Util.destroyComponentWindow();

        Comm.RTComm.checkDisplayMenu();

        this.destroy();
    },

    /**
     * 서비스 변경
     */
    changeService: function() {
        Comm.selectedServiceInfo = JSON.parse(sessionStorage.getItem('Intermax_SelectedServiceInfo'));

        this.checkNonDB(Comm.selectedServiceInfo.id, function() {
            Comm.isFirstSelectService = false;

            sessionStorage.removeItem('Intermax_ServiceReconfigure');
            sessionStorage.removeItem('Intermax_SelectedServiceInfo');

            var selectedServices = localStorage.getItem('SelectedServiceId');

            common.DataModule.afterSelectService(selectedServices.split(','));

            $('#initImg').hide();

            if (this.target) {
                this.target.continue_process();
            }

            selectedServices = null;
        }.bind(this));
    },


    checkAutoSelectServiceByName: function(serviceName) {
        if (!serviceName) {
            return;
        }

        var ix, ixLen;
        var isChecked = false;

        for (ix = 0, ixLen = this.fieldCon.items.items.length; ix < ixLen; ix++) {

            if (this.fieldCon.items.items[ix].boxLabel.toLocaleLowerCase() === serviceName.toLocaleLowerCase()) {
                this.fieldCon.items.items[ix].setValue(true);
                isChecked = true;
            } else {
                this.fieldCon.items.items[ix].setValue(false);
            }

            if (isChecked) {
                document.getElementById('login_select_service_form').click();
            }
        }
    },


    checkSkipService: function() {

        if (this.fieldCon.items.items.length === 1 && this.fieldCon.getCheckedRow() == null) {
            this.fieldCon.query('checkbox')[0].setValue(true);
        }

        if (localStorage.getItem('Intermax_Observer_Execute') === 'true') {
            this.browserKey = localStorage.getItem('Intermax_BrowserKey');
            localStorage.setItem('Intermax_Observer_Continue', 'true');

            if (localStorage.getItem('Intermax_Observer_Open') === 'true' || localStorage.getItem('Intermax_Observer_Open') === 'OBSERVER') {
                localStorage.setItem('Intermax_Observer_Open', 'USER');
                document.getElementById('login_select_service_form').click();

            } else if (this.fieldCon.items.items.length === 1) {
                document.getElementById('login_select_service_form').click();
            }

            this.checkBrowserRestart();

        } else {
            if (this.fieldCon.items.items.length === 1) {
                document.getElementById('login_select_service_form').click();

            } else {
                var serviceName = localStorage.getItem('ImxConnectServiceName_External');
                localStorage.removeItem('ImxConnectServiceName_External');

                this.checkAutoSelectServiceByName(serviceName);
            }
        }
    },


    checkBrowserRestart: function() {
        if (this.restartTimeoutId != null) {
            clearTimeout(this.restartTimeoutId);
        }
        this.isContinue = true;

        if (this.browserKey != null && localStorage.getItem('Intermax_CloseKey') === this.browserKey) {
            this.isContinue = false;

            var alertMsg = document.createElement('div');
            alertMsg.className = 'observer-alert-message';
            document.body.appendChild(alertMsg);
            alertMsg.style.display = 'block';
            alertMsg.textContent = common.Util.TR('Restart the browser in order to optimize the screen.');

            setTimeout(function() {
                window.isDisableClosingMessage = true;
                alertMsg.style.display = 'none';

                try {
                    console.debug(' [Observer] Execute process of browser close.');
                    window.parent.close();
                } catch (e) {
                    console.debug(e.message);
                }
            }, 2000);
        }
        if (this.isContinue === true) {
            this.restartTimeoutId = setTimeout(this.checkBrowserRestart.bind(this), 1000*3);
        }
    },


    checkRepositoryInfoList: function() {
        if (Comm.repositoryInfo.length <= 0) {
            setTimeout(this.checkRepositoryInfoList.bind(this), 500);
        } else {

            this.reconfigRepository(function() {
                this.checkNonDB(Comm.selectedServiceInfo.id, function() {

                    if (this.isChangeMode) {
                        this.changeMonitoringService(this.fieldCon);
                    } else {
                        console.debug('%c [ServiceList]  Check Resource load...', 'color:#63A5E0;');
                        this.OK_Process(this.fieldCon);
                    }
                }.bind(this));
            }.bind(this));
        }
    },

    /**
     * Repository 구성이 여러개인지 체크, 정보를 재설정.
     * 여러개로 구성되어 있으면 화면에서 선택된 서비스에 해당하는 Repository로 재설정.
     */
    reconfigRepository: function(callback) {

        if (Comm.repositoryInfo && Comm.repositoryInfo.length > 2) {
            console.debug('%c [ServiceList]  Repository: Multi', 'color:blue;');
            console.debug('%c [ServiceList]  Multi Repository Checking...', 'color:#63A5E0;');

            var ix, ixLen;
            var repository;
            var repositoryNameByService = {};
            var repositoryInfoByName = {};
            var checkCount = 0;
            var isError = false;
            var key;

            var reconfig = function() {
                if (repositoryNameByService[Comm.selectedServiceInfo.id]) {
                    Comm.currentRepositoryInfo = repositoryNameByService[Comm.selectedServiceInfo.id];
                    var dbName = Comm.currentRepositoryInfo.database_name;

                    if (WS.defaultdb !== dbName) {
                        console.debug('%c [ServiceList]  Changed Repository Info', 'color:blue;', dbName);
                    }

                    Comm.isCompleteRepositoryConfig = true;
                    Comm.web_env_info.Intermax_MyRepository = dbName;
                    WS.defaultdb = dbName;
                    WS2.defaultdb = dbName;
                    localStorage.setItem('Intermax_MyRepository', dbName);
                }
            };

            var checkData = function(header, data) {
                checkCount++;

                if (header.success === false) {
                    try {
                        isError = true;
                        console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message.split('\n')[0]);
                    } catch (e) {
                        console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message);
                    }
                } else if (!data) {
                    isError = true;
                    console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message || header.error_message);

                } else {
                    for (var jx = 0; jx < data.rows.length; jx++) {
                        key = data.rows[jx][0];
                        repositoryNameByService[key] = repositoryInfoByName[header.database];
                    }
                }

                if (Comm.repositoryInfo.length - 2 === checkCount) {
                    console.debug('%c [ServiceList]  Multi Repository Checking... Complete', 'color:blue;');

                    if (isError) {
                        if (callback) {
                            callback();
                        }
                    } else {
                        reconfig();

                        if (callback) {
                            callback();
                        }
                    }
                }
            };

            for (ix = 0, ixLen = Comm.repositoryInfo.length; ix < ixLen; ix++) {
                repository = Comm.repositoryInfo[ix];

                if (repository.database_default === false && repository.database_name !== 'memory') {
                    repositoryInfoByName[repository.database_name] = repository;

                    WS.SQLExec({
                        sql_file: 'IMXRT_ServiceInfo.sql',
                        database: repository.database_name
                    }, checkData);
                }
            }
        } else {
            console.debug('%c [ServiceList]  Repository: Single', 'color:blue;');
            if (callback) {
                callback();
            }
        }
    },


    /**
     * 설정된 서비스 명을 자동으로 선택해서 진행되도록 처리.
     *
     * @param {string} serviceName
     */
    autoSelectServiceByService: function(serviceName) {
        if (serviceName) {
            this.checkAutoSelectServiceByName(serviceName);
        }
    },


    /**
     * WAS ID가 포함되어 있는 서비스를 자동으로 선택해서 진행되도록 처리.
     *
     * @param {string} wasId - WAS ID
     */
    autoSelectServiceByWAS: function(wasId) {

        if (wasId <= 0) {
            console.debug('%c [ServiceList] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'No WAS ID - ' + wasId);
            return;
        }

        WS.SQLExec({
            sql_file: 'IMXRT_ServiceInfoByWas.sql',
            replace_string: [{
                name: 'wasid', value: wasId
            }]
        }, function(header, data) {
            if (header.success === false) {
                try {
                    console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message.split('\n')[0]);
                } catch (e) {
                    console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message);
                }
            } else if (!data) {
                console.debug('%c [ServiceList] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', header.message || header.error_message);

            } else if (data.rows.length <= 0) {
                console.debug('%c [ServiceList] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'No Data - Service List By WAS ID');

            } else {
                var serviceName = data.rows[0][1];
                console.debug('%c [ServiceList]  Auto Selected Service Name: ', 'color:blue;', serviceName);
                this.checkAutoSelectServiceByName(serviceName);
            }
        }.bind(this));
    },


    sendUseRepositoryInfo: function() {
        realTimeWS.send({
            command: COMMAND.SET_TXN_FILTERS,
            data: ''
        });
    }

});


