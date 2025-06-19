// AI聊天功能JavaScript文件
// 这个文件用于处理AI聊天相关的功能

// API配置 - 实际使用时请替换为真实的API密钥
const API_CONFIG = {
    key: "your-api-key-here", // 请替换为实际的API密钥
    url: "https://api.deepseek.com/v1/chat/completions", // API端点
    model: "deepseek-chat"
};

// 全局变量
let chatHistory = [];
let isTyping = false;

// DOM元素
let chatContainer = null;
let messageInput = null;
let sendButton = null;

/**
 * 初始化AI聊天功能
 */
function initializeAIChat() {
    // 获取DOM元素
    chatContainer = document.getElementById('chat-container');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-button');

    // 如果页面没有聊天元素，创建聊天界面
    if (!chatContainer) {
        createChatInterface();
    }

    // 绑定事件
    bindChatEvents();

    // 显示欢迎消息
    showWelcomeMessage();
}

/**
 * 创建聊天界面
 */
function createChatInterface() {
    // 查找目标容器
    const targetContainer = document.querySelector('.ai-visual') || document.querySelector('.container');

    if (!targetContainer) {
        console.error('找不到合适的容器来创建聊天界面');
        return;
    }

    // 创建聊天界面HTML
    const chatHTML = `
        <div id="ai-chat-modal" class="ai-chat-modal" style="display: none;">
            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <h3 data-lang-zh="AI智能助手" data-lang-en="AI Assistant">AI智能助手</h3>
                    <button id="close-chat" class="close-chat-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="chat-container" class="ai-chat-messages">
                    <!-- 消息将在这里显示 -->
                </div>
                <div class="ai-chat-input">
                    <div class="input-group">
                        <input 
                            type="text" 
                            id="message-input" 
                            placeholder="请输入您的问题..." 
                            data-lang-zh="请输入您的问题..."
                            data-lang-en="Please enter your question..."
                        />
                        <button id="send-button" class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 添加样式
    const chatStyles = `
        <style>
            .ai-chat-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-chat-container {
                width: 90%;
                max-width: 600px;
                height: 80vh;
                background: white;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            
            .ai-chat-header {
                background: linear-gradient(135deg, #1a56db, #0e2a5c);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .ai-chat-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-chat-btn {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            
            .close-chat-btn:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8fafc;
            }
            
            .message {
                margin-bottom: 15px;
                display: flex;
                flex-direction: column;
            }
            
            .message.user {
                align-items: flex-end;
            }
            
            .message.ai {
                align-items: flex-start;
            }
            
            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                line-height: 1.5;
                word-wrap: break-word;
            }
            
            .message.user .message-content {
                background: #1a56db;
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .message.ai .message-content {
                background: white;
                color: #1e293b;
                border-bottom-left-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .message-time {
                font-size: 12px;
                color: #64748b;
                margin-top: 5px;
                padding: 0 5px;
            }
            
            .typing-indicator {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                max-width: 80px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
            }
            
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #64748b;
                border-radius: 50%;
                animation: typingAnimation 1.4s infinite ease-in-out;
            }
            
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typingAnimation {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
            
            .ai-chat-input {
                border-top: 1px solid #e2e8f0;
                padding: 20px;
                background: white;
            }
            
            .input-group {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .input-group input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #cbd5e1;
                border-radius: 24px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s ease;
            }
            
            .input-group input:focus {
                border-color: #1a56db;
                box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
            }
            
            .send-btn {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #1a56db;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .send-btn:hover {
                background: #0d4bc2;
                transform: scale(1.05);
            }
            
            .send-btn:disabled {
                background: #cbd5e1;
                cursor: not-allowed;
                transform: none;
            }
            
            @media (max-width: 768px) {
                .ai-chat-container {
                    width: 95%;
                    height: 90vh;
                }
                
                .message-content {
                    max-width: 90%;
                }
            }
        </style>
    `;

    // 添加样式到页面
    document.head.insertAdjacentHTML('beforeend', chatStyles);

    // 添加聊天界面到页面
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 重新获取DOM元素
    chatContainer = document.getElementById('chat-container');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-button');
}

/**
 * 绑定聊天事件
 */
function bindChatEvents() {
    // AI咨询按钮点击事件
    const consultBtn = document.getElementById('ai-consult-btn');
    if (consultBtn) {
        consultBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openChatModal();
        });
    }

    // 发送按钮点击事件
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // 输入框回车事件
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // 关闭聊天按钮事件
    const closeBtn = document.getElementById('close-chat');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatModal);
    }

    // 点击模态框背景关闭
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeChatModal();
            }
        });
    }
}

/**
 * 打开聊天模态框
 */
function openChatModal() {
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 聚焦到输入框
        setTimeout(() => {
            if (messageInput) {
                messageInput.focus();
            }
        }, 100);
    }
}

/**
 * 关闭聊天模态框
 */
function closeChatModal() {
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 显示欢迎消息
 */
function showWelcomeMessage() {
    const welcomeMessages = {
        zh: "您好！我是华e通AI助手，很高兴为您服务。我可以帮助您解答关于在中国学习、工作和生活的各种问题。请问有什么可以帮助您的吗？",
        en: "Hello! I'm ChinaEasy AI Assistant, happy to serve you. I can help answer various questions about studying, working and living in China. How can I help you today?"
    };

    const currentLang = window.currentLanguage || 'zh';
    const message = welcomeMessages[currentLang];

    setTimeout(() => {
        addMessage(message, 'ai', false);
    }, 500);
}

/**
 * 发送消息
 */
async function sendMessage() {
    if (!messageInput || isTyping) return;

    const message = messageInput.value.trim();
    if (!message) return;

    // 添加用户消息
    addMessage(message, 'user');
    messageInput.value = '';

    // 设置发送状态
    isTyping = true;
    sendButton.disabled = true;

    // 显示打字指示器
    showTypingIndicator();

    try {
        // 模拟AI回复（实际项目中替换为真实API调用）
        const aiResponse = await getAIResponse(message);

        // 移除打字指示器
        removeTypingIndicator();

        // 添加AI回复
        addMessage(aiResponse, 'ai');

    } catch (error) {
        console.error('AI回复出错:', error);

        // 移除打字指示器
        removeTypingIndicator();

        // 显示错误消息
        const errorMessage = getCurrentLanguageText(
            '抱歉，我暂时无法回答您的问题。请稍后再试。',
            'Sorry, I cannot answer your question at the moment. Please try again later.'
        );
        addMessage(errorMessage, 'ai');
    } finally {
        // 重置状态
        isTyping = false;
        sendButton.disabled = false;
    }
}

/**
 * 获取AI回复（模拟函数）
 * @param {string} message - 用户消息
 * @returns {Promise<string>} AI回复
 */
async function getAIResponse(message) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 简单的关键词匹配回复（实际项目中替换为真实API调用）
    const responses = {
        zh: {
            '签证': '关于签证申请，我建议您准备好以下材料：护照、邀请函、健康证明等。具体要求可能因签证类型而异，建议联系相关领事馆确认。',
            '住宿': '在中国，您可以选择多种住宿方式：学生宿舍、合租公寓、酒店式公寓等。我们可以为您提供住宿推荐和预订服务。',
            '交通': '中国的公共交通很发达，包括地铁、公交、出租车、网约车等。建议下载相关APP如滴滴出行、高德地图等。',
            '医疗': '在中国看病建议选择三甲医院，可以使用医保。紧急情况请拨打120急救电话。我们也可以协助您预约医院。',
            '银行': '开户需要携带护照、居留许可、住址证明等。推荐选择中国银行、工商银行等大型银行。',
            'default': '感谢您的咨询！关于这个问题，我建议您联系我们的专业顾问获得更详细的帮助。您也可以浏览我们的服务页面了解更多信息。'
        },
        en: {
            'visa': 'For visa applications, I recommend preparing these documents: passport, invitation letter, health certificate, etc. Specific requirements may vary by visa type, please contact the relevant consulate for confirmation.',
            'accommodation': 'In China, you can choose various accommodation options: student dormitories, shared apartments, serviced apartments, etc. We can provide accommodation recommendations and booking services.',
            'transportation': 'China has well-developed public transportation including subway, buses, taxis, ride-hailing services. I recommend downloading relevant apps like DiDi, Amap, etc.',
            'medical': 'For medical care in China, choose Grade A tertiary hospitals, you can use medical insurance. For emergencies, call 120. We can also help you book hospital appointments.',
            'bank': 'To open a bank account, bring your passport, residence permit, address proof, etc. I recommend choosing major banks like Bank of China, ICBC, etc.',
            'default': 'Thank you for your inquiry! For this question, I suggest contacting our professional consultants for more detailed assistance. You can also browse our service pages for more information.'
        }
    };

    const currentLang = window.currentLanguage || 'zh';
    const langResponses = responses[currentLang];

    // 查找匹配的关键词
    const keywords = Object.keys(langResponses).filter(key => key !== 'default');
    const matchedKeyword = keywords.find(keyword =>
        message.toLowerCase().includes(keyword.toLowerCase())
    );

    return langResponses[matchedKeyword] || langResponses.default;
}

/**
 * 添加消息到聊天容器
 * @param {string} text - 消息文本
 * @param {string} type - 消息类型 ('user' 或 'ai')
 * @param {boolean} showTime - 是否显示时间
 */
function addMessage(text, type, showTime = true) {
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);

    if (showTime) {
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        messageDiv.appendChild(timeDiv);
    }

    chatContainer.appendChild(messageDiv);

    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * 显示打字指示器
 */
function showTypingIndicator() {
    if (!chatContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-message';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * 移除打字指示器
 */
function removeTypingIndicator() {
    if (!chatContainer) return;

    const typingMessage = chatContainer.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

/**
 * 获取当前语言的文本
 * @param {string} zhText - 中文文本
 * @param {string} enText - 英文文本
 * @returns {string} 当前语言的文本
 */
function getCurrentLanguageText(zhText, enText) {
    const currentLang = window.currentLanguage || 'zh';
    return currentLang === 'zh' ? zhText : enText;
}

// 监听语言变化事件
window.addEventListener('languageChanged', function(e) {
    const newLang = e.detail.language;

    // 更新输入框占位符
    if (messageInput) {
        const placeholder = newLang === 'zh' ? '请输入您的问题...' : 'Please enter your question...';
        messageInput.placeholder = placeholder;
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保主JS文件已加载
    setTimeout(initializeAIChat, 100);
});

// 导出函数供其他脚本使用
window.AIChat = {
    initializeAIChat,
    openChatModal,
    closeChatModal,
    sendMessage,
    addMessage
};