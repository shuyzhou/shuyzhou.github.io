var TileView = Backbone.View.extend({
   tagName:  "div",
   template: _.template($('#tile-template').html()),
 /* events: {
    "click .icon":          "open",
    "click .button.edit":   "openEditDialog",
    "click .button.delete": "destroy"
  },*/
 initialize: function() {
      this.listenTo(this.model, 'destroy', this.remove);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'merge', this.mergeAnim);
  },
  render: function() {
      this.$el.html(this.template({row : this.model.get("row"), column : this.model.get("column"), value : this.model.get("value")}));
      return this;
  },
  mergeAnim : function () {
    this.$el.find("div").addClass("tile-merged");
  }
});