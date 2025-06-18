const API_KEY = "sk-437135a7f8f546b9814140503a8195ca";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // 添加用户消息到聊天框
    addMessage(message, 'user');
    userInput.value = '';
    
    try {
        // 显示加载状态
        addMessage("思考中...", 'ai loading');
        
        // 调用DeepSeek API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "你是一个专业的来华生活助手，帮助用户解决签证、住宿、交通、文化适应等问题。回答要简洁专业。"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        
        // 移除加载状态，添加AI回复
        document.querySelector('.message.loading').remove();
        addMessage(aiMessage, 'ai');
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.message.loading').remove();
        addMessage("抱歉，我暂时无法回答您的问题。请稍后再试。", 'ai');
    }
}

function addMessage(text, type) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    
    // 滚动到底部
    chatBox.scrollTop = chatBox.scrollHeight;
}