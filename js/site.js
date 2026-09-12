(function () {
  var alvo = new Date("2026-10-29T09:00:00-04:00");
  var raiz = document.getElementById("tempo-evento");
  var botao = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav-principal");

  function dois(n) {
    return String(n).padStart(2, "0");
  }

  function atualizar() {
    if (!raiz) return;

    var resto = alvo.getTime() - Date.now();
    if (resto < 0) {
      raiz.setAttribute("datetime", "2026-10-29T09:00:00-04:00");
      raiz.innerHTML =
        '<p class="evento-hoje">O workshop já começou. Confira a programação abaixo.</p>';
      return;
    }

    var s = Math.floor(resto / 1000);
    var dias = Math.floor(s / 86400);
    s %= 86400;
    var horas = Math.floor(s / 3600);
    s %= 3600;
    var minutos = Math.floor(s / 60);
    var segundos = s % 60;

    raiz.setAttribute("datetime", "2026-10-29T09:00:00-04:00");
    raiz.innerHTML =
      bloco(dois(dias), "dias") +
      bloco(dois(horas), "horas") +
      bloco(dois(minutos), "min") +
      bloco(dois(segundos), "seg");
  }

  function bloco(valor, rotulo) {
    return (
      '<span class="bloco-tempo"><strong>' +
      valor +
      "</strong><span>" +
      rotulo +
      "</span></span>"
    );
  }

  atualizar();
  setInterval(atualizar, 1000);

  if (botao && nav) {
    botao.addEventListener("click", function () {
      var aberto = botao.getAttribute("aria-expanded") === "true";
      botao.setAttribute("aria-expanded", String(!aberto));
      nav.classList.toggle("aberto", !aberto);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        botao.setAttribute("aria-expanded", "false");
        nav.classList.remove("aberto");
      });
    });
  }
})();
