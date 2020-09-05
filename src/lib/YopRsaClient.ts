// require_once("Util/StringUtils.php");
// require_once("Util/Base64Url.php");
import { YopRequest } from './YopRequest';
import { YopConfig } from './YopConfig';
import { HttpUtils } from './Util/HttpUtils';
import { HttpRequest } from './Util/HttpRequest';
import { YopResponse } from './YopResponse';
import { YopError } from './YopError';
import * as crypto from 'crypto';

export class YopRsaClient {
    /**
     * @param $methodOrUri
     * @param $YopRequest
     * @param $encode_data
     * @returns array
     */
    public static SignRsaParameter($methodOrUri, $YopRequest: YopRequest) {
        let $appKey = $YopRequest.$appKey;
        if (!$appKey) {
            $appKey = YopConfig.$appKey;
        }
        if (!$appKey) {
            console.error('appKey 不能为空');
        }

        const $timestamp = new Date().toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';
        const $headers = {};

        $headers['x-yop-appkey'] = $appKey;
        $headers['x-yop-request-id'] = $YopRequest.$requestId;

        const $protocolVersion = 'yop-auth-v2';
        const $EXPIRED_SECONDS = '1800';

        const $authString = $protocolVersion + '/' + $appKey + '/' + $timestamp + '/' + $EXPIRED_SECONDS;

        const $headersToSignSet = [];
        $headersToSignSet.push('x-yop-request-id');

        // Formatting the URL with signing protocol.
        const $canonicalURI = HttpUtils.getCanonicalURIPath($methodOrUri);

        // Formatting the query string with signing protocol.
        const $canonicalQueryString = YopRsaClient.getCanonicalQueryString($YopRequest, true);

        // Sorted the headers should be signed from the request.
        const $headersToSign = YopRsaClient.getHeadersToSign($headers, $headersToSignSet);

        // Formatting the headers from the request based on signing protocol.
        const $canonicalHeader = YopRsaClient.getCanonicalHeaders($headersToSign);

        let $signedHeaders = '';
        if ($headersToSignSet != null) {
            for (const key in $headersToSign) {
                $signedHeaders += $signedHeaders.length == 0 ? '' : ';';
                $signedHeaders += key;
            }
            $signedHeaders = $signedHeaders.toLowerCase();
        }

        const $canonicalRequest =
            $authString +
            '\n' +
            $YopRequest.$httpMethod +
            '\n' +
            $canonicalURI +
            '\n' +
            $canonicalQueryString +
            '\n' +
            $canonicalHeader;

        // Signing the canonical request using key with sha-256 algorithm.

        if (!$YopRequest.$secretKey) {
            console.error('secretKey must be specified');
        }

        // 格式化密钥
        const secretKeyInOneLine = $YopRequest.$secretKey;
        const startMark = '-----BEGIN RSA PRIVATE KEY-----';
        const endMark = '-----END RSA PRIVATE KEY-----';
        let private_key = '';
        let start = 0;
        while (start <= secretKeyInOneLine.length) {
            if (private_key.length) {
                private_key += secretKeyInOneLine.substr(start, 64) + '\n';
            } else {
                private_key = secretKeyInOneLine.substr(start, 64) + '\n';
            }
            start += 64;
        }
        private_key = startMark + '\n' + private_key + endMark;
        // 格式化密钥结束
        const signer = crypto.createSign('RSA-SHA256');
        signer.update($canonicalRequest);
        let sig = signer.sign(private_key, 'base64');
        sig = sig.replace(/[+]/g, '-');
        sig = sig.replace(/[/]/g, '_');
        const sig_len = sig.length;
        let find_len = 0;
        let start_len = sig_len - 1;
        while (1) {
            if (sig.substr(start_len, 1) == '=') {
                find_len++;
                start_len--;
                continue;
            }
            break;
        }
        sig = sig.substr(0, sig_len - find_len);
        let $signToBase64 = sig;
        $signToBase64 += '$SHA256';
        $headers['Authorization'] = 'YOP-RSA2048-SHA256 ' + $authString + '/' + $signedHeaders + '/' + $signToBase64;

        if (YopConfig.$debug) {
            console.log('authString=' + $authString);
            console.log('canonicalURI=' + $canonicalURI);
            console.log('canonicalQueryString=' + $canonicalQueryString);
            console.log('canonicalHeader=' + $canonicalHeader);
            console.log('canonicalRequest=' + $canonicalRequest);
            console.log('signToBase64=' + $signToBase64);
        }
        $YopRequest.$headers = $headers;
    }

    public __set($name, $value)
    {
        this[$name] = $value;
    }

    public __get($name)
    {
        return this[$name];
    }

    public static async get($methodOrUri, $YopRequest)
    {
        const $content = await YopRsaClient.getForString($methodOrUri, $YopRequest);
        console.log('$content', $content);
        const $response = YopRsaClient.handleRsaResult($YopRequest, $content);
        return $response;
    }

    public static async getForString($methodOrUri, $YopRequest)
    {
        $YopRequest.httpMethod = "GET";
        let $serverUrl = YopRsaClient.richRequest($methodOrUri, $YopRequest);
        $serverUrl += (!$serverUrl.includes('?') ? '?' : '&') + $YopRequest.toQueryString();

        YopRsaClient.SignRsaParameter($methodOrUri, $YopRequest);
        const $response = HttpRequest.request($serverUrl, $YopRequest);
        return $response;
    }

    public static async post($methodOrUri, $YopRequest: YopRequest) {
        const $content = await YopRsaClient.postString($methodOrUri, $YopRequest);
        console.log('$content', $content);
        const $response = YopRsaClient.handleRsaResult($YopRequest, $content);
        if(YopConfig.$debug) {
            console.log('$content', $content);
            console.log('$response', $response);
        }
        return $response;
    }

    /**
     * @param $methodOrUri
     * @param $YopRequest
     * @returns type
     */
    public static async postString($methodOrUri, $YopRequest: YopRequest) {
        $YopRequest.$httpMethod = 'POST';
        const $serverUrl = this.richRequest($methodOrUri, $YopRequest);

        YopRsaClient.SignRsaParameter($methodOrUri, $YopRequest);
        const $response = await HttpRequest.request($serverUrl, $YopRequest);
        return $response;
    }

    /**
     * @param $YopRequest
     * @param $forSignature
     * @returns string
     */
    public static getCanonicalQueryString($YopRequest: YopRequest, $forSignature) {
        if ($YopRequest.$jsonParam) {
            return '';
        }
        const ArrayList = [];
        let StrQuery = '';
        for (const k in $YopRequest.$paramMap) {
            const v = $YopRequest.$paramMap[k];
            if ($forSignature && k.toLowerCase() == 'Authorization'.toLowerCase()) {
                continue;
            }
            ArrayList.push(k + '=' + encodeURIComponent(v));
        }
        ArrayList.sort();
        for (const i in ArrayList) {
            StrQuery += StrQuery.length == 0 ? '' : '&';
            StrQuery += ArrayList[i];
        }
        return StrQuery;
    }

    /**
     * @param $headers
     * @param headers
     * @param headersToSign
     * @param $headersToSign
     * @returns arry
     */
    public static getHeadersToSign(headers, headersToSign) {
        const ret = {};
        if (headersToSign.length > 0) {
            const tempSet = [];
            for (const i in headersToSign) {
                let header = headersToSign[i];
                header = header.trim();
                header = header.toLowerCase();
                tempSet.push(header);
            }
            headersToSign = tempSet;
        }

        for (const key in headers) {
            const value = headers[key];
            if (value) {
                if (!headersToSign?.length) {
                    // 不存在的情况启用默认值
                    if (this.isDefaultHeaderToSign(key)) {
                        ret[key] = value;
                    }
                } else if (key != 'Authorization') {
                    if (headersToSign.includes(key.toLowerCase())) {
                        ret[key] = value;
                    }
                }
            }
        }

        const ksort = {};
        Object.keys(ret)
            .sort()
            .forEach((key) => {
                ksort[key] = ret[key];
            });
        return ksort;
    }

    /**
     * @param $header
     * @returns bool
     */
    public static isDefaultHeaderToSign($header) {
        $header = $header.trim.toLowerCase();
        const $defaultHeadersToSign = [];
        $defaultHeadersToSign.push('host');
        $defaultHeadersToSign.push('content-type');

        return $header.startsWith('x-yop-') || $defaultHeadersToSign.includes($header);
    }

    /**
     * @param headers
     * @param $headers
     * @returns string
     */
    public static getCanonicalHeaders(headers) {
        if (!headers) {
            return '';
        }
        const headerStrings = [];
        for (let key in headers) {
            let value = headers[key];
            if (!key) {
                continue;
            }
            if (!value) {
                value = '';
            }
            key = HttpUtils.normalize(key.trim().toLowerCase());
            value = HttpUtils.normalize(value.trim());
            headerStrings.push(key + ':' + value);
        }
        headerStrings.sort();
        let StrQuery = '';
        for (const i in headerStrings) {
            const kv = headerStrings[i];
            StrQuery += StrQuery.length == 0 ? '' : '\n';
            StrQuery += kv;
        }
        return StrQuery;
    }

    /**
     * @param $methodOrUri
     * @param $YopRequest
     * @returns YopResponse
     */
    public static async upload($methodOrUri, $YopRequest) {
        const $content = await YopRsaClient.uploadForString($methodOrUri, $YopRequest);
        const $response = YopRsaClient.handleRsaResult($YopRequest, $content);
        return $response;
    }

    public static async uploadForString($methodOrUri, $YopRequest: YopRequest) {
        $YopRequest.$httpMethod = 'POST';
        const $serverUrl = YopRsaClient.richRequest($methodOrUri, $YopRequest);
        YopRsaClient.SignRsaParameter($methodOrUri, $YopRequest);
        const $response = await HttpRequest.request($serverUrl, $YopRequest);
        return $response;
    }

    public static richRequest($methodOrUri, $YopRequest: YopRequest) {
        if ($methodOrUri.includes(YopConfig.$serverRoot)) {
            const serverRoot = YopConfig.$serverRoot;
            $methodOrUri = $methodOrUri.substr(serverRoot.length + 1);
        }
        let $serverUrl = $YopRequest.$serverRoot;
        //判定是否是yos请求，当前只判断是否是文件上传，后续需要补充判断文件下载
        const $yosRequest = Object.keys($YopRequest.$fileMap).length > 0;
        if ($yosRequest && $serverUrl === YopConfig.$serverRoot) {
            $serverUrl = YopConfig.$yosServerRoot;
        }
        $serverUrl += $methodOrUri;
        let $version = $methodOrUri.match('/rest/v([^/]+)/');
        if ($version) {
            $version = $version[1];
            if ($version) {
                $YopRequest.setVersion($version);
            }
        }
        $YopRequest.setMethod($methodOrUri);
        return $serverUrl;
    }

    public static handleRsaResult($YopRequest: YopRequest, $content):YopResponse {
        if ($YopRequest.$downRequest) {
            return $content;
        }

        const $response = new YopResponse();
        let $jsoncontent;
        try {
            $jsoncontent = JSON.parse($content);
        } catch (error) {
            throw new Error('易宝接口返回信息解析出错');
        }
        $response.$requestId = $YopRequest.$requestId;
        if ($jsoncontent.result) {
            $response.$state = 'SUCCESS';
            $response.$result = $jsoncontent.result;
        } else {
            $response.$state = 'FAILURE';
            $response.$error = new YopError();
            $response.$error.$code = $jsoncontent.code;
            $response.$error.$message = $jsoncontent.message;
            $response.$error.$subCode = $jsoncontent.subCode;
            $response.$error.$subMessage = $jsoncontent.subMessage;
        }
        //        if (!empty($response->sign)) {
        //            $response->validSign = YopRsaClient::isValidRsaResult($jsoncontent->result, $jsoncontent->sign, $YopRequest->yopPublicKey);
        //        } else {
        //3.2.7之前返回结果没有签名，3.2.7之后有签名，具体签名策略请参照网关
        $response.$validSign = '1';
        //        }
        return $response;
    }
}
