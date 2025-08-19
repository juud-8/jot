console.log("Jot app is running...");

// Supabase configuration from environment variables
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(function initJotApp() {
	// DOM elements
	const authContainer = document.getElementById("authContainer");
	const appContainer = document.getElementById("appContainer");
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");
	const showSignUpLink = document.getElementById("showSignUp");
	const showSignInLink = document.getElementById("showSignIn");
	const signOutBtn = document.getElementById("signOutBtn");
	const noteInput = document.getElementById("noteInput");
	const saveButton = document.getElementById("saveNoteBtn");
	const notesList = document.getElementById("notesList");

	if (!authContainer || !appContainer || !loginForm || !registerForm || 
		!showSignUpLink || !showSignInLink || !signOutBtn || !noteInput || 
		!saveButton || !notesList) {
		console.warn("Jot app: required elements not found");
		return;
	}

	// Auth state
	let currentUser = null;

	// Check for existing session
	async function checkSession() {
		const { data: { session }, error } = await supabase.auth.getSession();
		if (error) {
			console.error("Error checking session:", error);
			return;
		}
		
		if (session) {
			currentUser = session.user;
			console.log("User session found:", currentUser.email);
			showApp();
			loadNotes();
		} else {
			console.log("No session found, showing auth");
			showAuth();
		}
	}

	// Show auth forms
	function showAuth() {
		authContainer.classList.remove("hidden");
		appContainer.classList.add("hidden");
	}

	// Show app
	function showApp() {
		authContainer.classList.add("hidden");
		appContainer.classList.remove("hidden");
	}

	// Load notes from Supabase
	async function loadNotes() {
		if (!currentUser) return;

		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.eq('user_id', currentUser.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error("Error loading notes:", error);
			return;
		}

		renderNotes(data || []);
	}

	// Render notes
	function renderNotes(notes) {
		console.log("Rendering notes", { count: notes.length });
		notesList.innerHTML = "";
		notes.forEach((note) => {
			const li = document.createElement("li");
			li.className = "note-item";
			
			const contentSpan = document.createElement("span");
			contentSpan.className = "note-content";
			contentSpan.textContent = note.content;
			
			const deleteBtn = document.createElement("button");
			deleteBtn.className = "delete-btn";
			deleteBtn.textContent = "×";
			deleteBtn.setAttribute("aria-label", "Delete note");
			deleteBtn.onclick = () => deleteNote(note.id);
			
			li.appendChild(contentSpan);
			li.appendChild(deleteBtn);
			notesList.appendChild(li);
		});
	}

	// Save note to Supabase
	async function saveNote(content) {
		if (!currentUser) return;

		const { data, error } = await supabase
			.from('notes')
			.insert([
				{
					user_id: currentUser.id,
					content: content
				}
			])
			.select();

		if (error) {
			console.error("Error saving note:", error);
			return;
		}

		console.log("Note saved:", data[0]);
		loadNotes(); // Reload all notes
	}

	// Delete note from Supabase
	async function deleteNote(noteId) {
		if (!currentUser) return;

		const { error } = await supabase
			.from('notes')
			.delete()
			.eq('id', noteId)
			.eq('user_id', currentUser.id);

		if (error) {
			console.error("Error deleting note:", error);
			return;
		}

		console.log("Note deleted:", noteId);
		loadNotes(); // Reload all notes
	}

	// Auth event listeners
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const email = document.getElementById("loginEmail").value;
		const password = document.getElementById("loginPassword").value;

		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});

		if (error) {
			console.error("Login error:", error);
			alert("Login failed: " + error.message);
			return;
		}

		currentUser = data.user;
		console.log("User logged in:", currentUser.email);
		showApp();
		loadNotes();
	});

	registerForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const email = document.getElementById("signUpEmail").value;
		const password = document.getElementById("signUpPassword").value;

		const { data, error } = await supabase.auth.signUp({
			email: email,
			password: password
		});

		if (error) {
			console.error("Sign up error:", error);
			alert("Sign up failed: " + error.message);
			return;
		}

		currentUser = data.user;
		console.log("User signed up:", currentUser.email);
		showApp();
		loadNotes();
	});

	signOutBtn.addEventListener("click", async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Sign out error:", error);
			return;
		}

		currentUser = null;
		console.log("User signed out");
		showAuth();
		notesList.innerHTML = "";
	});

	// Toggle between sign in and sign up forms
	showSignUpLink.addEventListener("click", (e) => {
		e.preventDefault();
		document.getElementById("authForm").classList.add("hidden");
		document.getElementById("signUpForm").classList.remove("hidden");
	});

	showSignInLink.addEventListener("click", (e) => {
		e.preventDefault();
		document.getElementById("signUpForm").classList.add("hidden");
		document.getElementById("authForm").classList.remove("hidden");
	});

	// Note saving
	saveButton.addEventListener("click", async () => {
		const text = noteInput.value.trim();
		console.log("Save clicked", { textLength: text.length });
		if (!text) {
			console.log("Ignored empty note");
			return;
		}
		
		await saveNote(text);
		noteInput.value = "";
		noteInput.focus();
	});

	// Listen for auth state changes
	supabase.auth.onAuthStateChange((event, session) => {
		console.log("Auth state changed:", event, session?.user?.email);
		if (event === 'SIGNED_IN' && session) {
			currentUser = session.user;
			showApp();
			loadNotes();
		} else if (event === 'SIGNED_OUT') {
			currentUser = null;
			showAuth();
			notesList.innerHTML = "";
		}
	});

	// Initialize app
	checkSession();
	console.log("Jot app initialized");
})();


