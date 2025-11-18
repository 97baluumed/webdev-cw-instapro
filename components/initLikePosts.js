import { posts, user, getToken, goToPage } from "../index.js";
import { USER_POSTS_PAGE } from "../routes.js";
import { toggleLike } from "./api.js";

export function initLikePosts() {
  // Убираем дублирующие слушатели на лайках
  for (const likeButton of document.querySelectorAll(".like-button")) {
    const postId = likeButton.dataset.postId;
    const post = posts.find((p) => p.idPost === postId);
    if (!post) continue;

    const img = likeButton.querySelector("img");
    if (!img) continue;

    img.src = post.isLiked
      ? "./assets/images/like-active.svg"
      : "./assets/images/like-not-active.svg";

    likeButton.dataset.listener = "true";
    likeButton.removeEventListener("click", handleLikeClick);
    likeButton.addEventListener("click", handleLikeClick);
  }

  document.removeEventListener("click", handleUserClick);
  document.addEventListener("click", handleUserClick);
}

function handleLikeClick(event) {
  event.stopPropagation();

  const button = event.currentTarget;
  const postId = button.dataset.postId;
  const post = posts.find((p) => p.idPost === postId);
  if (!post || !user) return;

  const wasLiked = post.isLiked;

  post.isLiked = !wasLiked;
  if (wasLiked) {
    delete post.likes[user._id];
  } else {
    post.likes[user._id] = true;
  }

  const img = button.querySelector("img");
  const likesCounter = button
    .closest(".post")
    ?.querySelector(".post-likes-text > strong");

  if (likesCounter) {
    likesCounter.textContent = Object.keys(post.likes).length;
  }

  img.src = post.isLiked
    ? "./assets/images/like-active.svg"
    : "./assets/images/like-not-active.svg";

  toggleLike({ postId, token: getToken(), isLiked: wasLiked })
    .then((result) => {
      post.isLiked = result.isLiked;
      if (likesCounter) {
        likesCounter.textContent = result.likesCount;
      }
    })
    .catch((error) => {
      console.error("Ошибка при лайке:", error);

      post.isLiked = wasLiked;
      if (wasLiked) {
        post.likes[user._id] = true;
      } else {
        delete post.likes[user._id];
      }

      const rollbackCount = Object.keys(post.likes).length;
      if (likesCounter) {
        likesCounter.textContent = rollbackCount;
      }

      img.src = post.isLiked
        ? "./assets/images/like-active.svg"
        : "./assets/images/like-not-active.svg";

      alert("Не удалось обновить лайк");
    });
}

function handleUserClick(event) {
  const userId = event.target.closest("[data-user-id]")?.dataset.userId;
  if (userId) {
    goToPage(USER_POSTS_PAGE, { userId });
  }
}
