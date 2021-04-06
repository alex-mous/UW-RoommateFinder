// auth, user already defined in main

window.onload = () => {
    if (user == null) window.location.href = "/#login"; //Exit page if not logged in

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata.listing) {
        showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches", "mainMsg", "danger");
        return;
    }

    console.log("Showing matches...");
    if (user.app_metadata.success) {
        for (let usr of user.app_metadata.users) {
            let row = document.createElement("TR");
            row.innerHTML = `<td>${usr.name}</td><td>${usr.email}</td><td><div class="bio">${usr.bio}</div></td><td>${usr.score}</td>`;
            document.querySelector("#matchTable").appendChild(row);
        }
        showMsg("No new notifications. Latest best matches shown.", "mainMsg", "info");
    } else {
        showMsg("Error in finding users! Please submit a request via <a href='/support'>our support page</a>.", "mainMsg", "danger");
    }
}