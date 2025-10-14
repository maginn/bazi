// src/components/SavedCharts.jsx
// 保存的命盘列表组件
// 功能：显示用户保存的所有八字命盘、删除功能、详情查看

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Trash2,
  Eye,
  AlertCircle,
  Loader,
} from "lucide-react";
import apiService from "../services/api";

const SavedCharts = () => {
  // ==================== 状态管理 ====================
  const [charts, setCharts] = useState([]); // 命盘列表
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(""); // 错误信息
  const [selectedChart, setSelectedChart] = useState(null); // 选中的命盘
  const [deleting, setDeleting] = useState(null); // 正在删除的ID

  // ==================== 获取命盘列表 ====================
  const fetchCharts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiService.getMyCharts();

      if (response.success) {
        setCharts(response.data);
      } else {
        setError(response.error || "获取命盘列表失败");
      }
    } catch (err) {
      console.error("获取命盘错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCharts();
  }, []);

  // ==================== 删除命盘 ====================
  const handleDelete = async (chartId) => {
    // 确认删除
    if (!window.confirm("确定要删除这个命盘吗？")) {
      return;
    }

    setDeleting(chartId);

    try {
      const response = await apiService.deleteChart(chartId);

      if (response.success) {
        // 从列表中移除已删除的命盘
        setCharts((prevCharts) =>
          prevCharts.filter((chart) => chart.id !== chartId)
        );

        // 如果删除的是当前选中的，清除选中状态
        if (selectedChart?.id === chartId) {
          setSelectedChart(null);
        }
      } else {
        alert(response.error || "删除失败");
      }
    } catch (err) {
      console.error("删除命盘错误:", err);
      alert("删除失败，请重试");
    } finally {
      setDeleting(null);
    }
  };

  // ==================== 查看详情 ====================
  const handleViewDetails = (chart) => {
    setSelectedChart(chart);
  };

  const closeDetails = () => {
    setSelectedChart(null);
  };

  // ==================== 格式化日期 ====================
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // ==================== 渲染加载状态 ====================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // ==================== 渲染错误状态 ====================
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">加载失败</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchCharts}
              className="mt-2 text-sm underline hover:no-underline"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 渲染空状态 ====================
  if (charts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            暂无保存的命盘
          </h3>
          <p className="text-gray-600">去计算您的第一个八字命盘吧</p>
        </div>
      </div>
    );
  }

  // ==================== 渲染命盘列表 ====================
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 标题 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">我的命盘</h2>
        <p className="text-gray-600">共保存了 {charts.length} 个命盘</p>
      </div>

      {/* 命盘网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart, index) => (
          <div
            key={chart.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* 卡片头部 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
              <div className="flex items-center text-white">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-semibold">
                  {chart.birth_info || chart.date}
                </span>
              </div>
            </div>

            {/* 卡片内容 */}
            <div className="p-4">
              {/* 四柱展示 */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {/* 年柱 */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">年柱</div>
                  <div className="text-lg font-bold text-indigo-700 font-chinese">
                    {chart.year_pillar.split(" ").map((char, i) => (
                      <div key={i}>{char}</div>
                    ))}
                  </div>
                </div>

                {/* 月柱 */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">月柱</div>
                  <div className="text-lg font-bold text-purple-700 font-chinese">
                    {chart.month_pillar.split(" ").map((char, i) => (
                      <div key={i}>{char}</div>
                    ))}
                  </div>
                </div>

                {/* 日柱 */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">日柱</div>
                  <div className="text-lg font-bold text-pink-700 font-chinese">
                    {chart.day_pillar.split(" ").map((char, i) => (
                      <div key={i}>{char}</div>
                    ))}
                  </div>
                </div>

                {/* 时柱 */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">时柱</div>
                  <div className="text-lg font-bold text-blue-700 font-chinese">
                    {chart.hour_pillar.split(" ").map((char, i) => (
                      <div key={i}>{char}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 保存时间 */}
              <div className="text-xs text-gray-500 mb-3">
                保存于: {formatDate(chart.created_at)}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(chart)}
                  className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  查看
                </button>

                <button
                  onClick={() => handleDelete(chart.id)}
                  disabled={deleting === chart.id}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === chart.id ? (
                    <>
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                      删除中
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 详情模态框 */}
      {selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 模态框头部 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">命盘详情</h3>
              <button
                onClick={closeDetails}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6">
              {/* 出生信息 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  出生信息
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <span className="font-medium">出生日期：</span>
                    {selectedChart.birth_info || selectedChart.date}
                  </p>
                </div>
              </div>

              {/* 八字四柱 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  八字四柱
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {/* 年柱 */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 text-center">
                    <div className="text-sm text-indigo-600 font-medium mb-2">
                      年柱
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 font-chinese mb-1">
                      {selectedChart.year_pillar.split(" ")[0]}
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 font-chinese">
                      {selectedChart.year_pillar.split(" ")[1]}
                    </div>
                  </div>

                  {/* 月柱 */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                    <div className="text-sm text-purple-600 font-medium mb-2">
                      月柱
                    </div>
                    <div className="text-3xl font-bold text-purple-700 font-chinese mb-1">
                      {selectedChart.month_pillar.split(" ")[0]}
                    </div>
                    <div className="text-3xl font-bold text-purple-700 font-chinese">
                      {selectedChart.month_pillar.split(" ")[1]}
                    </div>
                  </div>

                  {/* 日柱 */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
                    <div className="text-sm text-pink-600 font-medium mb-2">
                      日柱
                    </div>
                    <div className="text-3xl font-bold text-pink-700 font-chinese mb-1">
                      {selectedChart.day_pillar.split(" ")[0]}
                    </div>
                    <div className="text-3xl font-bold text-pink-700 font-chinese">
                      {selectedChart.day_pillar.split(" ")[1]}
                    </div>
                  </div>

                  {/* 时柱 */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      时柱
                    </div>
                    <div className="text-3xl font-bold text-blue-700 font-chinese mb-1">
                      {selectedChart.hour_pillar.split(" ")[0]}
                    </div>
                    <div className="text-3xl font-bold text-blue-700 font-chinese">
                      {selectedChart.hour_pillar.split(" ")[1]}
                    </div>
                  </div>
                </div>
              </div>

              {/* 保存信息 */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  保存时间：{formatDate(selectedChart.created_at)}
                </p>
                <p className="text-sm text-gray-500">
                  命盘ID：{selectedChart.id}
                </p>
              </div>

              {/* 关闭按钮 */}
              <div className="mt-6">
                <button
                  onClick={closeDetails}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCharts;

// ==================== 组件说明 ====================
/*
使用方法:
import SavedCharts from './components/SavedCharts';

<SavedCharts />

功能特点:
1. 自动加载用户保存的所有命盘
2. 卡片式展示，支持响应式布局
3. 查看详情 - 模态框显示完整信息
4. 删除功能 - 带确认提示
5. 加载和错误状态处理
6. 空状态提示
7. 日期格式化显示

API依赖:
- apiService.getMyCharts() - 获取命盘列表
- apiService.deleteChart(id) - 删除指定命盘

注意事项:
- 需要用户登录才能访问
- 删除操作会从列表中实时移除
- 使用模态框展示详情，避免页面跳转
*/
