'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

const Page = () => {
    const [value, setValue] = useState<string>('');
    const trpc = useTRPC();
    const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
    const createMessage = useMutation(
        trpc.messages.create.mutationOptions({
            onSuccess: (data) => {
                toast.success('Message created successfully');
            },
        })
    );

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
            <Button
                disabled={createMessage.isPending}
                onClick={() => createMessage.mutate({ value })}
            >
                Invoke Background Job
            </Button>
            <pre>{JSON.stringify(messages, null, 2)}</pre>
        </div>
    );
};

export default Page;
