// src/components/RegisterForm.jsx
// 用户注册表单组件
// 功能：新用户注册、密码确认、邮箱验证

import React, { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import apiService from "../services/api";
import { validateEmail, validatePassword } from "../utils/auth";

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  // ==================== 状态管理 ====================
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // 密码强度指示器
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  // ==================== 密码强度检查 ====================
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = "";

    if (password.length === 0) {
      return { score: 0, feedback: "" };
    }

    // 长度检查
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 包含数字
    if (/\d/.test(password)) score += 1;

    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 1;

    // 包含小写字母
    if (/[a-z]/.test(password)) score += 1;

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // 反馈信息
    if (score < 3) {
      feedback = "弱";
    } else if (score < 5) {
      feedback = "中";
    } else {
      feedback = "强";
    }

    return { score: Math.min(score, 5), feedback };
  };

  // ==================== 表单验证 ====================
  const validateForm = () => {
    const errors = {};

    // 验证昵称
    if (!formData.nickname.trim()) {
      errors.nickname = "请输入昵称";
    } else if (formData.nickname.trim().length < 2) {
      errors.nickname = "昵称至少2个字符";
    } else if (formData.nickname.trim().length > 20) {
      errors.nickname = "昵称最多20个字符";
    }

    // 验证邮箱
    if (!formData.email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(formData.email)) {
      errors.email = "邮箱格式不正确";
    }

    // 验证密码
    if (!formData.password) {
      errors.password = "请输入密码";
    } else if (!validatePassword(formData.password)) {
      errors.password = "密码至少6位";
    }

    // 验证确认密码
    if (!formData.confirm_password) {
      errors.confirm_password = "请确认密码";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "两次输入的密码不一致";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== 输入处理 ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除字段错误
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // 清除全局错误和成功消息
    if (error) setError("");
    if (success) setSuccess("");

    // 实时检查密码强度
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
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
    setSuccess("");

    try {
      // 调用注册API
      const response = await apiService.register({
        nickname: formData.nickname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      if (response.success) {
        // 注册成功
        setSuccess("注册成功！3秒后自动跳转到登录页面...");

        // 延迟跳转到登录页面
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(response.data?.user);
          }
        }, 3000);
      } else {
        // 注册失败
        setError(response.error || "注册失败，请重试");
      }
    } catch (err) {
      console.error("注册错误:", err);
      setError("网络错误，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  };

  // 密码强度颜色
  const getStrengthColor = (score) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  // ==================== 渲染组件 ====================
  return (
    <div className="max-w-md mx-auto p-6">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <UserPlus className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">用户注册</h2>
        <p className="text-gray-600">创建账号以保存您的八字命盘</p>
      </div>

      {/* 注册表单 */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 昵称输入 */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <User className="inline h-4 w-4 mr-1" />
              昵称
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="请输入昵称"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.nickname
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
              maxLength={20}
            />
            {fieldErrors.nickname && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.nickname}
              </p>
            )}
          </div>

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
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
              autoComplete="email"
            />
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
              placeholder="至少6位密码"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}

            {/* 密码强度指示器 */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>密码强度</span>
                  <span className="font-medium">
                    {passwordStrength.feedback}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
                      passwordStrength.score
                    )}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* 确认密码输入 */}
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Lock className="inline h-4 w-4 mr-1" />
              确认密码
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              placeholder="请再次输入密码"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.confirm_password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          {/* 用户协议 */}
          <div className="flex items-start">
            <input
              id="agree"
              type="checkbox"
              required
              className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="agree" className="ml-2 block text-sm text-gray-700">
              我已阅读并同意
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 ml-1"
              >
                《用户协议》
              </button>
              和
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 ml-1"
              >
                《隐私政策》
              </button>
            </label>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                注册中...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                注册成功
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                注册
              </>
            )}
          </button>
        </form>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            已有账号？{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

// ==================== 组件说明 ====================
/*
使用方法:
<RegisterForm
  onRegisterSuccess={(user) => {
    // 注册成功后的处理
    console.log('注册成功:', user);
  }}
  onSwitchToLogin={() => {
    // 切换到登录页面
  }}
/>

功能特点:
1. 完整表单验证 - 昵称、邮箱、密码、确认密码
2. 密码强度检测 - 实时显示密码强度
3. 视觉反馈 - 错误和成功状态的清晰显示
4. 自动跳转 - 注册成功后自动跳转
5. 用户协议 - 必须同意才能注册
*/
