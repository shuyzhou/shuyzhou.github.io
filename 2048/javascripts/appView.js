var AppView = Backbone.View.extend({
  el: $("#main-container"),
  clientX: -1,
  clientY: -1,
  events: {
    "click .restart": "restart",
    "touchstart": "touchstart",
    "touchend": "touchend"
  },
 initialize: function(collection) {
    var self = this;
    this.collection = collection;
    this.tileContainer = this.$("#tile-container");
    this.messageContainer = this.$("#game-message");
    this.scoreContainer = this.$(".score-container");
    this.listenTo(this.collection, "add", this.addOne);
    this.listenTo(this.collection, "score", this.changeScore);
    this.listenTo(this.collection, "win", this.showMessage);
    this.listenTo(this.collection, "over", this.showMessage);
    this.listenTo(this.collection, "reset", this.reset);
    document.addEventListener("keydown", function (e){
      self.move(e);
    });
    this.collection.init();
    this.scoreContainer.find("#score").html(0);
  },
  restart: function() {
    this.collection.reset();
    this.collection.init();
  },
  addOne: function(tile) {
    var view = new TileView({model: tile});
    this.tileContainer.append(view.render().el);
  },
  move : function (e) {
    var map = {
      37:"left",
      38:"up",
      39:"right",
      40:"down"
    };
    this.collection.refresh(map[e.keyCode]);
  },
  changeScore : function (score,change) {
    this.scoreContainer.find("#score").html(score);
  },
  showMessage : function (msg) {
    this.messageContainer.find("p").html(msg);
    this.messageContainer.css({"display":"block"});
  },
  reset : function () {
    this.tileContainer.empty();
    this.messageContainer.css({"display":"none"});
  },
  touchstart : function (event) {
    if(event.touches.length > 1 || event.targetTouches.length > 1) {//忽略两只以上手指放下的情况
      return;
    }
    this.startClientX = event.touches[0].clientX;
    this.startClientY = event.touches[0].clientY;
    event.preventDefault();
  },
  touchend : function (event) {
    if(event.changedTouches.length > 1 || event.touches.length > 0 || event.targetTouches.length > 0) {
      return;
    }
    var endClientX = event.changedTouches[0].clientX,
        endClientY = event.changedTouches[0].clientY,
        dx,
        dy,
        absDx,
        absDy,
        dir;
    dx = endClientX - this.startClientX;
    dy = endClientY - this.startClientY;
    absDx = Math.abs(dx);
    absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) > 10) {
      dir = absDx > absDy ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      this.collection.refresh(dir);
    }
    event.preventDefault();
  }
});