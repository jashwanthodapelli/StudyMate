async function generateFlashcards(){

const topic=document.getElementById("topic").value

const res=await fetch("/generate_flashcards",{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({topic})

})

const data=await res.json()

document.getElementById("flashcardResult").innerText=data.flashcards

}