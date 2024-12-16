// forward_to_127.js
const newUrl = "http://127.0.0.1:51820"; // 转发目标地址（127.0.0.1）

// 构造新的请求
const options = {
    url: newUrl,
    method: $request.method,
    headers: $request.headers,
    body: $request.body
};

// 发起新的请求并替换响应
$task.fetch(options).then(response => {
    $done({ 
        status: response.statusCode,
        headers: response.headers,
        body: response.body
    });
}, reason => {
    $done({ 
        status: 500, 
        body: `Error: ${reason.error}` 
    });
});
