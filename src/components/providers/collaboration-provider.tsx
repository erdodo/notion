'use client';

import { Observable } from 'lib0/observable';
import { useSession } from 'next-auth/react';
import randomColor from 'randomcolor';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from 'y-protocols/awareness';
import * as Y from 'yjs';

import { useSocket } from '@/components/providers/socket-provider';

interface UserInfo {
  name: string;
  color: string;
  image?: string;
  email?: string;
}

interface CollaborationContextType {
  provider: PusherAwarenessProvider;
  yDoc: Y.Doc;
  user: UserInfo | null;
  activeUsers: UserInfo[];
}

const CollaborationContext = createContext<CollaborationContextType | null>(
  null
);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      'useCollaboration must be used within a CollaborationProvider'
    );
  }
  return context;
};

export const useOptionalCollaboration = () => {
  return useContext(CollaborationContext);
};

interface CollaborationProviderProperties {
  documentId: string;
  children: ReactNode;
}

function toBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join('');
  return btoa(binString);
}

function fromBase64(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

class PusherAwarenessProvider extends Observable<string> {
  awareness: Awareness;

  constructor(awareness: Awareness) {
    super();
    this.awareness = awareness;
  }

  connect() {}
  disconnect() {}
}

export const CollaborationProvider = ({
  documentId,
  children,
}: CollaborationProviderProperties) => {
  const { data: session } = useSession();
  const [activeUsers, setActiveUsers] = useState<UserInfo[]>([]);

  const { socket } = useSocket();

  const { yDoc, awareness, provider } = useMemo(() => {
    const document_ = new Y.Doc();
    const aware = new Awareness(document_);
    const prov = new PusherAwarenessProvider(aware);
    return { yDoc: document_, awareness: aware, provider: prov };
  }, []); // documentId dependency gereksiz, yDoc her zaman yeni oluşturuluyor

  const userColor = useMemo(() => {
    return randomColor({
      luminosity: 'dark',
      format: 'hex',
    });
  }, []);

  const sendAwarenessUpdate = useDebouncedCallback((update: Uint8Array) => {
    if (!socket) return;
    const updateString = toBase64(update);
    socket.emit('awareness-update', {
      roomId: `presence-doc-${documentId}`,
      update: updateString,
    });
  }, 200);

  useEffect(() => {
    if (!socket || !session?.user?.email) return;

    const roomId = `presence-doc-${documentId}`;
    socket.emit('join-room', roomId);

    const handleRemoteAwareness = ({ update }: { update: string }) => {
      try {
        const updateBuffer = fromBase64(update);
        applyAwarenessUpdate(awareness, updateBuffer, 'remote');
      } catch (error) {
        console.error('Error applying awareness update', error);
      }
    };

    socket.on('awareness-update', handleRemoteAwareness);

    const handleLocalAwareness = (
      {
        added: _added,
        updated: _updated,
        removed: _removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      origin: string
    ) => {
      if (origin === 'local') {
        const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);
        sendAwarenessUpdate(update);
      }
    };

    awareness.on('update', handleLocalAwareness);

    awareness.setLocalStateField('user', {
      name: session.user.name,
      color: userColor,
      image: session.user.image,
      email: session.user.email,
    });

    const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);
    sendAwarenessUpdate(update);

    const updateActiveUsers = () => {
      const states = awareness.getStates();
      const users: UserInfo[] = [];
      states.forEach((state: { user?: UserInfo }) => {
        if (state.user) {
          users.push(state.user);
        }
      });

      const uniqueUsers = [
        ...new Map(users.map((u) => [u.email, u])).values(),
      ].filter((u) => u.email !== session.user?.email);

      setTimeout(() => {
        setActiveUsers(uniqueUsers);
      }, 0);
    };

    awareness.on('change', updateActiveUsers);
    updateActiveUsers();

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('awareness-update', handleRemoteAwareness);
      awareness.off('update', handleLocalAwareness);
      awareness.off('change', updateActiveUsers);
    };
  }, [documentId, session, awareness, sendAwarenessUpdate, userColor, socket]);

  return (
    <CollaborationContext.Provider
      value={{
        provider,
        yDoc,
        user: { name: session?.user?.name || 'Me', color: userColor },
        activeUsers,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};
