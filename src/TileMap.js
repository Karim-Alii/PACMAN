import Pacman from "./Pacman.js";
import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";
// دا الكلاس اللى بيمثل البورد اللى عليها الباك مان بيجرى
export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.yellowDot = new Image();
    this.yellowDot.src = "../images/yellowDot.png";
    this.wall = new Image();
    this.wall.src = "../images/wall.png";
    this.pinkDot = new Image();
    this.pinkDot.src = "../images/pinkDot.png";

    this.powerDot = this.pinkDot;
    this.powerDotAnimationTimerDefault = 30;
    this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;
  }

  // دى فنكشن بتحدد حجم الكانفاس اللى عملناه كتاج فى الهتمل
  setCanvasSize(canvas) {
    canvas.width = this.map[0].length * this.tileSize;
    canvas.height = this.map.length * this.tileSize;
  }

  // 1 - wall
  //2 - dot
  // 4 - pacman
  // 5 - empty space
  // 6 - enemy
  // 7 - powerDot
  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  //دى فنكشن بترسم الحيطه والنقط بمعلوميه المكان بتاعهم فى الماب الللى فوق دى
  draw(ctx) {
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile === 1) {
          this.#drawWall(ctx, column, row, this.tileSize);
        } else if (tile === 0) {
          this.#drawDot(ctx, column, row, this.tileSize);
        } else if (tile == 7) {
          this.#drawPowerDot(ctx, column, row, this.tileSize);
        } else {
          this.#drawBlank(ctx, column, row, this.tileSize);
        }

        // ctx.strokeStyle = "yellow";
        // ctx.strokeRect(
        //   column * this.tileSize,
        //   row * this.tileSize,
        //   this.tileSize,
        //   this.tileSize
        // );
      }
    }
  }
  // غرقلى الفراغ نقط
  #drawDot(ctx, column, row, size) {
    ctx.drawImage(
      this.yellowDot,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  }
  // ارسملى حيطه واعمل البحر طحينة
  #drawWall(ctx, column, row, size) {
    ctx.drawImage(
      this.wall,
      column * this.tileSize,
      row * this.tileSize,
      size,
      size
    );
  }
  // عشان نغير ما بين القيم بتاعت الباور دوت
  #drawPowerDot(ctx, column, row, size) {
    this.powerDotAnimationTimer--;
    if (this.powerDotAnimationTimer === 0) {
      this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;
      if (this.powerDot == this.pinkDot) {
        this.powerDot = this.yellowDot;
      } else {
        this.powerDot = this.pinkDot;
      }
    }
    ctx.drawImage(this.powerDot, column * size, row * size, size, size);
  }
  // 
  #drawBlank(ctx, column, row, size) {
    ctx.fillStyle = "black";
    ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
  }
  //هنا يتم تخليق المطاريد
  getEnemies(velcoity) {
    const enemies = [];
    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        let tile = this.map[row][column];
        if (tile == 6) {
          this.map[row][column] = 0;
          enemies.push(
            new Enemy(
              column * this.tileSize,
              row * this.tileSize,
              this.tileSize,
              velcoity,
              this
            )
          );
        }
      }
    }
    return enemies;
  }
  // هنا بنرجع قيمة الباك مان كشكل طبعا دا بيعتمد على مكانه فى الاراى
  //بعد كدا بيشوف لو قيمه البلاطه 4 اللى هيا الباك مان نفسه رجعلى اوبجكت من الباك مان نفسه وحطلى فيه القيم اللى مكتوبه فيه
  getPacman(velocity) {
                                                        for (let row = 0; row < this.map.length; row++) {
                                                          for (let column = 0; column < this.map[row].length; column++) {
                                                            let tile = this.map[row][column];
                                                            if (tile === 4) {
                                                              this.map[row][column] = 0;
                                                              return new Pacman(
                                                                column * this.tileSize,
                                                                row * this.tileSize,
                                                                this.tileSize,
                                                                velocity,
                                                                this
                                                              );
                                                            }
                                                          }
                                                        }
                                                      }

  // كل هم الفنكشن دى اننا نحافظ على الباك مان بدل ما يلبس فى الحيط
  didCollideWithEnvironment(x, y, direction) {
    if (direction == null) {
      return;
    }

    if (
      Number.isInteger(x / this.tileSize) &&
      Number.isInteger(y / this.tileSize)
    ) {
      let column = 0;
      let row = 0;
      let nextColumn = 0;
      let nextRow = 0;

      //طبعا هنا الكود كان رخم فى فكرة اننا نتحقق من الصف او العمود اللى جاى
      // بس برضو كله بيتم ب الاراى ترافيرسال ولا عزاء لبتوع ادبى
      switch (direction) {
        case MovingDirection.right:
          nextColumn = x + this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case MovingDirection.left:
          nextColumn = x - this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case MovingDirection.up:
          nextRow = y - this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;
        case MovingDirection.down:
          nextRow = y + this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;
      }
      const tile = this.map[row][column];
      if (tile === 1) {
        return true;
      }
    }
    return false;
  }                                                                               

  eatDot(x, y) {
    // عشان نعرف فين الصف والعمود
    const row = y / this.tileSize;
    const column = x / this.tileSize;
    // لو كان دوت خليه بلانك
    if (Number.isInteger(row) && Number.isInteger(column)) {
      if (this.map[row][column] === 0) {
        this.map[row][column] = 5;
        return true;
      }
    }
    return false;
  }
  didWin() {
    return this.#dotsLeft() === 0;
  }
  // عشان نعرف باقى كام دوت 
  #dotsLeft() {
    return this.map.flat().filter((tile) => tile === 0).length;
  }
  // 
  eatPowerDot(x, y) {
    const row = y / this.tileSize;
    const column = x / this.tileSize;
    if (Number.isInteger(row) && Number.isInteger(column)) {
      const tile = this.map[row][column];
      if (tile === 7) {
        this.map[row][column] = 5;
        return true;
      }
    }
    return false;
  }
}
