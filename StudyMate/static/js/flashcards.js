document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('flashcard-form');
    if(!form) return;
    
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsGrid = document.getElementById('flashcards-grid');
    const userTopicDisplay = document.getElementById('user-topic-display');
    const flashcardsHeader = document.getElementById('flashcards-header');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topicInput = document.getElementById('topic');
        const countInput = document.getElementById('count');
        
        const topic = topicInput.value.trim();
        const count = countInput ? parseInt(countInput.value) : 5;
        
        if (!topic) return;

        // Bouncing dots loader skeleton immediately!
        generateBtn.disabled = true;
        if(btnText) btnText.textContent = "Generating...";
        
        flashcardsHeader.classList.add('hidden'); // hide title until generated
        flashcardsContainer.classList.add('hidden');
        flashcardsContainer.classList.remove('opacity-100');
        
        flashcardsGrid.className = 'w-full'; // Reset class for single skeleton
        flashcardsGrid.innerHTML = `
             <div class="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center min-h-[300px] w-full max-w-lg mx-auto mb-6">
                 <div class="flex items-center gap-2.5 h-8 mb-3">
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce"></div>
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                     <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                 </div>
                 <p class="text-slate-400 font-bold text-[11px] uppercase tracking-widest animate-pulse">Printing Cards...</p>
             </div>
        `;
        
        flashcardsContainer.classList.remove('hidden');
        flashcardsContainer.classList.add('opacity-100');
        
        // Scroll to skeleton container instantly
        setTimeout(() => {
            flashcardsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);

        userTopicDisplay.textContent = topic;
        
        try {
            const response = await fetch('/generate_flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, count })
            });
            
            const data = await response.json();
            
            if (response.ok && data.flashcards) {
                flashcardsHeader.classList.remove('hidden');
                flashcardsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full'; // Restore grid classes
                renderFlashcards(data.flashcards);
            } else {
                flashcardsGrid.className = 'w-full text-center';
                flashcardsGrid.innerHTML = `<p class="text-red-500 font-bold">${data.error || 'Failed to generate flashcards. Please try again.'}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            flashcardsGrid.className = 'w-full text-center';
            flashcardsGrid.innerHTML = `<p class="text-red-500 font-bold">An error occurred while connecting to the server.</p>`;
        } finally {
            generateBtn.disabled = false;
            if(btnText) btnText.textContent = "Generate Cards";
        }
    });
    
    function renderFlashcards(flashcards) {
        flashcardsGrid.innerHTML = '';
        
        flashcards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'flashcard group max-w-sm w-full mx-auto';
            
            cardEl.addEventListener('click', () => {
                cardEl.classList.toggle('flipped');
            });

            cardEl.addEventListener('mouseleave', () => {
                if (cardEl.classList.contains('flipped')) {
                    cardEl.classList.remove('flipped');
                }
            });
            
            // Notice: using flashcard-face-font and flashcard-face-back 
            // to perfectly guarantee old CSS overlapping bugs do not happen!
            cardEl.innerHTML = `
                <div class="flashcard-inner relative w-full h-full text-center transition-transform duration-500 transform-style-3d">
                    
                    <div class="flashcard-face-front absolute w-full h-full flex flex-col items-center justify-center rounded-[2rem] p-8 bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 cursor-pointer hover:border-indigo-100 transition-colors backface-hidden z-10 break-words">
                        <span class="w-full text-left text-[11px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Question ${index + 1}</span>
                        <div class="flex-1 w-full flex items-center justify-center overflow-y-auto no-scrollbar">
                            <p class="text-slate-800 font-bold text-[17px] leading-relaxed break-words w-full px-2">${card.question}</p>
                        </div>
                    </div>
                    
                    <div class="flashcard-face-back absolute w-full h-full flex flex-col items-center justify-center rounded-[2rem] p-8 bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white cursor-pointer [transform:rotateY(180deg)] shadow-2xl shadow-indigo-500/30 backface-hidden break-words">
                        <span class="w-full text-left text-[11px] font-black text-white/70 uppercase tracking-widest block mb-2">Answer</span>
                        <div class="flex-1 w-full flex items-center justify-center overflow-y-auto no-scrollbar">
                            <p class="font-bold text-[17px] leading-relaxed text-white drop-shadow-sm w-full px-2 break-words">${card.answer}</p>
                        </div>
                    </div>
                    
                </div>
            `;
            
            flashcardsGrid.appendChild(cardEl);
        });
    }
});
