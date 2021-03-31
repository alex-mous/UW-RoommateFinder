//import fetch from "node-fetch";

exports.handler = (ev, ct, cb) => {
    //const data = JSON.parse(ev.body);
    return {
        statusCode: 200,
        body: JSON.stringify({success: true, test: ct.clientContext})
    }
}