import { renderUploadImageComponent } from "./upload-image-component.js";
import { renderHeaderComponent } from "./header-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const setPostImageUrl = (newImageUrl) => {
    imageUrl = newImageUrl;
  };

  const render = () => {
    // @TODO: Реализовать страницу добавления поста
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      Cтраница добавления поста
      </br>
      </br>
      <div class="upload-image-container"></div>
      </br>
      </br>
      <textarea
          type="textarea"
          class="add-form-text"
          placeholder="Введите ваш коментарий"
          rows="4"
          id="description-input"
          style="border: 2px solid #3CBC8D; border-radius: 4px; background-color: lightblue;"
      ></textarea>
      <button class="button" id="add-button">Добавить</button>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    renderUploadImageComponent({
      element: uploadImageContainer,
      onImageUrlChange: setPostImageUrl,
    });

    // document.getElementById("add-button").addEventListener("click", () => {
    //   onAddPostClick({
    //     description: "Описание картинки",
    //     imageUrl: "https://image.png",
    //   });
    // });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.getElementById("description-input").value;

      if (!description) {
        alert("Введите описание картинки");
        return;
      }

      if (!imageUrl) {
        alert("Загрузите изображение");
        return;
      }

      onAddPostClick({
        description: description.trim(),
        imageUrl,
      });
    });
  };
  render();
}
