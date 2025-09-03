'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

const rules = [
  { text: 'At least 8 characters', regex: /.{8,}/ },
  { text: 'One uppercase letter (A-Z)', regex: /[A-Z]/ },
  { text: 'One lowercase letter (a-z)', regex: /[a-z]/ },
  { text: 'One number (0-9)', regex: /\d/ },
  { text: 'One special character (@$!%*?&)', regex: /[@$!%*?&]/ },
];

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  return (
    <ul className="space-y-2 mt-2">
      {rules.map((rule) => {
        const isValid = rule.regex.test(password);
        return (
          <li
            key={rule.text}
            className={`flex items-center text-sm transition-colors ${
              isValid ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            ) : (
              <Circle className="h-4 w-4 mr-2" />
            )}
            {rule.text}
          </li>
        );
      })}
    </ul>
  );
}