Ext.define('Exem.AbstractSelectService', {
    extend: 'Exem.Window',

    title   : 'Select Service',
    height  : 400,
    width   : 250,
    layout  : 'fit',
    modal   : true,
    draggable: false,
    reconfigure: false,
    closable : false,

    init: function() {},

    // 웹소켓 open 되면 전체 서비스들을 체크박스 리스트로 표시.
    // storeId에게 선택한 서버 리스트를 ondata 이벤트로 반환.
    // 결과 포맷 : {1, server_id_1 : 2, 'server_name_1'},
    //             {1, server_id_2 : 2, 'server_name_2'},
    //             ...
    createServiceListForm: function() {
        var me = this;

        var fieldCon = Ext.create('Exem.FieldContainer', {
            itemId       : 'serviceCheckboxContainer',
            defaultType  : 'checkboxfield',
            padding      : '10 10 10 10',
            selectionMode: 'single'
        });

        var form = Ext.create('Exem.FormPanel', {
            layout     : 'fit',
            listeners  : {
                ondata : function(data) {
                    fieldCon.addRecords('Checkbox', data.rows);

                    var allCheckbox = fieldCon.query('checkbox');
                    for( var i in allCheckbox ) {
                        if( allCheckbox[i].inputValue == localStorage.getItem('SelectedServiceId') ) {
                            allCheckbox[i].setValue(true);
                        }
                    }

                    if( String(localStorage.getItem('SelectedServiceId')) !== 'null' ) {
                        setTimeout(function() {
                            if( Comm.isFirstSelectService )
                                Ext.getCmp('serviceOkBtn').fireEvent('click');
                        }, 500);
                    }
                }
            },
            bbar: [{
                text    : common.Util.TR('Ok'),
                xtype   : 'button',
                id      : 'serviceOkBtn',
                listeners: {
                    click : function() {
                        Comm.isFirstSelectService = false;

                        Comm.selectedServiceInfo = fieldCon.getCheckedRow();
                        var selectedServices = fieldCon.getCheckedValueArr();
                        if (selectedServices.length === 0) {
                            Ext.Msg.show({
                                title : 'Warning',
                                msg : common.Util.TR('Please select Service.'),
                                width : 300,
                                buttons : Ext.Msg.OK,
                                icon : Ext.window.MessageBox.WARNING
                            });
                            return;
                        }
                        localStorage.setItem('SelectedServiceId', selectedServices);

                        if (String(localStorage.getItem('Intermax_MyLanguage')) === 'null') {
                            localStorage.setItem('Intermax_MyLanguage', 'en');
                        }

                        if (String(localStorage.getItem('Intermax_MyRepository')) === 'null') {
                            localStorage.setItem('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
                        }

                        if (String(localStorage.getItem('Intermax_MyView')) === 'null') {
                            var tmp = document.URL.split('/');

                            var result = 'rtm.view.rtmView';
                            for (var ix = 0; ix < tmp.length; ix++) {
                                if (tmp[ix].toUpperCase() === 'PA') {
                                    result = 'view.PerformanceTrend';
                                    break;
                                }
                            }
                            localStorage.setItem('Intermax_MyView', result);
                        }

                        if (me.reconfigure)
                            location.reload();

                        me.reconfigure = true;
                        common.DataModule.afterSelectService(selectedServices);
                    }
                }
            }, {
                text    : common.Util.TR('Config WebSocket'),
                xtype   : 'button',
                handler : function() {
                    me.configWS();
                }
            }]
        });
        form.add(fieldCon);

        return form;
    },

    configWS: function() {
        var setWSWindow = Ext.create('Exem.Window', {
            title    : common.Util.TR('Configure WebSocket Address'),
            height   : 85,
            width    : 300,
            layout   : 'fit',
            modal    : true,
            draggable: false,
            closable : true
        });
        var form = Ext.create('Exem.FormPanel', {
            layout          : 'fit',
            items: [{
                xtype       : 'textfield',
                itemId      : 'address',
                fieldLabel  : common.Util.TR('Address(IP:Port) '),
                value       : document.location.host
            }],
            bbar: [{
                text    : common.Util.TR('Ok'),
                xtype   : 'button',
                handler : function() {
                    localStorage.setItem('SelectedServiceId', null);

                    location.reload();
                }
            }]
        });
        setWSWindow.add(form);
        setWSWindow.show();
    }
});
