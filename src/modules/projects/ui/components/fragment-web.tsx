import Hint from '@/components/hint';
import { Button } from '@/components/ui/button';
import { Fragment } from '@/generated/prisma';
import { ExternalLinkIcon, RefreshCcwIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    data: Fragment;
};

const FragmentWeb = ({ data }: Props) => {
    const [fragmentKey, setFragmentKey] = useState(0);
    const [copied, setCopied] = useState(false);

    const onRefresh = () => {
        setFragmentKey((prevKey) => prevKey + 1);
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2 ">
                <Hint text="Refresh sandbox" side="bottom" align="start">
                    <Button size="sm" variant="outline" onClick={onRefresh}>
                        <RefreshCcwIcon />
                    </Button>
                </Hint>
                <Hint text="Copy sandbox URL" side="bottom" align="start">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="flex-1 justify-start text-start font-normal"
                        disabled={!data.sandboxUrl || copied}
                    >
                        <span className="truncate">{data.sandboxUrl}</span>
                    </Button>
                </Hint>
                <Hint text="Open in a new tab" side="bottom" align="start">
                    <Button
                        size="sm"
                        disabled={!data.sandboxUrl}
                        variant="outline"
                        onClick={() => {
                            window.open(data.sandboxUrl, '_blank');
                        }}
                    >
                        <ExternalLinkIcon />
                    </Button>
                </Hint>
            </div>
            <iframe
                key={fragmentKey}
                className="h-full w-full"
                sandbox="allow-scripts allow-forms allow-same-origin"
                src={data.sandboxUrl}
                loading="lazy"
            />
        </div>
    );
};
export default FragmentWeb; /*  */
