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
    } else if (hash.includes("recovery_token")) {
        document.querySelector("#resetForm").classList.remove("d-none");
        document.querySelector("#formFloat").classList.remove("d-none");
        document.querySelector("#main").classList.add("blurred");
        let token = hash.slice(hash.indexOf("recovery_token=")+15);
        showMsg(`Confirming reset token...`, "resetMsg", "info");
        auth.recover(token, true)
            .then((resp) => {
                console.log("Recovery token confirmed", resp);
                user = resp;
                showMsg(`Reset token confirmed! Please enter a new password.`, "resetMsg", "success");
            })
            .catch((err) => {
                console.error("Error while confirming reset", err);
                showMsg(`<b>Error while confirming reset link!</b> The link probably expired. Please request <a href="/">a new one</a>`, "resetMsg", "danger");
            });
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
        return;
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

//Attempt to reset the user's password
const doPasswordReset = (e) => {
    e.preventDefault();
    let email = (new FormData(document.querySelector("#loginForm"))).get("email");
    if (!email) {
        showMsg(`<b>Enter an email before requesting a password reset!</b>`, "loginMsg", "danger");
        return;
    }
    showMsg(`Sending reset email...`, "loginMsg", "info");
    auth.requestPasswordRecovery(email)
        .then((resp) => {
            console.log("Recovery email sent", resp);
            showMsg("<b>Recovery email sent!</b> Please click the link in the email to enter a new password", "loginMsg", "success");
        })
        .catch((err) => {
            console.err("Error while sending password reset email", err);
            showMsg(`<b>Error while trying to reset password!</b> Error provided: ${err.json.error_description||err.json.msg}`, "loginMsg", "danger");
        })
}

//Attempt to confirm the reset for the user's password
const doPasswordResetConfirm = (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    if (data.get("password") != data.get("passwordverify")) {
        showMsg(`<b>Error!</b> Passwords do not match.`, "resetMsg", "danger");
        return;
    }
    user.update({ password: data.get("password") })
        .then((resp) => {
            console.log("Password updated", resp);
            showMsg("<b>Password reset!</b> You will be redirected to home in a few seconds...", "resetMsg", "success");
            window.setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        })
        .catch((err) => {
            console.err("Error while resetting password", err);
            showMsg(`<b>Error while resetting password!</b> Please try again. Error provided: ${err.json.error_description||err.json.msg}`, "resetMsg", "danger");
        });
}






//Main methods
// user, auth defined in main

if (user != null) document.querySelectorAll(".no-auth, .auth-only").forEach(ele => ele.classList.toggle("d-none"));

checkConfirmation(window.location.hash);

document.querySelector(".navbar-toggler").onclick = () => { //Blur background
    document.querySelector("#main").classList.toggle("blurred");
}

document.querySelectorAll(".login-btn").forEach(btn => {
    btn.onclick = () => showForms(false);
});

document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.onclick = doLogout;
});

document.querySelector("#signupBtn").onclick = () => showForms(true);

document.querySelector("#showSignUpLink").onclick = () => showForms(true);
document.querySelector("#showLoginLink").onclick = () => showForms(false);

document.querySelector("#sendResetEmail").onclick = doPasswordReset;

document.querySelector("#formClose").onclick = () => showForms(true, false);

document.querySelector("#loginForm").onsubmit = doLogin;
document.querySelector("#signupForm").onsubmit = doSignup;
document.querySelector("#resetForm").onsubmit = doPasswordResetConfirm;

window.matchMedia("(min-width: 992px)").onchange = () => {
    if (window.innerWidth > 992) {
        if (document.querySelector("#main").classList.contains("blurred")) {
            document.querySelector(".navbar-toggler").click();
        }
    }
}