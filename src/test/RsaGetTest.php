<?php
require_once ("../lib/YopRsaClient.php");

//Get请求 非对称秘钥
function get_rsa(){
    YopConfig::$debug=true;

    /*商户私钥*/
    //$private_key ="MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCSx5/9gJYOaefpTIUGVSJkOobtZDIo0lKj0m62fEfTA7QgWsv2AJJiMGv4YdOecVrm8FxUQVL9p64mrs96WN70ovtSuaSWwoft7NUMTWvRsTYnJkaDLIpU8KKNbrSXZx7pb8T0Shv2ZS2XY0Mo3UQrXSbWCnp+8WkZRTtfMtsPsf9b3J//q4JAxtW7SOn5AFV9AdmQXy7Zh5rZg3B4oQKcJ/KHcPtid0OClq4ma9fWeNSsnrW0AXyO4Ng4H5ls8TCFzYO4PA9mq9zc+WIQtgXIQRc5ED+kcbnkTIIKl02lmcv9hsCT32rWIivhwRORTGvM+tsHPDHBmuwLiNsqpG8HAgMBAAECggEBAJBEU5WX8GVkZMRjKJCr1uzKtdnY1JBZAU7xw03r47CdAEuY0sYNk9OcolL03EnsQpugfi92MXsNd9eflGA9v46WLw4FV6eytmX9lP3Njv8A/igGr+G4QpLwHeWDfU8e1Tw+VkiCGu/YTLJypw0gRiOVIFna3MGuyE1FRfDxDG1kUl6RX188ACATUEnMEkBrhL4fFcqftqH41dkHJIgZ4/77oj1UczpSV6pImrPAXd9ypjs6v+6x7boxBQbW2Todbr6mlPgCzl36hziJyl8N20I9ol/deClX0ab1rlfbK0fqF4ZXC6BH3GKfxdmbE3UBMW4fOPdVHuQ0IN+tApn1w+kCgYEA7im6hHI2ocvt1IP3I6gqT3v9wV8/ZKBaQaTQFDOcj/93RpLgUmyKcc4p/QduUZ4mJHjgy6RioPThHkrQkC8ONPxPxaXJL1Xr9+nhqOMa0EBAlBTx7ltmJimZH53BTn2UsHc14WgkXLYnHFXAGnS2L+Xxvvu3l1NW5Ydito063SMCgYEAncXRDrOTbN2cUBaVD+meRbZZTmnYqoWs271vHNwbow71ab6r+gUat7PwS2lBqPScqna8SsvE4a6Aw8F9R6xN1I2z22pZAGOBYQA8Q0V1bcg41SW3eOi95I/hjESF9YrWcsTrcAi/YWYlJVwkd3jTfbTeyaIW2qAK+Z7gS3qf3s0CgYEAtnI3FVFdcrMDfaKeh61CxGMq8KDjslV47wKv+FnVXSaKHAFWYS4PHMGfvtubcmDhvVzwcHB8sesGLauIfHvfuU10Wuf26BE9VEzR9wwLNW+TSR2GfF9+MEv7ppG2TUe8yTZ5izS5bmCIM5epM1snWigf+ntgmEdasTj2sPweFNsCgYA1h9SyxEMVAOv0UHUq/PzycjhC3q7gzJIlzFRS2muWG5Ew27zGC81Q3wB81a2tgbFWNQsV5aVbXTXbNV8oXlHZ+Go53A9ujlRrcQUBXiPFp9WAnFdv8qfbUOYaDXXWJdE1B5NKY+1rQpj/4A+PabN4R1H/37sZWovevgUkFur/UQKBgEK2LxiX5vNgZmcnz5+N2ISqXGBrjq7CMWYIh79PS3dg6ru2mHRKhtYlRAHfQL/z0R3ImlScRbAH0rIweZeg0nHq2qEWGIkkqfX49tySgSIMOxLeoq3mLtiB0xP5doACd62DVhYb8yzTYli7//NWT4AbykQZrnFwKoahhVMwgpON";
    $private_key ="MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXsKWWClznZbdTwp9183e4Ygu/twbQhuS6LPpu/TZ+OFwwauvIZnOyKu+rFh6apKyVxiLEkssnTsBjLjUIlypEGU2SdLGkswWAPvVdunLjjWEz37W2w4VNkGf8bGCQ9fIxMynoBCTeeWcQz896e1y2p5YZHygUhXGLM/9q5mr3iQQgrEPdFEAdlfLexkbVIF2bS02NsDFLNvqKNk7219cefxWPgJfN7RukUIZyy4nbeevbMAAFpNUFh1NlAh4qzwocOfbZ3NgtwJDf29jibpM3dacS7tqYGwpeGpKazS9tZgTAYcX2kLT7s+G6vVzVQR61pvvDs5ubyfsw/KFR8KDDAgMBAAECggEAShSE6Z+p+4AbZhaYVbxPbYbEgh5af6BBOAMbUvTqlf3kV+j/uWD/g7WgUod87r0ZZBPdiu69tDarkkRQth9NDvDkh2/iCbM8LoOQxPN3hFXZcMICNn2KLnUls4siJelXHFwGTT8o2lWj1fwHMaPphXKWxTIIGu2IpBkC1iwtdTF8mqe2HH+H2djBE96JXVZIf3/FgGu8ppmXa/xG4DfrTxFnGEJzgaadT3Z+ybXbqjYgFgmmBnZOaTx1XPQfLGQVYJz9BunDhwhrqBUM+QuLr1jUsMsj/Yud52cNXjwq9z8FfkKUdVVfE4VrzH8JpKKk7Vim7RWBQER29jlEnV+ysQKBgQDjMWxZz4AveXxWSx7MgXN9PEzxzmGWSApseDskSi5PAmXa4ut5XyNJUiGJ8Zf+cssPfWFNtB7suJBuoMTtrQSap2tgoo70y7QSO0ZlZ0v5Ny9LYh8oHvDgBJVNmS5HWv1U1/VHxNHczNmQ05smXNo1bzMYe5Xo10J2W47UUTgOHwKBgQCq7G6B5RfD+O1jdmYWlilh5oi1XGdYJGnzhs9DmAUN5plQ3VxpUFxxQCgOwXCskfT9QUVYhsIpQIs2iCylwuNDuxxiEQyRpeBirRaqmxvosv08Trwsr1Vs/Cuh17ZZOS+OUehN0fDZCiruK4e2btVfv8LlE1KMuoiUsn1X2gWQ3QKBgCyqBrcRSA4NQBhm5EMoH+A6/pV7EUxOFV6FtHrJ6pi1y/hgLBLMVU+Qye8og80OHEWLTJnOE1ZOYnadPJnNLd6Jk16IFrqhYWFELe65hAIWi0GypJVqn8gqnn+G4cY9aRhI7HuTgf56dzs1nobIMk3W8qCZizsfNn22OjobTX3ZAoGBAJsTusvF1IMs5g05DjTt9wvpQx3xgZ46I5sdNA3q7qMHFxGEVeUDUWw7Plzs61LXdoUU5FsGoUEWW3iVopSett3r9TuQpmu7KVO+IXOXGYJOa259LUQJrKMeRGQpuDtJpDknXXLFyRTSodLH0fEWrCecb7KxjlM6ptLrAshjemtNAoGBAMzGo6aNER8VZfET8Oy0i5G8aVBp6yrMiQsNOj4S1VPoHI+Pc6ot5rDQdjek9PRzF9xeCU4K7+KLaOs6fVmTfsFpPbDafCTTmos9LGr5FIyXpU7LQCl3QPHWPDd5ezsu9SPVjzsEPX3WTSOJuUA8hE7pJnAzMHLGAFpIXJRu3Z/y";

    $request = new YopRequest("yop-boss", $private_key);
    //加入请求参数
    $request->addParam("request_flow_id", "12345678");//请求流水标识
    $request->addParam("name", "张文康");//请求流水标识
    $request->addParam("id_card_number", "370982199101186691");//请求流水标识

    //提交Post请求
    $response = YopRsaClient::get("/rest/v3.0/auth/idcard", $request);
}

get_rsa();