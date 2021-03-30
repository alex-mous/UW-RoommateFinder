//import faunadb from 'faunadb';
import fetch from "node-fetch";
/*
import GoTrue from 'gotrue-js';

const auth = new GoTrue({
    APIUrl: 'https://roommatematcher.netlify.app/.netlify/identity',
    audience: '',
    setCookie: false,
});
auth.login("amous@uw.edu", "test", true);

const query = faunadb.query;

const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET
});
*/
exports.handler = (ev, ct, cb) => {
    //const data = JSON.parse(ev.body);
    return {
        statusCode: 200,
        body: JSON.stringify({success: true, test: ct.clientContext})
    }
}