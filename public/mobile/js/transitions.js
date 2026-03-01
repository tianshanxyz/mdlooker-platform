/**
 * MDLooker Mobile App - Page Transitions
 * 页面跳转动画管理器
 */

class PageTransition {
    constructor() {
        this.currentPage = null;
        this.isTransitioning = false;
        this.init();
    }

    init() {
        // 注入动画样式
        this.injectStyles();
        // 监听页面加载
        this.handlePageLoad();
        // 拦截链接点击
        this.interceptLinks();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 页面容器 */
            .page-container {
                position: relative;
                width: 100%;
                min-height: 100vh;
            }
            
            /* 页面进入动画 - 从右向左 */
            .page-enter {
                animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes slideInFromRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* 页面进入动画 - 从左向右 */
            .page-enter-left {
                animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* 页面进入动画 - 从下向上 */
            .page-enter-up {
                animation: slideInFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes slideInFromBottom {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* 页面进入动画 - 淡入 */
            .page-fade-in {
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            /* 页面退出动画 */
            .page-exit {
                animation: slideOutToLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes slideOutToLeft {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-30%);
                }
            }
            
            /* 元素进入动画 - 依次显示 */
            .stagger-children > * {
                opacity: 0;
                transform: translateY(20px);
                animation: staggerIn 0.4s ease forwards;
            }
            
            .stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
            .stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
            .stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
            .stagger-children > *:nth-child(4) { animation-delay: 0.2s; }
            .stagger-children > *:nth-child(5) { animation-delay: 0.25s; }
            .stagger-children > *:nth-child(6) { animation-delay: 0.3s; }
            .stagger-children > *:nth-child(7) { animation-delay: 0.35s; }
            .stagger-children > *:nth-child(8) { animation-delay: 0.4s; }
            
            @keyframes staggerIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* 卡片悬停效果 */
            .card-hover {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .card-hover:active {
                transform: scale(0.98);
            }
            
            /* 按钮点击效果 */
            .btn-press {
                transition: transform 0.1s ease;
            }
            
            .btn-press:active {
                transform: scale(0.95);
            }
            
            /* 列表项滑入 */
            .list-item-slide {
                animation: slideInFromRight 0.3s ease;
            }
            
            /* 页面切换遮罩 */
            .transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #339999;
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease;
            }
            
            .transition-overlay.active {
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(style);
    }

    handlePageLoad() {
        // 页面加载时添加进入动画
        document.addEventListener('DOMContentLoaded', () => {
            const body = document.body;
            body.classList.add('page-enter');
            
            // 为列表添加依次显示动画
            const lists = document.querySelectorAll('.list-container, .card-list, .menu-list');
            lists.forEach(list => {
                list.classList.add('stagger-children');
            });
            
            // 为卡片添加悬停效果
            const cards = document.querySelectorAll('.card, .list-item');
            cards.forEach(card => {
                card.classList.add('card-hover');
            });
            
            // 为按钮添加点击效果
            const buttons = document.querySelectorAll('button, .btn');
            buttons.forEach(btn => {
                btn.classList.add('btn-press');
            });
        });
    }

    interceptLinks() {
        // 拦截所有链接点击，添加过渡动画
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // 跳过外部链接和锚点
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript')) {
                return;
            }
            
            // 跳过新窗口链接
            if (link.target === '_blank') return;
            
            e.preventDefault();
            
            // 添加退出动画
            document.body.classList.add('page-exit');
            
            // 延迟跳转
            setTimeout(() => {
                window.location.href = href;
            }, 250);
        });
    }

    // 导航到页面（带动画）
    navigateTo(url, direction = 'right') {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // 添加退出动画
        const exitClass = direction === 'right' ? 'page-exit' : 'page-exit-left';
        document.body.classList.add(exitClass);
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    // 返回上一页（带动画）
    goBack() {
        document.body.classList.add('page-exit');
        setTimeout(() => {
            window.history.back();
        }, 250);
    }

    // 添加元素动画
    animateElement(element, animationClass) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.classList.add(animationClass);
            el.addEventListener('animationend', () => {
                el.classList.remove(animationClass);
            }, { once: true });
        }
    }

    // 为列表项添加滑入动画
    animateListItems(container) {
        const items = container.querySelectorAll('.list-item, .card');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
            item.classList.add('list-item-slide');
        });
    }
}

// 创建全局实例
const pageTransition = new PageTransition();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageTransition;
}
