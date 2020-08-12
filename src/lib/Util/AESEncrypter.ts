import * as crypto from 'crypto';
/**
 * Created by PhpStorm.
 * User: wilson
 * Date: 16/7/7
 * Time: 11:07
 */
export abstract class AESEncrypter {
    /**
     * 算法,另外还有192和256两种长度
     */
    // const CIPHER = MCRYPT_RIJNDAEL_128;
    /**
     * 模式
     */
    // const MODE = 'aes-128-ecb';

    /**
     * 加密
     *
     * @param string $str	需加密的字符串
     * @param string $key	密钥
     * @returns type
     */

    public static encode($str, $key) {
        // return base64_encode(openssl_encrypt($str,self::MODE,base64_decode($key),OPENSSL_RAW_DATA));

        const cipher = crypto.createCipheriv('aes-128-ecb', $key, new Buffer(0));
        const ciphertext = cipher.update($str, 'utf8');
        // ciphertext += cipher.final();
        throw new Error('undone');
    }

    /**
     * 解密
     *
     * @param type $str
     * @param $str
     * @param $key
     * @returns type
     */
    public static decode($str, $key) {
        const decipher = crypto.createDecipheriv('aes-128-ecb', $key, new Buffer(0));
        let decrypted = decipher.update($str, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
