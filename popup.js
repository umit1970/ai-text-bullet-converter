// Encryption functions using Web Crypto API
async function encryptData(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );

    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

async function decryptData(encryptedObj) {
    if (!encryptedObj || !encryptedObj.encrypted) return '';

    try {
        const key = await getEncryptionKey();
        const encryptedData = Uint8Array.from(atob(encryptedObj.encrypted), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    } catch (e) {
        console.error('Decryption failed:', e);
        return '';
    }
}

async function getEncryptionKey() {
    // Get or create a persistent key
    let keyData = await chrome.storage.local.get('encKey');

    if (!keyData.encKey) {
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const exported = await crypto.subtle.exportKey('jwk', key);
        await chrome.storage.local.set({ encKey: exported });
        return key;
    }

    return await crypto.subtle.importKey(
        'jwk',
        keyData.encKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

// Load saved settings
async function loadSettings() {
    const settings = await chrome.storage.local.get([
        'aiProvider', 'apiKey', 'model', 'customPrompt'
    ]);

    if (settings.aiProvider) {
        document.getElementById('aiProvider').value = settings.aiProvider;
    }

    if (settings.apiKey) {
        const decrypted = await decryptData(settings.apiKey);
        document.getElementById('apiKey').value = decrypted;
    }

    if (settings.model) {
        document.getElementById('model').value = settings.model;
    }

    if (settings.customPrompt) {
        document.getElementById('customPrompt').value = settings.customPrompt;
    }
}

// Save settings
async function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const provider = document.getElementById('aiProvider').value;
    const model = document.getElementById('model').value.trim();
    const customPrompt = document.getElementById('customPrompt').value.trim();

    if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
    }

    // Encrypt API key
    const encryptedKey = await encryptData(apiKey);

    await chrome.storage.local.set({
        aiProvider: provider,
        apiKey: encryptedKey,
        model: model,
        customPrompt: customPrompt || 'Convert the following text into clear, concise English bullet points: {text}'
    });

    showStatus('Settings saved successfully! ✓', 'success');
}

// Test API connection
async function testAPI() {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Testing API connection...';
    statusDiv.className = 'status';
    statusDiv.style.display = 'block';

    const settings = await chrome.storage.local.get(['aiProvider', 'apiKey', 'model']);

    if (!settings.apiKey) {
        showStatus('Please save your API key first', 'error');
        return;
    }

    try {
        const decryptedKey = await decryptData(settings.apiKey);
        const response = await chrome.runtime.sendMessage({
            action: 'testAPI',
            provider: settings.aiProvider,
            apiKey: decryptedKey,
            model: settings.model
        });

        if (response.success) {
            showStatus('✓ API connection successful!', 'success');
        } else {
            showStatus('✗ API test failed: ' + response.error, 'error');
        }
    } catch (error) {
        showStatus('✗ Test failed: ' + error.message, 'error');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('testBtn').addEventListener('click', testAPI);

// Load settings on popup open
loadSettings();