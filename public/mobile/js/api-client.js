/**
 * MDLooker Mobile APP - API Client
 * 直接复用网站后端API
 */

class MDLookerAPI {
    constructor() {
        // 根据环境自动选择API地址
        this.baseURL = this.detectBaseURL();
        this.timeout = 30000; // 30秒超时
    }

    // 自动检测API基础地址
    detectBaseURL() {
        const hostname = window.location.hostname;
        
        // 本地开发环境
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        
        // 生产环境 - 使用相对路径
        return '/api';
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            ...options,
        };

        // 添加认证Token
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            config.signal = controller.signal;
            
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // 处理HTTP错误
            if (!response.ok) {
                if (response.status === 401) {
                    // Token过期，清除本地存储
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            throw error;
        }
    }

    // ==================== 搜索相关 ====================
    
    /**
     * 统一搜索
     * 复用网站API: POST /api/search-unified
     */
    async search(query, options = {}) {
        return this.request('/search-unified', {
            method: 'POST',
            body: JSON.stringify({
                query,
                limit: options.limit || 20,
                includeWeb: options.includeWeb !== false,
                locale: options.locale || 'zh',
            }),
        });
    }

    /**
     * 搜索建议
     * 复用网站API: GET /api/search-suggestions
     */
    async searchSuggestions(query, limit = 5) {
        return this.request(`/search-suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    }

    // ==================== 企业相关 ====================

    /**
     * 获取企业详情
     * 复用网站API: GET /api/companies/{id}
     */
    async getCompany(id) {
        return this.request(`/companies/${id}`);
    }

    /**
     * 获取企业合规档案
     * 复用网站API: GET /api/compliance-profile
     */
    async getComplianceProfile(companyId) {
        return this.request(`/compliance-profile?id=${companyId}`);
    }

    /**
     * 对比多个企业
     */
    async compareCompanies(companyIds) {
        const promises = companyIds.map(id => this.getCompany(id));
        return Promise.all(promises);
    }

    // ==================== 用户相关 ====================

    /**
     * 用户登录
     * 复用网站API: POST /api/auth/callback
     */
    async login(credentials) {
        const data = await this.request('/auth/callback', {
            method: 'POST',
            body: JSON.stringify({
                ...credentials,
                action: 'login',
            }),
        });
        
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    }

    /**
     * 用户注册
     */
    async register(userData) {
        return this.request('/auth/callback', {
            method: 'POST',
            body: JSON.stringify({
                ...userData,
                action: 'register',
            }),
        });
    }

    /**
     * 获取用户信息
     * 复用网站API: GET /api/mobile/user/profile
     */
    async getUserProfile() {
        return this.request('/mobile/user/profile');
    }

    /**
     * 更新用户信息
     */
    async updateUserProfile(data) {
        return this.request('/mobile/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // ==================== 收藏相关 ====================

    /**
     * 获取收藏列表
     * 复用网站API: GET /api/mobile/user/favorites
     */
    async getFavorites() {
        return this.request('/mobile/user/favorites');
    }

    /**
     * 添加收藏
     */
    async addFavorite(companyId) {
        return this.request('/mobile/user/favorites', {
            method: 'POST',
            body: JSON.stringify({ company_id: companyId }),
        });
    }

    /**
     * 取消收藏
     */
    async removeFavorite(favoriteId) {
        return this.request(`/mobile/user/favorites?id=${favoriteId}`, {
            method: 'DELETE',
        });
    }

    // ==================== 报告相关 ====================

    /**
     * 生成企业报告
     * 复用网站API: GET /api/due-diligence/{id}
     */
    async generateReport(companyId, type = 'full') {
        return this.request(`/due-diligence/${companyId}`, {
            method: 'POST',
            body: JSON.stringify({ type }),
        });
    }

    /**
     * 下载报告
     * 复用网站API: GET /api/due-diligence/{id}/download
     */
    async downloadReport(reportId) {
        return this.request(`/due-diligence/${reportId}/download`);
    }

    // ==================== 评论相关 ====================

    /**
     * 获取企业评论
     * 复用网站API: GET /api/companies/{id}/comments
     */
    async getComments(companyId) {
        return this.request(`/companies/${companyId}/comments`);
    }

    /**
     * 添加评论
     */
    async addComment(companyId, content) {
        return this.request(`/companies/${companyId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    /**
     * 投票评论
     * 复用网站API: POST /api/comments/{id}/vote
     */
    async voteComment(commentId, type) {
        return this.request(`/comments/${commentId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ type }), // 'up' | 'down'
        });
    }

    // ==================== 工具方法 ====================

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return !!localStorage.getItem('auth_token');
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * 退出登录
     */
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('search_history');
    }

    /**
     * 保存搜索历史到本地
     */
    saveSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('search_history') || '[]');
        history.unshift({
            query,
            timestamp: new Date().toISOString(),
        });
        // 只保留最近20条
        history = history.slice(0, 20);
        localStorage.setItem('search_history', JSON.stringify(history));
    }

    /**
     * 获取搜索历史
     */
    getSearchHistory() {
        return JSON.parse(localStorage.getItem('search_history') || '[]');
    }

    /**
     * 清除搜索历史
     */
    clearSearchHistory() {
        localStorage.removeItem('search_history');
    }
}

// 创建全局实例
const api = new MDLookerAPI();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MDLookerAPI;
}
