var TileCollection = Backbone.Collection.extend({
  model: Tile,
  localStorage: new Backbone.LocalStorage("tiles"),
  init: function () {
    this.size = 4;
    this.win = false;
    this.over = false;
    this.score = 0;
    this.trigger("score",this.score);
  	this.newTile();
  	this.newTile();
  },
  newTile: function () {
  	var cell = this.randomAvailableCell();
    this.create({row : cell.row,column : cell.column});
  },
  randomAvailableCell : function () {
  	var cells = this.availableCells();
  	if (cells.length) {
    	return cells[Math.floor(Math.random() * cells.length)];
  	}
  },
  availableCells : function () {
  	var cells = [];
  	for(var row = 0;row < this.size; row++){
  		for (var column = 0; column < this.size; column++) {
  			if(this.cellOccupied(row,column))
  			{
  				continue;
  			}
  			cells.push({ row: row, column: column });
  		}
  	}
  	return cells;
  },
  cellOccupied : function (row,column) {
  	return this.some(function (tile) {
   		return (tile.get("row") == row)&&(tile.get("column") == column);
  	});
  },
  getTile : function (row,column) {
    return this.where({row : row , column : column})[0];
  },
  refresh : function (dir) {
    var tiles = {};
    var vector = this.getVector(dir);
    var moved;
    if(this.win||this.over)
    {
      return;
    }
    tiles = this.group(vector);
    tiles = this.sort(tiles,vector);
    moved = this.traverse(tiles,vector);
    if(moved){
      this.newTile();
      if (!this.movesAvailable()) {
        this.over = true; // Game over!
        this.trigger("over","Game over!");
      }
    }
  },
  movesAvailable : function () {
    //判断是否能继续移动
    return this.cellsAvailable() || this.tileMatchesAvailable();
  },
  cellsAvailable : function () {
    return !!this.availableCells().length;
  },
  tileMatchesAvailable : function () {
    var tile;
    var direction = ["up" , "down" , "left" , "right"];
    for (var row = 0; row < this.size; row++) {
      for (var column = 0; column < this.size; column++) {
        tile = this.getTile(row,column);

        if (tile) {
          for (var dir = 0; dir < 4; dir++) {
            var vector = this.getVector(direction[dir]);
            var cell   = { row: row + vector.row, column: column + vector.column };

            var other  = this.getTile(cell.row,cell.column);

            if (other && other.get("value") === tile.get("value")) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  },
  traverse :function (tiles,vector) {
    var moved = false;
    for (var i = 0; i < 4; i++) {
      var temp = tiles[i];
      if(!temp)
        continue;
      for (var j = 0; j < 4; j++) {
        if(temp[j])
        {
          temp[j].set("merged",false);
          if(this.move(temp[j],vector)){
            moved = true;
          }
        };
      }
    }
    if(this.win)
    {
      this.trigger("win","You win!");
    }
    return moved;
  },
  move : function (tile,vector) {
    var dest = this.findFarthestPosition({row : tile.get("row") , column : tile.get("column")},vector),
        farthest = dest.farthest,
        next = this.findTile(dest.next),
        moved;
    if(!!next && !next.get("merged") && next.get("value") === tile.get("value"))
    {
      this.merge(tile,next);
      moved = true;
    }
    else if(tile.get("row") !== farthest.row||tile.get("column") !== farthest.column)
    {
      tile.set({"row" : farthest.row ,"column" : farthest.column});
      moved = true;
    }
    else
    {
      moved = false;
    }
    return moved;
  },
  merge : function (src,tar) {
    var value = 2*tar.get("value");
    if(value === 2048)
      this.win = true;
    src.destroy();
    tar.set("value",value);
    tar.set("merged","true");
    tar.trigger("merge");
    this.score = this.score + value;
    this.trigger("score",this.score);
  },
  findTile : function (cell) {
    if(this.withinBounds(cell))
    {
      return this.find(function (tile) {
        return (tile.get("row") == cell.row)&&(tile.get("column") == cell.column);
      });
    }
    else
    {
      return null;
    }
  },
  findFarthestPosition : function (cell,vector) {
    var previous;
    do
    {
      previous = cell;
      cell = {row : cell.row + vector.row , column : cell.column + vector.column};
    }
    while(this.withinBounds(cell) && !this.cellOccupied(cell.row,cell.column));
    return {
      farthest : previous,
      next : cell
    };
  },
  withinBounds : function (position) {
    return position.row >= 0 && position.row < this.size &&
         position.column >= 0 && position.column < this.size;
  },
  sort : function (tiles,vector) {
    var dir,param;
    if(vector.column == 0)
      dir = "row";
    else
      dir = "column";
    if(vector.row == 1||vector.column == 1)
      param = -1;
    else
      param = 1;
    for (var i = 0; i < 4; i++) {
      if(tiles[i]){
        tiles[i] = _.sortBy(tiles[i],function (tile) {
          return param*tile["attributes"][dir];
        });
      }
    };
    return tiles;
  },
  group : function (vector) {
    var tiles ={},dir;
    if(vector.column == 0)
      dir = "column";
    else
      dir = "row";
    tiles = this.groupBy(function (tile) {
      return tile["attributes"][dir];
    });
    return tiles;
  },
  getVector : function (dir) {
    var map = {
      up : { row : -1, column : 0},
      down : { row : 1, column : 0},
      left : { row : 0, column : -1},
      right : { row : 0, column : 1}
    };
    return map[dir];
  }
});
