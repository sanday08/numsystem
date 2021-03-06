const { io } = require("./server");

var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "win123",
  password: "Win24",
  database: "win24",
  multipleStatements: true,
});
let betTypes = {
  blurs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  parity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  sapre: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bcon: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
let startGame = true;
let startTime = new Date().getTime();
let randomWinners = { blurs: -1, parity: -1, sapre: -1, bcon: -1 };
let userBet = { blurs: [], parity: [], sapre: [], bcon: [] };
//userId,betAmount,betType
let last10Bets = [];

function getLast10Bets() {
  con.query(
    "SELECT * FROM bet_history ORDER BY created DESC LIMIT 10",
    function (err, result) {
      if (!err) {
        console.log("sandip", startTime);
        last10Bets = result;
      } else {
        io.local.emit("error", {
          msg: "Right now server is not connected try again later!",
        });
      }
    }
  );
}
getLast10Bets();

io.on("connection", (socket) => {
  console.log("manu");

  socket.on("join", ({ userId }) => {
    console.log("sandip", startTime);
    con.query("SELECT * FROM user where id=?", [userId], function (
      err,
      result
    ) {
      if (!err) {
        io.to(socket.id).emit("join", {
          userBalance: result[0] ? result[0].amount : 0,
          betHistory: last10Bets,
          countDown: (new Date().getTime() - startTime) / 1000,
        });
      }
    });
  });

  socket.on("userCurrentBet", ({ userId }) => {
    con.query(
      "SELECT * FROM user_bet_history where user_id =? and status =0 ORDER BY created DESC",
      [userId],
      function (err, result) {

        if (err) io.to(socket.id).emit("error", { msg: "Error for get data" });
        else io.to(socket.id).emit("currentBet", { currentBet: result });
      }
    );
  });

  socket.on("placeBet", ({ id, password, betType, betAmount, betCategory }) => {
    console.log(
      "id:",
      id,
      "password:",
      password,
      "betType:",
      betType,
      "betAmount:",
      betAmount
    );
    if (startGame) {
      con.query(
        "select * from user where id =? and pwd =?",
        [id, password],
        function (err, result) {
          console.log("user amount", result);
          if (err || !result.length) {
            io.to(socket.id).emit("error", { msg: "Error:" + err });
          } else {
            let userBalance = result[0].amount;
            console.log(userBalance);
            if (userBalance < betAmount) {
              io.to(socket.id).emit("error", {
                msg: "InSufficient Balance Please Deposit Amount..!",
              });
            } else {
              con.query(
                "UPDATE user SET amount =amount-?  where id =? and pwd =?",
                [betAmount, id, password],
                function (err, result) {
                  if (err) {
                    io.to(socket.id).emit("error", {
                      msg: "Error" + err.message,
                    });
                  } else {
                    con.query(
                      "SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kraazy' AND TABLE_NAME = 'bet_history'",
                      (err, result) => {
                        if (!err) {
                          let period = result[0].AUTO_INCREMENT;
                          let winAmount = 0;
                          let commission =
                            betAmount > 100 ? (betAmount * 2) / 100 : 2;
                          con.query(
                            "INSERT INTO user_bet_history (`user_id`,`amount`,`select`,`result`,`fee`,`delivery`,`status`,`category`,`bet_history_id`) VALUES (?,?,?,?,?,?,?,?,?)",
                            [
                              id,
                              -betAmount + commission,
                              betType,
                              "",
                              commission,
                              betAmount - commission,
                              0,
                              betCategory,
                              period,
                            ],
                            function (err, result) {
                              if (err) {
                                console.log(err);
                                io.to(socket.id).emit("error", {
                                  msg: "Error" + err.message,
                                });
                              } else {
                                if (
                                  betType === "green" ||
                                  betType === "red" ||
                                  betType === "blue"
                                ) {
                                  switch (betType) {
                                    case "green":
                                      winAmount = (betAmount - commission) * 2;
                                      for (let i = 0; i < 10; i++) {
                                        if (i === 5) {
                                          betTypes[betCategory][i] += winAmount * 1.5 / 2;
                                        }
                                        else if (i % 2 === 1) {
                                          betTypes[betCategory][i] += winAmount;
                                        }
                                      }
                                      break;
                                    case "red":
                                      winAmount = (betAmount - commission) * 2;
                                      for (let i = 0; i < 10; i++) {
                                        if (i === 0)
                                          betTypes[betCategory][i] += winAmount * 1.5 / 2;
                                        else if (i % 2 === 0)
                                          betTypes[betCategory][i] += winAmount;
                                      }
                                      break;
                                    case "blue":
                                      winAmount = (betAmount - commission) * 4.5;
                                      betTypes[betCategory][0] += winAmount;
                                      betTypes[betCategory][5] += winAmount;
                                      break;
                                    default:
                                      break;
                                  }
                                } else {
                                  winAmount = (betAmount - commission) * 9;
                                  betTypes[betCategory][betType] += winAmount;
                                }
                                userBet[betCategory].push({
                                  betAmount: betAmount - commission,
                                  winAmount,
                                  betType,
                                  id,
                                  period,
                                  recordId: result.insertId,
                                });
                                io.to(socket.id).emit("placeBet", {
                                  userBalance: userBalance - betAmount,
                                  amount: betAmount,
                                  select: betType,
                                  status: 0,
                                  period,
                                  delivery: winAmount,
                                });
                              }
                            }
                          );
                        } else {
                          io.to(socket.id).emit("error", {
                            msg: "Error" + err.message,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        }
      );
    } else {
      io.to(socket.id).emit("error", { msg: "you can not place any bet" });
    }
  });
  socket.on("disconnect", async () => { });
});
setInterval(() => {

  if (startTime + 1000 * 180 < new Date().getTime()) {
    //check the total
    startGame = true;
    startTime = new Date().getTime();
    con.query("SELECT * FROM set_number", function (err, result) {
      if (err)
        console.log(err);
      else {
        console.log(result[0], "data is a", result[0].Blurs);
        randomWinners.blurs = result[0].Blurs;
        randomWinners.parity = result[0].Parity;
        randomWinners.sapre = result[0].Sapre;
        randomWinners.bcon = result[0].Bcone;
        for (let betCategory of Object.keys(userBet)) {
          if (randomWinners[betCategory] == -1) {
            const result = getMinKeys(betTypes[betCategory]);
            const random = Math.floor(Math.random() * result.length);
            randomWinners[betCategory] = result[random];
          }
          let finalNo = randomWinners[betCategory];
          let color = finalNo % 2 === 0 ? "red" : "green";
          let color2 = "";
          if (finalNo === 0 || finalNo === 5) color2 = "blue";
          let finalResult = finalNo + " " + color + " " + color2;


          //Give winner users that amount
          if (userBet[betCategory]) {
            for (let bet of userBet[betCategory]) {

              if (finalNo === 0 || finalNo === 5) {
                if (bet.betType === "red" || bet.betType === "green")
                  bet.winAmount = (bet.winAmount * 1.5) / 2;
              }
              console.log(
                "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BEt Type: ",
                bet.betType,
                "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& betCategory:", betCategory,
                "%%%******finalNo",
                finalNo,
                "%%%%%%% color:",
                color,
                "^^^^^^^^^^^^^^^ color2",
                color2
              );
              if (
                bet.betType == finalNo ||
                bet.betType === color ||
                bet.betType === color2
              ) {
                console.log("finaly koi winner malo");
                con.query(
                  `UPDATE user SET amount =amount+?  where id =? `,
                  [bet.winAmount, bet.id],
                  function (err, result) {
                    if (err) {
                      io.local.emit("error", {
                        msg: "Error" + err.message,
                      });
                    } else {
                      let data = color2 != "" ? [finalNo.toString(), color, color2] : [finalNo.toString(), color];
                      console.log("#####################################################################################################", data)
                      let query = con.query(
                        "UPDATE user_bet_history SET result = ?,status=?,amount=? where user_id=? and bet_history_id=? and id=? and `select` IN (?)",
                        [finalResult, 1, bet.winAmount - bet.betAmount, bet.id, bet.period, bet.recordId, data],
                        function (err, result) {
                          console.log("this is the query", query.sql)
                          if (err) {
                            io.local.emit("error", {
                              msg: "Error" + err.message,
                            });
                          }

                        }
                      );
                    }
                  }
                );
              }
            }

          }
          con.query(
            `UPDATE user_bet_history SET result = ?,status=? where status=? and category=?`,
            [finalResult, 2, 0, betCategory],
            function (err, result) {
              if (err) {
                io.local.emit("error", {
                  msg: "Error" + err.message,
                });
              }
            }
          );

        }

        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$:", randomWinners.blurs, "parity:", randomWinners.parity, "sapre:", randomWinners.sapre, "bcon:", randomWinners.bcon)
        con.query(
          "insert into bet_history (blurs_no,blurs_price,parity_no,parity_price,sapre_no,sapre_price,bcon_no,bcon_price) values (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            randomWinners.blurs,
            Math.floor(Math.random() * 100000) + 100000,
            randomWinners.parity,
            Math.floor(Math.random() * 10000) + 10000,
            randomWinners.sapre,
            Math.floor(Math.random() * 10000) + 10000,
            randomWinners.bcon,
            Math.floor(Math.random() * 10000) + 10000,
          ],
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              io.local.emit("result", "refresh");
            }
            getLast10Bets();
          }
        );
        console.log("sanday Shiroya");
        betTypes = {
          blurs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          parity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          sapre: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          bcon: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
        userBet = { blurs: [], parity: [], sapre: [], bcon: [] };
        randomWinners = { blurs: -1, parity: -1, sapre: -1, bcon: -1 };

        con.query("UPDATE set_number SET Blurs =-1, Parity=-1,Sapre=-1,Bcone=-1");

      }
    });

  } else if (startTime + 1000 * 150 < new Date().getTime()) {
    console.log("startGame is false");
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


function clearData() {

}