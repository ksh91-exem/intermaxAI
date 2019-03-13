/**
 * Created by jykim on 2016-06-13.
 * Ext.dd.DragDrop 에서 mousedown event 처리 후
 * stopEvent 하는 부분을 처리 하지 않도록 Override
 */

Ext.define('Ext.override.dd.DragDrop', {
    override: 'Ext.dd.DragDrop',
    handleMouseDown: function(e) {
        var me = this;
        if ((me.primaryButtonOnly && e.button != 0) || me.isLocked()) {
            return;
        }
        me.DDMInstance.refreshCache(me.groups);
        if ((me.hasOuterHandles || me.DDMInstance.isOverTarget(e.getPoint(), me)) && me.clickValidator(e)) {

            me.setStartPosition();
            me.b4MouseDown(e);
            me.onMouseDown(e);
            me.DDMInstance.handleMouseDown(e, me);
            //me.DDMInstance.stopEvent(e)
        }
    }
});

