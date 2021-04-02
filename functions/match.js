import fetch from "node-fetch";

exports.handler = (ev, ct, cb) => {
    const {identity, user} = ct.clientContext;
    const data = ev.body;
    console.log("ID", identity);
    console.log("User", user);
    console.log("Data", data);

    if (!identity) {
        return {
            statusCode: 400,
            body: JSON.stringify({success: true, test: ct.clientContext})
        }
    }

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
            console.error("Failed to fetch users:", err);
            return {
                statusCode: 500,
                body: JSON.stringify({success: false, body: err})
            }
        })

}