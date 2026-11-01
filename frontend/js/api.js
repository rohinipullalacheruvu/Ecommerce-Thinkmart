(function () {
    const frontendHost = window.location.hostname;
    const apiHost = frontendHost === '127.0.0.1' ? frontendHost : 'localhost';
    const apiRoot = window.THINKMART_API_URL || `http://${apiHost}:8080/api`;
    let csrfToken;

    async function getCsrfToken() {
        if (!csrfToken) {
            const response = await fetch(`${apiRoot}/csrf`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Could not connect to the ThinkMart backend.');
            }
            const data = await response.json();
            csrfToken = data.token;
        }
        return csrfToken;
    }

    async function request(path, options) {
        const requestOptions = { ...options, credentials: 'include' };
        const method = (requestOptions.method || 'GET').toUpperCase();
        requestOptions.headers = new Headers(requestOptions.headers || {});

        if (requestOptions.body && !requestOptions.headers.has('Content-Type')) {
            requestOptions.headers.set('Content-Type', 'application/json');
        }
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            requestOptions.headers.set('X-XSRF-TOKEN', await getCsrfToken());
        }

        const response = await fetch(`${apiRoot}${path}`, requestOptions);
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('Content-Type') || '';
        const result = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof result === 'object'
                ? result.message || result.detail || result.error
                : result;
            const error = new Error(message || `Request failed (${response.status}).`);
            error.status = response.status;
            throw error;
        }
        return result;
    }

    window.ThinkMartApi = {
        get: path => request(path, { method: 'GET' }),
        post: (path, body) => request(path, {
            method: 'POST',
            body: JSON.stringify(body)
        }),
        put: (path, body) => request(path, {
            method: 'PUT',
            body: JSON.stringify(body)
        }),
        delete: path => request(path, { method: 'DELETE' })
    };
})();
