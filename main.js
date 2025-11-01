// đây là main.js
import httpRequest from "./utils/httpRequest.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const spotifyIcon = document.querySelector(".logo");
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

  // home button functionality
  spotifyIcon.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  homeBtn.addEventListener("click", hideArtistProfile);

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
    document.body.style.overflow = "hidden";
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", () => {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", () => {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto";
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", () => {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", () => {
    showSignupForm();
  });

  const togglePassword = document.querySelector("#togglePassword");
  const password = document.querySelector("#signupPassword");
  if (togglePassword && password) {
    togglePassword.addEventListener("click", () => {
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
  signupForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
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
      e.target
        .querySelector("#signupPassword")
        .addEventListener("focus", () => {
          errorMessage.style.display = "none";
        });

      try {
        const { user, access_token } = await httpRequest.post(
          "auth/register",
          credentials
        );
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("currentuser", JSON.stringify(user));
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

  // Login form submission
  loginForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.querySelector("#loginEmail").value;
      const password = e.target.querySelector("#loginPassword").value;
      const credentials = {
        email,
        password,
      };

      const loginErrorMessage = loginForm.querySelector(".error-message");
      const loginErrorText = loginForm.querySelector(".error-text");

      // Hide error message when inputs are focused
      e.target.querySelector("#loginEmail").addEventListener("focus", () => {
        loginErrorMessage.style.display = "none";
      });
      e.target.querySelector("#loginPassword").addEventListener("focus", () => {
        loginErrorMessage.style.display = "none";
      });

      try {
        // Call login API endpoint
        const { user, access_token } = await httpRequest.post(
          "auth/login",
          credentials
        );

        // Store authentication data
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("currentuser", JSON.stringify(user));

        // Update UI to show user info
        const authButtons = document.querySelector(".auth-buttons");
        const userInfo = document.querySelector(".user-info");
        authButtons.classList.remove("show");
        userInfo.classList.add("show");

        // Close modal
        closeModal();
        loginErrorMessage.style.display = "none";
        updateCurrentUser(user);
        window.location.reload();
        console.log("Login successful");
      } catch (error) {
        console.error("Login failed:", error);

        // Show error message
        if (loginErrorMessage && loginErrorText) {
          loginErrorMessage.style.display = "flex";
          if (error?.response?.error?.message) {
            loginErrorText.textContent = error.response.error.message;
          } else {
            loginErrorText.textContent = "Invalid email or password";
          }
        }
      }
    });
});
document.addEventListener("DOMContentLoaded", () => {
  const authButtons = document.querySelector(".auth-buttons");
  const userInfo = document.querySelector(".user-info");
  const userAvatar = document.getElementById("userAvatar");

  function updateAuthUI() {
    const user = localStorage.getItem("access_token");
    if (user) {
      // Đã đăng nhập
      authButtons.classList.remove("show");
      userInfo.classList.add("show");
      if (userAvatar) userAvatar.style.display = "";
    } else {
      // Chưa đăng nhập
      authButtons.classList.add("show");
      userInfo.classList.remove("show");
      if (userAvatar) userAvatar.style.display = "none";
    }
  }

  updateAuthUI();

  // Đồng bộ khi storage thay đổi (tab khác đăng nhập/đăng xuất)
  window.addEventListener("storage", (event) => {
    if (event.key === "access_token" || event.key === "currentuser") {
      updateAuthUI();
    }
  });
});
// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", () => {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", async () => {
    // Close dropdown first
    userDropdown.classList.remove("show");

    try {
      // Call logout API endpoint
      await httpRequest.post("auth/logout");

      // Clear stored authentication data
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentuser");
      localStorage.removeItem("currentTrackIndex");

      // Update UI to show auth buttons instead of user info
      const authButtons = document.querySelector(".auth-buttons");
      const userInfo = document.querySelector(".user-info");

      userInfo.classList.remove("show");
      authButtons.classList.add("show");

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API call fails, clear local data and update UI
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentuser");

      const authButtons = document.querySelector(".auth-buttons");
      const userInfo = document.querySelector(".user-info");

      userInfo.classList.remove("show");
      authButtons.classList.add("show");
    }
  });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelector(".auth-buttons");
  const userInfo = document.querySelector(".user-info");
  try {
    const user = JSON.parse(localStorage.getItem("currentuser"));
    if (user) updateCurrentUser(user);

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
    const artistsSection = document.querySelector(".artists-section");
    const artistsGrid = artistsSection.querySelector(".artists-grid");

    // Show loading state
    artistsGrid.innerHTML = '<div class="loading">Loading artists...</div>';

    // Fetch trending artists from API
    const response = await httpRequest.get("artists?limit=20&offset=0");
    const artists = response.artists || [];

    // Clear loading state
    artistsGrid.innerHTML = "";

    // Render each artist
    artists.forEach((artist) => {
      const artistCard = createArtistCard(artist);
      artistsGrid.appendChild(artistCard);
    });
  } catch (error) {
    console.error("Error fetching trending artists:", error);
    const artistsGrid = document.querySelector(".artists-grid");
    artistsGrid.innerHTML =
      '<div class="error">Failed to load artists. Please try again later.</div>';
  }
}

function createArtistCard(artist) {
  const card = document.createElement("div");
  card.className = "artist-card";
  card.dataset.artistId = artist.id; // Store artist ID for navigation

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
  `;

  card.addEventListener("click", (e) => {
    // Prevent navigation if clicking the play button
    if (!e.target.closest(".artist-play-btn")) {
      showArtistProfile(artist.id);
    }
  });

  return card;
}

async function showArtistProfile(artistId) {
  try {
    console.log("[v0] Loading artist profile for ID:", artistId);
    currentArtistId = artistId;
    isShowingArtistProfile = true;

    // Ẩn các section home
    const hitsSection = document.querySelector(".hits-section");
    const artistsSection = document.querySelector(".artists-section");
    hitsSection.style.display = "none";
    artistsSection.style.display = "none";

    // Hiển thị các section artist profile
    const artistHero = document.querySelector(".artist-hero");
    const artistControls = document.querySelector(".artist-controls");
    const popularSection = document.querySelector(".popular-section");
    artistHero.style.display = "block";
    artistControls.style.display = "flex";
    popularSection.style.display = "block";

    const backBtn = document.querySelector(".back-btn");
    if (backBtn) {
      backBtn.style.display = "flex";
    }

    // Fetch artist info và popular tracks song song
    const [artistResponse, tracksResponse] = await Promise.all([
      httpRequest.get(`artists/${artistId}`),
      httpRequest.get(`artists/${artistId}/tracks/popular`),
    ]);

    console.log("Artist response:", artistResponse);
    console.log("Tracks response:", tracksResponse);

    const artist = artistResponse;
    const tracks = tracksResponse.tracks || [];

    console.log("Artist data:", artist);
    console.log("Tracks data:", tracks);

    if (window.musicPlayer) {
      window.musicPlayer.playlist = tracks;
    }

    // Cập nhật artist hero
    const heroBackground = document.querySelector(".hero-background");
    const heroImage = document.querySelector(".hero-image");
    const verifiedBadge = document.querySelector(".verified-badge");
    const artistName = document.querySelector(".artist-name");
    const monthlyListeners = document.querySelector(".monthly-listeners");

    if (artist.background_image_url) {
      heroImage.src = artist.background_image_url;
    }

    if (artist.is_verified) {
      verifiedBadge.style.display = "flex";
    } else {
      verifiedBadge.style.display = "none";
    }

    artistName.textContent = artist.name;

    if (artist.monthly_listeners) {
      monthlyListeners.textContent = `${formatNumber(
        artist.monthly_listeners
      )} monthly listeners`;
    }

    // Render popular tracks
    renderArtistPopularTracks(tracks);

    // Setup play all button
    const playBtnLarge = document.querySelector(".play-btn-large");
    playBtnLarge.onclick = () => {
      if (tracks.length > 0 && window.musicPlayer) {
        window.musicPlayer.playlist = tracks;
        window.musicPlayer.loadAndPlay(0);
      }
    };
  } catch (error) {
    console.error("[v0] Error loading artist profile:", error);
    alert("Failed to load artist profile. Please try again later.");
    hideArtistProfile();
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
// Thêm biến state để theo dõi trang hiện tại
let currentPage = "home"; // "home", "artist", "liked"
function hideArtistProfile() {
  isShowingArtistProfile = false;
  currentArtistId = null;

  // Ẩn các section artist profile
  const artistHero = document.querySelector(".artist-hero");
  const artistControls = document.querySelector(".artist-controls");
  const popularSection = document.querySelector(".popular-section");

  if (artistHero) {
    artistHero.style.display = "none";
  }
  if (artistControls) {
    artistControls.style.display = "none";
  }
  if (popularSection) {
    popularSection.style.display = "none";
  }
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.style.display = "none";
  }

  // Hiển thị lại home page
  showHomePage();
}
// Thêm hàm mới để hiển thị trang chủ
function showHomePage() {
  currentPage = "home";
  
  const contentWrapper = document.querySelector(".content-wrapper");

  // Ensure the music player will accept hits as the active playlist source
  // so that fetchAndRenderTodaysBiggestHits can replace the current playlist.
  if (window.musicPlayer) {
    // Clear or reset the playlistSource so the hits fetch will set the playlist.
    window.musicPlayer.playlistSource = null;
  }
  
  // Kiểm tra xem các section home có tồn tại không
  let hitsSection = document.querySelector(".hits-section");
  let artistsSection = document.querySelector(".artists-section");

  // Nếu không tồn tại, tạo lại cấu trúc HTML ban đầu
  if (!hitsSection || !artistsSection) {
    contentWrapper.innerHTML = `
      <!-- Today's Biggest Hits Section -->
      <section class="hits-section">
        <div class="section-header">
          <h2 class="section-heading">Today's biggest hits</h2>
        </div>
        <div class="hits-grid">
          <div class="loading">Loading hits...</div>
        </div>
      </section>

      <!-- Popular Artists Section -->
      <section class="artists-section">
        <div class="section-header">
          <h2 class="section-heading">Popular artists</h2>
        </div>
        <div class="artists-grid">
          <div class="loading">Loading artists...</div>
        </div>
      </section>

      <!-- Artist Hero Section -->
      <section class="artist-hero" style="display: none;">
        <div class="hero-background">
          <img src="placeholder.svg" alt="Artist background" class="hero-image" />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="verified-badge">
            <i class="fas fa-check-circle"></i>
            <span>Verified Artist</span>
          </div>
          <h1 class="artist-name"></h1>
          <p class="monthly-listeners"></p>
        </div>
      </section>

      <!-- Artist Controls -->
      <section class="artist-controls" style="display: none;">
        <button class="play-btn-large">
          <i class="fas fa-play"></i>
        </button>
        <button class="follow-btn">Follow</button>
      </section>

      <!-- Popular Tracks -->
      <section class="popular-section" style="display: none;">
        <h2 class="section-title">Popular</h2>
        <div class="track-list"></div>
      </section>
    `;

    // Load lại dữ liệu
    fetchAndRenderTodaysBiggestHits();
    fetchAndRenderTrendingArtists();
  } else {
    hitsSection.style.display = "block";
    artistsSection.style.display = "block";
    fetchAndRenderTodaysBiggestHits();
  }
}
function renderArtistPopularTracks(tracks) {
  const trackList = document.querySelector(".popular-section .track-list");
  trackList.innerHTML = "";

  if (tracks.length === 0) {
    trackList.innerHTML = '<div class="loading">No tracks available</div>';
    return;
  }

  tracks.forEach((track, index) => {
    const trackItem = createArtistTrackItem(track, index + 1);
    trackList.appendChild(trackItem);
  });
}

function createArtistTrackItem(track, position) {
  const item = document.createElement("div");
  item.className = "track-item";
  item.dataset.trackIndex = position - 1;
  item.dataset.trackId = track.id;
  const duration = formatDuration(track.duration);
  const playCount = formatNumber(track.play_count);

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
  `;

  // Click vào track để phát nhạc
  item.addEventListener("click", () => {
    if (window.musicPlayer) {
      window.musicPlayer.loadAndPlay(position - 1);
    }
  });

  return item;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTrendingArtists();

  const artistHero = document.querySelector(".artist-hero");
  const artistControls = document.querySelector(".artist-controls");
  const popularSection = document.querySelector(".popular-section");
  if (artistHero) artistHero.style.display = "none";
  if (artistControls) artistControls.style.display = "none";
  if (popularSection) popularSection.style.display = "none";

  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.style.display = "none";
    backBtn.addEventListener("click", hideArtistProfile);
  }
});

// hiển thị popular hits
async function fetchAndRenderPopularTracks() {
  try {
    const popularSection = document.querySelector(".popular-section");
    const trackList = popularSection.querySelector(".track-list");

    // Show loading state
    trackList.innerHTML = '<div class="loading">Loading tracks...</div>';

    // Fetch popular tracks from API
    const response = await httpRequest.get("playlists?limit=20&offset=0");
    const tracks = response.tracks || [];

    // Clear loading state
    trackList.innerHTML = "";

    // Render each track
    tracks.forEach((track, index) => {
      const trackItem = createTrackItem(track, index + 1);
      trackList.appendChild(trackItem);
    });
  } catch (error) {
    console.error("Error fetching popular tracks:", error);
    const trackList = document.querySelector(".track-list");
    trackList.innerHTML =
      '<div class="error">Failed to load tracks. Please try again later.</div>';
  }
}

function createTrackItem(track, position) {
  const item = document.createElement("div");
  item.className = "track-item";
  item.dataset.trackId = track.id;

  // Format duration from seconds to MM:SS
  const duration = formatDuration(track.duration);

  // Format play count with commas
  const playCount = formatNumber(track.play_count);

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
  `;

  return item;
}

async function fetchAndRenderTodaysBiggestHits() {
  try {
    const hitsSection = document.querySelector(".hits-section");
    const hitsGrid = hitsSection.querySelector(".hits-grid");

    // Show loading state
    hitsGrid.innerHTML = '<div class="loading">Loading hits...</div>';

    // Fetch trending tracks from API
    const response = await httpRequest.get("tracks/trending?limit=20");
    const tracks = response.tracks || [];

    if (window.musicPlayer) {
      // Chỉ set playlist nếu chưa có hoặc đang ở chế độ hits
      if (
        !window.musicPlayer.playlistSource ||
        window.musicPlayer.playlistSource === "hits"
      ) {
        window.musicPlayer.playlist = tracks;
        window.musicPlayer.playlistSource = "hits";
      }
    }

    // Clear loading state
    hitsGrid.innerHTML = "";

    // Render each track as a hit card
    tracks.forEach((track, index) => {
      const hitCard = createHitCard(track, index);
      hitsGrid.appendChild(hitCard);
    });
  } catch (error) {
    console.error("Error fetching today's biggest hits:", error);
    const hitsGrid = document.querySelector(".hits-grid");
    hitsGrid.innerHTML =
      '<div class="error">Failed to load hits. Please try again later.</div>';
  }
}

function createHitCard(track, index) {
  const card = document.createElement("div");
  card.className = "hit-card";
  card.dataset.trackIndex = index;
  card.dataset.trackId = track.id;

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
  `;

  const playBtn = card.querySelector(".hit-play-btn");
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.musicPlayer) {
      // Đảm bảo playlist được set đúng từ hits
      window.musicPlayer.playlistSource = "hits";
      window.musicPlayer.currentTrackIndex = index;
      window.musicPlayer.loadAndPlay(index);
    }
  });

  card.addEventListener("click", () => {
    if (window.musicPlayer) {
      // Đảm bảo playlist được set đúng từ hits
      window.musicPlayer.playlistSource = "hits";
      window.musicPlayer.currentTrackIndex = index;
      window.musicPlayer.loadAndPlay(index);
    }
  });

  return card;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTodaysBiggestHits();
  fetchAndRenderTrendingArtists();
  fetchAndRenderPopularTracks();
});

// Music Player Functionality
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio");
  const playPauseBtn = document.querySelector(".player-center .play-btn");
  const playPauseIcon = playPauseBtn.querySelector("i");
  const previousBtn = document.querySelector(
    ".fas.fa-step-backward"
  ).parentElement;
  const nextBtn = document.querySelector(".fas.fa-step-forward").parentElement;
  const shuffleBtn = document.querySelector(".fas.fa-random").parentElement;
  const repeatBtn = document.querySelector(".fas.fa-redo").parentElement;
  const progressBarContainer = document.querySelector(".progress-bar");
  const progressFill = document.querySelector(".progress-fill");
  const progressHandle = document.querySelector(".progress-handle");
  const runningTime = document.querySelector(".running-time");
  const totalTime = document.querySelector(".total-time");
  const volumeBtn = document.querySelector(".fas.fa-volume-down").parentElement;
  const volumeBar = document.querySelector(".volume-bar");
  const volumeFill = document.querySelector(".volume-fill");
  const volumeHandle = document.querySelector(".volume-handle");

  const playerImage = document.querySelector(".player-image");
  const playerTitle = document.querySelector(".player-title");
  const playerArtist = document.querySelector(".player-artist");
  const favTitle = document.querySelector(".fav-title");

  // Player state
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = "off"; // off, one, all
  let currentVolume = 0.7;
  let currentTrackIndex = 0;

  window.musicPlayer = {
    playlist: [],
    currentTrackIndex: 0,
    loadAndPlay: function (trackIndex) {
      this.currentTrackIndex = trackIndex;
      currentTrackIndex = trackIndex;
      loadTrack(trackIndex);
    },
  };

  function loadTrack(trackIndex) {
    const track = window.musicPlayer.playlist[trackIndex];

    audio.src = track.audio_url;
    audio.load();

    if (playerImage) {
      playerImage.src = track.image_url || "placeholder.svg?height=56&width=56";
      playerImage.alt = track.title;
    }
    if (playerTitle) {
      playerTitle.textContent = track.title;
    }
    if (favTitle) {
      favTitle.textContent = `${track.title} spotify`;
    }
    if (playerArtist) {
      playerArtist.textContent = track.artist_name || "Unknown Artist";
    }

    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");

    runningTime.textContent = "0:00";
    totalTime.textContent = formatDuration(track.duration);

    playTrack();
  }

  function playTrack() {
    audio.play();
    isPlaying = true;
    playPauseIcon.classList.remove("fa-play");
    playPauseIcon.classList.add("fa-pause");
    updateProgress();
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playPauseIcon.classList.remove("fa-pause");
    playPauseIcon.classList.add("fa-play");
  }

  function updateProgress() {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progressPercentage = (currentTime / duration) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressHandle.style.left = `${progressPercentage}%`;
    runningTime.textContent = formatDuration(Math.round(currentTime));
    if (isPlaying) {
      requestAnimationFrame(updateProgress);
    }
  }

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  });

  previousBtn.addEventListener("click", () => {
    if (window.musicPlayer.playlist.length > 0) {
      currentTrackIndex =
        (currentTrackIndex - 1 + window.musicPlayer.playlist.length) %
        window.musicPlayer.playlist.length;
      loadTrack(currentTrackIndex);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (window.musicPlayer.playlist.length > 0) {
      currentTrackIndex =
        (currentTrackIndex + 1) % window.musicPlayer.playlist.length;
      loadTrack(currentTrackIndex);
    }
  });

  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
  });

  repeatBtn.addEventListener("click", () => {
    repeatMode =
      repeatMode === "off" ? "one" : repeatMode === "one" ? "all" : "off";
    repeatBtn.classList.toggle("active", repeatMode !== "off");
  });

  progressBarContainer.addEventListener("click", (e) => {
    const rect = progressBarContainer.getBoundingClientRect();
    const progressPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    audio.currentTime = (audio.duration * progressPercentage) / 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressHandle.style.left = `${progressPercentage}%`;
  });

  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      loadTrack(currentTrackIndex);
    } else if (repeatMode === "all") {
      currentTrackIndex =
        (currentTrackIndex + 1) % window.musicPlayer.playlist.length;
      loadTrack(currentTrackIndex);
    }
  });

  volumeBtn.addEventListener("click", () => {
    currentVolume = currentVolume === 0 ? 0.7 : 0;
    audio.volume = currentVolume;
    volumeFill.style.width = `${currentVolume * 100}%`;
    volumeHandle.style.left = `${currentVolume * 100}%`;
  });

  volumeBar.addEventListener("click", (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const volumePercentage = (e.clientX - rect.left) / rect.width;
    currentVolume = volumePercentage;
    audio.volume = currentVolume;
    volumeFill.style.width = `${volumePercentage * 100}%`;
    volumeHandle.style.left = `${volumePercentage * 100}%`;
  });
});

let isShowingArtistProfile = false;
let currentArtistId = null;


// Search Functionality
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input");
  const searchResultsContainer = createSearchResultsContainer();

  let searchTimeout = null;
  let isSearchOpen = false;

  // Lưu reference đến function fetchAndRenderTodaysBiggestHits để có thể gọi lại
  window.refreshHitsPlaylist = function () {
    if (window.musicPlayer) {
      window.musicPlayer.playlistSource = "hits";
    }
  };

  // Tạo container cho kết quả tìm kiếm
  function createSearchResultsContainer() {
    const container = document.createElement("div");
    container.className = "search-results-container";
    container.style.display = "none";

    // Tìm vị trí để chèn container (sau thanh search)
    const searchWrapper =
      searchInput.closest(".search-bar") || searchInput.parentElement;
    if (searchWrapper) {
      searchWrapper.style.position = "relative";
      searchWrapper.appendChild(container);
    }

    return container;
  }

  // Debounce search để tránh gọi API quá nhiều
  function debounceSearch(query) {
    clearTimeout(searchTimeout);

    if (query.trim().length === 0) {
      hideSearchResults();
      return;
    }

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  }

  // Thực hiện tìm kiếm
  async function performSearch(query) {
    try {
      showLoadingState();

      // Gọi API tìm kiếm song song với query parameter "search"
      const [tracksResponse, artistsResponse] = await Promise.all([
        httpRequest.get(
          `tracks?limit=50&offset=0&search=${encodeURIComponent(query)}`
        ),
        httpRequest.get(
          `artists?limit=50&offset=0&search=${encodeURIComponent(query)}`
        ),
      ]);

      let tracks = tracksResponse.tracks || [];
      let artists = artistsResponse.artists || [];

      // Lọc kết quả client-side để đảm bảo chính xác
      const searchTerm = query.toLowerCase().trim();

      // Lọc tracks theo title hoặc artist_name
      tracks = tracks.filter((track) => {
        const titleMatch = track.title?.toLowerCase().includes(searchTerm);
        const artistMatch = track.artist_name
          ?.toLowerCase()
          .includes(searchTerm);
        return titleMatch || artistMatch;
      });

      // Lọc artists theo name
      artists = artists.filter((artist) => {
        return artist.name?.toLowerCase().includes(searchTerm);
      });

      // Sắp xếp kết quả: ưu tiên kết quả khớp từ đầu
      tracks.sort((a, b) => {
        const aTitle = a.title?.toLowerCase() || "";
        const bTitle = b.title?.toLowerCase() || "";
        const aStartsWith = aTitle.startsWith(searchTerm);
        const bStartsWith = bTitle.startsWith(searchTerm);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
      });

      artists.sort((a, b) => {
        const aName = a.name?.toLowerCase() || "";
        const bName = b.name?.toLowerCase() || "";
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
      });

      // Giới hạn số lượng hiển thị
      tracks = tracks.slice(0, 5);
      artists = artists.slice(0, 5);

      renderSearchResults(tracks, artists, query);
    } catch (error) {
      console.error("Search error:", error);
      showErrorState();
    }
  }

  // Hiển thị trạng thái loading
  function showLoadingState() {
    searchResultsContainer.innerHTML = `
      <div class="search-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Đang tìm kiếm...</span>
      </div>
    `;
    searchResultsContainer.style.display = "block";
    isSearchOpen = true;
  }

  // Hiển thị trạng thái lỗi
  function showErrorState() {
    searchResultsContainer.innerHTML = `
      <div class="search-error">
        <i class="fas fa-exclamation-circle"></i>
        <span>Không thể tìm kiếm. Vui lòng thử lại.</span>
      </div>
    `;
  }

  // Render kết quả tìm kiếm
  function renderSearchResults(tracks, artists, query) {
    if (tracks.length === 0 && artists.length === 0) {
      searchResultsContainer.innerHTML = `
        <div class="search-empty">
          <i class="fas fa-search"></i>
          <span>Không tìm thấy kết quả cho "${query}"</span>
        </div>
      `;
      return;
    }

    let html = '<div class="search-results-wrapper">';

    // Hiển thị nghệ sĩ
    if (artists.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">Nghệ sĩ</h3>
          <div class="search-artists-list">
      `;
      artists.forEach((artist) => {
        html += `
          <div class="search-artist-item" data-artist-id="${artist.id}">
            <img src="${
              artist.image_url || "placeholder.svg?height=48&width=48"
            }" alt="${artist.name}">
            <div class="search-artist-info">
              <div class="search-artist-name">${artist.name}</div>
              <div class="search-artist-type">Nghệ sĩ</div>
            </div>
          </div>
        `;
      });
      html += "</div></div>";
    }

    // Hiển thị bài hát
    if (tracks.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">Bài hát</h3>
          <div class="search-tracks-list">
      `;
      tracks.forEach((track, index) => {
        html += `
          <div class="search-track-item" data-track-index="${index}">
            <img src="${
              track.image_url || "placeholder.svg?height=48&width=48"
            }" alt="${track.title}">
            <div class="search-track-info">
              <div class="search-track-name">${track.title}</div>
              <div class="search-track-artist">${
                track.artist_name || "Unknown Artist"
              }</div>
            </div>
            <div class="search-track-duration">${formatDuration(
              track.duration
            )}</div>
            <button class="search-track-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
        `;
      });
      html += "</div></div>";
    }

    // Nút xem tất cả
    html += `
      <div class="search-footer">
        <button class="search-view-all-btn">
          Xem tất cả kết quả cho "${query}"
        </button>
      </div>
    `;

    html += "</div>";
    searchResultsContainer.innerHTML = html;
    searchResultsContainer.style.display = "block";
    isSearchOpen = true;

    // Lưu tracks vào playlist tạm để phát nhạc
    window.searchPlaylist = tracks;

    // Add event listeners
    addSearchResultsEventListeners();
  }

  // Thêm event listeners cho kết quả tìm kiếm
  function addSearchResultsEventListeners() {
    // Click vào nghệ sĩ
    const artistItems = searchResultsContainer.querySelectorAll(
      ".search-artist-item"
    );
    artistItems.forEach((item) => {
      item.addEventListener("click", () => {
        const artistId = item.dataset.artistId;
        showArtistProfile(artistId);
        hideSearchResults();
        searchInput.value = "";
      });
    });

    // Click vào bài hát
    const trackItems =
      searchResultsContainer.querySelectorAll(".search-track-item");
    trackItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".search-track-play-btn")) {
          const trackIndex = parseInt(item.dataset.trackIndex);
          playSearchTrack(trackIndex);
        }
      });
    });

    // Click nút play
    const playBtns = searchResultsContainer.querySelectorAll(
      ".search-track-play-btn"
    );
    playBtns.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        playSearchTrack(index);
      });
    });

    // Click xem tất cả
    const viewAllBtn = searchResultsContainer.querySelector(
      ".search-view-all-btn"
    );
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        // Có thể mở trang search riêng hoặc hiển thị full results
        alert("Chức năng xem tất cả đang được phát triển");
      });
    }
  }

  // Phát nhạc từ kết quả tìm kiếm
  function playSearchTrack(trackIndex) {
    if (window.musicPlayer && window.searchPlaylist) {
      // Đánh dấu đây là playlist từ search
      window.musicPlayer.playlist = window.searchPlaylist;
      window.musicPlayer.playlistSource = "search";
      window.musicPlayer.currentTrackIndex = trackIndex;
      window.musicPlayer.loadAndPlay(trackIndex);
      hideSearchResults();
      searchInput.value = "";
    }
  }

  // Ẩn kết quả tìm kiếm
  function hideSearchResults() {
    searchResultsContainer.style.display = "none";
    isSearchOpen = false;
  }

  // Event listeners cho search input
  searchInput.addEventListener("input", (e) => {
    debounceSearch(e.target.value);
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) {
      searchResultsContainer.style.display = "block";
      isSearchOpen = true;
    }
  });

  // Click bên ngoài để đóng kết quả tìm kiếm
  document.addEventListener("click", (e) => {
    if (
      isSearchOpen &&
      !searchInput.contains(e.target) &&
      !searchResultsContainer.contains(e.target)
    ) {
      hideSearchResults();
    }
  });

  // Escape để đóng
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSearchOpen) {
      hideSearchResults();
      searchInput.blur();
    }
  });

  // Clear button (nếu có)
  const clearBtn = document.querySelector(".search-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      hideSearchResults();
      searchInput.focus();
    });
  }
});
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
    artistsContainer.innerHTML =
      '<div class="loading">Loading followed artists...</div>';

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
            src="${
              artist.image ||
              artist.image_url ||
              "placeholder.svg?height=48&width=48"
            }"
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
          if (typeof showArtistProfile === "function")
            showArtistProfile(artist.id);
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
document.addEventListener("DOMContentLoaded", () => {
  // ==================== LIKED SONGS DATA ====================
  let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];

  // ==================== LIKED SONGS UI FUNCTIONS ====================
  function updateLikedSongsUI() {
    // 1️⃣ Cập nhật phần sidebar
    const likedSongsItem = document
      .querySelector(".liked-songs")
      ?.closest(".library-item");
    if (likedSongsItem) {
      const subtitle = likedSongsItem.querySelector(".item-subtitle");
      if (subtitle) {
        subtitle.innerHTML = `<i class="fas fa-thumbtack"></i> Playlist • ${likedSongs.length} songs`;
      }
    }

    // 2️⃣ Nếu người dùng đang ở trang Liked Songs → cập nhật danh sách
    const section = document.querySelector(".liked-songs-section");
    if (section) {
      const trackList = section.querySelector(".liked-track-list");
      const heroSubtitle = section.querySelector(".hero-subtitle");
      if (heroSubtitle) heroSubtitle.textContent = `${likedSongs.length} songs`;
      trackList.innerHTML = "";

      if (likedSongs.length === 0) {
        trackList.innerHTML = `<div class="empty">You haven’t liked any songs yet.</div>`;
        return;
      }

      likedSongs.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = "track-item";
        item.dataset.trackId = track.id;

        item.innerHTML = `
          <div class="track-number">${index + 1}</div>
          <div class="track-image">
            <img src="${
              track.image_url || "placeholder.svg?height=40&width=40"
            }" alt="${track.title}">
          </div>
          <div class="track-info">
            <div class="track-name">${track.title}</div>
            <div class="track-artist">${
              track.artist_name || "Unknown Artist"
            }</div>
          </div>
          <div class="track-duration">${formatDuration(track.duration)}</div>
        `;

        // Click vào bài hát để phát
        item.addEventListener("click", () => {
          if (window.musicPlayer) {
            window.musicPlayer.playlist = likedSongs;
            window.musicPlayer.playlistSource = "liked";
            window.musicPlayer.loadAndPlay(index);
          }
        });

        trackList.appendChild(item);
      });
    }
  }

  // ==================== RENDER LIKED SONGS PAGE ====================
  function renderLikedSongsPlaylist() {
    const contentWrapper = document.querySelector(".content-wrapper");
    contentWrapper.innerHTML = `
      <section class="liked-songs-section">
        <div class="liked-hero">
          <div class="hero-cover">
            <img src="https://misc.scdn.co/liked-songs/liked-songs-640.png" alt="Liked Songs">
          </div>
          <div class="hero-info">
            <span class="hero-type">Playlist</span>
            <h1 class="hero-title">Liked Songs</h1>
            <p class="hero-subtitle">${likedSongs.length} songs</p>
            <button class="hero-play-btn"><i class="fas fa-play"></i></button>
          </div>
        </div>
        <div class="track-list liked-track-list"></div>
      </section>
    `;

    // Sự kiện play playlist
    const playBtn = contentWrapper.querySelector(".hero-play-btn");
    playBtn.addEventListener("click", () => {
      if (window.musicPlayer && likedSongs.length > 0) {
        window.musicPlayer.playlist = likedSongs;
        window.musicPlayer.playlistSource = "liked";
        window.musicPlayer.loadAndPlay(0);
      }
    });

    // Render danh sách
    updateLikedSongsUI();
  }

  // ==================== CUSTOM CONTEXT MENU (Add to Liked Songs) ====================
  const menu = document.createElement("div");
  menu.className = "custom-context-menu";
  menu.style.display = "none";
  menu.innerHTML = `
    <button class="menu-like-btn">
      <i class="fas fa-heart"></i>
      <span>Add to Liked Songs</span>
    </button>
  `;
  document.body.appendChild(menu);

  let currentTrackId = null;
  let currentTrackInfo = null;

  // Ẩn menu khi click ra ngoài
  document.addEventListener("click", () => {
    menu.style.display = "none";
  });

  // Chuột phải để hiện menu
  document.body.addEventListener("contextmenu", (e) => {
    const trackItem = e.target.closest(".track-item, .hit-card");
    if (!trackItem) return;

    e.preventDefault();
    currentTrackId = trackItem.dataset.trackId;
    if (!currentTrackId) return;

    currentTrackInfo = window.musicPlayer?.playlist?.find(
      (t) => String(t.id) === String(currentTrackId)
    );

    const isLiked = likedSongs.some((t) => t.id == currentTrackId);
    const label = menu.querySelector("span");
    const icon = menu.querySelector("i");

    label.textContent = isLiked
      ? "Remove from Liked Songs"
      : "Add to Liked Songs";
    icon.className = isLiked ? "fas fa-heart-broken" : "fas fa-heart";

    menu.style.display = "block";
    menu.style.left = `${e.clientX + 5}px`;
    menu.style.top = `${e.clientY + 5}px`;
  });

// Khi click chọn like/unlike
menu.querySelector(".menu-like-btn").addEventListener("click", async () => {
  if (!currentTrackId) return;
  const isLiked = likedSongs.some((t) => t.id == currentTrackId);

  try {
    // Kiểm tra đăng nhập
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Please login to like songs");
      return;
    }

    if (isLiked) {
      // Unlike - DELETE request
      await httpRequest.delete(`tracks/${currentTrackId}/like`);
      likedSongs = likedSongs.filter((t) => t.id != currentTrackId);
      console.log(`Unliked track ${currentTrackId}`);
    } else {
      // Like - POST request với body trống
      await httpRequest.post(`tracks/${currentTrackId}/like`, {});
      if (currentTrackInfo) {
        likedSongs.push(currentTrackInfo);
      }
      console.log(`Liked track ${currentTrackId}`);
    }

    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    menu.style.display = "none";

    // Cập nhật UI ngay
    updateLikedSongsUI();
    
    // Show success notification
    showNotification(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
    
  } catch (err) {
    console.error("Error updating liked songs:", err);
    
    // Xử lý lỗi cụ thể
    if (err.status === 401) {
      alert("Please login to like songs");
    } else if (err.status === 404) {
      alert("Track not found");
    } else if (err.status === 409) {
      alert("Song already in your liked songs");
    } else {
      alert(`Failed to update Liked Songs: ${err.message || 'Unknown error'}`);
    }
  }
});
// Helper: Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #1db954;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideDown 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
document.addEventListener("DOMContentLoaded", async () => {
  // ==================== LIKED SONGS DATA ====================
  let likedSongs = [];
  
  // Load liked songs from API
  try {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const response = await httpRequest.get("me/liked-tracks");
      likedSongs = response.tracks || response.data?.tracks || [];
      localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
      console.log(`Loaded ${likedSongs.length} liked songs from API`);
    } else {
      // Fallback to localStorage if not logged in
      likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
    }
  } catch (error) {
    console.warn("Failed to load liked songs from API, using localStorage:", error);
    likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
  }
});
  // ... rest of code
  // ==================== GẮN SỰ KIỆN CHO SIDEBAR ====================
  const likedSongsItem = document
    .querySelector(".liked-songs")
    ?.closest(".library-item");
  likedSongsItem?.addEventListener("click", () => {
    renderLikedSongsPlaylist();
  });

  // ==================== HÀM TIỆN ÍCH ====================
  function formatDuration(seconds) {
    if (!seconds) return "--:--";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  }

  // ==================== KHỞI TẠO LẦN ĐẦU ====================
  updateLikedSongsUI();
});
// ==================== SIDEBAR AUTHENTICATION CONTROL ====================
document.addEventListener("DOMContentLoaded", () => {
  updateSidebarVisibility();
});

// Lắng nghe sự kiện thay đổi authentication
window.addEventListener("storage", (event) => {
  if (event.key === "access_token" || event.key === "currentuser") {
    updateSidebarVisibility();
  }
});

// Cập nhật sau khi đăng nhập/đăng xuất
function updateSidebarVisibility() {
  const accessToken = localStorage.getItem("access_token");
  const libraryContent = document.querySelector(".library-content");
  const navTabs = document.querySelector(".nav-tabs");
  const searchLibrary = document.querySelector(".search-library");
  const createBtn = document.querySelector(".create-btn");
  
  if (!accessToken) {
    // Chưa đăng nhập - Ẩn các thành phần library
    if (libraryContent) {
      libraryContent.style.display = "none";
    }
    if (navTabs) {
      navTabs.style.display = "none";
    }
    if (searchLibrary) {
      searchLibrary.style.display = "none";
    }
    if (createBtn) {
      createBtn.style.display = "none";
    }
    
    // Hiển thị thông báo yêu cầu đăng nhập
    showLoginPrompt();
  } else {
    // Đã đăng nhập - Hiển thị các thành phần library
    if (libraryContent) {
      libraryContent.style.display = "block";
    }
    if (navTabs) {
      navTabs.style.display = "flex";
    }
    if (searchLibrary) {
      searchLibrary.style.display = "flex";
    }
    if (createBtn) {
      createBtn.style.display = "flex";
    }
    
    // Xóa thông báo đăng nhập nếu có
    removeLoginPrompt();
  
  }
}

// Hiển thị thông báo yêu cầu đăng nhập
function showLoginPrompt() {
  const sidebarNav = document.querySelector(".sidebar-nav");
  let loginPrompt = document.querySelector(".login-prompt");
  
  if (!loginPrompt && sidebarNav) {
    loginPrompt = document.createElement("div");
    loginPrompt.className = "login-prompt";
    loginPrompt.style.cssText = `
      padding: 24px 16px;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 20px;
    `;
    
    loginPrompt.innerHTML = `
      <i class="fas fa-lock" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: white;">
        Log in to see your library
      </h3>
      <p style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        Sign in to access your playlists, liked songs, and followed artists
      </p>
      <button class="prompt-login-btn" style="
        background: white;
        color: black;
        border: none;
        padding: 12px 32px;
        border-radius: 500px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        Log in
      </button>
    `;
    
    sidebarNav.appendChild(loginPrompt);
    
    // Thêm sự kiện click cho nút login
    const promptLoginBtn = loginPrompt.querySelector(".prompt-login-btn");
    promptLoginBtn.addEventListener("mouseenter", () => {
      promptLoginBtn.style.transform = "scale(1.05)";
    });
    promptLoginBtn.addEventListener("mouseleave", () => {
      promptLoginBtn.style.transform = "scale(1)";
    });
    promptLoginBtn.addEventListener("click", () => {
      // Mở modal login
      const loginBtn = document.querySelector(".login-btn");
      if (loginBtn) {
        loginBtn.click();
      }
    });
  }
}

// Xóa thông báo đăng nhập
function removeLoginPrompt() {
  const loginPrompt = document.querySelector(".login-prompt");
  if (loginPrompt) {
    loginPrompt.remove();
  }
}

// Hook vào hàm login/logout để cập nhật sidebar
const originalUpdateCurrentUser = window.updateCurrentUser || function() {};
window.updateCurrentUser = function(user) {
  originalUpdateCurrentUser(user);
  updateSidebarVisibility();
};

// Cập nhật sau khi đăng nhập thành công
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#loginForm .auth-form-content");
  const signupForm = document.querySelector("#signupForm .auth-form-content");
  
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      // Đợi xử lý login xong
      setTimeout(() => {
        updateSidebarVisibility();
      }, 500);
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      // Đợi xử lý signup xong
      setTimeout(() => {
        updateSidebarVisibility();
      }, 500);
    });
  }
});

// Cập nhật sau khi đăng xuất
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setTimeout(() => {
        updateSidebarVisibility();
      }, 100);
    });
  }
});
// ==================== JAVASCRIPT CODE ====================
// Thêm vào cuối file main.js

// ==================== PLAYLIST MANAGEMENT ====================
document.addEventListener("DOMContentLoaded", async () => {
  const createBtn = document.querySelector(".create-btn");
  const playlistModal = document.getElementById("playlistModal");
  const playlistModalClose = document.getElementById("playlistModalClose");
  const playlistForm = document.getElementById("playlistForm");
  const libraryContent = document.querySelector(".library-content");

  let currentPlaylists = [];
  let currentEditingPlaylist = null;
  let selectedTracks = [];
  let uploadedImageFile = null;

  // Load playlists on page load
  await loadUserPlaylists();

  // ==================== LOAD USER PLAYLISTS ====================
  async function loadUserPlaylists() {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No access token, skipping playlist load");
        return;
      }

      console.log("Loading user playlists...");
      const response = await httpRequest.get("me/playlists");
      console.log("Playlists API response:", response);
      
      // Handle different response structures
      currentPlaylists = response.data?.playlists || 
                        response.data?.data || 
                        response.playlists || 
                        response.data || 
                        [];

      if (!Array.isArray(currentPlaylists)) {
        console.error("Playlists is not an array:", currentPlaylists);
        currentPlaylists = [];
      }

      console.log("Parsed playlists:", currentPlaylists);
      
      // Render immediately with default count
      renderPlaylists();
      
      // Then fetch track counts in background (don't await)
      updatePlaylistTrackCounts();
    } catch (error) {
      console.error("Error loading playlists:", error);
      console.error("Error response:", error.response);
      
      // If unauthorized, user needs to login again
      if (error.status === 401) {
        console.log("Token expired, user needs to login again");
        // Optionally clear token and show login
        // localStorage.removeItem("access_token");
        // localStorage.removeItem("currentuser");
      }
    }
  }

  // ==================== UPDATE TRACK COUNTS IN BACKGROUND ====================
  async function updatePlaylistTrackCounts() {
    for (const playlist of currentPlaylists) {
      try {
        const tracksResponse = await httpRequest.get(`playlists/${playlist.id}/tracks`);
        const tracks = tracksResponse.data?.tracks || tracksResponse.tracks || [];
        
        // Update in memory
        playlist.track_count = tracks.length;
        
        // Update UI
        const sidebarItem = document.querySelector(`.library-item[data-playlist-id="${playlist.id}"]`);
        if (sidebarItem) {
          const subtitle = sidebarItem.querySelector(".item-subtitle");
          if (subtitle) {
            subtitle.innerHTML = `Playlist • <span class="track-count">${tracks.length}</span> song${tracks.length !== 1 ? 's' : ''}`;
          }
        }
      } catch (error) {
        console.error(`Error fetching tracks for playlist ${playlist.id}:`, error);
      }
    }
  }

  // ==================== RENDER PLAYLISTS IN SIDEBAR ====================
  function renderPlaylists() {
    // Get the playlists container
    const playlistsContainer = document.querySelector(".library-playlists");
    if (!playlistsContainer) return;

    // Clear ALL existing items except the first Liked Songs with pin icon
    const allItems = playlistsContainer.querySelectorAll(".library-item");
    allItems.forEach((item, index) => {
      // Keep only the first item (Liked Songs with pin)
      if (index > 0) {
        item.remove();
      }
    });

    // Render each playlist (but skip if it's named "Liked Songs")
    currentPlaylists.forEach((playlist) => {
      // Skip any playlist named "Liked Songs" from API
      if (playlist.name === "Liked Songs" || playlist.name === "Liked songs") {
        return;
      }
      
      const playlistItem = createPlaylistItem(playlist);
      playlistsContainer.appendChild(playlistItem);
    });
  }

  // ==================== CREATE PLAYLIST ITEM ====================
  function createPlaylistItem(playlist) {
    const item = document.createElement("div");
    item.className = "library-item";
    item.dataset.playlistId = playlist.id;

    // Get image URL with fallback
    const imageUrl = playlist.image_url || 
                    playlist.cover_url || 
                    playlist.imageUrl ||
                    "https://misc.scdn.co/liked-songs/liked-songs-300.png";

    // Get track count - will be updated after fetching tracks
    const trackCount = playlist.track_count || 
                      playlist.trackCount || 
                      0;

    item.innerHTML = `
      <img 
        src="${imageUrl}"
        alt="${playlist.name}"
        class="item-image"
        onerror="this.src='https://misc.scdn.co/liked-songs/liked-songs-300.png'"
      />
      <div class="item-info">
        <div class="item-title">${playlist.name}</div>
        <div class="item-subtitle">
          Playlist • <span class="track-count">${trackCount}</span> song${trackCount !== 1 ? 's' : ''}
        </div>
      </div>
      <button class="playlist-menu-btn">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    `;

    // Click to view playlist
    item.addEventListener("click", async (e) => {
      if (!e.target.closest(".playlist-menu-btn")) {
        // Remove active class from all playlists
        document.querySelectorAll(".library-item").forEach(i => i.classList.remove("active"));
        // Add active class to clicked item
        item.classList.add("active");
        
        await viewPlaylist(playlist);
      }
    });

    // Right-click menu for edit/delete
    const menuBtn = item.querySelector(".playlist-menu-btn");
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showPlaylistContextMenu(e, playlist);
    });

    return item;
  }

  // ==================== VIEW PLAYLIST ====================
  async function viewPlaylist(playlist) {
    try {
      console.log("Loading playlist:", playlist.id);
      
      // Fetch playlist details first
      const playlistResponse = await httpRequest.get(`playlists/${playlist.id}`);
      const playlistData = playlistResponse.data?.playlist || playlistResponse.playlist || playlistResponse.data || playlistResponse;
      
      console.log("Playlist response:", playlistResponse);
      
      // Fetch playlist tracks (only IDs)
      const tracksResponse = await httpRequest.get(`playlists/${playlist.id}/tracks`);
      const playlistTracks = tracksResponse.data?.tracks || tracksResponse.tracks || tracksResponse.data || [];
      
      console.log("Playlist tracks response:", tracksResponse);
      console.log("Playlist tracks (IDs only):", playlistTracks);
      
      // Fetch full track details for each track_id
      const tracks = [];
      for (const item of playlistTracks) {
        try {
          const trackId = item.track_id || item.id;
          if (!trackId) continue;
          
          const trackResponse = await httpRequest.get(`tracks/${trackId}`);
          const trackData = trackResponse.data?.track || trackResponse.track || trackResponse.data || trackResponse;
          
          // Normalize track structure
          tracks.push({
            id: trackData.id,
            title: trackData.title || trackData.name || "Unknown Track",
            artist_name: trackData.artist_name || trackData.artist?.name || "Unknown Artist",
            duration: parseInt(trackData.duration) || 0,
            image_url: trackData.image_url || trackData.cover_url || "placeholder.svg?height=40&width=40",
            audio_url: trackData.audio_url || trackData.file_url || "",
            artist_id: trackData.artist_id || trackData.artist?.id
          });
        } catch (trackError) {
          console.error("Error fetching track details:", trackError);
          // Continue with other tracks
        }
      }
      
      console.log("Full tracks with details:", tracks);

      // Update track count in sidebar
      const sidebarItem = document.querySelector(`.library-item[data-playlist-id="${playlist.id}"]`);
      if (sidebarItem) {
        const trackCountSpan = sidebarItem.querySelector(".track-count");
        if (trackCountSpan) {
          trackCountSpan.textContent = tracks.length;
        }
        // Update the whole subtitle to fix singular/plural
        const subtitle = sidebarItem.querySelector(".item-subtitle");
        if (subtitle) {
          subtitle.innerHTML = `Playlist • <span class="track-count">${tracks.length}</span> song${tracks.length !== 1 ? 's' : ''}`;
        }
      }

      // Set playlist for music player
      if (window.musicPlayer) {
        window.musicPlayer.playlist = tracks;
        window.musicPlayer.playlistSource = "playlist";
      }

      // Determine the best image URL
      let imageUrl = playlistData.image_url || 
                    playlistData.cover_url || 
                    playlistData.imageUrl ||
                    playlistData.coverUrl ||
                    playlistData.image ||
                    playlistData.cover;
      
      if (!imageUrl || imageUrl === 'placeholder.svg' || imageUrl.includes('placeholder')) {
        imageUrl = "https://misc.scdn.co/liked-songs/liked-songs-640.png";
      }
      
      console.log("Final image URL:", imageUrl);

      // Render playlist view
      const contentWrapper = document.querySelector(".content-wrapper");
      contentWrapper.innerHTML = `
        <section class="playlist-view-section">
          <div class="playlist-hero">
            <div class="hero-cover">
              <img src="${imageUrl}" alt="${playlistData.name || 'Playlist'}" 
                   onerror="this.src='https://misc.scdn.co/liked-songs/liked-songs-640.png'">
            </div>
            <div class="hero-info">
              <span class="hero-type">Playlist</span>
              <h1 class="hero-title">${playlistData.name || 'Unnamed Playlist'}</h1>
              ${playlistData.description ? `<p class="hero-description">${playlistData.description}</p>` : ''}
              <p class="hero-subtitle">${tracks.length} song${tracks.length !== 1 ? 's' : ''}</p>
              <div class="playlist-actions">
                ${tracks.length > 0 ? '<button class="hero-play-btn"><i class="fas fa-play"></i></button>' : ''}
                <button class="edit-playlist-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-playlist-btn"><i class="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          </div>
          <div class="track-list playlist-track-list"></div>
        </section>
      `;

      // Render tracks
      const trackList = contentWrapper.querySelector(".playlist-track-list");
      if (tracks.length === 0) {
        trackList.innerHTML = '<div class="empty">No tracks in this playlist yet. Click Edit to add tracks.</div>';
      } else {
        tracks.forEach((track, index) => {
          const trackItem = createPlaylistTrackItem(track, index, playlistData.id);
          trackList.appendChild(trackItem);
        });
      }

      // Setup action buttons
      const playBtn = contentWrapper.querySelector(".hero-play-btn");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          if (window.musicPlayer && tracks.length > 0) {
            window.musicPlayer.playlist = tracks;
            window.musicPlayer.playlistSource = "playlist";
            window.musicPlayer.currentTrackIndex = 0;
            window.musicPlayer.loadAndPlay(0);
          }
        });
      }

      const editBtn = contentWrapper.querySelector(".edit-playlist-btn");
      editBtn.addEventListener("click", () => {
        openPlaylistModal(playlistData);
      });

      const deleteBtn = contentWrapper.querySelector(".delete-playlist-btn");
      deleteBtn.addEventListener("click", () => {
        deletePlaylist(playlistData.id);
      });
    } catch (error) {
      console.error("Error viewing playlist:", error);
      console.error("Error details:", error.response);
      alert("Failed to load playlist");
    }
  }

  // ==================== CREATE PLAYLIST TRACK ITEM ====================
  function createPlaylistTrackItem(track, index, playlistId) {
    const item = document.createElement("div");
    item.className = "track-item";
    item.dataset.trackId = track.id || track.track_id;

    // Parse track data - handle nested structure
    const trackData = track.track || track;
    const trackId = trackData.id || track.id;
    const trackTitle = trackData.title || trackData.name || "Unknown Track";
    const trackArtist = trackData.artist_name || trackData.artist?.name || "Unknown Artist";
    const trackDuration = trackData.duration || 0;
    const trackImage = trackData.image_url || trackData.album?.image_url || "placeholder.svg?height=40&width=40";

    console.log("Rendering track:", { trackData, trackTitle, trackArtist, trackDuration, trackImage });

    item.innerHTML = `
      <div class="track-number">${index + 1}</div>
      <div class="track-image">
        <img src="${trackImage}" alt="${trackTitle}"
             onerror="this.src='placeholder.svg?height=40&width=40'">
      </div>
      <div class="track-info">
        <div class="track-name">${trackTitle}</div>
        <div class="track-artist">${trackArtist}</div>
      </div>
      <div class="track-duration">${formatDuration(trackDuration)}</div>
      <button class="remove-track-btn" title="Remove from playlist">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Play track
    item.addEventListener("click", (e) => {
      if (!e.target.closest(".remove-track-btn")) {
        if (window.musicPlayer) {
          window.musicPlayer.loadAndPlay(index);
        }
      }
    });

    // Remove track from playlist
    const removeBtn = item.querySelector(".remove-track-btn");
    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await removeTrackFromPlaylist(playlistId, trackId);
    });

    return item;
  }

  // ==================== REMOVE TRACK FROM PLAYLIST ====================
  async function removeTrackFromPlaylist(playlistId, trackId) {
    if (!confirm("Remove this track from playlist?")) return;

    try {
      // Use correct API endpoint
      await httpRequest.delete(`playlists/${playlistId}/tracks/${trackId}`);
      
      console.log(`Track ${trackId} removed from playlist ${playlistId}`);
      showNotification("Track removed from playlist");
      
      // Reload playlist view
      const response = await httpRequest.get(`playlists/${playlistId}`);
      const playlist = response.data?.playlist || response.playlist || response.data || response;
      if (playlist) {
        await viewPlaylist(playlist);
      }
    } catch (error) {
      console.error("Error removing track:", error);
      alert("Failed to remove track");
    }
  }

  // ==================== PLAYLIST CONTEXT MENU ====================
  function showPlaylistContextMenu(event, playlist) {
    const existingMenu = document.querySelector(".playlist-context-menu");
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement("div");
    menu.className = "playlist-context-menu";
    menu.innerHTML = `
      <button class="context-menu-item edit-playlist">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="context-menu-item delete-playlist">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;

    menu.style.position = "fixed";
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = "10000";

    document.body.appendChild(menu);

    // Edit playlist
    menu.querySelector(".edit-playlist").addEventListener("click", () => {
      openPlaylistModal(playlist);
      menu.remove();
    });

    // Delete playlist
    menu.querySelector(".delete-playlist").addEventListener("click", () => {
      deletePlaylist(playlist.id);
      menu.remove();
    });

    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener(
        "click",
        () => {
          menu.remove();
        },
        { once: true }
      );
    }, 0);
  }

  // ==================== OPEN CREATE/EDIT MODAL ====================
  function openPlaylistModal(playlist = null) {
    currentEditingPlaylist = playlist;
    selectedTracks = [];
    uploadedImageFile = null;

    // Update modal title
    const modalHeading = playlistModal.querySelector(".modal-heading");
    modalHeading.textContent = playlist ? "Edit Playlist" : "Create New Playlist";

    // Fill form if editing
    document.getElementById("playlistName").value = playlist?.name || "";
    document.getElementById("playlistDescription").value = playlist?.description || "";
    
    // Add or update image URL input
    let imageUrlInput = document.getElementById("playlistImageUrl");
    if (!imageUrlInput) {
      const imageGroup = document.querySelector("#playlistImage").closest(".form-group");
      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.id = "playlistImageUrl";
      urlInput.className = "form-input";
      urlInput.placeholder = "Or paste image URL here";
      urlInput.style.marginTop = "8px";
      imageGroup.appendChild(urlInput);
    } else {
      imageUrlInput.value = playlist?.image_url || "";
    }

    // Show modal
    playlistModal.classList.add("show");
    document.body.style.overflow = "hidden";

    // Setup track search if not already done
    if (!playlistModal.querySelector(".track-search-container")) {
      setupTrackSearch();
    }
  }

  // ==================== SETUP TRACK SEARCH IN MODAL ====================
  function setupTrackSearch() {
    const form = document.getElementById("playlistForm");
    const searchContainer = document.createElement("div");
    searchContainer.className = "track-search-container";
    searchContainer.innerHTML = `
      <h3>Add Tracks</h3>
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input type="text" class="search-input" placeholder="Search for tracks..." id="modalTrackSearch">
      </div>
      <div class="track-search-results"></div>
      <div class="selected-tracks">
        <h4>Selected Tracks (<span class="selected-count">0</span>)</h4>
        <div class="selected-tracks-list"></div>
      </div>
    `;

    form.insertBefore(searchContainer, form.querySelector("button[type='submit']"));

    const searchInput = searchContainer.querySelector("#modalTrackSearch");
    const searchResults = searchContainer.querySelector(".track-search-results");
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
      }

      searchTimeout = setTimeout(async () => {
        await searchTracksForPlaylist(query, searchResults);
      }, 300);
    });
  }

  // ==================== SEARCH TRACKS FOR PLAYLIST ====================
  async function searchTracksForPlaylist(query, resultsContainer) {
    try {
      resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

      const response = await httpRequest.get(
        `tracks?limit=10&offset=0&search=${encodeURIComponent(query)}`
      );
      const tracks = response.tracks || [];

      if (tracks.length === 0) {
        resultsContainer.innerHTML = '<div class="empty">No tracks found</div>';
        return;
      }

      resultsContainer.innerHTML = "";
      tracks.forEach((track) => {
        const trackItem = document.createElement("div");
        trackItem.className = "search-track-result";
        trackItem.innerHTML = `
          <img src="${track.image_url || "placeholder.svg?height=40&width=40"}" alt="${track.title}">
          <div class="track-info">
            <div class="track-name">${track.title}</div>
            <div class="track-artist">${track.artist_name || "Unknown"}</div>
          </div>
          <button class="add-track-btn">
            <i class="fas fa-plus"></i>
          </button>
        `;

        const addBtn = trackItem.querySelector(".add-track-btn");
        const isAlreadySelected = selectedTracks.some((t) => t.id === track.id);
        
        if (isAlreadySelected) {
          addBtn.innerHTML = '<i class="fas fa-check"></i>';
          addBtn.disabled = true;
        }

        addBtn.addEventListener("click", () => {
          addTrackToSelection(track);
          addBtn.innerHTML = '<i class="fas fa-check"></i>';
          addBtn.disabled = true;
        });

        resultsContainer.appendChild(trackItem);
      });
    } catch (error) {
      console.error("Error searching tracks:", error);
      resultsContainer.innerHTML = '<div class="error">Search failed</div>';
    }
  }

  // ==================== ADD TRACK TO SELECTION ====================
  function addTrackToSelection(track) {
    if (selectedTracks.some((t) => t.id === track.id)) return;

    selectedTracks.push(track);
    renderSelectedTracks();
  }

  // ==================== RENDER SELECTED TRACKS ====================
  function renderSelectedTracks() {
    const selectedList = playlistModal.querySelector(".selected-tracks-list");
    const selectedCount = playlistModal.querySelector(".selected-count");

    selectedCount.textContent = selectedTracks.length;
    selectedList.innerHTML = "";

    selectedTracks.forEach((track) => {
      const trackItem = document.createElement("div");
      trackItem.className = "selected-track-item";
      trackItem.innerHTML = `
        <img src="${track.image_url || "placeholder.svg?height=32&width=32"}" alt="${track.title}">
        <span>${track.title}</span>
        <button class="remove-selected-btn">
          <i class="fas fa-times"></i>
        </button>
      `;

      trackItem.querySelector(".remove-selected-btn").addEventListener("click", () => {
        selectedTracks = selectedTracks.filter((t) => t.id !== track.id);
        renderSelectedTracks();
      });

      selectedList.appendChild(trackItem);
    });
  }

  // ==================== HANDLE IMAGE UPLOAD ====================
  const imageInput = document.getElementById("playlistImage");
  imageInput.addEventListener("change", (e) => {
    uploadedImageFile = e.target.files[0];
  });

  // ==================== CLOSE MODAL ====================
  function closePlaylistModal() {
    playlistModal.classList.remove("show");
    document.body.style.overflow = "auto";
    playlistForm.reset();
    
    // Clear selected tracks
    selectedTracks = [];
    const selectedList = playlistModal.querySelector(".selected-tracks-list");
    const selectedCount = playlistModal.querySelector(".selected-count");
    if (selectedList) selectedList.innerHTML = "";
    if (selectedCount) selectedCount.textContent = "0";
    
    // Clear search results
    const searchResults = playlistModal.querySelector(".track-search-results");
    if (searchResults) searchResults.innerHTML = "";
    
    // Reset search input
    const searchInput = playlistModal.querySelector("#modalTrackSearch");
    if (searchInput) searchInput.value = "";
    
    currentEditingPlaylist = null;
    uploadedImageFile = null;
  }

  function closeModal() {
    closePlaylistModal();
  }

  playlistModalClose.addEventListener("click", closePlaylistModal);

  playlistModal.addEventListener("click", (e) => {
    if (e.target === playlistModal) {
      closePlaylistModal();
    }
  });

  // ==================== CREATE BTN ====================
  createBtn.addEventListener("click", () => {
    openPlaylistModal();
  });

  // ==================== FORM SUBMIT ====================
  playlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("playlistName").value.trim();
    const description = document.getElementById("playlistDescription").value.trim();

    if (!name) {
      alert("Please enter a playlist name");
      return;
    }

    try {
      const playlistData = {
        name: name,
      };

      // Only add description if it's not empty
      if (description && description.length > 0) {
        playlistData.description = description;
      }

      // If user provided direct URL (not uploading file), include it
      const imageUrlInput = document.getElementById("playlistImageUrl");
      const directImageUrl = imageUrlInput?.value.trim();
      if (directImageUrl) {
        playlistData.image_url = directImageUrl;
        console.log("Using direct image URL in playlist data:", directImageUrl);
      }

      console.log("Sending playlist data:", JSON.stringify(playlistData, null, 2));

      if (currentEditingPlaylist) {
        // Update existing playlist
        console.log("Updating playlist:", currentEditingPlaylist.id);
        const updateResponse = await httpRequest.put(`playlists/${currentEditingPlaylist.id}`, playlistData);
        console.log("Update response:", updateResponse);
        
        // Upload cover image if provided
        if (uploadedImageFile) {
          console.log("Uploading new cover for playlist:", currentEditingPlaylist.id);
          try {
            const formData = new FormData();
            formData.append("images", uploadedImageFile); // Field name is "images"

            const uploadResponse = await fetch(
              `https://spotify.f8team.dev/api/upload/images`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
              }
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              console.log("Image upload response:", uploadData);
              
              // Extract URL from response
              const uploadedUrl = uploadData.url || 
                                 uploadData.data?.url || 
                                 uploadData.urls?.[0] ||
                                 uploadData.data?.urls?.[0] ||
                                 uploadData.files?.[0]?.url;
              
              console.log("Extracted image URL:", uploadedUrl);
              
              if (uploadedUrl) {
                // Update playlist with the uploaded image URL
                try {
                  await httpRequest.put(`playlists/${currentEditingPlaylist.id}`, {
                    image_url: uploadedUrl
                  });
                  console.log("Updated playlist with new cover");
                  showNotification("Playlist updated with new cover");
                } catch (updateError) {
                  console.error("Could not update playlist with image:", updateError);
                }
              } else {
                console.warn("No URL in upload response:", uploadData);
              }
            } else {
              const errorText = await uploadResponse.text();
              console.error("Cover upload failed:", uploadResponse.status, errorText);
            }
          } catch (uploadError) {
            console.error("Cover upload error:", uploadError);
          }
        }
        
        // Get existing tracks first to avoid duplicates
        let existingTrackIds = [];
        try {
          const existingTracksResponse = await httpRequest.get(`playlists/${currentEditingPlaylist.id}/tracks`);
          const existingTracks = existingTracksResponse.data?.tracks || existingTracksResponse.tracks || [];
          existingTrackIds = existingTracks.map(t => t.track_id || t.id);
          console.log("Existing track IDs:", existingTrackIds);
        } catch (e) {
          console.log("Could not get existing tracks:", e);
        }
        
        // Add only new tracks
        if (selectedTracks.length > 0) {
          console.log("Adding new tracks to playlist");
          
          let addedCount = 0;
          let skippedCount = 0;
          
          for (let i = 0; i < selectedTracks.length; i++) {
            const track = selectedTracks[i];
            
            // Skip if track already exists
            if (existingTrackIds.includes(track.id)) {
              console.log(`Track ${track.id} already in playlist, skipping`);
              skippedCount++;
              continue;
            }
            
            try {
              await httpRequest.post(`playlists/${currentEditingPlaylist.id}/tracks`, {
                track_id: track.id,
                position: existingTrackIds.length + addedCount
              });
              console.log(`Added track ${track.id}`);
              addedCount++;
            } catch (trackError) {
              console.error(`Could not add track ${track.id}:`, trackError);
              if (trackError.status !== 409) {
                throw trackError;
              }
            }
          }
          
          console.log(`Added ${addedCount} tracks, skipped ${skippedCount} duplicates`);
          
          if (addedCount > 0) {
            showNotification(`Added ${addedCount} track${addedCount > 1 ? 's' : ''}`);
          } else if (skippedCount > 0) {
            showNotification("All tracks already in playlist");
          }
        } else if (!uploadedImageFile) {
          showNotification("Playlist updated successfully");
        }
        
        closeModal();
        
        // Reload the playlist view
        setTimeout(async () => {
          try {
            await loadUserPlaylists();
            const response = await httpRequest.get(`playlists/${currentEditingPlaylist.id}`);
            const updatedPlaylist = response.data?.playlist || response.playlist || response.data || response;
            if (updatedPlaylist && updatedPlaylist.id) {
              await viewPlaylist(updatedPlaylist);
            }
          } catch (e) {
            console.error("Could not reload playlist:", e);
          }
        }, 1000);
        
      } else {
        // Create new playlist
        console.log("Creating new playlist with data:", playlistData);
        const response = await httpRequest.post("playlists", playlistData);
        console.log("Create playlist response:", response);
        
        const newPlaylist = response.data?.playlist || response.playlist || response.data || response;
        console.log("New playlist created:", newPlaylist);

        // Upload cover image after creating playlist
        if (uploadedImageFile && newPlaylist.id) {
          console.log("Uploading cover for new playlist:", newPlaylist.id);
          try {
            const formData = new FormData();
            formData.append("images", uploadedImageFile); // Field name is "images"

            const uploadResponse = await fetch(
              `https://spotify.f8team.dev/api/upload/images`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
              }
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              console.log("Image upload response:", uploadData);
              
              // Extract URL from response
              const uploadedUrl = uploadData.url || 
                                 uploadData.data?.url || 
                                 uploadData.urls?.[0] ||
                                 uploadData.data?.urls?.[0] ||
                                 uploadData.files?.[0]?.url;
              
              console.log("Extracted image URL:", uploadedUrl);
              
              if (uploadedUrl) {
                // Update playlist with the uploaded image URL
                try {
                  await httpRequest.put(`playlists/${newPlaylist.id}`, {
                    image_url: uploadedUrl
                  });
                  console.log("Updated playlist with image URL");
                  showNotification("Playlist created with cover image");
                } catch (updateError) {
                  console.error("Could not update playlist with image:", updateError);
                  showNotification("Image uploaded but could not update playlist");
                }
              } else {
                console.warn("No URL in upload response:", uploadData);
                showNotification("Image upload completed but URL not found");
              }
            } else {
              const errorText = await uploadResponse.text();
              console.error("Cover upload failed:", uploadResponse.status, errorText);
              showNotification("Playlist created but cover upload failed");
            }
          } catch (uploadError) {
            console.error("Cover upload error:", uploadError);
            showNotification("Playlist created but cover upload failed");
          }
        }

        // Add tracks to new playlist
        if (selectedTracks.length > 0 && newPlaylist.id) {
          console.log("Adding tracks to new playlist:", selectedTracks);
          
          let addedCount = 0;
          
          for (let i = 0; i < selectedTracks.length; i++) {
            const track = selectedTracks[i];
            try {
              await httpRequest.post(`playlists/${newPlaylist.id}/tracks`, {
                track_id: track.id,
                position: i
              });
              console.log(`Added track ${track.id} at position ${i}`);
              addedCount++;
            } catch (trackError) {
              console.error(`Could not add track ${track.id}:`, trackError);
            }
          }
          
          console.log(`Successfully added ${addedCount}/${selectedTracks.length} tracks`);
          
          if (addedCount === 0) {
            alert("Playlist created but could not add any tracks");
          } else if (addedCount < selectedTracks.length) {
            alert(`Playlist created with ${addedCount} out of ${selectedTracks.length} tracks`);
          }
        }

        if (!uploadedImageFile && selectedTracks.length === 0) {
          showNotification("Playlist created successfully");
        }
        
        closeModal();
        
        // Wait for backend to process, then reload
        setTimeout(async () => {
          await loadUserPlaylists();
          
          // Fetch and display the new playlist
          try {
            const freshResponse = await httpRequest.get(`playlists/${newPlaylist.id}`);
            const freshPlaylist = freshResponse.data?.playlist || freshResponse.playlist || freshResponse.data || freshResponse;
            if (freshPlaylist && freshPlaylist.id) {
              await viewPlaylist(freshPlaylist);
            }
          } catch (viewError) {
            console.error("Could not load new playlist view:", viewError);
          }
        }, 1000);
      }

      closePlaylistModal();
      await loadUserPlaylists();
    } catch (error) {
      console.error("Error saving playlist:", error);
      console.error("Error details:", error.response);
      
      let errorMessage = "Failed to save playlist";
      if (error.response?.error?.message) {
        errorMessage = error.response.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  });

  // ==================== DELETE PLAYLIST ====================
  async function deletePlaylist(playlistId) {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await httpRequest.delete(`playlists/${playlistId}`);
      showNotification("Playlist deleted");
      await loadUserPlaylists();
      showHomePage();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Failed to delete playlist");
    }
  }

  // ==================== HELPER FUNCTIONS ====================
  function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #1db954;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideUp 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideDown 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
});


// ==================== RECENT SORT FUNCTIONALITY ====================
document.addEventListener("DOMContentLoaded", () => {
  const sortBtn = document.querySelector(".sort-btn");
  if (!sortBtn) return;

  // Create sort modal
  const sortModal = document.createElement("div");
  sortModal.className = "sort-modal";
  sortModal.style.display = "none";
  sortModal.innerHTML = `
    <div class="sort-modal-content">
      <div class="sort-section">
        <h4>Sort by</h4>
        <button class="sort-option active" data-sort="recent">
          <i class="fas fa-clock"></i>
          <span>Recent</span>
          <i class="fas fa-check sort-check"></i>
        </button>
        <button class="sort-option" data-sort="alphabetical">
          <i class="fas fa-sort-alpha-down"></i>
          <span>Alphabetical</span>
          <i class="fas fa-check sort-check"></i>
        </button>
        <button class="sort-option" data-sort="creator">
          <i class="fas fa-user"></i>
          <span>Creator</span>
          <i class="fas fa-check sort-check"></i>
        </button>
      </div>
      <div class="sort-divider"></div>
      <div class="sort-section">
        <h4>View as</h4>
        <button class="view-option active" data-view="list">
          <i class="fas fa-list"></i>
          <span>List</span>
          <i class="fas fa-check sort-check"></i>
        </button>
        <button class="view-option" data-view="compact">
          <i class="fas fa-grip-horizontal"></i>
          <span>Compact</span>
          <i class="fas fa-check sort-check"></i>
        </button>
        <button class="view-option" data-view="grid">
          <i class="fas fa-th"></i>
          <span>Grid</span>
          <i class="fas fa-check sort-check"></i>
        </button>
      </div>
    </div>
  `;

  // Insert modal after sort button
  sortBtn.parentElement.appendChild(sortModal);

  // State management
  let currentSort = localStorage.getItem("playlist-sort") || "recent";
  let currentView = localStorage.getItem("playlist-view") || "list";

  // Update button text
  function updateSortButtonText() {
    const sortText = sortBtn.querySelector("span") || sortBtn.childNodes[0];
    const sortLabels = {
      recent: "Recents",
      alphabetical: "A-Z",
      creator: "Creator"
    };
    
    if (sortText && sortText.nodeType === Node.TEXT_NODE) {
      sortText.textContent = sortLabels[currentSort] || "Recents";
    } else {
      const textNode = Array.from(sortBtn.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = sortLabels[currentSort] || "Recents";
      }
    }
  }

  // Toggle modal
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = sortModal.style.display === "block";
    sortModal.style.display = isVisible ? "none" : "block";
    
    if (!isVisible) {
      // Position modal below button
      const rect = sortBtn.getBoundingClientRect();
      sortModal.style.position = "absolute";
      sortModal.style.top = `${rect.bottom + 8}px`;
      sortModal.style.left = `${rect.left}px`;
      sortModal.style.minWidth = `${rect.width}px`;
    }
  });

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    if (!sortModal.contains(e.target) && !sortBtn.contains(e.target)) {
      sortModal.style.display = "none";
    }
  });

  // Sort option handlers
  sortModal.querySelectorAll(".sort-option").forEach((option) => {
    option.addEventListener("click", () => {
      const sortType = option.dataset.sort;
      currentSort = sortType;
      localStorage.setItem("playlist-sort", sortType);
      
      // Update active states
      sortModal.querySelectorAll(".sort-option").forEach((opt) => {
        opt.classList.remove("active");
      });
      option.classList.add("active");
      
      // Update button text
      updateSortButtonText();
      
      // Apply sorting
      applySortAndView();
    });
  });

  // View option handlers
  sortModal.querySelectorAll(".view-option").forEach((option) => {
    option.addEventListener("click", () => {
      const viewType = option.dataset.view;
      currentView = viewType;
      localStorage.setItem("playlist-view", viewType);
      
      // Update active states
      sortModal.querySelectorAll(".view-option").forEach((opt) => {
        opt.classList.remove("active");
      });
      option.classList.add("active");
      
      // Apply view
      applySortAndView();
    });
  });

  // Apply sorting and view changes
  function applySortAndView() {
    const libraryContent = document.querySelector(".library-content");
    const playlistsContainer = libraryContent?.querySelector(".library-playlists");
    if (!playlistsContainer) return;

    // Get all playlist items (excluding Liked Songs)
    const likedSongsItem = playlistsContainer.querySelector(".library-item");
    const items = Array.from(playlistsContainer.querySelectorAll(".library-item")).filter(item => {
      const title = item.querySelector(".item-title")?.textContent || "";
      return !title.includes("Liked Songs");
    });

    // Sort items
    items.sort((a, b) => {
      const titleA = a.querySelector(".item-title")?.textContent || "";
      const titleB = b.querySelector(".item-title")?.textContent || "";
      
      switch (currentSort) {
        case "alphabetical":
          return titleA.localeCompare(titleB);
        case "creator":
          // For now, sort by title since we don't have creator info
          return titleA.localeCompare(titleB);
        case "recent":
        default:
          // Keep original order (most recent first)
          return 0;
      }
    });

    // Clear container
    playlistsContainer.innerHTML = "";
    
    // Apply view style to container
    playlistsContainer.classList.remove("view-list", "view-compact", "view-grid");
    playlistsContainer.classList.add(`view-${currentView}`);

    // Re-append Liked Songs first
    if (likedSongsItem) {
      likedSongsItem.classList.remove("view-list", "view-compact", "view-grid");
      likedSongsItem.classList.add(`view-${currentView}`);
      playlistsContainer.appendChild(likedSongsItem);
    }

    // Append sorted items
    items.forEach((item) => {
      item.classList.remove("view-list", "view-compact", "view-grid");
      item.classList.add(`view-${currentView}`);
      playlistsContainer.appendChild(item);
    });
  }

  // Initialize with saved preferences
  const savedSortOption = sortModal.querySelector(`[data-sort="${currentSort}"]`);
  const savedViewOption = sortModal.querySelector(`[data-view="${currentView}"]`);
  
  if (savedSortOption) {
    sortModal.querySelectorAll(".sort-option").forEach(opt => opt.classList.remove("active"));
    savedSortOption.classList.add("active");
  }
  
  if (savedViewOption) {
    sortModal.querySelectorAll(".view-option").forEach(opt => opt.classList.remove("active"));
    savedViewOption.classList.add("active");
  }

  updateSortButtonText();
  applySortAndView();
});

// ==================== SIDEBAR SEARCH FUNCTIONALITY ====================
document.addEventListener("DOMContentLoaded", () => {
  const searchLibraryBtn = document.querySelector(".search-library-btn");
  const searchLibrary = document.querySelector(".search-library");
  
  if (!searchLibraryBtn || !searchLibrary) return;

  // Create search input container
  const searchInputContainer = document.createElement("div");
  searchInputContainer.className = "sidebar-search-input-container";
  searchInputContainer.style.display = "none";
  searchInputContainer.innerHTML = `
    <input 
      type="text" 
      class="sidebar-search-input" 
      placeholder="Search in Your Library"
      autocomplete="off"
    />
    <button class="sidebar-search-close">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Insert after search library section
  searchLibrary.parentElement.insertBefore(
    searchInputContainer,
    searchLibrary.nextSibling
  );

  const searchInput = searchInputContainer.querySelector(".sidebar-search-input");
  const closeBtn = searchInputContainer.querySelector(".sidebar-search-close");

  let isSearchOpen = false;
  let originalContent = null;

  // Toggle search input
  searchLibraryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    if (!isSearchOpen) {
      openSidebarSearch();
    }
  });

  // Close search
  closeBtn.addEventListener("click", () => {
    closeSidebarSearch();
  });

  // Handle search input
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();

    searchTimeout = setTimeout(() => {
      performLibrarySearch(query);
    }, 300);
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSearchOpen) {
      closeSidebarSearch();
    }
  });

  function openSidebarSearch() {
    isSearchOpen = true;
    searchInputContainer.style.display = "flex";
    searchLibraryBtn.classList.add("active");
    searchInput.focus();

    // Save original content
    const libraryContent = document.querySelector(".library-content");
    const playlistsContainer = libraryContent?.querySelector(".library-playlists");
    const artistsContainer = libraryContent?.querySelector(".library-artists");
    
    if (playlistsContainer) {
      originalContent = {
        playlists: playlistsContainer.cloneNode(true),
        artists: artistsContainer ? artistsContainer.cloneNode(true) : null
      };
    }
  }

  function closeSidebarSearch() {
    isSearchOpen = false;
    searchInputContainer.style.display = "none";
    searchLibraryBtn.classList.remove("active");
    searchInput.value = "";

    // Restore original content
    if (originalContent) {
      const libraryContent = document.querySelector(".library-content");
      const playlistsContainer = libraryContent?.querySelector(".library-playlists");
      const artistsContainer = libraryContent?.querySelector(".library-artists");

      if (playlistsContainer && originalContent.playlists) {
        playlistsContainer.innerHTML = originalContent.playlists.innerHTML;
      }

      if (artistsContainer && originalContent.artists) {
        artistsContainer.innerHTML = originalContent.artists.innerHTML;
      }

      originalContent = null;
    }

    // Reapply view settings
    const currentView = localStorage.getItem("playlist-view") || "list";
    const libraryContent = document.querySelector(".library-content");
    const playlistsContainer = libraryContent?.querySelector(".library-playlists");
    
    if (playlistsContainer) {
      playlistsContainer.classList.remove("view-list", "view-compact", "view-grid");
      playlistsContainer.classList.add(`view-${currentView}`);

      playlistsContainer.querySelectorAll(".library-item").forEach(item => {
        item.classList.remove("view-list", "view-compact", "view-grid");
        item.classList.add(`view-${currentView}`);
      });
    }
  }

  function performLibrarySearch(query) {
    const libraryContent = document.querySelector(".library-content");
    const playlistsContainer = libraryContent?.querySelector(".library-playlists");
    const artistsContainer = libraryContent?.querySelector(".library-artists");

    // Get active tab
    const activeTab = document.querySelector(".nav-tab.active");
    const isPlaylistTab = activeTab?.textContent.includes("Playlists");
    const isArtistTab = activeTab?.textContent.includes("Artists");

    if (query === "") {
      // Show all items when search is empty
      if (playlistsContainer) {
        playlistsContainer.querySelectorAll(".library-item").forEach(item => {
          item.style.display = "";
        });
      }

      if (artistsContainer) {
        artistsContainer.querySelectorAll(".library-item").forEach(item => {
          item.style.display = "";
        });
      }
      return;
    }

    // Search in playlists
    if (isPlaylistTab && playlistsContainer) {
      const items = playlistsContainer.querySelectorAll(".library-item");
      let visibleCount = 0;

      items.forEach(item => {
        const title = item.querySelector(".item-title")?.textContent.toLowerCase() || "";
        const subtitle = item.querySelector(".item-subtitle")?.textContent.toLowerCase() || "";

        if (title.includes(query) || subtitle.includes(query)) {
          item.style.display = "";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Show "no results" message
      let noResultsMsg = playlistsContainer.querySelector(".search-no-results");
      if (visibleCount === 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement("div");
          noResultsMsg.className = "search-no-results";
          noResultsMsg.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No playlists found for "${query}"</p>
          `;
          playlistsContainer.appendChild(noResultsMsg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }

    // Search in artists
    if (isArtistTab && artistsContainer) {
      const items = artistsContainer.querySelectorAll(".library-item");
      let visibleCount = 0;

      items.forEach(item => {
        const name = item.querySelector(".item-title")?.textContent.toLowerCase() || "";
        const type = item.querySelector(".item-subtitle")?.textContent.toLowerCase() || "";

        if (name.includes(query) || type.includes(query)) {
          item.style.display = "";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Show "no results" message
      let noResultsMsg = artistsContainer.querySelector(".search-no-results");
      if (visibleCount === 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement("div");
          noResultsMsg.className = "search-no-results";
          noResultsMsg.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No artists found for "${query}"</p>
          `;
          artistsContainer.appendChild(noResultsMsg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
  }
});