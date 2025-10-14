// src/components/LoginForm.jsx
// 用户登录表单组件
// 功能：处理用户登录、表单验证、JWT token存储

import React, { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import apiService from "../services/api";
import { validateEmail, setToken, setUser } from "../utils/auth";

const LoginForm = ({ onLoginSuccess, onSwitchToRegister }) => {
  // ==================== 状态管理 ====================
  // 表单数据
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI状态
  const [loading, setLoading] = useState(false); // 加载状态
  const [error, setError] = useState(""); // 错误信息
  const [fieldErrors, setFieldErrors] = useState({}); // 字段级错误

  // ==================== 表单验证 ====================
  const validateForm = () => {
    const errors = {};

    // 验证邮箱
    if (!formData.email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(formData.email)) {
      errors.email = "邮箱格式不正确";
    }

    // 验证密码
    if (!formData.password) {
      errors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      errors.password = "密码至少6位";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== 输入处理 ====================
  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 更新表单数据
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除该字段的错误
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // 清除全局错误
    if (error) setError("");
  };

  // ==================== 表单提交 ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 前端验证
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 调用登录API
      const response = await apiService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success) {
        // 登录成功
        // 1. 存储token到localStorage
        setToken(response.token);
        setUser(response.user);

        // 2. 存储用户信息
        if (response.user) {
          setUser(response.user);
        }

        // 3. 通知父组件登录成功
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }

        // 4. 显示成功消息（可选）
        console.log("登录成功:", response.user?.nickname);
      } else {
        // 登录失败
        setError(response.error || "登录失败，请重试");
      }
    } catch (err) {
      console.error("登录错误:", err);
      setError("网络错误，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  };

  // ==================== 渲染组件 ====================
  return (
    <div className="max-w-md mx-auto p-6">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <LogIn className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">用户登录</h2>
        <p className="text-gray-600">登录后可以保存和管理您的命盘</p>
      </div>

      {/* 登录表单 */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 全局错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 邮箱输入 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Mail className="inline h-4 w-4 mr-1" />
              邮箱地址
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              disabled={loading}
              autoComplete="email"
            />
            {/* 字段错误提示 */}
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* 密码输入 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Lock className="inline h-4 w-4 mr-1" />
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              disabled={loading}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* 记住我和忘记密码（可选功能） */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                记住我
              </label>
            </div>
            <div>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                忘记密码？
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                登录中...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                登录
              </>
            )}
          </button>
        </form>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            还没有账号？{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>

      {/* 快速登录提示（开发调试用） */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-semibold mb-1">🔧 开发模式提示:</p>
          <p>测试账号: test@example.com / 密码: 123456</p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;

// ==================== 组件说明 ====================
/*
使用方法:
import LoginForm from './components/LoginForm';

<LoginForm
  onLoginSuccess={(user) => {
    console.log('登录成功:', user);
    // 切换到主界面
  }}
  onSwitchToRegister={() => {
    // 切换到注册页面
  }}
/>

功能特点:
1. 表单验证 - 前端验证邮箱格式和密码长度
2. 错误处理 - 显示字段级和全局错误信息
3. 加载状态 - 提交时显示加载动画
4. Token管理 - 自动存储JWT token到localStorage
5. 响应式设计 - 适配移动端和桌面端
6. 无障碍支持 - 正确的label和autocomplete属性
*/
