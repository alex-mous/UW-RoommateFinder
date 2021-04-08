// auth, user already defined in main

let topUsers; //top users from api

window.onload = () => {
    if (user == null) window.location.href = "/#login"; //Exit page if not logged in

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata.listing) {
        showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches", "mainMsg", "danger");
        return;
    }

    console.log("Requesting matches...");
    fetch("/.netlify/functions/match", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: user.email,
            user_metadata: user.user_metadata
        })
    })
        .then(res => res.json())
        .then(res => {
            console.log("Response from endpoint: ", res);
            if (res.success) {
                topUsers = res.users;
                for (let i in res.users) {
                    let row = document.createElement("TR");
                    let profileLink = "Not public";
                    if (res.users[i].listing.public == "y") {
                        profileLink = "<btn class='btn btn-sm btn-purple' onclick='toggleUser(true, \"" + i + "\")'>View profile</btn>";
                    }
                    row.innerHTML = `<td>${res.users[i].listing.name}</td><td>${res.users[i].listing.email}</td><td><div class="bio">${res.users[i].listing.bio}</div></td><td>${res.users[i].listing.score}%</td><td>${profileLink}</td>`;
                    document.querySelector("#matchTable").appendChild(row);
                }
                showMsg("No new notifications. Latest best matches shown.", "mainMsg", "info");
            } else {
                showMsg("Error in finding users! Please submit a request via <a href='/support'>our support page</a>.", "mainMsg", "danger");
            }
        })
        .catch(err => {
            console.log("Error at endpoint", err);
            showMsg("Error in request! Please submit a request via <a href='/support'>our support page</a>.", "mainMsg", "danger");
        })
    
}

//Show a popup overlay with the user information
const toggleUser = (showUser, i) => {
    document.querySelector("#matches").classList.toggle("d-none", showUser);
    document.querySelector("#userview").classList.toggle("d-none", !showUser);
    if (showUser) {
        loadForm(topUsers[i], false);
    }
}