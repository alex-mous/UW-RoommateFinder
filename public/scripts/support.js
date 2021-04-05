window.onload = () => {
	document.querySelectorAll("textarea").forEach((ele) => {
        ele.oninput = (event) => {
            autoExpand(event.target);
        }
    });

	document.querySelector("#logoutBtn").onclick = doLogout;
}