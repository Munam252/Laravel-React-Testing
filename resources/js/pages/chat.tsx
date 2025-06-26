import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PageProps {
  users: User[];
  [key: string]: any;
}

export default function Chat() {
  const { props } = usePage<PageProps>();
  const users = props.users || [];
  const [chattingWith, setChattingWith] = useState<User | null>(null);

  return (
    <AppLayout breadcrumbs={[{ title: 'Chat', href: '/chat' }]}> 
      <Head title="Chat with Others" />
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold mb-4">Chat with Others</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">{user.email}</span>
                <Button onClick={() => setChattingWith(user)} size="sm">Chat</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {chattingWith && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-2">Chat with {chattingWith.name}</h2>
              <p className="mb-4 text-muted-foreground">(Chat UI coming soon...)</p>
              <Button onClick={() => setChattingWith(null)} variant="outline">Close</Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 