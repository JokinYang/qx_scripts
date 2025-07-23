# CICT 签到记录管理

这是一个用于 QuantumultX 的签到记录管理脚本，提供签到记录的显示和管理功能。

## 功能特性

- 📊 **记录显示**: 美观的 HTML 界面显示签到记录
- 🕐 **状态监控**: 实时显示当日 AM/PM 签到状态
- 📱 **响应式设计**: 支持移动端和桌面端访问
- 🎨 **现代界面**: 采用渐变色和卡片式设计

## 文件结构

```
cict/
├── dist/
│   └── setting.js      # 主设置页面脚本
└── lib/
    └── Env.js          # QuantumultX 环境库
```

## 数据结构

```javascript
{
  "date": "2025/7/23",
  "records": [
    {
      "date": "2025/7/23",
      "time": "12:00:00",
      "period": "AM",
      "isOffice": true,
      "signCount": 1,
      "id": "1943242285694062592"
    }
  ],
  "AM_SIGNIN": true,
  "PM_SIGNIN": false
}
```

## 使用方法

1. 将脚本配置到 QuantumultX
2. 通过设置页面查看签到记录
3. 支持查看历史记录和当日状态

## 存储配置

- **存储键名**: `cict_signin_record`
- **数据格式**: JSON 格式存储
- **环境依赖**: QuantumultX $prefs API