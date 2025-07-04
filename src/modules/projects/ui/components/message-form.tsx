import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Form, FormField } from '@/components/ui/form';
import TextareaAutoResize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
    projectId: string;
};

const formSchema = z.object({
    value: z
        .string()
        .min(1, 'Value is required')
        .max(10000, 'Value must be less than 10000 characters'),
});

const MessageForm = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const createMessage = useMutation(
        trpc.messages.create.mutationOptions({
            onSuccess: (data) => {
                form.reset();
                queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({ projectId }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );
    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            projectId,
            value: data.value,
        });
    };

    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
                    isFocused && 'shadow-xs',
                    showUsage && 'rounded-t-none'
                )}
            >
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextareaAutoResize
                            {...field}
                            disabled={isPending}
                            placeholder="What would you like to build?"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                        />
                    )}
                />
                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span>&#8984;</span>Enter
                        </kbd>
                        &nbsp;to submit
                    </div>
                    <Button
                        className={cn(
                            'size-8 rounded-full',
                            isButtonDisabled && 'bg-muted-foreground  border'
                        )}
                        disabled={isButtonDisabled}
                    >
                        {isPending ? (
                            <Loader2Icon className="animate-spin size-4" />
                        ) : (
                            <ArrowUpIcon />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default MessageForm;
