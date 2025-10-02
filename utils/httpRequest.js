class HttpRequest {
    constructor(){
        this.baseUrl = 'https://spotify.f8team.dev/api/';
    }

    async _send(method, path, data, options = {}) {
        try {
            const _options = {
                ...options,
                method,
                headers: {
                    ...options?.headers,
                    'Content-Type':'application/json',
                }
            };
            if (data) {
                _options.body = JSON.stringify(data);
            }
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                _options.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            const res = await fetch(`${this.baseUrl}${path}`, _options);
            const response = await res.json();
            if (!res.ok) {
                const error = new Error(`HTTP error! status: ${res.status}`);
                error.response = response;
                error.status = res.status;
                throw error;
            }

            return response;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async get(path, options) {
        return await this._send('GET', path, null, options);
    }

    async post(path, data, options) {
        return await this._send('POST', path, data, options);
    }

    async put(path, data, options) {
        return await this._send('PUT', path, data, options);
    }

    async patch(path, data, options) {
        return await this._send('PATCH', path, data, options);
    }

    async delete(path, options) {
        return await this._send('DELETE', path, null, options);
    }
}

const httpRequest = new HttpRequest();
export default httpRequest;
