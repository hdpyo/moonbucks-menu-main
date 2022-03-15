import { $ } from "./utils/DOM.js";
import MenuApi from "./api/index.js";

function App() {
  // 이 앱에서 상태를 가지는 것 (=변할 수 있는 데이터)은 무엇이 있는가? (즉, 상태 = 데이터)
  // ex. 메뉴명, 메뉴 갯수
  // -> 메뉴명만 있으면 갯수를 확인할 수 있기 때문에 굳이 갯수를 따로 관리하지 않아도 된다.

  // 메뉴의 상태를 관리할 배열
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };

  this.currentCategory = "espresso";

  this.init = async () => {
    render();
    initEventListeners();
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);

    const template = this.menu[this.currentCategory]
      .map(menuItem => {
        return `
        <li data-menu-id="${menuItem.id}" class="menu-list-item d-flex items-center py-2">
          <span class="w-100 pl-2 menu-name ${menuItem.isSoldOut ? "sold-out" : ""}">${menuItem.name}</span>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
          >
            품절
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
          >
            수정
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
          >
            삭제
          </button>
        </li>`;
      })
      .join("");

    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  const addMenuName = async () => {
    if ($("#menu-name").value === "") {
      alert("메뉴 이름을 입력해 주세요.");
      return;
    }

    const duplicatedMenuName = this.menu[this.currentCategory].find(menuItem => menuItem.name === $("#menu-name").value);
    if (duplicatedMenuName) {
      alert("이미 등록된 메뉴입니다. 다시 입력해주세요.");
      $("#menu-name").value = "";
      return;
    }

    const menuName = $("#menu-name").value;

    await MenuApi.createMenu(this.currentCategory, menuName);

    render();
    $("#menu-name").value = "";
  };

  const updateMenuCount = () => {
    $(".menu-count").innerText = `총 ${this.menu[this.currentCategory].length} 개`;
  };

  const updateMenuName = async e => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요.", $menuName.innerText);

    await MenuApi.updateMenu(this.currentCategory, updatedMenuName, menuId);
    render();
  };

  const removeMenuName = async e => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const menuId = e.target.closest("li").dataset.menuId;

      await MenuApi.removeMenu(this.currentCategory, menuId);

      render();
    }
  };

  const soldOutMenu = async e => {
    const menuId = e.target.closest("li").dataset.menuId;

    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);

    render();
  };

  const changeCategory = e => {
    const isCafeCategoryButton = e.target.classList.contains("cafe-category-name");
    if (isCafeCategoryButton) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  };

  const initEventListeners = () => {
    $("#menu-form").addEventListener("submit", e => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    $("#menu-name").addEventListener("keypress", e => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    $("#menu-list").addEventListener("click", e => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    $("nav").addEventListener("click", changeCategory);
  };
}

const app = new App();
app.init();
