const postList = document.getElementById("post-list");
const postDetail = document.getElementById("post-detail");
const newPostForm = document.getElementById("new-post-form");
const editPostForm = document.getElementById("edit-post-form");
const editTitleInput = document.getElementById("edit-title");
const editContentInput = document.getElementById("edit-content");
const cancelEditBtn = document.getElementById("cancel-edit");

let currentPostId = null; // Will store the ID of the currently viewed post

function main() {
  displayPosts();
  addNewPostListener();
  addEditPostListener();
}

// Fetch all posts from the backend and show them in the post list
function displayPosts() {
  fetch("http://localhost:3000/posts")
    .then(res => res.json())
    .then(posts => {
      postList.innerHTML = "";

      posts.forEach(post => {
        const div = document.createElement("div");
        div.textContent = post.title;
        div.addEventListener("click", () => handlePostClick(post.id));
        postList.appendChild(div);
      });

      // Automatically show the first post when the page loads
      if (posts.length > 0) handlePostClick(posts[0].id);
    });
}

function handlePostClick(id) {
  fetch(`http://localhost:3000/posts/${id}`)
    .then(res => res.json())
    .then(post => {
      currentPostId = post.id; // Save the current post's ID

      // Show post details (image removed)
      postDetail.innerHTML = `
        <h2>${post.title}</h2>
        <p><em>By ${post.author}${post.date ? ' • ' + post.date : ''}</em></p>
        <p>${post.content}</p>
        <button onclick="deletePost(${post.id})">Delete</button>
        <button onclick="showEditForm('${post.title}', \`${post.content}\`)">Edit</button>
      `;

      editPostForm.classList.add("hidden");
    });
}

function addNewPostListener() {
  newPostForm.addEventListener("submit", e => {
    e.preventDefault(); // Prevent the page from refreshing

    // Get values from the form
    const title = document.getElementById("new-title").value.trim();
    const author = document.getElementById("new-author").value.trim();
    const content = document.getElementById("new-content").value.trim();

    if (!title || !author || !content) {
      alert("Please fill in all required fields.");
      return;
    }

    const newPost = {
      title,
      author,
      content,
      date: new Date().toISOString().split("T")[0]
    };

    fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add post");
        return res.json();
      })
      .then(() => {
        displayPosts();      // Refresh the list
        newPostForm.reset(); // Clear the form
      })
      .catch(err => {
        console.error("Add error:", err);
        alert("There was a problem adding your post.");
      });
  });
}

function deletePost(id) {
  fetch(`http://localhost:3000/posts/${id}`, {
    method: "DELETE"
  })
    .then(() => {
      displayPosts(); // Refresh the list
      postDetail.innerHTML = "<p>Select a post to see details.</p>";
      editPostForm.classList.add("hidden");
    });
}

function showEditForm(title, content) {
  editTitleInput.value = title;
  editContentInput.value = content;
  editPostForm.classList.remove("hidden");
}

function addEditPostListener() {
  editPostForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedTitle = editTitleInput.value.trim();
    const updatedContent = editContentInput.value.trim();

    fetch(`http://localhost:3000/posts/${currentPostId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: updatedTitle,
        content: updatedContent
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update post");
        return res.json();
      })
      .then(() => {
        displayPosts();
        handlePostClick(currentPostId);
        editPostForm.classList.add("hidden");
      })
      .catch(err => {
        console.error("Edit error:", err);
        alert("There was a problem editing your post.");
      });
  });

  cancelEditBtn.addEventListener("click", () => {
    editPostForm.classList.add("hidden");
  });
}

// Start the app when the DOM has loaded
document.addEventListener("DOMContentLoaded", main);