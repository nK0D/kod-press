'use client';

import React from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  fullScreen: boolean;
  onToggleFullScreen: () => void;
}

export default function EditorToolbar({ editor, fullScreen, onToggleFullScreen }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            strike: e.isActive('strike'),
            code: e.isActive('code'),
            h1: e.isActive('heading', { level: 1 }),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            h4: e.isActive('heading', { level: 4 }),
            blockquote: e.isActive('blockquote'),
            codeBlock: e.isActive('codeBlock'),
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            link: e.isActive('link'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            words: e.state.doc.textBetween(0, e.state.doc.content.size, ' ', ' ').split(/\s+/).filter(Boolean).length,
          }
        : null,
  });

  const chain = () => editor?.chain().focus();

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (leave empty to remove)', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') chain()?.extendMarkRange('link').unsetLink().run();
    else chain()?.extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url?.trim()) chain()?.setImage({ src: url.trim() }).run();
  };

  const groups: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; disabled?: boolean; run: () => void }[][] = [
    [
      { label: 'Bold', icon: Bold, active: state?.bold, run: () => chain()?.toggleBold().run() },
      { label: 'Italic', icon: Italic, active: state?.italic, run: () => chain()?.toggleItalic().run() },
      { label: 'Underline', icon: Underline, active: state?.underline, run: () => chain()?.toggleUnderline().run() },
      { label: 'Strikethrough', icon: Strikethrough, active: state?.strike, run: () => chain()?.toggleStrike().run() },
      { label: 'Inline code', icon: Code, active: state?.code, run: () => chain()?.toggleCode().run() },
    ],
    [
      { label: 'Heading 1', icon: Heading1, active: state?.h1, run: () => chain()?.toggleHeading({ level: 1 }).run() },
      { label: 'Heading 2', icon: Heading2, active: state?.h2, run: () => chain()?.toggleHeading({ level: 2 }).run() },
      { label: 'Heading 3', icon: Heading3, active: state?.h3, run: () => chain()?.toggleHeading({ level: 3 }).run() },
      { label: 'Heading 4', icon: Heading4, active: state?.h4, run: () => chain()?.toggleHeading({ level: 4 }).run() },
    ],
    [
      { label: 'Quote', icon: Quote, active: state?.blockquote, run: () => chain()?.toggleBlockquote().run() },
      { label: 'Code block', icon: FileCode2, active: state?.codeBlock, run: () => chain()?.toggleCodeBlock().run() },
      { label: 'Bulleted list', icon: List, active: state?.bulletList, run: () => chain()?.toggleBulletList().run() },
      { label: 'Numbered list', icon: ListOrdered, active: state?.orderedList, run: () => chain()?.toggleOrderedList().run() },
    ],
    [
      { label: 'Link', icon: Link2, active: state?.link, run: setLink },
      { label: 'Image from URL', icon: ImagePlus, run: addImage },
    ],
    [
      { label: 'Undo', icon: Undo2, disabled: !state?.canUndo, run: () => chain()?.undo().run() },
      { label: 'Redo', icon: Redo2, disabled: !state?.canRedo, run: () => chain()?.redo().run() },
    ],
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2 py-1.5">
      {groups.map((group, index) => (
        <div key={index} className="flex items-center gap-0.5 border-r border-[var(--admin-border)] pr-1 last:border-r-0">
          {group.map(({ label, icon: Icon, active, disabled, run }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active ?? undefined}
              disabled={!editor || disabled}
              onClick={run}
              className={`rounded-md p-1.5 transition-colors disabled:opacity-30 ${
                active ? 'bg-indigo-500/15 text-[var(--admin-accent)]' : 'text-[var(--admin-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2 pl-2 text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-secondary)]">
        <span>{state?.words ?? 0} words</span>
        <button
          type="button"
          title={fullScreen ? 'Exit full screen' : 'Full screen'}
          aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
          onClick={onToggleFullScreen}
          className="rounded-md p-1.5 text-[var(--admin-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
