const fetch = require("node-fetch").default;

const handler = async (event, context) => {
    const { identity, user } = context.clientContext;
    const userID = user.sub;
    const userUrl = `${identity.url}/admin/users/{${userID}}`;
    const adminAuthHeader = `Bearer ${identity.token}`;

    try {
        return fetch(userUrl, {
            method: 'DELETE',
            headers: { Authorization: adminAuthHeader },
        })
            .then((response) => {
                console.log("Successfully deleted user with ID: ", userID);
                console.log("API response ", response);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true
                    })
                }
                })
            .catch((error) => {
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        success: false,
                        body: `Internal Server Error: ${error}`
                    })
                }
            });
    } catch (error) {
        console.log("Error while processing request: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                body: `Error: ${error}`
            })
        }
    }
}

module.exports = { handler }