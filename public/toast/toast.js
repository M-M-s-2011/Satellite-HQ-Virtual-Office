const Toast = {
  init() {
    this.hideTimeout = null;

    this.el = document.createElement("div");
    this.el.className = "toast";
    document.body.appendChild(this.el);
  },
  //state here signifies "success" or "error"
  show(message) {
    clearTimeout(this.hideTimeout);

    this.el.textContent = message;
    this.el.className = "toast toast--visible";

    this.el.addEventListener("click", () => {
      this.el.classList.remove("toast--visible");
    });
  },
};

document.addEventListener("DOMContentLoaded", () => Toast.init());
export default Toast;
