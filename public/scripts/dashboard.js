// auth, user already defined in main

window.onload = () => {
    if (user == null) { //Exit page if not logged in
        window.location.href = "/"
    }

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata) showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches");

    user.jwt(true).then(() => {
        console.log("Fetching matches...");
        fetch("/.netlify/functions/runmatch", {
            headers: {
                'Authorization': 'Bearer ' + user.token.access_token
            },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(res => {
                console.log("API Results: ", res);
                if (res.success) {
                    for (let user of res.users) {
                        let row = document.createElement("TR");
                        row.innerHTML = `<td>${user.name}</td><td>${user.email}</td><td>${user.bio}</td><td>${user.score}</td>`;
                        document.querySelector("#matchTable").appendChild(row);
                    }
                } else {
                    //TODO: show error
                }
            });
    })
}