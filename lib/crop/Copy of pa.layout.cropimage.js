
// 디자인파일

Ext.define('pa.layout.cropimage.window', {
	extend : 'Ext.Window',	
	autoShow: true,
	id : 'cropimage_window',
	autoDestroy:true,
	hideShadowOnDeactivate: true,
	constrainHeader : false,
	maximizable: false,
    //title: 'Crop Image',
	title : '',
	x : -6,
	y : -6,
	frame: false,
	header: false,
	resizable: false,
	closeAction:'hide',
	border:false,
	preventHeader: true,
    width: 2400,
    height: 1510,
    layout: {
        type: 'fit'
    },
    
	initComponent : function()
	{
		Ext.applyIf( this,
		{
			items:
			[
				{
	                    xtype: 'panel',
	                    floation:true,
	                    bodyBorder:false,
	                    animCollapse:false,
	                    collapsed:false,
	                    overlapHeader:false,
	                    collapsible:false,
	                    titleCollapse:false,
	                    
	                    
	                    layout: {
		    		        align: 'stretch',
		    		        type: 'vbox'
		    		    },
	                    items:[ 
								{
						            frame: false,
						            border: false,
						            flex: 1,
						            id : 'cropimage_iframe',
						            xtype : "component",						            
						            autoEl : {
						                tag : "iframe",
						                src: 'crop_preview.html',
						                						                
						            },
						            listeners: {
						                afterrender: Ext.create('pa.layout.cropimage.window.iframe.afterrender').fn, 
						                	
						            }

						        },
						        /*
								{
						        	xtype : 'button',
						        	text : 'Download Image',
						         	margin : '10px',
						        	height : 30,
						        	handler: Ext.create('pa.layout.cropimage.window.downloadimage').fn,
								}
								*/
								
								 
	                    ],
	                
	                }
				
			],
		
		});
		
		this.callParent(arguments);
		
	},
	
	setImage : Ext.create('pa.layout.cropimage.window.setImage').fn,
	
	listeners :
	{
		show : Ext.create('pa.layout.cropimage.window.show').fn,
		hide  : Ext.create('pa.layout.cropimage.window.hide').fn,
		destroy : Ext.create('pa.layout.cropimage.window.destroy').fn,
		 
	}
	
	
 
	
});