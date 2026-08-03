// =====================================
// MONEY TRACKER APP
// =====================================


let transactions = [];

let editID = null;

async function loadTransactions(){

console.log("Loading transactions...");


try{


transactions=[];



if(!db){

console.log("Firebase not connected");

return;

}



let snapshot = await db
.collection("transactions")
.get();



console.log(
"Firebase documents:",
snapshot.size
);



snapshot.forEach(doc=>{


console.log(
"Loading:",
doc.id,
doc.data()
);



transactions.push({

id:doc.id,

...doc.data()

});


});




console.log(
"Total transactions:",
transactions.length
);




populateMonthFilter();


render();





}

catch(error){


console.error(
"Firebase loading error:",
error
);


}



}









// =====================================
// ADD / UPDATE BUTTON
// =====================================


document
.getElementById("saveBtn")
.addEventListener("click",async function(){



let person =
document.getElementById("person").value;


let amount =
parseFloat(
document.getElementById("amount").value
);



let type =
document.getElementById("type").value;



let description =
document.getElementById("description").value.trim();





if(!amount || !description){


alert("Please fill all fields");

return;


}





let today = new Date();


let monthKey =
today.getFullYear()
+
"-"
+
String(today.getMonth()+1)
.padStart(2,"0");



let data={


name:person,

amount:amount,

type:type,

desc:description,

date:today.toLocaleDateString("en-GB"),


monthKey:monthKey,


opening:false,

closing:false

};







// UPDATE

if(editID){



await db.collection("transactions")
.doc(editID)
.update(data);



editID=null;



document
.getElementById("saveBtn")
.innerText="➕ Add Transaction";



document
.getElementById("cancelBtn")
.classList.add("hidden");



}

else{


await db.collection("transactions")
.add(data);


}






clearForm();


await loadTransactions();



});










// =====================================
// CLEAR FORM
// =====================================


function clearForm(){


document.getElementById("amount").value="";


document.getElementById("description").value="";


}










// =====================================
// CANCEL EDIT
// =====================================


document
.getElementById("cancelBtn")
.addEventListener("click",function(){


editID=null;


clearForm();


document
.getElementById("saveBtn")
.innerText="➕ Add Transaction";


document
.getElementById("cancelBtn")
.classList.add("hidden");


});









// =====================================
// EDIT TRANSACTION
// =====================================


function editTransaction(id){



let t=
transactions.find(x=>x.id===id);




if(!t)return;



if(t.opening || t.closing){


alert(
"Balance records cannot be edited"
);


return;


}






document.getElementById("person")
.value=t.name;



document.getElementById("amount")
.value=t.amount;



document.getElementById("type")
.value=t.type;



document.getElementById("description")
.value=t.desc;






editID=id;




document
.getElementById("saveBtn")
.innerText="💾 Update Transaction";



document
.getElementById("cancelBtn")
.classList.remove("hidden");



}









// =====================================
// DELETE TRANSACTION
// =====================================


async function deleteTransaction(id){



let t=
transactions.find(x=>x.id===id);




if(t.opening || t.closing){


alert(
"Balance records cannot be deleted"
);


return;


}





if(confirm("Delete this transaction?")){


await db.collection("transactions")
.doc(id)
.delete();



window.addEventListener("load",()=>{

setTimeout(()=>{

loadTransactions();

},1000);


});



}


}










// =====================================
// SEARCH + FILTER
// =====================================


document
.getElementById("search")
.addEventListener(
"input",
render
);



document
.getElementById("personFilter")
.addEventListener(
"change",
render
);



document
.getElementById("monthFilter")
.addEventListener(
"change",
render
);









// =====================================
// DISPLAY
// =====================================


function render(){



let list=
document.getElementById(
"transactionList"
);



list.innerHTML="";





let income=0;

let expense=0;




let search =
document.getElementById("search")
.value
.toLowerCase();




let person =
document.getElementById("personFilter")
.value;




let month =
document.getElementById("monthFilter")
.value;






let filtered =
transactions.filter(t=>{



let matchSearch =
(t.desc || "")
.toLowerCase()
.includes(search);



let matchPerson =
person==="all" ||
t.name===person;




let matchMonth =
month==="all" ||
t.monthKey===month;




return matchSearch &&
matchPerson &&
matchMonth;



});






// newest first

filtered.sort((a,b)=>{


let da=
a.date.split("/")
.reverse()
.join("-");


let db=
b.date.split("/")
.reverse()
.join("-");



return new Date(db)-new Date(da);


});








filtered.forEach(t=>{



let li=
document.createElement("li");





if(t.opening){

li.className="opening";

}


if(t.closing){

li.className="closing";

}







li.innerHTML=`

<div class="transaction-info">


${t.opening?"📌":t.closing?"📌":"📅"}

${t.date}


<br>


<b>${t.desc}</b>


<br>


${t.name}


RM ${Number(t.amount).toFixed(2)}


</div>



<div>


${(!t.opening && !t.closing)?

`
<span class="action-btn edit"
onclick="editTransaction('${t.id}')">
✏️
</span>


<span class="action-btn delete"
onclick="deleteTransaction('${t.id}')">
🗑️
</span>
`
:""}


</div>

`;



list.appendChild(li);






if(t.type==="income"){

income+=t.amount;

}

else{

expense+=t.amount;

}



});








document
.getElementById("totalIncome")
.innerText=
"RM "+income.toFixed(2);



document
.getElementById("totalExpense")
.innerText=
"RM "+expense.toFixed(2);



document
.getElementById("totalBalance")
.innerText=
"RM "+(income-expense)
.toFixed(2);






}





// =====================================
// RECALCULATE BUTTON
// =====================================


document
.getElementById("recalculateBtn")
.addEventListener(
"click",
recalculateOpeningBalance
);

function populateMonthFilter(){

let monthSelect=document.getElementById("monthFilter");

let months=[];


transactions.forEach(t=>{

if(t.monthKey && !months.includes(t.monthKey)){

months.push(t.monthKey);

}

});



months.sort().reverse();



monthSelect.innerHTML=
`
<option value="all">
All Months
</option>
`;



months.forEach(m=>{


let option=document.createElement("option");


option.value=m;


let parts=m.split("-");


let year=parts[0];

let month=parseInt(parts[1]);



let monthName=
new Date(
year,
month-1
)
.toLocaleString(
"en-US",
{
month:"short"
}
);



option.textContent=
monthName+" "+year;



monthSelect.appendChild(option);



});


}





