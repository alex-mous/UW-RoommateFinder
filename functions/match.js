/*import fetch from "node-fetch";

exports.handler = async (ev, ct) => {
    try {
        if (!ct.clientContext || !ct.clientContext.identity || !ct.clientContext.user) {
            return {
                statusCode: 400,
                body: JSON.stringify({success: false})
            }
        }

        const {identity, user} = ct.clientContext;
        console.log("ID", identity);
        console.log("User", user);
    
        return fetch(`${identity.url}/admin/users`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${identity.token}`
            }
        })
            .then((res) => res.json())
            .then((res) => {
                console.log("Results:", res);
                return {
                    statusCode: 200,
                    body: JSON.stringify({success: true, body: res})
                }
            })
            .catch((err) => {
                console.log("Failed to fetch users:", err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({success: false, body: err})
                }
            });
    } catch (err) {
        console.log("External 500", err);
        return {
            statusCode: 503,
            body: JSON.stringify({success: false, err: err})
        }
    }
}*/

import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    const { identity, user } = context.clientContext;
    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;

    try {
        return fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Resulting data", JSON.stringify(data));
                return { statusCode: 204 };
            })
            .catch((error) => ({
                statusCode: 500,
                body: `Internal Server Fault: ${error}`,
            }));
    } catch (error) {
        return error;
    }
};