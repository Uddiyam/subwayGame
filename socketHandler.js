const { restart } = require("nodemon");
const { Server } = require("socket.io");

const socketHandler = (server) => {
  let count = 0;
  let id = 1;
  let restart_count = 0;
  let names = [];
  let user = {};
  let socketIds = [];
  let answerList = [];
  let waitTF = false;
  let users_re = [];
  let aa = [];
  const io = require("socket.io")(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    const req = socket.request;
    const socket_id = socket.id;
    //const client_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    //console.log("socket ID : ", socket_id);
    //console.log("client IP : ", client_ip);
    socket.on("disconnect", async () => {
      //  console.log(socket.id, "client disconnected");
      console.log(user);

      await io.emit("endGame", user[socket.id], waitTF, user);
      await socket.emit("waitGame");
    });

    socket.on("join_room", async (userName) => {
      socket.join("1호선지하철게임");
      user[socket.id] = {
        id: id,
        nickname: userName,
        point: 0,
        wait: 0,
        socket_id: socket.id,
      };
      //console.log(user[socket.id]);
      // console.log(count);
      restart_count > 0 ? (count = restart_count + 1) : (count = count);
      id += 1;
      count += 1;
      if (count <= 3) {
        names.push(userName);

        aa.push(userName);

        socketIds.push(socket.id);
        // console.log(socketIds);
        await socket.emit("msg", user[socket.id]);
        console.log("카운트?? : " + count, names, socketIds);
        if (count == 3) {
          await io.emit("startGame", names, socketIds);
          names = [];
          socketIds = [];
        }
        waitTF = false;
      }

      if (count > 3) {
        // console.log(id);

        user[socket.id].wait += 1;
        //console.log(user[socket.id]);
        await socket.emit("wait", user[socket.id]);
        waitTF = true;

        socket.on("newUser", async (data) => {
          user[socket.id].id = data;
          console.log("data!!!!!!!!!!!!!: " + data);
          await socket.emit("new2", user[socket.id]);
        });
      }
    });
    let s;

    socket.on("see", async (data) => {
      await socket.emit("seeGame", data, aa, socketIds);
    });

    socket.on("waitId", async (data) => {
      //console.log(data);
      await socket.broadcast.emit("moveResult", true);
      await socket.emit("wait_", true);
    });

    socket.on("chat", async (socketId, answer, tf_data, tf_user, count) => {
      //console.log(user[socketId], answer);
      if (tf_data == true && tf_user == false) {
        await answerList.push(answer);
        await io.emit("answer", {
          userName: user[socketId].nickname,
          answer: answer,
          uid: user[socketId].id,
          answerList: answerList,
        });
      }

      if (tf_data == false || tf_user == true) {
        await io.emit("timeOverAnswer", {
          uid: count,
          socketId: socketId,
        });
      }
    });

    socket.on("timeOver", async (count, socketId) => {
      await io.emit("timeOverAnswer", {
        uid: count,
        socketId: socketId,
      });
    });

    socket.on("score", async (data, sockets) => {
      //console.log(sockets[0], sockets[1], sockets[2]);

      if (sockets) {
        let q = await sockets.map((a, i) => {
          return (a[i] = data[i]);
        });

        if (user[sockets[0]]) {
          user[sockets[0]].point = q[0];
        }
        if (user[sockets[1]]) {
          user[sockets[1]].point = q[1];
        }
        if (user[sockets[2]]) {
          user[sockets[2]].point = q[2];
        }
        await io.emit("scoreList", q);
      }
    });

    socket.on("restart1", async (data) => {
      console.log(restart_count, data);
      await socket.emit("msg2", user[data]);

      if (user[data]) {
        user[data].point = 0;
      }
      if (restart_count <= 3) {
        console.log(user[data]);
        users_re.push(user[data]);
        names.push(user[data].nickname);

        console.log("새로운 : " + names);
        socketIds.push(socket.id);
        restart_count += 1;

        if (restart_count == 3) {
          console.log(names, socketIds);
          await io.emit("startGame2", names, socketIds);
          names = [];
          socketIds = [];
          restart_count += 1;
        }
      }

      console.log(restart_count);
    });

    socket.on("deleteUser", async (data) => {
      let delete1 = data;
      delete user[delete1];
      // await console.log(user);
    });
    let point = [];
    let name_ = [];
    socket.on("point", async (data) => {
      let data1;
      let data2;
      let data3;

      data1 = data && data[0];
      data2 = data && data[1];
      data3 = data && data[2];

      user[data1] &&
        point.push(user[data1].point) &&
        name_.push(user[data1].nickname);
      user[data2] &&
        point.push(user[data2].point) &&
        name_.push(user[data2].nickname);
      user[data3] &&
        point.push(user[data3].point) &&
        name_.push(user[data3].nickname);

      await io.emit("pointResult", point, name_);
    });
    socket.on("change", (data, uid) => {
      user[data].id = uid;
    });
  });
};

module.exports = socketHandler;
