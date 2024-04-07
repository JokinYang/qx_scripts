let timestamp_str = $response.body

let days = 7

let timestamp = parseInt(timestamp_str)

if(timestamp){
	timestamp_str = (timestamp + days*24*60*60).toString()
}

$done(timestamp_str)