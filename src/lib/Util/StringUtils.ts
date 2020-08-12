/**
 * Created by PhpStorm.
 * User: yp-tc-7176
 * Date: 17/7/16
 * Time: 20:12
 */
export abstract class StringUtils {
    static isBlank($field) {
        if ($field == '') {
            return false;
        } else {
            return true;
        }
    }

    static getUniqueId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
