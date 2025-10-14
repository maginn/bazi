// src/components/BaziCalculator.jsx
// 八字计算器主组件 - 处理用户输入和显示结果
// 功能：日期输入、八字计算、结果展示、保存命盘
import React, { useState } from "react";
import {
  Calculator,
  Save,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import apiService from "../services/api";
import { validateDate, isAuthenticated } from "../utils/auth";

const BaziCalculator = () => {
  // ==================== 状态管理 ====================
  // 表单数据 - 出生日期时间
  const [birthData, setBirthData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
  });

  // 计算结果
  const [result, setResult] = useState(null);

  // UI状态
  const [loading, setLoading] = useState(false); // 计算中
  const [error, setError] = useState(""); // 错误信息
  const [success, setSuccess] = useState(""); // 成功信息
  const [saving, setSaving] = useState(false); // 保存中
  const [showResult, setShowResult] = useState(false); // 显示结果动画

  // ==================== 输入处理 ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 更新表单数据
    setBirthData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseInt(value),
    }));

    // 清除之前的消息
    if (error) setError("");
    if (success) setSuccess("");
  };

  // ==================== 八字计算 ====================
  const handleCalculate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResult(false);

    // 验证输入
    const { year, month, day, hour } = birthData;
    if (!year || !month || !day || hour === "") {
      setError("请填写完整的出生信息");
      return;
    }

    // 验证日期有效性
    const dateValidation = validateDate(year, month, day, hour);
    if (!dateValidation.valid) {
      setError(dateValidation.error);
      return;
    }

    setLoading(true);

    try {
      // 调用后端API计算八字
      const response = await apiService.calculateBazi(birthData);

      if (response.success) {
        setResult(response.data);
        setSuccess("八字计算成功！");

        // 延迟显示结果，创建动画效果
        setTimeout(() => {
          setShowResult(true);
        }, 100);
      } else {
        setError(response.error || "计算失败，请重试");
        setResult(null);
      }
    } catch (err) {
      console.error("计算错误:", err);
      setError("计算过程中出现错误，请重试");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 保存命盘 ====================
  const handleSaveChart = async () => {
    // 检查登录状态
    if (!isAuthenticated()) {
      setError("请先登录才能保存命盘");
      alert("请先登录才能保存命盘");
      return;
    }

    // 检查是否有计算结果
    if (!result) {
      setError("请先计算八字");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // 合并出生数据和计算结果
      const chartData = {
        ...birthData,
        ...result,
      };

      const response = await apiService.saveChart(chartData);

      if (response.success) {
        setSuccess("命盘保存成功！");

        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.error || "保存失败，请重试");
      }
    } catch (err) {
      console.error("保存错误:", err);
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // ==================== 重置表单 ====================
  const handleReset = () => {
    setBirthData({
      year: "",
      month: "",
      day: "",
      hour: "",
    });
    setResult(null);
    setError("");
    setSuccess("");
    setShowResult(false);
  };

  // ==================== 快速填充（测试用） ====================
  const handleQuickFill = () => {
    const now = new Date();
    setBirthData({
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
    });
  };

  // ==================== 天干地支颜色映射 ====================
  const getStemColor = (stem) => {
    const colors = {
      甲: "text-green-600 bg-green-50",
      乙: "text-green-500 bg-green-50",
      丙: "text-red-600 bg-red-50",
      丁: "text-red-500 bg-red-50",
      戊: "text-yellow-600 bg-yellow-50",
      己: "text-yellow-500 bg-yellow-50",
      庚: "text-gray-600 bg-gray-50",
      辛: "text-gray-500 bg-gray-50",
      壬: "text-blue-600 bg-blue-50",
      癸: "text-blue-500 bg-blue-50",
    };
    return colors[stem] || "text-gray-700 bg-gray-50";
  };

  const getBranchColor = (branch) => {
    const colors = {
      子: "text-blue-700 bg-blue-100",
      丑: "text-yellow-700 bg-yellow-100",
      寅: "text-green-700 bg-green-100",
      卯: "text-green-600 bg-green-100",
      辰: "text-yellow-700 bg-yellow-100",
      巳: "text-red-700 bg-red-100",
      午: "text-red-600 bg-red-100",
      未: "text-yellow-700 bg-yellow-100",
      申: "text-gray-700 bg-gray-100",
      酉: "text-gray-600 bg-gray-100",
      戌: "text-yellow-700 bg-yellow-100",
      亥: "text-blue-700 bg-blue-100",
    };
    return colors[branch] || "text-gray-700 bg-gray-100";
  };

  // ==================== 渲染单个柱 ====================
  const renderPillar = (pillar, title, colorClass, delay = 0) => {
    if (!pillar) return null;

    const [stem, branch] = pillar.split(" ");

    return (
      <div
        className={`transform transition-all duration-500 hover:scale-105 ${
          showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* 柱标题 */}
        <div className="text-center mb-3">
          <h3 className={`text-lg font-bold ${colorClass} mb-1`}>{title}</h3>
          <div className="text-xs text-gray-500">
            {title === "年柱" && "祖辈 运势"}
            {title === "月柱" && "父母 事业"}
            {title === "日柱" && "自身 配偶"}
            {title === "时柱" && "子女 晚年"}
          </div>
        </div>

        {/* 柱主体 */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* 天干 */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2 text-center">天干</div>
            <div
              className={`text-5xl font-bold text-center py-3 rounded-lg ${getStemColor(
                stem
              )}`}
            >
              {stem}
            </div>
          </div>

          {/* 地支 */}
          <div>
            <div className="text-xs text-gray-500 mb-2 text-center">地支</div>
            <div
              className={`text-5xl font-bold text-center py-3 rounded-lg ${getBranchColor(
                branch
              )}`}
            >
              {branch}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== 渲染组件 ====================
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">八字排盘计算</h2>
        <p className="text-gray-600">请输入准确的出生日期和时间（公历/阳历）</p>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 年份输入 */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                出生年份
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={birthData.year}
                onChange={handleInputChange}
                placeholder="如：1990"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* 月份输入 */}
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                月份
              </label>
              <select
                id="month"
                name="month"
                value={birthData.month}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">选择月份</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}月
                  </option>
                ))}
              </select>
            </div>

            {/* 日期输入 */}
            <div>
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                日期
              </label>
              <input
                type="number"
                id="day"
                name="day"
                value={birthData.day}
                onChange={handleInputChange}
                placeholder="如：15"
                min="1"
                max="31"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* 时辰输入 */}
            <div>
              <label
                htmlFor="hour"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                出生时辰
              </label>
              <select
                id="hour"
                name="hour"
                value={birthData.hour}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">选择时辰</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00 -{" "}
                    {i.toString().padStart(2, "0")}:59
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  计算中...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
                  开始计算
                </>
              )}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                重新计算
              </button>
            )}

            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={handleQuickFill}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                快速填充
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start animate-fade-in">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start animate-fade-in">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* 八字结果展示 */}
      {result && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                您的八字命盘
              </h3>
              <p className="text-gray-600">
                出生日期：{birthData.year}年{birthData.month}月{birthData.day}日{" "}
                {birthData.hour}时
              </p>
            </div>

            {isAuthenticated() && (
              <button
                onClick={handleSaveChart}
                disabled={saving}
                className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    保存命盘
                  </>
                )}
              </button>
            )}
          </div>

          {/* 四柱展示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderPillar(result.year_pillar, "年柱", "text-indigo-600", 0)}
            {renderPillar(result.month_pillar, "月柱", "text-purple-600", 100)}
            {renderPillar(result.day_pillar, "日柱", "text-pink-600", 200)}
            {renderPillar(result.hour_pillar, "时柱", "text-blue-600", 300)}
          </div>

          {/* 未登录提示 */}
          {!isAuthenticated() && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm">
                💡 <strong>提示：</strong>登录后可以保存命盘，方便以后查看
              </p>
            </div>
          )}

          {/* 八字说明 */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">📚 八字说明</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <strong>年柱</strong>：代表祖辈、童年运势（1-16岁）
              </p>
              <p>
                • <strong>月柱</strong>：代表父母、青年运势（17-32岁）、事业宫
              </p>
              <p>
                • <strong>日柱</strong>：代表自己、中年运势（33-48岁）、婚姻宫
              </p>
              <p>
                • <strong>时柱</strong>：代表子女、晚年运势（49岁以后）
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">📝 使用说明</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            请输入<strong>公历（阳历）</strong>日期，系统会自动换算为农历
          </li>
          <li>出生时间请尽量准确，时辰对八字影响很大</li>
          <li>本系统采用真太阳时计算，结果更加精确</li>
          <li>如不确定出生时间，可以咨询父母或查看出生证明</li>
        </ul>
      </div>
    </div>
  );
};

export default BaziCalculator;

// ==================== 组件说明 ====================
/*
功能特点:
1. ✅ 完整的日期时间输入表单
2. ✅ 前端表单验证
3. ✅ 八字计算API调用
4. ✅ 精美的四柱结果展示
5. ✅ 天干地支颜色区分
6. ✅ 保存功能（需登录）
7. ✅ 动画效果和过渡
8. ✅ 响应式布局
9. ✅ 错误和成功状态处理
10. ✅ 使用说明和提示信息

使用方法:
import BaziCalculator from './components/BaziCalculator';
<BaziCalculator />

依赖:
- apiService.calculateBazi() - 计算八字
- apiService.saveChart() - 保存命盘
- validateDate() - 日期验证
- isAuthenticated() - 登录状态检查
*/
