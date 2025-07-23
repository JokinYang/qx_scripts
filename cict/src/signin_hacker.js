// import { JSEncrypt } from 'jsencrypt';

// var encrypt = new JSEncrypt();



if(typeof $request !== "undefined") {
  $done({body: JSON.stringify({"status": "ok", "message": "Request processed successfully"})});
}

if(typeof $done !=="undefined") {
  $done();
}