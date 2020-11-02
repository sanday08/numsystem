

const { io } = require("./server");

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "kraazy",
  multipleStatements: true
});
let betTypes = { blurs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], parity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], sapre: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], bcone: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
let startGame = false;
let startTime = new Date().getTime();
let randomWinner = { blurs: -1, parity: -1, sapre: -1, bcone: -1 };
let userBet = { blurs: [], parity: [], sapre: [], bcone: [] };
//userId,betAmount,betType
io.on("connection", (socket) => {
  console.log("manu")


  socket.on("join", () => {
    console.log("sandip", startTime);

    con.query("SELECT * FROM bet_history ORDER BY created DESC LIMIT 10", function (err, result) {
      if (!err) {
        console.log("sandip", startTime);
        io.to(socket.id).emit("join", { betHistory: result, countDown: (new Date().getTime() - startTime) / 1000 })
      }
      else {
        io.to(socket.id).emit("join", { msg: "Right now server is not connected try again later!" })
      }
    });

  })

  socket.join();
  socket.on("placeBet", ({ id, password, betType, betAmount, betCategory }) => {
    if (startGame) {
      con.query("select * from user where id =? and password =?", [id, password], function (err, result) {
        if (err) {
          io.to(socket.id).emit("Error:" + err.message());
        }
        else {
          if (result.amount < betAmount) {
            socket.emit("InSufficient Balance Please Deposit Amount..!")
          }
          else {
            con.query("UPDATE customers SET amount =amount-?  where id =? and password =?", [betAmount, id, password], function (err, result) {
              if (err) {
                socket.emit("Error" + err.message());
              }
              else {
                con.query("SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kraazy' AND TABLE_NAME = 'bet_history'", (err, result) => {
                  if (!err) {
                    let period = result[0].AUTO_INCREMENT;
                    let winAmount = 0;
                    let commission = betAmount > 100 ? betAmount * 2 / 100 : 2
                    con.query("insert into user_bet_history (user_id,amount,select,result,fee,delivery,status,category,bet_history_id) values (?,?,?,?,?,?,?,?,?)",
                      [id, betAmount, betType, -1, commission, 0, 2, betCategory, period], function (err, result) {
                        if (err) {
                          socket.emit("Error" + err.message());
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
                  }
                  io.to(socket.id).emit("placeBet", { amount: betAmount, select: betType, status: 0, period, delivery: winAmount })
                })
              }
            })
          }
        }
      }
      );
    }
    else {
      io.to(socket.id).emit("stopbet", "you can not place any bet")
    }
  });
  socket.on("disconnect", async () => {
  });

  setInterval(() => {
    if (startTime + (1000 * 18) < new Date().getTime()) {
      //check the total
      startTime = new Date().getTime();
      for (let betCategory of Object.keys(userBet)) {
        const result = getMinKeys(betTypes[betCategory]);
        const random = Math.floor(Math.random() * result.length);
        const finalAns = result[random];
        //Give winner users that amount
        if (userBet[betCategory]) {
          for (let bet in userBet[betCategory]) {
            if (bet.betType === finalAns) {

            }
            else if ((finalAns >= 0 && finalAns < 5) && bet.betType === "green") {

            }
            else if ((finalAns > 4 && finalAns < 10) && bet.betType === "red") {

            }
            else if ((finalAns === 0 || finalAns === 5) && bet.betType === "blue") {

            }
          }
        }
        console.log("final number is", finalAns)

        socket.emit(betCategory + "_no", finalAns);
      }


    }

  }, 1000);
});

function getMinKeys(array) {
  var min = Math.min.apply(Math, array);
  return array.reduce(function (r, a, i) {
    a === min && r.push(i);
    return r;
  }, []);
}



