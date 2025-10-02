import  httpRequest  from "./utils/httpRequest.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const authModal = document.getElementById("authModal");
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");
    const homeBtn = document.querySelector(".home-btn");
    const errorText = document.querySelector(".error-text");
    const errorMessage = document.querySelector(".error-message");
    const controlBtn = document.querySelector(".control-btn");
    //tooltips functionality

    // home button functionality
    homeBtn.addEventListener("click", function () {
        window.location.href = "index.html"; // Redirect to homepage
    });
    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
    }
    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal);

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm();
    });
    // ...existing code...
    const togglePassword = document.querySelector("#togglePassword");
    const password = document.querySelector("#signupPassword");
    if (togglePassword && password) {
        togglePassword.addEventListener("click", function () {
            if (password.type === "password") {
                password.type = "text";
                togglePassword.classList.remove("fa-eye");
                togglePassword.classList.add("fa-eye-slash");
            } else {
                password.type = "password";
                togglePassword.classList.remove("fa-eye-slash");
                togglePassword.classList.add("fa-eye");
            }
        });
    }

    // Signup form submission
    signupForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = e.target.querySelector("#signupEmail").value;
        const password = e.target.querySelector("#signupPassword").value;
        const credentials = {
            username: email.split("@")[0],
            email,
            password,
        };

        // Nếu mật khẩu và email được focus thì ẩn error message
        e.target.querySelector("#signupEmail").addEventListener("focus", () => {
            errorMessage.style.display = "none";
        });
        e.target.querySelector("#signupPassword").addEventListener("focus", () => {
            errorMessage.style.display = "none";
        });
        /////////////////////////////////////////////////////////////////////
        try {
            const {user,access_token} = await httpRequest.post("auth/register", credentials);
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("currentuser", user);
            updateCurrentUser(user);
            closeModal();
            errorMessage.style.display = "none";
            
        } catch (error) {
            if (error?.response?.error?.code === "EMAIL_EXISTS") {
                console.error(error.response.error.message);
                errorMessage.style.display = "flex";
                errorText.textContent = "Email already exists";
            }

        }
    });
});


// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show");
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
        }
    });

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show");

        console.log("Logout clicked");
        // TODO: Students will implement logout logic here
    });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = document.querySelector(".auth-buttons");
    const userInfo = document.querySelector(".user-info");
try {
    const {user} = await httpRequest.get("users/me");
    updateCurrentUser(user)
    userInfo.classList.add("show");
} catch (error) {
    authButtons.classList.add("show");
}
});
function updateCurrentUser(user) {
    const userName = document.getElementById("user-name");
    const userAvatarImg = document.getElementById("user-avatar");
        if (user.avatar_url) {
        userAvatarImg.src = user.avatar_url;
    }
    if (user.username) {
        userName.textContent = user.username;
    }
}
// hiển thị popular artists
async function fetchAndRenderTrendingArtists() {
  try {
    const artistsSection = document.querySelector(".artists-section")
    const artistsGrid = artistsSection.querySelector(".artists-grid")

    // Show loading state
    artistsGrid.innerHTML = '<div class="loading">Loading artists...</div>'

    // Fetch trending artists from API
    const response = await httpRequest.get("artists?limit=20&offset=0")
    const artists = response.artists || []

    // Clear loading state
    artistsGrid.innerHTML = ""

    // Render each artist
    artists.forEach((artist) => {
      const artistCard = createArtistCard(artist)
      artistsGrid.appendChild(artistCard)
    })
  } catch (error) {
    console.error("Error fetching trending artists:", error)
    const artistsGrid = document.querySelector(".artists-grid")
    artistsGrid.innerHTML = '<div class="error">Failed to load artists. Please try again later.</div>'
  }
}

function createArtistCard(artist) {
  const card = document.createElement("div")
  card.className = "artist-card"

  card.innerHTML = `
    <div class="artist-card-cover">
      <img
        src="${artist.image_url || "placeholder.svg?height=160&width=160"}"
        alt="${artist.name}"
      />
      <button class="artist-play-btn">
        <i class="fas fa-play"></i>
      </button>
    </div>
    <div class="artist-card-info">
      <h3 class="artist-card-name">${artist.name}</h3>
      <p class="artist-card-type">Artist</p>
    </div>
  `

  return card
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTrendingArtists()
})
//hiển thị popular hits
async function fetchAndRenderPopularTracks() {
  try {
    const popularSection = document.querySelector(".popular-section")
    const trackList = popularSection.querySelector(".track-list")

    // Show loading state
    trackList.innerHTML = '<div class="loading">Loading tracks...</div>'

    // Fetch popular tracks from API
    const response = await httpRequest.get("playlists?limit=20&offset=0")
    const tracks = response.tracks || []

    // Clear loading state
    trackList.innerHTML = ""

    // Render each track
    tracks.forEach((track, index) => {
      const trackItem = createTrackItem(track, index + 1)
      trackList.appendChild(trackItem)
    })
  } catch (error) {
    console.error("Error fetching popular tracks:", error)
    const trackList = document.querySelector(".track-list")
    trackList.innerHTML = '<div class="error">Failed to load tracks. Please try again later.</div>'
  }
}

function createTrackItem(track, position) {
  const item = document.createElement("div")
  item.className = "track-item"

  // Format duration from seconds to MM:SS
  const duration = formatDuration(track.duration)

  // Format play count with commas
  const playCount = formatNumber(track.play_count)

  item.innerHTML = `
    <div class="track-number">${position}</div>
    <div class="track-image">
      <img
        src="${track.image_url || "placeholder.svg?height=40&width=40"}"
        alt="${track.title}"
      />
    </div>
    <div class="track-info">
      <div class="track-name">${track.title}</div>
    </div>
    <div class="track-plays">${playCount}</div>
    <div class="track-duration">${duration}</div>
    <button class="track-menu-btn">
      <i class="fas fa-ellipsis-h"></i>
    </button>
  `

  return item
}

async function fetchAndRenderTodaysBiggestHits() {
  try {
    const hitsSection = document.querySelector(".hits-section")
    const hitsGrid = hitsSection.querySelector(".hits-grid")

    // Show loading state
    hitsGrid.innerHTML = '<div class="loading">Loading hits...</div>'

    // Fetch trending tracks from API
    const response = await httpRequest.get("tracks/trending?limit=20")
    const tracks = response.tracks || []

    // Clear loading state
    hitsGrid.innerHTML = ""

    // Render each track as a hit card
    tracks.forEach((track) => {
      const hitCard = createHitCard(track)
      hitsGrid.appendChild(hitCard)
    })
  } catch (error) {
    console.error("Error fetching today's biggest hits:", error)
    const hitsGrid = document.querySelector(".hits-grid")
    hitsGrid.innerHTML = '<div class="error">Failed to load hits. Please try again later.</div>'
  }
}

function createHitCard(track) {
  const card = document.createElement("div")
  card.className = "hit-card"

  card.innerHTML = `
    <div class="hit-card-cover">
      <img
        src="${track.image_url || "placeholder.svg?height=160&width=160"}"
        alt="${track.title}"
      />
      <button class="hit-play-btn">
        <i class="fas fa-play"></i>
      </button>
    </div>
    <div class="hit-card-info">
      <h3 class="hit-card-title">${track.title}</h3>
      <p class="hit-card-artist">${track.artist_name || "Unknown Artist"}</p>
    </div>
  `

  return card
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTodaysBiggestHits()
  fetchAndRenderTrendingArtists()
  fetchAndRenderPopularTracks()
})


