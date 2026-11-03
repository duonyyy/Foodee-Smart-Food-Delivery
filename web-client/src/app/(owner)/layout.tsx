'use client';

import { SocketProvider } from '@/shared/socket/socket-context';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
