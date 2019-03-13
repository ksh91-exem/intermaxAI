/**
 * Created by min on 2015-02-06.
 */
Ext.define('config.ConfigEnv',{
    singleton: true,
    sql : {
        delete_server      : 'IMXConfig_Server_Delete.sql',
        insert_server      : 'IMXConfig_Server_Insert.sql',
        insert_server_tag  : 'IMXConfig_ServerTag_Insert.sql',
        delete_group       : 'IMXConfig_Group_Delete.sql',
        insert_group       : 'IMXConfig_Group_Insert.sql',
        insert_group_tag   : 'IMXConfig_GroupTag_Insert.sql'
    } ,

    group_flag : false,
    param: {
        name: '',
        server_type: '',
        alert_type: '',
        resource_name: '',
        tag_name: '',
        tag_value: '',
        sms: ''
    },

    delete_config: function(name, server_type, alert_type, resource_name, callFunc, set_value){
        var file ;
        var onData = this.on_data,
            dataSet = {};

        if(callFunc){
            onData = callFunc.bind({set_value : set_value});
        }

        if ( this.group_flag ){
            file = this.sql.delete_group ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.STRING }
                         ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                         ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                         ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }];
        }else {
            file = this.sql.delete_server ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.INTEGER }
                         ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                         ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                         ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }];
        }

        dataSet.sql_file = file;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, onData);
        //}, this.on_data.bind({scope: this}))

        file = null ;
    } ,


    insert_config: function(name, server_type, alert_type, resource_name, sms, description) {
        var file,
            dataSet = {};

        if(!description){
            description = null;
        }

        if ( this.group_flag ){
            file = this.sql.insert_group ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.STRING }
                         ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                         ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                         ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }
                         ,   { name: 'sms'                , value: sms          , type : SQLBindType.STRING }
                         ,   { name: 'description'        , value: description  , type : SQLBindType.STRING }];
        }else {
            file = this.sql.insert_server ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.INTEGER }
                         ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                         ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                         ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }
                         ,   { name: 'sms'                , value: sms          , type : SQLBindType.STRING }
                         ,   { name: 'description'        , value: description  , type : SQLBindType.STRING }];
        }

        dataSet.sql_file = file;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }


        WS.SQLExec(dataSet, this.on_data.bind({scope: this}));

        file = null ;
    },

    insert_tag_config: function(name, server_type, alert_type, resource_name, tag_name, tag_value){
        var file_tag,
            dataSet = {};

        if ( this.group_flag ){
            file_tag = this.sql.insert_group_tag ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.STRING }
                        ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                        ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                        ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }
                        ,   { name: 'alert_tag_name'     , value: tag_name     , type : SQLBindType.STRING }
                        ,   { name: 'alert_tag_value'    , value: tag_value    , type : SQLBindType.STRING }];
        }else {
            file_tag = this.sql.insert_server_tag ;
            dataSet.bind = [ { name: 'name'               , value: name         , type : SQLBindType.INTEGER }
                        ,   { name: 'server_type'        , value: server_type  , type : SQLBindType.STRING }
                        ,   { name: 'alert_type'         , value: alert_type   , type : SQLBindType.STRING }
                        ,   { name: 'alert_resource_name', value: resource_name, type : SQLBindType.STRING }
                        ,   { name: 'alert_tag_name'     , value: tag_name     , type : SQLBindType.STRING }
                        ,   { name: 'alert_tag_value'    , value: tag_value    , type : SQLBindType.STRING }];
        }

        dataSet.sql_file = file_tag;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.on_data.bind({scope: this}));

        file_tag = null ;
    },


    on_data: function( header ){

        switch( header.command ){
            case 'IMXConfig_Server_Delete.sql':
            case 'IMXConfig_Group_Delete.sql':
                console.debug('delete.......................');

                break ;

            case 'IMXConfig_ServerTag_Insert.sql':
            case 'IMXConfig_GroupTag_Insert.sql':
            case 'IMXConfig_Server_Insert.sql':
            case 'IMXConfig_Group_Insert.sql':

                break ;


            default:
                console.debug(header.command);
                break ;
        }
    } ,

    push_param: function( name, server_type, alert_type, resource_name, tag_name, tag_value, sms ){
        this.param.name          = name  ;
        this.param.server_type   = server_type ;
        this.param.alert_type    = alert_type ;
        this.param.resource_name = resource_name ;
        this.param.tag_name      = tag_name ;
        this.param.tag_value     = tag_value ;
        this.param.sms           = sms ;
    }
});