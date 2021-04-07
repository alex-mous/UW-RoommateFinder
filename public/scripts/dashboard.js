// auth, user already defined in main

window.onload = () => {
    if (user == null) window.location.href = "/#login"; //Exit page if not logged in

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata.listing) {
        showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches", "mainMsg", "danger");
        return;
    }

    let params = new URLSearchParams(window.location.search);
    let i = params.get("user")
    if (i) {
        console.log("Showing user with index ", i)
        showUser(i);
        return;
    }

    console.log("Showing matches...");
    if (user.app_metadata.success) {
        let users = user.app_metadata.users;
        for (let i in users) {
            let row = document.createElement("TR");
            let profileLink = "Not public";
            if (users[i].listing.public) {
                profileLink = "<button class='btn btn-sm btn-purple' onclick='showUser(\"" + i + "\")'>View profile</button>";
            }
            row.innerHTML = `<td>${users[i].listing.name}</td><td>${users[i].listing.email}</td><td><div class="bio">${users[i].listing.bio}</div></td><td>${users[i].listing.score}%</td><td>${profileLink}</td>`;
            document.querySelector("#matchTable").appendChild(row);
        }
        showMsg("No new notifications. Latest best matches shown.", "mainMsg", "info");
    } else {
        showMsg("Error in finding users! Please submit a request via <a href='/support'>our support page</a>.", "mainMsg", "danger");
    }
}

//Show a popup overlay with the user information
const showUser = (i) => {
    document.querySelector("#matches, #userview").classList.toggle("d-none");
}