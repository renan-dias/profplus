"use client";

// @ts-ignore
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, Highlighter, List, ListOrdered, Undo, Redo, Sparkles } from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('highlight')}
                onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                aria-label="Toggle highlight"
            >
                <Highlighter className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
                <Undo className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
}

export function TipTapEditor({ content, onChange, className }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Placeholder.configure({
                placeholder: "Comece a digitar sua atividade ou use a IA ao lado para gerar...",
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[500px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className={`flex flex-col border border-slate-200 rounded-md overflow-hidden bg-white ${className || ""}`}>
            <MenuBar editor={editor} />

            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden border border-slate-200 bg-white rounded-md shadow-lg">
                    <button
                        onClick={async () => {
                            const selectedText = editor.state.doc.textBetween(
                                editor.state.selection.from,
                                editor.state.selection.to,
                                ' '
                            );
                            if (!selectedText) return;

                            toast.info("Gerando variação com IA...");
                            try {
                                // Here we dynamically import to keep the client bundle clean or use imported function
                                const { generateVariation } = await import('@/services/ai');
                                const newContent = await generateVariation(selectedText);
                                editor.chain().focus().insertContent(newContent).run();
                                toast.success("Variação inserida!");
                            } catch (e) {
                                toast.error("Erro ao gerar variação.");
                            }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Variação AI
                    </button>
                </BubbleMenu>
            )}

            <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center py-8">
                <div className="bg-white w-[210mm] min-h-[297mm] shadow-sm border border-slate-200 shrink-0 mx-auto">
                    <EditorContent editor={editor} className="h-full" />
                </div>
            </div>
        </div>
    );
}
