import axios from 'axios';
import { cleanEnv, num, str } from 'envalid';
import { SomeApiSchema } from './validation';

const env = cleanEnv(process.env, {
    AWS_APPCONFIG_EXTENSION_HTTP_PORT: num(),
    AWS_APPCONFIG_APPLICATION: str(),
    AWS_APPCONFIG_ENVIRONMENT: str(),
    AWS_APPCONFIG_CONFIGURATION: str()
});

const port = env.AWS_APPCONFIG_EXTENSION_HTTP_PORT;
const application = env.AWS_APPCONFIG_APPLICATION;
const environment = env.AWS_APPCONFIG_ENVIRONMENT;
const configuration = env.AWS_APPCONFIG_CONFIGURATION;

export const handler = async () => {
    const {data} = await axios.get(`/applications/${application}/environments/${environment}/configurations/${configuration}`, {
        baseURL: `http://localhost:${port}`,
        responseType: 'json'
    });
    
    // Validate configuration data
    const someApiConfig = await SomeApiSchema.parseAsync(data);
    
    console.log(`We can call the SomeApi at ${someApiConfig.host} at a rate of ${someApiConfig.rateLimit.pMin} calls per minute`);
};
