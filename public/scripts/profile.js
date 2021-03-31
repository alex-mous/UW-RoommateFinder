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
        let words = e.srcElement.value.match(/\b[-?(\w+)?]+\b/gi);
        let elem = document.getElementById("#bioCount");
        document.querySelector("#bioCount").innerText = words.length;
        let len = words.length
        elem.classList.toggle("text-success", len<150);
        elem.classList.toggle("text-danger", len>=150);
        if (len >= 150 && e.which >= 0x20) {
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
    console.log(e.target);
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
                clubs: data.getAll("interests"),
                ideology: {
                    rank: data.get("ideologyr"),
                    lr: data.get("ideology1"),
                    al: data.get("ideology2")
                },
                location: data.get("campus"),
                hall: data.get("hall")
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
    auth.currentUser().update({
        data: {
            ...user
        }
    }).then(u => console.log(u));

}

//Load all of the form data from user memory (precondition - user is logged in)
const loadForm = () => {
    
}

//Show or clear a message. htmlMsg store the html to be displayed. blockId is the ID of the element to target. type is the text type (info/success/warn/danger)
const showMsg = (htmlMsg, blockId, type) => {
    let msgBlock = document.querySelector(`#${blockId}`);
    msgBlock.classList = [`text-${type}`];
    msgBlock.innerHTML = htmlMsg;
}
