import { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Home,
  Loader2,
  PhoneCall,
  RotateCcw,
  Send,
  Siren,
} from 'lucide-react';
import { askSymptomAssistant, type SymptomChatMessage, type SymptomUrgency } from '@/lib/symptomChat';
import { useI18n } from '@/i18n/useI18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const MAX_INPUT = 1000;

const resultStyles = {
  emergency: {
    box: 'border-emergency bg-emergency/10',
    icon: Siren,
    iconClass: 'text-emergency',
    badge: 'emergency' as const,
    bannerKey: 'symptoms.emergencyBanner' as const,
  },
  urgent: {
    box: 'border-warning bg-warning/10',
    icon: AlertTriangle,
    iconClass: 'text-warning',
    badge: 'warning' as const,
    bannerKey: 'symptoms.professionalBanner' as const,
  },
  routine: {
    box: 'border-primary bg-primary/10',
    icon: CalendarClock,
    iconClass: 'text-primary',
    badge: 'default' as const,
    bannerKey: 'symptoms.routineBanner' as const,
  },
  self_care: {
    box: 'border-success/60 bg-success/10',
    icon: Home,
    iconClass: 'text-success',
    badge: 'success' as const,
    bannerKey: 'symptoms.selfCareBanner' as const,
  },
} as const;

type Phase = 'idle' | 'sending' | 'done' | 'error';

const LABEL_KEYS = {
  emergency: 'results.urgency.emergency',
  urgent: 'results.urgency.urgent',
  routine: 'results.urgency.routine',
  self_care: 'results.urgency.self_care_information',
} as const;

export function SymptomChat() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<SymptomChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [urgency, setUrgency] = useState<SymptomUrgency | null>(null);

  const request = async (userText?: string) => {
    if (phase === 'sending') return;

    const next: SymptomChatMessage[] = userText
      ? [...messages, { role: 'user', text: userText }]
      : messages;
    if (next.length === 0) return;

    if (userText) {
      setMessages(next);
      setInput('');
    }

    setPhase('sending');
    const reply = await askSymptomAssistant(next);

    if (reply.status !== 'available') {
      setPhase('error');
      return;
    }

    setMessages([...next, { role: 'model', text: reply.reply }]);

    if (reply.done && reply.urgency !== 'undetermined') {
      setUrgency(reply.urgency);
      setPhase('done');
    } else {
      setPhase('idle');
    }
  };

  const reset = () => {
    setMessages([]);
    setInput('');
    setUrgency(null);
    setPhase('idle');
  };

  const style = urgency ? resultStyles[urgency] : null;
  const Icon = style?.icon;

  return (
    <section aria-labelledby="symptom-chat-title" className="mt-8">
      <h2 id="symptom-chat-title" className="text-lg font-bold">
        {t('symptomChat.title')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('symptomChat.subtitle')}</p>

      <Card className="mt-4">
        <CardContent className="space-y-4 pt-6">
          {messages.length > 0 && (
            <ol className="space-y-3" aria-live="polite">
              {messages.map((message, index) => (
                <li
                  key={`${message.role}-${index}`}
                  className={cn('flex flex-col gap-1', message.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {message.role === 'user' ? t('symptomChat.you') : t('symptomChat.assistant')}
                  </span>
                  <p
                    lang={message.role === 'user' ? undefined : 'en'}
                    className={cn(
                      'max-w-[95%] whitespace-pre-line rounded-xl px-4 py-3 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'border bg-card text-foreground'
                    )}
                  >
                    {message.text}
                  </p>
                </li>
              ))}
            </ol>
          )}

          {phase === 'sending' && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('symptomChat.thinking')}
            </p>
          )}

          {phase === 'done' && urgency && style && Icon && (
            <div
              role={urgency === 'emergency' ? 'alert' : 'status'}
              className={cn('flex items-start gap-3 rounded-xl border p-4', style.box)}
            >
              <Icon className={cn('mt-0.5 h-6 w-6 shrink-0', style.iconClass)} aria-hidden="true" />
              <div>
                <Badge variant={style.badge}>{t(LABEL_KEYS[urgency])}</Badge>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{t(style.bannerKey)}</p>
              </div>
            </div>
          )}

          {phase === 'done' && urgency === 'emergency' && (
            <a
              href="tel:112"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emergency px-6 text-lg font-bold text-emergency-foreground shadow-sm transition-colors hover:bg-emergency/90"
            >
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
              {t('emergency.callNow')}
            </a>
          )}

          {phase === 'error' && (
            <Alert variant="warning" role="alert">
              {t('symptomChat.error')}
            </Alert>
          )}

          {phase !== 'done' && (
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                const text = input.trim();
                if (!text) return;
                void request(text);
              }}
            >
              <Textarea
                aria-label={t('symptomChat.placeholder')}
                placeholder={t('symptomChat.placeholder')}
                value={input}
                maxLength={MAX_INPUT}
                rows={3}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    const text = input.trim();
                    if (text) void request(text);
                  }
                }}
                disabled={phase === 'sending'}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{t('symptomChat.englishOnly')}</p>
                <div className="flex gap-2">
                  {messages.length > 0 && (
                    <Button type="button" variant="ghost" onClick={reset} disabled={phase === 'sending'}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      {t('symptomChat.restart')}
                    </Button>
                  )}
                  {phase === 'error' && (
                    <Button type="button" variant="outline" onClick={() => void request()}>
                      {t('symptomChat.retry')}
                    </Button>
                  )}
                  <Button type="submit" disabled={!input.trim() || phase === 'sending'}>
                    {phase === 'sending' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    {t('symptomChat.send')}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {phase === 'done' && (
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t('symptomChat.restart')}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">{t('symptomChat.disclaimer')}</p>
        </CardContent>
      </Card>
    </section>
  );
}
