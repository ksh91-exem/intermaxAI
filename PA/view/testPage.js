/**
 * Created by JONGHO on 2015-07-22.
 */
Ext.define("view.testPage", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    init: function() {

        this.setWorkAreaLayout('vbox');
        this.body =  Ext.create("Ext.panel.Panel", {
                layout: 'hbox',
                itemId: 'middle',
                flex: 1,
                width: '100%',
                style: {
                    background: '#eeeeee',
                    padding: "2px 2px"
                }
        });

        this.workArea.add(this.body);

        this.leftArea = Ext.create('Ext.container.Container',{
            width: 100,
            height: '100%',
            layout: {
                type:'vbox',
                align: 'middle'
            },
            style: {
                background: 'gray'
            }
        });

        this.pathButton = Ext.create('Ext.button.Button',{
            width : 80,
            height: 50,
            text: 'Path',
            handler: function() {
                var layout = this.rightArea.getLayout();
                layout.setActiveItem(0);
            }.bind(this)
        });

        this.treeButton = Ext.create('Ext.button.Button',{
            width : 80,
            height: 50,
            text: 'Tree',
            handler: function() {
                var layout = this.rightArea.getLayout();
                layout.setActiveItem(1);
            }.bind(this)
        });

        this.addButton = Ext.create('Ext.button.Button',{
            width : 80,
            height: 50,
            text: 'add',
            handler: function() {
               this.addTabTree();
            }.bind(this)
        });

        this.leftArea.add(this.pathButton, this.treeButton,  this.addButton);

        this.rightArea = Ext.create('Ext.panel.Panel',{
            height: '100%',
            flex  : 1,
            border: true,
            bodyStyle: {
                'border-radius': '5px',
                'border': '1px solid #C6C6C6'
            },
            layout: 'card'
        });

        this.body.add(this.leftArea, this.rightArea);

        this.pathArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            html: 'PATH',
            flex: 1
        });

        this.treeArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            html : 'TREE',
            _index: 2,
            layout: 'fit',
            flex: 1
        });

        this.treeBackground = Ext.create('Ext.tab.Panel',{
            width : '100%',
            height: '100%'
        });
        this.treeArea.add(this.treeBackground);

        this.rightArea.add(this.pathArea, this.treeArea);


    },

    addTabTree: function() {
        var tabItem = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            title: 'aaaa',
            layout: 'vbox',
            closable: true
        });

        this.treeBackground.add(tabItem);


    }


});