// 华e通主要JavaScript文件 - 处理全站通用功能

// 全局变量
let currentLanguage = 'zh'; // 默认中文

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeNavigation();
});

/**
 * 初始化语言切换功能
 */
function initializeLanguageSwitcher() {
    const languageSwitcher = document.querySelector('.language-switcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', function() {
            currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
            switchLanguage(currentLanguage);

            // 更新语言切换按钮文本
            const langSpan = this.querySelector('span');
            if (langSpan) {
                langSpan.textContent = currentLanguage === 'zh' ? 'English' : '中文';
            }
        });
    }
}

/**
 * 语言切换函数
 * @param {string} lang - 语言代码 ('zh' 或 'en')
 */
function switchLanguage(lang) {
    // 获取所有带有语言属性的元素
    const elements = document.querySelectorAll('[data-lang-zh][data-lang-en]');

    elements.forEach(element => {
        const text = lang === 'zh' ?
            element.getAttribute('data-lang-zh') :
            element.getAttribute('data-lang-en');

        // 根据元素类型设置文本
        if (element.tagName === 'INPUT') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = text;
            } else {
                element.placeholder = text;
            }
        } else if (element.tagName === 'META') {
            element.content = text;
        } else {
            // 保留HTML结构，只更新文本内容
            if (element.innerHTML.includes('<')) {
                // 如果包含HTML标签，则只更新文本节点
                updateTextContent(element, text);
            } else {
                element.textContent = text;
            }
        }
    });

    // 更新页面语言属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 触发自定义事件，允许其他脚本监听语言变化
    window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang }
    }));
}

/**
 * 更新包含HTML标签的元素的文本内容
 * @param {Element} element - 要更新的元素
 * @param {string} newText - 新的文本内容
 */
function updateTextContent(element, newText) {
    // 获取第一个文本节点并更新
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNode = walker.nextNode();
    if (textNode) {
        textNode.textContent = newText;
    }
}

/**
 * 初始化平滑滚动
 */
function initializeSmoothScrolling() {
    // 为所有锚点链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 初始化导航功能
 */
function initializeNavigation() {
    // 处理移动端菜单（如果有）
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // 点击菜单项时关闭移动端菜单
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }

    // 高亮当前页面导航项
    highlightCurrentNavItem();
}

/**
 * 高亮当前页面的导航项
 */
function highlightCurrentNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;

        if (linkPath === currentPath ||
            (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 显示加载状态
 * @param {Element} element - 要显示加载状态的元素
 * @param {string} loadingText - 加载文本
 */
function showLoading(element, loadingText) {
    if (!element) return;

    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    element.disabled = true;
}

/**
 * 隐藏加载状态
 * @param {Element} element - 要隐藏加载状态的元素
 */
function hideLoading(element) {
    if (!element || !element.dataset.originalContent) return;

    element.innerHTML = element.dataset.originalContent;
    element.disabled = false;
    delete element.dataset.originalContent;
}

/**
 * 获取当前语言的文本
 * @param {string} zhText - 中文文本
 * @param {string} enText - 英文文本
 * @returns {string} 当前语言的文本
 */
function getCurrentLanguageText(zhText, enText) {
    return currentLanguage === 'zh' ? zhText : enText;
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 显示时长（毫秒）
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));

    // 自动关闭
    if (duration > 0) {
        setTimeout(() => removeNotification(notification), duration);
    }
}

/**
 * 获取通知图标
 * @param {string} type - 通知类型
 * @returns {string} 图标类名
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * 移除通知
 * @param {Element} notification - 通知元素
 */
function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
}

// 导出函数供其他脚本使用
window.ChinaEasyUtils = {
    switchLanguage,
    getCurrentLanguageText,
    showNotification,
    showLoading,
    hideLoading,
    debounce,
    throttle,
    formatDate
};