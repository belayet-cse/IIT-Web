"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import "jodit/es2021/jodit.min.css"

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef(null)

  const config = useMemo(
    () => ({
      placeholder: placeholder ?? "Start typing…",
      height: 480,
      buttons: [
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "superscript",
        "subscript",
        "|",
        "ul",
        "ol",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "lineHeight",
        "brush",
        "|",
        "image",
        "table",
        "link",
        "unlink",
        "|",
        "align",
        "|",
        "undo",
        "redo",
        "eraser",
        "hr",
        "|",
        "fullsize",
      ],
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
    }),
    [placeholder]
  )

  return (
    <div className={cn("rich-editor border border-border rounded-lg overflow-hidden", className)}>
      <JoditEditor ref={editorRef} value={value} config={config} onBlur={onChange} />
    </div>
  )
}
