// 分离 view 层与游戏逻辑，后者可以不依赖环境（浏览器，node）
// 棋盘上的状态。可能会对它 move 
class OthelloPattern {
  constructor() {
    // this.board = [
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 1, 2, 0, 0, 0],
    //   [0, 0, 0, 2, 1, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    // ];
    this.board = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 2, 0],
      [0, 0, 0, 0, 0, 0, 2, 2],
      [0, 0, 0, 0, 0, 2, 2, 2],
    ];
    this.curColorValue = 1;
  }

  // colone(){} 如果需要回退功能，需要记录每次的 pattern。
  checkPass() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        // 检测当前棋盘状态的每个位置，是否有任一位置可以落子
        if (this.move(x, y, true)) {
          return false;
        }
      };
    };
    this.curColorValue = 3 - this.curColorValue;
    return true;
  }
  // 不存储状态，把当前选手颜色作为参数传入
  move(x, y, checkOnly = false) {
    if (this.board[y][x]) return false;

    let originalX = x, originalY = y;
    // 类似的逻辑在 8 个方向上，为了不重复 8 次，用把逻辑抽象出来
    // 处理几何相关问题时常用向量思想
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ];

    let canCapture = false;
    // 八个方向 while true +  break
    for (const direction of directions) {
      x = originalX; // 每个方向的判断开始时都需要重置 x y 值
      y = originalY;
      let directionCanCapture = false;
      let directionHasOpposite = false;
      // 开始每个方向的判断
      while (true) {
        x += direction[0];
        y += direction[1];
        // 出界
        if (x < 0 || x > 7 || y < 0 || y > 7) {
          break;
        }
        // 找能吃的子
        if (this.board[y][x] === 3 - this.curColorValue) {
          directionHasOpposite = true;
        }
        if (this.board[y][x] === this.curColorValue) {
          if (directionHasOpposite) {
            directionCanCapture = true;
          }
          break;
        }
        if (this.board[y][x] === 0) {
          break;
        }
      }
      // 上一个 while 可能找出了该方向上能吃的点
      if (directionCanCapture && !checkOnly) {
        while (true) { // 类似的，如果能吃，现在在远端同色点，必须先退一步到异色点，才能吃子改色。先变 x 再用其值，所以while true => x+=n => 判断 x => 用x值操作
          x -= direction[0];
          y -= direction[1];
          if (x === originalX && y === originalY) {
            break;
          }
          this.board[y][x] = this.curColorValue;
        }
      }
      // canCapture 的更新发生在每次方向判断里，无论是否是 checkOnly 模式
      canCapture = canCapture || directionCanCapture;
    }
    if (canCapture && !checkOnly) {
      this.board[originalY][originalX] = this.curColorValue;
      this.curColorValue = 3 - this.curColorValue; // switch bewteen 1 and 2 
    }
    // 8 个方向中是否有可以吃对方子的地方，若有，当前点位可以落子
    return canCapture;
  }
}

// 可以 Hold 一些 Pattern 的实例
class OthelloGame {
  constructor() {
    this.pattern = new OthelloPattern();
  }

  judge(pattern) {
    // 得到黑白棋子分别的个数
    const [black, white] = pattern.board.reduce(([black, white], line) => {
      const [curB, curW] = line.reduce(([b, w], grid) => {
        if (grid === 1)++b;
        if (grid === 2)++w;
        return [b, w];
      }, [0, 0]);

      return [black += curB, white += curW]
    }, [0, 0])

    let result;
    if (black > white) {
      result = 'black wins';
    } else if (black < white) {
      result = 'white wins';
    } else {
      result = "draw";
    }
    alert(`Black: ${black}, white: ${white}. The result is ${result}`);
  }

  move(x, y) {
    this.pattern.move(x, y);

    if (this.pattern.checkPass()) {
      console.log('passed');
      // 当前选手本轮无子可走，pass
      if (this.pattern.checkPass()) {
        // 连着 pass 两次，双方都没得走了，gameover
        setTimeout(() => this.judge(this.pattern), 100);
      }
    }
  }
}
