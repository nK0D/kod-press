'use client';

import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import EditorToolbar from './EditorToolbar';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** TipTap editor producing HTML; the parent form stores it in a hidden field. */
export default function RichTextEditor({ initialContent, onChange, placeholder = 'Start writing…' }: RichTextEditorProps) {
  const [fullScreen, setFullScreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    // Render on the client only, so server HTML and the editor never disagree during hydration.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'kp-prose min-h-[360px] px-5 py-4 focus:outline-none',
        'aria-label': 'Content',
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
  });

  return (
    <div
      className={`flex flex-col overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-card-bg)] ${
        fullScreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl'
      }`}
    >
      <EditorToolbar editor={editor} fullScreen={fullScreen} onToggleFullScreen={() => setFullScreen((value) => !value)} />
      <div className={fullScreen ? 'flex-1 overflow-y-auto' : ''}>
        <div className={fullScreen ? 'mx-auto max-w-3xl' : ''}>
          {editor ? <EditorContent editor={editor} /> : <div className="min-h-[360px] px-5 py-4 text-sm text-slate-400">Loading editor…</div>}
        </div>
      </div>
    </div>
  );
}
