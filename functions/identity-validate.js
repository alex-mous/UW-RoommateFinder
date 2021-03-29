exports.handler = async (ev, ctx) => {
    const evt = JSON.parse(ev.body);
    const user = evt.user;
    console.log("User: ", user);
    console.log("Has UW email: ", user.email.endsWith("@uw.edu"));
    return {
        statusCode: user.email.endsWith("@uw.edu") ? 200 : 400
    }
}