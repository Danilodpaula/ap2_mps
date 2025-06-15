import { useEffect, useState } from "react";
import { fetchPosts, publish, like, unlike, comment, retweet } from "../api";
import { useAuth } from "../hooks/useAuth";
import type { Post, Like, User } from "../types/models";

const FeedPage = () => {
  const { user } = useAuth();

  const [posts, setPosts]   = useState<Post[]>([]);
  const [users, setUsers]   = useState<User[]>([]);
  const [text,  setText]    = useState("");

  /* ---------- carregar feed ---------- */
  const refresh = async () => {
    const { posts, users } = await fetchPosts();
    setPosts(posts);
    setUsers(users);
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const id = setInterval(refresh, 5000);   // 5000 ms = 5 s
    return () => clearInterval(id);          // limpa quando o componente sai da tela
  }, []);

  /* ---------- publicar ---------- */
  const handlePublish = async () => {
    if (!text.trim() || !user) return;
    await publish(user.id, text.trim());
    setText("");
    refresh();
  };

  /* ---------- like / deslike ---------- */
  const toggleLike = async (p: Post) => {
    if (!user) return;
    const existing = p.likes?.find((l: Like) => l.userId === user.id);
    existing ? await unlike(existing.id) : await like(p.id, user.id);
    refresh();
  };

  /* ---------- helpers ---------- */
  const usernameById = (id: string | number) =>
    users.find(u => u.id === id)?.username || "(desconhecido)";

  /* ---------- render ---------- */
  return (
    <div className="feed" style={{marginTop: "2rem"}}>
      {/* Caixa de publicação */}
      <section className="publish-box">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="No que você está pensando?"
        />
        <button onClick={handlePublish}>Publicar</button>
      </section>

      {/* Timeline */}
      {posts
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(p => (
          <article key={p.id}>
            <header>
              <strong>@{usernameById(p.userId)}</strong>
            </header>

            <p>{p.content}</p>

            <footer>
              {/* Like / Deslike */}
              <button
                className={p.likes?.some(l => l.userId === user?.id) ? "liked" : ""}
                onClick={() => toggleLike(p)}
              >
                {p.likes?.some(l => l.userId === user?.id) ? "♥" : "♡"} {p.likes?.length || 0}
              </button>

              {/* Retweet */}
              <button
                className={p.retweets?.some(r => r.userId === user?.id) ? "retweeted" : ""}
                onClick={() => retweet(p.id, user!.id).then(refresh)}
              >
                🔁 {p.retweets?.length || 0}
              </button>

              {/* Comentar */}
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
                {p.comments.map(c => (
                  <li key={c.id}>
                    <strong>@{usernameById(c.userId)}</strong>: {c.text}
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
