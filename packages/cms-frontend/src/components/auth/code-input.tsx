"use client";

import { useRef, useState } from "react";

import { Input } from "@/src/components/ui/input";

interface CodeInputProps {
  length: number;
  validateChar: (char: string) => boolean;
  onComplete: (code: string) => void;
}

export function CodeInput({
  length,
  validateChar,
  onComplete,
}: CodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 입력 값 변경 핸들러
  const handleChange = (index: number, value: string) => {
    const upperCaseValue = value.toUpperCase();
    if (upperCaseValue && !validateChar(upperCaseValue)) return;

    const newCode = [...code];
    newCode[index] = upperCaseValue;
    setCode(newCode);

    if (upperCaseValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((char) => char !== "")) {
      onComplete(newCode.join(""));
    }
  };

  // 키 입력 핸들러
  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // 백스페이스를 눌렀을 때, 현재 입력이 비어있고 첫 번째 인덱스가 아니면 이전 인덱스로 이동
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 클립보드 복사 핸들러
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedData = event.clipboardData.getData("text").slice(0, length);
    const upperCasePastedData = pastedData.toUpperCase();
    if (![...upperCasePastedData].every((char) => validateChar(char))) return;

    const newCode = [...code];
    upperCasePastedData.split("").forEach((char, index) => {
      newCode[index] = char;
    });
    setCode(newCode);

    if (upperCasePastedData.length === length) {
      inputRefs.current[length - 1]?.focus();
      onComplete(upperCasePastedData);
    }
  };

  return (
    <div
      className="w-full flex justify-between"
      role="group"
      aria-label="code-input"
    >
      {code.map((char, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={char}
          className={
            "w-8 h-8 sm:w-12 sm:h-12 text-center text-base sm:text-lg [&>*:not(:last-child)]:mr-1.5 sm:[&>*:not(:last-child)]:mr-2"
          }
          aria-label={`code-input-${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
