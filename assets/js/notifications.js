/* =========================================================
   FoodShare — notifications.js
   Shared across all four roles. Renders the signed-in user's
   notifications with unread/read visual states and a "mark as
   read" interaction, plus "mark all as read".
   ========================================================= */

function renderNotificationsList() {
  const user = getSession();
  if (!user) return;

  const list = getNotifications(user.userId);
  const wrap = document.getElementById("notifications-list");
  const empty = document.getElementById("notifications-empty");
  const unreadCount = list.filter((n) => !n.isRead).length;

  const countEl = document.getElementById("unread-count");
  if (countEl) countEl.textContent = unreadCount > 0 ? `${unreadCount} unread` : "All caught up";

  if (list.length === 0) {
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;

  wrap.innerHTML = list
    .map(
      (n) => `
    <div class="activity-item" style="${n.isRead ? "" : "background: var(--color-accent-tint); border-radius: var(--radius-sm); padding: var(--space-3);"} cursor:pointer;" onclick="handleMarkRead('${n.notificationId}')">
      <span class="activity-item__dot" style="background: ${n.isRead ? "var(--color-border-strong)" : "var(--color-accent)"};"></span>
      <div>
        <div style="${n.isRead ? "color: var(--color-ink-soft);" : "font-weight: 600;"}">${n.message}</div>
        <div class="activity-item__meta">${formatDateTime(n.createdAt)}${n.isRead ? "" : " · Unread"}</div>
      </div>
    </div>`
    )
    .join("");
}

function handleMarkRead(notificationId) {
  markNotificationRead(notificationId);
  renderNotificationsList();
}

function handleMarkAllRead() {
  const user = getSession();
  if (!user) return;
  getNotifications(user.userId).forEach((n) => markNotificationRead(n.notificationId));
  showToast("All notifications marked as read.");
  renderNotificationsList();
}

function initNotificationsPage(role) {
  const user = requireRole(role);
  if (!user) return;
  document.getElementById("topbar-avatar").textContent = user.name.charAt(0).toUpperCase();
  renderNotificationsList();
}
