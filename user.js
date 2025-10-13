import httpRequest from "./utils/httpRequest.js";

// ===============================
// User Profile Manager
// ===============================
class UserProfile {
  constructor() {
    // IMPORTANT: luôn query element một lần và kiểm tra tồn tại
    this.avatarInput = document.getElementById("avatarInput");
    this.avatarPreview = document.getElementById("avatarPreview");
    this.removeAvatarBtn = document.getElementById("removeAvatar");
    this.profileForm = document.getElementById("profileForm");
    this.displayNameInput = document.getElementById("displayName");
    this.currentPasswordInput = document.getElementById("currentPassword");
    this.newPasswordInput = document.getElementById("newPassword");
    this.confirmPasswordInput = document.getElementById("confirmPassword");
    this.saveBtn = document.getElementById("saveBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.statusDiv = document.getElementById("status");
    this.pwdError = document.getElementById("pwdError");
    this.backButton = document.querySelector(".back-button");

    this.toggleCurrentPassword = document.getElementById("toggleCurrentPassword");
    this.toggleNewPassword = document.getElementById("toggleNewPassword");
    this.toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

    this.currentUser = null;
    this.selectedFile = null;
    this.originalAvatarUrl = null;
    this.originalName = "";
    this.isRemoved = false;

    this.init();
  }

  async init() {
    await this.loadCurrentUser();
    this.bindEvents();
  }

  async loadCurrentUser() {
    try {
      if (this.statusDiv) this.showStatus("Đang tải thông tin...", "loading");

      // timestamp để bust cache nếu cần
      const timestamp = Date.now();
      const response = await httpRequest.get(`users/me?${timestamp}`);

      this.currentUser = response.user || response.data || response || null;

      // nếu backend không trả, thử lấy từ localStorage (fallback)
      if (!this.currentUser) {
        const stored = localStorage.getItem("currentuser");
        if (stored) this.currentUser = JSON.parse(stored);
      }

      // nếu vẫn null -> không làm gì
      if (!this.currentUser) {
        this.originalName = "";
        this.originalAvatarUrl = null;
        if (this.displayNameInput) this.displayNameInput.value = "";
        if (this.avatarPreview) this.createDefaultAvatar("U");
        if (this.statusDiv) this.clearStatus();
        return;
      }

      // giữ username theo yêu cầu
      this.originalName =
        this.currentUser.username ||
        this.currentUser.name ||
        this.currentUser.display_name ||
        this.currentUser.email ||
        "Người dùng";

      this.originalAvatarUrl =
        this.currentUser.avatar_url ||
        this.currentUser.avatar ||
        this.currentUser.image ||
        null;

      if (this.displayNameInput) this.displayNameInput.value = this.originalName;

      if (this.originalAvatarUrl) {
        const resolved = this.resolveAvatarUrl(this.originalAvatarUrl);
        if (this.avatarPreview) this.updateAvatarPreview(resolved);
      } else {
        if (this.avatarPreview) this.createDefaultAvatar(this.originalName);
      }

      this.isRemoved = false;
      if (this.statusDiv) this.clearStatus();

      // ensure localStorage currentuser is up-to-date
      this.syncCurrentUserToLocalStorage();
    } catch (error) {
      console.error("Error loading user:", error);
      if (this.statusDiv) this.showStatus("Không thể tải thông tin người dùng: " + (error.message || ""), "error");

      if (error && error.status === 401) {
        localStorage.removeItem("access_token");
        setTimeout(() => (window.location.href = "/index.html"), 1500);
      }
    }
  }

  bindEvents() {
    // addEventListener chỉ khi element tồn tại
    if (this.avatarInput) this.avatarInput.addEventListener("change", (e) => this.handleFileSelect(e));
    if (this.removeAvatarBtn) this.removeAvatarBtn.addEventListener("click", () => this.removeAvatar());
    if (this.profileForm) this.profileForm.addEventListener("submit", (e) => this.handleSubmit(e));
    if (this.cancelBtn) this.cancelBtn.addEventListener("click", () => this.handleCancel());
    if (this.backButton) this.backButton.addEventListener("click", () => this.handleBack());
    [this.newPasswordInput, this.confirmPasswordInput].forEach((input) => {
      if (input) input.addEventListener("input", () => this.clearPasswordError());
    });

    if (this.toggleCurrentPassword && this.currentPasswordInput) {
      this.toggleCurrentPassword.addEventListener("click", () => this.togglePasswordVisibility(this.currentPasswordInput, this.toggleCurrentPassword));
    }
    if (this.toggleNewPassword && this.newPasswordInput) {
      this.toggleNewPassword.addEventListener("click", () => this.togglePasswordVisibility(this.newPasswordInput, this.toggleNewPassword));
    }
    if (this.toggleConfirmPassword && this.confirmPasswordInput) {
      this.toggleConfirmPassword.addEventListener("click", () => this.togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPassword));
    }
  }

  togglePasswordVisibility(input, toggleIcon) {
    if (!input || !toggleIcon) return;
    if (input.type === "password") {
      input.type = "text";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showStatus("Vui lòng chọn file ảnh hợp lệ", "error");
      if (this.avatarInput) this.avatarInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showStatus("Ảnh không được vượt quá 5MB", "error");
      if (this.avatarInput) this.avatarInput.value = "";
      return;
    }

    this.selectedFile = file;
    this.isRemoved = false;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (this.avatarPreview) this.updateAvatarPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async uploadAvatar(file) {
    try {
      // nếu backend chấp nhận form-data
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await httpRequest.post("users/me/avatar", formData);
      console.log("Upload response:", response);

      const newUrl =
        response?.avatar_url ||
        response?.data?.avatar_url ||
        response?.user?.avatar_url ||
        response?.image ||
        response?.url ||
        null;

      if (newUrl) return newUrl;

      // fallback: trả dataURL
      const dataUrl = await this.fileToDataURL(file);
      return dataUrl;
    } catch (err) {
      console.error("Upload error:", err);
      // fallback: trả dataURL
      try {
        return await this.fileToDataURL(file);
      } catch (e) {
        console.error("Failed to convert file to dataURL:", e);
        throw new Error("Không thể upload ảnh đại diện: " + (err.message || ""));
      }
    }
  }

  async removeAvatarFromServer() {
    try {
      await httpRequest.delete("users/me/avatar");
    } catch (err) {
      console.error("Remove avatar error:", err);
      // không throw để user vẫn có thể tiếp tục (tùy backend)
      // throw new Error("Không thể xóa ảnh đại diện: " + (err.message || ""));
    }
  }

  resolveAvatarUrl(url) {
    if (!url) return null;
    const trimmed = String(url).trim();
    const idx = trimmed.indexOf("data:image");
    if (idx !== -1) {
      return trimmed.substring(idx);
    }
    if (trimmed.startsWith("http") || trimmed.startsWith("//")) return trimmed;
    const base = (httpRequest.baseUrl || "").replace(/\/api\/?$/, "");
    if (!base) return trimmed;
    try {
      return new URL(trimmed, base).href;
    } catch {
      return base.replace(/\/$/, "") + "/" + trimmed.replace(/^\//, "");
    }
  }

  async handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const displayName = this.displayNameInput ? this.displayNameInput.value.trim() : "";
    if (!displayName) {
      this.showStatus("Vui lòng nhập tên hiển thị", "error");
      if (this.displayNameInput) this.displayNameInput.focus();
      return;
    }

    const currentPassword = this.currentPasswordInput ? this.currentPasswordInput.value : "";
    const newPassword = this.newPasswordInput ? this.newPasswordInput.value : "";
    const confirmPassword = this.confirmPasswordInput ? this.confirmPasswordInput.value : "";

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

    if (this.saveBtn) this.saveBtn.disabled = true;
    if (this.statusDiv) this.showStatus("Đang lưu thay đổi...", "loading");

    try {
      let avatarChanged = false;
      let newAvatarUrl = null;

      if (this.selectedFile) {
        newAvatarUrl = await this.uploadAvatar(this.selectedFile);
        this.selectedFile = null;
        avatarChanged = true;
      } else if (this.isRemoved && this.originalAvatarUrl) {
        await this.removeAvatarFromServer();
        newAvatarUrl = null;
        avatarChanged = true;
      }

      const profileData = {
        username: displayName,
      };

      if (avatarChanged) {
        profileData.avatar_url = newAvatarUrl;
      }

      // gửi chỉ khi có thay đổi
      if (displayName !== this.originalName || avatarChanged) {
        await httpRequest.put("users/me", profileData);
      }

      if (passwordChangeData) {
        await httpRequest.post("auth/change-password", passwordChangeData);
        if (this.currentPasswordInput) this.currentPasswordInput.value = "";
        if (this.newPasswordInput) this.newPasswordInput.value = "";
        if (this.confirmPasswordInput) this.confirmPasswordInput.value = "";
      }

      // reload từ server (hoặc cập nhật local copy)
      await this.loadCurrentUser();

      // Sau khi load thành công, cập nhật localStorage để main.js đọc được
      this.syncCurrentUserToLocalStorage();

      if (this.statusDiv) this.showStatus("Lưu thay đổi thành công!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      if (this.statusDiv) this.showStatus(error.response?.message || error.message || "Có lỗi xảy ra", "error");
    } finally {
      if (this.saveBtn) this.saveBtn.disabled = false;
    }
  }

  removeAvatar() {
    this.selectedFile = null;
    if (this.avatarInput) this.avatarInput.value = "";
    this.isRemoved = true;
    if (this.displayNameInput) this.createDefaultAvatar(this.displayNameInput.value || this.originalName);
  }

  updateAvatarPreview(url) {
    if (!this.avatarPreview) return;
    if (!url) {
      this.avatarPreview.innerHTML = "";
      return;
    }
    this.avatarPreview.innerHTML = `<img src="${url}" alt="avatar" />`;
  }

  createDefaultAvatar(name) {
    const initials = this.getInitials(name);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%' height='100%' fill='#eef2ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='#333'>${initials}</text></svg>`;
    const dataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    this.updateAvatarPreview(dataUrl);
  }

  getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  handleCancel() {
    if (this.displayNameInput) this.displayNameInput.value = this.originalName;
    if (this.originalAvatarUrl) {
      if (this.avatarPreview) this.updateAvatarPreview(this.resolveAvatarUrl(this.originalAvatarUrl));
    } else {
      if (this.avatarPreview) this.createDefaultAvatar(this.originalName);
    }
    if (this.currentPasswordInput) this.currentPasswordInput.value = "";
    if (this.newPasswordInput) this.newPasswordInput.value = "";
    if (this.confirmPasswordInput) this.confirmPasswordInput.value = "";
    this.selectedFile = null;
    this.isRemoved = false;
    this.clearStatus();
  }

  handleBack() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/index.html";
  }

  showStatus(msg, type) {
    if (!this.statusDiv) return;
    this.statusDiv.textContent = msg;
    this.statusDiv.className = type;
  }

  clearStatus() {
    if (!this.statusDiv) return;
    this.statusDiv.textContent = "";
    this.statusDiv.className = "";
  }

  showPasswordError(msg) {
    if (!this.pwdError) return;
    this.pwdError.textContent = msg;
    this.pwdError.style.display = "block";
  }

  clearPasswordError() {
    if (!this.pwdError) return;
    this.pwdError.textContent = "";
    this.pwdError.style.display = "none";
  }

  // Đồng bộ currentUser vào localStorage (ghi đè currentuser)
  syncCurrentUserToLocalStorage() {
    try {
      const toStore = {
        ...this.currentUser,
        username: this.currentUser?.username || this.originalName,
        avatar_url: this.originalAvatarUrl || this.currentUser?.avatar_url || null,
      };

      // nếu user vừa upload và trên preview là dataURL, ưu tiên dataURL
      const previewImg = this.avatarPreview?.querySelector("img");
      if (previewImg && previewImg.src) {
        toStore.avatar_url = previewImg.src;
      }

      localStorage.setItem("currentuser", JSON.stringify(toStore));
      // dispatch storage event to help other tabs (some browsers don't fire on same tab)
      try {
        window.dispatchEvent(new StorageEvent("storage", {
          key: "currentuser",
          newValue: JSON.stringify(toStore),
        }));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error("Failed to sync currentuser to localStorage:", e);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // user page only
  const hasUserElements = !!(document.getElementById("profileForm") || document.getElementById("avatarPreview"));
  if (hasUserElements) new UserProfile();
});
