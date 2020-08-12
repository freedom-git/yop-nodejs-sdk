import { YopConfig } from './YopConfig';
import * as crypto from 'crypto';
import { StringUtils } from './Util/StringUtils';

export class YopRequest {
    // 补全参数
    public $name;

    public $httpMethod;
    public $method;
    public $version = '1.0';
    public $signAlg = 'sha256';

    /**
     * 商户编号，易宝商户可不注册开放应用(获取appKey)也可直接调用API
     */
    public $customerNo;

    public $headers = {};
    public $paramMap = {};
    public $fileMap = {};
    public $jsonParam;
    public $ignoreSignParams = ['sign'];

    public $requestId;

    /**
     * 连接超时时间
     */
    public $connectTimeout = 30000;

    /**
     * 读取返回结果超时
     */
    public $readTimeout = 60000;

    /**
     * 可支持不同请求使用不同的appKey及secretKey
     */
    public $appKey;

    /**
     * 可支持不同请求使用不同的appKey及secretKey,secretKey只用于本地签名，不会被提交
     */
    public $secretKey;

    /**
     * 可支持不同请求使用不同的appKey及secretKey、serverRoot,secretKey只用于本地签名，不会被提交
     */
    public $yopPublicKey;

    /**
     * 可支持不同请求使用不同的appKey及secretKey、serverRoot,secretKey只用于本地签名，不会被提交
     */
    public $serverRoot;

    public $downRequest = false;

    public __set($name, $value) {
        this.$name = $value;
    }
    public __get($name) {
        return this.$name;
    }

    public setSignAlg($signAlg) {
        this.$signAlg = $signAlg;
    }

    public setVersion($version) {
        this.$version = $version;
    }

    public setMethod($method) {
        this.$method = $method;
    }

    public constructor($appKey = '', $secretKey = null, $serverRoot = null, $yopPublicKey = null) {
        //定义构造函数
        this.$requestId = this.uuid();

        if ($appKey) {
            this.$appKey = $appKey;
        } else {
            this.$appKey = YopConfig.$appKey;
        }

        if ($secretKey) {
            this.$secretKey = $secretKey;
        } else {
            this.$secretKey = YopConfig.$hmacSecretKey;
        }

        if ($yopPublicKey) {
            this.$yopPublicKey = $yopPublicKey;
        } else {
            this.$yopPublicKey = YopConfig.$yopPublicKey;
        }

        if ($serverRoot) {
            this.$serverRoot = $serverRoot;
        } else {
            this.$serverRoot = YopConfig.$serverRoot;
        }
    }

    public addParam($key, $values) {
        if ('_file' == $key) {
            this.addFile($key, $values);
        } else {
            this.$paramMap[$key] = $values;
        }
    }

    public addFile($key, $values) {
        this.$ignoreSignParams.push($key);
        this.$fileMap[$key] = $values;
    }

    public removeParam($key) {
        delete this.$paramMap[$key];
    }

    public getParam($key) {
        return this.$paramMap[$key];
    }

    public setJsonParam($jsonParam) {
        this.$jsonParam = $jsonParam;
    }

    public getJsonParam() {
        return this.$jsonParam;
    }

    public encoding() {
        Object.keys(this.$paramMap).forEach((key) => {
            this.$paramMap[key] = encodeURIComponent(this.$paramMap[key]);
        });
    }

    /**
     * 将参数转换成k=v拼接的形式
     */
    toQueryString() {
        let StrQuery = '';
        for (const k in this.$paramMap) {
            const v = this.$paramMap[k];
            StrQuery += StrQuery ? '&' : '';
            StrQuery += k + '=' + encodeURIComponent(v);
        }
        return StrQuery;
    }

    private uuid($namespace = '') {
        let char = StringUtils.getUniqueId(24) + '' + new Date().getTime();
        char = crypto.createHash('md5').update(char).digest('hex');
        let uuid = '';
        uuid += char.substr(0, 8) + '-';
        uuid += char.substr(8, 4) + '-';
        uuid += char.substr(12, 4) + '-';
        uuid += char.substr(16, 4) + '-';
        uuid += char.substr(20, 12);
        return $namespace + uuid;
    }
}
