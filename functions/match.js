import fetch from "node-fetch";

exports.handler = (ev, ct, cb) => {
    const data = JSON.parse(ev.body);
    console.log("EV", ev);
    console.log("CT", ct);
    return {
        statusCode: 200,
        body: JSON.stringify({success: true, test: ct.clientContext})
    }
}