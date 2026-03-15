async function generateExplanation(){

const topic=document.getElementById("topic").value
const level=document.getElementById("level").value

const res=await fetch("/generate",{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({topic,level})

})

const data=await res.json()

document.getElementById("result").innerText=data.result

}