import { createPost, getPosts, getUserPosts } from "./components/api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { initLikePosts } from "./components/initLikePosts.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
export let allPosts = [];
export let data = null;
export let abortController = null;
export let currentUserId = null;
export const userPostsCache = new Map();
export const USER_POSTS_CACHE_TTL = 30000;

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, pageData) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      if (allPosts.length > 0) {
        posts = allPosts;
        page = POSTS_PAGE;
        renderApp();
        return;
      }

      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          allPosts = newPosts;
          posts = newPosts;
          page = POSTS_PAGE;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          page = POSTS_PAGE;
          posts = [];
          renderApp();
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      page = USER_POSTS_PAGE;
      data = pageData;
      return renderApp();
    }

    page = newPage;
    data = null;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({ appEl, user, goToPage });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        createPost({ description, imageUrl, token: getToken() })
          .then(() => {
            return getPosts({ token: getToken() });
          })
          .then((newPosts) => {
            allPosts = newPosts;
            posts = newPosts;
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error("Ошибка при добавлении поста:", error);
            alert(`Ошибка: ${error.message}`);
            goToPage(ADD_POSTS_PAGE);
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    const userId = data.userId;

    const cache = userPostsCache.get(userId);
    const isCacheActual =
      cache && Date.now() - cache.timestamp < USER_POSTS_CACHE_TTL;

    if (isCacheActual) {
      posts = cache.posts;
      renderPostsPageComponent({ appEl });
      return;
    }

    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    renderLoadingPageComponent({ appEl, user, goToPage });

    getUserPosts({ userId, token: getToken(), signal: abortController.signal })
      .then((userPosts) => {
        if (page === USER_POSTS_PAGE && data.userId === userId) {
          posts = userPosts;
          userPostsCache.set(userId, {
            posts: userPosts,
            timestamp: Date.now(),
          });
          renderPostsPageComponent({ appEl });
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Запрос отменён");
          return;
        }

        console.error("Ошибка загрузки постов пользователя:", error);
        appEl.innerHTML = `
        <div class="page-container">
          <p>Не удалось загрузить посты пользователя.</p>
          <button class="button" onclick="goToPage(POSTS_PAGE)">Назад к ленте</button>
        </div>
      `;
      });

    return;
  }
};

goToPage(POSTS_PAGE);

setTimeout(() => {
  initLikePosts();
}, 0);
