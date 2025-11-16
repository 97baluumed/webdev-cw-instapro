// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "maksim-novozhilov";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      const appPosts = data.posts.map((post) => {
        return {
          idPost: post.id,
          imageUrlPost: post.imageUrl,
          date: formatDate(post.createdAt),
          description: post.description,
          idUser: post.user.id,
          name: post.user.name,
          imageUrlUser: post.user.imageUrl,
          likes: post.likes.reduce((acc, like) => {
            acc[like.id] = true;
            return acc;
          }, {}),
          isLiked: post.isLiked,
        };
      });
      return appPosts;
    });
}

export const createPost = ({ description, imageUrl, token }) => {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description: description,
      imageUrl: imageUrl,
    }),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.message || "Ошибка при добавлении поста");
      });
    }
    return response.json();
  });
};

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export const toggleLike = ({ postId, token }) => {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((error) => {
        throw new Error(error.message || "Ошибка при установке лайка");
      });
    }
    return res.json();
  });
};
