const fetch = require('node-fetch').default;

const handler = async (event, context) => {
    try {
        if (!context.clientContext || !context.clientContext.identity) {
            return {
                statusCode: 500,
                body: "Identity not implemented for this endpoint and/or not sent",
            }
        } else if (!context.clientContext.user) {
            return {
              statusCode: 401,
              body: "User not sent - unauthorized",
            }
        }
        const { identity, user } = context.clientContext;
        const usersUrl = `${identity.url}/admin/users`;
        const adminAuthHeader = `Bearer ${identity.token}`;
        console.log("CTX", context.clientContext);
        let data = await (await fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader },
        })).json();
      
        console.log("Resulting data: ",data);
        if (!data.users) {
          return {
              statusCode: 401,
              body: JSON.stringify({
                success: false,
                err: "Error while trying to source users - likely insufficient authentication"
              })
          };
        }

        let matchedUsers = [];
        for (let testU of data.users) {
            //TODO: Add matching algorithm here with current user (user.user_metadata) and ensure not the same (user.email != testU.email)
            if (testU.user_metadata && testU.user_metadata.listing) {
                matchedUsers.push(testU.user_metadata.listing);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              users: matchedUsers
            })
        };
    } catch (error) {
        console.log("Err", error);
        return {
          statusCode: 501,
          body: JSON.stringify({
            success: false,
            err: error
          })
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
