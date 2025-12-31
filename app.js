/* 1. Global Navigation Logic */
let users = JSON.parse(localStorage.getItem('users') || '{}');
let currentUser = localStorage.getItem('currentUser') || null;
let questions = JSON.parse(localStorage.getItem('questions') || '[]');

window.showView = function (viewId) {
    // 1. Select everything with the class 'view' and hide it
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(view => {
        view.style.display = 'none';
    });

    // 2. Show the specific view that was clicked
    const targetView = document.getElementById(viewId + '-view');
    if (targetView) {
        targetView.style.display = 'block';
        
        // 3. Reset scroll position to top of the content area
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.scrollTop = 0;
    }

    // 4. Handle mobile sidebar collapse
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapse-btn');
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        collapseBtn.textContent = '☰';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar'), collapseBtn = document.getElementById('collapse-btn');
    const accountBtn = document.getElementById('account-btn'), accountDropdown = document.getElementById('account-dropdown');
    const loginBtn = document.getElementById('login-btn'), modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form'), signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('login-tab'), signupTab = document.getElementById('signup-tab');
    const searchBar = document.getElementById('search-bar'), clearSearchBtn = document.getElementById('clear-search'), searchIcon = document.querySelector('.search-icon'), searchWrapper = document.querySelector('.search-wrapper');
    const mainContent = document.getElementById('main-content');

    // --- FIX 1: MOBILE SIDEBAR COLLAPSE ON CONTENT CLICK ---
    if (mainContent) {
        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                collapseBtn.textContent = '☰';
            }
        });
    }

    // --- MOBILE SEARCH TOGGLE ---
    if (searchIcon && searchWrapper) {
        searchIcon.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                searchWrapper.classList.toggle('active');
                if (searchWrapper.classList.contains('active')) {
                    searchBar.focus();
                }
            }
        });
    }

    // --- SIDEBAR TOGGLE ---
    collapseBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active');
            collapseBtn.textContent = sidebar.classList.contains('active') ? '✕' : '☰';
        } else {
            sidebar.classList.toggle('collapsed');
            collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '➡' : '☰';
        }
    });
	
	// --- SEARCH 'X' LOGIC ---
    if (searchBar && clearSearchBtn) {
        searchBar.addEventListener('input', () => {
            clearSearchBtn.style.display = searchBar.value.length > 0 ? 'inline' : 'none';
        });

        clearSearchBtn.addEventListener('click', () => {
            searchBar.value = '';
            clearSearchBtn.style.display = 'none';
            searchBar.focus();
        });
    }

    // --- AUTH LOGIC ---
    window.openAuthModal = () => { modal.style.display = 'flex'; showLogin(); };
    window.closeAuthModal = () => { modal.style.display = 'none'; };
    window.showLogin = () => { loginForm.style.display = 'block'; signupForm.style.display = 'none'; loginTab.classList.add('active'); signupTab.classList.remove('active'); };
    window.showSignUp = () => { loginForm.style.display = 'none'; signupForm.style.display = 'block'; loginTab.classList.remove('active'); signupTab.classList.add('active'); };
    
    window.handleSignUp = (e) => {
        e.preventDefault();
        const u = document.getElementById('signup-username').value.trim();
        const p = document.getElementById('signup-password').value.trim();
        if (users[u]) return alert('username taken');
        users[u] = { password: p };
        localStorage.setItem('users', JSON.stringify(users));
        showLogin();
    };

    window.handleLogin = (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value.trim();
        if (users[u] && users[u].password === p) {
            currentUser = u;
            localStorage.setItem('currentUser', u);
            updateLoginButton(); 
            closeAuthModal();
            window.location.reload(); 
        } else { alert('invalid credentials'); }
    };

    function updateLoginButton() {
        if (currentUser) {
            const initial = currentUser.charAt(0).toUpperCase();
            loginBtn.innerHTML = `
                <div style="pointer-events:none; display:flex; flex-direction:column; align-items:center;">
                    <div style="width:28px; height:28px; background:#0a66c2; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 2px; font-weight:bold;">${initial}</div>
                    <span style="font-size:11px;">${currentUser}</span>
                </div>`;
        } else {
            loginBtn.innerHTML = '<span class="main-text">login</span>';
        }
    }

    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            if (confirm('logout?')) {
                localStorage.removeItem('currentUser');
                currentUser = null;
                window.location.reload();
            }
        } else {
            openAuthModal();
        }
    });

    accountBtn.onclick = (e) => { e.stopPropagation(); accountDropdown.style.display = accountDropdown.style.display === 'flex' ? 'none' : 'flex'; };
    document.addEventListener('click', (e) => { 
        if(accountDropdown) accountDropdown.style.display = 'none'; 
        if (window.innerWidth <= 768 && searchWrapper && !searchWrapper.contains(e.target)) {
            searchWrapper.classList.remove('active');
        }
    });

    updateLoginButton();
});

/* --- FEED LOGIC & FIREBASE --- */
const postInput = document.getElementById('post-input');
const publishBtn = document.getElementById('publish-btn');
const postFeed = document.getElementById('post-feed');

if (postInput && publishBtn) {
    postInput.addEventListener('input', () => {
        const hasText = postInput.value.trim().length > 0;
        publishBtn.disabled = !hasText;
        publishBtn.classList.toggle('enabled', hasText);
    });

    publishBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        if (!text) return;
        if (typeof db !== 'undefined') {
            db.collection("posts").add({
                username: currentUser || "Guest",
                text: text,
                likes: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        postInput.value = '';
        publishBtn.disabled = true;
    });
}

if (postFeed) {
    postFeed.addEventListener('click', function(e) {
        const postCard = e.target.closest('.post-card');
        if (!postCard) return;
        const postId = postCard.getAttribute('data-id');

        // 1. Like Logic
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const isLiked = likeBtn.classList.toggle('liked');
            let myLikes = JSON.parse(localStorage.getItem('myLikes') || '[]');
            
            if (isLiked) {
                myLikes.push(postId);
            } else {
                myLikes = myLikes.filter(id => id !== postId);
            }
            localStorage.setItem('myLikes', JSON.stringify(myLikes));

            const increment = firebase.firestore.FieldValue.increment(isLiked ? 1 : -1);
            db.collection("posts").doc(postId).update({ likes: increment });
        }

      // 2. Delete Logic (Enhanced Cleanup)
        const deleteBtn = e.target.closest('.delete-post-btn');
        if (deleteBtn) {
            if (confirm("Permanently delete this post and all its replies?")) {
                const postRef = db.collection("posts").doc(postId);
                
                // First, delete all sub-collection comments to prevent "blank" ghost posts
                postRef.collection("comments").get().then((snapshot) => {
                    snapshot.forEach((doc) => {
                        doc.ref.delete();
                    });
                }).then(() => {
                    // Finally, delete the main post
                    postRef.delete().then(() => {
                        console.log("Post and sub-data fully removed.");
                    }).catch(err => console.error("Error removing post: ", err));
                });
            }
        }

        // --- Edit Post Logic ---
        const editBtn = e.target.closest('.edit-post-btn');
        if (editBtn) {
            const postBody = postCard.querySelector('.post-body p');
            const oldText = postBody.innerText;
            const newText = prompt("edit your post:", oldText);

            if (newText !== null && newText.trim() !== "" && newText !== oldText) {
                db.collection("posts").doc(postId).update({
                    text: newText,
                    edited: true 
                });
            }
        }

        // 3. Comment Toggle
        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            const section = postCard.querySelector('.comment-section');
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }

        // 4. Send Comment
        const sendBtn = e.target.closest('.send-reply-btn');
        if (sendBtn) {
            const input = postCard.querySelector('.reply-input');
            const commentText = input.value.trim();
            if (commentText) {
                db.collection("posts").doc(postId).collection("comments").add({
                    text: commentText,
                    username: currentUser || "Guest",
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => { 
                    input.value = ''; 
                    postCard.querySelector('.comment-section').style.display = 'block';
                });
            }
        }
    });
}

/* --- FIREBASE REAL-TIME LISTENERS --- */
if (typeof db !== 'undefined') {
    db.collection("posts").orderBy("timestamp", "desc").limit(20)
    .onSnapshot((snapshot) => {
        if (postFeed) postFeed.innerHTML = ''; 
        snapshot.forEach((doc) => {
            renderCloudPost(doc.id, doc.data());
        });
    });
}

// --- FIX: RESTORE TRASH CAN / DELETE LOGIC (POSTS & COMMENTS) ---
function renderCloudPost(postId, data) {
    const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : 'just now';
    const isAdmin = currentUser && currentUser.toLowerCase() === 'admin';
    const isOwner = currentUser && data.username && currentUser.toLowerCase() === data.username.toLowerCase();
    
    const myLikes = JSON.parse(localStorage.getItem('myLikes') || '[]');
    const hasLiked = myLikes.includes(postId);

    const newPost = document.createElement('div');
    newPost.className = 'post-card';
    newPost.setAttribute('data-id', postId); 
    
    newPost.innerHTML = `
        <div class="post-header">
            <div class="user-avatar-small">${data.username ? data.username.charAt(0).toUpperCase() : 'G'}</div>
            <div class="post-info">
                <span class="post-username">${data.username || 'Guest'}</span>
                <span class="post-time">${date}</span>
            </div>
            ${(isOwner || isAdmin) ? `
                <div style="margin-left:auto; display:flex; gap:10px;">
                    <button class="edit-post-btn" style="background:none; border:none; color:#0a66c2; cursor:pointer;"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-post-btn" style="background:none; border:none; color:#ff4444; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            ` : ''}
        </div>
        <div class="post-body"><p>${data.text}</p></div>
        <div class="post-actions">
            <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}">
                <i class="${hasLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                <span class="like-count">${data.likes || 0}</span> like
            </button>
            <button class="action-btn comment-btn"><i class="fa-regular fa-comment"></i> comment</button>
            <button class="action-btn"><i class="fa-solid fa-share-nodes"></i> share</button>
        </div>
        <div class="comment-section" style="display: none; padding: 10px; border-top: 1px solid #eee;">
            <div class="comment-list"></div>
            <div class="comment-input-area" style="display: flex; gap: 5px; padding-top: 10px;">
                <input type="text" class="reply-input" placeholder="write a reply..." style="flex: 1; border: 1px solid #ddd; border-radius: 15px; padding: 5px 12px;">
                <button class="send-reply-btn" style="background:none; border:none; color:#0a66c2; cursor:pointer; font-weight:bold;">post</button>
            </div>
        </div>`;

    const commentListDiv = newPost.querySelector('.comment-list');
    
    // --- REAL-TIME COMMENT LISTENER WITH DELETE LOGIC ---
    db.collection("posts").doc(postId).collection("comments").orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
        commentListDiv.innerHTML = ''; 
        snapshot.forEach((doc) => {
            const c = doc.data();
            const commentId = doc.id;
            
            // Logic for who can delete this specific comment
            const canDeleteComment = isAdmin || (currentUser && c.username && currentUser.toLowerCase() === c.username.toLowerCase());
            
            const el = document.createElement('div');
            el.className = 'comment-bubble';
            el.style.position = 'relative'; // For positioning the X
            
            el.innerHTML = `
                <b>${c.username}:</b> 
                <span>${c.text}</span>
                ${canDeleteComment ? `
                    <span class="edit-comment-btn" style="color:#0a66c2; cursor:pointer; font-size:11px; margin-left:8px; opacity:0.6;">edit</span>
                    <span class="delete-comment-x" style="color:red; cursor:pointer; font-size:12px; font-weight:bold; margin-left:8px; opacity:0.6;" title="delete reply">✕</span>
                ` : ''}
            `;

            // Attach the delete event directly to the "X" if it exists
            if (canDeleteComment) {
                el.querySelector('.delete-comment-x').onclick = (e) => {
                    e.stopPropagation();
                    if(confirm("Delete this reply?")) {
                        db.collection("posts").doc(postId).collection("comments").doc(commentId).delete();
                    }
                };
            }
            if (canDeleteComment) {
                el.querySelector('.edit-comment-btn').onclick = (e) => {
                    e.stopPropagation();
                    const newCommentText = prompt("edit your reply:", c.text);
                    if (newCommentText && newCommentText !== c.text) {
                        db.collection("posts").doc(postId).collection("comments").doc(commentId).update({
                            text: newCommentText
                        });
                    }
                };
            }

            commentListDiv.appendChild(el);
        });
        commentListDiv.scrollTop = commentListDiv.scrollHeight;
    });
    
    postFeed.appendChild(newPost);
}

window.toggleTerms = function(event) {
    event.preventDefault();
    const submenu = document.getElementById('terms-submenu');
    const icon = event.currentTarget.querySelector('i');
    const isHidden = submenu.style.display === 'none';
    submenu.style.display = isHidden ? 'block' : 'none';
    if(icon) icon.classList.replace(isHidden ? 'fa-chevron-down' : 'fa-chevron-up', isHidden ? 'fa-chevron-up' : 'fa-chevron-down');
};

// The "Brain" function
// We renamed 'observer' to 'videoWatcher' to avoid the conflict
const videoWatcher = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log("Video is on screen - Playing");
            entry.target.play();
        } else {
            console.log("Video is off screen - Pausing");
            entry.target.pause();
        }
    });
}, { threshold: 0.5 });

function startVideoWatcher() {
    const videos = document.querySelectorAll('.post-video');
    console.log("Found " + videos.length + " videos to watch");
    
    videos.forEach((video) => {
        videoWatcher.observe(video); // Use the new name here too
    });
}

window.addEventListener('load', startVideoWatcher);

window.showView('home');