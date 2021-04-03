// auth, user defined in main

window.onload = () => {
    if (user == null) window.location.href = "/" //Exit page if not logged in

    document.querySelector("#profileForm").onsubmit = doUpdate;
    document.querySelector("#logoutBtn").onclick = doLogout;

    let bioText = document.querySelector("textarea[name='bio']");
    bioText.onkeydown = onBioText;

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
                hall: data.get("residence")
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
            }
        }
    }

    showMsg("Saving...", "resMsg", "info");

    auth.currentUser().update({
        data: {
            ...user
        }
    }).then(u => {
        showMsg("Profile updated!", "resMsg", "success")
        console.log("User:", u);
    });

}

//Load all of the form data from user memory (precondition - user is logged in)
const loadForm = () => {
    let userData = user.user_metadata;
    if (!userData?.listing) return;
    document.querySelector("input[name='name']").value = userData.listing.name;
    document.querySelector("input[name='email']").value = userData.listing.email;
    document.querySelector("textarea[name='bio']").value = userData.listing.bio;
    onBioText({
        target: document.querySelector("textarea[name='bio']"),
        which: 0x20,
        preventDefault: () => {}
    })

    if (userData.profile.prefsRanked.country != null) {
        let yesBx = document.querySelector("input[name='countrymatch'][value='y']");
        yesBx.checked = true;
        document.querySelector("input[name='countrymatch']").onchange({
            target: yesBx
        });
        let countrySelect = document.querySelector("select[name='country']");
        countrySelect.value = userData.profile.prefsRanked.country;
        if (userData.profile.prefsRanked.state) {
            let stateSelect = document.querySelector("select[name='state']");
            stateSelect.value = userData.profile.prefsRanked.state;
            countrySelect.onchange({
                target: countrySelect
            });
        }
    } else {
        document.querySelector("input[name='countrymatch'][value='n']").checked = true;
    }

    document.querySelector(`input[name='pronouns'][value='${userData.profile.prefsAbs.pronouns}']`).checked = true;
    document.querySelector(`input[name='social'][value='${userData.profile.prefsMinimized.social}']`).checked = true;

    document.querySelector("select[name='closeness']").value = userData.profile.prefsMinimized.closeness;
    document.querySelector("select[name='major']").value = userData.profile.prefsRanked.major;
    document.querySelector("select[name='campus']").value = userData.profile.prefsRanked.location;
    document.querySelector("select[name='residence']").value = userData.profile.prefsRanked.hall;
    document.querySelector("select[name='temperature']").value = userData.profile.prefsMinimized.temperature;
    document.querySelector("select[name='cleanliness']").value = userData.profile.prefsMinimized.cleanliness;
    document.querySelector("select[name='noise']").value = userData.profile.prefsMinimized.noise;
    document.querySelector("select[name='pplover']").value = userData.profile.prefsMinimized.pplover;
    document.querySelector("select[name='visover']").value = userData.profile.prefsMinimized.visover;
    document.querySelector("select[name='sport']").value = userData.profile.prefsRanked.sport;
    document.querySelector("select[name='ideology1']").value = userData.profile.prefsRanked.ideology.al;
    document.querySelector("select[name='ideology2']").value = userData.profile.prefsRanked.ideology.lr;

    document.querySelector(`input[name='rushing'][value='${userData.profile.prefsMinimized.rushing}']`).checked = true;
    document.querySelector(`input[name='drink'][value='${userData.profile.prefsAbs.drink.me}']`).checked = true;
    document.querySelector(`input[name='drinkr'][value='${userData.profile.prefsAbs.drink.you}']`).checked = true;
    document.querySelector(`input[name='vape'][value='${userData.profile.prefsAbs.vape.me}']`).checked = true;
    document.querySelector(`input[name='vaper'][value='${userData.profile.prefsAbs.vape.you}']`).checked = true;
    document.querySelector(`input[name='smoke'][value='${userData.profile.prefsAbs.smoke.me}']`).checked = true;
    document.querySelector(`input[name='smoker'][value='${userData.profile.prefsAbs.smoke.you}']`).checked = true;
    document.querySelector(`input[name='weed'][value='${userData.profile.prefsAbs.weed.me}']`).checked = true;
    document.querySelector(`input[name='weedr'][value='${userData.profile.prefsAbs.weed.you}']`).checked = true;

    if (userData.profile.prefsRanked.interests) {
        for (let opt of document.querySelector("select[name='interests']").options) {
            if (userData.profile.prefsRanked.interests.includes(opt.value)) opt.selected = true;
            else opt.selected = false;
        }
    }

    let lgbtqRad = document.querySelector(`input[name='lgbtq'][value='${userData.profile.prefsRanked.lgbtq || "n"}']`);
    lgbtqRad.checked = true;
    document.querySelector("input[name='lgbtq']").onchange({
            target: lgbtqRad
    });
    if (userData.profile.prefsRanked.lgbtq == "y") document.querySelector(`input[name='lgbtqpref'][value='${userData.profile.prefsAbs.lgbtq}']`).checked = true;

    let ideologyRad = document.querySelector(`input[name='ideologyr'][value='${userData.profile.prefsRanked.ideology.rank}']`);
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

    setTime("waketime", userData.profile.prefsMinimized.waketime);
    setTime("sleeptime", userData.profile.prefsMinimized.sleeptime);
}

//Validate bio length isn't too long and update UI accordingly
const onBioText = (e) => {
    let words = e.target.value.match(/\b[-?(\w+)?]+\b/gi);
    if (!words) return;
    document.querySelector("#bioCount").innerText = words.length;     //simul word counting
    let parent = document.getElementById("bioCount").parentNode;
    let len = words.length;
    parent.classList.toggle("text-success", len<=150);    //color changing, same with line 222,
    parent.classList.toggle("text-danger", len>150);
    if (len >= 150 && e.which == 0x20) {
        e.preventDefault();
    }
}
