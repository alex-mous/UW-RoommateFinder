exports.handler = async (ev, ctx) => {
    console.log(ev);
    return {
        statusCode: 400,
        body: JSON.stringify({"app_metadata": {"roles": ["admin"]}})
    }
}