const _ = require("lodash");
const con=require("./db")
const { io } = require("../server");

let betTypes = [0,0,0,0,0,0,0,0,0,0]
let startGame=false;
let startTime= new Date().getTime();
let randomWinner=-1;
let userBet={};
//userId,betAmount,betType
io.on("connection", (socket) => {

  socket.join();
  socket.on("placeBet", async ({ username,password, betType,betAmount }) => {
    if(startGame)
    { 

      //check user is exist or not 
      con.connect();
      await con.query("select * from user where username =? and password =?",[username,password],function(err,result){
        if(result.amount<betAmount){
          socket.emit("InSufficient Balance Please Deposit Amount..!")
        }
        else{
          let winAmount=0;
          let commission=betAmount>100?betAmount*2/100:2
  
      
  
        if(betType==="green"||betType==="red"||betType==="blue"){
          switch (betType) {
            case "green":
              winAmount=(betAmount-commission)*2;
              for (let i=0;i<5;i++)
                 betTypes[i] +=winAmount;
              break;
            case "red":
              winAmount=(betAmount-commission)*2;
              for (let i=5;i<10;i++)
                 betTypes[i] +=winAmount;
              break;
            case "blue":
              winAmount=(betAmount-commission)*4
              betTypes[0] +=winAmount;
              betTypes[5] +=winAmount;
              break;        
            default:
              break;
          }
  
        }
        else
        {
  
          winAmount=(betamount-commission)*8;
          betTypes[betType] +=winAmount;
          
        }
          
        userBet[id]={winAmount,betType}

      });
    }
    else
    {
        socket.emit("stopbet","you can not remove any bet")
    }

        }
        
   
  });


  

  socket.on("disconnect", async() => {
   
    
  });

  setInterval(() => {
        if(startGame){
            if(startTime+(1000*180)< new Date().getTime()){
              //check the total
              
              const result=getMinKeys(betTypes);
              const random = Math.floor(Math.random() * result.length);
              const finalAns=result[random];
            
              //Give winner users that amount
              for (let userId of Object.keys(userBet)){
                if(userBet[userId].betType===finalAns){
                  
                }
                else if((finalAns>=0 && finalAns<5)&&userBet[userId].betType==="green"){

                }
                else if((finalAns>4 &&finalAns<10)&&userBet[userId].betType==="red"){

                }
                else if((finalAns===0 || finalAns===5)&&userBet[userId].betType==="blue"){

                }
              }


                startGame = true;
                startTime = new Date().getTime();
                
              

            }
            else if(startTime+(1000*150)< new Date().getTime()){
                startGame = false;
                startTime = new Date().getTime();
                socket.emit("stop","can not bet ")
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



