/**
 * Text Input with Voice Component
 * 
 * Combines regular text input with voice-to-text capability
 * Maintains all existing styling and behavior
 */

import React, { useState } from 'react';
import { VoiceInput } from './VoiceInput';

interface TextInputWithVoiceProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  type?: 'input' | 'textarea';
  rows?: number;
}

export const TextInputWithVoice: React.FC<TextInputWithVoiceProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  maxLength,
  type = 'input',
  rows = 4,
}) => {
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleTranscript = (transcript: string) => {
    // Append transcript to existing value with a space if needed
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange(newValue);
    setVoiceError(null);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(null), 5000); // Clear error after 5 seconds
  };

  return (
    <div className="relative">
      <div className="relative flex items-start gap-2">
        {/* Text Input/Textarea */}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            maxLength={maxLength}
          />
        )}

        {/* Voice Input Button */}
        <div className="flex-shrink-0 mt-2">
          <VoiceInput
            onTranscript={handleTranscript}
            onError={handleVoiceError}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Error Message */}
      {voiceError && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {voiceError}
        </div>
      )}
    </div>
  );
};
