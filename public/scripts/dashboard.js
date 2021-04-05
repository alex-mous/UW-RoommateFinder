// auth, user already defined in main

window.onload = () => {
    if (user == null) { //Exit page if not logged in
        window.location.href = "/";
    }

    document.querySelector("#logoutBtn").onclick = doLogout;

    if (!user.user_metadata) {
        showMsg("Please go to <a href='/profile'>Profile</a> to complete your profile and start getting matches");
        return;
    }

    console.log("Showing matches...");
    if (user.app_metadata.success) {
        for (let usr of user.app_metadata.users) {
            let row = document.createElement("TR");
            row.innerHTML = `<td>${usr.name}</td><td>${usr.email}</td><td><div class="bio">${usr.bio}</div></td><td>${usr.match}</td>`;
            document.querySelector("#matchTable").appendChild(row);
        }
    } else {
        //TODO: show error
    }
}