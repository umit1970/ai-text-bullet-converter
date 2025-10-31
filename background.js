// API endpoint configurations
const API_CONFIGS = {
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-3.5-turbo',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        body: (prompt, model) => ({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }),
        parseResponse: (data) => data.choices[0].message.content
    },
    deepseek: {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        defaultModel: 'deepseek-chat',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        body: (prompt, model) => ({
            model: model || 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }),
        parseResponse: (data) => data.choices[0].message.content
    },
    mistral: {
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        defaultModel: 'mistral-small-latest',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        body: (prompt, model) => ({
            model: model || 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }),
        parseResponse: (data) => data.choices[0].message.content
    },
    qwen: {
        endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        defaultModel: 'qwen-turbo',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        body: (prompt, model) => ({
            model: model || 'qwen-turbo',
            input: { messages: [{ role: 'user', content: prompt }] },
            parameters: { temperature: 0.7 }
        }),
        parseResponse: (data) => data.output.text
    },
    ollama: {
        endpoint: 'http://localhost:11434/api/generate',
        defaultModel: 'llama3',
        headers: (apiKey) => ({
            'Content-Type': 'application/json'
        }),
        body: (prompt, model) => ({
            model: model || 'llama3',
            prompt: prompt,
            stream: false
        }),
        parseResponse: (data) => data.response
    },
    anthropic: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-3-sonnet-20240229',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        }),
        body: (prompt, model) => ({
            model: model || 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        }),
        parseResponse: (data) => data.content[0].text
    },
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'mixtral-8x7b-32768',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        body: (prompt, model) => ({
            model: model || 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }),
        parseResponse: (data) => data.choices[0].message.content
    }
};

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'convertText') {
        handleConvertText(request).then(sendResponse);
        return true; // Keep channel open for async response
    }

    if (request.action === 'testAPI') {
        handleTestAPI(request).then(sendResponse);
        return true;
    }
});

// Handle text conversion
async function handleConvertText(request) {
    try {
        const settings = await chrome.storage.local.get([
            'aiProvider', 'apiKey', 'model', 'customPrompt'
        ]);

        if (!settings.apiKey) {
            return { success: false, error: 'No API key configured. Please set up in extension settings.' };
        }

        // Decrypt API key
        const apiKey = await decryptData(settings.apiKey);
        const provider = settings.aiProvider || 'openai';
        const model = settings.model;
        const promptTemplate = settings.customPrompt || 'Convert the following text into clear, concise English bullet points: {text}';

        // Create prompt
        const prompt = promptTemplate.replace('{text}', request.text);

        // Call AI API
        const result = await callAI(provider, apiKey, prompt, model);

        return { success: true, result: result };
    } catch (error) {
        console.error('Conversion error:', error);
        return { success: false, error: error.message };
    }
}

// Test API connection
async function handleTestAPI(request) {
    try {
        const testPrompt = 'Say "API connection successful!" in one sentence.';
        const result = await callAI(request.provider, request.apiKey, testPrompt, request.model);
        return { success: true, result: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Call AI API
async function callAI(provider, apiKey, prompt, model) {
    const config = API_CONFIGS[provider];

    if (!config) {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: config.headers(apiKey),
        body: JSON.stringify(config.body(prompt, model))
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return config.parseResponse(data);
}

// Decryption function (same as popup.js)
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
        throw new Error('Failed to decrypt API key');
    }
}

async function getEncryptionKey() {
    let keyData = await chrome.storage.local.get('encKey');

    if (!keyData.encKey) {
        throw new Error('Encryption key not found');
    }

    return await crypto.subtle.importKey(
        'jwk',
        keyData.encKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

// Context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'convertToBullets',
        title: 'Convert to Bullet Points',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'convertToBullets') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'showButton',
            text: info.selectionText
        });
    }
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === 'convert-text') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerConversion' });
        });
    }
});