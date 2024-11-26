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
    '<a href="http://127.0.0.1:5500/home/index.html" class="clickable-link">Click to Start</a>'
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

window.addEventListener('load', displayMessages);
