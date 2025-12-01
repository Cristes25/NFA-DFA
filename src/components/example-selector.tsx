"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { automatonExamples } from "@/lib/examples";
import type { AutomatonDefinition } from "@/lib/types";

type ExampleSelectorProps = {
  onSelect: (definition: AutomatonDefinition) => void;
};

export function ExampleSelector({ onSelect }: ExampleSelectorProps) {
  const handleSelect = (name: string) => {
    const example = automatonExamples.find((ex) => ex.name === name);
    if (example) {
      onSelect(example.definition);
    }
  };

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Load an example..." />
      </SelectTrigger>
      <SelectContent>
        {automatonExamples.map((example) => (
          <SelectItem key={example.name} value={example.name}>
            {example.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
