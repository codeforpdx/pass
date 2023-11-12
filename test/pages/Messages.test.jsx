import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, describe, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SessionContext, MessageContext } from '@contexts';
import { Messages } from '@pages';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { updateMessageReadStatus } from '@utils';

vi.mock('@inrupt/solid-client');

const MockInboxList = [
  {
    message: 'test message',
    messageId: '3bf2a18d-0c6a-43e4-9650-992bf4fe7fe7',
    messageUrl:
      'http://localhost:3000/pod-test-name-here/PASS/Inbox/RE%3Ateste-20231023-195931.ttl',
    title: 'RE:test-inbox',
    uploadDate: new Date('2023-10-23T19:59:31.424Z'),
    readStatus: false,
    sender: 'PODMAN',
    senderWebId: 'http://localhost:3000/pod-test-name-here/profile/card#me',
    recipient: 'PODMAN'
  },
  {
    message: 'test 3',
    messageId: '3bf2a18d-0c6a-43e4-9650-992bf4fe7fe9',
    messageUrl:
      'http://localhost:3000/pod-test-name-here/PASS/Inbox/RE%3Ateste-20231023-195931.ttl',
    title: 'foo bar',
    uploadDate: new Date('2023-10-23T19:59:31.424Z'),
    readStatus: true,
    sender: 'PODMAN',
    senderWebId: 'http://localhost:3000/pod-test-name-here/profile/card#me',
    recipient: 'PODMAN'
  }
];

const MockOutboxList = [
  {
    message: 'test 2',
    messageId: '3bf2a18d-0c6a-43e4-9650-992bf4fe7fe8',
    messageUrl:
      'http://localhost:3000/pod-test-name-here/PASS/Inbox/RE%3Ateste-20231023-195933.ttl',
    title: 'RE:test-outbox',
    uploadDate: new Date('2023-10-23T19:59:31.424Z'),
    readStatus: true,
    sender: 'PODMAN',
    senderWebId: 'http://localhost:3000/pod-test-name-here/profile/card#me',
    recipient: 'PODMAN'
  }
];

vi.mock('@hooks', async () => {
  const actual = await vi.importActual('@hooks');

  return {
    ...actual,
    useMessageList: vi.fn().mockImplementation((boxType) => {
      if (boxType === 'Inbox') {
        return { data: MockInboxList, refetch: vi.fn() };
      }
      return { data: MockOutboxList, refetch: vi.fn() };
    })
  };
});

vi.mock('@utils', async () => {
  const actual = await vi.importActual('@utils');

  return {
    ...actual,
    updateMessageReadStatus: vi.fn()
  };
});

const queryClient = new QueryClient();

const MockMessageContextValue = {
  loadMessages: false,
  setLoadMessages: vi.fn(),
  numUnreadMessages: 1,
  setNumUnreadMessages: vi.fn(),
  updateMessageCountState: vi.fn()
};

const MockMessagePage = ({ session }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SessionContext.Provider value={session}>
        <MessageContext.Provider value={MockMessageContextValue}>
          <IconButton aria-label="show new messages" datatestid="EmailIcon">
            <Badge badgeContent={MockMessageContextValue.numUnreadMessages} color="error" />
          </IconButton>
          <Messages />
        </MessageContext.Provider>
      </SessionContext.Provider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Messages Page', () => {
  const sessionObj = {
    login: vi.fn(),
    fetch: vi.fn(),
    podUrl: 'https://example.com',
    session: {
      fetch: vi.fn(),
      info: {
        webId: 'https://example.com/profile/',
        isLoggedIn: true
      }
    }
  };
  it('renders', () => {
    const { getByText } = render(<MockMessagePage session={sessionObj} />);
    expect(getByText('Inbox', { exact: true })).not.toBeNull();
    expect(getByText('Outbox', { exact: true })).not.toBeNull();
  });

  it('should render messages', async () => {
    const { getByText, queryByText } = render(<MockMessagePage session={sessionObj} />);
    expect(getByText('RE:test-inbox')).not.toBeNull();
    expect(queryByText('RE:test-outbox')).toBeNull();
  });

  it('should have an unread message', () => {
    render(<MockMessagePage session={sessionObj} />);
    const messageBadge = screen.getAllByText('1', { exact: true })[0];
    const messageLabel = screen.getByLabelText('show new messages');
    expect(messageBadge).not.toBeNull();
    expect(messageLabel).not.toBeNull();
  });

  it('should update state', async () => {
    updateMessageReadStatus.mockResolvedValue({
      message: 'test message',
      messageId: '3bf2a18d-0c6a-43e4-9650-992bf4fe7fe7',
      messageUrl:
        'http://localhost:3000/pod-test-name-here/PASS/Inbox/RE%3Ateste-20231023-195931.ttl',
      title: 'RE:test-inbox',
      uploadDate: new Date('2023-10-23T19:59:31.424Z'),
      readStatus: true,
      sender: 'PODMAN',
      senderWebId: 'http://localhost:3000/pod-test-name-here/profile/card#me',
      recipient: 'PODMAN'
    });
    const user = userEvent.setup();
    render(<MockMessagePage session={sessionObj} />);
    const unreadMessage = screen.getByLabelText(
      'open message preview 3bf2a18d-0c6a-43e4-9650-992bf4fe7fe7'
    );
    expect(unreadMessage).not.toBeNull();
    await user.click(unreadMessage);
    await waitFor(() => expect(MockMessageContextValue.updateMessageCountState).toHaveBeenCalled());
  });
});
