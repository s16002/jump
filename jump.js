"use strict";

/**
 * jump アクションするなにか
 */
window.addEventListener('DOMContentLoaded', function () {
    console.log("jump.js loaded!");
    // 定数値などを定義
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    const SPF = 1000 / 30;
		const PLAYER_SPEED = 6;
		const GRAVITY = 3;
		
		//変数を定義 (追加
		/*
		let up = false;
		let down = false;
		let left = false;
		let right = false;
		*/

		let cursorKey = 0x00;
		let jumpPower = 0;


    // 各クラスの定義
    /**
     * プレイヤーキャラクター
     */
    class Player {
        /**
         * コンストラクタ。画像を指定してください
         * @param image 画像ファイルのパス
         * @param width 画像内の1フレームあたりの横幅
         * @param height 画像内の1フレームあたりの縦幅
         */
        constructor(image, width, height) {
            this.pos = {'x': 0, 'y': 0};
            this.size = {'width': width, 'height': height};
            this.maxFrame = 0;
            this.image = new Image();
            this.image.src = image;
            // コールバック(onLoadImage関数)で意図したthisを参照できるようにアロー演算子を使った匿名関数を使用します。
            this.image.addEventListener("load", evt => this.onLoadImage(evt));
            this.frame = 0;
            this.isFrameIncrement = true;
            this.direction = 0;
						this.isGround = false;
        }

        /**
         * 画像読み込み完了後のコールバック
         * @param evt
         */
        onLoadImage(evt) {
            this.maxFrame = Math.ceil(this.image.width / this.size.width);
            // この関数が実行されるまでにframeの値が
            if (this.maxFrame > 0) {
                this.frame = 0;
            }
        }

        /**
         * 移動距離(移動先座標との差)を指定して移動します。
         * @param x
         * @param y
         */
        moveBy(x, y) {
            //とりあえずフレームを進める
            if (this.isFrameIncrement) {
                this.frame += 1;
            } else {
                this.frame -= 1;
            }
            //フレームの範囲を超えてないかチェックしてフラグを切り替える
            if (this.frame < 0) {
                this.frame = 0;
                this.isFrameIncrement = true;
            } else if (this.frame >= this.maxFrame) {
                this.frame = this.maxFrame - 1;
                this.isFrameIncrement = false;
            }
						//キャラクターの向きを変える
			if (x > 0) {
				this.direction = 1;
			}
			else if (x < 0) {
				this.direction = 0;
			}

			this.pos.x += x;
     	this.pos.y -= y;

      if(this.pos.x < 0) {
 	    	this.pos.x = 0;
      }
      else if (this.pos.x > canvas.width) {
      	this.pos.x = canvas.width;
			}
			if (this.pos.y < 0){
      	this.pos.y = 0;
			}
			else if(this.pos.y > canvas.height - this.size.height){
				this.pos.y = (canvas.height - this.size.height);
				this.isGround = true;
			}
				}

        /**
         * 描画処理をする
         * @param ctx CanvasRenderingContext2D
         */
        draw(ctx) {
            // 座標計算
            let sx = this.size.width * this.frame;
            let sy = this.size.height * this.direction;
            ctx.save();
            ctx.drawImage(this.image,
                sx, sy, this.size.width, this.size.height,
                this.pos.x, this.pos.y, this.size.width, this.size.height);
            ctx.restore();
        }
    }

    // 必要なクラスのインスタンス生成
    let spriteList = [];


    let player = new Player("img/player.png", 40, 60);
    player.moveBy(100, 100);
    spriteList.push(player);

		// 関数設定
		let keydown_processor = function(evt) {
			switch(evt.code) {
				case "ArrowLeft":
					cursorKey |= 0x08;
					break;
				case "ArrowTop":
					cursorKey |= 0x04;
					break;
				case "ArrowRight":
					cursorKey |= 0x02;
					break;
				case "ArrowDown":
					cursorKey |= 0x01;
					break;
				case "Space":
					if(jumpPower == 0){
						jumpPower = 10;
						player.isGround = false;
					}
					break;
				default:
					return;
			}
			evt.preventDefault();
		};

		let keyup_processor = function(evt) {
			switch(evt.code) {
				case "ArrowLeft":
					cursorKey &= 0x07;
					break;
				case "ArrowTop":
					cursorKey &= 0x0B;
					break;
				case "ArrowRight":
					cursorKey &= 0x0D;
					break;
				case "ArrowDown":
					cursorKey &= 0x0E;
					break;
				case "Space":
					if (jumpPower > 0) {
						jumpPower /=3;
					}
					break;
				default:
					return;
			}
			evt.preventDefault();
		};

		let playerMove = function() {
			// キーが押されても完全に動かない
			if (cursorKey == 0x0F){
				return;
			}
			// 左右の動き
			if((cursorKey | 0x02) == 0x02) {
				player.moveBy(5,0);
			}
			else if ((cursorKey & 0x0A) == 0x08) {
				//左へ
				player.moveBy(-5,0);
			}
		};


		document.addEventListener("keydown", keydown_processor);
		document.addEventListener("keyup", keyup_processor);


		// main loop
    let main_loop = function () {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				playerMove();
				if(player.isGround){
					jumpPower = 0;
				}else{
					jumpPower -= GRAVITY;	
					player.moveBy(0,jumpPower);
				}
				
      	spriteList.forEach(function (sprite) {
            sprite.draw(ctx);
        }, this);

        window.setTimeout(main_loop, SPF);
    };
    window.setTimeout(main_loop, SPF);

});

