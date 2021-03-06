exports.handler = async (ev, ctx) => {
    const evt = JSON.parse(ev.body);
    const user = evt.user;
    console.log("User: ", user);
    let emailStatus = user.email.endsWith("@uw.edu") || user.email.endsWith("@u.washington.edu");
    console.log("Has UW email: ", emailStatus);
    return {
        statusCode: emailStatus ? 200 : 400
    }
}