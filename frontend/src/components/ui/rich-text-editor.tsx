'use client'

import { useEffect } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { BoldIcon, Heading2Icon, Heading3Icon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  id?: string
}

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previousUrl ?? 'https://')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className='flex flex-wrap items-center gap-1 border-b p-1.5'>
      <Toggle
        size='sm'
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label='Bold'
      >
        <BoldIcon />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label='Italic'
      >
        <ItalicIcon />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label='Heading 2'
      >
        <Heading2Icon />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label='Heading 3'
      >
        <Heading3Icon />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label='Bullet list'
      >
        <ListIcon />
      </Toggle>
      <Toggle
        size='sm'
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label='Numbered list'
      >
        <ListOrderedIcon />
      </Toggle>
      <Toggle size='sm' pressed={editor.isActive('link')} onPressedChange={handleSetLink} aria-label='Link'>
        <LinkIcon />
      </Toggle>
    </div>
  )
}

const RichTextEditor = ({ value, onChange, placeholder, className, id }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write something...' })
    ],
    content: value,
    editorProps: {
      attributes: {
        id: id ?? '',
        class:
          'min-h-40 w-full px-3 py-2 text-sm outline-none [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_a]:text-primary [&_a]:underline'
      }
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) return

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only resync when the external value changes, not on every editor identity change
  }, [value])

  if (!editor) return null

  return (
    <div
      className={cn(
        'border-input focus-within:border-ring focus-within:ring-ring/50 rounded-lg border focus-within:ring-3',
        className
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export { RichTextEditor }
