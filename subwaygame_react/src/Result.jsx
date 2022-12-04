import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import styles from "./styles/Result.module.css";
import io from "socket.io-client";

export default function Result() {
  let location = useLocation();
  //  let newId = location.state.newId && location.state.newId.id;
  let user = location.state.user;
  let all = location.state.all;
  let wait_socket = location.state.wait_socket;

  let navigate = useNavigate();
  const [click, setClick] = useState(false);
  const [re, setRe] = useState(false);
  const [names, setNames] = useState([]);
  const [point, setPoint] = useState([]);
  const [max, setMax] = useState("");
  const [new_, setNew] = useState("");
  const [count, setCount] = useState(0);

  const socket = io.connect("http://23.21.129.130:8080/");

  useEffect(() => {
    socket.emit("point", all);
    socket.on("pointResult", async (point, names) => {
      await setNames(names);
      await setPoint(point);
      await setMax(Math.max.apply(null, point));
    });
  }, []);

  wait_socket &&
    socket.emit("change", wait_socket, localStorage.getItem("newId"));

  socket.on("endGame", async (newid, waitTF, user) => {
    newid && localStorage.setItem("newId", newid.id);
    await (newid && socket.emit("deleteUser", newid.socket_id));
    setRe(true);
    newid && setNew(newid.id);
  });
  socket.on("msg2", (user) => {
    console.log(user);

    socket.on("startGame2", (names, sockets) => {
      navigate("/GameRoom", {
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
    <>
      <div className={styles.Container}>
        <h2 style={{ marginBottom: "2%" }}>Score</h2>

        {names.map((a, i) => {
          return (
            <div className={styles.Result}>
              {a} : {point[i]}
              <span className={max != point[i] ? styles.WinF : styles.WinT}>
                {max != point[i] ? "패배" : "승리"}
              </span>
            </div>
          );
        })}

        {click == false ? (
          <Button
            variant="primary"
            size="lg"
            className={styles.Btn}
            onClick={async () => {
              setClick(true);
              setCount(count + 1);

              await socket.emit("restart1", wait_socket ? wait_socket : user);
              console.log(user);
              setRe(false);
            }}
          >
            다시하기
          </Button>
        ) : (
          <>
            <Button variant="primary" size="lg" className={styles.Btn} disabled>
              다시하기
            </Button>
            {re ? (
              <div className={styles.Content}>
                <span>참가자를 기다리는 중</span>
              </div>
            ) : (
              <div className={styles.Content}>
                <span>상대방의 선택을 기다리는 중</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
