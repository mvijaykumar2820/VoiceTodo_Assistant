const status = document.getElementById("status");
const todoContainer = document.getElementById("todoContainer");
const micCheckbox = document.getElementById("input-voice");

let isListening = false;
let recognition = null;
let todos = [];

function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
        renderTodos();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    if (todos.length === 0) {
        todoContainer.innerHTML = '<div class="empty-state">No todos yet. Speak to add one.</div>';
        return;
    }

    todoContainer.innerHTML = todos.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <label class="custom-checkbox">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${index})"
                >
                <span class="checkmark"></span>
            </label>
            <div class="todo-text">${todo.text}</div>
            <button class="todo-delete" onclick="deleteTodo(${index})">Delete</button>
        </div>
    `).join('');
}

function addTodo(text) {
    todos.push({ text, completed: false });
    saveTodos();
    renderTodos();
}

window.toggleTodo = function (index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

window.deleteTodo = function (index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function parseTodoCommand(text) {
    const lowerText = text.toLowerCase();

    const addPatterns = [
        /add\s+(?:todo\s+)?(?:to\s+)?(?:my\s+)?(?:list\s+)?(.+)/i,
        /create\s+(?:todo\s+)?(?:to\s+)?(?:my\s+)?(?:list\s+)?(.+)/i,
        /new\s+(?:todo\s+)?(.+)/i,
        /(?:i\s+)?(?:need\s+to\s+|have\s+to\s+|should\s+)(.+)/i,
    ];

    for (const pattern of addPatterns) {
        const match = text.match(pattern);
        if (match) {
            return { action: 'add', text: match[1].trim() };
        }
    }

    const completePatterns = [
        /mark\s+(.+?)\s+as\s+(?:done|complete|completed|finished)/i,
        /(?:mark|set)\s+(.+?)\s+(?:done|complete|completed)/i,
        /complete\s+(.+)/i,
        /(?:i\s+)?(?:finished|completed?|done\s+with)\s+(.+)/i,
    ];

    for (const pattern of completePatterns) {
        const match = text.match(pattern);
        if (match) {
            const todoText = match[1].trim();
            const todoIndex = todos.findIndex(t =>
                t.text.toLowerCase().includes(todoText.toLowerCase())
            );
            return { action: 'complete', index: todoIndex, text: todoText };
        }
    }

    const removePatterns = [
        /(?:remove|delete)\s+(.+)/i,
    ];

    for (const pattern of removePatterns) {
        const match = text.match(pattern);
        if (match) {
            const todoText = match[1].trim();
            const todoIndex = todos.findIndex(t =>
                t.text.toLowerCase().includes(todoText.toLowerCase())
            );
            return { action: 'remove', index: todoIndex, text: todoText };
        }
    }

    const listPatterns = [
        /what(?:'s|\s+is|\s+are)?\s+(?:in|on)\s+my\s+(?:todo\s+)?list/i,
        /(?:show|tell|read)\s+(?:me\s+)?my\s+(?:todo\s+)?list/i,
        /what\s+(?:do\s+)?(?:i\s+)?(?:have\s+to\s+do|need\s+to\s+do)/i,
        /(?:list|show)\s+(?:my\s+)?todos?/i,
    ];

    for (const pattern of listPatterns) {
        if (text.match(pattern)) {
            return { action: 'list' };
        }
    }
    return null;
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
        isListening = true;
        micCheckbox.checked = true;
        status.textContent = "Listening...";
    };

    recognition.onresult = async (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        if (!isFinal) {
            status.textContent = `Hearing: "${transcript}"...`;
            return;
        }

        const trimmedTranscript = transcript.trim();

        if (!trimmedTranscript || trimmedTranscript.length < 2) {
            status.textContent = "I didn't get it. Please try again.";
            speak("I didn't get it");
            return;
        }

        status.textContent = `You said: "${trimmedTranscript}"`;

        const command = parseTodoCommand(trimmedTranscript);

        if (command && command.action === 'add') {
            if (!command.text || command.text.trim().length < 2) {
                status.textContent = "I didn't get a valid todo. Please try again.";
                speak("I didn't get a valid todo");
                return;
            }
            addTodo(command.text);
            speak("Todo created");
            status.textContent = "Todo created";
        } else if (command && command.action === 'complete' && command.index !== -1) {
            toggleTodo(command.index);
            speak("Marked as done");
            status.textContent = "Marked as done";
        } else if (command && command.action === 'remove' && command.index !== -1) {
            deleteTodo(command.index);
            speak("Todo removed");
            status.textContent = "Todo removed";
        } else if (command && command.action === 'list') {
            if (todos.length === 0) {
                const message = "You have no todos";
                status.textContent = message;
                speak(message);
            } else {
                const pendingTodos = todos.filter(t => !t.completed);
                const completedTodos = todos.filter(t => t.completed);

                let message = `You have ${todos.length} todo${todos.length > 1 ? 's' : ''}. `;

                if (pendingTodos.length > 0) {
                    message += `Pending: ${pendingTodos.map(t => t.text).join(', ')}. `;
                }

                if (completedTodos.length > 0) {
                    message += `Completed: ${completedTodos.map(t => t.text).join(', ')}.`;
                }

                status.textContent = message;
                speak(message);
            }
        } else {
            await sendToAI(trimmedTranscript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        micCheckbox.checked = false;

        if (event.error === 'no-speech') {
            status.textContent = "No speech detected. Try again.";
        } else if (event.error === 'not-allowed') {
            status.textContent = "Microphone access denied.";
        } else {
            status.textContent = `Error: ${event.error}`;
        }
    };

    recognition.onend = () => {
        isListening = false;
        micCheckbox.checked = false;
    };
} else {
    status.textContent = "Speech recognition not supported";
    micCheckbox.disabled = true;
}

async function sendToAI(message) {
    try {
        status.textContent = "Thinking...";

        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (!response.ok) {
            status.textContent = `Error: ${data.error}`;
            return;
        }

        const aiResponse = data.text || 'No response';
        status.textContent = aiResponse;
        speak(aiResponse);

    } catch (error) {
        status.textContent = `Error: ${error.message}`;
        console.error('Error:', error);
    }
}

function speak(text) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
}

window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

micCheckbox.addEventListener('change', () => {
    if (!recognition) {
        status.textContent = "Speech recognition not supported";
        micCheckbox.checked = false;
        return;
    }

    if (micCheckbox.checked) {
        recognition.start();
    } else {
        recognition.stop();
    }
});

loadTodos();
