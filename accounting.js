// =====================================
// ACCOUNTING ENGINE
// =====================================


let currentMonthKey = "";





// GET CURRENT MONTH KEY
// Example: 2026-08

function getCurrentMonthKey(){


let now = new Date();


let year = now.getFullYear();


let month = String(
now.getMonth()+1
).padStart(2,"0");



return year+"-"+month;


}









// GET MONTH FROM DATE
// Input: dd/mm/yyyy
// Output: yyyy-mm

function getMonthKey(date){



let parts=date.split("/");


let day=parts[0];

let month=parts[1];

let year=parts[2];



return year+"-"+month;



}









// CALCULATE MONTH TRANSACTIONS


function calculateMonthBalance(monthKey){



let income=0;

let expense=0;




transactions.forEach(t=>{



if(t.opening || t.closing){

return;

}




if(getMonthKey(t.date)===monthKey){



if(t.type==="income"){


income+=t.amount;


}

else{


expense+=t.amount;


}



}



});





return {


income:income,

expense:expense,

balance:income-expense


};



}









// GET PREVIOUS MONTH KEY


function getPreviousMonthKey(monthKey){



let parts=monthKey.split("-");



let year=parseInt(parts[0]);

let month=parseInt(parts[1]);



month--;



if(month===0){


month=12;

year--;


}



return year+"-"+String(month).padStart(2,"0");


}









// GET PREVIOUS MONTH CLOSING BALANCE


function getPreviousClosingBalance(monthKey){



let previous=getPreviousMonthKey(monthKey);





let balance=0;





transactions.forEach(t=>{



if(t.closing && 
t.monthKey===previous){



balance=t.amount;


}



});





return balance;



}









// CREATE OPENING BALANCE


async function createOpeningBalance(){



let monthKey=getCurrentMonthKey();



let exists=transactions.find(t=>{


return t.opening &&
t.monthKey===monthKey;


});




if(exists){

return;

}





let openingAmount=
getPreviousClosingBalance(monthKey);







let opening={



name:"System",

date:
"01/"+
monthKey.substring(5,7)+
"/"+
monthKey.substring(0,4),



amount:openingAmount,


type:"income",


desc:"Opening Balance",


opening:true,


monthKey:monthKey



};






if(db){



let doc =
await db.collection("transactions")
.add(opening);



opening.id=doc.id;



}




transactions.push(opening);



}









// CREATE CLOSING BALANCE


async function createClosingBalance(){



let monthKey=getCurrentMonthKey();



let oldClosing=
transactions.find(t=>{


return t.closing &&
t.monthKey===monthKey;


});





let result=
calculateMonthBalance(monthKey);






let opening=
getPreviousClosingBalance(monthKey);






let closingAmount=
opening + result.balance;








let closing={



name:"System",


date:
new Date().toLocaleDateString("en-GB"),


amount:closingAmount,


type:"income",


desc:"Closing Balance",


closing:true,


monthKey:monthKey



};






if(oldClosing){


closing.id=oldClosing.id;



if(db){



await db.collection("transactions")
.doc(oldClosing.id)
.update(closing);


}



}


else{



if(db){



let doc=
await db.collection("transactions")
.add(closing);


closing.id=doc.id;


}



transactions.push(closing);



}





}









// RECALCULATE OPENING BALANCE


async function recalculateOpeningBalance(){



let monthKey=getCurrentMonthKey();




let opening=
transactions.find(t=>{


return t.opening &&
t.monthKey===monthKey;


});




if(!opening){

alert(
"No Opening Balance Found"
);

return;

}




let amount=
getPreviousClosingBalance(monthKey);





opening.amount=amount;





if(db){



await db.collection("transactions")
.doc(opening.id)
.update({

amount:amount

});


}



alert(
"Opening Balance Updated"
);



loadTransactions();



}