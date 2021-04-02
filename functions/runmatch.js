const fetch = require('node-fetch').default;


const handler = async (event, context) => {
    console.log("Starting request...");
    if (!context.clientContext || !context.clientContext.identity) {
      return {
          statusCode: 501,
          body: `Internal Server Fault`,
      }
    }
    const { identity } = context.clientContext;
    const user = event.body.user;
    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    console.log("CTX", context.clientContext);
    console.log("EV", user);
    try {
        return fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Resulting data", JSON.stringify(data));
                return { statusCode: 200, body: JSON.stringify({success:true}) };
            })
            .catch((error) => ({
                statusCode: 500,
                body: `Internal Server Fault: ${error}`,
            }));
    } catch (error) {
        console.log("Err", error);
        return {
          statusCode: 501,
          body: JSON.stringify({err:error})
        };
    }
};

/*const handler = async function (event, context) {
  if (!context.clientContext && !context.clientContext.identity) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg: 'No identity instance detected. Did you enable it?',
      }),
    }
  }
  const { identity, user } = context.clientContext
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random')
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ identity, user, msg: data.value }),
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}*/

module.exports = { handler }
