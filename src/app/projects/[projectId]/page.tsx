import ProjectView from '@/modules/projects/ui/views/project-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    params: Promise<{ projectId: string }>;
};

const Page = async ({ params }: Props) => {
    const { projectId } = await params;
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<div>Something went wrong while loading the project.</div>}>
                <Suspense fallback={<div>Loading project...</div>}>
                    <ProjectView projectId={projectId} />
                </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    );
};

export default Page;
