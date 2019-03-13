Ext.define('view.AlertHistory_Hidden',{
    extend: 'Exem.Window',
    title : 'Information',
    layout: 'fit',
    width : 480 ,
    height: 300 ,
    modal : false ,
    sql   : {
        Click_M   : 'IMXPA_AlertHistory_Click_M.sql',
        Click_H   : 'IMXPA_AlertHistory_Click_H.sql'
    },


    init: function(){
        var self = this ;

        self.fromtime ;
        self.totime ;
        self.timerange ;
        self.server_type ;
        self.server_id ;
        self.alert_name_txt ;
        self.status_name_txt ;
        self.parent_form ;

        var pnl_grd = Ext.create('Exem.FormPanel',{
            layout: 'fit' ,
            bbar  : [{
                text : 'Close(10)',
                defaultCount: 10,
                xtype: 'button',
                listeners: {
                    render: function(){
                        var runner = new Ext.util.TaskRunner();
                        var task = runner.newTask({
                            target: this,
                            win   : self,
                            run: function() {
                                this.target.defaultCount--;
                                console.debug('Count', this.target.defaultCount);
                                this.target.setText('Close('+this.target.defaultCount+')');
                                if(this.target.defaultCount == 0){
                                    this.stop();
                                    this.win.destroy();
                                }
                            },
                            // 반복 주기
                            interval: 1000
                        });
                        task.start();
                    },
                    click: function(){
                        self.close() ;
                    }
                }
            }]
        }) ;
        self.add(pnl_grd) ;
        self.hidden_grd = Ext.create('Exem.BaseGrid',{
            itemclick: function(dv, record) {
                self.parent_form.grd_attribute( record.data ) ;
            }
        }) ;
        pnl_grd.add(self.hidden_grd) ;

        self.show() ;
        self.hidden_grd.addColumn('Time'     , 'time'   , 150, Grid.DateTime, true, false) ;
        self.hidden_grd.addColumn('Name'    , 'was_name', 100, Grid.String, true, false) ;
        self.hidden_grd.addColumn('Warning' , 'warning' , 100, Grid.Number, true, false) ;
        self.hidden_grd.addColumn('Critical', 'critical', 100, Grid.Number, true, false) ;

        var grd_data = {} ;
        if ( self.timerange == 'min' ) {
            grd_data.sql_file = self.sql.Click_M ;
            self.totime = self.fromtime.substring(0, 16) + ':59' ;
        }else{
            grd_data.sql_file = self.sql.Click_H ;
            self.totime = self.fromtime.substring(0, 13) + ':59:59' ;
        }
        grd_data.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: self.fromtime
        },{
            name : 'totime' ,
            type : SQLBindType.STRING,
            value: self.totime
        },{
            name : 'server_type',
            type : SQLBindType.INTEGER,
            value: self.server_type
        }] ;
        grd_data.replace_string = [{
            name : 'server_id',
            value: self.server_id
        },{
            name : 'alert_name',
            value: self.alert_name_txt
        },{
            name : 'status_name',
            value: self.status_name_txt
        }];
        WS.SQLExec( grd_data, self.onData, self) ;
    } , //end-init

    onData: function(header, data){
        var self = this ;
        self.hidden_grd.clearRows() ;
        self.hidden_grd.onData(header, data) ;
        self.hidden_grd.PagerVisible( false ) ;
    }
}) ;
