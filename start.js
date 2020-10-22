const _ = require("lodash");

const { io } = require("../server");

let betTypes = [0,0,0,0,0,0,0,0,0,0]
let startGame=false;
let startTime= new Date().getTime();
let randomWinner=-1;
let userBet={};
//userId,betAmount,betType
io.on("connection", (socket) => {

  socket.on("placeBet", async ({ id,password, betType,betAmount }) => {
    if(startGame)
    { 

      //check user is exist or not 
      //if exisat than deduct betAmount of the user balance

      //store this value in user data
    
      let winAmount=0;

      if(betType==="green"||betType==="red"||betType==="blue"){
        switch (betType) {
          case "green":
            winAmount=betAmount*1.8;
            for (let i=0;i<5;i++)
               betTypes[i] +=winAmount;
            break;
          case "red":
            winAmount=betAmount*1.8;
            for (let i=5;i<10;i++)
               betTypes[i] +=winAmount;
            break;
          case "blue":
            winAmount=betAmount*45
            betTypes[0] +=winAmount;
            betTypes[5] +=winAmount;
            break;        
          default:
            break;
        }

      }
      else
      {
        switch (betType) {
        
          case "0":
            winAmount=betamount*9;
            betTypes[0] +=winAmount;
            break;
          case "1":
            winAmount=betamount*9;
           betTypes[1] +=winAmount;
            break;
          case "2":
            winAmount=betamount*9;
           betTypes[2] +=winAmount;
            break;
          case "3":
            winAmount=betamount*9;
            betAmount[3]+=winAmount;
            break;
          case "4":
            winAmount=betamount*9;
            betAmount[4]+=winAmount;
            break;
          case "5":
            winAmount=betamount*9;
           betAmount[5]+=winAmount;
            break;
          case "6":
            winAmount=betamount*9;
            betAmount[6]+=winAmount;
            break;
          case "7":
            winAmount=betamount*9;
            betAmount[7]+=winAmount;
            break;
          case "8":
            winAmount=betamount*9;
            betAmount[8]+=winAmount;
            break;
          case "9":
            winAmount=betamount*9;
            betAmount[9]+=winAmount;
            break;
  
        
          default:
            break;
        }

      }



    
      userBet[id]={winAmount,betType}
      

    }
    else
    {
        socket.emit("stopbet","you can not remove any bet")
    }
   
  });


  socket.on("removeBet", async ({ id,password, betType,betAmount }) => {
    if(startGame){
      //Check user is exist or not
      //Check user place that bet or not
     for (const userId of Object.keys(userBet)){

     }
    }

    else
    {
        socket.emit("stopbet","you can not remove any bet")
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
            

              for (let userId of Object.keys(userBet)){
                if(userBet[userId].betType===finalAns){

                }
                else if((finalAns>=0 && finalAns<5)&&userBet[userId].betType==="green"){

                }
                else if((finalAns>4 &&finalAns<10)&&userBet[userId].betType==="red"){

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



