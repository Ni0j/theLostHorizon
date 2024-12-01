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
        
        // Add cursor element
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.className = 'type-cursor';
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                // Insert text before cursor
                cursor.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
                setTimeout(type, speed);
            } else {
                // Add arrow after typing is complete
                cursor.remove(); // Remove typing cursor
                const arrow = document.createElement('span');
                arrow.textContent = ' →';
                arrow.style.cursor = 'pointer';
                arrow.onclick = showNextText;
                element.appendChild(arrow);
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

    walls.forEach(wall => {
        wall.addEventListener('click', () => {
            const wallId = wall.dataset.wall;
            if (!wallId) return;

            // Only rotate the view
            const rotation = {
                'A': 0,
                'B': 90,
                'C': 180,
                'D': 270
            };

            gsap.to(spaceView, {
                rotation: rotation[wallId],
                duration: 1,
                ease: "power2.inOut"
            });
        });
    });

    const button2 = document.querySelector('.button2');
    const tooltip = document.createElement('div');
    tooltip.textContent = 'bring me back';
    tooltip.style.cssText = `
        position: absolute;
        bottom: -1.2rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        color: var(--text-color);
        opacity: 0;
        transition: opacity 0.3s ease;
        white-space: nowrap;
        z-index: 1000;
        background: rgba(255,0,0,0.2);  /* keeping debug background */
    `;

    button2.appendChild(tooltip);

    button2.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
    });

    button2.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });
});
