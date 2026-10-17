/* NT3105 Admin Studio — quyền thực sự do Supabase Auth + RLS kiểm soát. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const config = window.NT3105_CONFIG || {};
  const el = (tag, cls = '', value) => {
    const node = document.createElement(tag);
    node.className = cls;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const button = (name, cls, onClick) => {
    const node = el('button', cls, name);
    node.type = 'button'; node.addEventListener('click', onClick); return node;
  };
  let db, comments = [], admin = false, filter = 'all', visible = 8;
  let replyId = null, deleteId = null, toastTimer;
  const LIMIT = 500;
  function toast(message) {
    $('#notification').textContent = message;
    $('#notification').classList.add('open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#notification').classList.remove('open'), 3500);
  }
  function modal(selector, open) {
    $(selector).hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  function showPortal(allowed) {
    admin = allowed;
    $('#gate').hidden = allowed;
    $('#portal').hidden = !allowed;
    $('#logout').hidden = !allowed;
  }
  function configured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(config.supabaseUrl || ''))
      && /^sb_publishable_[\w-]+$/.test(String(config.supabasePublishableKey || ''));
  }
  function render() {
    if (!admin) return;
    const publicComments = comments.filter(c => !c.is_hidden);
    $('#totalVisible').textContent = publicComments.length + (comments.length === LIMIT ? '+' : '');
    $('#hiddenCount').textContent = comments.length - publicComments.length;
    $('#avgRating').textContent = publicComments.length
      ? (publicComments.reduce((s, c) => s + Number(c.rating), 0) / publicComments.length).toFixed(1) : '—';
    $('#counterPill').textContent = comments.length + ' nhận xét';
    const keyword = $('#search').value.trim().toLocaleLowerCase('vi');
    let list = comments.filter(c => filter === 'hidden' ? c.is_hidden : filter === 'public' ? !c.is_hidden : filter === 'pinned' ? c.is_pinned : true)
      .filter(c => [c.author, c.body, c.admin_reply || ''].join(' ').toLocaleLowerCase('vi').includes(keyword));
    const sort = $('#sort').value;
    list.sort((a, b) => sort === 'old' ? Date.parse(a.created_at) - Date.parse(b.created_at)
      : sort === 'high' ? b.rating - a.rating : sort === 'low' ? a.rating - b.rating
      : Number(b.is_pinned) - Number(a.is_pinned) || Date.parse(b.created_at) - Date.parse(a.created_at));
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    const target = $('#commentList'); target.replaceChildren();
    if (!list.length) {
      target.append(el('div', 'empty', 'Không có bình luận phù hợp.'));
      $('#loadMore').hidden = true; return;
    }
    list.slice(0, visible).forEach(c => {
      const card = el('article', 'comment' + (c.is_hidden ? ' is-hidden' : '') + (c.is_pinned ? ' is-pinned' : ''));
      const head = el('div', 'comment-row');
      const who = el('div', 'who');
      who.append(el('strong', '', c.author), el('span', '', new Date(c.created_at).toLocaleDateString('vi-VN')));
      if (c.is_pinned) who.append(el('span', 'pin-tag', '✦ Đã ghim'));
      const avatar = el('div', 'avatar', String(c.author || '?').trim().charAt(0).toUpperCase());
      head.append(avatar, who, el('span', 'small-stars', '★'.repeat(Math.max(0, Math.min(5, c.rating)))));
      card.append(head, el('p', '', c.body));
      if (c.admin_reply) {
        const reply = el('div', 'reply');
        reply.append(el('div', 'reply-name', '✦ NT3105 · Admin'), el('p', '', c.admin_reply));
        card.append(reply);
      }
      const controls = el('div', 'inline-actions');
      controls.append(
        button(c.admin_reply ? '✎ Sửa phản hồi' : '↳ Trả lời', '', () => {
          replyId = c.id;
          $('#replyContext').textContent = c.author + ' · ' + c.body.slice(0, 140);
          $('#replyText').value = c.admin_reply || '';
          modal('#replyModal', true);
        }),
        button(c.is_hidden ? '◉ Hiện lại' : '◌ Ẩn', '', () => update(c.id, { is_hidden: !c.is_hidden })),
        button(c.is_pinned ? '◇ Bỏ ghim' : '✦ Ghim', '', () => update(c.id, { is_pinned: !c.is_pinned })),
        button('✕ Xoá', 'danger', () => { deleteId = c.id; modal('#deleteModal', true); })
      );
      card.append(controls); target.append(card);
    });
    $('#loadMore').hidden = list.length <= visible;
  }
  async function refresh() {
    if (!admin || !db) return;
    const { data, error } = await db.from('site_comments')
      .select('id,author,body,rating,is_hidden,is_pinned,admin_reply,created_at')
      .order('created_at', { ascending: false }).limit(LIMIT);
    if (error) { console.error(error); toast('Không thể tải bình luận. Kiểm tra quyền Admin.'); return; }
    comments = data || []; render();
  }
  function readableAuthError(error) {
    const code = String(error?.code || '').toLowerCase();
    const description = String(error?.message || '').toLowerCase();
    if (code === 'invalid_credentials' || description.includes('invalid login credentials')) {
      return 'Supabase từ chối thông tin đăng nhập. Hãy kiểm tra email và mật khẩu của tài khoản Authentication → Users (không phải mật khẩu Database).';
    }
    if (code === 'email_not_confirmed' || description.includes('email not confirmed')) {
      return 'Email chưa được xác nhận trong Supabase Authentication → Users.';
    }
    if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || description.includes('too many requests')) {
      return 'Supabase đang giới hạn số lần thử. Vui lòng đợi rồi thử lại.';
    }
    if (description.includes('failed to fetch') || description.includes('network') || description.includes('fetch failed')) {
      return 'Không kết nối được tới máy chủ Supabase. Kiểm tra mạng rồi thử lại.';
    }
    return 'Supabase báo lỗi xác thực' + (code ? ' (' + code + ')' : '') + '. Hãy kiểm tra Authentication → Users.';
  }
  async function login(event) {
    event.preventDefault();
    if (!db) return;
    const submit = $('#loginBtn');
    submit.disabled = true;
    $('#loginError').textContent = '';
    try {
      // 1. Xác thực email/mật khẩu bằng Supabase Auth.
      const { error: authError } = await db.auth.signInWithPassword({
        email: $('#email').value.trim(), password: $('#password').value
      });
      if (authError) {
        $('#loginError').textContent = readableAuthError(authError);
        return;
      }

      // 2. Kiểm tra quyền trên database, không tin vào giao diện.
      const { data: isAdmin, error: permissionError } = await db.rpc('is_site_comment_admin');
      if (permissionError) {
        console.error('Supabase admin RPC check failed:', permissionError);
        await db.auth.signOut();
        $('#loginError').textContent = 'Email/mật khẩu đã được chấp nhận, nhưng truy vấn quyền Admin bị lỗi. Kiểm tra hàm is_site_comment_admin trong SQL Editor.';
        return;
      }
      if (isAdmin !== true) {
        await db.auth.signOut();
        $('#loginError').textContent = 'Đăng nhập đúng nhưng tài khoản chưa được cấp quyền Admin trong bảng site_comment_admins.';
        return;
      }

      $('#password').value = '';
      showPortal(true);
      await refresh();
      window.dispatchEvent(new CustomEvent('nt3105:admin-auth', { detail: { active: true, client: db } }));
      toast('✓ Đã mở bảng quản trị.');
    } catch (error) {
      console.error('Unexpected Supabase login error:', error);
      $('#loginError').textContent = 'Lỗi kết nối hoặc xử lý đăng nhập. Hãy tải lại trang và thử lần nữa.';
    } finally {
      submit.disabled = false;
    }
  }
    async function logout() {
    window.dispatchEvent(new CustomEvent('nt3105:admin-auth', { detail: { active: false } }));
    showPortal(false); comments = []; filter = 'all';
    try { await db?.auth.signOut(); } catch (error) { console.error(error); }
    $('#password').value = '';
    toast('Đã đăng xuất.');
  }
  async function update(id, fields) {
    if (!admin || !db) return;
    try {
      const { data, error } = await db.from('site_comments').update(fields).eq('id', id).select('id');
      if (error || !data?.length) throw error || new Error('Forbidden');
      await refresh(); toast('✓ Đã cập nhật bình luận.');
    } catch (error) { console.error(error); toast('Không thể sửa. Kiểm tra RLS.'); }
  }
  async function saveReply(event) {
    event.preventDefault();
    if (!replyId || !admin) return;
    const message = $('#replyText').value.trim();
    if (message.length > 350) return;
    await update(replyId, { admin_reply: message || null });
    replyId = null; modal('#replyModal', false);
  }
  async function removeComment() {
    if (!deleteId || !admin) return;
    const submit = $('#confirmDelete'); submit.disabled = true;
    try {
      const { data, error } = await db.from('site_comments').delete().eq('id', deleteId).select('id');
      if (error || !data?.length) throw error || new Error('Forbidden');
      deleteId = null; modal('#deleteModal', false);
      await refresh(); toast('✓ Đã xoá bình luận.');
    } catch (error) { console.error(error); toast('Xoá thất bại.'); }
    finally { submit.disabled = false; }
  }
  function download(ext, body, mime) {
    const url = URL.createObjectURL(new Blob([body], { type: mime }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'nt3105-comments-' + new Date().toISOString().slice(0, 10) + ext;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function exportJson() {
    if (admin) download('.json', JSON.stringify(comments, null, 2), 'application/json;charset=utf-8');
  }
  function exportCsv() {
    if (!admin) return;
    const keys = ['id','author','body','rating','is_hidden','is_pinned','admin_reply','created_at'];
    const escapeCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csv = '\ufeff' + [keys.join(','), ...comments.map(c => keys.map(k => escapeCell(c[k])).join(','))].join('\r\n');
    download('.csv', csv, 'text/csv;charset=utf-8');
  }
  async function init() {
    $('#loginForm').addEventListener('submit', login);
    $('#logout').addEventListener('click', logout);
    $('#search').addEventListener('input', () => { visible = 8; render(); });
    $('#sort').addEventListener('change', render);
    document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.filter; visible = 8; render();
    }));
    $('#loadMore').addEventListener('click', () => { visible += 8; render(); });
    $('#exportJson').addEventListener('click', exportJson);
    $('#exportCsv').addEventListener('click', exportCsv);
    $('#refresh').addEventListener('click', refresh);
    $('#replyForm').addEventListener('submit', saveReply);
    $('#closeReply').addEventListener('click', () => modal('#replyModal', false));
    $('#closeDelete').addEventListener('click', () => modal('#deleteModal', false));
    $('#cancelDelete').addEventListener('click', () => modal('#deleteModal', false));
    $('#confirmDelete').addEventListener('click', removeComment);
    document.querySelectorAll('.overlay').forEach(node => node.addEventListener('click', event => {
      if (event.target === node) modal('#' + node.id, false);
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') document.querySelectorAll('.overlay:not([hidden])')
        .forEach(node => modal('#' + node.id, false));
    });
    if (!configured()) {
      $('#connection').textContent = 'Chưa tải được cấu hình Supabase mới. Hãy tải lại trang để làm mới cache.';
      $('#loginError').textContent = 'Thiếu cấu hình trong assets/config.js.';
      $('#loginBtn').disabled = true;
      return;
    }
    if (!window.supabase?.createClient) {
      $('#connection').textContent = 'Đang thử tải thư viện Supabase từ máy chủ dự phòng...';
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@supabase/supabase-js@2';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Cannot load Supabase SDK from backup CDN'));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Supabase SDK fallback failed', error);
      }
    }
    if (!window.supabase?.createClient) {
      $('#connection').textContent = 'Không tải được thư viện Supabase. Vui lòng thử lại khi kết nối mạng ổn định.';
      $('#loginError').textContent = 'Lỗi tải thư viện Supabase.';
      $('#loginBtn').disabled = true;
      return;
    }
    try {
      db = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false }
      });
      $('#connection').textContent = '🔐 Đã kết nối cấu hình Supabase. Hãy đăng nhập tài khoản Admin.';
      $('#loginError').textContent = '';
      $('#loginBtn').disabled = false;
    } catch (error) {
      console.error(error);
      $('#connection').textContent = 'Không thể khởi tạo kết nối Supabase.';
      $('#loginError').textContent = 'Cấu hình Supabase có lỗi.';
      $('#loginBtn').disabled = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
