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
  const controlBtn = document.querySelector(".control-btn")

  // home button functionality
  spotifyIcon.addEventListener("click", ()=>{
    window.location.href = "index.html"
  }
  )
  homeBtn.addEventListener("click", () => {
    window.location.href = "index.html" // Redirect to homepage
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
    document.body.style.overflow = "hidden" // Prevent background scrolling
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
    document.body.style.overflow = "auto" // Restore scrolling
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
  // ...existing code...
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
    /////////////////////////////////////////////////////////////////////
    try {
      const { user, access_token } = await httpRequest.post("auth/register", credentials)
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("currentuser", user)
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
    const { user } = await httpRequest.get("users/me")
    updateCurrentUser(user)
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

    if (window.musicPlayer) {
      window.musicPlayer.playlist = tracks
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
      window.musicPlayer.loadAndPlay(index)
    }
  })

  card.addEventListener("click", () => {
    if (window.musicPlayer) {
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
    if (favTitle){
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
