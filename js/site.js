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

  // Carrossel de fotos no fundo do início ----------------------------
  var carrossel = document.querySelector(".carrossel-fundo");
  if (carrossel) {
    var fotos = carrossel.querySelectorAll(".carrossel-imagem");
    var reduzirMovimento =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (fotos.length > 1 && !reduzirMovimento) {
      var indiceAtual = 0;
      setInterval(function () {
        fotos[indiceAtual].classList.remove("ativa");
        indiceAtual = (indiceAtual + 1) % fotos.length;
        fotos[indiceAtual].classList.add("ativa");
      }, 5000);
    }
  }

  // Grade de horários: seleção de oficinas e conflito de horário ------
  var slotsOficina = document.querySelectorAll(".oficina-slot");

  if (slotsOficina.length) {
    var CHAVE_SELECAO = "ifromatizando-oficinas-selecionadas";
    var itensResumo = document.querySelectorAll(".resumo-item");
    var botaoLimpar = document.getElementById("limpar-selecao");

    function lerSelecaoSalva() {
      try {
        var salvo = window.localStorage.getItem(CHAVE_SELECAO);
        return salvo ? JSON.parse(salvo) : [];
      } catch (erro) {
        return [];
      }
    }

    function gravarSelecaoSalva(lista) {
      try {
        window.localStorage.setItem(CHAVE_SELECAO, JSON.stringify(lista));
      } catch (erro) {
        // localStorage indisponível (ex.: navegação privada): a
        // seleção segue funcionando nesta visita, só não persiste.
      }
    }

    function selecaoAtual() {
      var escolhidas = [];
      slotsOficina.forEach(function (slot) {
        var botaoSlot = slot.querySelector(".selecionar-btn");
        if (botaoSlot && botaoSlot.getAttribute("aria-pressed") === "true") {
          escolhidas.push(botaoSlot.getAttribute("data-oficina"));
        }
      });
      return escolhidas;
    }

    var tabelaHorarios = document.getElementById("tabela-horarios");
    var horarioPorOficina = {};

    if (tabelaHorarios) {
      tabelaHorarios.querySelectorAll("tr[data-oficina]").forEach(function (linha) {
        var oficina = linha.getAttribute("data-oficina");
        var horario = linha.getAttribute("data-horario");
        if (oficina && horario) {
          horarioPorOficina[oficina] = horario;
        }
      });
    }

    function horarioDaOficina(oficinaId) {
      return horarioPorOficina[oficinaId] || null;
    }

    function atualizarInterface() {
      var porRodada = {};
      var porHorario = {};

      slotsOficina.forEach(function (slot) {
        var rodada = slot.getAttribute("data-rodada");
        var botaoSlot = slot.querySelector(".selecionar-btn");
        if (botaoSlot && botaoSlot.getAttribute("aria-pressed") === "true") {
          var oficinaId = botaoSlot.getAttribute("data-oficina");
          var horario = horarioDaOficina(oficinaId);
          porRodada[rodada] = (porRodada[rodada] || 0) + 1;

          if (horario) {
            porHorario[horario] = (porHorario[horario] || 0) + 1;
          }
        }
      });

      slotsOficina.forEach(function (slot) {
        var rodada = slot.getAttribute("data-rodada");
        var botaoSlot = slot.querySelector(".selecionar-btn");
        var textoBotao = botaoSlot
          ? botaoSlot.querySelector(".selecionar-texto")
          : null;
        var oficinaId = botaoSlot ? botaoSlot.getAttribute("data-oficina") : null;
        var horario = oficinaId ? horarioDaOficina(oficinaId) : null;

        slot.classList.remove("sem-conflito", "conflito");

        if (!botaoSlot || botaoSlot.getAttribute("aria-pressed") !== "true") {
          if (textoBotao) textoBotao.textContent = "Quero participar";
          return;
        }

        var conflito = Boolean(horario && porHorario[horario] > 1);

        if (conflito || porRodada[rodada] > 1) {
          slot.classList.add("conflito");
          if (textoBotao) textoBotao.textContent = "Conflito de horário";
        } else {
          slot.classList.add("sem-conflito");
          if (textoBotao) textoBotao.textContent = "Você vai participar";
        }
      });

      itensResumo.forEach(function (item) {
        var rodada = item.getAttribute("data-rodada");
        var estadoEl = item.querySelector(".resumo-estado");
        var quantidade = porRodada[rodada] || 0;

        if (quantidade === 0) {
          item.setAttribute("data-estado", "vazio");
          if (estadoEl) estadoEl.textContent = "Nenhuma oficina selecionada ainda";
          return;
        }

        if (quantidade === 1) {
          var slotEscolhido = document.querySelector(
            '.oficina-slot[data-rodada="' + rodada + '"] .selecionar-btn[aria-pressed="true"]'
          );
          var tituloEscolhido = "";
          var labEscolhido = "";
          if (slotEscolhido) {
            var slotPai = slotEscolhido.closest(".oficina-slot");
            var cardPai = slotEscolhido.closest(".lab-card");
            if (slotPai && slotPai.querySelector("h4")) {
              tituloEscolhido = slotPai.querySelector("h4").textContent;
            }
            if (cardPai && cardPai.querySelector("h3")) {
              labEscolhido = cardPai.querySelector("h3").textContent;
            }
          }
          item.setAttribute("data-estado", "ok");
          if (estadoEl) {
            estadoEl.textContent = tituloEscolhido + " — " + labEscolhido;
          }
          return;
        }

        item.setAttribute("data-estado", "conflito");
        if (estadoEl) {
          estadoEl.textContent =
            "Conflito: " + quantidade + " oficinas marcadas neste horário. Desmarque uma.";
        }
      });
    }

    var selecaoSalva = lerSelecaoSalva();

    slotsOficina.forEach(function (slot) {
      var botaoSlot = slot.querySelector(".selecionar-btn");
      if (!botaoSlot) return;

      var id = botaoSlot.getAttribute("data-oficina");
      if (selecaoSalva.indexOf(id) !== -1) {
        botaoSlot.setAttribute("aria-pressed", "true");
      }

      botaoSlot.addEventListener("click", function () {
        var pressionado = botaoSlot.getAttribute("aria-pressed") === "true";
        botaoSlot.setAttribute("aria-pressed", String(!pressionado));
        gravarSelecaoSalva(selecaoAtual());
        atualizarInterface();
      });
    });

    if (botaoLimpar) {
      botaoLimpar.addEventListener("click", function () {
        slotsOficina.forEach(function (slot) {
          var botaoSlot = slot.querySelector(".selecionar-btn");
          if (botaoSlot) botaoSlot.setAttribute("aria-pressed", "false");
        });
        gravarSelecaoSalva([]);
        atualizarInterface();
      });
    }

    atualizarInterface();
  }
})();
