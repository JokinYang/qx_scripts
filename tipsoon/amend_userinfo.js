let rsp = $response.body

function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-11 in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formatted_date_time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formatted_date_time;
}

function getNextMonthDate() {
    let date = new Date();  // Get current date
    date.setMonth(date.getMonth() + 1);  // Set to next month
    return date;
}


rsp['data']['is_vip'] = true;
rsp['data']['vip_expire_time'] = formatDateTime(getNextMonthDate());
rsp['data']['name'] = rsp['data']['name'] + "_qx";

console.log(rsp)
$done(rsp)