// src/services/api.js
// API服务层 - 封装所有后端API调用
// 后端地址: http://localhost:5001

import axios from "axios";

// 创建axios实例，配置基础URL
const API_BASE_URL = "http://localhost:5001/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 秒超时
  withCredentials: false, // 允许跨域请求携带凭证
});

// 请求拦截器 - 自动添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      //config.headers.Authorization = `Bearer ${token}`;
      // 确保 token 格式正确
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Debug: Request headers:", config.headers);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API服务对象
export const apiService = {
  // 用户注册
  // POST /api/register
  register: async (userData) => {
    try {
      const response = await api.post("/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "注册失败",
      };
    }
  },

  // 用户登录
  // POST /api/login
  login: async (credentials) => {
    try {
      const response = await api.post("/login", credentials);
      if (response.data.access_token) {
        // 保存token到本地存储
        localStorage.setItem("access_token", response.data.access_token);

        // 保存token过期时间 (24小时后)
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("token_expires_at", expiresAt);

        // 保存用户信息
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return {
          success: true,
          token: response.data.access_token,
          user: response.data.user,
        };
      }
      return { success: false, error: "登录失败" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "登录失败",
      };
    }
  },

  // 八字计算 (无需认证)
  // POST /api/calculate
  calculateBazi: async (birthData) => {
    try {
      const response = await api.post("/calculate", birthData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "计算失败",
      };
    }
  },

  // 保存命盘 (需要JWT认证)
  // POST /api/save_chart
  saveChart: async (chartData) => {
    try {
      const response = await api.post("/save_chart", chartData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "保存失败",
      };
    }
  },

  // 获取用户保存的命盘 (需要JWT认证)
  // GET /api/my_charts
  getMyCharts: async () => {
    try {
      // 先检查 token 是否过期
      if (!apiService.isAuthenticated()) {
        console.log("Debug: Token expired or not found");
        return {
          success: false,
          error: "登录已过期，请重新登录",
        };
      }

      // 检查 token
      const token = localStorage.getItem("access_token");
      if (!token) {
        return {
          success: false,
          error: "未登录，请先登录",
        };
      }

      console.log("Debug: 开始获取命盘列表");
      const response = await api.get("/my_charts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Debug: API响应", response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("获取命盘列表错误:", error.response || error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        return {
          success: false,
          error: "登录已过期，请重新登录",
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || "获取命盘列表失败",
      };
    }
  },

  // 删除命盘 (需要JWT认证)
  // DELETE /api/charts/:id
  deleteChart: async (chartId) => {
    try {
      const response = await api.delete(`/charts/${chartId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "删除失败",
      };
    }
  },

  // 检查登录状态
  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("token_expires_at");

    if (!token || !expiresAt) {
      return false;
    }

    // 检查是否过期
    const now = new Date().getTime();
    if (now >= parseInt(expiresAt)) {
      // 清除过期token
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_expires_at");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};

export default apiService;
