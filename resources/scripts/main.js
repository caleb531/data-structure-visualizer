(function ($, _, Backbone, app) {

app.views.ControlContainer = Backbone.View.extend({
	initialize: function () {
		this.setMenuOptions('#data-structure', app.structureList);
		this.setDataStructure('LinkedList');
	},
	setMenuOptions: function (menuName, menuOptions) {
		var $menu = $(menuName);
		$menu.empty();
		for (var o = 0; o < menuOptions.length; o += 1) {
			$('<option>')
				.prop({value: menuOptions[o].value})
				.html(menuOptions[o].label)
				.appendTo($menu);
		}
	},
	setDataStructure: function (structureName) {
		var StructureModel = app.models[structureName];
		var StructureView = app.views[structureName];
		var structureModel = new StructureModel();
		var structureView = new StructureView({
			el: $('#canvas')[0],
			model: structureModel
		});
		// TODO: get this working right
		this.setMenuOptions('#left-hand-side', StructureView.srcPointers);
		this.setMenuOptions('#right-hand-side', StructureView.dstPointers);
	}
});

var selectionView = new app.views.ControlContainer({
	el: $('#controls')
});

}(jQuery, window._, window.Backbone, window.app));
