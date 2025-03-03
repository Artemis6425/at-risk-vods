const axios = require('axios');
const fs = require('fs');

const clientId = '';       // Replace with your Twitch Client ID
const clientSecret = '';   // Replace with your Twitch Client Secret

// This code outputs a file called "twitch-token.json" that will be used in "twitch-part.js"

async function fetchAndSaveToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }
        });

        const tokenData = {
            client_id: clientId,
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            obtained_at: new Date().toISOString()
        };

        fs.writeFileSync('twitch-token.json', JSON.stringify(tokenData));
        console.log('Token saved to twitch-token.json');
    } catch (error) {
        console.error('Error fetching token:', error.response);
    }
}

fetchAndSaveToken();
