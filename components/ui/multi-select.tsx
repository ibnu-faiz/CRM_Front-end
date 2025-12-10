'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'; // Ini sekarang akan ditemukan
import { Command as CommandPrimitive } from 'cmdk'; // Ini juga

type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className,
  disabled,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    if (disabled) return;
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (disabled) return;
    onChange([...selected, value]);
  };

  return (
    <CommandPrimitive
      className={`overflow-visible bg-transparent ${className}`}
      {...props}
    >
      <div className={`group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
        disabled ? "cursor-not-allowed opacity-50" : "" // <-- Tambahkan style disabled
      }`}>
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const label = options.find((opt) => opt.value === value)?.label;
            return (
              <Badge
                key={value}
                variant="secondary"
                className="gap-1"
              >
                {label}
                <button
                  type="button"
                  className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  // --- PERBAIKAN TIPE 'any' ---
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      handleUnselect(value);
                    }
                  }}
                  // --- PERBAIKAN TIPE 'any' ---
                  onMouseDown={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Input palsu */}
          <CommandPrimitive.Input
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
            onFocus={() => !disabled && setOpen(true)}
            onBlur={() => setOpen(false)}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && !disabled && (
          <CommandList className="absolute top-0 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    // --- PERBAIKAN TIPE 'any' ---
                    onMouseDown={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      if (isSelected) {
                        handleUnselect(option.value);
                      } else {
                        handleSelect(option.value);
                      }
                    }}
                    className={`cursor-pointer ${
                      isSelected ? 'font-bold' : ''
                    }`}
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        )}
      </div>
    </CommandPrimitive>
  );
}