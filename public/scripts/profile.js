let auth;

window.onload = () => {
    //Initialize auth
    auth = new GoTrue({
        APIUrl: "https://roommatematcher.netlify.app/.netlify/identity",
        audience: "",
        setCookie: false
    });
    let usr = auth.currentUser();

    if (usr == null) { //Exit page if not logged in
        window.location.href = "/"
    }

    console.log("User logged in!");
    document.querySelector("#logoutBtn").onclick = doLogout;
    document.querySelector("#profileForm").onsubmit = doUpdate;

    document.querySelector("textarea[name='bio']").onkeyup = (e) => {
        document.querySelector("#bioCount").innerText = e.srcElement.value.split(" ").length;
        if (e.srcElement.value.split(" ").length >= 150 && e.which >= 0x20) {
            e.preventDefault();
        }
    }

    document.querySelectorAll("input[name='countrymatch']").forEach((ele) => {
        ele.onchange = (e) => {
            document.querySelector("#f-country").classList.toggle("full-height", e.target.value == "y");
            document.querySelectorAll("#f-country select, #f-state select").forEach(inpt => inpt.disabled = e.target.value != "y");
        }
    });

    document.querySelector("select[name='country']").onchange = (e) => {
        document.querySelector("#f-state").classList.toggle("full-height", e.target.value == "United States");
        document.querySelector("#f-state select").disabled = e.target.value != "United States";
    }

    document.querySelectorAll("input[name='lgbtq']").forEach((ele) => {
        ele.onchange = (e) => {
            document.querySelector("#f-lgbtq").classList.toggle("full-height", e.target.value != "n");
            document.querySelectorAll("#f-lgbtq input").forEach(inpt => inpt.disabled = e.target.value == "n");
        }
    });

    document.querySelectorAll("input[name='ideologyr']").forEach((ele) => {
        ele.onchange = (e) => {
            document.querySelector("#f-ideology").classList.toggle("full-height", e.target.value > 0);
            document.querySelectorAll("#f-ideology select").forEach(inpt => inpt.disabled = e.target.value == 0);
        }
    });

    loadForm();
}

//Logout the current user
const doLogout = () => {
    if (!auth.currentUser()) return;
    auth.currentUser().logout()
        .then(() => {
            window.setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        })
        .catch((err) => {
            console.log("Error while attempting to log out: ")
            console.dir(err);
        });
}

const doUpdate = (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    /*
    Ranking system:
        Absolute prefs will have +1000 points (so yes = 1000, maybe = 500, no = 0) as they're very important
        Minimized prefs will be weighted as +10 points each
        Ranked prefs are less important and will be ranked +5 points each  (plus more in the case of multiple of the same in multi-selects)
            Except for ideology, in which case it will be 10 points for somewhat care and 1000 points for extremely important (equivalent to absolute)
    */
    let user = {
        listing: {
            name: data.get("name"),
            email: data.get("email"),
            bio: data.get("bio")
        },
        profile: {
            prefsAbs: { //Absolute "deal-breakers", such as smoking/no smoking
            //Numeric - can be subtracted
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
                },
                lgbtq: data.get("lgbtqpref"),
            //Ternary or more
                pronouns: data.get("pronouns"),
                

            },
            prefsRanked: { //Preferences that are preferrable if they exists, but not like flags and are not subtractable like Minimized ones
                country: data.get("country"), //May be null
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
                lgbtq: data.get("lgbtq"),
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
                waketime: parseInt(data.get("waketime"))*60 + parseInt(data.get("waketime").slice(-2)), //Minutes
                sleeptime: parseInt(data.get("sleeptime"))*60 + parseInt(data.get("sleeptime").slice(-2)) //Minutes
            },
        }
    }
    showMsg("Updating your profile...", "resMsg", "info")
    auth.currentUser().update({
        data: {
            ...user
        }
    }).then((u) => {
        console.log("User now: ", u);
        showMsg("Successfully updated your profile!", "resMsg", "success");
    });

}

//Load all of the form data from user memory (precondition - user is logged in)
const loadForm = () => {
    let user = auth.currentUser().user_metadata;
    document.querySelector("input[name='name']").value = user.listing.name;
    document.querySelector("input[name='email']").value = user.listing.email;
    document.querySelector("textarea[name='bio']").value = user.listing.bio;
    document.querySelector("#bioCount").value = user.listing.bio.split(" ").length;

    if (user.profile.prefsRanked.country != null) {
        let yesBx = document.querySelector("input[name='countrymatch'][value='y']");
        yesBx.checked = true;
        document.querySelector("input[name='countrymatch']").onchange({
            target: yesBx
        });
        let countrySelect = document.querySelector("select[name='country']");
        countrySelect.value = user.profile.prefsRanked.country;
        if (user.profile.prefsRanked.state) {
            let stateSelect = document.querySelector("select[name='state']");
            stateSelect.value = user.profile.prefsRanked.state;
            countrySelect.onchange({
                target: countrySelect
            });
        }
    } else {
        document.querySelector("input[name='countrymatch'][value='n']").checked = true;
    }

    document.querySelector(`input[name='pronouns'][value='${user.profile.prefsAbs.pronouns}']`).checked = true;
    document.querySelector(`input[name='social'][value='${user.profile.prefsMinimized.social}']`).checked = true;

    document.querySelector("select[name='closeness']").value = user.profile.prefsMinimized.closeness;
    document.querySelector("select[name='major']").value = user.profile.prefsRanked.major;
    document.querySelector("select[name='campus']").value = user.profile.prefsRanked.location;
    document.querySelector("select[name='residence']").value = user.profile.prefsRanked.hall;
    document.querySelector("select[name='temperature']").value = user.profile.prefsMinimized.temperature;
    document.querySelector("select[name='cleanliness']").value = user.profile.prefsMinimized.cleanliness;
    document.querySelector("select[name='noise']").value = user.profile.prefsMinimized.noise;
    document.querySelector("select[name='pplover']").value = user.profile.prefsMinimized.pplover;
    document.querySelector("select[name='visover']").value = user.profile.prefsMinimized.visover;
    document.querySelector("select[name='sport']").value = user.profile.prefsRanked.sport;
    document.querySelector("select[name='ideology1']").value = user.profile.prefsRanked.ideology.al;
    document.querySelector("select[name='ideology2']").value = user.profile.prefsRanked.ideology.lr;

    document.querySelector(`input[name='rushing'][value='${user.profile.prefsMinimized.rushing}']`).checked = true;
    document.querySelector(`input[name='drink'][value='${user.profile.prefsAbs.drink.me}']`).checked = true;
    document.querySelector(`input[name='drinkr'][value='${user.profile.prefsAbs.drink.you}']`).checked = true;
    document.querySelector(`input[name='vape'][value='${user.profile.prefsAbs.vape.me}']`).checked = true;
    document.querySelector(`input[name='vaper'][value='${user.profile.prefsAbs.vape.you}']`).checked = true;
    document.querySelector(`input[name='smoke'][value='${user.profile.prefsAbs.smoke.me}']`).checked = true;
    document.querySelector(`input[name='smoker'][value='${user.profile.prefsAbs.smoke.you}']`).checked = true;
    document.querySelector(`input[name='weed'][value='${user.profile.prefsAbs.weed.me}']`).checked = true;
    document.querySelector(`input[name='weedr'][value='${user.profile.prefsAbs.weed.you}']`).checked = true;

    for (let opt of document.querySelector("select[name='interests']").options) {
        if (user.profile.prefsRanked.interests.includes(opt.value)) opt.selected = true;
        else opt.selected = false;
    }

    let lgbtqRad = document.querySelector(`input[name='lgbtq'][value='${user.profile.prefsRanked.lgbtq}']`);
    lgbtqRad.checked = true;
    document.querySelector("input[name='lgbtq']").onchange({
            target: lgbtqRad
    });
    if (user.profile.prefsRanked.lgbtq == "y") document.querySelector(`input[name='lgbtqpref'][value='${user.profile.prefsAbs.lgbtq}']`).checked = true;

    let ideologyRad = document.querySelector(`input[name='ideologyr'][value='${user.profile.prefsRanked.ideology.rank}']`);
    ideologyRad.checked = true;
    document.querySelector("input[name='ideologyr']").onchange({
            target: ideologyRad
    });

    let setTime = (name, time) => {
        let hrs = Math.floor(time/60);
        if (hrs < 10) hrs = `0${hrs}`;
        let mins = time%60;
        if (mins < 10) mins = `0${mins}`; //Pad in case not correct format
        document.querySelector(`input[name='${name}']`).value = `${hrs}:${mins}`;
    }

    setTime("waketime", user.profile.prefsMinimized.waketime);
    setTime("sleeptime", user.profile.prefsMinimized.sleeptime);

}

//Show or clear a message. htmlMsg store the html to be displayed. blockId is the ID of the element to target. type is the text type (info/success/warn/danger)
const showMsg = (htmlMsg, blockId, type) => {
    let msgBlock = document.querySelector(`#${blockId}`);
    msgBlock.classList = [`text-${type}`];
    msgBlock.innerHTML = htmlMsg;
}