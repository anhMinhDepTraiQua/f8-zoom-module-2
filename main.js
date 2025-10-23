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
      localStorage.removeItem("playlist");
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
    // Nếu đã tồn tại, chỉ cần hiển thị lại
    hitsSection.style.display = "block";
    artistsSection.style.display = "block";
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
  // === Playlist Creation Logic (replaces buggy old behavior) ===
let tempPlaylist = JSON.parse(localStorage.getItem("tempPlaylist")) || { name: "", tracks: [] };

function addTrackToTempPlaylist(track) {
  if (!track || !track.id) return;
  const exists = tempPlaylist.tracks.some(t => t.id === track.id);
  if (!exists) {
    tempPlaylist.tracks.push(track);
    localStorage.setItem("tempPlaylist", JSON.stringify(tempPlaylist));
  }
}

function clearTempPlaylist() {
  tempPlaylist = { name: "", tracks: [] };
  localStorage.removeItem("tempPlaylist");
}

async function saveTempPlaylistToServer(name) {
  if (!name) throw new Error("Playlist name required");
  if (!tempPlaylist.tracks.length) throw new Error("No tracks in playlist");

  const created = await httpRequest.post("playlists", { name });
  const playlistId = created?.playlist?.id;
  if (!playlistId) throw new Error("Failed to create playlist ID");

  for (const track of tempPlaylist.tracks) {
    try {
      await httpRequest.post(`playlists/${playlistId}/tracks`, {
        track_id: track.id,
      });
    } catch (err) {
      console.error("Failed to add track:", track.id, err);
    }
  }

  clearTempPlaylist();
  return created;
}



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

// Thêm vào cuối file main.js

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

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector(".add-btn");
  const playlistModal = document.getElementById("playlistModal"); // modal có sẵn của bạn
  const playlistNameInput = document.getElementById("playlistName"); // input đặt tên
  const addedTracksList = document.getElementById("addedTracksList"); // danh sách hiển thị bài đã thêm
  const savePlaylistBtn = document.getElementById("savePlaylistBtn");
  const closePlaylistModal = document.getElementById("closePlaylistModal");

  if (!addBtn || !playlistModal) return;

  // Mở modal và thêm bài đang phát vào playlist tạm
  addBtn.addEventListener("click", () => {
    const currentTrack =
      window.musicPlayer?.playlist?.[window.musicPlayer.currentTrackIndex];
    if (!currentTrack) return alert("Không có bài hát nào đang phát");

    addTrackToTempPlaylist(currentTrack);
    renderTempPlaylistTracks();
    playlistModal.style.display = "flex";
  });

  // Render danh sách bài hát tạm
  function renderTempPlaylistTracks() {
    if (!addedTracksList) return;
    addedTracksList.innerHTML = "";
    tempPlaylist.tracks.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.title} – ${t.artist_name || "Unknown"}`;
      addedTracksList.appendChild(li);
    });
  }

  // Nút Lưu Playlist
  savePlaylistBtn?.addEventListener("click", async () => {
    const name = playlistNameInput?.value?.trim();
    if (!name) return alert("Hãy nhập tên playlist");
    if (tempPlaylist.tracks.length === 0)
      return alert("Playlist chưa có bài hát nào");

    try {
      await saveTempPlaylistToServer(name);
      alert("Tạo playlist thành công!");
      playlistModal.style.display = "none";
      fetchAndRenderPlaylists(); // load lại sidebar
    } catch (err) {
      console.error("Save playlist error:", err);
      alert("Không thể lưu playlist. Thử lại sau.");
    }
  });

  closePlaylistModal?.addEventListener("click", () => {
    playlistModal.style.display = "none";
  });
});
// ==================== PLAYLIST MANAGEMENT ====================
document.addEventListener("DOMContentLoaded", async () => {
  const createBtn = document.querySelector(".create-btn");
  const playlistModal = document.getElementById("playlistModal");
  const playlistModalClose = document.getElementById("playlistModalClose");
  const playlistForm = document.getElementById("playlistForm");
  const playlistNameInput = document.getElementById("playlistName");
  const playlistDescriptionInput = document.getElementById("playlistDescription");
  const playlistImageInput = document.getElementById("playlistImage");
  const libraryContent = document.querySelector(".library-content");

  let selectedTracksForPlaylist = []; // Danh sách bài hát được chọn để thêm vào playlist

  // Mở modal tạo playlist
  if (createBtn && playlistModal) {
    createBtn.addEventListener("click", () => {
      playlistModal.classList.add("show");
      document.body.style.overflow = "hidden";
      
      // Reset form và selected tracks
      if (playlistForm) playlistForm.reset();
      selectedTracksForPlaylist = [];
      
      // Reset preview
      const preview = playlistModal.querySelector(".image-preview");
      if (preview) preview.style.display = "none";
      
      // Hiển thị phần chọn bài hát
      renderTrackSelector();
    });
  }

  // Preview ảnh khi upload
  if (playlistImageInput) {
    playlistImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          let preview = playlistModal.querySelector(".image-preview");
          if (!preview) {
            preview = document.createElement("div");
            preview.className = "image-preview";
            preview.style.cssText = `
              margin-top: 12px;
              width: 200px;
              height: 200px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            playlistImageInput.parentElement.appendChild(preview);
          }
          preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Render phần chọn bài hát trong modal
  function renderTrackSelector() {
    let trackSelector = playlistModal.querySelector(".track-selector");
    if (!trackSelector) {
      trackSelector = document.createElement("div");
      trackSelector.className = "track-selector";
      trackSelector.style.cssText = `
        margin-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
        padding-top: 20px;
      `;
      
      trackSelector.innerHTML = `
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Add Songs (Optional)</h3>
        <div class="search-tracks" style="margin-bottom: 16px;">
          <input type="text" id="trackSearchInput" placeholder="Search for songs..." 
            style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); 
            border-radius: 4px; color: white; font-size: 14px;">
        </div>
        <div class="selected-tracks-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;"></div>
        <div class="available-tracks-list" style="max-height: 300px; overflow-y: auto;"></div>
      `;
      
      playlistForm.insertBefore(trackSelector, playlistForm.querySelector('button[type="submit"]'));
    }

    updateSelectedTracksList();
    loadAvailableTracks();
    setupTrackSearch();
  }

  // Load danh sách bài hát có thể thêm
  async function loadAvailableTracks(searchQuery = "") {
    const availableList = playlistModal.querySelector(".available-tracks-list");
    if (!availableList) return;

    availableList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">Loading...</div>';

    try {
      const endpoint = searchQuery 
        ? `tracks?limit=20&offset=0&search=${encodeURIComponent(searchQuery)}`
        : "tracks/trending?limit=20";
      
      const response = await httpRequest.get(endpoint);
      let tracks = response.tracks || [];

      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        tracks = tracks.filter(t => 
          t.title?.toLowerCase().includes(term) || 
          t.artist_name?.toLowerCase().includes(term)
        );
      }

      if (tracks.length === 0) {
        availableList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">No songs found</div>';
        return;
      }

      availableList.innerHTML = "";
      tracks.forEach(track => {
        const isSelected = selectedTracksForPlaylist.some(t => t.id === track.id);
        
        const trackItem = document.createElement("div");
        trackItem.className = "track-selector-item";
        trackItem.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          ${isSelected ? 'background: rgba(29, 185, 84, 0.2);' : ''}
        `;
        
        trackItem.innerHTML = `
          <img src="${track.image_url || 'placeholder.svg?height=40&width=40'}" 
            style="width: 40px; height: 40px; border-radius: 4px;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${track.title}
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${track.artist_name || 'Unknown'}
            </div>
          </div>
          <div class="track-select-icon" style="width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.6); 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${isSelected ? '<i class="fas fa-check" style="color: #1db954; font-size: 12px;"></i>' : ''}
          </div>
        `;

        trackItem.addEventListener("mouseenter", () => {
          if (!isSelected) trackItem.style.background = "rgba(255,255,255,0.1)";
        });
        trackItem.addEventListener("mouseleave", () => {
          if (!isSelected) trackItem.style.background = "";
        });

        trackItem.addEventListener("click", () => {
          if (isSelected) {
            selectedTracksForPlaylist = selectedTracksForPlaylist.filter(t => t.id !== track.id);
          } else {
            selectedTracksForPlaylist.push(track);
          }
          loadAvailableTracks(searchQuery);
          updateSelectedTracksList();
        });

        availableList.appendChild(trackItem);
      });

    } catch (error) {
      console.error("Error loading tracks:", error);
      availableList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">Failed to load songs</div>';
    }
  }

  // Setup search tracks
  function setupTrackSearch() {
    const searchInput = playlistModal.querySelector("#trackSearchInput");
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadAvailableTracks(e.target.value);
      }, 300);
    });
  }

  // Update danh sách bài hát đã chọn
  function updateSelectedTracksList() {
    const selectedList = playlistModal.querySelector(".selected-tracks-list");
    if (!selectedList) return;

    if (selectedTracksForPlaylist.length === 0) {
      selectedList.innerHTML = "";
      return;
    }

    selectedList.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #1db954;">
        Selected: ${selectedTracksForPlaylist.length} songs
      </div>
    `;

    selectedTracksForPlaylist.forEach(track => {
      const item = document.createElement("div");
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: rgba(29, 185, 84, 0.1);
        border-radius: 4px;
        margin-bottom: 4px;
      `;
      
      item.innerHTML = `
        <img src="${track.image_url || 'placeholder.svg?height=32&width=32'}" 
          style="width: 32px; height: 32px; border-radius: 4px;">
        <div style="flex: 1; min-width: 0; font-size: 13px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
        </div>
        <button class="remove-track-btn" style="background: none; border: none; color: rgba(255,255,255,0.6); 
          cursor: pointer; padding: 4px;">
          <i class="fas fa-times"></i>
        </button>
      `;

      item.querySelector(".remove-track-btn").addEventListener("click", () => {
        selectedTracksForPlaylist = selectedTracksForPlaylist.filter(t => t.id !== track.id);
        updateSelectedTracksList();
        loadAvailableTracks(playlistModal.querySelector("#trackSearchInput")?.value || "");
      });

      selectedList.appendChild(item);
    });
  }

  // Đóng modal
  if (playlistModalClose) {
    playlistModalClose.addEventListener("click", () => {
      playlistModal.classList.remove("show");
      document.body.style.overflow = "auto";
    });
  }

  if (playlistModal) {
    playlistModal.addEventListener("click", (e) => {
      if (e.target === playlistModal) {
        playlistModal.classList.remove("show");
        document.body.style.overflow = "auto";
      }
    });
  }

  // Submit form tạo playlist
  if (playlistForm) {
    playlistForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const name = playlistNameInput.value.trim();
      const description = playlistDescriptionInput.value.trim();
      const imageFile = playlistImageInput.files && playlistImageInput.files[0];
      
      if (!name) {
        alert("Please enter a playlist name");
        return;
      }

      try {
        const submitBtn = playlistForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Creating...";
        }

        // 1. Tạo playlist
        const playlistData = { name };
        if (description) playlistData.description = description;

        const response = await httpRequest.post("playlists", playlistData);
        const playlistId = response.playlist?.id || response.id;
        console.log("Playlist created:", playlistId);

        // 2. Upload image nếu có
        if (imageFile && playlistId) {
          try {
            const formData = new FormData();
            formData.append("image", imageFile);
            
            // Thử upload với FormData
            await fetch(`https://spotify.f8team.dev/api/playlists/${playlistId}/image`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
              },
              body: formData
            });
            console.log("Image uploaded");
          } catch (imgError) {
            console.log("Image upload failed:", imgError);
          }
        }

        // 3. Thêm các bài hát đã chọn vào playlist
        if (selectedTracksForPlaylist.length > 0) {
          for (const track of selectedTracksForPlaylist) {
            try {
              await httpRequest.post(`playlists/${playlistId}/tracks`, {
                track_id: track.id
              });
            } catch (err) {
              console.error(`Failed to add track ${track.id}:`, err);
            }
          }
          console.log(`Added ${selectedTracksForPlaylist.length} tracks to playlist`);
        }

        // Đóng modal
        playlistModal.classList.remove("show");
        document.body.style.overflow = "auto";

        // Refresh playlist
        await fetchAndRenderPlaylists();
        showNotification("Playlist created successfully!");

        // Reset
        playlistForm.reset();
        selectedTracksForPlaylist = [];
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create";
        }

      } catch (error) {
        console.error("Error creating playlist:", error);
        alert("Failed to create playlist. Please try again.");
        
        const submitBtn = playlistForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create";
        }
      }
    });
  }

  // Fetch và render playlists
  async function fetchAndRenderPlaylists() {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const response = await httpRequest.get("me/playlists");
      const playlists = response.playlists || response.data?.playlists || [];
      
      renderPlaylistsInSidebar(playlists);

    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  }

  // Render playlists trong sidebar
  function renderPlaylistsInSidebar(playlists) {
    if (!libraryContent) return;

    const likedSongsItem = libraryContent.querySelector(".library-item");
    if (!likedSongsItem) return;

    const oldPlaylistItems = libraryContent.querySelectorAll(".library-item.playlist-item");
    oldPlaylistItems.forEach(item => item.remove());

    playlists.forEach(playlist => {
      const playlistItem = createPlaylistItem(playlist);
      likedSongsItem.insertAdjacentElement("afterend", playlistItem);
    });
  }

  // Tạo playlist item
  function createPlaylistItem(playlist) {
    const item = document.createElement("div");
    item.className = "library-item playlist-item";
    item.dataset.playlistId = playlist.id;

    const imageUrl = playlist.image_url || "placeholder.svg?height=48&width=48";
    const trackCount = playlist.track_count || 0;

    item.innerHTML = `
      <img src="${imageUrl}" alt="${playlist.name}" class="item-image" />
      <div class="item-info">
        <div class="item-title">${playlist.name}</div>
        <div class="item-subtitle">Playlist • ${trackCount} songs</div>
      </div>
    `;

    item.addEventListener("click", () => {
      showPlaylistDetail(playlist.id);
    });

    return item;
  }

  // Hiển thị chi tiết playlist
  async function showPlaylistDetail(playlistId) {
    try {
      console.log("Loading playlist:", playlistId);

      // Ẩn home sections
      const hitsSection = document.querySelector(".hits-section");
      const artistsSection = document.querySelector(".artists-section");
      if (hitsSection) hitsSection.style.display = "none";
      if (artistsSection) artistsSection.style.display = "none";

      // Ẩn artist profile sections
      const artistHero = document.querySelector(".artist-hero");
      const artistControls = document.querySelector(".artist-controls");
      const popularSection = document.querySelector(".popular-section");
      if (artistHero) artistHero.style.display = "none";
      if (artistControls) artistControls.style.display = "none";
      if (popularSection) popularSection.style.display = "none";

      // Hiển thị back button
      const backBtn = document.querySelector(".back-btn");
      if (backBtn) backBtn.style.display = "flex";

      // Fetch playlist
      const playlist = await httpRequest.get(`playlists/${playlistId}`);
      console.log("Playlist data:", playlist);

      // Render
      renderPlaylistDetailPage(playlist);

    } catch (error) {
      console.error("Error loading playlist:", error);
      alert("Failed to load playlist");
      hideArtistProfile();
    }
  }

  // Render chi tiết playlist
  function renderPlaylistDetailPage(playlist) {
    const contentWrapper = document.querySelector(".content-wrapper");
    if (!contentWrapper) return;

    const tracks = playlist.tracks || [];
    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

    // Xác định image
    let imageUrl = playlist.image_url;
    if (!imageUrl && tracks.length > 0) imageUrl = tracks[0].image_url;
    if (!imageUrl) imageUrl = `https://via.placeholder.com/300/1db954/ffffff?text=${encodeURIComponent(playlist.name.substring(0, 2).toUpperCase())}`;

    // Clear và render mới
    contentWrapper.innerHTML = "";

    // Hero section
    const heroSection = document.createElement("section");
    heroSection.className = "playlist-detail-hero";
    heroSection.style.cssText = `
      background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, #121212 100%);
      padding: 80px 32px 24px;
      display: flex;
      align-items: flex-end;
      gap: 24px;
      min-height: 340px;
    `;

    heroSection.innerHTML = `
      <div style="width: 232px; height: 232px; box-shadow: 0 4px 60px rgba(0,0,0,.5); flex-shrink: 0; border-radius: 4px; overflow: hidden;">
        <img src="${imageUrl}" alt="${playlist.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 8px;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Playlist</span>
        <h1 style="font-size: 48px; font-weight: 900; line-height: 1.2; margin: 8px 0; word-break: break-word;">${playlist.name}</h1>
        ${playlist.description ? `<p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 8px 0;">${playlist.description}</p>` : ''}
        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-top: 8px;">
          <span>${playlist.owner?.username || 'Unknown'}</span>
          <span style="font-size: 10px;">•</span>
          <span>${tracks.length} songs</span>
          ${totalDuration > 0 ? `<span style="font-size: 10px;">•</span><span style="color: rgba(255,255,255,0.7);">${durationText}</span>` : ''}
        </div>
      </div>
    `;
    contentWrapper.appendChild(heroSection);

    // Controls
const controlsSection = document.createElement("section");
controlsSection.style.cssText = `
  padding: 24px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  background: linear-gradient(rgba(0,0,0,.6) 0, #121212 100%);
`;
controlsSection.innerHTML = `
  <button class="play-btn-large" style="width: 56px; height: 56px; border-radius: 50%; background: #1db954; border: none; 
    color: #000; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; 
    transition: transform 0.2s;">
    <i class="fas fa-play" style="margin-left: 3px;"></i>
  </button>
  <button class="delete-playlist-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.8); padding: 8px 16px; border-radius: 20px; font-size: 14px;
    cursor: pointer; transition: all 0.2s;">
    <i class="fas fa-trash"></i> Delete Playlist
  </button>
`;
contentWrapper.appendChild(controlsSection);

// Nút play animation
const playBtn = controlsSection.querySelector(".play-btn-large");
playBtn.addEventListener("mouseenter", () => playBtn.style.transform = "scale(1.06)");
playBtn.addEventListener("mouseleave", () => playBtn.style.transform = "scale(1)");
playBtn.addEventListener("click", () => {
  if (tracks.length > 0 && window.musicPlayer) {
    window.musicPlayer.playlist = tracks;
    window.musicPlayer.playlistSource = "playlist";
    window.musicPlayer.loadAndPlay(0);
  }
});

//Nút XÓA PLAYLIST
const deleteBtn = controlsSection.querySelector(".delete-playlist-btn");
deleteBtn.addEventListener("mouseenter", () => {
  deleteBtn.style.background = "rgba(255,0,0,0.2)";
  deleteBtn.style.color = "#ff4d4d";
});
deleteBtn.addEventListener("mouseleave", () => {
  deleteBtn.style.background = "transparent";
  deleteBtn.style.color = "rgba(255,255,255,0.8)";
});

deleteBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this playlist?")) return;

  try {
    const accessToken = localStorage.getItem("access_token");
    await fetch(`https://spotify.f8team.dev/api/playlists/${playlist.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    showNotification("Playlist deleted successfully!");

    // Quay về giao diện chính
    const contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) contentWrapper.innerHTML = "";
    const hitsSection = document.querySelector(".hits-section");
    const artistsSection = document.querySelector(".artists-section");
    if (hitsSection) hitsSection.style.display = "";
    if (artistsSection) artistsSection.style.display = "";

    const backBtn = document.querySelector(".back-btn");
    if (backBtn) backBtn.style.display = "none";

    await fetchAndRenderPlaylists();
  } catch (err) {
    console.error("Failed to delete playlist:", err);
    alert("Failed to delete playlist. Please try again.");
  }
});

  }

  // Render tracks
  function renderPlaylistTracks(tracks, container) {
    container.innerHTML = "";

    tracks.forEach((track, index) => {
      const item = document.createElement("div");
      item.className = "track-item";
      item.style.cssText = `
        display: grid;
        grid-template-columns: 40px 1fr auto 40px;
        gap: 16px;
        padding: 8px 16px;
        border-radius: 4px;
        align-items: center;
        transition: background 0.2s;
        cursor: pointer;
      `;

      item.innerHTML = `
        <div style="text-align: center; color: rgba(255,255,255,0.6);">${index + 1}</div>
        <div style="display: flex; gap: 12px; align-items: center; min-width: 0;">
          <img src="${track.image_url || 'placeholder.svg?height=40&width=40'}" 
            style="width: 40px; height: 40px; border-radius: 4px;">
          <div style="min-width: 0;">
            <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${track.title}
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${track.artist_name || 'Unknown'}
            </div>
          </div>
        </div>
        <div style="color: rgba(255,255,255,0.6); font-size: 14px;">${formatDuration(track.duration)}</div>
        <button class="track-menu-btn" style="background: none; border: none; color: rgba(255,255,255,0.6); 
          cursor: pointer; padding: 8px;">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      `;

      item.addEventListener("mouseenter", () => item.style.background = "rgba(255,255,255,0.1)");
      item.addEventListener("mouseleave", () => item.style.background = "");
      item.addEventListener("click", () => {
        if (window.musicPlayer) {
          window.musicPlayer.playlist = tracks;
          window.musicPlayer.playlistSource = "playlist";
          window.musicPlayer.loadAndPlay(index);
        }
      });

      container.appendChild(item);
    });
  }

  function formatDuration(seconds) {
    if (!seconds) return "--:--";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #1db954; color: white; padding: 12px 24px; border-radius: 4px;
      z-index: 10000; animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideDown 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Load playlists
  await fetchAndRenderPlaylists();
  window.fetchAndRenderPlaylists = fetchAndRenderPlaylists;
});