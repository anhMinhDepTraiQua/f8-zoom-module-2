// ===============================
// HttpRequest class (giữ nguyên, dùng cho JSON requests)
// ===============================
class HttpRequest {
  constructor() {
    this.baseUrl = "https://spotify.f8team.dev/api/";
  }

  async _send(method, path, data, options = {}) {
    try {
      const _options = {
        ...options,
        method,
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
        },
      };

      if (data) {
        _options.body = JSON.stringify(data);
      }

      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        _options.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch(`${this.baseUrl}${path}`, _options);
      const contentType = res.headers.get("content-type");
      let response;

      if (contentType && contentType.includes("application/json")) {
        response = await res.json();
      } else {
        response = { message: await res.text() };
      }

      if (!res.ok) {
        const error = new Error(response.message || `HTTP ${res.status}`);
        error.response = response;
        error.status = res.status;
        throw error;
      }

      return response;
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  }

  get(path, options) {
    return this._send("GET", path, null, options);
  }
  post(path, data, options) {
    return this._send("POST", path, data, options);
  }
  put(path, data, options) {
    return this._send("PUT", path, data, options);
  }
  patch(path, data, options) {
    return this._send("PATCH", path, data, options);
  }
  delete(path, options) {
    return this._send("DELETE", path, null, options);
  }
}

const httpRequest = new HttpRequest();


// ===============================
// User Profile Manager
// ===============================
class UserProfile {
  constructor() {
    this.avatarInput = document.getElementById("avatarInput");
    this.avatarPreview = document.getElementById("avatarPreview");
    this.removeAvatarBtn = document.getElementById("removeAvatar");
    this.profileForm = document.getElementById("profileForm");
    this.displayNameInput = document.getElementById("displayName"); // giữ id hiện tại
    this.currentPasswordInput = document.getElementById("currentPassword");
    this.newPasswordInput = document.getElementById("newPassword");
    this.confirmPasswordInput = document.getElementById("confirmPassword");
    this.saveBtn = document.getElementById("saveBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.statusDiv = document.getElementById("status");
    this.pwdError = document.getElementById("pwdError");
    this.backButton = document.querySelector(".back-button");

    this.currentUser = null;
    this.selectedFile = null;
    this.originalAvatarUrl = null;
    this.originalName = "";

    this.init();
  }

  async init() {
    await this.loadCurrentUser();
    this.bindEvents();
  }

  async loadCurrentUser() {
    try {
      this.showStatus("Đang tải thông tin...", "loading");

      const response = await httpRequest.get("users/me");
      // Có thể trả về object khác nhau -> tìm user trong response
      this.currentUser = response.user || response.data || response;

      console.log("Current user data:", this.currentUser);

      // Ưu tiên trường name/username trước, để bạn thấy đúng "user name" hiện tại
      this.originalName =
        this.currentUser.name ||
        this.currentUser.username ||
        this.currentUser.display_name ||
        this.currentUser.email ||
        "Người dùng";

      // Nhiều API trả avatar trong avatar, avatar_url, image...
      this.originalAvatarUrl =
        this.currentUser.avatar ||
        this.currentUser.avatar_url ||
        this.currentUser.image ||
        null;

      // Đặt giá trị lên input (giữ id displayName nhưng giá trị là tên thực)
      this.displayNameInput.value = this.originalName;

      if (this.originalAvatarUrl) {
        // Nếu URL là tương đối, chuyển thành tuyệt đối
        const resolved = this.resolveAvatarUrl(this.originalAvatarUrl);
        this.updateAvatarPreview(resolved);
      } else {
        this.createDefaultAvatar(this.originalName);
      }

      this.clearStatus();
    } catch (error) {
      console.error("Error loading user:", error);
      this.showStatus(
        "Không thể tải thông tin người dùng: " + (error.message || ""),
        "error"
      );

      if (error.status === 401) {
        localStorage.removeItem("access_token");
        setTimeout(() => (window.location.href = "/login.html"), 1500);
      }
    }
  }

  bindEvents() {
    this.avatarInput.addEventListener("change", (e) => this.handleFileSelect(e));
    this.removeAvatarBtn.addEventListener("click", () => this.removeAvatar());
    this.profileForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.cancelBtn.addEventListener("click", () => this.handleCancel());
    this.backButton?.addEventListener("click", () => this.handleBack());
    [this.newPasswordInput, this.confirmPasswordInput].forEach((input) => {
      input.addEventListener("input", () => this.clearPasswordError());
    });
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showStatus("Vui lòng chọn file ảnh hợp lệ", "error");
      this.avatarInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showStatus("Ảnh không được vượt quá 5MB", "error");
      this.avatarInput.value = "";
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => this.updateAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  // Tăng cường: xử lý nhiều kiểu response và cả relative path
  async uploadAvatar(file) {
    try {
      const accessToken = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("avatar", file);

      const uploadUrl = `${httpRequest.baseUrl}users/me/avatar`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });

      // đọc response (cố gắng parse JSON, fallback text)
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const txt = await res.text();
        try {
          data = JSON.parse(txt);
        } catch {
          data = { message: txt };
        }
      }

      console.log("Upload avatar response raw:", data);

      if (!res.ok) {
        const msg = data?.message || data?.error || `Upload failed: ${res.status}`;
        throw new Error(msg);
      }

      // Tìm URL trong response robustly
      const avatarUrl = this.findAvatarUrlInResponse(data);

      // Nếu trả về đường dẫn tương đối, chuyển thành absolute dựa trên baseUrl
      const resolved = avatarUrl ? this.resolveAvatarUrl(avatarUrl) : null;

      console.log("Resolved avatar URL:", resolved);

      return resolved;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Không thể upload ảnh đại diện");
    }
  }

  // Dò tìm giá trị url trong các vị trí phổ biến của response
  findAvatarUrlInResponse(obj) {
    if (!obj) return null;

    // các trường phổ biến
    const candidates = [
      obj.data?.avatar,
      obj.data?.avatar_url,
      obj.data?.url,
      obj.data?.image,
      obj.avatar,
      obj.avatar_url,
      obj.url,
      obj.image,
      obj.data?.data?.avatar,
      obj.data?.data?.url,
    ];

    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
      // nếu c là object có url
      if (c && typeof c === "object") {
        if (typeof c.url === "string" && c.url.trim()) return c.url.trim();
        if (typeof c.src === "string" && c.src.trim()) return c.src.trim();
      }
    }

    // fallback: tìm bất kỳ giá trị string nào trông như url trong object (duyệt đệ quy)
    const found = this.findFirstStringUrl(obj);
    return found;
  }

  findFirstStringUrl(obj) {
    const seen = new Set();
    function dfs(o) {
      if (!o || typeof o !== "object") return null;
      if (seen.has(o)) return null;
      seen.add(o);
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === "string") {
          const s = v.trim();
          if (s.startsWith("http") || s.startsWith("/")) return s;
        } else if (typeof v === "object") {
          const r = dfs(v);
          if (r) return r;
        }
      }
      return null;
    }
    return dfs(obj);
  }

  // Nếu avatarUrl là relative path (ví dụ "/uploads/.."), chuyển thành absolute dựa trên base
  resolveAvatarUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith("http")) return trimmed;
    // lấy base origin từ httpRequest.baseUrl (bỏ '/api/' nếu có)
    const base = httpRequest.baseUrl.replace(/\/api\/?$/, "");
    // ensure no duplicate slashes
    try {
      return new URL(trimmed, base).href;
    } catch {
      // fallback
      return (base.replace(/\/$/, "") + "/" + trimmed.replace(/^\//, ""));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const displayName = this.displayNameInput.value.trim();
    if (!displayName) {
      this.showStatus("Vui lòng nhập tên hiển thị", "error");
      this.displayNameInput.focus();
      return;
    }

    const currentPassword = this.currentPasswordInput.value;
    const newPassword = this.newPasswordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;

    let passwordChangeData = null;

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        this.showPasswordError("Vui lòng điền đầy đủ mật khẩu");
        return;
      }
      if (newPassword.length < 8) {
        this.showPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự");
        return;
      }
      if (newPassword !== confirmPassword) {
        this.showPasswordError("Mật khẩu xác nhận không khớp");
        return;
      }

      passwordChangeData = {
        current_password: currentPassword,
        new_password: newPassword,
      };
    }

    this.saveBtn.disabled = true;
    this.showStatus("Đang lưu thay đổi...", "loading");

    try {
      let avatarUrl = this.originalAvatarUrl;

      if (this.selectedFile) {
        avatarUrl = await this.uploadAvatar(this.selectedFile);
        // nếu upload trả null -> báo lỗi
        if (!avatarUrl) {
          throw new Error("Upload avatar không trả về URL hợp lệ");
        }
      } else {
        const imgSrc = this.avatarPreview.querySelector("img")?.src || "";
        if (imgSrc.startsWith("data:image/svg+xml")) {
          avatarUrl = null;
        }
      }

      // Gửi payload, bao gồm nhiều key để tương thích (name, display_name, avatar, avatar_url)
      const profileData = {
        name: displayName,
        display_name: displayName,
      };

      if (avatarUrl !== this.originalAvatarUrl) {
        profileData.avatar = avatarUrl;
        profileData.avatar_url = avatarUrl;
      }

      // Gọi API cập nhật profile
      await httpRequest.put("users/me", profileData);

      // Nếu có đổi mật khẩu
      if (passwordChangeData) {
        await httpRequest.post("auth/change-password", passwordChangeData);
        this.currentPasswordInput.value = "";
        this.newPasswordInput.value = "";
        this.confirmPasswordInput.value = "";
      }

      // reload thông tin mới từ server
      await this.loadCurrentUser();
      this.showStatus("Lưu thay đổi thành công!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      this.showStatus(
        error.response?.message || error.message || "Có lỗi xảy ra",
        "error"
      );
    } finally {
      this.saveBtn.disabled = false;
    }
  }

  removeAvatar() {
    this.selectedFile = null;
    this.avatarInput.value = "";
    this.createDefaultAvatar(this.displayNameInput.value || this.originalName);
  }

  updateAvatarPreview(url) {
    this.avatarPreview.innerHTML = `<img src="${url}" alt="avatar">`;
  }

  createDefaultAvatar(name) {
    const initials = this.getInitials(name);
    const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='%23333'>${initials}</text></svg>`;
    this.updateAvatarPreview(svg);
  }

  getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  handleCancel() {
    this.displayNameInput.value = this.originalName;
    if (this.originalAvatarUrl) {
      this.updateAvatarPreview(this.resolveAvatarUrl(this.originalAvatarUrl));
    } else {
      this.createDefaultAvatar(this.originalName);
    }
    this.currentPasswordInput.value = "";
    this.newPasswordInput.value = "";
    this.confirmPasswordInput.value = "";
    this.clearStatus();
  }

  handleBack() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/index.html";
  }

  showStatus(msg, type) {
    this.statusDiv.textContent = msg;
    this.statusDiv.className = type;
  }

  clearStatus() {
    this.statusDiv.textContent = "";
    this.statusDiv.className = "";
  }

  showPasswordError(msg) {
    this.pwdError.textContent = msg;
    this.pwdError.style.display = "block";
  }

  clearPasswordError() {
    this.pwdError.textContent = "";
    this.pwdError.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => new UserProfile());
