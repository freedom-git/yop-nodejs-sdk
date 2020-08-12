/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Spomky-Labs
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */
import * as URLSafeBase64 from 'urlsafe-base64';

/**
 * Encode and decode data into Base64 Url Safe.
 */
export abstract class Base64Url {
    /**
     * @param string $data        The data to encode
     * @param $data
     * @param $use_padding
     * @param bool   $use_padding If true, the "=" padding at end of the encoded value are kept, else it is removed
     * @returns string The data encoded
     */
    public static encode($data, $use_padding = false) {
        const $encoded = URLSafeBase64.encode($data);
        return true === $use_padding ? $encoded : URLSafeBase64.trim($encoded);
    }

    /**
     * @param $data
     * @param string $data The data to decode
     * @returns string The data decoded
     */
    public static decode($data) {
        return URLSafeBase64.decode($data).toString('base64');
    }
}
