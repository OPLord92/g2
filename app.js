// =====================================
// MONEY TRACKER APP
// =====================================


let transactions = [];

let editID = null;





// =====================================
// LOAD TRANSACTIONS
// =====================================


async function loadTransactions(){


if(db){


let snapshot =
await db.collection("transactions").get();



transactions=[];



snapshot.forEach(doc=>{


transactions.push({

id:doc.id,

...doc.data()

});


});



}




await createOpeningBalance();

await createClosingBalance();



render();


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





let data={


name:person,


amount:amount,


type:type,


desc:description,


date:new Date()
.toLocaleDateString("en-GB"),


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



loadTransactions();



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
t.desc.toLowerCase()
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


RM ${t.amount.toFixed(2)}


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







// START

loadTransactions();