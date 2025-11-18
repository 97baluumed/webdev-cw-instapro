import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, user } from "../index.js";
import { initLikePosts } from "./initLikePosts.js";

export function renderPostsPageComponent({ appEl }) {
  const appPosts = posts
    .map((post) => {
      const isLiked = post.isLiked;
      const likesCount = Object.keys(post.likes).length;
      return `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  <li class="post">
                    <div class="post-header" data-user-id="${post.idUser}">
                        <img src="${
                          post.imageUrlUser
                        }" class="post-header__user-image">
                        <p class="post-header__user-name">${post.name}</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src="${post.imageUrlPost}">
                    </div>
                    <div class="post-likes">
                      <button data-post-id="${post.idPost}" class="like-button">
                        <img src="./assets/images/${
                          isLiked ? "like-active.svg" : "like-not-active.svg"
                        }" alt="лайк" />
                      </button>
                      <p class="post-likes-text">
                        Нравится: <strong>${likesCount}</strong>
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${post.name}</span>
                      ${post.description}
                    </p>
                    <p class="post-date">
                      ${post.date}
                    </p>
                  </li>
                </ul>
              </div>`;
    })
    .join("");
  // @TODO: реализовать рендер постов из api
  //console.log("Актуальный список постов:", posts);

  /**
   * @TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  const appHtml = `
  <div class="page-container">
    <div class="header-container"></div>
    <ul class="posts">${appPosts}</ul>
    </div>
`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  setTimeout(() => {
    initLikePosts();
  }, 0);
}
