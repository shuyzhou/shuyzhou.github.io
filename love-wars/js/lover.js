(function() {
    var startMenu = document.querySelector("#startMenu");
    var overMessage = document.querySelector("#overMessage");
    var configMenu = document.querySelector("#configMenu");
    var audio = document.querySelector("#audio");
    var multiple = 1;
    //to ensure background music can be played before game start
    document.addEventListener('touchstart',function() {
        audio.play();
        document.removeEventListener('touchstart', arguments.callee);
    },false);
    startMenu.addEventListener('click',function(e) {
        var target = e.target;
        if (target.id === 'start') {
            start('normal');
        }
        if (target.id === 'endless') {
            start('endless');
        }
        if (target.id === 'config') {
            configMenu.style.display = 'block';
        }
    });
    overMessage.addEventListener('click',function(e) {
        var target = e.target;
        if (target.id === 'back') {
            overMessage.style.display = 'none';
            canvas.style.display = 'none';
            startMenu.style.display = 'block';
        }
    });
    configMenu.addEventListener('click',function(e) {
        var target = e.target;
        if (target.nodeName.toLowerCase() === 'input') {
            var value = target.value;
            switch (value) {
            case 'on':
                audio.play();
                break;
            case 'off':
                audio.pause();
                break;
            case 'normal':
                multiple = 1;
                break;
            case 'faster':
                multiple = 2;
                break;
            }
        }
        if (target.className === 'close') {
            configMenu.style.display = 'none';
        }
    })
    //run after start button was clicked
    function start(mode) {
        var w = window,
            requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame || function(fn) {
                    setTimeout(fn, 17);
                },
            // Create the canvas
            canvas = document.querySelector("#canvas"),
            ctx = canvas.getContext("2d"),
            heartWidth = 38,
            heartHeight = 32,
            stoolWidth = 32,
            stoolHeight = 36,
            //score and time for normal mode and lives for endless mode
            score = 0,
            time = 20,
            lives = 3,
            //store setInterval Id
            tick1,
            tick2;
        // lover image
        var loverReady = false;
        var loverImage = new Image();
        loverImage.onload = function() {
            loverReady = true;
        };
        loverImage.src = "images/meson.png";
        // stool image
        var stoolReady = false;
        var stoolImage = new Image();
        stoolImage.onload = function() {
            stoolReady = true;
        };
        stoolImage.src = "images/stool.png";
        // heart image
        var heartReady = false;
        var heartImage = new Image();
        heartImage.onload = function() {
            heartReady = true;
        };
        heartImage.src = "images/heart.png";

        startMenu.style.display = 'none';
        canvas.width = 320;
        canvas.height = 500;
        canvas.style.display = 'inline';
        //funtion to detect if two rectangle overlaped
        var detectRectOverlap = function(A, B, C, D, E, F, G, H) {
            C += A,
            D += B,
            G += E,
            H += F;
            if (C <= E || G <= A || D <= F || H <= B) return [0, 0, 0, 0];

            var tmpX, tmpY;

            if (E > A) {
                tmpX = G < C ? [E, G] : [E, C];
            } else {
                tmpX = C < G ? [A, C] : [A, G];
            }

            if (F > B) {
                tmpY = H < D ? [F, H] : [F, D];
            } else {
                tmpY = D < H ? [B, D] : [B, H];
            }
            return [tmpX[0], tmpY[0], tmpX[1], tmpY[1]];
        };
        // functin to detect overlap in pixel
        var detectImgOverlap = function(a, b, rect) {
            //return if image not ready
            if (!loverReady || !heartReady) {
                return false;
            }
            var canvas = document.createElement('canvas');
            var _ctx = canvas.getContext('2d');

            _ctx.drawImage(a.img, 0, 0, a.width, a.height);
            // 相对位置
            var data1 = _ctx.getImageData(rect[0] - a.x, rect[1] - a.y, rect[2] - rect[0], rect[3] - rect[1]).data;
            _ctx.clearRect(0, 0, b.width, b.height);
            _ctx.drawImage(b.img, 0, 0, b.width, b.height);
            var data2 = _ctx.getImageData(rect[0] - b.x, rect[1] - b.y, rect[2] - rect[0], rect[3] - rect[1]).data;
            canvas = null;

            for (var i = 3; i < data1.length; i += 4) {
                if (data1[i] > 0 && data2[i] > 0) {
                    if (a.name === 'heart') {
                        score += a.score;
                    }
                    if (a.name === 'stool') {
                        lives--;
                    }
                    return true; // 碰撞
                }
            }
            return false;
        }
        //lover object
        var lover = {
            x: canvas.width / 2 - 50,
            y: canvas.height - 100,
            width: 100,
            height: 100,
            move: false,
            originX: -1,
            img: loverImage
        };
        //heart constructor
        var Obj = function() {
            /*code to initialize object to default values*/
            this.reset();
            this.speed = 5 * multiple;
            this.score = 1;
        };
        Obj.prototype = {
            constructor: Obj,
            spawn: function(x, y, w, h, img, name) {
                //Spawn an object into activated
                this.x = x;
                this.y = y;
                this.width = w;
                this.height = h;
                this.img = img;
                this.name = name;
                this.isActivated = true;
            },
            fall: function() {
                /*update the object. Return true if the object is ready to be
                * reseted , otherwise return false.
                */
                if ((this.y + this.height >= canvas.height) || this.isCollision(lover)) {
                    return true;
                } else {
                    this.y = this.y + this.speed;
                    return false;
                }
            },
            isCollision: function(obj) {
                var rect = detectRectOverlap(this.x, this.y, this.width, this.height, obj.x, obj.y, obj.width, obj.height);
                if ((rect[2] - rect[0]) * (rect[3] - rect[1]) > 0) {
                    return detectImgOverlap(this, obj, rect);
                } else {
                    return false;
                }
            },
            reset: function() {
                /*code to reset values*/
                this.x = -1;
                this.y = -1;
                this.width = 0;
                this.height = 0;
                this.img = null;
                this.isActivated = false;
            },
            draw: function() {
                /*draw img*/
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            }
        }
        //The Object Pool
        var Pool = function() {
            var size = 20; // Max objects allowed in the pool
            var pool = [];
            this.init = function() {
                for (var i = 0; i < size; i++) {
                    // Initialize the objects
                    var heart = new Obj();
                    pool[i] = heart;
                }
            };
            this.get = function(x, y, w, h, img, name) {
                // If the last item in the array is activated, the pool is full
                if (!pool[size - 1].isActivated) {
                    pool[size - 1].spawn(x, y, w, h, img, name);
                    pool.unshift(pool.pop());
                }
            };
            /*
            * Update any alive objects in the pool. If the call returns true,
            * the object is ready to be reset and activate.
            */
            this.update = function() {
                for (var i = 0; i < size; i++) {
                    // Only update objects that are currently activated
                    if (pool[i].isActivated) {
                        if (pool[i].fall()) {
                            pool[i].reset();
                            pool.push((pool.splice(i, 1))[0]);
                        }
                    } else {
                        // The first occurrence of an inactivated item we can
                        // break looping over the objects.
                        break;
                    }
                }
            };
            //draw heart
            this.draw = function() {
                for (var i = 0; i < size; i++) {
                    // Only draw objects that are currently activated
                    if (pool[i].isActivated) {
                        pool[i].draw();
                    } else {
                        // The first occurrence of an inactivated item we can
                        // break looping over the objects.
                        break;
                    }
                }
            };
        }
        //to move lover
        var hammertime = new Hammer(canvas);
        hammertime.on('panstart pan panend',function(ev) {
            var point = ev.center;
            var type = ev.type;
            //store the original x when transition start
            if (type === 'panstart') {
                if (point.x >= lover.x && point.x <= (lover.x + lover.width) && point.y >= lover.y && point.y <= (lover.y + lover.height)) {
                    lover.move = true;
                    lover.originX = lover.x;
                }
            }
            if (type === 'pan') {
                if (lover.move) {
                    lover.x = ((lover.originX + ev.deltaX) < (canvas.width - lover.width)) ? lover.originX + ev.deltaX: canvas.width - lover.width;
                    lover.x = lover.x > 0 ? lover.x: 0;
                }
            }
            if (type === 'panend') {
                if (lover.move) {
                    lover.move = false;
                    lover.originX = -1;
                }
            }
        });
        //instance of a obj pool
        var collection = new Pool();
        //add a heart
        var addObject = function() {
            var x = Math.random() * (canvas.width - heartWidth);
            var y = 10;
            if (mode === 'endless' && Math.random() > 0.8) {
                collection.get(x, y, stoolWidth, stoolHeight, stoolImage, 'stool');
            } else {
                collection.get(x, y, heartWidth, heartHeight, heartImage, 'heart');
            }
        };
        var render = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (loverReady) {
                ctx.drawImage(loverImage, lover.x, lover.y, lover.width, lover.height);
            }
            if (heartReady) {
                collection.draw();
            }
            // Score
            ctx.fillStyle = "rgb(250, 250, 250)";
            ctx.font = "24px Microsoft YaHei";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("得分: " + score, 32, 32);
            // Time
            if (mode === 'normal') {
                ctx.textAlign = "right";
                ctx.fillText("剩余时间: " + time + '秒', canvas.width - 32, 32);
            }
            //lives
            if (mode === 'endless') {
                ctx.textAlign = "right";
                ctx.fillText("剩余生命: " + lives, canvas.width - 32, 32);
            }
        };
        var over = function() {
            var mark = document.querySelector('#score');
            var max = document.querySelector('#best');
            var best;
            if (!localStorage.best) {
                localStorage.best = JSON.stringify({
                    normal: -1,
                    endless: -1
                });
            };
            best = JSON.parse(localStorage.best);
            if (mode === 'normal') {
                if (best.normal < score) {
                    best.normal = score;
                    localStorage.best = JSON.stringify(best);
                    best = score;
                } else {
                    best = best.normal;
                }
            };
            if (mode === 'endless') {
                if (best.endless < score) {
                    best.endless = score;
                    localStorage.best = JSON.stringify(best);
                    best = score;
                } else {
                    best = best.endless;
                }
            }
            mark.innerHTML = '该局分数：' + score;
            max.innerHTML = '最高分数：' + best;
            clearInterval(tick1);
            if (mode === 'normal') {
                clearInterval(tick2);
            }
            overMessage.style.display = 'block';
        }
        var run = function() {
            render();
            if (mode === 'normal' && time === 0 || mode === 'endless' && lives === 0) {
                over();
                return;
            }
            collection.update();
            // Request to do this again
            requestAnimationFrame(run);
        };
        //main function to run game
        var main = function() {
            collection.init();
            tick1 = setInterval(addObject, 500);
            if (mode === 'normal') {
                tick2 = setInterval(function() {
                    time--;
                },
                1000);
            }
            run();
        };
        // Let's play this game!
        main();
    }
} ())