//import fetch from "node-fetch";

exports.handler = (ev, ct, cb) => {
    return {
        statusCode: 200,
        body: JSON.stringify({success: true, data: { ev: ev, ct: ct}})
    }
    /*try {
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
    }*/

}