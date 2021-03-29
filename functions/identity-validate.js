exports.handler = async (ev, ctx) => {
    console.log(ev);
    const {identity, user} = ctx.clientContext;
    console.log(JSON.parse(ev.body));
    return {
        statusCode: 503,
        body: JSON.stringify({"app_metadata": {"roles": ["admin"]}})
    }
}