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
    title.textContent = 'the ot[H]er side';
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
    title.textContent = 'in Free Fal[L]';
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
        margin-top: 3rem;
        margin-bottom: 3rem;
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
            tile.style.border = '1px solid #ffffff';
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
    console.log('Found buttons:', button1, button5); // Debug log

    if (button1) {
        button1.addEventListener('click', () => {
            console.log('Button1 clicked!'); // Debug log
            
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
            console.log('Button5 clicked!'); // Debug log
            initWebcamWithEffects();
        });
    }
});