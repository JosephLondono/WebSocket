import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";

import { questions } from "./questions.js";

let room = {
  players: [],
  status: "waiting",
  messages: [],
  leader: null, // Añadir campo para el líder
};

let respuestasJugadores = {};
let preguntaActual = 0;
let respuestasFinales = {};

let puntuaciones = {};
let tiempoRespuesta = {};

const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(logger("dev"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.get("/jugar", (req, res) => {
  try {
    const rawName = (req.query.name || "").replace(/\+/g, " ");
    const nombre = decodeURIComponent(rawName);

    if (!nombre.trim()) {
      return res.redirect("/");
    }

    res.sendFile(process.cwd() + "/public/jugar.html");
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/test", (req, res) => {
  res.sendFile(process.cwd() + "/public/test.html");
});

// Añadir esta ruta antes de server.listen()
app.get("/download-messages", (req, res) => {
  const messagesWithDates = room.messages.map((msg) => ({
    usuario: msg.user,
    mensaje: msg.message,
    fecha: new Date().toISOString(), // Agregar fecha si no existe
  }));

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=mensajes.json");
  res.send(JSON.stringify(messagesWithDates, null, 2));
});

server.listen(port, () => {
  console.log(`Server listening in port: ${port}`);
  console.log(`http://localhost:${port}`);
});

function crearSala() {
  if (room.players.length === 0) {
    room.status = "waiting";
  }
}

function actualizarJugadores(playerJoined) {
  room.players.push(playerJoined);
}

function eliminarJugador(id) {
  room.players = room.players.filter((player) => player.id !== id);
}

let disconnectedPlayers = {};

io.on("connection", (socket) => {
  console.log("A user connected ws");
  const referer = socket.request.headers.referer || "";
  const [baseUrl, queryParams] = referer.split("?name=");
  const rawName = queryParams ? queryParams.replace(/\+/g, " ") : "";
  const decodedName = decodeURIComponent(rawName);

  // Validar nombre vacío
  if (!decodedName.trim()) {
    socket.disconnect();
    return;
  }

  let playerJoined = {
    id: socket.id,
    name: decodedName.replace(/</g, "&lt;").replace(/>/g, "&gt;"), // Sanitizar
  };

  // Asignar líder si es el primer jugador
  if (room.players.length === 0) {
    room.leader = socket.id;
    playerJoined.isLeader = true;
  } else {
    playerJoined.isLeader = false;
  }

  io.emit("room-update", {
    players: room.players,
    leader: room.leader,
  });

  crearSala();
  actualizarJugadores(playerJoined);

  console.log("Cantidad Usuarios: " + room.players.length);

  socket.broadcast.emit("new-player", playerJoined);
  io.emit("room-players", room.players); // Emitir evento para actualizar la lista de jugadores

  socket.on("join-room", () => {
    socket.emit("room-players", room.players);
  });

  socket.on("message", (message) => {
    const nameUser = room.players.find(
      (player) => player.id === socket.id
    ).name;
    // Agregar timestamp al mensaje
    room.messages.push({
      user: nameUser,
      message: message,
      fecha: new Date().toISOString(),
    });
    socket.broadcast.emit("new-message", message, nameUser);
  });

  socket.on("disconnect", () => {
    if (!disconnectedPlayers[socket.id]) {
      socket.broadcast.emit("player-disconnected", socket.id);
      eliminarJugador(socket.id);
      console.log("User disconnected");
      disconnectedPlayers[socket.id] = true;

      // Eliminar la marca de desconexión después de un tiempo
      setTimeout(() => {
        delete disconnectedPlayers[socket.id];
      }, 1000);
    }

    if (room.players.length === 0) {
      resetGame();
    } else if (room.players.length === 1) {
      // Reiniciar la sala y el juego completamente
      resetGame();
      room.leader = room.players[0].id;
      room.players[0].isLeader = true;
      io.emit("reset-game");
    } else if (room.leader === socket.id) {
      room.leader = room.players[0].id;
      room.players[0].isLeader = true;
    }
    io.emit("room-players", room.players);
  });

  socket.on("start-game", () => {
    room.status = "playing";
    puntuaciones = {};
    tiempoRespuesta = {};
    room.players.forEach((player) => {
      puntuaciones[player.name] = 0;
    });
    io.emit("game-started");
    preguntaActual = 0;

    let tiempoRestante = 5;
    const intervalId = setInterval(() => {
      io.emit("timer-update", tiempoRestante);
      tiempoRestante--;

      if (tiempoRestante < 0) {
        clearInterval(intervalId);
        io.emit("timer-complete");
        enviarPreguntas();
      }
    }, 1000);
  });

  socket.on("answer", (answer) => {
    const nameUser = room.players.find(
      (player) => player.id === socket.id
    ).name;
    const tiempoTranscurrido = Date.now() - tiempoRespuesta[nameUser];
    const segundosTranscurridos = Math.floor(tiempoTranscurrido / 1000);

    // Calcular puntuación basada en tiempo y respuesta correcta
    if (
      questions[preguntaActual - 1].respuesta ===
      questions[preguntaActual - 1].opciones[answer]
    ) {
      // Máximo 1000 puntos por respuesta correcta
      // Se restan puntos según el tiempo transcurrido (máximo 30 segundos)
      const puntosPorTiempo = Math.max(
        0,
        Math.floor(1000 - segundosTranscurridos * (1000 / 30))
      );
      puntuaciones[nameUser] += puntosPorTiempo;
    }

    respuestasJugadores[nameUser] = answer;

    if (Object.keys(respuestasJugadores).length === room.players.length) {
      clearInterval(room.timerInterval); // Detener el temporizador si todos responden
      procesarRespuestas();
    }

    socket.broadcast.emit("user-answer", answer, nameUser);
  });
});

function enviarPreguntas() {
  // Si la sala no está en estado "playing", no enviar más preguntas
  if (room.status !== "playing") {
    return;
  }

  if (preguntaActual < questions.length) {
    const dataSend = {
      pregunta: questions[preguntaActual].pregunta,
      opciones: questions[preguntaActual].opciones,
    };

    room.players.forEach((player) => {
      tiempoRespuesta[player.name] = Date.now();
    });

    io.emit("nueva-pregunta", dataSend);
    preguntaActual++;

    let tiempoRestante = 25;
    // Guardar el temporizador en room.timerInterval antes de crearlo
    clearInterval(room.timerInterval); // Limpiar el temporizador anterior si existe

    room.timerInterval = setInterval(() => {
      // Verificar si la sala sigue en estado "playing"
      if (room.status !== "playing") {
        clearInterval(room.timerInterval);
        return;
      }

      tiempoRestante--;
      io.emit("timer-update", tiempoRestante);

      if (tiempoRestante <= 0) {
        clearInterval(room.timerInterval);
        io.emit("timer-complete");
        procesarRespuestas();
      }
    }, 1000);
  } else {
    io.emit("fin-preguntas");
    respuestasJugadores = {};
  }
}

function procesarRespuestas() {
  io.emit("actualizar-puntuaciones", puntuaciones);
  io.emit(
    "mostrar-respuestas",
    respuestasJugadores,
    questions[preguntaActual - 1]
  );
  console.log("Respuestas jugadores ANTES: ", respuestasJugadores);

  respuestasFinales[preguntaActual - 1] = { ...respuestasJugadores };
  respuestasJugadores = {};
  console.log("Respuestas jugadores DESPUES: ", respuestasJugadores);

  if (preguntaActual >= questions.length) {
    const resultadosFinal = {
      respuestas: respuestasFinales,
      puntuaciones: puntuaciones,
    };
    console.log("Resultado final :", resultadosFinal);

    io.emit("mostrar-resumen-final", resultadosFinal, questions);
  } else {
    enviarPreguntas();
  }
}

function resetGame() {
  // Limpiar el temporizador principal si existe
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
  }

  // Resetear todas las variables del juego
  room.status = "waiting";
  preguntaActual = 0;
  respuestasJugadores = {};
  respuestasFinales = {};
  puntuaciones = {};
  tiempoRespuesta = {};

  // Detener cualquier temporizador pendiente
  clearInterval(room.timerInterval);
}
