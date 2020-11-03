

const { io } = require("./server");

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sanday@89",
  database: "kraazy",
  multipleStatements: true
});
let betTypes = { blurs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], parity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], sapre: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], bcon: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
let startGame = true;
let startTime = new Date().getTime();
let randomWinner = { blurs: -1, parity: -1, sapre: -1, bcon: -1 };
let userBet = { blurs: [], parity: [], sapre: [], bcon: [] };
//userId,betAmount,betType
let last10Bets = []

function getLast10Bets() {
  con.query("SELECT * FROM bet_history ORDER BY created DESC LIMIT 10", function (err, result) {
    if (!err) {
      console.log("sandip", startTime);
      last10Bets = result;
    }
    else {
      io.local.emit("error", { msg: "Right now server is not connected try again later!" })
    }
  });
}
getLast10Bets()

io.on("connection", (socket) => {
  console.log("manu")


  socket.on("join", (userId) => {
    console.log("sandip", startTime);
    con.query("SELECT amount FROM user where id=?", [userId], function (err, result) {
      if (!err) {
        io.to(socket.id).emit("join", { betHistory: last10Bets, countDown: (new Date().getTime() - startTime) / 1000 })
      }

    })
  })

  io.on("userCurrentBet", ({ userId }) => {
    con.query("SELECT * FROM user_bet_history where user_id =? and status =0", [userId], function (err, result) {
      if (err)
        io.to(socket.id).emit("error", { msg: "Error for get data" })
      else
        io.to(socket.id).emit("join", { currentBet: result })
    })
  })


  socket.on("placeBet", ({ id, password, betType, betAmount, betCategory }) => {
    if (startGame) {
      con.query("select * from user where id =? and pwd =?", [id, password], function (err, result) {
        if (err) {
          io.to(socket.id).emit("error", { msg: "Error:" + err.message });
        }
        else {
          if (result.amount < betAmount) {
            io.to(socket.id).emit("error", { msg: "InSufficient Balance Please Deposit Amount..!" });
          }
          else {
            con.query("UPDATE user SET amount =amount-?  where id =? and pwd =?", [betAmount, id, password], function (err, result) {
              if (err) {
                io.to(socket.id).emit("error", { msg: "Error" + err.message });
              }
              else {
                con.query("SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kraazy' AND TABLE_NAME = 'bet_history'", (err, result) => {
                  if (!err) {
                    let period = result[0].AUTO_INCREMENT;
                    let winAmount = 0;
                    let commission = betAmount > 100 ? betAmount * 2 / 100 : 2
                    con.query("insert into user_bet_history (user_id,amount,select,result,fee,delivery,status,category,bet_history_id) values (?,?,?,?,?,?,?,?,?)",
                      [id, betAmount, betType, -1, commission, 0, 0, betCategory, period], function (err, result) {
                        if (err) {
                          io.to(socket.id).emit("error", { msg: "Error" + err.message });
                        }
                        else {
                          if (betType === "green" || betType === "red" || betType === "blue") {
                            switch (betType) {
                              case "green":
                                winAmount = (betAmount - commission) * 2;
                                for (let i = 0; i < 5; i++)
                                  betTypes[betCategory][i] += winAmount;
                                break;
                              case "red":
                                winAmount = (betAmount - commission) * 2;
                                for (let i = 5; i < 10; i++)
                                  betTypes[betCategory][i] += winAmount;
                                break;
                              case "blue":
                                winAmount = (betAmount - commission) * 4
                                betTypes[betCategory][0] += winAmount;
                                betTypes[betCategory][5] += winAmount;
                                break;
                              default:
                                break;
                            }

                          }
                          else {

                            winAmount = (betamount - commission) * 8;
                            betTypes[betCategory][betType] += winAmount;

                          }
                          userBet[betCategory].push({ winAmount, betType, id, period })

                        }
                      })
                    io.to(socket.id).emit("placeBet", { amount: betAmount, select: betType, status: 0, period, delivery: winAmount })
                  }
                  else {
                    io.to(socket.id).emit("error", { msg: "Error" + err.message });
                  }

                })
              }
            })
          }
        }
      }
      );
    }
    else {
      io.to(socket.id).emit("error", { msg: "you can not place any bet" })
    }
  });
  socket.on("disconnect", async () => {
  });


});
setInterval(() => {
  console.log("startGameis", startGame);
  if (startTime + (1000 * 180) < new Date().getTime()) {
    //check the total
    startGame = true;
    startTime = new Date().getTime();
    for (let betCategory of Object.keys(userBet)) {
      const result = getMinKeys(betTypes[betCategory]);
      const random = Math.floor(Math.random() * result.length);
      randomWinner[betCategory] = result[random];
      //Give winner users that amount
      if (userBet[betCategory]) {
        for (let bet in userBet[betCategory]) {
          if (bet.betType === finalAns) {
            //con.query("UPDATE user SET address = 'Canyon 123' WHERE address = 'Valley 345'")
          }
          else if ((finalAns >= 0 && finalAns < 5) && bet.betType === "green") {

          }
          else if ((finalAns > 4 && finalAns < 10) && bet.betType === "red") {

          }
          else if ((finalAns === 0 || finalAns === 5) && bet.betType === "blue") {

          }
        }
      }

    }
    con.query("insert into bet_history (blurs_no,blurs_price,parity_no,parity_price,sapre_no,sapre_price,bcon_no,bcon_price) values (?, ?, ?, ?, ?, ?, ?, ?)", [randomWinner.blurs, Math.floor(Math.random() * 100000) + 100000, randomWinner.parity, Math.floor(Math.random() * 10000) + 10000, randomWinner.sapre, Math.floor(Math.random() * 10000) + 10000, randomWinner.bcon, Math.floor(Math.random() * 10000) + 10000], function (err, result) {

      if (err) {
        console.log(err);
      }
      else {
        console.log(result);
        io.local.emit("result", "refresh");

      }
      getLast10Bets()
    })
  }
  else if (startTime + (1000 * 150) < new Date().getTime()) {
    console.log("startGame is false")
    startGame = false;
  }
}, 1000);




function getMinKeys(array) {
  var min = Math.min.apply(Math, array);
  return array.reduce(function (r, a, i) {
    a === min && r.push(i);
    return r;
  }, []);
}



