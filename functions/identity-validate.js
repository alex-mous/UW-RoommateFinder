exports.handler = async (ev, ctx) => {
    console.log(ev);
    const {identity, user} = ctx.clientContext;
    console.log(identity, user);
    return {
        statusCode: 200,
        body: JSON.stringify({"app_metadata": {"roles": ["admin"]}})
    }
}