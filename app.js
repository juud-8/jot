console.log("Jot app is running...");

(function initJotApp() {
	const noteInput = document.getElementById("noteInput");
	const saveButton = document.getElementById("saveNoteBtn");
	const notesList = document.getElementById("notesList");

	if (!noteInput || !saveButton || !notesList) {
		console.warn("Jot app: required elements not found");
		return;
	}

	/** @type {string[]} */
	const notes = [];

	function renderNotes() {
		console.log("Rendering notes", { count: notes.length });
		notesList.innerHTML = "";
		notes.forEach((text) => {
			const li = document.createElement("li");
			li.textContent = text;
			notesList.appendChild(li);
		});
	}

	saveButton.addEventListener("click", () => {
		const text = noteInput.value.trim();
		console.log("Save clicked", { textLength: text.length });
		if (!text) {
			console.log("Ignored empty note");
			return;
		}
		notes.push(text);
		console.log("Note added", { total: notes.length });
		renderNotes();
		noteInput.value = "";
		noteInput.focus();
	});

	console.log("Jot app initialized");
})();


