import { useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RichTextEditor({
  value,
  onChange,
  className,
  error,
  isDirty,
  invalid,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  error?: boolean
  isDirty?: boolean
  invalid?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML || '')
  }

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div
      className={cn(
        'border rounded-lg border-gray-200 overflow-hidden flex flex-col focus-within:ring-2 transition-all bg-white',
        error
          ? 'border-destructive focus-within:ring-destructive'
          : isDirty && !invalid
            ? 'border-success focus-within:ring-success'
            : 'focus-within:ring-ring focus-within:border-ring',
        className,
      )}
    >
      <div className="flex items-center gap-1 p-1 bg-gray-50/50 border-b border-gray-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onMouseDown={(e) => {
            e.preventDefault()
            execCommand('bold')
          }}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onMouseDown={(e) => {
            e.preventDefault()
            execCommand('italic')
          }}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onMouseDown={(e) => {
            e.preventDefault()
            execCommand('insertUnorderedList')
          }}
          title="Lista com Marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onMouseDown={(e) => {
            e.preventDefault()
            execCommand('insertOrderedList')
          }}
          title="Lista Numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-3 outline-none rich-text-content resize-y overflow-auto"
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  )
}
