document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quiz-form');
    if(!form) return;
    
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    
    const quizContainer = document.getElementById('quiz-container');
    const quizContent = document.getElementById('quiz-content');
    const scoreContainer = document.getElementById('score-container');
    const scoreDisplay = document.getElementById('score-display');
    const scoreTotal = document.getElementById('score-total');
    const userTopicDisplay = document.getElementById('user-topic-display');
    const quizHeader = document.getElementById('quiz-header');
    
    let currentQuizData = null;
    let score = 0;
    let answeredQuestions = 0;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topicInput = document.getElementById('topic');
        const countInput = document.getElementById('count');
        
        const topic = topicInput.value.trim();
        const count = countInput ? parseInt(countInput.value) : 5;
        
        if (!topic) return;

        // Reset States to show Loading Skeleton Dot Animation
        generateBtn.disabled = true;
        if(btnText) btnText.textContent = "Generating...";
        
        // Hide score and old questions
        scoreContainer.classList.add('hidden');
        scoreContainer.classList.remove('translate-y-0');
        quizHeader.classList.add('hidden'); // hide title while loading
        
        // Add skeleton (Light Mode adapted)
        quizContent.innerHTML = `
             <div class="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center min-h-[200px] w-full mb-6">
                 <div class="flex items-center gap-2.5 h-8 mb-3">
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce"></div>
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                 </div>
                 <p class="text-slate-400 font-bold text-[11px] uppercase tracking-widest animate-pulse">Forging Questions...</p>
             </div>
        `;
        quizContainer.classList.remove('hidden');
        quizContainer.classList.add('opacity-100');
        
        userTopicDisplay.textContent = topic;
        
        score = 0;
        answeredQuestions = 0;
        
        // Ensure scroll to loader
        setTimeout(() => {
            quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        
        try {
            const response = await fetch('/generate_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, count })
            });
            
            const data = await response.json();
            
            if (response.ok && data.questions) {
                currentQuizData = data.questions;
                quizHeader.classList.remove('hidden');
                renderQuiz(currentQuizData);
                
                scoreDisplay.textContent = '0';
                scoreTotal.textContent = currentQuizData.length;
            } else {
                quizContent.innerHTML = `<p class="text-red-500 font-bold text-center">${data.error || 'Failed to generate quiz. Please try again.'}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            quizContent.innerHTML = `<p class="text-red-500 font-bold text-center">An error occurred while connecting to the server.</p>`;
        } finally {
            generateBtn.disabled = false;
            if(btnText) btnText.textContent = "Generate Quiz";
        }
    });
    
    function renderQuiz(questions) {
        quizContent.innerHTML = '';
        
        questions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'quiz-question border border-slate-200 rounded-[2rem] p-8 bg-white shadow-sm mb-6 max-w-full hover:shadow-md transition-shadow';
            questionBlock.dataset.index = index;
            
            const qHeader = document.createElement('div');
            qHeader.className = 'mb-6 flex items-start gap-4';
            
            const numBadge = document.createElement('div');
            numBadge.className = 'w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg font-black border border-indigo-100';
            numBadge.textContent = index + 1;
            
            const qText = document.createElement('h3');
            qText.className = 'text-[17px] font-bold text-slate-800 leading-relaxed pt-1.5 break-words w-full';
            qText.innerHTML = q.question;
            
            qHeader.appendChild(numBadge);
            qHeader.appendChild(qText);
            
            const optionsGroup = document.createElement('div');
            optionsGroup.className = 'space-y-4 md:pl-14 w-full';
            
            q.options.forEach((opt, optIndex) => {
                const optId = `q${index}-opt${optIndex}`;
                
                const optionDiv = document.createElement('div');
                optionDiv.className = 'quiz-option group relative w-full';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = optId;
                input.name = `question-${index}`;
                input.value = opt;
                input.className = 'hidden peer';
                
                const label = document.createElement('label');
                label.htmlFor = optId;
                label.className = 'block w-full px-5 py-4 border-2 border-slate-100 rounded-2xl cursor-pointer transition-all duration-200 text-slate-600 font-semibold hover:border-indigo-200 hover:bg-indigo-50/50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 break-words';
                label.textContent = opt;
                
                input.addEventListener('change', () => evaluateAnswer(index, q.answer, input, questionBlock));
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                
                optionsGroup.appendChild(optionDiv);
            });
            
            const feedbackMsg = document.createElement('div');
            feedbackMsg.className = 'feedback-msg text-[15px] font-bold mt-6 md:pl-14 hidden flex items-center gap-2 w-full break-words';
            
            questionBlock.appendChild(qHeader);
            questionBlock.appendChild(optionsGroup);
            questionBlock.appendChild(feedbackMsg);
            quizContent.appendChild(questionBlock);
        });
    }
    
    function evaluateAnswer(questionIndex, correctAnswer, selectedInput, container) {
        const selectedVal = selectedInput.value;
        const allInputs = container.querySelectorAll('input');
        const feedbackMsg = container.querySelector('.feedback-msg');
        
        allInputs.forEach(input => input.disabled = true);
        answeredQuestions++;
        
        const cleanSelected = String(selectedVal).trim().toLowerCase();
        const cleanCorrect = String(correctAnswer).trim().toLowerCase();
        
        const isCorrect = cleanSelected === cleanCorrect || cleanSelected.includes(cleanCorrect) || cleanCorrect.includes(cleanSelected);
        
        if (isCorrect) {
            score++;
            scoreDisplay.textContent = score;
            
            // Visual correction for light mode correct answer
            const label = selectedInput.nextElementSibling;
            label.classList.add('!border-green-500', '!bg-green-50', '!text-green-700');
            
            feedbackMsg.innerHTML = `<svg class="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg> <span class="text-green-600">Correct!</span>`;
        } else {
            // Visual correction for light mode wrong answer
            const label = selectedInput.nextElementSibling;
            label.classList.add('!border-red-400', '!bg-red-50', '!text-red-700');
            
            feedbackMsg.innerHTML = `<svg class="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg> <span class="text-red-500 shrink-0">Incorrect.</span> <span class="text-slate-500 ml-1 font-semibold break-words">The answer is: <span class="text-slate-800">${correctAnswer}</span></span>`;
            
            // Highlight correct one
            allInputs.forEach(input => {
                const cInput = String(input.value).trim().toLowerCase();
                if (cInput === cleanCorrect || cInput.includes(cleanCorrect) || cleanCorrect.includes(cInput)) {
                    input.nextElementSibling.classList.add('!border-green-500', '!bg-green-50', '!text-green-700');
                }
            });
        }
        
        feedbackMsg.classList.remove('hidden');
        
        if (answeredQuestions === currentQuizData.length) {
            setTimeout(() => {
                scoreContainer.classList.remove('hidden');
                scoreContainer.classList.add('flex');
                setTimeout(() => {
                    scoreContainer.classList.remove('translate-y-4');
                    scoreContainer.classList.add('translate-y-0');
                    scoreContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 50);
            }, 500);
        }
    }
});
