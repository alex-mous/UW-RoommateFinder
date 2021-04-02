// auth, user already defined in main

window.onload = () => {
    if (user == null) { //Exit page if not logged in
        window.location.href = "/"
    }

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata) showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches");

    user.jwt(true).then((token) => {
        fetch("/.netlify/functions/match",
        {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(
                {test:"abc"}
            )
        })
            .then(res =>res.json())
            .then(res => console.log(res))
    })

    
}