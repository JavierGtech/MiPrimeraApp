let chatId;

document.getElementById('goButton').addEventListener('click', async () => {
    const word = document.getElementById('word').value;
    const topic = document.getElementById('topic').value;

    if (!word || !topic) {
        alert('Please enter both a word and a topic!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word, topic })
        });

        const data = await response.json();

        if (data && data.question) {
            const chatArea = document.getElementById('chatArea');
            chatArea.innerHTML += `<p><strong>IDI:</strong> ${data.question}</p>`;
            chatId = data.chatId; // Add this line
        } else {
            alert('Error getting response from chatbot.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error communicating with the server.');
    }
});

function sendFeedback(feedback) {
    console.log('Vamos a enviar feedback otra vez')
    fetch(`http://localhost:3000/api/chat/${chatId}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback })
    })
    .then(response => response.json())
    .then(data => {
        const { question, chatId } = data;
        console.log('Question:',question )
        console.log('chatId:',chatId )
        if (data.message) {
            console.log('Data message:',data.message )
            alert(data.message);
            // Visual feedback:
            const feedbackButtons = document.querySelectorAll("button[onclick^='sendFeedback']");
            feedbackButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.backgroundColor = "#ccc";
            });
        }
    })
    .catch(error => {
        console.log('Vamos a enviar feedback')
        console.error('Error sending feedback:', error);
        alert('Error sending feedback. Please try again AGAIN.');
    });
}