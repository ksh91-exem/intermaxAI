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

        var self = this ;



        this.lang = localStorage.getItem('Intermax_MyLanguage');
        if ( this.lang == null ){
            localStorage.setItem('Intermax_MyLanguage', 'en');
            this.lang = 'en'
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
            itemId  : 'top_pnl',
            layout: 'fit',
            region: 'north',
            width : '100%',
            height: 59 ,
            style : { 'background': '#3F4249' }
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



        if ( this.lang == 'en' ){
            $(this.main_pnl.el.dom).append('<div class="eng_step1"></div>') ;
            $(self.viewport.el.dom).find('.eng_step1').append('<p class="was-off"></p><p class="close-btn"></p><p class="cancel-btn"></p>') ;
            $(self.viewport.el.dom).find('.eng_step1').append('<div class="grid-area"></div>') ;
        }else{
            $(this.main_pnl.el.dom).append('<div class="step1"></div>') ;
            $(self.viewport.el.dom).find('.step1').append('<p class="was-off"></p><p class="close-btn"></p><p class="cancel-btn"></p>') ;
            $(self.viewport.el.dom).find('.step1').append('<div class="grid-area"></div>') ;
        }




        //was click
        document.getElementsByTagName("p")[0].onclick = function(e){

            var $view = $(self.viewport.el.dom) ;
            if ( $( self )[0].lang == 'en' ){
                var $step1 = $view.find('.eng_step1') ;

                $step1.css({
                    'background-image': 'url(/Intermax5/Install/image/Install_image_3/eng_step2.png)',
                })

            }else{
                var $step1 = $view.find('.step1') ;

                $step1.css({
                    'background-image': 'url(/Intermax5/Install/image/Install_image_3/step2.png)',
                })
            } ;


            $(self.viewport.el.dom).find('.was-off').hide() ;

            $step1.find('.cancel-btn').css({
                'background-image': 'url(/Intermax5/Install/image/Install_image_3/Finish_Btt_Off.png)',
            })

            $step1.find('.cancel-btn').mouseenter(function() {
                $(this).css("background-image","url(/Intermax5/Install/image/Install_image_3/Finish_Btt_On.png)")
            }).mouseleave(function() {
                $(this).css("background-image","url(/Intermax5/Install/image/Install_image_3/Finish_Btt_Off.png)")
            });


            if ( $view.find('.back-btn')[0] ){
                $step1.find('.back-btn').show() ;
                $step1.find('.config-btn').show() ;
                $step1.find('.grid-area').show() ;

            }else{
                $step1.append('<p class="back-btn"></div>') ;
                $step1.append('<p class="config-btn"></div>') ;
                $view.find('.grid-area').show() ;
                $(self)[0].create_grid() ;
            } ;


            //$(self)[0].loading_mask.show() ;
            $(self)[0].get_was_info() ;


            //back button event
            $step1.find('.back-btn').on('click', function(e){
                //$(self)[0].loading_mask.hide() ;
                if ( $step1.find('.was-count')[0] ){
                    $step1.find('.was-count').remove() ;
                };
                $(self)[0].grid_store.removeAll() ;
                $step1.find('.was-off').show() ;
                $step1.find('.back-btn').hide() ;
                $step1.find('.config-btn').hide() ;
                $step1.find('.grid-area').hide() ;
                clearTimeout( $(self)[0].timeout ) ;
                console.log('데이터끗끗끗');


                if ( $( self )[0].lang == 'en' ){
                    $step1.css({
                        'background-image': 'url(/Intermax5/Install/image/Install_image_3/eng_step01.png)',
                    })
                }else{
                    $step1.css({
                        'background-image': 'url(/Intermax5/Install/image/Install_image_3/step01.png)',
                    })
                }



                $step1.find('.cancel-btn').css({
                    'background-image': 'url(/Intermax5/Install/image/Install_image_3/Cancel_Btt_Off.png)',
                })
                $step1.find('.cancel-btn').mouseenter(function() {
                    $(this).css("background-image","url(/Intermax5/Install/image/Install_image_3/Cancel_Btt_On.png)")
                }).mouseleave(function() {
                    $(this).css("background-image","url(/Intermax5/Install/image/Install_image_3/Cancel_Btt_Off.png)")
                });
            }) //end event



            //config button event
            $step1.find('.config-btn').on('click', function(e){
                //$(self)[0].loading_mask.hide() ;
                $(self)[0].call_config() ;
            }) //end event
        } // end



        //close btn
        document.getElementsByTagName("p")[1].onclick = function(e){
            $(self)[0].call_rtm() ;
        }

        //cancel btn click
        document.getElementsByTagName("p")[2].onclick = function(e){
            //$(window)[0].close() ;
            $(self)[0].call_rtm() ;
        }



    },

    create_grid: function(){


        //그리드
        this.grid_store = Ext.create('Ext.data.Store',{
            fields  : [
                {name : 'status'     , type : 'string' },
                {name : 'server_type', type : 'string' },
                {name : 'server_id'  , type : 'string' },
                {name : 'ip'         , type : 'string' }
            ],
            data    : []
        })


        var sub_pnl = Ext.create('Ext.grid.Panel',{
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

        //this.loading_mask = new Ext.LoadMask(sub_pnl, {msg:"Please wait..."});
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
                this.draw_grid( data[0] );

                var $view = $(self.viewport.el.dom) ;
                if ( $( self )[0].lang == 'en' ){
                    var $step1 = $view.find('.eng_step1') ;
                }else{
                    var $step1 = $view.find('.step1') ;
                } ;


                if ( $step1.find('.was-count')[0] ){
                    $step1.find('.was-count').remove() ;
                }
                $step1.append('<p class="was-count">'+ data[1].rows[0][0] + '</p>') ;
                this.timeout = setTimeout( this.get_was_info.bind(this), 3000 ) ;
            }
        }, self);
    } ,

    draw_grid: function(data){

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
        this.grid_store.removeAll() ;
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
        this.grid_store.loadData( arr ) ;
        //this.loading_mask.hide() ;

        ix = null ;
        server_type = null ;
        arr = null ;
    } ,


    call_rtm: function(){
        clearTimeout( this.timeout ) ;
        self.close() ;
        //var path = document.location.pathname;
        //var dir = path.substring(0, path.lastIndexOf('/')-7);
        //this.open_in_new_tab( document.location.origin + dir + 'rtm' ) ;

        //var path = document.location.href ;
        //window.open(path, '_self').close() ;
        //var dir = window.open(path, '_self') ;
        //setTimeout(function(){
        //    dir.close() ;
        //},1000)
        //dir.close() ;

        //window.opener = self;
        //window.close();

        //var path = document.location.pathname;
        //var dir = path.substring(0, path.lastIndexOf('/')-7);
        //var url = document.location.origin + dir + 'install' ;
        //var win = window.open(url, '_blank');


        //win.close() ;


        //path = null ;
        //dir = null ;
    } ,


    call_config: function(){

        clearTimeout( this.timeout ) ;

        //if ( !this.install_click ){
        //    this.showMessage('Confirmation', 'Please click the Install button', Ext.Msg.OK, Ext.MessageBox.WARNING, function(){
        //        return ;
        //    })
        //}else{
            var path = document.location.pathname;
            var dir = path.substring(0, path.lastIndexOf('/')-7);
            this.open_in_new_tab( document.location.origin + dir + 'config' ) ;


            path = null ;
            dir = null ;
        //}
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
    }
});
