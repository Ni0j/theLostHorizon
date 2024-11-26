async function initWebcamWithEffects() {
    // Move these variables to the top level of the function so they're accessible everywhere
    let fontSize = 12;
    let charWidth = 12;
    let charHeight = 12;
    
    // Define ASCII options
    const ASCII_OPTIONS = {
        arrows: '←↑→↓',
        normal: '@%#*+=-:. ',
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    };

    // Create a variable to hold current ASCII chars that can be modified
    let currentAsciiChars = ASCII_OPTIONS.alphanumeric;

    // Update the getAsciiCharacter function to use currentAsciiChars
    function getAsciiCharacter(brightness) {
        const index = Math.floor((brightness / 255) * (currentAsciiChars.length - 1));
        return currentAsciiChars[index];
    }

    // Remove existing button if any
    const existingButton = document.querySelector('.button');
    if (existingButton) {
        existingButton.remove();
    }

    // First, create the input form before starting the webcam effect
    function createInputForm() {
        // Check if we have a valid stored timestamp
        const lastVerifiedTime = localStorage.getItem('lastVerifiedTime');
        if (lastVerifiedTime) {
            const timeDiff = Date.now() - parseInt(lastVerifiedTime);
            const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
            
            if (timeDiff < fifteenMinutes) {
                // Skip password verification if within 15 minutes
                return Promise.resolve('27182');
            }
        }

        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            position: fixed;
            top: 80%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: black;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            text-align: center;
            z-index: 1000;
        `;

        const title = document.createElement('p');
        title.textContent = 'Identity verification required';
        title.style.fontSize = '1rem';
        title.style.marginBottom = '1rem';
        title.style.fontFamily = 'PPNeueMachina-InktrapLight';

        const input = document.createElement('input');
        input.type = 'password';
        input.placeholder = 'Enter password';
        input.style.cssText = `
            padding: 8px;
            margin-right: 10px;
            border: 1px solid #8b8b8b;
            font-size: 16px;
            background: #000000;
            color: #8b8b8b;
        `;

        const button = document.createElement('button');
        button.textContent = 'verify';
        button.style.cssText = `
            padding: 8px 20px;
            background: #000000;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;        
            font-family:'PPNeueMachina-InktrapLight';
        `;
        button.onmouseover = () => button.style.backgroundColor = '#8b8b8b';
        button.onmouseout = () => button.style.backgroundColor = '#000000';

        formContainer.appendChild(title);
        formContainer.appendChild(input);
        formContainer.appendChild(button);
        document.body.appendChild(formContainer);

        // Return a promise that resolves when the user submits the form
        return new Promise((resolve) => {
            const verifyPassword = () => {
                if (input.value === '27182') {
                    localStorage.setItem('lastVerifiedTime', Date.now().toString());
                    formContainer.remove();
                    resolve(input.value);
                }
            };

            button.onclick = verifyPassword;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    verifyPassword();
                }
            });
        });
    }

    // Get user's birthdate
    const birthdate = await createInputForm();

    // Create puzzle game button after verification
    const startButton = document.createElement('img');
    startButton.src = './img/button.png';
    startButton.alt = 'button';
    startButton.className = 'button';
    startButton.style.cssText = `
        position: fixed;
        left: 50%;
        top: 20px;
        transform: translateX(-50%);
        cursor: pointer;
    `;

    // Add puzzle game functionality
    startButton.addEventListener('click', createPuzzleGame);

    // Add button to document
    document.body.appendChild(startButton);

    // Create window container for webcam
    const windowContainer = document.createElement('div');
    windowContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 660px;
        background: #000000;
        border: 1px solid #8b8b8b;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 999;
    `;

    // Create title bar for webcam window
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 8px;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
    `;
    
    // Create title container
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    // Add title to title container
    titleContainer.appendChild(document.createElement('span')).textContent = 'ε';
    titleBar.appendChild(titleContainer);

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    // Add options button first to controls
    const optionsButton = document.createElement('button');
    optionsButton.innerText = '⚙️';
    optionsButton.style.cssText = `
        background: none;
        border: none;
        color: #8b8b8b;
        cursor: pointer;
        font-size: 16px;
        margin-right: 8px;
    `;
    controls.appendChild(optionsButton);

    // Add window control buttons
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

        button.onclick = () => {
            if (i === 2) windowContainer.remove();  // Close
            else if (i === 0) canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';  // Minimize
            else if (i === 1) {  // Maximize
                if (windowContainer.style.width === '100%') {
                    windowContainer.style.width = '660px';
                    windowContainer.style.height = 'auto';
                    windowContainer.style.top = '50%';
                    windowContainer.style.left = '50%';
                    windowContainer.style.transform = 'translate(-50%, -50%)';
                } else {
                    windowContainer.style.width = '100%';
                    windowContainer.style.height = '100%';
                    windowContainer.style.top = '0';
                    windowContainer.style.left = '0';
                    windowContainer.style.transform = 'none';
                }
            }
        };
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Make window draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    windowContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - windowContainer.offsetLeft;
        initialY = e.clientY - windowContainer.offsetTop;
        windowContainer.style.cursor = 'ew-resize'; // Change cursor to arrow slider
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
            windowContainer.style.transform = 'none';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        windowContainer.style.cursor = 'default'; // Reset cursor to default
    });

    // Create content container for webcam
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 10px;
        background: #000000;
    `;

    // Create webcam elements
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 640;
    canvas.style.display = 'block';
    
    // Make sure video is properly initialized
    video.style.transform = 'scaleX(-1)';
    video.style.display = 'none'; // Hide the video element

    // Add elements to containers in correct order
    contentContainer.appendChild(canvas);
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);

    // Create options panel
    const optionsPanel = document.createElement('div');
    optionsPanel.style.cssText = `
        position: absolute;
        top: 30px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px;
        border: 1px solid #8b8b8b;
        display: none;
        z-index: 1000;
    `;

    // Add filter options
    const filterSelect = document.createElement('select');
    filterSelect.style.cssText = `
        background: #000000;
        color: #8b8b8b;
        border: 1px solid #8b8b8b;
        padding: 5px;
        margin-bottom: 10px;
        width: 100%;
    `;
    
    Object.keys(ASCII_OPTIONS).forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option.charAt(0).toUpperCase() + option.slice(1);
        if (option === 'alphanumeric') optionElement.selected = true;
        filterSelect.appendChild(optionElement);
    });

    // Add font size slider
    const fontSizeSlider = document.createElement('input');
    fontSizeSlider.type = 'range';
    fontSizeSlider.min = '8';
    fontSizeSlider.max = '24';
    fontSizeSlider.value = '12';
    fontSizeSlider.style.cssText = `
        width: 100%;
        margin-bottom: 10px;
    `;

    const fontSizeLabel = document.createElement('div');
    fontSizeLabel.innerText = 'Font Size: 12px';
    fontSizeLabel.style.color = '#8b8b8b';

    // Add elements to options panel
    optionsPanel.appendChild(document.createTextNode('Filter Type:'));
    optionsPanel.appendChild(filterSelect);
    optionsPanel.appendChild(fontSizeLabel);
    optionsPanel.appendChild(fontSizeSlider);

    // Add options panel to window
    titleBar.appendChild(optionsButton);
    windowContainer.appendChild(optionsPanel);

    // Toggle options panel
    let optionsPanelVisible = false;
    optionsButton.onclick = (e) => {
        e.stopPropagation();
        optionsPanelVisible = !optionsPanelVisible;
        optionsPanel.style.display = optionsPanelVisible ? 'block' : 'none';
    };

    // Handle filter changes
    filterSelect.onchange = (e) => {
        currentAsciiChars = ASCII_OPTIONS[e.target.value];
    };

    // Handle font size changes
    fontSizeSlider.oninput = (e) => {
        const newSize = e.target.value;
        fontSizeLabel.innerText = `Font Size: ${newSize}px`;
        fontSize = parseInt(newSize);
        charWidth = fontSize;
        charHeight = fontSize;
    };

    // Initialize webcam
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 640 }
        });
        video.srcObject = stream;
        await video.play();

        // Update the processFrame function to use the current settings
        function processFrame() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Flip the canvas context horizontally
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);

            // Draw the video frame onto the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Restore the context to its original state
            ctx.restore();

            // Process the frame for ASCII art
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Use the current fontSize
            ctx.font = `${fontSize}px PPNeueMachina-InktrapLight`;
            ctx.textBaseline = 'top';

            for (let y = 0; y < canvas.height; y += charHeight) {
                for (let x = 0; x < canvas.width; x += charWidth) {
                    const pixelIndex = (y * canvas.width + x) * 4;
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];

                    const brightness = (r + g + b) / 3;
                    const ascii = getAsciiCharacter(brightness);

                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillText(ascii, x, y);
                }
            }

            requestAnimationFrame(processFrame);
        }

        processFrame();

    } catch (err) {
        console.error("Error accessing webcam:", err);
    }

    document.body.appendChild(windowContainer);

    // Close options panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!optionsPanel.contains(e.target) && e.target !== optionsButton) {
            optionsPanelVisible = false;
            optionsPanel.style.display = 'none';
        }
    });
}

// Add the puzzle game function
function createPuzzleGame() {
    const windowContainer = document.createElement('div');
    windowContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 660px;
        background: #000000;
        border: 1px solid #8b8b8b;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 999;
    `;

    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 8px;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
    `;
    titleBar.innerHTML = '<span>Puzzle Game</span>';

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
    `;

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

        button.onclick = () => {
            if (i === 2) windowContainer.remove();  // Close
            else if (i === 0) {  // Minimize
                // Toggle puzzle container visibility instead of the whole window
                puzzleContainer.style.display =
                    puzzleContainer.style.display === 'none' ? 'grid' : 'none';
            }
            else if (i === 1) {  // Maximize
                if (windowContainer.style.width === '100%') {
                    windowContainer.style.width = '660px';
                    windowContainer.style.height = 'auto';
                    windowContainer.style.top = '50%';
                    windowContainer.style.left = '50%';
                    windowContainer.style.transform = 'translate(-50%, -50%)';
                } else {
                    windowContainer.style.width = '100%';
                    windowContainer.style.height = '100%';
                    windowContainer.style.top = '0';
                    windowContainer.style.left = '0';
                    windowContainer.style.transform = 'none';
                }
            }
        };
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Create puzzle container
    const puzzleContainer = document.createElement('div');
    puzzleContainer.style.cssText = `
        width: 640px;
        height: 640px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
        padding: 10px;
        background: #000000;
    `;

    let selectedTile = null;
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.style.cssText = `
            background: #8b8b8b;
            aspect-ratio: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'PPNeueMachina-InktrapLight';
            color: white;
            border: 1px solid #000000;
        `;

        tile.textContent = i + 1;
        tile.dataset.index = i;

        tile.onclick = () => {
            if (!selectedTile) {
                selectedTile = tile;
                tile.style.border = '1px solid white';
            } else if (selectedTile === tile) {
                selectedTile.style.border = '1px solid #000000';
                selectedTile = null;
            } else {
                const tempText = selectedTile.textContent;
                const tempIndex = selectedTile.dataset.index;
                selectedTile.textContent = tile.textContent;
                selectedTile.dataset.index = tile.dataset.index;
                tile.textContent = tempText;
                tile.dataset.index = tempIndex;

                selectedTile.style.border = '1px solid #000000';
                selectedTile = null;
            }
        };

        puzzleContainer.appendChild(tile);
    }

    // Make window draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - windowContainer.offsetLeft;
        initialY = e.clientY - windowContainer.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
            windowContainer.style.transform = 'none';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(puzzleContainer);
    document.body.appendChild(windowContainer);
}
// Start the webcam with effects
initWebcamWithEffects();
