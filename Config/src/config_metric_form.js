Ext.define('config.config_metric_form', {
  parent: null,
  systemID: '',
  instanceType: '',
  name: '',
  desc: '',
  mode: '',
  // 개당 변경사항 여부 체크
  isModified: false,
  // 전체의 변경사항 여부 체크
  isModifiedAll: false,

  referenceObjArray: [],
  // Target 이전 객체
  beforeObj:{
      // 이전에 선택된 인덱스
      preIndex:0,
      systemID: '',
      instanceType: '',
      name: '',
      desc: ''
  },

  init: function (state) {
      var self = this;

      this.mode = state;

      self.referenceObjArray = [];

      var form = Ext.create('Exem.Window', {
          layout: 'vbox',
          maximizable: false,
          width: 600,
          height: 500,
          resizable: false,
          bodyStyle: { background: '#f5f5f5' },
          closeAction: 'destroy',
          cls: 'config_tab',
          listeners   : {
              close: function(){
                  if (self.isModifiedAll) {
                      // self.parent.onButtonClick('Refresh');
                      // parent 그리드의 store에 추가하기?
                  }
              }
          }
      });

      if (state == 'Add') {
          form.setTitle(common.Util.TR('Add New Metric'));
      }

      var panelA = Ext.create('Ext.panel.Panel', {
          layout: 'hbox',
          cls: 'x-config-used-round-panel',
          width: '100%',
          flex: 1,
          margin: '4 4 4 4',
          border: false,
          bodyStyle: { background: '#eeeeee' }
      });

      var panelA1 = Ext.create('Ext.panel.Panel', {
          layout: 'fit',
          flex: 1,
          height: '100%',
          border: false,
          bodyStyle: { background: '#eeeeee' }
      });

      this.was_grid = Ext.create('Exem.adminGrid', {
          width : '100%',
          height: '100%',
          editMode: false,
          useCheckBox: false,
          checkMode: Grid.checkMode.SIMPLE,
          showHeaderCheckbox: false,
          localeType: 'H:i:s',
          stripeRows: true,
          defaultHeaderHeight: 26,
          usePager: false,
          defaultbufferSize: 300,
          defaultPageSize: 300,
          itemclick:function(dv, record, item, index) {
              // if(state == 'Edit'){
              //     var itemChange = true;
              //     if(!self.dataCheck(itemChange)){
              //         self.was_grid.selectRow(self.beforeObj.preIndex);
              //     } else {
              //         if(!self.wasClick(index, record.data )){
              //             self.was_grid.selectRow(self.beforeObj.preIndex);
              //             self.nameEdit.focus();
              //         } else{
              //             self.beforeObj.preIndex = index;
              //         }
              //     }
              // }
          }
      });
      panelA1.add(this.was_grid);

      this.was_grid.beginAddColumns();
      this.was_grid.addColumn({text: 'sys_id'                      , dataIndex: 'sys_id'   , width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
      this.was_grid.addColumn({text: common.Util.TR('Instance')    , dataIndex: 'inst_type', width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
      this.was_grid.addColumn({text: common.Util.CTR('Name')       , dataIndex: 'metric_id', width: 100, type: Grid.String, alowEdit: false, editMode: false});
      this.was_grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'     , width: 100, type: Grid.String, alowEdit: false, editMode: false});
      this.was_grid.addColumn({text: common.Util.TR('Use Type')    , dataIndex: 'use_type' , width: 100, type: Grid.Number, alowEdit: false, editMode: false, renderer: this.parent.renderUseType});
      this.was_grid.addColumn({text: common.Util.TR('Weight')      , dataIndex: 'weight'   , width: 100, type: Grid.Number, alowEdit: false, editMode: false, renderer: this.parent.renderWeight});
      this.was_grid.endAddColumns();

      panelA.add(panelA1);

      var panelA2 = Ext.create('Ext.panel.Panel', {
          layout: 'absolute',
          flex: 1,
          height: '100%',
          border: false,
          bodyStyle: { background: '#eeeeee' }
      });

      this.nameEdit = Ext.create('Ext.form.field.Text', {
          x: 0,
          y: 10,
          width: 270,
          labelWidth: 80,
          labelAlign: 'right',
          hideTrigger : true,
          fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Name')),
          allowBlank: true
      });

      this.descEdit = Ext.create('Ext.form.field.Text', {
          x: 0,
          y: 10+27,
          width: 270,
          labelWidth: 80,
          labelAlign: 'right',
          maxLength : 64,
          enforceMaxLength : true,
          fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Description')),
          allowBlank: true
      });
      
      this.useTypeCombo = Ext.create('Exem.AjaxComboBox',{
          x: 0,
          y: 10+27+27,
          cls: 'config_tab',
          width: 270,
          data : [],
          labelWidth: 80,
          labelAlign: 'right',
          enableKeyEvents: true,
          multiSelect: false,
          fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Use Type')),
          // listeners: {
          //     scope: this,
          //     beforeselect: function(me, record) {
          //       if(record.data.value == 2) return false;
          //     }
          // }
      });

      this.useTypeComboData    = [];

      this.useTypeComboData.push ({ name: '0 : 미사용', value: '0', disabled: false });
      this.useTypeComboData.push ({ name: '1 : 사용', value: '1', disabled: false });
      // this.useTypeComboData.push ({ name: '2 : 필수', value: '2', disabled: false });

      this.useTypeCombo.setData(this.useTypeComboData);
      this.useTypeCombo.setSearchField('name');

      this.weightCombo = Ext.create('Exem.AjaxComboBox',{
          x: 0,
          y: 10+27+27+27,
          cls: 'config_tab',
          width: 270,
          data : [],
          labelWidth: 80,
          labelAlign: 'right',
          enableKeyEvents: true,
          multiSelect: false,
          fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Weight'))
      });

      this.weightComboData    = [];

      this.weightComboData.push ({ name: '1 : 낮음', value: '1' });
      this.weightComboData.push ({ name: '2 : 중간', value: '2' });
      this.weightComboData.push ({ name: '3 : 높음', value: '3' });

      this.weightCombo.setData(this.weightComboData);
      this.weightCombo.setSearchField('name');

      panelA2.add(this.nameEdit, this.descEdit, this.useTypeCombo, this.weightCombo);
      panelA.add(panelA2);

      var panelC = Ext.create('Ext.panel.Panel', {
          layout: {
              type: 'hbox',
              pack: 'center',
              align: 'middle'
          },
          width: '100%',
          height: 25,
          border: false,
          bodyStyle: { background: '#f5f5f5' }
      });

      var OKButton = Ext.create('Ext.button.Button', {
          text: common.Util.TR('Save'),
          cls: 'x-btn-config-default',
          width: 70,
          margin: '0 2 0 0',
          listeners: {
              click: function() {
                  self.save();
              }
          }
      });

      this.cancelButton = Ext.create('Ext.button.Button', {
          text: common.Util.TR('Close'),
          cls: 'x-btn-config-default',
          width: 70,
          margin: '0 0 0 2',
          listeners: {
              click: function() {
                  this.up('.window').close();
              }
          }
      });

      panelC.add(OKButton);
      panelC.add(this.cancelButton);

      form.add(panelA);
      form.add(panelC);

      form.show();
      this.was_load();
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  was_load: function() {
      var self = this,
          ix, ixLen, data;

      Ext.Ajax.request({ //호출 URL
          url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/metric/' + self.instanceType,
          method : 'GET',
          success : function(response) {
              var result = Ext.JSON.decode(response.responseText);
              if (result.success === true) {
                  data = result.data;
                  self.was_grid.clearRows();

                  for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                      self.was_grid.addRow([data[ix].sys_id, data[ix].inst_type, data[ix].metric_id, data[ix].desc, data[ix].use_type, data[ix].weight]);
                  }

                  self.was_grid.drawGrid();

                  // if (self.mode == 'Edit'){}
              }
          },
          failure : function(){}
      });

      switch (this.mode) {
          case 'Add' :
              self.nameEdit.focus();
              break;
          default :
              break;
      }
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  save: function() {
      var self = this;
      // 넣을 데이터 가져오기.
      var systemID     = self.systemID;
      var instanceType = self.instanceType;
      var name         = self.nameEdit.getValue();
      var desc         = self.descEdit.getValue();
      var useType      = self.useTypeCombo.getValue();
      var weight       = self.weightCombo.getValue();
      var cusorPointCheck = false;
      var record;
      var itemChange = false;

      if(!self.dataCheck(itemChange)){
          return;
      }

      // 마지막 변경사항 추가하기 위해
      // if (self.beforeObj.name == name) {
      //     cusorPointCheck = true;
      // }

      if (self.mode == 'Add') {
          record = {
              sys_id: systemID,
              metric_id: name,
              inst_type: instanceType,
              use_type: useType,
              weight: weight,
              desc: desc
          };
          if( useType != 2 ) {
              self.parent.changeMetricInfo(record)
              Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
              self.cancelButton.fireEvent('click');
          } else {
              Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Change Failed'));
              return;
          }

      } else {
          // Edit mode
      }
  },

  getTextLength : function(str){
      var len = 0;
      for (var i = 0; i < str.length; i++) {
          if (encodeURI(str.charAt(i)).length == 9) {
              //DB가 UTF-8 일경우 한글 byte는 3byte 취급.
              len += 2;
          }
          len++;
      }
      return len;
  },

  /**
   * itemClick 을 통해 dataCheck 시 에이전트명과 호스트명 제외
   * @param itemChange
   * @returns {boolean}
   */
  dataCheck: function(itemChange){
      var self = this;
      // 넣을 데이터 가져오기.
      var systemID     = self.systemID;
      var instanceType = self.instanceType;
      var name         = self.nameEdit.getValue();
      var desc         = self.descEdit.getValue();
      var ix;

      // CHECK: METRIC NAME + Byte Check
      if (name == '' && !itemChange) {
          Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Name.'));
          self.nameEdit.focus();
          return false;
      }

      if (name.indexOf(' ') > -1 ) {
          Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
          self.nameEdit.focus();
          return false;
      }

      var nameByteLen = this.getTextLength(name);

      if(nameByteLen > 128){
          Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
          self.nameEdit.focus();
          return false;
      }

      // CHECK: Description + Byte Check
      if (desc == '' && !itemChange) {
          Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Description.'));
          self.descEdit.focus();
          return false;
      }

      var descByteLen = this.getTextLength(desc);

      if(descByteLen > 64){
          Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
          self.descEdit.focus();
          return false;
      }

      var parentLeftStoreData = self.parent.leftGridStoreData;
      var parentRightStoreData = self.parent.rightGridStoreData;

      // CHECK: METRIC ID 중복 체크
      if (self.mode == 'Add') {
          for (ix = 0; ix < parentLeftStoreData.length; ix++) {
              if (parentLeftStoreData[ix].metric_id == name) {
                  Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                  self.nameEdit.focus();
                  return false;
              }
          }
          for (ix = 0; ix < parentRightStoreData.length; ix++) {
              if (parentRightStoreData[ix].metric_id == name) {
                  Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                  self.nameEdit.focus();
                  return false;
              }
          }
      } else {
          //edit mode
      }
      return true;
  },

  // wasClick: function(index, recordData) {
  //   //edit mode
  // }
});
