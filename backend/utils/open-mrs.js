const axios = require('axios');

const openmrsAxios = axios.create({
    baseURL: process.env.OPENMRS_URL,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

const getOpenMRSConfig = () => ({
    baseURL: process.env.OPENMRS_URL,
    auth: {
        username: process.env.OPENMRS_USERNAME,
        password: process.env.OPENMRS_PASSWORD,
    },
});

module.exports = { openmrsAxios, getOpenMRSConfig };