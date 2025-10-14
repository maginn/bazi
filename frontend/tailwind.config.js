/** @type {import('tailwindcss').Config} */
// tailwind.config.js - 八字命理系统专用配置
// 包含中式传统色彩和专业的八字界面设计

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      // 🎨 自定义颜色方案
      colors: {
        // 主品牌色 - 基于传统靛蓝
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // 主色
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },

        // 传统中式色彩
        chinese: {
          red: {
            50: "#fef2f2",
            500: "#dc2626", // 中国红
            600: "#b91c1c",
            700: "#991b1b",
          },
          gold: {
            50: "#fffbeb",
            400: "#fbbf24",
            500: "#f59e0b", // 金色
            600: "#d97706",
          },
          jade: {
            50: "#ecfdf5",
            500: "#10b981", // 翡翠绿
            600: "#059669",
            700: "#047857",
          },
          ink: {
            50: "#f9fafb",
            700: "#374151",
            800: "#1f2937", // 墨色
            900: "#111827",
          },
          paper: "#fefce8", // 宣纸色
        },

        // 五行专色 - 用于八字五行显示
        wuxing: {
          wood: {
            light: "#86efac", // 浅木色
            default: "#16a34a", // 木绿
            dark: "#15803d", // 深木色
          },
          fire: {
            light: "#fca5a5", // 浅火色
            default: "#dc2626", // 火红
            dark: "#b91c1c", // 深火色
          },
          earth: {
            light: "#fde68a", // 浅土色
            default: "#d97706", // 土黄
            dark: "#b45309", // 深土色
          },
          metal: {
            light: "#d1d5db", // 浅金色
            default: "#6b7280", // 金属色
            dark: "#4b5563", // 深金色
          },
          water: {
            light: "#93c5fd", // 浅水色
            default: "#2563eb", // 水蓝
            dark: "#1d4ed8", // 深水色
          },
        },

        // 天干颜色 - 十天干专用
        tiangan: {
          jia: "#16a34a", // 甲木 - 绿色
          yi: "#22c55e", // 乙木 - 浅绿
          bing: "#dc2626", // 丙火 - 红色
          ding: "#f87171", // 丁火 - 浅红
          wu: "#d97706", // 戊土 - 黄色
          ji: "#fbbf24", // 己土 - 浅黄
          geng: "#6b7280", // 庚金 - 灰色
          xin: "#9ca3af", // 辛金 - 浅灰
          ren: "#2563eb", // 壬水 - 蓝色
          gui: "#60a5fa", // 癸水 - 浅蓝
        },

        // 地支颜色 - 十二地支专用
        dizhi: {
          zi: "#1e40af", // 子水
          chou: "#d97706", // 丑土
          yin: "#16a34a", // 寅木
          mao: "#22c55e", // 卯木
          chen: "#d97706", // 辰土
          si: "#dc2626", // 巳火
          wu: "#dc2626", // 午火
          wei: "#d97706", // 未土
          shen: "#6b7280", // 申金
          you: "#9ca3af", // 酉金
          xu: "#d97706", // 戌土
          hai: "#2563eb", // 亥水
        },
      },

      // 🔤 字体设置
      fontFamily: {
        chinese: ["SimSun", "NSimSun", "宋体", "serif"],
        "chinese-kai": ["KaiTi", "楷体", "cursive"],
        english: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },

      // 📏 间距系统
      spacing: {
        18: "4.5rem", // 72px
        22: "5.5rem", // 88px
        88: "22rem", // 352px
        128: "32rem", // 512px
      },

      // 🎯 圆角设置
      borderRadius: {
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
      },

      // 🌈 阴影效果
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        strong:
          "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        pillar: "0 8px 32px rgba(0, 0, 0, 0.12)", // 八字柱专用阴影
        glow: "0 0 20px rgba(99, 102, 241, 0.3)", // 发光效果
      },

      // ✨ 动画效果
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-soft": "bounceSoft 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },

      // 🎬 关键帧动画
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translateY(0)" },
          "40%, 43%": { transform: "translateY(-5px)" },
          "70%": { transform: "translateY(-3px)" },
          "90%": { transform: "translateY(-2px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },

      // 📱 断点设置 (响应式)
      screens: {
        xs: "475px", // 超小屏手机
        sm: "640px", // 小屏手机
        md: "768px", // 平板
        lg: "1024px", // 小桌面
        xl: "1280px", // 桌面
        "2xl": "1536px", // 大桌面
      },

      // 🎨 渐变色设置
      backgroundImage: {
        "gradient-chinese": "linear-gradient(135deg, #fefce8 0%, #ffffff 100%)",
        "gradient-pillar": "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        "gradient-hero": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-wuxing":
          "linear-gradient(45deg, #16a34a, #dc2626, #d97706, #6b7280, #2563eb)",
      },

      // 🔲 边框设置
      borderWidth: {
        3: "3px",
        5: "5px",
      },

      // 📐 最大宽度
      maxWidth: {
        "8xl": "88rem", // 1408px
        "9xl": "96rem", // 1536px
      },

      // 📏 最小高度
      minHeight: {
        96: "24rem", // 384px
        "screen-75": "75vh",
      },
    },
  },
  plugins: [
    // 表单美化插件
    require("@tailwindcss/forms")({
      strategy: "class", // 只对有.form-类名的元素应用样式
    }),

    // 排版插件 - 用于文档和说明文字
    require("@tailwindcss/typography"),
  ],
};

// 使用说明:
// 1. 复制此文件到 frontend/tailwind.config.js
// 2. 在终端运行: npm install @tailwindcss/forms @tailwindcss/typography
// 3. 重启开发服务器: npm start
// 4. 开始在组件中使用自定义类名

/* 
常用类名示例:
- bg-chinese-red-500 (中国红背景)
- text-chinese-ink-800 (墨色文字) 
- bg-wuxing-wood-default (木属性绿色)
- text-tiangan-jia (甲木绿色)
- shadow-pillar (八字柱阴影)
- animate-fade-in (淡入动画)
- font-chinese (中文字体)
- bg-gradient-chinese (中式渐变背景)
*/
