/**
 * SMS provider abstraction. Only the mock provider exists today — no message
 * is actually sent. Implement `SmsProvider` for MSG91 / Twilio in a server
 * function later and select it with `getSmsProvider()`.
 */
export interface SmsMessage {
  to: string;
  body: string;
}
export interface SmsResult {
  ok: boolean;
  provider: string;
  delivered: boolean;
  note: string;
}
export interface SmsProvider {
  name: string;
  send(msg: SmsMessage): Promise<SmsResult>;
}

export const mockSmsProvider: SmsProvider = {
  name: "mock",
  async send() {
    await new Promise((r) => setTimeout(r, 600));
    return {
      ok: true,
      provider: "mock",
      delivered: false,
      note: "Preview only — no SMS provider is configured, nothing was sent.",
    };
  },
};

export const getSmsProvider = (): SmsProvider => mockSmsProvider;

export function composeAlertSms(opts: { risk: string; action: string; reliability: string }) {
  return `SUKSHMA-AI ALERT:\n${opts.risk}\nAction: ${opts.action}\nReliability: ${opts.reliability}.`;
}
