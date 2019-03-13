Ext.application({
    name: 'IntermaxObserver',
    appFolder: location.pathname.split('/')[1],

    launch: function() {

        var imxObserver;
        var ImxObserverLaunch = function() {

            this.timeoutId = {
                browserRepeat : null,
                showMessage   : null
            };

            this.repeatTime    = 1000*10; // 10 Second
            this.isOpenProcess = false;

            this.beforeBrowserKey = null;

            this.changeLog = {
                hour   : false,
                minute : false,
                execute: false
            },

            this.timeType = {
                SEC  : 1000,
                MIN  : 1000*60,
                HOUR : 1000*60*60,
                DAY  : 1000*60*60+24
            },

            this.repeatOption = {
                enable : false,
                time   : this.timeType.MIN * 1
            };

            this.imxRebootTime = {
                hour      : 0,
                min       : 0,
                startDate : null,
                current   : null
            };

            this.imxOpenLink = null;

            this.storageKeys = {
                EXECUTE         : 'Intermax_Observer_Execute',
                CLOSE_KEY       : 'Intermax_CloseKey',
                BROWSER_KEY     : 'Intermax_BrowserKey',
                OPEN_STATUS     : 'Intermax_Observer_Open',
                CONTINUE_STATUS : 'Intermax_Observer_Continue',
                LOGIN_STATUS    : 'Intermax_login',

                SET_TIME        : 'Intermax_Restart_Time'
            };

            this.guideInfoMessage = common.Util.TR('To a set time, and it can be configured to restart the InterMAX real time dashboards.');

            this.initProperty();
            this.initBase();
            this.initJumpLink();

            this.checkBlockURL(function() {

                this.initBrowser();
                this.initConfigForm();

                this.configWinForm.show();
            }.bind(this));
        };

        ImxObserverLaunch.prototype.initBase = function() {
            document.body.style.overflowX = 'hidden';

            var imgDiv = document.createElement('img');
            imgDiv.id = 'imxObserverBackImage';
            imgDiv.src = '../images/loginLeft_bg.png';

            document.body.appendChild(imgDiv);
            imgDiv.style.position = 'absolute';
            imgDiv.style.width = '101%';
            imgDiv.style.height = '100%';
            imgDiv.style.top = '0px';
            imgDiv.style.left = '0px';
            imgDiv.style.border = '0px';

            var logoDiv = document.createElement('div');
            logoDiv.style.position = 'absolute';
            logoDiv.style.top = '60px';
            logoDiv.style.left = '80px';
            logoDiv.style.width = '288px';
            logoDiv.style.height = '73px';
            logoDiv.style.backgroundImage = 'url(../images/login_logo_intermax.png)';
            document.body.appendChild(logoDiv);

            var symbolDiv = document.createElement('div');
            symbolDiv.style.position = 'absolute';
            symbolDiv.style.top = '35%';
            symbolDiv.style.left = '220px';
            symbolDiv.style.width = '113px';
            symbolDiv.style.height = '116px';
            symbolDiv.style.backgroundImage = 'url(../images/login_symbol_logo.png)';
            document.body.appendChild(symbolDiv);

        };

        /**
         * 옵션 값 설정
         */
        ImxObserverLaunch.prototype.initProperty = function() {
            var checkTime = localStorage.getItem(this.storageKeys.SET_TIME);
            if (checkTime != null) {
                var values = checkTime.split(':');

                if (values.length === 2) {
                    this.imxRebootTime.hour = +values[0];
                    this.imxRebootTime.min = +values[1];
                }
            }
        };

        /**
         * 재시작 여부 및 시작 시간을 설정하는 화면
         */
        ImxObserverLaunch.prototype.initConfigForm = function() {

            this.configWinForm = Ext.create('Ext.window.Window', {
                title    : common.Util.TR('Browser Restart Configuration'),
                layout   : 'hbox',
                width    : 600,
                height   : 200,
                closable : false,
                resizable: false,
                constrain: true,
                draggable: false,
                cls      : 'observerConfigWin',
                padding  : '0 10 10 10',
                header   : {
                    height: 35,
                    padding: '12 10 10 10'
                }
            });

            var left = Ext.create('Ext.container.Container', {
                layout: 'absolute',
                itemId: 'restartSetting_title',
                width : 200,
                height: '100%',
                style: { background: '#eeeeee' },
                margin: '10 0 0 0',
                items:[{
                    xtype: 'label',
                    x: 5,
                    y: 20,
                    width: 180,
                    style: 'text-align:left;',
                    html : this.guideInfoMessage
                }]
            });

            var right = Ext.create('Ext.container.Container', {
                layout: 'absolute',
                itemId: 'restartSetting_body',
                height: '100%',
                style : { background: '#ffffff' }
            });

            var ix;
            var hourData = [];
            for (ix = 0; ix < 24; ix++) {
                hourData.push({'1': ix, '2': ix});
            }
            var hourStore = Ext.create('Ext.data.ArrayStore', {
                proxy  :  {
                    type     : 'memory',
                    reader   : {
                        type : 'json'
                    }
                },
                fields: [{name: '1'}, {name: '2'}],
                data  : hourData
            });

            var minData = [];
            for (ix = 0; ix <= 11; ix++) {
                minData.push({'1': ix*5, '2': ix*5});
            }
            var minStore = Ext.create('Ext.data.ArrayStore', {
                proxy  :  {
                    type     : 'memory',
                    reader   : {
                        type : 'json'
                    }
                },
                fields: [{name: '1'}, {name: '2'}],
                data  : minData
            });

            var hourCombo = Ext.create('Ext.form.field.ComboBox', {
                width: 60,
                height: 22,
                margin: '0 10 0 0',
                itemId : 'hourCombo',
                editable: false,
                valueField: '1',
                displayField: '2',
                disabled: (localStorage.getItem(this.storageKeys.EXECUTE) !== 'true'),
                x: 15,
                y: 102,
                store : hourStore,
                value: this.imxRebootTime.hour,
                listeners: {
                    scope : this,
                    change: function() {
                        var newVal = arguments[1];
                        if (newVal != this.imxRebootTime.hour) {
                            this.changeLog.hour = true;
                        } else {
                            this.changeLog.hour = false;
                        }
                        this.checkChangeValue();
                    }
                }
            });

            var minCombo = Ext.create('Ext.form.field.ComboBox', {
                width: 60,
                height: 22,
                margin: '0 10 0 0',
                itemId : 'minuteCombo',
                editable: false,
                valueField: '1',
                displayField: '2',
                disabled: (localStorage.getItem(this.storageKeys.EXECUTE) !== 'true'),
                x: 15,
                y: 102,
                store : minStore,
                value: this.imxRebootTime.min,
                listeners: {
                    scope : this,
                    change: function(mCombo, newVal) {
                        if (newVal != this.imxRebootTime.min) {
                            this.changeLog.minute = true;
                        } else {
                            this.changeLog.minute = false;
                        }
                        this.checkChangeValue();
                    }
                }
            });

            var checkboxOn = Ext.create('Ext.form.field.Checkbox', {
                itemId:'onCheckbox',
                labelSeparator: '',
                boxLabel: common.Util.TR('ON'),
                width   : 50,
                disabled: false,
                checked : (localStorage.getItem(this.storageKeys.EXECUTE) === 'true'),
                listeners: {
                    scope: this,
                    change: function(f, nval) {
                        if (nval === true) {
                            this.configWinForm.down('#offCheckbox').setValue(false);
                            this.configWinForm.down('#hourCombo').setDisabled(false);
                            this.configWinForm.down('#minuteCombo').setDisabled(false);
                        }

                        if (nval !== (localStorage.getItem(this.storageKeys.EXECUTE) === 'true')) {
                            this.changeLog.execute = true;
                        } else {
                            this.changeLog.execute = false;
                        }

                        this.checkChangeValue();
                    }
                }
            });

            var checkboxOff = Ext.create('Ext.form.field.Checkbox', {
                itemId:'offCheckbox',
                labelSeparator: '',
                boxLabel: common.Util.TR('OFF'),
                width   : 50,
                disabled: false,
                checked : (localStorage.getItem(this.storageKeys.EXECUTE) !== 'true'),
                listeners: {
                    scope: this,
                    change: function() {
                        var nval = arguments[1];

                        if (nval === true) {
                            this.configWinForm.down('#onCheckbox').setValue(false);
                            this.configWinForm.down('#hourCombo').setDisabled(true);
                            this.configWinForm.down('#minuteCombo').setDisabled(true);
                        }
                    }
                }
            });

            var configField = Ext.create('Ext.form.FieldSet', {
                x: 10,
                y: 15,
                border: false,
                items: [{
                    xtype : 'fieldcontainer',
                    layout: 'hbox',
                    margin: '0 0 0 0',
                    items : [checkboxOn, checkboxOff]
                }, {
                    xtype : 'fieldcontainer',
                    layout: 'hbox',
                    margin: '20 0 20 0',
                    items : [hourCombo,
                    {
                        xtype: 'label',
                        margin: '2 0 0 0',
                        width: 40,
                        text: common.Util.TR('Hour')
                    }, minCombo, {
                        xtype: 'label',
                        margin: '2 0 0 0',
                        width: 40,
                        text: common.Util.TR('Minute')
                    }]
                },{
                    xtype : 'button',
                    text  : common.Util.TR('Apply'),
                    itemId: 'changeBtn',
                    width : 100,
                    height: 22,
                    margin: '0 0 0 0',
                    disabled: true,
                    handler: function() {
                        var time = this.configWinForm.down('#hourCombo').getValue();
                        var minute = this.configWinForm.down('#minuteCombo').getValue();
                        var isOn = this.configWinForm.down('#onCheckbox').getValue();

                        localStorage.setItem(this.storageKeys.EXECUTE, isOn);
                        localStorage.setItem(this.storageKeys.SET_TIME, time+':'+minute);
                        this.imxRebootTime.hour = +time;
                        this.imxRebootTime.min = +minute;

                        localStorage.removeItem(this.storageKeys.CLOSE_KEY);

                        if (this.timeoutId.showMessage != null) {
                            clearTimeout(this.timeoutId.showMessage);
                        }
                        this.configWinForm.down('#saveMessage').setVisible(true);
                        this.configWinForm.down('#changeBtn').setDisabled(true);

                        this.timeoutId.showMessage = setTimeout(function() {
                            this.configWinForm.down('#saveMessage').setVisible(false);
                        }.bind(this), 1000);

                    }.bind(this)
                },{
                    xtype: 'label',
                    itemId: 'saveMessage',
                    margin: '10 0 0 10',
                    width: 180,
                    hidden: true,
                    style: 'text-align:left;color:red;',
                    html: common.Util.TR('Change Success')
                }]
            });

            right.add(configField);

            this.configWinForm.add(left, right);
        };

        /**
         * 브라우저 재시작시 열리는 화면 설정
         */
        ImxObserverLaunch.prototype.initJumpLink = function() {
            this.imxOpenLink = document.createElement('a');
            this.openURL = location.pathname.split('/').splice(0, location.pathname.split('/').length-1).join('/');

            document.body.appendChild(this.imxOpenLink);
            this.imxOpenLink.id = 'jumpURL';
            this.imxOpenLink.rel = 'noreferrer';
            this.imxOpenLink.target = 'New_Open_Restart_Browser';
            this.imxOpenLink.href = this.openURL;

            window.addEventListener('beforeunload', function(e) {
                e.preventDefault();
                localStorage.removeItem(imxObserver.storageKeys.CLOSE_KEY);
                localStorage.removeItem(imxObserver.storageKeys.BROWSER_KEY);
                localStorage.removeItem(imxObserver.storageKeys.OPEN_STATUS);
                localStorage.removeItem(imxObserver.storageKeys.CONTINUE_STATUS);

                if (imxObserver.timeoutId.browserRepeat != null) {
                    clearTimeout(imxObserver.timeoutId.browserRepeat);
                }
            }, false);
        };

        /**
         * 브라우저 재시작 여부 체크, 실행
         */
        ImxObserverLaunch.prototype.initBrowser = function() {
            if (this.timeoutId.browserRepeat != null) {
                clearTimeout(this.timeoutId.browserRepeat);
            }

            if (localStorage.getItem(this.storageKeys.EXECUTE) !== 'true') {
                return;
            }

            this.imxRebootTime.current = new Date();
            this.isOpenProcess = false;
            this.waitTime = 3000;

            if (this.checktStart()) {
                this.isOpenProcess = true;
                this.waitTime = 10;
                localStorage.removeItem(this.storageKeys.CLOSE_KEY);
                this.imxRebootTime.beforeBrowserKey = +new Date();
                localStorage.setItem(this.storageKeys.BROWSER_KEY, this.imxRebootTime.beforeBrowserKey);

            } else if (this.checkRepeatType() || this.checkScheduleType()) {
                this.isOpenProcess = true;
                localStorage.setItem(this.storageKeys.CLOSE_KEY, this.imxRebootTime.beforeBrowserKey);
                this.imxRebootTime.beforeBrowserKey = +new Date();
                localStorage.setItem(this.storageKeys.BROWSER_KEY, this.imxRebootTime.beforeBrowserKey);

            } else {
                localStorage.removeItem(this.storageKeys.CLOSE_KEY);
            }

            if (this.isOpenProcess === true) {

                setTimeout(function() {
                    localStorage.removeItem(this.storageKeys.CONTINUE_STATUS);
                    localStorage.setItem(this.storageKeys.OPEN_STATUS, 'OBSERVER');
                    this.imxOpenLink.click();

                    this.imxRebootTime.startDate = +this.imxRebootTime.current;
                    this.imxRebootTime.current = null;

                    console.debug('%c Restart Time: '+new Date(), 'color:#FFF;background-color:#30333A;font-size:12px;');
                }.bind(this), this.waitTime);
            }

            this.timeoutId.browserRepeat = setTimeout( this.initBrowser.bind(this), this.repeatTime);
        };

        /**
         * 초기 화면 시작 여부 체크
         */
        ImxObserverLaunch.prototype.checkChangeValue = function() {

            if (this.changeLog.hour === true || this.changeLog.minute === true || this.changeLog.execute) {
                this.configWinForm.down('#changeBtn').setDisabled(false);
            } else {
                this.configWinForm.down('#changeBtn').setDisabled(true);
            }
        };

        /**
         * 초기 화면 시작 여부 체크
         */
        ImxObserverLaunch.prototype.checktStart = function() {
            var isGo = false;

            if ((localStorage.getItem(this.storageKeys.EXECUTE) === 'true') &&
                this.imxRebootTime.startDate == null) {
                isGo = true;
            }

            return isGo;
        };

        /**
         * 지정된 간격으로 재시작 여부를 체크
         */
        ImxObserverLaunch.prototype.checkRepeatType = function() {
            var isGo = false;
            isGo =
                (localStorage.getItem(this.storageKeys.EXECUTE) === 'true') &&
                this.repeatOption.enable === true &&
                (+this.imxRebootTime.current - +this.imxRebootTime.startDate > this.repeatOption.time) &&
                (localStorage.getItem(this.storageKeys.LOGIN_STATUS) == 'true' && localStorage.getItem(this.storageKeys.CONTINUE_STATUS) == 'true');

            return isGo;
        };

        /**
         * 지정된 시간에 재시작 여부를 체크
         */
        ImxObserverLaunch.prototype.checkScheduleType = function() {
            var isGo = false;
            isGo =
                (localStorage.getItem(this.storageKeys.EXECUTE) === 'true') &&
                this.repeatOption.enable === false &&
                (+this.imxRebootTime.current - +this.imxRebootTime.startDate > 80000) &&
                this.imxRebootTime.current.getHours() == this.imxRebootTime.hour &&
                this.imxRebootTime.current.getMinutes() == this.imxRebootTime.min &&
                (localStorage.getItem(this.storageKeys.LOGIN_STATUS) == 'true' && localStorage.getItem(this.storageKeys.CONTINUE_STATUS) == 'true');

            return isGo;
        };

        /**
         * 재시작하는 화면이 팝업 차단되어 있는지 확인
         */
        ImxObserverLaunch.prototype.checkBlockURL = function(callback) {
            setTimeout(function() {
                var popup = window.open('about:blank', '');
                if (popup == null) {
                    Ext.MessageBox.show({
                        title: '',
                        message: common.Util.TR('Pop-up blocked'), //+ '<p>URL: '+location.origin,
                        modal: false,
                        cls  : 'popup-message',
                        buttons: Ext.Msg.OK
                    });
                } else {
                    popup.close();
                    if (callback != null) {
                        callback();
                    }
                }
            }.bind(this), 50);
        };

        imxObserver = new ImxObserverLaunch();

    }
});
