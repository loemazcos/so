import { FileText, Calendar } from 'lucide-react';
import Avatar from '@/components/apps/Avatar';
import type { KakaoMessage } from '@/lib/kakao';

type Props = {
  message: KakaoMessage;
  showSender: boolean;
  chosenOption: number | undefined;
  onVote: (optionIndex: number) => void;
};

export default function KakaoMessageItem({ message, showSender, chosenOption, onVote }: Props) {
  if (message.type === 'deleted') {
    return <p className="my-1.5 text-center text-[12px] text-[var(--fg-2)]">{message.text}</p>;
  }

  const mine = message.from === 'me';

  if (message.type === 'notice') {
    return (
      <div className="my-2 rounded-[14px] border border-[var(--line)] bg-[var(--card)] px-3.5 py-3">
        <p className="mb-1 text-[11px] font-semibold text-[var(--fg-2)]">공지 · {message.from}</p>
        <p className="text-[14px] leading-[1.5]">{message.text}</p>
      </div>
    );
  }

  if (message.type === 'poll') {
    const options = message.options ?? [];
    const counts = options.map((option, index) => option.votes + (chosenOption === index ? 1 : 0));
    const total = counts.reduce((sum, count) => sum + count, 0);
    return (
      <div className="my-1.5 flex gap-2">
        <Avatar photo={message.from} label={message.from} size={32} />
        <div className="min-w-0 flex-1 rounded-[14px] bg-[var(--card)] px-3.5 py-3">
          <p className="mb-2 text-[11px] text-[var(--fg-2)]">{message.from} · 투표</p>
          <p className="mb-2.5 text-[14px] font-semibold leading-[1.4]">{message.question}</p>
          <div className="flex flex-col gap-1.5">
            {options.map((option, index) => {
              const count = counts[index];
              const percent = total === 0 ? 0 : Math.round((count / total) * 100);
              const selected = chosenOption === index;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onVote(index)}
                  className={`relative overflow-hidden rounded-[10px] border px-3 py-2 text-left text-[13px] transition-colors ${
                    selected ? 'border-[#FEE500]' : 'border-[var(--line)]'
                  }`}
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-[#FEE500]/35 transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span>{option.label}</span>
                    <span className="text-[12px] text-[var(--fg-2)]">{count}표</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-[var(--fg-2)]">
            {chosenOption === undefined ? '한 항목을 골라 투표하세요' : `총 ${total}표 · 내 표 반영됨`}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === 'schedule') {
    return (
      <div className="my-1.5 flex gap-2">
        <Avatar photo={message.from} label={message.from} size={32} />
        <div className="min-w-0 flex-1 rounded-[14px] bg-[var(--card)] px-3.5 py-3">
          <p className="mb-2 text-[11px] text-[var(--fg-2)]">{message.from} · 일정</p>
          <div className="mb-2 flex items-center gap-1.5">
            <Calendar size={15} strokeWidth={2} aria-hidden="true" />
            <p className="text-[14px] font-semibold">{message.title}</p>
          </div>
          {message.when && <p className="text-[13px] text-[var(--fg-2)]">{message.when}</p>}
          {message.where && <p className="text-[13px] text-[var(--fg-2)]">장소: {message.where}</p>}
          {message.lines && (
            <ul className="mt-2 flex flex-col gap-1 border-t border-[var(--line)] pt-2 text-[13px] leading-[1.5]">
              {message.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (message.type === 'file') {
    return (
      <div className="my-1.5 flex gap-2">
        <Avatar photo={message.from} label={message.from} size={32} />
        <div className="min-w-0 flex-1">
          {showSender && <p className="mb-1 text-[12px] text-[var(--fg-2)]">{message.from}</p>}
          <div className="flex items-center gap-3 rounded-[14px] bg-[var(--card)] px-3.5 py-3">
            <FileText size={22} strokeWidth={1.8} className="shrink-0 text-[var(--fg-2)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{message.text}</p>
              <p className="text-[12px] text-[var(--fg-2)]">{message.size}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mine) {
    return (
      <div className="flex items-end justify-end gap-1.5 py-[2px]">
        <span className="shrink-0 text-[10px] text-[var(--fg-2)]">{message.time}</span>
        <p className="max-w-[72%] rounded-[18px] rounded-br-[6px] bg-[#FEE500] px-3.5 py-2 text-[15px] leading-[1.4] text-[#191919]">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 py-[2px]">
      {showSender ? (
        <Avatar photo={message.from} label={message.from} size={32} />
      ) : (
        <span className="w-8 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        {showSender && <p className="mb-1 text-[12px] text-[var(--fg-2)]">{message.from}</p>}
        <div className="flex items-end gap-1.5">
          <p className="max-w-[72%] rounded-[18px] rounded-bl-[6px] bg-[var(--card)] px-3.5 py-2 text-[15px] leading-[1.4] text-[var(--fg)]">
            {message.text}
          </p>
          <span className="shrink-0 text-[10px] text-[var(--fg-2)]">{message.time}</span>
        </div>
      </div>
    </div>
  );
}
