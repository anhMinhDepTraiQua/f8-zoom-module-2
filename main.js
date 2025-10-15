// đây là main.js
import httpRequest from "./utils/httpRequest.js"

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const spotifyIcon = document.querySelector(".logo")
  const signupBtn = document.querySelector(".signup-btn")
  const loginBtn = document.querySelector(".login-btn")
  const authModal = document.getElementById("authModal")
  const modalClose = document.getElementById("modalClose")
  const signupForm = document.getElementById("signupForm")
  const loginForm = document.getElementById("loginForm")
  const showLoginBtn = document.getElementById("showLogin")
  const showSignupBtn = document.getElementById("showSignup")
  const homeBtn = document.querySelector(".home-btn")
  const errorText = document.querySelector(".error-text")
  const errorMessage = document.querySelector(".error-message")

  // home button functionality
  spotifyIcon.addEventListener("click", () => {
    window.location.href = "index.html"
  })
  homeBtn.addEventListener("click", () => {
    window.location.href = "index.html"
  })

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block"
    loginForm.style.display = "none"
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none"
    loginForm.style.display = "block"
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", () => {
    showSignupForm()
    openModal()
  })

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", () => {
    showLoginForm()
    openModal()
  })

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal)

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      closeModal()
    }
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal()
    }
  })

  // Switch to Login form
  showLoginBtn.addEventListener("click", () => {
    showLoginForm()
  })

  // Switch to Signup form
  showSignupBtn.addEventListener("click", () => {
    showSignupForm()
  })

  const togglePassword = document.querySelector("#togglePassword")
  const password = document.querySelector("#signupPassword")
  if (togglePassword && password) {
    togglePassword.addEventListener("click", () => {
      if (password.type === "password") {
        password.type = "text"
        togglePassword.classList.remove("fa-eye")
        togglePassword.classList.add("fa-eye-slash")
      } else {
        password.type = "password"
        togglePassword.classList.remove("fa-eye-slash")
        togglePassword.classList.add("fa-eye")
      }
    })
  }

  // Signup form submission
  signupForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = e.target.querySelector("#signupEmail").value
    const password = e.target.querySelector("#signupPassword").value
    const credentials = {
      username: email.split("@")[0],
      email,
      password,
    }

    // Nếu mật khẩu và email được focus thì ẩn error message
    e.target.querySelector("#signupEmail").addEventListener("focus", () => {
      errorMessage.style.display = "none"
    })
    e.target.querySelector("#signupPassword").addEventListener("focus", () => {
      errorMessage.style.display = "none"
    })

    try {
      const { user, access_token } = await httpRequest.post("auth/register", credentials)
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("currentuser", JSON.stringify(user))
      updateCurrentUser(user)
      closeModal()
      errorMessage.style.display = "none"
    } catch (error) {
      if (error?.response?.error?.code === "EMAIL_EXISTS") {
        console.error(error.response.error.message)
        errorMessage.style.display = "flex"
        errorText.textContent = "Email already exists"
      }
    }
  })

  // Login form submission
  loginForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = e.target.querySelector("#loginEmail").value
    const password = e.target.querySelector("#loginPassword").value
    const credentials = {
      email,
      password,
    }

    const loginErrorMessage = loginForm.querySelector(".error-message")
    const loginErrorText = loginForm.querySelector(".error-text")

    // Hide error message when inputs are focused
    e.target.querySelector("#loginEmail").addEventListener("focus", () => {
      loginErrorMessage.style.display = "none"
    })
    e.target.querySelector("#loginPassword").addEventListener("focus", () => {
      loginErrorMessage.style.display = "none"
    })

    try {
      // Call login API endpoint
      const { user, access_token } = await httpRequest.post("auth/login", credentials)

      // Store authentication data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("currentuser", JSON.stringify(user))

      // Update UI to show user info
      const authButtons = document.querySelector(".auth-buttons")
      const userInfo = document.querySelector(".user-info")
      authButtons.classList.remove("show")
      userInfo.classList.add("show")

      // Close modal
      closeModal()
      loginErrorMessage.style.display = "none"

      console.log("Login successful")
    } catch (error) {
      console.error("Login failed:", error)

      // Show error message
      if (loginErrorMessage && loginErrorText) {
        loginErrorMessage.style.display = "flex"
        if (error?.response?.error?.message) {
          loginErrorText.textContent = error.response.error.message
        } else {
          loginErrorText.textContent = "Invalid email or password"
        }
      }
    }
  })
})

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", () => {
  const userAvatar = document.getElementById("userAvatar")
  const userDropdown = document.getElementById("userDropdown")
  const logoutBtn = document.getElementById("logoutBtn")

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", (e) => {
    e.stopPropagation()
    userDropdown.classList.toggle("show")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show")
    }
  })

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show")
    }
  })

  // Handle logout button click
  logoutBtn.addEventListener("click", async () => {
    // Close dropdown first
    userDropdown.classList.remove("show")

    try {
      // Call logout API endpoint
      await httpRequest.post("auth/logout")

      // Clear stored authentication data
      localStorage.removeItem("access_token")
      localStorage.removeItem("currentuser")

      // Update UI to show auth buttons instead of user info
      const authButtons = document.querySelector(".auth-buttons")
      const userInfo = document.querySelector(".user-info")

      userInfo.classList.remove("show")
      authButtons.classList.add("show")

      console.log("Logout successful")
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if API call fails, clear local data and update UI
      localStorage.removeItem("access_token")
      localStorage.removeItem("currentuser")

      const authButtons = document.querySelector(".auth-buttons")
      const userInfo = document.querySelector(".user-info")

      userInfo.classList.remove("show")
      authButtons.classList.add("show")
    }
  })
})

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelector(".auth-buttons")
  const userInfo = document.querySelector(".user-info")
  try {
const user = JSON.parse(localStorage.getItem("currentuser"))
if (user) updateCurrentUser(user)

    userInfo.classList.add("show")
  } catch (error) {
    authButtons.classList.add("show")
  }
})

function updateCurrentUser(user) {
  const userName = document.getElementById("user-name")
  const userAvatarImg = document.getElementById("user-avatar")
  if (user.avatar_url) {
    userAvatarImg.src = user.avatar_url
  }
  if (user.username) {
    userName.textContent = user.username
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");

  // Lấy dữ liệu user mới nhất từ localStorage
  const storedUser = localStorage.getItem("currentuser");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      // Cập nhật tên người dùng
      if (user.username) {
        userName.textContent = user.username;
      }

      // Cập nhật avatar
      if (user.avatar_url) {
        userAvatar.src = user.avatar_url;
      } else {
        // Nếu chưa có ảnh thì tạo avatar mặc định
        const initials = user.username
          ? user.username.slice(0, 2).toUpperCase()
          : "U";
        const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='%23333'>${initials}</text></svg>`;
        userAvatar.src = defaultAvatar;
      }
    } catch (err) {
      console.error("Lỗi khi đọc dữ liệu người dùng:", err);
    }
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === "currentuser") {
    const user = JSON.parse(event.newValue);
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");

    if (user.username) userName.textContent = user.username;
    if (user.avatar_url) userAvatar.src = user.avatar_url;
  }
});
// Đồng bộ avatar khi người dùng quay lại trang chủ 
window.addEventListener("focus", () => {
  const storedUser = localStorage.getItem("currentuser");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const userAvatar = document.getElementById("user-avatar");
      const userName = document.getElementById("user-name");

      if (user.username) userName.textContent = user.username;
      if (user.avatar_url) {
        userAvatar.src = user.avatar_url;
      } else {
        const initials = user.username
          ? user.username.slice(0, 2).toUpperCase()
          : "U";
        const defaultAvatar = `data:image/svg+xml;utf8,
          <svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
            <rect width='100%' height='100%' fill='%23eef2ff'/>
            <text x='50%' y='54%' dominant-baseline='middle' 
            text-anchor='middle' font-family='Arial' font-size='72' fill='%23333'>
              ${initials}
            </text>
          </svg>`;
        userAvatar.src = defaultAvatar;
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật avatar sau khi quay lại:", err);
    }
  }
});

window.addEventListener("pageshow", () => {
  const user = JSON.parse(localStorage.getItem("currentuser"));
  if (user) updateCurrentUser(user);
});

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
  card.dataset.artistId = artist.id // Store artist ID for navigation

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

  card.addEventListener("click", (e) => {
    // Prevent navigation if clicking the play button
    if (!e.target.closest(".artist-play-btn")) {
      showArtistProfile(artist.id)
    }
  })

  return card
}

async function showArtistProfile(artistId) {
  try {
    console.log("[v0] Loading artist profile for ID:", artistId)
    currentArtistId = artistId
    isShowingArtistProfile = true

    // Ẩn các section home
    const hitsSection = document.querySelector(".hits-section")
    const artistsSection = document.querySelector(".artists-section")
    hitsSection.style.display = "none"
    artistsSection.style.display = "none"

    // Hiển thị các section artist profile
    const artistHero = document.querySelector(".artist-hero")
    const artistControls = document.querySelector(".artist-controls")
    const popularSection = document.querySelector(".popular-section")
    artistHero.style.display = "block"
    artistControls.style.display = "flex"
    popularSection.style.display = "block"

    const backBtn = document.querySelector(".back-btn")
    if (backBtn) {
      backBtn.style.display = "flex"
    }

    // Fetch artist info và popular tracks song song
    const [artistResponse, tracksResponse] = await Promise.all([
      httpRequest.get(`artists/${artistId}`),
      httpRequest.get(`artists/${artistId}/tracks/popular`),
    ])

    console.log("[v0] Artist response:", artistResponse)
    console.log("[v0] Tracks response:", tracksResponse)

    const artist = artistResponse
    const tracks = tracksResponse.tracks || []

    console.log("[v0] Artist data:", artist)
    console.log("[v0] Tracks data:", tracks)

    if (window.musicPlayer) {
      window.musicPlayer.playlist = tracks
    }

    // Cập nhật artist hero
    const heroBackground = document.querySelector(".hero-background")
    const heroImage = document.querySelector(".hero-image")
    const verifiedBadge = document.querySelector(".verified-badge")
    const artistName = document.querySelector(".artist-name")
    const monthlyListeners = document.querySelector(".monthly-listeners")

    if (artist.background_image_url) {
      heroImage.src = artist.background_image_url
    }

    if (artist.is_verified) {
      verifiedBadge.style.display = "flex"
    } else {
      verifiedBadge.style.display = "none"
    }

    artistName.textContent = artist.name

    if (artist.monthly_listeners) {
      monthlyListeners.textContent = `${formatNumber(artist.monthly_listeners)} monthly listeners`
    }

    // Render popular tracks
    renderArtistPopularTracks(tracks)

    // Setup play all button
    const playBtnLarge = document.querySelector(".play-btn-large")
    playBtnLarge.onclick = () => {
      if (tracks.length > 0 && window.musicPlayer) {
        window.musicPlayer.playlist = tracks
        window.musicPlayer.loadAndPlay(0)
      }
    }
  } catch (error) {
    console.error("[v0] Error loading artist profile:", error)
    alert("Failed to load artist profile. Please try again later.")
    hideArtistProfile()
  }
// follow btn functionality
  const followBtn = document.querySelector(".follow-btn");
  
  // Reset và kiểm tra trạng thái follow của artist hiện tại
  followBtn.textContent = "Follow"; // Reset về trạng thái mặc định
  followBtn.disabled = true; // Disable trong khi đang load
  
  let isFollowing = false;
  try {
    // Lấy thông tin artist để check follow status
    const artistInfo = await httpRequest.get(`artists/${artistId}`);
    isFollowing = artistInfo.is_following || false;
    followBtn.textContent = isFollowing ? "Following" : "Follow";
    followBtn.disabled = false;
    console.log(`Artist ${artistId} follow status:`, isFollowing);
  } catch (error) {
    console.log("Could not check follow status:", error);
    followBtn.textContent = "Follow";
    followBtn.disabled = false;
  }
  
  // Remove old event listeners để tránh duplicate
  const newFollowBtn = followBtn.cloneNode(true);
  followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
  
  newFollowBtn.addEventListener("click", async () => {
    const currentText = newFollowBtn.textContent.trim();
    const willFollow = currentText === "Follow";
    
    // Disable button khi đang xử lý
    newFollowBtn.disabled = true;
    
    try {
      if (willFollow) {
        // Follow artist - POST request
        await httpRequest.post(`artists/${artistId}/follow`, {});
        newFollowBtn.textContent = "Following";
        isFollowing = true;
        console.log(`Successfully followed artist ${artistId}`);
      } else {
        // Unfollow artist - DELETE request
        await httpRequest.delete(`artists/${artistId}/follow`);
        newFollowBtn.textContent = "Follow";
        isFollowing = false;
        console.log(`Successfully unfollowed artist ${artistId}`);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      
      // Xử lý các loại lỗi
      if (error.status === 409) {
        // Conflict - có thể đã follow rồi, refresh trạng thái
        try {
          const artistInfo = await httpRequest.get(`artists/${artistId}`);
          isFollowing = artistInfo.is_following || false;
          newFollowBtn.textContent = isFollowing ? "Following" : "Follow";
          console.log("Refreshed follow status after conflict");
        } catch (e) {
          console.error("Could not refresh status:", e);
        }
      } else if (error.status === 404) {
        alert("Artist not found");
      } else if (error.status === 401) {
        alert("Please login to follow artists");
      } else {
        alert("Failed to update follow status. Please try again.");
      }
    } finally {
      // Re-enable button
      newFollowBtn.disabled = false;
    }
  });
}

function hideArtistProfile() {
  isShowingArtistProfile = false
  currentArtistId = null

  // Hiển thị lại các section home
  const hitsSection = document.querySelector(".hits-section")
  const artistsSection = document.querySelector(".artists-section")
  hitsSection.style.display = "block"
  artistsSection.style.display = "block"

  // Ẩn các section artist profile
  const artistHero = document.querySelector(".artist-hero")
  const artistControls = document.querySelector(".artist-controls")
  const popularSection = document.querySelector(".popular-section")
  artistHero.style.display = "none"
  artistControls.style.display = "none"
  popularSection.style.display = "none"

  const backBtn = document.querySelector(".back-btn")
  if (backBtn) {
    backBtn.style.display = "none"
        // Scroll to the popular artists section
    const artistsSection = document.querySelector(".artists-section");
    if (artistsSection) {
      artistsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  fetchAndRenderTodaysBiggestHits()
}

function renderArtistPopularTracks(tracks) {
  const trackList = document.querySelector(".popular-section .track-list")
  trackList.innerHTML = ""

  if (tracks.length === 0) {
    trackList.innerHTML = '<div class="loading">No tracks available</div>'
    return
  }

  tracks.forEach((track, index) => {
    const trackItem = createArtistTrackItem(track, index + 1)
    trackList.appendChild(trackItem)
  })
}

function createArtistTrackItem(track, position) {
  const item = document.createElement("div")
  item.className = "track-item"
  item.dataset.trackIndex = position - 1

  const duration = formatDuration(track.duration)
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

  // Click vào track để phát nhạc
  item.addEventListener("click", () => {
    if (window.musicPlayer) {
      window.musicPlayer.loadAndPlay(position - 1)
    }
  })

  return item
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTrendingArtists()

  const artistHero = document.querySelector(".artist-hero")
  const artistControls = document.querySelector(".artist-controls")
  const popularSection = document.querySelector(".popular-section")
  if (artistHero) artistHero.style.display = "none"
  if (artistControls) artistControls.style.display = "none"
  if (popularSection) popularSection.style.display = "none"

  const backBtn = document.querySelector(".back-btn")
  if (backBtn) {
    backBtn.style.display = "none"
    backBtn.addEventListener("click", hideArtistProfile)
  }
})

// hiển thị popular hits
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

    if (window.musicPlayer) {
      // Chỉ set playlist nếu chưa có hoặc đang ở chế độ hits
      if (!window.musicPlayer.playlistSource || window.musicPlayer.playlistSource === 'hits') {
        window.musicPlayer.playlist = tracks
        window.musicPlayer.playlistSource = 'hits'
      }
    }

    // Clear loading state
    hitsGrid.innerHTML = ""

    // Render each track as a hit card
    tracks.forEach((track, index) => {
      const hitCard = createHitCard(track, index)
      hitsGrid.appendChild(hitCard)
    })
  } catch (error) {
    console.error("Error fetching today's biggest hits:", error)
    const hitsGrid = document.querySelector(".hits-grid")
    hitsGrid.innerHTML = '<div class="error">Failed to load hits. Please try again later.</div>'
  }
}

function createHitCard(track, index) {
  const card = document.createElement("div")
  card.className = "hit-card"
  card.dataset.trackIndex = index

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

  const playBtn = card.querySelector(".hit-play-btn")
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    if (window.musicPlayer) {
      // Đảm bảo playlist được set đúng từ hits
      window.musicPlayer.playlistSource = 'hits'
      window.musicPlayer.currentTrackIndex = index
      window.musicPlayer.loadAndPlay(index)
    }
  })

  card.addEventListener("click", () => {
    if (window.musicPlayer) {
      // Đảm bảo playlist được set đúng từ hits
      window.musicPlayer.playlistSource = 'hits'
      window.musicPlayer.currentTrackIndex = index
      window.musicPlayer.loadAndPlay(index)
    }
  })

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

// Music Player Functionality
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio")
  const playPauseBtn = document.querySelector(".player-center .play-btn")
  const playPauseIcon = playPauseBtn.querySelector("i")
  const previousBtn = document.querySelector(".fas.fa-step-backward").parentElement
  const nextBtn = document.querySelector(".fas.fa-step-forward").parentElement
  const shuffleBtn = document.querySelector(".fas.fa-random").parentElement
  const repeatBtn = document.querySelector(".fas.fa-redo").parentElement
  const progressBarContainer = document.querySelector(".progress-bar")
  const progressFill = document.querySelector(".progress-fill")
  const progressHandle = document.querySelector(".progress-handle")
  const runningTime = document.querySelector(".running-time")
  const totalTime = document.querySelector(".total-time")
  const volumeBtn = document.querySelector(".fas.fa-volume-down").parentElement
  const volumeBar = document.querySelector(".volume-bar")
  const volumeFill = document.querySelector(".volume-fill")
  const volumeHandle = document.querySelector(".volume-handle")

  const playerImage = document.querySelector(".player-image")
  const playerTitle = document.querySelector(".player-title")
  const playerArtist = document.querySelector(".player-artist")
  const favTitle = document.querySelector(".fav-title")

  // Player state
  let isPlaying = false
  let isShuffle = false
  let repeatMode = "off" // off, one, all
  let currentVolume = 0.7
  let currentTrackIndex = 0

  window.musicPlayer = {
    playlist: [],
    currentTrackIndex: 0,
    loadAndPlay: function (trackIndex) {
      this.currentTrackIndex = trackIndex
      currentTrackIndex = trackIndex
      loadTrack(trackIndex)
    },
  }

  function loadTrack(trackIndex) {
    const track = window.musicPlayer.playlist[trackIndex]

    audio.src = track.audio_url
    audio.load()

    if (playerImage) {
      playerImage.src = track.image_url || "placeholder.svg?height=56&width=56"
      playerImage.alt = track.title
    }
    if (playerTitle) {
      playerTitle.textContent = track.title
    }
    if (favTitle) {
      favTitle.textContent = `${track.title} spotify`
    }
    if (playerArtist) {
      playerArtist.textContent = track.artist_name || "Unknown Artist"
    }

    playPauseIcon.classList.remove("fa-play")
    playPauseIcon.classList.add("fa-pause")

    runningTime.textContent = "0:00"
    totalTime.textContent = formatDuration(track.duration)

    playTrack()
  }

  function playTrack() {
    audio.play()
    isPlaying = true
    playPauseIcon.classList.remove("fa-play")
    playPauseIcon.classList.add("fa-pause")
    updateProgress()
  }

  function pauseTrack() {
    audio.pause()
    isPlaying = false
    playPauseIcon.classList.remove("fa-pause")
    playPauseIcon.classList.add("fa-play")
  }

  function updateProgress() {
    const duration = audio.duration
    const currentTime = audio.currentTime
    const progressPercentage = (currentTime / duration) * 100
    progressFill.style.width = `${progressPercentage}%`
    progressHandle.style.left = `${progressPercentage}%`
    runningTime.textContent = formatDuration(Math.round(currentTime))
    if (isPlaying) {
      requestAnimationFrame(updateProgress)
    }
  }

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      pauseTrack()
    } else {
      playTrack()
    }
  })

  previousBtn.addEventListener("click", () => {
    if (window.musicPlayer.playlist.length > 0) {
      currentTrackIndex =
        (currentTrackIndex - 1 + window.musicPlayer.playlist.length) % window.musicPlayer.playlist.length
      loadTrack(currentTrackIndex)
    }
  })

  nextBtn.addEventListener("click", () => {
    if (window.musicPlayer.playlist.length > 0) {
      currentTrackIndex = (currentTrackIndex + 1) % window.musicPlayer.playlist.length
      loadTrack(currentTrackIndex)
    }
  })

  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle
    shuffleBtn.classList.toggle("active", isShuffle)
  })

  repeatBtn.addEventListener("click", () => {
    repeatMode = repeatMode === "off" ? "one" : repeatMode === "one" ? "all" : "off"
    repeatBtn.classList.toggle("active", repeatMode !== "off")
  })

  progressBarContainer.addEventListener("click", (e) => {
    const rect = progressBarContainer.getBoundingClientRect()
    const progressPercentage = ((e.clientX - rect.left) / rect.width) * 100
    audio.currentTime = (audio.duration * progressPercentage) / 100
    progressFill.style.width = `${progressPercentage}%`
    progressHandle.style.left = `${progressPercentage}%`
  })

  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      loadTrack(currentTrackIndex)
    } else if (repeatMode === "all") {
      currentTrackIndex = (currentTrackIndex + 1) % window.musicPlayer.playlist.length
      loadTrack(currentTrackIndex)
    }
  })

  volumeBtn.addEventListener("click", () => {
    currentVolume = currentVolume === 0 ? 0.7 : 0
    audio.volume = currentVolume
    volumeFill.style.width = `${currentVolume * 100}%`
    volumeHandle.style.left = `${currentVolume * 100}%`
  })

  volumeBar.addEventListener("click", (e) => {
    const rect = volumeBar.getBoundingClientRect()
    const volumePercentage = (e.clientX - rect.left) / rect.width
    currentVolume = volumePercentage
    audio.volume = currentVolume
    volumeFill.style.width = `${volumePercentage * 100}%`
    volumeHandle.style.left = `${volumePercentage * 100}%`
  })
})

let isShowingArtistProfile = false
let currentArtistId = null

// Thêm vào cuối file main.js

// Search Functionality
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input")
  const searchResultsContainer = createSearchResultsContainer()
  
  let searchTimeout = null
  let isSearchOpen = false

  // Lưu reference đến function fetchAndRenderTodaysBiggestHits để có thể gọi lại
  window.refreshHitsPlaylist = function() {
    if (window.musicPlayer) {
      window.musicPlayer.playlistSource = 'hits'
    }
  }

  // Tạo container cho kết quả tìm kiếm
  function createSearchResultsContainer() {
    const container = document.createElement("div")
    container.className = "search-results-container"
    container.style.display = "none"
    
    // Tìm vị trí để chèn container (sau thanh search)
    const searchWrapper = searchInput.closest(".search-bar") || searchInput.parentElement
    if (searchWrapper) {
      searchWrapper.style.position = "relative"
      searchWrapper.appendChild(container)
    }
    
    return container
  }

  // Debounce search để tránh gọi API quá nhiều
  function debounceSearch(query) {
    clearTimeout(searchTimeout)
    
    if (query.trim().length === 0) {
      hideSearchResults()
      return
    }

    searchTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)
  }

  // Thực hiện tìm kiếm
  async function performSearch(query) {
    try {
      showLoadingState()
      
      // Gọi API tìm kiếm song song với query parameter "search"
      const [tracksResponse, artistsResponse] = await Promise.all([
        httpRequest.get(`tracks?limit=50&offset=0&search=${encodeURIComponent(query)}`),
        httpRequest.get(`artists?limit=50&offset=0&search=${encodeURIComponent(query)}`)
      ])

      let tracks = tracksResponse.tracks || []
      let artists = artistsResponse.artists || []

      // Lọc kết quả client-side để đảm bảo chính xác
      const searchTerm = query.toLowerCase().trim()
      
      // Lọc tracks theo title hoặc artist_name
      tracks = tracks.filter(track => {
        const titleMatch = track.title?.toLowerCase().includes(searchTerm)
        const artistMatch = track.artist_name?.toLowerCase().includes(searchTerm)
        return titleMatch || artistMatch
      })

      // Lọc artists theo name
      artists = artists.filter(artist => {
        return artist.name?.toLowerCase().includes(searchTerm)
      })

      // Sắp xếp kết quả: ưu tiên kết quả khớp từ đầu
      tracks.sort((a, b) => {
        const aTitle = a.title?.toLowerCase() || ''
        const bTitle = b.title?.toLowerCase() || ''
        const aStartsWith = aTitle.startsWith(searchTerm)
        const bStartsWith = bTitle.startsWith(searchTerm)
        
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        return 0
      })

      artists.sort((a, b) => {
        const aName = a.name?.toLowerCase() || ''
        const bName = b.name?.toLowerCase() || ''
        const aStartsWith = aName.startsWith(searchTerm)
        const bStartsWith = bName.startsWith(searchTerm)
        
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        return 0
      })

      // Giới hạn số lượng hiển thị
      tracks = tracks.slice(0, 5)
      artists = artists.slice(0, 5)

      renderSearchResults(tracks, artists, query)
    } catch (error) {
      console.error("Search error:", error)
      showErrorState()
    }
  }

  // Hiển thị trạng thái loading
  function showLoadingState() {
    searchResultsContainer.innerHTML = `
      <div class="search-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Đang tìm kiếm...</span>
      </div>
    `
    searchResultsContainer.style.display = "block"
    isSearchOpen = true
  }

  // Hiển thị trạng thái lỗi
  function showErrorState() {
    searchResultsContainer.innerHTML = `
      <div class="search-error">
        <i class="fas fa-exclamation-circle"></i>
        <span>Không thể tìm kiếm. Vui lòng thử lại.</span>
      </div>
    `
  }

  // Render kết quả tìm kiếm
  function renderSearchResults(tracks, artists, query) {
    if (tracks.length === 0 && artists.length === 0) {
      searchResultsContainer.innerHTML = `
        <div class="search-empty">
          <i class="fas fa-search"></i>
          <span>Không tìm thấy kết quả cho "${query}"</span>
        </div>
      `
      return
    }

    let html = '<div class="search-results-wrapper">'

    // Hiển thị nghệ sĩ
    if (artists.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">Nghệ sĩ</h3>
          <div class="search-artists-list">
      `
      artists.forEach(artist => {
        html += `
          <div class="search-artist-item" data-artist-id="${artist.id}">
            <img src="${artist.image_url || 'placeholder.svg?height=48&width=48'}" alt="${artist.name}">
            <div class="search-artist-info">
              <div class="search-artist-name">${artist.name}</div>
              <div class="search-artist-type">Nghệ sĩ</div>
            </div>
          </div>
        `
      })
      html += '</div></div>'
    }

    // Hiển thị bài hát
    if (tracks.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">Bài hát</h3>
          <div class="search-tracks-list">
      `
      tracks.forEach((track, index) => {
        html += `
          <div class="search-track-item" data-track-index="${index}">
            <img src="${track.image_url || 'placeholder.svg?height=48&width=48'}" alt="${track.title}">
            <div class="search-track-info">
              <div class="search-track-name">${track.title}</div>
              <div class="search-track-artist">${track.artist_name || 'Unknown Artist'}</div>
            </div>
            <div class="search-track-duration">${formatDuration(track.duration)}</div>
            <button class="search-track-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
        `
      })
      html += '</div></div>'
    }

    // Nút xem tất cả
    html += `
      <div class="search-footer">
        <button class="search-view-all-btn">
          Xem tất cả kết quả cho "${query}"
        </button>
      </div>
    `

    html += '</div>'
    searchResultsContainer.innerHTML = html
    searchResultsContainer.style.display = "block"
    isSearchOpen = true

    // Lưu tracks vào playlist tạm để phát nhạc
    window.searchPlaylist = tracks

    // Add event listeners
    addSearchResultsEventListeners()
  }

  // Thêm event listeners cho kết quả tìm kiếm
  function addSearchResultsEventListeners() {
    // Click vào nghệ sĩ
    const artistItems = searchResultsContainer.querySelectorAll(".search-artist-item")
    artistItems.forEach(item => {
      item.addEventListener("click", () => {
        const artistId = item.dataset.artistId
        showArtistProfile(artistId)
        hideSearchResults()
        searchInput.value = ""
      })
    })

    // Click vào bài hát
    const trackItems = searchResultsContainer.querySelectorAll(".search-track-item")
    trackItems.forEach(item => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".search-track-play-btn")) {
          const trackIndex = parseInt(item.dataset.trackIndex)
          playSearchTrack(trackIndex)
        }
      })
    })

    // Click nút play
    const playBtns = searchResultsContainer.querySelectorAll(".search-track-play-btn")
    playBtns.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        playSearchTrack(index)
      })
    })

    // Click xem tất cả
    const viewAllBtn = searchResultsContainer.querySelector(".search-view-all-btn")
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        // Có thể mở trang search riêng hoặc hiển thị full results
        alert("Chức năng xem tất cả đang được phát triển")
      })
    }
  }

  // Phát nhạc từ kết quả tìm kiếm
  function playSearchTrack(trackIndex) {
    if (window.musicPlayer && window.searchPlaylist) {
      // Đánh dấu đây là playlist từ search
      window.musicPlayer.playlist = window.searchPlaylist
      window.musicPlayer.playlistSource = 'search'
      window.musicPlayer.currentTrackIndex = trackIndex
      window.musicPlayer.loadAndPlay(trackIndex)
      hideSearchResults()
      searchInput.value = ""
    }
  }

  // Ẩn kết quả tìm kiếm
  function hideSearchResults() {
    searchResultsContainer.style.display = "none"
    isSearchOpen = false
  }

  // Event listeners cho search input
  searchInput.addEventListener("input", (e) => {
    debounceSearch(e.target.value)
  })

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) {
      searchResultsContainer.style.display = "block"
      isSearchOpen = true
    }
  })

  // Click bên ngoài để đóng kết quả tìm kiếm
  document.addEventListener("click", (e) => {
    if (isSearchOpen && 
        !searchInput.contains(e.target) && 
        !searchResultsContainer.contains(e.target)) {
      hideSearchResults()
    }
  })

  // Escape để đóng
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSearchOpen) {
      hideSearchResults()
      searchInput.blur()
    }
  })

  // Clear button (nếu có)
  const clearBtn = document.querySelector(".search-clear-btn")
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = ""
      hideSearchResults()
      searchInput.focus()
    })
  }
})
// ==== CODE MỚI THÊM VÀO CUỐI FILE main.js ====
// ====== Replace previous "Artists tab" logic with this safe version ======
document.addEventListener("DOMContentLoaded", () => {
  const libraryContent = document.querySelector(".library-content");
  const navTabs = document.querySelectorAll(".nav-tab");
  const playlistTab = document.querySelector(".nav-tab:nth-child(1)");
  const artistTab = document.querySelector(".nav-tab:nth-child(2)");

  // Nếu không tìm thấy .library-content thì dừng
  if (!libraryContent) return;

  // Create two persistent containers and move original children into playlistsContainer
  const playlistsContainer = document.createElement("div");
  playlistsContainer.className = "library-playlists";

  const artistsContainer = document.createElement("div");
  artistsContainer.className = "library-artists hidden";

  // Move existing children (the original playlists HTML) into playlistsContainer
  while (libraryContent.firstChild) {
    playlistsContainer.appendChild(libraryContent.firstChild);
  }

  // Append the two containers into libraryContent
  libraryContent.appendChild(playlistsContainer);
  libraryContent.appendChild(artistsContainer);

  // Utility: ensure CSS has .hidden { display: none; } (or your existing class)
  // Now tab switching only toggles visibility of containers (no innerHTML overwrite)
  function showPlaylists() {
    navTabs.forEach((t) => t.classList.remove("active"));
    if (playlistTab) playlistTab.classList.add("active");

    artistsContainer.classList.add("hidden");
    playlistsContainer.classList.remove("hidden");

    // If you need to refresh playlists content from API, call your fetch function here
    // e.g. fetchAndRenderPlaylists() -- if such function exists. Otherwise the static content stays.
  }

  async function showArtists() {
    navTabs.forEach((t) => t.classList.remove("active"));
    if (artistTab) artistTab.classList.add("active");

    playlistsContainer.classList.add("hidden");
    artistsContainer.classList.remove("hidden");

    // Show loading placeholder
    artistsContainer.innerHTML = '<div class="loading">Loading followed artists...</div>';

    try {
      const response = await httpRequest.get("me/following?limit=20&offset=0");
      console.log("[DEBUG] /me/following response:", response);

      // Normalize to an array (handle several possible shapes)
      const artists =
        response.data?.data ||
        response.data?.artists ||
        response.data?.items ||
        response.artists ||
        response.items ||
        response.data ||
        [];

      console.log("[DEBUG] Parsed artists array:", artists);

      if (!Array.isArray(artists) || artists.length === 0) {
        artistsContainer.innerHTML =
          '<div class="empty">You have not followed any artists yet.</div>';
        return;
      }

      // Build list (clear first)
      artistsContainer.innerHTML = "";
      artists.forEach((artist) => {
        const item = document.createElement("div");
        item.className = "library-item";
        item.innerHTML = `
          <img
            src="${artist.image || artist.image_url || 'placeholder.svg?height=48&width=48'}"
            alt="${artist.name}"
            class="item-image"
          />
          <div class="item-info">
            <div class="item-title">${artist.name}</div>
            <div class="item-subtitle">Artist</div>
          </div>
        `;
        item.addEventListener("click", () => {
          // open artist profile (reuse existing function)
          if (typeof showArtistProfile === "function") showArtistProfile(artist.id);
        });
        artistsContainer.appendChild(item);
      });
    } catch (error) {
      console.error("Error loading followed artists:", error);
      artistsContainer.innerHTML =
        '<div class="error">Failed to load followed artists. Please try again later.</div>';
    }
  }

  // Attach tab click handlers
  if (playlistTab) {
    playlistTab.addEventListener("click", (e) => {
      e.preventDefault();
      showPlaylists();
    });
  }
  if (artistTab) {
    artistTab.addEventListener("click", (e) => {
      e.preventDefault();
      showArtists();
    });
  }

  // Initial state: make sure playlists visible by default
  showPlaylists();
});

