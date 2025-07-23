/**
 * CICT Signin Records Setting Page
 * QuantumultX Script for displaying signin records
 */

// Import environment library
const Env = require('../lib/Env.js');
const $ = new Env('CICT_Setting');

// Data storage key
const STORAGE_KEY = 'cict_signin_record';

/**
 * Get signin records from storage
 * @returns {Object} Signin record data
 */
function getSigninRecords() {
    const defaultRecord = {
        'date': new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric'
        }).replace(/\//g, '/'),
        'records': [],
        'AM_SIGNIN': false,
        'PM_SIGNIN': false
    };
    
    return $.getdata(STORAGE_KEY, defaultRecord);
}

/**
 * Format time display
 * @param {string} time - Time string
 * @returns {string} Formatted time
 */
function formatTime(time) {
    return time || '--:--:--';
}

/**
 * Get status badge HTML
 * @param {boolean} status - Signin status
 * @param {string} type - AM or PM
 * @returns {string} Badge HTML
 */
function getStatusBadge(status, type) {
    const badgeClass = status ? 'badge-success' : 'badge-pending';
    const badgeText = status ? '已签到' : '未签到';
    return `<span class="badge ${badgeClass}">${type} ${badgeText}</span>`;
}

/**
 * Generate records table HTML
 * @param {Array} records - Signin records array
 * @returns {string} Table HTML
 */
function generateRecordsTable(records) {
    if (!records || records.length === 0) {
        return '<div class="no-records">暂无签到记录</div>';
    }
    
    let tableHTML = `
        <div class="table-container">
            <table class="records-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>时间</th>
                        <th>时段</th>
                        <th>地点</th>
                        <th>次数</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    records.forEach(record => {
        const locationText = record.isOffice ? '办公室' : '其他';
        tableHTML += `
            <tr>
                <td>${record.date}</td>
                <td>${formatTime(record.time)}</td>
                <td><span class="period-badge period-${record.period.toLowerCase()}">${record.period}</span></td>
                <td>${locationText}</td>
                <td>${record.signCount || 1}</td>
                <td class="record-id">${record.id}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    return tableHTML;
}

/**
 * Generate complete HTML page
 * @param {Object} data - Signin record data
 * @returns {string} Complete HTML page
 */
function generateHTML(data) {
    const currentDate = data.date || '未知';
    const amStatus = getStatusBadge(data.AM_SIGNIN, 'AM');
    const pmStatus = getStatusBadge(data.PM_SIGNIN, 'PM');
    const recordsTable = generateRecordsTable(data.records);
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CICT 签到记录</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(45deg, #3498db, #2c3e50);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .date {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .tab {
            flex: 1;
            padding: 15px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #6c757d;
            transition: all 0.3s ease;
        }
        
        .tab.active {
            background: white;
            color: #495057;
            border-bottom: 3px solid #007bff;
        }
        
        .tab:hover {
            background: #e9ecef;
        }
        
        .tab-content {
            padding: 30px;
        }
        
        .status-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .status-card {
            background: linear-gradient(135deg, #74b9ff, #0984e3);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
        }
        
        .status-card h3 {
            font-size: 18px;
            margin-bottom: 15px;
        }
        
        .badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .badge-success {
            background: #00b894;
            color: white;
        }
        
        .badge-pending {
            background: #fdcb6e;
            color: #2d3436;
        }
        
        .table-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .records-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .records-table th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        
        .records-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #dee2e6;
            color: #6c757d;
        }
        
        .records-table tr:hover {
            background: #f8f9fa;
        }
        
        .period-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .period-am {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .period-pm {
            background: #fce4ec;
            color: #c2185b;
        }
        
        .record-id {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #868e96;
        }
        
        .no-records {
            text-align: center;
            padding: 50px;
            color: #adb5bd;
            font-size: 16px;
        }
        
        .config-section {
            display: none;
            padding: 20px;
            text-align: center;
            color: #6c757d;
        }
        
        .config-section.active {
            display: block;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .status-cards {
                grid-template-columns: 1fr;
            }
            
            .records-table {
                font-size: 14px;
            }
            
            .records-table th,
            .records-table td {
                padding: 8px;
            }
        }
    </style>
    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content > div').forEach(div => {
                div.style.display = 'none';
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName + '-content').style.display = 'block';
            
            // Add active class to selected tab
            document.querySelector('[onclick*="' + tabName + '"]').classList.add('active');
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            showTab('records');
        });
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CICT 签到记录</h1>
            <div class="date">当前日期: ${currentDate}</div>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('records')">签到记录</button>
            <button class="tab" onclick="showTab('config')">配置设置</button>
        </div>
        
        <div class="tab-content">
            <div id="records-content" style="display: block;">
                <div class="status-cards">
                    <div class="status-card">
                        <h3>今日签到状态</h3>
                        <div style="margin: 10px 0;">
                            ${amStatus}
                        </div>
                        <div>
                            ${pmStatus}
                        </div>
                    </div>
                    <div class="status-card">
                        <h3>签到统计</h3>
                        <div style="font-size: 24px; margin: 10px 0;">
                            ${data.records ? data.records.length : 0}
                        </div>
                        <div style="font-size: 14px;">总签到次数</div>
                    </div>
                </div>
                
                <h3 style="margin-bottom: 20px; color: #495057;">签到记录列表</h3>
                ${recordsTable}
            </div>
            
            <div id="config-content" class="config-section">
                <h3>配置设置</h3>
                <p>配置功能开发中...</p>
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>数据存储位置:</strong> ${STORAGE_KEY}</p>
                    <p><strong>当前数据:</strong></p>
                    <pre style="text-align: left; background: white; padding: 15px; border-radius: 4px; overflow-x: auto; margin-top: 10px; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Main function
 */
function main() {
    try {
        // Get signin records
        const data = getSigninRecords();
        
        // Generate HTML response
        const html = generateHTML(data);
        
        // Log for debugging
        $.log('Generated HTML page for signin records');
        $.log(`Records count: ${data.records ? data.records.length : 0}`);
        $.log(`AM status: ${data.AM_SIGNIN}, PM status: ${data.PM_SIGNIN}`);
        
        // Return HTML response
        $.done({
            status: 'HTTP/1.1 200 OK',
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            },
            body: html
        });
        
    } catch (error) {
        $.log(`Error: ${error.message}`);
        $.done({
            status: 'HTTP/1.1 500 Internal Server Error',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: `Error: ${error.message}`
        });
    }
}

// Execute main function
main();