'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Suspense } from 'react';
import MessagesContainer from '../components/messages-container';

type Props = {
    projectId: string;
};

const ProjectView = ({ projectId }: Props) => {
    // const trpc = useTRPC();
    // const { data: project } = useSuspenseQuery(
    //     trpc.projects.getOne.queryOptions({ id: projectId })
    // );

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <Suspense fallback={<div>Loading project details...</div>}>
                        <MessagesContainer projectId={projectId} />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                    <h2>TODO Preview</h2>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default ProjectView;
