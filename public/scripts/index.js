
window.onload = () => {
    auth = new GoTrue({
        APIUrl: "https://roommatematcher.netlify.app/.netlify/identity",
        audience: "",
        setCookie: false
    });
    let usr = auth.currentUser();
    console.log(usr);
    if (usr != null) {
        console.log("User logged in!");
    }
}