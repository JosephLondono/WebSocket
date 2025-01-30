import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const urlParams = new URLSearchParams(window.location.search);
const nameUser = decodeURIComponent(urlParams.get("name").replace(/\+/g, " "));
if (!nameUser) window.location.href = "/";

// Configuración inicial
const socket = io();
let gameActive = false;
const colorButton = {
  0: "btn-blue",
  1: "btn-red",
  2: "btn-green",
  3: "btn-yellow",
};

// Elementos del DOM
const elements = {
  game: document.getElementById("game"),
  messageInput: document.getElementById("messageInput"),
  sendButton: document.getElementById("sendButton"),
  messageList: document.getElementById("message"),
  playersList: document.getElementById("listaPlayers"),
  startButton: document.getElementById("botonEmpezar"),
  timer: document.getElementById("timer"),
  subtitle: document.getElementById("subtitle"),
  gameContent: document.getElementById("gameContent"),
  descargarButton: document.getElementById("descargarMensajes"),

  // Elementos móviles
  mobile: {
    messageInput: document.getElementById("messageInputMobile"),
    sendButton: document.getElementById("sendButtonMobile"),
    messageList: document.getElementById("messageMobile"),
    playersList: document.getElementById("listaPlayersMobile"),
    panel: document.querySelector(".mobile-panel"),
  },
};

// Utilidades
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Control del panel móvil
document.querySelector(".mobile-menu-toggle").addEventListener("click", () => {
  elements.mobile.panel.classList.add("active");
  document.querySelector(".mobile-menu-toggle").style.display = "none";
});

document.querySelector(".panel-close-btn").addEventListener("click", () => {
  elements.mobile.panel.classList.remove("active");
  document.querySelector(".mobile-menu-toggle").style.display = "block";
});

// Actualizar listas de jugadores
const updatePlayersList = (players) => {
  const playerHTML = players
    .map(
      (player) => `
        <li data-player-id="${player.id}">
            <img src="https://robohash.org/${player.name}?set=set5" alt="${
        player.name
      }" width="40">
            <span>${escapeHtml(player.name)} ${
        player.isLeader ? '<span style="color: #f39c12;">👑</span>' : ""
      }</span>
        </li>
    `
    )
    .join("");

  [elements.playersList, elements.mobile.playersList].forEach((list) => {
    list.innerHTML = playerHTML;
  });
};

// Manejo de mensajes del chat
const handleMessageSubmit = (form, input, messageList) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = input.value.trim();

    if (message) {
      socket.emit("message", message);
      input.value = "";

      const messageHTML = `<li><span>${escapeHtml(
        nameUser
      )}: </span>${escapeHtml(message)}</li>`;
      [elements.messageList, elements.mobile.messageList].forEach((list) => {
        list.innerHTML += messageHTML;
        list.scrollTop = list.scrollHeight;
      });
    }
  });
};

// Configurar ambos formularios (escritorio y móvil)
handleMessageSubmit(
  document.querySelector("form"),
  elements.messageInput,
  elements.messageList
);
handleMessageSubmit(
  document.querySelector(".mobile-panel form"),
  elements.mobile.messageInput,
  elements.mobile.messageList
);

// Eventos de Socket.IO
socket.on("connect", () => {
  socket.emit("join-room");
  addChatMessage("Te has unido a la sala");
});

socket.on("room-players", (players) => {
  updatePlayersList(players);
  updateStartButtonState(players); // Actualizar estado del botón
  gameActive = false; // Resetear estado del juego
});

socket.on("new-player", (player) => {
  // Actualizar lista de jugadores
  const playerHTML = `
    <li data-player-id="${player.id}">
        <img src="https://robohash.org/${player.name}?set=set5" alt="${
    player.name
  }" width="40">
        <span>${escapeHtml(player.name)}</span>
    </li>
  `;

  [elements.playersList, elements.mobile.playersList].forEach((list) => {
    list.innerHTML += playerHTML;
  });

  // Actualizar estado del botón
  const currentPlayers =
    document.querySelectorAll("#listaPlayers li").length + 1;
  updateStartButtonState({ length: currentPlayers });

  addChatMessage(`${escapeHtml(player.name)} se ha unido`);
});

socket.on("player-disconnected", (socketId) => {
  [elements.playersList, elements.mobile.playersList].forEach((list) => {
    const player = list.querySelector(`[data-player-id="${socketId}"]`);
    if (player) {
      addChatMessage(
        `${player.querySelector("span").textContent} se ha desconectado`
      );
      player.remove();

      // Actualizar estado del botón después de remover jugador
      const remainingPlayers = list.querySelectorAll("li").length;
      updateStartButtonState({ length: remainingPlayers });
    }
  });
});

socket.on("reset-game", () => {
  // Limpiar el área del juego
  elements.game.innerHTML = "";

  // Mostrar el contenido inicial del juego
  elements.gameContent.style.display = "flex";

  // Ocultar el temporizador
  elements.timer.style.display = "none";
  elements.timer.textContent = "";

  // Reiniciar estado del juego
  gameActive = false;

  // Limpiar cualquier temporizador existente
  if (window.questionTimer) {
    clearInterval(window.questionTimer);
  }

  // Mostrar mensaje en el chat
  addChatMessage(
    "La partida se ha reiniciado porque no hay suficientes jugadores"
  );
});

socket.on("new-message", (message, sender) => {
  const messageHTML = `<li><span>${escapeHtml(sender)}: </span>${escapeHtml(
    message
  )}</li>`;
  [elements.messageList, elements.mobile.messageList].forEach((list) => {
    list.innerHTML += messageHTML;
    list.scrollTop = list.scrollHeight;
  });
});

// Lógica del juego
socket.on("game-started", () => {
  elements.gameContent.style.display = "none";
  elements.timer.style.display = "block";
  gameActive = true;
  updateStartButtonState([]); // Forzar actualización del botón
  addChatMessage("El juego ha comenzado");
});

socket.on("timer-update", (tiempo) => {
  elements.timer.textContent = `El juego comenzará en: ${tiempo}`;
});

socket.on("timer-complete", () => {
  elements.timer.style.display = "none";
});

socket.on("nueva-pregunta", (pregunta) => {
  elements.game.innerHTML = `
      <div class="questionsDiv">
          <h3>${escapeHtml(pregunta.pregunta)}</h3>
          <ul>
              ${pregunta.opciones
                .map(
                  (opcion, index) => `
                      <li>
                          <button class="${
                            colorButton[index]
                          }" data-index="${index}">
                              ${escapeHtml(opcion)}
                          </button>
                      </li>
                  `
                )
                .join("")}
          </ul>
          <div class="question-timer">Tiempo restante: 20</div>
      </div>
  `;

  const questionTimerElement = elements.game.querySelector(".question-timer");
  let tiempoRestante = 20;

  // Limpiar el temporizador anterior si existe
  if (window.questionTimer) {
    clearInterval(window.questionTimer);
  }

  // Guardar referencia del nuevo temporizador
  window.questionTimer = setInterval(() => {
    tiempoRestante--;
    questionTimerElement.textContent = `Tiempo restante: ${tiempoRestante}`;

    if (tiempoRestante <= 0) {
      clearInterval(window.questionTimer);
      questionTimerElement.textContent = "¡Tiempo agotado!";
    }
  }, 1000);

  elements.game.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!gameActive) return;
      socket.emit("answer", button.dataset.index);
      elements.game.querySelectorAll("button").forEach((btn) => {
        btn.disabled = true;
      });
      addChatMessage("Has respondido");
    });
  });
});

socket.on("mostrar-resumen-final", (resultados, preguntas) => {
  gameActive = false;
  elements.game.innerHTML = createResultsHTML(resultados, preguntas);
  // En la función createResultsHTML, modifica el event listener del botón:
  document.getElementById("volverJugar")?.addEventListener("click", () => {
    elements.gameContent.style.display = "flex";
    elements.timer.style.display = "none";
    elements.game.innerHTML = "";
    gameActive = false; // Añadir esta línea

    // Forzar actualización del estado del botón
    socket.emit("join-room"); // Solicitar lista actualizada de jugadores
    addChatMessage("Preparado para un nuevo juego");
  });
});

// Funciones auxiliares
function updateStartButtonState(players) {
  const playerCount = players.length || 0;
  const puedeIniciar = playerCount >= 2 && !gameActive;

  const isLeader = players.some(
    (player) => player.name === nameUser && player.isLeader
  );

  elements.descargarButton.style.display =
    playerCount >= 1 && isLeader ? "inline-block" : "none";

  elements.startButton.style.display =
    puedeIniciar && isLeader ? "inline-block" : "none";
  elements.startButton.disabled = !puedeIniciar;

  // Actualizar el mensaje del subtítulo
  elements.subtitle.textContent =
    playerCount >= 2
      ? "¡Todos listos para jugar!"
      : "Esperando más jugadores...";

  // Si solo queda un jugador durante el juego, mostrar mensaje específico
  if (playerCount < 2 && gameActive) {
    elements.subtitle.textContent =
      "No hay suficientes jugadores para continuar";
  }
}

function addChatMessage(message) {
  const html = `<li><span>🔔 Sistema: </span>${escapeHtml(message)}</li>`;
  [elements.messageList, elements.mobile.messageList].forEach((list) => {
    list.innerHTML += html;
    list.scrollTop = list.scrollHeight;
  });
}

function createResultsHTML(resultados, preguntas) {
  return `
        <div class="resumen-final">
            <div class="podio">
                <h3>🏆 Podio 🏆</h3>
                <div class="podium-container">
                    ${Object.entries(resultados.puntuaciones)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(
                        ([jugador, puntos], index) => `
                            <div class="podio-posicion posicion-${index + 1}">
                                <span class="medal">${
                                  ["🥇", "🥈", "🥉"][index]
                                }</span>
                                <span class="jugador">${escapeHtml(
                                  jugador
                                )}</span>
                                <span class="puntos">${puntos} pts</span>
                            </div>
                        `
                      )
                      .join("")}
                </div>
                ${
                  Object.entries(resultados.puntuaciones).length > 3
                    ? `
                    <div class="full-ranking">
                        <h4>Clasificación Completa</h4>
                        <div class="ranking-list">
                            ${Object.entries(resultados.puntuaciones)
                              .sort(([, a], [, b]) => b - a)
                              .slice(3)
                              .map(
                                ([jugador, puntos], index) => `
                                    <div class="ranking-item">
                                        <span>${index + 4}º ${escapeHtml(
                                  jugador
                                )}</span>
                                        <span>${puntos} pts</span>
                                    </div>
                                `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
            ${preguntas
              .map(
                (pregunta, index) => `
                <div class="pregunta-resumen">
                    <h3>Pregunta ${index + 1}: ${escapeHtml(
                  pregunta.pregunta
                )}</h3>
                    <ul class="respuestas-jugadores">
                        ${Object.entries(resultados.puntuaciones)
                          .map(([jugador]) => {
                            const respuesta =
                              resultados.respuestas[index]?.[jugador];
                            const opcion = pregunta.opciones[respuesta];
                            const correcta = opcion === pregunta.respuesta;

                            return `
                                <li class="respuesta-jugador ${
                                  correcta ? "correcta" : "incorrecta"
                                }">
                                    <strong>${escapeHtml(jugador)}:</strong>
                                    ${escapeHtml(opcion || "No respondió")}
                                </li>
                            `;
                          })
                          .join("")}
                    </ul>
                    <div class="respuesta-correcta">
                        Respuesta correcta: ${escapeHtml(pregunta.respuesta)}
                    </div>
                </div>
            `
              )
              .join("")}
            <button id="volverJugar" class="btn-blue">Volver a Jugar</button>
        </div>
    `;
}

// Inicialización
elements.startButton.addEventListener("click", () => {
  socket.emit("start-game");
});

document.addEventListener("click", (e) => {
  const panel = document.querySelector(".mobile-panel");
  if (
    panel.classList.contains("active") &&
    !panel.contains(e.target) &&
    !e.target.closest(".mobile-menu-toggle")
  ) {
    panel.classList.remove("active");
    document.querySelector(".mobile-menu-toggle").style.display = "block";
  }
});

elements.descargarButton.addEventListener("click", () => {
  fetch("/download-messages")
    .then((response) => response.json())
    .then((data) => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
});
