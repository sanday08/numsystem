

const { io } = require("./server");

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "kraazy",
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

});


con.end();


let betTypes = [0,0,0,0,0,0,0,0,0,0]
let startGame=false;
let startTime= new Date().getTime();
let randomWinner=-1;
let userBet={};
//userId,betAmount,betType
io.on("connection", (socket) => {

  socket.on("join",({betCategory})=>{
    con.connect();
    con.query("SELECT * FROM bet_history where category=? ORDER BY created DESC LIMIT 10",[betCategory],function(err,result){
      if(!err){
       
      }
      else{
        socket.to(socket.id).emit("Right now server is not connected try again later!")
      }
    });
  })

  socket.join();
  socket.on("placeBet",({ username,password, betType,betAmount,betCategory }) => {
    if(startGame)
    { 

      //check user is exist or not 
      con.connect();
    con.query("select * from user where username =? and password =?",[username,password],function(err,result){
        if(!err){
        if(result.amount<betAmount){
          socket.emit("InSufficient Balance Please Deposit Amount..!")
        }
        else{
          con.query("UPDATE customers SET amount =amount-?  where username =? and password =?",[betAmount,username,password],function(err,result){
            if(err){
              socket.emit("Error"+err.message());
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
          }
            userBet[id]={winAmount,betType}
         })

         
          
       

      }}
      else{
        socket.emit("Error:"+err.message());
      }}
      );
  }
    else
    {
        socket.emit("stopbet","you can not place any bet")
    } 
  });


  

  socket.on("disconnect", async() => {
   
    
  });

  setInterval(() => {
        
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
              socket.emit("no",9);

                startGame = true;
                startTime = new Date().getTime();
               
              

            }
            else if(startTime+(1000*150)< new Date().getTime()){
                startGame = false;
                startTime = new Date().getTime();
                socket.emit("stop","can not bet ")
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



