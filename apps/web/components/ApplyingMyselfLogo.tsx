import Image from 'next/image';

interface ApplyingMyselfLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function ApplyingMyselfLogo({ size = "md", className = "" }: ApplyingMyselfLogoProps) {
    const sizeClasses = {
        sm: "w-7 h-7",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-[4.5rem] h-[4.5rem]"
    };
    const pixelSize = size === "sm" ? 28 : size === "md" ? 40 : size === "lg" ? 56 : 72;

    return (
        <Image
            src="/logo-mark.png"
            alt="Applying Myself mascot logo"
            width={pixelSize}
            height={pixelSize}
            className={`${sizeClasses[size]} rounded-[22%] shadow-sm ring-1 ring-black/10 ${className}`}
        />
    );
}
