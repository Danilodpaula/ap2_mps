// src/components/CommentItem.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

import { editComment, deleteComment, likeComment, unlikeComment, retweetComment, replyComment } from "../api";
import { SubCommentItem } from "./SubCommentItem";

type CommentItemProps = {
  c: any;
  usernameById: (id: number) => string;
  formatDate: (t: number) => string;
  refresh: () => void;
};

export const CommentItem = ({ c, usernameById, formatDate, refresh }: CommentItemProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(c.text);

  const handleSaveEdit = async () => {
    if (editedText.trim() === "") return;
    await editComment(c.id, editedText);
    setIsEditing(false);
    refresh();
  };

  const likesOf = (c: any) => (c.commentLikes ?? []).length;
  const userLiked = (c: any) => (c.commentLikes ?? []).some((l: any) => l.userId === user?.id);

  return (
    <li key={c.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {isEditing ? (
        <div className="edit-box">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            style={{ width: "100%", minHeight: "60px", fontSize: "0.9rem" }}
          />
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              fontSize: ".85rem",
            }}
          >
            <button onClick={handleSaveEdit}>Salvar</button>
            <button onClick={() => setIsEditing(false)} className="secondary">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              <strong>@{usernameById(c.userId)}</strong>: {c.text}
              <time style={{ color: "var(--text-muted)" }}>
                {" "}
                · {formatDate(c.createdAt)}
              </time>
            </span>

            {c.userId === user?.id && (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Editar"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    confirm("Excluir?") && deleteComment(c.id).then(refresh)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
          {c.mediaUrl &&
            (() => {
              const mediaSrc = import.meta.env.PROD
                ? `<span class="math-inline">\{import\.meta\.env\.VITE\_API\_URL\}</span>{c.mediaUrl}`
                : c.mediaUrl;
              return c.mediaType === "image" ? (
                <img
                  src={mediaSrc}
                  alt="Comment media"
                  style={{
                    maxWidth: "300px",
                    borderRadius: "8px",
                    marginTop: "5px",
                  }}
                />
              ) : (
                <video
                  src={mediaSrc}
                  controls
                  style={{
                    maxWidth: "300px",
                    borderRadius: "8px",
                    marginTop: "5px",
                  }}
                />
              );
            })()}
          <div style={{ display: "flex", gap: "1.4rem" }}>
            <button
              className={userLiked(c) ? "liked" : ""}
              onClick={() =>
                userLiked(c)
                  ? unlikeComment(
                      c.commentLikes.find((l: any) => l.userId === user?.id)!.id
                    ).then(refresh)
                  : likeComment(c.id, user!.id).then(refresh)
              }
            >
              {userLiked(c) ? "♥" : "♡"} {likesOf(c)}
            </button>
            <button
              onClick={() => retweetComment(c.id, user!.id).then(refresh)}
            >
              🔁 {(c.commentRetweets ?? []).length}
            </button>
            <button
              onClick={() => {
                const reply = prompt("Responder:");
                reply && replyComment(c.id, user!.id, reply).then(refresh);
              }}
            >
              💬 {c.subComments?.length || 0}
            </button>
          </div>
          {c.subComments?.length > 0 && (
            <ul className="subcomments">
              {c.subComments.map((sc: any) => (
                <SubCommentItem
                  key={sc.id}
                  sc={sc}
                  usernameById={usernameById}
                  formatDate={formatDate}
                  refresh={refresh}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
};