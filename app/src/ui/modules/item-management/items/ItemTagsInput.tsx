import { AppTagInput } from "@/app/src/ui/shared/tag-input/AppTagInput";

type ItemTagsInputProps = {
  isReadonly: boolean;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

export function ItemTagsInput(props: ItemTagsInputProps) {
  return <AppTagInput {...props} />;
}
