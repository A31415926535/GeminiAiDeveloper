document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const toggleSpeechBtn = document.getElementById('toggleSpeechBtn');
    const speakerBtn = document.getElementById('speaker');
    const iconImage = document.getElementById('iconImage');

    const audio = document.getElementById('correctAudio');
    const popup = document.getElementById('correctPopup');
    const canvas = document.getElementById('fireworksCanvas');

    let pastConversations = [];
    let aitext = [];
    let speechEnabled = true;
    let fireworksInterval;
    const gifImages = [
        'https://i.ibb.co/FX5QbvB/robothappy.gif',
        'https://i.ibb.co/4RLzS89/robotmad.gif',
        'https://i.ibb.co/Y0Sn0g5/robotcurious.gif',
        'https://i.ibb.co/x8FDFZZ/robotneutral.gif'
    ];

    const socket = new WebSocket('wss://renderaidev.onrender.com');

    socket.onopen = () => {
        console.log('WebSocket connection established');
        startIntroduction();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
            console.error('Error from server:', data.error);
            return;
        }

        const aiResponse = data.response;
        const emotionResponse = data.emotion;
        const chatDiv = document.getElementById('chat');
        const aiMessageDiv = document.createElement('div');

        aiMessageDiv.classList.add('message', 'ai');
        aiMessageDiv.innerHTML = `${aiResponse}<span class="timestamp">${getCurrentTime()}</span>`;
        chatDiv.appendChild(aiMessageDiv);

        const playIcon = document.createElement('img');
        playIcon.src = 'ImagePlayIcon.png'; // Ensure this path is correct
        playIcon.alt = 'Play icon';
        playIcon.classList.add('play-icon');
        playIcon.style.cursor = 'pointer';
	playIcon.style.width = '24px';  // Force update width
        playIcon.style.height = '24px'; // Force update height
        aiMessageDiv.appendChild(playIcon);
        
        // Add click event listener to play the AI message
        playIcon.addEventListener('click', function () {
            speak(aiResponse);
        });

        chatDiv.scrollTop = chatDiv.scrollHeight;


        pastConversations.push({ role: "model", parts: [{ text: aiResponse }] });

        aitext.push(aiResponse);
        speak(aiResponse);


        const word = aiResponse.toString();

        // Check and Put Pop ups
        if (word.includes("You solved a problem!")){
            showCorrectAnswerNotification("✨ You Solved A Problem! ✨");
            
        } else if (word.includes("You learned a new concept!")) {
            showCorrectAnswerNotification("✨ You learned a new concept! ✨");
        }

        changeImage(parseInt(emotionResponse));
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    // If the user clicks the button, send the message to the AI
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // If the user presses Enter, send the message to AI
    if (userInput) {
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }
    
    //Text to speech button
    if (toggleSpeechBtn) {
        toggleSpeechBtn.addEventListener('click', toggleSpeech);
    }

    if (speakerBtn) {
        speakerBtn.addEventListener('click', function() {
            listen();
        });
    }

    function startIntroduction(){
        const chatDiv = document.getElementById('chat');

        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.classList.add('message', 'ai');
        aiMessageDiv.innerHTML = `Hi! I'm AITutor. I can help you solve problems and learn concepts. Ask me anything!`;
        chatDiv.appendChild(aiMessageDiv);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    function speak(word) {
        if (!speechEnabled) return;
        const utterance = new SpeechSynthesisUtterance(word);
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices[0];
        speechSynthesis.speak(utterance);
    }

    function toggleSpeech() {
        if (speechEnabled) {
            speechSynthesis.cancel();
            document.getElementById('toggleSpeechBtn').textContent = 'Speech Off';
        } else {
            document.getElementById('toggleSpeechBtn').textContent = 'Speech On';
        }
        speechEnabled = !speechEnabled;
    }

    // Get the current time for timestamps
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    async function sendMessage() {
        const userInputValue = userInput.value;
        if (!userInputValue) return;
    
        const chatDiv = document.getElementById('chat');
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('message', 'user');
        userMessageDiv.innerHTML = `${userInputValue}<span class="timestamp">${getCurrentTime()}</span>`;
        chatDiv.appendChild(userMessageDiv);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    
        userInput.value = '';
    
        pastConversations.push({ role: "user", parts: [{ text: userInputValue }] });
    
        const message = {
            pastConversations,
            userInputValue
        };
    
        socket.send(JSON.stringify(message));
    }

    function showCorrectAnswerNotification(word) {
        // Show the pop-up
        popup.innerText = word;
        popup.style.display = 'block';

        // Play the audio
        audio.play();

        // Show the fireworks
        canvas.style.display = 'block';
        startFireworks();

        // Hide the pop-up and fireworks after 5 seconds
        setTimeout(() => {
            popup.style.display = 'none';
            canvas.style.display = 'none';
            stopFireworks();
        }, 5000);
    }

    function startFireworks() {
        const ctx = canvas.getContext('2d');
        const w = canvas.width = window.innerWidth;
        const h = canvas.height = window.innerHeight;

        const particles = [];

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function createParticle() {
            const x = w / 2; // Center of the screen
            const y = h / 2; // Center of the screen
            const size = random(2, 5);
            const speed = random(1, 5);
            const angle = random(0, 2 * Math.PI); // Any direction
            const color = `hsl(${random(0, 360)}, 100%, 50%)`;

            return { x, y, size, speed, angle, color };
        }

        function updateParticles() {
            ctx.clearRect(0, 0, w, h);

            particles.forEach((particle, index) => {
                particle.x += particle.speed * Math.cos(particle.angle);
                particle.y += particle.speed * Math.sin(particle.angle);
                particle.speed *= 0.98;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();

                if (particle.speed < 0.1) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length < 100) {
                for (let i = 0; i < 10; i++) {
                    particles.push(createParticle());
                }
            }

            fireworksInterval = requestAnimationFrame(updateParticles);
        }

        fireworksInterval = requestAnimationFrame(updateParticles);
    }

    function stopFireworks() {
        cancelAnimationFrame(fireworksInterval);
    }

    function listen() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('SpeechRecognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            speakerBtn.textContent = 'Listening...';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value += transcript;
        };

        recognition.onend = () => {
            speakerBtn.textContent = 'Speak';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            speakerBtn.textContent = 'Speak';
        };

        recognition.start();
    }

    // Function to change the image
    function changeImage(index) {
        try {
            // Check if the index is a number
            if (typeof index !== 'number') {
                console.log('Not correct type');
                return;
            }
    
            // Ensure index is within the bounds of the array
            if (index < 1 || index > gifImages.length) {
                console.log('Index out of bounds');
                return;
            }
    
            // Get the URL of the GIF image from the array
            const gifImageUrl = gifImages[index - 1];
    
            // Check if the element exists
            if (!iconImage) {
                console.log('Image element not found');
                return;
            }
    
            // Set the src attribute to the GIF image URL
            iconImage.src = gifImageUrl;
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
});
