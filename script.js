const messages = [
    `Last login: ${new Date().toLocaleString()} on ttys000`,
    `nioion0@spINal-c0rd ~ %`,
    "Operating System Boot",
    "Memory Check: Normal",
    "Log Record: Starting",
    "Disk Status: Reading",
    "CPU Temperature: Normal",
    "GPU Temperature: Normal",
    "Disk Health: Good",
    "Firewall Activation",
    "Network Adapter Initialization",
    "Peripheral Connection Check",
    "Driver Loading",
    "System Stability Check",
    "Temperature Sensor Check",
    "Device Recognition: Completed",
    "Disk Cleanup Complete",
    "System Status: All Normal",
    // '<a href="https://ni0j.github.io/theLostHorizon/home/" class="clickable-link">Click to Start</a>'
];

const terminal = document.querySelector('.terminal-content');

async function getBatteryLevel() {
    try {
        // Check if the Battery API is supported
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            return Math.round(battery.level * 100) + '%';
        }
        return 'Unknown'; // Fallback if Battery API is not supported
    } catch (error) {
        console.error('Battery API error:', error);
        return 'Unknown';
    }
}

async function typeWriter(element, text) {
    if (text.includes('<a')) {
        // If the text contains a link, add it directly
        element.innerHTML = text;
    } else {
        // For regular text, type it character by character
        for (let char of text) {
            element.innerHTML += char;
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
}

async function displayMessages() {
    const batteryLevel = await getBatteryLevel();
    messages[5] = `Battery Level: ${batteryLevel}`;

    for (let message of messages) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        terminal.appendChild(line);
        
        await typeWriter(line, message);
        await new Promise(resolve => setTimeout(resolve, 100));
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Add verification prompt after messages
    await addVerificationPrompt();
}

async function addVerificationPrompt() {
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line';
    terminal.appendChild(promptLine);
    await typeWriter(promptLine, 'Verification required. Please enter the password:');

    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-line';
    inputLine.style.display = 'flex';
    inputLine.innerHTML = '> ';
    
    const input = document.createElement('input');
    input.type = 'password';  // Start with password type by default
    input.style.cssText = `
        background: transparent;
        border: none;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        flex: 1;
        outline: none;
        margin-left: 0.3125rem;
    `;

    // Add input event listener to check for "hints"
    input.addEventListener('input', (e) => {
        if (input.value.toLowerCase() === 'hints') {
            input.type = 'text';  // Show text for "hints"
        } else {
            input.type = 'password';  // Hide other inputs
        }
    });

    inputLine.appendChild(input);
    terminal.appendChild(inputLine);
    input.focus();

    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const password = input.value;
            input.value = '';

            if (password.toLowerCase() === 'hints') {
                // Display hints
                const hints = [
                    '*what escapes the grasp of order?',
                    '*what is bent by unseen forces?',
                    '*what echoes in the breaks of sound?',
                    '*what hides in plain sight?',
                    '*what reveals itself when viewed from another angle?'
                ];
                
                for (let hint of hints) {
                    const hintLine = document.createElement('div');
                    hintLine.className = 'terminal-line';
                    terminal.appendChild(hintLine);
                    await typeWriter(hintLine, hint);
                }
                
                // Add new prompt after hints
                await addVerificationPrompt();
            } else if (password === '27182') {
                // Add animation class to body
                document.body.classList.add('slide-out');
                
                // Wait for animation to complete before redirecting
                setTimeout(() => {
                    window.location.href = 'https://ni0j.github.io/theLostHorizon/home';
                }, 1000); // Match this with CSS animation duration
            } else {
                const errorLine = document.createElement('div');
                errorLine.className = 'terminal-line';
                terminal.appendChild(errorLine);
                await typeWriter(errorLine, 'Error. Type "hints" for help or try again.');
                
                // Add new prompt after error
                await addVerificationPrompt();
            }
        }
    });
}

window.addEventListener('load', async () => {
    await displayMessages();
});