"use client"

import * as React from "react"
import type { Option } from "@/types"
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface MultiSelectProps {
  selected: Option[] | null
  setSelected: React.Dispatch<React.SetStateAction<Option[] | null>>
  onChange?: (value: Option[] | null) => void
  placeholder?: string
  options: Option[]
}

export function MultiSelect({
  selected,
  setSelected,
  onChange,
  placeholder = "Select options",
  options,
}: MultiSelectProps) {
  const selectedValues = React.useMemo(
    () => new Set(selected?.map((s) => s.value)),
    [selected]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Filter data"
          variant="outline"
          size="sm"
          className="flex h-auto min-h-9 w-full justify-start border-input bg-transparent px-3 py-2 font-normal hover:bg-transparent"
        >
          <div className="flex flex-wrap items-center gap-1">
            {selected?.length ? (
              selected.map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="rounded-sm px-1 font-normal"
                >
                  {option.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command className="font-sans">
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        setSelected(
                          (prev) =>
                            prev?.filter((s) => s.value !== option.value) ?? []
                        )
                      } else {
                        setSelected((prev) => [...(prev ?? []), option])
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("size-4")} aria-hidden="true" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelected(null)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
