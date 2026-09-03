import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number | null>(paramId ? parseInt(paramId) : null);
  const [text, setText] = useState('');
  const [localMsgs, setLocalMsgs] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: convData, refetch: refetchConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesAPI.conversations().then(r => r.data.conversations as Conversation[]),
  });

  const { data: threadData } = useQuery({
    queryKey: ['thread', activeId],
    queryFn: () => activeId ? messagesAPI.thread(activeId).then(r => r.data.messages as Message[]) : Promise.resolve([]),
    enabled: !!activeId,
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => messagesAPI.send(activeId!, msg),
    onSuccess: (res) => {
      setLocalMsgs(p => [...p, res.data.message as Message]);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
      refetchConvs();
    },
    onError: () => toast.error('Failed to send message'),
  });

  // Combine DB thread with local optimistic messages
  const allMessages = [...(threadData || []), ...localMsgs.filter(m => !(threadData || []).find((t: Message) => t.id === m.id))];

  // Socket.IO real-time
  useEffect(() => {
    const socket = getSocket();
    socket.on('new_message', (msg: Message) => {
      if (msg.fromId === activeId || msg.toId === activeId) {
        setLocalMsgs(p => [...p, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      refetchConvs();
    });
    return () => { socket.off('new_message'); };
  }, [activeId, refetchConvs]);

  useEffect(() => {
    setLocalMsgs([]);
  }, [activeId]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 200);
  }, [allMessages.length]);

  const conversations = (convData || []) as Conversation[];
  const activeConv = conversations.find(c => c.partner.id === activeId);

  function sendMessage() {
    if (!text.trim() || !activeId) return;
    sendMutation.mutate(text.trim());
  }

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden border border-gray-100 shadow-card animate-fade-in">
      {/* Contact List */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-black text-gray-900 text-lg">💬 Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
          )}
          {conversations.map(conv => (
            <button key={conv.partner.id} onClick={() => { setActiveId(conv.partner.id!); setLocalMsgs([]); navigate(`/messages/${conv.partner.id}`); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left ${activeId === conv.partner.id ? 'bg-green-50 border-r-2 border-green-500' : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-700 rounded-full flex items-center justify-center text-xl">
                  {conv.partner.avatar || conv.partner.firstName?.[0] || '?'}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 truncate">{conv.partner.firstName} {conv.partner.lastName}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{timeAgo(conv.lastMessage.createdAt)}</span>
                </div>
                <div className="text-xs text-gray-400 truncate">{conv.lastMessage.text}</div>
              </div>
              {conv.unreadCount > 0 && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                  {conv.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {!activeId ? (
        <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-bold text-gray-700">Select a conversation</h3>
          <p className="text-sm">Choose a contact to start chatting</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-700 rounded-full flex items-center justify-center text-lg">
              {activeConv?.partner.avatar || activeConv?.partner.firstName?.[0] || '?'}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{activeConv?.partner.firstName} {activeConv?.partner.lastName}</div>
              <div className="text-xs text-green-500 font-semibold">● Online</div>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => toast.success('Call feature coming in next version!')} className="btn btn-outline btn-sm"><i className="fas fa-phone" /></button>
              <button onClick={() => navigate('/marketplace')} className="btn btn-outline btn-sm"><i className="fas fa-store" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            <div className="text-center"><span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Today</span></div>
            {allMessages.map(msg => {
              const isOwn = msg.fromId === user?.id;
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isOwn ? 'bg-gradient-to-br from-green-400 to-green-700 text-white' : 'bg-gray-200'}`}>
                    {isOwn ? user?.avatar || user?.firstName?.[0] : activeConv?.partner.avatar || activeConv?.partner.firstName?.[0]}
                  </div>
                  <div className={`max-w-xs ${isOwn ? 'items-end' : ''} flex flex-col`}>
                    <div className={`msg-bubble ${isOwn ? 'own' : ''}`}>{msg.text}</div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{timeAgo(msg.createdAt)} {isOwn ? '✓✓' : ''}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 p-3 flex items-center gap-3">
            <button onClick={() => toast.success('File attachment coming soon!')} className="text-gray-400 hover:text-gray-600 p-1.5 flex-shrink-0"><i className="fas fa-paperclip text-sm" /></button>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white transition-all font-sans"
            />
            <button onClick={() => toast.success('Emoji picker coming soon!')} className="text-gray-400 hover:text-gray-600 p-1.5 flex-shrink-0"><span className="text-base">😊</span></button>
            <button onClick={sendMessage} disabled={!text.trim() || sendMutation.isPending}
              className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 flex-shrink-0 shadow-glow">
              {sendMutation.isPending ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-paper-plane text-sm" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
