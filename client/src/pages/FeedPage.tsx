import { useEffect, useState, useRef } from "react";
import {
  fetchPosts,
  publish,
  uploadMedia, // Importe a nova função
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
  const [mediaFile, setMediaFile] = useState<File | null>(null); // Alterado de 'image' para 'mediaFile'
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (t: number) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(t);

  const usernameById = (id: string | number) =>
    users.find((u) => u.id === id)?.username || "(desconhecido)";

  const refresh = async () => {
    const { posts, users, subComments } = await fetchPosts();
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

  const handleClearMedia = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!text.trim() && !mediaFile) return;

    try {
      if (mediaFile) {
        // 1. Fazer upload do arquivo primeiro
        const { mediaUrl } = await uploadMedia(mediaFile);
        const mediaType = mediaFile.type.startsWith("image/")
          ? "image"
          : "video";

        // 2. Publicar o post com a URL retornada
        await publish(user.id, text.trim(), { url: mediaUrl, type: mediaType });
      } else {
        // Publicar apenas o texto
        await publish(user.id, text.trim());
      }

      // Limpar campos e atualizar feed
      setText("");
      handleClearMedia();
      refresh();
    } catch (error) {
      console.error("Falha ao publicar:", error);
      alert("Não foi possível fazer a publicação.");
    }
  };

  const toggleLike = async (p: Post) => {
    if (!user) return;
    const existing = p.likes?.find((l: Like) => l.userId === user.id);
    existing ? await unlike(existing.id) : await like(p.id, user.id);
    refresh();
  };

  const likesOf = (c: any) => (c.commentLikes ?? []).length;
  const userLiked = (c: any) =>
    (c.commentLikes ?? []).some((l: any) => l.userId === user?.id);
  const rtsOf = (c: any) => (c.commentRetweets ?? []).length;
  const userRt = (c: any) =>
    (c.commentRetweets ?? []).some((r: any) => r.userId === user?.id);
  const subLikes = (sc: any) => (sc.subCommentLikes ?? []).length;
  const subUserLiked = (sc: any) =>
    (sc.subCommentLikes ?? []).some((l: any) => l.userId === user?.id);
  const subRts = (sc: any) => (sc.subCommentRetweets ?? []).length;
  const subUserRt = (sc: any) =>
    (sc.subCommentRetweets ?? []).some((r: any) => r.userId === user?.id);

  // Helper para construir a URL completa da mídia
  // const getMediaFullUrl = (mediaUrl: string) =>
  //   `${import.meta.env.VITE_API_URL}${mediaUrl}`;

  return (
    <div className="feed" style={{ marginTop: "2rem" }}>
      <section className="publish-box">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="No que você está pensando?"
        />
        <input
          type="file"
          accept="image/*,video/*" // Aceitar imagens e vídeos
          ref={fileInputRef}
          onChange={(e) =>
            setMediaFile(e.target.files ? e.target.files[0] : null)
          }
        />
        {mediaFile && (
          <button
            type="button"
            onClick={handleClearMedia}
            style={{ marginTop: "10px" }}
          >
            Limpar Mídia
          </button>
        )}
        <button disabled={!text.trim() && !mediaFile} onClick={handlePublish}>
          Publicar
        </button>
      </section>

      {posts
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((p) => (
          <article key={p.id}>
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

            {/* Lógica de renderização de mídia */}
            {/* Lógica de renderização de mídia */}
            {p.mediaUrl && p.mediaType === "image" && (
              <img
                src={p.mediaUrl}
                alt="Post media"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            )}
            {p.mediaUrl && p.mediaType === "video" && (
              <video
                src={p.mediaUrl}
                controls
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            )}

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

            {/* ... (o restante do código dos comentários permanece o mesmo) ... */}
            {p.comments?.length ? (
              <ul className="comments">
                {p.comments.map((c: any) => (
                  <li
                    key={c.id}
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
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
                    <div style={{ display: "flex", gap: "1.4rem" }}>
                      <button
                        className={userLiked(c) ? "liked" : ""}
                        onClick={() =>
                          userLiked(c)
                            ? unlikeComment(
                                (c.commentLikes ?? []).find(
                                  (l: any) => l.userId === user?.id
                                )!.id
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
                                <time style={{ color: "var(--text-muted)" }}>
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
                                          (l: any) => l.userId === user?.id
                                        )!.id
                                      ).then(refresh)
                                    : likeSubComment(sc.id, user!.id).then(
                                        refresh
                                      )
                                }
                              >
                                {subUserLiked(sc) ? "♥" : "♡"} {subLikes(sc)}
                              </button>
                              <button
                                className={subUserRt(sc) ? "retweeted" : ""}
                                onClick={() =>
                                  retweetSubComment(sc.id, user!.id).then(
                                    refresh
                                  )
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
