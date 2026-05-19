export type InputRichTextareaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type InputRichTextareaCommand =
  | 'formatBlock'
  | 'bold'
  | 'italic'
  | 'strikeThrough'
  | 'underline'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'outdent'
  | 'indent'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'justifyFull'
  | 'createLink'
  | 'insertHTML';

export type InputRichTextareaToolbarActionId =
  | 'collapse-block'
  | 'paragraph-style'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'underline'
  | 'unordered-list'
  | 'ordered-list'
  | 'outdent'
  | 'indent'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'justify'
  | 'link';

export interface InputRichTextareaToolbarOptions {
  'collapse-block'?: boolean;
  'paragraph-style'?: boolean;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  'unordered-list'?: boolean;
  'ordered-list'?: boolean;
  outdent?: boolean;
  indent?: boolean;
  'align-left'?: boolean;
  'align-center'?: boolean;
  'align-right'?: boolean;
  justify?: boolean;
  link?: boolean;
}

export type InputRichTextareaParagraphStyleId =
  | 'paragraph'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3';

export interface InputRichTextareaParagraphStyleOption {
  id: InputRichTextareaParagraphStyleId;
  label: string;
  title: string;
  commandValue: string;
  tagName: string;
}

export interface InputRichTextareaToolbarAction {
  id: InputRichTextareaToolbarActionId;
  label: string;
  title: string;
  command?: InputRichTextareaCommand;
  value?: string;
  active?: boolean;
}
