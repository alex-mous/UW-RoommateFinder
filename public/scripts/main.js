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
}

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
    if (!auth.currentUser()) return;
    showMsg("Logging out...", "warnMsg", "info");
    auth.currentUser().logout()
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