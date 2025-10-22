/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SiteBlockingView from '../src/options/views/SiteBlockingView';
import * as ChromeMock from '../src/shared/chrome-mock'; // usa o chromeAPI do projeto

describe('options/SiteBlockingView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // storage.local.get — Promise-based no chromeAPI
    vi.spyOn(ChromeMock.chromeAPI.storage.local, 'get').mockImplementation(
      async (...args: any[]) => {
        const keys = args[0] as string | string[] | Record<string, any> | undefined;

        const mockData: Record<string, any> = {
          blacklist: ['facebook.com', 'twitter.com', 'youtube.com'],
          siteCustomizations: {},
          timeLimits: [],
          settings: { notificationsEnabled: true },
        };

        if (typeof keys === 'string') {
          return { [keys]: mockData[keys] };
        } else if (Array.isArray(keys)) {
          const out: Record<string, any> = {};
          keys.forEach((k) => (out[k] = mockData[k]));
          return out;
        } else if (keys && typeof keys === 'object') {
          const out: Record<string, any> = {};
          Object.keys(keys).forEach((k) => (out[k] = mockData[k] ?? (keys as any)[k]));
          return out;
        }
        return mockData;
      }
    );

    // storage.local.set — Promise-based no chromeAPI
    vi.spyOn(ChromeMock.chromeAPI.storage.local, 'set').mockImplementation(
      async (..._args: any[]) => {
        // noop — apenas para observar chamada
      }
    );

    // runtime.sendMessage — Promise-based no chromeAPI
    vi.spyOn(ChromeMock.chromeAPI.runtime, 'sendMessage').mockImplementation(
      async (...args: any[]) => {
        const msg = args[0];
        if (msg?.type === 'GET_INITIAL_STATE') {
          return {
            blacklist: ['facebook.com', 'twitter.com', 'youtube.com'],
            timeLimits: [],
            dailyUsage: {},
            pomodoro: {
              state: 'IDLE',
              timeRemaining: 0,
              currentCycle: 0,
              config: {
                focusMinutes: 25,
                breakMinutes: 5,
                longBreakMinutes: 15,
                cyclesBeforeLongBreak: 4,
                adaptiveMode: false,
              },
            },
            siteCustomizations: {},
            settings: {
              notificationsEnabled: true,
              productiveKeywords: [],
              distractingKeywords: [],
              analyticsConsent: false,
            },
          };
        }
        return { success: true };
      }
    );
  });

  it('adiciona domínio e chama storage.local.set e runtime.sendMessage', async () => {
    const localSetSpy = vi.spyOn(ChromeMock.chromeAPI.storage.local, 'set');
    const sendSpy = vi.spyOn(ChromeMock.chromeAPI.runtime, 'sendMessage');

    render(<SiteBlockingView />);

    const input = await screen.findByPlaceholderText('exemplo.com');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'example.com' } });
      const addBtn = screen.getByRole('button', { name: /Adicionar/i });
      fireEvent.click(addBtn);
    });

    // Espera os efeitos assíncronos (persistência + mensagem)
    await waitFor(() => {
      expect(localSetSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      // A view manda UMA mensagem sem callback (Promise-based)
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ADD_TO_BLACKLIST',
          payload: { domain: 'example.com' },
        })
      );
    });

    // sanity check: domínio renderizado
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });
});
