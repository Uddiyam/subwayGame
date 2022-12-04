import React from "react";
import io from "socket.io-client";
import styles from "./styles/WaitingRoom.module.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function WaitingRoom() {
  let navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [click, setClick] = useState(false);
  const [wait, setWait] = useState([]);
  const [waitSocket, setWaitSocket] = useState();
  let newId = localStorage.getItem("newId");
  const [user2, setUser] = useState();
  const [change, setChange] = useState(false);
  const [socketId, setSocketId] = useState();
  const [changeTF, setChangeTF] = useState(false);

  const socket = io.connect("http://localhost:8080/");
  socket.on("connect", () => {
    socket.emit("event1", "hi");
  });
  socket.on("endGame", async (newid, waitTF, user) => {
    newid && localStorage.setItem("newId", newid.id);
    waitSocket &&
      (await socket.emit(
        "change",
        waitSocket,
        localStorage.getItem("newId", newid.id)
      ));
    socket.on("changeRe", async (data) => {
      console.log(data);
      await setChange(true);
    });
  });

  socket.on("msg", async (user) => {
    setWait(user.wait);
    setSocketId(user.socket_id);
    //setId(count);
    await socket.on("startGame", async (names, sockets) => {
      await navigate("/GameRoom", {
        state: {
          userName: user.nickname,
          id: user2 ? user2.id : user.id,
          allusers: names,
          socketId: user.socket_id,
          sockets: sockets,
        },
      });
    });
  });

  socket.on("wait", async (data) => {
    console.log(data);
    await setWait(data);
    await setWaitSocket(data.socket_id);
  });

  socket.on("msg2", async (user) => {
    await socket.on("startGame2", async (names, sockets) => {
      await navigate("/GameRoom", {
        state: {
          userName: user.nickname,
          id: user.id,
          allusers: names,
          socketId: user.socket_id,
          sockets: sockets,
        },
      });
    });
  });

  return (
    <div className={styles.Container}>
      <Form className={styles.FormWrap}>
        <div className={styles.InputWrap}>
          <Form.Group className={styles.InputWrap} controlId="formBasicEmail">
            <Form.Control
              className={styles.Input}
              type="text"
              placeholder="이름을 입력해주세요"
              autoComplete="off"
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <div className={styles.BtnWrap}>
              {userName.length == 0 || click == true ? (
                <Button
                  variant="primary"
                  size="lg"
                  className={styles.Btn}
                  disabled
                >
                  Ready
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className={styles.Btn}
                  onClick={async () => {
                    await socket.emit("join_room", userName);
                    setClick(true);
                  }}
                >
                  Ready
                </Button>
              )}
            </div>

            <div className={styles.Msg}>
              {(userName.length == 0 || click == false) && (
                <span style={{ color: "red" }}>
                  이름을 입력하고 Ready 버튼을 누르세요
                </span>
              )}
              {userName.length > 0 && click && wait == 0 && (
                <span style={{ color: "blue" }}>
                  다른 게임 참가자를 기다리고 있습니다
                </span>
              )}
              {userName.length > 0 && click && wait != 0 && (
                <>
                  <span style={{ color: "green" }}>
                    먼저 접속한 클라이언트들 간 게임이 진행 중입니다
                  </span>
                  <div className={styles.SeeBtn}>
                    <Button
                      variant="primary"
                      size="lg"
                      className={styles.Btn}
                      onClick={() => {
                        console.log(wait);
                        socket.emit(
                          "see",
                          user2 && user2.id != "undefined" ? user2 : wait
                        );
                        socket.on("seeGame", async (data, names, sockets) => {
                          await setWaitSocket(data.socket_id);
                          await navigate("/GameRoom", {
                            state: {
                              userName: data.nickname,
                              wait_id: data.id,
                              allusers: names,
                              wait_socket: data.socket_id,
                            },
                          });
                        });
                      }}
                    >
                      관전하기
                    </Button>
                  </div>
                  {change &&
                    (changeTF == false ? (
                      <div className={styles.SeeBtn}>
                        <Button
                          variant="primary"
                          size="lg"
                          className={styles.Btn}
                          onClick={async () => {
                            setClick(true);
                            setChangeTF(true);
                            await socket.emit(
                              "restart1",
                              waitSocket ? waitSocket : socketId
                            );
                          }}
                        >
                          게임시작
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.SeeBtn}>
                        <Button
                          variant="primary"
                          size="lg"
                          className={styles.Btn}
                          disabled
                        >
                          게임시작
                        </Button>
                      </div>
                    ))}
                </>
              )}
            </div>
          </Form.Group>
        </div>
      </Form>
    </div>
  );
}
