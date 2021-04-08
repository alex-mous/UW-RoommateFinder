//------------ Global Setup

//Initialize auth
const auth = new GoTrue({
    APIUrl: "https://roommatefinder.netlify.app/.netlify/identity",
    audience: "",
    setCookie: true
});
let user = auth.currentUser();

if (user != null) { //Toggle conditional display elements
    console.log("User logged in: ", user);
    document.querySelectorAll(".no-auth, .auth-only").forEach(ele => ele.classList.toggle("d-none"));
}



window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-LTP9LT2JKC');

//------------ Global Methods

//Show or clear a message. htmlMsg store the html to be displayed. blockId is the ID of the element to target. type is the text type (info/success/warn/danger)
const showMsg = (htmlMsg, blockId, type) => {
    let msgBlock = document.querySelector(`#${blockId}`);
    if (!msgBlock) return;
    msgBlock.classList = [`text-${type}`];
    msgBlock.innerHTML = htmlMsg;
}

//Set the color mode of the page
const setMode = (light) => {
    let root = document.documentElement;
    root.style.setProperty("--blue", light ? "#005aff" : "#4184ff");
    root.style.setProperty("--pink", light ? "#e83e8c" : "#df679f");
    root.style.setProperty("--red", light ? "#e50f23" : "#d62537");
    root.style.setProperty("--yellow", light ? "#ffc107" : "#ffd24b");
    root.style.setProperty("--green", light ? "#218137" : "#35a04e");
    root.style.setProperty("--cyan", light ? "#007f93" : "#27a0b3");
    root.style.setProperty("--white", light ? "#fff" : "#141618");
    root.style.setProperty("--gray", light ? "#6c757d" : "#827f7c");
    root.style.setProperty("--gray-dark", light ? "#343a40" : "#adaaa6");
}

//Logout the current user
const doLogout = () => {
    if (!user) return;
    showMsg("Logging out...", "warnMsg", "info");
    user.logout()
        .then(() => {
            showMsg("Logged out! Reloading in a few seconds...", "warnMsg", "success");
            window.setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        })
        .catch((err) => {
            showMsg("<b>Error while logging out.</b> Please check the console.", "warnMsg", "danger");
            console.log("Error while attempting to log out: ")
            console.dir(err);
        });
}

//Auto expand a text area
const autoExpand = (field) => {
	// Reset field height
	field.style.height = 'inherit';

	// Get the computed styles for the element
	var computed = window.getComputedStyle(field);

	// Calculate the height
	var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	field.style.height = height + 'px';

}


//Load all of the form data from user memory
const loadForm = (userData, actualUser) => {

    //Form setup
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
            document.querySelector("#f-lgbtq").classList.toggle("full-height", e.target.value == "y");
            document.querySelectorAll("#f-lgbtq input").forEach(inpt => inpt.disabled = e.target.value != "y");
        }
    });

    document.querySelectorAll("input[name='ideologyr']").forEach((ele) => {
        ele.onchange = (e) => {
            document.querySelector("#f-ideology").classList.toggle("full-height", e.target.value > 0);
            document.querySelectorAll("#f-ideology select").forEach(inpt => inpt.disabled = e.target.value == 0);
        }
    });

    document.querySelectorAll("textarea").forEach((ele) => {
        ele.oninput = (event) => {
            autoExpand(event.target);
        }
    });


    if (!userData?.listing) return;
    document.querySelector("input[name='name']").value = userData.listing.name;
    document.querySelector("input[name='email']").value = userData.listing.email;
    document.querySelector("textarea[name='bio']").value = userData.listing.bio;
    if (actualUser) document.querySelector(`input[name='public'][value='${userData.listing.public || "n"}']`).checked = true;

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

    document.querySelector(`input[name='pronouns'][value='${userData.profile.prefsRanked.pronouns}']`).checked = true;
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
    document.querySelector(`input[name='genderinclusive'][value='${userData.profile.prefsRanked.genderinclusive || "n"}']`).checked = true;

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
    if (userData.profile.prefsRanked.lgbtq == "y") document.querySelector(`input[name='lgbtqpref'][value='${userData.profile.prefsRanked.lgbtqpref}']`).checked = true;

    let ideologyRad = document.querySelector(`input[name='ideologyr'][value='${userData.profile.prefsRanked.ideology.rank}']`);
    ideologyRad.checked = true;
    document.querySelector("input[name='ideologyr']").onchange({
            target: ideologyRad
    });

    let setTime = (name, time) => {
        let hrs = Math.floor(12*time/5);
        if (hrs < 10) hrs = `0${hrs}`;
        let mins = Math.round(12*time)%5;
        if (mins < 10) mins = `0${mins}`; //Pad in case not correct format
        document.querySelector(`input[name='${name}']`).value = `${hrs}:${mins}`;
    }

    setTime("waketime", userData.profile.prefsMinimized.waketime);
    setTime("sleeptime", userData.profile.prefsMinimized.sleeptime);
}