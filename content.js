// Store selected text
let currentSelectedText = '';

// Create and inject the conversion button
function createConversionButton() {
    // Remove existing button if any
    removeButton();

    const button = document.createElement('div');
    button.id = 'ai-text-converter-btn';
    button.innerHTML = '✨ Convert to Bullets';
    button.className = 'ai-converter-button';

    // Position near selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        button.style.position = 'fixed';
        button.style.left = `${rect.left + window.scrollX}px`;
        button.style.top = `${rect.bottom + window.scrollY + 5}px`;
        button.style.zIndex = '999999';
    }

    button.addEventListener('click', async () => {
        await convertText();
    });

    document.body.appendChild(button);

    // Auto-hide button after 10 seconds
    setTimeout(() => {
        removeButton();
    }, 10000);
}

function removeButton() {
    const existingButton = document.getElementById('ai-text-converter-btn');
    if (existingButton) {
        existingButton.remove();
    }
}

// Show popup with results
function showPopup(content, isLoading = false) {
    // Remove existing popup
    removePopup();

    const popup = document.createElement('div');
    popup.id = 'ai-text-converter-popup';
    popup.className = 'ai-converter-popup';

    if (isLoading) {
        popup.innerHTML = `
            <div class="popup-header">
                <span>🤖 AI Converting...</span>
            </div>
            <div class="popup-content">
                <div class="loading-spinner"></div>
                <p>Processing your text with AI...</p>
            </div>
        `;
    } else {
        popup.innerHTML = `
            <div class="popup-header">
                <span>✨ AI Conversion Result</span>
                <button class="popup-close" id="closePopup">×</button>
            </div>
            <div class="popup-content">
                <div class="result-text">${content}</div>
            </div>
            <div class="popup-footer">
                <button class="popup-btn copy-btn" id="copyResult">📋 Copy</button>
                <button class="popup-btn close-btn" id="closeResultPopup">Close</button>
            </div>
        `;
    }

    document.body.appendChild(popup);

    if (!isLoading) {
        // Add event listeners
        document.getElementById('closePopup').addEventListener('click', removePopup);
        document.getElementById('closeResultPopup').addEventListener('click', removePopup);
        document.getElementById('copyResult').addEventListener('click', () => {
            const textContent = document.querySelector('.result-text').innerText;
            navigator.clipboard.writeText(textContent).then(() => {
                const btn = document.getElementById('copyResult');
                btn.textContent = '✓ Copied!';
                setTimeout(() => {
                    btn.textContent = '📋 Copy';
                }, 2000);
            });
        });
    }
}

function removePopup() {
    const existingPopup = document.getElementById('ai-text-converter-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
}

// Convert text using AI
async function convertText() {
    if (!currentSelectedText) {
        alert('No text selected!');
        return;
    }

    // Show loading popup
    showPopup('', true);
    removeButton();

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'convertText',
            text: currentSelectedText
        });

        if (response.success) {
            // Format the result as HTML
            const formattedResult = response.result
                .replace(/\n/g, '<br>')
                .replace(/•/g, '•')
                .replace(/- /g, '• ');

            showPopup(formattedResult, false);
        } else {
            showPopup(`<div class="error">❌ Error: ${response.error}</div>`, false);
        }
    } catch (error) {
        showPopup(`<div class="error">❌ Error: ${error.message}</div>`, false);
    }
}

// Listen for text selection
document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 10) { // Minimum 10 characters
        currentSelectedText = selectedText;
        createConversionButton();
    } else {
        removeButton();
    }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showButton') {
        currentSelectedText = request.text;
        createConversionButton();
    }

    if (request.action === 'triggerConversion') {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 10) {
            currentSelectedText = selectedText;
            convertText();
        } else {
            alert('Please select some text first (minimum 10 characters)');
        }
    }
});

// Hide button when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('#ai-text-converter-btn')) {
        removeButton();
    }
});