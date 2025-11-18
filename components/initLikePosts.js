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

      post.isLiked = !wasLiked;
      if (wasLiked) {
        delete post.likes[user._id];
      } else {
        post.likes[user._id] = true;
      }

      const newLikesCount = Object.keys(post.likes).length;

      img.src = post.isLiked
        ? "./assets/images/like-active.svg"
        : "./assets/images/like-not-active.svg";

      const likesCounter = likeButton
        .closest(".post")
        ?.querySelector(".post-likes-text > strong");

      if (likesCounter) {
        likesCounter.textContent = newLikesCount;
      }

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
    });
  }
}
