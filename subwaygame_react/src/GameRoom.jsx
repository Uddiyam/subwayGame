import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router";
import styles from "./styles/GameRoom.module.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import data from "./line1.json";

export default function GameRoom() {
  let navigate = useNavigate();
  let location = useLocation();
  let userName = location.state.userName;
  let id = location.state.id;
  let all = location.state.allusers;
  let wait_id = location.state.wait_id;
  let wait_socket = location.state.wait_socket;
  let socketId = location.state.socketId;
  let sockets = location.state.sockets;
  const [count, setCount] = useState(1);
  let newId = localStorage.getItem("newId");

  const [answer, setAnswer] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [answerUser, setAnswerUser] = useState([]);
  const [isclicked, setIsClicked] = useState(false);
  const [score, setScore] = useState([0, 0, 0]);
  const socket = io.connect("http://23.21.129.130:8080/");
  const [score_wait, setScoreWait] = useState([]);
  newId && socket.emit("newUser", newId);
  socket.on("answer", async (data) => {
    await setAnswerUser([...answerUser, data.userName]);
    await setUserAnswer([...userAnswer, data.answer]);

    count == 3 ? setCount(1) : setCount(data.uid + 1);

    time.current = 10;
  });

  socket.on("endGame", async (newid, waitTF, user) => {
    newid && localStorage.setItem("newId", newid.id);
    await (newid && socket.emit("deleteUser", newid.socket_id));
    if (waitTF === false && newid) {
      await navigate("/Result", {
        state: {
          newId: newid,
          user1: user[sockets[0]],
          user2: user[sockets[1]],
          user3: user[sockets[2]],
          user: socketId,
          all: sockets,
        },
      });
    } else if (waitTF && newid) {
      if (wait_id) wait_id = newid.id;
      await (wait_id && socket.emit("waitId", wait_id));

      await navigate("/Result", {
        state: {
          newId: newid,

          user: socketId,
          all: sockets,
          wait_socket: wait_socket,
        },
      });
    }
  });
  let score_copy = [...score];
  socket.on("timeOverAnswer", async (data) => {
    if (data.uid == 1) {
      score_copy[1] += 1;
      score_copy[2] += 1;
      await setScore(score_copy);
      await socket.emit("score", score_copy, sockets);
    } else if (data.uid == 2) {
      score_copy[0] += 1;
      score_copy[2] += 1;
      await setScore(score_copy);
      await socket.emit("score", score_copy, sockets);
    } else if (data.uid == 3) {
      score_copy[0] += 1;
      score_copy[1] += 1;
      await setScore(score_copy);
      await socket.emit("score", score_copy, sockets);
    }
    await (count == 3 ? setCount(1) : setCount(data.uid + 1));
    time.current = 10;
  });

  wait_id &&
    socket.on("scoreList", async (data) => {
      await setScoreWait(data);
    });
  const [sec, setSec] = useState(10);
  const time = useRef(10);
  const timerId = useRef(null);

  useEffect(() => {
    if (time.current == 10) {
      if (time.current >= 0) {
        timerId.current = setInterval(() => {
          setSec(time.current % 60);

          time.current -= 1;
        }, 1000);
        return () => clearInterval(timerId.current);
      }
    }
  }, []);
  let TF;

  useEffect(() => {
    if (time.current < 0) {
      async function Time() {
        TF = true;

        await socket.emit("timeOver", count, socketId);

        setAnswer([]);
      }
      Time();
    }
  }, [sec]);

  return (
    <div className={styles.Container}>
      <Form className={styles.FormWrap}>
        <div className={styles.Timer}>{sec >= 0 && sec}</div>
        <div className={styles.ScoreList}>
          <h2>Score</h2>
          {all.map((a, i) => {
            (score[i] == 4 || (score_wait.length > 0 && score_wait[i] == 4)) &&
              navigate("/Result", {
                state: {
                  user: socketId,
                  all: sockets,
                  wait_socket: wait_socket,
                },
              });

            return (
              <div>
                {a} : {score_wait.length > 0 ? score_wait[i] : score[i]}
              </div>
            );
          })}
        </div>
        <div className={styles.InputWrap}>
          <Form.Group className={styles.InputWrap} controlId="formBasicEmail">
            <div className={styles.ChatWrap}>
              {userAnswer.map((a, i) => {
                return (
                  <div>
                    <span className={styles.AnswerUser}>{answerUser[i]} :</span>
                    <span>{a}</span>
                  </div>
                );
              })}
            </div>
            {id == count ? (
              <>
                <div className={styles.Now}>
                  {userName} 님의 차례입니다 답을 입력해주세요!
                </div>
                <Form.Control
                  className={styles.Input}
                  type="text"
                  placeholder="1호선 역명을 입력해주세요"
                  autoComplete="off"
                  value={answer}
                  onChange={(e) => {
                    e.preventDefault();
                    setAnswer(e.target.value);
                  }}
                />
                <div className={styles.BtnWrap}>
                  <Button
                    variant="primary"
                    size="lg"
                    className={styles.Btn}
                    onClick={async () => {
                      answer.length > 0 &&
                        (await socket.emit(
                          "chat",
                          socketId,
                          answer,
                          data.includes(answer),
                          userAnswer.includes(answer),
                          count
                        ));
                      setAnswer([]);

                      console.log(id, count);
                      answer.length === 0 && setIsClicked(true);
                    }}
                  >
                    등록
                  </Button>
                  {answer.length == 0 && isclicked && (
                    <div className={styles.Info}>1글자 이상 입력하세요</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Form.Control
                  className={styles.Input}
                  type="text"
                  disabled={true}
                  placeholder="1호선 역명을 입력해주세요"
                  autoComplete="off"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                  }}
                />
                <div className={styles.BtnWrap}>
                  <Button
                    variant="primary"
                    size="lg"
                    className={styles.Btn}
                    disabled
                  >
                    등록
                  </Button>
                </div>
              </>
            )}
          </Form.Group>
        </div>
      </Form>
    </div>
  );
}
