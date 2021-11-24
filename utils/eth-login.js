function formatMessage(data) {
    
    let resources = "Resources\n";
    if(data.resources) data.resources.forEach(r => resources += `- ${r}\n`); 
  
    return `${data.domain} wants you to sign in with your Ethereum account:\n` +
        `${data.address}\n` +
        `\n` +
        `${data.statement}\n` +
        `\n` +
        `URI: ${data.uri}\n` +
        `Version: ${data.version}\n` +
        `Chain ID: ${data.chainId}\n` +
        `Nonce: ${data.nonce}\n` +
        `Issued At: ${data.issuedAt}\n` +
        `Expiration Time: ${data.expirationTime}\n` +
        `Not Before: ${data.notBefore}\n` +
        `Request ID: ${data.requestId}\n` +
        resources;
}

function getServerSettings(nonce) {
    return {
        nonce: nonce,
        domain: process.env.ETH_DOMAIN || "localhost",
        statement: process.env.ETH_STATEMENT || "Login with Auth0",
        version: "1.0",
        notBefore: 5,
        notAfter: 60,
        uri: "https://localhost:3000",
        resources: ["contact-read", "email-read"]
      }
}

const fetchSettings = async () => {
    
    const response = await fetch('/api/settings');
  
    if(response.status != 200)
      throw new Error("settings could not be retrieved");

    const settings = await response.json();
    
    return settings;
  }

export {
    formatMessage,
    fetchSettings,
    getServerSettings
}
 