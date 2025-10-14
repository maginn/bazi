// src/components/Navbar.jsx
// 导航栏组件 - 显示菜单和用户状态

import React from "react";
import { User, LogOut, Calculator, BookOpen } from "lucide-react";
import { isAuthenticated, clearAuth } from "../utils/auth";

const Navbar = ({ currentView, setCurrentView }) => {
  const handleLogout = () => {
    clearAuth();
    setCurrentView("calculator");
    // 可以添加退出成功的提示
    window.location.reload();
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 - Logo和标题 */}
          <div className="flex items-center space-x-4">
            <img
              src="/yuanyun_logo.jpg"
              alt="圆運logo"
              className="h-12 w-12 object-cover rounded-full"
            />
            <h1 className="text-xl font-bold">「圆運」八字命理系统</h1>
          </div>

          {/* 中间 - 主要导航菜单 */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => setCurrentView("calculator")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "calculator"
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-indigo-100 hover:text-white hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>八字计算</span>
            </button>

            {isAuthenticated() && (
              <button
                onClick={() => setCurrentView("saved")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "saved"
                    ? "bg-white bg-opacity-20 text-white"
                    : "text-indigo-100 hover:text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>我的命盘</span>
              </button>
            )}
          </div>

          {/* 右侧 - 用户操作 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-sm">已登录</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">退出</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView("login")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "login"
                      ? "bg-white text-indigo-600"
                      : "text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => setCurrentView("register")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "register"
                      ? "bg-white text-indigo-600"
                      : "text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                  }`}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 移动端菜单 */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView("calculator")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "calculator"
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-indigo-100 hover:text-white hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>八字计算</span>
            </button>

            {isAuthenticated() && (
              <button
                onClick={() => setCurrentView("saved")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "saved"
                    ? "bg-white bg-opacity-20 text-white"
                    : "text-indigo-100 hover:text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>我的命盘</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
