// auth, user already defined in main

window.onload = () => {
    if (user == null) { //Exit page if not logged in
        window.location.href = "/"
    }

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata) showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches");

    user.jwt(true).then(() => {
        console.log("Got token", user.token.access_token);
        fetch("/.netlify/functions/runmatch", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token.access_token
            },
            body: {
                user: JSON.stringify(user)
            }
        })
            .then(res => console.log(res))
    })

    
}