class PTVv3
{
    constructor(ptvId, ptvKey, debug = false)
    {
        this.baseUrl = 'https://timetableapi.ptv.vic.gov.au';
        this.id = ptvId;
        this.key = ptvKey;
        this.debug = debug;
    }

    async call(endpoint, params = {})
    {
        params['devid'] = this.id;
        const query = new URLSearchParams(params).toString();
        const request = `${endpoint}?${query}`;
        const signature = await this.generateSignature(request);
        const url = `${this.baseUrl}${request}&signature=${signature}`;
        if (this.debug)
        {
            console.log(`Request URL: ${url}`);
        }

        const response = await fetch(url);
        if (!response.ok)
        {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
    }

    async generateSignature(request)
    {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.key);
        const requestData = encoder.encode(request);
        const cryptoKey = await crypto.subtle.importKey('raw', keyData,
            { name: 'HMAC', hash: { name: 'SHA-1' } }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, requestData);
        return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

function requestInfo() {
    const ptvId = "3003825";
    const ptvKey = "3d8e3621-33e3-41a9-ac05-27f72390fe84";

    const ptv = new PTVv3(ptvId, ptvKey);

    const stationINFOTxt = document.getElementById("stationINFO");
    const routesList = document.getElementById("output-text");

    ptv.call('/v3/stops/1181/route_type/3')
    .then(data => {
        console.log('API Response:', data);
        let station_length = data.stop.routes.length;

        routesList.innerHTML = "";
        for (let i = 0; i < station_length; i++) {
            routesList.innerHTML += data.stop.routes[i].route_name + " (" + data.stop.routes[i].route_id + ")" + "<br>";
        }

        stationINFOTxt.innerHTML = data.stop.stop_name;
    })
    .catch(error => {
        console.error('API Error:', error);
    });
}

// 1121 = Melton Station
// 1181 = Southern Cross Station