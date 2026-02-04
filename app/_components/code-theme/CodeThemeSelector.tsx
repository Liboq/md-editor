"use client";

import { useCodeTheme } from "@/lib/code-theme/code-theme-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CodeThemeSelector() {
  const { activeCodeTheme, setCodeTheme, codeThemes } = useCodeTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          <Select value={activeCodeTheme.id} onValueChange={setCodeTheme}>
            <SelectTrigger className="w-[130px] h-8 text-xs cursor-pointer">
              <Code className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {codeThemes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: theme.background }}
                    />
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent>代码块主题</TooltipContent>
    </Tooltip>
  );
}
