window.onload = () => {
	document.querySelectorAll("textarea").forEach((ele) => {
        ele.oninput = (event) => {
            autoExpand(event.target);
        }
    });

	document.querySelector("#logoutBtn").onclick = doLogout;

	if (window.location.hash.includes("success")) {
		showMsg("Successfully sent message! We will get back to you soon.", "resMsg", "success");
	}
}