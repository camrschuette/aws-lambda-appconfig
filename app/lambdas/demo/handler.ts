import axios from 'axios';

const application = process.env.AWS_APPCONFIG_APPLICATION;
const environment = process.env.AWS_APPCONFIG_ENVIRONMENT;
const configuration = process.env.AWS_APPCONFIG_CONFIGURATION;

export const handler = async () => {
    const start = new Date();
    const {data} = await axios.get(`/applications/${application}/environments/${environment}/configurations/${configuration}`, {
        baseURL: `http://localhost:2772`,
    });
    
    console.log(`${data}`);
    console.log(`Time to get AppConfig data was ${new Date().getTime() - start.getTime()} millis.`);
};
