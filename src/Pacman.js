import MovingDirection from "./MovingDirection.js";

export default class Pacman {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentMovingDirection = null;
    this.requestedMovingDirection = null;

    this.pacmanAnimationTimerDefault = 10;
    this.pacmanAnimationTimer = null;

    this.pacmanRotation = this.Rotation.right;
    this.wakaSound = new Audio("sounds/waka.wav");

    this.powerDotSound = new Audio("sounds/power_dot.wav");
    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers = [];

    this.eatGhostSound = new Audio("sounds/eat_ghost.wav");

    this.madeFirstMove = false;

    document.addEventListener("keydown", this.#keydown);

    this.#loadPacmanImages();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  draw(ctx, pause, enemies) {
    if (!pause) {
      this.#move();
      this.#animate();
    }
    this.#eatDot();
    this.#eatPowerDot();
    this.#eatGhost(enemies);

    const size = this.tileSize / 2;

    ctx.save();
    ctx.translate(this.x + size, this.y + size);
    ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180);
    ctx.drawImage(
      this.pacmanImages[this.pacmanImageIndex],
      -size,
      -size,
      this.tileSize,
      this.tileSize
    );

    ctx.restore();

    // ctx.drawImage(
    //   this.pacmanImages[this.pacmanImageIndex],
    //   this.x,
    //   this.y,
    //   this.tileSize,
    //   this.tileSize
    // );
  }

  #loadPacmanImages() {
    const pacmanImage1 = new Image();
    pacmanImage1.src = "images/pac0.png";

    const pacmanImage2 = new Image();
    pacmanImage2.src = "images/pac1.png";

    const pacmanImage3 = new Image();
    pacmanImage3.src = "images/pac2.png";

    const pacmanImage4 = new Image();
    pacmanImage4.src = "images/pac1.png";

    this.pacmanImages = [
      pacmanImage1,
      pacmanImage2,
      pacmanImage3,
      pacmanImage4,
    ];

    this.pacmanImageIndex = 0;
  }

  #keydown = (event) => {
    //up
    if (event.keyCode == 38) {
      if (this.currentMovingDirection == MovingDirection.down)
        this.currentMovingDirection = MovingDirection.up;
      this.requestedMovingDirection = MovingDirection.up;
      this.madeFirstMove = true;
    }
    //down
    if (event.keyCode == 40) {
      if (this.currentMovingDirection == MovingDirection.up)
        this.currentMovingDirection = MovingDirection.down;
      this.requestedMovingDirection = MovingDirection.down;
      this.madeFirstMove = true;
    }
    //left
    if (event.keyCode == 37) {
      if (this.currentMovingDirection == MovingDirection.right)
        this.currentMovingDirection = MovingDirection.left;
      this.requestedMovingDirection = MovingDirection.left;
      this.madeFirstMove = true;
    }
    //right
    if (event.keyCode == 39) {
      if (this.currentMovingDirection == MovingDirection.left)
        this.currentMovingDirection = MovingDirection.right;
      this.requestedMovingDirection = MovingDirection.right;
      this.madeFirstMove = true;
    }
  };

  #move() {
    if (this.currentMovingDirection !== this.requestedMovingDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.requestedMovingDirection
          )
        )
          this.currentMovingDirection = this.requestedMovingDirection;
      }
    }

    if (
      this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.currentMovingDirection
      )
    ) {
      this.pacmanAnimationTimer = null;
      this.pacmanImageIndex = 1;
      return;
    } else if (
      this.currentMovingDirection != null &&
      this.pacmanAnimationTimer == null
    ) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
    }

    switch (this.currentMovingDirection) {
      case MovingDirection.up:
        this.y -= this.velocity;
        this.pacmanRotation = this.Rotation.up;
        break;
      case MovingDirection.down:
        this.y += this.velocity;
        this.pacmanRotation = this.Rotation.down;
        break;
      case MovingDirection.left:
        this.x -= this.velocity;
        this.pacmanRotation = this.Rotation.left;
        break;
      case MovingDirection.right:
        this.x += this.velocity;
        this.pacmanRotation = this.Rotation.right;
        break;
    }
  }

  #animate() {
    if (this.pacmanAnimationTimer == null) {
      return;
    }
    this.pacmanAnimationTimer--;
    if (this.pacmanAnimationTimer == 0) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
      this.pacmanImageIndex++;
      if (this.pacmanImageIndex == this.pacmanImages.length)
        this.pacmanImageIndex = 0;
    }
  }

  #eatDot() {
    if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
      this.wakaSound.play();
    }
  }

  #eatPowerDot() {
    if (this.tileMap.eatPowerDot(this.x, this.y)) {
      this.powerDotSound.play();
      this.powerDotActive = true;
      this.powerDotAboutToExpire = false;
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];

      let powerDotTimer = setTimeout(() => {
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
      }, 1000 * 6);

      this.timers.push(powerDotTimer);

      let powerDotAboutToExpireTimer = setTimeout(() => {
        this.powerDotAboutToExpire = true;
      }, 1000 * 3);

      this.timers.push(powerDotAboutToExpireTimer);
    }
  }

  #eatGhost(enemies) {
    if (this.powerDotActive) {
      const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
      collideEnemies.forEach((enemy) => {
        enemies.splice(enemies.indexOf(enemy), 1);
        this.eatGhostSound.play();
      });
    }
  }
}






// import MovingDirection from "./MovingDirection.js";

// export default class Pacman {
//   constructor(x, y, tilesize, velcoity, tileMap) {
//     //انهى صف وانهى عمود ماشيين فيهم

//     this.x = x;
//     this.y = y;
//     //دا حجم المربع اللى بنمشى فيه وطبعا دا 32
//     this.tilesize = tilesize;
//     // سرعة الباك مان
//     this.velcoity = velcoity;
//     // الباك مان لازم يعرف عن الماب نفسها وياخد منها ريفرنس عشان لو هيلبس فى حيطه نوقفه
//     this.tileMap = tileMap;

//     // دول عشان نعرف احنا رايحين فين وجايين منين
//     this.currentMovingDirection = null;
//     this.requestedMovingDirection = null;

//     // دول عشان القيمة بتاعت الكاونتر والقيمة اللى يعمل تشيك عليها
//     this.pacmanAnimationTimerDefault = 10;
//     this.pacmanAnimationTimer = null;

//     this.pacmanRotation = this.Rotation.right; 

//     this.madeFirstMove = false;
//     this.timers = [];
//     this.eatGhostSound = new Audio("sounds/eat_ghost.wav");
//     this.wakaSound  = new Audio("../sounds/waka.wav")
//     this.powerDotSound  = new Audio("../sounds/power_dot.wav")


//     this.powerDotActive= false
//     this.powerDotAboutToExpire  = false

//     document.addEventListener("keydown", this.#keydown);

//     this.#loadPacmanImages();
//   }

//   Rotation = {
//     right: 0,
//     down:1,
//     left:2,
//     up:3
//   }

//   // دى الفانكشن الادارة
//   draw(ctx, pause, enemies) {
//     if (!pause) {
//       this.#move();
//       this.#animate();
//     }
//     this.#eatDot();
//     this.#eatPowerDot();
//     this.#eatGhost(enemies);

//     const size = this.tileSize / 2;

//     ctx.save();
//     ctx.translate(this.x + size, this.y + size);
//     ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180);
//     ctx.drawImage(
//       this.pacmanImages[this.pacmanImageIndex],
//       -size,
//       -size,
//       this.tileSize,
//       this.tileSize
//     );

//     ctx.restore();

//     // ctx.drawImage(
//     //   this.pacmanImages[this.pacmanImageIndex],
//     //   this.x,
//     //   this.y,
//     //   this.tileSize,
//     //   this.tileSize
//     // );
//   }

//   // عندنا شويه صور وبنقلب ما بينهم وحركات بقا طبعا دى هنستعملها عشان نعمل انيميشن للباك مان
//   //شغل مالتي ميديا يا بقالين
//   #loadPacmanImages() {
//     const pacmanImage1 = new Image();
//     pacmanImage1.src = "../images/pac0.png";
//     const pacmanImage2 = new Image();
//     pacmanImage2.src = "../images/pac1.png";
//     const pacmanImage3 = new Image();
//     pacmanImage3.src = "../images/pac2.png";
//     const pacmanImage4 = new Image();
//     pacmanImage4.src = "../images/pac1.png";

//     this.pacmanImages = [
//       pacmanImage1,
//       pacmanImage2,
//       pacmanImage3,
//       pacmanImage4,
//     ];
//     this.pacmanImageIndex = 1;
//   }
//   // عشان ناخد دوسة الكيبورد وطبعا اخدنا الاسهم مش من
//   //WASD
//   // لأن دى جيم كلاسيك ومكنش ظهر لسه القيمرز بتوع ال
//   // WASD

//   #keydown = (event) => {
//     //up
//     if (event.keyCode == 38) {
//       if (this.currentMovingDirection == MovingDirection.down)
//         this.currentMovingDirection = MovingDirection.up;
//       this.requestedMovingDirection = MovingDirection.up;
//       this.madeFirstMove = true;
//     }
//     //down
//     if (event.keyCode == 40) {
//       if (this.currentMovingDirection == MovingDirection.up)
//         this.currentMovingDirection = MovingDirection.down;
//       this.requestedMovingDirection = MovingDirection.down;
//       this.madeFirstMove = true;
//     }
//     //left
//     if (event.keyCode == 37) {
//       if (this.currentMovingDirection == MovingDirection.right)
//         this.currentMovingDirection = MovingDirection.left;
//       this.requestedMovingDirection = MovingDirection.left;
//       this.madeFirstMove = true;
//     }
//     //right
//     if (event.keyCode == 39) {
//       if (this.currentMovingDirection == MovingDirection.left)
//         this.currentMovingDirection = MovingDirection.right;
//       this.requestedMovingDirection = MovingDirection.right;
//       this.madeFirstMove = true;
//     }
//   };

//   // دى فانكشن كل همها تشوفه هل هيلبس فى حيطه ولا لا وعلى اساسه تزود مكانه ويتحرك
//   #move() {
//     if (this.currentMovingDirection !== this.requestedMovingDirection) {
//       if (
//         Number.isInteger(this.x / this.tilesize) &&
//         Number.isInteger(this.y / this.tilesize)
//       ) {
//         // لو مش هنلبس فى حيطه يبقا دوس يا معلم وروح فى الاتجاه اللى انت عايزة
//         if (
//           !this.tileMap.didCollideWithEnvironment(
//             this.x,
//             this.y,
//             this.requestedMovingDirection
//           )
//         )
//           this.currentMovingDirection = this.requestedMovingDirection;
//       }
//     }
//     // لف وارجع تانى لف وارجع تانى
//     if (
//       this.tileMap.didCollideWithEnvironment(
//         this.x,
//         this.y,
//         this.currentMovingDirection
//       )
//     ) {
//       this.pacmanAnimationTimer = null;
//       this.pacmanImageIndex = 1; 
//       return;
//     }

//     else if (this.currentMovingDirection!= null && this.pacmanAnimationTimer == null) {
//       this.pacmanAnimationTimer =this.pacmanAnimationTimerDefault;
//     }


//     // switch
//     // دى بقا حكايتها حكايه
//     //بنشوف لو نحن ماشيين فى اى اتجاه وبعد كدا نشوف انت عايز تمشى ازاى
//     //مثلا لو هتطلع لفوق يبقا بتنقص من الصف
//     switch (this.currentMovingDirection) {
//       case MovingDirection.up:
//         this.y -= this.velcoity;
//         this.pacmanRotation = this.Rotation.up;
//         break;
//       case MovingDirection.down:
//         this.y += this.velcoity;
//         this.pacmanRotation = this.Rotation.down;
//         break;
//       case MovingDirection.left:
//         this.x -= this.velcoity;
//         this.pacmanRotation = this.Rotation.left;
//         break;
//       case MovingDirection.right:
//         this.x += this.velcoity;
//         this.pacmanRotation = this.Rotation.right;
//         break;
//       default:
//         break;
//     }
//   }
//   #animate() {
//     if (this.pacmanAnimationTimer == null) {
//       return;
//     }
//     this.pacmanAnimationTimer--;
//     if (this.pacmanAnimationTimer == 0) {
//       this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
//       this.pacmanImageIndex++;
//       if (this.pacmanImageIndex == this.pacmanImages.length) {
//         this.pacmanImageIndex = 0;
//       }
//     }
//   }

//   #eatDot(){
//     if (this.tileMap.eatDot(this.x,this.y)) {
//       //this.wakaSound.play();
//     }
//   }
//   #eatPowerDot(){
// if (this.tileMap.eatPowerDot(this.x,this.y)) {
//   this.powerDotSound.play();
//   this.powerDotActive = true
//   this.powerDotAboutToExpire = false
//   this.timers.forEach(timer => {clearTimeout(timer)});
//   let powerDotTimer = setTimeout(()=>{
//     this.powerDotAboutToExpire = false
//     this.powerDotActive = false
//   },1000*6)


//   this.timers.push(powerDotTimer)
//   let powerDotAboutToExpireTimer = setTimeout(()=>{this.powerDotAboutToExpire = true},1000*3)
//   this.timers.push(powerDotAboutToExpireTimer)
// } 
//     // the ghost will become blue  
// }



// #eatGhost(enemies) {
//   if (this.powerDotActive) {
//     const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
//     collideEnemies.forEach((enemy) => {
//       enemies.splice(enemies.indexOf(enemy), 1);
//       this.eatGhostSound.play();
//     });
//   }
// }
// }