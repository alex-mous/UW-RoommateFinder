// user, auth defined in main

window.onload = () => {
    if (user != null) document.querySelectorAll(".no-auth, .auth-only").forEach(ele => ele.classList.toggle("d-none"));

    checkConfirmation(window.location.hash);

    document.querySelectorAll(".login-btn").forEach(btn => {
        btn.onclick = () => showForms(false);
    });

    document.querySelectorAll(".logout-btn").forEach(btn => {
        btn.onclick = doLogout;
    });

    document.querySelector("#signupBtn").onclick = () => showForms(true);

    document.querySelector("#showSignUpLink").onclick = () => showForms(true);
    document.querySelector("#showLoginLink").onclick = () => showForms(false);

    document.querySelector("#formClose").onclick = () => showForms(true, false);

    document.querySelector("#loginForm").onsubmit = doLogin;
    document.querySelector("#signupForm").onsubmit = doSignup;
}

//Check if there is a confirmation token to process or if there is any hash that needs to be addressed (including confirmed state after email fully confirmed)
const checkConfirmation = (hash) => {
    if (hash.includes("confirmation_token")) {
        showForms(true);
        showMsg(`<b>Confirming email address...</b>`, "signupMsg", "info");
        let token = hash.slice(hash.indexOf("confirmation_token=")+19);
        console.log("Attempting to confirm user with confirmation token");
        auth.confirm(token, true)
            .then(() => {
                window.location.hash = "#confirmed";
                window.location.reload();
            })
            .catch((err) => {
                showMsg(`<b>Error while confirming email address.</b> ${err.json.msg}.`, "signupMsg", "danger");
                console.log("Error while confirming: ")
                console.dir(err);
            });
    } else if (hash.includes("confirmed")) {
        showForms(true);
        showMsg(`<b>Successfully confirmed your email!</b> You will now be redirected to <a href="/dashboard">your Dashboard</a> in a few seconds`, "signupMsg", "info");
        console.log("User successfully confirmed!");
        window.setTimeout(() => {
            window.location.href = "/dashboard";
        }, 3000);
    }
}

//Show the login or signup form for the user (shows signup form is signUp is true)
const showForms = (signUp, show=true) => {
    document.querySelector("#signupForm").classList.toggle("d-none", !signUp);
    document.querySelector("#loginForm").classList.toggle("d-none", signUp);
    document.querySelector("#formFloat").classList.toggle("d-none", !show);
    document.querySelector("#main").classList.toggle("blurred", show);
}

//Attempt to sign up the user given the form data
const doSignup = (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    showMsg("<b>Loading...</b>", "signupMsg", "info");
    if (data.get("password") != data.get("passwordverify")) {
        showMsg(`<b>Error!</b> Passwords do not match`, "signupMsg", "danger");
    }
    auth.signup(data.get("email"), data.get("password"))
        .then((resp) => {
            console.log("Received API response for sign up: ", resp);
            showMsg("<b>Success!</b> Please check your email for a link to verify your account before continuing.", "signupMsg", "success");
        })
        .catch((err) => {
            console.log("Error received: API response for sign up: ");
            console.dir(err);
            if (err.json.error_description) showMsg(`<b>Error while signing up!</b> ${err.json.error_description}`, "signupMsg", "danger");
            else showMsg(`<b>Error while signing up!</b> ${err.json.msg}. It's likely that this means that you are not using a UW email address.`, "signupMsg", "danger");
        });
}

//Attempt to login the user given the form data
const doLogin = (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    showMsg("<b>Loading...</b>", "loginMsg", "info");
    auth.login(data.get("email"), data.get("password"), data.get("persist") == "y")
        .then((resp) => {
            console.log("Received API response for login: ", resp);
            showMsg("<b>Success!</b> You'll be redirected to <a href='/dashboard'>your Dashboard</a> in a few seconds.", "loginMsg", "success");
            window.setTimeout(() => {
                window.location.href = "/dashboard";
            }, 3000);
        })
        .catch((err) => {
            console.log("Error received: API response for login: ");
            console.dir(err);
            showMsg(`<b>Error while logging in!</b> ${err.json.error_description||err.json.msg}`, "loginMsg", "danger");
        });
}