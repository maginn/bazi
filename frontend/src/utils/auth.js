// src/utils/auth.js
// 认证相关工具函数

// 检查用户是否已登录
export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  return !!token;
};

// 获取存储的token
export const getToken = () => {
  return localStorage.getItem("access_token");
};

// 保存token
export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

// 清除认证信息
export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

// 保存用户信息
export const setUser = (userInfo) => {
  localStorage.setItem("user", JSON.stringify(userInfo));
};

// 获取用户信息
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// 表单验证工具
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

// 日期验证工具
export const validateDate = (year, month, day, hour) => {
  const currentYear = new Date().getFullYear();

  // 基本范围检查
  if (year < 1900 || year > currentYear) {
    return { valid: false, error: "年份应在1900-" + currentYear + "之间" };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: "月份应在1-12之间" };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: "日期应在1-31之间" };
  }

  if (hour < 0 || hour > 23) {
    return { valid: false, error: "小时应在0-23之间" };
  }

  // 检查日期是否有效
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, error: "请输入有效的日期" };
  }

  return { valid: true };
};
