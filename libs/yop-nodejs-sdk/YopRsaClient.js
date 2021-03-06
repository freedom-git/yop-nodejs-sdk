const StringUtils = require('./Util/StringUtils');
const HttpUtils = require('./Util/HttpUtils');
const crypto = require('crypto');
const YopResponse = require('./YopResponse');
const URLSafeBase64 = require('urlsafe-base64');
const urlencode = require('urlencode');
const https = require('https');


class YopRsaClient{
    constructor()
    {
    }
    static  post(methodOrUri, YopRequest)
    {
        let reqObj = this.postString(methodOrUri, YopRequest);
        
        // response.headers['x-yop-sdk-langs']='nodejs';
        // console.log(response)
        const url = new URL(reqObj.serverUrl);
        // const data = JSON.stringify({
        //     name: 'John Doe',
        //     job: 'DevOps Specialist'
        // });
        
        const options = {
            protoco: url.protocol,
            hostname: url.host,
            path: url.pathname,
            method: 'POST',
            headers: reqObj.headers
        };
        const req = https.request(options, (res) => {
            let data = '';
        
            res.on('data', (chunk) => {
                data += chunk;
            });
        
            res.on('end', () => {
                console.log(data)
                const response = this.unmarshal(data)
                console.log('response',response);
                const res1 = this.handleRsaResult(reqObj.YopRequest, response, data);
                if(res1) {
                    console.log('response',response);
                    // console.log('aes',URLSafeBase64.decode('ah886WB787uBIItHJDZdAw==').toString())
                    // console.log('authType',this.aesDecrypt(response.result.authType,"ah886WB787uBIItHJDZdAw=="))
                }
            });
        
        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });
        
        req.write(this.getCanonicalQueryString(reqObj.YopRequest, false));
        req.end();
        return reqObj;
    }
    static unmarshal(content)
    {
        let jsoncontent = JSON.parse(content);
        let yop_response = new YopResponse();
        if(jsoncontent['state']){
            yop_response.state = jsoncontent['state'];
        }
        if(jsoncontent['error']){
            if(jsoncontent['error'] instanceof Array){
                for(let k in jsoncontent['error']){
                    let v = jsoncontent['error'][k];
                    if(!(v instanceof Array)){
                        yop_response.error += ((yop_response.error="") ? '' : ',') + '"' + k + '" : "' + v + '"';
                    }else{
                        yop_response.error+= ((yop_response.error="") ? '' : ',') + '"' + k + '" : "' + JSON.parse(v) + '"';
                    }
                }
            }else{
                yop_response.error = jsoncontent['error'];
            }
        }
        if(jsoncontent['result']){
            yop_response.result = jsoncontent['result'];
        }
        if(jsoncontent['ts']){
            yop_response.ts = jsoncontent['ts'];
        }
        if(jsoncontent['sign']){
            yop_response.sign = jsoncontent['sign'];
        }
        if(jsoncontent['stringResult']){
            yop_response.stringResult = jsoncontent['stringResult'];
        }
        if(jsoncontent['format']){
            yop_response.format = jsoncontent['format'];
        }
        if(jsoncontent['validSign']){
            yop_response.validSign = jsoncontent['validSign'];
        }
        return yop_response;
    }

    static handleRsaResult(YopRequest, YopResponse, content)
    {
        YopResponse.format = YopRequest.format;
        let ziped = '';
        let state = YopResponse.state+"";
        if(state.toUpperCase() == 'SUCCESS'){
            let strResult = this.getBizResult(content,YopRequest.format);
            ziped = strResult;
            if(ziped && !YopResponse.error){
                YopResponse.stringResult = strResult;
            }
        }
       let res =  YopResponse.validSign =this.isValidRsaResult(ziped, YopResponse.sign,YopRequest.yopPublicKey);
       return res;
    }

    /**
     * 对业务结果签名进行校验
     */
    static isValidRsaResult(result, sign,public_key)
    {
        let sb = "";
        if (!result) {
            sb = "";
        } else {
            sb += result.trim();
        }
        sb = sb.replace(/[\s]{2,}/g,"");
        sb = sb.replace(/\n/g,"");
        sb = sb.replace(/[\s]/g,"");

        let r = public_key+"";
        let a ="-----BEGIN PUBLIC KEY-----";
        let b = "-----END PUBLIC KEY-----";
        public_key = "";
        let len = r.length;
        let start = 0;
        while(start<=len){
            if(public_key.length){
                public_key += r.substr(start,64)+'\n';
            }else{
                public_key = r.substr(start,64)+'\n';
            }
            start +=64;
        }
        public_key = a+'\n'+public_key+b;

        let verify = crypto.createVerify('RSA-SHA256');
            verify.update(sb);
        sign = sign+"";
        sign = sign.slice(0,-7);
        sign = sign.replace(/[-]/g,'+');
        sign = sign.replace(/[_]/g,'/');
        console.log('public_key',public_key)
        console.log('sign',sign)
        console.log('sb',sb)
        // sign = this.base64_safe_handler(sign)
        let res = verify.verify(public_key, sign, 'base64');
        console.log('res',res)
        return res;
    }

    /**
     * 解密数字信封
     * @param {content} 返回的数字信封密文
     * @param {isv_private_key} 商户私钥
     * @param {yop_public_key} 易宝开放平台公钥
     * @return {status:'数字信封处理状态 成功（success）失败（failed）',result:'报文',message:'错误信息'}
     */
    static digital_envelope_handler (content,isv_private_key,yop_public_key){
        let event = {
            status: 'failed',
            result: '',
            message: ''
        }
        if(!content){
            event.message = '数字信封参数为空'
        }else if(!isv_private_key){
            event.message = '商户私钥参数为空'
        }else if(!yop_public_key){
            event.message = '易宝开放平台公钥参数为空'
        }else{
            try {
                let digital_envelope_arr = content.split('$');
                let encryted_key_safe = this.base64_safe_handler(digital_envelope_arr[0]);
                console.log('encryted_key_safe',encryted_key_safe)
                // let decryted_key = this.rsaDecrypt(encryted_key_safe,this.key_format(isv_private_key));

                let biz_param_arr = this.aesDecrypt(this.base64_safe_handler(digital_envelope_arr[1]),decryted_key).split('$');
                event.result = biz_param_arr[0];
                if(this.isValidRsaResult(biz_param_arr[0],biz_param_arr[1],yop_public_key)){
                    event.status = 'success';
                }else{
                    event.message = '验签失败';
                }
            } catch (error) {
                event.message = error;
            }
        }
        return event;
    }
    /**
     * 数据非安全化还原
     * @param {data} 需要还原的数据
     */
    static base64_safe_handler (data) {
        return URLSafeBase64.decode(data).toString('base64');
    }

    /**
     * 私钥header添加
     * @param {key} 不包含header的私钥
     */
    static key_format (key) {
        return '-----BEGIN PRIVATE KEY-----\n'+key+'\n-----END PRIVATE KEY-----';
    }

    /**
     * 非对称密钥解密
     * @param {content} 已加密的数据内容
     * @param {privateKey} 私钥
     */
    static rsaDecrypt(content,privateKey) {
        let block = Buffer.from(content,'base64')
        let decodeData = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            block
        );
        return decodeData;
    }

    /**
     * 对称密钥解密
     * @param {encrypted} 已加密的数据内容
     * @param {key} 密钥
     */
    static aesDecrypt(encrypted, key) {
        const decipher = crypto.createDecipheriv('aes-128-ecb', key,new Buffer(0));
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    static  getBizResult(content, format)
    {
        if(!format){
            return content;
        }
        let local = -1;
        let result="";
        let tmp_result= "";
        let length = 0;
        switch (format) {
            case 'json':
                local = content.indexOf('"result"');
                result = content.substr(local);
                length = tmp_result.length;
                result = result.substr(10);
                result = result.substr(0,result.lastIndexOf('"ts"'));
                result = result.substr(0,result.length-1);
                return result.trim();
            default:
                local = content.indexOf('"</state>"');
                result = content.substr(local);
                tmp_result = '</state>';
                length = tmp_result.length;
                result = result.substr(length+4);
                result = result.substr(0,result.lastIndexOf('"ts"'));
                result = result.substr(0,-2);
                return result;
        }
    }

    /**
     * @param $methodOrUri
     * @param $YopRequest
     * @return type
     */
    static  postString(methodOrUri, YopRequest)
    {
        let serverUrl = this.richRequest(methodOrUri, YopRequest);
        YopRequest.absoluteURL = serverUrl;
        let tmp_key = YopRequest.Config.APP_KEY;
        let appKey = YopRequest[tmp_key];
        if(!appKey){
            appKey = YopRequest.Config.CUSTOMER_NO;
            YopRequest.removeParam(YopRequest.Config.APP_KEY);
        }
        if(!appKey){
            console.log("appKey 与 customerNo 不能同时为空");
        }
        let timestamp = new Date().toISOString().replace(/-/g,'').replace(/:/g,'').split('.')[0]+'Z';
        let requestId = this.uuid();
        let headers = {};
        headers['x-yop-request-id'] = requestId;
        headers['x-yop-session-id'] = this.uuid();
        headers['x-yop-date'] = timestamp;
        headers['x-yop-sdk-version'] = '3.0.0';
        headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const paramsStr =  Object.keys(YopRequest.paramMap).map(key=>`${key}=${YopRequest.paramMap[key]}`).join('&');
        headers['x-yop-content-sha256'] = crypto.createHash('md5').update(paramsStr).digest('hex');
         
        let protocolVersion = "yop-auth-v2";
        let EXPIRED_SECONDS = "1800";
        let authString = protocolVersion + "/" + appKey + "/" + timestamp + "/" + EXPIRED_SECONDS;
        let headersToSignSet=[];
        headersToSignSet.push("x-yop-request-id");
        headersToSignSet.push("x-yop-session-id");
        headersToSignSet.push("content-type");
        headersToSignSet.push("x-yop-content-sha256");
        headersToSignSet.push("x-yop-date");
        let _tmp = YopRequest.Config.APP_KEY;
        appKey = YopRequest[_tmp];
        if(StringUtils.isBlank(YopRequest.Config.CUSTOMER_NO)){
            headers['x-yop-appkey'] = appKey;
            headersToSignSet.push("x-yop-appkey");
        }else{
            headers['x-yop-customerid'] = appKey;
            headersToSignSet.push("x-yop-customerid");
        }
        let canonicalURI = HttpUtils.getCanonicalURIPath(methodOrUri);
        let canonicalQueryString = this.getCanonicalQueryString(YopRequest, true);
        let headersToSign = this.getHeadersToSign(headers, headersToSignSet);
        let canonicalHeader = this.getCanonicalHeaders(headersToSign);
        let signedHeaders = "";
        if (headersToSignSet.length) {
            for(let key in headersToSign){
                let value = headersToSign[key];
                signedHeaders += signedHeaders.length == 0 ? "" : ";";
                signedHeaders += key;
            }
            signedHeaders = signedHeaders.toLowerCase();
        }
        let canonicalRequest = authString + "\n" + "POST" + "\n" +
                               canonicalURI + "\n" + canonicalQueryString + "\n" + canonicalHeader;
                               console.log('canonicalRequest',canonicalRequest)
        if(!YopRequest.secretKey){
            console.log("secretKey must be specified");
        }
        let r = YopRequest.secretKey;
        let a ="-----BEGIN RSA PRIVATE KEY-----";
        let b = "-----END RSA PRIVATE KEY-----";
        let private_key = "";
        let len = r.length;
        let start = 0;
        while(start<=len){
            if(private_key.length){
                private_key += r.substr(start,64)+'\n';
            }else{
                private_key = r.substr(start,64)+'\n';
            }
            start +=64;
        }
        private_key = a+'\n'+private_key+b;
        let sign = crypto.createSign('RSA-SHA256');
        sign.update(canonicalRequest);
        let sig = sign.sign(private_key, 'base64');
        sig = sig.replace(/[+]/g,'-');
        sig = sig.replace(/[/]/g,'_');
        let sig_len = sig.length;
        let find_len = 0;
        let start_len = sig_len-1;
        while(1){
            if(sig.substr(start_len,1) == "="){
            find_len++;
            start_len--;
            continue;
            }
            break;
        }
        sig = sig.substr(0,sig_len-find_len);
        let signToBase64 = sig;
        signToBase64 += '$SHA256';
        headers['Authorization'] = "YOP-RSA2048-SHA256 " + authString + "/" + signedHeaders + "/" + signToBase64;
        let response = {
            serverUrl:serverUrl,
            YopRequest:YopRequest,
            headers:headers
        };

        return response;
    }

    /**
     * @param $headers
     * @return string
     */
    static getCanonicalHeaders(headers=[])
    {
        let headerStrings = [];
        for(let key in headers){
            let value = headers[key];
            if(!key){
                continue;
            }
            if(!value){
                value = "";
            }
            key = key.trim();
            key = key.toLowerCase();
            key = HttpUtils.normalize(key);
            value = HttpUtils.normalize(value.trim());
            headerStrings.push(key + ':' + value);
        }
        headerStrings.sort();
        let StrQuery = "";
        for(let i in headerStrings){
            let kv = headerStrings[i];
            StrQuery += StrQuery.length ==0 ?"":"\n";
            StrQuery += kv;
        }
        return StrQuery;
    }

    /**
     * @param $headers
     * @param $headersToSign
     * @return arry
     */
    static  getHeadersToSign(headers, headersToSign)
    {
        let ret = {};
        if(headersToSign.length){
            let tempSet = [];
            for(let i in headersToSign){
                let header = headersToSign[i];
                header = header.trim();
                header = header.toLowerCase();
                tempSet.push(header);
            }  
            headersToSign = tempSet;
        }
        
        for(let key in headers){
            let value = headers[key];
            if(value){
                if(!headersToSign.length&& this.isDefaultHeaderToSign(key)){
                    ret[key] = value;
                }else{
                    if(!headersToSign.length){
                        continue;
                    }
                    if(key == "Authorization"){
                        continue;
                    }
                    let tmp_key = key.toLowerCase();
                    let find= false;
                    for(let i in headersToSign){
                        if(tmp_key == headersToSign[i]){
                            find = true;
                            break;
                        }
                    }
                    if(find){
                        ret[key] = value;
                    }
                }
            }
        }

        let tmp_ret = Object.keys(ret).sort();
        let on = {};
        for(let i=0;i<tmp_ret.length;i++){
            on[tmp_ret[i]] = ret[tmp_ret[i]]
        }
        return on;
    }
    /**
     * @param $YopRequest
     * @param $forSignature
     * @return string
     */
    static getCanonicalQueryString(YopRequest, forSignature)
    {
        let ArrayList = [];
        let StrQuery = "";
        for(let k in YopRequest.paramMap){
            let v = YopRequest.paramMap[k];
            if(forSignature && (k.toLowerCase() == "Authorization".toLowerCase())){
                continue;
            }
            ArrayList.push(k+"="+urlencode(v));
        }
        ArrayList.sort();
        for(let i in ArrayList){
            StrQuery +=  StrQuery.length == 0 ? "":"&";
            StrQuery += ArrayList[i];
        }
        return StrQuery;

    }

    static uuid(){
        let char = StringUtils.getUniqueId(24)+""+new Date().getTime();
        char = crypto.createHash('md5').update(char).digest('hex');
        let uuid = "";
        uuid += char.substr(0,8)+'-';
        uuid += char.substr(8, 4)+'-';
        uuid += char.substr(12, 4)+'-';
        uuid += char.substr(16, 4)+'-';
        uuid += char.substr(20, 12);
        return uuid;
    }

    static  richRequest(methodOrUri, YopRequest)
    {
        if(methodOrUri.indexOf(YopRequest.Config.serverRoot)>=0){
            let serverRoot = YopRequest.Config.serverRoot;
            methodOrUri = methodOrUri.substr(serverRoot.length + 1);
        }
        let isRest = (methodOrUri.indexOf(methodOrUri,"/rest/")==0)?true:false;
        YopRequest.isRest = isRest;
        let serverUrl = YopRequest.serverRoot;
        if (isRest) {
            serverUrl += methodOrUri;
            let result = serverUrl.match("/rest/v([^/]+)/");
            let data = [];
            for(let key in result){
                if((key == 'index')||(key == 'input')){
                continue;
                }
                data.push(result[key]);
            }
            if(data.length&&(2 == data.length)){
                let version = data[1];
                if(version){
                    YopRequest.setVersion(version);
                }
            }
        } else {
            serverUrl += "/command?" + YopRequest.Config.METHOD + "=" + methodOrUri;
        }
        YopRequest.setMethod(methodOrUri);

        return serverUrl;
    }


}

module.exports = YopRsaClient;