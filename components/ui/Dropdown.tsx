import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function Dropdown({ options, value, onChange, className = "", placeholder = "Select...", disabled = false }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(option => option.value === value);

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="block truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${value === option.value ? "bg-purple-100 text-purple-900" : "text-gray-900"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
} 