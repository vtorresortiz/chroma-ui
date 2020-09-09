import axios from 'axios';
import schedule from "node-schedule";
import Color from "color";
import Constants from '../constants';

const validate = () => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            var obj = JSON.parse(JSON.stringify(this));
            if(obj.error) {
                return undefined;
            }
            const result = originalMethod.apply(this, args);
            return result;
        };
    };
};

class RazerClient {
    private error: boolean;
    private retries: number;
    private http: any;
    private uri: string | undefined;
    private job: schedule.Job | undefined;

    constructor() {
        this.error = false;
        this.retries = 0;
        this.http = axios.create();
        this.http.interceptors.response.use(null, async (error: { config: any; }) => {
            this.retries++;
            if (this.retries > 2) return Promise.reject(error);
            await new Promise(r => setTimeout(r, 1000));
            return this.http.request(error.config);
        });
    }

    @validate()
    async send(method: string, url: string, data: any) {
        const req = {
            method, url, data,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        console.log(`${req.method} ${req.url}`);
        //console.log(`req ${JSON.stringify(req)}`);

        return await this.http.request(req).then((res: { data: any; }) => {
            //console.log(`res ${JSON.stringify(res.data)}`);
            console.log('ok');
            return res.data;
        }).catch((error: { code: any; }) => {
            console.log(`err ${error.code}`);
            this.error = true;
            return undefined;
        });
    }

    async alive() {
        await this.send("PUT", this.uri + "/heartbeat", undefined);
    }

    async open() {
        if (!this.uri) {
            const session = await this.send("POST", "http://localhost:54235/razer/chromasdk", new Constants().application);
            this.uri = session.uri;
            this.job = schedule.scheduleJob('*/10 * * * * *', async () => this.alive());
            process.on('SIGINT', () => {
                console.log('stoping');
                if (this.job) {
                    this.job.cancel();
                }
                this.close();

            });
            return true;
        }

        return false;
    }

    async close() {
        if (this.job) {
            this.job.cancel();
        }
        if (this.uri) {
            await this.send("DELETE", this.uri, undefined);
            this.uri = undefined;
        }
    }

    @validate()
    async set(device: string, newColor: string) {
        if (!new Constants().devices.includes(device)) {
            return;
        }
        const color = Color(newColor);
        const colorBGR = 256 * 256 * color.blue() + 256 * color.green() + color.red();
        const effect = await this.send("POST", this.uri + "/" + device, {
            "effect": "CHROMA_STATIC",
            "param": {
                "color": colorBGR
            }
        });

        await new Promise(r => setTimeout(r, 1000));
        await this.send("PUT", this.uri + "/effect", effect);
    }
}

export default RazerClient;