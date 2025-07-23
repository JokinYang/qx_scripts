const Env = require('./lib/Env.js')

const $ = new Env('CICT Setting')

// 存储键
const SIGNIN_RECORD_KEY = 'cict_signin_record'
const SETTING_KEY = 'cict_setting'

// 版本信息
$.version = '1.0.0'
$.versionType = 'release'

// 需要 rewrite 支持
$.isNeedRewrite = true

// 请求响应体
$.json = $.name
$.html = $.name

!(async () => {
  // 请求路径
  $.path = getPath($request.url)
  
  // 请求参数解析
  const [, query] = $.path.split('?')
  $.queries = query
    ? query.split('&').reduce((obj, cur) => {
        const [key, val] = cur.split('=')
        obj[key] = decodeURIComponent(val || '')
        return obj
      }, {})
    : {}

  // 请求类型判断
  $.isGet = $request.method === 'GET'
  $.isPost = $request.method === 'POST'
  $.isOptions = $request.method === 'OPTIONS'

  // 处理不同类型的请求
  if ($.isOptions) {
    await handleOptions()
  } else if ($.isGet) {
    await handlePage()
  } else if ($.isPost) {
    await handleApi()
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => done())

/**
 * 获取路径
 */
function getPath(url) {
  const end = url.lastIndexOf('/') === url.length - 1 ? -1 : undefined
  return url.slice(url.indexOf('/', 8), end)
}

/**
 * 处理页面请求
 */
async function handlePage() {
  const records = getSigninRecords()
  const settings = getSettings()
  
  $.html = generateHTML(records, settings)
}

/**
 * 处理API请求
 */
async function handleApi() {
  const action = $.queries.action || 'unknown'
  
  switch (action) {
    case 'save':
      await apiSave()
      break
    default:
      $.json = { success: false, message: 'Unknown action' }
  }
}

/**
 * 处理OPTIONS请求
 */
async function handleOptions() {
  // CORS 预检
}

/**
 * 获取签到记录
 */
function getSigninRecords() {
  return $.getjson(SIGNIN_RECORD_KEY, {})
}

/**
 * 获取设置
 */
function getSettings() {
  const defaultSettings = {
    autoSignin: true,
    notification: true,
    retentionDays: 30
  }
  return Object.assign(defaultSettings, $.getjson(SETTING_KEY, {}))
}

/**
 * API: 保存数据
 */
async function apiSave() {
  try {
    const data = $.toObj($request.body)
    
    if (data.type === 'settings') {
      $.setjson(data.settings, SETTING_KEY)
      $.json = { success: true, message: '设置保存成功' }
    } else {
      $.json = { success: false, message: '无效的保存类型' }
    }
  } catch (e) {
    $.json = { success: false, message: '保存失败: ' + e.message }
  }
}

/**
 * 生成HTML页面
 */
function generateHTML(records, settings) {
  const today = new Date().toLocaleDateString()
  const todayRecord = records.date === today ? records : { 
    date: today, 
    records: [], 
    AM_SIGNIN: false, 
    PM_SIGNIN: false 
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>CICT 签到管理</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 10px;
            line-height: 1.4;
        }
        
        .container {
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 16px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 20px;
            margin-bottom: 4px;
            font-weight: 600;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 13px;
        }
        
        .tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .tab {
            flex: 1;
            padding: 14px 8px;
            text-align: center;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 15px;
            color: #6c757d;
            transition: all 0.3s;
            outline: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        .tab.active {
            color: #667eea;
            background: white;
            border-bottom: 2px solid #667eea;
            font-weight: 600;
        }
        
        .tab-content {
            padding: 16px;
            min-height: 350px;
        }
        
        .tab-pane {
            display: none;
        }
        
        .tab-pane.active {
            display: block;
        }
        
        /* 今日状态样式 */
        .today-status {
            margin-bottom: 20px;
        }
        
        .today-status h3 {
            color: #333;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .status-card {
            padding: 14px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e9ecef;
            transition: all 0.3s;
            position: relative;
        }
        
        .status-card.success {
            background: #d4edda;
            border-color: #28a745;
        }
        
        .status-card.pending {
            background: #fff3cd;
            border-color: #ffc107;
        }
        
        .status-icon {
            font-size: 18px;
            margin-bottom: 6px;
            display: block;
        }
        
        .status-text {
            font-weight: 600;
            color: #333;
            margin-bottom: 3px;
            font-size: 13px;
        }
        
        .status-label {
            font-size: 11px;
            color: #6c757d;
        }
        
        /* 统计信息样式 */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 18px;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
            display: block;
        }
        
        .stat-label {
            font-size: 11px;
            color: #6c757d;
            margin-top: 3px;
        }
        
        /* 记录列表样式 */
        .records-section h3 {
            color: #333;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .record-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            border-left: 3px solid #667eea;
        }
        
        .record-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .record-time {
            font-weight: 600;
            color: #333;
            font-size: 13px;
        }
        
        .badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .badge-morning {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .badge-afternoon {
            background: #fff3e0;
            color: #f57c00;
        }
        
        .record-details {
            display: grid;
            gap: 3px;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }
        
        .label {
            color: #6c757d;
        }
        
        .value {
            font-weight: 500;
        }
        
        .value.success {
            color: #28a745;
        }
        
        .value.error {
            color: #dc3545;
        }
        
        .no-records {
            text-align: center;
            color: #6c757d;
            padding: 30px 15px;
            font-style: italic;
            font-size: 14px;
        }
        
        /* 配置页面样式 */
        .config-content h3 {
            color: #333;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .config-item:last-child {
            border-bottom: none;
        }
        
        .config-item label {
            font-weight: 500;
            color: #333;
            font-size: 14px;
        }
        
        .toggle-switch {
            position: relative;
            width: 44px;
            height: 22px;
            flex-shrink: 0;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.3s;
            border-radius: 22px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #667eea;
        }
        
        input:checked + .slider:before {
            transform: translateX(22px);
        }
        
        .config-select {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            min-width: 80px;
            font-size: 13px;
            outline: none;
        }
        
        .config-actions {
            margin-top: 20px;
            text-align: center;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
            outline: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:active {
            background: #5a6fd8;
            transform: scale(0.98);
        }
        
        /* 移动端优化 */
        @media (max-width: 480px) {
            body {
                padding: 8px;
            }
            
            .container {
                border-radius: 10px;
            }
            
            .header {
                padding: 14px;
            }
            
            .header h1 {
                font-size: 18px;
            }
            
            .tab-content {
                padding: 14px;
            }
            
            .status-card {
                padding: 12px;
            }
            
            .stat-card {
                padding: 10px;
            }
            
            .record-item {
                padding: 10px;
            }
        }
        
        /* 暗色模式支持 */
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            }
            
            .container {
                background: #1a1a1a;
                color: #ffffff;
            }
            
            .tabs {
                background: #2c2c2c;
                border-color: #404040;
            }
            
            .tab {
                color: #999;
            }
            
            .tab.active {
                color: #667eea;
                background: #1a1a1a;
            }
            
            .today-status h3,
            .records-section h3,
            .config-content h3 {
                color: #ffffff;
            }
            
            .record-item {
                background: #2c2c2c;
                border-left-color: #667eea;
            }
            
            .stat-card {
                background: #2c2c2c;
                border-color: #404040;
            }
            
            .config-item {
                border-color: #404040;
            }
            
            .config-item label {
                color: #ffffff;
            }
            
            .no-records {
                color: #999;
            }
        }
        
        /* 触摸反馈 */
        .tab:active {
            transform: scale(0.95);
        }
        
        .status-card:active {
            transform: scale(0.98);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 CICT 签到管理</h1>
            <p>查看签到记录和管理配置</p>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="switchTab(event, 'records')">📊 签到记录</button>
            <button class="tab" onclick="switchTab(event, 'config')">⚙️ 设置</button>
        </div>
        
        <div class="tab-content">
            <div id="records" class="tab-pane active">
                ${generateRecordsHTML(todayRecord)}
            </div>
            <div id="config" class="tab-pane">
                ${generateConfigHTML(settings)}
            </div>
        </div>
    </div>
    
    <script>
        // 初始化设置数据
        const settingsData = ${JSON.stringify(settings)};
        
        function switchTab(evt, tabName) {
            var i, tabcontent, tablinks;
            
            tabcontent = document.getElementsByClassName("tab-pane");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            
            tablinks = document.getElementsByClassName("tab");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }
        
        function saveConfig() {
            const autoSignin = document.getElementById('autoSignin').checked;
            const notification = document.getElementById('notification').checked;
            const retentionDays = document.getElementById('retentionDays').value;
            
            const settings = {
                autoSignin,
                notification,
                retentionDays: parseInt(retentionDays)
            };
            
            // 显示保存提示
            const btn = document.querySelector('.btn-primary');
            const originalText = btn.textContent;
            btn.textContent = '保存中...';
            btn.disabled = true;
            
            fetch(window.location.href + '?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'settings',
                    settings: settings
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    btn.textContent = '保存成功 ✓';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 1500);
                } else {
                    btn.textContent = '保存失败';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 1500);
                }
            })
            .catch(error => {
                btn.textContent = '保存失败';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 1500);
            });
        }
        
        // 初始化设置值
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('autoSignin').checked = settingsData.autoSignin;
            document.getElementById('notification').checked = settingsData.notification;
            document.getElementById('retentionDays').value = settingsData.retentionDays;
        });
        
        // 防止页面滚动时的橡皮筋效果
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.tab-content')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
        
        // 触摸反馈
        document.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('tab') || e.target.classList.contains('btn')) {
                e.target.style.opacity = '0.7';
            }
        });
        
        document.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('tab') || e.target.classList.contains('btn')) {
                setTimeout(() => {
                    e.target.style.opacity = '';
                }, 100);
            }
        });
    </script>
</body>
</html>
  `
}

/**
 * 生成记录页面HTML
 */
function generateRecordsHTML(todayRecord) {
  const recordsList = todayRecord.records.map(record => {
    const statusIcon = record.isOffice ? '✅' : '❌'
    const periodBadge = record.period === 'AM' ? 
      '<span class="badge badge-morning">上午</span>' : 
      '<span class="badge badge-afternoon">下午</span>'
    
    return `
      <div class="record-item">
        <div class="record-header">
          <span class="record-time">${record.time}</span>
          ${periodBadge}
          <span class="status-icon">${statusIcon}</span>
        </div>
        <div class="record-details">
          <div class="detail-item">
            <span class="label">签到状态:</span>
            <span class="value ${record.isOffice ? 'success' : 'error'}">${record.isOffice ? '成功' : '失败'}</span>
          </div>
          <div class="detail-item">
            <span class="label">签到次数:</span>
            <span class="value">${record.signCount}</span>
          </div>
          ${record.id ? `<div class="detail-item">
            <span class="label">记录ID:</span>
            <span class="value">${record.id.slice(-8)}</span>
          </div>` : ''}
        </div>
      </div>
    `
  }).join('')

  const totalCount = todayRecord.records.length
  const successCount = todayRecord.records.filter(r => r.isOffice).length

  return `
    <div class="today-status">
      <h3>今日签到状态 (${todayRecord.date || new Date().toLocaleDateString()})</h3>
      <div class="status-grid">
        <div class="status-card ${todayRecord.AM_SIGNIN ? 'success' : 'pending'}">
          <div class="status-icon">${todayRecord.AM_SIGNIN ? '✅' : '⏰'}</div>
          <div class="status-text">上午签到</div>
          <div class="status-label">${todayRecord.AM_SIGNIN ? '已完成' : '未完成'}</div>
        </div>
        <div class="status-card ${todayRecord.PM_SIGNIN ? 'success' : 'pending'}">
          <div class="status-icon">${todayRecord.PM_SIGNIN ? '✅' : '⏰'}</div>
          <div class="status-text">下午签到</div>
          <div class="status-label">${todayRecord.PM_SIGNIN ? '已完成' : '未完成'}</div>
        </div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${totalCount}</div>
        <div class="stat-label">今日签到次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${successCount}</div>
        <div class="stat-label">成功次数</div>
      </div>
    </div>
    
    <div class="records-section">
      <h3>详细记录</h3>
      <div class="records-list">
        ${recordsList || '<div class="no-records">暂无签到记录</div>'}
      </div>
    </div>
  `
}

/**
 * 生成配置页面HTML
 */
function generateConfigHTML(settings) {
  return `
    <div class="config-content">
      <h3>签到设置</h3>
      <div class="config-section">
        <div class="config-item">
          <label>自动签到</label>
          <div class="toggle-switch">
            <input type="checkbox" id="autoSignin" ${settings.autoSignin ? 'checked' : ''}>
            <label for="autoSignin" class="slider"></label>
          </div>
        </div>
        <div class="config-item">
          <label>通知推送</label>
          <div class="toggle-switch">
            <input type="checkbox" id="notification" ${settings.notification ? 'checked' : ''}>
            <label for="notification" class="slider"></label>
          </div>
        </div>
        <div class="config-item">
          <label>记录保留天数</label>
          <select id="retentionDays" class="config-select">
            <option value="7" ${settings.retentionDays === 7 ? 'selected' : ''}>7天</option>
            <option value="30" ${settings.retentionDays === 30 ? 'selected' : ''}>30天</option>
            <option value="90" ${settings.retentionDays === 90 ? 'selected' : ''}>90天</option>
          </select>
        </div>
      </div>
      
      <div class="config-actions">
        <button class="btn btn-primary" onclick="saveConfig()">保存设置</button>
      </div>
    </div>
  `
}

/**
 * 完成响应
 */
function done() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  }

  if ($.isOptions) {
    if ($.isQuanX()) {
      $.done({ headers })
    } else {
      $.done({ response: { headers } })
    }
  } else if ($.isGet) {
    const htmlHeaders = Object.assign(headers, {
      'Content-Type': 'text/html;charset=UTF-8'
    })
    if ($.isQuanX()) {
      $.done({ status: 'HTTP/1.1 200', headers: htmlHeaders, body: $.html })
    } else {
      $.done({ response: { status: 200, headers: htmlHeaders, body: $.html } })
    }
  } else if ($.isPost) {
    const jsonHeaders = Object.assign(headers, {
      'Content-Type': 'application/json; charset=utf-8'
    })
    const jsonBody = $.toStr($.json)
    if ($.isQuanX()) {
      $.done({ status: 'HTTP/1.1 200', headers: jsonHeaders, body: jsonBody })
    } else {
      $.done({ response: { status: 200, headers: jsonHeaders, body: jsonBody } })
    }
  } else {
    $.done()
  }
}
