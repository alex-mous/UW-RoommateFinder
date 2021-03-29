exports.handler = async (ev, ctx) => {
    console.log(ev);
    return {
        statusCode: 200,
        body: JSON.stringify({"app_metadata": {"roles": ["admin"]}})
    }
}