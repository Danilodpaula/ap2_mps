import { useEffect, useState } from "react";
import {
  fetchPosts,
  publish,
  like,
  unlike,
  comment,
  retweet,
  deletePost,
  deleteComment,
  likeComment,
  unlikeComment,
  retweetComment,
  replyComment,
  likeSubComment,
  unlikeSubComment,
  retweetSubComment,
} from "../api";
import { useAuth } from "../hooks/useAuth";
import type { Post, Like, User } from "../types/models";

const FeedPage = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [text, setText] = useState("");

  /* ---------- helpers ---------- */
  const formatDate = (t: number) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(t);

  const usernameById = (id: string | number) =>
    users.find((u) => u.id === id)?.username || "(desconhecido)";

  /* ---------- carregar feed ---------- */
  const refresh = async () => {
    const { posts, users, subComments } = await fetchPosts();

    // anexa subComments ao comentário correspondente
    posts.forEach((p: any) =>
      p.comments?.forEach((c: any) => {
        c.subComments = subComments.filter(
          (sc: any) => sc.parentCommentId === c.id
        );
      })
    );

    setPosts(posts);
    setUsers(users);
  };
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  /* ---------- publicar ---------- */
  const handlePublish = async () => {
    if (!text.trim() || !user) return;
    await publish(user.id, text.trim());
    setText("");
    refresh();
  };

  /* ---------- like / deslike em post ---------- */
  const toggleLike = async (p: Post) => {
    if (!user) return;
    const existing = p.likes?.find((l: Like) => l.userId === user.id);
    existing ? await unlike(existing.id) : await like(p.id, user.id);
    refresh();
  };

  /* ---------- helpers de comentário ---------- */
  const likesOf = (c: any) => (c.commentLikes ?? []).length;
  const userLiked = (c: any) =>
    (c.commentLikes ?? []).some((l: any) => l.userId === user?.id);

  const rtsOf = (c: any) => (c.commentRetweets ?? []).length;
  const userRt = (c: any) =>
    (c.commentRetweets ?? []).some((r: any) => r.userId === user?.id);

  /* ---------- helpers de subComentário ---------- */
  const subLikes = (sc: any) => (sc.subCommentLikes ?? []).length;
  const subUserLiked = (sc: any) =>
    (sc.subCommentLikes ?? []).some((l: any) => l.userId === user?.id);

  const subRts = (sc: any) => (sc.subCommentRetweets ?? []).length;
  const subUserRt = (sc: any) =>
    (sc.subCommentRetweets ?? []).some((r: any) => r.userId === user?.id);

  /* ---------- render ---------- */
  return (
    <div className="feed" style={{ marginTop: "2rem" }}>
      {/* Caixa de publicação */}
      <section className="publish-box">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="No que você está pensando?"
        />
        <button onClick={handlePublish}>Publicar</button>
      </section>

      {/* Timeline */}
      {posts
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((p) => (
          <article key={p.id}>
            {/* Cabeçalho do post */}
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong>@{usernameById(p.userId)}</strong>{" "}
                <time style={{ color: "var(--text-muted)" }}>
                  · {formatDate(p.createdAt)}
                </time>
              </span>

              {/* Excluir post */}
              {p.userId === user?.id && (
                <button
                  onClick={() =>
                    confirm("Excluir publicação?") &&
                    deletePost(p.id).then(refresh)
                  }
                  title="Excluir"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              )}
            </header>

            <p>{p.content}</p>

            {/* Ações do post */}
            <footer>
              <button
                className={
                  p.likes?.some((l) => l.userId === user?.id) ? "liked" : ""
                }
                onClick={() => toggleLike(p)}
              >
                {p.likes?.some((l) => l.userId === user?.id) ? "♥" : "♡"}{" "}
                {p.likes?.length || 0}
              </button>

              <button
                className={
                  p.retweets?.some((r) => r.userId === user?.id)
                    ? "retweeted"
                    : ""
                }
                onClick={() => retweet(p.id, user!.id).then(refresh)}
              >
                🔁 {p.retweets?.length || 0}
              </button>

              <button
                onClick={() => {
                  const txt = prompt("Comentário:");
                  txt && comment(p.id, user!.id, txt).then(refresh);
                }}
              >
                💬 {p.comments?.length || 0}
              </button>
            </footer>

            {/* Comentários */}
            {p.comments?.length ? (
              <ul className="comments">
                {p.comments.map((c: any) => (
                  <li
                    key={c.id}
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {/* texto do comentário */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <strong>@{usernameById(c.userId)}</strong>: {c.text}{" "}
                        <time style={{ color: "var(--text-muted)" }}>
                          · {formatDate(c.createdAt)}
                        </time>
                      </span>

                      {c.userId === user?.id && (
                        <button
                          onClick={() =>
                            confirm("Excluir comentário?") &&
                            deleteComment(c.id).then(refresh)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {/* ações do comentário */}
                    <div style={{ display: "flex", gap: "1.4rem" }}>
                      <button
                        className={userLiked(c) ? "liked" : ""}
                        onClick={() =>
                          userLiked(c)
                            ? unlikeComment(
                                (c.commentLikes ?? []).find(
                                  (l: any) => l.userId === user?.id
                                ).id
                              ).then(refresh)
                            : likeComment(c.id, user!.id).then(refresh)
                        }
                      >
                        {userLiked(c) ? "♥" : "♡"} {likesOf(c)}
                      </button>

                      <button
                        className={userRt(c) ? "retweeted" : ""}
                        onClick={() =>
                          retweetComment(c.id, user!.id).then(refresh)
                        }
                      >
                        🔁 {rtsOf(c)}
                      </button>

                      <button
                        onClick={() => {
                          const reply = prompt("Responder comentário:");
                          reply &&
                            replyComment(c.id, user!.id, reply).then(refresh);
                        }}
                      >
                        💬 {c.subComments?.length || 0}
                      </button>
                    </div>

                    {/* subcomentários */}
                    {c.subComments?.length ? (
                      <ul className="subcomments">
                        {c.subComments.map((sc: any) => (
                          <li key={sc.id}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                <strong>@{usernameById(sc.userId)}</strong>:{" "}
                                {sc.text}{" "}
                                <time
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  · {formatDate(sc.createdAt)}
                                </time>
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "1.2rem",
                                fontSize: ".85rem",
                              }}
                            >
                              <button
                                className={subUserLiked(sc) ? "liked" : ""}
                                onClick={() =>
                                  subUserLiked(sc)
                                    ? unlikeSubComment(
                                        (sc.subCommentLikes ?? []).find(
                                          (l: any) =>
                                            l.userId === user?.id
                                        ).id
                                      ).then(refresh)
                                    : likeSubComment(
                                        sc.id,
                                        user!.id
                                      ).then(refresh)
                                }
                              >
                                {subUserLiked(sc) ? "♥" : "♡"} {subLikes(sc)}
                              </button>

                              <button
                                className={subUserRt(sc) ? "retweeted" : ""}
                                onClick={() =>
                                  retweetSubComment(
                                    sc.id,
                                    user!.id
                                  ).then(refresh)
                                }
                              >
                                🔁 {subRts(sc)}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
    </div>
  );
};

export default FeedPage;
