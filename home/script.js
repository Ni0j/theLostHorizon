window.addEventListener('load', () => {
    document.body.classList.add('slide-in');
});

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
        z-index: 1000;
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

    // Add title
    const title = document.createElement('span');
    addScrambleEffect(title, 'The Ot[H]er Side');
    titleBar.appendChild(title);

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    // Create gear button
    const optionsButton = document.createElement('button');
    optionsButton.textContent = '⚙️';
    optionsButton.style.cssText = `
        background: none;
        border: none;
        color: #8b8b8b;
        cursor: pointer;
        font-size: 16px;
        padding: 0 5px;
    `;
    optionsButton.onmouseover = () => optionsButton.style.color = 'white';
    optionsButton.onmouseout = () => optionsButton.style.color = '#8b8b8b';
    controls.appendChild(optionsButton);

    // Store original window dimensions
    let originalHeight;

    // Add window control buttons (toggle and close)
    ['−', '×'].forEach((text, i) => {
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

        if (i === 0) { // Toggle button
            // Store original height when window is created
            originalHeight = windowContainer.offsetHeight;
            
            button.onclick = () => {
                if (contentContainer.style.display !== 'none') {
                    // Minimize
                    contentContainer.style.display = 'none';
                    windowContainer.style.height = 'auto';
                    button.textContent = '□'; // Change to restore symbol
                } else {
                    // Restore to original size
                    contentContainer.style.display = 'flex';
                    windowContainer.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                    button.textContent = '−'; // Change back to minimize symbol
                }
            };
        } else { // Close button
            button.onclick = () => windowContainer.remove();
        }
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Create content container for webcam
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 0;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        line-height: 1.6;
        height: 640px;
        width: 640px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        margin-bottom: 0.65rem
    `;

    // Create webcam elements
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = 640;
    canvas.height = 640;
    canvas.style.cssText = `
        display: block;
        max-width: 100%;
        max-height: 100%;
    `;

    video.style.transform = 'scaleX(-1)';
    video.style.display = 'none';

    // Add elements to containers
    contentContainer.appendChild(canvas);
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);

    // Add simplified dragging logic
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Remove the transform and set initial position
        const rect = windowContainer.getBoundingClientRect();
        windowContainer.style.transform = 'none';
        windowContainer.style.left = `${rect.left}px`;
        windowContainer.style.top = `${rect.top}px`;
        
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Initialize webcam
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 640 }
        });
        video.srcObject = stream;
        await video.play();

        // Process frame function
        function processFrame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Add the options window creation function
    function createOptionsWindow() {
        const optionsWindow = document.createElement('div');
        optionsWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            background: #000000;
            border: 1px solid #8b8b8b;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
        `;

        // Create title bar for options window
        const optionsTitleBar = document.createElement('div');
        optionsTitleBar.style.cssText = `
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

        // Add simplified dragging logic
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        optionsTitleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            
            // Remove the transform and set initial position
            const rect = optionsWindow.getBoundingClientRect();
            optionsWindow.style.transform = 'none';
            optionsWindow.style.left = `${rect.left}px`;
            optionsWindow.style.top = `${rect.top}px`;
            
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                optionsWindow.style.left = `${currentX}px`;
                optionsWindow.style.top = `${currentY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Add title
        const optionsTitle = document.createElement('span');
        optionsTitle.textContent = 'the ot[H]er side: config';
        optionsTitleBar.appendChild(optionsTitle);

        // Add window controls
        const optionsControls = document.createElement('div');
        optionsControls.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        let originalHeight;

        // Add window control buttons (toggle and close)
        ['−', '×'].forEach((text, i) => {
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
    
            if (i === 0) { // Toggle button
                // Store original height when window is created
                originalHeight = optionsWindow.offsetHeight;
                
                button.onclick = () => {
                    if (optionsContent.style.display !== 'none') {
                        // Minimize
                        optionsContent.style.display = 'none';
                        optionsWindow.style.height = 'auto';
                        button.textContent = '□'; // Change to restore symbol
                    } else {
                        // Restore to original size
                        optionsContent.style.display = 'block';
                        optionsWindow.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                        button.textContent = '−'; // Change back to minimize symbol
                    }
                };
            } else { // Close button
                button.onclick = () => optionsWindow.remove();
            }
            optionsControls.appendChild(button);
        });

        optionsTitleBar.appendChild(optionsControls);

        // Create content container with a specific class
        const optionsContent = document.createElement('div');
        optionsContent.style.cssText = `
            padding: 20px;
            background: #000000;
        `;

        // Add type label with consistent styling
        const typeLabel = document.createElement('div');
        typeLabel.innerText = 'type:';
        typeLabel.style.cssText = `
            color: #8b8b8b;
            margin-bottom: 5px;
            font-family: 'PPNeueMachina-InktrapLight';
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
            font-family: 'PPNeueMachina-InktrapLight';
        `;
        
        Object.keys(ASCII_OPTIONS).forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.text = option.charAt(0).toUpperCase() + option.slice(1);
            if (option === 'alphanumeric') optionElement.selected = true;
            filterSelect.appendChild(optionElement);
        });

        // Add font size slider
        const fontSizeLabel = document.createElement('div');
        fontSizeLabel.innerText = 'scale: 12';
        fontSizeLabel.style.cssText = `
            color: #8b8b8b;
            margin-bottom: 5px;
            font-family: 'PPNeueMachina-InktrapLight';
        `;

        const fontSizeSlider = document.createElement('input');
        fontSizeSlider.type = 'range';
        fontSizeSlider.min = '8';
        fontSizeSlider.max = '24';
        fontSizeSlider.value = '12';
        fontSizeSlider.style.cssText = `
            width: 100%;
            margin-bottom: 10px;
            -webkit-appearance: none;
            background: transparent;
        `;

        // Add custom slider styles
        fontSizeSlider.innerHTML = `
            <style>
                input[type='range'] {
                    pointer-events: auto;
                }
                input[type='range']::-webkit-slider-runnable-track {
                    background: #8b8b8b;
                    height: 2px;
                    cursor: pointer;
                }
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 12px;
                    width: 12px;
                    background: #ffffff;
                    margin-top: -5px;
                    cursor: pointer;
                }
                input[type='range']:focus {
                    outline: none;
                }
                input[type='range']::-moz-range-track {
                    background: #8b8b8b;
                    height: 2px;
                    cursor: pointer;
                }
                input[type='range']::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    background: #ffffff;
                    border: none;
                    cursor: pointer;
                }
            </style>
        `;

        // Add elements to options content
        optionsContent.appendChild(typeLabel);
        optionsContent.appendChild(filterSelect);
        optionsContent.appendChild(fontSizeLabel);
        optionsContent.appendChild(fontSizeSlider);

        // Make sure to append both titleBar and content container in the correct order
        optionsWindow.appendChild(optionsTitleBar);
        optionsWindow.appendChild(optionsContent);

        // Add event handlers
        filterSelect.onchange = (e) => {
            currentAsciiChars = ASCII_OPTIONS[e.target.value];
        };

        fontSizeSlider.oninput = (e) => {
            const newSize = e.target.value;
            fontSizeLabel.innerText = `scale: ${newSize}`;
            fontSize = parseInt(newSize);
            charWidth = fontSize;
            charHeight = fontSize;
        };

        return optionsWindow;
    }

    // Modify the gear icon click handler
    optionsButton.onclick = () => {
        const existingOptions = document.querySelector('.options-window');
        if (existingOptions) {
            existingOptions.remove();
            return;
        }
        const optionsWindow = createOptionsWindow();
        optionsWindow.classList.add('options-window');
        document.body.appendChild(optionsWindow);
    };

    document.body.appendChild(windowContainer);
}

// Add the puzzle game function
function createPuzzleGame() {
    // Check if puzzle was recently solved
    const lastWinTime = localStorage.getItem('puzzleLastWin');
    if (lastWinTime && (Date.now() - parseInt(lastWinTime)) < 120000) {
        createWinningState();
        return;
    }

    const windowContainer = document.createElement('div');
    windowContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 800px;
        background: #000000;
        border: 1px solid #8b8b8b;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 999;
        margin-bottom: 1px;
    `;

    // Create title bar for puzzle window
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

    // Add title
    const title = document.createElement('span');
    addScrambleEffect(title, 'In Free Fal[L]');
    titleBar.appendChild(title);

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    // Store original window dimensions
    let originalHeight;

    // Add window control buttons (toggle and close)
    ['−', '×'].forEach((text, i) => {
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

        if (i === 0) { // Toggle button
            // Store original height when window is created
            originalHeight = windowContainer.offsetHeight;
            
            button.onclick = () => {
                if (contentContainer.style.display !== 'none') {
                    // Minimize
                    contentContainer.style.display = 'none';
                    windowContainer.style.height = 'auto';
                    button.textContent = '□'; // Change to restore symbol
                } else {
                    // Restore to original size
                    contentContainer.style.display = 'flex';
                    windowContainer.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                    button.textContent = '−'; // Change back to minimize symbol
                }
            };
        } else { // Close button
            button.onclick = () => windowContainer.remove();
        }
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        background: #000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        height: calc(100% - 45px);
        margin-top: 0.65rem;
        margin-bottom: 1.65rem;
        transition: all 0.3s ease;
    `;

    // Make sure to append both titleBar and contentContainer to windowContainer
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);

    // Simplified dragging logic
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Remove the transform and set initial position
        const rect = windowContainer.getBoundingClientRect();
        windowContainer.style.transform = 'none';
        windowContainer.style.left = `${rect.left}px`;
        windowContainer.style.top = `${rect.top}px`;
        
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Create game grid container with proper aspect ratio
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
        width: 720px;
        height: 405px;
        background: #8b8b8b;
        // margin: auto;
    `;

    // Game state variables
    let selectedTile = null;
    let tiles = [];
    const GRID_SIZE = 4;
    const TILE_COUNT = GRID_SIZE * GRID_SIZE;

    // Load and slice the image
    const img = document.getElementById('puzzle-source');
    if (!img.complete) {
        // If image isn't loaded yet, wait for it
        img.onload = initializePuzzle;
    } else {
        // If image is already loaded, initialize right away
        initializePuzzle();
    }

    function initializePuzzle() {
        // Clear the tiles array before creating new tiles
        tiles = [];
        
        const tileWidth = img.width / GRID_SIZE;
        const tileHeight = img.height / GRID_SIZE;
        
        // Calculate the scaled dimensions
        const scaledWidth = 720;  // Match grid container width
        const scaledHeight = 405; // Match grid container height
        
        // Create tiles
        for (let i = 0; i < TILE_COUNT; i++) {
            const tile = document.createElement('div');
            const x = (i % GRID_SIZE) * tileWidth;
            const y = Math.floor(i / GRID_SIZE) * tileHeight;

            tile.style.cssText = `
                width: 100%;
                height: 100%;
                background-image: url('${img.src}');
                background-position: ${-(x * scaledWidth / img.width)}px ${-(y * scaledHeight / img.height)}px;
                background-size: ${scaledWidth}px ${scaledHeight}px;
                cursor: pointer;
                border: 1px solid #000000;
            `;

            tile.dataset.originalPosition = i;
            tile.addEventListener('click', () => handleTileClick(tile));
            tiles.push(tile);
        }

        // Shuffle tiles
        shuffleTiles();

        // Add tiles to grid
        tiles.forEach(tile => gridContainer.appendChild(tile));
    }

    // Handle tile clicks
    function handleTileClick(tile) {
        if (!selectedTile) {
            selectedTile = tile;
            tile.style.border = '1px solid #8b8b8b';
        } else {
            // Swap tiles
            const temp = selectedTile.style.backgroundPosition;
            const tempOriginal = selectedTile.dataset.originalPosition;
            
            selectedTile.style.backgroundPosition = tile.style.backgroundPosition;
            selectedTile.dataset.originalPosition = tile.dataset.originalPosition;
            
            tile.style.backgroundPosition = temp;
            tile.dataset.originalPosition = tempOriginal;

            // Reset selection
            selectedTile.style.border = '1px solid #000000';
            selectedTile = null;

            // Check win condition
            checkWin();
        }
    }

    // Shuffle tiles
    function shuffleTiles() {
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tempPos = tiles[i].style.backgroundPosition;
            const tempOriginal = tiles[i].dataset.originalPosition;

            tiles[i].style.backgroundPosition = tiles[j].style.backgroundPosition;
            tiles[i].dataset.originalPosition = tiles[j].dataset.originalPosition;

            tiles[j].style.backgroundPosition = tempPos;
            tiles[j].dataset.originalPosition = tempOriginal;
        }
    }

    // Check win condition
    function checkWin() {
        const currentTiles = Array.from(gridContainer.children);
        const isWin = currentTiles.every((tile, index) => {
            return parseInt(tile.dataset.originalPosition) === index;
        });
        
        if (isWin) {
            // Store win time in localStorage
            localStorage.setItem('puzzleLastWin', Date.now().toString());

            contentContainer.style.marginBottom = '0.65rem';

            gridContainer.style.display = 'block';
            gridContainer.style.gridTemplateColumns = 'none';
            
            const fullImage = document.createElement('div');
            fullImage.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                background-image: url('${img.src}');
                background-size: cover;
                background-position: center;
                opacity: 0;
                transition: all 1.5s ease;
                animation: glowEffect 2s ease-in-out infinite;
                pointer-events: none;
            `;

            // Add glow animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes glowEffect {
                    0% { box-shadow: 0 0 10px rgba(139, 139, 139, 0.5); }
                    50% { box-shadow: 0 0 20px rgba(139, 139, 139, 0.8); }
                    100% { box-shadow: 0 0 10px rgba(139, 139, 139, 0.5); }
                }
            `;
            document.head.appendChild(style);

            gridContainer.innerHTML = '';
            gridContainer.appendChild(fullImage);
            
            setTimeout(() => {
                fullImage.style.opacity = '1';
            }, 100);

            // Add win message
            const winMessage = document.createElement('div');
            winMessage.textContent = 'Imagine you are falling. But there is no ground.';
            winMessage.style.cssText = `
                color: #8b8b8b;
                font-family: 'PPNeueMachina-InktrapLight';
                font-size: 1rem;
                margin-top: 10px;
               
                opacity: 0;
                transition: opacity 1s ease;
                pointer-events: none;
            `;
            contentContainer.appendChild(winMessage);
            
            setTimeout(() => {
                winMessage.style.opacity = '1';
            }, 1000);

            // Add restart button only after winning
            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart';
            restartButton.style.cssText = `
                background: none;
                border: 1px solid #8b8b8b;
                color: #8b8b8b;
                padding: 5px 15px;
                cursor: pointer;
                font-family: 'PPNeueMachina-InktrapLight';
                margin-top: 10px;
                 margin-bottom: 10px;
            `;
            restartButton.onclick = () => {
                localStorage.removeItem('puzzleLastWin');
                winMessage.remove();
                gridContainer.style.display = 'grid';
                gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
                gridContainer.innerHTML = '';
                initializePuzzle();
                restartButton.remove();
            };
            contentContainer.appendChild(restartButton);
        }
    }

    // Add elements to containers
    contentContainer.appendChild(gridContainer);
    windowContainer.appendChild(contentContainer);

    // Add window to document
    document.body.appendChild(windowContainer);
}

// Add this new function
function createWinningState() {
    // Create and setup window container similar to createPuzzleGame
    const windowContainer = document.createElement('div');
    // ... (copy the window container setup code from createPuzzleGame) ...

    // Setup the grid container with completed image
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: block;
        width: 720px;
        height: 405px;
        background: #8b8b8b;
        margin: auto;
    `;

    const fullImage = document.createElement('div');
    fullImage.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background-image: url('${img.src}');
        background-size: cover;
        background-position: center;
        animation: glowEffect 2s ease-in-out infinite;
    `;

    gridContainer.appendChild(fullImage);
    contentContainer.appendChild(gridContainer);

    // Add restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.style.cssText = `
        background: none;
        border: 1px solid #8b8b8b;
        color: #8b8b8b;
        padding: 5px 15px;
        cursor: pointer;
        font-family: 'PPNeueMachina-InktrapLight';
        margin-top: 10px;
    `;
    restartButton.onclick = () => {
        localStorage.removeItem('puzzleLastWin');
        windowContainer.remove();
        createPuzzleGame();
    };
    contentContainer.appendChild(restartButton);

    document.body.appendChild(windowContainer);
}

document.addEventListener('DOMContentLoaded', () => {
    const button1 = document.querySelector('.button1');
    const button5 = document.querySelector('.button5');

    if (button1) {
        button1.addEventListener('click', () => {
            // Check if puzzle was recently solved
            const lastWinTime = localStorage.getItem('puzzleLastWin');
            if (lastWinTime && (Date.now() - parseInt(lastWinTime)) < 120000) { // 2 minutes
                createWinningState(); // Show winning state
            } else {
                createPuzzleGame(); // Show puzzle game
            }
        });
    }

    if (button5) {
        button5.addEventListener('click', () => {
            initWebcamWithEffects();
        });
    }
});

function createMusicPlayer() {
    // Create window container
    const windowContainer = document.createElement('div');
    windowContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        background: #000000;
        border: 1px solid #8b8b8b;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 9999;
    `;

    // Create title bar first
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

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 20px;
        background: #000000;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    

    // Add title
    const title = document.createElement('span');
    addScrambleEffect(title, 'Through the Tree[S]');
    titleBar.appendChild(title);

    // Add window controls
    const controls = createWindowControls(windowContainer, contentContainer);
    titleBar.appendChild(controls);

    // Create and add music player elements
    const playerContainer = document.createElement('div');
    playerContainer.style.cssText = `
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    `;

    // Create circle container
    const circleContainer = document.createElement('div');
    circleContainer.style.cssText = `
        width: 300px;
        height: 300px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.style.cssText = `
        display: flex;
        gap: 20px;
        align-items: center;
        z-index: 1;
    `;

    // Create audio context and analyzer
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Create audio element and setup
    const audio = document.createElement('audio');
    const audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyzer);
    analyzer.connect(audioContext.destination);

    // Update the playlist array
    const playlist = [
        { src: './img/Living in the Shadows.mp3', title: 'Living in the Shadows - Matthew Perryman Jones' },
        { src: './img/Right Where It Belongs.mp3', title: 'Right Where It Belongs -  Nine Inch Nails' }
    ];
    let currentTrack = 0;

    // Create track title display with scrolling
    const trackTitle = document.createElement('div');
    trackTitle.style.cssText = `
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        text-align: center;
        margin-top: 10px;
        width: 300px;
        overflow: hidden;
        white-space: nowrap;
        padding: 5px;
        background: #000000;
    `;

    // Create inner span for scrolling
    const trackTitleText = document.createElement('span');
    trackTitleText.style.cssText = `
        display: inline-block;
        white-space: nowrap;
    `;

    // Update the updateTrack function
    function updateTrack() {
        audio.src = playlist[currentTrack].src;
        trackTitleText.textContent = playlist[currentTrack].title;
        
        trackTitleText.style.paddingLeft = '0';
        
        setTimeout(() => {
            if (trackTitleText.offsetWidth > trackTitle.offsetWidth) {
                trackTitleText.style.paddingLeft = '100%';
                trackTitleText.style.animation = 'scroll-left 15s linear infinite';
            } else {
                trackTitleText.style.animation = 'none';
                trackTitleText.style.transform = 'translateX(0)';
            }
        }, 100);
    }

    // Add the animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }
    `;
    document.head.appendChild(style);

    // Make sure to append trackTitleText to trackTitle
    trackTitle.appendChild(trackTitleText);

    // Initialize first track
    updateTrack();

    // Create canvas for visualization
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        z-index: 0;
    `;
    
    const ctx = canvas.getContext('2d');

    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        
        analyzer.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create circular mask but with larger radius to allow waves to extend
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 170, 0, 2 * Math.PI); // Increased radius
        ctx.clip();
        
        // Remove the base circle drawing
        
        // Draw sound waves with smoother transition
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
            const amplitude = dataArray[i];
            const normalized = amplitude / 255.0;
            const angle = (i / bufferLength) * 2 * Math.PI;
            
            // Create gradient for smoother wave effect
            const gradient = ctx.createLinearGradient(
                centerX + Math.cos(angle) * 130,
                centerY + Math.sin(angle) * 130,
                centerX + Math.cos(angle) * (150 + normalized * 30), // Increased wave amplitude
                centerY + Math.sin(angle) * (150 + normalized * 30)
            );
            
            gradient.addColorStop(0, 'rgba(139, 139, 139, 0.4)'); // Added base opacity
            gradient.addColorStop(1, `rgba(139, 139, 139, ${normalized})`);
            
            // Draw wave segment
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            
            // Create curved line for smoother appearance
            const startRadius = 130;
            const endRadius = 150 + normalized * 30; // Increased wave amplitude
            
            ctx.moveTo(
                centerX + Math.cos(angle) * startRadius,
                centerY + Math.sin(angle) * startRadius
            );
            
            ctx.lineTo(
                centerX + Math.cos(angle) * endRadius,
                centerY + Math.sin(angle) * endRadius
            );
            
            ctx.stroke();
        }
        
        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#8b8b8b';
        
        ctx.restore();
    }

    // Create control buttons
    ['⏮', '⏯', '⏭'].forEach((symbol, index) => {
        const button = document.createElement('button');
        button.textContent = symbol;
        button.style.cssText = `
            background: none;
            border: none;
            color: #8b8b8b;
            font-size: 24px;
            cursor: pointer;
            padding: 10px;
            transition: color 0.3s ease;
        `;
        
        button.onmouseover = () => button.style.color = 'white';
        button.onmouseout = () => button.style.color = '#8b8b8b';

        button.onclick = async () => {
            const playPauseButton = controlsContainer.children[1]; // Get reference to play/pause button
            
            switch(index) {
                case 0: // Previous
                    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
                    updateTrack();
                    audio.pause();
                    playPauseButton.textContent = '⏯';
                    break;
                case 1: // Play/Pause
                    if (audio.paused) {
                        await audio.play();
                        audioContext.resume();
                        button.textContent = '⏸';
                    } else {
                        audio.pause();
                        button.textContent = '⏯';
                    }
                    break;
                case 2: // Next
                    currentTrack = (currentTrack + 1) % playlist.length;
                    updateTrack();
                    audio.pause();
                    playPauseButton.textContent = '⏯';
                    break;
            }
        };

        controlsContainer.appendChild(button);
    });

    // Start animation
    animate();

    // Assemble all elements in the correct order
    circleContainer.appendChild(canvas);
    circleContainer.appendChild(controlsContainer);
    playerContainer.appendChild(circleContainer);
    playerContainer.appendChild(trackTitle);
    contentContainer.appendChild(playerContainer);

    // Add elements to containers
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);

    // Add dragging functionality
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Remove the transform and set initial position
        const rect = windowContainer.getBoundingClientRect();
        windowContainer.style.transform = 'none';
        windowContainer.style.left = `${rect.left}px`;
        windowContainer.style.top = `${rect.top}px`;
        
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Finally, add to document
    document.body.appendChild(windowContainer);
}

// Add helper function for creating window controls (since it's used in createMusicPlayer)
function createWindowControls(windowContainer, contentContainer) {
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    let originalHeight;

    // Add window control buttons (toggle and close)
    ['−', '×'].forEach((text, i) => {
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

        if (i === 0) { // Toggle button
            originalHeight = windowContainer.offsetHeight;
            button.onclick = () => {
                if (contentContainer.style.display !== 'none') {
                    contentContainer.style.display = 'none';
                    windowContainer.style.height = 'auto';
                    button.textContent = '□';
                } else {
                    contentContainer.style.display = 'flex';
                    windowContainer.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                    button.textContent = '−';
                }
            };
        } else { // Close button
            button.onclick = () => windowContainer.remove();
        }
        controls.appendChild(button);
    });

    return controls;
}

// Update event listener to use both class and id
document.addEventListener('DOMContentLoaded', () => {
    const button3 = document.querySelector('img.button3');
    
    if (button3) {
        button3.addEventListener('click', () => {
            createMusicPlayer();
        });
    }
});

function createLogWindow() {
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
        z-index: 1000;
    `;

    // Create title bar
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

    // Add title
    const title = document.createElement('span');
    addScrambleEffect(title, 'Simula[T]or');
    titleBar.appendChild(title);

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    let originalHeight;
    ['−', '×'].forEach((text, i) => {
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

        if (i === 0) {
            originalHeight = windowContainer.offsetHeight;
            button.onclick = () => {
                if (contentContainer.style.display !== 'none') {
                    contentContainer.style.display = 'none';
                    windowContainer.style.height = 'auto';
                    button.textContent = '□';
                } else {
                    contentContainer.style.display = 'flex';
                    windowContainer.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                    button.textContent = '−';
                }
            };
        } else {
            button.onclick = () => windowContainer.remove();
        }
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 20px;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        line-height: 1.6;
        height: 300px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    // Create messages array
    const messages = [
        ">  Have you ever experienced this feeling?",
        ">  Not knowing whether you are walking or flying?",
        ">  In front of me, there are trees, a few mushrooms, and some stones, but I wonder, can I call that thing a stone?",
        ">  There are also some unidentifiable objects.",
        ">  Look at those soap bubble-like things. A steady stream of them, right there, off in the distance.",
        ">  But how distant is the “distance”?",
        ">  There is no land to stand on and nothing is certain.",
        ">  Like fleeting thoughts that arise and disappear.",
        ">  ... ",
        ">  I've been studying them, and I can only study them because they are all that's in front of me.",
        ">  I even tried to study myself by studying them, because I can't see myself, I don't even know if I can be considered to exist.",
        ">  ... ",
        ">  Waking up from a dream and having subtle clues that suggest you're in a larger dream, which is characterized by proliferation, looping and over-lapping.",
        ">  It requires a strong lucidity to calibrate the world around, or else, we can be lost in both beautiful dreams and nightmares.",
        ">  ... ",
        ">  That's just the you in the present.",
        ">  We are the you before and the you in the future, and we have something that the you now does not have.",
        ">  The body.",
        ">  The immortal body, as we are called, the Totem.",
        ">  The body that you think you can feel now is a phantom in your head, your present existence is merely a floating, invisible body of consciousness.",
        ">  ... ",
    ];

    let currentMessageIndex = 0;

    // Add text content with typewriter effect
    const textElement = document.createElement('div');
    contentContainer.appendChild(textElement);

    // Create arrow button with initial hidden state
    const arrowButton = document.createElement('button');
    arrowButton.innerHTML = '▼';
    arrowButton.style.cssText = `
        background: none;
        border: none;
        color: #8b8b8b;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.3125rem;
        align-self: center;
        transition: color 0.3s ease;
        display: none;  // Initially hide the button
    `;

    arrowButton.onmouseover = () => arrowButton.style.color = 'white';
    arrowButton.onmouseout = () => arrowButton.style.color = '#8b8b8b';

    contentContainer.appendChild(arrowButton);

    // Modified typewriter function to show button after text is complete
    let index = 0;
    function typeWriter() {
        if (index < messages[currentMessageIndex].length) {
            textElement.textContent += messages[currentMessageIndex].charAt(index);
            index++;
            setTimeout(typeWriter, 10);
        } else {
            // Show the button only after text is fully typed
            arrowButton.style.display = 'block';
        }
    }

    // Modified click handler to loop back to first message
    arrowButton.onclick = () => {
        currentMessageIndex = (currentMessageIndex + 1) % messages.length; // Loop back to 0 when reaching the end
        textElement.textContent = '';
        index = 0;
        arrowButton.style.display = 'none';  // Hide button while typing new message
        typeWriter();
    };

    typeWriter();

    // Add dragging functionality
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = windowContainer.getBoundingClientRect();
        windowContainer.style.transform = 'none';
        windowContainer.style.left = `${rect.left}px`;
        windowContainer.style.top = `${rect.top}px`;
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Assemble window
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);
    document.body.appendChild(windowContainer);
}

// Update event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing event listeners ...
    
    const button4 = document.querySelector('.button4');
    if (button4) {
        button4.addEventListener('click', createLogWindow);
    }
});

function createAboutWindow() {
    const windowContainer = document.createElement('div');
    windowContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 41.25rem;
        background: #000000;
        border: 0.0625rem solid #8b8b8b;
        box-shadow: 0 0 0.625rem rgba(0,0,0,0.3);
        z-index: 1000;
    `;

    // Create title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 0.5rem;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
    `;

    // Add title
    const title = document.createElement('span');
    addScrambleEffect(title, './about');
    title.style.cursor = 'default'; // Add cursor style

    // Create scramble effect function
    function scrambleText(element, originalText) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?';
        let iterations = 0;
        const maxIterations = 10;
        
        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (char === ' ') return char;
                    if (iterations > index) return originalText[index];
                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join('');
            
            iterations++;
            
            if (iterations >= maxIterations) {
                clearInterval(interval);
                element.textContent = originalText;
            }
        }, 50);
    }

    // Add hover events
    let scrambleTimeout;
    title.addEventListener('mouseenter', () => {
        // Clear any existing timeout
        if (scrambleTimeout) clearTimeout(scrambleTimeout);
        
        // Start scramble effect
        scrambleText(title, './about');
        
        // Set timeout to repeat effect
        scrambleTimeout = setInterval(() => {
            scrambleText(title, './about');
        }, 1000);
    });

    title.addEventListener('mouseleave', () => {
        // Clear the interval when mouse leaves
        if (scrambleTimeout) {
            clearInterval(scrambleTimeout);
            scrambleTimeout = null;
        }
        // Reset text
        title.textContent = './about';
    });

    titleBar.appendChild(title);

    // Add window controls
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
    `;

    let originalHeight;
    ['−', '×'].forEach((text, i) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            background: none;
            border: none;
            color: #8b8b8b;
            cursor: pointer;
            font-family: 'PPNeueMachina-InktrapLight';
            padding: 0 0.3125rem;
            font-size: 1rem;
        `;
        button.onmouseover = () => button.style.color = 'white';
        button.onmouseout = () => button.style.color = '#8b8b8b';

        if (i === 0) {
            originalHeight = windowContainer.offsetHeight;
            button.onclick = () => {
                if (contentContainer.style.display !== 'none') {
                    contentContainer.style.display = 'none';
                    windowContainer.style.height = 'auto';
                    button.textContent = '□';
                } else {
                    contentContainer.style.display = 'flex';
                    windowContainer.style.height = originalHeight ? `${originalHeight}px` : 'auto';
                    button.textContent = '−';
                }
            };
        } else {
            button.onclick = () => windowContainer.remove();
        }
        controls.appendChild(button);
    });

    titleBar.appendChild(controls);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 20px;
        background: #000000;
        color: #8b8b8b;
        font-family: 'PPNeueMachina-InktrapLight';
        line-height: 1.6;
        height: 300px;
        width: 620px;
        overflow-y: auto;
        position: relative;
    `;

    // Create text element for typewriter effect
    const textElement = document.createElement('div');
    contentContainer.appendChild(textElement);

    // Create signature div (initially hidden)
    const signatureElement = document.createElement('div');
    addScrambleEffect(signatureElement, '> by Nio Jin');
    contentContainer.appendChild(signatureElement);

    // The messages to type
    const message = '>  “The [Lost H]orizon” is a project that explores how people perceive reality, hypothesizing that the world might be constructed from data and that everything is essentially a flow of information. It examines the boundary between real and unreal, questioning identity and existence in a data-driven world. The project uses diverse forms to prompt reflection on the authenticity of self and the world around us.';
    const signature = '> by Nio Jin';

    // Modified typewriter effect
    let index = 0;
    function typeWriter() {
        if (index < message.length) {
            textElement.textContent += message.charAt(index);
            index++;
            setTimeout(typeWriter, 10);
        } else {
            // After main text is done, start signature
            signatureElement.textContent = signature;
            signatureElement.style.opacity = '1';
        }
    }

    // Start the typewriter effect
    typeWriter();

    // Add dragging functionality
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = windowContainer.getBoundingClientRect();
        windowContainer.style.transform = 'none';
        windowContainer.style.left = `${rect.left}px`;
        windowContainer.style.top = `${rect.top}px`;
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowContainer.style.left = `${currentX}px`;
            windowContainer.style.top = `${currentY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Assemble window
    windowContainer.appendChild(titleBar);
    windowContainer.appendChild(contentContainer);
    document.body.appendChild(windowContainer);
}

// Add click event listener for the morphing-shape element
document.addEventListener('DOMContentLoaded', () => {
    // ... existing event listeners ...
    
    const morphingShape = document.querySelector('.morphing-shape');
    if (morphingShape) {
        morphingShape.addEventListener('click', createAboutWindow);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    const button2 = document.getElementById('button2');
    const homeBackground = document.getElementById('homeBackground');
    const bgVideo = document.getElementById('bgVideo');
    const bgVideoReverse = document.getElementById('bgVideoReverse');
    const spaceRoom = document.getElementById('spaceRoom');
    const windowContainer = document.querySelector('.window-container'); // Assuming this is the window container

    let isSpaceshipMode = false;

    button2.addEventListener('click', () => {
        if (!isSpaceshipMode) {
            // Switch to spaceship view
            homeBackground.classList.add('hidden');
            bgVideo.classList.remove('hidden');
            bgVideoReverse.classList.add('hidden');
            spaceRoom.classList.remove('hidden');
            bgVideo.currentTime = 0;
            bgVideo.play();
            initSpaceshipFeatures();
        } else {
            // Switch back to home view
            bgVideo.classList.add('hidden');
            bgVideoReverse.classList.remove('hidden');
            bgVideoReverse.currentTime = 0;
            bgVideoReverse.play();

            bgVideoReverse.onended = () => {
                // Fade out the window container
                gsap.to(windowContainer, {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        homeBackground.classList.remove('hidden');
                        bgVideoReverse.classList.add('hidden');
                        spaceRoom.classList.add('hidden');
                        // Reset opacity for next time
                        windowContainer.style.opacity = 1;
                    }
                });
            };
        }
        
        isSpaceshipMode = !isSpaceshipMode;
    });


    document.addEventListener('DOMContentLoaded', () => {
        const walls = document.querySelectorAll('.wall');
        const spaceView = document.getElementById('spaceView');
        const floorText = document.getElementById('floorText');
    
        // Story text content
        const storyTexts = [
            "Writings of a L[O]NE Spaceman",
            "Everything is moving fast,",
            "At a single blink,",
            "Gone is the days into the past,",
            "All we have our choices to think,",
            "In our decisions to trust,",
            "Distracted by illusions we cast,",
            "Illusions of purpose and freedom to last,",
            "Every decision we make is another path, ", 
            "Do you not see?",
            "Everything hangs on the scale of choices, ",
            "It’s just like zeroes and ones,",
            "Like simple binary,",
            "Our destinies coded into reality",
            "To be or no to be , ",
            "To exist or not,",
            "To pursue answers beyond insanity, ",
            "A choice to accept or reject,",
            "The very existence of choice,",
            "Dictates free will,",
            "Or so we would believe and feel,",
            "And pretend to be free,",
            "But always end up,",
            "Exactly where we are meant,",
            "to be. ", 
            "...",
            "written by Phantom Poet",
            "Mar 2022",
            "21/M/La",
            "Rochelle, France",
    
    
            // Add more story segments as needed
        ];
    
        let currentTextIndex = 0;
    
        // Typewriter settings
        const typewriterConfig = {
            speed: 30,        // Speed in milliseconds per character
            cursorSpeed: 530  // Cursor blink speed in milliseconds
        };
    
        // Function to create typewriter effect
        function typeWriter(element, text, speed = typewriterConfig.speed) {
            let i = 0;
            element.textContent = '';
            
            // Create a container with more precise centering
            const container = document.createElement('div');
            container.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                width: 100%;
                gap: 5px;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
            `;
            element.appendChild(container);
            
            // Create text span with explicit centering
            const textSpan = document.createElement('span');
            textSpan.style.cssText = `
                text-align: center;
                display: inline-block;
            `;
            container.appendChild(textSpan);
            
            const cursor = document.createElement('span');
            cursor.textContent = '|';
            cursor.className = 'type-cursor';
            container.appendChild(cursor);

            function type() {
                if (i < text.length) {
                    textSpan.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    cursor.remove();
                    const arrow = document.createElement('span');
                    arrow.textContent = '→';
                    arrow.style.cssText = `
                        cursor: pointer;
                        margin-left: 5px;
                        display: inline-block;
                        vertical-align: middle;
                        opacity: 0.8;
                        transition: opacity 0.3s ease;
                        position: relative;
                    `;
                    arrow.onmouseover = () => arrow.style.opacity = '1';
                    arrow.onmouseout = () => arrow.style.opacity = '0.8';
                    arrow.onclick = () => {
                        currentTextIndex = (currentTextIndex + 1) % storyTexts.length;
                        typeWriter(element, storyTexts[currentTextIndex]);
                    };
                    container.appendChild(arrow);
                }
            }
            
            type();
        }
    
        function showNextText() {
            currentTextIndex = (currentTextIndex + 1) % storyTexts.length;
            typeWriter(floorText, storyTexts[currentTextIndex]);
        }
    
        // Initialize with first text
        typeWriter(floorText, storyTexts[0]);
    
    });
});

function initSpaceshipFeatures() {
    const floorText = document.getElementById('floorText');

    // Story text content - moved to a single location
    const storyTexts = [
        "Writings of a L[O]NE Spaceman",
        "Everything is moving fast,",
        "At a single blink,",
        "Gone is the days into the past,",
        "All we have our choices to think,",
        "In our decisions to trust,",
        "Distracted by illusions we cast,",
        "Illusions of purpose and freedom to last,",
        "Every decision we make is another path, ", 
        "Do you not see?",
        "Everything hangs on the scale of choices, ",
        "It’s just like zeroes and ones,",
        "Like simple binary,",
        "Our destinies coded into reality",
        "To be or no to be , ",
        "To exist or not,",
        "To pursue answers beyond insanity, ",
        "A choice to accept or reject,",
        "The very existence of choice,",
        "Dictates free will,",
        "Or so we would believe and feel,",
        "And pretend to be free,",
        "But always end up,",
        "Exactly where we are meant,",
        "to be. ", 
        "written by Phantom Poet",
        "Mar 2022",
        "21/M/La",
        "Rochelle, France",

    ];

    let currentTextIndex = 0;

    // Typewriter settings
    const typewriterConfig = {
        speed: 30,
        cursorSpeed: 530
    };

    function typeWriter(element, text, speed = typewriterConfig.speed) {
        let i = 0;
        element.textContent = '';
        
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.className = 'type-cursor';
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                cursor.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
                setTimeout(type, speed);
            } else {
                cursor.remove();
                const arrow = document.createElement('span');
                arrow.textContent = '→';
                arrow.style.cssText = `
                    cursor: pointer;
                    margin-left: 5px;
                    display: inline-block;
                    vertical-align: middle;
                    opacity: 0.8;
                    transition: opacity 0.3s ease;
                `;
                arrow.onmouseover = () => arrow.style.opacity = '1';
                arrow.onmouseout = () => arrow.style.opacity = '0.8';
                arrow.onclick = () => {
                    currentTextIndex = (currentTextIndex + 1) % storyTexts.length;
                    typeWriter(element, storyTexts[currentTextIndex]);
                };
                element.appendChild(arrow);
            }
        }
        
        type();
    }

    // Initialize with first text
    typeWriter(floorText, storyTexts[0]);
}

// Add this function at the top level of your code
function addScrambleEffect(element, originalText) {
    // Store original text in a data attribute
    element.dataset.originalText = originalText;
    element.textContent = originalText;
    element.style.cursor = 'default';

    let scrambleTimeout;

    function scrambleText() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?';
        let iterations = 0;
        const maxIterations = 10;
        
        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (char === ' ') return char;
                    if (iterations > index) return originalText[index];
                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join('');
            
            iterations++;
            
            if (iterations >= maxIterations) {
                clearInterval(interval);
                element.textContent = originalText;
            }
        }, 50);
    }

    element.addEventListener('mouseenter', () => {
        if (scrambleTimeout) clearTimeout(scrambleTimeout);
        scrambleText();
        scrambleTimeout = setInterval(() => {
            scrambleText();
        }, 1000);
    });

    element.addEventListener('mouseleave', () => {
        if (scrambleTimeout) {
            clearInterval(scrambleTimeout);
            scrambleTimeout = null;
        }
        element.textContent = element.dataset.originalText;
    });
}
function updateSystemInfo() {
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    const deviceElement = document.querySelector('.device');
    const batteryElement = document.querySelector('.battery');

    // Update time
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
        });
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Update date
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString([], {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });

    // Update device name - simplified version
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';
    if (userAgent.includes('Windows')) deviceName = 'Windows';
    else if (userAgent.includes('Mac')) deviceName = 'MacOS';
    else if (userAgent.includes('Linux')) deviceName = 'Linux';
    else if (userAgent.includes('iPhone')) deviceName = 'iPhone';
    else if (userAgent.includes('Android')) deviceName = 'Android';
    deviceElement.textContent = `Linked to ${deviceName}`;

    // Update battery
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            function updateBattery() {
                batteryElement.textContent = `${Math.round(battery.level * 100)}%`;
            }
            battery.addEventListener('levelchange', updateBattery);
            updateBattery();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    const aboutAsterisk = document.getElementById('aboutAsterisk');
    if (aboutAsterisk) {
        updateSystemInfo();
        aboutAsterisk.addEventListener('click', createAboutWindow);
    }
});