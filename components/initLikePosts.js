import { posts, user, getToken } from "../index.js";
import { toggleLike } from "./api.js";

export function initLikePosts() {
  for (const likeButton of document.querySelectorAll(".like-button")) {
    const postId = likeButton.dataset.postId;

    const post = posts.find((p) => p.idPost === postId);
    if (!post) continue;

    const img = likeButton.querySelector("img");
    if (!img) continue;

    if (post.isLiked) {
      img.src = "./assets/images/like-active.svg";
    } else {
      img.src = "./assets/images/like-not-active.svg";
    }

    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const post = posts.find((p) => p.idPost === postId);
      if (!post || !user) return;

      const wasLiked = post.isLiked;

      if (wasLiked) {
        post.isLiked = false;
        delete post.likes[user._id];
      } else {
        post.isLiked = true;
        post.likes[user._id] = true;
      }
      console.log(posts[0].likes);

      const newLikesCount = Object.keys(post.likes).length;

      const img = likeButton.querySelector("img");
      img.src = wasLiked
        ? "./assets/images/like-not-active.svg"
        : "./assets/images/like-active.svg";

      const likesCounter = likeButton
        .closest(".post")
        ?.querySelector(".post-likes-text > strong");

      if (likesCounter) {
        likesCounter.textContent = newLikesCount;
      } else {
        console.error("❌ Счётчик не найден для поста:", postId);
      }

      toggleLike({ postId, token: getToken() }).catch((error) => {
        console.error("Ошибка при лайке:", error);

        if (wasLiked) {
          post.isLiked = true;
          post.likes[user._id] = true;
        } else {
          post.isLiked = false;
          delete post.likes[user._id];
        }

        img.src = wasLiked
          ? "./assets/images/like-active.svg"
          : "./assets/images/like-not-active.svg";

        const rollbackCount = Object.keys(post.likes).length;
        if (likesCounter) {
          likesCounter.textContent = rollbackCount;
        }

        alert("Не удалось обновить лайк");
      });
    });
  }
}
