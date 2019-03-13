/**
 * Created by JONGHO on 14. 4. 6.
 */
Ext.define("view.TestProcess", {
    extend: "Exem.Window",
    title : 'test',
    width : 800,
    height: 400,
    layout: 'fit',
    init: function() {
        var self = this;

        self.tabPanel = Ext.create('Exem.TabPanel',{
            width  : '100%',
            height : '100%',
            items  : [{
                layout:'fit',
                title: 'Total'
            }]
        });
        self.add(self.tabPanel);

        self.grid = Ext.create('Exem.BaseGrid');
        self.tabPanel.items.items[0].add(self.grid);

        self.grid.beginAddColumns();
        self.grid.addColumn('Time'          , 'time'         , 100,  Grid.DateTime, true, false);
        self.grid.addColumn('Was'           , 'wasname'      , 200,  Grid.String,   true, false);
        self.grid.addColumn('Transaction'   , 'txnname'      , 250,  Grid.String,   true, false);
        self.grid.addColumn('Class Method'  , 'classmethod'  , 300,  Grid.String,   true, false);
        self.grid.addColumn('Method Type'   , 'methodtype'   , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Elapse Time ' , 'elapsedtime'  , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Start Time'    , 'starttime'    , 100,  Grid.DateTime, true, false);
        self.grid.addColumn('Wait Time'     , 'waittime'     , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Client IP'     , 'clientip'     , 100,  Grid.String,   true, false);
        self.grid.addColumn('Pool'          , 'poolname'     , 100,  Grid.String,   true, false);
        self.grid.addColumn('Instance'      , 'instancename' ,  80,  Grid.String,   true, false);
        self.grid.addColumn('SID'           , 'sid'          , 100,  Grid.Number,   true, false);
        self.grid.addColumn('State'         , 'state'        , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Bind Value'     , 'bindlist'     , 100,  Grid.String,   true, false);
        self.grid.addColumn('SQL 1'          , 'sqltext1'     , 100,  Grid.String,   true, false);
        self.grid.addColumn('SQL Execution Count', 'sqlexeccount' , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Fetch Count'   , 'fetchcount'   , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Prepare Count' , 'preparecount' , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Logical Reads' , 'logicalreads' , 100,  Grid.Number,   true, false);
        self.grid.addColumn('Physical Reads', 'physicalreads', 100,  Grid.Number,   true, false);
        self.grid.addColumn('Wait Info'     , 'waitinfo'     , 300,  Grid.String,   true, false);

        // hidden
        self.grid.addColumn('TID'           , 'tid'           , 100,  Grid.String, false, true);
        self.grid.addColumn('Was ID'        , 'wasid'         , 100,  Grid.String, false, true);
        self.grid.addColumn('Login Name'    , 'loginname'     ,  80,  Grid.String, false, true);
        self.grid.addColumn('Browser'       , 'browser'       ,  80,  Grid.String, false, true);
        self.grid.addColumn('DB Time'       , 'dbtime'        ,  80,  Grid.String, false, true);
        self.grid.addColumn('SQL 2'          , 'sqltext2'      , 100,  Grid.String, false, true);
        self.grid.addColumn('SQL 3'          , 'sqltext3'      , 100,  Grid.String, false, true);
        self.grid.addColumn('SQL 4'          , 'sqltext4'      , 100,  Grid.String, false, true);
        self.grid.addColumn('SQL 5'          , 'sqltext5'      , 100,  Grid.String, false, true);
        self.grid.addColumn('PGA Usage'     , 'pgausage'      , 100,  Grid.String, false, true);
        self.grid.addColumn('OS Code'       , 'oscode'        , 100,  Grid.String, false, true);
        self.grid.addColumn('Bank Code'     , 'bankcode'      , 100,  Grid.String, false, true);
        self.grid.addColumn('Error Code'    , 'errorcode'     , 100,  Grid.String, false, true);
        self.grid.addColumn('Thread CPU'     , 'threadcpu'    , 80,  Grid.String, false, true);
        self.grid.endAddColumns();

        self.refreshCheckbox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel : 'Auto Refresh',
            margin   : '0 3 0 0',
            checked  : true,
            listeners: {
                change: function() {
                    console.debug('CHECK CHANGE');
                }
            }
        });
        var tabSpace = { xtype: 'tbfill' };

        self.tabPanel.tabBar.add( tabSpace, self.refreshCheckbox );

        self.show();
    }
});