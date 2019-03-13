

// 이벤트 파일

Ext.define('pa.layout.cropimage.window.setImage', {
	fn : function( ADataUrl /* string */ )
	{
		//eval('window.cropimage_iframe.procImg("'+ ADataUrl  +'")');
		this.original_image = ADataUrl;
	}
});

Ext.define('pa.layout.cropimage.window.iframe.afterrender', {
	fn : function () {
		
		//  디자인에 iframe  Element를 Create 시켰으면 load 이벤트를 연결시킨다.
		this.getEl().on('load', function () {

			//console.log('loaded', Ext.getCmp('cropimage_window').original_image, window.cropimage_iframe );
        	setTimeout( function( data ){
        		eval('window.cropimage_iframe.procImg("'+ data  +'")');	
        	}, 10 , Ext.getCmp('cropimage_window').original_image );
        	
            
        });
	}
});


Ext.define('pa.layout.cropimage.window.downloadimage', {
	fn : function( ADataUrl /* string */ )
	{
		setTimeout( function( cropimage_window ){
    		eval('window.cropimage_iframe.downloadimage()');
			cropimage_window.original_image  = null;
    		cropimage_window.close();
    	}, 100,  Ext.getCmp('cropimage_window') );		
	}
});



Ext.define('pa.layout.cropimage.window.show', {
	fn : function( ADataUrl /* string */ )
	{
		//this.maximize();
		//this.setPosition(-8,-8);
		//this.setWidth( Ext.getBody().getWidth() +100);
		//this.setHeight( Ext.getBody().getHeight() +100 );
	}
});

Ext.define('pa.layout.cropimage.window.hide', {
	fn : function(  )
	{
		Ext.getCmp('cropimage_window').destroy();
	}
});


Ext.define('pa.layout.cropimage.window.destroy', {
	fn : function(  )
	{
		Ext.getCmp('cropimage_window').original_image = null;
	}
});