import {
  BUG_HEIGHT,
  BUG_WIDTH,
  FONT_FAMILY,
  X_MAX,
  Y_MAX
} from "./global";

export default class Level extends Phaser.Scene {
  // marvin properties
  private isMarvinAlive: boolean = true;

  // marvin and bug physics object(s)
  private bugs: Phaser.Physics.Arcade.Group;
  private marvin: Phaser.Physics.Arcade.Sprite & {
    body: Phaser.Physics.Arcade.Body;
  };


  constructor() {
    super("Level");
    this.addOneEnemy = this.addOneEnemy.bind(this);
  }

  preload() {
    this.load.svg("marvin", "assets/marvin.svg");
    this.load.svg("bug", "assets/bug.svg");
    this.isMarvinAlive = true;
  }

  create() {
    // ** NOTE: create() is only called the first time the scene is created
    // it does not get called when scene is restarted or reloaded
    this.setMarvin();
    this.setEnemies();
    this.physics.add.overlap(this.bugs, this.marvin, () => null);
    setInterval(this.addOneEnemy, 3000);
  }

  update() {
    if (!this.marvin.body.touching.none) {
      // marvin has touched a bug
      this.marvinDeath();
    }
    if (this.isMarvinAlive) {
      this.setMarvinMovement();
    }
  }

  private setMarvin() {
    this.marvin = this.physics.add.image(X_MAX / 2, Y_MAX, "marvin") as any;
    this.marvin.setCollideWorldBounds(true);
  }


  private setEnemies() {

    this.bugs = this.physics.add.group();
  }

  private setMarvinMovement() {
    const cursorKeys = this.input.keyboard.createCursorKeys();

    if (cursorKeys.right.isDown) {
      this.marvin.body.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      this.marvin.body.setVelocityX(-500);
    } else {
      this.marvin.body.setVelocity(0);
    }
  }

  private addOneEnemy(): any {
    //TODO: when marvin touches an ennemy, the ennemy disappears
    if (this.isMarvinAlive) {
      const x = Phaser.Math.Between(10, 750)
      var bug = this.bugs.create(x, 10, 'bug');
      bug.setVelocity(0, 70);
      bug.allowGravity = false;
    }

    return;
  }

  private stopEnemies(enemyGroup: Phaser.Physics.Arcade.Group) {
    Phaser.Actions.Call(
      enemyGroup.getChildren(),
      (go: any) => {
        go.setVelocityX(0);
      },
      this
    );
  }

  /**
   * Triggers marvin death as well as stops all movement and sets up
   * game over screen
   */
  private marvinDeath() {
    this.isMarvinAlive = false;
    this.stopEnemies(this.bugs);
    this.marvin.body.setVelocityX(0);

    this.cameras.main.shake(100);

    // add game over screen
    this.setGameOverScreen();
  }

  private setGameOverScreen() {
    const gameOver = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2 - 100,
      "GAME OVER",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "50px",
        fill: "#fff"
      }
    );
    gameOver.setOrigin(0.5);

    const mainMenuTxt = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      "Main Menu",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "25px",
        fill: "#59311f"
      }
    );
    mainMenuTxt.setOrigin(0.5);

    mainMenuTxt
      .setInteractive()
      .on("pointerover", () => this.input.setDefaultCursor("pointer"))
      .on("pointerout", () => this.input.setDefaultCursor("auto"))
      .on("pointerdown", () => this.scene.start("MainMenu"));

    const tryAgainTxt = this.add.text(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2 + 40,
      "Try Again",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "25px",
        fill: "#59311f"
      }
    );
    tryAgainTxt.setOrigin(0.5);

    tryAgainTxt
      .setInteractive()
      .on("pointerover", () => this.input.setDefaultCursor("pointer"))
      .on("pointerout", () => this.input.setDefaultCursor("auto"))
      .on("pointerdown", () => this.restart());
  }

  private restart() {
    this.scene.restart();
    this.isMarvinAlive = true;
  }
}
