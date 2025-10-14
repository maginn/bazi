// src/App.jsx
// 主应用组件 - 管理路由和全局状态
// 访问地址: http://localhost:3000

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import BaziCalculator from "./components/BaziCalculator";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import SavedCharts from "./components/SavedCharts";
import { isAuthenticated, clearAuth } from "./utils/auth";
import "./App.css";

function App() {
  // ==================== 状态管理 ====================
  // 当前视图：'calculator' | 'login' | 'register' | 'saved'
  const [currentView, setCurrentView] = useState("calculator");

  // 用户登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 强制刷新计数器（用于重新渲染）
  const [refreshKey, setRefreshKey] = useState(0);

  // ==================== 检查登录状态 ====================
  const checkLoginStatus = () => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);
    console.log("🔐 登录状态检查:", loggedIn ? "已登录" : "未登录");
    return loggedIn;
  };

  // ==================== 初始化 ====================
  useEffect(() => {
    // 初始检查登录状态
    checkLoginStatus();

    // 监听存储变化（多标签页同步）
    const handleStorageChange = (e) => {
      if (e.key === "access_token") {
        console.log("🔄 检测到token变化");
        checkLoginStatus();
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ==================== 登录成功处理 ====================
  const handleLoginSuccess = (user) => {
    console.log("✅ 登录成功:", user);
    setIsLoggedIn(true);
    setCurrentView("calculator");

    // 显示欢迎消息
    if (user?.nickname) {
      setTimeout(() => {
        alert(`欢迎回来，${user.nickname}！`);
      }, 100);
    }
  };

  // ==================== 注册成功处理 ====================
  const handleRegisterSuccess = (user) => {
    console.log("✅ 注册成功:", user);
    // 注册成功后跳转到登录页
    setTimeout(() => {
      setCurrentView("login");
    }, 3000);
  };

  // ==================== 退出登录处理 ====================
  const handleLogout = () => {
    console.log("🚪 执行退出登录...");

    if (!window.confirm("确定要退出登录吗？")) {
      console.log("❌ 用户取消退出");
      return;
    }

    try {
      // 清除认证信息
      clearAuth();

      // 更新状态
      setIsLoggedIn(false);
      setCurrentView("calculator");
      setRefreshKey((prev) => prev + 1); // 强制刷新

      console.log("✅ 退出登录成功");

      // 显示提示消息
      setTimeout(() => {
        alert("已成功退出登录");
      }, 100);
    } catch (error) {
      console.error("❌ 退出登录失败:", error);
      alert("退出登录时出现错误");
    }
  };

  // ==================== 视图切换 ====================
  const renderView = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView("register")}
          />
        );

      case "register":
        return (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView("login")}
          />
        );

      case "saved":
        // 检查是否登录
        if (!isLoggedIn) {
          return (
            <div className="max-w-md mx-auto p-6 mt-20">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg text-center">
                <p className="font-semibold mb-2">⚠️ 需要登录</p>
                <p className="mb-4">请先登录后查看保存的命盘</p>
                <button
                  onClick={() => setCurrentView("login")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  去登录
                </button>
              </div>
            </div>
          );
        }
        return <SavedCharts />;

      case "calculator":
      default:
        return <BaziCalculator />;
    }
  };

  // ==================== 渲染主应用 ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* 主内容区域 */}
      <main className="py-8">{renderView()}</main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 「圆運」八字命理系统 </p>
          <p className="mt-2">  
            <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              六爻排盘
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              八宅风水
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              奇门遁甲
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              易学知识库
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              易学AI
            </a>
             <a href="#" className="text-indigo-600 hover:text-indigo-700 mx-2">
              关于我们
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            🌹 邮件反馈：zhoujx2005@163.com
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

// ==================== 使用说明 ====================
/*
应用结构:
App (主组件)
├── Navbar (导航栏)
└── 内容区域
    ├── BaziCalculator (八字计算)
    ├── LoginForm (登录)
    ├── RegisterForm (注册)
    └── SavedCharts (保存的命盘)

状态管理:
- currentView: 控制显示哪个视图
- isLoggedIn: 用户登录状态

视图切换逻辑:
1. 用户点击导航栏按钮 → setCurrentView()
2. currentView 改变 → renderView() 返回对应组件
3. 组件渲染到页面

登录流程:
1. 用户在 LoginForm 输入账号密码
2. 登录成功 → handleLoginSuccess() 被调用
3. 更新 isLoggedIn 状态
4. 切换到 calculator 视图

注册流程:
1. 用户在 RegisterForm 填写信息
2. 注册成功 → handleRegisterSuccess() 被调用
3. 3秒后自动跳转到登录页面
*/
