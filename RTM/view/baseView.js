/**
 * Created by Administrator on 2014-05-19.
 */
Ext.define('view.baseView', {
    extend        : 'Exem.Form',
    layout        : 'border',
    height        : '100%',
    width         : '100%',
    border        : false,
    changeView    : true,  // 화면을 저장할 수 있는 뷰 버튼
    header        : null,
    visibleHeader : true,  // instance list visible
    body          : null,
    isDockBody    : true,  // docking or container
    viewName      : '',
    dockSite      : null,
    interval      : 3000,
    keyNameList   : null,
    saveItemCount : 6,

    constructor: function() {
        var self = this;
        self.callParent(arguments);
        self.imageList = [];
        self.imageName = [];
        self.keyNameList = [];

        self.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        // 공통 부분 ----------------------------------------------------------------------------


        // 하단 왼쪽 화면 잠금 체크박스 ----------------------------------------------------------
        self.frameLockArea = Ext.create('Ext.container.Container',{
            width: '400',
            height: 24,
            margin: '0 0 0 0',
            layout: 'hbox',
            hidden: true
        });

        self.lockCkBox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel : common.Util.TR('Frame Lock'),
            width    : 120,
            checked  : false,
            cls      : 'rtm-framelock-area',
            listeners: {
                scope : this,
                change: function(checkBox, nv) {
                    console.clear();
                    var lock_frame;

                    window.isLockRTMFrame = nv;
                    switch(window.rtmMonitorType) {
                        case 'WAS':
                            lock_frame = 'rtm_frame_lock';
                            break;
                        case 'TP':
                            lock_frame = 'rtm_tp_frame_lock';
                            break;
                        case 'TUX':
                            lock_frame = 'rtm_tux_frame_lock';
                            break;
                        case 'CD':
                            lock_frame = 'rtm_cd_frame_lock';
                            break;
                        case 'WEB':
                            lock_frame = 'rtm_web_frame_lock';
                            break;
                        case 'E2E':
                            lock_frame = 'rtm_e2e_frame_lock';
                            break;
                        default:
                            break;
                    }
                    common.WebEnv.Save(lock_frame, nv);
                }
            }
        });

        // self.datePicker = Ext.create('Exem.DatePicker',{
        //     width           : 150,
        //     DisplayTime     : DisplayTimeMode.HM,
        //     cls             : 'Exem-DatePicker',
        //     singleField     : true,
        //     comparisionMode : true,
        //     setRightCalPos  : true,
        //     toFieldEditable  : false,  //readonly기능
        //     onCalenderValidFn : function() {
        //         this.diffDay = this.datePicker.pickerUI.dateField.mainFromField.getValue();
        //         // this.refreshChartData();
        //     }.bind(this)
        // });

        // 하단 왼쪽 영역 ----------------------------------------------------------
        self.frameLockArea.add(self.lockCkBox);
        // self.frameLockArea.add(self.datePicker);

        self.createPreview();

        self.centerLog = Ext.create( 'Ext.container.Container',{
            height : 25,
            flex   : 1,
            margin : '0 0 0 15',
            style: {
                borderRight: '0px solid rgba(190, 190, 190, .3)',
                borderLeft : '0px solid rgba(190, 190, 190, .3)'
            }
        });

        self.bottomArea = Ext.create( 'Ext.container.Container', {
            layout : {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            cls    : 'base-bottom-area',
            width  : '100%',
            height : 30,
            items  : [
                {
                    xtype : 'tbspacer',
                    width : 15
                },
                self.frameLockArea,
                self.centerLog,
                self.activityViews,
                self.changeViews
            ]
        });

        // 공통 부분 ---------------------------------------------------------------------------- END

        // header
        self.header = Ext.create( 'Ext.container.Container', {
            layout : {
                type : 'vbox',
                align: 'center'

            },
            width  : '100%',
            height : 5,
            hidden : !self.visibleHeader
        });

        self.body = Ext.create('Ext.container.Container', {
            width: '100%',
            flex: 1,
            cls : 'base-center-area',
            layout: {
                type : 'fit'
            },
            margin : '0 0 5 0',
            style : {
                borderRadius : '5px'
            }
        });

        var backContainer = Ext.create('Ext.container.Container',{
            region : 'center',
            layout : 'vbox',
            flex   : 1,
            cls    : 'base-center-basearea',
            margin : this.baseMargin,
            style  : this.baseViewCenterStyle
        });

        backContainer.add([self.header, self.body, self.bottomArea]);

        this.add(backContainer);

        // 에이전트 검색하는 텍스트 박스
        if (common.Menu.useSearchAgent) {
            self.searchBoxCon = Ext.create('Exem.TextField', {
                width: '100%',
                value: '',
                style: 'padding: 7px; border-bottom: 1px solid #50555C',
                fieldLabel: common.Util.TR('Agent name'),
                fieldCls: 'search-agent',
                labelWidth: 80,
                labelStyle: 'text-align: center; color: #ABAEB5',
                inputWrapCls: '',
                triggerWrapCls: '',
                listeners: {
                    specialkey: function(me, e) {
                        if (e.getKey() === e.ENTER) {
                            if (me.value.length) {
                                self.menuBarGroup.searchAgentList(me.value);
                            } else {
                                self.setMenuGroupList();
                            }
                            self.menuBarGroup.selectAgentList();
                        }
                    }
                }
            });
        }
    },

    createPreview: function() {
        this.activityViews = Ext.create( 'Ext.container.Container', {
            layout : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            cls    : 'view-baseView-bottom-preview-button',
            width  : 100,
            height : 25,
            hidden : true,
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('Activity View'),
                width : 90,
                height: 20,
                margin: '0 0 0 0',
                style : 'paddingLeft: 0px',
                listeners: {
                    scope: this,
                    click: function() {
                    }
                }
            }]
        });

        this.changeViews = Ext.create( 'Ext.container.Container', {
            layout : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            cls    : 'view-baseView-bottom-preview-button',
            width  : 200,
            height : 25,
            disabled : true,
            items  : [
                {
                    xtype : 'button',
                    text  : common.Util.TR('Default View'),
                    width : 80,
                    height: 20,
                    margin: '0 6 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(0);
                        }
                    }

                },
                {
                    xtype : 'button',
                    itemId: 'b1',
                    text  : '1',
                    width : 15,
                    height: 20,
                    margin: '0 4 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(1);
                        }
                    }

                },
                {
                    xtype : 'button',
                    text  : '2',
                    itemId: 'b2',
                    width : 15,
                    height: 20,
                    margin: '0 4 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(2);
                        }
                    }

                },
                {
                    xtype : 'button',
                    text  : '3',
                    itemId: 'b3',
                    width : 15,
                    height: 20,
                    margin: '0 4 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(3);
                        }
                    }

                },
                {
                    xtype : 'button',
                    text  : '4',
                    itemId: 'b4',
                    width : 15,
                    height: 20,
                    margin: '0 4 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(4);
                        }
                    }

                },
                {
                    xtype : 'button',
                    text  : '5',
                    itemId: 'b5',
                    width : 15,
                    height: 20,
                    margin: '0 4 0 0',
                    style : 'paddingLeft: 0px',
                    listeners: {
                        scope: this,
                        click: function() {
                            this.$saveScreen.show();
                            this._selectImageView(5);
                        }
                    }

                }
            ]

        });
    },

    setFrameLock: function(val) {
        // this.lockCkBox.setValue(val);
    },

    _getImageList : function() {
        var imageData, imageName;
        var key;
        var envKeys = Object.keys(Comm.web_env_info);

        for (var ix = 0; ix < envKeys.length; ix++) {
            key = envKeys[ix];

            if (key.indexOf('\@IMG\@') > -1 && key.indexOf(this.$className) !== -1) {
                imageData = JSON.parse(Comm.web_env_info[key]);
                imageName = imageData.section;

                this.imageList[imageData.data.Index] = imageData.data.Image;
                this.keyNameList[imageData.data.Index] = imageName.replace('@IMG@' + this.$className + '_' , '');
            }
        }

        this.createSaveScreen();
        this.setPreviewMouseEvent();
        this.setPreviewChangeEvent();

        this.changeViews.setDisabled(false);


        var index = Comm.web_env_info['xm-dock-save-' + this.$className] || 0;
        if (index >= 0) {
            this.selectedPreView = this.changeViews.items.items[index];
            if (this.selectedPreView) {
                this.selectedPreView.addCls('active');
            }
        }

        var subTitle;
        if (this.keyNameList.length > 0 && this.keyNameList.length > index) {
            subTitle = this.keyNameList[index];
        }
        this._setTabSubTitle(subTitle);

        envKeys   = null;
        imageData = null;
        imageName = null;
    },


    createSaveScreen: function() {
        var ix;
        var ixLen = this.saveItemCount;
        var image = null;
        var el =
            '<div class="save-screen-wrap">'+
                '<div class="save-screen-loading" style="display:none;position:absolute;width:900px;height:530px;overflow:hidden;right:7px;bottom:5px;border-radius:6px;border:7px solid #000;box-shadow:2px 2px 2px #000;background-color:rgba(0, 0, 0, 0.5);z-index: 999;">'+
                '</div>'+
                '<div id="save-screen-'+Ext.id()+'" class="save-screen" style="position: absolute;width: 900px;height: 530px;overflow: hidden; right: 7px;bottom: 6px;">'+
                    '<div class="save-screen-title">'+common.Util.TR('Preview')+' ['+
                        '<span class="save-screen-title-number"></span>]'+
                        '<div class="save-screen-title-close">'+
                            '<a href="" ></a>'+
                        '</div>'+
                    '</div>'+
                    '<div class="save-screen-content">'+
                        '<div class="save-screen-content-wrap">'+
                        '<div class="save-screen-image-wrap" data-index="0">';
                    for(ix = 0; ix < ixLen; ix++){
                        if(ix === 0){
                            image = this.defaultView;
                        }else{
                            image = this.imageList[ix] || '';
                        }
        el +=
                                  '<img class="save-screen-image" src="' + image + '" alt="' + common.Util.TR('No Image. Please Save Screen...') + '"/>';
                    }
        el +=
                       '</div>'+
                       '</div>'+
                       '<div class="save-screen-navigation-wrap">'+
                           '<ul class="save-screen-navigation">';
                           for(ix =  0; ix < ixLen; ix++){
                               el+= '<li data-index="' + ix + '" data-keyname="' + (this.keyNameList[ix] || '' )+ '"></li>';
                           }
        el +=
                           '</ul>'+
                       '</div>'+
                       '<div class="save-screen-navi perv" data-index="0"></div>'+
                       '<div class="save-screen-navi next"></div>'+
                   '</div>'+
                   '<div class="save-screen-bottom">'+
                       '<div class="save-screen-controll-wrap">'+
                           '<a href="" class="save-screen-cancel">' + common.Util.TR('CANCEL') + '</a>'+
                           '<a href="" class="save-screen-delete">' + common.Util.TR('DELETE') + '</a>'+
                           '<a href="" class="save-screen-load">' + common.Util.TR('LOAD') + '</a>'+
                           '<a href="" class="save-screen-save">' + common.Util.TR('SAVE') + '</a>'+
                           '<div class="save-screen-text-wrap">'+
                               '<input class="save-screen-text" type="text"/>'+
                           '</div>'+
                       '</div>'+
                   '</div>'+
                '</div>'+
            '</div>';

        this.$saveScreen = $(el).on('click', function(e){
            e.stopPropagation();
            $(this).hide();
        });

        $('body').append(this.$saveScreen);
    },


    /**
     * 미리보기 화면에 마우스 오버 및 클릭 이벤트 추가
     */
    setPreviewMouseEvent: function() {
        this.$saveScreen.find('.save-screen').on('click', function(e){
            e.stopPropagation();
        });

        // 타이틀 X 버튼 클릭 이벤트
        this.$saveScreen.find('.save-screen-title a').on('click', function(e){
            e.preventDefault();
            this.$saveScreen.hide();
        }.bind(this));

        // 컨텐츠 마우스 오버, 아웃 이벤트
        this.$saveScreen.find('.save-screen-content').hover(function(e){
            e.preventDefault();
            $(this).find('.save-screen-navi').show();

        }, function(e){
            e.preventDefault();
            $(this).find('.save-screen-navi').hide();

        }).find('.save-screen-navi').on('click', function(e){
            e.stopPropagation();
            // 컨텐츠 영역 마우스 오버 시 보여지는 prev, next 버튼 클릭 이벤트
            var index = +this.$saveScreen.find('.save-screen-image-wrap').data('index');
            if (e.target.className.indexOf('next') > -1) {
                if (index === 8) {
                    return;
                }
                ++index;
            } else {
                if (index === 0) {
                    return;
                }
                --index;
            }
            this.$saveScreen.find('.save-screen-navigation li').eq(index).click();
        }.bind(this));

        // 컨텐츠 만큼 생기는 동그란 네비게이션 클릭 이벤트
        this.$saveScreen.find('.save-screen-navigation li').on('click', function(e){
            e.stopPropagation();
            var $self = $(this);
            var $content = $self.parent().parent().parent();
            var $bottom = $content.parent().find('.save-screen-controll-wrap');
            var $imageView = $content.find('.save-screen-image-wrap');
            var $title = $content.siblings('.save-screen-title').find('.save-screen-title-number');
            var index = +$self.data('index');

            $imageView.stop();

            // defalut 화면에서는 save, delete 하지 못한다.
            if (index === 0) {
                $bottom.find('.save-screen-load').show();
                $bottom.find('.save-screen-text-wrap').hide();
                $bottom.find('.save-screen-save').hide();
                $bottom.find('.save-screen-delete').hide();
            } else {
                $bottom.find('.save-screen-text-wrap').show();
                $bottom.find('.save-screen-save').show();

                if ('' === $self.data('keyname')) {
                    $bottom.find('.save-screen-load').hide();
                    $bottom.find('.save-screen-delete').hide();
                } else {
                    $bottom.find('.save-screen-load').show();
                    $bottom.find('.save-screen-delete').show();
                }
            }

            $imageView.animate({
                left: index * -840
            }, 400);

            $imageView.data('index', index);
            $title.text(index || common.Util.TR('Default'));
            $self.siblings().removeClass('active');
            $self.addClass('active');
            $bottom.find('.save-screen-text').val($self.data('keyname'));
        });
    },


    /**
     * 미리보기 화면에 저장, 로드, 삭제 이벤트 추가
     */
    setPreviewChangeEvent: function() {

        var title;
        // 하단 save, load, delete, cancel 클릭 이벤트
        this.$saveScreen.find('.save-screen-controll-wrap').find('.save-screen-cancel').on('click', function(e) {
            e.preventDefault();
            this.$saveScreen.hide();

        }.bind(this)).end().find('.save-screen-save').on('click', function(e) {
            e.stopPropagation();
            // save
            e.preventDefault();

            this.$saveScreen.find('.save-screen-loading').show();
            this.changeViews.setDisabled(true);
            this.activityViews.setDisabled(true);

            title = this.$saveScreen.find('input').val();

            if (title === '') {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter a name to be saved.'), Ext.Msg.OK, Ext.MessageBox.WARNING, function() {
                    this.$saveScreen.find('input').focus();
                    this.$saveScreen.find('.save-screen-loading').hide();
                    this.changeViews.setDisabled(false);
                    this.activityViews.setDisabled(false);
                }.bind(this));

                return;
            }

            try {
                // 화면 저장시 로딩 이미지가 같이 캡춰되는 문제로 로딩 이미지가 보이지 않게 수정.
                // this.loadingMask.show()

                setTimeout(function() {
                    var currentIndex = Comm.RTComm.getCurrentViewIndex();
                    var saveIndex = this.$saveScreen.find('.save-screen-image-wrap').data('index');

                    this._activeImageViewBtn(saveIndex);
                    this._setTabSubTitle(title);

                    this._saveDockImage(saveIndex, title, function() {
                        Comm.RTComm.saveViewConfig(saveIndex, currentIndex);
                    });

                    this.loadingMask.hide();
                }.bind(this), 100);
            } catch (ex) {
                this.loadingMask.hide();
            }
        }.bind(this)).end().find('.save-screen-load').on('click', function(e) {
            e.stopPropagation();
            // load
            e.preventDefault();
            try {
                this.loadingMask.show();

                common.Util.closeComponentWindow();

                setTimeout(function() {
                    var index = this.$saveScreen.find('.save-screen-image-wrap').data('index');

                    realtime.isDashboardView = false;

                    title = this.$saveScreen.find('input').val();

                    if (Comm.web_env_info['xm-dock-position-' + this.$className + '-' + index]) {
                        this._activeImageViewBtn(index);
                        this._setTabSubTitle(title);
                        this._loadImageDock();
                    }

                    this.loadingMask.hide();
                }.bind(this), 100);

            } catch (e) {
                this.loadingMask.show();
            }
        }.bind(this)).end().find('.save-screen-delete').on('click', function(e) {
            e.stopPropagation();
            // delete
            e.preventDefault();
            try {
                this.loadingMask.show();

                setTimeout(function() {
                    var selectIndex = this.$saveScreen.find('.save-screen-image-wrap').data('index');
                    var viewIndex   = Comm.web_env_info['xm-dock-save-' + this.$className];

                    this.$saveScreen.find('.save-screen-image-wrap img').eq(selectIndex).attr('src', '');

                    Comm.RTComm.deleteViewConfig([
                        '@IMG@' + this.$className + '_' + this.$saveScreen.find('input').val(),
                        'xm-dock-position-' + this.$className + '-' + selectIndex,
                        'Intermax_RTM_WasStatList_View_' + selectIndex,
                        'Intermax_RTM_ServiceStatList_View_' + selectIndex,
                        'rtm_InstanceColors_View_' + selectIndex,
                        'rtm_performanceChart_View_' + selectIndex,
                        'rtm_SumChartColor_View_' + selectIndex
                    ]);

                    this.$saveScreen.find('.save-screen-navigation li').eq(selectIndex).data('keyname', '');
                    this.$saveScreen.find('input').val('');

                    // 삭제하는 화면이 현재 선택된 화면인 경우 기본화면으로 보여지도록 한다.
                    if (+selectIndex === +viewIndex) {
                        common.WebEnv.Save('xm-dock-save-' + this.$className, 0);
                        this._activeImageViewBtn(0);
                        this._setTabSubTitle();
                        this._loadImageDock(0);
                    } else {
                        this.$saveScreen.hide();
                    }
                    realtime.isDashboardView = false;

                    this.loadingMask.hide();

                    common.Util.showMessage('', common.Util.TR('The view was deleted.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                }.bind(this), 100);
            } catch (ex) {
                this.loadingMask.hide();
            }
        }.bind(this));
    },


    /**
     * 미리보기 화면 저장
     *
     * @param {string} index
     * @param {string} title
     * @param {function} callbackFn
     */
    _saveDockImage : function (index, title, callbackFn) {

        html2canvas( this.el.dom  , {
            // Canvas 로 복사 완료 이벤트
            onrendered: function(canvas) {
                var title = this.$saveScreen.find('input').val();
                var index = this.$saveScreen.find('.save-screen-image-wrap').data('index');
                var url = canvas.toDataURL();

                common.WebEnv.Save('@IMG@' + this.$className + '_' + title,
                        JSON.stringify({section : '@IMG@' + this.$className + '_' + title,
                                        data : { view : title ,
                                                Index : index,
                                                Image : url
                                        }}));

                this.$saveScreen.find('.save-screen-image-wrap img').eq(index).attr('src', url);
                this.$saveScreen.find('.save-screen-navigation li').eq(index).data('keyname', title);
                this.dockSite.saveLayerPosition(true, index);

                this.$saveScreen.find('.save-screen-loading').hide();
                this.changeViews.setDisabled(false);
                this.activityViews.setDisabled(false);

                callbackFn();

                this.$saveScreen.hide();

            }.bind(this)
        });
    },

    _loadImageDock : function(index){
        if(index == null){
            index = this.$saveScreen.find('.save-screen-image-wrap').data('index');
        }

        // 선택된 화면에 WAS 색상 정보를 설정.
        Comm.RTComm.loadChartOption(index);

        this.dockSite.reloadLayer(index);

        this.$saveScreen.hide();
    },

    _selectImageView: function(index) {
        // 전체 iframe 에서 save_image 가 있으면 돈다.
        var obj;
        var iframelist = document.getElementsByTagName("iframe");

        for (var ix = 0, ixLen = iframelist.length; ix < ixLen ; ix++) {
          obj = iframelist[ix];
          if ( !obj || !obj.contentWindow || !obj.contentWindow.save_image ) {
             continue;
          }
          obj.contentWindow.save_image();
        }
        this.$saveScreen.find('.save-screen-navigation-wrap li').eq(index).click();
    },

    _activeImageViewBtn: function(index){
        if(this.selectedPreView){
            this.selectedPreView.removeCls('active');
        }

        this.selectedPreView = this.changeViews.items.items[index];
        this.selectedPreView.addCls('active');
    },

    /**
     * 실시간 화면의 탭 패널에 화면명을 표시
     *
     * @param {string} subTitle
     */
    _setTabSubTitle: function(subTitle) {
        if (!subTitle) {
            subTitle = $('.save-screen-text').val();
        }
        Comm.RTComm.setRTMTabSubTitle(subTitle);
    }

});