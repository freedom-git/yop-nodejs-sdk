import * as https from 'https';
import { YopRequest } from '../YopRequest';
import { YopConfig } from '../YopConfig';
import * as FormData from 'form-data';

export abstract class HttpRequest {
	public static request($url, $request: YopRequest) {
		const form = new FormData();
		const url = new URL($url);
		const extendHeaders = {
			'x-yop-sdk-langs': 'nodejs',
			'x-yop-sdk-version': '3.0.0',
			'x-yop-request-id': $request.$requestId
		};
		if ($request.$jsonParam) {
			(extendHeaders['content-type'] = 'application/json; charset=utf-8'),
				(extendHeaders['content-length'] = $request.$jsonParam.length);
		}
		const options = {
			protoco: url.protocol,
			hostname: url.host,
			path: url.pathname,
			method: $request.$httpMethod,
			headers: Object.assign({}, $request.$headers, extendHeaders, form.getHeaders()),
			timeout: $request.$connectTimeout
		};

		// $request.encoding();

		if (YopConfig.$debug) {
			console.log('header', Object.assign({}, $request.$headers, extendHeaders), form.getHeaders());
			console.log($request);
			console.log($request.$httpMethod);
		}

		if ($request.$httpMethod === 'POST') {
            const $fields = Object.assign({}, $request.$paramMap, $request.$fileMap);
			for (const key in $fields) {
				form.append(
					key,
					$fields[key],
					$request.$fileMap[key]
						? {
								// filename: 'certificate',
								filepath: 'certificate'
							}
						: undefined
				);
			}
		}
		// TODO 需要处理文件上传和get请求参数
		return new Promise((resolve, reject) => {
			const req = https
				.request(options, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						resolve(data);
					});
				})
				.on('error', (err) => {
					console.log('Error: ', err.message);
					reject(err);
				});
			form.pipe(req);
		});

		// $data = curl_exec($curl);
		// //var_dump($data);

		// if (curl_errno($curl)) {
		//     return curl_error($curl);
		// }

		// $responseHeaders = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
		// //print_r($responseHeaders);
		// //print_r(substr_compare($responseHeaders, "application/octet-stream", 0, 16));
		// if (!empty($responseHeaders) && substr_compare($responseHeaders, "application/octet-stream", 0, 16) == 0) {
		//     $request->downRequest = true;
		// }

		// curl_close($curl);
		// return $data;
	}
}
