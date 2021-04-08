window.onload = () => {
    if (user == null) window.location.href = "/#login"; //Exit page if not logged in

    document.querySelector("#profileForm").onsubmit = doUpdate;
    document.querySelector("#logoutBtn").onclick = doLogout;
    document.querySelector("#deleteBtn").onclick = doDelete;

    let bioText = document.querySelector("textarea[name='bio']");
    bioText.onkeydown = onBioText;

    loadForm(user.user_metadata);
    
    onBioText({
        target: document.querySelector("textarea[name='bio']"),
        which: 0x20,
        preventDefault: () => {}
    });
}

const doUpdate = (e) => {
    e.preventDefault();
    if (!auth.currentUser()) return;
    let data = new FormData(e.target);
    /*
    Ranking system:
        Absolute prefs will have +1000 points (so yes = 1000, maybe = 500, no = 0) as they're very important
        Minimized prefs will be weighted as +10 points each
        Ranked prefs are less important and will be ranked +5 points each  (plus more in the case of multiple of the same in multi-selects)
            Except for ideology, in which case it will be 10 points for somewhat care and 1000 points for extremely important (equivalent to absolute)
    */
    let userData = {
        listing: {
            name: data.get("name"),
            email: data.get("email"),
            bio: data.get("bio"),
            public: data.get("public")
        },
        profile: {
            prefsAbs: { //Absolute "deal-breakers", such as smoking/no smoking
            //Numeric - can be subtracted but MUST BE 0 FOR MATCH!!
                drink: {
                    me: data.get("drink"),
                    you: data.get("drinkr")
                },
                smoke: {
                    me: data.get("smoke"),
                    you: data.get("smoker")
                },
                vape: {
                    me: data.get("vape"),
                    you: data.get("vaper")
                },
                weed: {
                    me: data.get("weed"),
                    you: data.get("weedr")
                }
            },
            prefsRanked: { //Preferences that are preferrable if they exists, but not like flags and are not subtractable like Minimized ones
                country: data.get("country"), //May be null - force null if US to simplify matching
                state: data.get("state"), //May be null
                major: data.get("major"),
                sport: data.get("sport"),
                interests: data.getAll("interests"),
                ideology: {
                    rank: data.get("ideologyr"),
                    al: data.get("ideology1"),
                    lr: data.get("ideology2")
                },
                location: data.get("campus"),
                hall: data.get("residence"),
                lgbtqpref: data.get("lgbtqpref"), //Maybe ABS PREF - here because it cannot be numerically compared
                lgbtq: data.get("lgbtq"), //Maybe ABS PREF - here because it cannot be numerically compared
                pronouns: data.get("pronouns"), //Maybe ABS PREF
                genderinclusive: data.get("genderinclusive")
            },
            prefsMinimized: { //Preferences that can be minimized by subtraction - all numerical values
                cleanliness: data.get("cleanliness"),
                noise: data.get("noise"),
                pplover: data.get("pplover"),
                visover: data.get("visover"),
                closeness: data.get("closeness"),
                social: data.get("social"),
                rushing: data.get("rushing"),
                temperature: data.get("temperature"),
                waketime: (parseInt(data.get("waketime"))*60 + parseInt(data.get("waketime").slice(-2)))/144, //Minutes over 144 - between 0 and 10
                sleeptime: (parseInt(data.get("sleeptime"))*60 + parseInt(data.get("sleeptime").slice(-2)))/144 //Minutes over 144 - between 0 and 10
            }
        }
    }

    showMsg("Saving...", "resMsg", "info");

    user.update({
        data: {
            ...userData
        }
    }).then(u => {
        showMsg("Profile updated! Please <a onclick='doLogout()' href='#'>log out</a> and then log back in to update your matches.", "resMsg", "success");
        console.log("New user:", u);
    }).catch(err => {
        console.error("Error while trying to submit user data", err);
        showMsg("Error while updating profile - the user authentication has probably expired. Please <a href='/#login'>log back in</a> and return to this page.", "resMsg", "danger");
    });

}


//Delete a user account (after confirmation)
const doDelete = (e) => {
    if (prompt("Warning: this cannot be undone! Type 'delete' to permanently delete your account.").toLowerCase() == "delete") {
        fetch("/.netlify/functions/deleteuser", {
            headers: {
                Authorization: `Bearer ${user.token.access_token}`
            },
            credentials: "include"
        })
            .then((res) => res.json())
            .then((res) => {
                console.log("Response from API for account deletion:", res);
                alert("Account deleted. Redirecting to home...");
                window.setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            })
            .catch((err) => {
                console.log("Error while deleting account:", err);
                alert("Failed to delete account. Please submit a support ticket and we will manually delete it for you.");
            })
            
    }
}

//Validate bio length isn't too long and update UI accordingly
const onBioText = (e) => {
    let words = e.target.value.match(/\b[-?(\w+)?]+\b/gi);
    if (!words) return;
    document.querySelector("#bioCount").innerText = words.length;     //simul word counting
    let parent = document.getElementById("bioCount").parentNode;
    let len = words.length;
    parent.classList.toggle("text-success", len<=150);    //color changing, same with line 222
    parent.classList.toggle("text-danger", len>150);
    if (len >= 150 && e.which == 0x20) {
        e.preventDefault();
    }
}