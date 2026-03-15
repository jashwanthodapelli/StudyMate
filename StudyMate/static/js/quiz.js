async function generateQuiz(){

const topic=document.getElementById("topic").value

const res=await fetch("/generate_quiz",{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({topic})

})

const data=await res.json()

document.getElementById("quizResult").innerText=data.quiz

}