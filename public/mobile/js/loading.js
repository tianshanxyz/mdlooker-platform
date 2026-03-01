/**
 * MDLooker Mobile App - Loading Manager
 * 全局加载状态管理器
 */

class LoadingManager {
    constructor() {
        this.overlay = null;
        this.skeletons = [];
        this.init();
    }

    init() {
        // 创建加载遮罩
        this.createOverlay();
        // 创建骨架屏样式
        this.injectSkeletonStyles();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中...</div>
        `;
        document.body.appendChild(this.overlay);
    }

    injectSkeletonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 加载遮罩 */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .loading-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f0f0f0;
                border-top-color: #339999;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-text {
                margin-top: 16px;
                font-size: 14px;
                color: #666;
            }
            
            /* 骨架屏 */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 8px;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }
            
            .skeleton-text:last-child {
                margin-bottom: 0;
            }
            
            .skeleton-title {
                height: 24px;
                width: 60%;
                margin-bottom: 16px;
            }
            
            .skeleton-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
            }
            
            .skeleton-card {
                height: 100px;
                margin-bottom: 16px;
            }
            
            .skeleton-list-item {
                height: 80px;
                margin-bottom: 12px;
            }
            
            /* 页面加载动画 */
            .page-loading {
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // 显示全屏加载
    show(text = '加载中...') {
        if (this.overlay) {
            this.overlay.querySelector('.loading-text').textContent = text;
            this.overlay.classList.add('active');
        }
    }

    // 隐藏全屏加载
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }

    // 显示骨架屏
    showSkeleton(container, type = 'list', count = 3) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!containerEl) return;

        let skeletonHTML = '';
        
        switch(type) {
            case 'list':
                for (let i = 0; i < count; i++) {
                    skeletonHTML += `<div class="skeleton skeleton-list-item"></div>`;
                }
                break;
            case 'card':
                for (let i = 0; i < count; i++) {
                    skeletonHTML += `<div class="skeleton skeleton-card"></div>`;
                }
                break;
            case 'text':
                skeletonHTML += `<div class="skeleton skeleton-title"></div>`;
                for (let i = 0; i < count; i++) {
                    skeletonHTML += `<div class="skeleton skeleton-text" style="width: ${Math.random() * 40 + 60}%"></div>`;
                }
                break;
            case 'avatar':
                skeletonHTML += `<div class="skeleton skeleton-avatar"></div>`;
                break;
        }
        
        containerEl.innerHTML = skeletonHTML;
        containerEl.dataset.hasSkeleton = 'true';
    }

    // 隐藏骨架屏
    hideSkeleton(container) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (containerEl && containerEl.dataset.hasSkeleton) {
            containerEl.innerHTML = '';
            delete containerEl.dataset.hasSkeleton;
        }
    }

    // 包装异步函数，自动显示/隐藏加载
    async wrap(promise, text = '加载中...') {
        this.show(text);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide();
        }
    }

    // 模拟加载（用于演示）
    simulate(duration = 1500, text = '加载中...') {
        return new Promise(resolve => {
            this.show(text);
            setTimeout(() => {
                this.hide();
                resolve();
            }, duration);
        });
    }
}

// 创建全局实例
const loading = new LoadingManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
