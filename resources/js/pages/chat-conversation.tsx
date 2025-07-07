import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage, setOtherUser } from '../store/chatSlice';
import type { RootState } from '../store';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_deleted_for_both: boolean;
  deleted_by_sender: boolean;
}

interface PageProps {
  otherUser: User;
  messages: Message[];
  auth: { user: User };
  [key: string]: unknown;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function ChatConversation() {
  const { props } = usePage<PageProps>();
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const otherUserState = useSelector((state: RootState) => state.chat.otherUser) || props.otherUser;
  const { auth } = props;
  const [content, setContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; messageId: number | null }>({ open: false, messageId: null });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // On mount, initialize Redux state
  useEffect(() => {
    dispatch(setMessages(props.messages || []));
    dispatch(setOtherUser(props.otherUser));
    // eslint-disable-next-line
  }, [props.messages, props.otherUser]);

  // Scroll handler to track if user is at the bottom
  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 60; // px
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < threshold);
  };

  // Scroll to bottom if user is at bottom or just sent a message
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await axios.get(`/messages/conversation/${otherUserState.id}`);
      dispatch(setMessages(data.messages));
      dispatch(setOtherUser(data.otherUser));
      // Only scroll if new message is added
      setIsAtBottom((prev) => {
        if (data.messages.length > messages.length && prev) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [otherUserState.id, isAtBottom, dispatch, messages.length]);

  // Typing indicator logic
  let typingTimeout: NodeJS.Timeout | null = null;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    sendTypingStatus(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => sendTypingStatus(false), 1500);
  };
  const sendTypingStatus = (isTyping: boolean) => {
    axios.post('/user/typing', { is_typing: isTyping });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setProcessing(true);
    try {
      const { data } = await axios.post('/messages', {
        receiver_id: otherUserState.id,
        content,
      });
      dispatch(addMessage(data.message));
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setContent('');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number, forBoth: boolean) => {
    await axios.delete(`/messages/${id}`, { data: { for_both: forBoth } });
    dispatch(setMessages(messages.map((msg) =>
      msg.id === id
        ? forBoth
          ? { ...msg, is_deleted_for_both: true }
          : { ...msg, deleted_by_sender: true }
        : msg
    )));
    setDeleteDialog({ open: false, messageId: null });
  };

  // Group messages by sender and time proximity (5 min window)
  function groupMessages(msgs: Message[]) {
    const groups: { sender_id: number; messages: Message[] }[] = [];
    let lastSender = null;
    let lastTime = null;
    msgs.forEach((msg) => {
      const msgTime = new Date(msg.created_at).getTime();
      if (
        lastSender === msg.sender_id &&
        lastTime &&
        msgTime - lastTime < 5 * 60 * 1000 // 5 min
      ) {
        groups[groups.length - 1].messages.push(msg);
      } else {
        groups.push({ sender_id: msg.sender_id, messages: [msg] });
      }
      lastSender = msg.sender_id;
      lastTime = msgTime;
    });
    return groups;
  }

  // Simulate online status (always online for demo)
  const isOtherUserOnline = true;

  return (
    <AppLayout breadcrumbs={[{ title: 'Chat', href: '/chat' }, { title: otherUserState.name, href: `/chat/${otherUserState.id}` }]}> 
      <Head title={`Chat with ${otherUserState.name}`} />
      <div className="flex flex-col gap-0 p-0 max-w-2xl mx-auto h-[90vh] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-bold text-xl shadow">
            {otherUserState.avatar ? (
              <img src={otherUserState.avatar} alt={otherUserState.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              getInitials(otherUserState.name)
            )}
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800 ${isOtherUserOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          </div>
          <div>
            <div className="font-semibold text-lg">{otherUserState.name}</div>
            <div className="text-xs text-neutral-500">{otherUserState.email}</div>
          </div>
        </div>
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-2 py-6 bg-transparent chat-bg-pattern"
          onScroll={handleScroll}
        >
          {messages.length === 0 && (
            <div className="text-center text-neutral-400 mt-20">No messages yet. Start the conversation!</div>
          )}
          {groupMessages(messages).map((group, i) => {
            const isMe = group.sender_id === auth.user.id;
            const user = isMe ? auth.user : otherUserState;
            return (
              <div key={i} className={`mb-6 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}> 
                {/* Show avatar and name above first message in group */}
                <div className="flex items-center mb-1 gap-2">
                  <div className={`w-8 h-8 rounded-full ${isMe ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'} flex items-center justify-center font-bold text-sm shadow`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span className="font-medium text-xs text-neutral-500">{user.name}</span>
                </div>
                {group.messages.map((msg) => {
                  if (isMe && msg.deleted_by_sender) return null;
                  return (
                    <div
                      key={msg.id}
                      className={`relative my-1 px-0 flex items-end animate-fade-in`}
                    >
                      <div
                        className={`relative max-w-xs px-4 py-2 rounded-2xl shadow-lg transition-all duration-200 ${isMe
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-br-none'
                          : 'bg-white/90 dark:bg-gray-700 text-black dark:text-white rounded-bl-none border border-neutral-200 dark:border-neutral-700'}
                        `}
                        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)' }}
                      >
                        {msg.is_deleted_for_both ? (
                          <span className="italic text-neutral-400">this message is deleted</span>
                        ) : (
                          <>
                            <div>{msg.content}</div>
                            <div className="text-xs opacity-60 mt-1 text-right">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {isMe && !msg.is_deleted_for_both && (
                              <button
                                className="absolute top-1 right-1 text-xs text-neutral-300 hover:text-red-500 focus:outline-none"
                                onClick={() => setDeleteDialog({ open: true, messageId: msg.id })}
                                title="Delete message"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 sticky bottom-0 shadow-lg rounded-b-2xl">
          <input
            className="flex-1 border-none rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white shadow"
            value={content}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={processing}
            autoFocus
            style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
          />
          <Button type="submit" disabled={!content.trim() || processing} className="rounded-full px-6 shadow-md">Send</Button>
        </form>
        {/* Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, messageId: null })}>
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-fade-in border border-neutral-200 dark:border-neutral-800 flex flex-col items-center">
              <div className="flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Delete Message</span>
              </div>
              <p className="mb-6 text-center text-neutral-600 dark:text-neutral-300">Do you want to delete this message for yourself or for both sides?</p>
              <div className="flex flex-col gap-3 w-full">
                <Button
                  variant="outline"
                  className="w-full border border-blue-400 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => handleDelete(deleteDialog.messageId!, false)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Delete for myself
                  </span>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(deleteDialog.messageId!, true)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Delete for both sides
                  </span>
                </Button>
              </div>
              <Button className="mt-6 w-full" variant="ghost" onClick={() => setDeleteDialog({ open: false, messageId: null })}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
        {/* Subtle background pattern */}
        <style>{`
          .chat-bg-pattern {
            background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="%23f5f7fa"/><circle cx="20" cy="20" r="1.5" fill="%23c3cfe2"/></svg>');
            background-size: 40px 40px;
            background-repeat: repeat;
          }
          .animate-fade-in {
            animation: fadeIn 0.4s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </AppLayout>
  );
} 