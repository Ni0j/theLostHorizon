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
    '<a href="https://ni0j.github.io/theLostHorizon/home/" class="clickable-link">Click to Start</a>'
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
        await new Promise(resolve => setTimeout(resolve, 100)); // Pause between lines
        terminal.scrollTop = terminal.scrollHeight;
    }
}

window.addEventListener('load', async () => {
    await displayMessages();
    
    // After messages are displayed, create the password interface
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '1rem';
    container.style.marginTop = '2rem';

    // Create title and hint button container
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '0.5rem';

    const title = document.createElement('p');
    title.textContent = 'Identity verification required';
    title.style.fontSize = '1rem';
    title.style.marginBottom = '1rem';
    title.style.fontFamily = 'PPNeueMachina-InktrapLight';
    title.style.color = 'white';

    const hintButton = document.createElement('button');
    hintButton.textContent = '?';
    hintButton.style.width = '20px';
    hintButton.style.height = '20px';
    hintButton.style.borderRadius = '50%';
    hintButton.style.border = '1px solid white';
    hintButton.style.background = 'black';
    hintButton.style.color = 'white';
    hintButton.style.cursor = 'pointer';
    hintButton.style.fontSize = '0.8rem';

    titleContainer.appendChild(title);
    titleContainer.appendChild(hintButton);

    // Create password input and submit button
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter password';
    passwordInput.style.cssText = `
        background: black;
        border: 1px solid white;
        color: white;
        padding: 0.5rem;
        margin-bottom: 1rem;
        font-family: 'PPNeueMachina-InktrapLight';
        width: 200px;
        outline: none;
    `;

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.cssText = `
        background: black;
        border: 1px solid white;
        color: white;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-family: 'PPNeueMachina-InktrapLight';
    `;

    // Add hover effects
    submitButton.onmouseover = () => {
        submitButton.style.background = 'white';
        submitButton.style.color = 'black';
    };
    submitButton.onmouseout = () => {
        submitButton.style.background = 'black';
        submitButton.style.color = 'white';
    };

    // Add password validation
    submitButton.addEventListener('click', () => {
        if (passwordInput.value === 'SANITY') {  // Replace with your actual password
            window.location.href = 'success.html';  // Replace with your target page
        } else {
            passwordInput.value = '';
            passwordInput.placeholder = 'Wrong password';
            setTimeout(() => {
                passwordInput.placeholder = 'Enter password';
            }, 2000);
        }
    });

    // Add enter key functionality
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.flexDirection = 'column';
    inputContainer.style.alignItems = 'center';
    inputContainer.style.gap = '1rem';

    // Assemble the main interface
    inputContainer.appendChild(passwordInput);
    inputContainer.appendChild(submitButton);
    
    container.appendChild(titleContainer);
    container.appendChild(inputContainer);
    
    terminal.appendChild(container);

    // Create hints popup
    const popup = document.createElement('div');
    popup.style.display = 'none';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'black';
    popup.style.border = '1px solid white';
    popup.style.padding = '2rem';
    popup.style.zIndex = '1000';
    popup.style.fontFamily = 'PPNeueMachina-InktrapLight';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';

    // Window controls
    const windowControls = document.createElement('div');
    windowControls.style.position = 'absolute';
    windowControls.style.top = '0';
    windowControls.style.right = '0';
    windowControls.style.padding = '5px';

    ['−', '□', '×'].forEach((text, i) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            background: none;
            border: none;
            color: #8b8b8b;
            cursor: pointer;
            font-family: 'PPNeueMachina-InktrapLight';
            padding: 0 5px;
            font-size: 16px;
        `;
        
        button.onmouseover = () => button.style.color = 'white';
        button.onmouseout = () => button.style.color = '#8b8b8b';

        if (text === '×') {
            button.addEventListener('click', () => {
                popup.style.display = 'none';
                hintCircles.style.display = 'flex';
                hintContents.forEach(content => {
                    content.style.display = 'none';
                });
            });
        }

        windowControls.appendChild(button);
    });

    const hintsContent = document.createElement('div');
    hintsContent.style.display = 'flex';
    hintsContent.style.flexDirection = 'column';
    hintsContent.style.alignItems = 'center';
    hintsContent.style.height = '100%';

    const hintsText = document.createElement('p');
    hintsText.textContent = 'Hints';
    hintsText.style.color = 'white';
    hintsText.style.textAlign = 'center';
    hintsText.style.marginBottom = '1.5rem';
    hintsText.style.fontSize = '1rem';

    const hintCircles = document.createElement('div');
    hintCircles.style.display = 'flex';
    hintCircles.style.gap = '1rem';
    hintCircles.style.justifyContent = 'center';

    // Create hint contents
    const hintTexts = [
        '*what is falling apart?',
        '*what keeps you up at night?',
        '*what haunts you the most?',
        '*what drives you insane?',
        '*what makes you feel alive?'
    ];

    const hintContents = hintTexts.map(text => {
        const hintContent = document.createElement('div');
        hintContent.style.display = 'none';
        hintContent.style.height = '100%';
        hintContent.style.display = 'flex';
        hintContent.style.flexDirection = 'column';
        hintContent.style.justifyContent = 'space-between';
        hintContent.style.paddingTop = '2rem';
        hintContent.style.paddingBottom = '2rem';
        
        const textElement = document.createElement('p');
        textElement.textContent = text;
        textElement.style.color = 'white';
        textElement.style.textAlign = 'center';
        textElement.style.margin = '0';
        
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return';
        returnButton.style.display = 'block';
        returnButton.style.margin = '0 auto';
        returnButton.style.padding = '0.5rem 1rem';
        returnButton.style.background = 'black';
        returnButton.style.border = '1px solid white';
        returnButton.style.color = 'white';
        returnButton.style.cursor = 'pointer';
        returnButton.style.fontFamily = 'PPNeueMachina-InktrapLight';
        
        returnButton.addEventListener('click', () => {
            hintContent.style.display = 'none';
            hintCircles.style.display = 'flex';
        });
        
        hintContent.appendChild(textElement);
        hintContent.appendChild(returnButton);
        hintsContent.appendChild(hintContent);
        
        return hintContent;
    });

    // Create circles
    for (let i = 0; i < 5; i++) {
        const circle = document.createElement('div');
        circle.textContent = '?';
        circle.style.width = '40px';
        circle.style.height = '40px';
        circle.style.borderRadius = '50%';
        circle.style.border = '1px solid white';
        circle.style.background = 'black';
        circle.style.color = 'white';
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
        circle.style.cursor = 'pointer';
        
        circle.addEventListener('click', () => {
            hintCircles.style.display = 'none';
            hintContents[i].style.display = 'block';
        });
        
        hintCircles.appendChild(circle);
    }

    // Assemble the popup
    popup.appendChild(windowControls);
    hintsContent.appendChild(hintsText);
    hintsContent.appendChild(hintCircles);
    popup.appendChild(hintsContent);

    document.body.appendChild(popup);

    // Add click handler to hint button
    hintButton.addEventListener('click', () => {
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    });
});