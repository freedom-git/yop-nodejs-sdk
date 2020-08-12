/**
 * Created by PhpStorm.
 * User: yp-tc-7176
 * Date: 17/7/16
 * Time: 20:28
 */

export abstract class HttpUtils {
    /**
     * Normalize a string for use in url path. The algorithm is:
     * <p>
     * <p>
     * <ol>
     * <li>Normalize the string</li>
     * <li>replace all "%2F" with "/"</li>
     * <li>replace all "//" with "/%2F"</li>
     * </ol>
     * <p>
     * <p>
     * object key can contain arbitrary characters, which may result double slash in the url path. Apache http
     * client will replace "//" in the path with a single '/', which makes the object key incorrect. Thus we replace
     * "//" with "/%2F" here.
     *
     * @param $path
     * @param path the path string to normalize.
     * @returns the normalized path string.
     * @see #normalize(String)
     */
    public static normalizePath($path) {
        const tmp = this.normalize($path);
        return tmp.replace(/\%2F/g, '/');
    }

    /**
     * @param $value
     * @returns string
     */
    public static normalize($value) {
        return encodeURIComponent($value);
    }

    public static startsWith($haystack, $needle) {
        // search backwards starting from haystack length characters from the end
        if (!$needle) {
            return true;
        }
        if ($haystack.lastIndexOf($needle) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    public static endsWith(haystack, needle) {
        // search forward starting from end minus needle length characters
        if (!needle) {
            return true;
        }
        const temp = haystack.length - needle.length;
        const find = haystack.indexOf(needle, temp);
        if (temp >= 0 && temp >= 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param path
     * @param $path
     * @returns string
     */
    public static getCanonicalURIPath(path) {
        if (!path) {
            return '/';
        } else if (this.startsWith(path, '/')) {
            return this.normalizePath(path);
        } else {
            return '/' + this.normalizePath(path);
        }
    }
}
