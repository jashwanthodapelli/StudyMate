document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('explainer-form');
    if(!form) return;
    
    const generateBtn = document.getElementById('generate-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const btnText = generateBtn.querySelector('span');
    const resultContainer = document.getElementById('result-container');
    const explanationContent = document.getElementById('explanation-content');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value.trim();
        const level = document.getElementById('level').value;
        
        if (!topic) return;

        // UI Loading State
        generateBtn.disabled = true;
        btnText.textContent = "Generating...";
        loadingSpinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        resultContainer.classList.remove('opacity-100');
        
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, level })
            });
            
            const data = await response.json();
            
            if (response.ok && data.explanation) {
                // Show result
                explanationContent.innerHTML = formatTextToHTML(data.explanation);
                resultContainer.classList.remove('hidden');
                setTimeout(() => {
                    resultContainer.classList.add('opacity-100');
                }, 50);
            } else {
                alert(data.error || 'Failed to generate explanation. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while connecting to the server.');
        } finally {
            // Reset UI State
            generateBtn.disabled = false;
            btnText.textContent = "Generate Explanation";
            loadingSpinner.classList.add('hidden');
        }
    });
    
    // Helper to format basic markdown text into semantic HTML
    function formatTextToHTML(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-5 my-4">$1</ul>');
        html = html.replace(/\n\n/g, '<br><br>');
        return html;
    }
});
