
/* 签到成功

{
  "status" : 1,
  "root" : {
    "object" : {
      "isOffice" : true,
      "tipInfo" : {
        "type" : 2,
        "content" : "十年磨一剑，风雨未曾阻挡，愿你乘风破浪，不负韶华时光！"
      },
      "signCount" : 3,
      "id" : "1943242285694062592",
      "limitCount" : 2
    }
  }
}

*/

const SIGNIN_RECORD_KEY = 'cict_signin_record';
const Env = require('./lib/Env.js')
const $ = new Env('cict signin');


const body = $request.body;
const response = JSON.parse(body);

const isOffice = response?.root?.object?.isOffice || false;

const now = new Date();
const period = (now.getHours() >= 12) ? 'PM' : 'AM';
const date = now.toLocaleDateString(); // '2025/7/23'
const time = now.toLocaleTimeString(); // '12:00:00'

/*

record = {
  'date': '2025/7/23',
  'records': [{
    'date': '2025/7/23',
    'time': '12:00:00',
    'period': 'AM',
    'isOffice': true,
    'signCount': 1,
    'id': '1943242285694062592',
  },],
  'AM_SIGNIN': true,
  'PM_SIGNIN': false,
};

*/

let record = $.getjson(SIGNIN_RECORD_KEY, {});

// 如果没有当天的记录，则初始化
if (record['date'] !== date) {
  record = {
    'date': date,
    'records': [],
    'AM_SIGNIN': false,
    'PM_SIGNIN': false,
  };
}

// 将所有的签到记录存储在records中
record['records'].push({
  'date': date, // '2025/7/23'
  'time': time, // '12:00:00'
  'period': period,
  'isOffice': isOffice,
  'signCount': response?.root?.object?.signCount ?? -1,
  'id': response?.root?.object?.id ?? '',
});

if (isOffice) {
  if (period === 'AM') {
    record['AM_SIGNIN'] = true;
  } else if (period === 'PM') {
    record['PM_SIGNIN'] = true;
  }
}

$.setjson(record, SIGNIN_RECORD_KEY);

$.done(body);
