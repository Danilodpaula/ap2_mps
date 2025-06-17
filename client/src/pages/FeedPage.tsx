import { useEffect, useState, useRef } from "react";
import { fetchPosts, publish, uploadMedia } from "../api";
import { useAuth } from "../hooks/useAuth";
import type { Post, User } from "../types/models";
import { PostItem } from "../components/PostItem";

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (t: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(t);
  const usernameById = (id: number) => users.find((u) => u.id === id)?.username || "(desconhecido)";

  const refresh = async () => {
    const { posts, users, subComments } = await fetchPosts();
    posts.forEach((p: any) => p.comments?.forEach((c: any) => {
        c.subComments = subComments.filter((sc: any) => sc.parentCommentId === c.id);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

// Substitua a função inteira por esta:
const handlePublish = async () => {
  if (!user || (!text.trim() && !mediaFile)) return;

  try {
    // AQUI ESTÁ A CORREÇÃO: Definimos o tipo exato da variável.
    // Ela será ou 'undefined' ou um objeto com url: string e type: 'image' | 'video'.
    let mediaPayload: { url: string; type: "image" | "video" } | undefined;

    if (mediaFile) {
      const { mediaUrl } = await uploadMedia(mediaFile);
      const mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";
      
      // Agora a atribuição é compatível com o tipo que declaramos.
      mediaPayload = { url: mediaUrl, type: mediaType };
    }
    
    // O erro de tipagem aqui desaparece.
    await publish(user.id, text.trim(), mediaPayload);
    
    setText("");
    handleClearMedia();
    refresh();
  } catch (error) {
    console.error("Falha ao publicar:", error);
    alert("Não foi possível fazer a publicação.");
  }
};

  return (
    <div className="feed" style={{ marginTop: "2rem" }}>
      <section className="publish-box">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="No que você está pensando?" />
        <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)} />
        {mediaFile && <button type="button" onClick={handleClearMedia} style={{ marginTop: "10px" }}>Limpar Mídia</button>}
        <button disabled={!text.trim() && !mediaFile} onClick={handlePublish}>Publicar</button>
      </section>

      {posts.sort((a, b) => b.createdAt - a.createdAt).map((p) => (
        <PostItem key={p.id} p={p} usernameById={usernameById} formatDate={formatDate} refresh={refresh} />
      ))}
    </div>
  );
};

export default FeedPage;