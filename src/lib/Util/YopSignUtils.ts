import { AESEncrypter } from './AESEncrypter';
import { Base64Url } from './Base64Url';
import * as crypto from 'crypto';

export abstract class YopSignUtils {
    /**
     * 签名生成算法
     *
     * @param array $params API调用的请求参数集合的关联数组，不包含sign参数
     * @param String $secret 密钥
     * @param $params
     * @param $ignoreParamNames
     * @param $secret
     * @param $algName
     * @param String $algName 加密算法
     *
     * md2
     * md4
     * md5
     * sha1
     * sha256
     * sha384
     * sha512
     * ripemd128
     * ripemd160
     * ripemd256
     * ripemd320
     * whirlpool
     * @returns string 返回参数签名值
     */
    static sign($params, $ignoreParamNames = '', $secret, $algName = 'sha256') {
        // $str = '';  //待签名字符串
        // //先将参数以其参数名的字典序升序进行排序
        // $requestparams = $params;

        // ksort($requestparams);
        // //遍历排序后的参数数组中的每一个key/value对
        // foreach ($requestparams as $k => $v) {
        //     //查看Key 是否为忽略参数
        //     if(!in_array($k,$ignoreParamNames)){
        //         //为key/value对生成一个keyvalue格式的字符串，并拼接到待签名字符串后面

        //         //value不为空,则进行加密
        //         if (!($v === NULL)) {
        //             $str .= "$k$v";
        //         }
        //     }
        // }

        // //将签名密钥拼接到签名字符串两头
        // $str = $secret.$str.$secret;
        // //通过指定算法生成sing

        // $signValue = hash($algName,$str);

        // if (YopConfig::$debug) {
        //     var_dump("algName=".$algName);
        //     var_dump("str=".$str);
        //     var_dump("signValue=".$signValue);
        // }

        // return $signValue;
        throw new Error('TODO');
    }

    /**
     * 签名验证算法
     *
     * @param array $result API调用的请求参数集合的关联数组，不包含sign参数
     * @param String $secret 密钥
     * @param String $algName 加密算法
     * @param $result
     * @param $secret
     * @param $algName
     * @param $sign
     * @param String $sign 签名值
     * @returns string 返回签名是否正确 0 - 如果两个字符串相等
     */
    static isValidResult($result, $secret, $algName, $sign) {
        //    $newString = $secret.$result.$secret;

        //    if(strcasecmp($sign,hash($algName,$newString))==0){
        //        return true;
        //    }else{
        //        return false;
        //    }
        throw new Error('TODO');
    }

    public static decrypt($source, $private_Key, $public_Key) {
        // 格式化密钥
        const secretKeyInOneLine = $private_Key;
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

        //分解参数
        const $args = $source.split('$');

        if ($args.length !== 4) {
            throw new Error('source invalid : ');
        }

        const $encryptedRandomKeyToBase64 = $args[0];
        const $encryptedDataToBase64 = $args[1];
        const $symmetricEncryptAlg = $args[2];
        const $digestAlg = $args[3];

        //用私钥对随机密钥进行解密
        const $randomKey = crypto.privateDecrypt(
            {
                key: private_key,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(Base64Url.decode($encryptedRandomKeyToBase64), 'base64'),
        );

        const $encryptedDataArr = AESEncrypter.decode(Base64Url.decode($encryptedDataToBase64), $randomKey).split('$');

        //分解参数
        const $sourceData = $encryptedDataArr[0];
        const $signToBase64 = $encryptedDataArr[1];

        // 格式化公钥
        const publicKeyInOneLine = $public_Key;
        const publicStartMark = '-----BEGIN PUBLIC KEY-----';
        const publicEndMark = '-----END PUBLIC KEY-----';
        let public_key = '';
        const len = publicKeyInOneLine.length;
        let publicStart = 0;
        while (publicStart <= len) {
            if (public_key.length) {
                public_key += publicKeyInOneLine.substr(publicStart, 64) + '\n';
            } else {
                public_key = publicKeyInOneLine.substr(publicStart, 64) + '\n';
            }
            publicStart += 64;
        }
        public_key = publicStartMark + '\n' + public_key + publicEndMark;

        const verify = crypto.createVerify('RSA-' + $digestAlg);
        verify.update($sourceData);
        const $res = verify.verify(public_key, $signToBase64, 'base64');

        if ($res) {
            return $sourceData;
        } else {
            throw new Error('verifySign fail!');
        }
    }

    static signRsa($source, $private_Key) {
        // 格式化密钥
        const secretKeyInOneLine = $private_Key;
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
        signer.update($source);
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
        return $signToBase64;
    }

    static getPrivateKey($filepath, $password) {
        // $pkcs12 = file_get_contents($filepath);
        // openssl_pkcs12_read($pkcs12, $certs, $password);
        // $prikeyid = $certs['pkey']; //私钥

        // $prikeyid = str_replace('-----BEGIN RSA PRIVATE KEY-----','',$prikeyid);
        // $prikeyid = str_replace('-----END RSA PRIVATE KEY-----','',$prikeyid);

        // $prikeyid = preg_replace("/(\r\n|\n|\r|\t)/i", '', $prikeyid);

        // return $prikeyid;
        throw new Error('TODO');
    }
}
