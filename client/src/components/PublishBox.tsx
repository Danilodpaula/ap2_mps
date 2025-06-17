// src/components/PublishBox.tsx
import { useState, useRef } from 'react';

type PublishBoxProps = {
  onPublish: (text: string, file: File | null) => Promise<void>;
  placeholder: string;
};

export const PublishBox = ({ onPublish, placeholder }: PublishBoxProps) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    await onPublish(text, file);
    setText('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="publish-box mini">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      <div className="publish-actions">
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          style={{ fontSize: '0.8rem' }}
        />
        <button disabled={!text.trim() && !file} onClick={handlePublish}>
          Publicar
        </button>
      </div>
    </section>
  );
};